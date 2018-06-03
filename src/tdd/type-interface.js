/** ****************************************************************************
 * DESCRIPTION
 * @author julian.jensen
 * @since 0.0.1
 *******************************************************************************/
"use strict";

import { Type } from "./type-base";
import { ScopeManager } from "./scopes";
import { anon, create_type, definition, register, type_def } from "./type-utils";

const
    CONSTRUCTORS = Symbol( 'constructors' ),
    CALLABLES = Symbol( 'callables' );

let Identifier, Signature, CallableType;

/** */
class ObjectBasedType extends Type
{
    /**
     * @param {string} name
     * @param {Scope} [scope]
     */
    constructor( name, scope = ScopeManager.global )
    {
        super( name, scope );
        if ( !Identifier ) Identifier = definition( 'Identifier' );
        if ( !Signature ) Signature = definition( 'Signature' );
        if ( !CallableType ) CallableType = definition( 'CallableType' );
        this.isContainer = true;
        /** @type {?CallableType} */
        this.constructors = null;
        /** @type {?CallableType} */
        this.callables = null;
        /** @type {Scope} */
        this.inner = this.members = scope.from( this );

        this.index = [];
    }

    toString()
    {
        return this.members.size < 2 ? `{ ${this.members.map( t => `${t}` )} }` : `{ ${this.members.map( t => `${t}` ).join( '; ' )} }`;
    }

    /**
     * @param {Identifier} keyIdent
     * @param {Type} contentType
     * @return {ObjectBasedType}
     */
    add_index( keyIdent, contentType )
    {
        this.index.push( {
            key: keyIdent,
            type: contentType
        } );

        return this;
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

    auto_member( def )
    {
        const
            type = def.name === 'New' && def.flags === 'Signature' ? 'constructor' :
                   def.name === 'Call' && def.flags === 'Signature' ? 'callable' :
                   def.flags === 'Method' ? 'method' :
                   def.flags === 'Property' ? 'property' : 'unknown',
            name = def.name;

        def.decls.forEach( decl => this.add_member( type, decl, name ) );
    }

    /**
     * @param {string} type
     * @param {object} def
     * @param {string} [name]
     */
    add_member( type, def, name )
    {
        let func, sym, call;

        // console.log( `add_member to "${this.constructor.name}", type: ${type}, name: "${name}"` );

        switch ( type )
        {
            case 'constructor':
                call = this.constructors || ( this.constructors = new CallableType( CONSTRUCTORS, this.members ) );

                /** @type {Signature|Type} */
                func = create_type( 'signature', anon( 'constructor$' + this.name ) );
                call.isConstructor = true;
            /* falls through */
            case 'method':
                if ( !func )
                {
                    if ( !this.members.has( name ) )
                        call = this.members.add( new CallableType( name, this.members ) );
                    else
                        call = this.members.get( name );

                    func = create_type( 'signature', name );
                    call.isMethod = true;
                }
            /* falls through */
            case 'callable':
                if ( !func )
                {
                    call = this.callables || ( this.callables = new CallableType( CALLABLES, this.members ) );

                    func = create_type( 'signature', anon( 'call$' + this.name ) );
                    call.isCallable = true;
                }

                if ( def.parameters )
                {
                    if ( !call.inner )
                        call.create_local_scope();

                    console.log( `params add, has inner? ${!!call.inner}` );
                    def.parameters.forEach( p => {
                        const opts = {
                                  optional: !!p.optional,
                                  rest: !!p.rest
                              },
                              sym = new Identifier( p.name, type_def( p, call.inner ), opts );

                        func.add_parameter( p.name, sym );
                    } );
                }

                if ( def.type )
                    func.add_type( type_def( def.type ) );

                call.add_signature( func );
                // this.members.add( func );
                call.parent = func.parent = this;
                return func;

            case 'property':
                sym = new Identifier( name, type_def( def.type || def ), { optional: !!def.optional } );
                this.members.add( sym );
                sym.parent = this;
                break;

            case 'index':
                const _p = def.parameters[ 0 ];
                console.log( 'for index, content is:', def.typeName, ' and for index, key is:', _p.type );
                const
                    content = type_def( def.typeName );
                console.log( 'def.typeName:', def.typeName, ' -> content: ' + content );
                const
                    p = def.parameters[ 0 ];
                console.log( 'p: ', p );
                const
                    key = new Identifier( p.name, type_def( p.type ), {} );

                console.log( 'index param: ' + key );
                console.log( `[ ${key} ]: ${content.name}` );

                this.add_index( key, content );
                break;

            default:
                throw new Error( `Unknown member "${name}", type: "${type}", decl: ${JSON.stringify( def )}` );
        }
    }

    /**
     * @param {string} name
     * @return {Identifier|Type}
     */
    own( name )
    {
        return this.members.find( name, true );
    }

    /**
     * @param {string} name
     * @return {Type|Identifier}
     */
    get( name )
    {
        return this.members.find( name );
    }

    /** @type {number} */
    get numSignatures()
    {
        return this.signatures.length;
    }

    /** @type {number} */
    get numConstructors()
    {
        return this.constructors ? this.constructors.size : 0;
    }

    /** @type {number} */
    get numCallables()
    {
        return this.callables ? this.callables.size : 0;
    }

    /** @type {number} */
    get numMethods()
    {
        return this.methods.length;
    }

    /** @type {Type[]} */
    get signatures()
    {
        const tmp = [ ...this.members.forEach( Type ) ].filter( t => t.isType( CallableType ) );

        if ( this.constructors ) tmp.push( this.constructors );
        if ( this.callables ) tmp.push( this.callables );

        return tmp;
    }

    /** @type {Type[]} */
    get methods()
    {
        return [ ...this.members.forEach( Type ) ].filter( t => t.isType( CallableType ) && t.isMethod );
    }
}

/** */
export class Interface extends ObjectBasedType { toString() { return `interface ${this.name} super.toString()`; } }
/** */
export class TypeLiteral extends ObjectBasedType {}

register( Interface );
register( TypeLiteral );
