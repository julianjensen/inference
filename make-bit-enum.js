#!/usr/bin/env node
/** ******************************************************************************************************************
 * @file Describe what make-bit-enum does.
 * @author Julian Jensen <jjdanois@gmail.com>
 * @since 1.0.0
 * @date 27-Jan-2018
 *********************************************************************************************************************/
"use strict";

const
    stdin = process.stdin,
    fs = require( 'fs' );

if ( process.argv[ 2 ] )
    process_file( fs.readFileSync( process.argv[ 2 ], 'utf8' ) );
else
{
    stdin.setEncoding( 'utf8' );

    let str = '';

    stdin.on( 'readable', () => {
        str += stdin.read() || '';
    } );

    stdin.on( 'end', () => process_file( str ) );
}

function process_file( src )
{
    const
        indent = '    ',
        lines = src.split( /\r?\n/ )
            .filter( s => !!s )
            .map( ( line, i ) =>
                line.replace( /^[^a-zA-Z]*([a-zA-Z_$][a-zA-Z_$0-9]*).*?(\/\/.*)?$/,
                    ( $0, $1, $2 ) =>
                        `${indent}${$1}: ${!i ? 0 : `1 << ${i - 1}`},${$2 ? ( ' ' + $2 ) : ''}\n`
                )
            );

    lines.push( `${indent}asString( val, sep = ' | ' ) { return enum_to_string( this, val ).join( sep ); }` );

    console.log( `{\n${lines.join( '' )}\n}` );
}
