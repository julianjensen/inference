/** ****************************************************************************
 * DESCRIPTION
 * @author julian.jensen
 * @since 0.0.1
 *******************************************************************************/
"use strict";

import { Type } from "./basic-type";
import { TypeAlias } from "./abstract-type";
import { type } from 'typeofs';

const
    string = o => type( o ) === 'string',
    _has   = o => n => ( {}.hasOwnProperty.call( o, n ) ),
    hasStr = o => {
        const has = _has( o );
        return ( ...keys ) => keys.every( k => has( k ) && ( string( o[ k ] ) || typeof o[ k ] === 'boolean' ) );
    },
    hasKeyType = ( o, name, optType ) => _has( o )( name ) && ( !optType || type( o[ name ] ) === optType ),
    hasOneKeyType = ( o, name, optType ) => Object.keys( o ).length === 1 && hasKeyType( o, name, optType ),
    hasTwoKeyType = ( o, n1, t1, n2, t2 ) => Object.keys( o ).length === 2 && hasKeyType( o , n1, t1 ) && hasKeyType( o , n2, t2 );


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
export class TypeArgument extends Type
{
    name = null;
    indexType = null;

    parse( def ) {
        if ( hasTwoKeyType( def, 'type', 'string', 'typeName', 'object' ) )
        {
            if ( def.type === 'reference' )
                this.name = def.typeName.name;
        }
        else if ( hasTwoKeyType( def, 'typeName', 'string', 'indexType', 'object' ) )
        {
            this.name = def.typeName;
            this.indexType = def.indexType.typeName;
        }
        else if ( hasOneKeyType( def, 'typeName', 'string' ) )
            this.name = def.typeName;

        return this;
    }

    toString()
    {
        return `${this.name}${this.indexType ? `[${this.indexType}]` : ''}`;
    }
}

/**
 * @class TypeParameter
 * @extends Type
 */
export class TypeParameter extends Type
{
    constraint = null;
    keyOf      = false;
    resolvesTo = null;
    name       = null;

    stringify( name )
    {
        if ( !name ) return this.toString();

        if ( !this.constraint )
            return name;
        else if ( this.keyOf )
            return `${name} in keyof ${this.constraint}`;
        else
            return `${name} extends ${this.constraint}`;
    }

    toString()
    {
        if ( !this.constraint )
            return this.name;
        else if ( this.keyOf )
            return `${this.name} in keyof ${this.constraint}`;
        else
            return `${this.name} extends ${this.constraint}`;
    }

    /**
     * @param {TypeReference|Type} typeRef
     * @return {TypeParameter}
     */
    resolve( typeRef )
    {
        // @todo check constraint here

        if ( !this.constraint || this.is( this.constraint ) )
        {
            const inst      = new TypeParameter();
            inst.resolvesTo = toType( typeRef );
            return inst;
        }

        throw new TypeError( `${typeRef.constructor.name} does not fit constraints of ${this.constructor.name}` );
    }
}

/**
 * @param {object} def
 * @return {TypeParameter}
 */
export function define_type_parameter( def )
{
    const check = hasStr( def );

    if ( check( 'name', 'typeName', 'typeOperator', 'keyOf' ) )
    {
        const tp = new TypeParameter();

        tp.constraint          = new TypeReference();
        tp.constraint.typeName = def.typeName;
        tp.keyOf               = true;
        tp.name = def.name;

        return tp;
        // return new Identifier( def.name, tp );
    }
    else if ( check( 'name', 'typeName', 'typeOperator' ) )
    {
        const tp = new TypeParameter();

        tp.constraint          = new TypeReference();
        tp.constraint.typeName = def.typeName;
        tp.name = def.name;

        return tp;
    }
    else if ( check( 'typeName', 'name' ) && def.typeName === def.name )
    {
        const tp = new TypeParameter();

        tp.name = def.name;

        return tp;
    }
    // return new Identifier( def.name, new TypeParameter() );

}


/**
 * @class Literal
 * @extends Type
 */
export class Literal extends Type
{

}

/**
 * @typedef {object} TypeVariableArgument
 * @property {string} name
 * @property {?Type} [reference]
 */

/**
 * @class TypeArguments
 */
export class TypeArguments
{
    /** @type {Array<TypeVariableArgument>} */
    typeArguments = [];

    toString()
    {
        return this.typeArguments.length ? '<' + this.typeArguments.map( ta => `${ta}` ).join( ', ' ) + '>' : '';
    }
}

/**
 * @class TypeReference
 * @extends Type
 */
export class TypeReference extends Type
{
    resolvesTo    = null;
    typeName      = null;
    typeArguments = new TypeArguments();

    add_type_arguments( typeArgs )
    {
        this.typeArguments.typeArguments = typeArgs;
    }

    toString()
    {
        return ( typeof this.typeName === 'string' ? `${this.typeName}` : this.typeName.name ) + this.typeArguments;
    }
}


