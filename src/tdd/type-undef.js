/** ****************************************************************************
 * DESCRIPTION
 * @author julian.jensen
 * @since 0.0.1
 *******************************************************************************/
"use strict";

import { Type } from "./type-base";
import { register } from "./cross-ref";

/** */
export class Undef extends Type
{
    /**
     * @param {string} name
     * @param {?Scope} scope
     */
    constructor( name, scope )
    {
        super( name, scope );

        this.refs = [];
    }

    toString()
    {
        return 'Undefined';
    }

    /**
     * @param {Entry} type
     */
    add_ref( type )
    {
        if ( !this.refs.includes( type ) )
            this.refs.push( type );
    }
}

register( Undef );
