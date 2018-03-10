/** ******************************************************************************************************************
 * @file Describe what types does.
 * @author Julian Jensen <jjdanois@gmail.com>
 * @since 1.0.0
 * @date 20-Jan-2018
 *********************************************************************************************************************/


"use strict";
// noinspection JSBitwiseOperatorUsage

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

import { make_enum_from_object, make_extra } from "./enum";

/**
 * @enum
 * @name TypeFlags
 */
const TypeFlags0 = make_enum_from_object( {
    Any:                     1 << 0,
    String:                  1 << 1,
    Number:                  1 << 2,
    Boolean:                 1 << 3,
    Enum:                    1 << 4,
    StringLiteral:           1 << 5,
    NumberLiteral:           1 << 6,
    BooleanLiteral:          1 << 7,
    EnumLiteral:             1 << 8,   // Always combined with StringLiteral, NumberLiteral, or Union
    ESSymbol:                1 << 9,   // Type of symbol primitive introduced in ES6
    UniqueESSymbol:          1 << 10,  // unique symbol
    Void:                    1 << 11,
    Undefined:               1 << 12,
    Null:                    1 << 13,
    Never:                   1 << 14,  // Never type
    TypeParameter:           1 << 15,  // Type parameter
    Object:                  1 << 16,  // Object type
    Union:                   1 << 17,  // Union (T | U)
    Intersection:            1 << 18,  // Intersection (T & U)
    Index:                   1 << 19,  // keyof T
    IndexedAccess:           1 << 20,  // T[K]
    Conditional:             1 << 21,  // T extends U ? X : Y
    Substitution:            1 << 22,  // Type parameter substitution
    FreshLiteral:            1 << 23,  // Fresh literal or unique type
    ContainsWideningType:    1 << 24,  // Type is or contains undefined or null widening type
    ContainsObjectLiteral:   1 << 25,  // Type is or contains object literal type
    ContainsAnyFunctionType: 1 << 26,  // Type is or contains the anyFunctionType
    NonPrimitive:            1 << 27,  // intrinsic object type
    GenericMappedType:       1 << 29   // Flag used by maybeTypeOfKind

} );
/**
 * @enum
 * @name TypeFlags
 */
const TypeFlags1 = {
    Nullable:                      { get: () => TypeFlags0.Undefined | TypeFlags0.Null },
    Literal:                       { get: () => TypeFlags0.StringLiteral | TypeFlags0.NumberLiteral | TypeFlags0.BooleanLiteral },
    Unit:                          { get: () => TypeFlags0.Literal | TypeFlags0.UniqueESSymbol | TypeFlags0.Nullable },
    StringOrNumberLiteral:         { get: () => TypeFlags0.StringLiteral | TypeFlags0.NumberLiteral },
    StringOrNumberLiteralOrUnique: { get: () => TypeFlags0.StringOrNumberLiteral | TypeFlags0.UniqueESSymbol },
    DefinitelyFalsy:               { get: () => TypeFlags0.StringLiteral | TypeFlags0.NumberLiteral | TypeFlags0.BooleanLiteral | TypeFlags0.Void | TypeFlags0.Undefined | TypeFlags0.Null },
    PossiblyFalsy:                 { get: () => TypeFlags0.DefinitelyFalsy | TypeFlags0.String | TypeFlags0.Number | TypeFlags0.Boolean },
    Intrinsic:                     {
        get: () => TypeFlags0.Any | TypeFlags0.String | TypeFlags0.Number | TypeFlags0.Boolean | TypeFlags0.BooleanLiteral | TypeFlags0.ESSymbol | TypeFlags0.Void | TypeFlags0.Undefined | TypeFlags0.Null | TypeFlags0.Never |
                   TypeFlags0.NonPrimitive
    },
    Primitive:                     {
        get: () => TypeFlags0.String | TypeFlags0.Number | TypeFlags0.Boolean | TypeFlags0.Enum | TypeFlags0.EnumLiteral | TypeFlags0.ESSymbol | TypeFlags0.Void | TypeFlags0.Undefined | TypeFlags0.Null | TypeFlags0.Literal |
                   TypeFlags0.UniqueESSymbol
    },
    StringLike:                    { get: () => TypeFlags0.String | TypeFlags0.StringLiteral | TypeFlags0.Index },
    NumberLike:                    { get: () => TypeFlags0.Number | TypeFlags0.NumberLiteral | TypeFlags0.Enum },
    BooleanLike:                   { get: () => TypeFlags0.Boolean | TypeFlags0.BooleanLiteral },
    EnumLike:                      { get: () => TypeFlags0.Enum | TypeFlags0.EnumLiteral },
    ESSymbolLike:                  { get: () => TypeFlags0.ESSymbol | TypeFlags0.UniqueESSymbol },
    UnionOrIntersection:           { get: () => TypeFlags0.Union | TypeFlags0.Intersection },
    StructuredType:                { get: () => TypeFlags0.Object | TypeFlags0.Union | TypeFlags0.Intersection },
    TypeVariable:                  { get: () => TypeFlags0.TypeParameter | TypeFlags0.IndexedAccess },
    InstantiableNonPrimitive:      { get: () => TypeFlags0.TypeVariable | TypeFlags0.Conditional | TypeFlags0.Substitution },
    InstantiablePrimitive:         { get: () => TypeFlags0.Index },
    Instantiable:                  { get: () => TypeFlags0.InstantiableNonPrimitive | TypeFlags0.InstantiablePrimitive },
    StructuredOrInstantiable:      { get: () => TypeFlags0.StructuredType | TypeFlags0.Instantiable },
    Narrowable:                    {
        get: () => TypeFlags0.Any | TypeFlags0.StructuredOrInstantiable | TypeFlags0.StringLike | TypeFlags0.NumberLike | TypeFlags0.BooleanLike | TypeFlags0.ESSymbol | TypeFlags0.UniqueESSymbol | TypeFlags0.NonPrimitive
    },
    NotUnionOrUnit:                { get: () => TypeFlags0.Any | TypeFlags0.ESSymbol | TypeFlags0.Object | TypeFlags0.NonPrimitive },
    RequiresWidening:              { get: () => TypeFlags0.ContainsWideningType | TypeFlags0.ContainsObjectLiteral },
    PropagatingFlags:              { get: () => TypeFlags0.ContainsWideningType | TypeFlags0.ContainsObjectLiteral | TypeFlags0.ContainsAnyFunctionType }
};

/**
 * @enum
 * @name TypeFlags
 */
export const TypeFlags = make_extra( TypeFlags0, TypeFlags1 );


/**
 * @enum
 * @name SymbolFlags
 */
const SymbolFlags0 = make_enum_from_object( {
    None:                   0,
    FunctionScopedVariable: 1 << 0,   // Variable (var) or parameter
    BlockScopedVariable:    1 << 1,   // A block-scoped variable (let or const)
    Property:               1 << 2,   // Property or enum member
    EnumMember:             1 << 3,   // Enum member
    Function:               1 << 4,   // Function
    Class:                  1 << 5,   // Class
    Interface:              1 << 6,   // Interface
    ConstEnum:              1 << 7,   // Const enum
    RegularEnum:            1 << 8,   // Enum
    ValueModule:            1 << 9,   // Instantiated module
    NamespaceModule:        1 << 10,  // Uninstantiated module
    TypeLiteral:            1 << 11,  // Type Literal or mapped type
    ObjectLiteral:          1 << 12,  // Object Literal
    Method:                 1 << 13,  // Method
    Constructor:            1 << 14,  // Constructor
    GetAccessor:            1 << 15,  // Get accessor
    SetAccessor:            1 << 16,  // Set accessor
    Signature:              1 << 17,  // Call, construct, or index signature
    TypeParameter:          1 << 18,  // Type parameter
    TypeAlias:              1 << 19,  // Type alias
    ExportValue:            1 << 20,  // Exported value marker (see comment in declareModuleMember in binder)
    Alias:                  1 << 21,  // An alias for another symbol (see comment in isAliasSymbolDeclaration in checker)
    Prototype:              1 << 22,  // Prototype property (no source representation)
    ExportStar:             1 << 23,  // Export * declaration
    Optional:               1 << 24,  // Optional property
    Transient:              1 << 25,  // Transient symbol (created during type check)
    JSContainer:            1 << 26  // Contains Javascript special declarations
} );
/**
 * @enum
 * @name SymbolFlags
 */
const SymbolFlags1 = {
    All: {
        get: () => SymbolFlags0.FunctionScopedVariable | SymbolFlags0.BlockScopedVariable | SymbolFlags0.Property | SymbolFlags0.EnumMember | SymbolFlags0.Function |
                   SymbolFlags0.Class | SymbolFlags0.Interface | SymbolFlags0.ConstEnum | SymbolFlags0.RegularEnum | SymbolFlags0.ValueModule | SymbolFlags0.NamespaceModule | SymbolFlags0.TypeLiteral |
                   SymbolFlags0.ObjectLiteral | SymbolFlags0.Method | SymbolFlags0.Constructor | SymbolFlags0.GetAccessor | SymbolFlags0.SetAccessor | SymbolFlags0.Signature |
                   SymbolFlags0.TypeParameter | SymbolFlags0.TypeAlias | SymbolFlags0.ExportValue | SymbolFlags0.Alias | SymbolFlags0.Prototype | SymbolFlags0.ExportStar |
                   SymbolFlags0.Optional | SymbolFlags0.Transient
    },

    Enum:      { get: () => SymbolFlags0.RegularEnum | SymbolFlags0.ConstEnum },
    Variable:  { get: () => SymbolFlags0.FunctionScopedVariable | SymbolFlags0.BlockScopedVariable },
    Value:     {
        get: () => SymbolFlags0.Variable | SymbolFlags0.Property | SymbolFlags0.EnumMember | SymbolFlags0.Function | SymbolFlags0.Class | SymbolFlags0.Enum | SymbolFlags0.ValueModule |
                   SymbolFlags0.Method | SymbolFlags0.GetAccessor | SymbolFlags0.SetAccessor
    },
    Type:      {
        get: () => SymbolFlags0.Class | SymbolFlags0.Interface | SymbolFlags0.Enum | SymbolFlags0.EnumMember | SymbolFlags0.TypeLiteral | SymbolFlags0.ObjectLiteral |
                   SymbolFlags0.TypeParameter | SymbolFlags0.TypeAlias
    },
    Namespace: { get: () => SymbolFlags0.ValueModule | SymbolFlags0.NamespaceModule | SymbolFlags0.Enum },
    Module:    { get: () => SymbolFlags0.ValueModule | SymbolFlags0.NamespaceModule },
    Accessor:  { get: () => SymbolFlags0.GetAccessor | SymbolFlags0.SetAccessor },

    // Variables can be redeclared, but can not redeclare a block-scoped declaration with the
    // same name, or any other value that is not a variable, e.g. ValueModule or Class
    FunctionScopedVariableExcludes: { get: () => SymbolFlags0.Value & ~SymbolFlags0.FunctionScopedVariable },

    // Block-scoped declarations are not allowed to be re-declared
    // they can not merge with anything in the value space
    BlockScopedVariableExcludes: { get: () => SymbolFlags0.Value },

    ParameterExcludes:       { get: () => SymbolFlags0.Value },
    PropertyExcludes:        { get: () => SymbolFlags0.None },
    EnumMemberExcludes:      { get: () => SymbolFlags0.Value | SymbolFlags0.Type },
    FunctionExcludes:        { get: () => SymbolFlags0.Value & ~( SymbolFlags0.Function | SymbolFlags0.ValueModule ) },
    ClassExcludes:           { get: () => ( SymbolFlags0.Value | SymbolFlags0.Type ) & ~( SymbolFlags0.ValueModule | SymbolFlags0.Interface ) }, // class-interface mergability done in checker.ts
    InterfaceExcludes:       { get: () => SymbolFlags0.Type & ~( SymbolFlags0.Interface | SymbolFlags0.Class ) },
    RegularEnumExcludes:     { get: () => ( SymbolFlags0.Value | SymbolFlags0.Type ) & ~( SymbolFlags0.RegularEnum | SymbolFlags0.ValueModule ) }, // regular enums merge only with regular enums and modules
    ConstEnumExcludes:       { get: () => ( SymbolFlags0.Value | SymbolFlags0.Type ) & ~SymbolFlags0.ConstEnum }, // const enums merge only with const enums
    ValueModuleExcludes:     { get: () => SymbolFlags0.Value & ~( SymbolFlags0.Function | SymbolFlags0.Class | SymbolFlags0.RegularEnum | SymbolFlags0.ValueModule ) },
    NamespaceModuleExcludes: { get: () => 0 },
    MethodExcludes:          { get: () => SymbolFlags0.Value & ~SymbolFlags0.Method },
    GetAccessorExcludes:     { get: () => SymbolFlags0.Value & ~SymbolFlags0.SetAccessor },
    SetAccessorExcludes:     { get: () => SymbolFlags0.Value & ~SymbolFlags0.GetAccessor },
    TypeParameterExcludes:   { get: () => SymbolFlags0.Type & ~SymbolFlags0.TypeParameter },
    TypeAliasExcludes:       { get: () => SymbolFlags0.Type },
    AliasExcludes:           { get: () => SymbolFlags0.Alias },

    ModuleMember: {
        get: () => SymbolFlags0.Variable | SymbolFlags0.Function | SymbolFlags0.Class | SymbolFlags0.Interface | SymbolFlags0.Enum | SymbolFlags0.Module |
                   SymbolFlags0.TypeAlias | SymbolFlags0.Alias
    },

    ExportHasLocal: { get: () => SymbolFlags0.Function | SymbolFlags0.Class | SymbolFlags0.Enum | SymbolFlags0.ValueModule },

    HasExports: { get: () => SymbolFlags0.Class | SymbolFlags0.Enum | SymbolFlags0.Module },
    HasMembers: { get: () => SymbolFlags0.Class | SymbolFlags0.Interface | SymbolFlags0.TypeLiteral | SymbolFlags0.ObjectLiteral },

    BlockScoped: { get: () => SymbolFlags0.BlockScopedVariable | SymbolFlags0.Class | SymbolFlags0.Enum },

    PropertyOrAccessor: { get: () => SymbolFlags0.Property | SymbolFlags0.Accessor },

    ClassMember: { get: () => SymbolFlags0.Method | SymbolFlags0.Accessor | SymbolFlags0.Property },

    // The set of things we consider semantically classifiable.  Used to speed up the LS during
    // classification.
    Classifiable: { get: () => SymbolFlags0.Class | SymbolFlags0.Enum | SymbolFlags0.TypeAlias | SymbolFlags0.Interface | SymbolFlags0.TypeParameter | SymbolFlags0.Module | SymbolFlags0.Alias },

    LateBindingContainer: { get: () => SymbolFlags0.Class | SymbolFlags0.Interface | SymbolFlags0.TypeLiteral | SymbolFlags0.ObjectLiteral }
};

/**
 * @enum
 * @name SymbolFlags
 */
export const SymbolFlags = make_extra( SymbolFlags0, SymbolFlags1 );


// export let TypeFlags = {
//     NONE:           0,
//     READONLY:       1 << 0,     // `const` and `set` accessor
//     BLOCKSCOPED:    1 << 1,     // `let` and `const`
//     HOISTABLE:      1 << 2,     // `var` and `function`
//     STATIC:         1 << 3,     // All `function` declarations and methods with `static`
//     SCOPE:          1 << 4,     // blocks, for, for..in, for..of, catch, switch
//     PARAM:          1 << 5,
//     ITERABLE:       1 << 6,     // Has `Symbol.iterator` member
//     GENERATORFUNC:  1 << 7,     // Type is `GeneratorFunction`, can use `yield`, returns `Generator`
//     CONSTRUCTOR:    1 << 8,     // Known constructor (class constructor, functions called with `new`)
//     ACCESSOR:       1 << 9,     // `get` or `set`. Recognize `set` by READONLY flag
//     OVERRIDE:       1 << 10,
//     INSTANCE:       1 << 11,
//     CONTAINSEXPR:   1 << 12,
//     PRIVATE:        1 << 13,    // Artifical from JsDoc or identifier starts with `_`
//     INITIALIZER:    1 << 14,    // RHS of parameter initializer
//     SUPER:          1 << 15,    // Class has subtypes
//     MODULE:         1 << 16,    // scope for hoistables
//     CALLABLE:       1 << 17,    // `class` and `function`
//     CLASS:          1 << 18,    // This is a `class` and also `function` and `callable`
//     PROPERTY:       1 << 19,
//     NOBIND:         1 << 20,    // Arrow functions
//     TEMPORARY:      1 << 21,    // Temporary or placeholder symbol generated by the analyzer
//     COMPUTED:       1 << 22,    // Computed property, name unknown. May not exist in cases where the computed name refers to a known name
//     CONTAINER:      1 << 23,    // Has members (objects, class, class instances), but does not create a scope
//     NUMERICAL_INDEX: 1 << 24,   // Uses numerical index
//     COMPUTED_INDEX: 1 << 25,    // Used as an index for computed member
//     ASYNC:          1 << 26,
//     CHAIN:          1 << 27,    // Has a prototype chain
//     ALIAS:          1 << 28,
//     asString( val, sep = ' | ' ) { return enum_to_string( this, val ).join( sep ); },
//
//     NAMESPACE:      1 << 16,    // Alias for MODULE
//     SYNTHETIC:      1 << 21,    // Alias for TEMPORARY
//     TRANSIENT:      1 << 21     // Alias for TEMPORARY
//
// };

/**
 * @enum
 * @name InferencePriority
 */
export const InferencePriority = make_enum_from_object(
    /**
     * @enum
     * @name InferencePriority
     */
    {
        NakedTypeVariable: 1 << 0,  // Naked type variable in union or intersection type
        MappedType:        1 << 1,  // Reverse inference for mapped type
        ReturnType:        1 << 2   // Inference made from return type of generic function
    } );

/**
 * @enum
 * @name InferenceFlags
 */
export const InferenceFlags = make_enum_from_object(
    /**
     * @enum
     * @name InferenceFlags
     */
    {
        InferUnionTypes: 1 << 0,    // Infer union types for disjoint candidates (otherwise unknownType)
        NoDefault:       1 << 1,    // Infer unknownType for no inferences (otherwise anyType or emptyObjectType)
        AnyDefault:      1 << 2     // Infer anyType for no inferences (otherwise emptyObjectType)
    } );

/**
 * Ternary values are defined such that
 * x & y is False if either x or y is False.
 * x & y is Maybe if either x or y is Maybe, but neither x or y is False.
 * x & y is True if both x and y are True.
 * x | y is False if both x and y are False.
 * x | y is Maybe if either x or y is Maybe, but neither x or y is True.
 * x | y is True if either x or y is True.
 *
 * @enum
 * @name Ternary
 */
export const Ternary = make_enum_from_object(
    /**
     * @enum
     * @name Ternary
     */
    {
        False: 0,
        Maybe: 1,
        True:  -1
    } );

/**
 * @enum
 * @name ObjectFlags
 */
const ObjectFlags0 = make_enum_from_object(
    /**
     * @enum
     * @name ObjectFlags
     */
    {
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
        ReverseMapped:                              1 << 11, // Object contains a property from a reverse-mapped type
        JsxAttributes:                              1 << 12, // Jsx attributes type
        MarkerType:                                 1 << 13  // Marker type used for variance probing
    } ),
      /**
       * @enum
       * @name ObjectFlags
       */
      ObjectFlags1 = {
          ClassOrInterface: { get: () => ObjectFlags0.Class | ObjectFlags0.Interface }
      };

/**
 * @enum
 * @name ObjectFlags
 */
export const ObjectFlags = make_extra( ObjectFlags0, ObjectFlags1 );

/**
 * @enum
 * @name ModifierFlags
 */
const ModifierFlags0 = make_enum_from_object(
    /**
     * @enum
     * @name ModifierFlags
     */
    {
        None:             0,
        Export:           1 << 0,  // Declarations
        Ambient:          1 << 1,  // Declarations
        Public:           1 << 2,  // Property/Method
        Private:          1 << 3,  // Property/Method
        Protected:        1 << 4,  // Property/Method
        Static:           1 << 5,  // Property/Method
        Readonly:         1 << 6,  // Property/Method
        Abstract:         1 << 7,  // Class/Method/ConstructSignature
        Async:            1 << 8,  // Property/Method/Function
        Default:          1 << 9,  // Function/Class (export default declaration)
        Const:            1 << 11, // Variable declaration
        HasComputedFlags: 1 << 29  // Modifier flags have been computed
    } );

/**
 * @enum
 * @name ModifierFlags
 */
const ModifierFlags1 = {
    AccessibilityModifier:          { get: () => ModifierFlags0.Public | ModifierFlags0.Private | ModifierFlags0.Protected },
    // Accessibility modifiers and 'readonly' can be attached to a parameter in a constructor to make it a property.
    ParameterPropertyModifier:      { get: () => ModifierFlags0.AccessibilityModifier | ModifierFlags0.Readonly },
    NonPublicAccessibilityModifier: { get: () => ModifierFlags0.Private | ModifierFlags0.Protected },

    TypeScriptModifier: { get: () => ModifierFlags0.Ambient | ModifierFlags0.Public | ModifierFlags0.Private | ModifierFlags0.Protected | ModifierFlags0.Readonly | ModifierFlags0.Abstract | ModifierFlags0.Const },
    ExportDefault:      { get: () => ModifierFlags0.Export | ModifierFlags0.Default }

};

/**
 * @enum
 * @name ModifierFlags
 */
export const ModifierFlags = make_extra( ModifierFlags0, ModifierFlags1 );

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
 * @enum
 */
export const Variance = {
    Invariant:     0,       // Neither covariant nor contravariant
    Covariant:     1,  // Covariant
    Contravariant: 2,  // Contravariant
    Bivariant:     3,  // Both covariant and contravariant
    Independent:   4    // Unwitnessed type parameter
};

make_enum_from_object( Variance );

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
 * @name IndexKind
 */
export const IndexKind = make_enum_from_object(
    /**
     * @enum
     * @name IndexKind
     */
    {
        String: 1,
        Number: 2
    } );

/**
 * @typedef {object} IndexInfo
 * @property {Type} type
 * @property {boolean} isReadonly
 * @property {?Declaration|Identifier} [declaration]     - type was SignatureDeclaration
 */

/**
 * @enum
 * @name CharacterCodes
 */
export const CharacterCodes = make_enum_from_object(
    /**
     * @enum
     * @name CharacterCodes
     */
    {
        nullCharacter:     0,
        maxAsciiCharacter: 0x7F,

        lineFeed:           0x0A,              // \n
        carriageReturn:     0x0D,        // \r
        lineSeparator:      0x2028,
        paragraphSeparator: 0x2029,
        nextLine:           0x0085,

        // Unicode 3.0 space characters
        space:              0x0020,   // " "
        nonBreakingSpace:   0x00A0,   //
        enQuad:             0x2000,
        emQuad:             0x2001,
        enSpace:            0x2002,
        emSpace:            0x2003,
        threePerEmSpace:    0x2004,
        fourPerEmSpace:     0x2005,
        sixPerEmSpace:      0x2006,
        figureSpace:        0x2007,
        punctuationSpace:   0x2008,
        thinSpace:          0x2009,
        hairSpace:          0x200A,
        zeroWidthSpace:     0x200B,
        narrowNoBreakSpace: 0x202F,
        ideographicSpace:   0x3000,
        mathematicalSpace:  0x205F,
        ogham:              0x1680,

        _: 0x5F,
        $: 0x24,

        _0: 0x30,
        _1: 0x31,
        _2: 0x32,
        _3: 0x33,
        _4: 0x34,
        _5: 0x35,
        _6: 0x36,
        _7: 0x37,
        _8: 0x38,
        _9: 0x39,

        a: 0x61,
        b: 0x62,
        c: 0x63,
        d: 0x64,
        e: 0x65,
        f: 0x66,
        g: 0x67,
        h: 0x68,
        i: 0x69,
        j: 0x6A,
        k: 0x6B,
        l: 0x6C,
        m: 0x6D,
        n: 0x6E,
        o: 0x6F,
        p: 0x70,
        q: 0x71,
        r: 0x72,
        s: 0x73,
        t: 0x74,
        u: 0x75,
        v: 0x76,
        w: 0x77,
        x: 0x78,
        y: 0x79,
        z: 0x7A,

        A: 0x41,
        B: 0x42,
        C: 0x43,
        D: 0x44,
        E: 0x45,
        F: 0x46,
        G: 0x47,
        H: 0x48,
        I: 0x49,
        J: 0x4A,
        K: 0x4B,
        L: 0x4C,
        M: 0x4D,
        N: 0x4E,
        O: 0x4F,
        P: 0x50,
        Q: 0x51,
        R: 0x52,
        S: 0x53,
        T: 0x54,
        U: 0x55,
        V: 0x56,
        W: 0x57,
        X: 0x58,
        Y: 0x59,
        Z: 0x5a,

        ampersand:    0x26,             // &
        asterisk:     0x2A,              // *
        at:           0x40,                    // @
        backslash:    0x5C,             // \
        backtick:     0x60,              // `
        bar:          0x7C,                   // |
        caret:        0x5E,                 // ^
        closeBrace:   0x7D,            // }
        closeBracket: 0x5D,          // ]
        closeParen:   0x29,            // )
        colon:        0x3A,                 // :
        comma:        0x2C,                 // ,
        dot:          0x2E,                   // .
        doubleQuote:  0x22,           // "
        equals:       0x3D,                // =
        exclamation:  0x21,           // !
        greaterThan:  0x3E,           // >
        hash:         0x23,                  // #
        lessThan:     0x3C,              // <
        minus:        0x2D,                 // -
        openBrace:    0x7B,             // {
        openBracket:  0x5B,           // [
        openParen:    0x28,             // (
        percent:      0x25,               // %
        plus:         0x2B,                  // +
        question:     0x3F,              // ?
        semicolon:    0x3B,             // ;
        singleQuote:  0x27,           // '
        slash:        0x2F,                 // /
        tilde:        0x7E,                 // ~

        backspace:     0x08,             // \b
        formFeed:      0x0C,              // \f
        byteOrderMark: 0xFEFF,
        tab:           0x09,                   // \t
        verticalTab:   0x0B           // \v
    } );


/**
 * @enum
 * @name InternalSymbolName
 */
export const InternalSymbolName = make_enum_from_object(
    /**
     * @enum
     * @name InternalSymbolName
     */
    {
        Call:          "__call", // Call signatures
        Constructor:   "__constructor", // Constructor implementations
        New:           "__new", // Constructor signatures
        Index:         "__index", // Index signatures
        ExportStar:    "__export", // Module export * declarations
        Global:        "__global", // Global self-reference
        Missing:       "__missing", // Indicates missing symbol
        Type:          "__type", // Anonymous type literal symbol
        Object:        "__object", // Anonymous object literal declaration
        JSXAttributes: "__jsxAttributes", // Anonymous JSX attributes object literal declaration
        Class:         "__class", // Unnamed class expression
        Function:      "__function", // Unnamed function expression
        Computed:      "__computed", // Computed property name declaration with dynamic name
        Resolving:     "__resolving__", // Indicator symbol used to mark partially resolved type aliases
        ExportEquals:  "export: ", // Export assignment symbol
        Default:       "default" // Default export symbol (technically not wholly internal, but included here for usability)
    } );

/**
 * @enum
 * @name NodeFlags
 */
const NodeFlags0 = make_enum_from_object(
    /**
     * @enum
     * @name NodeFlags
     */
    {
        None:                          0,
        Let:                           1 << 0,  // Variable declaration
        Const:                         1 << 1,  // Variable declaration
        NestedNamespace:               1 << 2,  // Namespace declaration
        Synthesized:                   1 << 3,  // Node was synthesized during transformation
        Namespace:                     1 << 4,  // Namespace declaration
        ExportContext:                 1 << 5,  // Export context (initialized by binding)
        ContainsThis:                  1 << 6,  // Interface contains references to "this"
        HasImplicitReturn:             1 << 7,  // If function implicitly returns on one of codepaths (initialized by binding)
        HasExplicitReturn:             1 << 8,  // If function has explicit reachable return on one of codepaths (initialized by binding)
        GlobalAugmentation:            1 << 9,  // Set if module declaration is an augmentation for the global scope
        HasAsyncFunctions:             1 << 10, // If the file has async functions (initialized by binding)
        DisallowInContext:             1 << 11, // If node was parsed in a context where 'in-expressions' are not allowed
        YieldContext:                  1 << 12, // If node was parsed in the 'yield' context created when parsing a generator
        DecoratorContext:              1 << 13, // If node was parsed as part of a decorator
        AwaitContext:                  1 << 14, // If node was parsed in the 'await' context created when parsing an async function
        ThisNodeHasError:              1 << 15, // If the parser encountered an error when parsing the code that created this node
        JavaScriptFile:                1 << 16, // If node was parsed in a JavaScript
        ThisNodeOrAnySubNodesHasError: 1 << 17, // If this node or any of its children had an error
        HasAggregatedChildData:        1 << 18, // If we've computed data from children and cached it in this node

        // This flag will be set when the parser encounters a dynamic import expression so that module resolution
        // will not have to walk the tree if the flag is not set. However, this flag is just a approximation because
        // once it is set, the flag never gets cleared (hence why it's named "PossiblyContainsDynamicImport").
        // During editing, if dynamic import is removed, incremental parsing will *NOT* update this flag. This means that the tree will always be traversed
        // during module resolution. However, the removal operation should not occur often and in the case of the
        // removal, it is likely that users will add the import anyway.
        // The advantage of this approach is its simplicity. For the case of batch compilation,
        // we guarantee that users won't have to pay the price of walking the tree if a dynamic import isn't used.
        /* @internal */
        PossiblyContainsDynamicImport: 1 << 19,
        JSDoc:                         1 << 20, // If node was parsed inside jsdoc
        /* @internal */
        Ambient:                       1 << 21, // If node was inside an ambient context -- a declaration file, or inside something with the `declare` modifier.
        /* @internal */
        InWithStatement:               1 << 22 // If any ancestor of node was the `statement` of a WithStatement (not the `expression`)
    } );

/**
 * @enum
 * @name NodeFlags
 */
const NodeFlags1 = {
    BlockScoped:              { get: () => NodeFlags0.Let | NodeFlags0.Const },
    ReachabilityCheckFlags:   { get: () => NodeFlags0.HasImplicitReturn | NodeFlags0.HasExplicitReturn },
    ReachabilityAndEmitFlags: { get: () => NodeFlags0.ReachabilityCheckFlags | NodeFlags0.HasAsyncFunctions },
    ContextFlags:             { get: () => NodeFlags0.DisallowInContext | NodeFlags0.YieldContext | NodeFlags0.DecoratorContext | NodeFlags0.AwaitContext | NodeFlags0.JavaScriptFile | NodeFlags0.InWithStatement | NodeFlags0.Ambient },
    TypeExcludesFlags:        { get: () => NodeFlags0.YieldContext | NodeFlags0.AwaitContext }
};

/**
 * @enum
 * @name NodeFlags
 */
export const NodeFlags = make_extra( NodeFlags0, NodeFlags1 );

export const SignatureKind = make_enum_from_object( {
    Call:      0,
    Construct: 1
} );

export const UnionReduction = make_enum_from_object( {
    None:    0,
    Literal: 1,
    Subtype: 2
} );

/**
 * @enum
 * @name CheckFlags
 */
const CheckFlags0 = make_enum_from_object(
    /**
     * @enum
     * @name CheckFlags
     */
    {
        Instantiated:      1 << 0,         // Instantiated symbol
        SyntheticProperty: 1 << 1,         // Property in union or intersection type
        SyntheticMethod:   1 << 2,         // Method in union or intersection type
        Readonly:          1 << 3,         // Readonly transient symbol
        Partial:           1 << 4,         // Synthetic property present in some but not all constituents
        HasNonUniformType: 1 << 5,         // Synthetic property with non-uniform type in constituents
        ContainsPublic:    1 << 6,         // Synthetic property with public constituent(s)
        ContainsProtected: 1 << 7,         // Synthetic property with protected constituent(s)
        ContainsPrivate:   1 << 8,         // Synthetic property with private constituent(s)
        ContainsStatic:    1 << 9,         // Synthetic property with static constituent(s)
        Late:              1 << 10,        // Late-bound symbol for a computed property with a dynamic name
        ReverseMapped:     1 << 11        // property of reverse-inferred homomorphic mapped type.
    } ),
      /**
       * @enum
       * @name CheckFlags
       */
      CheckFlags1 = {
          Synthetic: { get: () => CheckFlags0.SyntheticProperty | CheckFlags0.SyntheticMethod }
      };

/**
 * @enum
 * @name CheckFlags
 */
export const CheckFlags = make_extra( CheckFlags0, CheckFlags1 );

/**
 * @enum
 * @name TypeSystemPropertyName
 */
export const TypeSystemPropertyName = make_enum_from_object( {
    Type:                        "Type",
    ResolvedBaseConstructorType: "ResolvedBaseConstructorType",
    DeclaredType:                "DeclaredType",
    ResolvedReturnType:          "ResolvedReturnType",
    ResolvedBaseConstraint:      "ResolvedBaseConstraint"
} );


/**
 * @enum
 * @name TypeFacts
 */
const TypeFacts0 = make_enum_from_object( {
    None:               0,
    TypeofEQString:     1 << 0,      // typeof x === "string"
    TypeofEQNumber:     1 << 1,      // typeof x === "number"
    TypeofEQBoolean:    1 << 2,     // typeof x === "boolean"
    TypeofEQSymbol:     1 << 3,      // typeof x === "symbol"
    TypeofEQObject:     1 << 4,      // typeof x === "object"
    TypeofEQFunction:   1 << 5,    // typeof x === "function"
    TypeofEQHostObject: 1 << 6,  // typeof x === "xxx"
    TypeofNEString:     1 << 7,      // typeof x !== "string"
    TypeofNENumber:     1 << 8,      // typeof x !== "number"
    TypeofNEBoolean:    1 << 9,     // typeof x !== "boolean"
    TypeofNESymbol:     1 << 10,     // typeof x !== "symbol"
    TypeofNEObject:     1 << 11,     // typeof x !== "object"
    TypeofNEFunction:   1 << 12,   // typeof x !== "function"
    TypeofNEHostObject: 1 << 13, // typeof x !== "xxx"
    EQUndefined:        1 << 14,        // x === undefined
    EQNull:             1 << 15,             // x === null
    EQUndefinedOrNull:  1 << 16,  // x === undefined / x === null
    NEUndefined:        1 << 17,        // x !== undefined
    NENull:             1 << 18,             // x !== null
    NEUndefinedOrNull:  1 << 19,  // x != undefined / x != null
    Truthy:             1 << 20,             // x
    Falsy:              1 << 21,              // !x
    Discriminatable:    1 << 22,    // May have discriminant property
    All:                ( 1 << 23 ) - 1
} ),

      /**
       * The following members encode facts about particular kinds of types for use in the getTypeFacts function.
       * The presence of a particular fact means that the given test is true for some (and possibly all) values
       * of that kind of type.
       *
       * @enum
       * @name TypeFacts
       */
      TypeFacts1 = {
          BaseStringStrictFacts:     {
              get: () => TypeFacts0.TypeofEQString | TypeFacts0.TypeofNENumber | TypeFacts0.TypeofNEBoolean | TypeFacts0.TypeofNESymbol | TypeFacts0.TypeofNEObject | TypeFacts0.TypeofNEFunction |
                         TypeFacts0.TypeofNEHostObject | TypeFacts0.NEUndefined | TypeFacts0.NENull | TypeFacts0.NEUndefinedOrNull
          },
          BaseStringFacts:           { get: () => TypeFacts0.BaseStringStrictFacts | TypeFacts0.EQUndefined | TypeFacts0.EQNull | TypeFacts0.EQUndefinedOrNull | TypeFacts0.Falsy },
          StringStrictFacts:         { get: () => TypeFacts0.BaseStringStrictFacts | TypeFacts0.Truthy | TypeFacts0.Falsy },
          StringFacts:               { get: () => TypeFacts0.BaseStringFacts | TypeFacts0.Truthy },
          EmptyStringStrictFacts:    { get: () => TypeFacts0.BaseStringStrictFacts | TypeFacts0.Falsy },
          EmptyStringFacts:          { get: () => TypeFacts0.BaseStringFacts },
          NonEmptyStringStrictFacts: { get: () => TypeFacts0.BaseStringStrictFacts | TypeFacts0.Truthy },
          NonEmptyStringFacts:       { get: () => TypeFacts0.BaseStringFacts | TypeFacts0.Truthy },
          BaseNumberStrictFacts:     {
              get: () => TypeFacts0.TypeofEQNumber | TypeFacts0.TypeofNEString | TypeFacts0.TypeofNEBoolean | TypeFacts0.TypeofNESymbol | TypeFacts0.TypeofNEObject | TypeFacts0.TypeofNEFunction |
                         TypeFacts0.TypeofNEHostObject | TypeFacts0.NEUndefined | TypeFacts0.NENull | TypeFacts0.NEUndefinedOrNull
          },
          BaseNumberFacts:           { get: () => TypeFacts0.BaseNumberStrictFacts | TypeFacts0.EQUndefined | TypeFacts0.EQNull | TypeFacts0.EQUndefinedOrNull | TypeFacts0.Falsy },
          NumberStrictFacts:         { get: () => TypeFacts0.BaseNumberStrictFacts | TypeFacts0.Truthy | TypeFacts0.Falsy },
          NumberFacts:               { get: () => TypeFacts0.BaseNumberFacts | TypeFacts0.Truthy },
          ZeroStrictFacts:           { get: () => TypeFacts0.BaseNumberStrictFacts | TypeFacts0.Falsy },
          ZeroFacts:                 { get: () => TypeFacts0.BaseNumberFacts },
          NonZeroStrictFacts:        { get: () => TypeFacts0.BaseNumberStrictFacts | TypeFacts0.Truthy },
          NonZeroFacts:              { get: () => TypeFacts0.BaseNumberFacts | TypeFacts0.Truthy },
          BaseBooleanStrictFacts:    {
              get: () => TypeFacts0.TypeofEQBoolean | TypeFacts0.TypeofNEString | TypeFacts0.TypeofNENumber | TypeFacts0.TypeofNESymbol | TypeFacts0.TypeofNEObject | TypeFacts0.TypeofNEFunction |
                         TypeFacts0.TypeofNEHostObject | TypeFacts0.NEUndefined | TypeFacts0.NENull | TypeFacts0.NEUndefinedOrNull
          },
          BaseBooleanFacts:          { get: () => TypeFacts0.BaseBooleanStrictFacts | TypeFacts0.EQUndefined | TypeFacts0.EQNull | TypeFacts0.EQUndefinedOrNull | TypeFacts0.Falsy },
          BooleanStrictFacts:        { get: () => TypeFacts0.BaseBooleanStrictFacts | TypeFacts0.Truthy | TypeFacts0.Falsy },
          BooleanFacts:              { get: () => TypeFacts0.BaseBooleanFacts | TypeFacts0.Truthy },
          FalseStrictFacts:          { get: () => TypeFacts0.BaseBooleanStrictFacts | TypeFacts0.Falsy },
          FalseFacts:                { get: () => TypeFacts0.BaseBooleanFacts },
          TrueStrictFacts:           { get: () => TypeFacts0.BaseBooleanStrictFacts | TypeFacts0.Truthy },
          TrueFacts:                 { get: () => TypeFacts0.BaseBooleanFacts | TypeFacts0.Truthy },
          SymbolStrictFacts:         {
              get: () => TypeFacts0.TypeofEQSymbol | TypeFacts0.TypeofNEString | TypeFacts0.TypeofNENumber | TypeFacts0.TypeofNEBoolean | TypeFacts0.TypeofNEObject | TypeFacts0.TypeofNEFunction |
                         TypeFacts0.TypeofNEHostObject | TypeFacts0.NEUndefined | TypeFacts0.NENull | TypeFacts0.NEUndefinedOrNull | TypeFacts0.Truthy
          },
          SymbolFacts:               { get: () => TypeFacts0.SymbolStrictFacts | TypeFacts0.EQUndefined | TypeFacts0.EQNull | TypeFacts0.EQUndefinedOrNull | TypeFacts0.Falsy },
          ObjectStrictFacts:         {
              get: () => TypeFacts0.TypeofEQObject | TypeFacts0.TypeofEQHostObject | TypeFacts0.TypeofNEString | TypeFacts0.TypeofNENumber | TypeFacts0.TypeofNEBoolean | TypeFacts0.TypeofNESymbol |
                         TypeFacts0.TypeofNEFunction | TypeFacts0.NEUndefined | TypeFacts0.NENull | TypeFacts0.NEUndefinedOrNull | TypeFacts0.Truthy | TypeFacts0.Discriminatable
          },
          ObjectFacts:               { get: () => TypeFacts0.ObjectStrictFacts | TypeFacts0.EQUndefined | TypeFacts0.EQNull | TypeFacts0.EQUndefinedOrNull | TypeFacts0.Falsy },
          FunctionStrictFacts:       {
              get: () => TypeFacts0.TypeofEQFunction | TypeFacts0.TypeofEQHostObject | TypeFacts0.TypeofNEString | TypeFacts0.TypeofNENumber | TypeFacts0.TypeofNEBoolean | TypeFacts0.TypeofNESymbol |
                         TypeFacts0.TypeofNEObject | TypeFacts0.NEUndefined | TypeFacts0.NENull | TypeFacts0.NEUndefinedOrNull | TypeFacts0.Truthy | TypeFacts0.Discriminatable
          },
          FunctionFacts:             { get: () => TypeFacts0.FunctionStrictFacts | TypeFacts0.EQUndefined | TypeFacts0.EQNull | TypeFacts0.EQUndefinedOrNull | TypeFacts0.Falsy },
          UndefinedFacts:            {
              get: () => TypeFacts0.TypeofNEString | TypeFacts0.TypeofNENumber | TypeFacts0.TypeofNEBoolean | TypeFacts0.TypeofNESymbol | TypeFacts0.TypeofNEObject | TypeFacts0.TypeofNEFunction |
                         TypeFacts0.TypeofNEHostObject | TypeFacts0.EQUndefined | TypeFacts0.EQUndefinedOrNull | TypeFacts0.NENull | TypeFacts0.Falsy
          },
          NullFacts:                 {
              get: () => TypeFacts0.TypeofEQObject | TypeFacts0.TypeofNEString | TypeFacts0.TypeofNENumber | TypeFacts0.TypeofNEBoolean | TypeFacts0.TypeofNESymbol | TypeFacts0.TypeofNEFunction |
                         TypeFacts0.TypeofNEHostObject | TypeFacts0.EQNull | TypeFacts0.EQUndefinedOrNull | TypeFacts0.NEUndefined | TypeFacts0.Falsy
          }
      };

/**
 * @enum
 * @name TypeFacts
 */
export const TypeFacts = make_extra( TypeFacts0, TypeFacts1 );

export const
    createMapFromTemplate = obj => {
        const tmp = new Map();

        Object.keys( obj ).forEach( key => tmp.set( key, obj[ key ] ) );

        return tmp;
    };

export const typeofEQFacts = createMapFromTemplate( {
    string:    TypeFacts.TypeofEQString,
    number:    TypeFacts.TypeofEQNumber,
    boolean:   TypeFacts.TypeofEQBoolean,
    symbol:    TypeFacts.TypeofEQSymbol,
    undefined: TypeFacts.EQUndefined,
    object:    TypeFacts.TypeofEQObject,
    function:  TypeFacts.TypeofEQFunction
} );

export const typeofNEFacts = createMapFromTemplate( {
    string:    TypeFacts.TypeofNEString,
    number:    TypeFacts.TypeofNENumber,
    boolean:   TypeFacts.TypeofNEBoolean,
    symbol:    TypeFacts.TypeofNESymbol,
    undefined: TypeFacts.NEUndefined,
    object:    TypeFacts.TypeofNEObject,
    function:  TypeFacts.TypeofNEFunction
} );

/**
 * @enum
 * @name SpecialPropertyAssignmentKind
 */
export const SpecialPropertyAssignmentKind = make_enum_from_object(
    /**
     * @enum
     * @name SpecialPropertyAssignmentKind
     */
    {
        None:              0,
        // exports.name = expr
        ExportsProperty:   1,
        // module.exports = expr
        ModuleExports:     2,
        // className.prototype.name = expr
        PrototypeProperty: 3,
        // this.name = expr
        ThisProperty:      4,
        // F.name = expr
        Property:          5
    } );

/**
 * @typedef {object<string|number,string|number>} EnumAlias
 */
/**
 * @enum
 * @name ContainerFlags
 * @type {function(number|string|ContainerFlags):ContainerFlags|number}
 * @returns {ContainerFlags}
 * @type {function<string|number,string|number|ContainerFlags>}
 */
export const ContainerFlags = make_enum_from_object( {
    // The current node is not a container, and no container manipulation should happen before
    // recursing into it.
    None: 0,

    // The current node is a container.  It should be set as the current container (and block-
    // container) before recursing into it.  The current node does not have locals.  Examples:
    //
    //      Classes, ObjectLiterals, TypeLiterals, Interfaces...
    IsContainer: 1 << 0,

    // The current node is a block-scoped-container.  It should be set as the current block-
    // container before recursing into it.  Examples:
    //
    //      Blocks (when not parented by functions), Catch clauses, For/For-in/For-of statements...
    IsBlockScopedContainer: 1 << 1,

    // The current node is the container of a control flow path. The current control flow should
    // be saved and restored, and a new control flow initialized within the container.
    IsControlFlowContainer: 1 << 2,

    IsFunctionLike:                         1 << 3,
    IsFunctionExpression:                   1 << 4,
    HasLocals:                              1 << 5,
    IsInterface:                            1 << 6,
    IsObjectLiteralOrClassExpressionMethod: 1 << 7
} );

export const ElementKind = make_enum_from_object( {
    Property: 1,
    Accessor: 2
} );

/**
 * @enum
 * @name ModuleInstanceState
 */
export const ModuleInstanceState = make_enum_from_object(
    /**
     * @enum
     * @name ModuleInstanceState
     */
    {
    NonInstantiated: 0,
        Instantiated: 1,
        ConstEnumOnly: 2
} );
