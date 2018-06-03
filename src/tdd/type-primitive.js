/** ****************************************************************************
 * DESCRIPTION
 * @author julian.jensen
 * @since 0.0.1
 *******************************************************************************/
"use strict";

import { Type } from "./type-base";
import { register } from "./type-utils";

/** */
export class Primitive extends Type {}

register( Primitive );
