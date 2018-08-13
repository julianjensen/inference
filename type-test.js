/** ****************************************************************************
 * DESCRIPTION
 * @author julian.jensen
 * @since 0.0.1
 *******************************************************************************/
"use strict";

import { init, type_from_def } from "./src/tdd-type-system/type-parser";

init();

const def = require( './__tests__/tdd/array-fixed.json' );
const { type } = type_from_def( def );
console.log( 'stringified:', type.toString() );


