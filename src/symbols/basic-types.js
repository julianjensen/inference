/** ****************************************************************************************************
 * File: basic-types (jsdoc-tag-parser)
 * @author julian on 2/16/18
 * @version 1.0.0
 * @copyright Planet3, Inc.
 *******************************************************************************************************/
'use strict';

import { array, string, has } from 'convenience';

export const is_primitive = str => [ 'null', 'undefined', 'string', 'number', 'boolean', 'symbol', 'any' ].includes( str );

/**
 * Possible types:
 * any, null, undefined, string, number, boolean, symbol, GenericType
 *
 * Extended types based on Object:
 * Object (object, {}), Array (array, []), Function (function)
 *
 *
 * @param {string|Array<string>} name
 * @class
 */
export class Type
{
    /**
     * @param {string|Array<string>} name
     */
    constructor( name )
    {
        if ( array( name ) )
        {
            this.name = name[ 0 ];
            this.aliases = new Set( name.slice( 1 ) );
        }
        else
        {
            this.name = name;
            this.aliases = null;
        }

        const lcn = name.toLowerCase();

        this.isPrimitive = is_primitive( lcn );
        this.boxable =  lcn !== 'undefined' && lcn !== 'null' && lcn !== 'any' && this.isPrimitive;
        this.boxedAs = null;
    }

    /**
     * @param {string|BaseType} typeString
     * @return {boolean}
     */
    is_a( typeString )
    {
        if ( !string( typeString ) )
        {
            if ( typeString instanceof Type )
                typeString = typeString.name.toLowerCase();
            else if ( has( typeString, 'is_a' ) && typeof typeString.is_a === 'function' )
                return typeString.is_a( this );
        }

        return typeString === this.name || ( this.aliases && this.aliases.includes( typeString ) );
    }

    /**
     * @return {Type}
     */
    make_instance()
    {
        return this;
    }

    /**
     * @return {string}
     */
    toString()
    {
        return this.name;
    }
}

/**
 * @class
 */
export class Any extends Type
{
    /** */
    constructor()
    {
        super( 'any' );
    }
}


/**
 * @class
 */
export class Null extends Type
{
    /** */
    constructor()
    {
        super( 'null' );
    }
}

/**
 * @class
 */
export class Undefined extends Type
{
    /** */
    constructor()
    {
        super( 'undefined' );
        this.asVoid = false;
    }

    as_void()
    {
        this.asVoid = true;
        return this;
    }

    /**
     * @return {string}
     */
    toString()
    {
        return this.asVoid ? 'void' : 'undefined';
    }
}

/**
 * @class
 */
export class StringType extends Type
{
    /** */
    constructor()
    {
        super( 'string' );
        this.boxedAs = null;
    }
}

/**
 * @class
 */
export class NumberType extends Type
{
    /** */
    constructor()
    {
        super( 'number' );
        this.boxedAs = null;
    }
}

/**
 * @class
 */
export class BooleanType extends Type
{
    /** */
    constructor()
    {
        super( 'boolean' );
        this.boxedAs = null;
    }
}

/**
 * @class
 */
export class SymbolType extends Type
{
    /** */
    constructor()
    {
        super( 'symbol' );
        this.boxedAs = null;
    }
}
