/** ******************************************************************************************************************
 * @file cli.js version
 * @author Julian Jensen <jjdanois@gmail.com>
 * @since 1.0.0
 * @date 19-Jan-2018
 *********************************************************************************************************************/
"use strict";

import program from 'commander';

import { Parser } from "./src/utils/parser";
import globals from './src/utils/globals';
import { create_symbols } from "./src/symbols/simple-table";

import { inspect } from 'util';

const
    pack           = require( './package.json' ),
    version        = pack.version,
    name           = pack.name,
    $              = o => JSON.stringify( o, null, 4 ),
    $$ = ( o, d ) => inspect( o, { depth: typeof d === 'number' ? d : 8, showHidden: false } ),
    defaultOptions = {
        loc: true,
        range: true,
        comment: true,
        tokens: true,
        ecmaVersion: 9,
        sourceType: 'module',
        ecmaFeatures: {
            impliedStrict: true,
            experimentalObjectRestSpread: true
        }
    };

program
    .version( version )
    .name( name )
    .description( 'Parse JavaScript files and extract JsDoc tags' )
    .usage( name + ' [files...]' )
    .option( '-s, --script', 'Process file(s) as script files', false )
    .option( '-l, --library', 'Process file(s) for library definitions', false )
    .option( '[files...]' )
    .parse( process.argv );

if ( !program.args.length ) program.help();

globals.program = program;

( async() => {
    const
        parser = new Parser( [ 'data' ] );

    await parser.add_source_files( ...program.args );
    await parser.parse();

    globals.file = parser.ambient;
    if ( !program.library )
        create_symbols( parser.ambientTypes );
    else
        console.log( $( parser.ambientTypes ) );
} )();
