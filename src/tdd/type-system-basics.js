/** ******************************************************************************************************************
 * @file Describe what type-system-basic-test does.
 * @author Julian Jensen <jjdanois@gmail.com>
 * @since 1.0.0
 * @date 27-May-2018
 *********************************************************************************************************************/
"use strict";

import { inspect } from 'util';
import { Identifier } from "./identifier";
import { Type } from "./type-base";
import { Primitive } from "./type-primitive";
import { ObjectType, Interface, TypeLiteral } from "./type-interface";
import { TypeListBaseType, Union, Intersection, Tuple } from "./type-list-base";
import { TypeReference, TypeParameter } from "./type-reference";
import { CallableType, Signature } from "./type-signature";
import { Undef } from "./type-undef";
import { type_def, get_type, create_type, add_member, auto_member, type_injection } from "./type-utils";

inspect.defaultOptions = {
    depth:      10,
    colors:     true,
    showHidden: false
};

[
    ...Object.values( {
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
                          TypeParameter,
                          CallableType,
                          Signature,
                          Undef,
                          type_def,
                          get_type,
                          create_type,
                          add_member,
                          auto_member
                      } )
].forEach( t => typeof t.init === 'function' && t.init() );

type_injection( {
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
                    TypeParameter,
                    CallableType,
                    Signature,
                    Undef
                } );



export {
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
};

