/** ****************************************************************************
 * DESCRIPTION
 * @author julian.jensen
 * @since 0.0.1
 *
 * FunctionType with members
 *      FunctionDecl[] with generics and callable
 *
 * ClassType with members
 *      FunctionDecl[] with generics and callable
 *******************************************************************************/

"use strict";

import { mix } from 'mixwith';
import { Type } from "./basic-type";
import { iMembers } from "./interfaces/members";
import { iGeneric } from "./interfaces/generic";
import { iCallable, iConstructs } from "./interfaces/callable";
import { iScope } from "./interfaces/scopes";
import { NodeScope } from "./object-type";

/**
 * @class FunctionDecl
 * @extends {Callable}
 * @extends {Generic}
 * @extends {Type}
 */
export class FunctionDecl extends mix( Type ).with( iGeneric, iCallable )
{
}

/**
 * @class FunctionDecl
 * @extends {Constructs}
 * @extends {Generic}
 * @extends {Type}
 */
export class ConstructorDecl extends mix( Type ).with( iGeneric, iConstructs )
{
}

/**
 * @class FunctionType
 * @extends {Members}
 * @extends {Type}
 */
export class FunctionShared extends mix( Type ).with( iMembers )
{
    /** @type {Array<FunctionDecl>|Array<ConstructorDecl>} */
    declarations = [];
    parameterScope = new NodeScope( null, this );
    functionScope = new NodeScope( this.parameterScope, this );

    /**
     * @param {FunctionDecl|ConstructorDecl} decl
     */
    add_declaration( decl )
    {
        this.declarations.push( decl );
    }

    /**
     * @param {string} name
     * @return {string}
     */
    stringify( name )
    {
        if ( !name ) return this.toString();

        return this.declarations.map( t => `${t.stringify( name )}` ).join( ';\n    ' );
    }

    /**
     * @return {string}
     */
    toString()
    {
        return this.declarations.map( t => `${t}` ).join( ';\n    ' );
    }

    /**
     * @param {iCallable|iConstructs|FunctionType|Array<iCallable|iConstructs>} decl
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
 * @extends {FunctionShared}
 */
export class ClassType extends FunctionShared {}

/**
 * @class FunctionType
 * @extends {FunctionShared}
 */
export class FunctionType extends FunctionShared {}

