/** ****************************************************************************
 * DESCRIPTION
 * @author julian.jensen
 * @since 0.0.1
 *******************************************************************************/

"use strict";

import { mix } from 'mixwith';
import { Type } from "./basic-type";
import { Members } from "./interfaces/members";
import { Indexable } from "./interfaces/indexable";
import { GenericType } from "./interfaces/generic";
import { primitive_from_typename } from "./primitive-type";

function mem_name( name )
{
    if ( typeof name === 'string' ) return name;

    if ( name === Members.CONSTRUCTOR ) return 'New';
    else if ( name === Members.SIGNATURE ) return 'Call';

    throw new Error( `WTF is this: ${name}` );
}

function stringify()
{
    const ms = [];

    this.each_member( ( t, n ) => ms.push( `${mem_name( n )}: ${t}` ) );

    if ( !ms.length )
        return '{}';
    else if ( ms.length === 1 )
        return `{ ${ms[ 0 ]} }`;

    return `{\n    ${ms.join( ';\n    ' )}\n}`;

}

/**
 * @class ObjectType
 * @extends {Members}
 * @extends {Indexable}
 * @extends {Type}
 */
export class ObjectType extends mix( Type ).with( Members, Indexable, GenericType )
{
    toString()
    {
        return stringify.call( this );
    }
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

    toString()
    {
        return this.elementType ? `${this.elementType}[]` : '[]';
    }
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

    add_type( type )
    {
        if ( !this.keyType ) this.keyType = primitive_from_typename( 'number' );
        this.elementTypes.push( type );
    }

    toString()
    {
        if ( !this.elementTypes.length )
            return '[]';

        return `[ ${this.elementTypes.join( ', ' )} ]`;
    }

}

/**
 * @class TypeLiteral
 * @extends Type
 * @extends Members
 * @extends Indexable
 */
export class TypeLiteral extends mix( Type ).with( Members, Indexable, GenericType )
{
    // toString()
    // {
    //     return stringify.call( this );
    // }
}

