/**
 * Basic TypeScript traversal:
 *
 *
 * import * as fs from 'fs';
 * import * as ts from 'typescript';
 *
 * function visit(node: ts.Node) {
 *   if (ts.isFunctionDeclaration(node)) {
 *     for (const param of node.parameters) {
 *       console.log(param.name.getText());
 *     }
 *   }
 *   node.forEachChild(visit);
 * }
 *
 * function instrument(fileName: string, sourceCode: string) {
 *   const sourceFile = ts.createSourceFile(fileName, sourceCode, ts.ScriptTarget.Latest, true);
 *   visit(sourceFile);
 * }
 *
 * const inputFile = process.argv[2];
 * instrument(inputFile, fs.readFileSync(inputFile, 'utf-8'));
 */
"use strict";

// import { visit } from 'typescript-walk';

import { object, array, has }       from 'convenience';
import * as ts                      from 'typescript';
import {
    syntaxKind,
    collect_fields
}                                   from './ts-helpers';
import { createBinder }             from "../symbols/nodes";
import { create_reporters, output } from "../utils/source-code";
import {
    reportStatistics,
    performance
}                                   from "../utils/performance";
import { file_handler, sync }       from "../utils/files";
import { create_host }              from "./host";

const defaultOptions = {
    experimentalDecorators:     true,
    experimentalAsyncFunctions: true,
    jsx:                        true
};

let getComments,
    seen = new Set();

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

    /**
     * @param filenames
     * @param options
     * @return {Promise<*[]>}
     */
    async aparse( filenames, options = {} )
    {
        options = { ...defaultOptions, ...options };

        performance.enable();
        performance.mark( "beforeFiles" );

        const handler = await file_handler( filenames, [ 'data' ] );

        performance.mark( "afterFiles" );
        performance.measure( "Files", "beforeFiles", "afterFiles" );

        const res = [];

        let concatenated = '';


        handler.each( file => concatenated += file.source.replace( /\r/g, '' ) );

        const c = handler.create_file( 'generated.d.ts' );

        sync.writeFile( 'data/concatenated.d.ts', concatenated );

        c.source    = concatenated;
        c.reporters = create_reporters( c.filename, c.source );
        c.ast       = ts.createSourceFile( c.filename, c.source, ts.ScriptTarget.Latest, true );
        c.bound     = createBinder()( c.ast, {} );

        // handler.each( file => {
        //
        //     file.ast = ts.createSourceFile( file.filename, file.source, ts.ScriptTarget.Latest, true );
        //     // file.binder = createBinder();
        //     file.bound = createBinder()( file.ast, {} );
        //     res.push( file );
        // } );

        // return res;


        // c.program = create_program( 'generated.d.ts', concatenated, c.ast );
        // c.typeChecker = c.program.getTypeChecker();
        c.ast.moduleAugmentations = [];
        c.typeChecker             = ts.createTypeChecker( create_host( 'generated.d.ts', concatenated, c.ast ), false );

        return [ c ];
    },

    parse( filenames, options = {} )
    {
        const handler = file_handler( filenames, [ 'data' ] );

        for ( const file of handler )
            ts.createSourceFile( file.filename, file.source, ts.ScriptTarget.Latest, true );

        options = { ...defaultOptions, ...options };

        performance.enable();
        performance.mark( "beforeHost" );

        const
            compilerHost /* ts.CompilerHost */ = {
                fileExists: sync.fileExists,

                getCanonicalFileName: filename => {
                    // console.log( `getCanonicalFileName( ${filename} ) -> ${canonical_name( filename )}, Keys of files: [ "${[ ...filenames.keys() ].join( '", "' )}" ]` );
                    return handler.fix_path( filename ); // canonical_name( filename );
                },

                getCurrentDirectory:   () => process.cwd(),
                getDefaultLibFileName: () => 'lib.es6.d.ts',
                getNewLine:            () => '\n',

                getSourceFile: filename => {
                    let file   = handler.get_file( filename ),
                        source = handler.get_source( file );

                    if ( !file.ast )
                        file.ast = ts.createSourceFile( file.filename, source, ts.ScriptTarget.Latest, true );

                    return file.ast;
                },

                readFile:                  sync.readFile,
                useCaseSensitiveFileNames: () => true,
                writeFile:                 () => null
            };
        performance.mark( "afterHost" );
        performance.measure( "host", "beforeHost", "afterHost" );

        const
            program = ts.createProgram( handler.names(), {
                noResolve:                  true,
                target:                     ts.ScriptTarget.Latest,
                experimentalDecorators:     options.experimentalDecorators,
                experimentalAsyncFunctions: options.experimentalAsyncFunctions,
                jsx:                        options.jsx ? 'preserve' : undefined
            }, compilerHost );

        // typeChecker = program.getTypeChecker(),
        // symWalker   = typeChecker.getSymbolWalker();
        // console.log( symWalker );
        // console.log( symWalker.walkSymbol( sourceFile.locals.get( 'TypedPropertyDescriptor' ) ) );
        // console.log( symWalker.walkType( typeChecker.getTypeOfSymbolAtLocation( sourceFile.locals.get( 'TypedPropertyDescriptor' ), sourceFile ) ) );
        // process.exit();
        // // noop                      = () => undefined,
        // // notImplemented            = () => { throw new Error("Not implemented"); },
        // // nullTransformationContext = {
        // //     enableEmitNotification:    noop,
        // //     enableSubstitution:        noop,
        // //     endLexicalEnvironment:     () => undefined,
        // //     getCompilerOptions:        notImplemented,
        // //     getEmitHost:               notImplemented,
        // //     getEmitResolver:           notImplemented,
        // //     hoistFunctionDeclaration:  noop,
        // //     hoistVariableDeclaration:  noop,
        // //     isEmitNotificationEnabled: notImplemented,
        // //     isSubstitutionEnabled:     notImplemented,
        // //     onEmitNode:                noop,
        // //     onSubstituteNode:          notImplemented,
        // //     readEmitHelpers:           notImplemented,
        // //     requestEmitHelper:         noop,
        // //     resumeLexicalEnvironment:  noop,
        // //     startLexicalEnvironment:   noop,
        // //     suspendLexicalEnvironment: noop
        // // },
        // visitEachChild( sourceFile, node => {
        //     if ( has( node, 'kind' ) )
        //         console.log( `Kind is ${SyntaxKind[ node.kind ]}` );
        //     else
        //         console.log( 'no kind found' );
        // }, nullTransformationContext );

        program.numLines = 0;
        const
            x            = handler.names().map( create_file );



        /**
         * @param {string} filename
         * @param {object} file
         */
        function create_file( filename )
        {
            const file = handler.get_file( filename );

            file.ast = program.getSourceFile( filename );

            // raw    = ts.createSourceFile( filename, code, ts.ScriptTarget.Latest, true ),

            // file.reporters = create_reporters( filename, file.source );
            file.program = program;

            if ( file.ast )
                file.ast.info = file;
            else
                console.error( `${filename}: Missing AST` );
            // sourceFile.info = x;

            if ( !file.binder ) file.binder = createBinder();
            file.bound = file.binder( file.ast, file );
            program.numLines += file.numLines = file.reporters.numLines;

            return file;
        }


        reportStatistics( program );

        return x;

        function getComments( node, isTrailing )
        {
            if ( node.parent )
            {
                const nodePos   = isTrailing ? node.end : node.pos;
                const parentPos = isTrailing ? node.parent.end : node.parent.pos;

                if ( node.parent.kind === ts.SyntaxKind.SourceFile || nodePos !== parentPos )
                {
                    let comments = isTrailing ?
                                   ts.getTrailingCommentRanges( sourceFile.text, nodePos ) :
                                   ts.getLeadingCommentRanges( sourceFile.text, nodePos );

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
        }

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
    },

    define_symbols( info )
    {
        output.fatal = info.fatal;
        output.error = info.error;
        output.warn  = info.warn;
        output.log   = info.log;

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
