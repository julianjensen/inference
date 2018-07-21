/** ****************************************************************************
 * DESCRIPTION
 * @author julian.jensen
 * @since 0.0.1
 *******************************************************************************/
"use strict";

const
    number = n => typeof n === 'number' && n === n; // eslint-disable-line no-self-compare

let Callable;

/** */
export const iCallable = superclass => Callable = class Callable extends superclass {
    parameters = [];
    type = null;
    pnames = {};
    parent = null;

    /**
     * @return {string}
     */
    toString()
    {
        return ( this.parameters.length ? `( ${this.parameters.map( ( t, i ) => `${this.pnames[ i ]}: ${t.type}` ).join( ', ' )} )` : `()` ) + ': ' + `${this.type}`;
    }

    /**
     * @param {string} name
     * @param {Type} type
     * @param {object} [options]
     * @return {Callable}
     */
    add_parameter( name, type, options = {} )
    {
        this.pnames[ name ] = this.parameters.length;
        this.pnames[ this.parameters.length ] = name;
        this.parameters.push( { type, options } );

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
// export class Constructs extends mix( Call ) {}
export const Constructs = superclass => class Constructs extends iCallable( superclass ) {};

export {Callable};
