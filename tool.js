/** ****************************************************************************
 * DESCRIPTION
 * @author julian.jensen
 * @since 0.0.1
 *******************************************************************************/
"use strict";

const
    { walkObject } = require( 'walk-object' ),
    cons           = require( './sym' ),
    trouble        = new Set(),
    troubleCount   = new Map();

let iters = 0;


walker( cons, ( { value, key } ) => {

    if ( key === 'decls' ) iters++;
    if ( key === 'decls' && Array.isArray( value ) && value.length > 1 )
    {
        const kinds = new Set( value.map( d => d.kind ) );

        if ( kinds.size > 1 )
        {
            const tkey = [ ...kinds ].sort().join( ', ' );

            trouble.add( tkey );
            if ( troubleCount.has( tkey ) )
                troubleCount.set( tkey, troubleCount.get( tkey ) + 1 );
            else
                troubleCount.set( tkey, 1 );

            if ( tkey === 'FunctionDeclaration, ModuleDeclaration' )
                console.log( value[ 0 ].decl );
        }
    }
} );

console.log( trouble );
console.log( troubleCount );

function walker( o, cb, path = [] )
{
    if ( Array.isArray( o ) )
        o.forEach( ( v, i ) => {
            const p = [ ...path, i ];

            cb( { value: v, location: p, key: i } );
            walker( v, cb, [ ...path, i ] );
        } );
    else if ( typeof o === 'object' && o !== null )
    {
        Object.keys( o ).forEach( key => {
            const p = [ ...path, key ];

            cb( { value: o[ key ], location: p, key } );
            walker( o[ key ], cb, p );
        } );
    }
    else
        cb( { value: o, location: path, key: path[ path.length - 1 ] } );
}
