/** ******************************************************************************************************************
 * @file cli.js version
 * @author Julian Jensen <jjdanois@gmail.com>
 * @since 1.0.0
 * @date 19-Jan-2018
 *********************************************************************************************************************/

"use strict";

import program                       from 'commander';
import fs                            from 'fs';
import { inspect, promisify }        from 'util';
import { parse, prep }               from './src/parse-file';
import { settings }                  from "./src/ts/ts-imports";
import { concurrent }                from "./src/utils/files";
import { reportStatistics }          from "./src/utils/performance";
import { SyntaxKind }                from "./src/ts/ts-helpers";
import { walk_symbols }              from "./src/ts/ts-symbols";
import { compile_files, read_files } from "./src/file-observe";

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
    },
    tsFiles        = [],
    jsFiles        = [];

program
    .version( version )
    .name( name )
    .description( 'Parse JavaScript files and extract JsDoc tags' )
    .usage( name + ' [files...]' )
    .option( '-s, --script', 'Process file(s) as script files', false )
    .option( '[files...]' )
    .parse( process.argv );

if ( !program.args.length ) program.help();

// globals.program = program;

// console.log( 'args:', Object.keys( program ).filter( k => /^[a-z]/.test( k ) && k !== 'options' && k !== 'rawArgs' ).reduce( ( obj, key ) => ( obj[ key ] = program[ key ], obj ), {} ) );

/**
 * @param {string} fileName
 * @return {Promise<{fileName, types: Array<string>, allDocNodes}>}
 */
async function process_file( fileName )
{
    // console.log( `Processing file: "${fileName}"` );

    ( fileName.endsWith( '.ts' ) ? tsFiles : jsFiles ).push( fileName );

    // if ( fileName.endsWith( '.ts' ) )
    // {
    //     tsFiles.push( fileName );
    //     // tsFiles.set( fileName, { filename: fileName } );
    //     // const info = settings.parse( fileName, source );
    //     // info.ast.error = info.error;
    //     // info.ast.fatal = info.fatal;
    //     // info.ast.warn = info.warn;
    //     // info.ast.log = info.log;
    //
    //         // console.log( inspect( ast, { depth: 20, colors: true } ) );
    //         // settings.walk( ast );
    //
    //     // settings.define_symbols( info );
    //
    //     return null;
    // }
    // else
    // {
    //
    //     defaultOptions.sourceType = program.script ? 'script' : 'module';
    //
    //     const
    //         source = await readFile( fileName, 'utf8' ),
    //         ast = parse( source, defaultOptions );
    //
    //     return null;
    //     // return prep( ast, fileName );
    // }
}

program.args.forEach( process_file );

/**
 * @return {Promise<void>}
 */
async function run_all()
{
    const
        ts      = await parse_ts( tsFiles ),
        js      = await parse_js( jsFiles ),
        outputs = [];

    ts.forEach( file => outputs.push( `${file.filename}, source: ${file.source.length}, ast: ${SyntaxKind[ file.ast.kind ]}` ) );

    // console.log( `done ${ts.length} files:\n${outputs.join( '\n' )}` );

    ts.forEach( file => walk_symbols( file ) ); // sym_walk( file.ast ) );
    // reportStatistics();
}

new Promise( ( resolve, reject ) => {
    let ref = 2;
    const
        reader   = read_files( tsFiles ),
        compiler = compile_files( reader ),
        sub      = reader.subscribe( {
            next( obj )
            {
                console.log( `name: ${obj.filename}` );
                console.log( `source? ${!!obj.source}` );
            },
            error: reject,
            complete()
            {
                sub.unsubscribe();
                --ref;
                if ( ref <= 0 ) resolve( 'okay' );
            }
        } ),
        csub     = compiler.subscribe( {
            next( file )
            {
                console.log( `compiled: ${file.filename}, ast? ${!!file.ast}, is ` );
            },
            error: reject,
            complete()
            {
                csub.unsubscribe();
                --ref;
                if ( ref <= 0 ) resolve( "comp'd" );
            }
        } );

} )
    .catch( err => console.error( err ) )
    .then( status => console.log( status ) );


// run_all();


/**
 * @param {Array<string>} files
 * @return {*[]}
 */
async function parse_ts( files )
{
    if ( files.length )
    {
        settings.loadParser();
        return await settings.aparse( files );
    }

    return [];
}

/**
 * @param {Array<string>} files
 * @return {*[]}
 */
async function parse_js( files )
{
    defaultOptions.sourceType = program.script ? 'script' : 'module';

    if ( files.length )
    {
        return files.map( async filename => {
            const
                source = await concurrent.readFile( filename, 'utf8' ),
                ast    = parse( source, defaultOptions );

            return {
                filename,
                source,
                ast
            };
        } );
    }

    return [];
}

// Promise.all( program.args.map( process_file ) )
//     .then( files => {
//         const
//             output = files && {
//                 allTypes: files.reduce( ( at, t ) => t ? at.concat( t.types ) : at, [] ),
//                 files
//             };
//
//         if ( tsFiles.size )
//         {
//             settings.loadParser();
//             settings.parse( tsFiles );
//         }
//
//         if ( output )
//         {
//             output.allTypes = [ ...new Set( output.allTypes ) ];
//
//             // console.log( $( output ) );
//         }
//
//         settings.dump_info();
//     } );

