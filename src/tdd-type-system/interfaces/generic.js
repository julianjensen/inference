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

let Generic;

/**
 * @interface iGeneric
 */
export const iGeneric = superclass => Generic =
    /** @class Generic */
    class Generic extends superclass
    {
        /** @type {Array<TypeParameter>} */
        typeParameters = [];
        tnames         = {};

        /**
         * @param {object} def
         * @memberOf Generic
         * @memberOf iGeneric
         */
        add_parameter_from_def( def )
        {
            const check = hasStr( def );

            if ( check( 'name', 'typeName', 'typeOperator', 'keyOf' ) )
            {
                const tp = new TypeParameter();

                tp.name                = def.name;
                tp.constraint          = new TypeReference();
                tp.constraint.typeName = def.typeName;
                tp.keyOf               = true;

                return this.add_type_parameter( def.name, tp );
            }
            else if ( check( 'name', 'typeName', 'typeOperator' ) )
            {
                const tp = new TypeParameter();

                tp.name                = def.name;
                tp.constraint          = new TypeReference();
                tp.constraint.typeName = def.typeName;

                return this.add_type_parameter( def.name, tp );
            }
            else if ( check( 'typeName', 'name' ) && def.typeName === def.name )
            {
                const tp = new TypeParameter();

                tp.typeName = def.name;

                return this.add_type_parameter( def.name, tp );
            }
        }

        /**
         * @param {string} name
         * @param {Type} type
         * @return {iCallable}
         */
        add_type_parameter( name, type )
        {
            this.tnames[ name ]                       = this.typeParameters.length;
            this.tnames[ this.typeParameters.length ] = name;
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

            return this.typeParameters[ this.tnames[ nameOrIndex ] ];
        }

        /**
         * @return {boolean}
         * @memberOf Generic
         * @memberOf iGeneric
         */
        hasTypeParameters()
        {
            return !!this.typeParameters.length;
        }

        /**
         * @param {...(Type|TypeReference)} refTypes
         */
        instantiate( ...refTypes )
        {

        }

        /**
         * @return {string}
         * @memberOf Generic
         * @memberOf iGeneric
         */
        type_parameters_to_string()
        {
            return this.typeParameters.length ? '<' + this.typeParameters.map( ( ta, i ) => `${ta.stringify( this.tnames[ i ] )}` ).join( ', ' ) + '>' : '';
        }
    };

export { Generic };
