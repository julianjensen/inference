/** ****************************************************************************
 * DESCRIPTION
 * @author julian.jensen
 * @since 0.0.1
 *******************************************************************************/
"use strict";

// import { ScopeManager } from "../tdd/type-utils";

/** */
export class Type
{
    /**
     * @param {string} [name]
     * @param {?Scope} [outerScope]
     */
    constructor( name, outerScope )
    {
        outerScope = outerScope || {};
        this.name = name;
        this.parent = null;
        /** @type {?Scope} */
        this.outer = outerScope;
        /** @type {?Scope} */
        this.inner = null;
    }

    stringify( name )
    {
        return name ? `${name}: ${this}` : this.toString();
    }

    toString()
    {
        return `${this.name} (${this.constructor.name})`;
    }

    create_local_scope()
    {
        if ( !this.inner )
            this.inner = this.outer.from( this );
    }

    /**
     * @param {any} t
     * @return {boolean}
     */
    isType( t )
    {
        if ( !t ) return true;

        if ( typeof t === 'function' )
        {
            let type = t;

            while ( type && type !== Object )
            {
                if ( type === Type ) return true;

                type = Object.getPrototypeOf( type );
            }

            return false;
        }

        return t instanceof Type;
    }

    /**
     * @param t
     * @return {boolean}
     */
    is( t )
    {
        return this.isType( t );
    }

    /**
     * @param {Type|Object} t
     * @return {boolean}
     */
    invariant( t )
    {
        const _t = t.constructor === Function ? t : t.constructor;

        return this.constructor === _t;
    }

    /**
     * @return {boolean}
     */
    hasMembers()
    {
        return !!this.members && this.members.size !== 0;
    }

    debug( name )
    {
        this.__name = name;
        this.__definedLine = new Error().stack.split( '\n' ).slice( 2, 5 ).join( '\n' );

        return this;
    }

    info()
    {
        return `${this.__name} defined from ${this.__definedLine}`;
    }
}
