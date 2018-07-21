/** ****************************************************************************
 * DESCRIPTION
 * @author julian.jensen
 * @since 0.0.1
 *******************************************************************************/
"use strict";

import { type_from_def } from "./src/tdd-type-system/type-parser";
import { ObjectType } from "./src/tdd-type-system/object-type";

const objectConstructor = require( './fixed.json' );

const { name, type } = type_from_def( objectConstructor );

console.log( `interface ${name} ${type}` );


