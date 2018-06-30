/** ****************************************************************************
 * DESCRIPTION
 * @author julian.jensen
 * @since 0.0.1
 *******************************************************************************/
"use strict";

import { ScopeManager, primitives } from "./scopes";
import { type } from "typeofs";
import _ from 'lodash';
import { definition } from "./cross-ref";

export { ScopeManager };

export const
    string = o => type( o ) === 'string',
    object = o => type( o ) === 'object',
    number = o => type( o ) === 'number',
    _has   = o => n => [].hasOwnProperty.call( o, n );



let types = {
    Primitive:     null,
    Signature:     null,
    CallableType:  null,
    TypeReference: null,
    TypeParameter: null,
    Interface:     null,
    Undef:         null,
    TypeLiteral:   null,
    Union:         null,
    Intersection:  null,
    Tuple:         null,
    ObjectType:    null,
    Identifier:    null
};

export function type_injection( obj )
{
    Object.keys( types ).forEach( k => types[ k ] = obj[ k ] );
}

/** */
function def()
{
    if ( !types.Primitive ) types = definition( types );
}

/**
 * @return {ScopeManager}
 */
export function get_scope_manager()
{
    return ScopeManager;
}

/**
 * @param {object} obj
 * @param {Scope} [scope]
 * @return {Type}
 */
export function type_def( obj, scope )
{
    const make_list = ( name, ...typelist ) => new types[ name ]( anon( name.toLowerCase() ), scope ).add_types( ...typelist.map( t => type_def( t, scope ) ) );

    // def();

    if ( string( obj ) )
        obj = { type: obj };

    if ( obj.isArray )
    {
        if ( type( obj.typeName ) === 'object' )
            obj = obj.typeName;

        return new types.TypeReference( 'Array', get_type( 'Array', false ), scope )
            .add_type_args( type_def( _.omit( obj, 'isArray' ), scope ) );

    }

    if ( string( obj.type ) )
    {
        if ( obj.type === 'reference' )
        {
            const
                refName = object( obj.typeName ) ? obj.typeName.name : obj.typeName,
                t       = get_type( refName, false ),
                ref     = new types.TypeReference( refName, t );

            if ( obj.typeArguments )
                ref.add_type_args( ...obj.typeArguments.map( ta => string( ta ) || ta.typeName ) );

            return ref;
        }
        else if ( obj.type === 'typeliteral' )
        {
            const lit = new types.TypeLiteral( anon( 'lit' ), scope );

            obj.members.forEach( m => add_member( lit, m.type, m ) );

            return lit;
        }
        else if ( obj.type === 'union' )
            return make_list( 'Union', ...obj.types );
        else if ( obj.type === 'intersection' )
            return make_list( 'Intersection', ...obj.types );
        else if ( obj.type === 'tuple' )
            return make_list( 'Tuple', ...obj.types );
        else if ( obj.type === 'mapped' )
            return type_def( 'TypeLiteral', obj.definition );

        else if ( primitives.has( obj.type ) )
            return primitives.get( obj.type );
        else if ( ScopeManager.current.has( obj.type ) )
            return ScopeManager.current.find( obj.type );

        throw new SyntaxError( `Unknown type reference "${obj.type}"` );
    }

    if ( !string( obj.typeName ) )
        throw new SyntaxError( `Unknown type "${JSON.stringify( obj, null, 4 )}", obj = "${obj}"` );

    return get_type( obj.typeName );


}

/**
 * @param {string} typeName
 * @param {string} typeIdentifier
 * @param {object} [def]
 * @return {Type|Interface|TypeLiteral|Signature}
 */
export function create_type( typeName, typeIdentifier, def = null )
{
    let t;

    // def();

    switch ( typeName )
    {
        case 'primitive':
            return ScopeManager.global.get( typeName );

        case 'interface':
            t = new types.Interface( typeIdentifier );
            ScopeManager.current.add( t, typeIdentifier );
            if ( def && def.typeParameters )
                t.add_type_parameters( ...def.typeParameters.map( t => t.name ) );
            return t;

        case 'signature':
            t = new types.Signature( typeIdentifier );
            ScopeManager.current.add( t, typeIdentifier );
            if ( def && def.typeParameters )
                t.add_type_parameters( ...def.typeParameters.map( t => t.name ) );
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
    // def();

    if ( name === 'object' ) name = 'Object';

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
 * @param {Interface|Type} intr
 * @param {object} def
 */
export function auto_member( intr, def )
{
    const
        type = def.name === 'New' && def.flags === 'Signature' ? 'constructor' :
               def.name === 'Call' && def.flags === 'Signature' ? 'callable' :
               def.flags === 'Method' ? 'method' :
               def.flags === 'Property' ? 'property' :
               def.flags === 'TypeParameter' ? 'typeparam' : 'unknown',
        name = def.name;

    def.decls.forEach( decl => add_member( intr, type, decl, name ) );
}

/**
 * @param {Interface|Type} intr
 * @param {string} type
 * @param {object} def
 * @param {string} [name]
 */
export function add_member( intr, type, def, name )
{
    let func, sym, call;

    /**
     * @param {CallableType} fn
     * @return {Signature}
     */
    function finish_func( fn )
    {
        if ( def.parameters )
        {
            if ( !fn.inner )
                fn.create_local_scope();

            def.parameters.forEach( p => {
                const opts = {
                          optional: !!p.optional,
                          rest:     !!p.rest
                      },
                      sym  = new types.Identifier( p.name, type_def( p, fn.inner ), opts );

                func.add_parameter( p.name, sym );
            } );
        }

        if ( def.typeParameters )
            func.add_type_parameters( ...def.typeParameters.map( td => create_type_parameter( td, fn ) ) );

        if ( def.type )
            func.add_type( type_def( def.type ) );

        fn.add_signature( func );
        fn.parent = func.parent = intr;
        return func;
    }

    switch ( type )
    {
        case 'constructor':
            call = intr.constructors || ( intr.constructors = new types.CallableType( null, intr.members ) );

            /** @type {Signature|Type} */
            func = create_type( 'signature', anon( 'constructor$' + intr.name ) );
            call.isConstructor = true;
            return finish_func( call );

        case 'method':
            if ( !intr.members.has( name ) )
                call = intr.members.add( new types.CallableType( name, intr.members ) );
            else
                call = intr.members.get( name );

            func          = create_type( 'signature', name );
            call.isMethod = true;
            return finish_func( call );

        case 'callable':
            call = intr.callables || ( intr.callables = new types.CallableType( null, intr.members ) );

            func            = create_type( 'signature', anon( 'call$' + intr.name ) );
            call.isCallable = true;
            return finish_func( call );

        case 'property':
            sym = new types.Identifier( name, type_def( def.type || def ), { optional: !!def.optional } );
            intr.members.add( sym );
            sym.parent = intr;
            break;

        case 'index':
            const
                content = type_def( def.typeName ),
                p       = def.parameters[ 0 ],
                key     = new types.Identifier( p.name, type_def( p.type ), {} );

            intr.add_index( key, content );
            break;

        case 'typeparam':
            throw new SyntaxError( `Why does this happen?` );
            // intr.add_type_parameters( def.name );
            // break;

        default:
            throw new Error( `Unknown member "${name}", type: "${type}", decl: ${JSON.stringify( def )}` );
    }
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

/**
 * Possible values passed:
 * - `{ name: 'T', typeName: 'T' }` is `<T>`
 * - `{ name: 'P', typeName: 'T', typeOperator: 'in', keyOf: boolean }` is `[ P in keyOf T ]`
 * - `{ name: 'T', typeName: 'P', typeOperator: 'extends' }` is `T extends P`
 *
 * @param {object} def
 */
export function create_type_parameter( def, scope )
{
    if ( !def )
        throw new SyntaxError( `Missing definition for type parameter` );

    const has = _has( def );

    if ( has( 'name' ) && has( 'typeName' ) && Object.keys( def ).length === 2 )
    {
        if ( def.name !== def.typeName )
            throw new SyntaxError( `Not sure what ot make of "${def.name}" and "${def.typeName}"` );

        return new types.TypeParameter( def.name, null, scope );
    }

    const
        constraint = get_type( def.typeName, false ),
        t = new types.TypeParameter( def.name, constraint, scope );

    if ( def.keyOf ) t.keyOf = true;

    return t;
}
