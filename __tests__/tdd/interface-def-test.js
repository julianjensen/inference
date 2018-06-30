/** ****************************************************************************
 * DESCRIPTION
 * @author julian.jensen
 * @since 0.0.1
 *******************************************************************************/
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

const ScopeManager = get_scope_manager();

const
    _object = expect.any( Object ),
    _array = expect.any( Array ),
    objectConstructor = require( './object-constructor.json' );

let
    /** @type {Interface|Type} */
    objConstr,
    workingName;

describe( "Object constructor interface definition", () => {

    beforeEach( () => {
        ScopeManager.reset();

        objConstr = create_type( 'interface', objectConstructor.name );

        const define = def => auto_member( objConstr, workingName = def );

        objectConstructor.members.forEach( define );
    } );

    afterEach( () => {
        if ( workingName )
            console.log( 'last def:', workingName );
    } );

    it( "should create the entire interface", () => {

        expect( objConstr ).toEqual( _object );
        expect( objConstr ).toBeInstanceOf( Interface );
        expect( objConstr ).toBeInstanceOf( Type );

    } );

} );