/** ******************************************************************************************************************
 * @file Describe what types does.
 * @author Julian Jensen <jjdanois@gmail.com>
 * @since 1.0.0
 * @date 20-Jan-2018
 *********************************************************************************************************************/
"use strict";

/**
 * For any given symbol we have:
 *
 * 1. Access
 * 2. Modifiers
 * 3. Lexical
 * 4. Type(s)
 * 5. Name
 * 6. Decls
 * 7. Refs
 *
 * ### Access
 * * private [artifical]
 * * public (to module, default)
 * * protected [artificial]
 * * exported [as, default]
 *
 * ### Modifiers
 * * async
 * * generator (technically, a GeneratorFunction)
 * * iterable
 * * nonenumerable
 * * readonly
 * * writeonly (externally, of course)
 * * frozen
 * * sealed
 * * static
 * * abstract (artifical)
 * * override (artifical)
 *
 * ### Lexical
 * * block
 * * function
 * * bound
 *
 * ### Object modifiers
 * * iterable
 * * frozen
 * * sealed
 *
 * ### Function modifiers
 * * async
 * * generator (function)
 * * private (to nearest function scope)
 * * exported (excludes private)
 * * constructor (arbitrary)
 * * hoistable
 * * predicate
 * * anonymous (but may be assigned)
 *
 * ### Arrow function modifiers
 * * async
 * * predicate
 * * anonymous (always but maybe assigned)
 *
 * ### Method modifiers
 * * async
 * * generator (function)
 * * abstract (aka virtual)
 * * override
 * * static
 * * private (to class)
 * * protected (private to class and subclasses)
 * * public (implied)
 * * constructor
 *
 * ### Class Modifiers
 * * frozed
 * * sealed
 * * subtype
 * * supertype
 * * iterable
 * * private (to module)
 * * exported (excludes private)
 * * anonymous
 *
 * ### Types
 *
 * #### Primitives
 * * number
 * * boolean
 * * string
 * * null
 * * undefined
 * * symbol
 *
 * #### Complex
 * * object
 *
 * #### Object-based
 * * function
 * * set
 * * map
 * * regexp
 * * promise
 * * proxy
 * * reflect
 * * global
 *
 * #### Indexed
 * * array
 * * typedarray
 * * arraybuffer
 * * sharedarraybuffer
 *
 * #### Keyed
 * * map
 * * set
 * * weakmap
 * * weakset
 *
 * #### Built-in
 * * atomics
 * * dataview
 * * date
 * * error
 * * json
 * * math
 * * generator (more commonly, iterator)
 * * NaN
 *
 * #### Errors
 * * evalerror (deprecated)
 * * internalerror
 * * rangeerror
 * * referenceerror
 * * syntaxerror
 * * typeerror
 * * urierror
 *
 * ### Internal
 * * container (class, interface, object)
 * * imported
 * * formalparameter
 * * argument
 * * union
 * * interface
 * * typedef/alias
 * * enum
 * * templatetype
 * * transient
 * * computed
 *
 *
 *
 * @enum {number}
 */
export let TypeFlags = {
    NONE:           0,
    READONLY:       1 << 0,     // `const` and `set` accessor
    BLOCKSCOPED:    1 << 1,     // `let` and `const`
    HOISTABLE:      1 << 2,     // `var` and `function`
    STATIC:         1 << 3,     // All `function` declarations and methods with `static`
    SCOPE:          1 << 4,     // blocks, for, for..in, for..of, catch, switch
    PARAM:          1 << 5,
    ITERABLE:       1 << 6,     // Has `Symbol.iterator` member
    GENERATORFUNC:  1 << 7,     // Type is `GeneratorFunction`, can use `yield`, returns `Generator`
    CONSTRUCTOR:    1 << 8,     // Known constructor (class constructor, functions called with `new`)
    ACCESSOR:       1 << 9,     // `get` or `set`. Recognize `set` by READONLY flag
    OVERRIDE:       1 << 10,
    INSTANCE:       1 << 11,
    CONTAINSEXPR:   1 << 12,
    PRIVATE:        1 << 13,    // Artifical from JsDoc or identifier starts with `_`
    INITIALIZER:    1 << 14,    // RHS of parameter initializer
    SUPER:          1 << 15,    // Class has subtypes
    MODULE:         1 << 16,    // scope for hoistables
    CALLABLE:       1 << 17,    // `class` and `function`
    CLASS:          1 << 18,    // This is a `class` and also `function` and `callable`
    PROPERTY:       1 << 19,
    NOBIND:         1 << 20,    // Arrow functions
    TEMPORARY:      1 << 21,    // Temporary or placeholder symbol generated by the analyzer
    COMPUTED:       1 << 22,    // Computed property, name unknown. May not exist in cases where the computed name refers to a known name
    CONTAINER:      1 << 23,    // Has members (objects, class, class instances), but does not create a scope
    NUMERICAL_INDEX: 1 << 24,   // Uses numerical index
    COMPUTED_INDEX: 1 << 25,    // Used as an index for computed member
    ASYNC:          1 << 26,
    CHAIN:          1 << 27,    // Has a prototype chain
    ALIAS:          1 << 28,
    asString( val, sep = ' | ' ) { return enum_to_string( this, val ).join( sep ); },

    NAMESPACE:      1 << 16,    // Alias for MODULE
    SYNTHETIC:      1 << 21,    // Alias for TEMPORARY
    TRANSIENT:      1 << 21     // Alias for TEMPORARY

};

make_enum_from_object( TypeFlags );

/**
 * @param {object<string,number>} names
 * @param {object<string|number,string|number>} [__enum]
 * @return {object<string|number,string|number>}
 * @private
 */
function make_enum_from_object( names, __enum = names )
{
    Object.entries( names ).forEach( ( [ name, val ] ) => typeof val !== 'function' ? ( __enum[ __enum[ name ] = val ] = name ) : __enum[ name ] = val );
}

// /**
//  * @param {Array<string>} names
//  * @return {{}}
//  */
// function make_bitfield_enum( names )
// {
//     const __enum = {};
//
//     __enum[ __enum[ 0 ] = 'NONE' ] = 0;
//
//     for ( const [ i, enumName ] of names.entries() )
//     {
//         __enum[ __enum[ 1 << i ] = enumName ] = 1 << i;
//     }
//
//     return __enum;
// }

/**
 * Turns an `enum` into an array of strings.
 *
 * @param {enum} enumType
 * @param {number} val
 * @return {Array<string>}
 * @private
 */
function enum_to_string( enumType, val )
{
    let vals = [];

    for ( let i = 1; i < 1 << 30; i = i << 1 )
    {
        if ( !( val & ~( i - 1 ) ) ) break;
        if ( val & i ) vals.push( enumType[ val & i ] );
    }

    return vals;
}

/**
 * @type {enum}
 */
export const InferencePriority = {
    NakedTypeVariable: 1 << 0,  // Naked type variable in union or intersection type
    MappedType:        1 << 1,  // Reverse inference for mapped type
    ReturnType:        1 << 2   // Inference made from return type of generic function
};

make_enum_from_object( InferencePriority, InferencePriority );

/**
 * @type {enum}
 */
export const InferenceFlags = {
    InferUnionTypes: 1 << 0,    // Infer union types for disjoint candidates (otherwise unknownType)
    NoDefault:       1 << 1,    // Infer unknownType for no inferences (otherwise anyType or emptyObjectType)
    AnyDefault:      1 << 2     // Infer anyType for no inferences (otherwise emptyObjectType)
};

make_enum_from_object( InferenceFlags, InferenceFlags );

/**
 * Ternary values are defined such that
 * x & y is False if either x or y is False.
 * x & y is Maybe if either x or y is Maybe, but neither x or y is False.
 * x & y is True if both x and y are True.
 * x | y is False if both x and y are False.
 * x | y is Maybe if either x or y is Maybe, but neither x or y is True.
 * x | y is True if either x or y is True.
 *
 * @type {enum}
 */
export const Ternary = {
    False: 0,
    Maybe: 1,
    True:  -1
};

make_enum_from_object( Ternary, Ternary );

/**
 * @typedef {object} InferenceContext
 * @property {string} signature                 - Actual type: Signature, Generic signature for which inferences are made
 * @property {Array<InferenceInfo>} inferences  - Inferences made for each type parameter
 * @property {InferenceFlags} flags             - Inference flags
 * @property {function} [compareTypes]          - Actual: TypeComparer, Type comparer function
 */

/**
 * @typedef {object} WideningContext
 * @property {?WideningContext} [parent]                - Parent context
 * @property {?string} [propertyName]                   - Name of property in parent
 * @property {?Array<Type>} [siblings]                  - Types of siblings
 * @property {?Array<string>} [resolvedPropertyNames]   - Property names occurring in sibling object literals
 */

/**
 * @typedef {object} InferenceInfo
 * @property {string} typeParameter         - Actually, type is 'TypeParameter', Type parameter for which inferences are being made
 * @property {Array<Type>} candidates       - Candidates in covariant positions (or undefined)
 * @property {Array<Type>} contraCandidates - Candidates in contravariant positions (or undefined)
 * @property {Type} inferredType            - Cache for resolved inferred type
 * @property {string} priority              - Actual type: InferencePriority, Priority of current inference set
 * @property {boolean} topLevel             - True if all inferences are to top level occurrences
 * @property {boolean} isFixed              - True if inferences are fixed
 */

/**
 * @typedef {Array<string|Array<string>|RecursiveNames>} RecursiveNames
 */

/**
 * @type {enum}
 */
export const ObjectFlags = {
    Class:                                      1 << 0,  // Class
    Interface:                                  1 << 1,  // Interface
    Reference:                                  1 << 2,  // Generic type reference
    Tuple:                                      1 << 3,  // Synthesized generic tuple type
    Anonymous:                                  1 << 4,  // Anonymous
    Mapped:                                     1 << 5,  // Mapped
    Instantiated:                               1 << 6,  // Instantiated anonymous or mapped type
    ObjectLiteral:                              1 << 7,  // Originates in an object literal
    EvolvingArray:                              1 << 8,  // Evolving array type
    ObjectLiteralPatternWithComputedProperties: 1 << 9,  // Object literal pattern with computed properties
    ContainsSpread:                             1 << 10, // Object literal contains spread operation
    ReverseMapped:                              1 << 11    // Object contains a property from a reverse-mapped type
};

make_enum_from_object( ObjectFlags, ObjectFlags );


/**
 * Class and interface types (ObjectFlags.Class and ObjectFlags.Interface).
 *
 * @typedef {object} InterfaceType
 * @property {Array<TypeParameter>} typeParameters      - Type parameters (undefined if non-generic)
 * @property {Array<TypeParameter>} outerTypeParameters - Outer type parameters (undefined if none)
 * @property {Array<TypeParameter>} localTypeParameters - Local type parameters (undefined if none)
 * @property {TypeParameter} thisType                   - The "this" type (undefined if none)
 * @property {>Type} [resolvedBaseConstructorType]      -Resolved base constructor type of class
 * @property {Array<Type>} resolvedBaseTypes            - Resolved base types
 */

/**
 * @typedef {object} InterfaceTypeWithDeclaredMembers
 * @extends InterfaceType
 * @property {Array<Symbol>} declaredProperties         - Declared members
 * @property {Array<Signature>} declaredCallSignatures  - Declared call signatures
 * @property {Array<Signature>} declaredConstructSignatures - Declared construct signatures
 * @property {IndexInfo} declaredStringIndexInfo        - Declared string indexing info
 * @property {IndexInfo} declaredNumberIndexInfo        - Declared numeric indexing info
 */

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
 * @typedef {object} TypeReference
 * @property {GenericType} target                  - Type reference target
 * @property {?Array<Type>} [typeArguments] - Type reference type arguments (undefined if none)
 */

/**
 * @enum
 */
export const Variance = {
    Invariant:     0,       // Neither covariant nor contravariant
    Covariant:     1,  // Covariant
    Contravariant: 2,  // Contravariant
    Bivariant:     3,  // Both covariant and contravariant
    Independent:   4    // Unwitnessed type parameter
};

make_enum_from_object( Variance, Variance );

/**
 * Generic class and interface types
 *
 * @typedef {object} GenericType
 * @extends InterfaceType
 * @extends TypeReference
 * @property {Array<TypeReference>} instantiations    - Generic instantiation cache
 * @property {?Array<Variance>} [variances]         - Variance of each type parameter
 */

/**
 * @typedef {object} UnionOrIntersectionType
 * @property {Array<Type>} types            - Constituent types
 * @property {Map<string, Symbol>} propertyCache    - Cache of resolved properties}
 * @property {Array<Symbol>} resolvedProperties
 * @property {IndexType} resovledIndexType
 * @property {Type} resolvedBaseConstraint
 */


/**
 * An instantiated anonymous type has a target and a mapper
 *
 * @typedef {object} AnonymousType
 * @property {?AnonymousType} [target]  - Instantiation target
 }

 /**
 * @typedef {object} MappedType
 * @extends AnonymousType
 * @property {Node} declaration
 * @property {?TypeParameter} [typeParameter]
 * @property {?Type} [constraintType]
 * @property {?Type} [templateType]
 * @property {?Type} [modifiersType]
 */

// export interface EvolvingArrayType extends ObjectType {
//     elementType: Type;      // Element expressions of evolving array type
//     finalArrayType?: Type;  // Final array type of evolving array type
// }

// export interface ReverseMappedType extends ObjectType {
//     source: Type;
//     mappedType: MappedType;
// }

/**
 * Resolved object, union, or intersection type
 *
 * @typedef {object} ResolvedType
 * @property {Map<string, Symbol>} members              - Properties by name
 * @property {Array<Symbol>} properties                 - Properties
 * @property {Array<Signature>} callSignatures          - Call signatures of type
 * @property {Array<Signature>} constructSignatures     - Construct signatures of type
 * @property {?IndexInfo} [stringIndexInfo]  - String indexing info
 * @property {?IndexInfo} [numberIndexInfo]  - Numeric indexing info
 */

/**
 * Just a place to cache element types of iterables and iterators
 *
 * @typedef {object} IterableOrIteratorType
 * @property {?Type} [iteratedTypeOfIterable]
 * @property {?Type} [iteratedTypeOfIterator]
 * @property {?Type} [iteratedTypeOfAsyncIterable]
 * @property {?Type} [iteratedTypeOfAsyncIterator]
 */

/**
 * @typedef {object} PromiseOrAwaitableType
 * @property {?Type} [promiseTypeOfPromiseConstructor]
 * @property {?Type} [promisedTypeOfPromise]
 * @property {?Type} [awaitedTypeOfType]
 */

/**
 * @typedef {object} TypeVariable
 * @property {Type} [resolvedBaseConstraint]
 * @property {?IndexType} [resolvedIndexType]
 */

/**
 * Type parameters (TypeFlags.TypeParameter)
 *
 * @typedef {object} TypeParameter
 * @extends TypeVariable
 * @property {?Type} constraint
 * @property {?Type} [default]
 * @property {?TypeParameter} [target]  - Instantiation target
 * @property {boolean} [isThisType]
 * @property {?Type} [resolvedDefaultType]
 */

/**
 * Indexed access types (TypeFlags.IndexedAccess)
 * Possible forms are T[xxx], xxx[T], or xxx[keyof T], where T is a type variable
 *
 * @typedef {object} IndexedAccessType
 * @extends TypeVariable
 * @property {Type} objectType
 * @property {Type} indexType
 * @property {?Type} constraint
 */

/**
 * @typedef {object} Signature
 * @property {Declaration|Identifier} declaration       - Originating declaration
 * @property {?Array<TypeParameter>} typeParameters     - Type parameters (undefined if non-generic)
 * @property {Array<Symbol>} parameters                 - Parameters
 * @property {?Array<Symbol>} thisParameter             - symbol of this-type parameter
 *
 *  See comment in `instantiateSignature` for why these are set lazily.
 * @property {?Type} [resolvedReturnType]               - Lazily set by `getReturnTypeOfSignature`.
 *
 * Lazily set by `getTypePredicateOfSignature`.
 * `undefined` indicates a type predicate that has not yet been computed.
 * Uses a special `noTypePredicate` sentinel value to indicate that there is no type predicate. This looks like a TypePredicate at runtime to avoid polymorphism.
 * @property {?Type} [resolvedTypePredicate]            - Type was TypePredicate
 *
 * @property {number} minArgumentCount                  - Number of non-optional parameters
 * @property {boolean} hasRestParameter                 - True if last parameter is rest parameter
 * @property {boolean} hasLiteralTypes                  - True if specialized
 * @property {?Signature} target                        - Instantiation target
 * @property {?Array<Signature>} unionSignatures             - Underlying signatures of a union signature
 * @property {?Signature} erasedSignatureCache          - Erased version of signature (deferred)
 * @property {?Signature} canonicalSignatureCache       - Canonical version of signature (deferred)
 * @property {?Type} isolatedSignatureType              - A manufactured type that just contains the signature for purposes of signature comparison
 * @property {?Map<Signature>} instantiations           - Generic signature instantiation cache
 *
 */

/**
 * @enum
 */
export const IndexKind = {
    String: 1,
    Number: 2
};

make_enum_from_object( IndexKind, IndexKind );

/**
 * @typedef {object} IndexInfo
 * @property {Type} type
 * @property {boolean} isReadonly
 * @property {?Declaration|Identifier} [declaration]     - type was SignatureDeclaration
 */