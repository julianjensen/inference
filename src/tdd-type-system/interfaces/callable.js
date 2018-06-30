/** ****************************************************************************
 * DESCRIPTION
 * @author julian.jensen
 * @since 0.0.1
 *******************************************************************************/
"use strict";

import { mix } from 'mixwith';

const
    number = n => typeof n === 'number' && n === n; // eslint-disable-line no-self-compare

/** */
export class Call
{
    parameters = [];
    type = null;
    pnames = {};
    parent = null;

    /**
     * @return {string}
     */
    toString()
    {
        return ( this.parameters.length ? `( ${this.parameters.map( t => `${t}` ).join( ', ' )} )` : `()` ) + ': ' + `${this.type}`;
    }

    /**
     * @param {Identifier} sym
     * @return {Call}
     */
    add_parameter( sym )
    {
        this.pnames[ sym.name ] = this.parameters.length;
        this.pnames[ this.parameters.length ] = sym.name;
        this.parameters.push( sym );

        return this;
    }

    /**
     * @param {number|string} nameOrIndex
     * @return {Identifier}
     */
    param_by( nameOrIndex )
    {
        if ( number( nameOrIndex ) )
            return this.parameters[ nameOrIndex ];

        return this.parameters[ this.pnames[ nameOrIndex ] ];
    }

    /**
     * @param {Type} type
     * @return {Call}
     */
    add_type( type )
    {
        this.type = type;

        return this;
    }
}

/** */
export class Callable extends mix( Call ) {}
/** */
export class Constructs extends mix( Call ) {}
