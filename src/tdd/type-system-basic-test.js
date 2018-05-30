/** ******************************************************************************************************************
 * @file Describe what type-system-basic-test does.
 * @author Julian Jensen <jjdanois@gmail.com>
 * @since 1.0.0
 * @date 27-May-2018
 *********************************************************************************************************************/

"use strict";

import { type }        from 'typeofs';
import { SymbolFlags } from "../types";

const
    string = o => type( o ) === 'string',
    object = o => type( o ) === 'object',
    number = o => type( o ) === 'number',
    primitives = new Map(),
    keys = o => Object.keys( o ),
    danger = new Set( keys( Object ).concat( keys( {} ) ).concat( keys( function() {} ) ).concat( keys( Function ) ) ),
    escapeId = s => danger.has( s ) ? `__${s}` : s;


/**
 * @param {string} prefix
 * @return {string}
 */
function anon( prefix )
{
    return prefix + '$' + ( Math.random() * 1e7 | 0 );
}

/** */
class Scope
{
    /**
     * @param {Type} definedBy
     * @param {Scope} parent
     */
    constructor( definedBy = null, parent = null )
    {
        this.symbolTable = new Map();
        this.parent = parent;
        this.children = new Map();
        this.definedBy = definedBy;
    }

    /** @type {number} */
    get size()
    {
        return this.symbolTable.size;
    }

    /** */
    clear()
    {
        for ( const c of this.children.values() )
            c.clear();

        this.symbolTable.clear();
        this.children.clear();

        this.symbolTable = this.parent = this.children = this.definedBy = void 0;
    }

    /**
     * @param {string} name
     * @return {Type|Identifier}
     */
    get( name )
    {
        const _name = escapeId( name );

        if ( this.symbolTable.has( _name ) ) return this.symbolTable.get( _name );

        if ( this.parent ) return this.parent.get( name );

        return null;
    }

    /**
     * @param {string} name
     * @return {Symbol|Type|undefined}
     */
    own( name )
    {
        return this.symbolTable.get( escapeId( name ) );
    }

    /**
     * @param {string} name
     * @return {boolean}
     */
    has( name )
    {
        if ( this.symbolTable.has( escapeId( name ) ) ) return true;

        if ( this.parent ) return this.parent.has( name );

        return false;
    }

    /**
     * @param {string} name
     * @param {Identifier|Type} payload
     * @return {Scope}
     */
    add( name, payload )
    {
        this.symbolTable.set( escapeId( name ), payload );

        return this;
    }

    /**
     * @param {object} def
     * @return {Scope}
     */
    add_child( def )
    {
        this.children.set( def, new Scope( def, this ) );
        return this;
    }

    /**
     * @param {object} def
     * @return {boolean}
     */
    has_child( def )
    {
        return this.children.has( def );
    }

    /**
     * @return {IterableIterator<IterableIterator<Scope>>}
     */
    *[Symbol.iterator]()
    {
        yield *this.children.values();
    }

    /**
     * @return {IterableIterator<Type|Symbol>}
     */
    *deep()
    {
        yield *this.symbolTable.values();

        for ( const c of this )
            yield *c.deep();
    }
}

/** */
export class ScopeManager
{
    /** */
    static init()
    {
        /** @type {Scope} */
        ScopeManager.current = ScopeManager.global = new Scope();
        ScopeManager.direct = new Map();
        [ 'any', 'never', 'undefined', 'void', 'number', 'string', 'boolean', 'symbol', 'null' ].forEach( tid => create_type( 'primitive', tid ) );
    }

    /** */
    static reset()
    {
        ScopeManager.global.clear();
        ScopeManager.init();
    }

    /**
     * @param {string} name
     * @param {object} payload
     * @return {ScopeManager}
     */
    static add_symbol( name, payload )
    {
        ScopeManager.current.add( name, payload );

        return ScopeManager;
    }

    /**
     * @param {string} name
     * @return {object}
     */
    static get_symbol( name )
    {
        return ScopeManager.current.get( name );
    }

    /**
     * @param {Type} definer
     * @return {Scope}
     */
    static create( definer )
    {
        if ( ScopeManager.direct.has( definer ) ) return ScopeManager.direct.get( definer );

        const scope = ScopeManager.current.add_child( definer );

        ScopeManager.direct.set( definer, scope );

        return scope;
    }

    /**
     * @return {ScopeManager}
     */
    static up()
    {
        if ( ScopeManager.current.parent ) ScopeManager.current = ScopeManager.current.parent;

        return ScopeManager;
    }

    /**
     * @param {Type} definer
     * @return {?ScopeManager}
     */
    static enter( definer )
    {
        if ( ScopeManager.current.definedBy === definer ) return ScopeManager;

        if ( ScopeManager.direct.has( definer ) )
        {
            ScopeManager.current = ScopeManager.direct.get( definer );
            return ScopeManager;
        }

        return null;
    }

    /**
     * @param {Type} definer
     * @return {ScopeManager}
     */
    static in( definer )
    {
        if ( !definer )
            ScopeManager.current = ScopeManager.global;
        else if ( ScopeManager.direct.has( definer ) )
            ScopeManager.current = ScopeManager.direct.get( definer );
        else if ( !ScopeManager.enter( definer ) )
            ScopeManager.create( definer ).enter( definer );

        return ScopeManager;
    }

    /**
     * @return {IterableIterator<IterableIterator<Type>>}
     */
    static *[ Symbol.iterator ]()
    {
        yield *ScopeManager.current.symbolTable.values();
    }

    /**
     * @return {IterableIterator<IterableIterator<Type>>}
     */
    static *deep()
    {
        yield *ScopeManager;

        for ( const scope of ScopeManager.current.children.values() )
            yield *scope.deep();
    }

    /**
     * @param {string} name
     * @return {boolean}
     */
    static has( name )
    {
        return ScopeManager.current.has( name );
    }
}


/** */
export class Type
{
    /**
     * @param {string} name
     */
    constructor( name )
    {
        this.name = name;
        this.parent = null;
    }

    /**
     * @param {any} t
     * @return {boolean}
     */
    isType( t )
    {
        if ( !t ) return true;

        if ( typeof t === 'function' )
        {
            let type = t;

            while ( type && type !== Object )
            {
                if ( type === Type ) return true;

                type = Object.getPrototypeOf( type );
            }

            return false;
        }

        return t instanceof Type;
    }

    /**
     * @param t
     * @return {boolean}
     */
    is( t )
    {
        return this.isType( t );
    }

    /**
     * @param {Type} t
     * @return {boolean}
     */
    invariant( t )
    {
        return this.constructor === t.constructor;
    }

    /**
     * @return {boolean}
     */
    hasMembers()
    {
        return !!this.members && this.members instanceof Map && this.members.size !== 0;
    }

    /**
     * @return {Type}
     */
    add_scope()
    {
        ScopeManager.create( this ).enter( this );

        return this;
    }

    /**
     * @param {string} name
     * @param {object} payload
     * @return {Type}
     */
    add_symbol( name, payload )
    {
        ScopeManager.in( this ).add_symbol( name, payload );

        return this;
    }
}

/** */
export class Undef extends Type
{
    /**
     * @param {string} name
     */
    constructor( name )
    {
        super( name );

        this.refs = [];
    }

    /**
     * @param {Type|Identifier} type
     */
    add_ref( type )
    {
        if ( !this.refs.includes( type ) )
            this.refs.push( type );
    }
}

/** */
export class TypeReference extends Type
{
    /**
     * @param {string} name
     * @param {Type} [target=null]
     */
    constructor( name, target = null )
    {
        super( name );
        this.typeArguments = [];
        if ( target ) this.add_target( target );
    }

    /**
     * @param {Type} type
     */
    add_target( type )
    {
        this.ref = type;

        if ( type instanceof Undef )
            type.add_ref( this );
    }

    /**
     * @param {string[]} typeArgs
     */
    add_type_args( ...typeArgs )
    {
        this.typeArguments = typeArgs.slice();
    }
}

/** */
export class Interface extends Type
{
    /**
     * @param {string} name
     */
    constructor( name )
    {
        super( name );
        this.isContainer = true;
        /** @type {Scope} */
        this.members = ScopeManager.create( this );
    }

    /**
     * @return {boolean}
     * @override
     */
    hasMembers()
    {
        return this.members.size !== 0;
    }

    /**
     * @return {number}
     */
    get numMembers()
    {
        return this.members.size;
    }

    /**
     * @param {string} type
     * @param {object} def
     * @param {string} [name]
     */
    add_member( type, def, name )
    {
        let func, sym;

        switch ( type )
        {
            case 'constructor':
                /** @type {Signature} */
                func = create_type( 'signature', anon( 'constructor$' + this.name ) );
                func.isConstructor = true;
                /* falls through */
            case 'callable':
                if ( !func )
                {
                    func = create_type( 'signature', anon( 'call$' + this.name ) );
                    func.isCallable = true;
                }

                if ( def.parameters )
                {
                    def.parameters.forEach( p => {
                        const opts = {
                            optional: !!p.optional,
                            rest: !!p.rest
                        },
                        sym = new Identifier( p.name, type_def( p ), opts );

                        func.add_parameter( p.name, sym );
                    } );
                }

                if ( def.type )
                    func.add_type( type_def( def.type ) );

                this.members.add( func.name, func );
                func.parent = this;
                return func;

            case 'property':
                sym = new Identifier( name, type_def( def.type || def ), { optional: !!def.optional } );
                this.members.add( name, sym );
                sym.parent = this;
                break;

            case 'method':
                break;
        }
    }

    /**
     * @param {string} name
     * @return {Symbol|Type}
     */
    own( name )
    {
        return this.members.own( name );
    }

    /**
     * @param {string} name
     * @return {Type|Identifier}
     */
    get( name )
    {
        return this.members.get( name );
    }

    /** @type {number} */
    get numSignatures()
    {
        return this.signatures.length;
    }

    /** @type {number} */
    get numConstructors()
    {
        return this.constructors.length;
    }

    /** @type {number} */
    get numCallables()
    {
        return this.callables.length;
    }

    /** @type {Type[]} */
    get signatures()
    {
        return [ ...this.members.values() ].filter( t => t.isType( Signature ) );
    }

    /** @type {Type[]} */
    get constructors()
    {
        return [ ...this.members.values() ].filter( t => t.isType( Signature ) && t.isConstructor );
    }

    /** @type {Type[]} */
    get callables()
    {
        return [ ...this.members.values() ].filter( t => t.isType( Signature ) && t.isCallable );
    }
}

/** */
export class Primitive extends Type {}

/** */
export class Identifier
{
    /**
     * @param {string} name
     * @param {Type} type
     * @param {object} opts
     */
    constructor( name, type, opts )
    {
        this.name = name;
        this.type = type;

        this.optional = !!opts.optional;
        this.rest = !!opts.rest;
        this.parent = null;
    }
}

/** */
export class Signature extends Type
{
    /**
     * @param {string} [name]
     */
    constructor( name = anon( 'signature' ) )
    {
        super( name );
        this.isConstructor = false;
        this.isCallable = false;
        this.parameters = [];
        this.type = null;
        this.pnames = {};
    }

    /**
     * @param {string} name
     * @param {Identifier} sym
     * @param {object} opts
     * @return {Signature}
     */
    add_parameter( name, sym )
    {
        this.pnames[ name ] = this.parameters.length;
        this.pnames[ this.parameters.length ] = name;
        this.parameters.push( sym );

        return this;
    }

    /**
     * @param {number|string} nameOrIndex
     * @return {Type}
     */
    param_by( nameOrIndex )
    {
        if ( number( nameOrIndex ) )
            return this.parameters[ nameOrIndex ];

        return this.parameters[ this.pnames[ nameOrIndex ] ];
    }

    /**
     * @param {Type} type
     * @return {Signature}
     */
    add_type( type )
    {
        this.type = type;

        return this;
    }
}

/**
 * @param {object} obj
 * @return {*}
 */
export function type_def( obj )
{
    if ( string( obj ) )
        obj = { type: obj };

    if ( string( obj.type ) )
    {
        if ( obj.type === 'reference' )
        {
            const
                refName = object( obj.typeName ) ? obj.typeName.name : obj.typeName,
                t = get_type( refName, false ),
                ref = new TypeReference( 'ref$' + refName, t );

            if ( obj.typeArguments )
                ref.add_type_args( ...obj.typeArguments.map( ta => string( ta ) || ta.typeName ) );

            return ref;
        }
        else if ( primitives.has( obj.type ) )
            return primitives.get( obj.type );
        else if ( ScopeManager.has( obj.type ) )
            return ScopeManager.get( obj.type );

        throw new SyntaxError( `Unknown type reference "${obj.type}"` );
    }

    if ( !string( obj.typeName ) )
        throw new SyntaxError( `Unknown type "${JSON.stringify( obj.typeName, null, 4 )}"` );

    return get_type( obj.typeName );


}

/**
 * @param {string} typeName
 * @param {object} typeIdentifier
 * @param {Type} [parent]
 * @return {T}
 */
export function create_type( typeName, typeIdentifier, parent = null )
{
    let t;

    switch ( typeName )
    {
        case 'primitive':
            if ( primitives.has( typeName ) ) return primitives.get( typeName );

            t = new Primitive( typeIdentifier );

            primitives.set( typeIdentifier, t );

            return t;

        case 'interface':
            t = new Interface( typeIdentifier );
            ScopeManager.add_symbol( typeIdentifier, t );
            return t;

        case 'signature':
            t = new Signature( typeIdentifier );
            ScopeManager.in( parent ).add_symbol( typeIdentifier, t );
            return t;

    }
}

/**
 * @param {string} name
 * @param {boolean} [required]
 * @return {Type}
 */
export function get_type( name, required = true )
{
    if ( primitives.has( name ) )
        return primitives.get( name );
    else if ( ScopeManager.has( name ) )
        return ScopeManager.get( name );

    if ( required )
        throw new ReferenceError( `Unknown type "${name}"` );

    const t = new Undef( name );
    ScopeManager.add_symbol( name, t );

    return t;
}

/**
 * @return {(Type|Identifier)[]}
 */
export function get_undefs()
{
    return [ ...ScopeManager.deep() ].filter( t => !t.isType( Undef ) );
}

ScopeManager.init();
// [ 'any', 'never', 'undefined', 'void', 'number', 'string', 'boolean', 'symbol', 'null' ].forEach( tid => create_type( 'primitive', tid ) );
