/** ****************************************************************************
 * DESCRIPTION
 * @author julian.jensen
 * @since 0.0.1
 *******************************************************************************/
/* eslint-env jest */
"use strict";

import { type_from_def } from "../../src/tdd-type-system/type-parser";
import { ObjectType } from "../../src/tdd-type-system/object-type";

describe( 'Object constructor interface definition', () => {

    let objectConstructor;

    beforeEach( () => {
        objectConstructor = require( './fixed.json' );
    } );

    it( 'should read the type definition', () => {
        const { name, type } = type_from_def( objectConstructor );

        expect( type ).toBeInstanceOf( ObjectType );
        expect( name ).toEqual( 'ObjectConstructor' );
        console.log( 'stringified:', type.toString() );
    } );
} );

