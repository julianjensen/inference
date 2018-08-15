/** ******************************************************************************************************************
 * @file Describe what delete does.
 * @author Julian Jensen <jjdanois@gmail.com>
 * @since 1.0.0
 * @date 24-Mar-2018
 *********************************************************************************************************************/

"use strict";

// // class Abc
// // {
// //     constructor()
// //     {
// //         console.log( "Instantiated Abc" );
// //     }
// //
// //     show()
// //     {
// //         console.log( "Show Abc" );
// //         // Object.getPrototypeOf( Object.getPrototypeOf( Abc ) ).show();
// //     }
// // }
// //
// // class Def
// // {
// //     constructor()
// //     {
// //         console.log( "Instantiated Def" );
// //     }
// //
// //     dshow()
// //     {
// //         console.log( "Show Def" );
// //         // Object.getPrototypeOf( Object.getPrototypeOf( Def ) ).show();
// //     }
// // }
// //
// // class Hij
// // {
// //     constructor()
// //     {
// //         console.log( "Instantiated Hij" );
// //     }
// //
// //     hshow()
// //     {
// //         console.log( "Show Hij" );
// //         // Object.getPrototypeOf( Object.getPrototypeOf( this ) ).show();
// //     }
// // }
// //
// // class Klm
// // {
// //     constructor()
// //     {
// //         console.log( "Instantiated Klm" );
// //     }
// //
// //     kshow()
// //     {
// //         console.log( "Show Klm" );
// //         // Object.getPrototypeOf( Object.getPrototypeOf( this ) ).show();
// //     }
// // }
// //
// // function inherit( derived, base )
// // {
// //     return Object.create( base, derived );
// // }
// //
// // const adh = named_implementation( Abc, Def, Hij )();
// // console.log( 'adh name:', adh.constructor.name );
// // adh.show();
// // adh.dshow();
// // adh.hshow();
// // const adk = named_implementation( Abc, Def, Klm )();
// // adk.show();
// // adk.dshow();
// // adk.kshow();
// //
// //
// // function named_implementation( ...exts )
// // {
// //     let protos     = {},
// //         statics    = {},
// //         constructs = void 0,
// //         final      = exts.shift(),
// //         className = final.constructor.name;
// //
// //     for ( const kls of exts.reverse() )
// //     {
// //         Object.assign( protos, Object.getOwnPropertyDescriptors( kls.prototype ) );
// //         Object.assign( statics, Object.getOwnPropertyDescriptors( kls ) );
// //         constructs = merge( kls, constructs );
// //     }
// //
// //     Object.assign( protos, Object.getOwnPropertyDescriptors( final.prototype ) );
// //     Object.assign( statics, Object.getOwnPropertyDescriptors( final ) );
// //
// //     /**
// //      * @param {class} cls
// //      * @param {?function} [prev]
// //      * @return {Function}
// //      */
// //     function merge( cls, prev )
// //     {
// //         return function( ...args ) {
// //             if ( prev ) prev.call( this, ...args );
// //             cls.constructor.call( this, ...args );
// //         };
// //     }
// //
// //     return function( ...args ) {
// //         // const save = statics.constructor;
// //
// //         statics.constructor = merge( final.constructor, constructs );
// //
// //         return new ( { [ className ]: final }[ className ] )( ...args );
// //     };
// // }
//
// const
//     nameTcons = 'UsingFunction',
//     Tcons = Function( `return function ${nameTcons}() {}` )(),
//
//     alt = name => {
//         const fn = new ( { [ name ]: function() {} }[ name ] );
//
//         fn.__proto__[ Symbol.toStringTag ] = name;
//         return fn;
//     },
//     sneaky           = name => ( ( () => {} ).constructor( `return new ( function ${name}() {} )()` ) )(), // eslint-disable-line no-extra-parens
//     namedFunc = name => ({[name]: class {}})[ name ],
//     namedInstance = name => new ( namedFunc( name ) ),
//     namedInstanceCombined = name => new ( ({[name]: function() {}})[ name ] );
//
// let fromTcons = new Tcons(),
//     classNamedAbcDef = namedFunc( 'AbcDef' ),
//     instOfXyz = namedInstance( 'Xyz' ),
//     comboCustomName = namedInstanceCombined( 'CustomName' ),
//     altFunc  = alt( 'Alternative' ),
//     sneak = sneaky( 'SneakyFunc' );
//
// show_func_info( 'Using Tcons:', fromTcons );
// show_func_info( 'Named function "AbcDef":', classNamedAbcDef );
// show_func_info( 'Instance of "Xyz":', instOfXyz );
// show_func_info( 'Instance of func named "CustomName":', comboCustomName );
// show_func_info( 'Instance of alt "Alternative":', altFunc );
// show_func_info( 'Instance of sneaky "SneakyFunc":', sneak );
//
// function show_func_info( msg, f )
// {
//     console.log( `${msg} -> Is function? ${typeof f === 'function'}, instance of "${f.constructor.name}", members: ${Object.getOwnPropertyNames( f )}, name: "${f.name || f.constructor.name}"` );
// }


console.ident = v => (( _ => ( _.log( v ), v ) )( console ));

const tmp = {
    hello: 'world'
};

const tmp1 = console.ident( tmp );
tmp1.goodbye = 'planet';
const tmp2 = console.ident( tmp1 );
console.log( tmp1 );


