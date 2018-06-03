/** ****************************************************************************
 * DESCRIPTION
 * @author julian.jensen
 * @since 0.0.1
 *******************************************************************************/
"use strict";

import { register } from "./type-utils";

/** */
export class Identifier
{
    /**
     * @param {string} name
     * @param {Type} type
     * @param {object} opts
     */
    constructor( name, type, opts )
    {
        this.name = name;
        this.type = type;

        this.optional = !!opts.optional;
        this.rest = !!opts.rest;
        this.parent = null;
        this.inner = this.outer = null;
    }

    toString()
    {
        return `${this.name}:${this.type}`;
    }
}

register( Identifier );
