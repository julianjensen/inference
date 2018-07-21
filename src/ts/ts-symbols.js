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

import { inspect }            from "util";
import { SyntaxKind }         from "./ts-helpers";
import * as ts                from "typescript";
import { type }       from "typeofs";
import deep from "deep-eql";

const
    allKinds = new Set(),
    allKindsWithMembers = new Set(),
    allMembersKindsNoAmbiguity = new Set(),
    has = ( o, n ) => !!o && Object.prototype.hasOwnProperty.call( o, n ),
    MEMBER_MARKER = Symbol( 'marker' ),
    is_same = ( a, b ) => a[ MEMBER_MARKER ] && b[ MEMBER_MARKER ] && a[ MEMBER_MARKER ].some( m => b[ MEMBER_MARKER ] === m ),
    add_marker = a => ( a[ MEMBER_MARKER ] || ( a[ MEMBER_MARKER ] = [] ) ).push( Math.random() * 1e9 | 0 ),
    hide = ( obj, name, value ) => Object.defineProperty( obj, name, { enumerable: false, value } ),
    strip_parent = o => {
        if ( type( o ) === 'object' && o.hasOwnProperty( 'parent' ) )
            hide( o, 'parent', o.parent );

        return o;
    },
    namespaces = [],
    optional = ( obj, check ) => {
        if ( !check ) return obj;

        obj.optional = true;
        return obj;
    },
    clean = o => {

        if ( !isObject( o ) ) return o;

        const no = {};

        Object.keys( o ).forEach( k => ( o[ k ] === null || o[ k ] === void 0 ) || ( no[ k ] = o[ k ] ) );

        return no;
    },
    declDupes = new WeakSet(),
    isObject = o => typeof o === 'object' && !Array.isArray( o ) && o !== null,
    isString = s => typeof s === 'string',
    isArray = a => Array.isArray( a ),
    keyCount = o => Object.keys( o ).length,
    $    = ( o, d = 2 ) => inspect( o,
        {
            depth:  typeof d === 'number' ? d : 2,
            colors: false,
            showHidden: false
        } ),
    seen = new Set(),
    uniq = arr => {
        const
            dest = [],
            eql = ( a, b ) => {
                const
                    akeys = Object.keys( a ).filter( k => k !== 'loc' && k !== 'flags' ).sort(),
                    bkeys = Object.keys( b ).filter( k => k !== 'loc' && k !== 'flags' ).sort();

                if ( akeys.length !== bkeys.length || !akeys.every( ak => bkeys.includes( ak ) ) ) return false;

                for ( const ak of akeys )
                {
                    const
                        av = a[ ak ],
                        bv = b[ ak ];

                    if ( isObject( av ) && isObject( bv ) && eql( av, bv ) ) continue;
                    else if ( isArray( av ) && isArray( bv ) && av.every( ( _av, i ) => eql( _av, bv[ i ] ) ) ) continue;
                    else if ( av === bv ) continue;

                    return false;
                }
            };

        arr.forEach( el => {
            delete el.loc;
            if ( !dest.find( d => deep( d, el ) ) )
                dest.push( el );
        } );

        return dest;
    },
    fixKeyword = s => isString( s ) && /^\s*[A-Z][a-z]+Keyword\s*$/.test( s ) ? s.replace( /^\s*(.*)Keyword\s*$/, '$1' ).toLowerCase() : s;

const topLevelNames = [];

function elevate( obj )
{
    if ( !isObject( obj ) || keyCount( obj ) !== 1 ) return obj;

    if ( isString( obj.typeName ) )
        return obj.typeName;
    else if ( isString( obj.type ) )
        return obj.type;

    return obj;
}

function get_name( sym )
{
    try
    {
        let name = sym.name || sym.escapedName || sym._escapedName;

        name = `${name}`;

        return name.startsWith( '"' ) ? name.substring( 1, name.length - 1 ) : name;
    }
    catch ( err )
    {
        console.error( err );
        process.exit( 1 );
    }
}

let typeChecker,
    file;

/**
 * @param {object} _file
 */
export function walk_symbols( _file )
{
    file        = _file;
    typeChecker = _file.typeChecker;

    const r = sym_walk( _file.ast, {} );
    r.topLevelNames = [ ...new Set( topLevelNames ) ].sort();

    r.allKinds = [ ...allKinds ];
    r.allKindsWithMembers = [ ...allKindsWithMembers ];
    r.allMembersKindsNoAmbiguity = [ ...allMembersKindsNoAmbiguity ];
    return r;
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

function module_name( name )
{
    if ( name.kind === SyntaxKind.Identifier )
        return name.escapedText;
    else if ( name.kind === SyntaxKind.StringLiteral )
        return name.text;

    return SyntaxKind[ name.kind ];
}

function tmp_name( sym, id = false )
{
    return sym.escapedName + ( id && sym.id ? ' (' + sym.id + ')' : '' );
}

function ident( node, mode = 'tiny' )
{
    if ( !node ) return ' NO NODE';

    if ( !Reflect.has( node, 'escapedName' ) )
    {
        if ( !Reflect.has( node, 'symbol' ) ) return '';
        node = node.symbol;
    }

    if ( !node.id ) return `${node.LOCAL || "ALIEN"}: NO ID ON ${node.escapedName || 'AND NO NAME'} [ ${Object.keys( node ).join( ', ' )} ]`;

    const pid = node.parent && node.parent.id ? `<${node.parent.id}` : '';

    switch ( mode )
    {
        case 'name':    return node.id || node.escapedName;
        case 'tiny':    return ' ' + ( node.id || node.escapedName ) + pid;
        case 'short':    return ' (ref: ' + node.id + pid + ')';
        default:
        case 'long':    return ` ${node.escapedName} (${node.id}${pid})`;
    }
}

function export_specifier( ex )
{
    let prop = ex.propertyName.escapedText;

    if ( ex.name && ex.name.escapedText !== prop  ) prop += ' as ' + ex.name.escapedText;

    return prop;
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
                out.typeArguments = h.typeArguments.map( get_type_name );
        }
        else // if ( h.kind === SyntaxKind.HeritageClause )
            out.name = "not expression with type arguments but " + SyntaxKind[ h.kind ] + ` -> [ ${Object.keys( h )} ]`;

        return out;
    } );
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
    }

    /********************************************************************************************************************
     * Locals
     ********************************************************************************************************************/

    if ( node.localSymbol )
        table[ tmp_name( node.localSymbol ) ] = show_sym( node.localSymbol );

    // MAYBE DUPE
    if ( node.locals )
    {
        table.locals = [ ...node.locals.values() ].map( show_sym );
        table.locals.forEach( s => topLevelNames.push( s.name ) );
    }

    /********************************************************************************************************************
     * Symbol
     ********************************************************************************************************************/

    else if ( node.symbol )
    {
        if ( !table.internal ) table.internal = [];

        table.internal.push( show_sym( node.symbol, node, true ) );
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

    return table;
}

function show_sym( sym, noExports = false )
{
    if ( !sym ) return null;

    const
        r = { name: disambiguate( get_name( sym ) ) },
        { decls: d, members: declMembers } = decls( sym ) || {};

    if ( namespaces.length )
        r.namespaces = namespaces.slice();


    // if ( sym.valueDeclaration && !sym.declarations.includes( sym.valueDeclaration ) )
    //     r.valueDeclaration = get_decl( sym.valueDeclaration );

    if ( d )
    {
        d.forEach( decl => {
            if ( isObject( decl.type ) && typeof decl.type.typeName === 'string' && Object.keys( decl.type ).length === 1 )
                decl.type = decl.type.typeName;

            if ( decl.kind ) allKinds.add( decl.kind );
        } );
        r.decls = d;
    }

    if ( sym.members && sym.members.size )
    {
        let m = from_sym( sym.members );

        set_members( m, r );
    }

    if ( declMembers )
    {
        if ( Array.isArray( declMembers ) && has( declMembers[ 0 ], 'questionToken' ) )
            console.error( `BAD ${declMembers.length} members written declMembers` );
        set_members( declMembers, r );
    }

    if ( sym.exports && sym.exports.size && !noExports )
        r.exports = from_sym( sym.exports );

    // if ( sym.localSymbol )
    //     r.localSymbol = show_sym( sym.localSymbol );

    if ( sym.exportSymbol )
    {
        const tmp = show_sym( sym.exportSymbol );

        if ( r.name !== tmp.name || ( tmp.decls && tmp.decls.length ) )
            r.exportSymbol = tmp;
        else if ( tmp.members )
        {
            if ( tmp && Array.isArray( tmp.members ) && has( tmp.members[ 0 ], 'questionToken' ) )
                console.error( `BAD ${tmp.members.length} members written exportSymbol` );

            set_members( tmp.members, r );
        }
    }

    hide( r, 'node', sym );

    if ( r.members && r.decls )
        r.decls.forEach( d => allKindsWithMembers.add( d.kind ) );
    else if ( r.members && r.decls && r.decls.length === 1 )
        allMembersKindsNoAmbiguity.add( r.decls[ 0 ].kind );

    if ( r.members && r.decls )
    {
        const
            hasMembers = d => [ 'InterfaceDeclaration', 'ClassDeclaration', 'ModuleDeclaration' ].includes( d.kind ),
            ndx = r.decls.findIndex( hasMembers ),
            ndx2 = ndx !== -1 ? r.decls.slice( ndx + 1 ).findIndex( hasMembers ) : -1;


        if ( !r.decls[ ndx ] )
            console.error( "No interface for members:", r );
        else if ( ndx !== -1 && ndx2 !== -1 && r.decls[ ndx ].kind !== r.decls[ ndx2 ].kind )
            console.error( 'Oops:', r );
        else
        {
            r.decls[ ndx ].members = r.members;
            delete r.members;
        }

    }
    return r;
}

function set_members( members, r )
{
    const
        arr = a => Array.isArray( a ),
        mem = _m => {
            r.members = r.members ? r.members.concat( _m ) : _m;
            return _m.length;
        };

    if ( members && !arr( members ) ) members = [ members ];

    if ( members.length ) return mem( members );

    return 0;
}

function from_sym( syms )
{
    if ( !syms.size ) return [];

    return [ ...syms.values() ].map( show_sym );
}

function decls( sym )
{
    let members = [];

    if ( !sym || !sym.declarations || !sym.declarations.length ) return null;

    const r = sym.declarations
                 .filter( d => !declDupes.has( d ) )
                 .map( get_decl )
                 .map( d => {
                     if ( d.hasOwnProperty( 'members' ) )
                     {
                         members = members.concat( d.members );
                         delete d.members;
                     }
                     return d;
                 } );


    const ret = r.length ? { decls: uniq( r ), members } : null;

    if ( ret && ret.members && ret.members.length && ret.decls && ret.decls.length === 1 )
        allMembersKindsNoAmbiguity.add( ret.decls[ 0 ].kind );

    return ret;
}

// function type_literal_as_string( tl, short = true )
// {
//     const members = tl && tl.members;
//
//     if ( !tl ) return "Object";
//     if ( !members ) return 'wassup: ' + typeof tl; // Object.keys( tl ).join( ', ' ); // JSON.stringify( tl );
//
//     return '{ ' + members.map( m => m.valueDeclaration ? m.valueDeclaration.decl : m.decls[ 0 ].decl ).join( short ? '; ' : ';\n' ) + ' }';
// }

function get_decl( decl )
{
    let [ lineNumber, offset ] = file.reporters.offset_to_line_offset( decl.pos ),
        declName               = `${decl.name && decl.name.escapedText || ''}`,
        typeName               = decl.type ? add_types( decl.type ) : '',
        heritage;

    declDupes.add( decl );

    if ( decl.heritageClauses )
        heritage = list_heritage( decl.heritageClauses );

    if ( decl.kind === SyntaxKind.IndexSignature )
    {
        declName = `[ ${decl.parameters.map( pretty ).join( ', ' )} ]`;
        typeName = get_type_name( decl.type );
    }
    else
    {
        declName += check_for_template( decl );

        if ( decl.parameters )
        {
            if ( decl.parameters.length )
                declName = `${declName}( ${decl.parameters.map( pretty ).join( ', ' )} )`;
            else
                declName += '()';
        }
    }

    if ( decl.kind === SyntaxKind.ExportSpecifier )
    {
        let propName = '<no prop name>';

        if ( decl.hasOwnProperty( 'propertyName' ) && type( decl.propertyName ) === 'object' && Reflect.has( decl, 'propertyName' ) )
            propName = decl.propertyName.escapedText;
        else if ( decl.hasOwnProperty( 'name' ) && type( decl.name ) === 'object' && Reflect.has( decl, 'name' ) )
            propName = decl.name.escapedText;

        typeName = propName;
    }

    if ( type( typeName ) === 'object' && keyCount( typeName ) === 1 && Object.keys( typeName )[ 0 ] === 'typeName' )
        typeName = typeName.typeName;

    const dd = {
        loc: `${lineNumber + 1}:${offset}`,
        decl: declName + ( type( typeName ) !== 'object' && typeName ? ': ' + typeName : '' ),
    };

    let _type = decl.type ? add_raw_types( decl.type ) : '';
    if ( _type ) _type = elevate( _type );
    if ( _type ) dd.type = _type;

    hide( dd, 'node', decl );

    if ( decl.parameters )
        func_type_info( decl, dd );

    if ( heritage )
        dd.heritage = heritage;

    dd.kind = SyntaxKind[ decl.kind ];

    if ( decl.kind === SyntaxKind.ModuleDeclaration )
    {
        if ( declName ) namespaces.push( declName );

        const tmp = decl.body.statements.map( n => sym_walk( n, {} ) );

        if ( tmp )
        {
            let collect = tmp.reduce( ( mm, block ) => mm.concat( we_want_this( block ) ), [] );

            set_members( collect, dd );
        }

        if ( declName ) namespaces.pop();
    }

    collapse( dd );
    collapse( dd.type );

    return dd;
}

function we_want_this( obj )
{
    if ( !obj ) return [];

    const keys = Object.keys( obj ).filter( k => type( obj[ k ] ) === 'object' && has( obj[ k ], 'decls' ) );

    return keys.length ? keys.map( k => obj[ k ] ) : [];

}

function pretty( decl )
{
    let str = '';

    if ( decl.name )
        str += ( decl.dotDotDotToken ? '...' : '' ) + decl.name.escapedText + ( decl.questionToken ? '?' : '' );
    else
        str += 'anon';

    // let flags;
    // if ( decl.symbol && decl.symbol.flags )
    // {
    //     flags = ' [ ' + SymbolFlags.create( decl.symbol.flags ).toString() + ' ]';
    //     if ( flags === ' [ FunctionScopedVariable ]' ) flags = '';
    // }

    // return str + ': ' + add_types( decl.type ) + flags;
    return str + ': ' + add_types( decl.type );
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
        return type.escapedText + ident( type );

    else if ( type.kind === SyntaxKind.ParenthesizedType )
        return `( ${add_types( type.type )} )`;

    else if ( type.kind === SyntaxKind.TypePredicate )
        return `${type.parameterName.escapedText} ${ident( type.parameterName )}is ${add_types( type.type )}`;

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

    else if ( type.kind === SyntaxKind.MappedType )
        return `{ [ ${add_types( type.typeParameter )} ]${type.questionToken ? '?' : ''}: ${get_type_name( type.type )} }`;


    else if ( type.kind === SyntaxKind.LiteralType )
    {
        switch ( type.literal.kind )
        {
            case SyntaxKind.StringLiteral:
                return `'${type.literal.text}' ${ident( type )}`;

            case SyntaxKind.NumericLiteral:
                return type.literal.text + ident( type );

            case SyntaxKind.TrueKeyword:
                return 'true' + ident( type );

            case SyntaxKind.FalseKeyword:
                return 'false' + ident( type );

            default:
                return `Unknown literal "${SyntaxKind[ type.literal.kind ]}" ${ident( type )}`;
        }
    }
    else if ( type.kind === SyntaxKind.TypeLiteral )
    {
        const tl = type.members.length;

        return !tl ? '{}' : tl === 1 ? `{ ${add_types( type.members[ 0 ] )}` : `{ ${type.members.map( add_types ).join( ', ' )} }`;
    }
    else if ( type.kind === SyntaxKind.IndexSignature )
        return `[ ${type.parameters.map( add_types ).join( ', ' )} ]: ${add_types( type.type )} }`;

    else if ( type.kind === SyntaxKind.Parameter )
        return `${add_types( type.name )}: ${add_types( type.type )}`;
    else if ( type.kind === SyntaxKind.TupleType )
        return `[ ${type.elementTypes.map( add_types ).join( ', ' )} ]`;
    else
        t = type && !type.types ? get_type_name( type ) : type && type.types ? type.types.map( get_type_name ).join( ' | ' ) : '';

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

    t += check_for_template( type );

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
    if ( !type ) return '<no type name>';

    let typeName = type.typeName && type.typeName.escapedText ?
                   type.typeName.escapedText :
                   type.name && type.name.escapedText ? type.name.escapedText :
                   type.exprName ? type.exprName.escapedText :
                   type.kind ?
                   SyntaxKind[ type.kind ] :
                   '';

    if ( /^\s*[A-Z][a-z]+Keyword\s*$/.test( typeName ) )
        typeName = typeName.replace( /^(.*)Keyword$/, '$1' ).toLowerCase();

    if ( typeName === 'IndexedAccessType' )
        return get_type_name( type.objectType ) + '[' + get_type_name( type.indexType ) + ']' + ident( type );

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
        return node.escapedText + ident( node );
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

function func_type_info( type, dd = {} )
{
    if ( type.typeParameters && type.typeParameters.length )
        dd.typeParameters = type.typeParameters.map( add_raw_types );

    if ( type.parameters && type.parameters.length )
        dd.parameters = type.parameters.map( add_param );

    if ( type.type ) dd.type = add_raw_types( type.type );

    return dd;
}

function add_param( decl )
{

    const p = add_raw_types( decl.type ) || {};
    p.name =  decl.name && decl.name.escapedText || 'anon';

    if ( decl.dotDotDotToken )
        p.rest = true;

    collapse( p );

    return optional( p, decl.questionToken );
}

function raw_literal( type )
{
    switch ( type.literal.kind )
    {
        case SyntaxKind.StringLiteral:
            return { type: 'literal', typeName: 'string', value: type.literal.text };

        case SyntaxKind.NumericLiteral:
            return { type: 'literal', typeName: 'number', value: type.literal.text };

        case SyntaxKind.TrueKeyword:
            return { type: 'literal', typeName: 'boolean', value: true };

        case SyntaxKind.FalseKeyword:
            return { type: 'literal', typeName: 'boolean', value: false };

        default:
            return `Unknown literal "${SyntaxKind[ type.literal.kind ]}"`;
    }
}

/**
 * @param {ts.Node} type
 * @return {{}|[]|void}
 */
function add_raw_types_prev( type )
{
    // if ( !type ) return '<missing> ' + new Error().stack.split( /\r?\n/ ).slice( 1, 4 ).join( ' | ' );

    let t = {};

    switch ( type.kind )
    {
        case SyntaxKind.Identifier:
            return type.escapedText;

        case SyntaxKind.ParenthesizedType:
            return { type: 'parens', types: add_raw_types( type.type ) };

        case SyntaxKind.TypePredicate:
            return { type: 'predicate', param: type.parameterName.escapedText, returns: add_raw_types( type.type ) };

        case SyntaxKind.TypeReference:
            const
                r = {
                    typeName: add_raw_types( type.typeName )
                },
                tmpl = check_for_raw_template( type );

            if ( tmpl )
            {
                r.template = fix_raw_templates( tmpl );
                r.template = { _: r.template, sourceLineART01: 'add_raw_types-01' };
            }

            return r;

        case SyntaxKind.QualifiedName:
            return { type: 'qualified', names: qual_raw_name( type ) };

        case SyntaxKind.FunctionType:
            return func_type_info( type, { kind: SyntaxKind[ type.kind ] } );

        case SyntaxKind.UnionType:
            return { type: 'union', types: type.types.map( add_raw_types ) };

        case SyntaxKind.IntersectionType:
            return { type: 'intersection', types: type.types.map( add_raw_types ) };

        case SyntaxKind.MappedType:
            const mapped = {
                type: 'mapped',
                name: null
            };

            if ( type.questionToken ) mapped.optional = true;
            mapped.name = get_raw_type_name( type.type );

            return mapped;

        case SyntaxKind.LiteralType:
            return raw_literal( type );

        case SyntaxKind.TypeLiteral:
            return {
                type: 'type',
                members: type.members.map( add_raw_types )
            };

        case SyntaxKind.IndexSignature:
            return {
                type: 'index',
                typeName: add_raw_types( type.type ), // elevate( add_raw_types( type.type ) ),
                parameters: type.parameters.map( add_raw_types )
            };

        case SyntaxKind.Parameter:
            // const typeList = elevate( clean( add_raw_types( type.type ) ) );

            return optional( {
                name: add_raw_types( type.name ),
                type: add_raw_types( type.type )
            }, type.questionToken );

        case SyntaxKind.TupleType:
            return {
                type: 'tuple',
                types: type.elementTypes.map( add_raw_types ) // .map( elevate )
            };

    }

    if ( type )
        t = !type.types ? get_raw_type_name( type ) : type.types.map( get_raw_type_name );

    if ( !isObject( t ) )
        t = { type: t };
    else if ( isObject( t.typeName ) )
    {
        const keys = Object.keys( t.typeName );

        if ( keys.length === 1 && keys[ 0 ] === 'type' )
        {
            t.type = t.typeName.type;
            delete t.typeName;
        }
    }

    t.types = fixKeyword( t.types );

    if ( type.kind === SyntaxKind.TypeParameter && type.constraint )
    {
        t.typeOperator = type_in_mapped_type( type ) ? ' in' : ' extends';

        if ( type.constraint.kind === SyntaxKind.TypeOperator )
        {
            t.keyOf = true;
            t.typeName = get_raw_type_name( type.constraint.type );
        }
        else
            t.typeName = get_raw_type_name( type.constraint );
    }

    const tmpl = check_for_raw_template( type );

    if ( tmpl )
    {
        t.template = fix_raw_templates( tmpl );
        t.template = { _: t.template, sourceLineART02: 'add_raw_types-02' };
    }

    if ( t.type ) t.type = elevate( t.type );

    return t;
}

/**
 * @param {ts.Node} type
 * @return {{}|[]|void}
 */
function add_raw_types( type )
{
    // if ( !type ) return '<missing> ' + new Error().stack.split( /\r?\n/ ).slice( 1, 4 ).join( ' | ' );

    let t = {}, r, tmpl;

    switch ( type.kind )
    {
        case SyntaxKind.Identifier:
            return { name: type.escapedText };

        case SyntaxKind.ParenthesizedType:
            return { type: 'parens', types: add_raw_types( type.type ) };

        case SyntaxKind.TypePredicate:
            return { type: 'predicate', param: type.parameterName.escapedText, returns: add_raw_types( type.type ) };

        case SyntaxKind.TypeReference:
            r = {
                type: 'reference',
                typeName: collapse( add_raw_types( type.typeName ) )
            };

            tmpl = check_for_raw_template( type );

            if ( tmpl )
                r.typeArguments = tmpl;

            return r;

        case SyntaxKind.QualifiedName:
            return { type: 'qualified', names: qual_raw_name( type ) };

        case SyntaxKind.FunctionType:
            return {
                type: 'function',
                definition: func_type_info( type )
            };

        case SyntaxKind.UnionType:
            return { type: 'union', types: type.types.map( add_raw_types ) };

        case SyntaxKind.IntersectionType:
            return { type: 'intersection', types: type.types.map( add_raw_types ) };

        case SyntaxKind.MappedType:
            const mapped = {
                type: 'mapped'
            };

            // if ( type.questionToken ) mapped.optional = true;
            mapped.definition = {
                type: collapse( add_raw_types( type.type ) ),
                typeParameter: collapse( add_raw_types( type.typeParameter ) )
            };

            return optional( mapped, type.questionToken );

        case SyntaxKind.LiteralType:
            return raw_literal( type );

        case SyntaxKind.TypeLiteral:
            return {
                type: 'typeliteral',
                members: type.members.map( add_raw_types )
            };

        case SyntaxKind.IndexSignature:
            const is = {
                type: 'index',
                typeName: add_raw_types( type.type ),
                parameters: type.parameters.map( add_raw_types ).map( collapse )
            };

            collapse( is );
            return is;

        case SyntaxKind.Parameter:
            const typeList = collapse( add_raw_types( type.type ) );

            return optional( {
                name: add_raw_types( type.name ),
                type: typeList
            }, type.questionToken );

        case SyntaxKind.TupleType:
            return {
                type: 'tuple',
                types: type.elementTypes.map( add_raw_types ).map( collapse )
            };

    }

    if ( type )
        t = !type.types ? get_raw_type_name( type ) : type.types.map( get_raw_type_name );

    // if ( !isObject( t ) )
    //     t = { type: t };
    // else if ( isObject( t.typeName ) )
    // {
    //     const keys = Object.keys( t.typeName );
    //
    //     if ( keys.length === 1 && keys[ 0 ] === 'type' )
    //     {
    //         t.type = t.typeName.type;
    //         delete t.typeName;
    //     }
    // }

    if ( t.types )
        t.types = fixKeyword( t.types );

    if ( type.name )
        t.name = get_raw_type_name( type );

    if ( type.kind === SyntaxKind.TypeParameter && type.constraint )
    {
        t.typeOperator = type_in_mapped_type( type ) ? ' in' : ' extends';

        if ( type.constraint.kind === SyntaxKind.TypeOperator )
        {
            t.keyOf = true;
            t.typeName = get_raw_type_name( type.constraint.type );
        }
        else
            t.typeName = get_raw_type_name( type.constraint );
    }

    tmpl = check_for_raw_template( type );

    if ( tmpl )
        t.typeParameters = tmpl;

    collapse( t );

    // if ( t.type ) t.type = elevate( t.type );

    return optional( t, type.questionToken );
}

/**
 * @param tmpl
 * @return {*}
 */
function fix_raw_templates( tmpl )
{
    return tmpl;
    if ( Array.isArray( tmpl ) )
        return tmpl.map( collapse );
    else if ( isObject( tmpl ) )
    {
        const tk = Object.keys( tmpl );

        if ( tk.length !== 1 )
            tk.forEach( k => tmpl[ k ] = fix_raw_templates( tmpl[ k ] ) );
    }

    return tmpl;
}

/**
 * @param {ts.QualifiedName} node
 */
function qual_raw_name( node )
{
    if ( SyntaxKind.Identifier === node.kind )
        return [ node.escapedText ];
    else if ( SyntaxKind.QualifiedName === node.kind )
        return qual_raw_name( node.left ).concat( qual_raw_name( node.right ) );
}

function check_for_raw_template( type )
{
    if ( type.typeParameters )
        return type_raw_parameters( type.typeParameters );

    if ( type.typeArguments )
        return type_raw_parameters( type.typeArguments );

    return null;
}

function get_raw_type_name( type )
{
    if ( !type ) return '<no type name>';

    let typeName = type.typeName && type.typeName.escapedText ?
                   type.typeName.escapedText :
                   type.name && type.name.escapedText ? type.name.escapedText :
                   type.exprName ? type.exprName.escapedText :
                   type.kind ?
                   SyntaxKind[ type.kind ] :
                   '';

    if ( /^\s*[A-Z][a-z]+Keyword\s*$/.test( typeName ) )
        typeName = typeName.replace( /^(.*)Keyword$/, '$1' ).toLowerCase();

    const r = {
        typeName
    };

    if ( typeName === 'IndexedAccessType' )
    {
        r.indexType = collapse( get_raw_type_name( type.indexType ) );
        r.typeName = collapse( get_raw_type_name( type.objectType ) );
        return r;
    }

    const tmpl = check_for_raw_template( type );

    if ( tmpl )
        r.typeParameters = collapse( tmpl ); // fix_raw_templates( tmpl );

    if ( typeName === 'ArrayType' && type.elementType )
    {
        r.typeName = add_raw_types( type.elementType );
        r.isArray = true;
    }

    return collapse( r );
}

function type_raw_parameters( tp )
{
    if ( !tp || !tp.length ) return null;

    return tp.map( add_raw_types );
}

function collapse( t )
{
    if ( !t ) return t;

    if ( Array.isArray( t ) ) return t.map( collapse );

    _collapse( t );
    _collapse( t, 'name' );
    _collapse( t, 'typeName', 'name' );
    _collapse( t, 'name', 'typeName' );
    _collapse( t, 'type', 'typeName' );

    if ( type( t.typeName ) === 'object' )
        collapse( t.typeName );

    return t;
}

function _collapse( t, field = 'typeName', sub = field )
{
    if ( !t ) return t;

    const
        has = ( o, n ) => type( o ) === 'object' ? o.hasOwnProperty( n ) : false,
        // keys = o => Object.keys( o ),
        // __ = o => type( o ) === 'object' ? `[ ${keys( o ).join( ', ' )} ]` : '-',
        tn = type( t[ field ] ) === 'object' ? t[ field ] : null;

    if ( tn && has( tn, 'types' ) && !tn.types )
        delete tn.types;

    // if ( type( t.typeName ) === 'object' && type( t.typeName.typeName ) === 'string' )
    //     console.log( `maybe: ${__( t.typeName )}, do? ${type( t.typeName ) === 'object' && keyCount( t.typeName ) === 1 && keys( t.typeName )[ 0 ] === 'typeName'}, t: ${__( t )}` );

    if ( tn && keyCount( tn ) === 1 )
    {
        if ( has( tn, sub ) && type( tn[ sub ] ) === 'string' )
            t[ field ] = tn[ sub ];
    }

    return t;
}

