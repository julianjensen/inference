/** ******************************************************************************************************************
 * @file Parses typescript files.
 *
 * Definition File Node Types
 * --------------------------
 *
 * Generics notes:
 *
 * A generic is a type variable as opposed to a normal variable, i.e. a variable that holds a value of a certain type.
 * In other words, a generic is a variable that holds a type but no value.
 *
 * Pass them as arguments to a function in angled brackets:
 * `myFunc<S, T>( arg1: S, arg2: T ): S {
 *      // ...
 * }`
 *
 * or as a type definition:
 * `<S, T>( a: S, b: T ) => S`
 * or an a signature of an object literal type:
 * `{ <S, T>(a: S, b: T): S }`
 * which leads to interfaces, for example:
 * ```
 * interface GenericIdentityFn {
 *   <T>(arg: T): T;
 * }
 *
 * function identity<T>(arg: T): T {
 *    return arg;
 * }
 *
 * let myIdentity: GenericIdentityFn = identity;
 * ```
 *
 * or
 * ```
 * interface GenericIdentityFn<T> {
 *   (arg: T): T;
 * }
 * ```
 * Now the function is not generic but it's part of a type that is.
 *
 * When used on a `class`, `static` members cannot use the generic types because it must be instantiated with those
 * types for everything to work.
 *
 * Just a placeholder, like `<T>`, is a `TypeReference`
 * To guarantee certain properties, make sure it has those by ensuring properties, like `<T extends Whatever>`
 *
 * To ensure a named property exists on a generic, use a constrict like so:
 *
 * ```
 * function getProp<T, K extends keyof T>( obj: T, key: K ) {
 *      return obj[ key ];
 * }
 * ```
 * `class` factories needs to ensure that it can use `new`, so
 *
 * ```
 * function create<T>( c: { new(): T; } ): T {
 *      return new c();
 * }
 * ```
 *
 *
 *
 * ## Basic Nodes
 *
 * All nodes may have a `modifiers` field, which is an array of modifiers. Examples:
 * `DeclareKeyword`
 *
 * Also, all nodes can have `decorators`
 *
 * ### `Identifier`
 * `escapedText`
 * `text`
 * `kind`: 71
 *
 * ### `ArrayType`
 * `kind`: 164
 * `elementType`: `TypeReference`
 *
 *
 * ### `TypeReference`
 * `kind`: 159
 * `typeName`: `Identifier`
 * `typeArguments[]`: `TypeReference`   // Optional field in `TypeReference`
 *
 * ### `TypeParameter`  // `S extends T`
 * `kind`: 145
 * `name`: `Identifier`     // `S` from example above
 * `constraint`: `TypeReference`    // `constraint.typeName` `T` from example above
 * `default`: The default value, obviously
 *
 * `constraint` can also be a `TypeOperator`    // `P in keyof T`
 * `TypeOperator`:
 * `type`: `TypeReference`  // `keyof T`
 *
 * When `TypeParameter` is in `[` and `]` then it reads as `S in constraint`
 *
 *
 * `TypePredicate`  // Here a return `type` of a `FunctionType`
 * `parameterName`: `Identifier`
 * `type`: `TypeReference`
 * written as `ident is S`
 * A function takes a union type, checks which it is, and returns true or false for the type of the you wish to identify
 * and declare the return type as `NameOfFunctionParameter is NameOfActualType` like so:
 *
 * ```
 * function isRefreshable(widget : (Refreshable | Cacheable)) : widget is Refreshable
 * {
 *     return (<Refreshable> widget).update !== undefined; // Cast widget to Refreshable; check for defining property.
 * }
 * ```
 *
 *
 * ## `InterfaceDeclaration`
 *
 * `kind`: 230
 * `name`: `Identifier`
 * `typeParameters`:
 * `heritageClauses`:
 * `members[]`:
 *
 * ### Members
 * `ConstructSignature`     // Looks like `new(value?: any): Object;`
 *
 * `typeParameters`
 * `parameters[]`: `Parameter`
 * `kind`: 146
 * `dotdotdotToken`, `name`, `questionToken`, `type`, `initializer`
 *
 * `type`:
 * `TypeReference`
 * `ArrayType`
 * `ParenthesizedType`
 * `UnionType` or `IntersectionType`
 *      `types[]`: `TypeReference`
 *
 *
 *
 * `CallSignature`          // Looks like `(): any;` or `(value: any): any;`
 * `kind`: 155, `typeParameters`, `parameters`, `type`
 *
 *
 * `typeParameters`
 * `parameters`
 * `type`: `AnyKeyword`
 *
 * `PropertySignature`      // `value?: any;`
 *
 * `MethodSignature`:       // `set?(v: any): void;`
 *
 * `type`: can be a node or an array of nodes
 *
 *
 * ## `VariableDeclaration`
 * From `VariableStatement.declarationList` -> `VariableDeclarationList.declarations` -> `VariableDeclaration`
 *
 * `kind`: 226
 * `name`: one of `Identifier`
 * `type`: one of `NumberKeyword`
 * `initializer`
 *
 *
 * ## `FunctionDeclaration`
 *
 * `kind`: 228
 * `asteriskToken`: `undefined`
 * `name`: `Identifier`
 * `typeParameters`: `undefined`
 * `type`: `NumberKeyword`
 * `body`: `undefined`
 * `jsDoc`:
 *
 *
 * ## `ClassDeclaration`
 *
 *
 *
 * ## `TypeAliasDeclaration`
 * `name`
 * `typeParameters[]`
 * `type`: `MappedType`
 *
 *
 * ## `EnumDeclaration`
 *
 *
 *
 * ## `ModuleDeclaration`
 *
 *
 *
 *
 * ## `MappedType`
 * `readonlyToken:
 * `typeParameter`:
 * `questionToken`:
 * `type`:
 *
 * When `typeParameter` is `name` and `constraint` = `TypeReference`
 * ```
 * {
 *      // `typeParameter`  `type`
 *      [P in K]:           T[P]
 * }
 * ```
 * When `typeParameter` is `name` and `constraint` is `TypeOperator` and `TypeOperator.type` = `TypeReference`
 * ```
 * {
 *      [P in keyof T]?: T[P]
 * }
 * ```
 *
 * ## `jsDoc`
 * array of `JSDocComment`
 * each of which have
 *
 * `kind`: 275
 * `tags`: array of `JSDocParameterTag`
 * `comment`: The text of the comment sans tags plus args
 *
 * @author Julian Jensen <jjdanois@gmail.com>
 * @since 1.0.0
 * @date 29-Jan-2018
 *********************************************************************************************************************/
"use strict";

// import { visit } from 'typescript-walk';
import { object, number, array, has } from 'convenience';
import ts                             from 'typescript';
import {
    indent,
    show_copy_paste,
    syntaxKind,
    nodeName,
    show_fields,
    collect_fields
}                                     from './ts-helpers';
import { traverse }                   from './ts-ast-walker';
import { inspect }                    from 'util';
import { nameOf }                     from 'typeofs';
import { visitor } from "../symbols/define-libraries";

// export const SyntaxKind = {};
//
// SyntaxKind[ SyntaxKind.Unknown = 0 ] = "Unknown";
// SyntaxKind[ SyntaxKind.EndOfFileToken = 1 ] = "EndOfFileToken";
// SyntaxKind[ SyntaxKind.SingleLineCommentTrivia = 2 ] = "SingleLineCommentTrivia";
// SyntaxKind[ SyntaxKind.MultiLineCommentTrivia = 3 ] = "MultiLineCommentTrivia";
// SyntaxKind[ SyntaxKind.NewLineTrivia = 4 ] = "NewLineTrivia";
// SyntaxKind[ SyntaxKind.WhitespaceTrivia = 5 ] = "WhitespaceTrivia";
// // We detect and preserve #! on the first line
// SyntaxKind[ SyntaxKind.ShebangTrivia = 6 ] = "ShebangTrivia";
// // We detect and provide better error recovery when we encounter a git merge marker.  This
// // allows us to edit files with git-conflict markers in them in a much more pleasant manner.
// SyntaxKind[ SyntaxKind.ConflictMarkerTrivia = 7 ] = "ConflictMarkerTrivia";
// // Literals
// SyntaxKind[ SyntaxKind.NumericLiteral = 8 ] = "NumericLiteral";
// SyntaxKind[ SyntaxKind.StringLiteral = 9 ] = "StringLiteral";
// SyntaxKind[ SyntaxKind.JsxText = 10 ] = "JsxText";
// SyntaxKind[ SyntaxKind.JsxTextAllWhiteSpaces = 11 ] = "JsxTextAllWhiteSpaces";
// SyntaxKind[ SyntaxKind.RegularExpressionLiteral = 12 ] = "RegularExpressionLiteral";
// SyntaxKind[ SyntaxKind.NoSubstitutionTemplateLiteral = 13 ] = "NoSubstitutionTemplateLiteral";
// // Pseudo-literals
// SyntaxKind[ SyntaxKind.TemplateHead = 14 ] = "TemplateHead";
// SyntaxKind[ SyntaxKind.TemplateMiddle = 15 ] = "TemplateMiddle";
// SyntaxKind[ SyntaxKind.TemplateTail = 16 ] = "TemplateTail";
// // Punctuation
// SyntaxKind[ SyntaxKind.OpenBraceToken = 17 ] = "OpenBraceToken";
// SyntaxKind[ SyntaxKind.CloseBraceToken = 18 ] = "CloseBraceToken";
// SyntaxKind[ SyntaxKind.OpenParenToken = 19 ] = "OpenParenToken";
// SyntaxKind[ SyntaxKind.CloseParenToken = 20 ] = "CloseParenToken";
// SyntaxKind[ SyntaxKind.OpenBracketToken = 21 ] = "OpenBracketToken";
// SyntaxKind[ SyntaxKind.CloseBracketToken = 22 ] = "CloseBracketToken";
// SyntaxKind[ SyntaxKind.DotToken = 23 ] = "DotToken";
// SyntaxKind[ SyntaxKind.DotDotDotToken = 24 ] = "DotDotDotToken";
// SyntaxKind[ SyntaxKind.SemicolonToken = 25 ] = "SemicolonToken";
// SyntaxKind[ SyntaxKind.CommaToken = 26 ] = "CommaToken";
// SyntaxKind[ SyntaxKind.LessThanToken = 27 ] = "LessThanToken";
// SyntaxKind[ SyntaxKind.LessThanSlashToken = 28 ] = "LessThanSlashToken";
// SyntaxKind[ SyntaxKind.GreaterThanToken = 29 ] = "GreaterThanToken";
// SyntaxKind[ SyntaxKind.LessThanEqualsToken = 30 ] = "LessThanEqualsToken";
// SyntaxKind[ SyntaxKind.GreaterThanEqualsToken = 31 ] = "GreaterThanEqualsToken";
// SyntaxKind[ SyntaxKind.EqualsEqualsToken = 32 ] = "EqualsEqualsToken";
// SyntaxKind[ SyntaxKind.ExclamationEqualsToken = 33 ] = "ExclamationEqualsToken";
// SyntaxKind[ SyntaxKind.EqualsEqualsEqualsToken = 34 ] = "EqualsEqualsEqualsToken";
// SyntaxKind[ SyntaxKind.ExclamationEqualsEqualsToken = 35 ] = "ExclamationEqualsEqualsToken";
// SyntaxKind[ SyntaxKind.EqualsGreaterThanToken = 36 ] = "EqualsGreaterThanToken";
// SyntaxKind[ SyntaxKind.PlusToken = 37 ] = "PlusToken";
// SyntaxKind[ SyntaxKind.MinusToken = 38 ] = "MinusToken";
// SyntaxKind[ SyntaxKind.AsteriskToken = 39 ] = "AsteriskToken";
// SyntaxKind[ SyntaxKind.AsteriskAsteriskToken = 40 ] = "AsteriskAsteriskToken";
// SyntaxKind[ SyntaxKind.SlashToken = 41 ] = "SlashToken";
// SyntaxKind[ SyntaxKind.PercentToken = 42 ] = "PercentToken";
// SyntaxKind[ SyntaxKind.PlusPlusToken = 43 ] = "PlusPlusToken";
// SyntaxKind[ SyntaxKind.MinusMinusToken = 44 ] = "MinusMinusToken";
// SyntaxKind[ SyntaxKind.LessThanLessThanToken = 45 ] = "LessThanLessThanToken";
// SyntaxKind[ SyntaxKind.GreaterThanGreaterThanToken = 46 ] = "GreaterThanGreaterThanToken";
// SyntaxKind[ SyntaxKind.GreaterThanGreaterThanGreaterThanToken = 47 ] = "GreaterThanGreaterThanGreaterThanToken";
// SyntaxKind[ SyntaxKind.AmpersandToken = 48 ] = "AmpersandToken";
// SyntaxKind[ SyntaxKind.BarToken = 49 ] = "BarToken";
// SyntaxKind[ SyntaxKind.CaretToken = 50 ] = "CaretToken";
// SyntaxKind[ SyntaxKind.ExclamationToken = 51 ] = "ExclamationToken";
// SyntaxKind[ SyntaxKind.TildeToken = 52 ] = "TildeToken";
// SyntaxKind[ SyntaxKind.AmpersandAmpersandToken = 53 ] = "AmpersandAmpersandToken";
// SyntaxKind[ SyntaxKind.BarBarToken = 54 ] = "BarBarToken";
// SyntaxKind[ SyntaxKind.QuestionToken = 55 ] = "QuestionToken";
// SyntaxKind[ SyntaxKind.ColonToken = 56 ] = "ColonToken";
// SyntaxKind[ SyntaxKind.AtToken = 57 ] = "AtToken";
// // Assignments
// SyntaxKind[ SyntaxKind.EqualsToken = 58 ] = "EqualsToken";
// SyntaxKind[ SyntaxKind.PlusEqualsToken = 59 ] = "PlusEqualsToken";
// SyntaxKind[ SyntaxKind.MinusEqualsToken = 60 ] = "MinusEqualsToken";
// SyntaxKind[ SyntaxKind.AsteriskEqualsToken = 61 ] = "AsteriskEqualsToken";
// SyntaxKind[ SyntaxKind.AsteriskAsteriskEqualsToken = 62 ] = "AsteriskAsteriskEqualsToken";
// SyntaxKind[ SyntaxKind.SlashEqualsToken = 63 ] = "SlashEqualsToken";
// SyntaxKind[ SyntaxKind.PercentEqualsToken = 64 ] = "PercentEqualsToken";
// SyntaxKind[ SyntaxKind.LessThanLessThanEqualsToken = 65 ] = "LessThanLessThanEqualsToken";
// SyntaxKind[ SyntaxKind.GreaterThanGreaterThanEqualsToken = 66 ] = "GreaterThanGreaterThanEqualsToken";
// SyntaxKind[ SyntaxKind.GreaterThanGreaterThanGreaterThanEqualsToken = 67 ] = "GreaterThanGreaterThanGreaterThanEqualsToken";
// SyntaxKind[ SyntaxKind.AmpersandEqualsToken = 68 ] = "AmpersandEqualsToken";
// SyntaxKind[ SyntaxKind.BarEqualsToken = 69 ] = "BarEqualsToken";
// SyntaxKind[ SyntaxKind.CaretEqualsToken = 70 ] = "CaretEqualsToken";
// // Identifiers
// SyntaxKind[ SyntaxKind.Identifier = 71 ] = "Identifier";
// // Reserved words
// SyntaxKind[ SyntaxKind.BreakKeyword = 72 ] = "BreakKeyword";
// SyntaxKind[ SyntaxKind.CaseKeyword = 73 ] = "CaseKeyword";
// SyntaxKind[ SyntaxKind.CatchKeyword = 74 ] = "CatchKeyword";
// SyntaxKind[ SyntaxKind.ClassKeyword = 75 ] = "ClassKeyword";
// SyntaxKind[ SyntaxKind.ConstKeyword = 76 ] = "ConstKeyword";
// SyntaxKind[ SyntaxKind.ContinueKeyword = 77 ] = "ContinueKeyword";
// SyntaxKind[ SyntaxKind.DebuggerKeyword = 78 ] = "DebuggerKeyword";
// SyntaxKind[ SyntaxKind.DefaultKeyword = 79 ] = "DefaultKeyword";
// SyntaxKind[ SyntaxKind.DeleteKeyword = 80 ] = "DeleteKeyword";
// SyntaxKind[ SyntaxKind.DoKeyword = 81 ] = "DoKeyword";
// SyntaxKind[ SyntaxKind.ElseKeyword = 82 ] = "ElseKeyword";
// SyntaxKind[ SyntaxKind.EnumKeyword = 83 ] = "EnumKeyword";
// SyntaxKind[ SyntaxKind.ExportKeyword = 84 ] = "ExportKeyword";
// SyntaxKind[ SyntaxKind.ExtendsKeyword = 85 ] = "ExtendsKeyword";
// SyntaxKind[ SyntaxKind.FalseKeyword = 86 ] = "FalseKeyword";
// SyntaxKind[ SyntaxKind.FinallyKeyword = 87 ] = "FinallyKeyword";
// SyntaxKind[ SyntaxKind.ForKeyword = 88 ] = "ForKeyword";
// SyntaxKind[ SyntaxKind.FunctionKeyword = 89 ] = "FunctionKeyword";
// SyntaxKind[ SyntaxKind.IfKeyword = 90 ] = "IfKeyword";
// SyntaxKind[ SyntaxKind.ImportKeyword = 91 ] = "ImportKeyword";
// SyntaxKind[ SyntaxKind.InKeyword = 92 ] = "InKeyword";
// SyntaxKind[ SyntaxKind.InstanceOfKeyword = 93 ] = "InstanceOfKeyword";
// SyntaxKind[ SyntaxKind.NewKeyword = 94 ] = "NewKeyword";
// SyntaxKind[ SyntaxKind.NullKeyword = 95 ] = "NullKeyword";
// SyntaxKind[ SyntaxKind.ReturnKeyword = 96 ] = "ReturnKeyword";
// SyntaxKind[ SyntaxKind.SuperKeyword = 97 ] = "SuperKeyword";
// SyntaxKind[ SyntaxKind.SwitchKeyword = 98 ] = "SwitchKeyword";
// SyntaxKind[ SyntaxKind.ThisKeyword = 99 ] = "ThisKeyword";
// SyntaxKind[ SyntaxKind.ThrowKeyword = 100 ] = "ThrowKeyword";
// SyntaxKind[ SyntaxKind.TrueKeyword = 101 ] = "TrueKeyword";
// SyntaxKind[ SyntaxKind.TryKeyword = 102 ] = "TryKeyword";
// SyntaxKind[ SyntaxKind.TypeOfKeyword = 103 ] = "TypeOfKeyword";
// SyntaxKind[ SyntaxKind.VarKeyword = 104 ] = "VarKeyword";
// SyntaxKind[ SyntaxKind.VoidKeyword = 105 ] = "VoidKeyword";
// SyntaxKind[ SyntaxKind.WhileKeyword = 106 ] = "WhileKeyword";
// SyntaxKind[ SyntaxKind.WithKeyword = 107 ] = "WithKeyword";
// // Strict mode reserved words
// SyntaxKind[ SyntaxKind.ImplementsKeyword = 108 ] = "ImplementsKeyword";
// SyntaxKind[ SyntaxKind.InterfaceKeyword = 109 ] = "InterfaceKeyword";
// SyntaxKind[ SyntaxKind.LetKeyword = 110 ] = "LetKeyword";
// SyntaxKind[ SyntaxKind.PackageKeyword = 111 ] = "PackageKeyword";
// SyntaxKind[ SyntaxKind.PrivateKeyword = 112 ] = "PrivateKeyword";
// SyntaxKind[ SyntaxKind.ProtectedKeyword = 113 ] = "ProtectedKeyword";
// SyntaxKind[ SyntaxKind.PublicKeyword = 114 ] = "PublicKeyword";
// SyntaxKind[ SyntaxKind.StaticKeyword = 115 ] = "StaticKeyword";
// SyntaxKind[ SyntaxKind.YieldKeyword = 116 ] = "YieldKeyword";
// // Contextual keywords
// SyntaxKind[ SyntaxKind.AbstractKeyword = 117 ] = "AbstractKeyword";
// SyntaxKind[ SyntaxKind.AsKeyword = 118 ] = "AsKeyword";
// SyntaxKind[ SyntaxKind.AnyKeyword = 119 ] = "AnyKeyword";
// SyntaxKind[ SyntaxKind.AsyncKeyword = 120 ] = "AsyncKeyword";
// SyntaxKind[ SyntaxKind.AwaitKeyword = 121 ] = "AwaitKeyword";
// SyntaxKind[ SyntaxKind.BooleanKeyword = 122 ] = "BooleanKeyword";
// SyntaxKind[ SyntaxKind.ConstructorKeyword = 123 ] = "ConstructorKeyword";
// SyntaxKind[ SyntaxKind.DeclareKeyword = 124 ] = "DeclareKeyword";
// SyntaxKind[ SyntaxKind.GetKeyword = 125 ] = "GetKeyword";
// SyntaxKind[ SyntaxKind.IsKeyword = 126 ] = "IsKeyword";
// SyntaxKind[ SyntaxKind.KeyOfKeyword = 127 ] = "KeyOfKeyword";
// SyntaxKind[ SyntaxKind.ModuleKeyword = 128 ] = "ModuleKeyword";
// SyntaxKind[ SyntaxKind.NamespaceKeyword = 129 ] = "NamespaceKeyword";
// SyntaxKind[ SyntaxKind.NeverKeyword = 130 ] = "NeverKeyword";
// SyntaxKind[ SyntaxKind.ReadonlyKeyword = 131 ] = "ReadonlyKeyword";
// SyntaxKind[ SyntaxKind.RequireKeyword = 132 ] = "RequireKeyword";
// SyntaxKind[ SyntaxKind.NumberKeyword = 133 ] = "NumberKeyword";
// SyntaxKind[ SyntaxKind.ObjectKeyword = 134 ] = "ObjectKeyword";
// SyntaxKind[ SyntaxKind.SetKeyword = 135 ] = "SetKeyword";
// SyntaxKind[ SyntaxKind.StringKeyword = 136 ] = "StringKeyword";
// SyntaxKind[ SyntaxKind.SymbolKeyword = 137 ] = "SymbolKeyword";
// SyntaxKind[ SyntaxKind.TypeKeyword = 138 ] = "TypeKeyword";
// SyntaxKind[ SyntaxKind.UndefinedKeyword = 139 ] = "UndefinedKeyword";
// SyntaxKind[ SyntaxKind.UniqueKeyword = 140 ] = "UniqueKeyword";
// SyntaxKind[ SyntaxKind.FromKeyword = 141 ] = "FromKeyword";
// SyntaxKind[ SyntaxKind.GlobalKeyword = 142 ] = "GlobalKeyword";
// SyntaxKind[ SyntaxKind.OfKeyword = 143 ] = "OfKeyword";
// // Parse tree nodes
// // Names
// SyntaxKind[ SyntaxKind.QualifiedName = 144 ] = "QualifiedName";
// SyntaxKind[ SyntaxKind.ComputedPropertyName = 145 ] = "ComputedPropertyName";
// // Signature elements
// SyntaxKind[ SyntaxKind.TypeParameter = 146 ] = "TypeParameter";
// SyntaxKind[ SyntaxKind.Parameter = 147 ] = "Parameter";
// SyntaxKind[ SyntaxKind.Decorator = 148 ] = "Decorator";
// // TypeMember
// SyntaxKind[ SyntaxKind.PropertySignature = 149 ] = "PropertySignature";
// SyntaxKind[ SyntaxKind.PropertyDeclaration = 150 ] = "PropertyDeclaration";
// SyntaxKind[ SyntaxKind.MethodSignature = 151 ] = "MethodSignature";
// SyntaxKind[ SyntaxKind.MethodDeclaration = 152 ] = "MethodDeclaration";
// SyntaxKind[ SyntaxKind.Constructor = 153 ] = "Constructor";
// SyntaxKind[ SyntaxKind.GetAccessor = 154 ] = "GetAccessor";
// SyntaxKind[ SyntaxKind.SetAccessor = 155 ] = "SetAccessor";
// SyntaxKind[ SyntaxKind.CallSignature = 156 ] = "CallSignature";
// SyntaxKind[ SyntaxKind.ConstructSignature = 157 ] = "ConstructSignature";
// SyntaxKind[ SyntaxKind.IndexSignature = 158 ] = "IndexSignature";
// // Type
// SyntaxKind[ SyntaxKind.TypePredicate = 159 ] = "TypePredicate";
// SyntaxKind[ SyntaxKind.TypeReference = 160 ] = "TypeReference";
// SyntaxKind[ SyntaxKind.FunctionType = 161 ] = "FunctionType";
// SyntaxKind[ SyntaxKind.ConstructorType = 162 ] = "ConstructorType";
// SyntaxKind[ SyntaxKind.TypeQuery = 163 ] = "TypeQuery";
// SyntaxKind[ SyntaxKind.TypeLiteral = 164 ] = "TypeLiteral";
// SyntaxKind[ SyntaxKind.ArrayType = 165 ] = "ArrayType";
// SyntaxKind[ SyntaxKind.TupleType = 166 ] = "TupleType";
// SyntaxKind[ SyntaxKind.UnionType = 167 ] = "UnionType";
// SyntaxKind[ SyntaxKind.IntersectionType = 168 ] = "IntersectionType";
// SyntaxKind[ SyntaxKind.ParenthesizedType = 169 ] = "ParenthesizedType";
// SyntaxKind[ SyntaxKind.ThisType = 170 ] = "ThisType";
// SyntaxKind[ SyntaxKind.TypeOperator = 171 ] = "TypeOperator";
// SyntaxKind[ SyntaxKind.IndexedAccessType = 172 ] = "IndexedAccessType";
// SyntaxKind[ SyntaxKind.MappedType = 173 ] = "MappedType";
// SyntaxKind[ SyntaxKind.LiteralType = 174 ] = "LiteralType";
// // Binding patterns
// SyntaxKind[ SyntaxKind.ObjectBindingPattern = 175 ] = "ObjectBindingPattern";
// SyntaxKind[ SyntaxKind.ArrayBindingPattern = 176 ] = "ArrayBindingPattern";
// SyntaxKind[ SyntaxKind.BindingElement = 177 ] = "BindingElement";
// // Expression
// SyntaxKind[ SyntaxKind.ArrayLiteralExpression = 178 ] = "ArrayLiteralExpression";
// SyntaxKind[ SyntaxKind.ObjectLiteralExpression = 179 ] = "ObjectLiteralExpression";
// SyntaxKind[ SyntaxKind.PropertyAccessExpression = 180 ] = "PropertyAccessExpression";
// SyntaxKind[ SyntaxKind.ElementAccessExpression = 181 ] = "ElementAccessExpression";
// SyntaxKind[ SyntaxKind.CallExpression = 182 ] = "CallExpression";
// SyntaxKind[ SyntaxKind.NewExpression = 183 ] = "NewExpression";
// SyntaxKind[ SyntaxKind.TaggedTemplateExpression = 184 ] = "TaggedTemplateExpression";
// SyntaxKind[ SyntaxKind.TypeAssertionExpression = 185 ] = "TypeAssertionExpression";
// SyntaxKind[ SyntaxKind.ParenthesizedExpression = 186 ] = "ParenthesizedExpression";
// SyntaxKind[ SyntaxKind.FunctionExpression = 187 ] = "FunctionExpression";
// SyntaxKind[ SyntaxKind.ArrowFunction = 188 ] = "ArrowFunction";
// SyntaxKind[ SyntaxKind.DeleteExpression = 189 ] = "DeleteExpression";
// SyntaxKind[ SyntaxKind.TypeOfExpression = 190 ] = "TypeOfExpression";
// SyntaxKind[ SyntaxKind.VoidExpression = 191 ] = "VoidExpression";
// SyntaxKind[ SyntaxKind.AwaitExpression = 192 ] = "AwaitExpression";
// SyntaxKind[ SyntaxKind.PrefixUnaryExpression = 193 ] = "PrefixUnaryExpression";
// SyntaxKind[ SyntaxKind.PostfixUnaryExpression = 194 ] = "PostfixUnaryExpression";
// SyntaxKind[ SyntaxKind.BinaryExpression = 195 ] = "BinaryExpression";
// SyntaxKind[ SyntaxKind.ConditionalExpression = 196 ] = "ConditionalExpression";
// SyntaxKind[ SyntaxKind.TemplateExpression = 197 ] = "TemplateExpression";
// SyntaxKind[ SyntaxKind.YieldExpression = 198 ] = "YieldExpression";
// SyntaxKind[ SyntaxKind.SpreadElement = 199 ] = "SpreadElement";
// SyntaxKind[ SyntaxKind.ClassExpression = 200 ] = "ClassExpression";
// SyntaxKind[ SyntaxKind.OmittedExpression = 201 ] = "OmittedExpression";
// SyntaxKind[ SyntaxKind.ExpressionWithTypeArguments = 202 ] = "ExpressionWithTypeArguments";
// SyntaxKind[ SyntaxKind.AsExpression = 203 ] = "AsExpression";
// SyntaxKind[ SyntaxKind.NonNullExpression = 204 ] = "NonNullExpression";
// SyntaxKind[ SyntaxKind.MetaProperty = 205 ] = "MetaProperty";
// // Misc
// SyntaxKind[ SyntaxKind.TemplateSpan = 206 ] = "TemplateSpan";
// SyntaxKind[ SyntaxKind.SemicolonClassElement = 207 ] = "SemicolonClassElement";
// // Element
// SyntaxKind[ SyntaxKind.Block = 208 ] = "Block";
// SyntaxKind[ SyntaxKind.VariableStatement = 209 ] = "VariableStatement";
// SyntaxKind[ SyntaxKind.EmptyStatement = 210 ] = "EmptyStatement";
// SyntaxKind[ SyntaxKind.ExpressionStatement = 211 ] = "ExpressionStatement";
// SyntaxKind[ SyntaxKind.IfStatement = 212 ] = "IfStatement";
// SyntaxKind[ SyntaxKind.DoStatement = 213 ] = "DoStatement";
// SyntaxKind[ SyntaxKind.WhileStatement = 214 ] = "WhileStatement";
// SyntaxKind[ SyntaxKind.ForStatement = 215 ] = "ForStatement";
// SyntaxKind[ SyntaxKind.ForInStatement = 216 ] = "ForInStatement";
// SyntaxKind[ SyntaxKind.ForOfStatement = 217 ] = "ForOfStatement";
// SyntaxKind[ SyntaxKind.ContinueStatement = 218 ] = "ContinueStatement";
// SyntaxKind[ SyntaxKind.BreakStatement = 219 ] = "BreakStatement";
// SyntaxKind[ SyntaxKind.ReturnStatement = 220 ] = "ReturnStatement";
// SyntaxKind[ SyntaxKind.WithStatement = 221 ] = "WithStatement";
// SyntaxKind[ SyntaxKind.SwitchStatement = 222 ] = "SwitchStatement";
// SyntaxKind[ SyntaxKind.LabeledStatement = 223 ] = "LabeledStatement";
// SyntaxKind[ SyntaxKind.ThrowStatement = 224 ] = "ThrowStatement";
// SyntaxKind[ SyntaxKind.TryStatement = 225 ] = "TryStatement";
// SyntaxKind[ SyntaxKind.DebuggerStatement = 226 ] = "DebuggerStatement";
// SyntaxKind[ SyntaxKind.VariableDeclaration = 227 ] = "VariableDeclaration";
// SyntaxKind[ SyntaxKind.VariableDeclarationList = 228 ] = "VariableDeclarationList";
// SyntaxKind[ SyntaxKind.FunctionDeclaration = 229 ] = "FunctionDeclaration";
// SyntaxKind[ SyntaxKind.ClassDeclaration = 230 ] = "ClassDeclaration";
// SyntaxKind[ SyntaxKind.InterfaceDeclaration = 231 ] = "InterfaceDeclaration";
// SyntaxKind[ SyntaxKind.TypeAliasDeclaration = 232 ] = "TypeAliasDeclaration";
// SyntaxKind[ SyntaxKind.EnumDeclaration = 233 ] = "EnumDeclaration";
// SyntaxKind[ SyntaxKind.ModuleDeclaration = 234 ] = "ModuleDeclaration";
// SyntaxKind[ SyntaxKind.ModuleBlock = 235 ] = "ModuleBlock";
// SyntaxKind[ SyntaxKind.CaseBlock = 236 ] = "CaseBlock";
// SyntaxKind[ SyntaxKind.NamespaceExportDeclaration = 237 ] = "NamespaceExportDeclaration";
// SyntaxKind[ SyntaxKind.ImportEqualsDeclaration = 238 ] = "ImportEqualsDeclaration";
// SyntaxKind[ SyntaxKind.ImportDeclaration = 239 ] = "ImportDeclaration";
// SyntaxKind[ SyntaxKind.ImportClause = 240 ] = "ImportClause";
// SyntaxKind[ SyntaxKind.NamespaceImport = 241 ] = "NamespaceImport";
// SyntaxKind[ SyntaxKind.NamedImports = 242 ] = "NamedImports";
// SyntaxKind[ SyntaxKind.ImportSpecifier = 243 ] = "ImportSpecifier";
// SyntaxKind[ SyntaxKind.ExportAssignment = 244 ] = "ExportAssignment";
// SyntaxKind[ SyntaxKind.ExportDeclaration = 245 ] = "ExportDeclaration";
// SyntaxKind[ SyntaxKind.NamedExports = 246 ] = "NamedExports";
// SyntaxKind[ SyntaxKind.ExportSpecifier = 247 ] = "ExportSpecifier";
// SyntaxKind[ SyntaxKind.MissingDeclaration = 248 ] = "MissingDeclaration";
// // Module references
// SyntaxKind[ SyntaxKind.ExternalModuleReference = 249 ] = "ExternalModuleReference";
// // JSX
// SyntaxKind[ SyntaxKind.JsxElement = 250 ] = "JsxElement";
// SyntaxKind[ SyntaxKind.JsxSelfClosingElement = 251 ] = "JsxSelfClosingElement";
// SyntaxKind[ SyntaxKind.JsxOpeningElement = 252 ] = "JsxOpeningElement";
// SyntaxKind[ SyntaxKind.JsxClosingElement = 253 ] = "JsxClosingElement";
// SyntaxKind[ SyntaxKind.JsxFragment = 254 ] = "JsxFragment";
// SyntaxKind[ SyntaxKind.JsxOpeningFragment = 255 ] = "JsxOpeningFragment";
// SyntaxKind[ SyntaxKind.JsxClosingFragment = 256 ] = "JsxClosingFragment";
// SyntaxKind[ SyntaxKind.JsxAttribute = 257 ] = "JsxAttribute";
// SyntaxKind[ SyntaxKind.JsxAttributes = 258 ] = "JsxAttributes";
// SyntaxKind[ SyntaxKind.JsxSpreadAttribute = 259 ] = "JsxSpreadAttribute";
// SyntaxKind[ SyntaxKind.JsxExpression = 260 ] = "JsxExpression";
// // Clauses
// SyntaxKind[ SyntaxKind.CaseClause = 261 ] = "CaseClause";
// SyntaxKind[ SyntaxKind.DefaultClause = 262 ] = "DefaultClause";
// SyntaxKind[ SyntaxKind.HeritageClause = 263 ] = "HeritageClause";
// SyntaxKind[ SyntaxKind.CatchClause = 264 ] = "CatchClause";
// // Property assignments
// SyntaxKind[ SyntaxKind.PropertyAssignment = 265 ] = "PropertyAssignment";
// SyntaxKind[ SyntaxKind.ShorthandPropertyAssignment = 266 ] = "ShorthandPropertyAssignment";
// SyntaxKind[ SyntaxKind.SpreadAssignment = 267 ] = "SpreadAssignment";
// // Enum
// SyntaxKind[ SyntaxKind.EnumMember = 268 ] = "EnumMember";
// // Top-level nodes
// SyntaxKind[ SyntaxKind.SourceFile = 269 ] = "SourceFile";
// SyntaxKind[ SyntaxKind.Bundle = 270 ] = "Bundle";
// // JSDoc nodes
// SyntaxKind[ SyntaxKind.JSDocTypeExpression = 271 ] = "JSDocTypeExpression";
// // The * type
// SyntaxKind[ SyntaxKind.JSDocAllType = 272 ] = "JSDocAllType";
// // The ? type
// SyntaxKind[ SyntaxKind.JSDocUnknownType = 273 ] = "JSDocUnknownType";
// SyntaxKind[ SyntaxKind.JSDocNullableType = 274 ] = "JSDocNullableType";
// SyntaxKind[ SyntaxKind.JSDocNonNullableType = 275 ] = "JSDocNonNullableType";
// SyntaxKind[ SyntaxKind.JSDocOptionalType = 276 ] = "JSDocOptionalType";
// SyntaxKind[ SyntaxKind.JSDocFunctionType = 277 ] = "JSDocFunctionType";
// SyntaxKind[ SyntaxKind.JSDocVariadicType = 278 ] = "JSDocVariadicType";
// SyntaxKind[ SyntaxKind.JSDocComment = 279 ] = "JSDocComment";
// SyntaxKind[ SyntaxKind.JSDocTypeLiteral = 280 ] = "JSDocTypeLiteral";
// SyntaxKind[ SyntaxKind.JSDocTag = 281 ] = "JSDocTag";
// SyntaxKind[ SyntaxKind.JSDocAugmentsTag = 282 ] = "JSDocAugmentsTag";
// SyntaxKind[ SyntaxKind.JSDocClassTag = 283 ] = "JSDocClassTag";
// SyntaxKind[ SyntaxKind.JSDocParameterTag = 284 ] = "JSDocParameterTag";
// SyntaxKind[ SyntaxKind.JSDocReturnTag = 285 ] = "JSDocReturnTag";
// SyntaxKind[ SyntaxKind.JSDocTypeTag = 286 ] = "JSDocTypeTag";
// SyntaxKind[ SyntaxKind.JSDocTemplateTag = 287 ] = "JSDocTemplateTag";
// SyntaxKind[ SyntaxKind.JSDocTypedefTag = 288 ] = "JSDocTypedefTag";
// SyntaxKind[ SyntaxKind.JSDocPropertyTag = 289 ] = "JSDocPropertyTag";
// // Synthesized list
// SyntaxKind[ SyntaxKind.SyntaxList = 290 ] = "SyntaxList";
// // Transformation nodes
// SyntaxKind[ SyntaxKind.NotEmittedStatement = 291 ] = "NotEmittedStatement";
// SyntaxKind[ SyntaxKind.PartiallyEmittedExpression = 292 ] = "PartiallyEmittedExpression";
// SyntaxKind[ SyntaxKind.CommaListExpression = 293 ] = "CommaListExpression";
// SyntaxKind[ SyntaxKind.MergeDeclarationMarker = 294 ] = "MergeDeclarationMarker";
// SyntaxKind[ SyntaxKind.EndOfDeclarationMarker = 295 ] = "EndOfDeclarationMarker";
// // Enum value count
// SyntaxKind[ SyntaxKind.Count = 296 ] = "Count";
// // Markers
// SyntaxKind[ SyntaxKind.FirstAssignment = 58 ] = "FirstAssignment";
// SyntaxKind[ SyntaxKind.LastAssignment = 70 ] = "LastAssignment";
// SyntaxKind[ SyntaxKind.FirstCompoundAssignment = 59 ] = "FirstCompoundAssignment";
// SyntaxKind[ SyntaxKind.LastCompoundAssignment = 70 ] = "LastCompoundAssignment";
// SyntaxKind[ SyntaxKind.FirstReservedWord = 72 ] = "FirstReservedWord";
// SyntaxKind[ SyntaxKind.LastReservedWord = 107 ] = "LastReservedWord";
// SyntaxKind[ SyntaxKind.FirstKeyword = 72 ] = "FirstKeyword";
// SyntaxKind[ SyntaxKind.LastKeyword = 143 ] = "LastKeyword";
// SyntaxKind[ SyntaxKind.FirstFutureReservedWord = 108 ] = "FirstFutureReservedWord";
// SyntaxKind[ SyntaxKind.LastFutureReservedWord = 116 ] = "LastFutureReservedWord";
// SyntaxKind[ SyntaxKind.FirstTypeNode = 159 ] = "FirstTypeNode";
// SyntaxKind[ SyntaxKind.LastTypeNode = 174 ] = "LastTypeNode";
// SyntaxKind[ SyntaxKind.FirstPunctuation = 17 ] = "FirstPunctuation";
// SyntaxKind[ SyntaxKind.LastPunctuation = 70 ] = "LastPunctuation";
// SyntaxKind[ SyntaxKind.FirstToken = 0 ] = "FirstToken";
// SyntaxKind[ SyntaxKind.LastToken = 143 ] = "LastToken";
// SyntaxKind[ SyntaxKind.FirstTriviaToken = 2 ] = "FirstTriviaToken";
// SyntaxKind[ SyntaxKind.LastTriviaToken = 7 ] = "LastTriviaToken";
// SyntaxKind[ SyntaxKind.FirstLiteralToken = 8 ] = "FirstLiteralToken";
// SyntaxKind[ SyntaxKind.LastLiteralToken = 13 ] = "LastLiteralToken";
// SyntaxKind[ SyntaxKind.FirstTemplateToken = 13 ] = "FirstTemplateToken";
// SyntaxKind[ SyntaxKind.LastTemplateToken = 16 ] = "LastTemplateToken";
// SyntaxKind[ SyntaxKind.FirstBinaryOperator = 27 ] = "FirstBinaryOperator";
// SyntaxKind[ SyntaxKind.LastBinaryOperator = 70 ] = "LastBinaryOperator";
// SyntaxKind[ SyntaxKind.FirstNode = 144 ] = "FirstNode";
// SyntaxKind[ SyntaxKind.FirstJSDocNode = 271 ] = "FirstJSDocNode";
// SyntaxKind[ SyntaxKind.LastJSDocNode = 289 ] = "LastJSDocNode";
// SyntaxKind[ SyntaxKind.FirstJSDocTagNode = 281 ] = "FirstJSDocTagNode";
// SyntaxKind[ SyntaxKind.LastJSDocTagNode = 289 ] = "LastJSDocTagNode";
// /* @internal */
// SyntaxKind[ SyntaxKind.FirstContextualKeyword = 117 ] = "FirstContextualKeyword";
// /* @internal */
// SyntaxKind[ SyntaxKind.LastContextualKeyword = 143 ] = "LastContextualKeyword";


const defaultOptions = {
    experimentalDecorators:     true,
    experimentalAsyncFunctions: true,
    jsx:                        true
};

let getComments;
let seen = new Set();


export const settings = {

    loadParser()
    {
        // ts = require( 'typescript' );
        // workarounds issue described at https://github.com/Microsoft/TypeScript/issues/18062
        for ( const name of Object.keys( ts.SyntaxKind ).filter( x => isNaN( parseInt( x ) ) ) )
        {
            const value = ts.SyntaxKind[ name ];
            if ( !syntaxKind[ value ] )
                syntaxKind[ value ] = name;
        }
    },

    parse( filename, code, options = {} )
    {
        options = { ...defaultOptions, ...options };

        const compilerHost /* ts.CompilerHost */ = {
            fileExists:                () => true,
            getCanonicalFileName:      filename => filename,
            getCurrentDirectory:       () => '',
            getDefaultLibFileName:     () => 'lib.d.ts',
            getNewLine:                () => '\n',
            getSourceFile:             filename => ts.createSourceFile( filename, code, ts.ScriptTarget.Latest, true ),
            readFile:                  () => null,
            useCaseSensitiveFileNames: () => true,
            writeFile:                 () => null
        };

        const program = ts.createProgram( [ filename ], {
            noResolve:                  true,
            target:                     ts.ScriptTarget.Latest,
            experimentalDecorators:     options.experimentalDecorators,
            experimentalAsyncFunctions: options.experimentalAsyncFunctions,
            jsx:                        options.jsx ? 'preserve' : undefined
        }, compilerHost );

        const sourceFile = program.getSourceFile( filename );

        getComments = ( node, isTrailing ) => {
            if ( node.parent )
            {
                const nodePos   = isTrailing ? node.end : node.pos;
                const parentPos = isTrailing ? node.parent.end : node.parent.pos;

                if ( node.parent.kind === ts.SyntaxKind.SourceFile || nodePos !== parentPos )
                {
                    let comments = isTrailing
                                   ? ts.getTrailingCommentRanges( sourceFile.text, nodePos )
                                   : ts.getLeadingCommentRanges( sourceFile.text, nodePos );

                    if ( array( comments ) )
                    {
                        comments.forEach( ( comment ) => {
                            comment.type = syntaxKind[ comment.kind ];
                            comment.text = sourceFile.text.substring( comment.pos, comment.end );
                        } );

                        return comments;
                    }
                }
            }
        };

        function is_node( node )
        {
            return object( node ) && !seen.has( node ) && has( node, 'kind' );
        }

        function __walk( node, cb, key = '', indent = 0, parent )
        {
            if ( !is_node( node ) ) return;

            seen.add( node );

            collect_fields( node, parent );

            if ( cb( node, key, indent ) === false ) return false;

            for ( const key of Object.keys( node ) )
            {
                if ( key === 'parent' || key === 'constructor' || key.startsWith( '_' ) ) continue;

                const value = node[ key ];

                let r;

                if ( is_node( value ) )
                {

                    // const r = cb( value, key, indent, rn => array( rn ) ? rn.some( n => __walk( n, cb, indent + 1 ) ) : __walk( rn, cb, indent + 1 ) );
                    r = __walk( value, cb, key, indent + 1, node );
                    // r = __walk( value, cb, key, indent + 1 );
                }
                else if ( array( value ) && value.length )
                {
                    let brk = false;

                    value.some( val => {
                        if ( !is_node( val ) ) return;

                        // const r = cb( val, key, indent, rn => array( rn ) ? rn.some( n => __walk( n, cb, indent + 1 ) ) : __walk( rn, cb, indent + 1 ) );
                        r = __walk( val, cb, key, indent + 1, node );
                        if ( r === false ) return ( brk = true );
                    } );

                    if ( brk === true ) r = false;
                }

                if ( r === false ) return false;
            }

            return true;
        }

        // __walk( sourceFile, () => {} );

        traverse( sourceFile, ( node, parent, field, index ) => {
            let name = nodeName( node );

            if ( name === 'Identifier' && node.escapedText )
                name += ` ("${node.escapedText}")`;
            // else if ( name === 'JSDocParameterTag' )
            // {
            //     const tnode = Object.assign( {}, node );
            //     delete tnode.parent;
            //
            //     console.log( nameOf( node ) + ': ' + inspect( tnode, { depth: 1, colors: true } ) );
            //     if ( tnode.tagName )
            //         console.log( '----- tagName: ' + nameOf( tnode.tagName ) + ': ' + inspect( tnode.tagName, { depth: 1, colors: true } ) );
            // }

            console.log( `${indent( node )}${field || 'root'}${number( index ) ? `[ ${index} ]` : ''}: "${name}" => ${parent ? nodeName( parent ) : 'root'}` );
        } );

        // console.log( 'identifiers:', sourceFile.identifiers );
        // console.log( 'named:', [ ...sourceFile.getNamedDeclarations().keys() ] );
        // console.log( 'compute named:', [ ...sourceFile.computeNamedDeclarations().keys() ] );
        // console.log( 'ReadonlyArray:', sourceFile.getNamedDeclarations().get( 'ReadonlyArray' ) );
        return sourceFile;
    },

    define_symbols( ast )
    {
        traverse( ast, visitor, null, true );
    },

    dump_info()
    {
        // show_fields();
    },

    _ignoredProperties: new Set( [
        'constructor',
        'parent'
    ] ),

    *forEachProperty( node )
    {
        for ( let prop in node )
        {
            if ( this._ignoredProperties.has( prop ) || prop.charAt( 0 ) === '_' ) continue;

            yield {
                value: node[ prop ],
                key:   prop
            };
        }

        if ( node.parent )
        {
            yield {
                value:    getComments( node ),
                key:      'leadingComments',
                computed: true
            };
            yield {
                value:    getComments( node, true ),
                key:      'trailingCommments',
                computed: true
            };
        }
    },

    nodeToRange( node )
    {
        if ( typeof node.getStart === 'function' && typeof node.getEnd === 'function' )
            return [ node.getStart(), node.getEnd() ];
        else if ( typeof node.pos !== 'undefined' && typeof node.end !== 'undefined' )
            return [ node.pos, node.end ];
    }

    // walk( ast )
    // {
    //     class Visitor
    //     {
    //         constructor()
    //         {
    //             this.hasTypeParameters = new Set( [ syntaxKind.SignatureDeclaration, syntaxKind.ClassLikeDeclaration, syntaxKind.InterfaceDeclaration, syntaxKind.TypeAliasDeclaration, syntaxKind.JSDocTemplateTag ] );
    //         }
    //
    //         has( node )
    //         {
    //             if ( typeof node === 'string' )
    //                 return typeof this[ node ] === 'function';
    //
    //             return typeof this[ to_func( node ) ] === 'function';
    //         }
    //
    //         jump( node )
    //         {
    //             let fn = typeof node === 'string' ? node : to_func( node );
    //
    //             if ( typeof this[ fn ] !== 'function' ) return '';
    //
    //             // console.log( `No handler for "${fn}"` );
    //
    //             return this[ fn ]( node );
    //         }
    //
    //         get_params( params )
    //         {
    //             if ( !params || !params.length ) return '()';
    //
    //             return '( ' + params.map( p => this.parameter( p ) ).join( ', ' ) + ' )';
    //         }
    //
    //         get_type_params( typeParams )
    //         {
    //             if ( !typeParams || !typeParams.length ) return '';
    //
    //             return '<' + typeParams.map( tp => this.type_parameter( tp ) ).join( ', ' ) + '>';
    //         }
    //
    //         get_modifiers( modifiers )
    //         {
    //             if ( !modifiers || !modifiers.length ) return '';
    //
    //             const m = modifiers.map( n => from_keyword( n.kind ) ).join( ' ' );
    //
    //             return m ? m + ' ' : '';
    //         }
    //
    //         FunctionType( node )
    //         {
    //             return this.CallSignature( node );
    //         }
    //
    //         ConstructSignature( node )
    //         {
    //             return this.CallSignature( node, 'new ' );
    //         }
    //
    //         CallSignature( node, prefix = '' )
    //         {
    //             let name = this.get_type_params( node.typeParameters );
    //
    //             if ( node.kind !== syntaxKind.PropertySignature ) name += this.get_params( node.parameters );
    //
    //             if ( node.type )
    //             {
    //                 const sep = node.kind === syntaxKind.FunctionType ? ' => ' : ': ';
    //
    //                 name += sep + this.TypeNode( node.type );
    //             }
    //
    //             return this.get_modifiers( node.modifiers ) + prefix + name;
    //         }
    //
    //         MethodSignature( node )
    //         {
    //             return this.CallSignature( node, this.property_name( node.name ) + node.questionToken ? '?' : '' );
    //         }
    //
    //         PropertySignature( node )
    //         {
    //             return this.CallSignature( node, this.property_name( node.name ) + node.questionToken ? '?' : '' );
    //         }
    //
    //         EntityName( node )
    //         {
    //             if ( node.left )
    //                 return this.EntityName( node.left ) + '.' + node.right.text;
    //
    //             return node.text;
    //         }
    //
    //         property_name( node )
    //         {
    //             switch ( node.kind )
    //             {
    //                 case syntaxKind.Identifier:
    //                     return node.text;
    //
    //                 case syntaxKind.StringLiteral:
    //                     return "'" + node.text + "'";
    //
    //                 case syntaxKind.NumericLiteral:
    //                     return node.text;
    //
    //                 case syntaxKind.ComputedPropertyName:
    //                     return this.ComputedPropertyName( node );
    //             }
    //
    //             return 'prop name??';
    //         }
    //
    //         DeclarationName( node )
    //         {
    //             if ( node.kind === syntaxKind.BindingPattern )
    //                 return 'binding pattern';
    //
    //             return this.property_name( node );
    //         }
    //
    //         ComputedPropertyName( node )
    //         {
    //             return 'expression';
    //         }
    //
    //         BindingName( node )
    //         {
    //             return node.kind === syntaxKind.Identifier ? node.text : 'binding-name';
    //         }
    //
    //         TypeNode( node )
    //         {
    //             const
    //                 nodeName = syntaxKind[ node.kind ];
    //
    //             if ( nodeName === syntaxKind.ArrayType )
    //                 return this.jump( node ) + '[]';
    //
    //             let kw = from_keyword( nodeName ) || from_type( nodeName ) || this.jump( node );
    //
    //             console.error( `No type_node name from ${nodeName}` );
    //
    //             return kw;
    //         }
    //
    //         TypeReference( node )
    //         {
    //             let typeArgs = '';
    //
    //             if ( node.typeArguments ) typeArgs = '<' + node.typeArguments.map( ta => this.TypeNode( ta ) ).join( ', ' ) + '>';
    //
    //             return this.EntityName( node.typeName ) + typeArgs;
    //         }
    //
    //         TypePredicate( node )
    //         {
    //             return node.parameterName.kind === syntaxKind.Identifier ? node.parameterName.text : 'ThisType' + ' is ' + this.type_node( node.type );
    //         }
    //
    //         TypeElement( node )
    //         {
    //             return node.name + node.questionToken ? '?' : '';
    //         }
    //
    //         TypeQuery( node )
    //         {
    //             return this.EntityName( node.exprName );
    //         }
    //
    //         TupleType( tuple )
    //         {
    //             return '[' + tuple.elementTypes.map( t => this.type_node( t ) ).join( ', ' ) + ']';
    //         }
    //
    //         type_parameter( node )
    //         {
    //             let name = node.name.text;
    //
    //             if ( node.constraint )
    //                 name += ' extends ' + this.type_node( node.constraint );
    //
    //             if ( node.default )
    //                 name += ' = ' + this.type_node( node.default );
    //
    //             return name;
    //         }
    //
    //         union_type( node )
    //         {
    //             return node.types.map( tr => this.jump( tr ) ).join( ' | ' );
    //         }
    //
    //         intersection_type( node )
    //         {
    //             console.log( SyntaxKind[ node.kind ] + ' -> ', Object.keys( node ) + ', type kind:', SyntaxKind[ node.type.kind ] );
    //             return node.types ? node.types.map( tr => this.jump( tr ) ).join( ' & ' ) : this.jump( node.type );
    //         }
    //
    //         parameter( node )
    //         {
    //             let name = this.get_modifiers( node.modifiers ) + node.dotDotDotToken ? '...' : '';
    //
    //             name += this.binding_name( node.name ) + ( node.questionToken ? '?' : '' ) + ( this.type ? ': ' + this.type_node( this.type ) : '' ) + ( node.initializer ? ' = initialize' : '' );
    //
    //             return name;
    //         }
    //
    //         generic_node( node )
    //         {
    //             let name = '';
    //
    //             if ( node.name && node.name.kind === syntaxKind.Identifier )
    //                 name = node.name.text;
    //
    //             if ( node.typeParameters )
    //                 name += '<' + node.typeParameters.map( tp => this.type_parameter( tp ) ).join( ', ' ) + '>';
    //
    //             if ( node.parameters )
    //                 name += '( ' + node.parameters.map( p => this.parameter( p ) ).join( ', ' );
    //             else
    //                 name += '()';
    //
    //             if ( node.type ) name += ': ' + this.node_type( node.type );
    //             return name;
    //         }
    //
    //         interface_declaration( node )
    //         {
    //             let ifc = this.get_modifiers( node.modifiers ) + node.name.text + this.get_type_params( node.typeParameters ) + ' {\n';
    //
    //             ifc += node.members.map( n => '    ' + this.jump( n ) + ';\n' ).join( ';\n    ' );
    //
    //             ifc += '\n}\n';
    //
    //             return ifc;
    //         }
    //
    //         missing( node )
    //         {
    //             console.log( `error kind: ${node.kind} (${SyntaxKind[ node.kind ]})` );
    //             return '';
    //         }
    //
    //         show_kind( node )
    //         {
    //             let subs = [];
    //
    //             for ( const { value, key, computed } of settings.forEachProperty( node ) )
    //             {
    //                 if ( object( value ) && has( value, 'kind' ) )
    //                     subs.push( {
    //                         key,
    //                         value
    //                     } );
    //                 else if ( array( value ) && value.length && object( value[ 0 ] ) && has( value[ 0 ], 'kind' ) )
    //                     subs.push( {
    //                         key,
    //                         value
    //                     } );
    //
    //                 show_kind( node, ...Object.keys( node ).filter( k => k !== 'parent' ) );
    //             }
    //
    //             subs.forEach( ( { key, value } ) => {
    //                 if ( object( value ) )
    //                 {
    //                     console.log( `${indent( value )}${key} =>` );
    //                     this.show_kind( node );
    //                 }
    //                 else
    //                 {
    //                     console.log( `${indent( value )}${key}[] =>` );
    //                     value.forEach( n => this.show_kind( n ) );
    //                 }
    //             } );
    //         }
    //
    //         Default( node )
    //         {
    //             // if ( seen.has( node ) ) return;
    //             //
    //             // seen.add( node );
    //
    //             if ( node.kind === SyntaxKind.SourceFile )
    //             {
    //                 node.statements.forEach( n => this.show_kind( n ) );
    //                 return false;
    //             }
    //
    //             let name = '';
    //
    //             if ( this.has( node ) )
    //             {
    //                 name = this.jump( node );
    //
    //                 console.log( `${indent( node )}${name}` );
    //
    //                 return false;
    //             }
    //             else
    //             {
    //                 const mn = to_func( syntaxKind[ node.kind ] );
    //
    //                 if ( mn.endsWith( 'Type' ) ) return this.type_node( node );
    //
    //                 console.log( `${node.kind}:${syntaxKind[ node.kind ]} -> ${mn}` );
    //
    //                 if ( !mn )
    //                     return this.missing( node );
    //
    //                 console.log( `Missing node kind: "${to_func( syntaxKind[ node.kind ] )}"` );
    //             }
    //         }
    //     }
    //
    //     const v = new Visitor();
    //
    //     v.Default( ast );
    //     // for ( const { key, value, computed } of settings.forEachProperty( ast ) )
    //     // {
    //     //
    //     // }
    //
    //     // visit( ast, new class { Default( node ) { return v.Default( node );  } } );
    // }
};
