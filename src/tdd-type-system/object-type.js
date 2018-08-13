/** ****************************************************************************
 * DESCRIPTION
 * @author julian.jensen
 * @since 0.0.1
 *******************************************************************************/
"use strict";

import { mix } from 'mixwith';
import { Type } from "./basic-type";
import { iMembers } from "./interfaces/members";
import { iIndexable } from "./interfaces/indexable";
import { iGeneric } from "./interfaces/generic";
import { primitive_from_typename } from "./primitive-type";
import { DEBUG, readable_name } from "./utils";
import { iScope } from "./interfaces/scopes";

/**
 * @return {string}
 * @this {Members}
 */
function stringify( name )
{
    const ms = [];
    const preamble = ( this.isInterface ? 'interface ' : '' ) + ( name || '' ) + ( this.hasTypeParameters ? this.type_parameters_to_string() : '' );

    this.each_member( ( t, n ) => ms.push( `${t.stringify( readable_name( n ) )}`.replace( /;;+/g, '' ) ) );

    if ( !ms.length )
        return `${preamble} ${DEBUG.DEFINITION ? `// "${this.constructor.name}"\n` : ''}{}`;
    else if ( ms.length === 1 )
        return `${preamble} ${DEBUG.DEFINITION ? `// "${this.constructor.name}"\n` : ''}{ ${ms[ 0 ]} }`;

    return `${preamble} ${DEBUG.DEFINITION ? `// "${this.constructor.name}"\n` : ''}{\n    ${ms.join( ';\n    ' )}\n}`;
}

/**
 * @class ObjectType
 * @extends {iMembers}
 * @extends {iIndexable}
 * @extends {Type}
 */
export class ObjectType extends mix( Type ).with( iMembers, iIndexable, iGeneric )
{
    isInterface = false;

    toString()
    {
        return stringify.call( this );
    }

    stringify( name )
    {
        return stringify.call( this, name );
    }
}

/**
 * @class ArrayType
 * @extends {iMembers}
 * @extends {iIndexable}
 * @extends {Type}
 */
export class ArrayType extends mix( Type ).with( iMembers, iIndexable, iGeneric )
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
 * @extends {iIndexable}
 * @extends {Type}
 */
export class TupleType extends mix( Type ).with( iIndexable )
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
 * @extends iMembers
 * @extends iIndexable
 */
export class TypeLiteral extends mix( Type ).with( iMembers, iIndexable, iGeneric )
{
    // toString()
    // {
    //     return stringify.call( this );
    // }
}

/**
 * @class Namespace
 * @extends Type
 * @extends Members
 * @extends Scope
 */
export class Module extends mix( Type ).with( iMembers, iScope )
{
    /**
     * @param {string} name
     */
    stringify( name )
    {
        return 'namespace ' + name + ' ' + super.stringify( name );
    }
}

/**
 * @class Namespace
 * @extends Module
 */
export class Namespace extends Module
{
    /**
     * @param {string} name
     */
    stringify( name )
    {
        return 'namespace ' + name + ' ' + super.stringify( name );
    }
}

/**
 * @class NodeScope
 * @extends Scope
 * @extends Type
 */
export class NodeScope extends mix( Type ).with( iScope )
{
    /**
     * @param {Scope} p
     * @param {?Type} [owner]
     */
    constructor( p = null, owner = null )
    {
        super();

        /** @type {?Scope} */
        this.parent = p;
        /** @type {Type} */
        this.owner = owner;
    }
}
