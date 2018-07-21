/** ****************************************************************************
 * DESCRIPTION
 * @author julian.jensen
 * @since 0.0.1
 *******************************************************************************/
"use strict";

import { type } from "typeofs";
import { Callable} from "./callable";

const object = o => type( o ) === 'object';

function dump_names( o ) {

    let p = o,
        names = [];

    while ( p ) {
        names.push( p.constructor.name );
        p = Object.getPrototypeOf( p );
    }

    return names.join( ' -> ' );
}

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
export const Members = superclass => class Members extends superclass
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
        // let mems = [];
        //
        // if ( this.keyType && this.valueType )
        //     mems.push( `[ ${this.keyType} ]: ${this.valueType}` );
        //
        // return `${[ ...this.members.values(), ...mems ].map( t => `${t}` ).filter( x => x ).join( '; ' )}`;
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

    add_member( name, type )
    {
        if ( object( type ) && type.hasOwnProperty( 'keyType' ) && type.hasOwnProperty( 'valueType' ) )
        {
            this.keyType   = type.keyTpe;
            this.valueType = type.valueType;
            return;
        }
        // console.warn( `Adding member "${typeof name === 'symbol' ? 'SYMBOL' : name}, defined as ${type ? type.constructor.name : 'no type'}, info: ${type.info()}` );
        this.members.set( name, type );

        return this;
    }

    each_member( fn )
    {
        for ( const [ name, type ] of this.members.entries() )
            fn( type, name );
    }
};

Members.SIGNATURE   = Symbol( 'signature' );
Members.CONSTRUCTOR = Symbol( 'constructor' );
