/** ******************************************************************************************************************
 * @file Describe what host does.
 * @author Julian Jensen <jjdanois@gmail.com>
 * @since 1.0.0
 * @date 17-Mar-2018
 *********************************************************************************************************************/


"use strict";

import crypto           from "crypto";
import { sync }         from "../utils/files";
import { EOL }          from "../utils";
import { ScriptTarget } from "../types";
import path             from "path";
import * as ts          from "typescript";

/**
 * @param {string} filename
 * @param {string} source
 * @param {ts.SourceFile} ast
 * @return {{fileExists: function(*): boolean, getCanonicalFileName: function(*): *, getCurrentDirectory: function(): string, getDefaultLibFileName: function(): null, getNewLine: function(): string, getSourceFile: function(*): null, getSourceFiles: function(): *[], readFile: function(): *, useCaseSensitiveFileNames: function(): boolean, writeFile: function(): null, getResolvedTypeReferenceDirectives: function(): Map<any, any>, getCompilerOptions: function(): {experimentalDecorators: boolean, experimentalAsyncFunctions: boolean, jsx: boolean}}}
 */
export function create_host( filename, source, ast )
{
    const resolvedTypeReferenceDirectives = new Map();

    return {
        fileExists:                name => name === filename,
        getCanonicalFileName:      filename => filename,
        getCurrentDirectory:       () => process.cwd(),
        getDefaultLibFileName:     () => null,
        getNewLine:                () => '\n',
        getSourceFile:             name => name === filename ? ast : null,
        getSourceFiles:            () => [ ast ],
        readFile:                  () => source,
        useCaseSensitiveFileNames: () => true,
        writeFile:                 () => null,
        getResolvedTypeReferenceDirectives: () => resolvedTypeReferenceDirectives,
        getCompilerOptions:        () => ( {
            experimentalDecorators:     true,
            experimentalAsyncFunctions: true,
            jsx:                        true
        } )
    };
}

export function create_program( filename, source, ast )
{
    return ts.createProgram( [ filename ], {
        noResolve:                  true,
        target:                     ts.ScriptTarget.Latest,
        experimentalDecorators:     true,
        experimentalAsyncFunctions: true,
        jsx:                        'preserve'
    }, Object.assign( {}, createCompilerHost( {
        experimentalDecorators:     true,
        experimentalAsyncFunctions: true,
        jsx:                        true
    }, true ), create_host( filename, source, ast ) ) );
}

export function createCompilerHost( options, setParentNodes )
{
    const existingDirectories = new Map();

    function getCanonicalFileName( fileName )
    {
        // if underlying system can distinguish between two files whose names differs only in cases then file name already in canonical form.
        // otherwise use toLowerCase as a canonical form.
        return sync.useCaseSensitiveFileNames ? fileName : fileName.toLowerCase();
    }

    function getSourceFile( fileName, languageVersion, onError )
    {
        let text;

        try
        {
            text = sync.readFile( fileName, options.charset );
        }
        catch ( e )
        {
            if ( onError )
                onError( e.message );

            text = "";
        }

        return text !== undefined ? ts.createSourceFile( fileName, text, languageVersion, setParentNodes ) : undefined;
    }

    function directoryExists( directoryPath )
    {
        if ( existingDirectories.has( directoryPath ) )
            return true;

        if ( sync.directoryExists( directoryPath ) )
        {
            existingDirectories.set( directoryPath, true );
            return true;
        }

        return false;
    }

    function ensureDirectoriesExist( directoryPath )
    {
        if ( directoryPath.length > sync.getRootLength( directoryPath ) && !directoryExists( directoryPath ) )
        {
            const parentDirectory = sync.getDirectoryPath( directoryPath );
            ensureDirectoriesExist( parentDirectory );
            sync.createDirectory( directoryPath );
        }
    }

    let outputFingerprints;

    function writeFileIfUpdated( fileName, data, writeByteOrderMark )
    {
        if ( !outputFingerprints )
            outputFingerprints = new Map();

        const
            hash        = createMD5HashUsingNativeCrypto( data ),
            mtimeBefore = sync.getModifiedTime( fileName );

        if ( mtimeBefore )
        {
            const fingerprint = outputFingerprints.get( fileName );

            // If output has not been changed, and the file has no external modification
            if ( fingerprint &&
                 fingerprint.byteOrderMark === writeByteOrderMark &&
                 fingerprint.hash === hash &&
                 fingerprint.mtime.getTime() === mtimeBefore.getTime() )
                return;
        }

        sync.writeFile( fileName, data, writeByteOrderMark );

        const mtimeAfter = sync.getModifiedTime( fileName );

        outputFingerprints.set( fileName, {
            hash,
            byteOrderMark: writeByteOrderMark,
            mtime:         mtimeAfter
        } );
    }

    function writeFile( fileName, data, writeByteOrderMark, onError )
    {
        try
        {
            ensureDirectoriesExist( sync.getDirectoryPath( sync.normalizePath( fileName ) ) );
            sync.writeFile( fileName, data, writeByteOrderMark );
        }
        catch ( e )
        {
            if ( onError )
                onError( e.message );
        }
    }

    function getDefaultLibLocation()
    {
        return sync.getDirectoryPath( sync.normalizePath( __filename ) );
    }

    function getDefaultLibFileName( options )
    {
        switch ( options.target )
        {
            case ScriptTarget.ESNext:
                return "lib.esnext.full.d.ts";
            case ScriptTarget.ES2017:
                return "lib.es2017.full.d.ts";
            case ScriptTarget.ES2016:
                return "lib.es2016.full.d.ts";
            case ScriptTarget.ES2015:
                return "lib.es6.d.ts";  // We don't use lib.es2015.full.d.ts due to breaking change.
            default:
                return "lib.d.ts";
        }
    }

    const
        newLine  = EOL,
        realpath = sync.realpath,
        resolvedTypeReferenceDirectives = new Map();

    return {
        getSourceFile,
        getDefaultLibLocation,
        getDefaultLibFileName:     options => path.join( 'data', getDefaultLibFileName( options ) ),
        writeFile,
        getCurrentDirectory:       () => process.cwd(),
        useCaseSensitiveFileNames: () => sync.useCaseSensitiveFileNames,
        getCanonicalFileName,
        getNewLine:                () => newLine,
        fileExists:                fileName => sync.fileExists( fileName ),
        readFile:                  fileName => sync.readFile( fileName ),
        trace:                     s => process.stdout.write( s + newLine ),
        directoryExists:           directoryName => sync.directoryExists( directoryName ),
        getEnvironmentVariable:    name => process.env[ name ] !== void 0 ? process.env[ name ] : "",
        getDirectories:            path => sync.getDirectories( path ),
        getResolvedTypeReferenceDirectives: () => resolvedTypeReferenceDirectives,
        getCompilerOptions: () => options,
        realpath
    };
}

/**
 * @param {*} data
 * @return {string}
 */
function createMD5HashUsingNativeCrypto( data )
{
    const hash = crypto.createHash( "md5" );
    hash.update( data );
    return hash.digest( "hex" );
}
