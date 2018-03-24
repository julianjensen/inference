/** ******************************************************************************************************************
 * @file Provides stand-alone utility functions.
 * @author Julian Jensen <jjdanois@gmail.com>
 * @since 1.0.0
 * @date 19-Jan-2018
 *********************************************************************************************************************/


"use strict";

export const createSymbolTable = () => new Map();

import os from "os";
export const
    platform = os.platform(),
    isWindows = platform === 'win32' || platform === 'win64',
    EOL = os.EOL;

import * as assert                       from 'assert';
import util                              from 'util';
import { EventEmitter }                  from "events";
import { SyntaxKind }                    from "./ts/ts-helpers";
import { CharacterCodes }                from "./utils/char-codes";
import {
    CheckFlags,
    InternalSymbolName,
    ModifierFlags,
    NodeFlags,
    SpecialPropertyAssignmentKind,
    SymbolFlags,
    TypeFlags,
    TokenFlags
}                                        from "./types";
import { getNameOfDeclaration }          from "./symbols/nodes";
import { getModifierFlags, hasModifier } from "./symbols/modifiers";
import {
    isAssignmentExpression,
    isBinaryExpression,
    isExpression,
    isIdentifierName,
    isVariableDeclaration,
    isStringOrNumericLiteral,
    isWellKnownSymbolSyntactically
}                                        from "typescript";

let currentFile = {
    fatal: ( ...args ) => console.error( ...args ),
    error: ( ...args ) => console.error( ...args ),
    warn:  ( ...args ) => console.warn( ...args ),
    log:   ( ...args ) => console.log( ...args )
};

let inStrictMode = true;

/**
 * @param {boolean} [strict=true]
 */
export function set_strict_mode( strict = true )
{
    inStrictMode = strict;
}

/**
 * @return {boolean}
 */
export function get_strict_mode()
{
    return inStrictMode;
}

const
    top   = node => {
        if ( currentFile ) return currentFile;
        while ( node && node.pareent ) node = node.parent;
        return node;
    },
    fatal = ( node, msg ) => top( node ).fatal( msg, node ),
    error = ( node, msg ) => top( node ).error( msg, node ),
    warn  = ( node, msg ) => top( node ).warn( msg, node ),
    log   = ( node, msg ) => top( node ).log( msg, node );

const
    { inspect } = util,
    /**
     * @param {object} o
     * @param {string} n
     * @return {boolean}
     */
    has         = ( o, n ) => Reflect.has( o, n );

util.inspect.defaultOptions = {
    colors:     true,
    showHidden: false,
    depth:      2
};

// eslint-disable-next-line new-parens
export const events = new class extends EventEmitter {};

const { isArray: array } = Array;


/**
 * @param {*} o
 * @return {boolean}
 */
export function object( o )
{
    return typeof o === 'object' && !Array.isArray( o ) && o !== null;
}

/**
 * @param {string} s
 * @return {boolean}
 */
export function isString( s )
{
    return typeof s === 'string';
}

/**
 * @param {*} n
 * @param {string} type
 * @return {boolean}
 */
export function node_is( n, type )
{
    return object( n ) && has( n, 'type' ) && n.type === type;
}

const
    delimOpposites = {
        '(': ')',
        '{': '}',
        '[': ']',
        '<': '>'
    },
    oppositeString = delims => delims.split( '' ).map( c => delimOpposites[ c ] ).join( '' ),
    allDelimiters  = Object.keys( delimOpposites ).join( '' );

/**
 * @param {string} str
 * @param {number} start
 * @param {string} stop
 * @param {?string} delims
 * @param {number} dir
 * @param {boolean} [stopOnZero]    - Stop when delimiters are balanced
 * @return {?[number, number]}
 */
export function read_balanced_string( str, start = 0, stop = ',', delims = allDelimiters, dir = 1, stopOnZero ) // eslint-disable-line max-params
{
    const
        zero = arr => arr.every( v => v === 0 );

    let opps = oppositeString( delims );

    if ( dir < 0 )
    {
        [ delims, opps ] = [ opps, delims ];
        stop += opps;
    }
    else
        stop += delims;

    let i          = start,
        c          = str[ i ],
        nestCounts = [];

    for ( let j = 0; j < delims.length; j++ )
        nestCounts[ j ] = 0;

    while ( i >= 0 && i < str.length )
    {
        if ( stop.includes( c ) && zero( nestCounts ) ) break;

        let index = delims.indexOf( c );

        if ( index !== -1 )
            nestCounts[ index ]++;
        else if ( ( index = opps.indexOf( c ) ) !== -1 )
            nestCounts[ index ]--;

        if ( stopOnZero && zero( nestCounts ) ) break;
        i += dir;
        c = str[ i ];
    }

    if ( !zero( nestCounts ) ) return null;

    if ( stop.includes( c ) )
    {
        i -= dir;
        while ( str[ i ] === ' ' || str[ i ] === '\t' ) i -= dir;
    }

    return start < i ? [ start, i ] : [ i, start ];
}

/**
 * @param {string} str
 * @param {string} stop
 * @param {?string} delims
 * @param {number} dir
 * @return {?[number, number]}
 */
export function read_balanced_delimiters( str, stop = ',', delims = allDelimiters, dir = 1 )
{
    const m = dir > 0 ? str.match( new RegExp( `^.*?(?=[${delims}])` ) ) : str.match( new RegExp( `^.*${oppositeString( delims )}` ) );

    if ( !m ) return null;

    const se = read_balanced_string( str, m[ 0 ].length, stop, delims, dir, true );

    if ( !se ) return null;

    return [ se[ 0 ] + 1, se[ 1 ] ];
}

/**
 * @param {string} fileName
 * @param {number} index
 */
export function ast_from_index( fileName, index )
{
    const
        ast = asts.get( fileName );

    return ast ? ast[ index ] : null;
}

export const asts = new Map();

/**
 * @param {string} fileName
 * @param {Array<Node>} ast
 */
export function store_ast( fileName, ast )
{
    asts.set( fileName, ast );
}

export function flatDump( obj )
{
    return inspect( obj,
        {
            depth:  0,
            colors: true
        } );
}



/**
 * Should not be called on a declaration with a computed property name,
 * unless it is a well known Symbol.
 *
 * @param {Node} node
 * @return {*}
 */
function getDeclarationName( node )
{
    if ( node.kind === SyntaxKind.ExportAssignment )
        return node.isExportEquals ? InternalSymbolName.ExportEquals : InternalSymbolName.Default;

    const name = getNameOfDeclaration( node );

    if ( name )
    {
        if ( isAmbientModule( node ) )
        {
            const moduleName = getTextOfIdentifierOrLiteral( name );
            return ( isGlobalScopeAugmentation( node ) ? "__global" : `"${moduleName}"` );
        }

        if ( name.kind === SyntaxKind.ComputedPropertyName )
        {
            const nameExpression = name.expression;

            // treat computed property names where expression is string/numeric literal as just string/numeric literal
            if ( isStringOrNumericLiteral( nameExpression ) )
                return escapeLeadingUnderscores( nameExpression.text );

            return getPropertyNameForKnownSymbolName( idText( nameExpression.name ) );
        }

        return getEscapedTextOfIdentifierOrLiteral( name );
    }

    switch ( node.kind )
    {
        case SyntaxKind.Constructor:
            return InternalSymbolName.Constructor;
        case SyntaxKind.FunctionType:
        case SyntaxKind.CallSignature:
            return InternalSymbolName.Call;
        case SyntaxKind.ConstructorType:
        case SyntaxKind.ConstructSignature:
            return InternalSymbolName.New;
        case SyntaxKind.IndexSignature:
            return InternalSymbolName.Index;
        case SyntaxKind.ExportDeclaration:
            return InternalSymbolName.ExportStar;
        case SyntaxKind.BinaryExpression:
            if ( getSpecialPropertyAssignmentKind( node ) === SpecialPropertyAssignmentKind.ModuleExports )
            // module.exports = ...
                return InternalSymbolName.ExportEquals;

            assert( false, "Unknown binary declaration kind" );
            break;

        case SyntaxKind.FunctionDeclaration:
        case SyntaxKind.ClassDeclaration:
            return ( hasModifier( node, ModifierFlags.Default ) ? InternalSymbolName.Default : undefined );
        case SyntaxKind.JSDocFunctionType:
            return ( isJSDocConstructSignature( node ) ? InternalSymbolName.New : InternalSymbolName.Call );

        // Parameters with names are handled at the top of this function.  Parameters
        // without names can only come from JSDocFunctionTypes.
        case SyntaxKind.Parameter:
            assert( node.parent.kind === SyntaxKind.JSDocFunctionType );
            const
                functionType = node.parent,
                index        = functionType.parameters.indexOf( node );

            return "arg" + index;

        case SyntaxKind.JSDocTypedefTag:
            const name = getNameOfJSDocTypedef( node );
            return typeof name !== "undefined" ? name.escapedText : void 0;
    }
}

export function isDeclaration( node )
{
    if ( node.kind === SyntaxKind.TypeParameter )
        return node.parent.kind !== SyntaxKind.JSDocTemplateTag;

    return isDeclarationKind( node.kind );
}

function isDeclarationKind( kind )
{
    return kind === SyntaxKind.ArrowFunction
           || kind === SyntaxKind.BindingElement
           || kind === SyntaxKind.ClassDeclaration
           || kind === SyntaxKind.ClassExpression
           || kind === SyntaxKind.Constructor
           || kind === SyntaxKind.EnumDeclaration
           || kind === SyntaxKind.EnumMember
           || kind === SyntaxKind.ExportSpecifier
           || kind === SyntaxKind.FunctionDeclaration
           || kind === SyntaxKind.FunctionExpression
           || kind === SyntaxKind.GetAccessor
           || kind === SyntaxKind.ImportClause
           || kind === SyntaxKind.ImportEqualsDeclaration
           || kind === SyntaxKind.ImportSpecifier
           || kind === SyntaxKind.InterfaceDeclaration
           || kind === SyntaxKind.JsxAttribute
           || kind === SyntaxKind.MethodDeclaration
           || kind === SyntaxKind.MethodSignature
           || kind === SyntaxKind.ModuleDeclaration
           || kind === SyntaxKind.NamespaceExportDeclaration
           || kind === SyntaxKind.NamespaceImport
           || kind === SyntaxKind.Parameter
           || kind === SyntaxKind.PropertyAssignment
           || kind === SyntaxKind.PropertyDeclaration
           || kind === SyntaxKind.PropertySignature
           || kind === SyntaxKind.SetAccessor
           || kind === SyntaxKind.ShorthandPropertyAssignment
           || kind === SyntaxKind.TypeAliasDeclaration
           || kind === SyntaxKind.TypeParameter
           || kind === SyntaxKind.VariableDeclaration
           || kind === SyntaxKind.JSDocTypedefTag;
}

export function isIdentifier( node )
{
    return node.kind === SyntaxKind.Identifier;
}

export function isJSXTagName( node )
{
    const parent = node.parent;

    if ( parent.kind === SyntaxKind.JsxOpeningElement ||
         parent.kind === SyntaxKind.JsxSelfClosingElement ||
         parent.kind === SyntaxKind.JsxClosingElement )
    {
        return parent.tagName === node;
    }
    return false;
}

export function isExpressionNode( node )
{
    switch ( node.kind )
    {
        case SyntaxKind.SuperKeyword:
        case SyntaxKind.NullKeyword:
        case SyntaxKind.TrueKeyword:
        case SyntaxKind.FalseKeyword:
        case SyntaxKind.RegularExpressionLiteral:
        case SyntaxKind.ArrayLiteralExpression:
        case SyntaxKind.ObjectLiteralExpression:
        case SyntaxKind.PropertyAccessExpression:
        case SyntaxKind.ElementAccessExpression:
        case SyntaxKind.CallExpression:
        case SyntaxKind.NewExpression:
        case SyntaxKind.TaggedTemplateExpression:
        case SyntaxKind.AsExpression:
        case SyntaxKind.TypeAssertionExpression:
        case SyntaxKind.NonNullExpression:
        case SyntaxKind.ParenthesizedExpression:
        case SyntaxKind.FunctionExpression:
        case SyntaxKind.ClassExpression:
        case SyntaxKind.ArrowFunction:
        case SyntaxKind.VoidExpression:
        case SyntaxKind.DeleteExpression:
        case SyntaxKind.TypeOfExpression:
        case SyntaxKind.PrefixUnaryExpression:
        case SyntaxKind.PostfixUnaryExpression:
        case SyntaxKind.BinaryExpression:
        case SyntaxKind.ConditionalExpression:
        case SyntaxKind.SpreadElement:
        case SyntaxKind.TemplateExpression:
        case SyntaxKind.NoSubstitutionTemplateLiteral:
        case SyntaxKind.OmittedExpression:
        case SyntaxKind.JsxElement:
        case SyntaxKind.JsxSelfClosingElement:
        case SyntaxKind.JsxFragment:
        case SyntaxKind.YieldExpression:
        case SyntaxKind.AwaitExpression:
        case SyntaxKind.MetaProperty:
            return true;
        case SyntaxKind.QualifiedName:
            while ( node.parent.kind === SyntaxKind.QualifiedName )
            {
                node = node.parent;
            }
            return node.parent.kind === SyntaxKind.TypeQuery || isJSXTagName( node );
        case SyntaxKind.Identifier:
            if ( node.parent.kind === SyntaxKind.TypeQuery || isJSXTagName( node ) )
            {
                return true;
            }
        // falls through
        case SyntaxKind.NumericLiteral:
        case SyntaxKind.StringLiteral:
        case SyntaxKind.ThisKeyword:
            return isInExpressionContext( node );
        default:
            return false;
    }
}

export function isInExpressionContext( node )
{
    const parent = node.parent;

    switch ( parent.kind )
    {
        case SyntaxKind.VariableDeclaration:
        case SyntaxKind.Parameter:
        case SyntaxKind.PropertyDeclaration:
        case SyntaxKind.PropertySignature:
        case SyntaxKind.EnumMember:
        case SyntaxKind.PropertyAssignment:
        case SyntaxKind.BindingElement:
            return parent.initializer === node;

        case SyntaxKind.ExpressionStatement:
        case SyntaxKind.IfStatement:
        case SyntaxKind.DoStatement:
        case SyntaxKind.WhileStatement:
        case SyntaxKind.ReturnStatement:
        case SyntaxKind.WithStatement:
        case SyntaxKind.SwitchStatement:
        case SyntaxKind.CaseClause:
        case SyntaxKind.ThrowStatement:
            return parent.expression === node;

        case SyntaxKind.ForStatement:
            const forStatement = parent;

            return ( forStatement.initializer === node && forStatement.initializer.kind !== SyntaxKind.VariableDeclarationList ) ||
                   forStatement.condition === node ||
                   forStatement.incrementor === node;

        case SyntaxKind.ForInStatement:
        case SyntaxKind.ForOfStatement:
            const forInStatement = parent;

            return ( forInStatement.initializer === node && forInStatement.initializer.kind !== SyntaxKind.VariableDeclarationList ) ||
                   forInStatement.expression === node;

        case SyntaxKind.TypeAssertionExpression:
        case SyntaxKind.AsExpression:
            return node === parent.expression;

        case SyntaxKind.TemplateSpan:
            return node === parent.expression;

        case SyntaxKind.ComputedPropertyName:
            return node === parent.expression;

        case SyntaxKind.Decorator:
        case SyntaxKind.JsxExpression:
        case SyntaxKind.JsxSpreadAttribute:
        case SyntaxKind.SpreadAssignment:
            return true;
        case SyntaxKind.ExpressionWithTypeArguments:
            return parent.expression === node && isExpressionWithTypeArgumentsInClassExtendsClause( parent );

        default:
            return isExpressionNode( parent );
    }
}

/**
 * True if has initializer node attached to it.
 *
 * @param {ts.Node} node
 * @return {boolean}
 */
export function hasInitializer( node )
{
    return !!node.initializer;
}

/**
 * True if has jsdoc nodes attached to it.
 *
 * @param {ts.Node} node
 * @return {boolean}
 */
export function hasJSDocNodes( node )
{
    return !!node.jsDoc && node.jsDoc.length > 0;
}


/**
 * @param {ts.Node} node
 * @return {boolean}
 */
export function isVariableLike( node )
{
    if ( node )
    {
        switch ( node.kind )
        {
            case SyntaxKind.BindingElement:
            case SyntaxKind.EnumMember:
            case SyntaxKind.Parameter:
            case SyntaxKind.PropertyAssignment:
            case SyntaxKind.PropertyDeclaration:
            case SyntaxKind.PropertySignature:
            case SyntaxKind.ShorthandPropertyAssignment:
            case SyntaxKind.VariableDeclaration:
                return true;
        }
    }
    return false;
}

export function skipPartiallyEmittedExpressions( node )
{
    while ( node.kind === SyntaxKind.PartiallyEmittedExpression )
        node = node.expression;

    return node;
}

// /**
//  * Determines whether a node is an expression based only on its kind.
//  * Use `isExpressionNode` if not in transforms.
//  */
// export function isExpression( node )
// {
//     return isExpressionKind( skipPartiallyEmittedExpressions( node ).kind );
// }

function isExpressionKind( kind )
{
    switch ( kind )
    {
        case SyntaxKind.ConditionalExpression:
        case SyntaxKind.YieldExpression:
        case SyntaxKind.ArrowFunction:
        case SyntaxKind.BinaryExpression:
        case SyntaxKind.SpreadElement:
        case SyntaxKind.AsExpression:
        case SyntaxKind.OmittedExpression:
        case SyntaxKind.CommaListExpression:
        case SyntaxKind.PartiallyEmittedExpression:
            return true;
        default:
            return isUnaryExpressionKind( kind );
    }
}

export function isLeftHandSideExpression( node )
{
    return isLeftHandSideExpressionKind( skipPartiallyEmittedExpressions( node ).kind );
}

function isLeftHandSideExpressionKind( kind )
{
    switch ( kind )
    {
        case SyntaxKind.PropertyAccessExpression:
        case SyntaxKind.ElementAccessExpression:
        case SyntaxKind.NewExpression:
        case SyntaxKind.CallExpression:
        case SyntaxKind.JsxElement:
        case SyntaxKind.JsxSelfClosingElement:
        case SyntaxKind.JsxFragment:
        case SyntaxKind.TaggedTemplateExpression:
        case SyntaxKind.ArrayLiteralExpression:
        case SyntaxKind.ParenthesizedExpression:
        case SyntaxKind.ObjectLiteralExpression:
        case SyntaxKind.ClassExpression:
        case SyntaxKind.FunctionExpression:
        case SyntaxKind.Identifier:
        case SyntaxKind.RegularExpressionLiteral:
        case SyntaxKind.NumericLiteral:
        case SyntaxKind.StringLiteral:
        case SyntaxKind.NoSubstitutionTemplateLiteral:
        case SyntaxKind.TemplateExpression:
        case SyntaxKind.FalseKeyword:
        case SyntaxKind.NullKeyword:
        case SyntaxKind.ThisKeyword:
        case SyntaxKind.TrueKeyword:
        case SyntaxKind.SuperKeyword:
        case SyntaxKind.NonNullExpression:
        case SyntaxKind.MetaProperty:
        case SyntaxKind.ImportKeyword: // technically this is only an Expression if it's in a CallExpression
            return true;
        default:
            return false;
    }
}

/* @internal */
export function isUnaryExpression( node )
{
    return isUnaryExpressionKind( skipPartiallyEmittedExpressions( node ).kind );
}

function isUnaryExpressionKind( kind )
{
    switch ( kind )
    {
        case SyntaxKind.PrefixUnaryExpression:
        case SyntaxKind.PostfixUnaryExpression:
        case SyntaxKind.DeleteExpression:
        case SyntaxKind.TypeOfExpression:
        case SyntaxKind.VoidExpression:
        case SyntaxKind.AwaitExpression:
        case SyntaxKind.TypeAssertionExpression:
            return true;
        default:
            return isLeftHandSideExpressionKind( kind );
    }
}


export function isExpressionWithTypeArgumentsInClassExtendsClause( node )
{
    return tryGetClassExtendingExpressionWithTypeArguments( node ) !== void 0;
}

/** Get `C` given `N` if `N` is in the position `class C extends N` where `N` is an ExpressionWithTypeArguments. */
export function tryGetClassExtendingExpressionWithTypeArguments( node )
{
    if ( node.kind === SyntaxKind.ExpressionWithTypeArguments && node.parent.token === SyntaxKind.ExtendsKeyword && isClassLike( node.parent.parent ) )
        return node.parent.parent;
}

export function isClassLike( node )
{
    return node && ( node.kind === SyntaxKind.ClassDeclaration || node.kind === SyntaxKind.ClassExpression );
}

export function isAmbientModule( node )
{
    return node && node.kind === SyntaxKind.ModuleDeclaration && ( node.name.kind === SyntaxKind.StringLiteral || isGlobalScopeAugmentation( node ) );
}

export function isGlobalScopeAugmentation( module )
{
    return !!( module.flags & NodeFlags.GlobalAugmentation );
}

export function isEntityNameExpression( node )
{
    return node.kind === SyntaxKind.Identifier ||
           node.kind === SyntaxKind.PropertyAccessExpression && isEntityNameExpression( node.expression );
}

/**
 * Indicates whether a type can be used as a late-bound name.
 */
function isTypeUsableAsLateBoundName( type )
{
    return !!( type.flags & TypeFlags.StringOrNumberLiteralOrUnique );
}

function checkComputedPropertyName( node )
{
    const links = getNodeLinks( node.expression );

    if ( !links.resolvedType )
    {
        links.resolvedType = checkExpression( node.expression );
        // This will allow types number, string, symbol or any. It will also allow enums, the unknown
        // type, and any union of these types (like string | number).
        if ( links.resolvedType.flags & TypeFlags.Nullable ||
             !isTypeAssignableToKind( links.resolvedType, TypeFlags.StringLike | TypeFlags.NumberLike | TypeFlags.ESSymbolLike ) &&
             !isTypeAssignableTo( links.resolvedType, get_ext_ref( 'UnionType' ).getUnionType( get_ext_ref( 'stringType', 'numberType', 'esSymbolType' ) ) ) )
        {
            error( node, "A computed property name must be of type string number symbol or any" );
        }
        else
            checkThatExpressionIsProperSymbolReference( node.expression, links.resolvedType );
    }

    return links.resolvedType;
}


/**
 * Indicates whether a declaration name is definitely late-bindable.
 * A declaration name is only late-bindable if:
 * - It is a `ComputedPropertyName`.
 * - Its expression is an `Identifier` or either a `PropertyAccessExpression` an
 * `ElementAccessExpression` consisting only of these same three types of nodes.
 * - The type of its expression is a string or numeric literal type, or is a `unique symbol` type.
 */
export function isLateBindableName( node )
{
    return node.kind === SyntaxKind.ComputedPropertyName && isEntityNameExpression( node.expression ) && checkComputedPropertyName( node ).isTypeUsableAsLateBoundName();
}

/**
 * Indicates whether a declaration has a late-bindable dynamic name.
 */
export function hasLateBindableName( node )
{
    const name = getNameOfDeclaration( node );

    return name && isLateBindableName( name );
}

/**
 * A declaration has a dynamic name if both of the following are true:
 *   1. The declaration has a computed property name
 *   2. The computed name is *not* expressed as Symbol.<name>, where name
 *      is a property of the Symbol constructor that denotes a built in
 *      Symbol.
 *
 * @param {Declaration} declaration
 */
export function hasDynamicName( declaration )
{
    const name = getNameOfDeclaration( declaration );

    return name && isDynamicName( name );
}

/**
 * @param {DeclarationName} name
 * @return {boolean}
 */
export function isDynamicName( name )
{
    return name.kind === SyntaxKind.ComputedPropertyName &&
           !isStringOrNumericLiteral( name.expression ) &&
           !isWellKnownSymbolSyntactically( name.expression );
}


/**
 * @class
 */
export class TypeSet extends Array
{
    constructor( ...args )
    {
        super( ...args );

        this.containsAny                     = false;
        this.containsUndefined               = false;
        this.containsNull                    = false;
        this.containsNever                   = false;
        this.containsNonWideningType         = false;
        this.containsString                  = false;
        this.containsNumber                  = false;
        this.containsESSymbol                = false;
        this.containsLiteralOrUniqueESSymbol = false;
        this.containsObjectType              = false;
        this.containsEmptyObject             = false;
        this.unionIndex                      = -1;
        this.number                          = false;
    }

}

/**
 * @param {string|number} a
 * @param {string|number} b
 * @return {number}
 */
export function comparer( a, b )
{
    return a === b ? 0 : a === undefined ? -1 : b === undefined ? 1 : a < b ? -1 : 1;
}

/**
 * @param {Type[]} types
 * @param {Type} type
 * @return {boolean}
 */
export function containsType( types, type )
{
    return binarySearch( types, type, t => t.id, comparer ) >= 0;
}

/**
 * @param {Type[]} types
 * @param {Type} type
 * @return {boolean}
 */
export function containsIdenticalType( types, type )
{
    for ( const t of types )
        if ( t.isTypeIdenticalTo( type ) )
            return true;

    return false;
}


/**
 * Performs a binary search, finding the index at which `value` occurs in `array`.
 * If no such index is found, returns the 2's-complement of first index at which
 * `array[index]` exceeds `value`.
 * @param array A sorted array whose first element must be no larger than number
 * @param value The value to be searched for in the array.
 * @param keySelector A callback used to select the search key from `value` and each element of
 * `array`.
 * @param keyComparer A callback used to compare two keys in a sorted array.
 * @param offset An offset into `array` at which to start the search.
 */
export function binarySearch( array, value, keySelector = x => x.id, keyComparer = comparer, offset = 0 )
{
    if ( !Array.isArray( array ) || array.length === 0 ) return -1;

    let low  = offset || 0,
        high = array.length - 1;

    const key = keySelector( value );

    while ( low <= high )
    {
        const
            middle = low + ( ( high - low ) >> 1 ),
            midKey = keySelector( array[ middle ] );

        switch ( keyComparer( midKey, key ) )
        {
            case -1:
                low = middle + 1;
                break;
            case 0:
                return middle;
            case 1:
                high = middle - 1;
                break;
        }
    }

    return ~low;
}

/**
 * @param {ts.Node} node
 * @return {string}
 */
export function getTextOfIdentifierOrLiteral( node )
{
    return node.kind === SyntaxKind.Identifier ? idText( node ) : node.text;
}

/**
 * Remove extra underscore from escaped identifier text content.
 *
 * @param {string} identifier The escaped identifier text.
 * @returns {string} The unescaped identifier text.
 */
export function unescapeLeadingUnderscores( identifier )
{
    const id = identifier;

    return id.length >= 3 && id.charCodeAt( 0 ) === CharacterCodes._ && id.charCodeAt( 1 ) === CharacterCodes._ && id.charCodeAt( 2 ) === CharacterCodes._ ? id.substr( 1 ) : id;
}

/**
 * @param {Identifier} identifier
 * @return {string}
 */
export function idText( identifier )
{
    return unescapeLeadingUnderscores( identifier.escapedText );
}

/**
 * @param {Symbol} symbol
 * @return {string}
 */
export function symbolName( symbol )
{
    return unescapeLeadingUnderscores( symbol.escapedName );
}

/**
 * Remove extra underscore from escaped identifier text content.
 * @deprecated Use `id.text` for the unescaped text.
 * @param {string} id The escaped identifier text.
 * @returns The unescaped identifier text.
 */
export function unescapeIdentifier( id )
{
    return id;
}

/**
 * @param {class} klass
 * @param {object} intr
 */
export function implement( klass, intr )
{
    let names = Object.getOwnPropertyNames( intr ).concat( Object.getOwnPropertySymbols( intr ) ),
        descs = {};

    names.forEach( name => ( descs[ name ] = Object.getOwnPropertyDescriptor( intr, name ) ).enumerable = false );

    Object.defineProperties( klass.prototype, descs );
}

let revisit;

export function hide_parent( obj )
{
    revisit = new Set();
    return walk_object( obj );
    // revisit = new Set();
    // return _hide_parent( obj );
}

function walk_object( obj )
{
    if ( obj instanceof Map || obj instanceof Set )
    {
        if ( revisit.has( obj ) ) return obj;
        revisit.add( obj );

        for ( const o of obj.values() )
            walk_object( o );
    }
    else if ( Array.isArray( obj ) )
    {
        if ( revisit.has( obj ) ) return obj;
        revisit.add( obj );

        if ( has( obj, 'pos' ) ) delete obj.pos;
        if ( has( obj, 'end' ) ) delete obj.end;

        for ( const o of obj )
            walk_object( o );
    }
    else if ( object( obj ) )
    {
        if ( revisit.has( obj ) ) return obj;
        revisit.add( obj );

        if ( obj && /[A-Z][a-z]+Object/.test( obj.constructor.name ) )
            obj.__ = obj.constructor.name;

        for ( const [ name, value ] of Object.entries( obj ) )
        {
            if ( name === 'text' && typeof value === 'string' && value.length > 80 )
                obj[ name ] = value.replace( /^([\s\S]{0,90}\s)[^]*/, '$1...' );
            else if ( name === 'parent' || name === 'checker' ) // || name === 'pos' || name === 'end' )
                delete obj[ name ];
            else if ( name === 'kind' && typeof obj.kind === 'number' )
                obj.kind = SyntaxKind[ obj.kind ];
            else if ( name === 'modifierFlagsCache' && typeof obj.modifierFlagsCache === 'number' )
                obj.modifierFlagsCache = `${ModifierFlags.create( obj.modifierFlagsCache )}`;
            else if ( name === 'checkFlags' && typeof obj.checkFlags === 'number' )
                obj.checkFlags = `${CheckFlags.create( obj.checkFlags )}`;
            else if ( name === 'flags' && typeof obj.flags === 'number' )
            {
                if ( obj.constructor.name === 'Type' || obj.constructor.name === 'TypeObject' )
                    obj.flags = `${TypeFlags.create( value )}`;
                else if ( obj.constructor.name === 'Symbol' || obj.constructor.name === 'SymbolObject' )
                    obj.flags = `${SymbolFlags.create( value )}`;
                else if ( obj.constructor.name === 'Node' || obj.constructor.name === 'NodeObject' )
                    obj.flags = `${NodeFlags.create( value )}`;
                else
                    obj.flags = value;
            }
            else if ( object( value ) )
            {
                if ( revisit.has( value ) ) return value;
                revisit.add( value );

                if ( has( value, 'kind' ) && value.kind === SyntaxKind.Identifier )
                    obj[ name ] = value.escapedText || value.name || `[ "${Object.keys( value ).join( '", "' )}" ]`;
                else
                    walk_object( value );
            }
            else if ( value === undefined )
                delete obj[ name ];
            else
                walk_object( value );

        }
    }

    return obj;
}

export const
    strictNullChecks             = false,
    enumRelation                 = new Map(),
    subtypeRelation              = new Map(),
    assignableRelation           = new Map(),
    definitelyAssignableRelation = new Map(),
    comparableRelation           = new Map(),
    identityRelation             = new Map();



const
    extRefs = new Map();

/**
 * @param {string} name
 * @param {Type} type
 */
export function set_ext_ref( name, type )
{
    extRefs.set( name, type );
}

/**
 * @param {string[]} name
 * @return {Type|Type[]}
 */
export function get_ext_ref( ...name )
{
    if ( name.length === 1 )
        return extRefs.get( name );

    return name.map( n => get_ext_ref( n ) );
}


/**
 * A reserved member name starts with two underscores, but the third character cannot be an underscore
 * or the `@` symbol. A third underscore indicates an escaped form of an identifer that started
 * with at least two underscores. The @ character indicates that the name is denoted by a well known ES
 * Symbol instance.
 *
 * @param {string} name
 * @return {boolean}
 */
export function isReservedMemberName( name )
{
    return name.charCodeAt( 0 ) === CharacterCodes._ &&
           name.charCodeAt( 1 ) === CharacterCodes._ &&
           name.charCodeAt( 2 ) !== CharacterCodes._ &&
           name.charCodeAt( 2 ) !== CharacterCodes.at;
}


/**
 * @param {ts.Node} node
 * @return {*|boolean}
 */
export function getSourceOfAssignment( node )
{
    return isExpressionStatement( node ) &&
           node.expression && isBinaryExpression( node.expression ) &&
           node.expression.operatorToken.kind === SyntaxKind.EqualsToken &&
           node.expression.right;
}

export function getSingleInitializerOfVariableStatementOrPropertyDeclaration( node )
{
    switch ( node.kind )
    {
        case SyntaxKind.VariableStatement:
            const v = getSingleVariableOfVariableStatement( node );
            return v && v.initializer;
        case SyntaxKind.PropertyDeclaration:
            return node.initializer;
    }
}

export function getSingleVariableOfVariableStatement( node )
{
    return node.kind === SyntaxKind.VariableStatement &&
           node.declarationList.declarations.length > 0 &&
           node.declarationList.declarations[ 0 ];
}

export function getSingleInitializerOfVariableStatement( node, child )
{
    return node.kind === SyntaxKind.VariableStatement &&
           node.declarationList.declarations.length > 0 &&
           ( !child || node.declarationList.declarations[ 0 ].initializer === child ) &&
           node.declarationList.declarations[ 0 ].initializer;
}



export function getNestedModuleDeclaration( node )
{
    return node.kind === SyntaxKind.ModuleDeclaration && node.body && node.body.kind === SyntaxKind.ModuleDeclaration && node.body;
}

// /**
//  * @param {ts.Node} node
//  * @return {boolean}
//  */
// export function isInJavaScriptFile( node )
// {
//     return node && !!( node.flags & NodeFlags.JavaScriptFile );
// }
//
// /**
//  * Given a BinaryExpression, returns SpecialPropertyAssignmentKind for the various kinds of property
//  * assignments we treat as special in the binder
//  *
//  * @param {ts.BinaryExpression} expr
//  * @return {SpecialPropertyAssignmentKind}
//  */
// export function getSpecialPropertyAssignmentKind( expr )
// {
//     if ( !isInJavaScriptFile( expr ) )
//         return SpecialPropertyAssignmentKind.None;
//
//     if ( expr.operatorToken.kind !== SyntaxKind.EqualsToken || expr.left.kind !== SyntaxKind.PropertyAccessExpression )
//         return SpecialPropertyAssignmentKind.None;
//
//     const lhs = expr.left;
//     if ( lhs.expression.kind === SyntaxKind.Identifier )
//     {
//         const lhsId = lhs.expression;
//         if ( lhsId.escapedText === "exports" )
//         // exports.name = expr
//             return SpecialPropertyAssignmentKind.ExportsProperty;
//         else if ( lhsId.escapedText === "module" && lhs.name.escapedText === "exports" )
//         // module.exports = expr
//             return SpecialPropertyAssignmentKind.ModuleExports;
//         else
//         // F.x = expr
//             return SpecialPropertyAssignmentKind.Property;
//     }
//     else if ( lhs.expression.kind === SyntaxKind.ThisKeyword )
//         return SpecialPropertyAssignmentKind.ThisProperty;
//     else if ( lhs.expression.kind === SyntaxKind.PropertyAccessExpression )
//     {
//         // chained dot, e.g. x.y.z = expr; this var is the 'x.y' part
//         const innerPropertyAccess = lhs.expression;
//         if ( innerPropertyAccess.expression.kind === SyntaxKind.Identifier )
//         {
//             // module.exports.name = expr
//             const innerPropertyAccessIdentifier = innerPropertyAccess.expression;
//             if ( innerPropertyAccessIdentifier.escapedText === "module" && innerPropertyAccess.name.escapedText === "exports" )
//
//                 return SpecialPropertyAssignmentKind.ExportsProperty;
//
//             if ( innerPropertyAccess.name.escapedText === "prototype" )
//                 return SpecialPropertyAssignmentKind.PrototypeProperty;
//
//         }
//     }
//
//
//     return SpecialPropertyAssignmentKind.None;
// }
//
// /**
//  * @param {ts.Node} node
//  * @return {boolean}
//  */
// export function isObjectLiteralOrClassExpressionMethod( node )
// {
//     return node.kind === SyntaxKind.MethodDeclaration && ( node.parent.kind === SyntaxKind.ObjectLiteralExpression || node.parent.kind === SyntaxKind.ClassExpression );
// }
//
// /**
//  *
//  * @param {ts.Node} node
//  * @return {Node|boolean}
//  */
// export function isFunctionLike( node )
// {
//     return node && isFunctionLikeKind( node.kind );
// }
//
// /**
//  * @param {ts.Node} node
//  */
// export function isFunctionLikeDeclaration( node )
// {
//     return node && isFunctionLikeDeclarationKind( node.kind );
// }
//
// /**
//  * @param {SyntaxKind} kind
//  * @return {boolean}
//  */
// function isFunctionLikeDeclarationKind( kind )
// {
//     switch ( kind )
//     {
//         case SyntaxKind.FunctionDeclaration:
//         case SyntaxKind.MethodDeclaration:
//         case SyntaxKind.Constructor:
//         case SyntaxKind.GetAccessor:
//         case SyntaxKind.SetAccessor:
//         case SyntaxKind.FunctionExpression:
//         case SyntaxKind.ArrowFunction:
//             return true;
//         default:
//             return false;
//     }
// }
//
// /**
//  * @param {SyntaxKind} kind
//  * @return {boolean}
//  */
// export function isFunctionLikeKind( kind )
// {
//     switch ( kind )
//     {
//         case SyntaxKind.MethodSignature:
//         case SyntaxKind.CallSignature:
//         case SyntaxKind.ConstructSignature:
//         case SyntaxKind.IndexSignature:
//         case SyntaxKind.FunctionType:
//         case SyntaxKind.JSDocFunctionType:
//         case SyntaxKind.ConstructorType:
//             return true;
//         default:
//             return isFunctionLikeDeclarationKind( kind );
//     }
// }
//
// /**
//  * @param {ts.Node} node
//  * @return {boolean}
//  */
// export function isConst( node )
// {
//     return !!( getCombinedNodeFlags( node ) & NodeFlags.Const )
//            || !!( getCombinedModifierFlags( node ) & ModifierFlags.Const );
// }
//
// /**
//  * @param {ts.Node} node
//  * @return {ts.Node}
//  */
// function walkUpBindingElementsAndPatterns( node )
// {
//     while ( node && ( node.kind === SyntaxKind.BindingElement || isBindingPattern( node ) ) )
//     {
//         node = node.parent;
//     }
//
//     return node;
// }
//
// /**
//  * @param {Node} node
//  * @return {BindingPattern}
//  */
// export function isBindingPattern( node )
// {
//     if ( node )
//     {
//         const kind = node.kind;
//         return kind === SyntaxKind.ArrayBindingPattern || kind === SyntaxKind.ObjectBindingPattern;
//     }
//
//     return false;
// }

/**
 * @param {ts.Node} node
 * @return {ModifierFlags}
 */
export function getCombinedModifierFlags( node )
{
    node = walkUpBindingElementsAndPatterns( node );

    let flags = getModifierFlags( node );

    if ( node.kind === SyntaxKind.VariableDeclaration )
        node = node.parent;

    if ( node && node.kind === SyntaxKind.VariableDeclarationList )
    {
        flags |= getModifierFlags( node );
        node = node.parent;
    }

    if ( node && node.kind === SyntaxKind.VariableStatement )
    {
        flags |= getModifierFlags( node );
    }

    return flags;
}

/**
 * Returns the node flags for this node and all relevant parent nodes.  This is done so that
 * nodes like variable declarations and binding elements can returned a view of their flags
 * that includes the modifiers from their container.  i.e. flags like export/declare aren't
 * stored on the variable declaration directly, but on the containing variable statement
 * (if it has one).  Similarly, flags for let/const are store on the variable declaration
 * list.  By calling this function, all those flags are combined so that the client can treat
 * the node as if it actually had those flags.
 *
 * @param {ts.Node} node
 * @return {number|NodeFlags}
 */
export function getCombinedNodeFlags( node )
{
    node = walkUpBindingElementsAndPatterns( node );

    let flags = node.flags;

    if ( node.kind === SyntaxKind.VariableDeclaration )
        node = node.parent;

    if ( node && node.kind === SyntaxKind.VariableDeclarationList )
    {
        flags |= node.flags;
        node = node.parent;
    }

    if ( node && node.kind === SyntaxKind.VariableStatement )
        flags |= node.flags;

    return NodeFlags( flags );
}

// export function getNestedModuleDeclaration( node )
// {
//     return node.kind === SyntaxKind.ModuleDeclaration &&
//         node.body &&
//         node.body.kind === SyntaxKind.ModuleDeclaration &&
//         node.body;
// }

// /**
//  * @param {ts.Node} node
//  * @return {?(ts.Expression|ts.Node)}
//  */
// export function getSingleInitializerOfVariableStatementOrPropertyDeclaration( node )
// {
//     switch ( node.kind )
//     {
//         case SyntaxKind.VariableStatement:
//             const v = getSingleVariableOfVariableStatement( node );
//             return v && v.initializer;
//         case SyntaxKind.PropertyDeclaration:
//             return node.initializer;
//     }
// }
//
// /**
//  * @param {ts.Node} node
//  * @return {?(ts.VariableDeclaration|ts.Node)}
//  */
// function getSingleVariableOfVariableStatement( node )
// {
//     return isVariableStatement( node ) &&
//         node.declarationList.declarations.length > 0 &&
//         node.declarationList.declarations[ 0 ];
// }

/**
 * @param {ts.SourceFile|ts.Node} sourceFile
 * @param {ts.Expression|ts.Node} node
 * @return {*|boolean}
 */
export function isExportsOrModuleExportsOrAlias( sourceFile, node )
{
    return isExportsIdentifier( node ) ||
           isModuleExportsPropertyAccessExpression( node ) ||
           isIdentifier( node ) && isNameOfExportsOrModuleExportsAliasDeclaration( sourceFile, node );
}

/**
 * @param {ts.SourceFile|ts.Node} sourceFile
 * @param {ts.Identifier|ts.Node} node
 * @return {*|boolean}
 */
export function isNameOfExportsOrModuleExportsAliasDeclaration( sourceFile, node )
{
    const symbol = lookupSymbolForNameWorker( sourceFile, node.escapedText );

    return symbol && symbol.valueDeclaration && isVariableDeclaration( symbol.valueDeclaration ) &&
           symbol.valueDeclaration.initializer && isExportsOrModuleExportsOrAliasOrAssignment( sourceFile, symbol.valueDeclaration.initializer );
}

/**
 * @param {ts.SourceFile|ts.Node} sourceFile
 * @param {ts.Expression|ts.Node} node
 * @return {*|boolean}
 */
export function isExportsOrModuleExportsOrAliasOrAssignment( sourceFile, node )
{
    return isExportsOrModuleExportsOrAlias( sourceFile, node ) ||
           ( isAssignmentExpression( node, /* excludeCompoundAssignements */ true ) && (
               isExportsOrModuleExportsOrAliasOrAssignment( sourceFile, node.left ) || isExportsOrModuleExportsOrAliasOrAssignment( sourceFile, node.right ) ) );
}

/**
 * @param {ts.Node} container
 * @param {string} name
 * @return {?Symbol}
 */
export function lookupSymbolForNameWorker( container, name )
{
    const local = container.locals && container.locals.get( name );

    if ( local ) return local.exportSymbol || local;

    return container.symbol && container.symbol.exports && container.symbol.exports.get( name );
}

/**
 * The binder visits every node in the syntax tree so it is a convenient place to perform a single localized
 * check for reserved words used as identifiers in strict mode code.
 *
 * @param node
 */
function checkStrictModeIdentifier( node )
{
    if ( node.originalKeywordKind >= SyntaxKind.FirstFutureReservedWord &&
         node.originalKeywordKind <= SyntaxKind.LastFutureReservedWord &&
         !isIdentifierName( node ) &&
         !( node.flags & NodeFlags.Ambient ) )
    {
        error( node, 'reserved word somehow' );
    }
}

function isLogicalExpression( node )
{
    while ( true )
    {
        if ( node.kind === SyntaxKind.ParenthesizedExpression )
            node = node.expression;
        else if ( node.kind === SyntaxKind.PrefixUnaryExpression && node.operator === SyntaxKind.ExclamationToken )
            node = node.operand;
        else
            return node.kind === SyntaxKind.BinaryExpression && (
                node.operatorToken.kind === SyntaxKind.AmpersandAmpersandToken ||
                node.operatorToken.kind === SyntaxKind.BarBarToken );

    }
}

export function isTopLevelLogicalExpression( node )
{
    while ( node.parent.kind === SyntaxKind.ParenthesizedExpression ||
            node.parent.kind === SyntaxKind.PrefixUnaryExpression &&
            node.parent.operator === SyntaxKind.ExclamationToken )
        node = node.parent;

    return !isStatementCondition( node ) && !isLogicalExpression( node.parent );
}

function isStatementCondition( node )
{
    const parent = node.parent;

    switch ( parent.kind )
    {
        case SyntaxKind.IfStatement:
        case SyntaxKind.WhileStatement:
        case SyntaxKind.DoStatement:
            return parent.expression === node;
        case SyntaxKind.ForStatement:
        case SyntaxKind.ConditionalExpression:
            return parent.condition === node;
    }

    return false;
}

/**
 * @param f
 */
export function set_file( f )
{
    currentFile = f;
}

/**
 * Returns true if this node is missing from the actual source code. A 'missing' node is different
 * from 'undefined/defined'. When a node is undefined (which can happen for optional nodes
 * in the tree), it is definitely missing. However, a node may be defined, but still be
 * missing.  This happens whenever the parser knows it needs to parse something, but can't
 * get anything in the source code that it expects at that location. For example:
 *
 *          let a: ;
 *
 * Here, the Type in the Type-Annotation is not-optional (as there is a colon in the source
 * code). So the parser will attempt to parse out a type, and will create an actual node.
 * However, this node will be 'missing' in the sense that no actual source-code/tokens are
 * contained within it.
 *
 * @param {ts.Node} node
 * @return {boolean}
 */
export function nodeIsMissing( node )
{
    if ( node === undefined )
        return true;


    return node.pos === node.end && node.pos >= 0 && node.kind !== SyntaxKind.EndOfFileToken;
}

/**
 * @param {ts.Node} node
 * @return {boolean}
 */
export function nodeIsPresent( node )
{
    return !nodeIsMissing( node );
}

/**
 * The binder visits every node in the syntax tree so it is a convenient place to perform a single localized
 * check for reserved words used as identifiers in strict mode code.
 *
 * @param {ts.Node} node
 */
export function checkStrictModeIdentifier( node )
{
    if ( node.originalKeywordKind >= SyntaxKind.FirstFutureReservedWord &&
         node.originalKeywordKind <= SyntaxKind.LastFutureReservedWord &&
         !isIdentifierName( node ) &&
         !( node.flags & NodeFlags.Ambient ) )
    {

        warn( node, "Strict mode identifier issue" );
    }
}

/**
 * @param {ts.Node} contextNode
 * @param {ts.Node} name
 */
export function checkStrictModeEvalOrArguments( contextNode, name )
{
    if ( name && name.kind === SyntaxKind.Identifier )
    {
        if ( isEvalOrArgumentsIdentifier( name ) )
        {
            // We check first if the name is inside class declaration or class expression; if so give explicit message
            // otherwise report generic error message.
            warn( name, "Don't use eval or arguments as identifier names" );
        }
    }
}

function isEvalOrArgumentsIdentifier( node )
{
    return isIdentifier( node ) && ( node.escapedText === "eval" || node.escapedText === "arguments" );
}

export function positionIsSynthesized( pos )
{
    // This is a fast way of testing the following conditions:
    //  pos === undefined || pos === null || isNaN(pos) || pos < 0;
    return !( pos >= 0 );
}

export function checkStrictModeNumericLiteral( node )
{
    return !( inStrictMode && node.numericLiteralFlags & TokenFlags.Octal );
}

export function canonical_name( filename )
{
    if ( filename.startsWith( './' ) ) filename = filename.substr( 2 );

    return isWindows ? filename.toLowerCase() :filename;
}

// export const NamedDeclaration = ( name, cls, ...args ) => new ( { [ name ]: class extends cls {} }[ name ] )( ...args );

export const
    COPY = Symbol( 'copy' ),
    PARENT = Symbol( 'parent' );
