/** ****************************************************************************
 * DESCRIPTION
 * @author julian.jensen
 * @since 0.0.1
 *******************************************************************************/
"use strict";

import { type } from "typeofs";
import { Callable} from "./callable";
import { nameless } from "../utils";

const { CONSTRUCTOR, SIGNATURE } = nameless;

const object = o => type( o ) === 'object';

let Members;

/**
 * @param {string} name
 * @return {string}
 */
function mem_name( name )
{
    if ( typeof name === 'string' ) return name;

    if ( name === iMembers.CONSTRUCTOR ) return 'New';
    else if ( name === iMembers.SIGNATURE ) return 'Call';

    return '<anonymous>';

    // throw new Error( `WTF is this: ${name}` );
}

/**
 * @return {string}
 * @this {Members}
 */
function stringify()
{
    const ms = [];
    this.each_member( ( t, n ) => ms.push( t instanceof Callable ? `${mem_name( n )}${t}` : `${mem_name( n )}: ${t}` ) );

    if ( this.keyType && this.valueType )
        ms.push( `[ ${this.keyType} ]: ${this.valueType}` );

    if ( !ms.length )
        return '{}';
    else if ( ms.length === 1 )
        return `{ ${ms[ 0 ]} }`;

    return `{\n    ${ms.join( ';\n    ' )}\n}`;

}


/** */
export const iMembers = superclass => Members =
    /** @class Members */
    class Members extends superclass
{
    members = new Map();

    /**
     * @return {number}
     */
    get numMembers()
    {
        return this.members.size;
    }

    /**
     * @return {string}
     */
    toString()
    {
        return stringify.call( this );
    }

    /**
     * @return {boolean}
     * @override
     */
    hasMembers()
    {
        return this.members.size !== 0;
    }

    /**
     * @param {string} name
     * @return {Identifier|Type}
     */
    own( name )
    {
        return this.members.get( name );
    }

    /**
     * @param {string} name
     * @return {Type|Identifier}
     */
    get( name )
    {
        return this.members.get( name );
    }

    add_member( name, type, parent )
    {
        if ( object( type ) && type.hasOwnProperty( 'keyType' ) && type.hasOwnProperty( 'valueType' ) )
        {
            this.keyType   = type.keyType;
            this.valueType = type.valueType;
            return;
        }

        this.members.set( name, type );

        this.parent = this.owner = parent;

        return this;
    }

    /**
     * @param {function} fn
     * @memberOf Members
     */
    each_member( fn )
    {
        for ( const [ name, type ] of this.members.entries() )
            fn( type, name );
    }
};

iMembers.SIGNATURE   = SIGNATURE;
iMembers.CONSTRUCTOR = CONSTRUCTOR;

export { Members };
