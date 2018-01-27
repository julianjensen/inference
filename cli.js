/** ******************************************************************************************************************
 * @file cli.js version
 * @author Julian Jensen <jjdanois@gmail.com>
 * @since 1.0.0
 * @date 19-Jan-2018
 *********************************************************************************************************************/

"use strict";

import program from 'commander';
import fs from 'fs';
import { promisify } from 'util';
import { parse, prep } from './src/parse-file';
import { globals } from "./src/utils";

const
    readFile = promisify( fs.readFile ),
    pack = require( './package.json' ),
    version = pack.version,
    name = pack.name,
    $ = o => JSON.stringify( o, null, 4 ),
    defaultOptions = {
        loc:          true,
        range:        true,
        comment:      true,
        tokens:       true,
        ecmaVersion:  9,
        sourceType:   'module',
        ecmaFeatures: {
            impliedStrict:                true,
            experimentalObjectRestSpread: true
        }
    };

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

/**
 * @param {string} fileName
 * @return {Promise<{fileName, types: Array<string>, allDocNodes}>}
 */
async function process_file( fileName )
{
    defaultOptions.sourceType = program.script ? 'script' : 'module';

    const
        source = await readFile( fileName, 'utf8' ),
        ast = parse( source, defaultOptions );

    return prep( ast, fileName );
}

Promise.all( program.args.map( process_file ) )
    .then( files => {
        const
            output = {
                allTypes: files.reduce( ( at, t ) => at.concat( t.types ), [] ),
                files
            };

        output.allTypes = [ ...new Set( output.allTypes ) ];

        console.log( $( output ) );
    } );
