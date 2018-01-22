/** ******************************************************************************************************************
 * @file cli.js version
 * @author Julian Jensen <jjdanois@gmail.com>
 * @since 1.0.0
 * @date 19-Jan-2018
 *********************************************************************************************************************/

"use strict";

import program from 'commander';
import fs from 'fs';
import { parse, prep } from './src/parse-file';
import { globals } from "./src/utils";

const
    pack = require( './package.json' ),
    version = pack.version,
    name = pack.name,
    $ = o => JSON.stringify( o, null, 4 );

program
    .version( version )
    .name( name )
    .description( 'Parse JavaScript files and extract JsDoc tags' )
    .usage( name + ' [files...]' )
    .option( '-s, --script', 'Process file(s) as script files', false )
    .option( '[files...]' )
    .parse( process.argv );

if ( !program.args.length ) program.help();

globals.program = program;

// console.log( 'args:', Object.keys( program ).filter( k => /^[a-z]/.test( k ) && k !== 'options' && k !== 'rawArgs' ).reduce( ( obj, key ) => ( obj[ key ] = program[ key ], obj ), {} ) );

program.args.map( fn => fs.readFileSync( fn, 'utf8' ) ).map( src => {
    const single = parse( src, {
        loc:          true,
        range:        true,
        comment:      true,
        tokens:       true,
        ecmaVersion:  9,
        sourceType:   program.script ? 'script' : 'module',
        ecmaFeatures: {
            impliedStrict:                true,
            experimentalObjectRestSpread: true
        }
    } );

    console.log( $( prep( single ) ) );

} );
