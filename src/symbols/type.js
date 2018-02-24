/** ******************************************************************************************************************
 * @file Pure type handler.
 *
 * Classes, interfaces, enums, and type aliases are named types. More specificity:
 *
 * For example, given the declaration
 *
 * `interface Pair<T1, T2> { first: T1; second: T2; }`
 *
 * the type reference
 *
 * `Pair<string, Entity>`
 *
 * is indistinguishable from the type
 *
 * `{ first: string; second: Entity; }`
 *
 *
 *
 * Types are:
 *
 * ### Top
 * `any`
 *
 * ### primitive types
 * `number` => `Number`
 * `boolean` => `Boolean`
 * `string` => `String`
 * `symbol` => `Symbol`
 * `void` => `Void`     // Possible values are `null` and `undefined`
 * `null`
 * `undefined`
 * `enum` => `Enum`     // This is a subtype of `Number`
 * `"literal"`          // A string literal is a type, as well.
 *
 * ### object types
 * Object members are properties, call signatures, construct signatures, and index signatures.
 * Created by object type literals, array type literals, tuple type literals, function type literals,
 * constructor type literals, object literals, array literals, function expressions, function declarations,
 * constructor function types created via class declaration, namespace types
 *
 * class
 * interface
 * array
 * `tuple`
 *      interface KeyValuePair<K, V> extends Array<K | V> { 0: K; 1: V; }
 *      var x: KeyValuePair<number, string> = [10, "ten"];
 *
 * `function`
 * An object with one or more call signatures is a function type.
 *
 * The type of a parameter in a signature is determined as follows:
 *
 * * If the declaration includes a type annotation, the parameter is of that type.
 * * Otherwise, if the declaration includes an initializer expression (which is permitted only when the parameter list occurs in conjunction with a function body), the parameter type is the widened form (section [3.12](#3.12)) of the type of the initializer expression.
 * * Otherwise, if the declaration specifies a binding pattern, the parameter type is the implied type of that binding pattern (section [5.2.3](#5.2.3)).
 * * Otherwise, if the parameter is a rest parameter, the parameter type is `any[]`.
 * * Otherwise, the parameter type is `any`.
 *
 *
 *
 *
 *
 *
 *
 *
 * `constructor`
 * An object with one or more call signatures is a function type.
 *
 * ### union types
 * one of multiple types
 *
 * Union types have the following subtype relationships:
 *
 * * A union type *U* is a subtype of a type *T* if each type in *U* is a subtype of *T*.
 * * A type *T* is a subtype of a union type *U* if *T* is a subtype of any type in *U*.
 *
 * Similarly, union types have the following assignability relationships:
 *
 * * A union type *U* is assignable to a type *T* if each type in *U* is assignable to *T*.
 * * A type *T* is assignable to a union type *U* if *T* is assignable to any type in *U*
 *
 * ### intersection types
 * all of multiple types
 *
 * Intersection types have the following subtype relationships:

 * * An intersection type *I* is a subtype of a type *T* if any type in *I* is a subtype of *T*.
 * * A type *T* is a subtype of an intersection type *I* if *T* is a subtype of each type in *I*.
 *
 * Similarly, intersection types have the following assignability relationships:
 *
 * * An intersection type *I* is assignable to a type *T* if any type in *I* is assignable to *T*.
 * * A type *T* is assignable to an intersection type *I* if *T* is assignable to each type in *I*.
 *
 * ```X & ( A | B ) => X & A | X & B```
 *
 * ### type parameters
 *
 * The base constraint of a type parameter T is defined as follows:
 *
 * * If T has no declared constraint, T's base constraint is the empty object type {}.
 * * If T's declared constraint is a type parameter, T's base constraint is that of the type parameter.
 * * Otherwise, T's base constraint is T's declared constraint.
 *
 *
 * Type reference is a name of a named type with optional type parameters if the referenced type is generic.
 * A type reference must have the same number of type arguments as the generic type it references and each arguments
 * must satisfy the constraint of the type parameters of the generic type.
 *
 * @author Julian Jensen <jjdanois@gmail.com>
 * @since 1.0.0
 * @date 20-Feb-2018
 *********************************************************************************************************************/


"use strict";

import { output }   from "../utils";
import { TypeFlags } from "../types";

const
    is_primitive = str => [ 'null', 'undefined', 'string', 'number', 'boolean', 'symbol', 'any', 'never' ].includes( str );



/**
 * @class
 */
class BaseType
{
    /**
     * @param {string} name
     * @param {?BaseType} [parent=null]
     */
    constructor( name, parent = null )
    {
        this.name = name;
        this.parent = parent;
        this.primitive = null;
        /** @type {TypeFlags} */
        this.flags = TypeFlags.Any;
    }

    one_to_other( type1, type2 )
    {
        return type2 instanceof Type ? this.one_to_one( type1, type2 ) : type2 instanceof UnionType ? this.one_to_union( type1, type2 ) : this.one_to_intersect( type1, type2 );
    }

    one_to_one( type1, type2 )
    {
        return this.simple_extends( type1, type2 );
    }

    one_to_union( type1, type2 )
    {
        return [ ...type2 ].some( altType => this.one_to_one( type1, altType ) );
    }

    one_to_intersect( type1, type2 )
    {

    }

    member_check( name, otherType, selfType )
    {
        if ( selfType.has( name ) ) return false;
        if ( !otherType ) return true;

        return selfType.extends( otherType );
    }

    simple_extends( type, other )
    {
        if ( this.primitive === 'any' || other.primitive === 'any' ) return true;
        if ( this.primitive === 'never' || other.primitive === 'never' ) return false;
        if ( this.primitive && other.primitive ) return this.primitive === other.primitive;

        for ( const [ name, type ] of other )
        {
            if ( !type.members.has( name ) ) return false;
            if ( !type.members.get( name ).extends( type ) ) return false;
        }
    }

    self_simple( members, other )
    {
        if ( other instanceof Type ) return this.simple_extends( members, other );
        else if ( other instanceof UnionType )
            return [ ...other ].some( altType => this.self_simple( members, altType ) );
        else if ( other instanceof IntersectionType )
        {
            for ( const [ name, selfType ] of members )
            {
                if ( !this.self_type_extends( selfType, other ) ) return;
            }
        }
    }

    self_type_extends( type, other )
    {
        if ( other instanceof Type )
            return type.extends( other );
        else if ( other instanceof UnionType )
            return [ ...other ].some( otherType => this.self_type_extends( type, otherType ) );

    }
}

/**
 * @class
 */
export class Type extends BaseType
{
    /**
     * @param {string} name
     * @param {?BaseType} [parent=null]
     */
    constructor( name, parent = null )
    {
        super( name, parent );
        this.name = name;
        this.members = new Map();
        this.typeParameters = new Map();
        this.parent = parent;
        this.callSignatures = [];
        this.constructSignatures = [];
        this.constraint = null;
        this.default = void 0;
        this.inMappedType = false;
    }

    /**
     * @param {BaseType} constraint
     * @return {Type}
     */
    set_constraint( constraint )
    {
        if ( !constraint ) return this.constraint;
        this.constraint = constraint;
        return this;
    }

    /**
     * @param {boolean} [isMapped]
     * @return {boolean|Type}
     */
    is_mapper_type( isMapped )
    {
        if ( isMapped === void 0 ) return this.inMappedType;
        this.inMappedType = isMapped;
        return this;
    }

    /**
     * @param {?(BaseType|number|string|boolean|symbol|null)} [def]
     * @return {*|Type}
     */
    set_default( def )
    {
        if ( !def ) return this.default;
        this.default = def;
        return this;
    }

    /**
     * @param {BaseType} type
     * @return {Type}
     */
    add_call_signature( type )
    {
        type.parent = this;
        this.callSignatures.push( type );
        return this;
    }

    /**
     * @param {BaseType} type
     * @return {Type}
     */
    add_constructor( type )
    {
        type.parent = this;
        this.constructSignatures.push( type );
        return this;
    }

    /**
     * @param {BaseType} type
     * @return {Type}
     */
    add_method( type )
    {
        type.parent = this;
        this.members.set( type.name, type );
        return this;
    }

    /**
     * @param {BaseType} type
     * @return {Type}
     */
    add_property( type )
    {
        type.parent = type;
        this.members.set( type.name, type );
        return this;
    }

    compare_types( name, type )
    {
        if ( !this.members.has( name ) ) return false;
        if ( !type ) return true;

        return this.members.get( name ).extends( type );
    }

    /**
     * @param {BaseType} baseType
     * @return {boolean}
     */
    extends( baseType )
    {
        if ( this.primitive === 'any' || baseType.primitive === 'any' ) return true;
        if ( this.primitive === 'never' || baseType.primitive === 'never' ) return false;
        if ( this.primitive && baseType.primitive ) return this.primitive === baseType.primitive;

        if ( baseType instanceof Type )
        {
            for ( const [ name, type ] of baseType )
            {
                if ( !this.members.has( name ) ) return false;
                if ( !this.members.get( name ).extends( type ) ) return false;
            }
        }
        else if ( baseType instanceof UnionType )
        {
            for ( const type of baseType )
                if ( this.extends( type ) ) return true;
        }
        else
        {
            for ( const [ name, type ] of this.members )
            {
                for ( const type of baseType )
                {

                }

            }
        }

        return true;
    }

    /**
     * @return {string[]}
     */
    keyof()
    {
        return [ ...this.members.keys() ];
    }

    /**
     * @param {string} keyName
     * @return {boolean}
     */
    in_keyof( keyName )
    {
        return this.members.has( keyName );
    }

    /**
     * @param {BaseType} baseType
     * @return {boolean}
     */
    extends_keyof( baseType )
    {
        if ( baseType instanceof Type )
            return [ ...baseType.keyof() ].every( key => this.members.has( key ) );
        else if ( baseType instanceof UnionType )
        {
            for ( const type of baseType )
                if ( [ ...type.keyof() ].every( key => this.members.has( key ) ) ) return true;

            return false;
        }
        else if ( baseType instanceof IntersectionType )
        {
            const selfKeys = this.keyof();

            return baseType.keyof().every( key => selfKeys.includes( key ) );
        }
        else
            output.fatal( `Unknown type passed to "extends keyof" for type "${this.name}"` );
    }
}

/**
 * @class
 */
export class UnionType extends BaseType
{
    /**
     * @param {string} name
     * @param {?BaseType} [parent=null]
     */
    constructor( name, parent = null )
    {
        super( name, parent );
        this.types = new Set();
    }

    /**
     * @returns {Iterable<Type>}
     */
    *[Symbol.iterator]()
    {
        yield *this.types;
    }
}

/**
 * @class
 */
export class IntersectionType extends BaseType
{
    /**
     * @param {string} name
     * @param {?BaseType} [parent=null]
     */
    constructor( name, parent = null )
    {
        super( name, parent );
        this.types = new Set();
    }

    get members()
    {
        for ( const type of this.types )
    }

    /**
     * @returns {Iterable<Type>}
     */
    *[Symbol.iterator]()
    {
        yield *this.types;
    }

    keyof()
    {
        let keys = [];

        for ( const type of this )
            keys = keys.concat( type.keyof() );

        return [ ...new Set( keys ) ];
    }
}


/**
 * @class
 */
class TypeTable
{
    /**
     *
     */
    constructor()
    {
        this.types = new Map();
    }

    /**
     * @param {string} name
     * @param {Type} type
     */
    add( name, type )
    {
        this.types.set( name, type );
        type.parent = null;
    }

    /**
     * @param {string} name
     * @return {Type | undefined}
     */
    get( name )
    {
        return this.types.get( name );
    }
}
