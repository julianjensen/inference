/** ****************************************************************************
 * DESCRIPTION
 * @author julian.jensen
 * @since 0.0.1
 *******************************************************************************/
"use strict";

import { mix } from 'mixwith';
import { Type } from "../tdd/type-base";
import { Members } from "./interfaces/members";
import { Indexable } from "./interfaces/indexable";
import { GenericType } from "./type-variables";

/**
 * @class ObjectType
 * @extends {Members}
 * @extends {Indexable}
 * @extends {Type}
 */
export class ObjectType extends mix( Type ).with( Members, Indexable, GenericType )
{
}

/**
 * @class ArrayType
 * @extends {Members}
 * @extends {Indexable}
 * @extends {Type}
 */
export class ArrayType extends mix( Type ).with( Members, Indexable, GenericType )
{
    length = 0;
    elementType = null;
}

/**
 * @class TupleType
 * @extends {Indexable}
 * @extends {Type}
 */
export class TupleType extends mix( Type ).with( Indexable )
{
    length = 0;
    elementTypes = [];
}

/**
 * @class TypeLiteral
 * @extends Type
 * @extends Members
 * @extends Indexable
 */
export class TypeLiteral extends mix( Type ).with( Members, Indexable, GenericType )
{

}

