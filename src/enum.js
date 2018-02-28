/** ******************************************************************************************************************
 * @file Describe what enum does.
 * @author Julian Jensen <jjdanois@gmail.com>
 * @since 1.0.0
 * @date 25-Feb-2018
 *********************************************************************************************************************/
"use strict";

const
    VALUE     = Symbol( 'value' ),
    NUMERICAL = Symbol( 'numerical' ),
    ENUM = Symbol( 'enum' );

/**
 * @param {object<string,number>} names
 * @param {function} [prior]
 * @return {function}
 */
export function make_enum_from_object( names, prior )
{
    const __enum = prior || ( ( val = 0 ) => {
        if ( typeof val === 'function' && val[ ENUM ] === true ) return val;
        __enum[ VALUE ] = val;
        return __enum;
    } );

    if ( !prior )
    {
        __enum[ ENUM ] = true;
        __enum[ VALUE ]     = 0;
        __enum[ NUMERICAL ] = {};

        __enum[ Symbol.toPrimitive ] = function( hint ) {
            if ( hint === 'string' ) return __enum.asString( __enum[ VALUE ] );
            return __enum[ VALUE ];
        };

        __enum.asString = num => {
            let i = 1,
                s = [];

            while ( num )
            {
                if ( num & 1 )
                    s.push( __enum[ NUMERICAL ][ i ] );

                num >>>= 1;
                i <<= 1;
            }

            return s.join( ' | ' );
        };
    }

    Object.entries( names ).forEach( ( [ name, val ] ) => {
        __enum[ name ]             = {
            valueOf() { return val; },
            toString() { return name; }
        };
        __enum[ NUMERICAL ][ val ] = name;
    } );

    return __enum;
}

/**
 * @param {function} home
 * @param {object} obj
 */
export function make_extra( home, obj )
{
    const wrap = ( home, val, name ) => ( { valueOf: () => val, toString: () => name } );

    for ( const [ name, desc ] of Object.entries( obj ) )
    {
        const
            val = desc.get(),
            __  = wrap( home, val, name );

        home[ NUMERICAL ][ val ] = name;
        Object.defineProperty( home, name, { get: () => __ } );
    }

    return home;
}

function has_one_bit( n )
{
    return n && !( n & ( n - 1 ) );
}

function low_bit( n )
{
    return n ^ ( n & ( n - 1 ) );
}

function high_bit( n )
{
    n = n | ( n >>> 1 );
    n = n | ( n >>> 2 );
    n = n | ( n >>> 4 );
    n = n | ( n >>> 8 );

    return ( n + 1 ) >>> 1;
}

function bit_count( n )
{
    n = n - ( ( n >> 1 ) & 0x55555555 );
    n = ( n & 0x33333333 ) + ( ( n >> 2 ) & 0x33333333 );
    return ( ( n + ( n >> 4 ) & 0xF0F0F0F ) * 0x1010101 ) >> 24;
}

const
    lg2 = [
        -1, 0, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3,
        4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4,
        5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
        5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,

        6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6,
        6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6,
        6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6,
        6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6,

        7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7,
        7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7,
        7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7,
        7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7,
        7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7,
        7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7,
        7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7,
        7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7
    ];

function log2( n )
{
    let t,
        tt;

    return tt = n >>> 16
                ? ( ( t = tt >>> 8 ) ? 24 + lg2[ t ] : 16 + lg2[ tt ] )
                : ( ( t = n >>> 8 ) ? 8 + lg2[ t ] : lg2[ n ] );
}

function bit_number_of_lowest_bit( v )
{
    let c = 1;

    if ( v & 1 ) return 0;

    if ( ( v & 0xffff ) === 0 )
    {
        v >>>= 16;
        c += 16;
    }

    if ( ( v & 0xff ) === 0 )
    {
        v >>>= 8;
        c += 8;
    }

    if ( ( v & 0xf ) === 0 )
    {
        v >>>= 4;
        c += 4;
    }

    if ( ( v & 0x3 ) === 0 )
    {
        v >>>= 2;
        c += 2;
    }

    return c -= ( v & 1 );
}

function round_up_to_next_power_of_two( v )
{
    v--;
    v |= v >>> 1;
    v |= v >>> 2;
    v |= v >>> 4;
    v |= v >>> 8;
    v |= v >>> 16;

    return v + 1;
}


// const
//     LITTLE_ENDIAN = require( 'os' ).endianness() === 'LE',
//     BIG_ENDIAN = !LITTLE_ENDIAN;
//
// function trickery( v )
// {
//     let con = LITTLE_ENDIAN ? 4 : 0,
//         val = con ^ 4,
//
//         view = new DataView( new ArrayBuffer( 8 ) ),
//         setInt = ( offset, value ) => view.setInt32( offset, value, LITTLE_ENDIAN ),
//         getInt = ( offset, value ) => view.getInt32( offset, value, LITTLE_ENDIAN ),
//         getFloat = () => view.getFloat64( 0, LITTLE_ENDIAN ),
//         setFloat = value => view.setFloat64( 0, value, LITTLE_ENDIAN );
//
//     // console.log( `con: ${con}, val: ${val}` );
//
//     setInt( con, 0x43300000 );
//     setInt( val, 0 );
//     const two52 = getFloat();
//     console.log( 'float 0:', two52 );
//     setInt( val, v );
//
//     const tmp = getFloat();
//     console.log( 'float v - 2^52:', tmp - two52 );
//
//     // setFloat( getFloat() );
//     // setFloat( getFloat() - two52 );
//     setFloat( tmp - two52 );
//
//     return ( getInt( con ) >> 20 ) - 1023;
//
//     // view.setInt32( LITTLE_ENDIAN << 2, 0x43300000, LITTLE_ENDIAN );
//     // view.setInt32( BIG_ENDIAN << 2, v, LITTLE_ENDIAN );
//     //
//     // view.setFloat64( 0, view.getFloat64( 0, LITTLE_ENDIAN ) - 4503599627370496.0, LITTLE_ENDIAN );
//     //
//     // return ( view.getInt32( LITTLE_ENDIAN << 2, LITTLE_ENDIAN ) >> 20 ) - 0x3ff;
// }
//
// function show_log2( n )
// {
//     console.log( `${n} =>` );
//     console.log( `Math: ${Math.log2( n )}` );
//     console.log( `log2: ${log2( n )}` );
//     console.log( `Hack: ${trickery( n )}` );
//     console.log( '' );
// }
//
// show_log2( 16 );
// show_log2( 256 );
// show_log2( 123 );
