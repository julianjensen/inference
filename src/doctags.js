/** ******************************************************************************************************************
 * @file Create vars and attach doc tags, if any.
 *
 * Strict mode
 * -----------
 *
 * 1. No global variable creation. Any assignment to a variable that hasn't been declared and source type is `"script"`
 *    will throw a `ReferenceError`. In normal mode, a variable is created on the global scope.
 *
 * 2. Assigning values to global non-writable variables will throw a `TypeError`. Silently fails in normal mode.
 *
 * 3. Trying to delete undeletable properties will throw a `TypeError`.
 *
 * 4. Parameters must have unique names. In normal mode, subsequent parameters with the same name will hide the
 *    previous values although they can still be accessed using `arguments`.
 *
 * 5. No octal syntax, you must use the prefix `0o`.
 *
 * 6. Setting a property on a primitive throws a `TypeError`. Silently fails in normal mode.
 *
 * 7. `with` is prohibited.
 *
 * 8. `eval` gets its own scope and is executed in strict mode. Also, eval'd code cannot delete a plain name.
 *
 * 9. `eval` and `arguments` are treated as keywords, i.e. cannot be assigned to.
 *
 * 10. In nomral mode, `arguments` elements are aliased to the parameters, changing one changes the other. This is not true for strict mode.
 *
 * 11. `arguments.callee` is not supported, throws `TypeError` is accessed. In normal mode, refers to the enclosing function.
 *
 * 12. `this` is not boxed. Inside a function not explicitly invoked with a `this` context will have `this === undefined`.
 *
 * 13. Accessing `function.caller` and `function.arguments` will throw a `TypeError`.
 *
 * 14. Accessing `arguments.caller` will throw a `TypeError`.
 *
 * 15. New reserved words:
 *     * `implements`
 *     * `interface`
 *     * `let`
 *     * `package`
 *     * `private`
 *     * `protected`
 *     * `public`
 *     * `protected`
 *     * `public`
 *     * `static`
 *     * `yield`
 *
 * 16. Not an actual "strict mode" thing but generally supported: No function declaration outside of script/module and function
 *     scope.
 *
 * @author Julian Jensen <jjdanois@gmail.com>
 * @since 1.0.0
 * @date 20-Jan-2018
 *********************************************************************************************************************/

"use strict";

import unassociated_tag      from './doctags-unrelated';
import { flatDump, globals } from "./utils";
import { Syntax }            from 'espree';
import { TypeFlags }         from "./types";
import { FunctionSymbol }    from "./symbols";
import { parse_comments }    from "./jsdoc-parser";

let symbolTable;

/**
 * @param {Node} node
 * @param {Comments} [comments]
 */
export default function build_definition( node, comments )
{
    symbolTable = globals.current;

    if ( !comments )
        return create_symbol( node );

    const { leading, trailing } = comments;

    if ( leading && leading.length > 1 )
        leading.slice( 0, leading.length - 1 ).forEach( cb => unassociated_tag( node, cb ) );

    if ( trailing && trailing.length )
        trailing.forEach( cb => unassociated_tag( node, cb ) );

    if ( leading.length )
        create_symbol( node, leading[ leading.length - 1 ] );

}

/**
 * @param {VariableDeclarator} node
 * @param {CommentBlock} cb
 */
function var_decl( node, cb )
{
    const sym = declaration( node.id, cb );

    if ( node.kind === 'var' )
        sym.as( TypeFlags.HOISTABLE );
    else
    {
        sym.as( TypeFlags.BLOCKSCOPED );
        if ( node.kind === 'const' )
            sym.as( TypeFlags.READONLY );
    }
}

/**
 * @param {MethodDefinition} node
 */
function method_name( node )
{
    /** @type {Identifier|Expression|MemberExpression|Literal} */
    let id = node.key;

    if ( !node.computed && id.type === Syntax.Identifier )
        return id.name;

    if ( !node.computed )
        throw new SyntaxError( "What is this node?\n" + flatDump( node ) );

    if ( id.type === Syntax.Literal )
        return id.value;

    if ( id.type === Syntax.MemberExpression && !id.computed )
    {
        if ( id.object.type === Syntax.Identifier && id.object.name === 'Symbol' )
            return '@@' + id.property.name;
    }

    if ( id.type === Syntax.Identifier )
        return id.name;

    return null;
}

/**
 * @param {?(Node|BaseNode|VariableDeclaration|VariableDeclarator|Program|MethodDefinition|Declaration)} node
 * @param {CommentBlock} [cb]
 */
function create_symbol( node, cb )
{
    let sym;

    if ( !node ) return;

    switch ( node.type )
    {
        case Syntax.Program:
            break;

        case Syntax.ExportDefaultDeclaration:
            break;

        case Syntax.MethodDefinition:
            const mname = method_name( node );

            if ( !mname )
                sym = declaration( node, cb, node.key );
            else
                sym = declaration( node, cb, mname );
            if ( node.generator ) sym.as( TypeFlags.GENERATORFUNC );
            if ( node.async ) sym.as( TypeFlags.ASYNC );
            if ( node.computed || node.key.computed )
                sym.as( TypeFlags.COMPUTED | TypeFlags.PROPERTY | TypeFlags.CALLABLE );
            break;

        case Syntax.FunctionDeclaration:
            sym = declaration( node.id, cb ).as( SymbolFlags.Function );
            break;

        case Syntax.ExpressionStatement:
            break;

        case Syntax.ExportNamedDeclaration:
            break;

        case Syntax.VariableDeclarator:
            var_decl( node, cb );
            break;

        case Syntax.VariableDeclaration:
            node.declarations.forEach( decl => var_decl( decl, cb ) );
            break;

        case Syntax.Identifier:
            create_symbol( from_identifier( node ) );
            break;


    }
}

function from_identifier( node )
{
    const startNode = node;

    node = node.parent;

    if ( node.type.endsWith( 'Statement' ) ) return null;

    if ( node.type.endsWith( 'Declaration' ) ) return node;

    switch ( node.type )
    {
        case Syntax.SpreadElement:
        case Syntax.SequenceExpression:
            return node;

        case Syntax.FunctionExpression:
            function_expression( node );
        /* falls through */
        default:
            return null;
    }
}

/**
 * @param {FunctionExpression|ArrowFunctionExpression} node
 */
function function_expression( node )
{
    let sym,
        p = node.parent;

    if ( node.id )
        sym = undoc_decl( node.id, node );
    else if ( p.type === Syntax.AssignmentExpression )
        sym = undoc_decl( p.left.type === Syntax.Identifier ? p.left.name : null, node );
    else if ( p.type === Syntax.VariableDeclarator )
        sym = undoc_decl( p.id, node );
    else if ( p.type === Syntax.MethodDefinition )
    {
        sym = undoc_decl( p.key, node );
        sym.as( SymbolFlags.Method );
        if ( p.kind === 'get' ) sym.as( SymbolFlags.GetAccessor );
        else if ( p.kind === 'set' ) sym.as( SymbolFlags.SetAccessor );
        if ( p.static ) sym.modifiers |= ModifierFlags.Static;
    }

    // IIFE if p.type === Syntax.CallExpression

    sym.as( SymbolFlags.Function );
    if ( node.async ) sym.modifiers |= ModifierFlags.Async;
    if ( node.generator ) sym.modifiers |= ModifierFlags.Generator;

    if ( p.type === Syntax.NewExpression )
        sym.as( SymbolFlags.Constructor );

    if ( node.type === Syntax.ArrowFunctionExpression )
        sym.as( SymbolFlags.NoBind );
}

function undoc_decl( nameNode, declNode )
{
    return symbolTable.decl( nameNode, declNode );
}

/**
 * @param {Identifier|Pattern|MethodDefinition} node
 * @param {CommentBlock} cb
 * @param {string} [optName]
 * @return {Symbol}
 */
function declaration( node, cb, optName )
{
    const sym = new Symbol( optName || node.name, symbolTable );

    sym.decl_node( node.type === Syntax.Identifier ? node.parent : node );

    if ( cb )
        sym.docs( cb.tags );

    return sym;
}

/**
 * @param {Identifier|Pattern|MethodDefinition} node
 * @param {CommentBlock} cb
 * @param {string} [optName]
 * @return {FunctionSymbol}
 */
function function_decl( node, cb, optName )
{
    const sym = new FunctionSymbol( optName || node.name, symbolTable );

    sym.decl_node( node.type === Syntax.Identifier ? node.parent : node );

    return sym;
}

function function_ref( node, optName )
{

}

export const topScope = { parent: null, children: [], ids: [] };
let scopeNode = topScope,
    topSymbol;

/**
 * @param {BaseNode|string} node
 * @return {boolean}
 */
function creates_scope( node )
{
    return [
        Syntax.Program,                 // Creates `module` scope if type is module or "use strict", otherwise `global` scope
        Syntax.BlockStatement,
        Syntax.FunctionDeclaration,
        Syntax.FunctionExpression,
        Syntax.ArrowFunctionExpression,
        Syntax.CatchClause,
        Syntax.SwitchStatement,
        Syntax.WithStatement,
        Syntax.ClassDeclaration,
        Syntax.ClassExpression
    ].includes( typeof node === 'string' ? node : node.type );
}

export function enter( node )
{
    if ( creates_scope( node ) )
    {
        const scope = { parent: scopeNode, children: [], ids: [] };
        if ( scopeNode ) scopeNode.children.push( scope );
        scopeNode = scope;
    }

    const comments = parse_comments( node );

    if ( node.type === Syntax.Identifier || comments )
        scopeNode.ids.push( { node, comments } );
}

export function exit( node )
{
    if ( creates_scope( node ) )
        scopeNode = scopeNode.parent;
}

export function process_scopes( isModule = true )
{
    // globals.topSymbol
    // if ( isModule )
}

