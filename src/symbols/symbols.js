/** ******************************************************************************************************************
 * @file Describe what symbols does.
 *
 *
 * @author Julian Jensen <jjdanois@gmail.com>
 * @since 1.0.0
 * @date 20-Jan-2018
 *********************************************************************************************************************/


"use strict";

import { array, object, number, string } from 'convenience';
import { globals, isString, node_is }    from "../utils";
import { Syntax }                        from 'espree';
import { TypeFlags }                     from "../types";
import { create }                        from "../type";

const
    make_temp      = () => `$_temp${~~( Math.random() * 1e5 )}`,
    make_anonymous = () => `$_anon${~~( Math.random() * 1e5 )}`,
    make_alias     = ( actualName, aliasName ) => '_alias_' + actualName + '$' + JSON.stringify( aliasName ).replace( /[",]/g, '' ).replace( /[[\]]/g, '_' );

/**
 * @class
 * @param {string} [name]
 * @param {?Symbol} [parent]
 */
export class Symbol
{
    /**
     * @param {string} [name]
     * @param {?Symbol} [parent]
     */
    constructor( name, parent = null )
    {
        if ( !name ) name = make_anonymous();

        if ( parent )
            parent.add( this );

        this.symbols = new Map();
        this.parent = parent;
        this.node = null;
        this._name = name;
        /** @type {Declaration|Identifier} */
        this.decls = [];
        /** @type {Array<Identifier>} */
        this.refs = [];
        /** @type {Array<Annotation>} */
        this.definitions = [];
        /** @type {Symbol} */
        this.aliasFor = null;
        /** @type {?Type} */
        this.type = null;

    }

    /**
     * @return {string}
     */
    get name()
    {
        return this._name || '<missing name>';
    }

    /**
     * @param {string} n
     */
    set name( n )
    {
        this._name = n;
    }

    /**
     * @param {TypeFlags|number} type
     * @return {Symbol}
     */
    as( type )
    {
        this.flags |= type;

        if ( this.flags & TypeFlags.CONTAINER && !this.symbols )
            this.symbols = new Map();

        return this;
    }

    /**
     * @param {TypeFlags} type
     * @return {TypeFlags|number}
     */
    flagged( type )
    {
        return this.flags & type;
    }

    /**
     * @return {TypeFlags}
     */
    get_flags()
    {
        return this.flags;
    }

    /**
     * @param {TypeFlags} type
     * @return {Symbol}
     */
    not( type )
    {
        this.flags &= ~type;
        return this;
    }

    /**
     * @param {string} name
     * @return {Symbol}
     */
    get_or_create( name )
    {
        let sym = this.symbols.get( name );

        if ( !sym )
        {
            sym = new this.constructor( name, this );
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

        const sym = this.get_or_create( name ).as( TypeFlags.ALIAS );
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

        let sym = typeof name === 'string' ? this.get_or_create( name ) : this.get( name, true );

        if ( node ) this.decls.push( node );
        if ( definition ) this.definitions.push( definition );

        return sym;
    }

    /**
     * @param {?(Node|Declaration|Identifier)} node
     */
    decl_node( node )
    {
        if ( node ) this.decls.push( node );
        return this;
    }

    /**
     *
     * @param {Annotation} def
     * @return {Symbol}
     */
    docs( def )
    {
        if ( def ) this.definitions.push( def );
        return this;
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

        return sym;
    }

    /**
     * @param {Symbol} sym
     * @return {Symbol}
     */
    add( sym )
    {
        this.symbols.set( sym.name, sym );
        this.as( TypeFlags.CONTAINER );
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

                if ( string( next ) )
                    sym = sym.get_own( next, createIfMissing );
                else
                {
                    const
                        aliasName = make_alias( this.name, next ), // '_alias_' + this.name + '$' + JSON.stringify( next ).replace( /[",]/g, '' ).replace( /[[\]]/g, '_' ),
                        prop      = experimental( next );

                    sym = sym.alias( aliasName, prop ).as( TypeFlags.COMPUTED_INDEX );
                }
            }

            return sym;
        };

        console.error( `varNames:`, varNames );
        console.error( `result:`, Symbol.make_fqn( varNames ) );
        return experimental( Symbol.make_fqn( varNames ) );
    }

    /**
     * @return {Symbol}
     */
    make_temp()
    {
        const
            tmpName = make_temp();

        return this.decl( tmpName, null ).get( [ tmpName ] ).as( TypeFlags.TRANSIENT );
    }

    /**
     * @param {string} name
     * @return {?Symbol}
     */
    get_name( name )
    {
        if ( !string( name ) ) return null;

        if ( this.symbols.has( name ) )
            return this.symbols.get( name );
        else if ( this.parent )
            return this.parent.get_name( name );

        return null;
    }

    /**
     * @param {string} name
     * @param {boolean} [createIfMissing=false]
     * @return {boolean}
     */
    get_own( name, createIfMissing = false )
    {
        if ( !string( name ) ) return null;

        const sym = this.symbols.get( name );

        if ( sym ) return sym;

        if ( !createIfMissing ) return null;

        return this.decl( name );

    }

    /**
     * @param {string} name
     * @return {boolean}
     */
    has_own( name )
    {
        if ( !string( name ) ) return null;

        return this.symbols.has( name );
    }

    /**
     * @param {string} name
     * @return {boolean}
     */
    has_name( name )
    {
        return !!this.get_name( name );
    }

    /**
     * @param {string|Identifier} id
     * @return {boolean}
     */
    has( id )
    {
        const name = string( id ) ? id : node_is( id, Syntax.Identifier ) ? id.name : null;

        return this.has_name( name );
    }

    /**
     * @param {string|Identifier} id
     * @return {boolean}
     */
    own( id )
    {
        const name = string( id ) ? id : node_is( id, Syntax.Identifier ) ? id.name : null;

        return this.has_own( name );
    }

    /**
     * @param {string} [indent]
     * @return {string}
     */
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

        let aStr = ( this.flags & TypeFlags.ALIAS ) ? ` => ${this.aliasFor.name} [${this.aliasFor.fqn().join( '.' )}]` : '';

        return `${this.name}: ${TypeFlags.asString( this.flags )}${aStr}${st}`;
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
        if ( string( node ) ) return [ node ];

        if ( Array.isArray( node ) && node.some( string ) ) return node;

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
export class FunctionSymbol extends Symbol
{
    /**
     * @param {string} name
     * @param {?Symbol} [parent]
     */
    constructor( name, parent )
    {
        super( name, parent );
        this.params = [];
        this.defaults = [];
        this.returnType = null;
        this.as( TypeFlags.CALLABLE );
        this.type = create( 'function' );
        this.minArity = 0;

        this.typeParameters = [];
    }

    add_param( sym, initializer = null, index = this.params.length )
    {
        this.params[ index ] = sym;
        this.defaults[ index ] = initializer;

        sym.as( TypeFlags.PARAM );

        if ( initializer )
            sym.as( TypeFlags.CONTAINSEXPR );

        return this;
    }

    add_type_arg( refOrName, index )
    {
        const type = string( refOrName ) ? new TypeParameter( refOrName ) : refOrName;

        if ( number( index ) )
            this.typeParameters[ index ] = type;
        else
            this.typeParameters.push( type );
    }

    /**
     * @param {Symbol} sym
     */
    returns( sym )
    {
        this.returnType = sym;
    }
}

/**
 * @class
 * @extends Symbol
 */
export class ObjectSymbol extends Symbol
{
    /**
     * @param {string} name
     * @param {?Symbol} [parent]
     */
    constructor( name, parent )
    {
        super( name, parent );
    }
}

export class TypeParameter
{
    constructor( name )
    {
        this.name = name;
    }

    add_constraint( name )
    {

    }
}

export class TypeReference
{
    constructor( name )
    {
        this.name = name;
        this.args = [];
    }

    add_arg( refOrName, index )
    {
        const type = string( refOrName ) ? new TypeReference( refOrName ) : refOrName;

        if ( number( index ) )
            this.args[ index ] = type;
        else
            this.args.push( type );
    }
}

function make_something_with_generic_type( obj )
{
    add_generic_type( name );
    add_generic_constraint( name );
}

function add_type_to_member( name )
{
    if ( is_name_the_super_generic_type( name ) )
        add_generic_type_reference_to_super_generic_type();
    else
        add_generic_type( name );
}

function add_constraint_type_to_member_generic_type( name )
{
    if ( is_name_the_super_generic_type( name ) )
        set_constraint_generic_type_to_reference_super_generic_type();
    else
        add_generic_type_constraint();
}

function add_type_predicate_to_method( paramName, genericTypeName )
{
    set_param_reference_from_name_or_throw( paramName );

    if ( is_name_the_super_generic_type( genericTypeName ) )
        set_constraint_generic_type_to_reference_super_generic_type();
    else if ( is_name_the_method_generic_type( genericTypeName ) )
        set_generic_type_to_reference_to_method_generic_type( genericTypeName );
    else if ( is_normal_type( genericTypeName ) )
        set_genetic_type_to_actual_type( reference_to( genericTypeName ) );
    else
        throw new SyntaxError( `Don't know what to do with "${paramName} is ${genericTypeName}"` );


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
