/** ******************************************************************************************************************
 * @file Describe what jsdoc-things does.
 * @author Julian Jensen <jjdanois@gmail.com>
 * @since 1.0.0
 * @date 24-Feb-2018
 *********************************************************************************************************************/

"use strict";

import assert                                                                               from "assert";
import { flatMap, isDeclaration, isExpression, isIdentifier, isJSDoc, isJSDocParameterTag } from "./utils";
import { SyntaxKind }                                                                       from "./ts/ts-helpers";

/**
 * A JSDocTypedef tag has an _optional_ name field - if a name is not directly present, we should
 * attempt to draw the name from the node the declaration is on (as that declaration is what its' symbol
 * will be merged with)
 *
 * @param {JSDocTypedefTag} declaration
 * @returns {?Identifier}
 */
function nameForNamelessJSDocTypedef( declaration )
{
    const hostNode = declaration.parent.parent;

    if ( !hostNode ) return;

    // Covers classes, functions - any named declaration host node
    if ( isDeclaration( hostNode ) )
        return getDeclarationIdentifier( hostNode );

    // Covers remaining cases
    switch ( hostNode.kind )
    {
        case SyntaxKind.VariableStatement:
            if ( hostNode.declarationList && hostNode.declarationList.declarations[ 0 ] )
                return getDeclarationIdentifier( hostNode.declarationList.declarations[ 0 ] );
            break;

        case SyntaxKind.ExpressionStatement:
            const expr = hostNode.expression;

            switch ( expr.kind )
            {
                case SyntaxKind.PropertyAccessExpression:
                    return expr.name;

                case SyntaxKind.ElementAccessExpression:
                    const arg = expr.argumentExpression;
                    if ( isIdentifier( arg ) ) return arg;
            }
            break;

        case SyntaxKind.EndOfFileToken:
            break;

        case SyntaxKind.ParenthesizedExpression:
            return getDeclarationIdentifier( hostNode.expression );

        case SyntaxKind.LabeledStatement:
            if ( isDeclaration( hostNode.statement ) || isExpression( hostNode.statement ) )
                return getDeclarationIdentifier( hostNode.statement );
            break;

        default:
            assert( false, "Found typedef tag attached to node which it should not be!" );
    }

    return void 0;
}

/**
 * @param declaration
 * @return {*|Identifier}
 */
export function getNameOfJSDocTypedef(declaration )
{
    return declaration.name || nameForNamelessJSDocTypedef(declaration);
}

/**
 * @param {Declaration | Expression} node
 * @return {?Identifier}
 */
function getDeclarationIdentifier( node )
{
    const name = getNameOfDeclaration( node );
    return isIdentifier( name ) ? name : void 0;
}

/**
 * @param declaration
 * @return {*}
 */
export function getNameOfDeclaration( declaration )
{
    if ( !declaration ) return;

    switch ( declaration.kind )
    {
        case SyntaxKind.Identifier:
            return declaration;

        case SyntaxKind.JSDocPropertyTag:
        case SyntaxKind.JSDocParameterTag:
            const { name } = declaration;
            if ( name.kind === SyntaxKind.QualifiedName )
                return name.right;
            break;

        // case SyntaxKind.BinaryExpression:
        //     const expr = declaration;
        //
        //     switch ( getSpecialPropertyAssignmentKind( expr ) )
        //     {
        //         case SpecialPropertyAssignmentKind.ExportsProperty:
        //         case SpecialPropertyAssignmentKind.ThisProperty:
        //         case SpecialPropertyAssignmentKind.Property:
        //         case SpecialPropertyAssignmentKind.PrototypeProperty:
        //             return ( expr.left ).name;
        //     }
        //     return void 0;

        case SyntaxKind.JSDocTypedefTag:
            return getNameOfJSDocTypedef( declaration );

        case SyntaxKind.ExportAssignment:
        {
            const { expression } = declaration;
            return isIdentifier( expression ) ? expression : void 0;
        }
    }

    return declaration.name;
}

/**
 * Gets the JSDoc parameter tags for the node if present.
 *
 * @remarks Returns any JSDoc param tag that matches the provided
 * parameter, whether a param tag on a containing function
 * expression, or a param tag on a variable declaration whose
 * initializer is the containing function. The tags closest to the
 * node are returned first, so in the previous example, the param
 * tag on the containing function expression would be first.
 *
 * Does not return tags for binding patterns, because JSDoc matches
 * parameters by name and binding patterns do not have a name.
 */
export function getJSDocParameterTags( param )
{
    if ( param.name && isIdentifier( param.name ) )
    {
        const name = param.name.escapedText;

        return getJSDocTags( param.parent ).filter( tag => isJSDocParameterTag( tag ) && isIdentifier( tag.name ) && tag.name.escapedText === name );
    }

    // a binding pattern doesn't have a name, so it's not possible to match it a JSDoc parameter, which is identified by name
    return undefined;
}

/**
 * Return true if the node has JSDoc parameter tags.
 *
 * @remarks Includes parameter tags that are not directly on the node,
 * for example on a variable declaration whose initializer is a function expression.
 *
 * @param {FunctionLikeDeclaration | SignatureDeclaration} node
 */
export function hasJSDocParameterTags( node )
{
    return !!getFirstJSDocTag( node, SyntaxKind.JSDocParameterTag );
}

/** Gets the JSDoc augments tag for the node if present
 *
 * @param {Node} node
 * @returns {JSDocAugmentsTag | undefined}
 */
export function getJSDocAugmentsTag( node )
{
    return getFirstJSDocTag( node, SyntaxKind.JSDocAugmentsTag );
}

/** Gets the JSDoc class tag for the node if present
 *
 * @param {Node} node
 * @returns {JSDocClassTag | undefined}
 */
export function getJSDocClassTag( node )
{
    return getFirstJSDocTag( node, SyntaxKind.JSDocClassTag );
}

/** Gets the JSDoc return tag for the node if present
 *
 * @param {ts.Node} node
 * @returns {JSDocReturnTag | undefined}
 */
export function getJSDocReturnTag( node )
{
    return getFirstJSDocTag( node, SyntaxKind.JSDocReturnTag );
}

/** Gets the JSDoc template tag for the node if present
 *
 * @param {Node} node
 * @returns {JSDocTemplateTag | undefined}
 */
export function getJSDocTemplateTag( node )
{
    return getFirstJSDocTag( node, SyntaxKind.JSDocTemplateTag );
}

/** Gets the JSDoc type tag for the node if present and valid
 *
 * @param {Node} node
 * @returns {JSDocTypeTag | undefined}
 */
export function getJSDocTypeTag( node )
{
    // We should have already issued an error if there were multiple type jsdocs, so just use the first one.
    const tag = getFirstJSDocTag( node, SyntaxKind.JSDocTypeTag );

    if ( tag && tag.typeExpression && tag.typeExpression.type )
        return tag;

    return void 0;
}

/**
 * Gets the type node for the node if provided via JSDoc.
 *
 * @remarks The search includes any JSDoc param tag that relates
 * to the provided parameter, for example a type tag on the
 * parameter itself, or a param tag on a containing function
 * expression, or a param tag on a variable declaration whose
 * initializer is the containing function. The tags closest to the
 * node are examined first, so in the previous example, the type
 * tag directly on the node would be returned.
 *
 * @param {Node} node
 * @returns {TypeNode | undefined}
 */
export function getJSDocType( node )
{
    let tag = getFirstJSDocTag( node, SyntaxKind.JSDocTypeTag );

    if ( !tag && node.kind === SyntaxKind.Parameter )
    {
        const paramTags = getJSDocParameterTags( node );

        if ( paramTags )
            tag = paramTags.find( tag => !!tag.typeExpression );
    }

    return tag && tag.typeExpression && tag.typeExpression.type;
}

/**
 * Gets the return type node for the node if provided via JSDoc's return tag.
 *
 * @remarks `getJSDocReturnTag` just gets the whole JSDoc tag. This function
 * gets the type from inside the braces.
 *
 * @param {Node} node
 * @returns {TypeNode | undefined}
 */
export function getJSDocReturnType( node )
{
    const returnTag = getJSDocReturnTag( node );

    return returnTag && returnTag.typeExpression && returnTag.typeExpression.type;
}

/** Get all JSDoc tags related to a node, including those on parent nodes.
 *
 * @param {Node} node
 * @returns {ReadonlyArray<JSDocTag> | undefined}
 */
export function getJSDocTags( node )
{
    let tags = ( node ).jsDocCache;

    // If cache is 'null', that means we did the work of searching for JSDoc tags and came up with nothing.
    if ( tags === undefined )
        node.jsDocCache = tags = flatMap( getJSDocCommentsAndTags( node ), j => isJSDoc( j ) ? j.tags : j );

    return tags;
}

/**
 * Get the first JSDoc tag of a specified kind, or undefined if not present.
 *
 * @param {Node} node
 * @param {SyntaxKind} kind
 * @returns {JSDocTag | undefined}
 */
function getFirstJSDocTag( node, kind )
{
    const tags = getJSDocTags( node );

    return find( tags, doc => doc.kind === kind );
}

/** Gets all JSDoc tags of a specified kind, or undefined if not present.
 *
 *
 * @param {Node} node
 * @param {SyntaxKind} kind
 * @returns {ReadonlyArray<JSDocTag> | undefined}
 */
export function getAllJSDocTagsOfKind( node, kind )
{
    const tags = getJSDocTags( node );

    return filter( tags, doc => doc.kind === kind );
}
