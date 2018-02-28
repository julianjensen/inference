/** ****************************************************************************************************
 * File: globals (jsdoc-tag-parser)
 * @author julian on 2/9/18
 * @version 1.0.0
 * @copyright Planet3, Inc.
 *******************************************************************************************************/
'use strict';

export const globals = {

};

export const baseTypes = {};

/**
 * @param {string} name
 * @param {*} value
 */
export function add( name, value )
{
    globals[ name ] = value;
}

/**
 * @param {BaseType} type
 * @param {...string} names
 */
export function add_base_type( type, ...names )
{
    names.forEach( name => baseTypes[ name ] = type );
}
