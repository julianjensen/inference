/** ******************************************************************************************************************
 * @file Describe what scopes does.
 * @author Julian Jensen <jjdanois@gmail.com>
 * @since 1.0.0
 * @date 27-May-2018
 *********************************************************************************************************************/
"use strict";

import { type } from 'typeofs';

const
    string = s => type( s ) === 'string',
    keys = o => Object.keys( o ),
    danger = new Set( keys( Object ).concat( keys( {} ) ).concat( keys( function() {} ) ).concat( keys( Function ) ) ),
    escapeId = s => danger.has( s ) ? `__${s}` : s;

/** @typedef {Identifier|Type} Entry */

/** */
export class ScopeManager
{
    /** */
    static init()
    {
        ScopeManager.global = ScopeManager.current = new Scope( null );
        ScopeManager.scopes = new Map();
    }

    /**
     * @param {?Scope} parent
     * @param {Entry} def
     * @return {Scope}
     */
    static create( parent, def )
    {
        const scope = new Scope( parent, def );

        ScopeManager.scopes.set( def, scope );

        return scope;
    }

    /**
     * @param {Entry} def
     * @return {?Scope}
     */
    static get( def )
    {
        return def instanceof Scope ? def : ScopeManager.scopes.get( def );
    }

    /**
     * @param {Entry|Scope} def
     */
    static active( def )
    {
        const _def = def instanceof Scope ? def : ScopeManager.get( def );

        if ( !_def )
            throw new Error( `Cannot set active scope from: ${JSON.stringify( _def, null, 4 )}` );

        ScopeManager.current = _def;
    }

    /** */
    static reset()
    {
        for ( const scope of ScopeManager.deep() )
            scope.reset();
    }

    /** */
    static clear()
    {
        for ( const scope of ScopeManager.deep() )
            scope.clear();
    }

    /**
     * @return {IterableIterator<Scope>}
     */
    static *[ Symbol.iterator ]()
    {
        yield *ScopeManager.global;
    }

    /**
     * @return {IterableIterator<IterableIterator<Scope>|IterableIterator<Type|Identifier>>}
     */
    static *deep()
    {
        yield *ScopeManager.global.deep();
    }

    /**
     * @param {boolean} [deep=false]
     * @return {IterableIterator<IterableIterator<Entry>>}
     */
    static *forEachSymbol( deep = false )
    {
        yield *ScopeManager.global.forEachSymbol( deep );
    }
}

/** */
export class Scope
{
    /**
     * @param {?Scope} parent
     * @param {Entry} [definer=null]
     */
    constructor( parent, definer = null )
    {
        /** @type {Map<string, Identifier|Type>} */
        this.symbols = new Map();
        /** @type {Array<Scope>} */
        this.children = [];
        /** @type {Identifier|Type} */
        this.definedBy = definer;
        /** @type {?Scope} */
        this.parent = parent;
    }

    reset()
    {
        this.symbols.clear();
        this.children = [];
        this.definedBy = null;
        this.parent = null;
    }

    clear()
    {
        this.reset();
        this.symbols = void 0;
        this.children = void 0;
        this.definedBy = void 0;
        this.parent = void 0;
    }

    /**
     * @param {Entry} definer
     * @return {Scope}
     */
    ownScope( definer )
    {
        return this.children.find( s => s.definedBy === definer );
    }

    /**
     * @param {Entry} definer
     * @return {boolean}
     */
    hasOwnScope( definer )
    {
        return this.children.findIndex( s => s.definedBy === definer ) !== -1;
    }

    /**
     * @param {Entry} sym
     * @return {Scope}
     */
    from( sym )
    {
        const exists = this.ownScope( sym );

        if ( exists ) return exists;

        const scope = ScopeManager.create( this, sym );

        this.children.push( scope );

        return scope;
    }

    /**
     * @param {Entry|string} sym
     * @param {boolean} [selfOnly=false]
     * @return {?Entry}
     */
    find( sym, selfOnly = false )
    {
        const
            name = string( sym ) ? sym : sym.name,
            _name = escapeId( name );

        if ( this.symbols.has( _name ) )
            return this.symbols.get( _name );

        if ( !this.parent || selfOnly ) return null;

        return this.parent.find( name );
    }

    get( sym, selfOnly = true )
    {
        return this.find( sym, selfOnly );
    }

    /**
     * @param {Entry} sym
     * @param {string} [name]
     * @returns {Entry}
     */
    add( sym, name = sym.name )
    {
        sym.outer = this;
        this.symbols.set( escapeId( name ), sym );

        return sym;
    }

    /** @type {number} */
    get size()
    {
        return this.symbols.size;
    }

    /**
     * @param {Entry|string} sym
     * @return {?Entry}
     */
    has( sym )
    {
        return this.find( sym );
    }

    /**
     * @param {Entry|string} sym
     * @return {?Entry}
     */
    hasOwn( sym )
    {
        return this.find( sym, true );
    }

    /**
     * @return {IterableIterator<IterableIterator<Scope>>}
     */
    *[ Symbol.iterator ]()
    {
        yield *this.children;
    }

    /**
     * @return {IterableIterator<Scope>}
     */
    *deep()
    {
        for ( const c of this.children )
            yield *c.deep();

        yield this;
    }

    *forEachSymbol( deep = false )
    {
        if ( !deep )
        {
            yield *this.symbols.values();
            return;
        }

        for ( const c of this.children )
            yield *c.forEachSymbol( true );

        yield *this.symbols.values();
    }

    /**
     * @param {Type|Identifier} klass
     * @param {boolean} [deep=false]
     * @return {IterableIterator<Entry>}
     */
    *forEach( klass, deep = false )
    {
        if ( !deep )
        {
            for ( const v of this.symbols.values() )
                if ( v instanceof klass ) yield v;

            return;
        }

        for ( const c of this.children )
            yield *c.forEach( klass, true );

        for ( const v of this.symbols.values() )
            if ( v instanceof klass ) yield v;
    }

    /**
     * @param fn
     */
    map( fn )
    {
        [ ...this.forEachSymbol() ].map( fn );
    }
}

ScopeManager.init();
