/** ****************************************************************************
 * DESCRIPTION
 * @author julian.jensen
 * @since 0.0.1
 *******************************************************************************/
"use strict";

import { Type } from "./type-base";
import { ScopeManager } from "./scopes";
import { definition, register } from "./type-utils";

let Undef;

/** */
export class TypeReference extends Type
{
    /**
     * @param {string} name
     * @param {Type} [target=null]
     * @param {Scope} [scope]
     */
    constructor( name, target = null, scope = ScopeManager.global )
    {
        super( name, scope );
        if ( !Undef ) Undef = definition( 'Undef' );
        this.typeArguments = [];
        if ( target ) this.add_target( target );
    }

    /**
     * @param {Type} type
     */
    add_target( type )
    {
        this.ref = type;

        if ( type instanceof Undef )
            type.add_ref( this );
    }

    /**
     * @param {string[]} typeArgs
     */
    add_type_args( ...typeArgs )
    {
        this.typeArguments = typeArgs.slice();
    }

    toString()
    {
        const ta = this.typeArguments.length ? `<${this.typeArguments.map( t => t.name || t ).join( ', ' )}>` : '';

        return `${this.ref}${ta}`;
    }
}

register( TypeReference );
