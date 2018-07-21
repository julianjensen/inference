/** ****************************************************************************
 * DESCRIPTION
 * @author julian.jensen
 * @since 0.0.1
 *******************************************************************************/
"use strict";

import { TypeParameter, TypeReference } from "../type-variables";
import { type } from "typeofs";

const
    number = o => type( o ) === 'number',
    string = o => type( o ) === 'string',
    _has   = o => n => ( {}.hasOwnProperty.call( o, n ) ),
    hasStr = o => {
        const has = _has( o );
        return ( ...keys ) => keys.every( k => has( k ) && string( o[ k ] ) );
    };

/**
 * @class GenericType
 */
export const GenericType = superclass => class GenericType extends superclass
{
    /** @type {Array<TypeParameter>} */
    typeParameters = [];
    pnames = {};

    add_parameter_from_def( def )
    {
        const check = hasStr( def );

        if ( check( 'typeName', 'name' ) && def.typeName === def.name )
            this.add_type_parameter( def.name, new TypeParameter() );
        else if ( check( 'name', 'typeName', 'typeOperator' ) )
        {
            const tp = new TypeParameter();

            tp.constraint          = new TypeReference();
            tp.constraint.typeName = def.typeName;

            this.add_type_parameter( def.name, tp );
        }
        else if ( check( 'name', 'typeName', 'typeOperator', 'keyOf' ) )
        {
            const tp = new TypeParameter();

            tp.constraint          = new TypeReference();
            tp.constraint.typeName = def.typeName;
            tp.keyOf               = true;

            this.add_type_parameter( def.name, tp );
        }
    }

    /**
     * @param {string} name
     * @param {Type} type
     * @return {iCallable}
     */
    add_type_parameter( name, type )
    {
        this.pnames[ name ] = this.typeParameters.length;
        this.pnames[ this.typeParameters.length ] = name;
        this.typeParameters.push( type );

        return this;
    }

    /**
     * @param {number|string} nameOrIndex
     * @return {TypeParameter}
     */
    param_by( nameOrIndex )
    {
        if ( number( nameOrIndex ) )
            return this.typeParameters[ nameOrIndex ];

        return this.typeParameters[ this.pnames[ nameOrIndex ] ];
    }

    /**
     * @return {number}
     */
    hasTypeParameters()
    {
        return this.typeParameters.length;
    }

    /**
     * @param {...(Type|TypeReference)} refTypes
     */
    instantiate( ...refTypes )
    {

    }
};
