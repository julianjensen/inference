/** ******************************************************************************************************************
 * @file Describe what modifiers does.
 * @author Julian Jensen <jjdanois@gmail.com>
 * @since 1.0.0
 * @date 04-Mar-2018
 *********************************************************************************************************************/


"use strict";

import { ModifierFlags, NodeFlags } from "../types";
import { SyntaxKind }                from "../ts/ts-helpers";

/**
 * @param {ts.Node} node
 * @return {boolean}
 */
export function hasModifiers( node )
{
    return getModifierFlags( node ) !== ModifierFlags.None;
}

/**
 * @param {ts.Node} node
 * @param {ModifierFlags} flags
 * @return {boolean}
 */
export function hasModifier( node, flags )
{
    return !!getSelectedModifierFlags( node, flags );
}

/**
 * @param {ts.Node} node
 * @return {boolean}
 */
export function hasStaticModifier( node )
{
    return hasModifier( node, ModifierFlags.Static );
}

/**
 * @param {ts.Node} node
 * @return {boolean}
 */
export function hasReadonlyModifier( node )
{
    return hasModifier( node, ModifierFlags.Readonly );
}

/**
 * @param {ts.Node} node
 * @param {ModifierFlags} flags
 * @return {ModifierFlags}
 */
export function getSelectedModifierFlags( node, flags )
{
    return ModifierFlags( getModifierFlags( node ) & flags );
}

/**
 * @param {ts.Node} node
 * @return {ModifierFlags}
 */
export function getModifierFlags( node )
{
    if ( node.modifierFlagsCache & ModifierFlags.HasComputedFlags )
        return ModifierFlags( node.modifierFlagsCache & ~ModifierFlags.HasComputedFlags );

    const flags = getModifierFlagsNoCache( node );

    node.modifierFlagsCache = flags() | ModifierFlags.HasComputedFlags;

    return ModifierFlags( flags );
}

/**
 * @param {ts.Node|ts.Identifier} node
 * @return {ModifierFlags}
 */
export function getModifierFlagsNoCache( node )
{

    let flags = ModifierFlags.None;

    if ( node.modifiers )
    {
        for ( const modifier of node.modifiers )
            flags |= modifierToFlag( modifier.kind );
    }

    if ( node.flags & NodeFlags.NestedNamespace || ( node.kind === SyntaxKind.Identifier && node.isInJSDocNamespace ) )
        flags |= ModifierFlags.Export;

    return ModifierFlags( flags );
}

/**
 * @param {SyntaxKind} token
 * @return {ModifierFlags}
 */
export function modifierToFlag( token )
{
    switch ( token )
    {
        case SyntaxKind.StaticKeyword: return ModifierFlags.Static;
        case SyntaxKind.PublicKeyword: return ModifierFlags.Public;
        case SyntaxKind.ProtectedKeyword: return ModifierFlags.Protected;
        case SyntaxKind.PrivateKeyword: return ModifierFlags.Private;
        case SyntaxKind.AbstractKeyword: return ModifierFlags.Abstract;
        case SyntaxKind.ExportKeyword: return ModifierFlags.Export;
        case SyntaxKind.DeclareKeyword: return ModifierFlags.Ambient;
        case SyntaxKind.ConstKeyword: return ModifierFlags.Const;
        case SyntaxKind.DefaultKeyword: return ModifierFlags.Default;
        case SyntaxKind.AsyncKeyword: return ModifierFlags.Async;
        case SyntaxKind.ReadonlyKeyword: return ModifierFlags.Readonly;
    }

    return ModifierFlags.None;
}

