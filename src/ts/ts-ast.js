/** ****************************************************************************************************
 * File: ts-ast (jsdoc-tag-parser)
 * @author julian on 1/31/18
 * @version 1.0.0
 * @copyright Planet3, Inc.
 *******************************************************************************************************/
'use strict';

import ts from 'typescript';

const defaultOptions = {
    experimentalDecorators:     true,
    experimentalAsyncFunctions: true,
    jsx:                        true
};

let ts;
let getComments;
const syntaxKind = {};

export default {
    syntaxKind,
    init()
    {
        // workarounds issue described at https://github.com/Microsoft/TypeScript/issues/18062
        for ( const name of Object.keys( ts.SyntaxKind ).filter( x => isNaN( parseInt( x ) ) ) )
        {
            const value = ts.SyntaxKind[ name ];
            if ( !syntaxKind[ value ] )
                syntaxKind[ value ] = name;
        }
    },

    parse( filename, source, options )
    {
        options = { ...defaultOptions, ...options };

        const compilerHost = {
            fileExists:                () => true,
            getCanonicalFileName:      filename => filename,
            getCurrentDirectory:       () => '',
            getDefaultLibFileName:     () => 'lib.es6.d.ts',
            getNewLine:                () => '\n',
            getSourceFile:             filename => {
                return ts.createSourceFile( filename, source, ts.ScriptTarget.Latest, true );
            },
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

        const sourceFile = program.getSourceFile( filename );

        getComments = ( node, isTrailing ) => {
            if ( node.parent )
            {
                const nodePos   = isTrailing ? node.end : node.pos;
                const parentPos = isTrailing ? node.parent.end : node.parent.pos;

                if ( node.parent.kind === ts.SyntaxKind.SourceFile || nodePos !== parentPos )
                {
                    let comments = isTrailing ?
                                   ts.getTrailingCommentRanges( sourceFile.text, nodePos ) :
                                   ts.getLeadingCommentRanges( sourceFile.text, nodePos );

                    if ( Array.isArray( comments ) )
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

        return sourceFile;
    },

    getNodeName( node )
    {
        if ( node.kind )
            return syntaxKind[ node.kind ];
    },

    _ignoredProperties: new Set( [
        'constructor',
        'parent'
    ] ),

    *forEachProperty( node )
    {
        for ( let prop of Reflect.ownKeys( node ) )
        {
            if ( this._ignoredProperties.has( prop ) || prop.charAt( 0 ) === '_' )
                continue;

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
    }
};