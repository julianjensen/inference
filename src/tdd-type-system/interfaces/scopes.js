/** ******************************************************************************************************************
 * @file Describe what scopes does.
 * @author Julian Jensen <jjdanois@gmail.com>
 * @since 1.0.0
 * @date 27-May-2018
 *********************************************************************************************************************/
"use strict";

const
    keys     = o => Object.keys( o ),
    danger   = new Set( keys( Object ).concat( keys( {} ) ).concat( keys( function() {} ) ).concat( keys( Function ) ) ),
    escapeId = s => danger.has( s ) ? `__${s}` : s;

let Scope;

/**
 * @interface iScope
 */
export const iScope = superclass => Scope =
    /** @class Scope */
    class Scope extends superclass
    {
        /** @type {Map<string, Type>} */
        symbols  = new Map();
        /** @type {Array<Scope>} */
        children = [];
        /** @type {?Scope} */
        parent = null;
        /** @type {Type} */
        owner = null;

        /** @type {number} */
        get size()
        {
            return this.symbols.size;
        }

        /**
         * @param {Scope} parent
         */
        init( parent )
        {
            this.parent = parent;
        }

        /** */
        reset()
        {
            this.symbols.clear();
            this.children = [];
            this.parent   = null;
        }

        /** */
        clear()
        {
            this.reset();
            this.symbols  = void 0;
            this.children = void 0;
            this.parent   = void 0;
        }

        /**
         * @param {string} name
         * @param {boolean} [selfOnly=false]
         * @return {?Type}
         */
        find( name, selfOnly = false )
        {
            const
                _name = escapeId( name );

            if ( this.symbols.has( _name ) )
                return this.symbols.get( _name );

            if ( !this.parent || selfOnly ) return null;

            return this.parent.find( name );
        }

        /**
         * @param {string} sym
         * @param {boolean} selfOnly
         * @return {?Type}
         */
        get( sym, selfOnly = true )
        {
            return this.find( sym, selfOnly );
        }

        /**
         * @param {string} name
         * @param {Type} type
         * @returns {Scope}
         */
        add( name, type )
        {
            this.symbols.set( escapeId( name ), type );

            return this;
        }

        /**
         * @param {string} sym
         * @return {?Type}
         */
        has( sym )
        {
            return this.find( sym );
        }

        /**
         * @param {string} sym
         * @return {?Type}
         */
        hasOwn( sym )
        {
            return this.find( sym, true );
        }

        /**
         * @return {IterableIterator<Scope>}
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

        /**
         * @param {boolean} deep
         * @return {IterableIterator<Type>}
         */
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
         * @param {Type} klass
         * @param {boolean} [deep=false]
         * @return {IterableIterator<Type>}
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
            return [ ...this.forEachSymbol() ].map( fn );
        }
    };

export { Scope };
