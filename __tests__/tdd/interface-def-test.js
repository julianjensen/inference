/** ****************************************************************************
 * DESCRIPTION
 * @author julian.jensen
 * @since 0.0.1
 *******************************************************************************/
/* eslint-env jest */
"use strict";

import { type_from_def, init } from "../../src/tdd-type-system/type-parser";
import { ArrayType, ObjectType } from "../../src/tdd-type-system/object-type";

init();

describe( 'When given TypeScript definition files', () => {
    describe( 'When given Object constructor interface definition', () => {

        let objectConstructor;

        beforeEach( () => {
            objectConstructor = require( './fixed.json' );
        } );

        it( 'Then should read the type definition', () => {
            const { name, type } = type_from_def( objectConstructor );

            expect( type ).toBeInstanceOf( ObjectType );
            expect( name ).toEqual( 'ObjectConstructor' );
            console.log( 'stringified:', type.toString() );
        } );
    } );

    describe.only( 'When given Array instance definition', () => {

        let arrayDef;

        beforeEach( () => {
            arrayDef = require( './array-fixed.json' );
        } );

        it( 'Then should read the type definition', () => {
            const { name, type } = type_from_def( arrayDef );

            expect( type ).toBeInstanceOf( ObjectType );
            expect( name ).toEqual( 'Array' );
            console.log( type.stringify.toString() );
            console.log( type.stringify( 'Array' ) );
        } );
    } );
} );

