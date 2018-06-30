/** ****************************************************************************
 * DESCRIPTION
 * @author julian.jensen
 * @since 0.0.1
 *******************************************************************************/

"use strict";

import { mix } from "mixwith";
import { Type } from "../tdd/type-base";
import { TupleType } from "./object-type";
import { Indexable } from "./interfaces/indexable";

/**
 * @class EnumType
 * @extends Type
 * @extends TupleType
 */
export class EnumType extends mix( Type ).with( TupleType )
{

}

/**
 * @class UnionType
 * @extends Type
 * @extends TupleType
 */
export class UnionType extends mix( Type ).with( TupleType )
{

}

/**
 * @class IntersectionType
 * @extends Type
 * @extends TupleType
 */
export class IntersectionType extends mix( Type ).with( TupleType )
{

}

/**
 * @class MappedType
 * @extends Type
 * @extends Indexable
 */
export class MappedType extends mix( Type ).with( Indexable )
{

}

/**
 * @class TypeAlias
 */
export class TypeAlias
{
    /** */
    constructor()
    {
        this.name = null;
        this.resolvesTo = null;
    }
}
