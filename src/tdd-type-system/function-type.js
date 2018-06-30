/** ****************************************************************************
 * DESCRIPTION
 * @author julian.jensen
 * @since 0.0.1
 *******************************************************************************/
"use strict";

import { mix } from 'mixwith';
import { Type } from '../tdd/type-base';
import { Members } from "./interfaces/members";
import { GenericType } from "./type-variables";

/**
 * @class FunctionType
 * @extends {Callable}
 * @extends {Constructs}
 * @extends {Members}
 * @extends {Type}
 */
export class FunctionType extends mix( Type ).with( Members, GenericType )
{
    declarations = [];

    /**
     * @param {Callable|Constructs|FunctionType|Array<Callable|Constructs>} decl
     */
    define( decl )
    {
        if ( Array.isArray( decl ) )
            decl.forEach( d => this.define( d ) );
        else if ( decl instanceof FunctionType )
            this.define( decl.declarations );
        else
            this.declarations.push( decl );
    }
}

/**
 * @class ClassType
 * @extends {Constructs}
 * @extends {Members}
 * @extends {Type}
 */
export class ClassType extends mix( Type ).with( Members, GenericType )
{
    constructors = [];

    /**
     * @param {Constructs} decl
     */
    define( decl )
    {
        this.constructors.push( decl );
    }
}

