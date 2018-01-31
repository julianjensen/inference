/** ******************************************************************************************************************
 * @file cli.js version
 * @author Julian Jensen <jjdanois@gmail.com>
 * @since 1.0.0
 * @date 19-Jan-2018
 *********************************************************************************************************************/


"use strict";

import program                from 'commander';
import fs                     from 'fs';
import { inspect, promisify } from 'util';
import { parse, prep }        from './src/parse-file';
import { globals }            from "./src/utils";
import { settings }           from "./src/ts-imports";

const
    readFile       = promisify( fs.readFile ),
    pack           = require( './package.json' ),
    version        = pack.version,
    name           = pack.name,
    $              = o => JSON.stringify( o, null, 4 ),
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
    const
        source = await readFile( fileName, 'utf8' );

    let ast;

    if ( fileName.endsWith( '.ts' ) )
    {
        settings.loadParser( ts => {
            ast = settings.parse( ts, source );
            // console.log( inspect( ast, { depth: 20, colors: true } ) );
            // settings.walk( ast );
        } );

        return null;
    }

    defaultOptions.sourceType = program.script ? 'script' : 'module';

    ast = parse( source, defaultOptions );

    return prep( ast, fileName );
}

Promise.all( program.args.map( process_file ) )
    .then( files => {
        const
            output = files && {
                allTypes: files.reduce( ( at, t ) => t ? at.concat( t.types ) : at, [] ),
                files
            };


        if ( output )
        {
            output.allTypes = [ ...new Set( output.allTypes ) ];

            // console.log( $( output ) );
        }
    } );
