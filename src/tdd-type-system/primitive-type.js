/** ****************************************************************************
 * DESCRIPTION
 * @author julian.jensen
 * @since 0.0.1
 *******************************************************************************/
"use strict";

import { Type } from "./basic-type";

/**
 * @class Primitive
 * @extends Type
 */
export class Primitive extends Type
{
    boxesTo = null;
}

export class AnyType extends Primitive
{
    constructor()
    {
        super();
        this.typeName = 'any';
    }

    toString() { return 'any'; }
}

export class StringType extends Primitive
{
    constructor()
    {
        super();
        this.typeName = 'string';
        this.boxesTo  = 'String';
    }

    toString() { return 'string'; }
}

export class NumberType extends Primitive
{
    constructor()
    {
        super();
        this.typeName = 'number';
        this.boxesTo  = 'Number';
    }

    toString() { return 'number'; }
}

export class BooleanType extends Primitive
{
    constructor()
    {
        super();
        this.typeName = 'boolean';
        this.boxesTo  = 'Boolean';
    }

    toString() { return 'boolean'; }
}

export class NullType extends Primitive
{
    constructor()
    {
        super();
        this.typeName = 'null';
    }

    toString() { return 'null'; }
}

export class UndefinedType extends Primitive
{
    constructor()
    {
        super();
        this.typeName = 'undefined';
    }

    toString() { return 'undefined'; }
}

export class VoidType extends Primitive
{
    constructor()
    {
        super();
        this.typeName = 'void';
    }

    toString() { return 'void'; }
}

export class SymbolType extends Primitive
{
    constructor()
    {
        super();
        this.typeName = 'symbol';
        this.boxesTo  = 'Symbol';
    }

    toString() { return 'symbol'; }
}

export class NeverType extends Primitive
{
    constructor()
    {
        super();
        this.typeName = 'never';
    }

    toString() { return 'never'; }
}

export class ThisType extends Primitive
{
    constructor()
    {
        super();
        this.typeName = 'this';
    }

    toString() { return 'this'; }
}

const primitives = new Map( [
                                [ 'any', AnyType ],
                                [ 'string', StringType ],
                                [ 'number', NumberType ],
                                [ 'boolean', BooleanType ],
                                [ 'null', NullType ],
                                [ 'undefined', UndefinedType ],
                                [ 'void', VoidType ],
                                [ 'symbol', SymbolType ],
                                [ 'never', NeverType ],
                                [ 'this', ThisType ]
                            ] );

/**
 * @param {string} typeName
 * @return {*|null}
 */
export function primitive_from_typename( typeName )
{
    if ( !typeName )
        throw new Error( `Missing primitive type name` );

    const PCons = primitives.get( typeName );

    if ( !PCons )
        throw new Error( `Not a primitive: "${typeName}"` );

    return new PCons();
}

