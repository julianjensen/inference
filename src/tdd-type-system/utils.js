/** ****************************************************************************
 * DESCRIPTION
 * @author julian.jensen
 * @since 0.0.1
 *******************************************************************************/
"use strict";

export const
    string = s => typeof s === 'string',
    array = o => Array.isArray( o ),
    _has   = o => n => ( Object.prototype.hasOwnProperty.call( o, n ) ),
    has    = ( o, n ) => _has( o )( n );

export const DEBUG = {
    DEFINITION: true
};

export const nameless = {
    SIGNATURE: Symbol( 'signature' ),
    CONSTRUCTOR: Symbol( 'constructor' )
};
const SIGNATURE   = nameless.SIGNATURE;
const CONSTRUCTOR = nameless.CONSTRUCTOR;

let globalScope;

/**
 * @param {string|symbol} name
 * @return {string}
 */
export function readable_name( name ) {
    if ( typeof name === 'symbol' )
        return name === SIGNATURE ? '' : name === CONSTRUCTOR ? 'new' : 'UNKNOWN-NAME-ERROR';

    return name.startsWith( '__' ) ? name.substr( 2 ) : name;
}

/**
 * @param {object} def
 * @return {object}
 */
export function massage_defs( def )
{
    let error;

    if ( has( def, 'members' ) && array( def.members ) )
    {
        def.members.forEach( massage_defs );
        return def;
    }

    if ( !has( def, 'decls' ) || !array( def.decls ) ) return def;

    def.kind = def.decls.map( d => d.kind ).reduce( ( prev, cur ) => cur !== prev && cur !== DECL.VARIABLE ? error = [ cur, prev ] : cur );
    // def.decls.forEach( d => delete d.kind );

    if ( error )
        throw new Error( `Multiple kinds: ${error}` );

    def.decls.forEach( massage_defs );

    return def;
}

export const DECL = {
    INTERFACE:   'InterfaceDeclaration',
    CONSTRUCTOR: 'ConstructSignature',
    METHOD:      'MethodSignature',
    CALL:        'CallSignature',
    SIGNATURE:   'Signature',
    VARIABLE:    'VariableDeclaration',
    PROPERTY:    'PropertySignature',
    TYPEPARAM:   'TypeParameter',
    THIS:        'ThisType',
    INDEX:       'IndexSignature',

    TYPE: 'RAW_TYPE'
};

/**
 * @param {object} def
 * @return {string}
 */
export function get_kind( def )
{
    if ( string( def ) )
    {
        if ( def === DECL.THIS ) return DECL.THIS;
        else if ( def === 'function' ) return DECL.CALL;
    }

    return def.kind || DECL.TYPE;
    // return has( def, 'kind' ) ?
    //        def.kind :
    //        has( def, 'flags' ) ?
    //        def.flags :
    //        def.decls[ 0 ].kind;
}

let Scope;

export const defer_scope = _Scope => Scope = _Scope;

export const get_decl = ( d, kind ) => d.find( decl => decl.kind === kind );

export const get_scope = decl => decl instanceof Scope || decl.functionScope;

export const global_scope = gscope => gscope ? ( globalScope = gscope ) : globalScope;
