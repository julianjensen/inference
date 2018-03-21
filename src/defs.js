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
 */

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
 * Class and interface types (ObjectFlags.Class and ObjectFlags.Interface).
 *
 * @typedef {object} InterfaceType
 * @property {Array<TypeParameter>} typeParameters      - Type parameters (undefined if non-generic)
 * @property {Array<TypeParameter>} outerTypeParameters - Outer type parameters (undefined if none)
 * @property {Array<TypeParameter>} localTypeParameters - Local type parameters (undefined if none)
 * @property {TypeParameter} thisType                   - The "this" type (undefined if none)
 * @property {Type} [resolvedBaseConstructorType]      -Resolved base constructor type of class
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
 * @typedef {object} IndexInfo
 * @property {Type} type
 * @property {boolean} isReadonly
 * @property {?Declaration|Identifier} [declaration]     - type was SignatureDeclaration
 */

/**
 * @typedef {object<string|number,string|number>} EnumAlias
 */
