"use strict";

// import { visit } from 'typescript-walk';
import { object, number, array, has }            from 'convenience';
import ts                                        from 'typescript';
import {
    indent,
    show_copy_paste,
    syntaxKind,
    nodeName,
    show_fields,
    collect_fields
}                                                from './ts-helpers';
import { traverse }                              from './ts-ast-walker';
import { inspect }                               from 'util';
import { nameOf }                                from 'typeofs';
// import { visitor }                     from "../symbols/define-libraries";
import { create_reporters, hide_parent, output } from "../utils";

const defaultOptions = {
    experimentalDecorators:     true,
    experimentalAsyncFunctions: true,
    jsx:                        true
};

let getComments;
let seen = new Set();


export const settings = {

    loadParser()
    {
        // workarounds issue described at https://github.com/Microsoft/TypeScript/issues/18062
        for ( const name of Object.keys( ts.SyntaxKind ).filter( x => isNaN( parseInt( x ) ) ) )
        {
            const value = ts.SyntaxKind[ name ];
            if ( !syntaxKind[ value ] )
                syntaxKind[ value ] = name;
        }
    },

    parse( filename, code, options = {} )
    {
        options = { ...defaultOptions, ...options };

        const compilerHost /* ts.CompilerHost */ = {
            fileExists:                () => true,
            getCanonicalFileName:      filename => filename,
            getCurrentDirectory:       () => '',
            getDefaultLibFileName:     () => 'lib.d.ts',
            getNewLine:                () => '\n',
            getSourceFile:             filename => ts.createSourceFile( filename, code, ts.ScriptTarget.Latest, true ),
            readFile:                  () => null,
            useCaseSensitiveFileNames: () => true,
            writeFile:                 () => null
        };

        const program = ts.createProgram( [ filename ], {
            noResolve:                  true,
            target:                     ts.ScriptTarget.Latest,
            experimentalDecorators:     options.experimentalDecorators,
            experimentalAsyncFunctions: options.experimentalAsyncFunctions,
            jsx:                        options.jsx ? 'preserve' : undefined
        }, compilerHost );

        const
            sourceFile = program.getSourceFile( filename ),
            typeChecker = program.getTypeChecker();

        let outStr = inspect( hide_parent( typeChecker.getSymbolAtLocation( sourceFile.statements[ 0 ].name ) ), { showHidden: false, depth: 6, colors: false } ),
            preamble =
                `/* eslint-disable max-lines,no-unused-vars,max-len,array-bracket-newline */
const
    Circular = '',
    NodeObject = '',
    SymbolObject = '',
    TokenObject = '',
    Map = '',
    dump = `,

        clean = outStr
            .replace( /[A-Z][a-z]+Object {/g, '{' )
            .replace( /Map {}/g, '{}' )
            .replace( /Map {([^}])/g, '{$1' )
            .replace( / =>/g, ':' )
            .replace( /\[(NodeObject|SymbolObject|TokenObject|Circular)]/g, '$1' )
            .replace( /\[Map]/g, '{}' )
            .replace( /\[Array]/g, '[]' );

        clean = clean.trim() + ';\n';

        console.log( preamble + clean );

        getComments = ( node, isTrailing ) => {
            if ( node.parent )
            {
                const nodePos   = isTrailing ? node.end : node.pos;
                const parentPos = isTrailing ? node.parent.end : node.parent.pos;

                if ( node.parent.kind === ts.SyntaxKind.SourceFile || nodePos !== parentPos )
                {
                    let comments = isTrailing
                                   ? ts.getTrailingCommentRanges( sourceFile.text, nodePos )
                                   : ts.getLeadingCommentRanges( sourceFile.text, nodePos );

                    if ( array( comments ) )
                    {
                        comments.forEach( ( comment ) => {
                            comment.type = syntaxKind[ comment.kind ];
                            comment.text = sourceFile.text.substring( comment.pos, comment.end );
                        } );

                        return comments;
                    }
                }
            }
        };

        function is_node( node )
        {
            return object( node ) && !seen.has( node ) && has( node, 'kind' );
        }

        function __walk( node, cb, key = '', indent = 0, parent )
        {
            if ( !is_node( node ) ) return;

            seen.add( node );

            collect_fields( node, parent );

            if ( cb( node, key, indent ) === false ) return false;

            for ( const key of Object.keys( node ) )
            {
                if ( key === 'parent' || key === 'constructor' || key.startsWith( '_' ) ) continue;

                const value = node[ key ];

                let r;

                if ( is_node( value ) )
                {

                    // const r = cb( value, key, indent, rn => array( rn ) ? rn.some( n => __walk( n, cb, indent + 1 ) ) : __walk( rn, cb, indent + 1 ) );
                    r = __walk( value, cb, key, indent + 1, node );
                    // r = __walk( value, cb, key, indent + 1 );
                }
                else if ( array( value ) && value.length )
                {
                    let brk = false;

                    value.some( val => {
                        if ( !is_node( val ) ) return;

                        // const r = cb( val, key, indent, rn => array( rn ) ? rn.some( n => __walk( n, cb, indent + 1 ) ) : __walk( rn, cb, indent + 1 ) );
                        r = __walk( val, cb, key, indent + 1, node );
                        if ( r === false ) return ( brk = true );
                    } );

                    if ( brk === true ) r = false;
                }

                if ( r === false ) return false;
            }

            return true;
        }

        // __walk( sourceFile, () => {} );

        // traverse( sourceFile, ( node, parent, field, index ) => {
        //     let name = nodeName( node );
        //
        //     if ( name === 'Identifier' && node.escapedText )
        //         name += ` ("${node.escapedText}")`;
        //     // else if ( name === 'JSDocParameterTag' )
        //     // {
        //     //     const tnode = Object.assign( {}, node );
        //     //     delete tnode.parent;
        //     //
        //     //     console.log( nameOf( node ) + ': ' + inspect( tnode, { depth: 1, colors: true } ) );
        //     //     if ( tnode.tagName )
        //     //         console.log( '----- tagName: ' + nameOf( tnode.tagName ) + ': ' + inspect( tnode.tagName, { depth: 1, colors: true } ) );
        //     // }
        //
        //     console.log( `${indent( node )}${field || 'root'}${number( index ) ? `[ ${index} ]` : ''}: "${name}" => ${parent ? nodeName( parent ) : 'root'}` );
        // } );

        // console.log( 'identifiers:', sourceFile.identifiers );
        // console.log( 'named:', [ ...sourceFile.getNamedDeclarations().keys() ] );
        // console.log( 'compute named:', [ ...sourceFile.computeNamedDeclarations().keys() ] );
        // console.log( 'ReadonlyArray:', sourceFile.getNamedDeclarations().get( 'ReadonlyArray' ) );

        const r = create_reporters( filename, code );

        return {
            ast: sourceFile,
            fileName: filename,
            source: code,
            error: r.error,
            fatal: r.fatal,
            warn: r.warn,
            log: r.log
        };
    },

    define_symbols( info )
    {
        output.fatal = info.fatal;
        output.error = info.error;
        output.warn = info.warn;
        output.log = info.log;

        // traverse( info.ast, visitor, null, true );
    },

    dump_info()
    {
        // show_fields();
    },

    _ignoredProperties: new Set( [
        'constructor',
        'parent'
    ] ),

    *forEachProperty( node )
    {
        for ( let prop in node )
        {
            if ( this._ignoredProperties.has( prop ) || prop.charAt( 0 ) === '_' ) continue;

            yield {
                value: node[ prop ],
                key:   prop
            };
        }

        if ( node.parent )
        {
            yield {
                value:    getComments( node ),
                key:      'leadingComments',
                computed: true
            };
            yield {
                value:    getComments( node, true ),
                key:      'trailingCommments',
                computed: true
            };
        }
    },

    nodeToRange( node )
    {
        if ( typeof node.getStart === 'function' && typeof node.getEnd === 'function' )
            return [ node.getStart(), node.getEnd() ];
        else if ( typeof node.pos !== 'undefined' && typeof node.end !== 'undefined' )
            return [ node.pos, node.end ];
    }
};
