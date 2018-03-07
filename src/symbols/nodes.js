/** ******************************************************************************************************************
 * @file Describe what nodes does.
 * @author Julian Jensen <jjdanois@gmail.com>
 * @since 1.0.0
 * @date 04-Mar-2018
 *********************************************************************************************************************/
"use strict";

import { SyntaxKind }   from "../ts/ts-helpers";
import {
    InternalSymbolName,
    SpecialPropertyAssignmentKind,
    ModifierFlags,
    SymbolFlags,
    NodeFlags,
    ContainerFlags, ElementKind
}                       from "../types";
import * as assert      from "assert";
import { hasModifier }  from "./modifiers";
import {
    createSymbolTable,
    hasJSDocNodes,
    unescapeLeadingUnderscores
} from "../utils";
import {
    getNameOfJSDocTypedef,
    isJSDocConstructSignature
}                       from "../jsdoc-things";
import { forEachChild } from "../ts/ts-ast-walker";
import { createSymbol }  from "./symbol";

import {
    isClassLike,
    isExternalModule,
    isIdentifierName,
    isAmbientModule,
    isGlobalScopeAugmentation,
    isStringOrNumericLiteral,
    isWellKnownSymbolSyntactically,
    isIdentifier,
    isInJavaScriptFile
} from "typescript";


function createBinder()
{
    let file,   // SourceFile;
        options, // CompilerOptions;
        languageVersion, // ScriptTarget;
        parent, // Node;
        container, // Node;
        blockScopeContainer, // Node;
        lastContainer, // Node;
        seenThisKeyword, // : boolean;


        // state used for emit helpers
        emitFlags, // NodeFlags;

        /**
         * If this file is an external module, then it is automatically in strict-mode according to
         * ES6.  If it is not an external module, then we'll determine if it is in strict mode or
         * not depending on if we see "use strict" in certain places or if we hit a class/namespace
         * or if compiler options contain alwaysStrict.
         *
         * @type {boolean}
         */
        inStrictMode, // boolean;

        symbolCount = 0,

        classifiableNames = new Map(); // UnderscoreEscapedMap<true>;


    function bindSourceFile(f, opts) {
        file = f;
        options = opts;
        languageVersion = getEmitScriptTarget(options);
        inStrictMode = bindInStrictMode(file, opts);
        classifiableNames = new Map();
        symbolCount = 0;

        Symbol = objectAllocator.getSymbolConstructor();

        if ( !file.locals )
        {
            bind(file);
            file.symbolCount = symbolCount;
            file.classifiableNames = classifiableNames;
        }

        file = undefined;
        options = undefined;
        languageVersion = undefined;
        parent = undefined;
        container = undefined;
        blockScopeContainer = undefined;
        lastContainer = undefined;
        seenThisKeyword = false;
        emitFlags = NodeFlags.None;
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
     *
     * @param {Declaration} declaration
     * @return {?Identifier}
     */
    function getNameOfDeclaration( declaration )
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
        const name = isDefaultExport && parent ? InternalSymbolName.Default : getDeclarationName( node );

        let symbol;

        if ( name === undefined )
            symbol = createSymbol( SymbolFlags.None, InternalSymbolName.Missing );
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
            symbol = symbolTable.get( name );

            if ( includes & SymbolFlags.Classifiable )
                classifiableNames.set( name, true );

            if ( !symbol )
            {
                symbolTable.set( name, symbol = createSymbol( SymbolFlags.None, name ) );
                if ( isReplaceableByMethod ) symbol.isReplaceableByMethod = true;
            }
            else if ( isReplaceableByMethod && !symbol.isReplaceableByMethod )
            // A symbol already exists, so don't add this as a declaration.
                return symbol;
            else if ( symbol.flags & excludes )
            {
                if ( symbol.isReplaceableByMethod )

                // Javascript constructor-declared symbols can be discarded in favor of prototype symbols like methods.
                    symbolTable.set( name, symbol = createSymbol( SymbolFlags.None, name ) );

                else
                {
                    if ( node.name )
                        node.name.parent = node;

                    // Report errors every position with duplicate declaration
                    // Report errors on previous encountered declarations
                    let message = symbol.flags & SymbolFlags.BlockScopedVariable
                                  ? Diagnostics.Cannot_redeclare_block_scoped_variable_0
                                  : Diagnostics.Duplicate_identifier_0;

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
        const hasExportModifier = getCombinedModifierFlags( node ) & ModifierFlags.Export;

        if ( symbolFlags & SymbolFlags.Alias )
        {
            if ( node.kind === SyntaxKind.ExportSpecifier || ( node.kind === SyntaxKind.ImportEqualsDeclaration && hasExportModifier ) )
                return declareSymbol( container.symbol.exports, container.symbol, node, symbolFlags, symbolExcludes );
            else
                return declareSymbol( container.locals, /*parent*/ undefined, node, symbolFlags, symbolExcludes );
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

            if ( ( !isAmbientModule( node ) && ( hasExportModifier || container.flags & NodeFlags.ExportContext ) ) || isJSDocTypedefInJSDocNamespace )
            {
                const
                    exportKind = symbolFlags & SymbolFlags.Value ? SymbolFlags.ExportValue : 0,
                    local      = declareSymbol( container.locals, /*parent*/ undefined, node, exportKind, symbolExcludes );

                local.exportSymbol = declareSymbol( container.symbol.exports, container.symbol, node, symbolFlags, symbolExcludes );
                node.localSymbol   = local;
                return local;
            }
            else
                return declareSymbol( container.locals, /*parent*/ undefined, node, symbolFlags, symbolExcludes );
        }
    }

    /**
     * @param {Node} node
     */
    function bind( node )
    {
        if ( !node ) return;

        node.parent            = parent;
        const saveInStrictMode = inStrictMode;

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
            const saveParent     = parent;
            parent               = node;
            const containerFlags = getContainerFlags( node );
            if ( containerFlags === ContainerFlags.None )
                bindChildren( node );
            else
                bindContainer( node, containerFlags );
            parent = saveParent;
        }
        inStrictMode = saveInStrictMode;
    }

    /**
     * All container nodes are kept on a linked list in declaration order. This list is used by
     * the getLocalNameOfContainer function in the type checker to validate that the local name
     * used for a container is unique.
     *
     * @param {Node} node
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
        {
            bindChildren( node );

            // Reset all reachability check related flags on node (for incremental scenarios)
            node.flags &= ~NodeFlags.ReachabilityAndEmitFlags;

        }
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
     * @param {Node} node
     */
    function bindChildren( node )
    {
        bindChildrenWorker( node );
    }

    /**
     * @param {NodeArray<Node>} nodes
     */
    function bindEach( nodes )
    {
        if ( nodes === undefined )
            return;

        forEach( nodes, bind );
    }

    /**
     * @param {Node} node
     */
    function bindEachChild( node )
    {
        forEachChild( node, bind, bindEach );
    }

    function bindChildrenWorker( node: Node ): void
    {
        /**
         * Binding of JsDocComment should be done before the current block scope container changes.
         * because the scope of JsDocComment should not be affected by whether the current node is a
         * container or not.
         */
        if ( hasJSDocNodes( node ) && isInJavaScriptFile( node ) )
                for ( const j of node.jsDoc ) bind( j );

        bindEachChild( node );

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
                bindReturnOrThrow( node );
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
                bindPrefixUnaryExpressionFlow( node );
                break;
            case SyntaxKind.PostfixUnaryExpression:
                bindPostfixUnaryExpressionFlow( node );
                break;
            case SyntaxKind.BinaryExpression:
                bindBinaryExpressionFlow( node );
                break;
            case SyntaxKind.DeleteExpression:
                bindDeleteExpressionFlow( node );
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
                bindJSDocComment( node );
                break;
            case SyntaxKind.JSDocTypedefTag:
                bindJSDocTypedefTag( node );
                break;
            default:
                bindEachChild( node );
                break;
        }
    }


    /**
     * @param {Node} node
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
                {
                    return ContainerFlags.IsContainer | ContainerFlags.IsControlFlowContainer | ContainerFlags.HasLocals | ContainerFlags.IsFunctionLike | ContainerFlags.IsObjectLiteralOrClassExpressionMethod;
                }
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
                {
                    return true;
                }
            }
        }
        return false;
    }


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
                return declareModuleMember( node, symbolFlags, symbolExcludes );

            case SyntaxKind.SourceFile:
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
                return declareSymbol( container.locals, /*parent*/ undefined, node, symbolFlags, symbolExcludes );
        }
    }

    /**
     * @param {Declaration} node
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
     * @param {Declaration} node
     * @param {SymbolFlags} symbolFlags
     * @param {SymbolFlags} symbolExcludes
     * @return {Symbol}
     */
    function declareSourceFileMember( node, symbolFlags, symbolExcludes )
    {
        return isExternalModule( file )
               ? declareModuleMember( node, symbolFlags, symbolExcludes )
               : declareSymbol( file.locals, /*parent*/ undefined, node, symbolFlags, symbolExcludes );
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
     * @param {ModuleDeclaration} node
     */
    function bindModuleDeclaration( node )
    {
        setExportContextFlag( node );
        if ( isAmbientModule( node ) )
        {
            if ( hasModifier( node, ModifierFlags.Export ) )
                errorOnFirstToken( node, Diagnostics.export_modifier_cannot_be_applied_to_ambient_modules_and_module_augmentations_since_they_are_always_visible );

            if ( isExternalModuleAugmentation( node ) )
                declareModuleSymbol( node );
            else
            {
                let pattern: Pattern | undefined;
                if ( node.name.kind === SyntaxKind.StringLiteral )
                {
                    const { text } = node.name;
                    if ( hasZeroOrOneAsteriskCharacter( text ) )
                        pattern = tryParsePattern( text );
                    else
                        errorOnFirstToken( node.name, Diagnostics.Pattern_0_can_have_at_most_one_Asterisk_character, text );
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

    /**
     * @param {ModuleDeclaration} node
     * @return {ModuleInstanceState}
     */
    export function getModuleInstanceState( node )
    {
        return node.body ? getModuleInstanceStateWorker( node.body ) : ModuleInstanceState.Instantiated;
    }

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
        const state        = getModuleInstanceState( node );
        const instantiated = state !== ModuleInstanceState.NonInstantiated;
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
        // For a given function symbol "<...>(...) => T" we want to generate a symbol identical
        // to the one we would get for: { <...>(...): T }
        //
        // We do that by making an anonymous type literal symbol, and then setting the function
        // symbol as its sole member. To the rest of the system, this symbol will be indistinguishable
        // from an actual type literal symbol you would have gotten had you used the long form.
        const symbol = createSymbol( SymbolFlags.Signature, getDeclarationName( node ) );

        symbol.add_declaration( node, SymbolFlags.Signature );

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

        if ( inStrictMode )
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
                const currentKind = prop.kind === SyntaxKind.PropertyAssignment || prop.kind === SyntaxKind.ShorthandPropertyAssignment || prop.kind === SyntaxKind.MethodDeclaration
                                    ? ElementKind.Property
                                    : ElementKind.Accessor;

                const existingKind = seen.get( identifier.escapedText );

                if ( !existingKind )
                {
                    seen.set( identifier.escapedText, currentKind );
                    continue;
                }

                if ( currentKind === ElementKind.Property && existingKind === ElementKind.Property )
                    throw new Error( "An object literal cannot have multiple properties with the same name in strict mode" );
            }
        }

        return bindAnonymousDeclaration( node, SymbolFlags.ObjectLiteral, InternalSymbolName.Object );
    }

    /**
     * @param {Declaration} node
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
     * @param {Declaration} node
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
                declareSymbol( blockScopeContainer.locals, /*parent*/ undefined, node, symbolFlags, symbolExcludes );
        }
    }

    /**
     * @param {Declaration} node
     */
    function bindBlockScopedVariableDeclaration( node )
    {
        bindBlockScopedDeclaration( node, SymbolFlags.BlockScopedVariable, SymbolFlags.BlockScopedVariableExcludes );
    }

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
                return checkTypePredicate( node as TypePredicateNode );
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
                return bindPropertyWorker( node as PropertyDeclaration | PropertySignature );
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
                return declareSymbolAndAddToSymbolTable( node, SymbolFlags.Constructor, /*symbolExcludes:*/ SymbolFlags.None );
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
                return bindAnonymousTypeWorker( node as TypeLiteralNode | MappedTypeNode | JSDocTypeLiteral );
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
                inStrictMode = true;
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
                return declareSymbolAndAddToSymbolTable( node, SymbolFlags.Alias,
                    SymbolFlags.AliasExcludes );

            case SyntaxKind.NamespaceExportDeclaration:
                return bindNamespaceExportDeclaration( node );

            case SyntaxKind.ImportClause:
                return bindImportClause( node );

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
     * The binder visits every node in the syntax tree so it is a convenient place to perform a single localized
     * check for reserved words used as identifiers in strict mode code.
     *
     * @param node
     */
    function checkStrictModeIdentifier( node )
    {
        if ( inStrictMode &&
             node.originalKeywordKind >= SyntaxKind.FirstFutureReservedWord &&
             node.originalKeywordKind <= SyntaxKind.LastFutureReservedWord &&
             !isIdentifierName( node ) &&
             !( node.flags & NodeFlags.Ambient ) )
        {
            throw new Error( 'reserved word somehow' );
        }
    }

    /**
     * @param {PropertyDeclaration | PropertySignature} node
     * @return {*}
     */
    function bindPropertyWorker( node )
    {
        return bindPropertyOrMethodOrAccessor( node, SymbolFlags.Property | ( node.questionToken ? SymbolFlags.Optional : SymbolFlags.None ), SymbolFlags.PropertyExcludes );
    }

    /**
     * @param {TypeLiteralNode | MappedTypeNode | JSDocTypeLiteral} node
     */
    function bindAnonymousTypeWorker( node )
    {
        return bindAnonymousDeclaration( node, SymbolFlags.TypeLiteral, InternalSymbolName.Type );
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
        // Export assignment in some sort of block construct
            bindAnonymousDeclaration( node, SymbolFlags.Alias, getDeclarationName( node ) );
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
            throw new Error( "Modifiers_cannot_appear_here" );


        if ( node.parent.kind !== SyntaxKind.SourceFile )
            throw new Error( "Global_module_exports_may_only_appear_at_top_level" );
        else
        {
            const parent = node.parent as SourceFile;

            if ( !isExternalModule( parent ) )
                throw new Error( "Global_module_exports_may_only_appear_in_module_files" );

            if ( !parent.isDeclarationFile )
                throw new Error( "Global_module_exports_may_only_appear_in_declaration_files" );
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
        {
            // Export * in some sort of block construct
            bindAnonymousDeclaration( node, SymbolFlags.ExportStar, getDeclarationName( node ) );
        }
        else if ( !node.exportClause )
        {
            // All export * declarations are collected in an __export symbol
            declareSymbol( container.symbol.exports, container.symbol, node, SymbolFlags.ExportStar, SymbolFlags.None );
        }
    }

    /**
     * @param {ImportClause} node
     */
    function bindImportClause( node )
    {
        if ( node.name )
            declareSymbolAndAddToSymbolTable( node, SymbolFlags.Alias, SymbolFlags.AliasExcludes );
    }

    /**
     * @param {Node} node
     */
    function setCommonJsModuleIndicator( node )
    {
        if ( !file.commonJsModuleIndicator )
        {
            file.commonJsModuleIndicator = node;

            if ( !file.externalModuleIndicator )
                bindSourceFileAsExternalModule();
        }
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
        const container = getThisContainer( node, /*includeArrowFunctions*/ false );
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
                declareSymbol( symbolTable, containingClass.symbol, node, SymbolFlags.Property, SymbolFlags.None, /*isReplaceableByMethod*/ true );
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
                bindExportsPropertyAssignment( node as BinaryExpression );
            else

                bindPropertyAssignment( target.escapedText, leftSideOfAssignment, /*isPrototypeProperty*/ false );
        }
    }

    /**
     * @param {string} name
     * @return {?Symbol}
     */
    function lookupSymbolForName( name )
    {
        return lookupSymbolForNameWorker( container, name );
    }

    /**
     * @param {string|Identifier} functionName
     * @param propertyAccess
     * @param isPrototypeProperty
     */
    function bindPropertyAssignment( functionName, propertyAccess, isPrototypeProperty )
    {
        const symbol = lookupSymbolForName( functionName );

        let targetSymbol = symbol && isDeclarationOfFunctionOrClassExpression( symbol ) ? symbol.valueDeclaration.initializer.symbol : symbol;

        assert( propertyAccess.parent.kind === SyntaxKind.BinaryExpression || propertyAccess.parent.kind === SyntaxKind.ExpressionStatement );

        let isLegalPosition: boolean;

        if ( propertyAccess.parent.kind === SyntaxKind.BinaryExpression )
        {
            const initializerKind = ( propertyAccess.parent as BinaryExpression ).right.kind;
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
                targetSymbol = declareSymbol( container.locals, /*parent*/ undefined, identifier, flags, excludeFlags );
        }

        if ( !targetSymbol || !( targetSymbol.flags & ( SymbolFlags.Function | SymbolFlags.Class | SymbolFlags.NamespaceModule ) ) )
            return;

        // Set up the members collection if it doesn't exist already
        const symbolTable = isPrototypeProperty ?
                            ( targetSymbol.members || ( targetSymbol.members = createSymbolTable() ) ) :
                            ( targetSymbol.exports || ( targetSymbol.exports = createSymbolTable() ) );

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
        if ( !file.commonJsModuleIndicator && isRequireCall( node, /*checkArgumentIsStringLiteral*/ false ) )
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
         * @type {TransientSymbol}
         */
        const
            prototypeSymbol = createSymbol( SymbolFlags.Property | SymbolFlags.Prototype, "prototype" ),
            symbolExport    = symbol.exports.get( prototypeSymbol.escapedName );

        if ( symbolExport )
        {
            if ( node.name )
                node.name.parent = node;

            throw new Error( `Duplicate identifier ${symbolName( prototypeSymbol )}` );
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
        if ( inStrictMode )
            checkStrictModeEvalOrArguments( node, node.name );

        if ( !isBindingPattern( node.name ) )
        {
            if ( isBlockOrCatchScoped( node ) )
                bindBlockScopedVariableDeclaration( node );
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

export function isBindingPattern(node)
{
    if (node)
    {
        const kind = node.kind;

        return kind === SyntaxKind.ArrayBindingPattern || kind === SyntaxKind.ObjectBindingPattern;
    }

    return false;
}

export function isParameterPropertyDeclaration(node)
{
    return hasModifier(node, ModifierFlags.ParameterPropertyModifier) && node.parent.kind === SyntaxKind.Constructor && isClassLike(node.parent.parent);
}

export function isAccessor(node)
{
    return node && (node.kind === SyntaxKind.GetAccessor || node.kind === SyntaxKind.SetAccessor);
}


    /**
     * @param {ParameterDeclaration} node
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
     * @param {FunctionDeclaration} node
     */
    function bindFunctionDeclaration( node )
    {
        if ( !file.isDeclarationFile && !( node.flags & NodeFlags.Ambient ) )
        {
            if ( isAsyncFunction( node ) )
                emitFlags |= NodeFlags.HasAsyncFunctions;
        }

        if ( inStrictMode )
            bindBlockScopedDeclaration( node, SymbolFlags.Function, SymbolFlags.FunctionExcludes );
        else
            declareSymbolAndAddToSymbolTable( node, SymbolFlags.Function, SymbolFlags.FunctionExcludes );
    }

    /**
     * @param {FunctionExpression} node
     */
    function bindFunctionExpression( node )
    {
        if ( !file.isDeclarationFile && !( node.flags & NodeFlags.Ambient ) )
        {
            if ( isAsyncFunction( node ) )
                emitFlags |= NodeFlags.HasAsyncFunctions;
        }

        // Throw error if node is Indetifier and name is either `eval` or `arguments`
        const bindingName = node.name ? node.name.escapedText : InternalSymbolName.Function;
        return bindAnonymousDeclaration( node, SymbolFlags.Function, bindingName );
    }

    function bindPropertyOrMethodOrAccessor( node, symbolFlags, symbolExcludes )
    {
        if ( !file.isDeclarationFile && !( node.flags & NodeFlags.Ambient ) && isAsyncFunction( node ) )
            emitFlags |= NodeFlags.HasAsyncFunctions;

        return hasDynamicName( node )
               ? bindAnonymousDeclaration( node, symbolFlags, InternalSymbolName.Computed )
               : declareSymbolAndAddToSymbolTable( node, symbolFlags, symbolExcludes );
    }
}


/**
 * @param {Expression} node
 */
function bindCondition(node)
{
    bind(node);
}


/**
 * @param {Statement} node
 */
function bindIterativeStatement(node)
{
    bind(node);
}

/**
 * @param {WhileStatement} node
 */
function bindWhileStatement(node)
{
    bindCondition( node.expression );
    bindIterativeStatement( node.statement );
}

/**
 * @param {DoStatement} node
 */
function bindDoStatement(node)
{
    // if do statement is wrapped in labeled statement then target labels for break/continue with or without
    // label should be the same
    bindIterativeStatement(node.statement);
    bindCondition(node.expression);
}

/**
 * @param {ForStatement} node
 */
function bindForStatement(node)
{
    bind(node.initializer);
    bindCondition(node.condition);
    bindIterativeStatement(node.statement);
    bind(node.incrementor);
}

/**
 * @param {ForInOrOfStatement} node
 */
function bindForInOrForOfStatement(node)
{
    if (node.kind === SyntaxKind.ForOfStatement) {
        bind( node.awaitModifier );
    }

    bind(node.expression);
    bind(node.initializer);

    if (node.initializer.kind !== SyntaxKind.VariableDeclarationList)
        bindAssignmentTargetFlow(node.initializer);
            bindIterativeStatement(node.statement, postLoopLabel, preLoopLabel);

}

/**
 *
 * @param {IfStatement} node
 */
function bindIfStatement(node)
{
                bindCondition(node.expression, thenLabel, elseLabel);
                bind(node.thenStatement);
                bind(node.elseStatement);
            }

/**
 * @param {ReturnStatement | ThrowStatement} node
 */
function bindReturnOrThrow(node)
{
    bind(node.expression);
}

/**
 * @param {TryStatement} node
 */
function bindTryStatement(node)
{
                // TODO: Every statement in try block is potentially an exit point!
                bind(node.tryBlock);

                if (node.catchClause)
                    bind(node.catchClause);

                if (node.finallyBlock)
                {
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

                    bind(node.finallyBlock);
                }
}

/**
 * @param {SwitchStatement} node
 */
function bindSwitchStatement(node)
{
    bind(node.expression);
    bind(node.caseBlock);
}

/**
 * @param {CaseBlock} node
 */
function bindCaseBlock(node)
{
    const clauses = node.clauses;
                for (let i = 0; i < clauses.length; i++)
                {
                    const clauseStart = i;
                    while (!clauses[i].statements.length && i + 1 < clauses.length)
                    {
                        bind(clauses[i]);
                        i++;
                    }

                const clause = clauses[i];
                bind(clause);
                }

}

/**
 * @param {CaseClause} node
 */
function bindCaseClause(node)
{
    bind(node.expression);
    bindEach(node.statements);
}

/**
 * @param {LabeledStatement} node
 */
function bindLabeledStatement(node)
{
    bind(node.label);
    bind(node.statement);
}

/**
 * @param {Expression} node
 */
function bindDestructuringTargetFlow(node)
{
                if (node.kind === SyntaxKind.BinaryExpression && node.operatorToken.kind === SyntaxKind.EqualsToken) {
                    bindAssignmentTargetFlow(node.left);
                        }
                else {
                    bindAssignmentTargetFlow(node);
                }
}

/**
 * @param {Expression} node
 */
function bindAssignmentTargetFlow(node)
{
    if (isNarrowableReference(node))
    {
        currentFlow = createFlowAssignment(currentFlow, node);
    }
    else if (node.kind === SyntaxKind.ArrayLiteralExpression)
    {
                for (const e of node.elements)
                {
                    if (e.kind === SyntaxKind.SpreadElement)
                        bindAssignmentTargetFlow(e.expression);
                    else
                        bindDestructuringTargetFlow(e);
                }
    }
    else if (node.kind === SyntaxKind.ObjectLiteralExpression)
    {
        for (const p of node.properties)
        {
                        if (p.kind === SyntaxKind.PropertyAssignment)
                        bindDestructuringTargetFlow(p.initializer);
                        else if (p.kind === SyntaxKind.ShorthandPropertyAssignment)
                            bindAssignmentTargetFlow(p.name);
                        else if (p.kind === SyntaxKind.SpreadAssignment)
                            bindAssignmentTargetFlow(p.expression);
        }

    }

}

/**
 * @param {BinaryExpression} node
 */
function bindLogicalExpression(node)
{
    if (node.operatorToken.kind === SyntaxKind.AmpersandAmpersandToken)
    {
                bindCondition(node.left);
    }
    else
        {
            bindCondition(node.left);
        }

        bind(node.operatorToken);
    bindCondition(node.right);
}

/**
 * @param {PrefixUnaryExpression} node
 */
function bindPrefixUnaryExpressionFlow(node)
{
    if (node.operator === SyntaxKind.ExclamationToken)
    {
                bindEachChild(node);
    }
    else
        {
                bindEachChild(node);
                if (node.operator === SyntaxKind.PlusPlusToken || node.operator === SyntaxKind.MinusMinusToken)
                {
                    bindAssignmentTargetFlow(node.operand);
                }
        }
}

/**
 * @param {PostfixUnaryExpression} node
 */
function bindPostfixUnaryExpressionFlow(node)
{
    bindEachChild(node);
    if (node.operator === SyntaxKind.PlusPlusToken || node.operator === SyntaxKind.MinusMinusToken)
    {
        bindAssignmentTargetFlow(node.operand);
    }
}

/**
 * @param {BinaryExpression} node
 */
function bindBinaryExpressionFlow(node)
{
    const operator = node.operatorToken.kind;

    if (operator === SyntaxKind.AmpersandAmpersandToken || operator === SyntaxKind.BarBarToken)
    {
                if (isTopLevelLogicalExpression(node))
                {
                    bindLogicalExpression(node);
                }
                else
                    {
                bindLogicalExpression(node);
            }
    }
    else
        {

            bindEachChild(node);

            if (isAssignmentOperator(operator) && !isAssignmentTarget(node))
            {
                bindAssignmentTargetFlow(node.left);

                if (operator === SyntaxKind.EqualsToken && node.left.kind === SyntaxKind.ElementAccessExpression)
                {
                    const elementAccess = node.left;

                    if (isNarrowableOperand(elementAccess.expression))
                    {
                        currentFlow = createFlowArrayMutation(currentFlow, node);
                    }
                }
            }
            }

}

/**
 * @param {DeleteExpression} node
 */
function bindDeleteExpressionFlow(node)
{
    bindEachChild(node);

    if (node.expression.kind === SyntaxKind.PropertyAccessExpression)
    {
        bindAssignmentTargetFlow(node.expression);
    }
}

/**
 * @param {ConditionalExpression} node
 */
function bindConditionalExpressionFlow(node)
{
    bindCondition(node.condition);
    bind(node.questionToken);
    bind(node.whenTrue);
    bind(node.colonToken);
    bind(node.whenFalse);
}

/**
 * @param {VariableDeclaration | ArrayBindingElement} node
 */
function bindInitializedVariableFlow(node)
{
    const name = !isOmittedExpression(node) ? node.name : undefined;

    if (isBindingPattern(name))
    {
        for (const child of name.elements)
        {
            bindInitializedVariableFlow(child);
        }
    }
}

/**
 * @param {VariableDeclaration} node
 */
function bindVariableDeclarationFlow(node)
{
    bindEachChild(node);

    if (node.initializer || isForInOrOfStatement(node.parent.parent))
    {
        bindInitializedVariableFlow(node);
    }
}

/**
 * @param {JSDoc} node
 */
function bindJSDocComment(node)
{
    forEachChild(node, n => { if (n.kind !== SyntaxKind.JSDocTypedefTag) bind(n); } );
}

/**
 * @param {JSDocTypedefTag} node
 */
function bindJSDocTypedefTag(node)
{
    forEachChild(node, n => {
                    // if the node has a fullName "A.B.C", that means symbol "C" was already bound
                    // when we visit "fullName"; so when we visit the name "C" as the next child of
                    // the jsDocTypedefTag, we should skip binding it.
        if (node.fullName && n === node.name && node.fullName.kind !== SyntaxKind.Identifier)
            return;

        bind(n);
    });
}

/**
 * @param {CallExpression} node
 */
function bindCallExpressionFlow(node)
{
    // If the target of the call expression is a function expression or arrow function we have
                // an immediately invoked function expression (IIFE). Initialize the flowNode property to
                // the current control flow (which includes evaluation of the IIFE arguments).
    let expr = node.expression;

    while (expr.kind === SyntaxKind.ParenthesizedExpression)
        expr = expr.expression;

    if (expr.kind === SyntaxKind.FunctionExpression || expr.kind === SyntaxKind.ArrowFunction)
    {
        bindEach(node.typeArguments);
        bindEach(node.arguments);
        bind(node.expression);
    }
    else
    {
        bindEachChild(node);
    }
}
