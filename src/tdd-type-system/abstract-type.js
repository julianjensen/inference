/** ****************************************************************************
 * DESCRIPTION
 * @author julian.jensen
 * @since 0.0.1
 *******************************************************************************/
"use strict";

import { mix } from "mixwith";
import { Type } from "./basic-type";
import { iIndexable } from "./interfaces/indexable";

/**
 * @class EnumType
 * @extends Type
 * @extends TupleType
 */
export class EnumType extends Type
{
    length = 0;
    elementTypes = [];
}

/**
 * @class UnionType
 * @extends Type
 * @extends TupleType
 */
export class UnionType extends Type
{
    length = 0;
    elementTypes = [];

    add_type( type )
    {
        this.elementTypes.push( type );
        this.length = this.elementTypes.length;
    }

    toString()
    {
        return this.elementTypes.map( t => `${t}` ).join( ' | ' );
    }
}

/**
 * @class IntersectionType
 * @extends Type
 * @extends TupleType
 */
export class IntersectionType extends Type
{
    length = 0;
    elementTypes = [];

    add_type( type )
    {
        this.elementTypes.push( type );
        this.length = this.elementTypes.length;
    }

    toString()
    {
        return this.elementTypes.map( t => `${t}` ).join( ' & ' );
    }
}

/**
 * @class MappedType
 * @extends Type
 * @extends iIndexable
 */
export class MappedType extends mix( Type ).with( iIndexable )
{
    toString()
    {
        return `{ [ ${this.keyType} ]: ${this.valueType} }`;
    }
}

/**
 * @class TypeAlias
 */
export class TypeAlias extends Type
{
    name = null;
    resolvesTo = null;
}
