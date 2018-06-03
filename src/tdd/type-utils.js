/** ****************************************************************************
 * DESCRIPTION
 * @author julian.jensen
 * @since 0.0.1
 *
 * ```
 *  const
 *      namedFunc = name => ({[name]: function() {}})[ name ],
 *      namedInstance = name => new ( namedFunc( name ) );
 * ```
 * or, together
 * ```
 * const namedInstance = name => new ( ({[name]: function() {}})[ name ] );
 * ```
 *******************************************************************************/
"use strict";

import { ScopeManager } from "./scopes";
import { type } from "typeofs";

export const
    string = o => type( o ) === 'string',
    object = o => type( o ) === 'object',
    number = o => type( o ) === 'number',
    primitives = new Map();

const
    classMap = new Map();

let types = {
        Primitive: null,
        Signature: null,
        TypeReference: null,
        Interface: null,
        Undef: null,
        TypeLiteral: null
    };


function def()
{
    if ( !types.Primitive ) types  = definition( types );
}

/**
 * @param {object} klass
 */
export function register( klass )
{
    if ( classMap.has( klass.name ) ) return;

    classMap.set( klass.name, klass );
    classMap.set( klass, klass );
}

/**
 * @param {string|object} className
 * @return {any}
 */
export function definition( className )
{
    let r = {};

    if ( string( className ) ) return classMap.get( className );

    Object.keys( className ).forEach( key => r[ key ] = classMap.get( key ) );

    return r;
}

/**
 * @param {object} obj
 * @param {Scope} [scope]
 * @return {Type}
 */
export function type_def( obj, scope )
{
    def();

    if ( string( obj ) )
        obj = { type: obj };

    if ( string( obj.type ) )
    {
        if ( obj.type === 'reference' )
        {
            const
                refName = object( obj.typeName ) ? obj.typeName.name : obj.typeName,
                t = get_type( refName, false ),
                ref = new types.TypeReference( 'ref$' + refName, t );

            if ( obj.typeArguments )
                ref.add_type_args( ...obj.typeArguments.map( ta => string( ta ) || ta.typeName ) );

            return ref;
        }
        else if ( obj.type === 'typeliteral' )
        {
            const lit = new types.TypeLiteral( anon( 'lit' ), scope );

            obj.members.forEach( m => lit.add_member( m.type, m ) );

            return lit;
        }
        else if ( primitives.has( obj.type ) )
            return primitives.get( obj.type );
        else if ( ScopeManager.current.has( obj.type ) )
            return ScopeManager.current.find( obj.type );

        throw new SyntaxError( `Unknown type reference "${obj.type}"` );
    }

    if ( !string( obj.typeName ) )
        throw new SyntaxError( `Unknown type "${JSON.stringify( obj.typeName, null, 4 )}"` );

    return get_type( obj.typeName );


}

/**
 * @param {string} typeName
 * @param {string} typeIdentifier
 * @param {Type} [parent]
 * @return {Type}
 */
export function create_type( typeName, typeIdentifier, parent = null )
{
    let t;

    def();

    switch ( typeName )
    {
        case 'primitive':
            if ( primitives.has( typeName ) ) return primitives.get( typeName );

            t = new types.Primitive( typeIdentifier, ScopeManager.global );

            primitives.set( typeIdentifier, t );

            return t;

        case 'interface':
            t = new types.Interface( typeIdentifier );
            ScopeManager.current.add( t, typeIdentifier );
            return t;

        case 'signature':
            t = new types.Signature( typeIdentifier );
            ScopeManager.current.add( t, typeIdentifier );
            return t;

        case 'typeliteral':
            t = new types.TypeLiteral( typeIdentifier );
            ScopeManager.current.add( t, typeIdentifier );
            return t;
    }
}

/**
 * @param {string} name
 * @param {boolean} [required]
 * @return {Type}
 */
export function get_type( name, required = true )
{
    def();

    if ( primitives.has( name ) )
        return primitives.get( name );
    else if ( ScopeManager.current.has( name ) )
        return ScopeManager.current.get( name );

    if ( required )
        throw new ReferenceError( `Unknown type "${name}"` );

    const t = new types.Undef( name );
    ScopeManager.current.add( t, name );

    return t;
}

/**
 * @return {Entry[]}
 */
export function get_undefs()
{
    return [ ...ScopeManager.forEachSymbol( true ) ].filter( t => !t.isType( types.Undef ) );
}

/**
 * @param {string} prefix
 * @return {string}
 */
export function anon( prefix )
{
    return prefix + '$' + ( Math.random() * 1e7 | 0 );
}

