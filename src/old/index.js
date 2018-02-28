/** ******************************************************************************************************************
 * @file Describe what index does.
 * @author Julian Jensen <jjdanois@gmail.com>
 * @since 1.0.0
 * @date 04-Feb-2018
 *********************************************************************************************************************/



"use strict";

import { TypeFlags }                                      from "../types";
import { globals }                                        from "../earlier/globals";
import { ClassType, FunctionType, ArrayType, ObjectType } from '../earlier/symbol-table';

const { baseTypes } = globals;

/**
 * @typedef {object} TsTranslation
 * @property {string} [type]
 * @property {string} name
 * @property {TypeFlags} flags
 * @property {?(ClassType|FunctionType|ArrayType|ObjectType)} isA
 */

/**
 * @param {string} tsName
 */
export function typescriptToSymbol( tsName )
{
    /** @type {TsTranslation} */
    let r;

    if ( tsName.endsWith( 'Constructor' ) )
    {
        r = {
            type:     'class',
            name:     tsName.substring( 0, tsName.length - 'Constructor'.length ),
            flags:    TypeFlags.STATIC,
            isA: null
        };
    }
    else
        r = {
            name: tsName,
            flags: 0,
            instance: null
        };

    switch ( r.name )
    {
        case 'Object':
            r.isA = new ObjectType( r.name );
            break;

        case 'Array':
            r.isA = new FunctionType( r.name );
            break;

        case 'Function':
            r.isA = new FunctionType( r.name );
            break;

        default:
            r.isA = globals.symbols.get( r.name );
    }

    // if ( [ 'Object', 'Function', 'Array' ].includes( r.name ) )
    //     r.name += '_';

    return r;
}
