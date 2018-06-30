/** ****************************************************************************
 * DESCRIPTION
 * @author julian.jensen
 * @since 0.0.1
 *******************************************************************************/
"use strict";

import { mix } from 'mixwith';
import { Type } from '../tdd/type-base';
import { TypeAlias } from "./abstract-type";
import { Identifier } from "../tdd/identifier";
import { type } from 'typeofs';

const
    string = o => type( o ) === 'string',
    _has   = o => n => ( {}.hasOwnProperty.call( o, n ) ),
    hasStr = o => {
        const has = _has( o );
        return ( ...keys ) => keys.every( k => has( k ) && string( o[ k ] ) );
    };

/**
 * @param {Type} t
 * @return {Type}
 */
function throwUnlessType( t )
{
    if ( t instanceof Type ) return t;

    throw new ReferenceError( `${t.constructor.name} does not resolve to a valid type` );
}

/**
 * @param {Type} t
 * @return {Type}
 */
function toType( t )
{
    if ( t instanceof TypeReference )
        return throwUnlessType( t.resolvesTo );
    else if ( t instanceof TypeAlias )
        return throwUnlessType( t.resolvesTo );
}

/**
 * @class TypeArgument
 * @extends Type
 */
export class TypeArgument extends mix( Type )
{

}

/**
 * @class TypeParameter
 * @extends Type
 */
export class TypeParameter extends mix( Type )
{
    constraint = null;
    keyOf = false;
    resolvesTo = null;

    /**
     * @param {TypeReference|Type} typeRef
     * @return {TypeParameter}
     */
    resolve( typeRef )
    {
        // @todo check constraint here

        if ( !this.constraint || this.is( this.constraint ) )
        {
            const inst = new TypeParameter();
            inst.resolvesTo = toType( typeRef );
            return inst;
        }

        throw new TypeError( `${typeRef.constructor.name} does not fit constraints of ${this.constructor.name}` );
    }
}


export function define_type_parameter( def )
{
    const check = hasStr( def );

    if ( check( 'typeName', 'name' ) && def.typeName === def.name )
        return new Identifier( def.name, new TypeParameter() );
    else if ( check( 'name', 'typeName', 'typeOperator' ) )
    {
        const tp = new TypeParameter();

        tp.constraint = new TypeReference();
        tp.constraint.typeName = def.typeName;

        return new Identifier( def.name, tp );
    }
    else if ( check( 'name', 'typeName', 'typeOperator', 'keyOf' ) )
    {
        const tp = new TypeParameter();

        tp.constraint = new TypeReference();
        tp.constraint.typeName = def.typeName;
        tp.keyOf = true;

        return new Identifier( def.name, tp );
    }
}


/**
 * @class Literal
 * @extends Type
 */
export class Literal extends mix( Type )
{

}

/**
 * @class TypeReference
 * @extends Type
 * @implements {TypeArguments}
 */
export class TypeReference extends mix( Type ).with( TypeArguments )
{
    resolvesTo = null;
    typeName = null;
}

/**
 * @class GenericType
 */
export class GenericType
{
    /** @type {Array<TypeParameter>} */
    typeParameters = [];

    /**
     * @return {number}
     */
    hasTypeParameters()
    {
        return this.typeParameters.length;
    }

    /**
     * @param {...(Type|TypeReference)} refTypes
     */
    instantiate( ...refTypes )
    {

    }

    add_type_parameter( def )
    {
        this.typeParameters.push( define_type_parameter( def ) );
    }
}

/**
 * @typedef {object} TypeVariableArgument
 * @property {string} name
 * @property {?Type} [reference]
 */

/**
 * @class TypeArguments
 * @interface
 */
export class TypeArguments
{
    /** @type {Array<TypeVariableArgument>} */
    typeArguments = [];
}
