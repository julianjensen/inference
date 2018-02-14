/** ******************************************************************************************************************
 * @file All declarations, as soon as I figure out how it all works.
 *
 * ```
 * function xyz() {}
 * // xyz.constructor is `Function`
 * // Now xyz.prototype has one property: constructor
 * // xyz.prototype.constructor is the function `xyz`
 * xyz.prototype.abc = "abc";
 *
 * xyz() // calls the function: xyz.prototype.constructor()
 *
 * const a = new xyz(); // xyz.constructor( xyz.prototype ).constructor()
 * ```
 *
 * For new:
 * 1. this = Object.create( xyz.prototype )
 * 2. return this.constructor() || this
 *
 * `Function` is the boxed version of `function() {}`
 *      * `length: number`
 *      * `name: string`
 *      * `prototype: function`
 *
 * `Function.prototype`
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
 * `function() {}` a function instance
 *      * `length`: `number`
 *      * `name`: `string`
 *      * `arguments`: `object`
 *      * `caller`: `object`
 *      * `prototype`: `object`
 *
 * `class {}`
 *      * `length: number`
 *      * `prototype: function`
 *
 * `class xyz {}`:
 *      * `length: number`
 *      * `name: string`
 *      * `prototype: function`
 *
 * `method() {}`
 * Missing `arguments`, `caller`, and `prototype`. The `constructor` is `Function`
 *      * `length`: `number`
 *      * `name`: `string`
 *
 *
 * `Object`:
 * `{}.constructor` is the same as this. This is `interface ObjectConstructor` in the ts definition file.
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
 *
 * `Object.prototype`:
 * This is the `interface Object` in the ts definition file and `{}.constructor.prototype` === `Object.prototype`.
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
 * @author Julian Jensen <jjdanois@gmail.com>
 * @since 1.0.0
 * @date 03-Feb-2018
 *********************************************************************************************************************/

import { ClassType, FunctionType, ObjectType, ArrayType } from "./symbol-table";
import { array, string } from "convenience";

export const primitives = new Map();

const
    is_primitive = str => [ 'null', 'undefined', 'string', 'number', 'boolean', 'symbol', 'any' ].includes( str );

/**
 * @param {Type} type
 * @param {string|Type} check
 */
export function is_a( type, check )
{
    return string( check ) ? type.is_a( check ) : check instanceof type;
}

/**
 * @param {string} typeName
 * @return {*}
 */
export function get_type( typeName )
{
    switch ( typeName.replace( /\s+/g, '' ).toLowerCase() )
    {
        case 'class{}':
        case 'class':       return ClassType;

        case '()':
        case 'function':
        case 'function()':
        case '(){}':       return FunctionType;

        case '{}':
        case 'object':      return ObjectType;

        case 'arraytype':
        case '[]':
        case 'array':       return ArrayType;

        case 'nullkeyword':
        case 'null':
        case null:          return primitives.get( 'null' );

        case 'voidkeyword':
        case 'undefinedkeyword':
        case 'undefined':
        case undefined:     return primitives.get( 'undefined' );

        case '""':
        case "''":
        case "``":
        case 'string':      return primitives.get( 'string' );

        case 'numberkeyword':
        case 'number':      return primitives.get( 'number' );

        case 'booleankeyword':
        case 'boolean':     return primitives.get( 'boolean' );

        case 'symbol':      return primitives.get( 'symbol' );

        case 'anykeyword':
        case 'any':
        case '*':           return primitives.get( 'any' );
    }
}

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
        if ( !string( typeString ) ) typeString = typeString.name.toLowerCase();

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

primitives.set( 'null', new Null() );
primitives.set( 'undefined', new Undefined() );
primitives.set( 'string', new StringType() );
primitives.set( 'number', new NumberType() );
primitives.set( 'boolean', new BooleanType() );
primitives.set( 'symbol', new SymbolType() );
primitives.set( 'any', new Any() );

/**
 * @typedef {ObjectType|ArrayType|FunctionType|Null|Undefined|StringType|NumberType|BooleanType|SymbolType|Any} BaseType
 */

/**
 * @class
 */
export class Variable
{
    /**
     * @param {string} name
     * @param {?(ObjectType|ArrayType|FunctionType|ClassType|Type|Instance)} [value]
     */
    constructor( name, value )
    {
        this.name = name;
        this.value = value;
        this.parent = null;
    }
}

// function type_dump( obj )
// {
//     const
//         has = ( o, n ) => !!o && Reflect.has( o, n ),
//
//         toName = o => ( has( o, 'name' ) ? `"${o.name}"`  : '-' ) + ` (${typeof o})`,
//
//         name = toName( obj ),
//         cname = has( obj, 'constructor' ) ? toName( obj.constructor ) : '-',
//         pcname = has( obj, 'prototype' ) && has( obj.prototype, 'constructor' ) ? toName( obj.prototype.constructor ) : '-',
//
//         _proto = !!obj && Object.getPrototypeOf( obj ),
//         protoName = _proto && toName( _proto ),
//         cProtoName = _proto && has( _proto, 'constructor' ) ? toName( _proto.constructor ) : '-',
//         pcProtoName = _proto && has( _proto, 'prototype' ) && has( _proto.prototype, 'constructor' ) ? toName( _proto.prototype.constructor ) : '-',
//
//         descs = !!obj ? Object.getOwnPropertyDescriptors( obj ) : [],
//         syms = !!obj ? Object.getOwnPropertySymbols( obj ) : [],
//         names = [ 'name: ' + name, 'constr. name: ' + cname, 'proto.constr. name: ' + pcname,
//                   'get prototype:',
//                   'proto.name: ' + protoName, 'proto.constr. name: ' + cProtoName, 'proto.proto.constr. name: ' + pcProtoName,
//                   '\n',
//                   'own names: [ ' + ( !!obj ? Reflect.ownKeys( obj ).map( t => typeof t === 'symbol' ? t.toString() : '' + t ).sort().join( ', ' ) : '' ) + ' ]',
//                   '\n',
//                   'Own props:',
//                   '\n'
//                 ]. join( '\n' );
//
//     let output = [];
//
//     for ( const [ key, desc ] of Object.entries( descs ) )
//     {
//         if ( has( desc, 'value' ) )
//             output.push( ` *      * \`${key}\`: \`${typeof desc.value}\`` );
//         else
//             output.push( ` *      * \`${key}\`: \`get\` -> \`${typeof desc.get}\`, \`set\` -> \`${typeof desc.set}\`` );
//
//     }
//
//     for ( const key of syms )
//         output.push( ` *      * \`${key.toString()}\`` );
//
//     console.log( `\n----------------\n${names}` + output.join( '\n' ) + `\n----------------` );
// }
//
