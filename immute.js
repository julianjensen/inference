/** ****************************************************************************
 * DESCRIPTION
 * @author julian.jensen
 * @since 0.0.1
 *******************************************************************************/
"use strict";

const first    = { abc: 'one', def: { hij: 99 } };
const initPath = 'def.hij';
console.log( 'result:', JSON.stringify( sub( first, initPath, 100 ), null, 4 ) );

function sub( contact, path, value )
{
    const parts = path.split( '.' );
    const last  = parts.length - 1;

    let copy;

    return parts.reduce( ( cur, name, i ) => ( copy = copy || {
        ...cur,
        [ name ]: i === last ? value : { ...cur[ name ] }
    } )[ name ], contact ), copy;
}

function alt( contact, path, value )
{
    const parts = path.split( '.' );
    const field = path.pop();
    const rev = [...parts.reverse(), value];

    let cur = contact;
    const sliced = parts.map( p => cur[ p ] ).reverse().reduce((build, _, i) => ({...build, [ rev[ i ] ]: _ }));
}
