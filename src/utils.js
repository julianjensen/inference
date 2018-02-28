/** ******************************************************************************************************************
 * @file Provides stand-alone utility functions.
 * @author Julian Jensen <jjdanois@gmail.com>
 * @since 1.0.0
 * @date 19-Jan-2018
 *********************************************************************************************************************/
"use strict";

import { inspect }                                                                from 'util';
import { EventEmitter }                                                           from "events";
import chalk                                                                      from 'chalk';
import { SyntaxKind }                                                             from "./ts/ts-helpers";
import { InternalSymbolName, ModifierFlags, ObjectFlags, SymbolFlags, TypeFlags } from "./types";

const
    { red, green, yellow, cyan, white, gray } = chalk,
    /**
     * @param {object} o
     * @param {string} n
     * @return {boolean}
     */
    has                                       = ( o, n ) => Reflect.has( o, n );

// eslint-disable-next-line new-parens
export const events = new class extends EventEmitter {};



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

export const output = {};

/**
 * @param {string} fileName
 * @param {string} source
 * @return {{fatal: fatal, error: error}}
 */
export function create_reporters( fileName, source )
{
    const
        loc_info = create_loc_info( source );

    /**
     * @param {Node} node
     * @return {[ number, number ]}
     */
    function get_start_end( node )
    {
        if ( has( node, 'start' ) )
            return [ node.start, node.end ];
        else if ( has( node, 'range' ) )
            return node.range;
        else
            return [ node.pos, node.end ];
    }

    /**
     * @param {string} msg
     * @param {Node} [node]
     * @param {object} [opts]
     */
    function fatal( msg, node, opts )
    {
        opts = Object.assign( opts || {}, {
            noThrow: false,
            color:   red,
            show:    true
        } );

        error( msg, node, opts );
    }

    /**
     * @param {string} msg
     * @param {Node} [node]
     * @param {object} [opts]
     */
    function warn( msg, node, opts )
    {
        opts = Object.assign( opts || {}, {
            noThrow: true,
            color:   yellow,
            show:    true
        } );

        error( msg, node, opts );
    }


    /**
     * @param {string} msg
     * @param {Node} [node]
     * @param {object} [opts]
     */
    function log( msg, node, opts )
    {
        opts = Object.assign( opts || {}, {
            noThrow: false,
            color:   cyan,
            show:    true
        } );

        error( msg, node, opts );
    }

    /**
     * @param {string} msg
     * @param {Node} [node]
     * @param {object} [opts]
     */
    function error( msg, node, opts = {} )
    {
        let { noThrow = true, show = true, color = red } = opts,
            [ start, end ]                               = get_start_end( node ),
            loc                                          = loc_info( start, end ),
            fileLoc                                      = loc && `In "${fileName}", line ${loc.start.line + 1}: `,
            txt                                          = ( loc ? fileLoc : '' ) + msg;

        if ( show && node )
            txt += '\n\n' + show_source( node, 0 );

        if ( noThrow )
        {
            console.error( color( txt ) );
            return;
        }

        throw new Error( txt );
    }

    /**
     * @param node
     * @return {string}
     */
    function show_source( node )
    {
        let [ start, end ] = get_start_end( node ),
            loc            = loc_info( start, end ),
            sline          = loc.start.sourceLine,
            indicator      = ' '.repeat( loc.start.offset ) + '^';

        return sline + '\n' + indicator;
    }

    /**
     * @param offset
     * @param lineOffsets
     * @return {number}
     */
    function binary_search( offset, lineOffsets )
    {
        let b      = 0,
            e      = lineOffsets.length - 1,
            middle = ( e - b ) >> 1;

        if ( offset >= lineOffsets[ lineOffsets.length - 1 ] ) return 0;

        while ( true )
        {
            if ( offset < lineOffsets[ middle ] )
                e = middle;
            else if ( offset >= lineOffsets[ middle + 1 ] )
                b = middle;
            else
                break;

            middle = b + ( ( e - b ) >> 1 );
        }

        return middle;
    }

    /**
     * @return {function(*=, *=)}
     */
    function create_loc_info()
    {
        let i           = 0,
            lng         = source.length,
            lineOffsets = [ 0 ],
            chop        = s => s.replace( /^(.*)[\r\n]*$/, '$1' );

        while ( i < lng )
        {
            if ( source[ i ] === '\n' )
                lineOffsets.push( i + 1 );

            ++i;
        }

        lineOffsets.push( lng );

        return ( start, end ) => {
            let lineNumber    = binary_search( start, lineOffsets ),
                startOffset   = start - lineOffsets[ lineNumber ],
                lineNumberEnd = end < lineOffsets[ lineNumber + 1 ] ? lineNumber : binary_search( end, lineOffsets ),
                endOffset     = end - lineOffsets[ lineNumberEnd ];

            return {
                start:       {
                    line:       lineNumber,
                    offset:     startOffset,
                    sourceLine: chop( source.substring( lineOffsets[ lineNumber ], lineOffsets[ lineNumber + 1 ] ) ),
                    lineOffset: lineOffsets[ lineNumber ]
                },
                end:         {
                    line:       lineNumberEnd,
                    offset:     endOffset,
                    sourceLine: chop( source.substring( lineOffsets[ lineNumberEnd ], lineOffsets[ lineNumberEnd + 1 ] ) ),
                    lineOffset: lineOffsets[ lineNumberEnd ]
                },
                sourceRange: chop( source.substring( startOffset, endOffset + 1 ).replace( /^(.*)[\r\n]*$/, '$1' ) ),
                sourceLines: chop( source.substring( lineOffsets[ lineNumber ], lineOffsets[ lineNumberEnd + 1 ] ) )
            };

        };
    }

    return {
        fatal,
        error,
        warn,
        log
    };
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

/**
 * @param {Declaration|Expression} declaration
 * @return {?DeclarationName}
 */
export function getNameOfDeclaration( declaration )
{
    if ( !declaration ) return void 0;

    switch ( declaration.kind )
    {
        case SyntaxKind.Identifier:
            return declaration;

        case SyntaxKind.JSDocPropertyTag:
        case SyntaxKind.JSDocParameterTag:
        {
            const { name } = declaration;

            if ( name.kind === SyntaxKind.QualifiedName )
                return name.right;
            break;
        }

        // case SyntaxKind.BinaryExpression:
        // {
        //     const expr = declaration;
        //
        //     switch ( getSpecialPropertyAssignmentKind( expr ) )
        //     {
        //         case SpecialPropertyAssignmentKind.ExportsProperty:
        //         case SpecialPropertyAssignmentKind.ThisProperty:
        //         case SpecialPropertyAssignmentKind.Property:
        //         case SpecialPropertyAssignmentKind.PrototypeProperty:
        //             return ( expr.left as PropertyAccessExpression ).name;
        //         default:
        //             return undefined;
        //     }
        // }

        case SyntaxKind.JSDocTypedefTag:
            return getNameOfJSDocTypedef( declaration );

        case SyntaxKind.ExportAssignment:
            return declaration.kind === SyntaxKind.Identifier ? expression : undefined;
    }

    return ( declaration ).name;
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

export function skipPartiallyEmittedExpressions( node )
{
    while ( node.kind === SyntaxKind.PartiallyEmittedExpression )
        node = node.expression;

    return node;
}

/**
 * Determines whether a node is an expression based only on its kind.
 * Use `isExpressionNode` if not in transforms.
 */
export function isExpression( node )
{
    return isExpressionKind( skipPartiallyEmittedExpressions( node ).kind );
}

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
    return node && node.kind === SyntaxKind.ModuleDeclaration &&
           ( node.name.kind === SyntaxKind.StringLiteral || isGlobalScopeAugmentation( node ) );
}

export function isGlobalScopeAugmentation( module )
{
    return !!( module.flags & NodeFlags.GlobalAugmentation );
}


// JSDoc

export function isJSDocTypeExpression( node )
{
    return node.kind === SyntaxKind.JSDocTypeExpression;
}

export function isJSDocAllType( node )
{
    return node.kind === SyntaxKind.JSDocAllType;
}

export function isJSDocUnknownType( node )
{
    return node.kind === SyntaxKind.JSDocUnknownType;
}

export function isJSDocNullableType( node )
{
    return node.kind === SyntaxKind.JSDocNullableType;
}

export function isJSDocNonNullableType( node )
{
    return node.kind === SyntaxKind.JSDocNonNullableType;
}

export function isJSDocOptionalType( node )
{
    return node.kind === SyntaxKind.JSDocOptionalType;
}

export function isJSDocFunctionType( node )
{
    return node.kind === SyntaxKind.JSDocFunctionType;
}

export function isJSDocVariadicType( node )
{
    return node.kind === SyntaxKind.JSDocVariadicType;
}

export function isJSDoc( node )
{
    return node.kind === SyntaxKind.JSDocComment;
}

export function isJSDocAugmentsTag( node )
{
    return node.kind === SyntaxKind.JSDocAugmentsTag;
}

export function isJSDocParameterTag( node )
{
    return node.kind === SyntaxKind.JSDocParameterTag;
}

export function isJSDocReturnTag( node )
{
    return node.kind === SyntaxKind.JSDocReturnTag;
}

export function isJSDocTypeTag( node )
{
    return node.kind === SyntaxKind.JSDocTypeTag;
}

export function isJSDocTemplateTag( node )
{
    return node.kind === SyntaxKind.JSDocTemplateTag;
}

export function isJSDocTypedefTag( node )
{
    return node.kind === SyntaxKind.JSDocTypedefTag;
}

export function isJSDocPropertyTag( node )
{
    return node.kind === SyntaxKind.JSDocPropertyTag;
}

export function isJSDocPropertyLikeTag( node )
{
    return node.kind === SyntaxKind.JSDocPropertyTag || node.kind === SyntaxKind.JSDocParameterTag;
}

export function isJSDocTypeLiteral( node )
{
    return node.kind === SyntaxKind.JSDocTypeLiteral;
}

/**
 * Maps an array. If the mapped value is an array, it is spread into the result.
 *
 * @param array The array to map.
 * @param mapfn The callback used to map the result into one or more values.
 */
export function flatMap( array, mapfn )
{
    let result;

    if ( array )
    {
        result = [];
        for ( let i = 0; i < array.length; i++ )
            result = result.concat( mapfn( array[ i ], i ) | [] );
    }

    return result;
}

export function getJSDocCommentsAndTags( node )
{
    let result;

    getJSDocCommentsAndTagsWorker( node );

    return result || [];

    function getJSDocCommentsAndTagsWorker( node )
    {
        const parent = node.parent;

        if ( parent && ( parent.kind === SyntaxKind.PropertyAssignment || getNestedModuleDeclaration( parent ) ) )
            getJSDocCommentsAndTagsWorker( parent );


        // Try to recognize this pattern when node is initializer of variable declaration and JSDoc comments are on containing variable statement.
        // /**
        //   * @param {number} name
        //   * @returns {number}
        //   */
        // var x = function(name) { return name.length; }
        if ( parent && parent.parent &&
             ( getSingleVariableOfVariableStatement( parent.parent, node ) || getSourceOfAssignment( parent.parent ) ) )
            getJSDocCommentsAndTagsWorker( parent.parent );

        if ( parent && parent.parent && parent.parent.parent && getSingleInitializerOfVariableStatement( parent.parent.parent, node ) )
            getJSDocCommentsAndTagsWorker( parent.parent.parent );

        if ( isBinaryExpression( node ) && getSpecialPropertyAssignmentKind( node ) !== SpecialPropertyAssignmentKind.None ||
             node.kind === SyntaxKind.PropertyAccessExpression && node.parent && node.parent.kind === SyntaxKind.ExpressionStatement )
            getJSDocCommentsAndTagsWorker( parent );

        // Pull parameter comments from declaring function as well
        if ( node.kind === SyntaxKind.Parameter )
            result = addRange( result, getJSDocParameterTags( node ) );

        if ( isVariableLike( node ) && hasInitializer( node ) && hasJSDocNodes( node.initializer ) )
        {
            result = addRange( result, node.initializer.jsDoc );
        }

        if ( hasJSDocNodes( node ) )
        {
            result = addRange( result, node.jsDoc );
        }
    }
}

/** Does the opposite of `getJSDocParameterTags`: given a JSDoc parameter, finds the parameter corresponding to it. */
export function getParameterSymbolFromJSDoc( node )
{
    if ( node.symbol )
        return node.symbol;

    if ( !isIdentifier( node.name ) )
        return undefined;

    const name = node.name.escapedText;

    const decl = getHostSignatureFromJSDoc( node );

    if ( !decl )
        return undefined;

    const parameter = decl.parameters.find( p => p.name.kind === SyntaxKind.Identifier && p.name.escapedText === name );
    return parameter && parameter.symbol;
}

export function getHostSignatureFromJSDoc( node )
{
    const
        host = getJSDocHost( node ),
        decl = getSourceOfAssignment( host ) ||
               getSingleInitializerOfVariableStatement( host ) ||
               getSingleVariableOfVariableStatement( host ) ||
               getNestedModuleDeclaration( host ) ||
               host;

    return decl && isFunctionLike( decl ) ? decl : undefined;
}

export function getJSDocHost( node )
{
    assert( node.parent.kind === SyntaxKind.JSDocComment );
    return node.parent.parent;
    !;
}

export function getTypeParameterFromJsDoc( node )
{
    const name               = node.name.escapedText;
    const { typeParameters } = node.parent.parent.parent;
    return typeParameters.find( p => p.name.escapedText === name );
}

export class TypeSet extends Array
{
    constructor( ...args )
    {
        super( ...args );

        this.containsAny = false;
        this.containsUndefined = false;
        this.containsNull = false;
        this.containsNever = false;
        this.containsNonWideningType = false;
        this.containsString = false;
        this.containsNumber = false;
        this.containsESSymbol = false;
        this.containsLiteralOrUniqueESSymbol = false;
        this.containsObjectType = false;
        this.containsEmptyObject = false;
        this.unionIndex = -1;
        this.number = false;
    }

}

export function comparer( a, b )
{
    return a === b ? 0 : a === undefined ? -1 : b === undefined ? 1 : a < b ? -1 : 1;
}

export function containsType( types, type )
{
    return binarySearch( types, type, t => t.id, comparer ) >= 0;
}

export function containsIdenticalType( types, type )
{
    for ( const t of types )
        if ( isTypeIdenticalTo( t, type ) )
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
            case Comparison.LessThan:
                low = middle + 1;
                break;
            case Comparison.EqualTo:
                return middle;
            case Comparison.GreaterThan:
                high = middle - 1;
                break;
        }
    }

    return ~low;
}

