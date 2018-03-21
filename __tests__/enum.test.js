/** ******************************************************************************************************************
 * @file Describe what enum-test does.
 * @author Julian Jensen <jjdanois@gmail.com>
 * @since 1.0.0
 * @date 10-Mar-2018
 *********************************************************************************************************************/
"use strict";

// import { make_enum_from_object, make_extra } from '../src/enum';
const { SymbolFlags } = require( '../src/types' );

describe( 'enum tests', function() {

    test( 'just a test of the test', () => {

        expect( SymbolFlags.None == 0 ).toBe( true );
        expect( !SymbolFlags.Function ).toBe( false );
        expect( SymbolFlags.None ).toEqual( SymbolFlags.None );
        expect( SymbolFlags.Function & SymbolFlags.Class ).toBeFalsy();
        expect( SymbolFlags.Function | SymbolFlags.Class & SymbolFlags.Class ).toBeTruthy();
        expect( ( SymbolFlags.Function & SymbolFlags.Function ) == SymbolFlags.Function ).toBe( true );
    } );

    test( 'creating new enum holders', () => {
        const
            sym = SymbolFlags.create( SymbolFlags.Method ),
            sym2 = SymbolFlags.create( sym | SymbolFlags.Class );

        expect( `${sym}` ).toEqual( 'Method' );
        expect( `${sym2}` ).toEqual( 'Class | Method' );
        expect( ( sym2 & SymbolFlags.Class ) == SymbolFlags.Class ).toEqual( true );
        expect( sym2 & SymbolFlags.Class && true ).toEqual( true );
    } );

} );
