/** ******************************************************************************************************************
 * @file Describe what externs does.
 * @author Julian Jensen <jjdanois@gmail.com>
 * @since 1.0.0
 * @date 04-Mar-2018
 *********************************************************************************************************************/


"use strict";

import assert                       from "assert";
import { SymbolFlags }              from "../types";
import { get_ext_ref, set_ext_ref } from "../utils";

/**
 * Indicates that a symbol is an alias that does not merge with a local declaration.
 */
function isNonLocalAlias( symbol, excludes = SymbolFlags.Value | SymbolFlags.Type | SymbolFlags.Namespace )
{
    return symbol && ( symbol.flags & ( SymbolFlags.Alias | excludes ) ) === SymbolFlags.Alias;
}

/**
 * @param {Symbol} symbol
 * @param {boolean} [dontResolveAlias]
 * @return {Symbol}
 */
function resolveSymbol( symbol, dontResolveAlias )
{
    const shouldResolve = !dontResolveAlias && isNonLocalAlias( symbol );

    return shouldResolve ? resolveAlias( symbol ) : symbol;
}

function resolveAlias( symbol )
{
    assert( ( symbol.flags & SymbolFlags.Alias ) !== 0, "Should only get Alias here." );

    const
        resolvingSymbol = get_ext_ref( 'resolvingSymbol' ),
        unknownSymbol   = get_ext_ref( 'unknownSymbol' ),
        links           = symbol.getSymbolLinks();

    if ( !links.target )
    {
        links.target = resolvingSymbol;

        const node = symbol.getDeclarationOfAliasSymbol();

        assert( !!node );

        const target = getTargetOfAliasDeclaration( node );

        if ( links.target === resolvingSymbol )
            links.target = target || unknownSymbol;
    }
    else if ( links.target === resolvingSymbol )
        links.target = unknownSymbol;

    return links.target;
}

/**
 * @param {ImportEqualsDeclaration | ExportAssignment | ExportSpecifier} node
 */
function markExportAsReferenced( node )
{
    const
        symbol = getSymbolOfNode( node ),
        target = resolveAlias( symbol );

    if ( target )
    {
        const markAlias = target === get_ext_ref( 'unknownSymbol' ) ||
                          ( ( target.flags & SymbolFlags.Value ) && !isConstEnumOrConstEnumOnlyModule( target ) );

        if ( markAlias )
            markAliasSymbolAsReferenced( symbol );
    }
}

/**
 * When an alias symbol is referenced, we need to mark the entity it references as referenced and in turn repeat that until
 * we reach a non-alias or an exported entity (which is always considered referenced). We do this by checking the target of
 * the alias as an expression (which recursively takes us back here if the target references another alias).
 *
 * @param symbol
 */
function markAliasSymbolAsReferenced( symbol )
{
    const links = symbol.getSymbolLinks();

    if ( !links.referenced )
    {
        links.referenced = true;

        const node = getDeclarationOfAliasSymbol( symbol );

        assert( !!node );

        if ( node.kind === SyntaxKind.ExportAssignment )
        // export default <symbol>
            checkExpressionCached( node.expression );

        else if ( node.kind === SyntaxKind.ExportSpecifier )
        // export { <symbol> } or export { <symbol> as foo }
            checkExpressionCached( node.propertyName || node.name );

        else if ( isInternalModuleImportEqualsDeclaration( node ) )
        // import foo = <symbol>
            checkExpressionCached( node.moduleReference );
    }

}

/**
 * This function is only for imports with entity names
 *
 * @param {EntityName} entityName
 * @param {boolean} [dontResolveAlias]
 * @return {Symbol}
 */
function getSymbolOfPartOfRightHandSideOfImportEquals( entityName, dontResolveAlias )
{
    // There are three things we might try to look for. In the following examples,
    // the search term is enclosed in |...|:
    //
    //     import a = |b|; // Namespace
    //     import a = |b.c|; // Value, type, namespace
    //     import a = |b.c|.d; // Namespace
    if ( entityName.kind === SyntaxKind.Identifier && isRightSideOfQualifiedNameOrPropertyAccess( entityName ) )
        entityName = entityName.parent;

    // Check for case 1 and 3 in the above example
    if ( entityName.kind === SyntaxKind.Identifier || entityName.parent.kind === SyntaxKind.QualifiedName )
        return resolveEntityName( entityName, SymbolFlags.Namespace, /*ignoreErrors*/ false, dontResolveAlias );
    else
    {
        // Case 2 in above example
        // entityName.kind could be a QualifiedName or a Missing identifier
        assert( entityName.parent.kind === SyntaxKind.ImportEqualsDeclaration );
        return resolveEntityName( entityName, SymbolFlags.Value | SymbolFlags.Type | SymbolFlags.Namespace, /*ignoreErrors*/ false, dontResolveAlias );
    }
}


/**
 * @param {Symbol} symbol
 * @return {string}
 */
function getFullyQualifiedName( symbol )
{
    return symbol.parent ? getFullyQualifiedName( symbol.parent ) + "." + symbolToString( symbol ) : symbolToString( symbol );
}

/**
 * Resolves a qualified name and any involved aliases.
 *
 * @param {EntityNameOrEntityNameExpression} name
 * @param {SymbolFlags} meaning
 * @param {boolean} [dontResolveAlias]
 * @param {ts.Node} [location]
 * @return {?Symbol}
 */
function resolveEntityName( name, meaning, dontResolveAlias, location )
{
    if ( nodeIsMissing( name ) )
        return undefined;

    let symbol;
    if ( name.kind === SyntaxKind.Identifier )
    {
        const message = meaning === SymbolFlags.Namespace ? Diagnostics.Cannot_find_namespace_0 : Diagnostics.Cannot_find_name_0;

        symbol = resolveName( location || name, name.escapedText, meaning, name, /*isUse*/ true );
        if ( !symbol )
            return undefined;
    }
    else if ( name.kind === SyntaxKind.QualifiedName || name.kind === SyntaxKind.PropertyAccessExpression )
    {
        let left;

        if ( name.kind === SyntaxKind.QualifiedName )
        {
            left = name.left;
        }
        else if ( name.kind === SyntaxKind.PropertyAccessExpression &&
                  ( name.expression.kind === SyntaxKind.ParenthesizedExpression || isEntityNameExpression( name.expression ) ) )
        {
            left = name.expression;
        }
        else
        {
            // If the expression in property-access expression is not entity-name or parenthsizedExpression (e.g. it is a call expression), it won't be able to successfully resolve the name.
            // This is the case when we are trying to do any language service operation in heritage clauses. By return undefined, the getSymbolOfEntityNameOrPropertyAccessExpression
            // will attempt to checkPropertyAccessExpression to resolve symbol.
            // i.e class C extends foo()./*do language service operation here*/B {}
            return undefined;
        }
        const right   = name.kind === SyntaxKind.QualifiedName ? name.right : name.name;
        let namespace = resolveEntityName( left, SymbolFlags.Namespace, /*dontResolveAlias*/ false, location );
        if ( !namespace || nodeIsMissing( right ) )
            return undefined;
        else if ( namespace === unknownSymbol )
            return namespace;

        if ( isInJavaScriptFile( name ) && isDeclarationOfFunctionOrClassExpression( namespace ) )
        {
            namespace = getSymbolOfNode( namespace.valueDeclaration.initializer );
        }
        symbol = getSymbol( getExportsOfSymbol( namespace ), right.escapedText, meaning );
        if ( !symbol )
            return undefined;
    }
    else if ( name.kind === SyntaxKind.ParenthesizedExpression )
    {
        // If the expression in parenthesizedExpression is not an entity-name (e.g. it is a call expression), it won't be able to successfully resolve the name.
        // This is the case when we are trying to do any language service operation in heritage clauses.
        // By return undefined, the getSymbolOfEntityNameOrPropertyAccessExpression will attempt to checkPropertyAccessExpression to resolve symbol.
        // i.e class C extends foo()./*do language service operation here*/B {}
        return isEntityNameExpression( name.expression ) ?
               resolveEntityName( name.expression, meaning, dontResolveAlias, location ) :
               undefined;
    }
    else
    {
        Debug.assertNever( name, "Unknown entity name kind." );
    }
    Debug.assert( ( getCheckFlags( symbol ) & CheckFlags.Instantiated ) === 0, "Should never get an instantiated symbol here." );
    return ( symbol.flags & meaning ) || dontResolveAlias ? symbol : resolveAlias( symbol );
}

function resolveExternalModuleName( location, moduleReferenceExpression )
{
    return resolveExternalModuleNameWorker( location, moduleReferenceExpression );
}

function resolveExternalModuleNameWorker( location, moduleReferenceExpression, isForAugmentation = false )
{
    if ( moduleReferenceExpression.kind !== SyntaxKind.StringLiteral && moduleReferenceExpression.kind !== SyntaxKind.NoSubstitutionTemplateLiteral )
        return;


    const moduleReferenceLiteral = moduleReferenceExpression;
    return resolveExternalModule( location, moduleReferenceLiteral.text, moduleNotFoundError, moduleReferenceLiteral, isForAugmentation );
}

function resolveExternalModule( location, moduleReference, isForAugmentation = false )
{
    if ( moduleReference === undefined )
        return;

    const ambientModule = tryFindAmbientModule( moduleReference, /*withAugmentations*/ true );

    if ( ambientModule ) return ambientModule;

    const
        resolvedModule       = getResolvedModule( getSourceFileOfNode( location ), moduleReference ),
        resolutionDiagnostic = resolvedModule && getResolutionDiagnostic( compilerOptions, resolvedModule ),
        sourceFile           = resolvedModule && !resolutionDiagnostic && host.getSourceFile( resolvedModule.resolvedFileName );

    if ( sourceFile )
    {
        // merged symbol is module declaration symbol combined with all augmentations
        if ( sourceFile.symbol )
            return getMergedSymbol( sourceFile.symbol );

        return undefined;
    }

    if ( patternAmbientModules )
    {
        const pattern = findBestPatternMatch( patternAmbientModules, _ => _.pattern, moduleReference );
        if ( pattern )
            return pattern.symbol.getMergedSymbol();
    }
}

/**
 * An external module with an 'export =' declaration resolves to the target of the 'export =' declaration,
 * and an external module with no 'export =' declaration resolves to the module itself.
 *
 * @param {Symbol} moduleSymbol
 * @param {boolean} [dontResolveAlias]
 * @return {Symbol}
 */
function resolveExternalModuleSymbol( moduleSymbol, dontResolveAlias )
{
    return moduleSymbol && getMergedSymbol( resolveSymbol( moduleSymbol.exports.get( InternalSymbolName.ExportEquals ), dontResolveAlias ) ) || moduleSymbol;
}

/**
 * An external module with an 'export =' declaration may be referenced as an ES6 module provided the 'export ='
 * references a symbol that is at least declared as a module or a variable. The target of the 'export =' may
 * combine other declarations with the module or variable (e.g. a class/module, function/module, interface/variable).
 *
 * @param {Symbol} moduleSymbol
 * @param {Expression} moduleReferenceExpression
 * @param {boolean} dontResolveAlias
 * @return {Symbol}
 */
function resolveESModuleSymbol( moduleSymbol, moduleReferenceExpression, dontResolveAlias )
{
    const symbol = resolveExternalModuleSymbol( moduleSymbol, dontResolveAlias );

    if ( !dontResolveAlias && symbol )
    {
        if ( !( symbol.flags & ( SymbolFlags.Module | SymbolFlags.Variable ) ) )
            return symbol;

        const referenceParent = moduleReferenceExpression.parent;
        if ( ( isImportDeclaration( referenceParent ) && getNamespaceDeclarationNode( referenceParent ) ) || isImportCall( referenceParent ) )
        {
            const type = symbol.getType();
            let sigs   = type.getSignaturesOfStructuredType( SignatureKind.Call );
            if ( !sigs || !sigs.length )
                sigs = type.getSignaturesOfStructuredType( SignatureKind.Construct );

            if ( sigs && sigs.length )
            {
                const
                    moduleType = getTypeWithSyntheticDefaultImportType( type, symbol, moduleSymbol ),

                    // Create a new symbol which has the module's type less the call and construct signatures
                    result     = createSymbol( symbol.flags, symbol.escapedName );

                result.declarations      = symbol.declarations ? symbol.declarations.slice() : [];
                result.parent            = symbol.parent;
                result.target            = symbol;
                result.originatingImport = referenceParent;

                if ( symbol.valueDeclaration ) result.valueDeclaration = symbol.valueDeclaration;
                if ( symbol.constEnumOnlyModule ) result.constEnumOnlyModule = true;
                if ( symbol.members ) result.members = new Map( ...symbol.members );
                if ( symbol.exports ) result.exports = new Map( ...symbol.exports );
                const resolvedModuleType = resolveStructuredTypeMembers( moduleType ); // Should already be resolved from the signature checks above
                result.type              = createAnonymousType( result, resolvedModuleType.members, emptyArray, emptyArray, resolvedModuleType.stringIndexInfo, resolvedModuleType.numberIndexInfo );
                return result;
            }
        }
    }
    return symbol;
}

function getExportsOfModuleAsArray( moduleSymbol)
{
    return moduleSymbol.symbolsToArray();
}

/**
 * @param {Symbol} moduleSymbol
 */
function getExportsAndPropertiesOfModule( moduleSymbol )
{
    const
        exports      = moduleSymbol.symbolsToArray(),
        exportEquals = resolveExternalModuleSymbol( moduleSymbol );

    if ( exportEquals !== moduleSymbol )
        addRange( exports, exportEquals.getType().getPropertiesOfType( ) );

    return exports;
}

function tryGetMemberInModuleExports( memberName: __String, moduleSymbol: Symbol ): Symbol | undefined
{
    const symbolTable = getExportsOfModule( moduleSymbol );
    if ( symbolTable )
    {
        return symbolTable.get( memberName );
    }
}

function tryGetMemberInModuleExportsAndProperties( memberName: __String, moduleSymbol: Symbol ): Symbol | undefined
{
    const symbol = tryGetMemberInModuleExports( memberName, moduleSymbol );
    if ( symbol )
    {
        return symbol;
    }

    const exportEquals = resolveExternalModuleSymbol( moduleSymbol );
    if ( exportEquals === moduleSymbol )
    {
        return undefined;
    }

    const type = getTypeOfSymbol( exportEquals );
    return type.flags & TypeFlags.Primitive ? undefined : getPropertyOfType( type, memberName );
}

function getExportsOfSymbol( symbol: Symbol ): SymbolTable
{
    return symbol.flags & SymbolFlags.Class ? getResolvedMembersOrExportsOfSymbol( symbol, MembersOrExportsResolutionKind.resolvedExports ) :
           symbol.flags & SymbolFlags.Module ? getExportsOfModule( symbol ) :
           symbol.exports || emptySymbols;
}

function getExportsOfModule( moduleSymbol: Symbol ): SymbolTable
{
    const links = getSymbolLinks( moduleSymbol );
    return links.resolvedExports || ( links.resolvedExports = getExportsOfModuleWorker( moduleSymbol ) );
}

interface ExportCollisionTracker
{
    specifierText: string;
    exportsWithDuplicate: ExportDeclaration[];
}

type ExportCollisionTrackerTable = UnderscoreEscapedMap<ExportCollisionTracker>;

/**
 * Extends one symbol table with another while collecting information on name collisions for error message generation into the `lookupTable` argument
 * Not passing `lookupTable` and `exportNode` disables this collection, and just extends the tables
 */
function extendExportSymbols( target: SymbolTable, source: SymbolTable | undefined, lookupTable?: ExportCollisionTrackerTable, exportNode?: ExportDeclaration )
{
    if ( !source ) return;
    source.forEach( ( sourceSymbol, id ) => {
        if ( id === InternalSymbolName.Default ) return;

        const targetSymbol = target.get( id );
        if ( !targetSymbol )
        {
            target.set( id, sourceSymbol );
            if ( lookupTable && exportNode )
            {
                lookupTable.set( id, {
                    specifierText: getTextOfNode( exportNode.moduleSpecifier )
                } as ExportCollisionTracker );
            }
        }
        else if ( lookupTable && exportNode && targetSymbol && resolveSymbol( targetSymbol ) !== resolveSymbol( sourceSymbol ) )
        {
            const collisionTracker = lookupTable.get( id );
            if ( !collisionTracker.exportsWithDuplicate )
            {
                collisionTracker.exportsWithDuplicate = [ exportNode ];
            }
            else
            {
                collisionTracker.exportsWithDuplicate.push( exportNode );
            }
        }
    } );
}
