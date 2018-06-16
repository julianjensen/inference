/** ****************************************************************************
 * DESCRIPTION
 * @author julian.jensen
 * @since 0.0.1
 *******************************************************************************/
"use strict";

import { Type } from "./type-base";
import { register } from "./cross-ref";

/** */
export class TypeListBaseType extends Type
{
    constructor( name, scope )
    {
        super( name, scope );

        /** @type {Array<Type>} */
        this.typeList = [];
    }

    toString()
    {
        return this.typeList.map( t => `${t}` ).join( this.sep );
    }

    add_types( ...types )
    {
        this.create_local_scope();

        // const def = t => type_def( t, this.inner );

        this.typeList = this.typeList.concat( types ); // .map( def ) );

        return this;
    }

    /**
     * @param {any} t
     * @return {boolean}
     */
    isType( t )
    {
        return this.typeList.some( s => s.isType( t ) );
    }

    /**
     * @param t
     * @return {boolean}
     */
    is( t )
    {
        return this.isType( t );
    }

    /**
     * @return {boolean}
     */
    hasMembers()
    {
        return this.typeList.some( s => s.hasMembers() );
    }

    /**
     * @return {IterableIterator<Array<Type>>}
     */
    *[ Symbol.iterator ]()
    {
        yield *this.typeList;
    }

    /**
     * @param {Type} t
     * @return {boolean}
     */
    has_type( t )
    {
        for ( const type of this )
            if ( type.invariant( t ) ) return true;

        return false;
    }

    /**
     * @param {Type} t
     * @return {?Type}
     */
    get_type( t )
    {
        for ( const type of this )
            if ( type.invariant( t ) ) return type;
    }

    /**
     * @param {Type} t
     * @return {number}
     */
    get_index( t )
    {
        let index = 0;

        for ( const type of this )
        {
            if ( type.invariant( t ) ) return index;
            ++index;
        }

        return -1;
    }

    /**
     * @param {number} index
     * @return {Type}
     */
    at( index )
    {
        return index < 0 ? this.typeList[ this.typeList.length + index ] : this.typeList[ index ];
    }
}

/** */
export class Union extends TypeListBaseType
{
    constructor( a, b )
    {
        super( a, b );
        this.sep = ' | ';
    }
}

/** */
export class Intersection extends TypeListBaseType
{
    constructor( a, b )
    {
        super( a, b );
        this.sep = ' & ';
    }
}

/** */
export class Tuple extends TypeListBaseType
{
    constructor( a, b )
    {
        super( a, b );
        this.sep = ', ';
    }

    toString() { return `[ ${this.typeList.map( t => `${t}` ).join( this.sep )} ]`; }
}

register( TypeListBaseType, Union, Intersection, Tuple );
