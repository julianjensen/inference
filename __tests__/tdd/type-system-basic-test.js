/** ******************************************************************************************************************
 * @file Describe what type-system-basic-test does.
 * @author Julian Jensen <jjdanois@gmail.com>
 * @since 1.0.0
 * @date 27-May-2018
 *********************************************************************************************************************/
/* eslint-env jest */
"use strict";

import {
    Identifier,
    Type,
    Primitive,
    ObjectType,
    Interface,
    TypeLiteral,
    TypeListBaseType,
    Union,
    Intersection,
    Tuple,
    TypeReference,
    CallableType,
    Signature,
    Undef,
    type_def,
    get_type,
    create_type,
    add_member,
    auto_member
} from '../../src/tdd/type-system-basics';
import { get_scope_manager } from "../../src/tdd/type-utils";

// import { definition } from "../../src/tdd/cross-ref";
// import { type_def, get_type, create_type, add_member, auto_member } from "../../src/tdd/type-utils";
//
// const __types = {
//     Identifier: null,
//     Primitive: null,
//     TypeReference: null,
//     Undef: null,
//     CallableType: null,
//     Signature: null,
//     Type: null,
//     Interface: null,
//     Union: null,
//     TypeLiteral: null
// };
//
// definition( __types );
//
// const {
//     Identifier,
//         Primitive,
//     TypeReference,
//     Undef,
//     CallableType,
//     Signature,
//     Type,
//     Interface,
//     Union,
//     TypeLiteral
// } = __types;

// import { ScopeManager } from "../../src/tdd/scopes";

const ScopeManager = get_scope_manager();

const
    _object = expect.any( Object ),
    _array = expect.any( Array ),
    objectConstructor = require( './object-constructor.json' ),
    autoConstr = objectConstructor.members[ 0 ],
    autoCalls = objectConstructor.members[ 1 ],
    construct = objectConstructor.members[ 0 ].decls[ 0 ],
    callable = objectConstructor.members[ 1 ].decls,
    prop = objectConstructor.members[ 2 ].decls[ 0 ],
    method = objectConstructor.members[ 3 ].decls[ 0 ],
    by_name = name => objectConstructor.members.find( x => x.name === name ),
    values = by_name( 'values' );

let
    /** @type {Interface|Type} */
    objConstr,
    /** @type {CallableType} */
    constFunc;

describe( "Type system", function() {

    beforeEach( () => {
        ScopeManager.reset();
        objConstr = create_type( 'interface', 'ObjectConstructor' );
    } );

    afterEach( () => ScopeManager.reset() );

    /*****************************************************************************
     * INTERFACE CREATION
     *****************************************************************************/
    describe( "Interface creation", () => {

        it( "should create basic interface", () => {
            expect( objConstr ).toEqual( _object );
            expect( objConstr ).toBeInstanceOf( Interface );
            expect( objConstr ).toBeInstanceOf( Type );
        } );

        it( "should respond to queries properly", () => {

            expect( objConstr.isType() ).toEqual( true );
            expect( objConstr.isType( Interface ) ).toEqual( true );
            expect( objConstr.invariant( objConstr ) ).toEqual( true );
            expect( objConstr.isContainer ).toEqual( true );
            expect( objConstr.hasMembers() ).toEqual( false );
            expect( objConstr.numMembers ).toEqual( 0 );

        } );

    } );

    /*****************************************************************************
     * TYPE CREATION
     *****************************************************************************/
    describe( "Type creation", () => {

        it( 'should create types on the fly', () => {

            const
                t = type_def( {
                    "typeName": "any",
                    "name": "value",
                    "optional": true
                } );

            expect( t ).toBeInstanceOf( Type );
            expect( t ).toBeInstanceOf( Primitive );
            expect( t ).toHaveProperty( 'name', 'any' );
        } );

        it( 'should create a type reference', () => {

            const
                t = type_def( {
                    "type": "reference",
                    "typeName": {
                        "name": "ThisType"
                    },
                    "typeArguments": [
                        {
                            "typeName": "any"
                        }
                    ]
                } );

            expect( t ).toBeInstanceOf( Type );
            expect( t ).toBeInstanceOf( TypeReference );
            expect( t.ref ).toBeInstanceOf( Undef );
            expect( t.ref.name ).toEqual( 'ThisType' );
            expect( t.typeArguments ).toEqual( [ 'any' ] );
        } );

    } );

    /*****************************************************************************
     * CONSTRUCTOR FUNCTION
     *****************************************************************************/
    describe( "Constructor functions", () => {

        it( "should add constructor function", () => {
            constFunc = add_member( objConstr,'constructor', construct );

            expect( objConstr.numMembers ).toEqual( 0 );
            expect( objConstr.numConstructors ).toEqual( 1 );
            expect( constFunc ).toBeInstanceOf( Signature );
            expect( constFunc.parent ).toBeInstanceOf( Interface );
            expect( objConstr.numSignatures ).toEqual( 1 );
            expect( objConstr.numConstructors ).toEqual( 1 );
            expect( objConstr.numCallables ).toEqual( 0 );
            expect( objConstr.constructors.get( 0 ).parameters ).toEqual( _array );
            expect( objConstr.constructors.get( 0 ).parameters.length ).toEqual( 1 );

            const sig = objConstr.constructors.get( 0 );

            const p = sig.parameters[ 0 ];

            expect( p ).toBeInstanceOf( Identifier );
            expect( p.type.is( get_type( 'any' ) ) ).toEqual( true );
            expect( sig.param_by( 'value' ) ).toEqual( p );
            expect( sig.param_by( 0 ) ).toEqual( p );
            expect( p.optional ).toEqual( true );

        } );

        it( 'should automatically add the constructor', () => {
            auto_member( objConstr,autoConstr );

            expect( objConstr.numMembers ).toEqual( 0 );
            expect( objConstr.numConstructors ).toEqual( 1 );
            expect( constFunc ).toBeInstanceOf( Signature );
            expect( constFunc.parent ).toBeInstanceOf( Interface );
            expect( objConstr.numSignatures ).toEqual( 1 );
            expect( objConstr.numConstructors ).toEqual( 1 );
            expect( objConstr.numCallables ).toEqual( 0 );
            expect( objConstr.constructors.get( 0 ).parameters ).toEqual( _array );
            expect( objConstr.constructors.get( 0 ).parameters.length ).toEqual( 1 );

            const sig = objConstr.constructors.get( 0 );

            const p = sig.parameters[ 0 ];

            expect( p ).toBeInstanceOf( Identifier );
            expect( p.type.is( get_type( 'any' ) ) ).toEqual( true );
            expect( sig.param_by( 'value' ) ).toEqual( p );
            expect( sig.param_by( 0 ) ).toEqual( p );
            expect( p.optional ).toEqual( true );
        } );
    } );

    /*****************************************************************************
     * CALLABLE OBJECT
     *****************************************************************************/
    describe( "Callable objects", () => {

        it( "should add callable overloaded functions", () => {

            add_member( objConstr,'callable', callable[ 0 ] );
            add_member( objConstr,'callable', callable[ 1 ] );

            expect( objConstr.numMembers ).toEqual( 0 );

            expect( objConstr.numSignatures ).toEqual( 1 );
            expect( objConstr.signatures[ 0 ] ).toBeInstanceOf( CallableType );
            expect( objConstr.signatures[ 0 ].signatures[ 0 ] ).toBeInstanceOf( Signature );

            const
                call0 = objConstr.callables.get( 0 ),
                call1 = objConstr.callables.get( 1 );

            expect( call0.parent ).toBeInstanceOf( Interface );
            expect( call0.parameters ).toEqual( _array );
            expect( call0.parameters.length ).toEqual( 0 );

            expect( call1.parameters ).toEqual( _array );
            expect( call1.parameters.length ).toEqual( 1 );

            const p = call1.parameters[ 0 ];

            expect( p ).toBeInstanceOf( Identifier );
            expect( p.type.invariant( get_type( 'any' ) ) ).toEqual( true );
            expect( p.name ).toEqual( 'value' );
            expect( p.optional ).toEqual( false );

        } );

        it( 'should automatically add the callables', () => {
            auto_member( objConstr,autoCalls );

            expect( objConstr.numMembers ).toEqual( 0 );

            expect( objConstr.numSignatures ).toEqual( 1 );
            expect( objConstr.signatures[ 0 ] ).toBeInstanceOf( CallableType );
            expect( objConstr.signatures[ 0 ].signatures[ 0 ] ).toBeInstanceOf( Signature );

            const
                call0 = objConstr.callables.get( 0 ),
                call1 = objConstr.callables.get( 1 );

            expect( call0.parent ).toBeInstanceOf( Interface );
            expect( call0.parameters ).toEqual( _array );
            expect( call0.parameters.length ).toEqual( 0 );

            expect( call1.parameters ).toEqual( _array );
            expect( call1.parameters.length ).toEqual( 1 );

            const p = call1.parameters[ 0 ];

            expect( p ).toBeInstanceOf( Identifier );
            expect( p.type.invariant( get_type( 'any' ) ) ).toEqual( true );
            expect( p.name ).toEqual( 'value' );
            expect( p.optional ).toEqual( false );
        } );

    } );

    /*****************************************************************************
     * OBJECT PROPERTY
     *****************************************************************************/
    describe( "Object properties", () => {

        it( "should add object properties", () => {

            add_member( objConstr,'property', prop, 'prototype' );

            expect( objConstr.numMembers ).toEqual( 1 );
            expect( objConstr.numSignatures ).toEqual( 0 );

            const p = objConstr.get( 'prototype' );

            expect( p ).toBeInstanceOf( Identifier );
            expect( p.parent ).toBeInstanceOf( Interface );
            expect( p.type ).toBeInstanceOf( TypeReference );
            expect( p.type.ref ).toBeInstanceOf( Undef );

        } );

        it( 'should auto-add properties', () => {

            auto_member( objConstr,objectConstructor.members[ 2 ] );

            expect( objConstr.numMembers ).toEqual( 1 );
            expect( objConstr.numSignatures ).toEqual( 0 );

            const p = objConstr.get( 'prototype' );

            expect( p ).toBeInstanceOf( Identifier );
            expect( p.parent ).toBeInstanceOf( Interface );
            expect( p.type ).toBeInstanceOf( TypeReference );
            expect( p.type.ref ).toBeInstanceOf( Undef );

        } );
    } );

    /*****************************************************************************
     * OBJECT METHOD
     *****************************************************************************/
    describe( "Object method", () => {

        it( "should add callable overloaded methods", () => {
            let calls;

            add_member( objConstr,'method', method, 'getPrototypeOf' );

            expect( objConstr.numMembers ).toEqual( 1 );

            calls = objConstr.methods;

            expect( objConstr.numMethods ).toEqual( 1 );
            expect( objConstr.methods[ 0 ] ).toBeInstanceOf( CallableType );
            expect( calls[ 0 ].parent ).toBeInstanceOf( Interface );
            expect( calls[ 0 ].signatures[ 0 ].parameters ).toEqual( _array );
            expect( calls[ 0 ].signatures[ 0 ].parameters.length ).toEqual( 1 );

            const p = calls[ 0 ].signatures[ 0 ].parameters[ 0 ];

            expect( p ).toBeInstanceOf( Identifier );
            expect( p.type.invariant( get_type( 'any' ) ) ).toEqual( true );
            expect( p.name ).toEqual( 'o' );
            expect( p.optional ).toEqual( false );

        } );

        it( 'should add some interesting methods', () => {
            let calls;

            add_member( objConstr,'method', values.decls[ 1 ], 'values' );

            expect( objConstr.numMembers ).toEqual( 1 );

            calls = objConstr.methods;

            expect( objConstr.numMethods ).toEqual( 1 );
            expect( objConstr.methods[ 0 ] ).toBeInstanceOf( CallableType );
            expect( calls[ 0 ].parent ).toBeInstanceOf( Interface );
            expect( calls[ 0 ].signatures[ 0 ].parameters ).toEqual( _array );
            expect( calls[ 0 ].signatures[ 0 ].parameters.length ).toEqual( 1 );

            const p = calls[ 0 ].signatures[ 0 ].parameters[ 0 ];

            expect( p.type.invariant( TypeLiteral ) ).toEqual( true );

        } );

        it.only( 'should add some even more interesting methods', () => {
            let calls;

            // auto_member( objConstr,by_name( 'T' ) );
            add_member( objConstr,'method', values.decls[ 0 ], 'values' );

            const
                method = objConstr.methods[ 0 ],
                sig = method.signatures[ 0 ];

            console.log( `intr:\n${objConstr}` );
            console.log( `decl string 1:\n${method.name}${sig}` );
            console.log( `decl string 2:\n${method}` );
            expect( objConstr.numMembers ).toEqual( 1 );

            calls = objConstr.methods;

            expect( objConstr.numMethods ).toEqual( 1 );
            expect( objConstr.methods[ 0 ] ).toBeInstanceOf( CallableType );
            expect( calls[ 0 ].parent ).toBeInstanceOf( Interface );
            expect( calls[ 0 ].signatures[ 0 ].parameters ).toEqual( _array );
            expect( calls[ 0 ].signatures[ 0 ].parameters.length ).toEqual( 1 );

            const p = calls[ 0 ].signatures[ 0 ].parameters[ 0 ];

            expect( p.type.invariant( Union ) ).toEqual( true );

            const lit = p.type.at( 0 );
            expect( lit ).toBeInstanceOf( TypeLiteral );

        } );

        it( 'should auto-add methods', () => {
            auto_member( objConstr,objectConstructor.members[ 3 ] );

            expect( objConstr.numMembers ).toEqual( 1 );

            let calls = objConstr.methods;

            expect( objConstr.numMethods ).toEqual( 1 );
            expect( objConstr.methods[ 0 ] ).toBeInstanceOf( CallableType );
            expect( calls[ 0 ].parent ).toBeInstanceOf( Interface );
            expect( calls[ 0 ].signatures[ 0 ].parameters ).toEqual( _array );
            expect( calls[ 0 ].signatures[ 0 ].parameters.length ).toEqual( 1 );

            const p = calls[ 0 ].signatures[ 0 ].parameters[ 0 ];

            expect( p ).toBeInstanceOf( Identifier );
            expect( p.type.invariant( get_type( 'any' ) ) ).toEqual( true );
            expect( p.name ).toEqual( 'o' );
            expect( p.optional ).toEqual( false );

        } );

        // eslint-disable-next-line max-statements
        it( 'should auto-add a complex overloaded method', () => {
            auto_member( objConstr,objectConstructor.members[ 4 ] );

            let calls = objConstr.methods;

            expect( objConstr.numMethods ).toEqual( 1 );
            expect( calls[ 0 ] ).toBeInstanceOf( CallableType );

            let funcs = calls[ 0 ];

            expect( funcs.parent ).toBeInstanceOf( Interface );
            expect( funcs.signatures[ 0 ].parameters ).toEqual( _array );
            expect( funcs.signatures[ 0 ].parameters.length ).toEqual( 2 );

            let p = funcs.signatures[ 0 ].parameters[ 0 ];

            expect( p ).toBeInstanceOf( Identifier );
            expect( p.type.invariant( get_type( 'any' ) ) ).toEqual( true );
            expect( p.name ).toEqual( 'o' );
            expect( p.optional ).toEqual( false );

            /** @type {Union} */
            let t = funcs.signatures[ 0 ].type;

            expect( t ).toBeInstanceOf( Union );
            expect( t.has_type( get_type( 'undefined' ) ) ).toEqual( true );
            expect( t.has_type( TypeReference ) ).toEqual( true );
            expect( t.get_type( TypeReference ).ref ).toBeInstanceOf( Undef );
            expect( t.get_type( TypeReference ).ref.name ).toEqual( 'PropertyDescriptor' );


            expect( funcs.parent ).toBeInstanceOf( Interface );
            expect( funcs.signatures[ 1 ].parameters ).toEqual( _array );
            expect( funcs.signatures[ 1 ].parameters.length ).toEqual( 2 );

            p = funcs.signatures[ 1 ].parameters[ 0 ];

            expect( p ).toBeInstanceOf( Identifier );
            expect( p.type.invariant( get_type( 'any' ) ) ).toEqual( true );
            expect( p.name ).toEqual( 'o' );
            expect( p.optional ).toEqual( false );

            /** @type {Union} */
            t = funcs.signatures[ 0 ].type;

            expect( t ).toBeInstanceOf( Union );
            expect( t.has_type( get_type( 'undefined' ) ) ).toEqual( true );
            expect( t.has_type( TypeReference ) ).toEqual( true );
            expect( t.get_type( TypeReference ).ref ).toBeInstanceOf( Undef );
            expect( t.get_type( TypeReference ).ref.name ).toEqual( 'PropertyDescriptor' );

            p = funcs.signatures[ 1 ].parameters[ 1 ];
            expect( p.type ).toBeInstanceOf( TypeReference );
            expect( funcs.signatures[ 1 ].param_by( 1 ).name ).toEqual( 'propertyKey' );
            expect( p.type.ref ).toBeInstanceOf( Undef );
            expect( p.type.ref.name ).toEqual( 'PropertyKey' );

        } );
    } );
} );
