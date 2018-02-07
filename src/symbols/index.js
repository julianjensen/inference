/** ******************************************************************************************************************
 * @file Describe what index does.
 * @author Julian Jensen <jjdanois@gmail.com>
 * @since 1.0.0
 * @date 04-Feb-2018
 *********************************************************************************************************************/


"use strict";

import { TypeFlags } from "../types";
import { baseTypes } from "./symbol-table";

/**
 * @param {string} tsName
 */
function typescriptToSymbol( tsName )
{
    let r;

    if ( tsName.endsWith( 'Constructor' ) )
    {
        r = {
            type:     'class',
            name:     tsName.substring( 0, tsName.length - 'Constructor'.length ),
            flags:    TypeFlags.STATIC,
            instance: null
        };
    }

    switch ( r.name )
    {
        case 'Object':
            r.instance = baseTypes.object;
            break;

        case 'Array':
            r.instance = baseTypes.array;
            break;

        case 'Function':
            r.instance = baseTypes.function;
            break;
    }

    if ( [ 'Object', 'Function', 'Array' ].includes( r.name ) )
        r.name += '_';

    return r;
}
