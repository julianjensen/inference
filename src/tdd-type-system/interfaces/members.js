/** ****************************************************************************
 * DESCRIPTION
 * @author julian.jensen
 * @since 0.0.1
 *******************************************************************************/
"use strict";

/** */
export class Members
{
    constructor()
    {
        this.members = new Map();
    }

    /**
     * @return {string}
     */
    toString()
    {
        return `${[ ...this.members.values() ].map( t => `${t}` ).filter( x => x ).join( '; ' )}`;
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
     * @return {number}
     */
    get numMembers()
    {
        return this.members.size;
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
        this.members.set( name, type );

        return this;
    }

    static SIGNATURE = Symbol( 'signature' );
    static CONSTRUCTOR = Symbol( 'constructor' );
}
