/* eslint-disable no-useless-constructor */
/** ****************************************************************************************************
 * File: playtime (jsdoc-tag-parser)
 * @author julian on 2/9/18
 * @version 1.0.0
 * @copyright Planet3, Inc.
 *******************************************************************************************************/
'use strict';

/**
 * ONLY ONE OF THESE
 */
class Object extends Function
{
    /**
     * TS constructors, overloaded
     */
    constructor()
    {
        super();
        // Like all constructed things, it is an empty object `{}` with a single
        // member: `constructor`
        // Also: `constructor.prototype` points back to class that constructed object
    }

    /**
     * On ObjectConstructor which means static, not inherited by object-based types
     * In other words, doesn't exist on any instance.
     * @param args
     */
    static assign( ...args )
    {

    }

    static create( proto, constr )
    {

    }

    static keys( obj )
    {

    }

    /**
     * Dynamic property, every instance has one of these
     * @param name
     */
    hasOwnProperty( name )
    {

    }
}

/**
 * ONLY ONE OF THESE
 */
class Function extends Object
{
    /**
     *
     */
    constructor()
    {
        super();
    }
}

/**
 * @class
 */
class Map extends Function
{
    /**
     *
     */
    constructor()
    {
        super();
    }
}

