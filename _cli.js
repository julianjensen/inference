/** ******************************************************************************************************************
 * @file Wrapper/loader for cli.js
 * @author Julian Jensen <jjdanois@gmail.com>
 * @since 1.0.0
 * @date 19-Jan-2018
 *********************************************************************************************************************/
"use strict";

require = require( '@std/esm' )( module, { mode: 'js', cjs: true } );
require( './cli' );
