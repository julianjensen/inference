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
import { type, nameOf } from "typeofs";

const
    $    = ( o, d = 2 ) => inspect( o,
        {
            depth:  typeof d === 'number' ? d : 2,
            colors: false,
            showHidden: false
        } ),
    seen = new Set();

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
    return sym_walk( _file.ast, {} );
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

function module_name( name )
{
    if ( name.kind === SyntaxKind.Identifier )
        return name.escapedText;
    else if ( name.kind === SyntaxKind.StringLiteral )
        return name.text;

    return SyntaxKind[ name.kind ];
}

function tmp_name( sym )
{
    return sym.escapedName; // + '_@' + sym.id;
}

function export_specifier( ex )
{
    let prop = ex.propertyName.escapedText;

    if ( ex.name && ex.name.escapedText !== prop  ) prop += ' as ' + ex.name.escapedText;

    return prop;
}

/**
 * @param {ts.Node} node
 * @param {object} [table={}]
 */
export function sym_walk( node, table = {} )
{
    const isInterface = node && node.kind && node.kind === SyntaxKind.InterfaceDeclaration;

    if ( isInterface && seen.has( get_name( node.symbol ) ) ) return;
    else if ( isInterface ) seen.add( get_name( node.symbol ) );

    /********************************************************************************************************************
     * File name info
     ********************************************************************************************************************/

    if ( node.fileName )
    {
        table = table[ node.fileName ] = {
            kind: SyntaxKind[ node.kind ]
        };
        // console.log( `\n${SyntaxKind[ node.kind ]} of "${node.fileName}" ->` );
    }
    // else if ( ![ SyntaxKind.VariableStatement, SyntaxKind.VariableDeclarationList ].includes( node.kind ) )
    //     console.log( `\n${SyntaxKind[ node.kind ]} ->` );

    /********************************************************************************************************************
     * Modules and namespaces
     ********************************************************************************************************************/

    if ( node.kind === SyntaxKind.ModuleDeclaration )
    {
        const tmp = table[ module_name( node.name ) ] = show_sym( node.symbol );
        delete tmp.name;
        // if ( tmp.name.startsWith( '"' ) ) tmp.name = tmp.name.replace( /^"(.*)"$/, '$1' );

        // MAYBE DUPE
        // tmp.moduleMembers = node.body.statements.map( n => sym_walk( n, {} ) );
        return table;
    }

    // if ( node.kind === SyntaxKind.ExportDeclaration )

    /********************************************************************************************************************
     * Locals
     ********************************************************************************************************************/

    if ( node.localSymbol )
    {
        table[ tmp_name( node.localSymbol ) ] = show_sym( node.localSymbol );
        // console.log( `localSymbol:`, $( show_sym( node.localSymbol ), 10 ) );
    }

    // MAYBE DUPE
    if ( node.locals )
    {
        table.locals = [ ...node.locals.values() ].map( show_sym );
        // console.log( `locals:`, $( [ ...node.locals.values() ].map( show_sym ), 10 ) );
    }

    /********************************************************************************************************************
     * Variable declaration
     ********************************************************************************************************************/

    if ( node.kind === SyntaxKind.VariableDeclaration )
    {
        // const v = show_sym( node.symbol );

        // const flags = node.symbol.flags ? ', flags: ' + SymbolFlags.create( node.symbol.flags ).toString() : '';
        // console.log( `${get_name( node.symbol )}: ${add_types( node.type )}${flags}` );

        const varDef = {
            flags: node.symbol.flags ? SymbolFlags.create( node.symbol.flags ).toString() : '',
            types: add_types( node.type )
        };

        if ( table[ tmp_name( node.symbol ) ] )
        {
            const tmp = table[ tmp_name( node.symbol ) ];

            if ( Array.isArray( tmp ) )
                tmp.push( varDef );
            else
                table[ tmp_name( node.symbol ) ] = [ tmp, varDef ];
        }
        else
            table[ tmp_name( node.symbol ) ] = varDef;

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
        const tmp = {

        };

        // console.log( `Symbol name: ${get_name( node.symbol )}` );
        // if ( node.symbol.declarations ) console.log( '    declarations:', $( node.symbol.declarations.map( decl => SyntaxKind[ decl.kind ] ), 10 ) );

        // MAYBE DUPE
        // if ( node.symbol.declarations ) tmp.declarations = node.symbol.declarations.map( decl => SyntaxKind[ decl.kind ] );

        const internal = show_sym( node.symbol, node );
        tmp.internal = internal;
        // console.log( $( internal, 10 ) );

        table[ tmp_name( node.symbol ) ] = tmp;
    }

    /********************************************************************************************************************
     * Recursions
     ********************************************************************************************************************/

    else if ( node.kind === SyntaxKind.VariableStatement )
    {
        if ( !table.__vars ) table.__vars = {};

        sym_walk( node.declarationList, table );
    }
    else if ( node.kind === SyntaxKind.VariableDeclarationList )
    {
        if ( !table.__vars ) table.__vars = {};

        node.declarations.forEach( sym => sym_walk( sym, table.__vars ) );
    }

    // MAYBE DUPE
    // if ( Array.isArray( node.statements ) )
    //     node.statements.forEach( sym => sym_walk( sym, table ) );

    return table;
}

function show_sym( sym )
{
    if ( !sym ) return null;

    const
        r = { name: disambiguate( get_name( sym ) ) },
        d = decls( sym );

    if ( sym.flags )
    {
        const flags = SymbolFlags.create( sym.flags ).toString();

        if ( flags ) r.flags = flags;
    }

    if ( sym.valueDeclaration )
        r.valueDeclaration = get_decl( sym.valueDeclaration );

    if ( d ) r.decls = d;

    // if ( typeof node === 'object' && node.kind ) r.typed = get_type_of_node( sym, node );

    // if ( sym.declarations && sym.declarations.length )
    //     r.types = sym.declarations.map( decl => get_type_of_node( sym, decl ) );

    if ( sym.members && sym.members.size )
        r.members = from_sym( sym.members );

    if ( sym.exports && sym.exports.size )
        r.exports = from_sym( sym.exports );

    if ( sym.localSymbol )
        r.localSymbol = show_sym( sym.localSymbol );

    if ( sym.exportSymbol )
        r.exportSymbol = show_sym( sym.exportSymbol );

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
        declName               = `${SyntaxKind[ decl.kind ]}`,
        typeName               = decl.type ? add_types( decl.type ) : '';

    let flags = '';
    if ( decl.flags && !!( decl.flags & ~NodeFlags.Ambient ) )
        flags = ' [ ' + NodeFlags.create( decl.flags & ~NodeFlags.Ambient ).toString() + ' ]';

    if ( decl.kind === SyntaxKind.ExportSpecifier )
    {
        let propName = '<no prop name>';

        if ( Reflect.has( decl, 'propertyName' ) && type( decl.propertyName ) === 'object' && Reflect.has( decl , 'propertyName' ) )
            propName = decl.propertyName.escapedText;
        else if ( Reflect.has( decl, 'name' ) && type( decl.name ) === 'object' && Reflect.has( decl , 'name' ) )
            propName = decl.name.escapedText;


        return `@${lineNumber + 1}:${offset}${flags} ${propName}` ;
    }
               // decl.propertyName !== void 0 ? typeof decl.propertyName.escapedText :
               // decl.propertyName ? 'NO PROP: [' + Object.keys( decl ) + '], propName: [' + Object.keys( decl.propertyName ) + ']' :
               // decl.name ? decl.name.escapedText :
               // 'NO NAME: [' + Object.keys( decl ) + ']';

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

    if ( type( typeName ) === 'object' )
    {
        const r = { name: declName, type: typeName, loc: `@${lineNumber + 1}:${offset}` };
        if ( flags ) r.flags = flags;
        return r;
    }

    return `@${lineNumber + 1}:${offset}${flags} ` + declName + ( typeName ? ': ' + typeName : '' );
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

    let t;

    if ( type.kind === SyntaxKind.Identifier )
        return type.escapedText;
    else if ( type.kind === SyntaxKind.ParenthesizedType )
        return `( ${add_types( type.type )} )`;
    else if ( type.kind === SyntaxKind.TypePredicate )
        return `${type.parameterName.escapedText} is ${add_types( type.type )}`;
    else if ( type.kind === SyntaxKind.TypeReference )
        return add_types( type.typeName ) + check_for_template( type );
    else if ( type.kind === SyntaxKind.QualifiedName )
        return qual_name( type );
    else if ( type.kind === SyntaxKind.FunctionType )
        return func_type( type );
    else if ( type.kind === SyntaxKind.UnionType )
        return type.types.map( add_types ).join( ' | ' );
    else if ( type.kind === SyntaxKind.IntersectionType )
        return type.types.map( add_types ).join( ' & ' );
    else if ( type.kind === SyntaxKind.LiteralType )
    {
        switch ( type.literal.kind )
        {
            case SyntaxKind.StringLiteral:
                return `'${type.literal.text}'`;

            case SyntaxKind.NumericLiteral:
                return type.literal.text;

            case SyntaxKind.TrueKeyword:
                return 'true';

            case SyntaxKind.FalseKeyword:
                return 'false';

            default:
                return `Unknown literal "${SyntaxKind[ type.literal.kind ]}"`;
        }
    }
    else if ( type.kind === SyntaxKind.TypeLiteral )
        return show_sym( type.symbol );
    else
        t = type && !type.types ? get_type_name( type ) : type && type.types ? type.types.map( get_type_name ).join( ' | ' ) : '';

    if ( /^\s*[A-Z][a-z]+Keyword\s*$/.test( t ) )
        t = t.replace( /^\s*(.*)Keyword\s*$/, '$1' ).toLowerCase();

    if ( type && type.typeParameters )
        t += type_parameters( type.typeParameters );

    return t;
}

function check_for_template( type )
{
    if ( type.typeParameters )
        return type_parameters( type.typeParameters );

    if ( type.typeArguments )
        return type_parameters( type.typeArguments );

    return '';
}

function get_type_name( type )
{
    if ( !type ) return '<no type>';

    let typeName = type.typeName && type.typeName.escapedText ?
                   type.typeName.escapedText :
                   type.name && type.name.escapedText ? type.name.escapedText :
                   type.exprName ? type.exprName.escapedText :
                   type.kind ?
                   SyntaxKind[ type.kind ] :
                   '';

    if ( /^\s*[A-Z][a-z]+Keyword\s*$/.test( typeName ) )
        typeName = typeName.replace( /^(.*)Keyword$/, '$1' ).toLowerCase();

    typeName += check_for_template( type );

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
