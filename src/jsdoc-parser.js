/** ******************************************************************************************************************
 * @file Parse JsDoc comment and add whatever is needed from the attached AST node.
 * @author Julian Jensen <jjdanois@gmail.com>
 * @since 1.0.0
 * @date 19-Jan-2018
 *********************************************************************************************************************/

"use strict";

import doctrine from 'doctrine';
import { read_balanced_string} from "./utils";

/**
 * @typedef {object} CommentBlock
 * @property {Comment} comment
 * @property {Annotation} tags
 */

/**
 * @typedef {object} Comments
 * @property {number} index
 * @property {string} type
 * @property {Array<CommentBlock>} [leading]
 * @property {Array<CommentBlock>} [trailing]
 */

/**
 * Takes a block comment, cleans it up, and returns the output from `doctrine`.
 *
 * @param {string} str
 * @return {{description, tags}}
 */
function prep_string( str )
{
    let strs = str
        .replace( /^[\s\n*]*|[\s\n*]*/, '' )
        .split( /[\s*]*\n[\s*]*/ );

    str = strs.map( s => fix_array( s.replace( /(@[a-z]+\s{.*)(}\s+)\[([^\]]+)]/g, '$1=$2$3' ) ) ).join( '\n' );

    return doctrine.parse( str, { recoverable: true, lineNumbers: true, range: true } );
}

/**
 * @param {string} str
 * @return {string}
 */
function fix_array( str )
{
    let arr = str.indexOf( '[]' );

    while ( arr !== -1 )
    {
        const typeStr = read_balanced_string( str, arr - 1, ',', void 0, -1 );
        if ( !typeStr )
            str = str.substr( 0, arr ) + 'Array<*>' + str.substr( arr + 2 );
        else if ( typeStr[ 0 ] === typeStr[ 1 ] )
            str = str.substr( 0, typeStr[ 0 ] + 1 ) + `Array<*>` + str.substr( arr + 2 );
        else
            str = str.substr( 0, typeStr[ 0 ] ) + `Array<${str.substring( typeStr[ 0 ], typeStr[ 1 ] + 1 )}>` + str.substr( arr + 2 );

        arr = str.indexOf( '[]' );
    }

    return str;
}

/**
 * Parse all leading and trailing comments for a given node, if it has any and returns an array
 * of all tags found.
 *
 * @param {BaseNode} node
 * @return {?Comments}
 */
export function parse_comments( node )
{
    const
        lc = parse_comment_array( node.leadingComments ),
        tc = parse_comment_array( node.trailingComments ),
        /** @type {Comments} */
        cb = {
            type: node.type,
            index: node.index
        };

    if ( !tc && !lc ) return null;

    if ( lc ) cb.leading = lc;
    if ( tc ) cb.trailing = tc;

    return cb;
}

/**
 * Parse an array of comments, if it has any, and returns an array of all tags found.
 *
 * @param {Array<Comment>} comments
 * @return {?Array<CommentBlock>}
 */
function parse_comment_array( comments )
{
    if ( !comments || !comments.length ) return null;

    const r = comments
        .filter( c => c.type === 'Block' )
        .map( c => ( { comment: c, tags: prep_string( c.value ) } ) )
        .filter( cb => cb.tags.description || cb.tags.tags.length );

    return r.length ? r : null;

}

