/** ******************************************************************************************************************
 * @file Describe what expression does.
 * @author Julian Jensen <jjdanois@gmail.com>
 * @since 1.0.0
 * @date 04-Mar-2018
 *********************************************************************************************************************/



"use strict";

import { SyntaxKind }                    from "../ts/ts-helpers";
import { get_ext_ref, strictNullChecks } from "../utils";
import { TypeFlags }                     from "../types";

/**
 * Returns the type of an expression. Unlike checkExpression, this function is simply concerned
 * with computing the type and may not fully check all contained sub-expressions for errors.
 * A cache argument of true indicates that if the function performs a full type check, it is ok
 * to cache the result.
 *
 * @param {Expression} node
 * @param {boolean} [cache]
 */
function getTypeOfExpression( node, cache )
{
    // Optimize for the common case of a call to a function with a single non-generic call
    // signature where we can just fetch the return type without checking the arguments.
    if ( node.kind === SyntaxKind.CallExpression && node.expression.kind !== SyntaxKind.SuperKeyword && !isRequireCall( node, /*checkArgumentIsStringLiteral*/ true ) && !isSymbolOrSymbolForCall( node ) )
    {
        const
            funcType  = checkNonNullExpression( node.expression ),
            signature = getSingleCallSignature( funcType );

        if ( signature && !signature.typeParameters )
            return getReturnTypeOfSignature( signature );
    }
    // Otherwise simply call checkExpression. Ideally, the entire family of checkXXX functions
    // should have a parameter that indicates whether full error checking is required such that
    // we can perform the optimizations locally.
    return cache ? checkExpressionCached( node ) : checkExpression( node );
}

/**
 * Returns the type of an expression. Unlike checkExpression, this function is simply concerned
 * with computing the type and may not fully check all contained sub-expressions for errors.
 * It is intended for uses where you know there is no contextual type,
 * and requesting the contextual type might cause a circularity or other bad behaviour.
 * It sets the contextual type of the node to any before calling getTypeOfExpression.
 *
 * @param {Expression} node
 */
function getContextFreeTypeOfExpression( node )
{
    const saveContextualType = node.contextualType;
    node.contextualType      = anyType;
    const type               = getTypeOfExpression( node );
    node.contextualType      = saveContextualType;
    return type;
}

/**
 *
 * Checks an expression and returns its type. The contextualMapper parameter serves two purposes: When
 * contextualMapper is not undefined and not equal to the identityMapper function object it indicates that the
 * expression is being inferentially typed (section 4.15.2 in spec) and provides the type mapper to use in
 * conjunction with the generic contextual type. When contextualMapper is equal to the identityMapper function
 * object, it serves as an indicator that all contained function and arrow expressions should be considered to
 * have the wildcard function type; this form of type check is used during overload resolution to exclude
 * contextually typed function and arrow expressions in the initial phase.
 *
 * @param {Expression | QualifiedName} node
 * @param {?CheckMode} [checkMode]
 * @return {Type}
 */
function checkExpression( node, checkMode )
{
    let type;

    if ( node.kind === SyntaxKind.QualifiedName )
    {
        type = checkQualifiedName( node );
    }
    else
    {
        const uninstantiatedType = checkExpressionWorker( node, checkMode );
        type                     = instantiateTypeWithSingleGenericCallSignature( node, uninstantiatedType, checkMode );
    }

    if ( isConstEnumObjectType( type ) )
    {
        // enum object type for const enums are only permitted in:
        // - 'left' in property access
        // - 'object' in indexed access
        // - target in rhs of import statement
        const ok =
                  ( node.parent.kind === SyntaxKind.PropertyAccessExpression && node.parent.expression === node ) ||
                  ( node.parent.kind === SyntaxKind.ElementAccessExpression && node.parent.expression === node ) ||
                  ( ( node.kind === SyntaxKind.Identifier || node.kind === SyntaxKind.QualifiedName ) && isInRightSideOfImportOrExportAssignment( node ) ||
                  ( node.parent.kind === SyntaxKind.TypeQuery && node.parent.exprName === node ) );

        if ( !ok )
        {
            error( node, Diagnostics.const_enums_can_only_be_used_in_property_or_index_access_expressions_or_the_right_hand_side_of_an_import_declaration_or_export_assignment_or_type_query );
        }
    }
    return type;
}

/**
 * param {ParenthesizedExpression} node
 * @param {?CheckMode} [checkMode]
 * @return {Type}
 */
function checkParenthesizedExpression( node, checkMode )
{
    const tag = isInJavaScriptFile( node ) ? getJSDocTypeTag( node ) : undefined;
    if ( tag )
        return checkAssertionWorker( tag, tag.typeExpression.type, node.expression, checkMode );

    return checkExpression( node.expression, checkMode );
}

/**
 * @param {Expression} node
 * @param {CheckMode} checkMode
 * @return {Type}
 */
function checkExpressionWorker( node, checkMode )
{
    switch ( node.kind )
    {
        case SyntaxKind.Identifier:
            return checkIdentifier( node );
        case SyntaxKind.ThisKeyword:
            return checkThisExpression( node );
        case SyntaxKind.SuperKeyword:
            return checkSuperExpression( node );
        case SyntaxKind.NullKeyword:
            return nullWideningType;
        case SyntaxKind.NoSubstitutionTemplateLiteral:
        case SyntaxKind.StringLiteral:
            return getFreshTypeOfLiteralType( getLiteralType( node.text ) );
        case SyntaxKind.NumericLiteral:
            checkGrammarNumericLiteral( node );
            return getFreshTypeOfLiteralType( getLiteralType( +node.text );
        case SyntaxKind.TrueKeyword:
            return trueType;
        case SyntaxKind.FalseKeyword:
            return falseType;
        case SyntaxKind.TemplateExpression:
            return checkTemplateExpression( node );
        case SyntaxKind.RegularExpressionLiteral:
            return globalRegExpType;
        case SyntaxKind.ArrayLiteralExpression:
            return checkArrayLiteral( node, checkMode );
        case SyntaxKind.ObjectLiteralExpression:
            return checkObjectLiteral( node, checkMode );
        case SyntaxKind.PropertyAccessExpression:
            return checkPropertyAccessExpression( node );
        case SyntaxKind.ElementAccessExpression:
            return checkIndexedAccess( node );
        case SyntaxKind.CallExpression:
            if ( node.expression.kind === SyntaxKind.ImportKeyword )
                return checkImportCallExpression( node );

        /* falls through */
        case SyntaxKind.NewExpression:
            return checkCallExpression( node );
        case SyntaxKind.TaggedTemplateExpression:
            return checkTaggedTemplateExpression( node );
        case SyntaxKind.ParenthesizedExpression:
            return checkParenthesizedExpression( node, checkMode );
        case SyntaxKind.ClassExpression:
            return checkClassExpression( node );
        case SyntaxKind.FunctionExpression:
        case SyntaxKind.ArrowFunction:
            return checkFunctionExpressionOrObjectLiteralMethod( node, checkMode );
        case SyntaxKind.TypeOfExpression:
            return checkTypeOfExpression( node );
        case SyntaxKind.TypeAssertionExpression:
        case SyntaxKind.AsExpression:
            return checkAssertion( node );
        case SyntaxKind.NonNullExpression:
            return checkNonNullAssertion( node );
        case SyntaxKind.MetaProperty:
            return checkMetaProperty( node );
        case SyntaxKind.DeleteExpression:
            return checkDeleteExpression( node );
        case SyntaxKind.VoidExpression:
            return checkVoidExpression( node );
        case SyntaxKind.AwaitExpression:
            return checkAwaitExpression( node );
        case SyntaxKind.PrefixUnaryExpression:
            return checkPrefixUnaryExpression( node );
        case SyntaxKind.PostfixUnaryExpression:
            return checkPostfixUnaryExpression( node );
        case SyntaxKind.BinaryExpression:
            return checkBinaryExpression( node, checkMode );
        case SyntaxKind.ConditionalExpression:
            return checkConditionalExpression( node, checkMode );
        case SyntaxKind.SpreadElement:
            return checkSpreadExpression( node, checkMode );
        case SyntaxKind.OmittedExpression:
            return undefinedWideningType;
        case SyntaxKind.YieldExpression:
            return checkYieldExpression( node );
        case SyntaxKind.JsxExpression:
            return checkJsxExpression( node, checkMode );
        case SyntaxKind.JsxElement:
            return checkJsxElement( node, checkMode );
        case SyntaxKind.JsxSelfClosingElement:
            return checkJsxSelfClosingElement( node, checkMode );
        case SyntaxKind.JsxFragment:
            return checkJsxFragment( node, checkMode );
        case SyntaxKind.JsxAttributes:
            return checkJsxAttributes( node, checkMode );
        case SyntaxKind.JsxOpeningElement:
            Debug.fail( "Shouldn't ever directly check a JsxOpeningElement" );
    }
    return unknownType;
}

/**
 * @param {Node} callExpression
 * @param {boolean} checkArgumentIsStringLiteral
 * @return {?CallExpression}
 */
export function isRequireCall( callExpression, checkArgumentIsStringLiteral )
{
    if ( callExpression.kind !== SyntaxKind.CallExpression )
        return false;

    const { expression, arguments: args } = callExpression;

    if ( expression.kind !== SyntaxKind.Identifier || expression.escapedText !== "require" )
        return false;

    if ( args.length !== 1 )
        return false;

    const arg = args[ 0 ];

    return !checkArgumentIsStringLiteral || arg.kind === SyntaxKind.StringLiteral || arg.kind === SyntaxKind.NoSubstitutionTemplateLiteral;
}

/**
 * @param {Node|CallExpression} node
 * @return {boolean}
 */
function isSymbolOrSymbolForCall( node )
{
    if ( node.kind !== SyntaxKind.CallExpression ) return false;

    let left = node.expression;

    if ( left.kind === SyntaxKind.PropertyAccessExpression && left.name.escapedText === "for" )
        left = left.expression;

    if ( left.kind !== SyntaxKind.Identifier || left.escapedText !== "Symbol" )
        return false;

    // make sure `Symbol` is the global symbol
    const globalESSymbol = getGlobalESSymbolConstructorSymbol();
    if ( !globalESSymbol )
        return false;

    return globalESSymbol === resolveName( left, "Symbol", SymbolFlags.Value, /*nameNotFoundMessage*/ undefined, /*nameArg*/ undefined, /*isUse*/ false );
}

/**
 * @param {Expression | QualifiedName} node
 * @return {Type}
 */
function checkNonNullExpression( node )
{
    return checkNonNullType( checkExpression( node ), node );
}

/**
 * @param {Type} type
 * @param {Node} node
 * @return {Type}
 */
function checkNonNullType( type, node )
{
    const kind = ( strictNullChecks ? getFalsyFlags( type ) : type.flags ) & TypeFlags.Nullable;

    if ( kind )
    {
        const t = getNonNullableType( type );
        return t.flags & ( TypeFlags.Nullable | TypeFlags.Never ) ? get_ext_ref( 'unknownType' ) : t;
    }

    return type;
}

/**
 * Add undefined or null or both to a type if they are missing.
 *
 * @param {Type} type - type to add undefined and/or null to if not present
 * @param {TypeFlags} flags - Either TypeFlags.Undefined or TypeFlags.Null, or both
 */
function getNullableType( type, flags )
{
    const
        missing       = ( flags & ~type.flags ) & ( TypeFlags.Undefined | TypeFlags.Null ),
        UnionType     = get_ext_ref( 'UnionType' ),
        undefinedType = get_ext_ref( 'undefinedType' ),
        nullType      = get_ext_ref( 'nullType' );

    return missing === 0 ? type :
           missing === TypeFlags.Undefined ? UnionType.getUnionType( [ type, undefinedType ] ) :
           missing === TypeFlags.Null ? UnionType.getUnionType( [ type, nullType ] ) :
           UnionType.getUnionType( [ type, undefinedType, nullType ] );
}

/**
 * @param {Type} type
 * @return {Type}
 */
function getOptionalType( type )
{
    return type.flags & TypeFlags.Undefined ? type : get_ext_ref( 'UnionType' ).getUnionType( [ type, get_ext_ref( 'undefinedType' ) ] );
}

/**
 * @param {Type} type
 * @return {Type}
 */
function getNonNullableType( type )
{
    return strictNullChecks ? getTypeWithFacts( type, TypeFacts.NEUndefinedOrNull ) : type;
}

/**
 * @param {Type} type
 * @param {TypeFacts} include
 * @return {Type}
 */
function getTypeWithFacts(type, include)
{
    if (type.flags & TypeFlags.IndexedAccess)
    {
        // TODO (weswig): This is a substitute for a lazy negated type to remove the types indicated by the TypeFacts from the (potential) union the IndexedAccess refers to
        //  - See discussion in https://github.com/Microsoft/TypeScript/pull/19275 for details, and test `strictNullNotNullIndexTypeShouldWork` for current behavior

        const baseConstraint = type.getBaseConstraint() || emptyObjectType;
        const result = filterType(baseConstraint, t => (getTypeFacts(t) & include) !== 0);
        if (result !== baseConstraint) {
            return result;
        }
        return type;
    }
    return filterType(type, t => (getTypeFacts(t) & include) !== 0);
}
