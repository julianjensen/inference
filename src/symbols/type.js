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


// @flow
"use strict";

/**
 * @typedef {(string & { __escapedIdentifier: void }) | (void & { __escapedIdentifier: void }) | InternalSymbolName | string} __String
 */

import { binarySearch, containsIdenticalType, containsType, output } from "../utils";
import {
    ObjectFlags,
    TypeFlags,
    SymbolFlags,
    InternalSymbolName, UnionReduction, CheckFlags
}                                                                    from "../types";
import { IntersectionType, UnionType }                               from "./define-libraries";

/** @type {GenericType[]} */
const tupleTypes = [];

/** @type {Map<string,UnionType>} */
const unionTypes = new Map();

/** @type {Map<string,IntersectionType>} */
const intersectionTypes = new Map();

/** @type {Map<string,LiteralType>} */
const literalTypes = new Map();

/** @type {Map<string,IndexedAccessType>} */
const indexedAccessTypes = new Map();

/** @type {EvolvingArrayType[]} */
const evolvingArrayTypes = [];

/** @type {Map<string,Symbol>} */
const undefinedProperties = new Map();

const unknownSymbol = new Symbol( SymbolFlags.Property, "unknown" );

const resolvingSymbol = new Symbol( 0, InternalSymbolName.Resolving );

const anyType               = new IntrinsicType( TypeFlags.Any, "any" );
const autoType              = new IntrinsicType( TypeFlags.Any, "any" );
const unknownType           = new IntrinsicType( TypeFlags.Any, "unknown" );
const undefinedType         = new IntrinsicType( TypeFlags.Undefined, "undefined" );
const undefinedWideningType = new IntrinsicType( TypeFlags.Undefined | TypeFlags.ContainsWideningType, "undefined" );
const nullType              = new IntrinsicType( TypeFlags.Null, "null" );
const nullWideningType      = new IntrinsicType( TypeFlags.Null | TypeFlags.ContainsWideningType, "null" );
const stringType            = new IntrinsicType( TypeFlags.String, "string" );
const numberType            = new IntrinsicType( TypeFlags.Number, "number" );
const trueType              = new IntrinsicType( TypeFlags.BooleanLiteral, "true" );
const falseType             = new IntrinsicType( TypeFlags.BooleanLiteral, "false" );

const booleanType         = getUnionType( [ trueType, falseType ] );
booleanType.flags |= TypeFlags.Boolean;
booleanType.intrinsicName = 'boolean';

const esSymbolType      = new IntrinsicType( TypeFlags.ESSymbol, "symbol" );
const voidType          = new IntrinsicType( TypeFlags.Void, "void" );
const neverType         = new IntrinsicType( TypeFlags.Never, "never" );
const silentNeverType   = new IntrinsicType( TypeFlags.Never, "never" );
const implicitNeverType = new IntrinsicType( TypeFlags.Never, "never" );
const nonPrimitiveType  = new IntrinsicType( TypeFlags.NonPrimitive, "object" );

const
    emptySymbols = new Map(),
    emptyArray   = [];

const emptyObjectType = new AnonymousType( undefined, emptySymbols, emptyArray, emptyArray, undefined, undefined );

const emptyTypeLiteralSymbol   = createSymbol( SymbolFlags.TypeLiteral, InternalSymbolName.Type );
emptyTypeLiteralSymbol.members = new Map();
const emptyTypeLiteralType     = new AnonymousType( emptyTypeLiteralSymbol, emptySymbols, emptyArray, emptyArray, undefined, undefined );

const emptyGenericType          = new AnonymousType( undefined, emptySymbols, emptyArray, emptyArray, undefined, undefined );
emptyGenericType.instantiations = new Map();

const anyFunctionType = new AnonymousType( undefined, emptySymbols, emptyArray, emptyArray, undefined, undefined );

// The anyFunctionType contains the anyFunctionType by definition. The flag is further propagated
// in getPropagatingFlagsOfTypes, and it is checked in inferFromTypes.
anyFunctionType.flags |= TypeFlags.ContainsAnyFunctionType;

const noConstraintType       = new AnonymousType( undefined, emptySymbols, emptyArray, emptyArray, undefined, undefined );
const circularConstraintType = new AnonymousType( undefined, emptySymbols, emptyArray, emptyArray, undefined, undefined );
const resolvingDefaultType   = new AnonymousType( undefined, emptySymbols, emptyArray, emptyArray, undefined, undefined );

const markerSuperType    = new TypeParameter( TypeFlags.TypeParameter );
const markerSubType      = new TypeParameter( TypeFlags.TypeParameter );
markerSubType.constraint = markerSuperType;

const markerOtherType = new TypeParameter( TypeFlags.TypeParameter );

const anySignature         = createSignature( undefined, undefined, undefined, emptyArray, anyType, /*resolvedTypePredicate*/ undefined, 0, /*hasRestParameter*/ false, /*hasLiteralTypes*/ false );
const unknownSignature     = createSignature( undefined, undefined, undefined, emptyArray, unknownType, /*resolvedTypePredicate*/ undefined, 0, /*hasRestParameter*/ false, /*hasLiteralTypes*/ false );
const resolvingSignature   = createSignature( undefined, undefined, undefined, emptyArray, anyType, /*resolvedTypePredicate*/ undefined, 0, /*hasRestParameter*/ false, /*hasLiteralTypes*/ false );
const silentNeverSignature = createSignature( undefined, undefined, undefined, emptyArray, silentNeverType, /*resolvedTypePredicate*/ undefined, 0, /*hasRestParameter*/ false, /*hasLiteralTypes*/ false );

const enumNumberIndexInfo      = {
    type:        stringType,
    isReadonly:  false,
    declaration: void 0
};
const jsObjectLiteralIndexInfo = {
    type:        anyType,
    isReadonly:  false,
    declaration: void 0
};

const globals            = new Map();
const reverseMappedCache = new Map();

let globalObjectType;
let globalFunctionType;
let globalArrayType;
let globalReadonlyArrayType;
let globalStringType;
let globalNumberType;
let globalBooleanType;
let globalRegExpType;
let globalThisType;
let anyArrayType;
let autoArrayType;
let anyReadonlyArrayType;

let nextSymbolId = 1;
let nextTypeId   = 1;


const
    is_primitive = str => [ 'null', 'undefined', 'string', 'number', 'boolean', 'symbol', 'any', 'never' ].includes( str );



function getTypeListId( types )
{
    let result = "";

    if ( types )
    {
        const length = types.length;

        let i = 0;

        while ( i < length )
        {
            const startId = types[ i ].id;
            let count     = 1;
            while ( i + count < length && types[ i + count ].id === startId + count )
            {
                count++;
            }

            if ( result.length ) result += ",";

            result += startId;

            if ( count > 1 ) result += ":" + count;

            i += count;
        }
    }

    return result;
}

/**
 * This function is used to propagate certain flags when creating new object type references and union types.
 * It is only necessary to do so if a constituent type might be the undefined type, the null type, the type
 * of an object literal or the anyFunctionType. This is because there are operations in the type checker
 * that care about the presence of such types at arbitrary depth in a containing type.
 *
 * @param {Type[]} types
 * @param {TypeFlags} excludeKinds
 * @return {TypeFlags}
 */
function getPropagatingFlagsOfTypes( types, excludeKinds )
{
    let result = TypeFlags();

    for ( const type of types )
        if ( !( type.flags & excludeKinds ) )
            result |= type.flags;

    return TypeFlags( result & TypeFlags.PropagatingFlags );
}



class Symbol
{
    /**
     * @param {SymbolFlags} flags
     * @param {string} name
     */
    constructor( flags, name )
    {
        this.escapedName      = name;
        this.declarations     = void 0;
        this.valueDeclaration = void 0;
        this.members          = void 0;
        this.exports          = void 0;
        this.globalExports    = void 0;

        this._id          = nextSymbolId++;
        this.mergeId      = 0;
        this.parent       = null;
        this.exportSymbol = null;
        this.isReferenced = false;
        this.isAssigned   = false;

        /** @type {SymbolFlags} */
        this.flags = flags;
    }

    add_declaration( symbol, node, symbolFlags )
    {
        this.flags |= symbolFlags;

        node.symbol = this;

        if ( !this.declarations )
            this.declarations = [ node ];
        else
            this.declarations.push( node );

        if ( symbolFlags & SymbolFlags.HasExports && !this.exports )
            this.exports = new Map();

        if ( symbolFlags & SymbolFlags.HasMembers && !this.members )
            this.members = new Map();

        if ( symbolFlags & SymbolFlags.Value )
        {
            const vdecl = this.valueDeclaration;

            if ( !vdecl || ( vdecl.kind !== node.kind && vdecl.kind === SyntaxKind.ModuleDeclaration ) )
                this.valueDeclaration = node;
        }
    }

    get displayName()
    {
        const _name = this._escapedName;

        return _name.length >= 3 && _name.charCodeAt( 0 ) === CharacterCodes._ && _name.charCodeAt( 1 ) === CharacterCodes._ && _name.charCodeAt( 2 ) === CharacterCodes._ ? _name.substr( 1 ) : _name;
    }

    get escapedName()
    {
        return this._escapedName;
    }

    set escapedName( name )
    {
        this._escapedName = name.length >= 2 && name.charCodeAt( 0 ) === CharacterCodes._ && name.charCodeAt( 1 ) === CharacterCodes._ ? "_" + name : name;
    }

    /**
     * @return {number}
     */
    get id()
    {
        return this._id;
    }

    /**
     * @param {Symbol} targetSymbol
     * @return {boolean}
     */
    isEnumTypeRelatedTo( targetSymbol )
    {
        if ( this === targetSymbol ) return true;

        const
            id       = this.id + "," + targetSymbol.id,
            relation = enumRelation.get( id );

        if ( relation !== undefined ) return relation;

        if ( this.escapedName !== targetSymbol.escapedName || !( this.flags & SymbolFlags.RegularEnum ) || !( targetSymbol.flags & SymbolFlags.RegularEnum ) )
        {
            enumRelation.set( id, false );
            return false;
        }

        const targetEnumType = targetSymbol.getTypeOfSymbol();

        for ( const property of this.getTypeOfSymbol().getPropertiesOfType() )
        {
            if ( property.flags & SymbolFlags.EnumMember )
            {
                const targetProperty = targetEnumType.getPropertyOfType( property.escapedName );

                if ( !targetProperty || !( targetProperty.flags & SymbolFlags.EnumMember ) )
                {
                    enumRelation.set( id, false );
                    return false;
                }
            }
        }
        enumRelation.set( id, true );
        return true;
    }

}

/**
 * @class
 */
class BaseType
{
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
export class Type
{
    /**
     * @param {TypeFlags} flags
     */
    constructor( flags )
    {
        this.primitive = null;
        this.name      = null;
        this.parent    = null;
        /** @type {TypeFlags} */
        this.flags = flags;
        this._id                = 0;
        this.symbol             = null;
        this.aliasSymbol        = null;
        this.aliasTypeArguments = null;
        this._id                = nextTypeId++;
    }

    get flags()
    {
        return this._flags || ( this._flags = TypeFlags() );
    }

    set flags( v )
    {
        this._flags = TypeFlags( v );
    }

    get objectFlags()
    {
        return this._objectFlags || ( this._objectFlags = ObjectFlags() );
    }

    set objectFlags( v )
    {
        this._objectFlags = ObjectFlags( v );
    }

    /**
     * @return {number}
     */
    get id()
    {
        return this._id;
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

    /**
     * For a type parameter, return the base constraint of the type parameter. For the string, number,
     * boolean, and symbol primitive types, return the corresponding object types. Otherwise return the
     * type itself. Note that the apparent type of a union type is the union type itself.
     */
    getApparentType()
    {
        const t = this.flags & TypeFlags.TypeVariable ? this.getBaseConstraintOfType() || emptyObjectType : this;

        return t.flags & TypeFlags.Intersection
               ? t.getApparentTypeOfIntersectionType()
               : t.flags & TypeFlags.StringLike
                 ? globalStringType
                 : t.flags & TypeFlags.NumberLike
                   ? globalNumberType
                   : t.flags & TypeFlags.BooleanLike
                     ? globalBooleanType
                     : t.flags & TypeFlags.ESSymbolLike
                       ? getGlobalESSymbolType()
                       : t.flags & TypeFlags.NonPrimitive
                         ? emptyObjectType
                         : t;
    }

    /**
     * @param {Type[]} targets
     * @return {boolean}
     */
    isSubtypeOfAny( targets )
    {
        for ( const target of targets )
        {
            if ( this !== target && this.isTypeSubtypeOf( target ) &&
                 ( !( this.getTargetType().getObjectFlags() & ObjectFlags.Class ) ||
                   !( target.getTargetType().getObjectFlags() & ObjectFlags.Class ) ||
                   this.isTypeDerivedFrom( target ) )
            )
                return true;
        }

        return false;
    }

    isReferenceToType( target )
    {
        return target !== undefined && ( this.getObjectFlags() & ObjectFlags.Reference ) !== 0 && this.target === target;
    }

    /**
     *
     * @return {Type}
     */
    getTargetType()
    {
        return this.getObjectFlags() & ObjectFlags.Reference ? this.target : this;
    }

    hasBaseType( checkBase )
    {
        return check( this );

        function check( type )
        {
            if ( type.getObjectFlags() & ( ObjectFlags.ClassOrInterface | ObjectFlags.Reference ) )
            {
                const target = type.getTargetType();
                return target === checkBase || getBaseTypes( target ).forEach( check );
            }
            else if ( type.flags & TypeFlags.Intersection )
                return type.types.forEach( check );
        }
    }

    isTypeIdenticalTo( target )
    {
        return this.isTypeRelatedTo( target, identityRelation );
    }

    compareTypesIdentical( target )
    {
        return this.isTypeRelatedTo( target, identityRelation ) ? Ternary.True : Ternary.False;
    }

    compareTypesAssignable( target )
    {
        return this.isTypeRelatedTo( target, assignableRelation ) ? Ternary.True : Ternary.False;
    }

    isTypeSubtypeOf( target )
    {
        return this.isTypeRelatedTo( target, subtypeRelation );
    }

    isTypeAssignableTo( target )
    {
        return this.isTypeRelatedTo( target, assignableRelation );
    }

    /**
     * An object type S is considered to be derived from an object type T if
     * S is a union type and every constituent of S is derived from T,
     * T is a union type and S is derived from at least one constituent of T, or
     * S is a type variable with a base constraint that is derived from T,
     * T is one of the global types Object and Function and S is a subtype of T, or
     * T occurs directly or indirectly in an 'extends' clause of S.
     * Note that this check ignores type parameters and only considers the
     * inheritance hierarchy.
     */
    isTypeDerivedFrom( target )
    {
        return this.flags & TypeFlags.Union
               ? this.types.every( t => t.isTypeDerivedFrom( target ) )
               : target.flags & TypeFlags.Union
                 ? target.types.some( t => this.isTypeDerivedFrom( t ) )
                 : this.flags & TypeFlags.TypeVariable
                   ? this.isTypeDerivedFrom( this.getBaseConstraintOfType() || emptyObjectType, target )
                   : target === globalObjectType || target === globalFunctionType
                     ? this.isTypeSubtypeOf( target )
                     : this.hasBaseType( target.getTargetType() );
    }

    /**
     * This is *not* a bi-directional relationship.
     * If one needs to check both directions for comparability, use a second call to this function or 'checkTypeComparableTo'.
     *
     * A type S is comparable to a type T if some (but not necessarily all) of the possible values of S are also possible values of T.
     * It is used to check following cases:
     *   - the types of the left and right sides of equality/inequality operators (`===`, `!==`, `==`, `!=`).
     *   - the types of `case` clause expressions and their respective `switch` expressions.
     *   - the type of an expression in a type assertion with the type being asserted.
     */
    isTypeComparableTo( target )
    {
        return this.isTypeRelatedTo( target, comparableRelation );
    }

    static areTypesComparable( type1, type2 )
    {
        return type1.isTypeComparableTo( type2 ) || type2.isTypeComparableTo( type1 );
    }

    checkTypeAssignableTo( target )
    {
        return this.checkTypeRelatedTo( target, assignableRelation );
    }

    /**
     * This is *not* a bi-directional relationship.
     * If one needs to check both directions for comparability, use a second call to this function or 'isTypeComparableTo'.
     */
    checkTypeComparableTo( target )
    {
        return this.checkTypeRelatedTo( target, comparableRelation );
    }

    // isSignatureAssignableTo( target, ignoreReturnTypes )
    // {
    //     return this.compareSignaturesRelated( target, CallbackCheck.None, ignoreReturnTypes, compareTypesAssignable ) !== Ternary.False;
    // }
}

/**
 * @class
 */
class TypeParameter extends Type
{
    /**
     * @param {TypeFlags} typeParameter
     */
    constructor( typeParameter )
    {
        super( TypeFlags.TypeParameter );
        this.symbol = null;
        this.target = null;
    }
}


/**
 * Intrinsic types (TypeFlags.Intrinsic)
 *
 * @class
 */
class IntrinsicType extends Type
{
    constructor( typeFlags, name )
    {
        super( typeFlags );
        this.intrinsicName = name;
    }
}

/**
 * String literal types (TypeFlags.StringLiteral)
 * Numeric literal types (TypeFlags.NumberLiteral)
 * @class
 */
class LiteralType extends Type
{
    constructor()
    {
        super();

        this.value       = null;     // Value of literal
        this.freshType   = null;    // Fresh version of type
        this.regularType = null;  // Regular version of type
    }
}

/**
 * Unique symbol types (TypeFlags.UniqueESSymbol)
 * @class
 */
class UniqueESSymbolType extends Type
{
    constructor()
    {
        super();
        this.symbol = null;
    }
}

/**
 * @class
 */
class StringLiteralType extends LiteralType
{
    constructor()
    {
        super();
        this.value = null;
    }
}

/**
 * @class
 */
class NumberLiteralType extends LiteralType
{
    constructor()
    {
        super();
        this.value = null;
    }
}

/**
 * Enum types (TypeFlags.Enum)
 * @class
 */
class EnumType extends Type
{
    constructor()
    {
        super();
    }
}

/**
 * Object types (TypeFlags.ObjectType)
 * @class
 */
class ObjectType extends Type
{
    constructor( flags, symbol )
    {
        super();

        this.flags       = TypeFlags.Object;
        this.objectFlags = flags;
        this.symbol      = symbol;

        // From ResolvedType
        this.members             = null;              // Properties by name
        this.properties          = null;              // Properties
        this.callSignatures      = null;       // Call signatures of type
        this.constructSignatures = null;  // Construct signatures of type
        this.stringIndexInfo     = null;       // String indexing info
        this.numberIndexInfo     = null;       // Numeric indexing info
    }

    setStructuredTypeMembers( members, callSignatures, constructSignatures, stringIndexInfo, numberIndexInfo )
    {
        this.members             = members;
        this.callSignatures      = callSignatures;
        this.constructSignatures = constructSignatures;
        this.stringIndexInfo     = stringIndexInfo;
        this.numberIndexInfo     = numberIndexInfo;
    }
}

/**
 * Class and interface types (ObjectFlags.Class and ObjectFlags.Interface).
 * @class
 */
class InterfaceType extends ObjectType
{
    constructor( objectFlags, symbol )
    {
        super();

        this.flags       = TypeFlags.Object;
        this.objectFlags = objectFlags;
        this.symbol      = symbol;

        this.typeParameters              = void 0;           // Type parameters (undefined if non-generic)
        this.outerTypeParameters         = void 0;      // Outer type parameters (undefined if none)
        this.localTypeParameters         = void 0;      // Local type parameters (undefined if none)
        this.thisType                    = void 0;                   // The "this" type (undefined if none)
        this.resolvedBaseConstructorType = null;        // Resolved base constructor type of class
        this.resolvedBaseTypes           = null;             // Resolved base types
    }
}

/**
 * @class
 */
class InterfaceTypeWithDeclaredMembers extends InterfaceType
{
    constructor()
    {
        super();
        this.declaredProperties          = void 0;              // Declared members
        this.declaredCallSignatures      = void 0;       // Declared call signatures
        this.declaredConstructSignatures = void 0;  // Declared construct signatures
        this.declaredStringIndexInfo     = null;        // Declared string indexing info
        this.declaredNumberIndexInfo     = null;        // Declared numeric indexing info
    }
}

/**
 * Type references (ObjectFlags.Reference). When a class or interface has type parameters or
 * a "this" type, references to the class or interface are made using type references. The
 * typeArguments property specifies the types to substitute for the type parameters of the
 * class or interface and optionally includes an extra element that specifies the type to
 * substitute for "this" in the resulting instantiation. When no extra argument is present,
 * the type reference itself is substituted for "this". The typeArguments property is undefined
 * if the class or interface has no type parameters and the reference isn't specifying an
 * explicit "this" argument.
 *
 * @class
 */
class TypeReference extends Type
{
    constructor()
    {
        super();
        this.target        = null;    // Type reference target
        this.typeArguments = null;  // Type reference type arguments (undefined if none)
    }
}


/**
 * Generic class and interface types
 * @class
 */
class GenericType extends ObjectType
{
    constructor()
    {
        super();
        this.instantiations = new Map();  // Generic instantiation cache
        this.variances      = null;  // Variance of each type parameter
    }
}

/**
 * @class
 */
class UnionOrIntersectionType extends Type
{
    constructor( flags )
    {
        super( flags );
        this.types                     = null;                    // Constituent types
        this.propertyCache             = new Map();       // Cache of resolved properties
        this.resolvedProperties        = null;
        this.resolvedIndexType         = null;
        this.resolvedBaseConstraint    = null;
        this.couldContainTypeVariables = false;
    }
}

/**
 * @class
 */
class UnionType extends UnionOrIntersectionType
{
    constructor( typeFlags )
    {
        super( typeFlags );
    }


    /**
     * We sort and deduplicate the constituent types based on object identity. If the subtypeReduction
     * flag is specified we also reduce the constituent type set to only include types that aren't subtypes
     * of other types. Subtype reduction is expensive for large union types and is possible only when union
     * types are known not to circularly reference themselves (as is the case with union types created by
     * expression constructs such as array literals and the `||` and `?:` operators). Named types can
     * circularly reference themselves and therefore cannot be subtype reduced during their declaration.
     * For example, `type Item = string | (() => Item` is a named type that circularly references itself.
     *
     * @param {Type[]} types
     * @param {?UnionReduction} [unionReduction=UnionReduction.Literal]
     * @param {?Symbol} [aliasSymbol]
     * @param {?Type[]} [aliasTypeArguments]
     * @returns {Type}
     */
    static getUnionType( types, unionReduction = UnionReduction.Literal, aliasSymbol = null, aliasTypeArguments = null )
    {
        if ( types.length === 0 )
            return neverType;

        if ( types.length === 1 )
            return types[ 0 ];

        const typeSet = [];

        UnionType.addTypesToUnion( typeSet, types );

        if ( typeSet.containsAny )
            return anyType;

        switch ( unionReduction )
        {
            case UnionReduction.Literal:
                if ( typeSet.containsLiteralOrUniqueESSymbol )
                    UnionType.removeRedundantLiteralTypes( typeSet );
                break;

            case UnionReduction.Subtype:
                UnionType.removeSubtypes( typeSet );
                break;
        }
        if ( typeSet.length === 0 )
            return typeSet.containsNull
                   ? typeSet.containsNonWideningType
                     ? nullType : nullWideningType
                   : typeSet.containsUndefined
                     ? typeSet.containsNonWideningType
                       ? undefinedType
                       : undefinedWideningType
                     : neverType;

        return UnionType.getUnionTypeFromSortedList( typeSet, aliasSymbol, aliasTypeArguments );
    }

    static removeSubtypes( types )
    {
        if ( types.length === 0 || isSetOfLiteralsFromSameEnum( types ) )
            return;

        let i = types.length;

        while ( i > 0 )
        {
            i--;
            if ( types[ i ].isSubtypeOfAny( types ) )
                types.slice( i, 1 );
        }
    }

    static removeRedundantLiteralTypes( types )
    {
        let i = types.length;

        while ( i > 0 )
        {
            i--;
            const t      = types[ i ];
            const remove =
                      t.flags & TypeFlags.StringLiteral && types.containsString ||
                      t.flags & TypeFlags.NumberLiteral && types.containsNumber ||
                      t.flags & TypeFlags.UniqueESSymbol && types.containsESSymbol ||
                      t.flags & TypeFlags.StringOrNumberLiteral && t.flags & TypeFlags.FreshLiteral && containsType( types, t.regularType );

            if ( remove )
                types.splice( i, 1 );
        }
    }

    /**
     * This function assumes the constituent type list is sorted and deduplicated.
     * @param {Type[]} types
     * @param {?Symbol} aliasSymbol
     * @param {?Type[]} [aliasTypeArguments]
     */
    static getUnionTypeFromSortedList( types, aliasSymbol, aliasTypeArguments )
    {
        if ( types.length === 0 )
            return neverType;

        if ( types.length === 1 )
            return types[ 0 ];

        const id = getTypeListId( types );

        let type = unionTypes.get( id );

        if ( !type )
        {
            const propagatedFlags = getPropagatingFlagsOfTypes( types, /*excludeKinds*/ TypeFlags.Nullable );
            type                  = new UnionType( TypeFlags( TypeFlags.Union | propagatedFlags ) );
            unionTypes.set( id, type );
            type.types = types;

            /*
            Note: This is the alias symbol (or lack thereof) that we see when we first encounter this union type.
            For aliases of identical unions, eg `type T = A | B; type U = A | B`, the symbol of the first alias encountered is the aliasSymbol.
            (In the language service, the order may depend on the order in which a user takes actions, such as hovering over symbols.)
            It's important that we create equivalent union types only once, so that's an unfortunate side effect.
            */
            type.aliasSymbol        = aliasSymbol;
            type.aliasTypeArguments = aliasTypeArguments;
        }

        return type;
    }

    /**
     * Add the given types to the given type set. Order is preserved, duplicates are removed,
     * and nested types of the given kind are flattened into the set.
     *
     * @param typeSet
     * @param types
     */
    static addTypesToUnion( typeSet, types )
    {
        for ( const type of types )
        {
            UnionType.addTypeToUnion( typeSet, type );
        }
    }

    static addTypeToUnion( typeSet, type )
    {
        const flags = type.flags;

        if ( flags & TypeFlags.Union )
            UnionType.addTypesToUnion( typeSet, type.types );
        else if ( flags & TypeFlags.Any )
            typeSet.containsAny = true;
        else if ( flags & TypeFlags.Nullable )
        {
            if ( flags & TypeFlags.Undefined ) typeSet.containsUndefined = true;
            if ( flags & TypeFlags.Null ) typeSet.containsNull = true;
            if ( !( flags & TypeFlags.ContainsWideningType ) ) typeSet.containsNonWideningType = true;
        }
        else if ( !( flags & TypeFlags.Never || flags & TypeFlags.Intersection && type.isEmptyIntersectionType() ) )
        {
            // We ignore 'never' types in unions. Likewise, we ignore intersections of unit types as they are
            // another form of 'never' (in that they have an empty value domain). We could in theory turn
            // intersections of unit types into 'never' upon construction, but deferring the reduction makes it
            // easier to reason about their origin.
            if ( flags & TypeFlags.String ) typeSet.containsString = true;
            if ( flags & TypeFlags.Number ) typeSet.containsNumber = true;
            if ( flags & TypeFlags.ESSymbol ) typeSet.containsESSymbol = true;
            if ( flags & TypeFlags.StringOrNumberLiteralOrUnique ) typeSet.containsLiteralOrUniqueESSymbol = true;

            const len = typeSet.length;

            const index = len && type.id > typeSet[ len - 1 ].id ? ~len : binarySearch( typeSet, type );

            if ( index < 0 )
            {
                if ( !( flags & TypeFlags.Object && type.objectFlags & ObjectFlags.Anonymous &&
                        type.symbol && type.symbol.flags & ( SymbolFlags.Function | SymbolFlags.Method ) && containsIdenticalType( typeSet, type ) ) )
                    typeSet.splice( ~index, 0, type );
            }
        }
    }

}

/**
 * @class
 */
class IntersectionType extends UnionOrIntersectionType
{
    constructor()
    {
        super();
        this.resolvedApparentType = null;
    }

    static addTypeToIntersection( typeSet: TypeSet, type: Type )
    {
        if ( type.flags & TypeFlags.Intersection )
            addTypesToIntersection( typeSet, type.types );
        else if ( type.flags & TypeFlags.Any )
            typeSet.containsAny = true;
        else if ( type.flags & TypeFlags.Never )
            typeSet.containsNever = true;
        else if ( type.getObjectFlags() & ObjectFlags.Anonymous && type.isEmptyObjectType() )
            typeSet.containsEmptyObject = true;
        else if ( ( !( type.flags & TypeFlags.Nullable ) ) && !contains( typeSet, type ) )
        {
            if ( type.flags & TypeFlags.Object )
                typeSet.containsObjectType = true;

            if ( type.flags & TypeFlags.Union && typeSet.unionIndex === undefined )
                typeSet.unionIndex = typeSet.length;

            if ( !( type.flags & TypeFlags.Object && type.objectFlags & ObjectFlags.Anonymous &&
                    type.symbol && type.symbol.flags & ( SymbolFlags.Function | SymbolFlags.Method ) && containsIdenticalType( typeSet, type ) ) )
                typeSet.push( type );
        }
    }

    /**
     * Add the given types to the given type set. Order is preserved, freshness is removed from literal
     * types, duplicates are removed, and nested types of the given kind are flattened into the set.
     *
     * @param typeSet
     * @param types
     */
    static addTypesToIntersection( typeSet, types )
    {
        for ( const type of types )
        {
            addTypeToIntersection( typeSet, type.getRegularTypeOfLiteralType() );
        }
    }


    /**
     * We normalize combinations of intersection and union types based on the distributive property of the '&'
     * operator. Specifically, because `X & (A | B)` is equivalent to `X & A | X & B`, we can transform intersection
     * types with union type constituents into equivalent union types with intersection type constituents and
     * effectively ensure that union types are always at the top level in type representations.
     *
     * We do not perform structural deduplication on intersection types. Intersection types are created only by the &
     * type operator and we can't reduce those because we want to support recursive intersection types. For example,
     * a type alias of the form `type List<T> = T & { next: List<T> }` cannot be reduced during its declaration.
     * Also, unlike union types, the order of the constituent types is preserved in order that overload resolution
     * for intersections of types with signatures can be deterministic.
     *
     * @param types
     * @param aliasSymbol
     * @param aliasTypeArguments
     * @return {*}
     */
    static getIntersectionType( types, aliasSymbol, aliasTypeArguments )
    {
        if ( types.length === 0 )
            return emptyObjectType;

        const typeSet = [];

        IntersectionType.addTypesToIntersection( typeSet, types );

        if ( typeSet.containsNever )
            return neverType;
        if ( typeSet.containsAny )
            return anyType;

        if ( typeSet.containsEmptyObject && !typeSet.containsObjectType )
            typeSet.push( emptyObjectType );

        if ( typeSet.length === 1 )
            return typeSet[ 0 ];

        const unionIndex = typeSet.unionIndex;

        if ( unionIndex !== undefined )
        {
            // We are attempting to construct a type of the form X & (A | B) & Y. Transform this into a type of
            // the form X & A & Y | X & B & Y and recursively reduce until no union type constituents remain.

            const unionType = typeSet[ unionIndex ];

            return getUnionType( unionType.types.map( t => getIntersectionType( replaceElement( typeSet, unionIndex, t ) ) ), UnionReduction.Literal, aliasSymbol, aliasTypeArguments );
        }

        const id = getTypeListId( typeSet );

        let type = intersectionTypes.get( id );

        if ( !type )
        {
            const propagatedFlags = getPropagatingFlagsOfTypes( typeSet, /*excludeKinds*/ TypeFlags.Nullable );

            type = new IntersectionType( TypeFlags.Intersection | propagatedFlags );

            intersectionTypes.set( id, type );
            type.types              = typeSet;
            type.aliasSymbol        = aliasSymbol; // See comment in `getUnionTypeFromSortedList`.
            type.aliasTypeArguments = aliasTypeArguments;
        }

        return type;
    }

    static getTypeFromIntersectionTypeNode( node )
    {
        const links = node.getNodeLinks();

        if ( !links.resolvedType )
        {
            links.resolvedType = getIntersectionType( node.types.map( getTypeFromTypeNode ), node.getAliasSymbolForTypeNode(), node.getAliasTypeArgumentsForTypeNode() );
        }
        return links.resolvedType;

    }

}

/**
 * An instantiated anonymous type has a target and a mapper
 *
 * @class
 */
class AnonymousType extends ObjectType
{
    constructor( symbol, members, callSignatures, constructSignatures, stringIndexInfo, numberIndexInfo )
    {
        super( ObjectFlags.Anonymous, symbol );

        this.objectFlags = ObjectFlags.Anonymous;

        this.target = null;  // Instantiation target
        this.mapper = null;     // Instantiation mapper

        this.setStructuredTypeMembers( members, callSignatures, constructSignatures, stringIndexInfo, numberIndexInfo );
    }

}

/**
 * @class
 */
class MappedType extends AnonymousType
{
    constructor()
    {
        super();
        this.declaration    = null;
        this.typeParameter  = null;
        this.constraintType = null;
        this.templateType   = null;
        this.modifiersType  = null;
    }
}

/**
 * An evolving array type tracks the element types that have so far been seen in an
 * `x.push(value)` or `x[n] = value` operation along the control flow graph. Evolving
 * array types are ultimately converted into manifest array types (using `getFinalArrayType`)
 * and never escape the getFlowTypeOfReference function.
 *
 * @class
 */
class EvolvingArrayType extends ObjectType
{
    constructor()
    {
        super();
        this.elementType    = null;      // Element expressions of evolving array type
        this.finalArrayType = null;  // Final array type of evolving array type
    }
}

class ReverseMappedType extends ObjectType
{
    constructor()
    {
        super();
        this.source     = null;
        this.mappedType = null;
    }
}

/**
 * Resolved object, union, or intersection type
 *
 * @class
 */
class ResolvedType extends ObjectType, UnionOrIntersectionType
{
    constructor()
    {
        super();
        this.members             = null;              // Properties by name
        this.properties          = null;              // Properties
        this.callSignatures      = null;       // Call signatures of type
        this.constructSignatures = null;  // Construct signatures of type
        this.stringIndexInfo     = null;       // String indexing info
        this.numberIndexInfo     = null;       // Numeric indexing info
    }
}

/**
 * Object literals are initially marked fresh. Freshness disappears following an assignment,
 * before a type assertion, or when an object literal's type is widened. The regular
 * version of a fresh type is identical except for the TypeFlags.FreshObjectLiteral flag.
 *
 * @class
 */
class FreshObjectLiteralType extends ResolvedType
{
    constructor()
    {
        super();
        this.regularType = null;  // Regular version of fresh type
    }
}

/**
 * Just a place to cache element types of iterables and iterators
 *
 * @class
 */
class IterableOrIteratorType extends ObjectType, UnionType
{
    constructor()
    {
        super();
        this.iteratedTypeOfIterable      = null;
        this.iteratedTypeOfIterator      = null;
        this.iteratedTypeOfAsyncIterable = null;
        this.iteratedTypeOfAsyncIterator = null;
    }
}

/**
 * @class
 */
class PromiseOrAwaitableType extends ObjectType, UnionType
{
    constructor()
    {
        super();
        this.promiseTypeOfPromiseConstructor = null;
        this.promisedTypeOfPromise           = null;
        this.awaitedTypeOfType               = null;
    }
}

/**
 * @class
 */
class SyntheticDefaultModuleType extends Type
{
    constructor()
    {
        super();
        this.syntheticType = null;
    }
}

/**
 * @class
 */
class TypeVariable extends Type
{
    constructor()
    {
        super();
        this.resolvedBaseConstraint = null;
        this.resolvedIndexType      = null;
    }
}

/**
 * Type parameters (TypeFlags.TypeParameter)
 * @class
 */
class TypeParameter extends TypeVariable
{
    constructor()
    {
        super();
        /** Retrieve using getConstraintFromTypeParameter */
        this.constraint = null;
        this.default             = null;
        this.target              = null;  // Instantiation target
        this.mapper              = null;     // Instantiation mapper
        this.isThisType          = false;
        this.resolvedDefaultType = null;
    }
}

/**
 * Indexed access types (TypeFlags.IndexedAccess)
 * Possible forms are T[xxx], xxx[T], or xxx[keyof T], where T is a type variable
 *
 * @class
 */
class IndexedAccessType extends TypeVariable
{
    constructor()
    {
        super();
        this.objectType = null;
        this.indexType  = null;
        this.constraint = null;
    }
}


/**
 * keyof T types (TypeFlags.Index)
 *
 * @class
 */
class IndexType extends Type
{
    constructor()
    {
        super();
        this.type = null;
    }
}

/**
 * @class
 */
class Signature
{
    constructor()
    {
        this.declaration    = null; // SignatureDeclaration;  // Originating declaration
        this.typeParameters = null; // TypeParameter[];   // Type parameters (undefined if non-generic)
        this.parameters     = null; // Symbol[];               // Parameters
        this.thisParameter  = null; //  Symbol;             // symbol of this-type parameter
        // See comment in `instantiateSignature` for why these are set lazily.
        this.resolvedReturnType = null; // Type | undefined; // Lazily set by `getReturnTypeOfSignature`.
        // Lazily set by `getTypePredicateOfSignature`.
        // `undefined` indicates a type predicate that has not yet been computed.
        // Uses a special `noTypePredicate` sentinel value to indicate that there is no type predicate. This looks like a TypePredicate at runtime to avoid polymorphism.
        this.resolvedTypePredicate   = null; // TypePredicate | undefined;
        this.minArgumentCount        = 0; // number;           // Number of non-optional parameters
        this.hasRestParameter        = false; // boolean;          // True if last parameter is rest parameter
        this.hasLiteralTypes         = false; // boolean;           // True if specialized
        this.target                  = null; // Signature;                 // Instantiation target
        this.mapper                  = null; // TypeMapper;                // Instantiation mapper
        this.unionSignatures         = null; // Signature[];      // Underlying signatures of a union signature
        this.erasedSignatureCache    = null; // Signature;   // Erased version of signature (deferred)
        this.canonicalSignatureCache = null; // Signature; // Canonical version of signature (deferred)
        this.isolatedSignatureType   = null; // ObjectType; // A manufactured type that just contains the signature for purposes of signature comparison
        this.instantiations          = null; // Map<Signature>;    // Generic signature instantiation cache
    }
}

/**
 * @class
 */
class SymbolLinks
{
    constructor()
    {
        this.immediateTarget                = null;           // Immediate target of an alias. May be another alias. Do not access directly, use `checker.getImmediateAliasedSymbol` instead.
        this.target                         = null;                    // Resolved (non-alias) target of an alias
        this.type                           = null;                        // Type of value symbol
        this.declaredType                   = null;                // Type of class, interface, enum, type alias, or type parameter
        this.typeParameters                 = null;   // Type parameters of type alias (undefined if non-generic)
        this.inferredClassType              = null;           // Type of an inferred ES5 class
        this.instantiations                 = null;         // Instantiations of generic type alias (undefined if non-generic)
        this.mapper                         = null;                // Type mapper for instantiation alias
        this.referenced                     = null;               // True if alias symbol has been referenced as a value
        this.containingType                 = null; // Containing union or intersection type for synthetic property
        this.leftSpread                     = null;                // Left source for synthetic spread property
        this.rightSpread                    = null;               // Right source for synthetic spread property
        this.syntheticOrigin                = null;           // For a property on a mapped or spread type, points back to the original property
        this.syntheticLiteralTypeOrigin     = null; // For a property on a mapped type, indicates the type whose text to use as the declaration name, instead of the symbol name
        this.isDiscriminantProperty         = null;   // True if discriminant synthetic property
        this.resolvedExports                = null;      // Resolved exports of module or combined early- and late-bound static members of a class.
        this.resolvedMembers                = null;      // Combined early- and late-bound members of a symbol
        this.exportsChecked                 = null;           // True if exports of external module have been checked
        this.typeParametersChecked          = null;    // True if type parameters of merged class and interface declarations have been checked.
        this.isDeclarationWithCollidingName = null;   // True if symbol is block scoped redeclaration
        this.bindingElement                 = null;    // Binding element associated with property symbol
        this.exportsSomeValue               = null;         // True if module exports some value (not just types)
        this.enumKind                       = null;                // Enum declaration classification
        this.originatingImport              = null; // Import declaration which produced the symbol, present if the symbol is marked as uncallable but had call signatures in `resolveESModuleSymbol`
        this.lateSymbol                     = null;                // Late-bound symbol for a computed property
    }
}

/**
 * @class
 */
class TransientSymbol extends Symbol, SymbolLinks
{
    /**
     * @param {SymbolFlags} flags
     * @param {string} name
     */
    constructor( flags, name )
    {
        super( flags, name );
        this.checkFlags      = CheckFlags();
        this.isRestParameter = false;
    }
}

/**
 * @class
 */
class ReverseMappedSymbol extends TransientSymbol
{
    constructor()
    {
        super();
        this.propertyType = null;
        this.mappedType   = null;
    }
}


/**
 * @param {SymbolFlags} flags
 * @param {string} name
 * @param {?CheckFlags} [checkFlags]
 * @returns {Symbol}
 */
function createSymbol( flags, name, checkFlags = CheckFlags() )
{
    const symbol      = new TransientSymbol( SymbolFlags( flags | SymbolFlags.Transient ), name );
    symbol.checkFlags = CheckFlags( checkFlags );
    return symbol;
}

/**
 * @param {SignatureDeclaration} declaration
 * @param {TypeParameter[]} typeParameters
 * @param {?Symbol} thisParameter
 * @param {Symbol[]} parameters
 * @param {?Type} resolvedReturnType
 * @param {?Type} resolvedTypePredicate - Actually, a TypePredicate
 * @param {number} minArgumentCount
 * @param {boolean} hasRestParameter
 * @param {boolean} hasLiteralTypes
 * @returns {Signature}
 */
function createSignature( declaration, typeParameters, thisParameter, parameters, resolvedReturnType, resolvedTypePredicate, minArgumentCount, hasRestParameter, hasLiteralTypes )
{
    const sig                 = new Signature();
    sig.declaration           = declaration;
    sig.typeParameters        = typeParameters;
    sig.parameters            = parameters;
    sig.thisParameter         = thisParameter;
    sig.resolvedReturnType    = resolvedReturnType;
    sig.resolvedTypePredicate = resolvedTypePredicate;
    sig.minArgumentCount      = minArgumentCount;
    sig.hasRestParameter      = hasRestParameter;
    sig.hasLiteralTypes       = hasLiteralTypes;
    return sig;
}

/**
 *
 * @param {Type} type
 * @param {boolean} isReadonly
 * @param {?SignatureDeclaration} [declaration]
 * @return {IndexInfo}
 */
function createIndexInfo( type, isReadonly, declaration )
{
    return {
        type,
        isReadonly,
        declaration
    };
}

/**
 * @interface Constraints
 * @this Type
 */
const Constraints = {

    /**
     *
     * @param {TypeVariable | UnionOrIntersectionType} type
     * @return {Type}
     */
    getConstraintOfType()
    {
        return this.flags & TypeFlags.TypeParameter
               ? getConstraintOfTypeParameter( this )
               : this.flags & TypeFlags.IndexedAccess
                 ? getConstraintOfIndexedAccess( this )
                 : getBaseConstraintOfType( this );
    },

    /**
     *
     * @param {TypeParameter} typeParameter
     * @return {Type}
     */
    getConstraintOfTypeParameter( typeParameter )
    {
        return hasNonCircularBaseConstraint( typeParameter ) ? getConstraintFromTypeParameter( typeParameter ) : undefined;
    },

    /**
     * @return {*}
     */
    getConstraintOfIndexedAccess()
    {
        const transformed = this.getSimplifiedIndexedAccessType();

        if ( transformed ) return transformed;

        const
            baseObjectType = this.objectType.objectTypegetBaseConstraintOfType(),
            baseIndexType  = this.indexType.getBaseConstraintOfType();


        if ( baseIndexType === stringType && !( baseObjectType || this.objectType ).getIndexInfoOfType( IndexKind.String ) )
        // getIndexedAccessType returns `any` for X[string] where X doesn't have an index signature.
        // to avoid this, return `undefined`.
            return undefined;

        return baseObjectType || baseIndexType ? ( baseObjectType || this.objectType ).getIndexedAccessType( baseIndexType || this.indexType ) : undefined;
    },

    getBaseConstraintOfType()
    {
        if ( this.flags & ( TypeFlags.TypeVariable | TypeFlags.UnionOrIntersection ) )
        {
            const constraint = this.getResolvedBaseConstraint();

            if ( constraint !== noConstraintType && constraint !== circularConstraintType )
                return constraint;
        }
        else if ( this.flags & TypeFlags.Index )
            return stringType;

        return undefined;
    },

    hasNonCircularBaseConstraint()
    {
        return this.getResolvedBaseConstraint() !== circularConstraintType;
    },


    /**
     * Return the resolved base constraint of a type variable. The noConstraintType singleton is returned if the
     * type variable has no constraint, and the circularConstraintType singleton is returned if the constraint
     * circularly references the type variable.
     */
    getResolvedBaseConstraint()
    {
        let circular;

        if ( !this.resolvedBaseConstraint )
        {
            const constraint            = this.getBaseConstraint();
            this.resolvedBaseConstraint = circular ? circularConstraintType : getTypeWithThisArgument( constraint || noConstraintType, this );
        }

        return this.resolvedBaseConstraint;

        function getBaseConstraint( t )
        {
            if ( !pushTypeResolution( t, TypeSystemPropertyName.ResolvedBaseConstraint ) )
            {
                circular = true;
                return undefined;
            }

            const result = computeBaseConstraint( t );

            if ( !popTypeResolution() )
            {
                circular = true;
                return undefined;
            }

            return result;
        }

        function computeBaseConstraint( t )
        {
            if ( t.flags & TypeFlags.TypeParameter )
            {
                const constraint = t.getConstraintFromTypeParameter();

                return t.isThisType || !constraint ? constraint : getBaseConstraint( constraint );
            }

            if ( t.flags & TypeFlags.UnionOrIntersection )
            {
                const
                    types     = t.types,
                    baseTypes = [];

                for ( const type of types )
                {
                    const baseType = getBaseConstraint( type );
                    if ( baseType )
                        baseTypes.push( baseType );
                }

                return t.flags & TypeFlags.Union && baseTypes.length === types.length
                       ? UnionType.getUnionType( baseTypes )
                       : t.flags & TypeFlags.Intersection && baseTypes.length
                         ? IntersectionType.getIntersectionType( baseTypes )
                         : undefined;
            }

            if ( t.flags & TypeFlags.Index )
                return stringType;

            if ( t.flags & TypeFlags.IndexedAccess )
            {
                const transformed = t.getSimplifiedIndexedAccessType();

                if ( transformed )
                    return getBaseConstraint( transformed );

                const
                    baseObjectType    = getBaseConstraint( t.objectType ),
                    baseIndexType     = getBaseConstraint( t.indexType ),
                    baseIndexedAccess = baseObjectType && baseIndexType ? baseObjectType.getIndexedAccessType( baseIndexType ) : undefined;

                return baseIndexedAccess && baseIndexedAccess !== unknownType ? getBaseConstraint( baseIndexedAccess ) : undefined;
            }
            if ( t.isGenericMappedType() )
                return emptyObjectType;

            return t;
        }

    }

};

