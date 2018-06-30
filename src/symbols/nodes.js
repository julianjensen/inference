/* eslint-disable max-params,max-lines */
/** ******************************************************************************************************************
 * @file Describe what nodes does.
 * @author Julian Jensen <jjdanois@gmail.com>
 * @since 1.0.0
 * @date 04-Mar-2018
 *********************************************************************************************************************/

"use strict";

const
    DEBUG = false,
    STACK = false,
    log   = ( ...args ) => DEBUG && console.log( ...args ),
    trace = ( ...args ) => STACK && log( ...args.concat( '\n' + new Error().stack.split( /\r?\n/ ).slice( 2 ).join( '\n' ) ) );

const createSymbolTable = () => new Map();

import path             from "path";
import { nameOf }       from "typeofs";
import { SyntaxKind }   from "../ts/ts-helpers";
import {
    InternalSymbolName,
    SpecialPropertyAssignmentKind,
    ModifierFlags,
    SymbolFlags,
    NodeFlags,
    ContainerFlags,
    ElementKind,
    ModuleInstanceState
}                       from "../types";
import { performance }  from "../utils/performance";
import assert           from "assert";
import { hasModifier }  from "./modifiers";
import {
    isAmbientModule,
    isGlobalScopeAugmentation,
    isTopLevelLogicalExpression,
    hasJSDocNodes, set_file,
    unescapeLeadingUnderscores,
    checkStrictModeIdentifier,
    checkStrictModeEvalOrArguments,
    hasDynamicName,
    getTextOfIdentifierOrLiteral,
    lookupSymbolForNameWorker,
    hide_parent,
    checkStrictModeNumericLiteral,
    set_strict_mode,
    get_strict_mode, skeys
} from "../utils";
import {
    getNameOfJSDocTypedef,
    isJSDocConstructSignature
}                       from "../jsdoc-things";
import { forEachChild } from "../ts/ts-ast-walker";
import { createSymbol } from "./symbol";

import {
    isClassLike,
    isExternalModule,
    isIdentifierName,
    isStringOrNumericLiteral,
    isWellKnownSymbolSyntactically,
    isIdentifier,
    isConst,
    isInJavaScriptFile,
    getSpecialPropertyAssignmentKind,
    getCombinedModifierFlags,
    getModuleInstanceState,
    isBindingPattern,
    isParameterPropertyDeclaration,
    isAccessor,
    isRequireCall,
    isBlockOrCatchScoped,
    isParameterDeclaration,
    isAsyncFunction,
    isOmittedExpression,
    isForInOrOfStatement,
    isPrologueDirective,
    isEmptyObjectLiteral,
    isExportsOrModuleExportsOrAlias,
    getEscapedTextOfIdentifierOrLiteral,
    isObjectLiteralMethod,
    escapeLeadingUnderscores,
    getPropertyNameForKnownSymbolName,
    declarationNameToString,
    isObjectLiteralOrClassExpressionMethod,
    isFunctionLike,
    hasZeroOrOneAsteriskCharacter,
    isExternalModuleAugmentation,
    tryParsePattern,
    isSpecialPropertyDeclaration,
    getThisContainer,
    exportAssignmentIsAlias,
    idText
} from "typescript";

import { forEach } from "./array-ish";

import { inspect } from 'util';

const $ = ( o, d = 2 ) => inspect( o,
    {
        depth:  typeof d === 'number' ? d : 2,
        colors: true
    } );

let outOpts = {
    fatal: ( ...args ) => console.error( ...args ),
    error: ( ...args ) => console.error( ...args ),
    warn:  ( ...args ) => console.warn( ...args )
    // log:   ( ...args ) => console.log( ...args )
};

const
    top   = node => {
        if ( outOpts ) return outOpts;
        while ( node && node.pareent ) node = node.parent;
        return node;
    },
    fatal = ( node, msg ) => top( node ).fatal( msg, node ),
    error = ( node, msg ) => top( node ).error( msg, node ),
    warn  = ( node, msg ) => top( node ).warn( msg, node );

// log   = ( node, msg ) => top( node ).log( msg, node );


/**
 * @return {bindSourceFile}
 */
export function createBinder()
{
    let file,   // SourceFile;
        options, // CompilerOptions;
        parent, // Node;
        container, // Node;
        blockScopeContainer, // Node;
        lastContainer, // Node;
        seenThisKeyword, // : boolean;
        /**
         * If this file is an external module, then it is automatically in strict-mode according to
         * ES6.  If it is not an external module, then we'll determine if it is in strict mode or
         * not depending on if we see "use strict" in certain places or if we hit a class/namespace
         * or if compiler options contain alwaysStrict.
         *
         * @type {boolean}
         */
        symbolCount       = 0,

        classifiableNames = new Map(); // UnderscoreEscapedMap<true>;

    function bindSourceFile( f, opts )
    {
        log( `f is ${SyntaxKind[ f.kind ]}` );
        set_file( opts );

        file    = Object.assign( {}, f, { externalModuleIndicator: true } );
        outOpts = options = opts;
        set_strict_mode( true );
        classifiableNames = new Map();
        symbolCount       = 0;

        delete file.locals;
        file.nodeCount       = 0;
        file.identifierCount = 0;
        file.identifiers     = new Map();

        if ( !file.locals )
        {
            performance.mark( "beforeBind" );
            bind( file );
            performance.mark( "afterBind" );
            performance.measure( "Bind", "beforeBind", "afterBind" );
            log( `Source file is bound, symbols: ${symbolCount}, classifiableNames:`,
                [ ...classifiableNames ].map( ( [ name, stuff ] ) => `name: "${name}", type: ${nameOf( stuff ) }` )
            );
            file.symbolCount       = symbolCount;
            file.classifiableNames = classifiableNames;
        }
        else
            log( "Source file is NOT bound" );

        options = parent = container = blockScopeContainer = lastContainer = seenThisKeyword = false;

        return file;
    }

    return bindSourceFile;

    /**
     * Should not be called on a declaration with a computed property name,
     * unless it is a well known Symbol.
     *
     * @param {ts.Node} node
     * @return {string}
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


                assert( isWellKnownSymbolSyntactically( nameExpression ) );
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

            case SyntaxKind.Parameter:
                // Parameters with names are handled at the top of this function.  Parameters
                // without names can only come from JSDocFunctionTypes.
                assert( node.parent.kind === SyntaxKind.JSDocFunctionType );
                const functionType = node.parent;
                const index        = functionType.parameters.indexOf( node );
                return "arg" + index;

            case SyntaxKind.JSDocTypedefTag:
                const name = getNameOfJSDocTypedef( node );
                return typeof name !== "undefined" ? name.escapedText : undefined;
        }
    }

    /**
     * @param {Declaration} node
     * @return {string}
     */
    function getDisplayName( node )
    {
        return node.name ? declarationNameToString( node.name ) : unescapeLeadingUnderscores( getDeclarationName( node ) );
    }

    /**
     * Declares a Symbol for the node and adds it to symbols. Reports errors for conflicting identifier names.
     * @param {SymbolTable} symbolTable - The symbol table which node will be added to.
     * @param {?ts.Node} parent - node's parent declaration.
     * @param {ts.Node} node - The declaration to be added to the symbol table
     * @param {SymbolFlags} includes - The SymbolFlags that node has in addition to its declaration type (eg: export, ambient, etc.)
     * @param {SymbolFlags} excludes - The flags which node cannot be declared alongside in a symbol table. Used to report forbidden declarations.
     * @param {boolean} [isReplaceableByMethod]
     *
     * @return {Symbol}
     */
    function declareSymbol( symbolTable, parent, node, includes, excludes, isReplaceableByMethod )
    {
        assert( !hasDynamicName( node ) );

        const isDefaultExport = hasModifier( node, ModifierFlags.Default );

        // The exported symbol for an export default function/class node is always named "default"
        let name = isDefaultExport && parent ? InternalSymbolName.Default : getDeclarationName( node );

        name = `${name}`;
        // console.error( '\n----------------\n' );
        // console.error( `isDefExp: ${isDefaultExport}, parent? ${!!parent}` );
        // console.error( 'node:', skeys( node ) );
        // console.error( `Decl name: "${name}"` );
        // if ( `${name}` === "Index" )
        // {
        //     console.error( "Really is Index" );
        // }
        let symbol;

        if ( name === undefined )
        {
            console.error( "Name is undefined" );
            symbol = createSymbol( SymbolFlags.None, InternalSymbolName.Missing );
        }
        else
        {
            /**
             * Check and see if the symbol table already has a symbol with this name.  If not,
             * create a new symbol with this name and add it to the table.  Note that we don't
             * give the new symbol any flags *yet*.  This ensures that it will not conflict
             * with the 'excludes' flags we pass in.
             *
             * If we do get an existing symbol, see if it conflicts with the new symbol we're
             * creating.  For example, a 'var' symbol and a 'class' symbol will conflict within
             * the same symbol table.  If we have a conflict, report the issue on each
             * declaration we have for this symbol, and then create a new symbol for this
             * declaration.
             *
             * Note that when properties declared in Javascript constructors
             * (marked by isReplaceableByMethod) conflict with another symbol, the property loses.
             * Always. This allows the common Javascript pattern of overwriting a prototype method
             * with an bound instance method of the same type: `this.method = this.method.bind(this)`
             *
             * If we created a new symbol, either because we didn't have a symbol with this name
             * in the symbol table, or we conflicted with an existing symbol, then just add this
             * node as the sole declaration of the new symbol.
             *
             * Otherwise, we'll be merging into a compatible existing symbol (for example when
             * you have multiple 'vars' with the same name in the same container).  In this case
             * just add this node into the declarations list of the symbol.
             *
             * @type {?Symbol}
             */
            symbol = symbolTable ? symbolTable.get( name ) : '';

            if ( !symbolTable )
            {
                console.error( 'node:', $( hide_parent( node ), 3 ) );
                symbol = symbolTable.get( name );
                process.exit( 1 );
            }

            if ( includes & SymbolFlags.Classifiable )
                classifiableNames.set( name, true );

            if ( !symbol )
            {
                // console.error( "creating symbol:", name );
                symbolTable.set( name, symbol = createSymbol( SymbolFlags.None, name ) );
                // console.error( `created "${name}"` );
                if ( isReplaceableByMethod ) symbol.isReplaceableByMethod = true;
            }
            else if ( isReplaceableByMethod && !symbol.isReplaceableByMethod )  // A symbol already exists, so don't add this as a declaration.
            {
                log( `already exists: ${name}` );
                return symbol;
            }
            else if ( symbol.flags & excludes )
            {
                if ( symbol.isReplaceableByMethod )
                {
                    log( `repl parent name: ${!symbol ? nameOf( symbol ) : symbol.name}` );
                    // Javascript constructor-declared symbols can be discarded in favor of prototype symbols like methods.
                    symbolTable.set( name, symbol = createSymbol( SymbolFlags.None, name ) );
                }
                else
                {
                    log( `decl parent name: ${!symbol ? nameOf( symbol ) : symbol.name}` );

                    if ( node.name )
                        node.name.parent = node;

                    // Report errors every position with duplicate declaration
                    // Report errors on previous encountered declarations
                    let message = symbol.flags & SymbolFlags.BlockScopedVariable
                                  ? "Cannot redeclare block scoped variable " + node.name.escapedText
                                  : "Duplicate identifier " + node.name.escapedText;

                    warn( node, message );
                    // if (symbol.declarations && symbol.declarations.length)
                    // {
                    //     // Error dupe
                    // }

                    symbol = createSymbol( SymbolFlags.None, name );
                }
            }

        }

        symbol.add_declaration( node, includes );

        symbol.parent = parent;

        return symbol;
    }

    /**
     * @param {Declaration} node
     * @param {SymbolFlags} symbolFlags
     * @param {SymbolFlags} symbolExcludes
     * @return {Symbol}
     */
    function declareModuleMember( node, symbolFlags, symbolExcludes )
    {
        const hasExportModifier = ModifierFlags.create( getCombinedModifierFlags( node ) ) & ModifierFlags.Export;

        if ( symbolFlags & SymbolFlags.Alias )
        {
            if ( node.kind === SyntaxKind.ExportSpecifier || ( node.kind === SyntaxKind.ImportEqualsDeclaration && hasExportModifier ) )
                return declareSymbol( container.symbol.exports, container.symbol, node, symbolFlags, symbolExcludes );
            else
                return declareSymbol( container.locals, /* parent */ undefined, node, symbolFlags, symbolExcludes );
        }
        else
        {
            /**
             * Exported module members are given 2 symbols: A local symbol that is classified with an ExportValue flag,
             * and an associated export symbol with all the correct flags set on it. There are 2 main reasons:
             *
             *   1. We treat locals and exports of the same name as mutually exclusive within a container.
             *      That means the binder will issue a Duplicate Identifier error if you mix locals and exports
             *      with the same name in the same container.
             *      TODO: Make this a more specific error and decouple it from the exclusion logic.
             *   2. When we checkIdentifier in the checker, we set its resolved symbol to the local symbol,
             *      but return the export symbol (by calling getExportSymbolOfValueSymbolIfExported). That way
             *      when the emitter comes back to it, it knows not to qualify the name if it was found in a containing scope.
             *
             * NOTE: Nested ambient modules always should go to to 'locals' table to prevent their automatic merge
             *       during global merging in the checker. Why? The only case when ambient module is permitted inside another module is module augmentation
             *       and this case is specially handled. Module augmentations should only be merged with original module definition
             *       and should never be merged directly with other augmentation, and the latter case would be possible if automatic merge is allowed.
             */
            if ( node.kind === SyntaxKind.JSDocTypedefTag ) assert( isInJavaScriptFile( node ) ); // We shouldn't add symbols for JSDoc nodes if not in a JS file.

            const isJSDocTypedefInJSDocNamespace = node.kind === SyntaxKind.JSDocTypedefTag &&
                                                   node.name &&
                                                   node.name.kind === SyntaxKind.Identifier &&
                                                   node.name.isInJSDocNamespace;
            log( `is ambient module (${SyntaxKind[ node.kind ]})? ${isAmbientModule( node )}` );
            if ( ( !isAmbientModule( node ) && ( hasExportModifier || container.flags & NodeFlags.ExportContext ) ) || isJSDocTypedefInJSDocNamespace )
            {
                const
                    exportKind = symbolFlags & SymbolFlags.Value ? SymbolFlags.ExportValue : 0,
                    local      = declareSymbol( container.locals, /* parent */ undefined, node, exportKind, symbolExcludes );

                local.exportSymbol = declareSymbol( container.symbol.exports, container.symbol, node, symbolFlags, symbolExcludes );
                node.localSymbol   = local;
                return local;
            }
            else
                return declareSymbol( container.locals, /* parent */ undefined, node, symbolFlags, symbolExcludes );
        }
    }

    /**
     * @param {ts.Node|ts.Expression} node
     */
    function bind( node )
    {
        if ( !node ) return;

        node.parent            = parent;
        const saveInStrictMode = get_strict_mode();

        /**
         * Even though in the AST the jsdoc `@typedef` node belongs to the current node,
         * its symbol might be in the same scope with the current node's symbol. Consider:
         *
         * ```
         *     //** @typedef {string | number} MyType
         *     function foo();
         * ```

         * Here the current node is `foo`, which is a container, but the scope of `MyType` should
         * not be inside `foo`. Therefore we always bind `@typedef` before bind the parent node,
         * and skip binding this tag later when binding all the other jsdoc tags.
         *
         */
        if ( isInJavaScriptFile( node ) ) bindJSDocTypedefTagIfAny( node );

        /**
         * First we bind declaration nodes to a symbol if possible. We'll both create a symbol
         * and then potentially add the symbol to an appropriate symbol table. Possible
         * destination symbol tables are:
         *
         *  1. The `'exports'` table of the current container's symbol.
         *  2. The `'members'` table of the current container's symbol.
         *  3. The `'locals'` table of the current container.
         *
         * However, not all symbols will end up in any of these tables. `'Anonymous'` symbols
         * (like TypeLiterals for example) will not be put in any table.
         *
         */
        bindWorker( node );

        /**
         * Then we recurse into the children of the node to bind them as well. For certain
         * symbols we do specialized work when we recurse. For example, we'll keep track of
         * the current 'container' node when it changes. This helps us know which symbol table
         * a local should go into for example. Since terminal nodes are known not to have
         * children, as an optimization we don't process those.
         *
         */
        if ( node.kind > SyntaxKind.LastToken )
        {
            const
                saveParent     = parent,
                containerFlags = getContainerFlags( node );

            parent = node;

            if ( containerFlags === ContainerFlags.None )
                bindChildren( node );
            else
                bindContainer( node, containerFlags );

            parent = saveParent;
        }

        set_strict_mode( saveInStrictMode );
    }

    /**
     * @param {ts.Node} node
     */
    function bindJSDocTypedefTagIfAny( node )
    {
        if ( !hasJSDocNodes( node ) )
            return;

        for ( const jsDoc of node.jsDoc )
        {
            if ( !jsDoc.tags )
                continue;

            for ( const tag of jsDoc.tags )
            {
                if ( tag.kind === SyntaxKind.JSDocTypedefTag )
                {
                    const savedParent = parent;
                    parent            = jsDoc;
                    bind( tag );
                    parent = savedParent;
                }
            }
        }
    }

    /**
     * All container nodes are kept on a linked list in declaration order. This list is used by
     * the getLocalNameOfContainer function in the type checker to validate that the local name
     * used for a container is unique.
     *
     * @param {ts.Node} node
     * @param {ContainerFlags} containerFlags
     */
    function bindContainer( node, containerFlags )
    {
        /**
         * Before we recurse into a node's children, we first save the existing parent, container
         * and block-container.  Then after we pop out of processing the children, we restore
         * these saved values.
         */
        const saveContainer            = container;
        const savedBlockScopeContainer = blockScopeContainer;

        /**
         * Depending on what kind of node this is, we may have to adjust the current container
         * and block-container.   If the current node is a container, then it is automatically
         * considered the current block-container as well.  Also, for containers that we know
         * may contain locals, we proactively initialize the .locals field. We do this because
         * it's highly likely that the .locals will be needed to place some child in (for example,
         * a parameter, or variable declaration).
         *
         * However, we do not proactively create the .locals for block-containers because it's
         * totally normal and common for block-containers to never actually have a block-scoped
         * variable in them.  We don't want to end up allocating an object for every 'block' we
         * run into when most of them won't be necessary.
         *
         * Finally, if this is a block-container, then we clear out any existing .locals object
         * it may contain within it.  This happens in incremental scenarios.  Because we can be
         * reusing a node from a previous compilation, that node may have had 'locals' created
         * for it.  We must clear this so we don't accidentally move any stale data forward from
         * a previous compilation.
         */
        if ( containerFlags & ContainerFlags.IsContainer )
        {
            container = blockScopeContainer = node;

            if ( containerFlags & ContainerFlags.HasLocals )
                container.locals = createSymbolTable();

            addToContainerChain( container );
        }
        else if ( containerFlags & ContainerFlags.IsBlockScopedContainer )
        {
            blockScopeContainer        = node;
            blockScopeContainer.locals = undefined;
        }

        if ( containerFlags & ContainerFlags.IsControlFlowContainer )
            bindChildren( node );
        //
        // // Reset all reachability check related flags on node (for incremental scenarios)
        // node.flags &= ~NodeFlags.ReachabilityAndEmitFlags;
        else if ( containerFlags & ContainerFlags.IsInterface )
        {
            seenThisKeyword = false;
            bindChildren( node );
            node.flags = seenThisKeyword ? node.flags | NodeFlags.ContainsThis : node.flags & ~NodeFlags.ContainsThis;
        }
        else
            bindChildren( node );

        container           = saveContainer;
        blockScopeContainer = savedBlockScopeContainer;
    }

    /**
     * @param {ts.Node} node
     */
    function bindChildren( node )
    {
        /**
         * Binding of JsDocComment should be done before the current block scope container changes.
         * because the scope of JsDocComment should not be affected by whether the current node is a
         * container or not.
         */
        if ( hasJSDocNodes( node ) && isInJavaScriptFile( node ) )
            for ( const j of node.jsDoc ) bind( j );

        switch ( node.kind )
        {
            case SyntaxKind.WhileStatement:
                bindWhileStatement( node );
                break;
            case SyntaxKind.DoStatement:
                bindDoStatement( node );
                break;
            case SyntaxKind.ForStatement:
                bindForStatement( node );
                break;
            case SyntaxKind.ForInStatement:
            case SyntaxKind.ForOfStatement:
                bindForInOrForOfStatement( node );
                break;
            case SyntaxKind.IfStatement:
                bindIfStatement( node );
                break;
            case SyntaxKind.ReturnStatement:
            case SyntaxKind.ThrowStatement:
                bind( node.expression );
                break;
            case SyntaxKind.TryStatement:
                bindTryStatement( node );
                break;
            case SyntaxKind.SwitchStatement:
                bindSwitchStatement( node );
                break;
            case SyntaxKind.CaseBlock:
                bindCaseBlock( node );
                break;
            case SyntaxKind.CaseClause:
                bindCaseClause( node );
                break;
            case SyntaxKind.LabeledStatement:
                bindLabeledStatement( node );
                break;
            case SyntaxKind.PrefixUnaryExpression:
                forEachChild( node, bind, node => forEach( node, bind ) );
                break;
            case SyntaxKind.PostfixUnaryExpression:
                forEachChild( node, bind, node => forEach( node, bind ) );
                break;
            case SyntaxKind.BinaryExpression:
                bindBinaryExpressionFlow( node );
                break;
            case SyntaxKind.DeleteExpression:
                forEachChild( node, bind, node => forEach( node, bind ) );
                break;
            case SyntaxKind.ConditionalExpression:
                bindConditionalExpressionFlow( node );
                break;
            case SyntaxKind.VariableDeclaration:
                bindVariableDeclarationFlow( node );
                break;
            case SyntaxKind.CallExpression:
                bindCallExpressionFlow( node );
                break;
            case SyntaxKind.JSDocComment:
                forEachChild( node, n => { if ( n.kind !== SyntaxKind.JSDocTypedefTag ) bind( n ); } );
                break;
            case SyntaxKind.JSDocTypedefTag:
                bindJSDocTypedefTag( node );
                break;
            default:
                forEachChild( node, bind, node => forEach( node, bind ) );
                break;
        }
    }


    /**
     * @param {ts.Node} node
     * @return {ContainerFlags}
     */
    function getContainerFlags( node )
    {
        switch ( node.kind )
        {
            case SyntaxKind.ClassExpression:
            case SyntaxKind.ClassDeclaration:
            case SyntaxKind.EnumDeclaration:
            case SyntaxKind.ObjectLiteralExpression:
            case SyntaxKind.TypeLiteral:
            case SyntaxKind.JSDocTypeLiteral:
            case SyntaxKind.JsxAttributes:
                return ContainerFlags.IsContainer;

            case SyntaxKind.InterfaceDeclaration:
                return ContainerFlags.IsContainer | ContainerFlags.IsInterface;

            case SyntaxKind.ModuleDeclaration:
            case SyntaxKind.TypeAliasDeclaration:
            case SyntaxKind.MappedType:
                return ContainerFlags.IsContainer | ContainerFlags.HasLocals;

            case SyntaxKind.SourceFile:
                return ContainerFlags.IsContainer | ContainerFlags.IsControlFlowContainer | ContainerFlags.HasLocals;

            case SyntaxKind.MethodDeclaration:
                if ( isObjectLiteralOrClassExpressionMethod( node ) )
                    return ContainerFlags.IsContainer | ContainerFlags.IsControlFlowContainer | ContainerFlags.HasLocals | ContainerFlags.IsFunctionLike | ContainerFlags.IsObjectLiteralOrClassExpressionMethod;

            // falls through
            case SyntaxKind.Constructor:
            case SyntaxKind.FunctionDeclaration:
            case SyntaxKind.MethodSignature:
            case SyntaxKind.GetAccessor:
            case SyntaxKind.SetAccessor:
            case SyntaxKind.CallSignature:
            case SyntaxKind.JSDocFunctionType:
            case SyntaxKind.FunctionType:
            case SyntaxKind.ConstructSignature:
            case SyntaxKind.IndexSignature:
            case SyntaxKind.ConstructorType:
                return ContainerFlags.IsContainer | ContainerFlags.IsControlFlowContainer | ContainerFlags.HasLocals | ContainerFlags.IsFunctionLike;

            case SyntaxKind.FunctionExpression:
            case SyntaxKind.ArrowFunction:
                return ContainerFlags.IsContainer | ContainerFlags.IsControlFlowContainer | ContainerFlags.HasLocals | ContainerFlags.IsFunctionLike | ContainerFlags.IsFunctionExpression;

            case SyntaxKind.ModuleBlock:
                return ContainerFlags.IsControlFlowContainer;
            case SyntaxKind.PropertyDeclaration:
                return node.initializer ? ContainerFlags.IsControlFlowContainer : 0;

            case SyntaxKind.CatchClause:
            case SyntaxKind.ForStatement:
            case SyntaxKind.ForInStatement:
            case SyntaxKind.ForOfStatement:
            case SyntaxKind.CaseBlock:
                return ContainerFlags.IsBlockScopedContainer;

            case SyntaxKind.Block:
                /**
                 * do not treat blocks directly inside a function as a block-scoped-container.
                 * Locals that reside in this block should go to the function locals. Otherwise `x`
                 * would not appear to be a redeclaration of a block scoped local in the following
                 * example:
                 *
                 * ```
                 *      function foo() {
                 *          var x;
                 *          let x;
                 *      }
                 * ```
                 *
                 * If we placed `var x` into the function locals and `let x` into the locals of
                 * the block, then there would be no collision.
                 *
                 * By not creating a new block-scoped-container here, we ensure that both `var x`
                 * and `let x` go into the Function-container's locals, and we do get a collision
                 * conflict.
                 */
                return isFunctionLike( node.parent ) ? ContainerFlags.None : ContainerFlags.IsBlockScopedContainer;
        }

        return ContainerFlags.None;
    }

    /**
     * @param {ModuleDeclaration | SourceFile} node
     * @return {boolean}
     */
    function hasExportDeclarations( node )
    {
        const body = node.kind === SyntaxKind.SourceFile ? node : node.body;

        if ( body && ( body.kind === SyntaxKind.SourceFile || body.kind === SyntaxKind.ModuleBlock ) )
        {
            for ( const stat of body.statements )
            {
                if ( stat.kind === SyntaxKind.ExportDeclaration || stat.kind === SyntaxKind.ExportAssignment )
                    return true;
            }
        }

        return false;
    }

    /**
     * @param {ts.Node} next
     */
    function addToContainerChain( next )
    {
        if ( lastContainer )
            lastContainer.nextContainer = next;

        lastContainer = next;
    }

    /**
     * @param {Declaration} node
     * @param {SymbolFlags} symbolFlags
     * @param {SymbolFlags} symbolExcludes
     * @return {Symbol}
     */
    function declareSymbolAndAddToSymbolTable( node, symbolFlags, symbolExcludes )
    {
        switch ( container.kind )
        {
            /**
             * Modules, source files, and classes need specialized handling for how their
             * members are declared (for example, a member of a class will go into a specific
             * symbol table depending on if it is static or not). We defer to specialized
             * handlers to take care of declaring these child members.
             */
            case SyntaxKind.ModuleDeclaration:
                log( `Module declaration (declareModuleMember) in dsaatst` );
                return declareModuleMember( node, symbolFlags, symbolExcludes );

            case SyntaxKind.SourceFile:
                log( `SourceFile (declareSourceFileMember) in dsaatst` );
                return declareSourceFileMember( node, symbolFlags, symbolExcludes );

            case SyntaxKind.ClassExpression:
            case SyntaxKind.ClassDeclaration:
                return declareClassMember( node, symbolFlags, symbolExcludes );

            case SyntaxKind.EnumDeclaration:
                return declareSymbol( container.symbol.exports, container.symbol, node, symbolFlags, symbolExcludes );

            case SyntaxKind.TypeLiteral:
            case SyntaxKind.JSDocTypeLiteral:
            case SyntaxKind.ObjectLiteralExpression:
            case SyntaxKind.InterfaceDeclaration:
            case SyntaxKind.JsxAttributes:
                /**
                 * Interface/Object-types always have their children added to the 'members' of
                 * their container. They are only accessible through an instance of their
                 * container, and are never in scope otherwise (even inside the body of the
                 * object / type / interface declaring them). An exception is type parameters,
                 * which are in scope without qualification (similar to 'locals').
                 */
                log( `\nDeclaring a ${SyntaxKind[ node.kind ]} on ${SyntaxKind[ container.kind ]} named "${container.symbol.name}", [ "${[ ...container.symbol.members.keys() ].join( '", "' )}" ]` );
                return declareSymbol( container.symbol.members, container.symbol, node, symbolFlags, symbolExcludes );

            case SyntaxKind.FunctionType:
            case SyntaxKind.ConstructorType:
            case SyntaxKind.CallSignature:
            case SyntaxKind.ConstructSignature:
            case SyntaxKind.IndexSignature:
            case SyntaxKind.MethodDeclaration:
            case SyntaxKind.MethodSignature:
            case SyntaxKind.Constructor:
            case SyntaxKind.GetAccessor:
            case SyntaxKind.SetAccessor:
            case SyntaxKind.FunctionDeclaration:
            case SyntaxKind.FunctionExpression:
            case SyntaxKind.ArrowFunction:
            case SyntaxKind.JSDocFunctionType:
            case SyntaxKind.TypeAliasDeclaration:
            case SyntaxKind.MappedType:
                /**
                 * All the children of these container types are never visible through another
                 * symbol (i.e. through another symbol's 'exports' or 'members').  Instead,
                 * they're only accessed 'lexically' (i.e. from code that exists underneath
                 * their container in the tree). To accomplish this, we simply add their declared
                 * symbol to the 'locals' of the container.  These symbols can then be found as
                 * the type checker walks up the containers, checking them for matching names.
                 */
                // log( `Declaring a container local ${SyntaxKind[ container.kind ]} on "${SyntaxKind[ container.parent.kind ] || '<no name>'}", named: "${container.parent && container.parent.name ? container.parent.name.escapedText : "no parent name"}"`, $( container.parent, 0 ) );
                if ( container.locals ) log( `locals members: [ "${[ ...container.locals.keys() ].join( '", "' )}" ]` );
                return declareSymbol( container.locals, /* parent */ undefined, node, symbolFlags, symbolExcludes );
        }
    }

    /**
     * @param {ts.Declaration|ts.Node} node
     * @param {SymbolFlags} symbolFlags
     * @param {SymbolFlags} symbolExcludes
     * @return {Symbol}
     */
    function declareClassMember( node, symbolFlags, symbolExcludes )
    {
        return hasModifier( node, ModifierFlags.Static )
               ? declareSymbol( container.symbol.exports, container.symbol, node, symbolFlags, symbolExcludes )
               : declareSymbol( container.symbol.members, container.symbol, node, symbolFlags, symbolExcludes );
    }

    /**
     * @param {ts.Declaration|ts.Node} node
     * @param {SymbolFlags} symbolFlags
     * @param {SymbolFlags} symbolExcludes
     * @return {Symbol}
     */
    function declareSourceFileMember( node, symbolFlags, symbolExcludes )
    {
        log( `isExternalModule? ${isExternalModule( file )}` );
        return isExternalModule( file )
               ? declareModuleMember( node, symbolFlags, symbolExcludes )
               : declareSymbol( file.locals, /* parent */ undefined, node, symbolFlags, symbolExcludes );
    }



    /**
     * @param {ModuleDeclaration | SourceFile} node
     */
    function setExportContextFlag( node )
    {
        /**
         * A declaration source file or ambient module declaration that contains no export declarations (but possibly regular
         * declarations with export modifiers) is an export context in which declarations are implicitly exported.
         */
        if ( node.flags & NodeFlags.Ambient && !hasExportDeclarations( node ) )
            node.flags |= NodeFlags.ExportContext;
        else
            node.flags &= ~NodeFlags.ExportContext;
    }

    /**
     * @param {ts.ModuleDeclaration|ts.Declaration|ts.Node} node
     */
    function bindModuleDeclaration( node )
    {
        setExportContextFlag( node );

        log( `export context: ${node.flags & NodeFlags.ExportContext}` );

        if ( isAmbientModule( node ) )
        {
            if ( hasModifier( node, ModifierFlags.Export ) )
                fatal( node, "export modifier cannot be applied to ambient modules and module augmentations since they are always visible" );

            if ( isExternalModuleAugmentation( node ) )
                declareModuleSymbol( node );
            else
            {
                let pattern;

                if ( node.name.kind === SyntaxKind.StringLiteral )
                {
                    const { text } = node.name;
                    if ( hasZeroOrOneAsteriskCharacter( text ) )
                        pattern = tryParsePattern( text );
                    else
                        error( node.name, `Pattern ${text} can have at most one Asterisk character` );
                }

                const symbol = declareSymbolAndAddToSymbolTable( node, SymbolFlags.ValueModule, SymbolFlags.ValueModuleExcludes );

                if ( pattern )
                {
                    ( file.patternAmbientModules || ( file.patternAmbientModules = [] ) ).push( {
                        pattern,
                        symbol
                    } );
                }
            }
        }
        else
        {
            const state = declareModuleSymbol( node );

            if ( state !== ModuleInstanceState.NonInstantiated )
            {
                const { symbol }           = node;
                // if module was already merged with some function, class or non-const enum, treat it as non-const-enum-only
                symbol.constEnumOnlyModule = ( !( symbol.flags & ( SymbolFlags.Function | SymbolFlags.Class | SymbolFlags.RegularEnum ) ) )
                                             // Current must be `const enum` only
                                             && state === ModuleInstanceState.ConstEnumOnly
                                             // Can't have been set to 'false' in a previous merged symbol. ('undefined' OK)
                                             && symbol.constEnumOnlyModule !== false;
            }
        }
    }

    // /**
    //  * @param {ModuleDeclaration} node
    //  * @return {ModuleInstanceState}
    //  */
    // function getModuleInstanceState( node )
    // {
    //     return node.body ? getModuleInstanceStateWorker( node.body ) : ModuleInstanceState.Instantiated;
    // }

    /**
     * @param {ModuleDeclaration} node
     * @return {ModuleInstanceState}
     */
    function getModuleInstanceStateWorker( node )
    {
        // A module is uninstantiated if it contains only
        switch ( node.kind )
        {
            // 1. interface declarations, type alias declarations
            case SyntaxKind.InterfaceDeclaration:
            case SyntaxKind.TypeAliasDeclaration:
                return ModuleInstanceState.NonInstantiated;

            // 2. const enum declarations
            case SyntaxKind.EnumDeclaration:
                if ( isConst( node ) )
                    return ModuleInstanceState.ConstEnumOnly;
                break;

            // 3. non-exported import declarations
            case SyntaxKind.ImportDeclaration:
            case SyntaxKind.ImportEqualsDeclaration:
                if ( !( hasModifier( node, ModifierFlags.Export ) ) )
                    return ModuleInstanceState.NonInstantiated;
                break;

            // 4. other uninstantiated module declarations.
            case SyntaxKind.ModuleBlock:
            {
                let state = ModuleInstanceState.NonInstantiated;
                forEachChild( node, n => {
                    const childState = getModuleInstanceStateWorker( n );
                    switch ( childState )
                    {
                        case ModuleInstanceState.NonInstantiated:
                            // child is non-instantiated - continue searching
                            return;
                        case ModuleInstanceState.ConstEnumOnly:
                            // child is const enum only - record state and continue searching
                            state = ModuleInstanceState.ConstEnumOnly;
                            return;
                        case ModuleInstanceState.Instantiated:
                            // child is instantiated - record state and stop
                            state = ModuleInstanceState.Instantiated;
                            return true;
                        default:
                            assert( false );
                    }
                } );
                return state;
            }
            case SyntaxKind.ModuleDeclaration:
                return getModuleInstanceState( node );

            case SyntaxKind.Identifier:
                // Only jsdoc typedef definition can exist in jsdoc namespace, and it should
                // be considered the same as type alias
                if ( node.isInJSDocNamespace )
                    return ModuleInstanceState.NonInstantiated;
        }
        return ModuleInstanceState.Instantiated;
    }


    /**
     * @param {ModuleDeclaration} node
     * @return {ModuleInstanceState}
     */
    function declareModuleSymbol( node )
    {
        const
            state        = getModuleInstanceState( node ),
            instantiated = state !== ModuleInstanceState.NonInstantiated;

        declareSymbolAndAddToSymbolTable( node,
            instantiated ? SymbolFlags.ValueModule : SymbolFlags.NamespaceModule,
            instantiated ? SymbolFlags.ValueModuleExcludes : SymbolFlags.NamespaceModuleExcludes );

        return state;
    }

    /**
     * @param {SignatureDeclaration} node
     */
    function bindFunctionOrConstructorType( node )
    {
        /**
         * For a given function symbol `<...>(...) => T` we want to generate a symbol identical
         * to the one we would get for: `{ <...>(...): T }`
         *
         * We do that by making an anonymous type literal symbol, and then setting the function
         * symbol as its sole member. To the rest of the system, this symbol will be indistinguishable
         * from an actual type literal symbol you would have gotten had you used the long form.
         *
         * @type {Symbol}
         */
        const symbol = createSymbol( SymbolFlags.Signature, getDeclarationName( node ) );

        symbol.add_declaration( node, SymbolFlags.Signature );
        log( `bindFunctionOrConstructorType; ${symbol}` );

        const
            typeLiteralSymbol = createSymbol( SymbolFlags.TypeLiteral, InternalSymbolName.Type );

        typeLiteralSymbol.add_declaration( node, SymbolFlags.TypeLiteral );
        typeLiteralSymbol.members = createSymbolTable();
        typeLiteralSymbol.members.set( symbol.escapedName, symbol );
    }

    /**
     * @param {ObjectLiteralExpression} node
     * @return {*}
     */
    function bindObjectLiteralExpression( node )
    {

        if ( get_strict_mode() )
        {
            const seen = new Map();

            for ( const prop of node.properties )
            {
                if ( prop.kind === SyntaxKind.SpreadAssignment || prop.name.kind !== SyntaxKind.Identifier )
                    continue;

                const identifier = prop.name;

                /**
                 * ECMA-262 11.1.5 Object Initializer
                 * If previous is not undefined then throw a SyntaxError exception if any of the following conditions are true
                 * a.This production is contained in strict code and IsDataDescriptor(previous) is true and
                 * IsDataDescriptor(propId.descriptor) is true.
                 *    b.IsDataDescriptor(previous) is true and IsAccessorDescriptor(propId.descriptor) is true.
                 *    c.IsAccessorDescriptor(previous) is true and IsDataDescriptor(propId.descriptor) is true.
                 *    d.IsAccessorDescriptor(previous) is true and IsAccessorDescriptor(propId.descriptor) is true
                 * and either both previous and propId.descriptor have[[Get]] fields or both previous and propId.descriptor have[[Set]] fields
                 *
                 * @type {ElementKind}
                 */
                const
                    currentKind  = prop.kind === SyntaxKind.PropertyAssignment || prop.kind === SyntaxKind.ShorthandPropertyAssignment || prop.kind === SyntaxKind.MethodDeclaration
                                   ? ElementKind.Property
                                   : ElementKind.Accessor,

                    existingKind = seen.get( identifier.escapedText );

                if ( !existingKind )
                {
                    seen.set( identifier.escapedText, currentKind );
                    continue;
                }

                if ( currentKind === ElementKind.Property && existingKind === ElementKind.Property )
                    error( node, "An object literal cannot have multiple properties with the same name in strict mode" );
            }
        }

        return bindAnonymousDeclaration( node, SymbolFlags.ObjectLiteral, InternalSymbolName.Object );
    }

    /**
     * @param {ts.Declaration|ts.Node} node
     * @param {SymbolFlags} symbolFlags
     * @param {string} name
     */
    function bindAnonymousDeclaration( node, symbolFlags, name )
    {
        const symbol = createSymbol( symbolFlags, name );

        if ( symbolFlags & ( SymbolFlags.EnumMember | SymbolFlags.ClassMember ) )
            symbol.parent = container.symbol;

        symbol.add_declaration( node, symbolFlags );
    }

    /**
     * @param {ts.Declaration|ts.Node} node
     * @param {SymbolFlags} symbolFlags
     * @param {SymbolFlags} symbolExcludes
     */
    function bindBlockScopedDeclaration( node, symbolFlags, symbolExcludes )
    {
        switch ( blockScopeContainer.kind )
        {
            case SyntaxKind.ModuleDeclaration:
                declareModuleMember( node, symbolFlags, symbolExcludes );
                break;
            case SyntaxKind.SourceFile:
                if ( isExternalModule( container ) )
                {
                    declareModuleMember( node, symbolFlags, symbolExcludes );
                    break;
                }
            // falls through
            default:
                if ( !blockScopeContainer.locals )
                {
                    blockScopeContainer.locals = createSymbolTable();
                    addToContainerChain( blockScopeContainer );
                }
                declareSymbol( blockScopeContainer.locals, /* parent */ undefined, node, symbolFlags, symbolExcludes );
        }
    }

    /**
     * @param {ts.Node} node
     * @return {*}
     */
    function bindWorker( node )
    {
        switch ( node.kind )
        {
            /* Strict mode checks */
            case SyntaxKind.Identifier:
                /**
                 * for typedef type names with namespaces, bind the new jsdoc type symbol here
                 * because it requires all containing namespaces to be in effect, namely the
                 * current "blockScopeContainer" needs to be set to its immediate namespace parent.
                 */
                if ( node.isInJSDocNamespace )
                {
                    let parentNode = node.parent;

                    while ( parentNode && parentNode.kind !== SyntaxKind.JSDocTypedefTag )
                        parentNode = parentNode.parent;

                    bindBlockScopedDeclaration( parentNode, SymbolFlags.TypeAlias, SymbolFlags.TypeAliasExcludes );
                    break;
                }
            // falls through
            case SyntaxKind.ThisKeyword:

                return checkStrictModeIdentifier( node );

            case SyntaxKind.PropertyAccessExpression:

                if ( isSpecialPropertyDeclaration( node ) )
                    bindSpecialPropertyDeclaration( node );
                break;

            case SyntaxKind.BinaryExpression:
                const specialKind = getSpecialPropertyAssignmentKind( node );
                switch ( specialKind )
                {
                    case SpecialPropertyAssignmentKind.ExportsProperty:
                        bindExportsPropertyAssignment( node );
                        break;
                    case SpecialPropertyAssignmentKind.ModuleExports:
                        bindModuleExportsAssignment( node );
                        break;
                    case SpecialPropertyAssignmentKind.PrototypeProperty:
                        bindPrototypePropertyAssignment( node );
                        break;
                    case SpecialPropertyAssignmentKind.ThisProperty:
                        bindThisPropertyAssignment( node );
                        break;
                    case SpecialPropertyAssignmentKind.Property:
                        bindStaticPropertyAssignment( node );
                        break;
                    case SpecialPropertyAssignmentKind.None:
                        // Nothing to do
                        break;
                    default:
                        assert( false, "Unknown special property assignment kind" );
                }
                return checkStrictModeBinaryExpression( node );

            case SyntaxKind.NumericLiteral:
                return checkStrictModeNumericLiteral( node );
            case SyntaxKind.ThisType:
                seenThisKeyword = true;
                return;

            case SyntaxKind.TypePredicate:
                return checkTypePredicate( node );

            case SyntaxKind.TypeParameter:
                return declareSymbolAndAddToSymbolTable( node, SymbolFlags.TypeParameter, SymbolFlags.TypeParameterExcludes );

            case SyntaxKind.Parameter:
                return bindParameter( node );

            case SyntaxKind.VariableDeclaration:
                return bindVariableDeclarationOrBindingElement( node );

            case SyntaxKind.BindingElement:
                return bindVariableDeclarationOrBindingElement( node );

            case SyntaxKind.PropertyDeclaration:
            case SyntaxKind.PropertySignature:
                return bindPropertyOrMethodOrAccessor( node, SymbolFlags.Property | ( node.questionToken ? SymbolFlags.Optional : SymbolFlags.None ), SymbolFlags.PropertyExcludes );

            case SyntaxKind.PropertyAssignment:
            case SyntaxKind.ShorthandPropertyAssignment:
                return bindPropertyOrMethodOrAccessor( node, SymbolFlags.Property, SymbolFlags.PropertyExcludes );

            case SyntaxKind.EnumMember:
                return bindPropertyOrMethodOrAccessor( node, SymbolFlags.EnumMember, SymbolFlags.EnumMemberExcludes );

            case SyntaxKind.CallSignature:
            case SyntaxKind.ConstructSignature:
            case SyntaxKind.IndexSignature:
                return declareSymbolAndAddToSymbolTable( node, SymbolFlags.Signature, SymbolFlags.None );

            case SyntaxKind.MethodDeclaration:
            case SyntaxKind.MethodSignature:
                /**
                 * If this is an ObjectLiteralExpression method, then it sits in the same space
                 * as other properties in the object literal. So we use SymbolFlags.PropertyExcludes
                 * so that it will conflict with any other object literal members with the same
                 * name.
                 */
                return bindPropertyOrMethodOrAccessor( node, SymbolFlags.Method | ( node.questionToken ? SymbolFlags.Optional : SymbolFlags.None ),
                    isObjectLiteralMethod( node ) ? SymbolFlags.PropertyExcludes : SymbolFlags.MethodExcludes );

            case SyntaxKind.FunctionDeclaration:
                return bindFunctionDeclaration( node );

            case SyntaxKind.Constructor:
                return declareSymbolAndAddToSymbolTable( node, SymbolFlags.Constructor, /* symbolExcludes: */ SymbolFlags.None );

            case SyntaxKind.GetAccessor:
                return bindPropertyOrMethodOrAccessor( node, SymbolFlags.GetAccessor, SymbolFlags.GetAccessorExcludes );

            case SyntaxKind.SetAccessor:
                return bindPropertyOrMethodOrAccessor( node, SymbolFlags.SetAccessor, SymbolFlags.SetAccessorExcludes );

            case SyntaxKind.FunctionType:
            case SyntaxKind.JSDocFunctionType:
            case SyntaxKind.ConstructorType:
                return bindFunctionOrConstructorType( node );

            case SyntaxKind.TypeLiteral:
            case SyntaxKind.JSDocTypeLiteral:
            case SyntaxKind.MappedType:
                return bindAnonymousDeclaration( node, SymbolFlags.TypeLiteral, InternalSymbolName.Type );

            case SyntaxKind.ObjectLiteralExpression:
                return bindObjectLiteralExpression( node );

            case SyntaxKind.FunctionExpression:
            case SyntaxKind.ArrowFunction:
                return bindFunctionExpression( node );

            case SyntaxKind.CallExpression:
                if ( isInJavaScriptFile( node ) )
                    bindCallExpression( node );
                break;

            // Members of classes, interfaces, and modules
            case SyntaxKind.ClassExpression:
            case SyntaxKind.ClassDeclaration:
                // All classes are automatically in strict mode in ES6.
                set_strict_mode( true );
                return bindClassLikeDeclaration( node );

            case SyntaxKind.InterfaceDeclaration:
                return bindBlockScopedDeclaration( node, SymbolFlags.Interface, SymbolFlags.InterfaceExcludes );

            case SyntaxKind.TypeAliasDeclaration:
                return bindBlockScopedDeclaration( node, SymbolFlags.TypeAlias, SymbolFlags.TypeAliasExcludes );

            case SyntaxKind.EnumDeclaration:
                return bindEnumDeclaration( node );

            case SyntaxKind.ModuleDeclaration:
                return bindModuleDeclaration( node );

            // Imports and exports
            case SyntaxKind.ImportEqualsDeclaration:
            case SyntaxKind.NamespaceImport:
            case SyntaxKind.ImportSpecifier:
            case SyntaxKind.ExportSpecifier:
                return declareSymbolAndAddToSymbolTable( node, SymbolFlags.Alias, SymbolFlags.AliasExcludes );

            case SyntaxKind.NamespaceExportDeclaration:
                return bindNamespaceExportDeclaration( node );

            case SyntaxKind.ImportClause:
                return node.name && declareSymbolAndAddToSymbolTable( node, SymbolFlags.Alias, SymbolFlags.AliasExcludes );

            case SyntaxKind.ExportDeclaration:
                return bindExportDeclaration( node );

            case SyntaxKind.ExportAssignment:
                return bindExportAssignment( node );

            case SyntaxKind.SourceFile:
                updateStrictModeStatementList( node.statements );
                return bindSourceFileIfExternalModule();

            case SyntaxKind.Block:
                if ( !isFunctionLike( node.parent ) ) return;
            // falls through
            case SyntaxKind.ModuleBlock:
                return updateStrictModeStatementList( node.statements );

            case SyntaxKind.JSDocParameterTag:
                if ( node.parent.kind !== SyntaxKind.JSDocTypeLiteral ) break;
            // falls through
            case SyntaxKind.JSDocPropertyTag:
                const propTag = node;
                const flags   = propTag.isBracketed || propTag.typeExpression && propTag.typeExpression.type.kind === SyntaxKind.JSDocOptionalType
                                ? SymbolFlags.Property | SymbolFlags.Optional
                                : SymbolFlags.Property;

                return declareSymbolAndAddToSymbolTable( propTag, flags, SymbolFlags.PropertyExcludes );

            case SyntaxKind.JSDocTypedefTag:
            {
                const { fullName } = node;

                if ( !fullName || fullName.kind === SyntaxKind.Identifier ) return bindBlockScopedDeclaration( node, SymbolFlags.TypeAlias, SymbolFlags.TypeAliasExcludes );
                break;
            }
        }
    }

    /**
     * @param {TypePredicateNode} node
     */
    function checkTypePredicate( node )
    {
        const { parameterName, type } = node;

        if ( parameterName && parameterName.kind === SyntaxKind.Identifier )
            checkStrictModeIdentifier( parameterName );

        if ( parameterName && parameterName.kind === SyntaxKind.ThisType )
            seenThisKeyword = true;

        bind( type );
    }

    /**
     * @param {ExportAssignment | BinaryExpression} node
     */
    function bindExportAssignment( node )
    {
        if ( !container.symbol || !container.symbol.exports )
            bindAnonymousDeclaration( node, SymbolFlags.Alias, getDeclarationName( node ) );    // Export assignment in some sort of block construct
        else
        {
            const flags = node.kind === SyntaxKind.ExportAssignment && exportAssignmentIsAlias( node )
                // An export default clause with an EntityNameExpression exports all meanings of that identifier
                          ? SymbolFlags.Alias
                // An export default clause with any other expression exports a value
                          : SymbolFlags.Property;
            // If there is an `export default x;` alias declaration, can't `export default` anything else.
            // (In contrast, you can still have `export default function f() {}` and `export default interface I {}`.)
            declareSymbol( container.symbol.exports, container.symbol, node, flags, SymbolFlags.All );
        }
    }

    /**
     * @param {NamespaceExportDeclaration} node
     */
    function bindNamespaceExportDeclaration( node )
    {
        if ( node.modifiers && node.modifiers.length )
            error( node, "Modifiers cannot appear here" );


        if ( node.parent.kind !== SyntaxKind.SourceFile )
            error( node, "Global module exports may only appear at top level" );
        else
        {
            const parent = node.parent;

            if ( !isExternalModule( parent ) )
                error( node, "Global module exports may only appear in module files" );

            if ( !parent.isDeclarationFile )
                error( node, "Global module exports may only appear in declaration files" );
        }

        file.symbol.globalExports = file.symbol.globalExports || createSymbolTable();
        declareSymbol( file.symbol.globalExports, file.symbol, node, SymbolFlags.Alias, SymbolFlags.AliasExcludes );
    }

    /**
     * @param {ExportDeclaration} node
     */
    function bindExportDeclaration( node )
    {
        if ( !container.symbol || !container.symbol.exports )
        // Export * in some sort of block construct
            bindAnonymousDeclaration( node, SymbolFlags.ExportStar, getDeclarationName( node ) );
        else if ( !node.exportClause )
        // All export * declarations are collected in an __export symbol
            declareSymbol( container.symbol.exports, container.symbol, node, SymbolFlags.ExportStar, SymbolFlags.None );
    }

    /**
     * @param {ts.Node} node
     */
    function setCommonJsModuleIndicator( node )
    {
        if ( !file.commonJsModuleIndicator )
        {
            file.commonJsModuleIndicator = node;

            if ( !file.externalModuleIndicator )
                bindAnonymousDeclaration( file, SymbolFlags.ValueModule, `"${path.basename( file.fileName, path.extname( file.fileName ) )}"` );
        }
    }

    function bindSourceFileIfExternalModule()
    {
        setExportContextFlag( file );
        if ( isExternalModule( file ) )
            bindAnonymousDeclaration( file, SymbolFlags.ValueModule, `"${path.basename( file.fileName, path.extname( file.fileName ) )}"` );
    }

    /**
     * @param {BinaryExpression} node
     */
    function bindExportsPropertyAssignment( node )
    {
        // When we create a property via 'exports.foo = bar', the 'exports.foo' property access
        // expression is the declaration
        setCommonJsModuleIndicator( node );
        declareSymbol( file.symbol.exports, file.symbol, node.left, SymbolFlags.Property | SymbolFlags.ExportValue, SymbolFlags.None );
    }


    /**
     * @param {BinaryExpression} node
     */
    function bindModuleExportsAssignment( node )
    {
        /**
         * A common practice in node modules is to set 'export = module.exports = {}', this ensures that 'exports'
         * is still pointing to 'module.exports'.
         * We do not want to consider this as 'export=' since a module can have only one of these.
         * Similarly we do not want to treat 'module.exports = exports' as an 'export='.
         */
        const assignedExpression = getRightMostAssignedExpression( node.right );

        if ( isEmptyObjectLiteral( assignedExpression ) || container === file && isExportsOrModuleExportsOrAlias( file, assignedExpression ) )
        {
            // Mark it as a module in case there are no other exports in the file
            setCommonJsModuleIndicator( node );
            return;
        }

        // 'module.exports = expr' assignment
        setCommonJsModuleIndicator( node );
        declareSymbol( file.symbol.exports, file.symbol, node, SymbolFlags.Property | SymbolFlags.ExportValue | SymbolFlags.ValueModule, SymbolFlags.None );
    }

    /**
     * @param {BinaryExpression | PropertyAccessExpression} node
     */
    function bindThisPropertyAssignment( node )
    {
        assert( isInJavaScriptFile( node ) );
        const container = getThisContainer( node, /* includeArrowFunctions */ false );

        switch ( container.kind )
        {
            case SyntaxKind.FunctionDeclaration:
            case SyntaxKind.FunctionExpression:
                // Declare a 'member' if the container is an ES5 class or ES6 constructor
                container.symbol.members = container.symbol.members || createSymbolTable();
                // It's acceptable for multiple 'this' assignments of the same identifier to occur
                declareSymbol( container.symbol.members, container.symbol, node, SymbolFlags.Property, SymbolFlags.PropertyExcludes & ~SymbolFlags.Property );
                break;

            case SyntaxKind.Constructor:
            case SyntaxKind.PropertyDeclaration:
            case SyntaxKind.MethodDeclaration:
            case SyntaxKind.GetAccessor:
            case SyntaxKind.SetAccessor:
                // this.foo assignment in a JavaScript class
                // Bind this property to the containing class
                const containingClass = container.parent;
                const symbolTable     = hasModifier( container, ModifierFlags.Static ) ? containingClass.symbol.exports : containingClass.symbol.members;
                declareSymbol( symbolTable, containingClass.symbol, node, SymbolFlags.Property, SymbolFlags.None, /* isReplaceableByMethod */ true );
                break;
        }
    }

    /**
     * @param {PropertyAccessExpression} node
     */
    function bindSpecialPropertyDeclaration( node )
    {
        assert( isInJavaScriptFile( node ) );
        if ( node.expression.kind === SyntaxKind.ThisKeyword )
            bindThisPropertyAssignment( node );
        else if ( ( node.expression.kind === SyntaxKind.Identifier || node.expression.kind === SyntaxKind.PropertyAccessExpression ) &&
                  node.parent.parent.kind === SyntaxKind.SourceFile )
        {
            bindStaticPropertyAssignment( node );
        }
    }

    /**
     * @param {BinaryExpression} node
     */
    function bindPrototypePropertyAssignment( node )
    {
        /**
         * We saw a node of the form 'x.prototype.y = z'. Declare a 'member' y on x if x is a function or class, or not declared.
         *
         * Look up the function in the local scope, since prototype assignments should
         * follow the function declaration
         *
         * @type {Expression}
         */
        const
            leftSideOfAssignment = node.left,
            classPrototype       = leftSideOfAssignment.expression,
            constructorFunction  = classPrototype.expression;

        // Fix up parent pointers since we're going to use these nodes before we bind into them
        leftSideOfAssignment.parent = node;
        constructorFunction.parent  = classPrototype;
        classPrototype.parent       = leftSideOfAssignment;

        bindPropertyAssignment( constructorFunction.escapedText, leftSideOfAssignment, /*isPrototypeProperty*/ true );
    }

    /**
     * For nodes like `x.y = z`, declare a member 'y' on 'x' if x is a function or class, or not declared.
     * Also works for expression statements preceded by JSDoc, like / ** @type number * / x.y;
     *
     * @param {BinaryExpression | PropertyAccessExpression} node
     */
    function bindStaticPropertyAssignment( node )
    {
        // Look up the function in the local scope, since static assignments should
        // follow the function declaration
        const
            leftSideOfAssignment = node.kind === SyntaxKind.PropertyAccessExpression ? node : node.left,
            target               = leftSideOfAssignment.expression;

        if ( isIdentifier( target ) )
        {
            // Fix up parent pointers since we're going to use these nodes before we bind into them
            target.parent = leftSideOfAssignment;
            if ( node.kind === SyntaxKind.BinaryExpression )
                leftSideOfAssignment.parent = node;

            /**
             * This can be an alias for the 'exports' or 'module.exports' names, e.g.
             *    var util = module.exports;
             *    util.property = function ...
             */
            if ( container === file && isNameOfExportsOrModuleExportsAliasDeclaration( file, target ) )
                bindExportsPropertyAssignment( node );
            else
                bindPropertyAssignment( target.escapedText, leftSideOfAssignment, /* isPrototypeProperty */ false );
        }
    }

    /**
     * @param {string|Identifier} functionName
     * @param propertyAccess
     * @param isPrototypeProperty
     */
    function bindPropertyAssignment( functionName, propertyAccess, isPrototypeProperty )
    {
        const symbol = lookupSymbolForNameWorker( container, functionName );

        let targetSymbol = symbol ? symbol.valueDeclaration.initializer.symbol : symbol;
        // let targetSymbol = symbol && isDeclarationOfFunctionOrClassExpression( symbol ) ? symbol.valueDeclaration.initializer.symbol : symbol;

        assert( propertyAccess.parent.kind === SyntaxKind.BinaryExpression || propertyAccess.parent.kind === SyntaxKind.ExpressionStatement );

        let isLegalPosition;

        if ( propertyAccess.parent.kind === SyntaxKind.BinaryExpression )
        {
            const initializerKind = ( propertyAccess.parent ).right.kind;
            isLegalPosition       = ( initializerKind === SyntaxKind.ClassExpression || initializerKind === SyntaxKind.FunctionExpression ) &&
                                    propertyAccess.parent.parent.parent.kind === SyntaxKind.SourceFile;
        }
        else
            isLegalPosition = propertyAccess.parent.parent.kind === SyntaxKind.SourceFile;

        if ( !isPrototypeProperty && ( !targetSymbol || !( targetSymbol.flags & SymbolFlags.Namespace ) ) && isLegalPosition )
        {
            assert( isIdentifier( propertyAccess.expression ) );

            const
                identifier   = propertyAccess.expression,
                flags        = SymbolFlags.Module | SymbolFlags.JSContainer,
                excludeFlags = SymbolFlags.ValueModuleExcludes & ~SymbolFlags.JSContainer;

            if ( targetSymbol )
                symbol.add_declaration( identifier, flags );
            else
                targetSymbol = declareSymbol( container.locals, /* parent */ undefined, identifier, flags, excludeFlags );
        }

        if ( !targetSymbol || !( targetSymbol.flags & ( SymbolFlags.Function | SymbolFlags.Class | SymbolFlags.NamespaceModule ) ) )
            return;

        // Set up the members collection if it doesn't exist already
        const symbolTable = isPrototypeProperty
                            ? ( targetSymbol.members || ( targetSymbol.members = createSymbolTable() ) )
                            : ( targetSymbol.exports || ( targetSymbol.exports = createSymbolTable() ) );

        // Declare the method/property
        declareSymbol( symbolTable, targetSymbol, propertyAccess, SymbolFlags.Property, SymbolFlags.PropertyExcludes );
    }

    /**
     * @param {CallExpression} node
     */
    function bindCallExpression( node )
    {
        // We're only inspecting call expressions to detect CommonJS modules, so we can skip
        // this check if we've already seen the module indicator
        if ( !file.commonJsModuleIndicator && isRequireCall( node, /* checkArgumentIsStringLiteral */ false ) )
            setCommonJsModuleIndicator( node );
    }

    /**
     * @param {ClassLikeDeclaration} node
     */
    function bindClassLikeDeclaration( node )
    {
        if ( node.kind === SyntaxKind.ClassDeclaration )
            bindBlockScopedDeclaration( node, SymbolFlags.Class, SymbolFlags.ClassExcludes );
        else
        {
            const bindingName = node.name ? node.name.escapedText : InternalSymbolName.Class;
            bindAnonymousDeclaration( node, SymbolFlags.Class, bindingName );
            // Add name of class expression into the map for semantic classifier
            if ( node.name )
                classifiableNames.set( node.name.escapedText, true );
        }

        const symbol = node.symbol;

        /**
         * TypeScript 1.0 spec (April 2014): 8.4
         * Every class automatically contains a static property member named 'prototype', the
         * type of which is an instantiation of the class type with type Any supplied as a type
         * argument for each type parameter. It is an error to explicitly declare a static
         * property member with the name 'prototype'.
         *
         * Note: we check for this here because this class may be merging into a module.  The
         * module might have an exported variable called 'prototype'.  We can't allow that as
         * that would clash with the built-in 'prototype' for the class.
         *
         * @type {TransientSymbol|Symbol}
         */
        const
            prototypeSymbol = createSymbol( SymbolFlags.Property | SymbolFlags.Prototype, "prototype" ),
            symbolExport    = symbol.exports.get( prototypeSymbol.escapedName );

        if ( symbolExport )
        {
            if ( node.name )
                node.name.parent = node;

            error( node, `Duplicate identifier ${prototypeSymbol.name}` );
        }

        symbol.exports.set( prototypeSymbol.escapedName, prototypeSymbol );
        prototypeSymbol.parent = symbol;
    }

    /**
     * @param {EnumDeclaration} node
     */
    function bindEnumDeclaration( node )
    {
        return isConst( node )
               ? bindBlockScopedDeclaration( node, SymbolFlags.ConstEnum, SymbolFlags.ConstEnumExcludes )
               : bindBlockScopedDeclaration( node, SymbolFlags.RegularEnum, SymbolFlags.RegularEnumExcludes );
    }

    /**
     * @param {VariableDeclaration | BindingElement} node
     */
    function bindVariableDeclarationOrBindingElement( node )
    {
        if ( get_strict_mode() )
            checkStrictModeEvalOrArguments( node, node.name );

        if ( !isBindingPattern( node.name ) )
        {
            if ( isBlockOrCatchScoped( node ) )
                bindBlockScopedDeclaration( node, SymbolFlags.BlockScopedVariable, SymbolFlags.BlockScopedVariableExcludes );
            else if ( isParameterDeclaration( node ) )
                /**
                 * It is safe to walk up parent chain to find whether the node is a destructing parameter declaration
                 * because its parent chain has already been set up, since parents are set before descending into children.
                 *
                 * If node is a binding element in parameter declaration, we need to use ParameterExcludes.
                 * Using ParameterExcludes flag allows the compiler to report an error on duplicate identifiers in Parameter Declaration
                 * For example:
                 *      `function foo([a,a]) {}` * Duplicate Identifier error
                 *      `function bar(a,a) {}`   * Duplicate Identifier error, parameter declaration in this case is handled in bindParameter
                 *                             * which correctly set excluded symbols
                 */
                declareSymbolAndAddToSymbolTable( node, SymbolFlags.FunctionScopedVariable, SymbolFlags.ParameterExcludes );
            else
                declareSymbolAndAddToSymbolTable( node, SymbolFlags.FunctionScopedVariable, SymbolFlags.FunctionScopedVariableExcludes );
        }
    }

// function isParameterPropertyDeclaration(node)
// {
//     return hasModifier(node, ModifierFlags.ParameterPropertyModifier) && node.parent.kind === SyntaxKind.Constructor && isClassLike(node.parent.parent);
// }
//
// export function isAccessor(node)
// {
//     return node && (node.kind === SyntaxKind.GetAccessor || node.kind === SyntaxKind.SetAccessor);
// }


    /**
     * @param {ts.ParameterDeclaration|ts.Node} node
     */
    function bindParameter( node )
    {
        // if ( inStrictMode && !( node.flags & NodeFlags.Ambient ) )
        // {
        // It is a SyntaxError if the identifier eval or arguments appears within a FormalParameterList of a
        // strict mode FunctionLikeDeclaration or FunctionExpression(13.1)
        // Throw error if node is Indetifier and name is either `eval` or `arguments`
        // }

        if ( isBindingPattern( node.name ) )
            bindAnonymousDeclaration( node, SymbolFlags.FunctionScopedVariable, "__" + node.parent.parameters.indexOf( node ) );
        else
            declareSymbolAndAddToSymbolTable( node, SymbolFlags.FunctionScopedVariable, SymbolFlags.ParameterExcludes );

        // If this is a property-parameter, then also declare the property symbol into the
        // containing class.
        if ( isParameterPropertyDeclaration( node ) )
        {
            const classDeclaration = node.parent.parent;
            declareSymbol( classDeclaration.symbol.members, classDeclaration.symbol, node, SymbolFlags.Property | ( node.questionToken ? SymbolFlags.Optional : SymbolFlags.None ), SymbolFlags.PropertyExcludes );
        }
    }


    /**
     * @param {ts.FunctionDeclaration|ts.Node} node
     */
    function bindFunctionDeclaration( node )
    {
        if ( get_strict_mode() )
            bindBlockScopedDeclaration( node, SymbolFlags.Function, SymbolFlags.FunctionExcludes );
        else
            declareSymbolAndAddToSymbolTable( node, SymbolFlags.Function, SymbolFlags.FunctionExcludes );
    }

    /**
     * @param {ts.FunctionExpression|ts.Node} node
     */
    function bindFunctionExpression( node )
    {
        // Throw error if node is Indetifier and name is either `eval` or `arguments`
        const bindingName = node.name ? node.name.escapedText : InternalSymbolName.Function;
        return bindAnonymousDeclaration( node, SymbolFlags.Function, bindingName );
    }

    /**
     * @param {ts.Node} node
     * @param {SymbolFlags} symbolFlags
     * @param {SymbolFlags} symbolExcludes
     * @return {*}
     */
    function bindPropertyOrMethodOrAccessor( node, symbolFlags, symbolExcludes )
    {
        return hasDynamicName( node )
               ? bindAnonymousDeclaration( node, symbolFlags, InternalSymbolName.Computed )
               : declareSymbolAndAddToSymbolTable( node, symbolFlags, symbolExcludes );
    }

    /**
     * @param {WhileStatement} node
     */
    function bindWhileStatement( node )
    {
        bind( node.expression );
        bind( node.statement );
    }

    /**
     * @param {DoStatement} node
     */
    function bindDoStatement( node )
    {
        // if do statement is wrapped in labeled statement then target labels for break/continue with or without
        // label should be the same
        bind( node.statement );
        bind( node.expression );
    }

    /**
     * @param {ForStatement} node
     */
    function bindForStatement( node )
    {
        bind( node.initializer );
        bind( node.condition );
        bind( node.statement );
        bind( node.incrementor );
    }

    /**
     * @param {ForInOrOfStatement} node
     */
    function bindForInOrForOfStatement( node )
    {
        if ( node.kind === SyntaxKind.ForOfStatement )
            bind( node.awaitModifier );

        bind( node.expression );
        bind( node.initializer );

        if ( node.initializer.kind !== SyntaxKind.VariableDeclarationList )
            bindAssignmentTargetFlow( node.initializer );

        bind( node.statement );
    }

    /**
     *
     * @param {IfStatement} node
     */
    function bindIfStatement( node )
    {
        bind( node.expression );
        bind( node.thenStatement );
        bind( node.elseStatement );
    }

    /**
     * @param {TryStatement} node
     */
    function bindTryStatement( node )
    {
        // TODO: Every statement in try block is potentially an exit point!
        bind( node.tryBlock );

        if ( node.catchClause )
            bind( node.catchClause );

        if ( node.finallyBlock )

        // in finally flow is combined from pre-try/flow from try/flow from catch
        // pre-flow is necessary to make sure that finally is reachable even if finally flows in both try and finally blocks are unreachable
        // also for finally blocks we inject two extra edges into the flow graph.
        // first -> edge that connects pre-try flow with the label at the beginning of the finally block, it has lock associated with it
        // second -> edge that represents post-finally flow.
        // these edges are used in following scenario:
        // let a; (1)
        // try { a = someOperation(); (2)}
        // finally { (3) console.log(a) } (4)
        // (5) a
            bind( node.finallyBlock );
    }

    /**
     * @param {ts.SwitchStatement} node
     */
    function bindSwitchStatement( node )
    {
        bind( node.expression );
        bind( node.caseBlock );
    }

    /**
     * @param {CaseBlock} node
     */
    function bindCaseBlock( node )
    {
        const clauses = node.clauses;
        for ( let i = 0; i < clauses.length; i++ )
        {
            while ( !clauses[ i ].statements.length && i + 1 < clauses.length )
            {
                bind( clauses[ i ] );
                i++;
            }

            const clause = clauses[ i ];
            bind( clause );
        }
    }

    /**
     * @param {CaseClause} node
     */
    function bindCaseClause( node )
    {
        bind( node.expression );
        forEach( node.statements, bind );
    }

    /**
     * @param {LabeledStatement} node
     */
    function bindLabeledStatement( node )
    {
        bind( node.label );
        bind( node.statement );
    }

    /**
     * @param {Expression} node
     */
    function bindDestructuringTargetFlow( node )
    {
        if ( node.kind === SyntaxKind.BinaryExpression && node.operatorToken.kind === SyntaxKind.EqualsToken )
            bindAssignmentTargetFlow( node.left );
        else
            bindAssignmentTargetFlow( node );
    }

    /**
     * @param {Expression} node
     */
    function bindAssignmentTargetFlow( node )
    {
        if ( node.kind === SyntaxKind.ArrayLiteralExpression )
        {
            for ( const e of node.elements )
            {
                if ( e.kind === SyntaxKind.SpreadElement )
                    bindAssignmentTargetFlow( e.expression );
                else
                    bindDestructuringTargetFlow( e );
            }
        }
        else if ( node.kind === SyntaxKind.ObjectLiteralExpression )
        {
            for ( const p of node.properties )
            {
                if ( p.kind === SyntaxKind.PropertyAssignment )
                    bindDestructuringTargetFlow( p.initializer );
                else if ( p.kind === SyntaxKind.ShorthandPropertyAssignment )
                    bindAssignmentTargetFlow( p.name );
                else if ( p.kind === SyntaxKind.SpreadAssignment )
                    bindAssignmentTargetFlow( p.expression );
            }

        }

    }

    /**
     * @param {BinaryExpression} node
     */
    function bindLogicalExpression( node )
    {
        if ( node.operatorToken.kind === SyntaxKind.AmpersandAmpersandToken )
            bind( node.left );
        else
            bind( node.left );

        bind( node.operatorToken );
        bind( node.right );
    }

    /**
     * @todo Verify correct translation of this function
     * @param {BinaryExpression} node
     */
    function bindBinaryExpressionFlow( node )
    {
        const operator = node.operatorToken.kind;

        if ( operator === SyntaxKind.AmpersandAmpersandToken || operator === SyntaxKind.BarBarToken )
        {
            if ( isTopLevelLogicalExpression( node ) )
                bindLogicalExpression( node );
            else
                bindLogicalExpression( node );
        }
        else
            forEachChild( node, bind, node => forEach( node, bind ) );

    }

    /**
     * @param {ConditionalExpression} node
     */
    function bindConditionalExpressionFlow( node )
    {
        bind( node.condition );
        bind( node.questionToken );
        bind( node.whenTrue );
        bind( node.colonToken );
        bind( node.whenFalse );
    }

    /**
     * @param {VariableDeclaration | ArrayBindingElement} node
     */
    function bindInitializedVariableFlow( node )
    {
        const name = !isOmittedExpression( node ) ? node.name : undefined;

        if ( isBindingPattern( name ) )
            for ( const child of name.elements ) bindInitializedVariableFlow( child );
    }

    /**
     * @param {VariableDeclaration} node
     */
    function bindVariableDeclarationFlow( node )
    {
        forEachChild( node, bind, node => forEach( node, bind ) );

        if ( node.initializer || isForInOrOfStatement( node.parent.parent ) )
            bindInitializedVariableFlow( node );
    }

    /**
     * @param {JSDocTypedefTag} node
     */
    function bindJSDocTypedefTag( node )
    {
        forEachChild( node, n => {
            // if the node has a fullName "A.B.C", that means symbol "C" was already bound
            // when we visit "fullName"; so when we visit the name "C" as the next child of
            // the jsDocTypedefTag, we should skip binding it.
            if ( node.fullName && n === node.name && node.fullName.kind !== SyntaxKind.Identifier )
                return;

            bind( n );
        } );
    }

    /**
     * @param {CallExpression} node
     */
    function bindCallExpressionFlow( node )
    {
        // If the target of the call expression is a function expression or arrow function we have
        // an immediately invoked function expression (IIFE). Initialize the flowNode property to
        // the current control flow (which includes evaluation of the IIFE arguments).
        let expr = node.expression;

        while ( expr.kind === SyntaxKind.ParenthesizedExpression )
            expr = expr.expression;

        if ( expr.kind === SyntaxKind.FunctionExpression || expr.kind === SyntaxKind.ArrowFunction )
        {
            forEach( node.typeArguments, bind );
            forEach( node.arguments, bind );
            bind( node.expression );
        }
        else
            forEachChild( node, bind, node => forEach( node, bind ) );
    }

    /**
     *
     * @param {NodeArray<Statement>} statements
     */
    function updateStrictModeStatementList( statements )
    {
        if ( !get_strict_mode() )
        {
            for ( const statement of statements )
            {
                if ( !isPrologueDirective( statement ) )
                    return;

                if ( isUseStrictPrologueDirective( statement ) )
                {
                    set_strict_mode( true );
                    return;
                }
            }
        }
    }

    /**
     * Should be called only on prologue directives (isPrologueDirective(node) should be true)
     *
     * @param {ts.ExpressionStatement|ts.Node} node
     * @return {boolean}
     */
    function isUseStrictPrologueDirective( node )
    {
        const nodeText = file.info.getTextOfNodeFromSourceText( node.expression );

        // Note: the node text must be exactly "use strict" or 'use strict'.  It is not ok for the
        // string to contain unicode escapes (as per ES5).
        return nodeText === '"use strict"' || nodeText === "'use strict'";
    }

}

/**
 *
 * @param {Declaration} declaration
 * @return {?Identifier}
 */
export function getNameOfDeclaration( declaration )
{
    if ( !declaration )
        return undefined;

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
        case SyntaxKind.BinaryExpression:
        {
            const expr = declaration;
            switch ( getSpecialPropertyAssignmentKind( expr ) )
            {
                case SpecialPropertyAssignmentKind.ExportsProperty:
                case SpecialPropertyAssignmentKind.ThisProperty:
                case SpecialPropertyAssignmentKind.Property:
                case SpecialPropertyAssignmentKind.PrototypeProperty:
                    return expr.left.name;
                default:
                    return undefined;
            }
        }
        case SyntaxKind.JSDocTypedefTag:
            return getNameOfJSDocTypedef( declaration );
        case SyntaxKind.ExportAssignment:
        {
            const { expression } = declaration;
            return isIdentifier( expression ) ? expression : undefined;
        }
    }
    return declaration.name;
}
