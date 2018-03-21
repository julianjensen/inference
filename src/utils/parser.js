/** ******************************************************************************************************************
 * @file Describe what parser does.
 * @author Julian Jensen <jjdanois@gmail.com>
 * @since 1.0.0
 * @date 20-Mar-2018
 *********************************************************************************************************************/
"use strict";

import { performance }        from "./performance";
import { create_reporters }   from "./source-code";
import { createBinder }       from "../symbols/nodes";
import {
    file_handler,
    sync,
    concurrent
} from "./files";
import { create_host }        from "../ts/host";
import { syntaxKind }         from "../ts/ts-helpers";
import * as ts from "typescript";

let sys = concurrent;

export class Parser
{
    /**
     * @param {?Array<string>} [includePaths]
     */
    constructor( includePaths )
    {
        this.handler = null;
        this.includePaths = includePaths;

    }

    async add_source_files( ...srcs )
    {
        if ( !this.handler )
            this.handler = await file_handler( srcs, this.includePaths );
        else
            this.handler.add( ...srcs );

        return this;
    }

    /**
     * @param {string} filename
     * @return {Promise<*>}
     */
    async create_bundle( filename = 'data/concatenated.d.ts' )
    {
        let concatenated = '';

        this.handler.each( file => concatenated += file.source.replace( /\r/g, '' ) );

        if ( sys === concurrent )
        {
            return sys.writeFile( filename, concatenated )
                .then( async () => this.handler = await file_handler( [ filename ], this.includePaths ) )
                .then( () => this );
        }

        sys.writeFile( filename, concatenated );
        this.handler = await file_handler( [ filename ], this.includePaths )
        return this;
    }

    /**
     * @param {object} [options={}]
     * @return {Array<object>}
     */
    parse( options = {} )
    {
        return this.handler.names().map( filename => {
            const file = this.handler.get( filename );
            Object.assign( file, this.parse_file( filename, file.source, options ) );
            return file;
        } );
    }

    /**
     *
     * @param {string} filename
     * @param {string} source
     * @param {object} [options={}]
     * @abstract
     */
    parse_file( filename, source, options = {} )
    {

    }

    // /**
    //  * @param filenames
    //  * @param options
    //  * @return {Promise<*[]>}
    //  */
    // async aparse( filenames, options = {} )
    // {
    //     options = { ...defaultOptions, ...options };
    //
    //     performance.enable();
    //     performance.mark( "beforeFiles" );
    //
    //     const handler = await file_handler( filenames, [ 'data' ] );
    //
    //     performance.mark( "afterFiles" );
    //     performance.measure( "Files", "beforeFiles", "afterFiles" );
    //
    //     const res = [];
    //
    //     let concatenated = '';
    //
    //
    //     handler.each( file => concatenated += file.source.replace( /\r/g, '' ) );
    //
    //     const c = handler.create_file( 'generated.d.ts' );
    //
    //     sync.writeFile( 'data/concatenated.d.ts', concatenated );
    //
    //     c.source    = concatenated;
    //     c.reporters = create_reporters( c.filename, c.source );
    //     c.ast       = ts.createSourceFile( c.filename, c.source, ts.ScriptTarget.Latest, true );
    //     c.bound     = createBinder()( c.ast, {} );
    //
    //     // handler.each( file => {
    //     //
    //     //     file.ast = ts.createSourceFile( file.filename, file.source, ts.ScriptTarget.Latest, true );
    //     //     // file.binder = createBinder();
    //     //     file.bound = createBinder()( file.ast, {} );
    //     //     res.push( file );
    //     // } );
    //
    //     // return res;
    //
    //
    //     // c.program = create_program( 'generated.d.ts', concatenated, c.ast );
    //     // c.typeChecker = c.program.getTypeChecker();
    //     c.ast.moduleAugmentations = [];
    //     c.typeChecker             = ts.createTypeChecker( create_host( 'generated.d.ts', concatenated, c.ast ), false );
    //
    //     return [ c ];
    // }

}

/**
 * @class TypeScriptParser
 * @extends Parser
 */
export class TypeScriptParser extends Parser
{
    /**
     * @param {?Array<string>} [includePaths]
     */
    constructor( includePaths )
    {
        super( includePaths );

        // workarounds issue described at https://github.com/Microsoft/TypeScript/issues/18062
        for ( const name of Object.keys( ts.SyntaxKind ).filter( x => isNaN( parseInt( x ) ) ) )
        {
            const value = ts.SyntaxKind[ name ];
            if ( !syntaxKind[ value ] )
                syntaxKind[ value ] = name;
        }

        this.defaultOptions = {
            noResolve:                  true,
            target:                     ts.ScriptTarget.Latest,
            experimentalDecorators:     true,
            experimentalAsyncFunctions: true,
            jsx:                        'preserve'
        };
    }

    // /**
    //  * @param filenames
    //  * @param options
    //  * @return {Promise<*[]>}
    //  */
    // async cparse( filenames, options = {} )
    // {
    //     options = { ...this.defaultOptions, ...options };
    //
    //     let concatenated = '';
    //
    //
    //     handler.each( file => concatenated += file.source.replace( /\r/g, '' ) );
    //
    //     const c = handler.create_file( 'generated.d.ts' );
    //
    //     sync.writeFile( 'data/concatenated.d.ts', concatenated );
    //
    //     c.source    = concatenated;
    //     c.reporters = create_reporters( c.filename, c.source );
    //     c.ast       = ts.createSourceFile( c.filename, c.source, ts.ScriptTarget.Latest, true );
    //     c.bound     = createBinder()( c.ast, {} );
    //
    //     // handler.each( file => {
    //     //
    //     //     file.ast = ts.createSourceFile( file.filename, file.source, ts.ScriptTarget.Latest, true );
    //     //     // file.binder = createBinder();
    //     //     file.bound = createBinder()( file.ast, {} );
    //     //     res.push( file );
    //     // } );
    //
    //     // return res;
    //
    //
    //     // c.program = create_program( 'generated.d.ts', concatenated, c.ast );
    //     // c.typeChecker = c.program.getTypeChecker();
    //     c.ast.moduleAugmentations = [];
    //     c.typeChecker             = ts.createTypeChecker( create_host( 'generated.d.ts', concatenated, c.ast ), false );
    //
    //     return [ c ];
    // }

    /**
     * @param {string} filename
     * @param {string} source
     * @param {object} _options
     * @return {object}
     * @override
     */
    parse_file( filename, source, _options = {} )
    {
        const
            options = { ...this.defaultOptions, ..._options };

        return {
                filename,
                source,
                reporters: create_reporters( filename, source ),
                ast: ts.createSourceFile( filename, source, ts.ScriptTarget.Latest, true ),

                create_symbols()
                {
                    this.bound = createBinder()( this.ast, options );
                    return this;
                },

                create_types()
                {
                    this.ast.moduleAugmentations = [];
                    this.typeChecker             = ts.createTypeChecker( create_host( this.filename, this.source, this.ast ), false );
                    return this;
                }
            };
    }
}

