/** ******************************************************************************************************************
 * @file Describe what type does.
 * @author Julian Jensen <jjdanois@gmail.com>
 * @since 1.0.0
 * @date 27-Jan-2018
 *********************************************************************************************************************/
"use strict";

import { TypeFlags } from "./types";
import { BaseType } from "./base-type";

/**
 * @class
 */
export class Type
{
    /**
     * @param {BaseType} [type]
     */
    constructor( type )
    {
        /** @type {BaseType} */
        this.type = type || null;
        /** @type {Array<BaseType>} */
        this.types = [];
        /** @type {TypeFlags} */
        this.flags = TypeFlags.NONE;
    }

    _basetype( bt )
    {
        if ( this.type ) return this.type.is( bt );

        return this.types.some( t => t.is( bt ) );
    }

    /**
     * @param {BaseType|Type|string} type
     * @return {boolean}
     */
    is( type )
    {
        if ( type instanceof BaseType || typeof type === 'string' )
        {
            return this._basetype( type );
        }
        else if ( type.type ) return this._basetype( type.type );

        return type.type.some( bt => this._basetype( bt ) );
    }

    get isCallable()
    {
        return this.flags & TypeFlags.FUNCTION;
    }

    add( type )
    {
        if ( this.is( type ) ) return this;

        const typed = new BaseType( type );

        this.types.push( typed );

        if ( typed.is( 'function' ) )
        {
            this.flags |= TypeFlags.CALLABLE;
        }
    }
}

/**
 * @param {string} what
 * @return {Type}
 */
export function create( what )
{
    let v;

    switch ( what )
    {
        case 'function':
            v = new Type( new BaseType( function() {} ) );
            v.flags |= TypeFlags.CALLABLE;
            break;

        case 'class':
            v = new Type( new BaseType( function() {} ) );
            v.flags |= TypeFlags.CALLABLE + TypeFlags.CLASS;
            break;
    }

    return v;
}

