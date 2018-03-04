/** ****************************************************************************************************
 * File: type-from-node (jsdoc-tag-parser)
 * @author julian on 3/3/18
 * @version 1.0.0
 * @copyright Planet3, Inc.
 *******************************************************************************************************/


'use strict';

import { SyntaxKind } from "../ts/ts-helpers";
import { NodeFlags }   from "../types";

/**
 *
 * @param {TypeNode} node
 * @return {Type}
 */
export function getTypeFromTypeNode( node ) {
    switch (node.kind) {
        case SyntaxKind.AnyKeyword:
        case SyntaxKind.JSDocAllType:
        case SyntaxKind.JSDocUnknownType:
            return anyType;
        case SyntaxKind.StringKeyword:
            return stringType;
        case SyntaxKind.NumberKeyword:
            return numberType;
        case SyntaxKind.BooleanKeyword:
            return booleanType;
        case SyntaxKind.SymbolKeyword:
            return esSymbolType;
        case SyntaxKind.VoidKeyword:
            return voidType;
        case SyntaxKind.UndefinedKeyword:
            return undefinedType;
        case SyntaxKind.NullKeyword:
            return nullType;
        case SyntaxKind.NeverKeyword:
            return neverType;
        case SyntaxKind.ObjectKeyword:
            return node.flags & NodeFlags.JavaScriptFile ? anyType : nonPrimitiveType;
        case SyntaxKind.ThisType:
        case SyntaxKind.ThisKeyword:
            return getTypeFromThisTypeNode(node as ThisExpression | ThisTypeNode);
        case SyntaxKind.LiteralType:
            return getTypeFromLiteralTypeNode(<LiteralTypeNode>node);
        case SyntaxKind.TypeReference:
            return getTypeFromTypeReference(<TypeReferenceNode>node);
        case SyntaxKind.TypePredicate:
            return booleanType;
        case SyntaxKind.ExpressionWithTypeArguments:
            return getTypeFromTypeReference(<ExpressionWithTypeArguments>node);
        case SyntaxKind.TypeQuery:
            return getTypeFromTypeQueryNode(<TypeQueryNode>node);
        case SyntaxKind.ArrayType:
            return getTypeFromArrayTypeNode(<ArrayTypeNode>node);
        case SyntaxKind.TupleType:
            return getTypeFromTupleTypeNode(<TupleTypeNode>node);
        case SyntaxKind.UnionType:
            return getTypeFromUnionTypeNode(<UnionTypeNode>node);
        case SyntaxKind.IntersectionType:
            return getTypeFromIntersectionTypeNode(<IntersectionTypeNode>node);
        case SyntaxKind.JSDocNullableType:
            return getTypeFromJSDocNullableTypeNode(<JSDocNullableType>node);
        case SyntaxKind.ParenthesizedType:
        case SyntaxKind.JSDocNonNullableType:
        case SyntaxKind.JSDocOptionalType:
        case SyntaxKind.JSDocTypeExpression:
            return getTypeFromTypeNode((<ParenthesizedTypeNode | JSDocTypeReferencingNode | JSDocTypeExpression>node).type);
        case SyntaxKind.JSDocVariadicType:
            return getTypeFromJSDocVariadicType(node as JSDocVariadicType);
        case SyntaxKind.FunctionType:
        case SyntaxKind.ConstructorType:
        case SyntaxKind.TypeLiteral:
        case SyntaxKind.JSDocTypeLiteral:
        case SyntaxKind.JSDocFunctionType:
            return getTypeFromTypeLiteralOrFunctionOrConstructorTypeNode(node);
        case SyntaxKind.TypeOperator:
            return getTypeFromTypeOperatorNode(<TypeOperatorNode>node);
        case SyntaxKind.IndexedAccessType:
            return getTypeFromIndexedAccessTypeNode(<IndexedAccessTypeNode>node);
        case SyntaxKind.MappedType:
            return getTypeFromMappedTypeNode(<MappedTypeNode>node);
        case SyntaxKind.ConditionalType:
            return getTypeFromConditionalTypeNode(<ConditionalTypeNode>node);
        case SyntaxKind.InferType:
            return getTypeFromInferTypeNode(<InferTypeNode>node);
        // This function assumes that an identifier or qualified name is a type expression
        // Callers should first ensure this by calling isTypeNode
        case SyntaxKind.Identifier:
        case SyntaxKind.QualifiedName:
            const symbol = getSymbolAtLocation(node);
            return symbol && getDeclaredTypeOfSymbol(symbol);
        default:
            return unknownType;
    }
}

/**
 *
 * @param {number|string} value
 * @param {number} [enumId]
 * @param {?Symbol} [symbol]
 */
export function getLiteralType( value, enumId, symbol )
{
    // We store all literal types in a single map with keys of the form '#NNN' and '@SSS',
    // where NNN is the text representation of a numeric literal and SSS are the characters
    // of a string literal. For literal enum members we use 'EEE#NNN' and 'EEE@SSS', where
    // EEE is a unique id for the containing enum type.
    const
        qualifier = typeof value === "number" ? "#" : "@",
        key = enumId ? enumId + qualifier + value : qualifier + value;

    let type = literalTypes.get( key );

    if (!type)
    {
        const flags = ( typeof value === "number" ? TypeFlags.NumberLiteral : TypeFlags.StringLiteral ) | ( enumId ? TypeFlags.EnumLiteral : 0 );
        literalTypes.set( key, type = new LiteralType(flags, value, symbol));
    }

    return type;
}

/**
 * @param {LiteralTypeNode} node
 * @return {Type}
 */
function getTypeFromLiteralTypeNode( node )
{
    const links = getNodeLinks(node);

    if (!links.resolvedType)
        links.resolvedType = checkExpression(node.literal).getRegularType();

    return links.resolvedType;
}

