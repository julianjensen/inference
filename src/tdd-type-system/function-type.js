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

/**
 * @typedef {class} ActualFunction
 * @implements IdealSignature
 * @implements IdealObject
 */

/**
 * @typedef {class} ActualObject
 * @implements IdealObject
 */

/**
 * @typedef {class} ActualClass
 * @implements IdealSignature
 * @implements IdealObject
 */

/**
 * @interface IdealSignature
 * @property {function} add_return_type
 * @property {function} add_parameter       - FORMAL or TYPE
 * @property {function} add_parameters      - Same as above, except ...args
 * @property {function} stringify
 * @property {number} flags                 - CONSTRUCTOR, METHOD
 * @property {function} match               - Given an AST (or whatever), do the signatures match?
 * @property {Array<IdealParameter>} parameters
 */

/**
 * @interface IdealParameter
 * @property {string} name
 * @property {IdealType} type
 * @property {number} flags
 */

/**
 * @typedef {object} IdealFunction
 * @property {Array<IdealFunction>} signatures
 * @property {function} add_signature
 * @property {function(type, function(IdealSignature, object)):boolean} find - `type` is one of CONSTRUCTOR, METHOD, FUNCTION, ANY
 */

/**
 * @typedef {object} IdealClass
 * @property {function} add_function    - Pass function and signature
 * @property {function} add_signature   - Pass function and signature
 * @property {function} add_constructor - Like above `add_function`
 * @property {function} add_constructor_signature - Like above `add_signature`
 * @property {function} add_property
 */

/**
 * @interface IdealProperty
 * @property {IdealType} type
 * @property {number} flags
 */

/**
 * @interface IdealType
 */

/**
 * @interface IdealObject
 * @property {Map<string, IdealProperty>} properties
 * @property {function} add_property
 * @property {function(type, function(IdealProperty, string, object)):boolean} find - `type` is one of PROPERTY, SIGNATURE, ANY
 */

