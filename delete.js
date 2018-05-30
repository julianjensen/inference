/** ******************************************************************************************************************
 * @file Describe what delete does.
 * @author Julian Jensen <jjdanois@gmail.com>
 * @since 1.0.0
 * @date 24-Mar-2018
 *********************************************************************************************************************/
"use strict";

class Abc
{
    constructor()
    {
        console.log( "Instantiated Abc" );
    }

    show()
    {
        console.log( "Show Abc" );
        // Object.getPrototypeOf( Object.getPrototypeOf( Abc ) ).show();
    }
}

class Def
{
    constructor()
    {
        console.log( "Instantiated Def" );
    }

    dshow()
    {
        console.log( "Show Def" );
        // Object.getPrototypeOf( Object.getPrototypeOf( Def ) ).show();
    }
}

class Hij
{
    constructor()
    {
        console.log( "Instantiated Hij" );
    }

    hshow()
    {
        console.log( "Show Hij" );
        // Object.getPrototypeOf( Object.getPrototypeOf( this ) ).show();
    }
}

class Klm
{
    constructor()
    {
        console.log( "Instantiated Klm" );
    }

    kshow()
    {
        console.log( "Show Klm" );
        // Object.getPrototypeOf( Object.getPrototypeOf( this ) ).show();
    }
}

function inherit( derived, base )
{
    return Object.create( base, derived );
}

const adh = named_implementation( Abc, Def, Hij )();
console.log( 'adh name:', adh.constructor.name );
adh.show();
adh.dshow();
adh.hshow();
const adk = named_implementation( Abc, Def, Klm )();
adk.show();
adk.dshow();
adk.kshow();


function named_implementation( ...exts )
{
    let protos     = {},
        statics    = {},
        constructs = void 0,
        final      = exts.shift(),
        className = final.constructor.name;

    for ( const kls of exts.reverse() )
    {
        Object.assign( protos, Object.getOwnPropertyDescriptors( kls.prototype ) );
        Object.assign( statics, Object.getOwnPropertyDescriptors( kls ) );
        constructs = merge( kls, constructs );
    }

    Object.assign( protos, Object.getOwnPropertyDescriptors( final.prototype ) );
    Object.assign( statics, Object.getOwnPropertyDescriptors( final ) );

    /**
     * @param {class} cls
     * @param {?function} [prev]
     * @return {Function}
     */
    function merge( cls, prev )
    {
        return function( ...args ) {
            if ( prev ) prev.call( this, ...args );
            cls.constructor.call( this, ...args );
        };
    }

    return function( ...args ) {
        // const save = statics.constructor;

        statics.constructor = merge( final.constructor, constructs );

        return new ( { [ className ]: final }[ className ] )( ...args );
    };
}
