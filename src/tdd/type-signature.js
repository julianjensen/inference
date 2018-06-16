/** ****************************************************************************
 * DESCRIPTION
 * @author julian.jensen
 * @since 0.0.1
 *******************************************************************************/
"use strict";

import { Type } from "./type-base";
import { register } from "./cross-ref";

const
    number = n => typeof n === 'number' && n === n;

/** */
export class CallableType extends Type
{
    constructor( name, scope )
    {
        super( name, scope );

        /** @type {Array<Signature>} */
        this.signatures = [];
        this.parent = null;
        this.isConstructor = false;
        this.isCallable = false;
        this.isMethod = false;
    }

    toString()
    {
        const prefix = this.isConstructor ? 'new' : this.isCallable ? '' : this.name;

        return this.signatures.map( t => `${prefix}${t}` ).join( ';\n' );
    }

    /**
     * @param {Signature} sig
     */
    add_signature( sig )
    {
        if ( !this.signatures.includes( sig ) ) this.signatures.push( sig );
    }

    /** @type {number} */
    get size()
    {
        return this.signatures.length;
    }

    /** @type {number} */
    get length()
    {
        return this.size;
    }

    /**
     * @param {number} index
     * @return {Signature}
     */
    get( index = 0 )
    {
        return index < 0 ? this.get( this.signatures.length + index ) : index < this.signatures.length ? this.signatures[ index ] : void 0;
    }
}

/** */
export class Signature extends Type
{
    /**
     * @param {string} [name]
     * @param {Scope} [scope]
     */
    constructor( name, scope )
    {
        super( name, scope );
        /** @type {Array<Identifier>} */
        this.parameters = [];
        this.typeParameters = [];
        this.type = null;
        this.pnames = {};
        this.parent = null;
    }

    toString()
    {
        const tp = this.typeParameters.length ? `<${this.typeParameters.map( t => `${t}` ).join( ', ' )}>` : '';

        return tp + ( this.parameters.length ? `( ${this.parameters.map( t => `${t}` ).join( ', ' )} )` : `()` ) + ': ' + `${this.type}`;
    }

    /**
     * @param {...(string|Type)} typeArgs
     * @return {Signature}
     */
    add_type_parameters( ...typeArgs )
    {
        this.typeParameters = this.typeParameters.concat( typeArgs );

        return this;
    }

    /**
     * @param {string} name
     * @param {Identifier} sym
     * @return {Signature}
     */
    add_parameter( name, sym )
    {
        this.pnames[ name ] = this.parameters.length;
        this.pnames[ this.parameters.length ] = name;
        this.parameters.push( sym );

        return this;
    }

    /**
     * @param {number|string} nameOrIndex
     * @return {Identifier}
     */
    param_by( nameOrIndex )
    {
        if ( number( nameOrIndex ) )
            return this.parameters[ nameOrIndex ];

        return this.parameters[ this.pnames[ nameOrIndex ] ];
    }

    /**
     * @param {Type} type
     * @return {Signature}
     */
    add_type( type )
    {
        this.type = type;

        return this;
    }
}

register( CallableType, Signature );
