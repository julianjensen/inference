/** ****************************************************************************************************
 * File: symbol (jsdoc-tag-parser)
 * @author julian on 3/3/18
 * @version 1.0.0
 * @copyright Planet3, Inc.
 *******************************************************************************************************/

'use strict';

import { SyntaxKind }                  from "../ts/ts-helpers";
import {
    CharacterCodes,
    SymbolFlags,
    enumRelation, TypeFlags
} from "../types";

let nextSymbolId = 1;

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
        this.name = this.escapedName      = name;
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

    add_declaration( symbol, node, symbolFlags )
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

}

