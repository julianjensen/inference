/** ******************************************************************************************************************
 * @file Describe what object does.
 * @author Julian Jensen <jjdanois@gmail.com>
 * @since 1.0.0
 * @date 17-Feb-2018
 *********************************************************************************************************************/
"use strict";

import { string }            from "convenience";
import { baseTypes }         from "./globals";

/**
 * O = {
 *      [ declarations ],
 *      prototype: O
 * }
 *
 * O.[[prototype]] = {
 *      [ declarations ],
 *      constructor: [[Function]]
 * }
 *
 * @class
 */
class O
{

}


/**
 * {}.*
 *      <empty>
 *
 * {}.prototype
 *      undefined
 *
 * {}.constructor
 *      Object.*
 *
 * {}.constructor.prototype
 *      Object.prototype.*
 *
 * {}.* = {}.* => {} => Object.prototype.*
 *
 * Object.constructor = Function
 *
 * class Object
 * {
 *      static constructor = Function
 *
 *      constructor = Object
 *
 *      hasOwnProperty( name )
 *      {}
 *
 *      static assign()
 *      {}
 *
 *      static seal()
 *      {}
 *
 *      //...
 * }
 *
 * class Object extends Function {}
 * class Function extends Object {}
 *
 * Object instance {}
 * {}
 * {}.prototype is undefined, doesn't exist
 * // Circular here:
 * {}.constructor => Object
 * {}.constructor.prototype => Object.prototype
 * {}.constructor.prototype.constructor => Object
 *
 * getPrototypeOf( {} ) => Object.prototype => null
 * or
 * {}.__proto__ => Object.prototype
 * Object.prototype.__proto__ => null
 *
 * {}.__proto__.__proto__ => null
 *
 * new Object()
 * {}.x = { x: ... } => Object.prototype.x
 *
 * Function.x = { x: ... } => Function.prototype.x => Object.prototype.x
 *
 * Object methods on Object.prototype
 *
 *      * `constructor`: `function`
 *      * `__defineGetter__`: `function`
 *      * `__defineSetter__`: `function`
 *      * `hasOwnProperty`: `function`
 *      * `__lookupGetter__`: `function`
 *      * `__lookupSetter__`: `function`
 *      * `isPrototypeOf`: `function`
 *      * `propertyIsEnumerable`: `function`
 *      * `toString`: `function`
 *      * `valueOf`: `function`
 *      * `__proto__`: `get` -> `function`, `set` -> `function`
 *      * `toLocaleString`: `function`
 *
 * Object static methods on Object.*
 *
 *      * `length`: `number`
 *      * `name`: `string`
 *      * `prototype`: `object`
 *      * `assign`: `function`
 *      * `getOwnPropertyDescriptor`: `function`
 *      * `getOwnPropertyDescriptors`: `function`
 *      * `getOwnPropertyNames`: `function`
 *      * `getOwnPropertySymbols`: `function`
 *      * `is`: `function`
 *      * `preventExtensions`: `function`
 *      * `seal`: `function`
 *      * `create`: `function`
 *      * `defineProperties`: `function`
 *      * `defineProperty`: `function`
 *      * `freeze`: `function`
 *      * `getPrototypeOf`: `function`
 *      * `setPrototypeOf`: `function`
 *      * `isExtensible`: `function`
 *      * `isFrozen`: `function`
 *      * `isSealed`: `function`
 *      * `keys`: `function`
 *      * `entries`: `function`
 *      * `values`: `function`
 *
 * These are the static members of the Object class and are only accessible by direct access, i.e. `Object.assign()`
 *
 * @class
 */
export class Object_     // class Object prototype methods   => instance prototype members
{
    /**
     * @param {?Scope} [scoped]
     */
    constructor( scoped = null )
    {
        this.name = 'Object';
        this.staticMembers = new Map();   // Static members, accessible as Type.name (Type being Object, Array, or Function, or whatever class/function/object subtype)
        this.prototypeMembers = new Map();   // The is what goes on the prototype chain.
        this.proto = 'Function_';
        this.typeParameters = null;
        this.scope = scoped;

    }

    /**
     * @param {BaseType[]} [types]
     * @return {Instance}
     */
    make_instance( ...types )
    {
        return Object_._add_types( new Instance( this.prototypeMembers, null, Object_, this.typeParameters ), ...types );
    }

    /**
     * @param {Instance} inst
     * @param {BaseType[]} types
     * @return {Instance}
     * @protected
     */
    static _add_types( inst, ...types )
    {
        if ( types.length ) inst.materialize( ...types );

        return inst;
    }

    /**
     * @param {string} name
     * @param {BaseType|Object_} type
     * @param {boolean} [isStatic]
     * @return {Object_}
     */
    add_prop( name, type, isStatic = false )
    {
        if ( isStatic ) return this.add_static_prop( name, type );
        this.prototypeMembers.set( name, type );
        return this;
    }

    /**
     * @param {string} name
     * @param {BaseType|Object_} type
     * @return {Object_}
     */
    add_static_prop( name, type )
    {
        this.staticMembers.set( name, type );
        return this;
    }

    /**
     * @param {string} propName
     * @return {* | undefined}
     */
    get( propName )
    {
        if ( this.staticMembers.has( propName ) )
            return this.staticMembers.get( propName );

        return this.get_from_prototype( propName );
    }

    /**
     * @param {string} propName
     * @return {?BaseType}
     */
    get_from_prototype( propName )
    {
        if ( this.prototypeMembers.has( propName ) )
            return this.prototypeMembers.get( propName );

        return null;
    }
}


/**
 * @class
 */
export class ObjectType extends Object_
{
    /**
     * @param {string} name
     */
    constructor( name )
    {
        super();
        this.name = name;
        this.proto = baseTypes.object;
        this.usedAs = 'object';
    }

    use_as( spec )
    {
        if ( !string( spec ) )
            throw new TypeError( `Object use specifier must be a string, received a "${typeof spec}"` );

        if ( ![ 'object', 'module', 'namespace' ].includes( spec ) )
            throw new TypeError( `Object use specifier was invalid, received "${spec}"` );

        this.usedAs = spec;
        if ( spec !== 'object' )
            this.proto = null;
        else
            this.proto = baseTypes.object;
    }
}

