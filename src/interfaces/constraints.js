/** ****************************************************************************************************
 * File: constraints (jsdoc-tag-parser)
 * @author julian on 3/1/18
 * @version 1.0.0
 * @copyright Planet3, Inc.
 *******************************************************************************************************/
'use strict';

import { TypeFlags, TypeSystemPropertyName } from "../types";

/**
 * @interface Constraints
 * @this Type
 */
export const Constraints = {

    /**
     * @return {Type}
     * @this Type
     */
    getConstraintOfType()
    {
        return this.getBaseConstraintOfType();
    },

    /**
     * @return {?Type}
     * @this Type
     */
    getBaseConstraintOfType()
    {
        if ( this.flags & ( TypeFlags.TypeVariable | TypeFlags.UnionOrIntersection ) )
        {
            const constraint = this.getResolvedBaseConstraint();

            if ( constraint !== noConstraintType && constraint !== circularConstraintType )
                return constraint;
        }
        else if ( this.flags & TypeFlags.Index )
            return stringType;

        return undefined;
    },



};
