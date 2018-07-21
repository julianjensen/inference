/** ****************************************************************************
 * DESCRIPTION
 * @author julian.jensen
 * @since 0.0.1
 *******************************************************************************/
"use strict";

import { type } from "typeofs";
// import { Parser } from '../utils/parser';
import { Type } from './basic-type';
import { TupleType, TypeLiteral } from "./object-type";
import { ClassType, FunctionType, FunctionDecl } from "./function-type";
import { Members } from "./interfaces/members";
import { iCallable, Constructs } from "./interfaces/callable";
import { Identifier } from "../tdd/identifier";
import { define_type_parameter, TypeParameter, TypeReference } from "./type-variables";
import { GenericType } from "./interfaces/generic";
import { primitive_from_typename } from "./primitive-type";
import { ObjectType } from "./object-type";
import { IntersectionType, MappedType, UnionType } from "./abstract-type";

export const
    string = o => type( o ) === 'string',
    object = o => type( o ) === 'object',
    number = o => type( o ) === 'number',
    array = o => Array.isArray( o ),
    _has   = o => n => ( Object.prototype.hasOwnProperty.call( o, n ) ),
    has    = ( o, n ) => _has( o )( n );

let parser;

export function massage_defs( def )
{
    let error;

    if ( has( def, 'members' ) && array( def.members ) )
    {
        def.members.forEach( massage_defs );
        return def;
    }

    if ( !has( def, 'decls' ) || !array( def.decls ) ) return def;

    def.kind = def.decls.map( d => d.kind ).reduce( ( prev, cur ) => cur !== prev ? error = [ cur, prev ] : cur );
    // def.decls.forEach( d => delete d.kind );

    if ( error )
        throw new Error( `Multiple kinds: ${error}` );

    def.decls.forEach( massage_defs );

    return def;
}

function read_type( def )
{
    def.decls.forEach( decl => {
        if ( has( def, 'flags' ) && !has( def, 'kind' ) )
        {
            def.kind = def.flags;
            delete def.flags;
        }

        type_from_def( def.name, decl, def );
    } );
}

const DECL = {
    INTERFACE: 'InterfaceDeclaration',
    CONSTRUCTOR: 'ConstructSignature',
    METHOD: 'MethodSignature',
    CALL: 'CallSignature',
    SIGNATURE: 'Signature',
    VARIABLE: 'VariableDeclaration',
    PROPERTY: 'PropertySignature',
    LITERAL: 'typeliteral',

    TYPE: 'RAW_TYPE'
};

/**
 * @param {object} def
 * @return {string}
 */
function get_kind( def )
{
    return def.kind || DECL.TYPE;
    // return has( def, 'kind' ) ?
    //        def.kind :
    //        has( def, 'flags' ) ?
    //        def.flags :
    //        def.decls[ 0 ].kind;
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

const get_decl = ( d, kind ) => d.find( decl => decl.kind === kind );

/**
 * @param {object} def
 */
export function type_from_def( def )
{
    const
        add_type_params = ( type, obj ) => has( obj, 'typeParameters' ) && type instanceof GenericType && type.add_type_parameter( obj ),
        add_type_arguments = ( type, obj ) => has( obj, 'typeArguments' ) && type.add_type_parameter( obj );

    let type;

    if ( !def ) return null;

    // if ( string( def ) ) def = parse_string( def );
    // console.log( 'defing:', Object.keys( def ) );

    if ( [ DECL.CONSTRUCTOR, DECL.CALL, DECL.METHOD ].includes( def.kind ) && def.decls )
        def.kind = DECL.SIGNATURE;

    switch ( get_kind( def ) )
    {
        case DECL.INTERFACE:
            const
                decls = def.decls,
                idecl = decls && get_decl( decls, DECL.INTERFACE ),
                container = new ObjectType().debug( def.name );

            if ( decls )
                idecl.members.map( type_from_def ).forEach( t => container.add_member( t.name, t.type ) );


            return { name: def.name, type: container };

        case DECL.CONSTRUCTOR:
            type = new FunctionDecl().debug( 'class' );
            type.type = type_from_def( def.type );
            if ( def.parameters )
                def.parameters.map( p => type.add_parameter( p.name, type_from_def( p ), { optional: p.optional, rest: p.rest } ) );

            if ( def.typeParameters )
                def.typeParameters.forEach( tp => type.add_parameter_from_def( tp ) );

            // def.decls.map( type_from_def ).forEach( t => type.add( Members.CONSTRUCTOR, t.type ) );
            return { name: Members.CONSTRUCTOR, type };

        case DECL.METHOD:
        case DECL.CALL:
            type = new FunctionDecl().debug( def.name || 'anonymous' );
            type.type = type_from_def( def.type );
            if ( def.parameters )
                def.parameters.map( p => type.add_parameter( p.name, type_from_def( p ), { optional: p.optional, rest: p.rest } ) );

            if ( def.typeParameters )
                def.typeParameters.forEach( tp => type.add_parameter_from_def( tp ) );

            // def.decls.map( type_from_def ).forEach( t => type.add( Members.SIGNATURE, t.type ) );
            return { name: def.name || Members.SIGNATURE, type };

        case DECL.SIGNATURE:
            if ( def.name === "New" && def.decls[ 0 ].kind === "ConstructSignature" )
            {
                type = new ClassType().debug( 'signature constructor' );
                def.decls.map( type_from_def ).forEach( t => type.add_declaration( t.type ) );
                // type.define( def.decls.map( type_from_def ) );
                return { name: Members.CONSTRUCTOR, type };
            }
            else if ( def.name === "Call" && def.decls[ 0 ].kind === "CallSignature" )
            {
                type = new FunctionType().debug( 'signature call' );
                def.decls.map( type_from_def ).forEach( t => type.add_declaration( t.type ) );
                return { name: Members.SIGNATURE, type };
            }
            else
            {
                // console.log( 'name:', def.name );
                // if ( !def.decls ) console.error( 'no decls:', def );
                type = new FunctionType().debug( def.name );
                def.decls.map( type_from_def ).forEach( t => type.add_declaration( t.type ) );
                return { name: def.name, type };
            }


        case DECL.PROPERTY:
            if ( def.decls )
                return { name: def.name, type: type_from_def( def.decls[ 0 ] ) };
            else
                return type_from_def( def.type );

        case DECL.VARIABLE:
            // @todo Add variable to symbol table
            return null;

        case DECL.TYPE:
            return parse_type( def );

        default:
            throw new Error( `Kind not handled: "${get_kind( def )}"` );
    }
}

function parse_type( def )
{
    switch ( def.type )
    {
        case 'reference':
            const ref = new TypeReference().debug( def.typeName );

            ref.typeName = def.typeName;
            return ref;

        case 'union':
            const u = new UnionType();

            def.types.forEach( d => u.add_type( type_from_def( d ) ) );
            return u;

        case 'intersection':
            const i = new IntersectionType();

            def.types.forEach( d => i.add_type( type_from_def( d ) ) );
            return i;

        case 'typeliteral':
            const
                lit = new TypeLiteral().debug( def.name || 'anonymous typeliteral -> ' + JSON.stringify( def, null, 4 ) );

            def.members.map( type_from_def ).forEach( t => lit.add_member( t.name, t.type ) );

            return lit;

            /*
             { type: 'index',
             typeName: { type: 'reference', typeName: 'T' },
             parameters: [ { name: 's', type: 'string' } ] }
             ~> [s:string]: T
             */
        case 'index':
            const
                valueType = type_from_def( def.typeName ),
                keyType = type_from_def( def.parameters );

            return { type: { valueType, keyType } };

        case 'tuple':
            const tuple = new TupleType();

            def.types.map( type_from_def ).forEach( t => tuple.add_type( t ) );

            return tuple;

        case 'mapped':
            const mapped = new MappedType();

            mapped.keyType = define_type_parameter( def.definition.typeParameter );
            mapped.valueType = type_from_def( def.definition.type );

            return mapped;

        default:
            if ( def.type )
            {
                console.log( def );
                throw new Error( `Unhandled type def: "${def.type}"` );
            }
            const name = string( def ) ? def : def.typeName;

            if ( typeof name !== 'string' )
                return type_from_def( def.typeName );

            if ( name === 'object' )
                return new TypeLiteral();

            return primitive_from_typename( name ).debug( name );
    }
}
