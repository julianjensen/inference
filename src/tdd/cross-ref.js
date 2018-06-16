/** ****************************************************************************
 * DESCRIPTION
 * @author julian.jensen
 * @since 0.0.1
 *******************************************************************************/
"use strict";

const
    string = s => typeof s === 'string',
    classMap = new Map();

/**
 * @param {...object} _klass
 */
export function register( ..._klass )
{
    _klass.forEach( klass => {
        if ( classMap.has( klass.name ) ) return;

        classMap.set( klass.name, klass );
        classMap.set( klass, klass );
    } );
}

/**
 * @param {string|object} className
 * @return {any}
 */
export function definition( className )
{
    let r = {};

    if ( string( className ) ) return classMap.get( className );

    Object.keys( className ).forEach( key => r[ key ] = classMap.get( key ) );

    return r;
}
