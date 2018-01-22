/** ******************************************************************************************************************
 * @file Parse one source file and prep for comment parsing.
 * @author Julian Jensen <jjdanois@gmail.com>
 * @since 1.0.0
 * @date 19-Jan-2018
 *********************************************************************************************************************/

"use strict";

import { parse as parser } from 'espree';
import { traverse, attachComments, VisitorKeys } from 'estraverse';
import { parse_comments } from './jsdoc-parser';
import { TransformFlags } from "./types";
import { globals } from "./utils";

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

/**
 * @param {string} source       - The source module
 * @param {object} [options]    - The usual espree/esprima options
 * @return {Program}
 */
export function parse( source, options = defaultParserOptions )
{
    options.range = options.loc = options.comment = options.tokens = true;
    options.ecmaVersion = 2018;
    options.ecmaFeatures = options.ecmaFeatures || {};
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
 * @return {Array}
 */
export function prep( withComments )
{
    const
        allNodesParsed = [];

    let index = 0;

    traverse( withComments, { enter( node, parent ) {

            node.parent = parent;
            node.index = index++;
            node.transformFlags = TransformFlags.None;

            [ node.field, node.fieldIndex ] = determine_field( node, parent );

            const comments = parse_comments( node );

            if ( comments ) allNodesParsed.push( comments );
        }
    } );

    return allNodesParsed;
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

