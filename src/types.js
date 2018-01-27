/** ******************************************************************************************************************
 * @file Describe what types does.
 * @author Julian Jensen <jjdanois@gmail.com>
 * @since 1.0.0
 * @date 20-Jan-2018
 *********************************************************************************************************************/
"use strict";

/**
 * @enum
 */
export const TransformFlags = {
    None: 0,

    // Facts
    // - Flags used to indicate that a node or subtree contains syntax that requires transformation.
    unused0:                         1 << 0,
    unused1:                         1 << 1,
    unused2:                         1 << 2,
    unused3:                         1 << 3,
    unused4:                         1 << 4,
    unused5:                         1 << 5,
    unused6:                         1 << 6,
    unused7:                         1 << 7,
    Generator:                       1 << 8,
    ContainsGenerator:               1 << 9,
    DestructuringAssignment:         1 << 10,
    ContainsDestructuringAssignment: 1 << 11,

    // Markers
    // - Flags used to indicate that a subtree contains a specific transformation.
    Parameter:                                 1 << 12,
    ContainsPropertyInitializer:               1 << 13,
    ContainsLexicalThis:                       1 << 14,
    ContainsCapturedLexicalThis:               1 << 15,
    ContainsLexicalThisInComputedPropertyName: 1 << 16,
    ContainsDefaultValueAssignments:           1 << 17,
    ContainsParameterPropertyAssignments:      1 << 18,
    ContainsSpread:                            1 << 19,
    ContainsObjectSpread:                      1 << 20,
    ContainsComputedPropertyName:              1 << 21,
    ContainsBlockScopedBinding:                1 << 22,
    ContainsBindingPattern:                    1 << 23,
    ContainsYield:                             1 << 24,
    ContainsHoistedDeclarationOrCompletion:    1 << 25,
    ContainsDynamicImport:                     1 << 26,
    Super:                                     1 << 27,
    ContainsSuper:                             1 << 28,

    // Please leave this as 1 << 29.
    // It is the maximum bit we can set before we outgrow the size of a v8 small integer (SMI) on an x86 system.
    // It is a good reminder of how much room we have left
    HasComputedFlags: 1 << 29, // Transform flags have been computed.


    asString( val, sep = ' | ' )
    {
        return enum_to_string( this, val ).join( sep );
    }
};


/**
 * @extends TransformFlags
 * @type {enum}
 * @private
 */
const _transformFlags = {
    ContainsRest:                  TransformFlags.ContainsSpread,
    ContainsObjectRest:            TransformFlags.ContainsObjectSpread,
    // Assertions
    // - Bitmasks that are used to assert facts about the syntax of a node and its subtree.
    AssertGenerator:               TransformFlags.Generator | TransformFlags.ContainsGenerator,
    AssertDestructuringAssignment: TransformFlags.DestructuringAssignment | TransformFlags.ContainsDestructuringAssignment,

    // Scope Exclusions
    // - Bitmasks that exclude flags from propagating out of a specific context
    //   into the subtree flags of their container.
    OuterExpressionExcludes:         TransformFlags.DestructuringAssignment | TransformFlags.Generator | TransformFlags.HasComputedFlags,
    PropertyAccessExcludes:          TransformFlags.OuterExpressionExcludes | TransformFlags.Super,
    NodeExcludes:                    TransformFlags.PropertyAccessExcludes | TransformFlags.ContainsSuper,
    ArrowFunctionExcludes:           TransformFlags.NodeExcludes | TransformFlags.ContainsDefaultValueAssignments | TransformFlags.ContainsLexicalThis |
                                     TransformFlags.ContainsParameterPropertyAssignments | TransformFlags.ContainsBlockScopedBinding | TransformFlags.ContainsYield | TransformFlags.ContainsHoistedDeclarationOrCompletion |
                                     TransformFlags.ContainsBindingPattern | TransformFlags.ContainsObjectRest,
    FunctionExcludes:                TransformFlags.NodeExcludes | TransformFlags.ContainsDefaultValueAssignments | TransformFlags.ContainsCapturedLexicalThis | TransformFlags.ContainsLexicalThis | TransformFlags.Parameter |
                                     TransformFlags.ContainsParameterPropertyAssignments | TransformFlags.ContainsBlockScopedBinding | TransformFlags.ContainsYield | TransformFlags.ContainsHoistedDeclarationOrCompletion |
                                     TransformFlags.ContainsBindingPattern | TransformFlags.ContainsObjectRest,
    ConstructorExcludes:             TransformFlags.NodeExcludes | TransformFlags.ContainsDefaultValueAssignments | TransformFlags.ContainsLexicalThis | TransformFlags.ContainsCapturedLexicalThis |
                                     TransformFlags.ContainsBlockScopedBinding |
                                     TransformFlags.ContainsYield | TransformFlags.ContainsHoistedDeclarationOrCompletion | TransformFlags.ContainsBindingPattern | TransformFlags.ContainsObjectRest,
    MethodOrAccessorExcludes:        TransformFlags.NodeExcludes | TransformFlags.ContainsDefaultValueAssignments | TransformFlags.ContainsLexicalThis | TransformFlags.ContainsCapturedLexicalThis |
                                     TransformFlags.ContainsBlockScopedBinding | TransformFlags.ContainsYield | TransformFlags.ContainsHoistedDeclarationOrCompletion | TransformFlags.ContainsBindingPattern |
                                     TransformFlags.ContainsObjectRest,
    ClassExcludes:                   TransformFlags.NodeExcludes | TransformFlags.ContainsPropertyInitializer | TransformFlags.ContainsLexicalThis | TransformFlags.ContainsCapturedLexicalThis |
                                     TransformFlags.ContainsComputedPropertyName | TransformFlags.ContainsParameterPropertyAssignments | TransformFlags.ContainsLexicalThisInComputedPropertyName,
    ModuleExcludes:                  TransformFlags.NodeExcludes | TransformFlags.ContainsLexicalThis | TransformFlags.ContainsCapturedLexicalThis | TransformFlags.ContainsBlockScopedBinding |
                                     TransformFlags.ContainsHoistedDeclarationOrCompletion,
    ObjectLiteralExcludes:           TransformFlags.NodeExcludes | TransformFlags.ContainsComputedPropertyName | TransformFlags.ContainsLexicalThisInComputedPropertyName |
                                     TransformFlags.ContainsObjectSpread,
    ArrayLiteralOrCallOrNewExcludes: TransformFlags.NodeExcludes | TransformFlags.ContainsSpread,
    VariableDeclarationListExcludes: TransformFlags.NodeExcludes | TransformFlags.ContainsBindingPattern | TransformFlags.ContainsObjectRest,
    ParameterExcludes:               TransformFlags.NodeExcludes,
    CatchClauseExcludes:             TransformFlags.NodeExcludes | TransformFlags.ContainsObjectRest,
    BindingPatternExcludes:          TransformFlags.NodeExcludes | TransformFlags.ContainsRest,

    // Masks
    // - Additional bitmasks
    TypeScriptClassSyntaxMask: TransformFlags.ContainsParameterPropertyAssignments | TransformFlags.ContainsPropertyInitializer,
    ES2015FunctionSyntaxMask:  TransformFlags.ContainsCapturedLexicalThis | TransformFlags.ContainsDefaultValueAssignments
};

make_enum_from_object( Object.assign( TransformFlags, _transformFlags ), TransformFlags );

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
 * @enum
 */
export let Type = [
    'NONE',
    'CONST',
    'BLOCKSCOPED',
    'FUNCTIONSCOPED',
    'HOISTABLE',
    'ENUM',
    'OPTIONAL',
    'STATIC',
    'SYSTEM',
    'PARAM',
    'INTERFACE',
    'ITERABLE',
    'ITERATOR',
    'CONSTRUCTOR',
    'GETACCESSOR',
    'SETACCESSOR',
    'ABSTRACT',
    'OVERRIDE',
    'INSTANCE',
    'UNION',
    'PRIVATE',
    'PROTECTED',
    'SUPER',
    'NAMESPACE',
    'EXTERNAL'
];

Type = make_bitfield_enum( Type );

/**
 * @enum
 */
export const SymbolFlags = {
    None:                   0,
    FunctionScopedVariable: 1 << 0,   // Variable (var) or parameter
    BlockScopedVariable:    1 << 1,   // A block-scoped variable (let or const)
    Property:               1 << 2,   // Property or enum member
    EnumMember:             1 << 3,   // Enum member
    Function:               1 << 4,   // Function
    Class:                  1 << 5,   // Class
    Interface:              1 << 6,   // Interface
    Iterable:               1 << 7,   // Implements Iterable
    RegularEnum:            1 << 8,   // Enum
    NoBind:                 1 << 9,   // Arrow function
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
    JSContainer:            1 << 26,  // Contains Javascript special declarations
    Computed:               1 << 27,
    ComputedNotInferred:    1 << 28,
    IndirectDeclaration:    1 << 29,

    asString( val, sep = ' | ' )
    {
        return enum_to_string( this, val ).join( sep );
    }
};

/**
 * @enum
 * @extends SymbolFlags
 * @private
 */
const _symbolFlags = {
    Callable: SymbolFlags.Class | SymbolFlags.Function | SymbolFlags.Method | SymbolFlags.Constructor,
    All: SymbolFlags.FunctionScopedVariable | SymbolFlags.BlockScopedVariable | SymbolFlags.Property | SymbolFlags.EnumMember | SymbolFlags.Function | SymbolFlags.Class | SymbolFlags.Interface | SymbolFlags.ConstEnum |
         SymbolFlags.RegularEnum | SymbolFlags.ValueModule | SymbolFlags.NamespaceModule | SymbolFlags.TypeLiteral | SymbolFlags.ObjectLiteral | SymbolFlags.Method | SymbolFlags.Constructor | SymbolFlags.GetAccessor |
         SymbolFlags.SetAccessor | SymbolFlags.Signature | SymbolFlags.TypeParameter | SymbolFlags.TypeAlias | SymbolFlags.ExportValue |
         SymbolFlags.Alias | SymbolFlags.Prototype | SymbolFlags.ExportStar | SymbolFlags.Optional | SymbolFlags.Transient,

    ValueKnown: SymbolFlags.IndirectDeclaration | SymbolFlags.ComputedNotInferred,

    Enum:      SymbolFlags.RegularEnum | SymbolFlags.ConstEnum,
    Variable:  SymbolFlags.FunctionScopedVariable | SymbolFlags.BlockScopedVariable,
    Value:     SymbolFlags.Variable | SymbolFlags.Property | SymbolFlags.EnumMember | SymbolFlags.Function | SymbolFlags.Class | SymbolFlags.Enum | SymbolFlags.ValueModule | SymbolFlags.Method | SymbolFlags.GetAccessor |
               SymbolFlags.SetAccessor,
    Type:      SymbolFlags.Class | SymbolFlags.Interface | SymbolFlags.Enum | SymbolFlags.EnumMember | SymbolFlags.TypeLiteral | SymbolFlags.ObjectLiteral | SymbolFlags.TypeParameter | SymbolFlags.TypeAlias,
    Namespace: SymbolFlags.ValueModule | SymbolFlags.NamespaceModule | SymbolFlags.Enum,
    Module:    SymbolFlags.ValueModule | SymbolFlags.NamespaceModule,
    Accessor:  SymbolFlags.GetAccessor | SymbolFlags.SetAccessor,

    // Variables can be redeclared, but can not redeclare a block-scoped declaration with the
    // same name, or any other value that is not a variable, e.g. ValueModule or Class
    FunctionScopedVariableExcludes: SymbolFlags.Value & ~SymbolFlags.FunctionScopedVariable,

    // Block-scoped declarations are not allowed to be re-declared
    // they can not merge with anything in the value space
    BlockScopedVariableExcludes: SymbolFlags.Value,

    EnumMemberExcludes:    SymbolFlags.Value | SymbolFlags.Type,
    FunctionExcludes:      SymbolFlags.Value & ~( SymbolFlags.Function | SymbolFlags.ValueModule ),
    ClassExcludes:         ( SymbolFlags.Value | SymbolFlags.Type ) & ~( SymbolFlags.ValueModule | SymbolFlags.Interface ), // class-interface mergability done in checker.ts
    InterfaceExcludes:     SymbolFlags.Type & ~( SymbolFlags.Interface | SymbolFlags.Class ),
    RegularEnumExcludes:   ( SymbolFlags.Value | SymbolFlags.Type ) & ~( SymbolFlags.RegularEnum | SymbolFlags.ValueModule ), // regular enums merge only with regular enums and modules
    ConstEnumExcludes:     ( SymbolFlags.Value | SymbolFlags.Type ) & ~SymbolFlags.ConstEnum, // const enums merge only with const enums
    ValueModuleExcludes:   SymbolFlags.Value & ~( SymbolFlags.Function | SymbolFlags.Class | SymbolFlags.RegularEnum | SymbolFlags.ValueModule ),
    MethodExcludes:        SymbolFlags.Value & ~SymbolFlags.Method,
    GetAccessorExcludes:   SymbolFlags.Value & ~SymbolFlags.SetAccessor,
    SetAccessorExcludes:   SymbolFlags.Value & ~SymbolFlags.GetAccessor,
    TypeParameterExcludes: SymbolFlags.Type & ~SymbolFlags.TypeParameter,

    ModuleMember: SymbolFlags.Variable | SymbolFlags.Function | SymbolFlags.Class | SymbolFlags.Interface | SymbolFlags.Enum | SymbolFlags.Module | SymbolFlags.TypeAlias | SymbolFlags.Alias,

    ExportHasLocal: SymbolFlags.Function | SymbolFlags.Class | SymbolFlags.Enum | SymbolFlags.ValueModule,

    HasExports: SymbolFlags.Class | SymbolFlags.Enum | SymbolFlags.Module,
    HasMembers: SymbolFlags.Class | SymbolFlags.Interface | SymbolFlags.TypeLiteral | SymbolFlags.ObjectLiteral,

    BlockScoped: SymbolFlags.BlockScopedVariable | SymbolFlags.Class | SymbolFlags.Enum,

    PropertyOrAccessor: SymbolFlags.Property | SymbolFlags.Accessor,

    ClassMember: SymbolFlags.Method | SymbolFlags.Accessor | SymbolFlags.Property,

    // The set of things we consider semantically classifiable.  Used to speed up the LS during
    // classification.
    Classifiable: SymbolFlags.Class | SymbolFlags.Enum | SymbolFlags.TypeAlias | SymbolFlags.Interface | SymbolFlags.TypeParameter | SymbolFlags.Module | SymbolFlags.Alias,
    LateBindingContainer: SymbolFlags.Class | SymbolFlags.Interface | SymbolFlags.TypeLiteral | SymbolFlags.ObjectLiteral
};

make_enum_from_object( Object.assign( SymbolFlags, _symbolFlags ), SymbolFlags );

/**
 * @enum
 */
export const TypeFlags = {
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
    FreshLiteral:            1 << 21,  // Fresh literal or unique type
    ContainsWideningType:    1 << 22,  // Type is or contains undefined or null widening type
    ContainsObjectLiteral:   1 << 23,  // Type is or contains object literal type
    ContainsAnyFunctionType: 1 << 24,  // Type is or contains the anyFunctionType
    NonPrimitive:            1 << 25,  // intrinsic object type
    Generator:               1 << 26,
    MarkerType:              1 << 27,  // Marker type used for variance probing,
    asString( val, sep = ' | ' )
    {
        return enum_to_string( this, val ).join( sep );
    }
};

/**
 * @enum
 * @extends TypeFlags
 * @private
 */
const _typeFlags = {
    Nullable:                      TypeFlags.Undefined | TypeFlags.Null,
    Literal:                       TypeFlags.StringLiteral | TypeFlags.NumberLiteral | TypeFlags.BooleanLiteral,
    Unit:                          TypeFlags.Literal | TypeFlags.UniqueESSymbol | TypeFlags.Nullable,
    StringOrNumberLiteral:         TypeFlags.StringLiteral | TypeFlags.NumberLiteral,
    StringOrNumberLiteralOrUnique: TypeFlags.StringOrNumberLiteral | TypeFlags.UniqueESSymbol,
    DefinitelyFalsy:               TypeFlags.StringLiteral | TypeFlags.NumberLiteral | TypeFlags.BooleanLiteral | TypeFlags.Void | TypeFlags.Undefined | TypeFlags.Null,
    PossiblyFalsy:                 TypeFlags.DefinitelyFalsy | TypeFlags.String | TypeFlags.Number | TypeFlags.Boolean,
    Intrinsic:                     TypeFlags.Any | TypeFlags.String | TypeFlags.Number | TypeFlags.Boolean | TypeFlags.BooleanLiteral | TypeFlags.ESSymbol | TypeFlags.Void | TypeFlags.Undefined | TypeFlags.Null | TypeFlags.Never |
                                   TypeFlags.NonPrimitive,
    Primitive:                     TypeFlags.String | TypeFlags.Number | TypeFlags.Boolean | TypeFlags.Enum | TypeFlags.EnumLiteral | TypeFlags.ESSymbol | TypeFlags.Void | TypeFlags.Undefined | TypeFlags.Null | TypeFlags.Literal |
                                   TypeFlags.UniqueESSymbol,
    StringLike:                    TypeFlags.String | TypeFlags.StringLiteral | TypeFlags.Index,
    NumberLike:                    TypeFlags.Number | TypeFlags.NumberLiteral | TypeFlags.Enum,
    BooleanLike:                   TypeFlags.Boolean | TypeFlags.BooleanLiteral,
    EnumLike:                      TypeFlags.Enum | TypeFlags.EnumLiteral,
    ESSymbolLike:                  TypeFlags.ESSymbol | TypeFlags.UniqueESSymbol,
    UnionOrIntersection:           TypeFlags.Union | TypeFlags.Intersection,
    StructuredType:                TypeFlags.Object | TypeFlags.Union | TypeFlags.Intersection,
    StructuredOrTypeVariable:      TypeFlags.StructuredType | TypeFlags.TypeParameter | TypeFlags.Index | TypeFlags.IndexedAccess,
    TypeVariable:                  TypeFlags.TypeParameter | TypeFlags.IndexedAccess,

    // 'Narrowable' types are types where narrowing actually narrows.
    // This *should* be every type other than null, undefined, void, and never
    Narrowable:       TypeFlags.Any | TypeFlags.StructuredType | TypeFlags.TypeParameter | TypeFlags.Index | TypeFlags.IndexedAccess | TypeFlags.StringLike | TypeFlags.NumberLike | TypeFlags.BooleanLike | TypeFlags.ESSymbol |
                      TypeFlags.UniqueESSymbol | TypeFlags.NonPrimitive,
    NotUnionOrUnit:   TypeFlags.Any | TypeFlags.ESSymbol | TypeFlags.Object | TypeFlags.NonPrimitive,
    RequiresWidening: TypeFlags.ContainsWideningType | TypeFlags.ContainsObjectLiteral,
    PropagatingFlags: TypeFlags.ContainsWideningType | TypeFlags.ContainsObjectLiteral | TypeFlags.ContainsAnyFunctionType
};

make_enum_from_object( Object.assign( TypeFlags, _typeFlags ), TypeFlags );

/**
 * @enum
 * @mixes _modifierFlags
 */
export const ModifierFlags = {
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
    Generator:        1 << 12,
    HasComputedFlags: 1 << 29  // Modifier flags have been computed
};

/**
 * @enum
 * @mixin
 * @private
 */
const _modifierFlags = {
        AccessibilityModifier: ModifierFlags.Public | ModifierFlags.Private | ModifierFlags.Protected,
        // Accessibility modifiers and 'readonly' can be attached to a parameter in a constructor to make it a property.
        ParameterPropertyModifier: ModifierFlags.AccessibilityModifier | ModifierFlags.Readonly,
        NonPublicAccessibilityModifier: ModifierFlags.Private | ModifierFlags.Protected,

        TypeScriptModifier: ModifierFlags.Ambient | ModifierFlags.Public | ModifierFlags.Private | ModifierFlags.Protected | ModifierFlags.Readonly | ModifierFlags.Abstract | ModifierFlags.Const,
        ExportDefault: ModifierFlags.Export | ModifierFlags.Default
};

make_enum_from_object( Object.assign( ModifierFlags, _modifierFlags ), ModifierFlags );

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

/**
 * @param {Array<string>} names
 * @return {{}}
 */
function make_bitfield_enum( names )
{
    const __enum = {};

    __enum[ __enum[ 0 ] = 'NONE' ] = 0;

    for ( const [ i, enumName ] of names.entries() )
        __enum[ __enum[ 1 << i ] = enumName ] = 1 << i;

    return __enum;
}

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
