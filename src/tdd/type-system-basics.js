/** ******************************************************************************************************************
 * @file Describe what type-system-basic-test does.
 * @author Julian Jensen <jjdanois@gmail.com>
 * @since 1.0.0
 * @date 27-May-2018
 *********************************************************************************************************************/
"use strict";

import { create_type, get_type, type_def } from "./type-utils";

[ 'any', 'never', 'undefined', 'void', 'number', 'string', 'boolean', 'symbol', 'null' ].forEach( tid => create_type( 'primitive', tid ) );

import { Identifier } from "./identifier";
import { Type } from "./type-base";
import { Interface } from "./type-interface";
import { Primitive } from "./type-primitive";
import { TypeReference } from "./type-reference";
import { CallableType, Signature } from "./type-signature";
import { Undef } from "./type-undef";

export {
    Identifier,
    Type,
    Interface,
    Primitive,
    TypeReference,
    Signature,
    CallableType,
    Undef,
    create_type,
    get_type,
    type_def
};
