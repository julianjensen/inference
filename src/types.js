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
    unused0:                      1 << 0,
    unused1:              1 << 1,
    unused2:                     1 << 2,
    unused3:                  1 << 3,
    unused4:                  1 << 4,
    unused5:                  1 << 5,
    unused6:                          1 << 6,
    unused7:                  1 << 7,
    Generator:                       1 << 8,
    ContainsGenerator:               1 << 9,
    DestructuringAssignment:         1 << 10,
    ContainsDestructuringAssignment: 1 << 11,

    // Markers
    // - Flags used to indicate that a subtree contains a specific transformation.
    Parameter:                        1 << 12,
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
    HasComputedFlags: 1 << 29 // Transform flags have been computed.
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

Object.assign( TransformFlags, _transformFlags );

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
    JSContainer:            1 << 26,  // Contains Javascript special declarations

    asString( val, sep = ' | ' )
    {
        return enum_to_string( this, val ).join( sep );
    }
};

/**
 * @type {enum}
 * @extends SymbolFlags
 * @private
 */
const _symbolFlags = {
    All: SymbolFlags.FunctionScopedVariable | SymbolFlags.BlockScopedVariable | SymbolFlags.Property | SymbolFlags.EnumMember | SymbolFlags.Function | SymbolFlags.Class | SymbolFlags.Interface | SymbolFlags.ConstEnum |
         SymbolFlags.RegularEnum | SymbolFlags.ValueModule | SymbolFlags.NamespaceModule | SymbolFlags.TypeLiteral | SymbolFlags.ObjectLiteral | SymbolFlags.Method | SymbolFlags.Constructor | SymbolFlags.GetAccessor |
         SymbolFlags.SetAccessor | SymbolFlags.Signature | SymbolFlags.TypeParameter | SymbolFlags.TypeAlias | SymbolFlags.ExportValue |
         SymbolFlags.Alias | SymbolFlags.Prototype | SymbolFlags.ExportStar | SymbolFlags.Optional | SymbolFlags.Transient,

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

    ParameterExcludes:       SymbolFlags.Value,
    PropertyExcludes:        SymbolFlags.None,
    EnumMemberExcludes:      SymbolFlags.Value | SymbolFlags.Type,
    FunctionExcludes:        SymbolFlags.Value & ~( SymbolFlags.Function | SymbolFlags.ValueModule ),
    ClassExcludes:           ( SymbolFlags.Value | SymbolFlags.Type ) & ~( SymbolFlags.ValueModule | SymbolFlags.Interface ), // class-interface mergability done in checker.ts
    InterfaceExcludes:       SymbolFlags.Type & ~( SymbolFlags.Interface | SymbolFlags.Class ),
    RegularEnumExcludes:     ( SymbolFlags.Value | SymbolFlags.Type ) & ~( SymbolFlags.RegularEnum | SymbolFlags.ValueModule ), // regular enums merge only with regular enums and modules
    ConstEnumExcludes:       ( SymbolFlags.Value | SymbolFlags.Type ) & ~SymbolFlags.ConstEnum, // const enums merge only with const enums
    ValueModuleExcludes:     SymbolFlags.Value & ~( SymbolFlags.Function | SymbolFlags.Class | SymbolFlags.RegularEnum | SymbolFlags.ValueModule ),
    NamespaceModuleExcludes: SymbolFlags.None,
    MethodExcludes:          SymbolFlags.Value & ~SymbolFlags.Method,
    GetAccessorExcludes:     SymbolFlags.Value & ~SymbolFlags.SetAccessor,
    SetAccessorExcludes:     SymbolFlags.Value & ~SymbolFlags.GetAccessor,
    TypeParameterExcludes:   SymbolFlags.Type & ~SymbolFlags.TypeParameter,
    TypeAliasExcludes:       SymbolFlags.Type,
    AliasExcludes:           SymbolFlags.Alias,

    ModuleMember: SymbolFlags.Variable | SymbolFlags.Function | SymbolFlags.Class | SymbolFlags.Interface | SymbolFlags.Enum | SymbolFlags.Module | SymbolFlags.TypeAlias | SymbolFlags.Alias,

    ExportHasLocal: SymbolFlags.Function | SymbolFlags.Class | SymbolFlags.Enum | SymbolFlags.ValueModule,

    HasExports: SymbolFlags.Class | SymbolFlags.Enum | SymbolFlags.Module,
    HasMembers: SymbolFlags.Class | SymbolFlags.Interface | SymbolFlags.TypeLiteral | SymbolFlags.ObjectLiteral,

    BlockScoped: SymbolFlags.BlockScopedVariable | SymbolFlags.Class | SymbolFlags.Enum,

    PropertyOrAccessor: SymbolFlags.Property | SymbolFlags.Accessor,

    ClassMember: SymbolFlags.Method | SymbolFlags.Accessor | SymbolFlags.Property,

    /* @internal */
    // The set of things we consider semantically classifiable.  Used to speed up the LS during
    // classification.
    Classifiable: SymbolFlags.Class | SymbolFlags.Enum | SymbolFlags.TypeAlias | SymbolFlags.Interface | SymbolFlags.TypeParameter | SymbolFlags.Module | SymbolFlags.Alias,

    /* @internal */
    LateBindingContainer: SymbolFlags.Class | SymbolFlags.Interface | SymbolFlags.TypeLiteral | SymbolFlags.ObjectLiteral
};

Object.assign( SymbolFlags, _symbolFlags );
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
    JsxAttributes:           1 << 26,  // Jsx attributes type
    MarkerType:              1 << 27,  // Marker type used for variance probing,
    asString( val, sep = ' | ' )
    {
        return enum_to_string( this, val ).join( sep );
    }
};

/**
 * @enum {number}
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
 * @param {object<string,number>} names
 * @param {object<string|number,string|number>} __enum
 * @return {object<string|number,string|number>}
 * @private
 */
function make_enum_from_object( names, __enum )
{
    Object.entries( names ).forEach( ( [ name, val ] ) => typeof val !== 'function' ? ( __enum[ __enum[ name ] = val ] = name ) : __num[ name ] = val );
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
