/** ****************************************************************************
 * DESCRIPTION
 * @author julian.jensen
 * @since 0.0.1
 *******************************************************************************/
"use strict";

import { massage_defs } from "../src/tdd-type-system/utils";
import fs from 'fs';

const
    [ ,, src = './__tests__/tdd/object-constructor.json', dest ] = process.argv,
    objectConstructor = JSON.parse( fs.readFileSync( src, 'utf8' ) );

let fixed;

try {
    fixed = massage_defs( objectConstructor );
}
catch ( e ) {
    console.error( e );
    process.exit( 1 );
}

if ( dest )
    fs.writeFileSync( dest, JSON.stringify( fixed, null, 4 ) );
else
    console.log( JSON.stringify( dest, null, 4 ) );
