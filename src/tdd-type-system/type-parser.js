/** ****************************************************************************
 * DESCRIPTION
 * @author julian.jensen
 * @since 0.0.1
 *******************************************************************************/
"use strict";

import { type } from "typeofs";
// import { Parser } from '../utils/parser';
import { ArrayType, Module, ObjectType, TupleType, TypeLiteral } from "./object-type";
import { ClassType, ConstructorDecl, FunctionDecl, FunctionType } from "./function-type";
import { define_type_parameter, TypeArgument, TypeParameter, TypeReference } from "./type-variables";
import { Generic } from "./interfaces/generic";
import { primitive_from_typename } from "./primitive-type";
import { IntersectionType, MappedType, UnionType } from "./abstract-type";
import { global_scope, DECL, get_decl, get_kind, get_scope, nameless, defer_scope } from "./utils";
import { Scope } from "./interfaces/scopes";

const { CONSTRUCTOR, SIGNATURE } = nameless;

export const
    string = o => type( o ) === 'string',
    object = o => type( o ) === 'object',
    number = o => type( o ) === 'number',
    array = o => Array.isArray( o ),
    _has   = o => n => ( Object.prototype.hasOwnProperty.call( o, n ) ),
    has    = ( o, n ) => _has( o )( n );

let parser;

export const isGeneric = type => !!type && type instanceof Generic && type.hasTypeParameters();

function define_identifier( current, name, def )
{
    let scope;

    while ( current && !( scope = get_scope( current ) ) )
        current = current.parent;

    if ( !scope )
        scope = global_scope();

    scope.add( name, def );

    return scope;
}

// /**
//  * @param {string} codeStr
//  * @param {string} [type='.ts']
//  */
// function parse_string( codeStr, type = '.ts' )
// {
//     if ( !parser )
//         parser = new Parser( [ 'data' ] );
//
//     return parser.parse_snippet( codeStr, type );
// }
//
// function top_level( decls )
// {
//     const declType = decls[ 0 ].kind;
//
//     if ( !decls.every( d => d.kind === declType ) )
//         throw new Error( `Figure out how to deal with this: ${JSON.stringify( decls, null, 4 )}` );
//
//     switch ( declType )
//     {
//         case 'InterfaceDeclaration':
//             return new TypeLiteral();
//
//         default:
//             throw new Error( `No handler for "${declType}"` );
//     }
// }

/**
 * @param {object} def
 * @param {Type} [parent]
 * @return {{name: string|symbol, type: ClassType|FunctionType}}
 */
function function_definition( def, parent )
{
    let outer, name, ConstrFunc = FunctionDecl;

    if ( def.name === "New" && def.decls[ 0 ].kind === DECL.CONSTRUCTOR )
    {
        outer = new ClassType().debug( 'constructor symbol' );
        name = CONSTRUCTOR;
        ConstrFunc = ConstructorDecl;
    }
    else if ( def.name === "Call" && def.decls[ 0 ].kind === DECL.CALL )
    {
        outer = new FunctionType().debug( 'call symbol' );
        name = SIGNATURE;
    }
    else
    {
        outer = new FunctionType().debug( def.name + ' as method' );
        name = def.name;
    }

    outer.parent = parent;

    def.decls.forEach( ( decl, i ) => {
        /** @type {FunctionDecl|ConstructorDecl} */
        const type = new ConstrFunc().debug( ConstrFunc.name );

        type.type = type_from_def( decl.type, type );

        if ( decl.parameters )
            decl.parameters.map( p => type.add_parameter( p.name, type_from_def( p, type ), { optional: p.optional, rest: p.rest } ) );

        if ( decl.typeParameters )
            decl.typeParameters.forEach( tp => type.add_parameter_from_def( tp ) );

        outer.add_declaration( type );
        type.parent = outer;
    } );

    return { name, type: outer };
}

/**
 *
 */
export function init()
{
    defer_scope( Scope );
    global_scope( new Module() );
}

/**
 * @param {object} def
 * @param {Type|iGeneric|Generic} [parent]
 */
export function type_from_def( def, parent = global_scope() )
{
    const
        add_type_params = ( type, obj ) => has( obj, 'typeParameters' ) && type instanceof Generic && type.add_type_parameter( obj ),
        add_type_arguments = ( type, obj ) => has( obj, 'typeArguments' ) && type.add_type_parameter( obj );

    if ( !def ) return null;

    if ( !has( def, 'kind' ) && has( def, 'decls' ) )
        def.kind = def.decls[ 0 ].kind;

    switch ( get_kind( def ) )
    {
        case DECL.INTERFACE:
            const
                decls = def.decls,
                idecl = decls && get_decl( decls, DECL.INTERFACE ),
                container = new ObjectType().debug( def.name ),
                _type_from_def = arg => type_from_def( arg, container );

            container.isInterface = true;

            if ( decls )
                idecl.members.map( _type_from_def ).filter( x => x ).forEach( t => container.add_member( t.name, t.type, container ) );

            container.parent = parent;
            return { name: def.name, type: container };

        case DECL.METHOD:
        case DECL.CALL:
        case DECL.CONSTRUCTOR:
            return function_definition( def, parent );

        case DECL.PROPERTY:
            if ( def.decls )
                return { name: def.name, type: type_from_def( def.decls[ 0 ], parent ) };
            else
                return type_from_def( def.type, parent );

        case DECL.VARIABLE:
            const
                non_var = arr => arr.find( d => d.kind !== DECL.VARIABLE ).kind,
                vdecl = def.decls && get_decl( def.decls, DECL.VARIABLE );

            define_identifier( parent, def.name, type_from_def( vdecl.type, parent ) );
            return type_from_def( { ...def, kind: def.kind !== DECL.VARIABLE ? def.kind : non_var(def.decls ), decls: def.decls.filter( d => d.kind !== DECL.VARIABLE ) }, parent );

        case DECL.TYPEPARAM:
            const
                tpDecl = def.decls[ 0 ];

            if ( !parent.add_parameter_from_def( tpDecl ) )
            {
                const typeParam = new TypeParameter();
                typeParam.typeName = def.name;

                parent.add_type_parameter( def.name, typeParam );
            }

            return null;

        case DECL.THIS:
            return parse_type( { typeName: 'this' }, parent );

        case DECL.INDEX:
            const
                valueType = type_from_def( def.type, parent ),
                keyType = type_from_def( def.parameters, parent );

            return { type: { valueType, keyType } };

        case DECL.TYPE:
            return parse_type( def, parent );

        default:
            let kindText = get_kind( def );

            if ( object( kindText ) ) kindText = JSON.stringify( kindText, null, 4 );

            throw new Error( `Kind not handled: "${kindText}"` );
    }
}

function add_type_arguments( type, def )
{
    if ( !has( def, 'typeArguments' ) || typeof type.add_type_arguments !== 'function' ) return type;

    const typeArgs = def.typeArguments.map( taDef => new TypeArgument().parse( taDef ) );

    type.add_type_arguments( typeArgs );

    return type;
}

/**
 * @param {object} def
 * @param {Type} [parent]
 * @return {Type}
 */
function parse_type( def, parent )
{
    const _type_from_def = arg => type_from_def( arg, parent );

    if ( def.isArray )
    {
        const at = new ArrayType();
        at.elementType = parse_type( {...def, isArray: false } );
        return at;
    }

    switch ( def.type )
    {
        case 'reference':
            const ref = new TypeReference().debug( def.typeName );

            ref.typeName = def.typeName;
            add_type_arguments( ref, def );
            return ref;

        case 'union':
            const u = new UnionType();

            def.types.forEach( d => u.add_type( type_from_def( d, u ) ) );
            return u;

        case 'intersection':
            const i = new IntersectionType();

            def.types.forEach( d => i.add_type( type_from_def( d, i ) ) );
            return i;

        case 'typeliteral':
            const
                lit = new TypeLiteral().debug( def.name || 'anonymous typeliteral -> ' + JSON.stringify( def, null, 4 ) );

            def.members.map( _type_from_def ).forEach( t => lit.add_member( t.name, t.type ) );

            return lit;

            /*
             { type: 'index',
             typeName: { type: 'reference', typeName: 'T' },
             parameters: [ { name: 's', type: 'string' } ] }
             ~> [s:string]: T
             */
        case 'index':
            const
                valueType = _type_from_def( def.typeName ),
                keyType = _type_from_def( def.parameters );

            return { type: { valueType, keyType } };

        case 'tuple':
            const tuple = new TupleType();

            def.types.map( _type_from_def ).forEach( t => tuple.add_type( t ) );

            return tuple;

        case 'mapped':
            const mapped = new MappedType();

            mapped.keyType = define_type_parameter( def.definition.typeParameter );
            mapped.valueType = _type_from_def( def.definition.type );

            return mapped;

        case 'parens':
            return _type_from_def( def.types ).type;

        case 'function':
            const fake = {
                name: def.name,
                kind: DECL.CALL,
                decls: [ def.definition ]
            };

            return _type_from_def( fake ).type;

            /*
            {
                "type": "predicate",
                "param": "value",
                "returns": {
                    "type": "reference",
                    "typeName": {
                        "name": "S"
                    }
                }
            }
             */
        case 'predicate':
            return _type_from_def( {
                kind: DECL.CALL,
                decls: [
                    {
                        type: def.returns,
                        parameters: [ { name: def.param, typeName: 'any' } ]
                    }
                ]
            } ).type;

        default:
            if ( def.type )
            {
                console.log( def );
                throw new Error( `Unhandled type def: "${def.type}"` );
            }

            if ( string( def.name ) && string( def.typeName ) && def.name === def.typeName )
            {
                const tr = new TypeReference();
                tr.typeName = def.name;
                return tr;
            }

            const name = string( def ) ? def : def.typeName;

            if ( typeof name !== 'string' )
                return _type_from_def( def.typeName );

            if ( name === 'object' )
                return new TypeLiteral();

            return primitive_from_typename( name ).debug( name );
    }
}
