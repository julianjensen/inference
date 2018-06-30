/** ****************************************************************************
 * DESCRIPTION
 * @author julian.jensen
 * @since 0.0.1
 *******************************************************************************/
"use strict";

import { type } from "typeofs";
import { Parser } from '../utils/parser';
import { TypeLiteral } from "./object-type";
import { FunctionType } from "./function-type";
import { Members } from "./interfaces/members";
import { Callable } from "./interfaces/callable";
import { Identifier } from "../tdd/identifier";
import { GenericType, TypeParameter } from "./type-variables";

export const
    string = o => type( o ) === 'string',
    object = o => type( o ) === 'object',
    number = o => type( o ) === 'number',
    _has   = o => n => ( {}.hasOwnProperty.call( o, n ) ),
    has    = ( o, n ) => _has( o )( n );

let parser;

function thingy( def )
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

/**
 * @param {object} def
 * @return {string}
 */
function get_kind( def )
{
    return has( def, 'kind' ) ?
           def.kind :
           has( def, 'flags' ) ?
           def.flags :
           def.decls[ 0 ].kind;
}

/**
 * @param {string} codeStr
 * @param {string} [type='.ts']
 */
function parse_string( codeStr, type = '.ts' )
{
    if ( !parser )
        parser = new Parser( [ 'data' ] );

    return parser.parse_snippet( codeStr, type );
}

function top_level( decls )
{
    const declType = decls[ 0 ].kind;

    if ( !decls.every( d => d.kind === declType ) )
        throw new Error( `Figure out how to deal with this: ${JSON.stringify( decls, null, 4 )}` );

    switch ( declType )
    {
        case 'InterfaceDeclaration':
            return new TypeLiteral();

        default:
            throw new Error( `No handler for "${declType}"` );
    }
}

/**
 * @param {string} name
 * @param {object} decl
 * @param {object} def
 */
function type_from_def( name, decl, def )
{
    const add_type_params = ( type, obj ) => has( obj, 'typeParameters' ) && type instanceof GenericType && type.add_type_parameter( obj );

    let container, type;

    // if ( string( def ) ) def = parse_string( def );

    switch ( get_kind( def ) )
    {
        case 'InterfaceDeclaration':
            container = new TypeLiteral();

            def.members.map( type_from_def ).forEach( t => container.add_member( t.name, t.type ) );

            return new Identifier( def.name, container );

        case 'ConstructSignature':
            type = new Callable();
            type.type = type_from_def( def.type );
            if ( def.parameters )
                def.parameters.map( p => type.add_parameter( new Identifier( p.name, type_from_def( p ), { optional: p.optional, rest: p.rest } ) ) );

            if ( def.typeParameters )
                def.typeParameters.forEach( tp => {
                    const typ = new TypeParameter();
                    if ( tp.keyOf )
                        typ.keyOf = true;
                    // @todo constraints here
                } );

            def.decls.map( type_from_def ).forEach( t => type.add( Members.CONSTRUCTOR, t.type ) );
            return { name: Members.CONSTRUCTOR, type };

        case 'MethodSignature':
        case 'CallSignature':
            type = new FunctionType();
            def.decls.map( type_from_def ).forEach( t => type.add( Members.SIGNATURE, t.type ) );
            return { name: Members.SIGNATURE, type };

        case 'Signature':
            if ( def.name === "New" && def.decls[ 0 ].kind === "ConstructSignature" )
            {
                type = new FunctionType();
                type.define( def.decls.map( type_from_def ) );
                return { name: Members.CONSTRUCTOR, type };
            }
            else if ( def.name === "Call" && def.decls[ 0 ].kind === "CallSignature" )
            {
                type = new FunctionType();
                def.decls.map( type_from_def ).forEach( t => type.add( Members.SIGNATURE, t.type ) );
                return { name: Members.SIGNATURE, type };
            }
            else
            {
                type = new FunctionType();
                def.decls.map( type_from_def ).forEach( t => type.add( Members.SIGNATURE, t.type ) );
                return { name: Members.SIGNATURE, type };
            }

        case 'VariableDeclaration':
    }

}
