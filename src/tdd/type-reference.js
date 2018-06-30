/** ****************************************************************************
 * DESCRIPTION
 * @author julian.jensen
 * @since 0.0.1
 *******************************************************************************/
"use strict";

import { Type } from "./type-base";
import { definition, register } from "./cross-ref";

let Undef;

/** */
export class TypeParameter extends Type
{
    /**
     * @param {string} name
     * @param {Type} [target=null]
     * @param {Scope} [scope]
     */
    constructor( name, target = null, scope )
    {
        super( name, scope );

        this.keyOf = false;
        this.constraint = target;
    }
}

/** */
export class TypeReference extends Type
{
    /**
     * @param {string} name
     * @param {Type} [target=null]
     * @param {Scope} [scope]
     */
    constructor( name, target = null, scope )
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

        return this;
    }

    /**
     * @param {...(string|Type)} typeArgs
     */
    add_type_args( ...typeArgs )
    {
        this.typeArguments = typeArgs.slice();

        return this;
    }

    toString()
    {
        const ta = this.typeArguments.length ? `<${this.typeArguments.map( t => t.name || t ).join( ', ' )}>` : '';

        return `${this.name || this.ref}${ta}`;
    }
}

register( TypeReference );
register( TypeParameter );
