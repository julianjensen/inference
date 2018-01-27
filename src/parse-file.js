/** ******************************************************************************************************************
 * @file Parse one source file and prep for comment parsing.
 * @author Julian Jensen <jjdanois@gmail.com>
 * @since 1.0.0
 * @date 19-Jan-2018
 *********************************************************************************************************************/



"use strict";

import { parse as parser, Syntax }                       from 'espree';
import { traverse, attachComments, VisitorKeys } from 'estraverse';
import { parse_comments }                        from './jsdoc-parser';
import { TransformFlags }                        from "./types";
import { globals, store_ast }                    from "./utils";
import build_definition                          from "./doctags";
import { Symbol }                                from "./symbols";

/**
 * @param {string} source       - The source module
 * @param {object} [_options]    - The usual espree/esprima options
 * @return {Program}
 */
export function parse( source, _options = {} )
{
    const defaultParserOptions = {
        loc:          true,
        range:        true,
        comment:      true,
        tokens:       true,
        ecmaVersion:  9,
        sourceType:   globals.program && globals.program.script ? 'script' : 'module',
        ecmaFeatures: {
            impliedStrict:                true,
            experimentalObjectRestSpread: true
        }
    };

    const options = Object.assign( {}, defaultParserOptions, _options );

    options.range = options.loc = options.comment = options.tokens = true;
    options.ecmaVersion                               = 2018;
    options.ecmaFeatures                              = options.ecmaFeatures || {};
    options.ecmaFeatures.experimentalObjectRestSpread = true;

    const
        ast = parser( source, options /* options */ );

    return attachComments( ast, ast.comments, ast.tokens );

    //     allNodesParsed = [];
    //
    // let index = 0;
    //
    // traverse( withComments, { enter( node, parent ) {
    //
    //         node.parent = parent;
    //         node.index = index++;
    //         node.transformFlags = TransformFlags.None;
    //
    //         [ node.field, node.fieldIndex ] = determine_field( node, parent );
    //
    //         const comments = parse_comments( node );
    //
    //         if ( comments ) allNodesParsed.push( comments );
    //     }
    // } );
    //
    // return allNodesParsed;
}

/**
 * @param {Program} withComments
 * @param {string} file
 * @return {object}
 */
export function prep( withComments, file )
{
    const
        types          = new Set(),
        allNodesParsed = [],
        byIndex        = [];

    if ( !globals.symbolTable )
        globals.symbolTable = new Symbol( 'global' );

    if ( globals.program.script )
        globals.current = globals.symbolTable;
    else
        globals.current = new Symbol( file, globals.symbolTable );

    withComments.fileName = file;

    traverse( withComments, {
        enter( node, parent )
        {

            node.parent         = parent;
            node.index          = byIndex.length;
            node.transformFlags = TransformFlags.None;
            byIndex.push( node );

            [ node.field, node.fieldIndex ] = determine_field( node, parent );

            const comments = parse_comments( node );

            if ( comments )
            {
                types.add( node.type );
                allNodesParsed.push( comments );
                build_definition( node, comments );
            }
            else if ( node.type === Syntax.Identifier )
            {
                build_definition( node );
            }
        }
    } );

    store_ast( file, byIndex );

    return { fileName: file, types: [ ...types ], allDocNodes: allNodesParsed };
}

/**
 *
 * @param node
 * @param parent
 * @return {*[]}
 */
function determine_field( node, parent )
{
    if ( !parent ) return [ null, null ];

    for ( const key of VisitorKeys[ parent.type ] )
    {
        const pv = parent[ key ];

        if ( !pv ) continue;

        if ( !Array.isArray( pv ) )
        {
            if ( pv === node ) return [ key, null ];
        }
        else
        {
            const i = pv.indexOf( node );

            if ( i !== -1 )
                return [ key, i ];
        }
    }

    return [ null, null ];
}

