/** ****************************************************************************************************
 * File: symbol (jsdoc-tag-parser)
 * @author julian on 3/3/18
 * @version 1.0.0
 * @copyright Planet3, Inc.
 *******************************************************************************************************/
'use strict';

/**
 * @typedef {Map} SymbolTable
 */

import { SyntaxKind }                                                                                                  from "../ts/ts-helpers";
import {
    CharacterCodes,
    SymbolFlags,
    enumRelation, TypeFlags, CheckFlags, InternalSymbolName
}                                                                                                               from "../types";
import { get_ext_ref, getNameOfDeclaration, hasLateBindableName, implement, isReservedMemberName} from "../utils";
import { hasStaticModifier }                                                                                    from "./modifiers";
import { pushIfUnique, some }                                                                                   from "./array-ish";

let nextSymbolId = 1;

const
    symbolLinks   = {},
    mergedSymbols = {};

/**
 * @class
 */
export class Symbol
{
    /**
     * @param {SymbolFlags} flags
     * @param {string} name
     */
    constructor( flags, name )
    {
        this.name = this.escapedName = name;
        this.declarations     = void 0;
        this.valueDeclaration = void 0;
        this.members          = void 0;
        this.exports          = void 0;
        this.globalExports    = void 0;

        this._id          = nextSymbolId++;
        this.mergeId      = 0;
        this.parent       = null;
        this.exportSymbol = null;
        this.isReferenced = false;
        this.isAssigned   = false;

        /** @type {SymbolFlags} */
        this.flags = flags;
    }

    /**
     * @return {SymbolFlags|number}
     */
    get flags()
    {
        return this._flags || ( this._flags = SymbolFlags() );
    }

    /**
     * @param {SymbolFlags|number} v
     */
    set flags( v )
    {
        this._flags = SymbolFlags( v );
    }

    add_declaration( node, symbolFlags )
    {
        this.flags |= symbolFlags;

        node.symbol = this;

        if ( !this.declarations )
            this.declarations = [ node ];
        else
            this.declarations.push( node );

        if ( symbolFlags & SymbolFlags.HasExports && !this.exports )
            this.exports = new Map();

        if ( symbolFlags & SymbolFlags.HasMembers && !this.members )
            this.members = new Map();

        if ( symbolFlags & SymbolFlags.Value )
        {
            const vdecl = this.valueDeclaration;

            if ( !vdecl || ( vdecl.kind !== node.kind && vdecl.kind === SyntaxKind.ModuleDeclaration ) )
                this.valueDeclaration = node;
        }
    }

    get displayName()
    {
        const _name = this._escapedName;

        return _name.length >= 3 && _name.charCodeAt( 0 ) === CharacterCodes._ && _name.charCodeAt( 1 ) === CharacterCodes._ && _name.charCodeAt( 2 ) === CharacterCodes._ ? _name.substr( 1 ) : _name;
    }

    get escapedName()
    {
        return this._escapedName;
    }

    set escapedName( name )
    {
        this._escapedName = name.length >= 2 && name.charCodeAt( 0 ) === CharacterCodes._ && name.charCodeAt( 1 ) === CharacterCodes._ ? "_" + name : name;
    }

    /**
     * @return {number}
     */
    get id()
    {
        return this._id;
    }

    /**
     * @param {Symbol} targetSymbol
     * @return {boolean}
     */
    isEnumTypeRelatedTo( targetSymbol )
    {
        if ( this === targetSymbol ) return true;

        const
            id       = this.id + "," + targetSymbol.id,
            relation = enumRelation.get( id );

        if ( relation !== undefined ) return relation;

        if ( this.escapedName !== targetSymbol.escapedName || !( this.flags & SymbolFlags.RegularEnum ) || !( targetSymbol.flags & SymbolFlags.RegularEnum ) )
        {
            enumRelation.set( id, false );
            return false;
        }

        const targetEnumType = targetSymbol.getTypeOfSymbol();

        for ( const property of this.getTypeOfSymbol().getPropertiesOfType() )
        {
            if ( property.flags & SymbolFlags.EnumMember )
            {
                const targetProperty = targetEnumType.getPropertyOfType( property.escapedName );

                if ( !targetProperty || !( targetProperty.flags & SymbolFlags.EnumMember ) )
                {
                    enumRelation.set( id, false );
                    return false;
                }
            }
        }
        enumRelation.set( id, true );
        return true;
    }

    /**
     * @return {SymbolLinks}
     */
    getSymbolLinks()
    {
        if ( this.flags & SymbolFlags.Transient ) return this;

        return symbolLinks[ this.id ] || ( symbolLinks[ this.id ] = {} );
    }

    getResolvedMembersOrExports( resolutionKind )
    {
        const links = this.getSymbolLinks();

        if ( !links[ resolutionKind ] )
        {
            const
                isStatic     = resolutionKind === 'resolvedExports',
                earlySymbols = !isStatic ? this.members :
                               this.flags & SymbolFlags.Module ? this.getExportsOfModuleWorker() :
                               this.exports;

            // In the event we recursively resolve the members/exports of the symbol, we
            // set the initial value of resolvedMembers/resolvedExports to the early-bound
            // members/exports of the symbol.
            links[ resolutionKind ] = earlySymbols || get_ext_ref( 'emptySymbols' );

            // fill in any as-yet-unresolved late-bound members.
            const lateSymbols = new Map();
            for ( const decl of this.declarations )
            {
                const members = decl.getMembers();
                if ( members )
                {
                    for ( const member of members )
                    {
                        if ( isStatic === member.hasStaticModifier() && member.hasLateBindableName() )
                            this.lateBindMember( earlySymbols, lateSymbols, member );
                    }
                }
            }

            links[ resolutionKind ] = combineSymbolTables( earlySymbols, lateSymbols ) || get_ext_ref( 'emptySymbols' );
        }

        return links[ resolutionKind ];
    }
    hasExportAssignment()
    {
        return this.exports.get( InternalSymbolName.ExportEquals ) !== undefined;
    }

    static symbolsToArray(symbols)
    {
        const result = [];

        symbols.forEach( ( symbol, id ) => {
            if ( !isReservedMemberName( id ) ) result.push(symbol);
        } );

        return result;
    }

    getExportsAsArray()
    {
        return Symbol.symbolsToArray( this.getExports() );
    }
    /**
     * @param {Symbol} moduleSymbol
     * @return {SymbolTable}
     */
    getExportsOfModuleWorker( moduleSymbol )
    {
        const visitedSymbols = [];

        // A module defined by an 'export=' consists on one export that needs to be resolved
        moduleSymbol = moduleSymbol && moduleSymbol.resolveExternal();

        return visit( moduleSymbol ) || get_ext_ref( 'emptySymbols' );

        // The ES6 spec permits export * declarations in a module to circularly reference the module itself. For example,
        // module 'a' can 'export * from "b"' and 'b' can 'export * from "a"' without error.
        function visit( symbol )
        {
            if ( !( symbol && symbol.flags & SymbolFlags.HasExports && pushIfUnique( visitedSymbols, symbol ) ) )
                return;

            const symbols = new Map( ...symbol.exports );

            // All export * declarations are collected in an __export symbol by the binder
            const exportStars = symbol.exports.get( InternalSymbolName.ExportStar );

            if ( exportStars )
            {
                const
                    nestedSymbols = new Map(),
                    lookupTable   = new Map();

                for ( const node of exportStars.declarations )
                {
                    const
                        resolvedModule  = resolveExternalModuleName( node, node.moduleSpecifier ),
                        exportedSymbols = visit( resolvedModule );

                    extendExportSymbols( nestedSymbols, exportedSymbols, lookupTable, node );
                }

                lookupTable.forEach( ( { exportsWithDuplicate }, id ) => {
                    // It's not an error if the file with multiple `export *`s with duplicate names exports a member with that name itself
                    if ( id === "export=" || !( exportsWithDuplicate && exportsWithDuplicate.length ) || symbols.has( id ) )
                        return;
                } );
                extendExportSymbols( symbols, nestedSymbols );
            }

            return symbols;
        }
    }

    /**
     * @param {boolean} [dontResolveAlias]
     * @return {*|ts.Symbol}
     */
    resolveExternal( dontResolveAlias )
    {
        const s = this.exports.get( InternalSymbolName.ExportEquals ).resolveSymbol( dontResolveAlias );

        return s && s.getMergedSymbol() || this;
    }

    /**
     * @return {SymbolTable}
     */
    getExports()
    {
        return this.flags & SymbolFlags.Class
               ? this.getResolvedMembersOrExports( 'resolvedExports' )
               : this.flags & SymbolFlags.Module
                 ? this.getExportsOfModule()
                 : this.exports || get_ext_ref( 'emptySymbols' );
    }

    getExportsOfModule()
    {
        const links = this.getSymbolLinks();

        return links.resolvedExports || ( links.resolvedExports = this.getExportsOfModuleWorker() );
    }

    /**
     * Gets a SymbolTable containing both the early- and late-bound members of a symbol.
     *
     * For a description of late-binding, see `lateBindMember`.
     *
     * @return {Symbol}
     */
    getMembers()
    {
        return this.flags & SymbolFlags.LateBindingContainer ? this.getResolvedMembersOrExports( 'resolvedMembers' ) : this.members || get_ext_ref( 'emptySymbols' );
    }

    /**
     * If a symbol is the dynamic name of the member of an object type, get the late-bound
     * symbol of the member.
     *
     * For a description of late-binding, see `lateBindMember`.
     */
    getLateBoundSymbol()
    {
        if ( this.flags & SymbolFlags.ClassMember && this.escapedName === InternalSymbolName.Computed )
        {
            const links = this.getSymbolLinks();

            if ( !links.lateSymbol && some( this.declarations, hasLateBindableName ) )
            {
                // force late binding of members/exports. This will set the late-bound symbol
                if ( some( this.declarations, hasStaticModifier ) )
                    this.parent.getExports();
                else
                    this.parent.getMembers();
            }

            return links.lateSymbol || ( links.lateSymbol = this );
        }
        return this;
    }

    /**
     * @return {Symbol}
     */
    getMergedSymbol()
    {
        let merged;
        return this.mergeId && ( merged = mergedSymbols[ this.mergeId ] ) ? merged : this;
    }
}

/**
 * @this Symbol
 * @interface
 */
const SymbolLinks = {
    immediateTarget:                null,    // Immediate target of an alias. May be another alias. Do not access directly, use `checker.getImmediateAliasedSymbol` instead.
    target:                         null,    // Resolved (non-alias) target of an alias
    type:                           null,    // Type of value symbol
    declaredType:                   null,    // Type of class, interface, enum, type alias, or type parameter
    typeParameters:                 null,    // Type parameters of type alias (undefined if non-generic)
    inferredClassType:              null,    // Type of an inferred ES5 class
    instantiations:                 null,    // Instantiations of generic type alias (undefined if non-generic)
    mapper:                         null,    // Type mapper for instantiation alias
    referenced:                     null,    // True if alias symbol has been referenced as a value
    containingType:                 null,    // Containing union or intersection type for synthetic property
    leftSpread:                     null,    // Left source for synthetic spread property
    rightSpread:                    null,    // Right source for synthetic spread property
    syntheticOrigin:                null,    // For a property on a mapped or spread type, points back to the original property
    syntheticLiteralTypeOrigin:     null,    // For a property on a mapped type, indicates the type whose text to use as the declaration name, instead of the symbol name
    isDiscriminantProperty:         null,    // True if discriminant synthetic property
    resolvedExports:                null,    // Resolved exports of module or combined early- and late-bound static members of a class.
    resolvedMembers:                null,    // Combined early- and late-bound members of a symbol
    exportsChecked:                 null,    // True if exports of external module have been checked
    typeParametersChecked:          null,    // True if type parameters of merged class and interface declarations have been checked.
    isDeclarationWithCollidingName: null,    // True if symbol is block scoped redeclaration
    bindingElement:                 null,    // Binding element associated with property symbol
    exportsSomeValue:               null,    // True if module exports some value (not just types)
    enumKind:                       null,    // Enum declaration classification
    originatingImport:              null,    // Import declaration which produced the symbol, present if the symbol is marked as uncallable but had call signatures in `resolveESModuleSymbol`
    lateSymbol:                     null    // Late-bound symbol for a computed property
};

/**
 * @class
 * @implements SymbolLinks
 */
export class TransientSymbol extends Symbol
{
    /**
     * @param {SymbolFlags} flags
     * @param {string} name
     */
    constructor( flags, name )
    {
        super( flags, name );
        this.checkFlags      = CheckFlags();
        this.isRestParameter = false;
    }
}

implement( TransientSymbol, SymbolLinks );

/**
 * @class
 */
export class ReverseMappedSymbol extends TransientSymbol
{
    constructor()
    {
        super();
        this.propertyType = null;
        this.mappedType   = null;
    }
}


/**
 * @param {SymbolFlags} flags
 * @param {string} name
 * @param {?CheckFlags} [checkFlags]
 * @returns {Symbol}
 */
export function createSymbol( flags, name, checkFlags = CheckFlags() )
{
    const symbol      = new TransientSymbol( SymbolFlags( flags | SymbolFlags.Transient ), name );
    symbol.checkFlags = CheckFlags( checkFlags );
    return symbol;
}

