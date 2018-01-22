/** ******************************************************************************************************************
 * @file Describe what test-types does.
 * @author Julian Jensen <jjdanois@gmail.com>
 * @since 1.0.0
 * @date 19-Jan-2018
 *********************************************************************************************************************/
"use strict";

import { parse } from "espree";

let /** string */ someName,
    /** number */ age;

/**
 * @typedef {object} SomeTest
 * @template T
 * @property {string} hello     - Let's have a comment here
 * @property {function(Array<T>, SomeTest, SomeTest[] ):array<SomeTest>} funny
 * @property {Array<number|string>} [mixedArray]
 * @property {?string} nullString
 * @property {?string} eqString
 * @property {string=} defString
 */

/**
 * Some function lives here, yes it does. Does this do multi-line comments
 * or is it just line by line.
 *
 * @param {string} source   - Arg the firste
 * @param {object} options
 */
export default function parse_and_prep( source, options ) {
    console.log( source, options );
}

/**
 * @class
 */
class DEF
{
    /**
     * @param {string[][]} a
     */
    constructor( a )
    {

    }
}

/**
 * @class
 * @extends DEF
 */
class Stuff extends DEF
{

}

/**
 * @class
 * @extends {DEF}
 * @template T
 */
class ABC extends DEF
{

}

/**
 * @type {ABC}
 */
const iffy = new ABC();
