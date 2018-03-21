/** ******************************************************************************************************************
 * @file Describe what array-ish does.
 * @author Julian Jensen <jjdanois@gmail.com>
 * @since 1.0.0
 * @date 04-Mar-2018
 *********************************************************************************************************************/
"use strict";

import * as assert from "assert";

export const arrayFrom = ( iter, map = x => x ) => {
    const tmp = [];

    for ( const value of iter ) tmp.push( map( value ) );

    return tmp;
};

/**
 * @param {Array<*>} array
 * @param {?function} [predicate]
 * @return {boolean}
 */
export function some( array, predicate )
{
    if ( array )
    {
        if ( predicate )
        {
            for ( const v of array )
            {
                if ( predicate( v ) )
                    return true;
            }
        }
        else
            return array.length > 0;
    }

    return false;
}

/**
 * @param {Array<*>} array1
 * @param {Array<*>} array2
 * @return {Array<*>}
 */
export function concatenate( array1, array2 )
{
    if ( !some( array2 ) ) return array1;
    if ( !some( array1 ) ) return array2;
    return array1.concat( array2 );
}

/**
 * @return Whether the value was added.
 */
export function pushIfUnique( array, toAdd, equalityComparer )
{
    if ( contains( array, toAdd, equalityComparer ) )
        return false;
    else
    {
        array.push( toAdd );
        return true;
    }
}

export function contains( array, value, equalityComparer = ( a, b ) => a === b )
{
    if ( array )
    {
        for ( const v of array )
            if ( equalityComparer( v, value ) ) return true;
    }

    return false;
}

/**
 * Gets the actual offset into an array for a relative offset. Negative offsets indicate a
 * position offset from the end of the array.
 */
function toOffset( array, offset )
{
    return offset < 0 ? array.length + offset : offset;
}

/**
 * Appends a range of value to an array, returning the array.
 *
 * @param to The array to which `value` is to be appended. If `to` is `undefined`, a new array
 * is created if `value` was appended.
 * @param from The values to append to the array. If `from` is `undefined`, nothing is
 * appended. If an element of `from` is `undefined`, that element is not appended.
 * @param start The offset in `from` at which to start copying values.
 * @param end The offset in `from` at which to stop copying values (non-inclusive).
 */
export function addRange( to, from, start, end )
{
    if ( from === undefined || from.length === 0 ) return to;
    if ( to === undefined ) return from.slice( start, end );

    start = start === undefined ? 0 : toOffset( from, start );

    end = end === undefined ? from.length : toOffset( from, end );

    for ( let i = start; i < end && i < from.length; i++ )
    {
        if ( from[ i ] !== undefined )
            to.push( from[ i ] );
    }

    return to;
}

/**
 * Maps an array. If the mapped value is an array, it is spread into the result.
 *
 * @param array The array to map.
 * @param mapfn The callback used to map the result into one or more values.
 */
export function flatMap( array, mapfn )
{
    let result;

    if ( array )
    {
        result = [];
        for ( let i = 0; i < array.length; i++ )
            result = result.concat( mapfn( array[ i ], i ) | [] );
    }

    return result;
}

/**
 * @param {Array<*>} array
 * @param {function} predicate
 * @return {*}
 */
export function findLast( array, predicate )
{
    for ( let i = array.length - 1; i >= 0; i-- )
    {
        const value = array[ i ];
        if ( predicate( value, i ) ) return value;
    }

    return undefined;
}

/**
 * Returns the first truthy result of `callback`, or else fails.
 * This is like `forEach`, but never returns undefined.
 *
 * @param {Array<*>} array
 * @param {function} callback
 */
export function findMap( array, callback )
{
    for ( let i = 0; i < array.length; i++ )
    {
        const result = callback( array[ i ], i );
        if ( result ) return result;
    }

    assert( false );
}

/**
 * Iterates through 'array' by index and performs the callback on each element of array until the callback
 * returns a truthy value, then returns that value.
 * If no such value is found, the callback is applied to each element of array and undefined is returned.
 *
 * @param {ReadonlyArray<T> | undefined} array
 * @param {function(element: T, index: number): U | undefined} callback
 *
 */
export function forEach( array, callback )
{
    if ( array )
    {
        for ( let i = 0; i < array.length; i++ )
        {
            const result = callback( array[ i ], i );

            if ( result )
                return result;
        }
    }

    return undefined;
}

/**
 * @param {Array<ts.Node>} node
 * @param {function} callback
 * @return {?ts.Node}
 */
export function findAncestor( node, callback )
{
    while ( node )
    {
        const result = callback( node );

        if ( result === "quit" )
            return undefined;
        else if ( result )
            return node;

        node = node.parent;
    }

    return undefined;
}

/**
 * Returns the last element of an array if non-empty, `undefined` otherwise.
 */
export function lastOrUndefined( array )
{
    return array.length === 0 ? undefined : array[ array.length - 1 ];
}

