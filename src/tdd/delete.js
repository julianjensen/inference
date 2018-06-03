/** ****************************************************************************
 * DESCRIPTION
 * @author julian.jensen
 * @since 0.0.1
 *******************************************************************************/
"use strict";

import { create_type } from "./type-system-basics";

/** */
class Scope
{
    /**
     * @param {Type} definedBy
     * @param {Scope} parent
     */
    constructor( definedBy = null, parent = null )
    {
        this.symbolTable = new Map();
        this.parent = parent;
        this.children = new Map();
        this.definedBy = definedBy;
    }

    /** @type {number} */
    get size()
    {
        return this.symbolTable.size;
    }

    /** */
    clear()
    {
        for ( const c of this.children.values() )
            c.clear();

        this.symbolTable.clear();
        this.children.clear();

        this.symbolTable = this.parent = this.children = this.definedBy = void 0;
    }

    /**
     * @param {string} name
     * @return {Type|Identifier}
     */
    get( name )
    {
        const _name = escapeId( name );

        if ( this.symbolTable.has( _name ) ) return this.symbolTable.get( _name );

        if ( this.parent ) return this.parent.get( name );

        return null;
    }

    /**
     * @param {string} name
     * @return {Identifier|Type|undefined}
     */
    own( name )
    {
        return this.symbolTable.get( escapeId( name ) );
    }

    /**
     * @param {string} name
     * @return {boolean}
     */
    has( name )
    {
        if ( this.symbolTable.has( escapeId( name ) ) ) return true;

        if ( this.parent ) return this.parent.has( name );

        return false;
    }

    /**
     * @param {string} name
     * @param {Identifier|Type} payload
     * @return {Scope}
     */
    add( name, payload )
    {
        this.symbolTable.set( escapeId( name ), payload );

        return this;
    }

    /**
     * @param {object} def
     * @return {Scope}
     */
    add_child( def )
    {
        this.children.set( def, new Scope( def, this ) );
        return this;
    }

    /**
     * @param {object} def
     * @return {boolean}
     */
    has_child( def )
    {
        return this.children.has( def );
    }

    /**
     * @return {IterableIterator<IterableIterator<Scope>>}
     */
    *[Symbol.iterator]()
    {
        yield *this.children.values();
    }

    /**
     * @return {IterableIterator<Type|Identifier>}
     */
    *deep()
    {
        yield *this.symbolTable.values();

        for ( const c of this )
            yield *c.deep();
    }
}

/** */
export class ScopeManager
{
    /** */
    static init()
    {
        /** @type {Scope} */
        ScopeManager.current = ScopeManager.global = new Scope();
        ScopeManager.direct = new Map();
        [ 'any', 'never', 'undefined', 'void', 'number', 'string', 'boolean', 'symbol', 'null' ].forEach( tid => create_type( 'primitive', tid ) );
    }

    /** */
    static reset()
    {
        ScopeManager.global.clear();
        ScopeManager.init();
    }

    /**
     * @param {string} name
     * @param {object} payload
     * @return {ScopeManager}
     */
    static add_symbol( name, payload )
    {
        ScopeManager.current.add( name, payload );

        return ScopeManager;
    }

    /**
     * @param {string} name
     * @return {object}
     */
    static get_symbol( name )
    {
        return ScopeManager.current.get( name );
    }

    /**
     * @param {Type} definer
     * @return {Scope}
     */
    static create( definer )
    {
        if ( ScopeManager.direct.has( definer ) ) return ScopeManager.direct.get( definer );

        const scope = ScopeManager.current.add_child( definer );

        ScopeManager.direct.set( definer, scope );

        return scope;
    }

    /**
     * @return {ScopeManager}
     */
    static up()
    {
        if ( ScopeManager.current.parent ) ScopeManager.current = ScopeManager.current.parent;

        return ScopeManager;
    }

    /**
     * @param {Type} definer
     * @return {?ScopeManager}
     */
    static enter( definer )
    {
        if ( ScopeManager.current.definedBy === definer ) return ScopeManager;

        if ( ScopeManager.direct.has( definer ) )
        {
            ScopeManager.current = ScopeManager.direct.get( definer );
            return ScopeManager;
        }

        return null;
    }

    /**
     * @param {Type} definer
     * @return {ScopeManager}
     */
    static in( definer )
    {
        if ( !definer )
            ScopeManager.current = ScopeManager.global;
        else if ( ScopeManager.direct.has( definer ) )
            ScopeManager.current = ScopeManager.direct.get( definer );
        else if ( !ScopeManager.enter( definer ) )
            ScopeManager.create( definer ).enter( definer );

        return ScopeManager;
    }

    /**
     * @return {IterableIterator<IterableIterator<Type>>}
     */
    static *[ Symbol.iterator ]()
    {
        yield *ScopeManager.current.symbolTable.values();
    }

    /**
     * @return {IterableIterator<IterableIterator<Type>>}
     */
    static *deep()
    {
        yield *ScopeManager;

        for ( const scope of ScopeManager.current.children.values() )
            yield *scope.deep();
    }

    /**
     * @param {string} name
     * @return {boolean}
     */
    static has( name )
    {
        return ScopeManager.current.has( name );
    }
}

