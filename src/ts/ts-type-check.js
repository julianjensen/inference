/** ******************************************************************************************************************
 * @file Describe what ts-type-check does.
 * @author Julian Jensen <jjdanois@gmail.com>
 * @since 1.0.0
 * @date 17-Mar-2018
 *********************************************************************************************************************/


"use strict";

import assert         from "assert";
import { SyntaxKind } from "./ts-helpers";
import {
    contains, findAncestor,
    some
}                     from "../symbols/array-ish";
import {
    TypeFlags,
    UnionReduction,
    ObjectFlags
}                     from "../types";
import {
    UnionType,
    IntersectionType
}                     from "../symbols/type";

export function isPartOfTypeNode( node )
{
    if ( SyntaxKind.FirstTypeNode <= node.kind && node.kind <= SyntaxKind.LastTypeNode )
    {
        return true;
    }

    switch ( node.kind )
    {
        case SyntaxKind.AnyKeyword:
        case SyntaxKind.NumberKeyword:
        case SyntaxKind.StringKeyword:
        case SyntaxKind.BooleanKeyword:
        case SyntaxKind.SymbolKeyword:
        case SyntaxKind.UndefinedKeyword:
        case SyntaxKind.NeverKeyword:
            return true;
        case SyntaxKind.VoidKeyword:
            return node.parent.kind !== SyntaxKind.VoidExpression;
        case SyntaxKind.ExpressionWithTypeArguments:
            return !isExpressionWithTypeArgumentsInClassExtendsClause( node );
        case SyntaxKind.TypeParameter:
            return node.parent.kind === SyntaxKind.MappedType || node.parent.kind === SyntaxKind.InferType;

        // Identifiers and qualified names may be type nodes, depending on their context. Climb
        // above them to find the lowest container
        case SyntaxKind.Identifier:
            // If the identifier is the RHS of a qualified name, then it's a type iff its parent is.
            if ( node.parent.kind === SyntaxKind.QualifiedName && node.parent.right === node )
            {
                node = node.parent;
            }
            else if ( node.parent.kind === SyntaxKind.PropertyAccessExpression && node.parent.name === node )
            {
                node = node.parent;
            }
            // At this point, node is either a qualified name or an identifier
            assert( node.kind === SyntaxKind.Identifier || node.kind === SyntaxKind.QualifiedName || node.kind === SyntaxKind.PropertyAccessExpression,
                "'node' was expected to be a qualified name, identifier or property access in 'isPartOfTypeNode'." );
        // falls through
        case SyntaxKind.QualifiedName:
        case SyntaxKind.PropertyAccessExpression:
        case SyntaxKind.ThisKeyword:
            const parent = node.parent;
            if ( parent.kind === SyntaxKind.TypeQuery )
                return false;
            // Do not recursively call isPartOfTypeNode on the parent. In the example:
            //
            //     let a: A.B.C;
            //
            // Calling isPartOfTypeNode would consider the qualified name A.B a type node.
            // Only C and A.B.C are type nodes.
            if ( SyntaxKind.FirstTypeNode <= parent.kind && parent.kind <= SyntaxKind.LastTypeNode )
                return true;
            switch ( parent.kind )
            {
                case SyntaxKind.ExpressionWithTypeArguments:
                    return !isExpressionWithTypeArgumentsInClassExtendsClause( parent );
                case SyntaxKind.TypeParameter:
                    return node === parent.constraint;
                case SyntaxKind.PropertyDeclaration:
                case SyntaxKind.PropertySignature:
                case SyntaxKind.Parameter:
                case SyntaxKind.VariableDeclaration:
                    return node === parent.type;
                case SyntaxKind.FunctionDeclaration:
                case SyntaxKind.FunctionExpression:
                case SyntaxKind.ArrowFunction:
                case SyntaxKind.Constructor:
                case SyntaxKind.MethodDeclaration:
                case SyntaxKind.MethodSignature:
                case SyntaxKind.GetAccessor:
                case SyntaxKind.SetAccessor:
                    return node === parent.type;
                case SyntaxKind.CallSignature:
                case SyntaxKind.ConstructSignature:
                case SyntaxKind.IndexSignature:
                    return node === parent.type;
                case SyntaxKind.TypeAssertionExpression:
                    return node === parent.type;
                case SyntaxKind.CallExpression:
                case SyntaxKind.NewExpression:
                    return contains( parent.typeArguments, node );
                case SyntaxKind.TaggedTemplateExpression:
                    // TODO (drosen): TaggedTemplateExpressions may eventually support type arguments.
                    return false;
            }
    }

    return false;
}

export function isExpressionWithTypeArgumentsInClassExtendsClause( node )
{
    return tryGetClassExtendingExpressionWithTypeArguments( node ) !== undefined;
}

/** Get `C` given `N` if `N` is in the position `class C extends N` where `N` is an ExpressionWithTypeArguments. */
export function tryGetClassExtendingExpressionWithTypeArguments( node )
{
    if ( node.kind === SyntaxKind.ExpressionWithTypeArguments &&
         node.parent.token === SyntaxKind.ExtendsKeyword &&
         isClassLike( node.parent.parent ) )
    {
        return node.parent.parent;
    }
}

function getTypeFromThisTypeNode( node )
{
    const links = getNodeLinks( node );
    if ( !links.resolvedType )
        links.resolvedType = getThisType( node );
    return links.resolvedType;
}

function getTypeFromTypeNode( node )
{
    switch ( node.kind )
    {
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
            return getTypeFromThisTypeNode( node );

        case SyntaxKind.LiteralType:
            return getTypeFromLiteralTypeNode( node );

        case SyntaxKind.TypeReference:
            return getTypeFromTypeReference( node );

        case SyntaxKind.TypePredicate:
            return booleanType;

        case SyntaxKind.ExpressionWithTypeArguments:
            return getTypeFromTypeReference( node );

        case SyntaxKind.TypeQuery:
            return getTypeFromTypeQueryNode( node );

        case SyntaxKind.ArrayType:
            return getTypeFromArrayTypeNode( node );

        case SyntaxKind.TupleType:
            return getTypeFromTupleTypeNode( node );

        case SyntaxKind.UnionType:
            return getTypeFromUnionTypeNode( node );

        case SyntaxKind.IntersectionType:
            return getTypeFromIntersectionTypeNode( node );

        case SyntaxKind.JSDocNullableType:
            return getTypeFromJSDocNullableTypeNode( node );

        case SyntaxKind.JSDocOptionalType:
            return addOptionality( getTypeFromTypeNode( node.type ) );

        case SyntaxKind.ParenthesizedType:
        case SyntaxKind.JSDocNonNullableType:
        case SyntaxKind.JSDocTypeExpression:
            return getTypeFromTypeNode( node.type );

        case SyntaxKind.JSDocVariadicType:
            return getTypeFromJSDocVariadicType( node );

        case SyntaxKind.FunctionType:
        case SyntaxKind.ConstructorType:
        case SyntaxKind.TypeLiteral:
        case SyntaxKind.JSDocTypeLiteral:
        case SyntaxKind.JSDocFunctionType:
            return getTypeFromTypeLiteralOrFunctionOrConstructorTypeNode( node );

        case SyntaxKind.TypeOperator:
            return getTypeFromTypeOperatorNode( node );

        case SyntaxKind.IndexedAccessType:
            return getTypeFromIndexedAccessTypeNode( node );

        case SyntaxKind.MappedType:
            return getTypeFromMappedTypeNode( node );

        case SyntaxKind.ConditionalType:
            return getTypeFromConditionalTypeNode( node );

        case SyntaxKind.InferType:
            return getTypeFromInferTypeNode( node );

        // This function assumes that an identifier or qualified name is a type expression
        // Callers should first ensure this by calling isTypeNode
        case SyntaxKind.Identifier:
        case SyntaxKind.QualifiedName:
            const symbol = getSymbolAtLocation( node );
            return symbol && getDeclaredTypeOfSymbol( symbol );

        default:
            return unknownType;
    }
}

function getTypeFromLiteralTypeNode( node )
{
    const links = getNodeLinks( node );

    if ( !links.resolvedType )
        links.resolvedType = getRegularTypeOfLiteralType( checkExpression( node.literal ) );

    return links.resolvedType;
}

function getRegularTypeOfLiteralType( type )
{
    return type.flags & TypeFlags.StringOrNumberLiteral && type.flags & TypeFlags.FreshLiteral ? type.regularType : type;
}

function getNodeLinks( node )
{
    const nodeId = getNodeId( node );
    return nodeLinks[ nodeId ] || ( nodeLinks[ nodeId ] = { flags: 0 } );
}

function getTypeFromTypeReference( node )
{
    const links = getNodeLinks( node );
    if ( !links.resolvedType )
    {
        let symbol,
            type,
            meaning = SymbolFlags.Type;

        if ( isJSDocTypeReference( node ) )
        {
            type = getIntendedTypeFromJSDocTypeReference( node );
            meaning |= SymbolFlags.Value;
        }

        if ( !type )
        {
            symbol = resolveTypeReferenceName( getTypeReferenceName( node ), meaning );
            type   = getTypeReferenceType( node, symbol );
        }
        // Cache both the resolved symbol and the resolved type. The resolved symbol is needed in when we check the
        // type reference in checkTypeReferenceNode.
        links.resolvedSymbol = symbol;
        links.resolvedType   = type;
    }
    return links.resolvedType;
}

function getTypeFromTypeQueryNode( node )
{
    const links = getNodeLinks( node );

    if ( !links.resolvedType )
    {
        // TypeScript 1.0 spec (April 2014): 3.6.3
        // The expression is processed as an identifier expression (section 4.3)
        // or property access expression(section 4.10),
        // the widened type(section 3.9) of which becomes the result.
        links.resolvedType = getWidenedType( checkExpression( node.exprName ) );
    }

    return links.resolvedType;
}

function getWidenedType( type: Type )
{
    return getWidenedTypeWithContext( type, /*context*/ undefined );
}

function getWidenedTypeWithContext( type, context )
{
    if ( type.flags & TypeFlags.RequiresWidening )
    {
        if ( type.flags & TypeFlags.Nullable )
            return anyType;

        if ( isObjectLiteralType( type ) )
            return getWidenedTypeOfObjectLiteral( type, context );

        if ( type.flags & TypeFlags.Union )
        {
            const unionContext = context || createWideningContext( /* parent */ undefined, /* propertyName */ undefined, type.types );
            const widenedTypes = sameMap( type.types, t => t.flags & TypeFlags.Nullable ? t : getWidenedTypeWithContext( t, unionContext ) );
            // Widening an empty object literal transitions from a highly restrictive type to
            // a highly inclusive one. For that reason we perform subtype reduction here if the
            // union includes empty object types (e.g. reducing {} | string to just {}).
            return getUnionType( widenedTypes, some( widenedTypes, isEmptyObjectType ) ? UnionReduction.Subtype : UnionReduction.Literal );
        }

        if ( isArrayType( type ) || isTupleType( type ) )
            return createTypeReference( type.target, sameMap( type.typeArguments, getWidenedType ) );
    }

    return type;
}

function createArrayType( elementType )
{
    return createTypeFromGenericGlobalType( globalArrayType, [ elementType ] );
}

function getTypeFromArrayTypeNode( node )
{
    const links = getNodeLinks( node );

    if ( !links.resolvedType )
        links.resolvedType = createArrayType( getTypeFromTypeNode( node.elementType ) );

    return links.resolvedType;
}

function createTupleType( elementTypes )
{
    return createTypeReference( getTupleTypeOfArity( elementTypes.length ), elementTypes );
}

function getTypeFromTupleTypeNode( node )
{
    const links = getNodeLinks( node );

    if ( !links.resolvedType )
        links.resolvedType = createTupleType( map( node.elementTypes, getTypeFromTypeNode ) );

    return links.resolvedType;
}

function getTypeFromUnionTypeNode( node )
{
    const links = getNodeLinks( node );

    if ( !links.resolvedType )
        links.resolvedType = UnionType.getUnionType( map( node.types, getTypeFromTypeNode ), UnionReduction.Literal, getAliasSymbolForTypeNode( node ), getAliasTypeArgumentsForTypeNode( node ) );

    return links.resolvedType;
}

function isJSDocTypeReference( node )
{
    return node.flags & NodeFlags.JSDoc && node.kind === SyntaxKind.TypeReference;
}

function checkNoTypeArguments( node, symbol )
{
    if ( node.typeArguments )
    {
        error( node, Diagnostics.Type_0_is_not_generic, symbol ? symbolToString( symbol ) : declarationNameToString( node.typeName ) );
        return false;
    }

    return true;
}

function getIntendedTypeFromJSDocTypeReference( node )
{
    if ( isIdentifier( node.typeName ) )
    {
        const typeArgs = node.typeArguments;
        switch ( node.typeName.escapedText )
        {
            case "String":
                checkNoTypeArguments( node );
                return stringType;
            case "Number":
                checkNoTypeArguments( node );
                return numberType;
            case "Boolean":
                checkNoTypeArguments( node );
                return booleanType;
            case "Void":
                checkNoTypeArguments( node );
                return voidType;
            case "Undefined":
                checkNoTypeArguments( node );
                return undefinedType;
            case "Null":
                checkNoTypeArguments( node );
                return nullType;
            case "Function":
            case "function":
                checkNoTypeArguments( node );
                return globalFunctionType;
            case "Array":
            case "array":
                return !typeArgs || !typeArgs.length ? anyArrayType : undefined;
            case "Promise":
            case "promise":
                return !typeArgs || !typeArgs.length ? createPromiseType( anyType ) : undefined;
            case "Object":
                if ( typeArgs && typeArgs.length === 2 )
                {
                    if ( isJSDocIndexSignature( node ) )
                    {
                        const indexed = getTypeFromTypeNode( typeArgs[ 0 ] );
                        const target  = getTypeFromTypeNode( typeArgs[ 1 ] );
                        const index   = createIndexInfo( target, /*isReadonly*/ false );
                        return createAnonymousType( undefined, emptySymbols, emptyArray, emptyArray, indexed === stringType && index, indexed === numberType && index );
                    }
                    return anyType;
                }
                checkNoTypeArguments( node );
                return anyType;
        }
    }
}

export function isJSDocIndexSignature( node )
{
    return isTypeReferenceNode( node ) &&
           isIdentifier( node.typeName ) &&
           node.typeName.escapedText === "Object" &&
           node.typeArguments && node.typeArguments.length === 2 &&
           ( node.typeArguments[ 0 ].kind === SyntaxKind.StringKeyword || node.typeArguments[ 0 ].kind === SyntaxKind.NumberKeyword );
}

function getTypeReferenceName( node: TypeReferenceType ): EntityNameOrEntityNameExpression | undefined
{
    switch ( node.kind )
    {
        case SyntaxKind.TypeReference:
            return node.typeName;
        case SyntaxKind.ExpressionWithTypeArguments:
            // We only support expressions that are simple qualified names. For other
            // expressions this produces undefined.
            const expr = node.expression;
            if ( isEntityNameExpression( expr ) )
            {
                return expr;
            }
        // fall through;
    }

    return undefined;
}

function resolveTypeReferenceName( typeReferenceName: EntityNameExpression | EntityName, meaning: SymbolFlags )
{
    if ( !typeReferenceName )
    {
        return unknownSymbol;
    }

    return resolveEntityName( typeReferenceName, meaning ) || unknownSymbol;
}

function getTypeReferenceType( node, symbol )
{
    const typeArguments = typeArgumentsFromTypeReferenceNode( node ); // Do unconditionally so we mark type arguments as referenced.
    if ( symbol === unknownSymbol )
        return unknownType;


    const type = getTypeReferenceTypeWorker( node, symbol, typeArguments );

    if ( type )
        return type;


    // Get type from reference to named type that cannot be generic (enum or type parameter)
    const res = tryGetDeclaredTypeOfSymbol( symbol );

    if ( res )
    {
        return checkNoTypeArguments( node, symbol ) ?
               res.flags & TypeFlags.TypeParameter ? getConstrainedTypeParameter( res, node ) : res :
               unknownType;
    }

    if ( !( symbol.flags & SymbolFlags.Value && isJSDocTypeReference( node ) ) )
    {
        return unknownType;
    }

    // A jsdoc TypeReference may have resolved to a value (as opposed to a type). If
    // the symbol is a constructor function, return the inferred class type; otherwise,
    // the type of this reference is just the type of the value we resolved to.
    const assignedType  = getAssignedClassType( symbol );
    const valueType     = getTypeOfSymbol( symbol );
    const referenceType = valueType.symbol && !isInferredClassType( valueType ) && getTypeReferenceTypeWorker( node, valueType.symbol, typeArguments );
    if ( referenceType || assignedType )
    {
        return referenceType && assignedType ? getIntersectionType( [ assignedType, referenceType ] ) : referenceType || assignedType;
    }

    // Resolve the type reference as a Type for the purpose of reporting errors.
    resolveTypeReferenceName( getTypeReferenceName( node ), SymbolFlags.Type );
    return valueType;
}

function getTypeReferenceTypeWorker( node, symbol, typeArguments )
{
    if ( symbol.flags & ( SymbolFlags.Class | SymbolFlags.Interface ) )
        return getTypeFromClassOrInterfaceReference( node, symbol, typeArguments );

    if ( symbol.flags & SymbolFlags.TypeAlias )
        return getTypeFromTypeAliasReference( node, symbol, typeArguments );

    if ( symbol.flags & SymbolFlags.Function &&
         isJSDocTypeReference( node ) &&
         ( symbol.members || getJSDocClassTag( symbol.valueDeclaration ) ) )
        return getInferredClassType( symbol );
}

/**
 * Get type from type-reference that reference to class or interface
 */
function getTypeFromClassOrInterfaceReference( node, symbol, typeArgs )
{
    const type           = getDeclaredTypeOfSymbol( getMergedSymbol( symbol ) );
    const typeParameters = type.localTypeParameters;
    if ( typeParameters )
    {
        const numTypeArguments     = length( node.typeArguments );
        const minTypeArgumentCount = getMinTypeArgumentCount( typeParameters );
        const isJs                 = isInJavaScriptFile( node );
        const isJsImplicitAny      = !noImplicitAny && isJs;
        if ( !isJsImplicitAny && ( numTypeArguments < minTypeArgumentCount || numTypeArguments > typeParameters.length ) )
        {
            const missingAugmentsTag = isJs && node.parent.kind !== SyntaxKind.JSDocAugmentsTag;
            const diag               = minTypeArgumentCount === typeParameters.length
                                       ? missingAugmentsTag
                                         ? Diagnostics.Expected_0_type_arguments_provide_these_with_an_extends_tag
                                         : Diagnostics.Generic_type_0_requires_1_type_argument_s
                                       : missingAugmentsTag
                                         ? Diagnostics.Expected_0_1_type_arguments_provide_these_with_an_extends_tag
                                         : Diagnostics.Generic_type_0_requires_between_1_and_2_type_arguments;
            const typeStr            = typeToString( type, /* enclosingDeclaration */ undefined, TypeFormatFlags.WriteArrayAsGenericType );
            error( node, diag, typeStr, minTypeArgumentCount, typeParameters.length );
            if ( !isJs )
            {
                // TODO: Adopt same permissive behavior in TS as in JS to reduce follow-on editing experience failures (requires editing fillMissingTypeArguments)
                return unknownType;
            }
        }
        // In a type reference, the outer type parameters of the referenced class or interface are automatically
        // supplied as type arguments and the type reference only specifies arguments for the local type parameters
        // of the class or interface.
        const typeArguments = concatenate( type.outerTypeParameters, fillMissingTypeArguments( typeArgs, typeParameters, minTypeArgumentCount, isJs ) );
        return createTypeReference( type, typeArguments );
    }
    return checkNoTypeArguments( node, symbol ) ? type : unknownType;
}

/**
 * Gets the minimum number of type arguments needed to satisfy all non-optional type
 * parameters.
 */
function getMinTypeArgumentCount( typeParameters )
{
    let minTypeArgumentCount = 0;
    if ( typeParameters )
    {
        for ( let i = 0; i < typeParameters.length; i++ )
        {
            if ( !hasTypeParameterDefault( typeParameters[ i ] ) )
            {
                minTypeArgumentCount = i + 1;
            }
        }
    }
    return minTypeArgumentCount;
}

/**
 * Fill in default types for unsupplied type arguments. If `typeArguments` is undefined
 * when a default type is supplied, a new array will be created and returned.
 *
 * @param typeArguments The supplied type arguments.
 * @param typeParameters The requested type parameters.
 * @param minTypeArgumentCount The minimum number of required type arguments.
 */
function fillMissingTypeArguments( typeArguments: Type[] | undefined, typeParameters: TypeParameter[] | undefined, minTypeArgumentCount: number, isJavaScriptImplicitAny: boolean )
{
    const numTypeParameters = length( typeParameters );
    if ( numTypeParameters )
    {
        const numTypeArguments = length( typeArguments );
        if ( isJavaScriptImplicitAny || ( numTypeArguments >= minTypeArgumentCount && numTypeArguments <= numTypeParameters ) )
        {
            if ( !typeArguments )
            {
                typeArguments = [];
            }

            // Map an unsatisfied type parameter with a default type.
            // If a type parameter does not have a default type, or if the default type
            // is a forward reference, the empty object type is used.
            for ( let i = numTypeArguments; i < numTypeParameters; i++ )
            {
                typeArguments[ i ] = getDefaultTypeArgumentType( isJavaScriptImplicitAny );
            }
            for ( let i = numTypeArguments; i < numTypeParameters; i++ )
            {
                const mapper    = createTypeMapper( typeParameters, typeArguments );
                let defaultType = getDefaultFromTypeParameter( typeParameters[ i ] );
                if ( defaultType && isTypeIdenticalTo( defaultType, emptyObjectType ) && isJavaScriptImplicitAny )
                {
                    defaultType = anyType;
                }
                typeArguments[ i ] = defaultType ? instantiateType( defaultType, mapper ) : getDefaultTypeArgumentType( isJavaScriptImplicitAny );
            }
            typeArguments.length = typeParameters.length;
        }
    }
    return typeArguments;
}

/**
 * Gets the default type for a type parameter.
 *
 * If the type parameter is the result of an instantiation, this gets the instantiated
 * default type of its target. If the type parameter has no default type or the default is
 * circular, `undefined` is returned.
 */
function getDefaultFromTypeParameter( typeParameter )
{
    const defaultType = getResolvedTypeParameterDefault( typeParameter );
    return defaultType !== noConstraintType && defaultType !== circularConstraintType ? defaultType : undefined;
}

function hasNonCircularTypeParameterDefault( typeParameter )
{
    return getResolvedTypeParameterDefault( typeParameter ) !== circularConstraintType;
}

/**
 * Indicates whether the declaration of a typeParameter has a default type.
 */
function hasTypeParameterDefault( typeParameter )
{
    return !!( typeParameter.symbol && forEach( typeParameter.symbol.declarations, decl => isTypeParameterDeclaration( decl ) && decl.default ) );
}

function getResolvedTypeParameterDefault( typeParameter )
{
    if ( !typeParameter.default )
    {
        if ( typeParameter.target )
        {
            const targetDefault   = getResolvedTypeParameterDefault( typeParameter.target );
            typeParameter.default = targetDefault ? instantiateType( targetDefault, typeParameter.mapper );
        }
        else
        {
            // To block recursion, set the initial value to the resolvingDefaultType.
            typeParameter.default    = resolvingDefaultType;
            const defaultDeclaration = typeParameter.symbol && forEach( typeParameter.symbol.declarations, decl => isTypeParameterDeclaration( decl ) && decl.default );
            const defaultType        = defaultDeclaration ? getTypeFromTypeNode( defaultDeclaration ) : noConstraintType;
            if ( typeParameter.default === resolvingDefaultType )
            {
                // If we have not been called recursively, set the correct default type.
                typeParameter.default = defaultType;
            }
        }
    }
    else if ( typeParameter.default === resolvingDefaultType )
    {
        // If we are called recursively for this type parameter, mark the default as circular.
        typeParameter.default = circularConstraintType;
    }
    return typeParameter.default;
}

function instantiateType( type, mapper )
{
    if ( type && mapper && mapper !== identityMapper )
    {
        if ( type.flags & TypeFlags.TypeParameter )
        {
            return mapper( type );
        }
        if ( type.flags & TypeFlags.Object )
        {
            if ( type.objectFlags & ObjectFlags.Anonymous )
            {
                // If the anonymous type originates in a declaration of a function, method, class, or
                // interface, in an object type literal, or in an object literal expression, we may need
                // to instantiate the type because it might reference a type parameter.
                return type.symbol && type.symbol.flags & ( SymbolFlags.Function | SymbolFlags.Method | SymbolFlags.Class | SymbolFlags.TypeLiteral | SymbolFlags.ObjectLiteral ) && type.symbol.declarations ?
                       getAnonymousTypeInstantiation( type, mapper ) : type;
            }
            if ( type.objectFlags & ObjectFlags.Mapped )
            {
                return getAnonymousTypeInstantiation( type, mapper );
            }
            if ( type.objectFlags & ObjectFlags.Reference )
            {
                const typeArguments    = type.typeArguments;
                const newTypeArguments = instantiateTypes( typeArguments, mapper );
                return newTypeArguments !== typeArguments ? createTypeReference( type.target, newTypeArguments ) : type;
            }
        }
        if ( type.flags & TypeFlags.Union && !( type.flags & TypeFlags.Primitive ) )
        {
            const types    = ( type ).types;
            const newTypes = instantiateTypes( types, mapper );
            return newTypes !== types ? getUnionType( newTypes, UnionReduction.Literal, type.aliasSymbol, instantiateTypes( type.aliasTypeArguments, mapper ) ) : type;
        }
        if ( type.flags & TypeFlags.Intersection )
        {
            const types    = type.types;
            const newTypes = instantiateTypes( types, mapper );
            return newTypes !== types ? getIntersectionType( newTypes, type.aliasSymbol, instantiateTypes( type.aliasTypeArguments, mapper ) ) : type;
        }
        if ( type.flags & TypeFlags.Index )
        {
            return getIndexType( instantiateType( type.type, mapper ) );
        }
        if ( type.flags & TypeFlags.IndexedAccess )
        {
            return getIndexedAccessType( instantiateType( type.objectType, mapper ), instantiateType( type.indexType, mapper ) );
        }
        if ( type.flags & TypeFlags.Conditional )
        {
            return getConditionalTypeInstantiation( type, combineTypeMappers( type.mapper, mapper ) );
        }
        if ( type.flags & TypeFlags.Substitution )
        {
            return mapper( type.typeParameter );
        }
    }
    return type;
}

function getAnonymousTypeInstantiation( type, mapper )
{
    const target       = type.objectFlags & ObjectFlags.Instantiated ? type.target : type;
    const symbol       = target.symbol;
    const links        = getSymbolLinks( symbol );
    let typeParameters = links.outerTypeParameters;
    if ( !typeParameters )
    {
        // The first time an anonymous type is instantiated we compute and store a list of the type
        // parameters that are in scope (and therefore potentially referenced). For type literals that
        // aren't the right hand side of a generic type alias declaration we optimize by reducing the
        // set of type parameters to those that are possibly referenced in the literal.
        const declaration         = symbol.declarations[ 0 ];
        const outerTypeParameters = getOuterTypeParameters( declaration, /*includeThisTypes*/ true ) || emptyArray;
        typeParameters            = symbol.flags & SymbolFlags.TypeLiteral && !target.aliasTypeArguments ?
                                    filter( outerTypeParameters, tp => isTypeParameterPossiblyReferenced( tp, declaration ) ) :
                                    outerTypeParameters;
        links.outerTypeParameters = typeParameters;
        if ( typeParameters.length )
        {
            links.instantiations = new Map();
            links.instantiations.set( getTypeListId( typeParameters ), target );
        }
    }
    if ( typeParameters.length )
    {
        // We are instantiating an anonymous type that has one or more type parameters in scope. Apply the
        // mapper to the type parameters to produce the effective list of type arguments, and compute the
        // instantiation cache key from the type IDs of the type arguments.
        const combinedMapper = type.objectFlags & ObjectFlags.Instantiated ? combineTypeMappers( type.mapper, mapper ) : mapper;
        const typeArguments  = map( typeParameters, combinedMapper );
        const id             = getTypeListId( typeArguments );
        let result           = links.instantiations.get( id );
        if ( !result )
        {
            const newMapper = createTypeMapper( typeParameters, typeArguments );
            result          = target.objectFlags & ObjectFlags.Mapped ? instantiateMappedType( target, newMapper ) : instantiateAnonymousType( target, newMapper );
            links.instantiations.set( id, result );
        }
        return result;
    }
    return type;
}

function createTypeMapper( sources, targets )
{
    assert( targets === undefined || sources.length === targets.length );

    return sources.length === 1 ? makeUnaryTypeMapper( sources[ 0 ], targets ? targets[ 0 ] : anyType ) :
           sources.length === 2 ? makeBinaryTypeMapper( sources[ 0 ], targets ? targets[ 0 ] : anyType, sources[ 1 ], targets ? targets[ 1 ] : anyType ) :
           makeArrayTypeMapper( sources, targets );
}

function isTypeParameterPossiblyReferenced( tp, node )
{
    // If the type parameter doesn't have exactly one declaration, if there are invening statement blocks
    // between the node and the type parameter declaration, if the node contains actual references to the
    // type parameter, or if the node contains type queries, we consider the type parameter possibly referenced.
    if ( tp.symbol && tp.symbol.declarations && tp.symbol.declarations.length === 1 )
    {
        const container = tp.symbol.declarations[ 0 ].parent;
        if ( findAncestor( node, n => n.kind === SyntaxKind.Block ? "quit" : n === container ) )
            return forEachChild( node, containsReference );
    }

    return true;

    function containsReference( node )
    {
        switch ( node.kind )
        {
            case SyntaxKind.ThisType:
                return tp.isThisType;
            case SyntaxKind.Identifier:
                return !tp.isThisType && isPartOfTypeNode( node ) && getTypeFromTypeNode( node ) === tp;
            case SyntaxKind.TypeQuery:
                return true;
        }
        return forEachChild( node, containsReference );
    }
}

function instantiateMappedType( type, mapper )
{
    // Check if we have a homomorphic mapped type, i.e. a type of the form { [P in keyof T]: X } for some
    // type variable T. If so, the mapped type is distributive over a union type and when T is instantiated
    // to a union type A | B, we produce { [P in keyof A]: X } | { [P in keyof B]: X }. Furthermore, for
    // homomorphic mapped types we leave primitive types alone. For example, when T is instantiated to a
    // union type A | undefined, we produce { [P in keyof A]: X } | undefined.
    const constraintType = getConstraintTypeFromMappedType( type );

    if ( constraintType.flags & TypeFlags.Index )
    {
        const typeVariable = ( constraintType ).type;

        if ( typeVariable.flags & TypeFlags.TypeParameter )
        {
            const mappedTypeVariable = instantiateType( typeVariable, mapper );

            if ( typeVariable !== mappedTypeVariable )
            {
                return mapType( mappedTypeVariable, t => {
                    if ( isMappableType( t ) )
                        return instantiateAnonymousType( type, createReplacementMapper( typeVariable, t, mapper ) );

                    return t;
                } );
            }
        }
    }

    return instantiateAnonymousType( type, mapper );
}

function getTypeFromJSDocNullableTypeNode( node )
{
    const type = getTypeFromTypeNode( node.type );
    return strictNullChecks ? getNullableType( type, TypeFlags.Null ) : type;
}

function createIndexInfo( type, isReadonly, declaration )
{
    return {
        type,
        isReadonly,
        declaration
    };
}

function getTypeParameterFromMappedType( type )
{
    return type.typeParameter ||
           ( type.typeParameter = getDeclaredTypeOfTypeParameter( getSymbolOfNode( type.declaration.typeParameter ) ) );
}

function getConstraintTypeFromMappedType( type )
{
    return type.constraintType ||
           ( type.constraintType = instantiateType( getConstraintOfTypeParameter( getTypeParameterFromMappedType( type ) ), type.mapper || identityMapper ) || unknownType );
}

function getTemplateTypeFromMappedType( type )
{
    return type.templateType ||
           ( type.templateType = type.declaration.type ?
                                 instantiateType( addOptionality( getTypeFromTypeNode( type.declaration.type ), !!( getMappedTypeModifiers( type ) & MappedTypeModifiers.IncludeOptional ) ), type.mapper || identityMapper ) :
                                 unknownType );
}

function getDeclaredTypeOfTypeParameter( symbol )
{
    const links = getSymbolLinks( symbol );

    if ( !links.declaredType )
    {
        const type         = createType( TypeFlags.TypeParameter );
        type.symbol        = symbol;
        links.declaredType = type;
    }

    return links.declaredType;
}

function getTypeFromIndexedAccessTypeNode( node )
{
    const links = getNodeLinks( node );

    if ( !links.resolvedType )
        links.resolvedType = getIndexedAccessType( getTypeFromTypeNode( node.objectType ), getTypeFromTypeNode( node.indexType ), node );

    return links.resolvedType;
}
