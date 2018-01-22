/** ******************************************************************************************************************
 * @file Describe what doctags does.
 * @author Julian Jensen <jjdanois@gmail.com>
 * @since 1.0.0
 * @date 20-Jan-2018
 *********************************************************************************************************************/

"use strict";

import unassociated_tag from './doctags-unrelated';
import {SymbolTable} from "./symbols";
import { Syntax } from 'espree';

export let symbolTable;

/**
 * @param {Node} node
 * @param {Comments} comments
 */
function build_definition( node, comments )
{
    const { leading, trailing } = comments;

    if ( leading.length > 1 )
        leading.slice( 0, leading.length - 1 ).forEach( cb => unassociated_tag( node, cb ) );

    if ( trailing.length )
        trailing.forEach( cb => unassociated_tag( node, cb ) );

    if ( leading.length )
        create_symbol( node, leading[ leading.length - 1 ] );

}

/**
 * @param {BaseNode|VariableDeclaration|VariableDeclarator} node
 * @param {CommentBlock} cb
 */
function create_symbol( node, cb )
{
    switch ( node.type )
    {
        case Syntax.VariableDeclarator:
            declaration( node.id, cb );
            break;

        case Syntax.VariableDeclaration:
            node.declarations.forEach( decl => declaration( decl.id, cb ) );

    }
}

/**
 * @param {Identifier|Pattern} node
 * @param {CommentBlock} cb
 */
function declaration( node, cb )
{
    if ( node.type === Syntax.Identifier )
        symbolTable.decl( node.name, node.parent, cb.tags );
}

/**
 */
export function init()
{
    symbolTable = new SymbolTable();
}
