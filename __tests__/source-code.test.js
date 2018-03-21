/** ******************************************************************************************************************
 * @file Describe what source-code.test does.
 * @author Julian Jensen <jjdanois@gmail.com>
 * @since 1.0.0
 * @date 18-Mar-2018
 *********************************************************************************************************************/

"use strict";

import fs                  from "fs";
import { create_reporters } from "../src/utils/source-code";

const
    short = fs.readFileSync( 'data/short.d.ts', 'utf8' );

describe( 'source code', function() {

    test( 'read source code', () => {
        const
            rep = create_reporters( 'data/short.d.ts', short );

        expect( rep.get_line( 8 ) ).toEqual( "    readonly length: number;\n" );
        expect( rep.get_line( 1 ) ).toEqual( "/// ECMAScript Array API (specially handled by compiler)\n" );
        expect( rep.get_line( 36 ) ).toEqual( "interface ArrayConstructor {\n" );

        expect( rep.get_actual_pos( 1259 ) ).toEqual( 1261 );
        expect( rep.offset_to_line_offset( 1259 ) ).toEqual( [ 36, 0 ] );
        expect( rep.getStartPositionOfLine( 36 ) ).toBe( 1261 );

    } );

} );
