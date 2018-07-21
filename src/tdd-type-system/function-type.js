/** ****************************************************************************
 * DESCRIPTION
 * @author julian.jensen
 * @since 0.0.1
 *******************************************************************************/
"use strict";

import { mix } from 'mixwith';
import { Type } from "./basic-type";
import { Members } from "./interfaces/members";
import { GenericType } from "./interfaces/generic";
import { iCallable } from "./interfaces/callable";

/**
 * @class FunctionDecl
 * @extends {iCallable}
 * @extends {GenericType}
 * @extends {Type}
 */
export class FunctionDecl extends mix( Type ).with( GenericType, iCallable )
{
}

/**
 * @class FunctionType
 * @extends {iCallable}
 * @extends {Constructs}
 * @extends {Members}
 * @extends {Type}
 */
export class FunctionType extends mix( Type ).with( Members )
{
    declarations = [];

    add_declaration( decl )
    {
        this.declarations.push( decl );
    }

    toString()
    {
        return this.declarations.map( t => `${t}` ).join( ';\n    ' );
    }

    /**
     * @param {iCallable|Constructs|FunctionType|Array<iCallable|Constructs>} decl
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
export class ClassType extends mix( Type ).with( Members, GenericType, iCallable )
{
    declarations = [];

    add_declaration( decl )
    {
        this.declarations.push( decl );
    }

    toString()
    {
        return this.declarations.map( t => `${t}` ).join( ';\n    ' );
    }
}

