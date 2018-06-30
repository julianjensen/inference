/** ****************************************************************************
 * DESCRIPTION
 * @author julian.jensen
 * @since 0.0.1
 *******************************************************************************/
"use strict";

import { mix } from 'mixwith';
import { Type } from "../tdd/type-base";

/**
 * @class Primitive
 * @extends Type
 */
export class Primitive extends mix( Type )
{
    boxesTo = null;
}
