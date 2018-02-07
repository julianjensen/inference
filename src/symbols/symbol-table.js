/** ******************************************************************************************************************
 * @file Describe what symbol-table does.
 * @author Julian Jensen <jjdanois@gmail.com>
 * @since 1.0.0
 * @date 04-Feb-2018
 *********************************************************************************************************************/

"use strict";

import { TypeParameter } from "./generics";

/**
 * @class
 */
export class Instance
{
    /**
     * @param {Map<string, *>} members
     * @param {?Instance} proto
     * @param {object<string, BaseType|Array<BaseType>>} [types]
     */
    constructor( members, proto, types )
    {
        this.members = members;
        this.proto = proto;
        this.types = types;
    }

    /**
     * @param {string} propName
     * @return {* | undefined}
     */
    get( propName )
    {
        if ( propName === '__proto__' )
            return this.proto;

        return this.members.get( propName );
    }

    /**
     * @return {*}
     * @protected
     */
    _prototype()
    {
        return this.proto;
    }
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
    /** */
    constructor()
    {
        this.name = 'Object';
        this.staticMembers = new Map();   // Static members, accessible as Type.name (Type being Object, Array, or Function, or whatever class/function/object subtype)
        this.prototypeMembers = new Map();   // The is what goes on the prototype chain.
        this.proto = 'Function_';
    }

    /**
     * @return {Instance}
     */
    make_instance()
    {
        return new Instance( this.prototypeMembers, null );
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
        return this.staticMembers.get( propName );
    }
}


/**
 * The function prototype
 *      * `length`: `number`
 *      * `name`: `string`
 *      * `arguments`: `undefined`
 *      * `caller`: `undefined`
 *      * `constructor`: `function`
 *      * `apply`: `function`
 *      * `bind`: `function`
 *      * `call`: `function`
 *      * `toString`: `function`
 *      * `Symbol.hasInstance`
 *
 * @class
 */
export class Function_ extends Object_
{
    /** */
    constructor()
    {
        super();
        this.name = 'Function';
        this.proto = 'Object_';
    }

    /**
     * @return {Instance}
     */
    make_instance()
    {
        return new Instance( this.prototypeMembers, new Object_().make_instance() );
    }

    /**
     * @param {string} propName
     * @return {* | undefined}
     */
    get( propName )
    {
        return this.staticMembers.get( propName );
    }
}

/**
 * @class
 */
export class Array_ extends Object_
{
    /** */
    constructor()
    {
        super();
        this.name = 'Array';
        this.proto = 'Function_';
        this.typeParameters = new TypeParameter( 'T' );
    }

    /**
     * @param {BaseType} [type]
     * @return {Instance}
     */
    make_instance( type )
    {
        this.typeParameters.materialize( {}, type );
        return new Instance( this.prototypeMembers, new Object_().make_instance() );
    }
}

/**
 * @class
 */
export class ClassType extends Function_
{
    /**
     * @param {string} name
     */
    constructor( name )
    {
        super();
        this.name = name;
        this.proto = baseTypes.Function;
        this.typeParameters = [];
        this.parameters = [];
    }
}

/**
 * @class
 */
export class FunctionType extends Function_
{
    /**
     * @param {string} name
     */
    constructor( name )
    {
        super();
        this.name = name;
        this.proto = baseTypes.Function;
        this.typeParameters = [];
        this.returns = null;
        this.parameters = [];
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
        this.proto = baseTypes.Object;
        this.typeParameters = [];
    }
}

/**
 * @param {string} type
 * @param {string} name
 * @return {Object_}
 */
export function declare( type, name )
{
    switch ( type )
    {
        case 'interface':
        case 'class':       return new ClassType( name );

        case 'function':    return new FunctionType( name );

        case 'namespace':
        case 'object':      return new ObjectType( name );
    }
}

/**
 * @class
 */
export class SymbolTable
{
    /**
     * @param {SymbolTable} [parent]
     */
    constructor( parent = null )
    {
        this.members = new Map();
        this.parent = parent;
    }

    /**
     * @param {string} name
     * @param {BaseType} type
     * @return {SymbolTable}
     */
    declaration( name, type )
    {
        this.members.set( name, type );
        return this;
    }

    /**
     * @param {string} name
     * @param {Instance} inst
     * @return {SymbolTable}
     */
    define( name, inst )
    {
        this.members.set( name, inst );
        return this;
    }

    /**
     * @param {string} name
     * @return {BaseType}
     */
    get( name )
    {
        if ( this.members.has( name ) ) return this.members.get( name );
        return this.parent ? this.parent.get( name ) : null;
    }
}

export const baseTypes = {
    object: new Object_(),
    array: new Array_(),
    function: new Function_(),
    Instance
};

baseTypes.Array = baseTypes.array;
baseTypes[ '[]' ] = baseTypes.array;
baseTypes.Object = baseTypes.object;
baseTypes[ '{}' ] = baseTypes.object;
baseTypes.Function = baseTypes.function;
baseTypes[ '(){}' ] = baseTypes.function;

