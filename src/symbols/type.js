import { arrayFrom, concatenate } from "./array-ish";

Li;
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

/**
 * @typedef {(string & { __escapedIdentifier: void }) | (void & { __escapedIdentifier: void }) | InternalSymbolName | string} __String
 */

import {
    binarySearch, containsIdenticalType,
    containsType,
    idText, implement,
    set_ext_ref
} from "../utils";

import { getNameOfDeclaration } from "./nodes";
import { forEach } from "./array-ish";

import {
    ObjectFlags,
    TypeFlags,
    SymbolFlags,
    InternalSymbolName,
    UnionReduction,
    CheckFlags,
    TypeSystemPropertyName,
    IndexKind, createMapFromTemplate, typeofEQFacts
} from "../types";

import { SyntaxKind } from "../ts/ts-helpers";
import { output }     from "../utils/source-code";

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
set_ext_ref( 'resolvingSymbol', resolvingSymbol );


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

const booleanType         = UnionType.getUnionType( [ trueType, falseType ] );
booleanType.flags |= TypeFlags.Boolean;
booleanType.intrinsicName = 'boolean';

const esSymbolType      = new IntrinsicType( TypeFlags.ESSymbol, "symbol" );
const voidType          = new IntrinsicType( TypeFlags.Void, "void" );
const neverType         = new IntrinsicType( TypeFlags.Never, "never" );
const silentNeverType   = new IntrinsicType( TypeFlags.Never, "never" );
const implicitNeverType = new IntrinsicType( TypeFlags.Never, "never" );
const nonPrimitiveType  = new IntrinsicType( TypeFlags.NonPrimitive, "object" );

[
    {
        name: 'anyType',
        type: anyType
    },
    {
        name: 'autoType',
        type: autoType
    },
    {
        name: 'unknownType',
        type: unknownType
    },
    {
        name: 'undefinedType',
        type: undefinedType
    },
    {
        name: 'undefinedWideningType',
        type: undefinedWideningType
    },
    {
        name: 'nullType',
        type: nullType
    },
    {
        name: 'nullWideningType',
        type: nullWideningType
    },
    {
        name: 'stringType',
        type: stringType
    },
    {
        name: 'numberType',
        type: numberType
    },
    {
        name: 'trueType',
        type: trueType
    },
    {
        name: 'falseType',
        type: falseType
    },
    {
        name: 'booleanType',
        type: booleanType
    },
    {
        name: 'esSymbolType',
        type: esSymbolType
    },
    {
        name: 'voidType',
        type: voidType
    },
    {
        name: 'neverType',
        type: neverType
    },
    {
        name: 'silentNeverType',
        type: silentNeverType
    },
    {
        name: 'implicitNeverType',
        type: implicitNeverType
    },
    {
        name: 'nonPrimitiveType',
        type: nonPrimitiveType
    }
]
    .forEach( ( { name, type } ) => set_ext_ref( name, type ) );

const
    emptySymbols = new Map(),
    emptyArray   = [];

set_ext_ref( 'emptySymbols', emptySymbols );

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

const typeofTypesByName = createMapFromTemplate( {
    string:    stringType,
    number:    numberType,
    boolean:   booleanType,
    symbol:    esSymbolType,
    undefined: undefinedType
} );

const typeofType = createTypeofType();


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

const identityMapper = x => x;


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

let nextTypeId = 1;

const resolutionTargets       = [];
const resolutionResults       = [];
const resolutionPropertyNames = [];

const
    is_primitive = str => [ 'null', 'undefined', 'string', 'number', 'boolean', 'symbol', 'any', 'never' ].includes( str );

/**
 * Push an entry on the type resolution stack. If an entry with the given target and the given property name
 * is already on the stack, and no entries in between already have a type, then a circularity has occurred.
 * In this case, the result values of the existing entry and all entries pushed after it are changed to false,
 * and the value false is returned. Otherwise, the new entry is just pushed onto the stack, and true is returned.
 * In order to see if the same query has already been done before, the target object and the propertyName both
 * must match the one passed in.
 *
 * @param target The symbol, type, or signature whose type is being queried
 * @param propertyName The property name that should be used to query the target for its type
 */
function pushTypeResolution( target, propertyName )
{
    const resolutionCycleStartIndex = findResolutionCycleStartIndex( target, propertyName );

    if ( resolutionCycleStartIndex >= 0 )
    {
        // A cycle was found
        const { length } = resolutionTargets;

        for ( let i = resolutionCycleStartIndex; i < length; i++ )
            resolutionResults[ i ] = false;

        return false;
    }

    resolutionTargets.push( target );
    resolutionResults.push( /*items*/ true );
    resolutionPropertyNames.push( propertyName );

    return true;
}

/**
 * @param  {Type} target
 * @param  {string} propertyName
 * @return {number}
 */
function findResolutionCycleStartIndex( target, propertyName )
{
    for ( let i = resolutionTargets.length - 1; i >= 0; i-- )
    {
        if ( resolutionTargets[ i ].hasType( resolutionPropertyNames[ i ] ) )
            return -1;

        if ( resolutionTargets[ i ] === target && resolutionPropertyNames[ i ] === propertyName )
            return i;
    }

    return -1;
}

/**
 * Pop an entry from the type resolution stack and return its associated result value. The result value will
 * be true if no circularities were detected, or false if a circularity was found.
 *
 * @return {boolean}
 */
function popTypeResolution()
{
    resolutionTargets.pop();
    resolutionPropertyNames.pop();
    return resolutionResults.pop();
}


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
 * @interface Constraints
 * @this Type|UnionOrIntersection|IndexedAccessType
 */
const Constraints = {

    hasNonCircularBaseConstraint()
    {
        return this.getResolvedBaseConstraint() !== circularConstraintType;
    },

    /**
     * Return the resolved base constraint of a type variable. The noConstraintType singleton is returned if the
     * type variable has no constraint, and the circularConstraintType singleton is returned if the constraint
     * circularly references the type variable.
     *
     * @this Type
     * @return {Type}
     */
    getResolvedBaseConstraint()
    {
        let circular;

        if ( !this.resolvedBaseConstraint )
        {
            const constraint            = getBaseConstraint( this );
            this.resolvedBaseConstraint = circular ? circularConstraintType : ( constraint || noConstraintType ).getTypeWithThisArgument( this );
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
                const constraint = t._getConstraint();

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
                    baseIndexedAccess = baseObjectType && baseIndexType ? new IndexedAccessType( baseObjectType, baseIndexType ) : undefined;

                return baseIndexedAccess && baseIndexedAccess !== unknownType ? getBaseConstraint( baseIndexedAccess ) : undefined;
            }

            if ( t.isGenericMappedType() )
                return emptyObjectType;

            return t;
        }
    }

};

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
 * @class Type
 * @implements Constraints
 */
export class Type
{
    /**
     * @param {TypeFlags} flags
     */
    constructor( flags )
    {
        console.log( `Create new type: "${this.constructor.name}"` );
        this.primitive = null;
        this.name      = null;
        this.parent    = null;

        /** @type {TypeFlags} */
        this.flags = flags;
        this._id = 0;
        /** @type {?Symbol} */
        this.symbol = null;
        // this.pattern = null; // Omitted for now
        /** @type {?Symbol} */
        this.aliasSymbol = null;
        /** @type {Type[]} */
        this.aliasTypeArguments = null;
        this._id = nextTypeId++;
    }

    get flags()
    {
        return this._flags || ( this._flags = TypeFlags() );
    }

    set flags( v )
    {
        this._flags = TypeFlags( v );
    }

    /**
     * @return {number}
     */
    get id()
    {
        return this._id;
    }

    isTypeUsableAsLateBoundName()
    {
        return !!( this.flags & TypeFlags.StringOrNumberLiteralOrUnique );
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

    getObjectFlags()
    {
        return this.flags & TypeFlags.Object ? this.objectFlags : 0;
    }

    getTypeWithThisArgument()
    {
        return this;
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
               ? t.getApparentType()
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

    isGenericIndexType()
    {
        return this.flags & ( TypeFlags.TypeVariable | TypeFlags.Index )
               ? true
               : this.flags & TypeFlags.UnionOrIntersection
                 ? forEach( this.types, t => t.isGenericIndexType() )
                 : false;
    }

    /**
     * Return true if the given type is a non-generic object type with a string index signature and no
     * other members.
     */
    isStringIndexOnlyType()
    {
        if ( this.flags & TypeFlags.Object && !this.isGenericMappedType() )
        {
            const t = this.resolveStructuredTypeMembers();

            return t.properties.length === 0 && t.callSignatures.length === 0 && t.constructSignatures.length === 0 &&
                   t.stringIndexInfo && !t.numberIndexInfo;
        }

        return false;
    }

    isGenericMappedType()
    {
        return this.getObjectFlags() & ObjectFlags.Mapped && this.getConstraintType().isGenericIndexType();
    }

    resolveStructuredTypeMembers()
    {
        if ( !this.members )
        {
            if ( this.flags & TypeFlags.Object )
            {
                if ( this.objectFlags & ObjectFlags.Reference )
                    this.resolveTypeReferenceMembers();
                else if ( this.objectFlags & ObjectFlags.ClassOrInterface )
                    this.resolveClassOrInterfaceMembers();
                else if ( this.objectFlags & ObjectFlags.ReverseMapped )
                    this.resolveReverseMappedTypeMembers();
                else if ( this.objectFlags & ObjectFlags.Anonymous )
                    this.resolveAnonymousTypeMembers();
                else if ( this.objectFlags & ObjectFlags.Mapped )
                    this.resolveMappedTypeMembers();
            }
            else if ( this.flags & TypeFlags.Union )
                this.resolveUnionTypeMembers();
            else if ( this.flags & TypeFlags.Intersection )
                this.resolveIntersectionTypeMembers();
        }

        return this;
    }

    /** Return properties of an object type or an empty array for other types */
    getPropertiesOfObjectType()
    {
        return this.flags & TypeFlags.Object ? this.resolveStructuredTypeMembers().properties : emptyArray;
    }

    /** If the given type is an object type and that type has a property by the given name,
     * return the symbol for that property. Otherwise return undefined.
     */
    getPropertyOfObjectType( type, name )
    {
        if ( this.flags & TypeFlags.Object )
        {
            const
                resolved = this.resolveStructuredTypeMembers(),
                symbol   = resolved.members.get( name );

            if ( symbol && symbol.symbolIsValue() )
                return symbol;
        }
    }

    getPropertiesOfUnionOrIntersectionType()
    {
        if ( !this.resolvedProperties )
        {
            const members = new Map();

            for ( const current of this.types )
            {
                for ( const prop of current.getPropertiesOfType() )
                {
                    if ( !members.has( prop.escapedName ) )
                    {
                        const combinedProp = this.getPropertyOfUnionOrIntersectionType( prop.escapedName );

                        if ( combinedProp )
                            members.set( prop.escapedName, combinedProp );
                    }
                }
                // The properties of a union type are those that are present in all constituent types, so
                // we only need to check the properties of the first type
                if ( this.flags & TypeFlags.Union )
                    break;
            }

            this.resolvedProperties = getNamedMembers( members );
        }

        return this.resolvedProperties;
    }

    getPropertiesOfType()
    {
        const type = this.getApparentType();

        return type.flags & TypeFlags.UnionOrIntersection
               ? type.getPropertiesOfUnionOrIntersectionType()
               : type.getPropertiesOfObjectType();
    }

    getAllPossiblePropertiesOfTypes( types )
    {
        const unionType = UnionType.getUnionType( types );

        if ( !( unionType.flags & TypeFlags.Union ) )
            return unionType.getAugmentedPropertiesOfType();

        const props = new Map();

        for ( const memberType of types )
        {
            for ( const { escapedName } of memberType.getAugmentedPropertiesOfType() )
            {
                if ( !props.has( escapedName ) )
                {
                    props.set( escapedName, createUnionOrIntersectionProperty( unionType, escapedName ) );
                }
            }
        }

        return Array.from( props.values() );
    }

    getConstraintOfType()
    {
        return this.flags & TypeFlags.TypeParameter
               ? this.getConstraint()
               : this.flags & TypeFlags.IndexedAccess
                 ? this.getConstraint()
                 : this.getBaseConstraint();
    }

    getConstraint( type )
    {
        const transformed = this.getSimplifiedIndexedAccessType();
        if ( transformed )
            return transformed;

        const
            baseObjectType = type.objectType.getBaseConstraintOfType(),
            baseIndexType  = type.indexType.getBaseConstraintOfType();

        if ( baseIndexType === stringType && !getIndexInfoOfType( baseObjectType || type.objectType, IndexKind.String ) )
        // getIndexedAccessType returns `any` for X[string] where X doesn't have an index signature.
        // to avoid this, return `undefined`.
            return undefined;

        return ( baseObjectType || baseIndexType ) ? new IndexedAccessType( baseObjectType || type.objectType, baseIndexType || type.indexType ) : undefined;
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

    getTypeParameter()
    {
        return this.typeParameter ||
               ( this.typeParameter = this.declaration.typeParameter.getSymbolOfNode().getDeclaredTypeOfTypeParameter() );
    }

    getConstraintType()
    {
        return this.constraintType ||
               ( this.constraintType = instantiateType( this.getTypeParameter().getConstraintOfTypeParameter(), this.mapper || identityMapper ) || unknownType );
    }

    getTemplateType()
    {
        return this.templateType ||
               ( this.templateType = this.declaration.type
                                     ? instantiateType( addOptionality( this.declaration.type.getTypeFromTypeNode(), !!this.declaration.questionToken ), this.mapper || identityMapper )
                                     : unknownType );
    }

    getModifiersType()
    {
        if ( !this.modifiersType )
        {
            const constraintDeclaration = this.declaration.typeParameter.constraint;

            if ( constraintDeclaration.kind === SyntaxKind.TypeOperator && constraintDeclaration.operator === SyntaxKind.KeyOfKeyword )
            {
                // If the constraint declaration is a 'keyof T' node, the modifiers type is T. We check
                // AST nodes here because, when T is a non-generic type, the logic below eagerly resolves
                // 'keyof T' to a literal union type and we can't recover T from that type.
                this.modifiersType = instantiateType( constraintDeclaration.type.getTypeFromTypeNode(), this.mapper || identityMapper );
            }
            else
            {
                // Otherwise, get the declared constraint type, and if the constraint type is a type parameter,
                // get the constraint of that type parameter. If the resulting type is an indexed type 'keyof T',
                // the modifiers type is T. Otherwise, the modifiers type is {}.
                const
                    declaredType       = this.declaration.getTypeFromMappedTypeNode(),
                    constraint         = declaredType.getConstraintType(),
                    extendedConstraint = constraint && constraint.flags & TypeFlags.TypeParameter
                                         ? constraint.getConstraintOfTypeParameter()
                                         : constraint;

                this.modifiersType =
                    extendedConstraint && extendedConstraint.flags & TypeFlags.Index
                    ? instantiateType( extendedConstraint.type, this.mapper || identityMapper ) : emptyObjectType;
            }
        }
        return this.modifiersType;
    }
}

implement( Type, Constraints );

/**
 * @class
 */
class TypeParameter extends Type
{
    /**
     * @param {?Symbol} [symbol]
     * @param {?Symbol} [target]
     */
    constructor( symbol, target )
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
    /**
     * @param {TypeFlags|number} flags
     * @param {string|number} value
     * @param {Symbol} symbol
     */
    constructor( flags, value, symbol )
    {
        super( flags );

        this.value       = value;     // Value of literal
        this.symbol      = symbol;
        this.freshType   = null;    // Fresh version of type
        this.regularType = null;  // Regular version of type
    }

    getFreshType()
    {
        if ( !( this.flags & TypeFlags.FreshLiteral ) )
        {
            if ( !this.freshType )
            {
                const freshType       = new LiteralType( this.flags | TypeFlags.FreshLiteral, this.value, this.symbol );
                freshType.regularType = this;
                this.freshType        = freshType;
            }

            return this.freshType;
        }

        return this;
    }

    getRegularType()
    {
        return this.regularType;
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
 * @class ObjectType
 * @extends Type
 */
class ObjectType extends Type
{
    /**
     * @param {ObjectFlags} flags
     * @param {Symbol} symbol
     */
    constructor( flags, symbol )
    {
        super( TypeFlags.Object );

        /** @type {ObjectFlags|number} */
        this.objectFlags = flags;
        this.symbol = symbol;

        // From ResolvedType
        this.members             = null;              // Properties by name
        this.properties          = null;              // Properties
        this.callSignatures      = null;       // Call signatures of type
        this.constructSignatures = null;  // Construct signatures of type
        this.stringIndexInfo     = null;       // String indexing info
        this.numberIndexInfo     = null;       // Numeric indexing info
    }

    isGenericObjectType()
    {
        return false;
    }

    isGenericIndexType()
    {
        return false;
    }

    /**
     * @return {ObjectFlags|number}
     */
    get objectFlags()
    {
        return this._objectFlags || ( this._objectFlags = ObjectFlags() );
    }

    /**
     * @param {ObjectFlags|number} v
     */
    set objectFlags( v )
    {
        this._objectFlags = ObjectFlags( v );
    }

    setStructuredTypeMembers( members, callSignatures, constructSignatures, stringIndexInfo, numberIndexInfo )
    {
        this.members             = members;
        this.callSignatures      = callSignatures;
        this.constructSignatures = constructSignatures;
        this.stringIndexInfo     = stringIndexInfo;
        this.numberIndexInfo     = numberIndexInfo;
    }

    getIndexInfoOfStructuredType( kind )
    {
        if ( this.flags & TypeFlags.StructuredType )
        {
            const resolved = this.resolveStructuredTypeMembers();

            return kind === IndexKind.String ? resolved.stringIndexInfo : resolved.numberIndexInfo;
        }
    }

    getIndexTypeOfStructuredType( kind )
    {
        const info = this.getIndexInfoOfStructuredType( kind );
        return info && info.type;
    }

    /**
     * @param {InterfaceTypeWithDeclaredMembers} source
     * @param {Array<TypeParameter>} typeParameters
     * @param {Type[]} typeArguments
     */
    resolveObjectTypeMembers( source, typeParameters, typeArguments )
    {
        let mapper,
            members, // SymbolTable;
            callSignatures, // Signature[];
            constructSignatures, // Signature[];
            stringIndexInfo, // IndexInfo;
            numberIndexInfo; // IndexInfo;

        if ( rangeEquals( typeParameters, typeArguments, 0, typeParameters.length ) )
        {
            mapper              = identityMapper;
            members             = source.symbol ? getMembersOfSymbol( source.symbol ) : createSymbolTable( source.declaredProperties );
            callSignatures      = source.declaredCallSignatures;
            constructSignatures = source.declaredConstructSignatures;
            stringIndexInfo     = source.declaredStringIndexInfo;
            numberIndexInfo     = source.declaredNumberIndexInfo;
        }
        else
        {
            mapper              = createTypeMapper( typeParameters, typeArguments );
            members             = createInstantiatedSymbolTable( source.declaredProperties, mapper, /*mappingThisOnly*/ typeParameters.length === 1 );
            callSignatures      = instantiateSignatures( source.declaredCallSignatures, mapper );
            constructSignatures = instantiateSignatures( source.declaredConstructSignatures, mapper );
            stringIndexInfo     = instantiateIndexInfo( source.declaredStringIndexInfo, mapper );
            numberIndexInfo     = instantiateIndexInfo( source.declaredNumberIndexInfo, mapper );
        }

        const baseTypes = getBaseTypes( source );

        if ( baseTypes.length )
        {
            if ( source.symbol && members === getMembersOfSymbol( source.symbol ) )
                members = createSymbolTable( source.declaredProperties );

            this.setStructuredTypeMembers( members, callSignatures, constructSignatures, stringIndexInfo, numberIndexInfo );

            const thisArgument = lastOrUndefined( typeArguments );

            for ( const baseType of baseTypes )
            {
                const instantiatedBaseType = thisArgument ? getTypeWithThisArgument( instantiateType( baseType, mapper ), thisArgument ) : baseType;
                addInheritedMembers( members, getPropertiesOfType( instantiatedBaseType ) );
                callSignatures      = concatenate( callSignatures, getSignaturesOfType( instantiatedBaseType, SignatureKind.Call ) );
                constructSignatures = concatenate( constructSignatures, getSignaturesOfType( instantiatedBaseType, SignatureKind.Construct ) );
                if ( !stringIndexInfo )
                    stringIndexInfo = instantiatedBaseType === anyType ?
                                      createIndexInfo( anyType, /*isReadonly*/ false ) :
                                      getIndexInfoOfType( instantiatedBaseType, IndexKind.String );

                numberIndexInfo = numberIndexInfo || getIndexInfoOfType( instantiatedBaseType, IndexKind.Number );
            }
        }
        this.setStructuredTypeMembers( members, callSignatures, constructSignatures, stringIndexInfo, numberIndexInfo );
    }
}


// Return the indexing info of the given kind in the given type. Creates synthetic union index types when necessary and
// maps primitive types and type parameters are to their apparent types.
function getIndexInfoOfType( type, kind )
{
    return type.getApparentType().getIndexInfoOfStructuredType( kind );
}

/**
 * We represent tuple types as type references to synthesized generic interface types created by
 * this function. The types are of the form:
 *
 *   `interface Tuple<T0, T1, T2, ...> extends Array<T0 | T1 | T2 | ...> { 0: T0, 1: T1, 2: T2, ... }`
 *
 * Note that the generic type created by this function has no symbol associated with it. The same
 * is true for each of the synthesized type parameters.
 *
 * @param {number} arity
 * @return {GenericType}
 */
function createTupleTypeOfArity( arity )
{
    const
        typeParameters = [],
        properties     = [];

    for ( let i = 0; i < arity; i++ )
    {
        const typeParameter = new TypeParameter();

        typeParameters.push( typeParameter );

        const property = createSymbol( SymbolFlags.Property, "" + i );

        property.type = typeParameter;
        properties.push( property );
    }

    const lengthSymbol = createSymbol( SymbolFlags.Property, "length" );

    lengthSymbol.type = getLiteralType( arity );
    properties.push( lengthSymbol );
    const type               = createObjectType( ObjectFlags.Tuple | ObjectFlags.Reference );
    type.typeParameters      = typeParameters;
    type.outerTypeParameters = undefined;
    type.localTypeParameters = typeParameters;
    type.instantiations      = new Map();
    type.instantiations.set( getTypeListId( type.typeParameters ), type );
    type.target                      = type;
    type.typeArguments               = type.typeParameters;
    type.thisType                    = new TypeParameter();
    type.thisType.isThisType         = true;
    type.thisType.constraint         = type;
    type.declaredProperties          = properties;
    type.declaredCallSignatures      = emptyArray;
    type.declaredConstructSignatures = emptyArray;
    type.declaredStringIndexInfo     = undefined;
    type.declaredNumberIndexInfo     = undefined;
    return type;
}

/**
 * @param {number} arity
 * @return {GenericType}
 */
function getTupleTypeOfArity( arity )
{
    return tupleTypes[ arity ] || ( tupleTypes[ arity ] = createTupleTypeOfArity( arity ) );
}

/**
 * @param {Type[]} elementTypes
 * @return {TypeReference}
 */
function createTupleType( elementTypes )
{
    return createTypeReference( getTupleTypeOfArity( elementTypes.length ), elementTypes );
}

/**
 * @param {TupleTypeNode} node
 * @return {Type}
 */
function getTypeFromTupleTypeNode( node )
{
    const links = getNodeLinks( node );

    if ( !links.resolvedType )
        links.resolvedType = createTupleType( node.elementTypes.map( getTypeFromTypeNode ) );

    return links.resolvedType;
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

    /**
     * @return {InterfaceTypeWithDeclaredMembers}
     */
    resolveDeclaredMembers()
    {
        const
            intr = new InterfaceTypeWithDeclaredMembers( this.flags, this.symbol );

        Object.assign( intr, this );
        Object.setPrototypeOf( intr, this );

        return intr.resolveMembers();
    }
}

class InterfaceTypeWithDeclaredMembers extends InterfaceType
{
    resolveMembers()
    {
        if ( !this.declaredProperties )
        {
            const symbol                     = this.symbol;
            const members                    = symbol.getMembers();
            this.declaredProperties          = getNamedMembers( members );
            this.declaredCallSignatures      = members.get( InternalSymbolName.Call ).getSignaturesOfSymbol();
            this.declaredConstructSignatures = members.get( InternalSymbolName.New ).getSignatures();
            this.declaredStringIndexInfo     = symbol.getIndexInfo( IndexKind.String );
            this.declaredNumberIndexInfo     = symbol.getIndexInfo( IndexKind.Number );
        }

        return this;
    }

    constructor( objectFlags, symbol )
    {
        super( objectFlags, symbol );

        /** @type {?Array<Symbol>} */
        this.declaredProperties = null;
        /** @type {?Array<Signature>} */
        this.declaredCallSignatures = null;
        /** @type {?Array<Signature>} */
        this.declaredConstructSignatures = null;
        /** @type {?IndexInfo} */
        this.declaredStringIndexInfo = null;
        /** @type {?IndexInfo} */
        this.declaredNumberIndexInfo = null;
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
class TypeReference extends ObjectType
{
    /**
     * @param {GenericType} target
     * @param {Type[]} typeArgs
     */
    constructor( target, typeArgs )
    {
        super( ObjectFlags.Reference, target.symbol );
        this.target        = target;    // Type reference target
        this.typeArguments = typeArgs;  // Type reference type arguments (undefined if none)
    }

    resolveMembers()
    {
        const
            source         = this.target.resolveDeclaredMembers(),
            typeParameters = concatenate( source.typeParameters, [ source.thisType ] );

        const typeArguments = this.typeArguments && this.typeArguments.length === typeParameters.length ?
                              this.typeArguments : concatenate( this.typeArguments, [ this ] );
        super.resolveMembers( source, typeParameters, typeArguments );
    }

    /**
     * @param thisArgument
     */
    getTypeWithThisArgument( thisArgument )
    {
        const
            target        = this.target,
            typeArguments = this.typeArguments;

        if ( length( target.typeParameters ) === length( typeArguments ) )
            return createTypeReference( target, concatenate( typeArguments, [ thisArgument || target.thisType ] ) );

        return this;
    }
}

/**
 * @param {GenericType} target
 * @param {Type[]} typeArguments
 * @return {TypeReference}
 */
function createTypeReference( target, typeArguments )
{
    const id = getTypeListId( typeArguments );

    let type = target.instantiations.get( id );

    if ( !type )
    {
        type = new TypeReference( target, typeArguments );
        target.instantiations.set( id, type );
        type.flags |= typeArguments ? getPropagatingFlagsOfTypes( typeArguments, /*excludeKinds*/ 0 ) : 0;
    }

    return type;
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
 * @implements Constraints
 */
class UnionOrIntersectionType extends Type
{
    constructor( flags )
    {
        super( flags );
        /** @type {?Array<Type>} */
        this.types = null;                    // Constituent types
        this.propertyCache             = new Map();       // Cache of resolved properties
        this.resolvedProperties        = null;
        this.resolvedIndexType         = null;
        this.resolvedBaseConstraint    = null;
        this.couldContainTypeVariables = false;
    }

    getBaseConstraint()
    {
        const constraint = this.getResolvedBaseConstraint();

        if ( constraint !== noConstraintType && constraint !== circularConstraintType )
            return constraint;
    }

    isGenericObjectType()
    {
        return this.types.forEach( t => t.isGenericObjectType() );
    }

    isGenericIndexType()
    {
        forEach( this.types, t => t.isGenericIndexType() );
    }
}

implement( UnionOrIntersectionType, Constraints );


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

set_ext_ref( 'UnionType', UnionType );

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

    getApparentType()
    {
        return this.resolvedApparentType || ( this.resolvedApparentType = this.getTypeWithThisArgument( this ) );
    }

    getTypeWithThisArgument( thisArgument )
    {
        return InterfaceType.getIntersectionType( this.types.map( t => t.getTypeWithThisArgument( thisArgument ) ) );
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

    /**
     * Converts an AnonymousType to a ResolvedType.
     */
    resolveAnonymousTypeMembers()
    {
        const symbol = type.symbol;
        if ( this.target )
        {
            const members             = createInstantiatedSymbolTable( this.target.getPropertiesOfObjectType(), this.mapper, /*mappingThisOnly*/ false );
            const callSignatures      = instantiateSignatures( this.target.getSignaturesOfType( SignatureKind.Call ), this.mapper );
            const constructSignatures = instantiateSignatures( getSignaturesOfType( SignatureKind.Construct ), this.mapper );
            const stringIndexInfo     = instantiateIndexInfo( getIndexInfoOfType( this.target, IndexKind.String ), this.mapper );
            const numberIndexInfo     = instantiateIndexInfo( getIndexInfoOfType( this.target, IndexKind.Number ), this.mapper );
            this.setStructuredTypeMembers( members, callSignatures, constructSignatures, stringIndexInfo, numberIndexInfo );
        }
        else if ( symbol.flags & SymbolFlags.TypeLiteral )
        {
            const members             = symbol.getMembers( symbol );
            const callSignatures      = symbol.getSignatures( members.get( InternalSymbolName.Call ) );
            const constructSignatures = symbol.getSignatures( members.get( InternalSymbolName.New ) );
            const stringIndexInfo     = symbol.getIndexInfo( IndexKind.String );
            const numberIndexInfo     = symbol.getIndexInfo( IndexKind.Number );
            this.setStructuredTypeMembers( members, callSignatures, constructSignatures, stringIndexInfo, numberIndexInfo );
        }
        else
        {
            // Combinations of function, class, enum and module
            let members                    = emptySymbols;
            let stringIndexInfo: IndexInfo = undefined;
            if ( symbol.exports )
            {
                members = getExportsOfSymbol( symbol );
            }
            setStructuredTypeMembers( type, members, emptyArray, emptyArray, undefined, undefined );
            if ( symbol.flags & SymbolFlags.Class )
            {
                const classType           = getDeclaredTypeOfClassOrInterface( symbol );
                const baseConstructorType = getBaseConstructorTypeOfClass( classType );
                if ( baseConstructorType.flags & ( TypeFlags.Object | TypeFlags.Intersection | TypeFlags.TypeVariable ) )
                {
                    members = createSymbolTable( getNamedMembers( members ) );
                    addInheritedMembers( members, getPropertiesOfType( baseConstructorType ) );
                }
                else if ( baseConstructorType === anyType )
                {
                    stringIndexInfo = createIndexInfo( anyType, /*isReadonly*/ false );
                }
            }
            const numberIndexInfo = symbol.flags & SymbolFlags.Enum ? enumNumberIndexInfo : undefined;
            setStructuredTypeMembers( type, members, emptyArray, emptyArray, stringIndexInfo, numberIndexInfo );
            // We resolve the members before computing the signatures because a signature may use
            // typeof with a qualified name expression that circularly references the type we are
            // in the process of resolving (see issue #6072). The temporarily empty signature list
            // will never be observed because a qualified name can't reference signatures.
            if ( symbol.flags & ( SymbolFlags.Function | SymbolFlags.Method ) )
                this.callSignatures = getSignaturesOfSymbol( symbol );

            // And likewise for construct signatures for classes
            if ( symbol.flags & SymbolFlags.Class )
            {
                const classType         = getDeclaredTypeOfClassOrInterface( symbol );
                let constructSignatures = getSignaturesOfSymbol( symbol.members.get( InternalSymbolName.Constructor ) );
                if ( !constructSignatures.length )
                    constructSignatures = getDefaultConstructSignatures( classType );
                this.constructSignatures = constructSignatures;
            }
        }
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

    getTypeParameter()
    {
        return this.typeParameter ||
               ( this.typeParameter = this.declaration.typeParameter.getSymbolOfNode().getDeclaredTypeOfTypeParameter() );
    }

    getConstraintType()
    {
        return this.constraintType ||
               ( this.constraintType = instantiateType( this.getTypeParameter().getConstraintOfTypeParameter(), this.mapper || identityMapper ) || unknownType );
    }

    getTemplateType()
    {
        return this.templateType ||
               ( this.templateType = this.declaration.type
                                     ? instantiateType( addOptionality( this.declaration.type.getTypeFromTypeNode(), !!this.declaration.questionToken ), this.mapper || identityMapper )
                                     : unknownType );
    }

    isGenericObjectType()
    {
        return this.getConstraintType().isGenericIndexType();
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

    getBaseConstraint()
    {
        const constraint = this.getResolvedBaseConstraint();

        if ( constraint !== noConstraintType && constraint !== circularConstraintType )
            return constraint;

        return undefined;
    }

    isGenericObjectType()
    {
        return true;
    }

    isGenericIndexType()
    {
        return true;
    }
}

implement( TypeVariable, Constraints );

/**
 * Type parameters (TypeFlags.TypeParameter)
 * @class
 */
class TypeParameter extends TypeVariable
{
    constructor()
    {
        super( TypeFlags.TypeParameter );
        /** Retrieve using getConstraintFromTypeParameter */
        this.constraint = null;
        this.default             = null;
        this.target              = null;  // Instantiation target
        this.mapper              = null;     // Instantiation mapper
        this.isThisType          = false;
        this.resolvedDefaultType = null;
    }

    getConstraint()
    {
        return this.hasNonCircularBaseConstraint() ? this._getConstraint() : undefined;
    }

    getConstraintDeclaration()
    {
        return this.symbol && this.symbol.getDeclarationOfKind( SyntaxKind.TypeParameter ).constraint;
    }

    _getConstraint()
    {
        if ( !this.constraint )
        {
            if ( this.target )
            {
                const targetConstraint = this.target.getConstraint();
                this.constraint        = targetConstraint ? instantiateType( targetConstraint, this.mapper ) : noConstraintType;
            }
            else
            {
                const constraintDeclaration = this.getConstraintDeclaration();
                this.constraint             = constraintDeclaration ? constraintDeclaration.getTypeFromTypeNode() : noConstraintType;
            }
        }

        return this.constraint === noConstraintType ? undefined : this.constraint;
    }
}

/**
 * Indexed access types (TypeFlags.IndexedAccess)
 * Possible forms are T[xxx], xxx[T], or xxx[keyof T], where T is a type variable
 *
 * @class
 * @implements Constraints
 */
class IndexedAccessType extends TypeVariable
{
    constructor( objectType, indexType )
    {
        super( TypeFlags.IndexedAccess );
        /** @type {ObjectType} */
        this.objectType = objectType;
        /** @type {IndexType} */
        this.indexType = indexType;
        /** @type {Type} */
        this.constraint = null;
    }

    static getIndexedAccessType( objectType, indexType, accessNode )
    {
        // If the index type is generic, or if the object type is generic and doesn't originate in an expression,
        // we are performing a higher-order index access where we cannot meaningfully access the properties of the
        // object type. Note that for a generic T and a non-generic K, we eagerly resolve T[K] if it originates in
        // an expression. This is to preserve backwards compatibility. For example, an element access 'this["foo"]'
        // has always been resolved eagerly using the constraint type of 'this' at the given location.
        if ( indexType.isGenericIndexType() || !( accessNode && accessNode.kind === SyntaxKind.ElementAccessExpression ) && objectType.isGenericObjectType() )
        {
            if ( objectType.flags & TypeFlags.Any )
                return objectType;

            // Defer the operation by creating an indexed access type.
            const id = objectType.id + "," + indexType.id;

            let type = indexedAccessTypes.get( id );

            if ( !type )
                indexedAccessTypes.set( id, type = new IndexedAccessType( objectType, indexType ) );

            return type;
        }

        // In the following we resolve T[K] to the type of the property in T selected by K.
        // We treat boolean as different from other unions to improve errors;
        // skipping straight to getPropertyTypeForIndexType gives errors with 'boolean' instead of 'true'.
        const apparentObjectType = objectType.getApparentType();

        if ( indexType.flags & TypeFlags.Union && !( indexType.flags & TypeFlags.Boolean ) )
        {
            const propTypes = [];

            for ( const t of indexType.types )
            {
                const propType = IndexedAccessType.getPropertyTypeForIndexType( apparentObjectType, t, accessNode, /*cacheSymbol*/ false );

                if ( propType === unknownType )
                    return unknownType;

                propTypes.push( propType );
            }

            return UnionType.getUnionType( propTypes );
        }

        return IndexedAccessType.getPropertyTypeForIndexType( apparentObjectType, indexType, accessNode, /*cacheSymbol*/ true );
    }

    static getPropertyTypeForIndexType( objectType, indexType, accessNode, cacheSymbol )
    {
        const
            accessExpression = accessNode && accessNode.kind === SyntaxKind.ElementAccessExpression ? accessNode : undefined,

            propName         = isTypeUsableAsLateBoundName( indexType )
                               ? getLateBoundNameFromType( indexType )
                               : accessExpression && checkThatExpressionIsProperSymbolReference( accessExpression.argumentExpression, indexType )
                                 ? getPropertyNameForKnownSymbolName( idText( accessExpression.argumentExpression.name ) )
                                 : undefined;

        if ( propName !== undefined )
        {
            const prop = objectType.getPropertyOfType( propName );

            if ( prop )
            {
                if ( accessExpression )
                {
                    prop.markPropertyAsReferenced( accessExpression, /*isThisAccess*/ accessExpression.expression.kind === SyntaxKind.ThisKeyword );

                    if ( cacheSymbol )
                        getNodeLinks( accessNode ).resolvedSymbol = prop;
                }

                return prop.getTypeOfSymbol();
            }
        }

        if ( !( indexType.flags & TypeFlags.Nullable ) && indexType.isTypeAssignableToKind( TypeFlags.StringLike | TypeFlags.NumberLike | TypeFlags.ESSymbolLike ) )
        {
            if ( objectType.isTypeAny() )
                return anyType;

            const indexInfo = indexType.isTypeAssignableToKind( TypeFlags.NumberLike ) && objectType.getIndexInfoOfType( IndexKind.Number ) ||
                              objectType.getIndexInfoOfType( IndexKind.String ) || undefined;

            if ( indexInfo )
                return indexInfo.type;

            if ( accessExpression && !objectType.isConstEnumObjectType() )
                return anyType;
        }

        if ( accessNode )
            return unknownType;

        return anyType;
    }

    /**
     * Transform an indexed access to a simpler form, if possible. Return the simpler form, or return
     * undefined if no transformation is possible.
     */
    getSimplifiedIndexedAccessType()
    {
        const objectType = this.objectType;
        // Given an indexed access type T[K], if T is an intersection containing one or more generic types and one or
        // more object types with only a string index signature, e.g. '(U & V & { [x: string]: D })[K]', return a
        // transformed type of the form '(U & V)[K] | D'. This allows us to properly reason about higher order indexed
        // access types with default property values as expressed by D.
        if ( objectType.flags & TypeFlags.Intersection && objectType.isGenericObjectType() && objectType.types.some( t => t.isStringIndexOnlyType() ) )
        {
            const
                regularTypes     = [],
                stringIndexTypes = [];

            for ( const t of objectType.types )
            {
                if ( t.isStringIndexOnlyType() )
                    stringIndexTypes.push( t.getIndexTypeOfType( IndexKind.String ) );
                else
                    regularTypes.push( t );
            }
            return UnionType.getUnionType( [
                IndexedAccessType.getIndexedAccessType( IntersectionType.getIntersectionType( regularTypes ), this.indexType ),
                IntersectionType.getIntersectionType( stringIndexTypes )
            ] );
        }
        // If the object type is a mapped type { [P in K]: E }, where K is generic, instantiate E using a mapper
        // that substitutes the index type for P. For example, for an index access { [P in K]: Box<T[P]> }[X], we
        // construct the type Box<T[X]>.
        if ( objectType.isGenericMappedType() )
            return objectType.substituteIndexedMappedType( this );

        if ( objectType.flags & TypeFlags.TypeParameter )
        {
            const constraint = objectType.getConstraint();
            if ( constraint && constraint.isGenericMappedType() )
                return constraint.substituteIndexedMappedType( this );
        }
        return undefined;
    }

    substituteIndexedMappedType( objectType )
    {
        const
            mapper           = createTypeMapper( [ objectType.getTypeParameter() ], [ this.indexType ] ),
            objectTypeMapper = objectType.mapper,
            templateMapper   = objectTypeMapper ? combineTypeMappers( objectTypeMapper, mapper ) : mapper;

        return instantiateType( getTemplateTypeFromMappedType( objectType ), templateMapper );
    }

    /**
     * @this IndexedAccessType
     * @return {*}
     */
    getConstraint()
    {
        const transformed = this.getSimplifiedIndexedAccessType();

        if ( transformed ) return transformed;

        const
            baseObjectType = this.getBaseConstraint( this.objectType ),
            baseIndexType  = this.getBaseConstraint( this.indexType );


        if ( baseIndexType === stringType && !( baseObjectType || this.objectType ).getIndexInfoOfType( IndexKind.String ) )
        // getIndexedAccessType returns `any` for X[string] where X doesn't have an index signature.
        // to avoid this, return `undefined`.
            return undefined;

        return baseObjectType || baseIndexType ? IndexedAccessType.getIndexedAccessType( baseObjectType || this.objectType, baseIndexType || this.indexType ) : undefined;
    }
}

implement( IndexedAccessType, Constraints );

function makeUnaryTypeMapper( source, target )
{
    return t => t === source ? target : t;
}

function makeBinaryTypeMapper( source1, target1, source2, target2 )
{
    return t => t === source1 ? target1 : t === source2 ? target2 : t;
}

/**
 *
 * @param {Type[]} sources
 * @param {Type[]} targets
 * @return {function(Type)}
 */
function makeArrayTypeMapper( sources, targets )
{
    return t => {
        for ( let i = 0; i < sources.length; i++ )
        {
            if ( t === sources[ i ] )
                return targets ? targets[ i ] : anyType;
        }
        return t;
    };
}

/**
 * @param {TypeParameter[]} sources
 * @param {Type[]} targets
 * @return {TypeMapper}
 */
function createTypeMapper( sources, targets )
{
    assert( targets === undefined || sources.length === targets.length );

    return sources.length === 1
           ? makeUnaryTypeMapper( sources[ 0 ], targets ? targets[ 0 ] : anyType )
           : sources.length === 2
             ? makeBinaryTypeMapper( sources[ 0 ], targets ? targets[ 0 ] : anyType, sources[ 1 ], targets ? targets[ 1 ] : anyType )
             : makeArrayTypeMapper( sources, targets );
}


/**
 * Indicates whether a type can be used as a late-bound name.
 */
function isTypeUsableAsLateBoundName( type )
{
    return !!( type.flags & TypeFlags.StringOrNumberLiteralOrUnique );
}

/**
 * Indicates whether a declaration name is definitely late-bindable.
 * A declaration name is only late-bindable if:
 * - It is a `ComputedPropertyName`.
 * - Its expression is an `Identifier` or either a `PropertyAccessExpression` an
 * `ElementAccessExpression` consisting only of these same three types of nodes.
 * - The type of its expression is a string or numeric literal type, or is a `unique symbol` type.
 */
function isLateBindableName( node )
{
    return isComputedPropertyName( node )
           && isEntityNameExpression( node.expression )
           && isTypeUsableAsLateBoundName( checkComputedPropertyName( node ) );
}

/**
 * Indicates whether a declaration has a late-bindable dynamic name.
 */
function hasLateBindableName( node )
{
    const name = getNameOfDeclaration( node );
    return name && isLateBindableName( name );
}

/**
 * Indicates whether a declaration has a dynamic name that cannot be late-bound.
 */
function hasNonBindableDynamicName( node )
{
    return hasDynamicName( node ) && !hasLateBindableName( node );
}

/**
 * Indicates whether a declaration name is a dynamic name that cannot be late-bound.
 */
function isNonBindableDynamicName( node )
{
    return isDynamicName( node ) && !isLateBindableName( node );
}

/**
 * Gets the symbolic name for a late-bound member from its type.
 */
function getLateBoundNameFromType( type )
{
    if ( type.flags & TypeFlags.UniqueESSymbol )
        return `__@${type.symbol.escapedName}@${getSymbolId( type.symbol )}`;

    if ( type.flags & TypeFlags.StringOrNumberLiteral )
        return escapeLeadingUnderscores( "" + type.value );
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

    /**
     * @return {IntrinsicType}
     */
    getResolvedBaseConstraint()
    {
        return stringType;
    }

    isGenericIndexType()
    {
        return true;
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

function createTypeofType()
{
    return UnionType.getUnionType( arrayFrom( typeofEQFacts.keys(), getLiteralType ) );
}

/**
 * We store all literal types in a single map with keys of the form `'#NNN'` and `'@SSS'`,
 * where NNN is the text representation of a numeric literal and SSS are the characters
 * of a string literal. For literal enum members we use `'EEE#NNN'` and `'EEE@SSS'`, where
 * EEE is a unique id for the containing enum type.
 *
 * @param {string|number} value
 * @param {?number} [enumId]
 * @param {?Symbol} [symbol]
 * @return {LiteralType}
 */
function getLiteralType( value, enumId, symbol )
{
    const
        qualifier = typeof value === "number" ? "#" : "@",
        key       = enumId ? enumId + qualifier + value : qualifier + value;

    let type = literalTypes.get( key );

    if ( !type )
    {
        const flags = ( typeof value === "number" ? TypeFlags.NumberLiteral : TypeFlags.StringLiteral ) | ( enumId ? TypeFlags.EnumLiteral : 0 );

        literalTypes.set( key, type = createLiteralType( flags, value, symbol ) );
    }

    return type;
}

/**
 * @param {LiteralTypeNode} node
 * @return {*}
 */
function getTypeFromLiteralTypeNode( node )
{
    const links = getNodeLinks( node );

    if ( !links.resolvedType )
        links.resolvedType = getRegularTypeOfLiteralType( checkExpression( node.literal ) );

    return links.resolvedType;
}

