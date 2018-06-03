/** ****************************************************************************
 * DESCRIPTION
 * @author julian.jensen
 * @since 0.0.1
 *******************************************************************************/
"use strict";

import { Type } from "./type-base";
import { ScopeManager } from "./scopes";
import { register } from "./type-utils";

/** */
export class Undef extends Type
{
    /**
     * @param {string} name
     * @param {Scope} [scope]
     */
    constructor( name, scope = ScopeManager.global )
    {
        super( name, scope );

        this.refs = [];
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
