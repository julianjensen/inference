/** ******************************************************************************************************************
 * @file Describe what symbols does.
 * @author Julian Jensen <jjdanois@gmail.com>
 * @since 1.0.0
 * @date 20-Jan-2018
 *********************************************************************************************************************/




"use strict";

import { globals, isString, node_is } from "./utils";
import { Syntax } from 'espree';
import { SymbolFlags } from "./types";
import { parse } from "./parse-file";

const
    make_temp = () => `$_temp${~~( Math.random() * 1e5 )}`,
    as_identifier = parts => parts.length === 1 && isString( parts[ 0 ] ) ? parts[ 0 ] : null,
    as_fqn = parts => parts.every( p => !p.computed ) ? parts : null;

/**
 * @class
 */
export class Symbol
{
    /**
     * @param {string} name
     * @param {SymbolTable} symbolTable
     */
    constructor( name, symbolTable )
    {
        this.name = name;
        this.definitions = [];
        this.decls = [];
        this.refs = [];
        /** @type {SymbolFlags} */
        this.flags = SymbolFlags.None;
        /** @type {?SymbolTable} */
        this.symbols = null;
        /** @type {SymbolTable} */
        this.symbolTable = symbolTable;
    }

    /**
     * @param {Declaration} decl
     * @return {Symbol}
     */
    declaration( decl )
    {
        if ( !this.decls.includes( decl ) ) this.decls.push( decl );
        return this;
    }

    /**
     * @param {Identifier} ref
     * @return {Symbol}
     */
    reference( ref )
    {
        if ( !this.refs.includes( ref ) ) this.refs.push( ref );
        return this;
    }

    definition( def )
    {
        this.merge_definition( def );
        return this;
    }

    merge_definition( def )
    {
        this.definitions.push( def );
    }

    /**
     * @param {SymbolFlags} type
     * @return {Symbol}
     */
    as( type )
    {
        this.flags |= type;

        if ( this.flags & SymbolFlags.JSContainer && !this.symbols )
        {
            this.symbolTable = new SymbolTable( this.symbolTable );
            this.symbolTable.name = this.name;
        }

        return this;
    }

    /**
     * @param {SymbolFlags} type
     * @return {SymbolFlags}
     */
    flagged( type )
    {
        return this.flags & type;
    }

    /**
     * @return {SymbolFlags}
     */
    get_flags()
    {
        return this.flags;
    }

    /**
     * @param {SymbolFlags} type
     * @return {Symbol}
     */
    not( type )
    {
        this.flags &= ~type;
        return this;
    }

    value()
    {

    }

    toString()
    {
        return `${this.name} ( ${this.flags.asString()} )`;
    }
}

/**
 *
 */
export class SymbolTable
{
    /**
     * @param {SymbolTable} parent
     */
    constructor( parent = null )
    {
        this.symbols = new Map();
        this.parent = parent;
        this.node = null;
        this.name = null;
    }

    /**
     * @param {string} name
     * @param {?Declaration} [node]
     * @param {Annotation} [definition]
     * @return {SymbolTable}
     */
    decl( name, node, definition )
    {
        name = this.fqn( name );
        if ( !this.symbols.has( name ) )
        {
            const sym = new Symbol( name, this );
            this.symbols.set( name, sym );
            sym.declaration( node );
            sym.definition( definition );
        }

        return this;
    }

    /**
     * @param {string} name
     * @param {Identifier} [node]
     * @param {Annotation} [definition]
     * @return {SymbolTable}
     */
    ref( name, node, definition )
    {
        name = this.fqn( name );
        if ( !this.symbols.has( name ) )
        {
            const sym = new Symbol( name, this );
            this.symbols.set( name, sym );
            if ( node ) sym.reference( node );
            if ( definition ) sym.definition( definition );
        }

        return this;
    }

    /**
     * @param {string} name
     * @return {?Array<string>}
     */
    fqn( name )
    {
        const names = [ name ];

        let symTab = this.parent;

        while ( symTab )
        {
            if ( symTab.name ) names.unshift( symTab.name );
            symTab = symTab.parent;
        }

        return names.length ? names : null;
    }

    /**
     * @param {Symbol|string|Identifier|MemberExpression|null|undefined} [name]
     * @param {boolean} [createIfMissing=false]
     * @return {Symbol}
     */
    get( name, createIfMissing = false )
    {
        if ( name === null || name === void 0  )
            return this.make_temp();

        if ( name instanceof Symbol ) return name;

        if ( isString( name ) )
        {
            if ( this.symbols.has( name ) )
                return this.symbols.get( name );

            let sym = this.get_name( name );

            if ( sym ) return sym;

            return createIfMissing ? this.ref( name ).get( name ) : null;
        }
        // else if ( node_is( name, Syntax.Identifier ) )
        //     return this.get( name.name, createIfMissing );
        else
        {
            let
                /** @type {?(Array<Array<string>|string>)} */
                rawFqn = make_fqn( name ),
                name = as_identifier( rawFqn ),
                names = as_fqn( rawFqn );

            /**
             * 1. [ `string` ] => `string`
             *    Get the symbol named `string` from the current or parent symboltable.
             *    if `sym` does not exist and `create` is `true`, create `sym` on `current` symboltable
             */
            if ( name )
                return globals.current.get( name, createIfMissing );

            /**
             * 2. [ `string`, ...,`string` ] => `string`, ..., `string`
             *    Pop last `string` as `lastsym`
             *    Set `current` to current symboltable
             *    Get the first (left-most) symbol as `sym` from the current or parent symboltable.
             *    Get the symboltable associated with `sym` as `current`.
             *
             *    for each symbol as `sym` in list
             *      Get `sym` from `current` only (no parents) as `sym`
             *      if `sym` does not exist and `create` is `true`, create `sym` on `current` symboltable, flags as `JSContainer`
             *      if `sym` does not exist return `null`
             *      Get the symboltable associated with `sym` as `current`.
             *
             *    Get `lastsym` from `current` only (no parents)
             *    if `sym` does not exist and `create` is `true`, create `sym` on `current` symboltable
             *    return `sym`
             */
            if ( names )
            {
                let lastSym = names.pop(),
                    /** @type {SymbolTable} */
                    cur = globals.current,
                    /** @type {?Symbol} */
                    sym;

                for ( const name of names )
                {
                    sym = cur.get( name, createIfMissing );

                    if ( !sym ) return null;

                    sym.as( SymbolFlags.JSContainer );
                    cur = sym.symbolTable;
                }

                return cur.get( lastSym, createIfMissing );
            }

            /**
             * 3. [ { name: [ `string|NamePart`, ..., `string|NamePart` ], computed: [ `string|NamePart`, ..., `string|NamePart` ] } ]
             *    Get consecutive `string` from `name`
             *    Set `sym` to return result from calling number 2 above
             *    if `sym` does not exist return `null`
             */

            /**
             * @param {Array<string>|string} list
             * @param {SymbolTable} [symbolTable]
             * @return {?Symbol}
             */
            const walk_nested = list => {
                let /** @type {Array<string>} */
                    conseq = [],
                    /** @type {?Symbol} */
                    sym,
                    base,
                    prop;

                while ( list.length )
                {
                    while ( list.length && isString( list[ 0 ] ) )
                        conseq.push( list.shift() );

                    if ( conseq.length )
                    {
                        sym = this.get( conseq, createIfMissing );
                        base = sym && sym.symbolTable;
                        if ( !sym ) return null;
                    }

                    if ( list.length )
                    {
                        prop = this.get( list.shift(), createIfMissing );

                        if ( !prop ) return null;

                        sym = base.symbolTable.get( prop, createIfMissing );
                        base = sym.symbolTable;
                    }
                }
            }

            /**
             *
             * Set `sym` to result of `object` as follows:
             *      if `object` is `Identifier`
             *          set `sym` to result of calling number 1 above
             *          if `sym` does not exist return `null`
             *
             *      if `object` is `ThisExpression`
             *          Resolve `this` to `sym`
             *          if `sym` does not exist set `sym` to generic `Object`
             *
             *      if `object` is `Super`
             *          Resolve `super` to `sym`
             *          if `sym` does not exist set `sym` to generic `Object`
             *
             *      if `object` is `MemberExpression`
             *          Set `sym` to result of self( `object` )
             *
             * Set `current` to symboltable of `sym`
             *
             * Get `property` in the same way as `object` above (`super` is not legal as `property`)
             *      Set result to `prop`
             *
             * if `prop` does not exist on `current` and create is `true`, create `prop` on `current`
             * Get `prop` from `current` and write to `sym`
             * return `sym`
             */

            return walk_nested( rawFqn );
        }
    }

    make_temp()
    {
        const
            tmpName = make_temp();

        return this.decl( tmpName, null ).get( tmpName ).as( SymbolFlags.Transient );
    }

    get_name( name )
    {
        if ( !isString( name ) ) return null;

        if ( this.symbols.has( name ) )
            return this.symbols.get( name );
        else if ( this.parent )
            return this.parent.get_name( name );

        return null;
    }

    get_own( name )
    {
        if ( !isString( name ) ) return null;

        return this.symbols.get( name );
    }

    has_own( name )
    {
        if ( !isString( name ) ) return null;

        return this.symbols.has( name );
    }

    has_name( name )
    {
        if ( !isString( name ) ) return null;

        if ( this.symbols.has( name ) )
            return true;
        else if ( this.parent )
            return this.parent.has_name( name );

        return false;
    }

    has( id )
    {
        const name = isString( id ) ? id : node_is( id, Syntax.Identifier ) ? id.name : null;

        return this.has_name( name );
    }

    own( id )
    {
        const name = isString( id ) ? id : node_is( id, Syntax.Identifier ) ? id.name : null;

        return this.has_own( name );
    }

    toString()
    {
        [ ...this.symbols.values() ].map( s => `${s}` ).join( '\n' );
    }
}

/**
 *
 * Three options:
 *
 * 1. [ `string` ] => `string`
 *    Get the symbol named `string` from the current or parent symboltable.
 *    if `sym` does not exist and `create` is `true`, create `sym` on `current` symboltable
 *
 * 2. [ `string`, ...,`string` ] => `string`, ..., `string`
 *    Pop last `string` as `lastsym`
 *    Set `current` to current symboltable
 *    Get the first (left-most) symbol as `sym` from the current or parent symboltable.
 *    Get the symboltable associated with `sym` as `current`.
 *
 *    for each symbol as `sym` in list
 *      Get `sym` from `current` only (no parents) as `sym`
 *      if `sym` does not exist and `create` is `true`, create `sym` on `current` symboltable, flags as `JSContainer`
 *      if `sym` does not exist return `null`
 *      Get the symboltable associated with `sym` as `current`.
 *
 *    Get `lastsym` from `current` only (no parents)
 *    if `sym` does not exist and `create` is `true`, create `sym` on `current` symboltable
 *    return `sym`
 *
 * 3. deprecated: [ { name: [ `string|NamePart`, ..., `string|NamePart` ], computed: [ `string|NamePart`, ..., `string|NamePart` ] } ]
 *    Get consecutive `string` from `name`
 *    Set `sym` to return result from calling number 2 above
 *    if `sym` does not exist return `null`
 *
 *
 * Set `sym` to result of `object` as follows:
 *      if `object` is `Identifier`
 *          set `sym` to result of calling number 1 above
 *          if `sym` does not exist return `null`
 *
 *      if `object` is `ThisExpression`
 *          Resolve `this` to `sym`
 *          if `sym` does not exist set `sym` to generic `Object`
 *
 *      if `object` is `Super`
 *          Resolve `super` to `sym`
 *          if `sym` does not exist set `sym` to generic `Object`
 *
 *      if `object` is `MemberExpression`
 *          Set `sym` to result of self( `object` )
 *
 * Set `current` to symboltable of `sym`
 *
 * Get `property` in the same way as `object` above (`super` is not legal as `property`)
 *      Set result to `prop`
 *
 * if `prop` does not exist on `current` and create is `true`, create `prop` on `current`
 * Get `prop` from `current` and write to `sym`
 * return `sym`
 *
 * @param {string|Array<string>|Identifier|MemberExpression} id
 * @param {boolean} [createIfMissing=false]
 * @param {?SymbolTable} [startSymbols]
 * @return {?Symbol}
 */
function get( id, createIfMissing = false, startSymbols = globals.current )
{
    let
        /** @type {?(Array<NamePart|string>)} */
        rawFqn = make_fqn( id ),
        name = as_identifier( rawFqn ),
        names = as_fqn( rawFqn );

    /**
     * 1. [ `string` ] => `string`
     *    Get the symbol named `string` from the current or parent symboltable.
     *    if `sym` does not exist and `create` is `true`, create `sym` on `current` symboltable
     */
    if ( name )
        return globals.current.get( name, createIfMissing );

    /**
     * 2. [ `string`, ...,`string` ] => `string`, ..., `string`
     *    Pop last `string` as `lastsym`
     *    Set `current` to current symboltable
     *    Get the first (left-most) symbol as `sym` from the current or parent symboltable.
     *    Get the symboltable associated with `sym` as `current`.
     *
     *    for each symbol as `sym` in list
     *      Get `sym` from `current` only (no parents) as `sym`
     *      if `sym` does not exist and `create` is `true`, create `sym` on `current` symboltable, flags as `JSContainer`
     *      if `sym` does not exist return `null`
     *      Get the symboltable associated with `sym` as `current`.
     *
     *    Get `lastsym` from `current` only (no parents)
     *    if `sym` does not exist and `create` is `true`, create `sym` on `current` symboltable
     *    return `sym`
     */
    if ( names )
    {
        let lastSym = names.pop(),
            /** @type {SymbolTable} */
            cur = globals.current,
            /** @type {?Symbol} */
            sym;

        for ( const name of names.entries() )
        {
            sym = cur.get( name, createIfMissing );

            if ( !sym ) return null;

            sym.as( SymbolFlags.JSContainer );
            cur = sym.symbolTable;
        }

        return cur.get( lastSym, createIfMissing );
    }

    /**
     * 3. [ { name: [ `string|NamePart`, ..., `string|NamePart` ], computed: [ `string|NamePart`, ..., `string|NamePart` ] } ]
     *    Get consecutive `string` from `name`
     *    Set `sym` to return result from calling number 2 above
     *    if `sym` does not exist return `null`
     */

    /**
     * @param {Array<string>|string} list
     * @param {SymbolTable} [symbolTable]
     * @return {?Symbol}
     */
    function walk_nested( list, symbolTable = startSymbols )
    {
        let /** @type {Array<string>} */
            conseq = [],
            /** @type {?Symbol} */
            sym,
            base,
            prop;

        while ( list.length )
        {
            while ( list.length && isString( list[ 0 ] ) )
                conseq.push( list.shift() );

            if ( conseq.length )
            {
                sym = get( conseq, createIfMissing );
                base = sym && sym.symbolTable;
                if ( !sym ) return null;
            }

            if ( list.length )
            {
                prop = get( list.shift(), createIfMissing );

                if ( !prop ) return null;

                sym = base.symbolTable.get( prop, createIfMissing );
                base = sym.symbolTable;
            }
        }
    }

    /**
     *
     * Set `sym` to result of `object` as follows:
     *      if `object` is `Identifier`
     *          set `sym` to result of calling number 1 above
     *          if `sym` does not exist return `null`
     *
     *      if `object` is `ThisExpression`
     *          Resolve `this` to `sym`
     *          if `sym` does not exist set `sym` to generic `Object`
     *
     *      if `object` is `Super`
     *          Resolve `super` to `sym`
     *          if `sym` does not exist set `sym` to generic `Object`
     *
     *      if `object` is `MemberExpression`
     *          Set `sym` to result of self( `object` )
     *
     * Set `current` to symboltable of `sym`
     *
     * Get `property` in the same way as `object` above (`super` is not legal as `property`)
     *      Set result to `prop`
     *
     * if `prop` does not exist on `current` and create is `true`, create `prop` on `current`
     * Get `prop` from `current` and write to `sym`
     * return `sym`
     */

    return walk_nested( rawFqn );
}

/**
 * @param {string|Array<string>|MemberExpression|Identifier|ThisExpression|Super|SimpleLiteral|RegExpLiteral|Expression} node
 * @return {Array<string>|string}
 */
function make_fqn( node )
{
    if ( isString( node ) ) return [ node ];

    if ( Array.isArray( node ) && node.every( isString ) ) return node;

    switch ( node.type )
    {
        case Syntax.Literal:
            return node.regex ? [ node.regex.pattern + '.' + node.regex.flags ] : [ node.value ];

        case Syntax.Identifier:
            return [ node.name ];

        case Syntax.ThisExpression:
            return [ 'this' ];

        case Syntax.Super:
            return [ 'super' ];

        case Syntax.MemberExpression:
            if ( node.computed )
                return [ ...make_fqn( node.object ), make_fqn( node.property ) ];
                // return [ { name: make_fqn( node.object ), computed: make_fqn( node.property ) } ];

            return make_fqn( node.object ).concat( make_fqn( node.property ) );
    }
}

globals.current = globals.symbolTable = new SymbolTable();

[
    "a",
    "a.b",
    "a.b.c",
    "a.b.c[ x ]",
    "a.b.c[ x.y ]",
    "a.b[ x.y ].s.t",
    "a.b[ x.y ][ s.t ]",
    "a.b[ x.y ][ s[ h.i ].t ]"
].forEach( testStr => {
    const ast = parse( testStr );

    console.log( '-----\n' + testStr + '\n', JSON.stringify( make_fqn( ast.body[ 0 ].expression ), null, 4 ) + '\n' );

    globals.current.get( ast.body[ 0 ].expression, true );
    console.log( '' + globals.current );
} );
