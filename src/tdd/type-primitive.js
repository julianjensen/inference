/** ****************************************************************************
 * DESCRIPTION
 * @author julian.jensen
 * @since 0.0.1
 *******************************************************************************/
"use strict";

import { Type } from "./type-base";
import { register } from "./cross-ref";
import { ScopeManager } from "./type-utils";

/** */
export class Primitive extends Type
{
    /**
     * @return {string}
     */
    toString()
    {
        return this.name;
    }

    /** */
    static init()
    {
        [ 'any', 'never', 'undefined', 'void', 'number', 'string', 'boolean', 'symbol', 'null' ]
            .forEach( typeIdentifier => ScopeManager.__add_primitive( typeIdentifier, new Primitive( typeIdentifier ) ) );
    }
}

register( Primitive );
