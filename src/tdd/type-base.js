/** ****************************************************************************
 * DESCRIPTION
 * @author julian.jensen
 * @since 0.0.1
 *******************************************************************************/
"use strict";

import { ScopeManager } from "./scopes";
import { register } from "./type-utils";

/** */
export class Type
{
    /**
     * @param {string} name
     * @param {?Scope} [outerScope]
     */
    constructor( name, outerScope = ScopeManager.global )
    {
        this.name = name;
        this.parent = null;
        /** @type {?Scope} */
        this.outer = outerScope;
        /** @type {?Scope} */
        this.inner = null;
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
     * @param {Type} t
     * @return {boolean}
     */
    invariant( t )
    {
        return this.constructor === t.constructor;
    }

    /**
     * @return {boolean}
     */
    hasMembers()
    {
        return !!this.members && this.members.size !== 0;
    }
}

register( Type );
