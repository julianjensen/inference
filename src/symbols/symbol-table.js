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
"use strict";

import { TypeFlags }                   from "../types";
import { string, array, object } from "convenience";
import { globals, baseTypes, add_base_type, add } from "../symbols/globals";

export const primitives = new Map();
add( 'primitives', primitives );

const
    /**
     * @enum
     */
    Match = {
        NO: 0,
        UNLIKELY: 1,
        MAYBE: 2,
        PROBABLY: 3,
        YES: 4
    };

const
    additionalTypes = new Map();

const
    toArray = o => o === null || o === void 0 ? [] : array( o ) ? o : [ o ],

    forTypes = fn => types => toArray( types ).forEach( fn ),
    filterTypes = fn => types => toArray( types ).filter( fn ),
    mapTypes = fn => types => toArray( types ).map( fn ),
    findTypes = fn => types => toArray( types ).find( fn ),
    someTypes = fn => types => toArray( types ).some( fn ),
    allTypes = fn => types => toArray( types ).every( fn ),

    get_all_constructors = filterTypes( t => t.is_instance_of( 'Function' ) && t.get_parent( 'Function' ).declType === 'constructor' ),
    is_constructable = someTypes( t => t.is_instance_of( 'Function' ) && t.get_parent( 'Function' ).declType === 'constructor' ),
    get_all_callables = filterTypes( t => t.is_instance_of( 'Function' ) && t.get_parent( 'Function' ).declType !== 'constructor' ),
    is_callable = someTypes( t => t.is_instance_of( 'Function' ) && t.get_parent( 'Function' ).declType !== 'constructor' );

/**
 * @class
 */
class Inst
{
    /**
     * @param {Decl} decl
     * @param {string} declType
     * @param {?Scope} [scope]
     */
    constructor( decl, declType, scope = null )
    {
        this.instanceOf = decl;
        this.members = new Map();
        this.proto = decl.proto;
        this.declType = declType;
        this.scope = scope;
    }

    /**
     * @param {Decl} decl
     * @return {boolean}
     */
    is_instance_of( decl )
    {
        if ( decl === this.instanceOf ) return true;

        return !!this.proto && this.proto.inheritance().includes( decl );
    }

    get_parent( parentName )
    {
        if ( this.instanceOf.name === parentName ) return this;
    }
}

/**
 * @class
 */
class DeclProto
{
    /**
     * @param {Decl} owner
     * @param {DeclProto} [nextProto]
     */
    constructor( owner, nextProto )
    {
        this.protoOf = owner;
        this.members = new Map();
        /** @type {?DeclProto} */
        this.chain = nextProto;
    }

    add_prototype( p )
    {
        this.chain = p;
    }

    /**
     * @returns {Array<Decl>}
     */
    inheritance()
    {
        return this.get_chain( false, this ).map( p => p.protoOf ).filter( p => !!p );
    }

    /**
     * @param {boolean} [excludeSelf=false]
     * @param {?DeclProto} [previous=null]
     */
    get_chain( excludeSelf = false, previous = null )
    {
        const
            protos = excludeSelf ? [] : [ this ];

        return protos.concat( this.chain && this.chain !== previous ? this.chain.get_chain() : [] );
    }

    from_chain( propName, previous = null )
    {
        if ( this.members.has( propName ) )
            return this.members.get( propName );

        if ( this.chain && this.chain !== previous )
            return this.chain.from_chain( propName, this );

        return void 0;
    }
}

/**
 * @class
 */
class Members
{
    /**
     * @param {Decl} decl
     */
    constructor( decl, table )
    {
        this.table = table;
        this.decl = decl;
        this.name = decl.name;
    }

    /**
     * @param {string|Decl|Inst} declSpec
     * @return {boolean}
     */
    is( declSpec )
    {
        if ( typeof declSpec === 'string' )
            return this.name === declSpec;
        else if ( declSpec instanceof Decl )
            return this.decl === declSpec;
        else if ( declSpec instanceof Inst )
            return this.decl === declSpec.instanceOf;
    }
}

/**
 * @class
 */
class Decl
{
    /**
     * @param {string} name
     * @param {BaseType} type
     * @param {?DeclProto} proto
     */
    constructor( name, type, proto )
    {
        this.name = name;
        this.members = new Map();
        this.type = type;
        this.proto = proto && new DeclProto( this, proto );
    }

    /**
     * @return {boolean}
     */
    get_constructors()
    {
        const
            con = this.proto && this.proto.from_chain( 'constructor' );

        if ( con && con.inheritance().includes( 'Function' ) )
        {
            const c = get_all_constructors( con );
            // @todo check parameters here to determine constructor in cases of overloaded funcs.
            return !!c;
        }

        return false;
    }

    /**
     * @param name
     * @return {*}
     */
    get_callables( name )
    {
        const funcs = this.get( name );

        if ( funcs )
        {
            // @todo check params for overloaded variation if applicable
            return get_all_callables( funcs );
        }

        return null;
    }

    is_callable()
    {

    }

    /**
     * @param {string} propName
     * @return {*}
     */
    get( propName )
    {
        if ( this.members.has( propName ) )
            return this.members.get( propName );

        if ( this.proto && this.proto.chain )
            return this.proto.chain.from_chain( propName, this.proto );
    }

    might_be( rough, name, ret, ...params )
    {
        let comps = [];

        if ( name !== this.name ) return Match.NO;

        switch ( rough )
        {
            case 'function':
                if ( !( this.type instanceof FunctionType ) ) return Match.NO;
                if ( ret !== void 0 )
                    comps.push( compare_types( ret, this.type.returns ) );
                if ( params )
                    params

        }
    }

    add( decl )
    {
    }
}

/**
 * @class
 */
class SymbolTable
{
    /**
     * @param {?SymbolTable} [parent=null]
     * @param {?Scope} [scope=null]
     */
    constructor( parent = null, scope = null )
    {
        this.parent = parent;
        this.members = new Map();
        this.membersByName = new Map();
        this.types = new Map();
        this.scope = scope;
    }

    /**
     * @return {SymbolTable}
     */
    get global()
    {
        if ( !this.parent ) return this;
        return this.parent.global;
    }

    /**
     * @param {Decl} decl
     */
    add( decl )
    {
        this.members.set( decl.signature, decl );
        this.membersByName.set( decl.name, decl.signature );
    }

    /**
     * @param type
     */
    add_type( type )
    {
        this.types.set( type.name, type );
    }
}

/**
 * @class
 */
class EnvironmentRecord
{
    /**
     * @param {?EnvironmentRecord} [parent=null]
     */
    constructor( parent = null )
    {

    }
}

EnvironmentRecord.GLOBAL = 'global';

/**
 * @class
 */
class Scope
{
    /**
     * @param {Scope} parent
     * @param {?Decl} type
     */
    constructor( parent, type )
    {
        this.parent = parent;
        this.type = type;
    }


}

/**
 * @class
 */
export class Instance
{
    /**
     * @param {Map<string, *>} members
     * @param {?(Instance|BaseType)} proto
     * @param {BaseType} typeOf
     * @param {GenericTypes} [types]
     * @param {?BaseType} [parent]
     */
    constructor( members, proto, typeOf, types, parent )
    {
        this.members = members;
        this.proto = proto;
        /** @type {BaseType} */
        this.typeOf = typeOf;
        this.types = types;
        this.parent = parent;
        /** @type {TypeFlags} */
        this.flags = TypeFlags.NONE;
    }

    /**
     * @param {string} propName
     * @return {* | undefined}
     */
    get( propName )
    {
        if ( !this.proto && this.typeOf.boxable ) return this.typeOf.boxedAs;
        else if ( !this.proto )
            throw new Error( `Primitive type "${this.typeOf.name}" is not boxable.` );

        if ( propName === '__proto__' )
            return this.proto;

        if ( this.members.has( propName ) ) return this.members.get( propName );

        if ( this.proto ) return this.proto.get( propName );

        return null;
    }

    /**
     * @param {string} propName
     * @return {* | undefined}
     */
    get_own( propName )
    {
        return this.members.get( propName );
    }

    /**
     * @param {string|BaseType} t
     * @return {boolean}
     */
    instance_of( t )
    {
        return this.typeOf.is_a( t );
    }

    /**
     * @param {BaseType[]} types
     * @return {Instance}
     */
    materialize( ...types )
    {
        if ( this.types ) this.types.resolve_types( ...types );
        return this;
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
        this.typeParameters = null;

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
        this.proto = baseTypes.object;
        this.parameters = [];
        this.returns = null;
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
        return this.prototypeMembers.has( propName ) ? this.prototypeMembers.get( propName ) : this.proto ? this.proto.get_from_prototype( propName ) : void 0;
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
        this.proto = baseTypes.function;
        // this.typeParameters = new GenericTypes( new TypeParameter( 'T' ) );
    }

    // /**
    //  * @param {string} propName
    //  * @return {?BaseType}
    //  */
    // get( propName )
    // {
    //     return this.staticMembers.has( propName ) ? this.staticMembers.get( propName ) : this.proto.get( propName );
    // }
}

/**
 * @class
 */
export class ArrayType extends Array_
{
    /**
     * @param {?string} [name]
     * @param {?(BaseType|TypeParameter)} [type]
     */
    constructor( name, type )
    {
        super();
        this.name = name;
        this.elementType = type;
    }

    /**
     * @param {BaseType[]} [types]
     * @return {Instance}
     * @override
     */
    make_instance( ...types )
    {
        return Object_._add_types( new Instance( this.prototypeMembers, new Object_().make_instance(), ArrayType, this.typeParameters ), ...types );
    }

    /**
     * @param {BaseType|String|TypeReference} type
     */
    add_element_type( type )
    {
        if ( !this.elementType )
            this.elementType = type;
        else if ( !array( this.elementType ) )
            this.elementType = [ this.elementType, type ];
        else
            this.elementType.push( type );
    }

    /**
     * @return {string}
     */
    toString()
    {
        return `${this.elementType}[]`;
    }
}

/**
 * @class
 */
export class FunctionType extends Function_
{
    /**
     * @param {?string} [name]
     */
    constructor( name )
    {
        super();
        this.name = name;
        this.proto = baseTypes.function;
        /** @type {?(GenericTypes|TypeParameter|TypeReference|Array<GenericTypes|TypeParameter|TypeReference>)} */
        this.typeParameters = null;
        this.returns = null;
        this.parameters = [];
        this._declType = null;
        this.isType = true;
    }

    /**
     * @param {string} dt
     * @return {string|FunctionType}
     */
    decl_type( dt )
    {
        if ( !dt ) return this._declType;
        this._declType = dt;
        return this;
    }

    /**
     * @param {BaseType[]} [types]
     * @return {Instance}
     * @override
     */
    make_instance( types )
    {
        return Object_._add_types( new Instance( this.prototypeMembers, new Object_().make_instance(), FunctionType, this.typeParameters ), ...types );
    }

    /**
     * @return {string}
     */
    toString()
    {
        const
            retSep = this.returns ? ( this.isType ? ' => ' : ': ' ) : '',
            name = this.name || ( this._declType === 'constructor' ? 'new ' : '' ),
            tp = this.typeParameters ? `<${this.typeParameters.join( ', ' )}>` : '',
            p = this.parameters && this.parameters.length ? `( ${this.parameters.join( ', ' )} )` : '()';

        return `${name}${tp}${p}${retSep}${this.returns || ''}${this.isType || this.declType === 'method' ? '' : ';'}`;
    }
}

/**
 * @class
 */
export class ClassType extends FunctionType
{
    /**
     * @param {string} name
     */
    constructor( name )
    {
        super( name );
        this.isClass = true;
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

/**
 * @class
 */
class TypeAlias
{
    /**
     * @param {string} name
     * @param {?(TypeParameter|TypeParameter[])} typeParams
     * @param {BaseType} [underlying]
     */
    constructor( name, typeParams, underlying )
    {
        this.name = name;
        this.typeParameters = typeParams;
        this.underlying = underlying;
    }

    /**
     * @return {string}
     */
    toString()
    {
        return this.underlying ? this.underlying.toString() : '';
    }
}

/**
 * @param {string} name
 * @param {?(TypeParameter|Array<TypeParameter>)} tp
 * @param {string} kind
 * @return {TypeAlias}
 */
export function create_type_alias( name, tp, kind )
{
    let t;

    switch ( kind )
    {
        case 'function':
            t = new FunctionType( name );
            if ( tp ) t.typeParameters = t;
            break;

        case 'object':
            t = new ObjectType( name );
            if ( tp ) t.typeParameters = tp;
            break;

        case 'array':
            t = new ArrayType( name, tp );
            break;

        case 'typedef':
            break;

        default:
            if ( additionalTypes.has( kind ) )
                t = additionalTypes.get( name );
            else
                t = baseTypes[ kind ];
            break;
    }

    let r;

    additionalTypes.set( name, r = new TypeAlias( name, tp, t ) );

    return r;
}

/**
 * @param {string} type
 * @param {string} name
 * @return {BaseType|Instance}
 */
export function declare( type, name )
{
    // console.log( `declare type: "${type}", name: "${name}", name:`, name );
    if ( object( name ) ) console.trace();

    switch ( type )
    {
        case 'interface':
        case 'class':       return new ClassType( name );

        case 'function':    return new FunctionType( name );

        case 'namespace':
        case 'object':      return new ObjectType( name );

        case 'array':       return new ArrayType( name );

        default:            const ntype = get_type( name );
                            // eslint-disable-next-line new-cap
                            return typeof ntype === 'function' ? new ntype( name ) : new Instance( null, null, ntype );
    }
}

// /**
//  * @class
//  * @param {string} name
//  * @param {?Declaration} [proto]
//  */
// export class Declaration
// {
//     /**
//      * @param {string} name
//      * @param {?Declaration} [proto]
//      */
//     constructor( name, proto )
//     {
//         this.name = name;
//         this.proto = proto;
//         this.types = new Set();
//         this.type = null;
//     }
//
//     make_object( name )
//     {
//         return Object.keys( { [ name ]: class extends Object_ {} } )[ 0 ];
//     }
//
//     add_type( typeNameOrRef, fixed = false )
//     {
//         if ( fixed )
//             this.type = typeNameOrRef;
//         else
//             this.types.add( typeNameOrRef );
//     }
// }
//



add_base_type( Object_, 'Object' );
add_base_type( Function_, 'Function' );
add_base_type( Array_, 'Array' );
add_base_type( Instance, 'Instance' );
add_base_type( new ObjectType(), 'object', '{}' );
add_base_type( new FunctionType(), 'function', '(){}' );
add_base_type( new ArrayType(), 'array', '[]' );
add_base_type( new ClassType(), 'class', 'class{}' );

// baseTypes.object = new Object_();
// baseTypes.array = new Array_();
// baseTypes.function = new Function_();
// baseTypes.Object = Object_;
// baseTypes.Array = Array_;
// baseTypes.Function = Function_;
// baseTypes.Instance = Instance;

add( 'symbols', new SymbolTable() );

// baseTypes[ '[]' ] = baseTypes.array;
// baseTypes[ '{}' ] = baseTypes.object;
// baseTypes[ '(){}' ] = baseTypes.function;



primitives.set( 'null', new Null() );
primitives.set( 'undefined', new Undefined() );
primitives.set( 'string', new StringType() );
primitives.set( 'number', new NumberType() );
primitives.set( 'boolean', new BooleanType() );
primitives.set( 'symbol', new SymbolType() );
primitives.set( 'any', new Any() );

globals.symbols.declaration( 'Number', declare( 'Number', 'class' ) );
globals.symbols.declaration( 'String', declare( 'String', 'class' ) );
globals.symbols.declaration( 'Boolean', declare( 'Boolean', 'class' ) );
globals.symbols.declaration( 'ymbol', declare( 'Symbol', 'class' ) );

get_type( 'number' ).boxedAs = globals.symbols.get( 'Number' );
get_type( 'string' ).boxedAs = globals.symbols.get( 'String' );
get_type( 'boolean' ).boxedAs = globals.symbols.get( 'Boolean' );
get_type( 'symbol' ).boxedAs = globals.symbols.get( 'Symbol' );

baseTypes[ 'null' ] = primitives.get( 'null' );
baseTypes[ 'undefined' ] = primitives.get( 'undefined' );
baseTypes[ 'string' ] = primitives.get( 'string' );
baseTypes[ 'number' ] = primitives.get( 'number' );
baseTypes[ 'boolean' ] = primitives.get( 'boolean' );
baseTypes[ 'symbol' ] = primitives.get( 'symbol' );
baseTypes[ 'any' ] = primitives.get( 'any' );

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

/**
 * @class
 * @param {string} name
 * @param {?Declaration} [proto]
 */
export class Declaration
{
    /**
     * @param {string} name
     * @param {?Declaration} [proto]
     */
    constructor( name, proto )
    {
        this.name = name;
        this.proto = proto;
        this.types = new Set();
        this.type = null;
    }

    add_type( typeNameOrRef, fixed = false )
    {
        if ( fixed )
            this.type = typeNameOrRef;
        else
            this.types.add( typeNameOrRef );
    }
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
        case 'class':       return baseTypes.class;

        case '()':
        case 'function':
        case 'function()':
        case '(){}':       return baseTypes.function;

        case 'namespace':
        case '{}':
        case 'object':      return baseTypes.object;

        case 'arraytype':
        case '[]':
        case 'array':       return baseTypes.array;

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
