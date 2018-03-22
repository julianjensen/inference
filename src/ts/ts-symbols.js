/** ******************************************************************************************************************
 * @file Describe what ts-symbols does.
 * @author Julian Jensen <jjdanois@gmail.com>
 * @since 1.0.0
 * @date 17-Mar-2018
 *
 * libs needed:
 * lib.es6.d.ts
 * node.d.ts
 * dom.es6.generated.d.ts
 * esnext.promise.d.ts
 * inspector.d.ts
 * lib.es2017.intl.d.ts
 * lib.es2017.object.d.ts
 * lib.es2017.sharedmemory.d.ts
 * lib.es2017.string.d.ts
 * lib.es2017.typedarray.d.ts
 * lib.esnext.asynciterable.d.ts
 * webworker.generated.d.ts
 *********************************************************************************************************************/
"use strict";

import { hide_parent } from "../utils";
import { inspect }     from "util";
import { SyntaxKind }  from "./ts-helpers";
import * as ts         from "typescript";
import {
    NodeFlags,
    ObjectFlags, SymbolFlags,
    TypeFlags
} from "../types";
import { nameOf, type } from "typeofs";

const
    $    = ( o, d = 2 ) => inspect( o,
        {
            depth:  typeof d === 'number' ? d : 2,
            colors: true
        } ),
    seen = new Set(),
    symKeys = new Set();

function add_keys( sym )
{
    const
        ks = Object.keys( sym );

    let k;

    for ( k of ks )
        symKeys.add( k );
}

function get_name( sym )
{
    return sym.escapedName;
}

let typeChecker,
    file;

/**
 * @param {object} file
 */
export function walk_symbols( _file )
{
    file        = _file;
    typeChecker = _file.typeChecker;
    sym_walk( _file.ast );
    console.log( `Symbol keys: [ ${[ ...symKeys ].join( ', ' )} ]` );
}

function type_in_mapped_type( node )
{
    while ( node )
    {
        if ( node.kind === SyntaxKind.MappedType ) return true;
        node = node.parent;
    }

    return false;
}

function get_type_of_node( sym, node )
{
    let t = typeChecker.getTypeOfSymbolAtLocation( sym, node );
    delete t.symbol;
    delete t.bindDiagnostics;
    delete t.parent;
    delete t.checker;
    // t = hide_parent( t );
    if ( t.objectFlags ) t.objectFlags = ObjectFlags.create( t.objectFlags );
    if ( t.flags ) t.flags = TypeFlags.create( t.flags );
    return t;
}

function list_heritage( nodes )
{
    if ( !nodes || !nodes.length ) return null;

    if ( nodes.length === 1 && nodes[ 0 ].kind === SyntaxKind.HeritageClause )
        return list_heritage( nodes[ 0 ].types );

    return nodes.map( h => {
        const
            out = {};

        if ( h.kind === SyntaxKind.ExpressionWithTypeArguments )
        {
            if ( h.expression.kind === SyntaxKind.Identifier )
                out.name = h.expression.escapedText;
            else
                out.name = "not identifier but " + SyntaxKind[ h.expression.kind ];

            if ( h.typeArguments && h.typeArguments.length )
                out.typeArguments = h.typeArguments.map( get_type_name )
        }
        else // if ( h.kind === SyntaxKind.HeritageClause )
            out.name = "not expression with type arguments but " + SyntaxKind[ h.kind ] + ` -> [ ${Object.keys( h )} ]`;

        return out;
    } );
}

/**
 * @param {ts.Node} node
 */
export function sym_walk( node )
{
    const isInterface = node && node.kind && node.kind === SyntaxKind.InterfaceDeclaration;

    if ( isInterface && seen.has( get_name( node.symbol ) ) ) return;
    else if ( isInterface ) seen.add( get_name( node.symbol ) );

    /********************************************************************************************************************
     * File name info
     ********************************************************************************************************************/

    // if ( node.symbol && node.symbol.escapedName === 'NodeRequire' )
    //     console.error( `NodeRequire symbol keys: [ ${Object.keys( node.heritageClauses[ 0 ] )} ]` );

    if ( node.fileName )
        console.log( `\n${SyntaxKind[ node.kind ]} of "${node.fileName}" ->` );
    else if ( ![ SyntaxKind.VariableStatement, SyntaxKind.VariableDeclarationList ].includes( node.kind ) )
        console.log( `\n${SyntaxKind[ node.kind ]} ->` );

    /********************************************************************************************************************
     * Locals
     ********************************************************************************************************************/

    if ( node.locals )
        console.log( `locals:`, $( [ ...node.locals.values() ].map( show_sym ), 10 ) );

    if ( node.exports )
        console.log( `node_exports:`, $( [ ...node.exports.values() ].map( show_sym ), 10 ) );

    /********************************************************************************************************************
     * Variable declaration
     ********************************************************************************************************************/

    if ( node.kind === SyntaxKind.VariableDeclaration )
    {
        // const v = show_sym( node.symbol );

        const
            flags = node.symbol.flags ? ', flags: ' + SymbolFlags.create( node.symbol.flags ).toString() : '',
            parent = node.parent.parent.parent ? SyntaxKind[ node.parent.parent.parent.kind ] : '<no parent>';

        add_keys( node.symbol );
        console.log( `${get_name( node.symbol )}: ${add_types( node.type )}${flags} [parent: "${parent}"]` );

        // if ( node.type && node.type.typeName )
        //     console.log( `type: ${node.type.typeName.escapedText}` );
        // v.type = node.type.typeName.escapedText;

        // console.log( $( v, 10 ) );
    }

    /********************************************************************************************************************
     * Symbol
     ********************************************************************************************************************/

    else if ( node.symbol )
    {
        console.log( `Symbol name: ${get_name( node.symbol )}` );
        if ( node.symbol.declarations ) console.log( '    declarations:', $( node.symbol.declarations.map( decl => SyntaxKind[ decl.kind ] ), 10 ) );
        const internal = show_sym( node.symbol, node );
        console.log( $( internal, 10 ) );
    }

    /********************************************************************************************************************
     * Recursions
     ********************************************************************************************************************/

    else if ( node.kind === SyntaxKind.VariableStatement )
        sym_walk( node.declarationList );
    else if ( node.kind === SyntaxKind.VariableDeclarationList )
        node.declarations.forEach( sym_walk );

    if ( Array.isArray( node.statements ) )
        node.statements.forEach( sym_walk );
}

function show_sym( sym )
{
    if ( !sym ) return null;

    const
        r = { name: disambiguate( get_name( sym ) ) },
        d = decls( sym );

    if ( sym.flags ) r.flags = SymbolFlags.create( sym.flags );

    if ( d ) r.decls = d;

    // if ( typeof node === 'object' && node.kind ) r.typed = get_type_of_node( sym, node );

    // if ( sym.declarations && sym.declarations.length )
    //     r.types = sym.declarations.map( decl => get_type_of_node( sym, decl ) );

    if ( sym.members && sym.members.size )
        r.members = from_sym( sym.members );

    if ( sym.exports && sym.exports.size )
        r.exports = from_sym( sym.exports );

    add_keys( sym );

    return r;
}

function from_sym( syms )
{
    if ( !syms.size ) return [];

    return [ ...syms.values() ].map( show_sym );
}

function decls( sym )
{
    if ( !sym || !sym.declarations || !sym.declarations.length ) return null;

    return sym.declarations.map( get_decl );
}

function get_decl( decl )
{
    let [ lineNumber, offset ] = file.reporters.offset_to_line_offset( decl.pos ),
        declName               = `${SyntaxKind[ decl.kind ]} > ${decl.name && decl.name.escapedText || 'noName'}`,
        typeName               = decl.type ? add_types( decl.type ) : '',
        heritage;

    if ( decl.heritageClauses )
        heritage = list_heritage( decl.heritageClauses );

    if ( decl.kind === SyntaxKind.IndexSignature )
    {
        declName = `[ ${decl.parameters.map( pretty ).join( ', ' )} ]`;
        typeName = get_type_name( decl.type );
    }
    else
    {
        if ( decl.typeParameters )
            declName += type_parameters( decl.typeParameters );

        if ( decl.parameters )
        {
            if ( decl.parameters.length )
                declName = `${declName}( ${decl.parameters.map( pretty ).join( ', ' )} )`;
            else
                declName += '()';
        }
    }

    let flags = '';
    if ( decl.flags && !!( decl.flags & ~NodeFlags.Ambient ) )
        flags = NodeFlags.create( decl.flags & ~NodeFlags.Ambient ).toString();
        // flags = '/' + NodeFlags.create( decl.flags & ~NodeFlags.Ambient ).toString();

    const dd = {
        loc: `${lineNumber + 1}:${offset}`,
        decl: declName + ( typeName ? ': ' + typeName : '' )
    };

    if ( heritage )
        dd.heritage = heritage;
    if ( flags )
        dd.flags = `${flags}`;

    if ( decl.symbol ) add_keys( decl.symbol );

    return dd;
    // return `@${lineNumber + 1}:${offset}${flags} ` + declName + ( typeName ? ': ' + typeName : '' );
}

function pretty( decl )
{
    let str = '';

    if ( decl.name )
        str += ( decl.dotDotDotToken ? '...' : '' ) + decl.name.escapedText + ( decl.questionToken ? '?' : '' );
    else
        str += 'anon';

    let flags;
    if ( decl.symbol && decl.symbol.flags )
    {
        flags = ' [ ' + SymbolFlags.create( decl.symbol.flags ).toString() + ' ]';
        if ( flags === ' [ FunctionScopedVariable ]' ) flags = '';
    }

    return str + ': ' + add_types( decl.type ) + flags;
}

/**
 * @param {ts.Node} type
 * @return {string}
 */
function add_types( type )
{
    // if ( !type ) return '<missing> ' + new Error().stack.split( /\r?\n/ ).slice( 1, 4 ).join( ' | ' );

    if ( type.kind === SyntaxKind.Identifier )
        return type.escapedText;
    else if ( type.kind === SyntaxKind.ParenthesizedType )
        return `( ${add_types( type.type )} )`;
    else if ( type.kind === SyntaxKind.QualifiedName )
        return qual_name( type );
    else if ( type.kind === SyntaxKind.FunctionType )
        return func_type( type );


    else if ( type.kind === SyntaxKind.UnionType )
        return type.types.map( add_types ).join( ' | ' );
    else if ( type.kind === SyntaxKind.IntersectionType )
        return type.types.map( add_types ).join( ' & ' );


    else if ( type.kind === SyntaxKind.MappedType )
        return `[ ${add_types( type.typeParameter )} ]${type.questionToken ? '?' : ''}: ${get_type_name( type.type )}`;

    else if ( type.kind === SyntaxKind.TypeReference )
        return add_types( type.typeName ) + ( type.typeParameters || type.typeArguments ? type_parameters( type.typeParameters || type.typeArguments ) : '' );

    else if ( type.kind === SyntaxKind.TypePredicate )
        return `${type.parameterName.escapedText} is ${add_types( type.type )}`;

    else if ( type.kind === SyntaxKind.LiteralType )
    {
        switch ( type.literal.kind )
        {
            case SyntaxKind.StringLiteral:
                return `"${type.literal.text}"`;

            case SyntaxKind.NumericLiteral:
                return type.literal.text;

            default:
                return `Unknown literal "${SyntaxKind[ type.literal.kind ]}"`;
        }
    }

    let t = type && !type.types ? get_type_name( type ) : type && type.types ? type.types.map( get_type_name ).join( ' | ' ) : '';

    if ( /^\s*[A-Z][a-z]+Keyword\s*$/.test( t ) )
        t = t.replace( /^\s*(.*)Keyword\s*$/, '$1' ).toLowerCase();

    if ( type.kind === SyntaxKind.TypeParameter && type.constraint )
    {
        let typeOp = type_in_mapped_type( type ) ? ' in' : ' extends',
            tn;

        if ( type.constraint.kind === SyntaxKind.TypeOperator )
        {
            typeOp += ' keyof';
            tn = get_type_name( type.constraint.type );
        }
        else
            tn = get_type_name( type.constraint );

        t += `${typeOp} ${tn}`;
    }

    if ( type && type.typeParameters )
        t += type_parameters( type.typeParameters );

    return t;
}

function get_type_name( type )
{
    if ( !type ) return '<no type name>';

    let typeName = type.typeName && type.typeName.escapedText ? type.typeName.escapedText :
                   type && type.name && type.name.escapedText ? type.name.escapedText :
                   type && type.kind ? SyntaxKind[ type.kind ] :
                   '';

    if ( /^\s*[A-Z][a-z]+Keyword\s*$/.test( typeName ) )
        typeName = typeName.replace( /^(.*)Keyword$/, '$1' ).toLowerCase();

    if ( typeName === 'IndexedAccessType' )
        return get_type_name( type.objectType ) + '[' + get_type_name( type.indexType ) + ']';


    if ( type )
    {
        if ( type.typeParameters )
            typeName += type_parameters( type.typeParameters );

        if ( type.typeArguments )
            typeName += type_parameters( type.typeArguments );
    }

    if ( typeName === 'ArrayType' && type.elementType ) typeName = add_types( type.elementType ) + '[]';

    return typeName;

}

function type_parameters( tp )
{
    if ( !tp || !tp.length ) return '';

    return `<${tp.map( add_types ).join( ', ' )}>`;
}

function disambiguate( name )
{
    return typeof name === 'string' && !( {}[ name ] ) ? name : ( '__' + name );
}

/**
 * @param {ts.QualifiedName} node
 */
function qual_name( node )
{
    if ( SyntaxKind.Identifier === node.kind )
        return node.escapedText;
    else if ( SyntaxKind.QualifiedName === node.kind )
        return qual_name( node.left ) + '.' + qual_name( node.right );

    console.error( `Unexpected kind in qualified name: ${SyntaxKind[ node.kind ]}` );
    return 'unknown';
}

function func_type( type )
{
    if ( type.parameters.length )
        return `${type_parameters( type.typeParameters )}( ${type.parameters.map( pretty ).join( ', ' )} ) => ${add_types( type.type )}`;
    else if ( !type.parameters || !type.parameters.length )
        return `${type_parameters( type.typeParameters )}() => ${add_types( type.type )}`;
}
