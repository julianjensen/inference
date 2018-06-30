/** ****************************************************************************
 * DESCRIPTION
 * @author julian.jensen
 * @since 0.0.1
 *******************************************************************************/
"use strict";

import { Type } from "./type-base";
import { definition, register } from "./cross-ref";
import { ScopeManager } from "./scopes";
import { get_type } from "./type-system-basics";

let Identifier, Signature, CallableType, TypeParameter;

/** */
export class ObjectType extends Type
{
    /**
     * @param {string} name
     * @param {Scope} [scope]
     */
    constructor( name, scope )
    {
        super( name, scope );
        if ( !Identifier ) Identifier = definition( 'Identifier' );
        if ( !Signature ) Signature = definition( 'Signature' );
        if ( !CallableType ) CallableType = definition( 'CallableType' );
        if ( !TypeParameter ) TypeParameter = definition( 'TypeParameter' );
        this.isContainer = true;
        /** @type {?CallableType} */
        this.constructors = null;
        /** @type {?CallableType} */
        this.callables = null;

        scope = scope || ScopeManager.global;

        /** @type {Scope} */
        this.inner = this.members = scope.from( this );
        this.typeParameters = [];

        this.index = [];
    }

    /**
     * @return {string}
     */
    toString()
    {
        const
            tp = this.typeParameters.length ? `<${this.typeParameters.map( t => `${t}` ).join( ', ' )}>` : '',
            mstr = this.members.map( t => `${t}` ).concat( this.index.length ? `[ ${this.index[ 0 ].key} ]: ${this.index[ 0 ].type}` : '' );

        return `${tp} { ${mstr.filter( x => x ).join( '; ' )} }`;
        // return this.members.size < 2 ? `{ ${this.members.map( t => `${t}` )} }` : `{ ${this.members.map( t => `${t}` ).join( '; ' )} }`;
    }

    /**
     * @param {...(string|Type)} typeArgs
     * @return {ObjectType}
     */
    add_type_parameters( ...typeArgs )
    {
        this.typeParameters = this.typeParameters.concat( typeArgs.map( t => typeof t === 'string' ? new TypeParameter( t, null, this ) : t ) );

        return this;
    }

    /**
     * @param {Identifier|object} keyIdent
     * @param {Type} [contentType]
     * @return {ObjectType}
     */
    add_index( keyIdent, contentType )
    {
        this.index.push( {
            key: keyIdent,
            type: contentType
        } );

        return this;
    }

    /**
     * @return {boolean}
     */
    has_index()
    {
        return true;
    }

    /**
     * @return {Type}
     */
    index_key_type()
    {
        return this.index.length ? this.index[ 0 ].key : get_type( 'string', false );
    }

    /**
     * @return {Type}
     */
    index_type()
    {
        return this.index.length ? this.index[ 0 ].type : get_type( 'any', false );
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
        return this.members.find( name, true );
    }

    /**
     * @param {string} name
     * @return {Type|Identifier}
     */
    get( name )
    {
        return this.members.find( name );
    }

    /** @type {number} */
    get numSignatures()
    {
        return this.signatures.length;
    }

    /** @type {number} */
    get numConstructors()
    {
        return this.constructors ? this.constructors.size : 0;
    }

    /** @type {number} */
    get numCallables()
    {
        return this.callables ? this.callables.size : 0;
    }

    /** @type {number} */
    get numMethods()
    {
        return this.methods.length;
    }

    /** @type {Type[]} */
    get signatures()
    {
        const tmp = [ ...this.members.forEach( Type ) ].filter( t => t.isType( CallableType ) );

        if ( this.constructors ) tmp.push( this.constructors );
        if ( this.callables ) tmp.push( this.callables );

        return tmp;
    }

    /** @type {Type[]} */
    get methods()
    {
        return [ ...this.members.forEach( Type ) ].filter( t => t.isType( CallableType ) && t.isMethod );
    }
}

/** */
export class Interface extends ObjectType { toString() { return `interface ${this.name}${super.toString()}`; } }

/** */
export class TypeLiteral extends ObjectType {}

register( ObjectType, Interface, TypeLiteral );
