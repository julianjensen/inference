/** ******************************************************************************************************************
 * @file Describe what symbols does.
 *
 *
 * @author Julian Jensen <jjdanois@gmail.com>
 * @since 1.0.0
 * @date 20-Jan-2018
 *********************************************************************************************************************/
"use strict";

import { globals, isString, node_is }                 from "./utils";
import { Syntax }                                     from 'espree';
import { ModifierFlags, SymbolFlags, TransformFlags } from "./types";

const
    make_temp = () => `$_temp${~~( Math.random() * 1e5 )}`,
    make_anonymous = () => `$_anon${~~( Math.random() * 1e5 )}`,
    make_alias = ( actualName, aliasName ) => '_alias_' + actualName + '$' + JSON.stringify( aliasName ).replace( /[",]/g, '' ).replace( /[[\]]/g, '_' );

/**
 *
 */
export class Symbol
{
    /**
     * @param {string} [name]
     * @param {?Symbol} [parent]
     */
    constructor( name = 'global', parent = null )
    {
        this.symbols = new Map();
        this.parent = parent;
        this.node = null;
        this._name = name;
        /** @type {TransformFlags} */
        this.transformFlags = TransformFlags.None;
        this.tempCounter = 1;
        /** @type {Declaration|Identifier} */
        this.decls = [];
        /** @type {Array<Identifier>} */
        this.refs = [];
        /** @type {Array<Annotation>} */
        this.definitions = [];
        /** @type {Symbol} */
        this.aliasFor = null;
        /** @type {ModifierFlags} */
        this.modifiers = ModifierFlags.None;
    }

    get name()
    {
        return this._name || this.tempName || '<missing name>';
    }

    set name( n )
    {
        this._name = n;
    }

    /**
     * @param {SymbolFlags} type
     * @return {Symbol}
     */
    as( type )
    {
        this.flags |= type;

        if ( this.flags & SymbolFlags.JSContainer && !this.symbols )
            this.symbols = new Map();

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

    temp_name()
    {
        this.tempName = `__[${this.fqn()}].${this.symbolTable.tempCounter++}`;
        return this;
    }

    get_or_create( name )
    {
        let sym = this.symbols.get( name );

        if ( !sym )
        {
            sym = new Symbol( name, this );
            this.symbols.set( name, sym );
        }

        return sym;
    }

    /**
     * @param {string} name
     * @param {Symbol} target
     * @return {Symbol}
     */
    alias( name, target )
    {
        if ( this.symbols.has( name ) )
            throw new Error( `Duplicate definition for alias "${name}"` );

        const sym = this.get_or_create( name ).as( SymbolFlags.Alias );
        sym.aliasFor = target;
        return sym;
    }

    /**
     * @param {string|Node} name
     * @param {?Declaration} [node]
     * @param {Annotation} [definition]
     * @return {Symbol}
     */
    decl( name, node, definition )
    {
        if ( !name ) name = make_anonymous();

        let sym = typeof name === 'string' ? this.get_or_create( name ) : this.get( name );

        if ( node ) this.decls.push( node );
        if ( definition ) this.definitions.push( definition );

        return sym;
    }

    /**
     * @param {string} name
     * @param {Identifier} [node]
     * @param {Annotation} [definition]
     * @return {Symbol}
     */
    ref( name, node, definition )
    {
        const sym = this.get_or_create( name );

        if ( node ) this.refs.push( node );
        if ( definition ) this.definitions.push( definition );

        return this;
    }

    /**
     * @return {?Array<string>}
     */
    fqn()
    {
        const names = [ this.name ];

        let sym = this.parent;

        while ( sym.parent )
        {
            if ( sym.name ) names.unshift( sym.name );
            sym = sym.parent;
        }

        return names.length ? names : null;
    }

    /**
     * recurse( sym = current ):
     *
     *      if string
     *          sym = sym.string
     *
     *      if array
     *          prop is recurse( array )
     *          genName alias -> prop
     *          sym = sym.genName
     *          sym is computed
     *
     * @param {RecursiveNames} varNames
     * @param {boolean} [createIfMissing=false]
     */
    get( varNames, createIfMissing = false )
    {
        /**
         * @param {RecursiveNames} names
         */
        const experimental = names => {

            let sym = globals.current;

            while ( names.length )
            {
                let next = names.shift();

                if ( isString( next ) )
                    sym = sym.get_own( next, createIfMissing );
                else
                {
                    const
                        aliasName = make_alias( this.name, next ), // '_alias_' + this.name + '$' + JSON.stringify( next ).replace( /[",]/g, '' ).replace( /[[\]]/g, '_' ),
                        prop = experimental( next );

                    sym.transformFlags |= TransformFlags.ContainsComputedPropertyName;
                    sym = sym.alias( aliasName, prop ).as( SymbolFlags.ComputedNotInferred );
                }
            }

            return sym;
        };

        console.error( `varNames:`, varNames );
        console.error( `result:`, Symbol.make_fqn( varNames ) );
        return experimental( Symbol.make_fqn( varNames ) );
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

    get_own( name, createIfMissing = false )
    {
        if ( !isString( name ) ) return null;

        const sym = this.symbols.get( name );

        if ( sym ) return sym;

        if ( !createIfMissing ) return null;

        return this.decl( name );

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

    asString( indent = '' )
    {
        let st = '';

        if ( this.symbols && this.symbols.size )
        {
            let subSyms = [];

            for ( const sym of this.symbols.values() )
                subSyms.push( sym.asString( indent + '    ' ) );

            st = '\n' + indent + subSyms.join( '\n' + indent );
        }

        let aStr = ( this.flags & SymbolFlags.Alias ) ? ` => ${this.aliasFor.name} [${this.aliasFor.fqn().join( '.' )}]` : '';

        return `${this.name}: ${SymbolFlags.asString( this.flags )}${aStr}${st}`;
    }

    toString()
    {
        return this.asString();
    }

    /**
     * @param {string|Array<string>|MemberExpression|Identifier|ThisExpression|Super|SimpleLiteral|RegExpLiteral|Expression} node
     * @return {Array<string>|string}
     */
    static make_fqn( node )
    {
        if ( isString( node ) ) return [ node ];

        if ( Array.isArray( node ) && node.some( isString ) ) return node;

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
                    return [ ...Symbol.make_fqn( node.object ), Symbol.make_fqn( node.property ) ];

                return Symbol.make_fqn( node.object ).concat( Symbol.make_fqn( node.property ) );
        }
    }
}

/**
 * @class
 * @extends Symbol
 */
class FunctionSymbol extends Symbol
{
    constructor( name, parent )
    {
        super( name, parent );
        this.params = [];
        this.defaults = [];
        this.returnType = null;
    }

    add_param( sym , index = this.params.length )
    {
        this.params[ index ] = sym;
    }

    returns( sym )
    {
        this.returnType = sym;
    }
}

// [
//     "a",
//     "a.b",
//     "a.b.c",
//     "a.b.c[ x ]",
//     "a.b.c[ x.y ]",
//     "a.b[ x.y ].s.t",
//     "a.b[ x.y ][ s.t ]",
//     "a.b[ x.y ][ s[ h.i ].t ]"
// ].forEach( testStr => {
//     const ast = parse( testStr );
//
//     globals.current = globals.symbolTable = new Symbol();
//
//     console.log( '-----\n' + testStr + '\n', JSON.stringify( Symbol.make_fqn( ast.body[ 0 ].expression ), null, 4 ) + '\n' );
//
//     globals.current.get( ast.body[ 0 ].expression, true );
//
//     const symTab = '' + globals.current;
//
//     console.log( symTab );
// } );
