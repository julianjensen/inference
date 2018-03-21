/** ******************************************************************************************************************
 * @file Describe what file-observe does.
 * @author Julian Jensen <jjdanois@gmail.com>
 * @since 1.0.0
 * @date 20-Mar-2018
 *********************************************************************************************************************/

"use strict";

import fs                   from "fs";
import Rx                   from "rxjs";
import { promisify }        from "util";
// import { Observable }       from "rxjs/Observable";
// import { Subject }          from "rxjs/Subject";
import { TypeScriptParser } from "./utils/parser";


const
    readFile = promisify( fs.readFile ),
    read     = fname => readFile( fname, 'utf8' );

function file_subscriber( fileNames, observer )
{
    let subbed = true;

    Promise.all( fileNames
        .map( filename =>
            read( filename ).then( source => subbed && observer.next( {
                filename,
                source
            } ) ) ) )
        .then( () => observer.complete() );

    return () => subbed = false;
}

/**
 * @param {Array<string>} fileNames
 * @return {Rx.Subject}
 */
export function read_files( fileNames )
{
    const
        _ = obs => file_subscriber( fileNames, obs ),
        source = Rx.Observable.create( _ ),
        subject = new Rx.Subject();

    source.subscribe( subject );
    return subject;
    // return source; // .multicast( subject );
}

export function compile_files( obs )
{
    const
        tsp     = new TypeScriptParser( [ 'data' ] ),
        source  = Rx.Observable
            .from( obs )
            .map( ( { filename, source } ) => tsp.parse_file( filename, source ) ),
        subject = new Rx.Subject();

    source.subscribe( subject );
    return subject;
}

