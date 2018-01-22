/** ******************************************************************************************************************
 * @file Provides stand-alone utility functions.
 * @author Julian Jensen <jjdanois@gmail.com>
 * @since 1.0.0
 * @date 19-Jan-2018
 *********************************************************************************************************************/
"use strict";

const
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

export const globals = {
    symbolTable: null,
    current: null,
    program: null
};
