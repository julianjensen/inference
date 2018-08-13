/** ****************************************************************************
 * DESCRIPTION
 * @author julian.jensen
 * @since 0.0.1
 *******************************************************************************/

"use strict";

import { readable_name } from "../utils";

const
    number = n => typeof n === 'number' && n === n; // eslint-disable-line no-self-compare

let /** @type {Callable} */
    Callable,
    /** @type {Constructs} */
    Constructs;

/** */
export const iCallable = superclass => Callable =
    /**
     * @class Callable
     */
    class Callable extends superclass {
    parameters = [];
    type = null;
    pnames = {};
    parent = null;

    param_as_string( name, { type, options } )
    {
        let s = options.rest ? '...' : '';

        s += name;
        s += options.optional ? '?' : '';
        const blah = type.toString();
        if ( blah === '[object Object]' )
            console.log( 'bad type:', type );
        s += ': ' + type.toString();

        return s;
    }

    /**
     * @param {string} [name]
     * @return {string}
     */
    stringify( name )
    {
        if ( !name ) return this.toString();

        return `${readable_name( name )}${this.type_parameters_to_string()}` + ( this.parameters.length ? `( ${this.parameters.map( ( t, i ) => this.param_as_string( this.pnames[ i ], t ) ).join( ', ' )} )` : `()` ) + ': ' + `${this.type}`;
    }

    /**
     * @return {string}
     */
    toString()
    {
        return `${this.type_parameters_to_string()}` + ( this.parameters.length ? `( ${this.parameters.map( ( t, i ) => `${this.pnames[ i ]}: ${t.type}` ).join( ', ' )} )` : `()` ) + ': ' + `${this.type}`;
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
export const iConstructs = superclass => Constructs = class Constructs extends iCallable( superclass ) {};

export { Callable, Constructs };
