/** ****************************************************************************************************
 * File: globals (jsdoc-tag-parser)
 * @author julian on 2/9/18
 * @version 1.0.0
 * @copyright Planet3, Inc.
 *******************************************************************************************************/
'use strict';

export const globals = {

};

/**
 * @param {string} name
 * @param {*} value
 */
export function add( name, value )
{
    globals[ name ] = value;
}
