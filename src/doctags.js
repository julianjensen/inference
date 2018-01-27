/** ******************************************************************************************************************
 * @file Describe what doctags does.
 * @author Julian Jensen <jjdanois@gmail.com>
 * @since 1.0.0
 * @date 20-Jan-2018
 *********************************************************************************************************************/



"use strict";

import unassociated_tag                               from './doctags-unrelated';
import { flatDump, globals }                          from "./utils";
import { Syntax }                                     from 'espree';
import { ModifierFlags, SymbolFlags, TransformFlags } from "./types";

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
        sym.as( SymbolFlags.FunctionScopedVariable );
    else
    {
        sym.as( SymbolFlags.BlockScopedVariable );
        if ( node.kind === 'const' )
            sym.modifiers |= ModifierFlags.Const;
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
            if ( node.generator ) sym.transformFlags |= TransformFlags.Generator;
            if ( node.async ) sym.modifiers |= ModifierFlags.Async;
            if ( node.computed || node.key.computed )
                sym.as( SymbolFlags.Computed | SymbolFlags.Method );
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
    let sym, p = node.parent;

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
 */
function declaration( node, cb, optName )
{
    if ( node.type === Syntax.Identifier )
        return symbolTable.decl( optName || node.name, node.parent, cb.tags );

    console.log( `optName:`, optName );
    return symbolTable.decl( optName || node, node, cb.tags );
}

