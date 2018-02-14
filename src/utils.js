/** ******************************************************************************************************************
 * @file Provides stand-alone utility functions.
 * @author Julian Jensen <jjdanois@gmail.com>
 * @since 1.0.0
 * @date 19-Jan-2018
 *********************************************************************************************************************/
"use strict";

import { inspect } from 'util';
import * as chalk from 'chalk';
import { number } from "convenience";

const
    { red, green, yellow, cyan, white, gray } = chalk,
    /**
     * @param {object} o
     * @param {string} n
     * @return {boolean}
     */
    has = ( o, n ) => Reflect.has( o, n );

/**
 * @param {*} o
 * @return {boolean}
 */
export function object( o )
{
    return typeof o === 'object' && !Array.isArray( o ) && o !== null;
}

/**
 * @param {string} s
 * @return {boolean}
 */
export function isString( s )
{
    return typeof s === 'string';
}

/**
 * @param {*} n
 * @param {string} type
 * @return {boolean}
 */
export function node_is( n, type )
{
    return object( n ) && has( n, 'type' ) && n.type === type;
}

const
    delimOpposites = {
        '(': ')',
        '{': '}',
        '[': ']',
        '<': '>'
    },
    oppositeString = delims => delims.split( '' ).map( c => delimOpposites[ c ] ).join( '' ),
    allDelimiters = Object.keys( delimOpposites ).join( '' );

/**
 * @param {string} str
 * @param {number} start
 * @param {string} stop
 * @param {?string} delims
 * @param {number} dir
 * @param {boolean} [stopOnZero]    - Stop when delimiters are balanced
 * @return {?[number, number]}
 */
export function read_balanced_string( str, start = 0, stop = ',', delims = allDelimiters, dir = 1, stopOnZero ) // eslint-disable-line max-params
{
    const
        zero = arr => arr.every( v => v === 0 );

    let opps = oppositeString( delims );

    if ( dir < 0 )
    {
        [ delims, opps ] = [ opps, delims ];
        stop += opps;
    }
    else
        stop += delims;

    let i = start,
        c = str[ i ],
        nestCounts = [];

    for ( let j = 0; j < delims.length; j++ )
        nestCounts[ j ] = 0;

    while ( i >= 0 && i < str.length )
    {
        if ( stop.includes( c ) && zero( nestCounts ) ) break;

        let index = delims.indexOf( c );

        if ( index !== -1 )
            nestCounts[ index ]++;
        else if ( ( index = opps.indexOf( c ) ) !== -1 )
            nestCounts[ index ]--;

        if ( stopOnZero && zero( nestCounts ) ) break;
        i += dir;
        c = str[ i ];
    }

    if ( !zero( nestCounts ) ) return null;

    if ( stop.includes( c ) )
    {
        i -= dir;
        while ( str[ i ] === ' ' || str[ i ] === '\t' ) i -= dir;
    }

    return start < i ? [ start, i ] : [ i, start ];
}

/**
 * @param {string} str
 * @param {string} stop
 * @param {?string} delims
 * @param {number} dir
 * @return {?[number, number]}
 */
export function read_balanced_delimiters( str, stop = ',', delims = allDelimiters, dir = 1 )
{
    const m = dir > 0 ? str.match( new RegExp( `^.*?(?=[${delims}])` ) ) : str.match( new RegExp( `^.*${oppositeString( delims )}` ) );

    if ( !m ) return null;

    const se = read_balanced_string( str, m[ 0 ].length, stop, delims, dir, true );

    if ( !se ) return null;

    return [ se[ 0 ] + 1, se[ 1 ] ];
}

/**
 * @param {string} fileName
 * @param {number} index
 */
export function ast_from_index( fileName, index )
{
    const
        ast = asts.get( fileName );

    return ast ? ast[ index ] : null;
}

export const asts = new Map();

/**
 * @param {string} fileName
 * @param {Array<Node>} ast
 */
export function store_ast( fileName, ast )
{
    asts.set( fileName, ast );
}

export function flatDump( obj )
{
    return inspect( obj, { depth: 0, colors: true } );
}

export const output = {};

/**
 * @param {string} fileName
 * @param {string} source
 * @return {{fatal: fatal, error: error}}
 */
export function create_reporters( fileName, source )
{
    const
        loc_info = create_loc_info( source );

    /**
     * @param {Node} node
     * @return {[ number, number ]}
     */
    function get_start_end( node )
    {
        if ( has( node, 'start' ) )
            return [ node.start, node.end ];
        else if ( has( node, 'range' ) )
            return node.range;
        else
            return [ node.pos, node.end ];
    }

    /**
     * @param {string} msg
     * @param {Node} [node]
     * @param {object} [opts]
     */
    function fatal( msg, node, opts )
    {
        opts = Object.assign( opts || {}, { noThrow: false, color: red } );

        error( msg, node, opts );
    }

    /**
     * @param {string} msg
     * @param {Node} [node]
     * @param {object} [opts]
     */
    function warn( msg, node, opts )
    {
        opts = Object.assign( opts || {}, { noThrow: false, color: yellow } );

        error( msg, node, opts );
    }


    /**
     * @param {string} msg
     * @param {Node} [node]
     * @param {object} [opts]
     */
    function log( msg, node, opts )
    {
        opts = Object.assign( opts || {}, { noThrow: false, color: cyan } );

        error( msg, node, opts );
    }

    /**
     * @param {string} msg
     * @param {Node} [node]
     * @param {boolean} [noThrow=false]
     * @param {boolean} [show=true]
     * @param {boolean} [loc=true]
     */
    function error( msg, node, { noThrow = true, show = true, color = red } )
    {
        let [ start, end ] = get_start_end( node ),
            loc = loc_info( start, end ),
            fileLoc = loc && `In "${fileName}", line ${loc.start.line + 1}: `,
            txt = ( loc ? fileLoc : '' ) + msg;

        if ( show && node )
            txt += '\n\n' + show_source( node, true );

        if ( noThrow )
        {
            console.error( color( txt ) );
            return;
        }

        throw new Error( txt );
    }

    /**
     * @param node
     * @param indicateOffset
     * @return {string}
     */
    function show_source( node, indicateOffset )
    {
        let [ start, end ] = get_start_end( node ),
            loc = loc_info( start, end ),
            useIndicator = number( indicateOffset ) && indicateOffset > -1,
            sline = loc.start.sourceLine,
            indicator = useIndicator && ( ' '.repeat( indicateOffset - loc.start.lineOffset ) + '^' );

        return useIndicator ? sline + '\n' + indicator : sline;
    }

    /**
     * @param offset
     * @param lineOffsets
     * @return {number}
     */
    function binary_search( offset, lineOffsets )
    {
        let b      = 0,
            e      = lineOffsets.length - 1,
            middle = ( e - b ) >> 1;

        if ( offset >= lineOffsets[ lineOffsets.length - 1 ] ) return 0;

        while ( true )
        {
            if ( offset < lineOffsets[ middle ] )
                e = middle;
            else if ( offset >= lineOffsets[ middle + 1 ] )
                b = middle;
            else
                break;

            middle = b + ( ( e - b ) >> 1 );
        }

        return middle;
    }

    /**
     * @return {function(*=, *=)}
     */
    function create_loc_info()
    {
        let i           = 0,
            lng         = source.length,
            lineOffsets = [ 0 ],
            chop = s => s.replace( /^(.*)[\r\n]*$/, '$1' );

        while ( i < lng )
        {
            if ( source[ i ] === '\n' )
                lineOffsets.push( i + 1 );

            ++i;
        }

        lineOffsets.push( lng );

        return ( start, end ) => {
            let lineNumber    = binary_search( start, lineOffsets ),
                startOffset   = start - lineOffsets[ lineNumber ],
                lineNumberEnd = end < lineOffsets[ lineNumber + 1 ] ? lineNumber : binary_search( end, lineOffsets ),
                endOffset     = end - lineOffsets[ lineNumberEnd ];

            return {
                start: {
                    line:       lineNumber,
                    offset:     startOffset,
                    sourceLine: chop( source.substring( lineOffsets[ lineNumber ], lineOffsets[ lineNumber + 1 ] ) ),
                    lineOffset: lineOffsets[ lineNumber ]
                },
                end:   {
                    line:       lineNumberEnd,
                    offset:     endOffset,
                    sourceLine: chop( source.substring( lineOffsets[ lineNumberEnd ], lineOffsets[ lineNumberEnd + 1 ] ) ),
                    lineOffset: lineOffsets[ lineNumberEnd ]
                },
                sourceRange: chop( source.substring( startOffset, endOffset + 1 ).replace( /^(.*)[\r\n]*$/, '$1' ) ),
                sourceLines: chop( source.substring( lineOffsets[ lineNumber ], lineOffsets[ lineNumberEnd + 1 ] ) )
            };

        };
    }

    return {
        fatal, error, warn, log
    };
}