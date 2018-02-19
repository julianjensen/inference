/** ******************************************************************************************************************
 * @file Basic declaration symbols not including primitives.
 * @author Julian Jensen <jjdanois@gmail.com>
 * @since 1.0.0
 * @date 17-Feb-2018
 *********************************************************************************************************************/
"use strict";

const { isArray: array } = Array;

export const
    realm = {
        global:    null,
        topObject: null,
        funcProto: null
    };

const
    DEBUG = true,
    log = ( ...args ) => DEBUG && console.log( ...args );

const
    symCall = Symbol( 'call' ),
    symCons = Symbol( 'construct' ),
    additionalTypes = new Map(),
    is_primitive = str => [ 'null', 'undefined', 'string', 'number', 'boolean', 'symbol', 'any' ].includes( str ),
    NamedDeclaration = ( name, cls ) => ( { [ name ]: class extends cls {} } )[ name ];

const
    /**
     * @enum
     */
    Match = {
        NO:       0,
        UNLIKELY: 1,
        MAYBE:    2,
        PROBABLY: 3,
        YES:      4
    };

/**
 * @class
 */
class ObjectDeclaration
{
    /**
     * @param {?ObjectDeclaration} [declarationPrototype=null]
     * @param {?ObjectDeclaration} [instancePrototype=null]
     */
    constructor( declarationPrototype = null, instancePrototype = null )
    {
        // if ( members instanceof ObjectDeclaration )
        //     return this.copy( members );

        /** @type {Map<string, ObjectDeclaration|Type>|ObjectDeclaration} */
        this.members = new Map();
        this.parent = declarationPrototype;
        this.instancePrototype = instancePrototype;

        this.type = null;
        this.typeParameters = [];
        this.name = this.constructor.name;
        this.readOnly = false;
        this.declNode = null;
        this.default = void 0;
        this.generalType = 'none';
        this.isCallable = false;
        this.elementType = void 0;
        this.optional = false;
        this.isPrimitive = false;

        log( `Constructing "${this.constructor.name}", boxed? ${is_primitive( this.constructor.name.toLowerCase())}` );
    }

    is_boxed_primitive()
    {
        return is_primitive( this.constructor.name.toLowerCase() );
    }

    /**
     * Copy constructor
     *
     * Caution: This copy shares structure with the source object and will interfere. It is
     * assumed that the source will be destroyed after this copy. It's meant as an upgrade.
     *
     * @param {ObjectDeclaration} other
     */
    copy( other )
    {
        Object.assign( this, other );
        return this;
    }

    general_type( str )
    {
        if ( !str ) return this.generalType;
        this.generalType = str;
        return this;
    }

    initializer( expr )
    {
        if ( !expr ) return this.default;

        this.default = expr;
        return this;
    }

    /**
     * @param {Node} node
     * @return {ObjectDeclaration}
     */
    decl_node( node )
    {
        this.declNode = node;
        return this;
    }

    /**
     * @param {?string} str
     * @return {ObjectDeclaration}
     */
    named( str )
    {
        if ( str ) this.name = str;
        return this;
    }

    /**
     * @param {string} name
     * @param {ObjectDeclaration|Type} od
     * @return {ObjectDeclaration}
     */
    add( name, od )
    {
        log( `Adding ${name} (${od && od.constructor.name}) to ${this.name} (${this.constructor.name})` );

        if ( od.is_boxed_primitive() )
        {
            const t = od;
            od = new ObjectDeclaration( null, od.instancePrototype, null ).named( name );
            od.type = t;
            od.isPrimitive = true;
        }

        this.members.set( name, od );

        return od;
    }

    /**
     * @param {string} name
     * @return {boolean}
     */
    has( name )
    {
        if ( this.members && this.members.has( name ) ) return true;

        if ( this.parent )
            return this.parent.has( name );

        return false;
    }

    /**
     * @param {string} name
     * @return {?(ObjectDeclaration|Type)}
     */
    get( name )
    {
        if ( this.members.has( name ) )
            return this.members.get( name );

        if ( this.parent )
            return this.parent.get( name );

        return void 0;
    }

    chain()
    {
        return [ this.constructor, ...( this.parent ? this.parent.chain() : [] ) ];
    }

    /**
     * @param {TypeParameter|TypeReference|Array<TypeParameter|TypeReference>} types
     * @return {ObjectDeclaration}
     */
    add_types( types )
    {
        this.typeParameters = this.typeParameters.concat( types );
        return this;
    }

    named_declaration( name )
    {
        return { [ name ]: class extends this.constructor {} }[ name ];
    }

    /**
     * @return {ObjectDeclaration}
     */
    instance()
    {
        // if ( !this.chain().includes( context.get( 'Function' ) ) )
        if ( this instanceof context.get( 'Function' ) )
            throw new TypeError( `Cannot create an instance of "${this.name}", it is not callable` );

        if ( !this.instancePrototype )
            throw new TypeError( `Cannot create an instance of "${this.name}", it is not a constructor` );

        const
            Constructor = this.constructor,
            inst = new Constructor( new Map(), this.instancePrototype, null );

        inst.parent.constructor = Constructor;

        return inst;
    }

    is_instance_of( p )
    {
        if ( !p ) return false;

        if ( !this.instancePrototype )
            throw new TypeError( `The source object "${this.name || 'anonymous'}" is not an instance` );

        return this instanceof p;
    }

    /**
     * @param {string} [indent='']
     * @returns {string}
     */
    asString( indent = '' )
    {
        let output = [];

        if ( [ 'var', 'let', 'const' ].includes( this.generalType ) )
        {
            const
                init = this.default ? ` = ${this.default}` : '';

            output.push( `declare ${this.generalType} ${this.name}: ${this.type}${init};` );
        }
        else if ( this.generalType === 'property' )
            output.push( `${this.readOnly ? 'readonly ' : ''}${this.name || 'anonymous'}: ${this.type}` );
        else
            output.push( `name: ${this.name}, constructor: ${this.constructor.name}` );

        output[ output.length - 1 ] = `${indent}${output[ output.length - 1 ]}`;

        if ( this.members && this.members.size )
            output = output.concat( [ ...this.members.values() ].map( m => m.asString( indent + '    ' ) ) );

        return output.join( '\n' );
    }

    /**
     * @return {string}
     */
    toString()
    {
        if ( this.is_boxed_primitive() ) return this.constructor.name.toLowerCase();

        return this.asString();
        // if ( [ 'var', 'let', 'const' ].includes( this.generalType ) )
        // {
        //     const
        //         init = this.default ? ` = ${this.default}` : '';
        //
        //     return `declare ${this.generalType} ${this.name}: ${this.type}${init};`;
        // }
        // else if ( this.generalType === 'property' )
        //     return `${this.readOnly ? 'readonly ' : ''}${this.name || 'anonymous'}: ${this.type}`;
        // else
        //     return `name: ${this.name}, constructor: ${this.constructor.name}`;
        //
        // // return "no definition";
    }

    count()
    {
        return this.members ? this.members.size : 0;
    }
}

// /**
//  * @param {string} name
//  * @param {Map<string, ObjectDeclaration|Type>|ObjectDeclaration} members
//  * @param {?ObjectDeclaration} [declarationPrototype=null]
//  * @param {?ObjectDeclaration} [instancePrototype=null]
//  */
// function named_object_declaration( name, members, declarationPrototype = null, instancePrototype = null )
// {
//     const
//         trick = {
//             [ name ]: class extends ObjectDeclaration {}
//         };
//
//     return new trick[ name ]( members, declarationPrototype, instancePrototype );
// }
//

/**
 * @class
 */
class ClassDeclaration extends ObjectDeclaration
{
    /**
     * @param {Map<string, ObjectDeclaration>} members
     * @param {?ObjectDeclaration} [declarationPrototype=null]
     * @param {?ObjectDeclaration} [instancePrototype=null]
     */
    constructor( members, declarationPrototype = null, instancePrototype = null )
    {
        // members represent overloaded varieties
        super( members, declarationPrototype, instancePrototype );
        this.isCallable = !!this.members && this.members.has( symCall );
    }

    /**
     * @param {string|symbol} key
     * @param {ObjectDeclaration} od
     * @return {ClassDeclaration}
     */
    add_overload( key, od )
    {
        const cs = this.members.get( key );

        if ( !cs )
            this.members.set( key, [ od ] );
        else if ( !array( cs ) )
            this.members.set( key, [ cs, od ] );
        else
            cs.push( od );

        return this;
    }

    /**
     * @param {CallableDeclaration} od
     * @return {ClassDeclaration}
     */
    add_constructor( od )
    {
        return this.add_overload( symCons, od );
    }

    /**
     * @param {CallableDeclaration} od
     * @return {ClassDeclaration}
     */
    add_call( od )
    {
        this.isCallable = true;
        return this.add_overload( symCall, od );
    }

    /**
     * @param {string} name
     * @param {CallableDeclaration} od
     * @return {ClassDeclaration}
     */
    add_method( name, od )
    {
        return this.add_overload( name, od );
    }

}

/**
 * @class
 */
class CallableDeclaration extends ObjectDeclaration
{
    /**
     * @param {Map<string, ObjectDeclaration>} members
     * @param {?ObjectDeclaration} [declarationPrototype=null]
     * @param {?ObjectDeclaration} [instancePrototype=null]
     */
    constructor( members, declarationPrototype = null, instancePrototype = null )
    {
        // members represent overloaded varieties
        super( members, declarationPrototype, instancePrototype );
        this.params = [];
        this.isCallable = true;
    }

    /**
     * @param {Array<ObjectDeclaration>} params
     * @return {CallableDeclaration}
     */
    add_params( params )
    {
        this.params = this.params.concat( params );
        return this;
    }
}

/**
 * @class
 */
export class MethodDeclaration extends CallableDeclaration {}

/**
 * @class
 */
export class ArrowFunctionDeclaration extends CallableDeclaration {}

/**
 * @class
 */
export class ConstructorDeclaration extends CallableDeclaration {}

/**
 * @class
 */
export class FunctionDeclaration extends CallableDeclaration {}

/** **************************************************************************************************************************
 *
 * DEFINITIONS
 *
 *****************************************************************************************************************************/

const
    globalEnvironmentRecord = realm.global = new ObjectDeclaration( new Map(), null, null ).named( 'global' );

const
    CONSTRUCTOR   = 'Constructor',
    CONSTR_LENGTH = CONSTRUCTOR.length,
    /** @type {Array<ObjectDeclaration>} */
    bases         = [ globalEnvironmentRecord ];

Object.defineProperty( bases, 'top', {
    enumerable: false,
    get()
    {
        return this.length ? this[ this.length - 1 ] : void 0;
    }
} );


export const context        = {
           current( base )
           {
               if ( !base ) return bases.top;
               bases.push( base );
               return base;
           },
           get top() {
               return this.current();
           },
           set top( od ) {
               bases.push( od );
               return od;
           },
           pop()
           {
               if ( bases.length > 1 )
                   return bases.pop();

               return void 0;
           },
           add( name, decl )
           {
               return bases.top.add( name, decl ).named( name );
           },
           global( name, decl )
           {
               if ( !name ) return globalEnvironmentRecord;

               bases[ 0 ].add( name, decl );
               return decl;
           },
           get( id )
           {
               let i = bases.length - 1,
                   od;

               while ( i > -1 && !od )
               {
                   od = bases[ i ].get( id );
                   --i;
               }

               return od;
           }
       };

/**
 * CREATE TOP BASE FINAL OBJECT AKA Object.prototype
 * topObject = PlainObjectDeclaration( Object.members, null, null )
 */
realm.topObject = new ObjectDeclaration( new Map(), null, null );

/**
 * CREATE Function.prototype
 * func = PlainObjectDeclaration( Function.members, topObject, null )
 */
realm.funcProto = new ObjectDeclaration( new Map(), realm.topObject, null );

/**
 * CREATE Function
 * Function = PlainObjectDeclaration( FunctionConstructor.members, topObject, func )
 */
context.global().add( 'Function', new ( NamedDeclaration( 'Function', ClassDeclaration ) )( new Map(), realm.topObject, realm.funcProto ) );


/**
 * CREATE OBJECT
 * Object = PlainObjectDeclaration( ObjectConstructor.members, func, topObject )
 */
context.global().add( 'Object', new ( NamedDeclaration( 'Object', ClassDeclaration ) )( new Map(), realm.funcProto, realm.topObject ) );

context.global().add( 'Array', new ( NamedDeclaration( 'Array', ClassDeclaration ) )( new Map(), realm.funcProto, new ObjectDeclaration( new Map(), realm.topObject, null ) ) );

context.global().add( 'Number', new ( NamedDeclaration( 'Number', ClassDeclaration ) )( new Map(), context.get( 'Function' ).instance(), new ObjectDeclaration( new Map(), realm.topObject, null ) ) );

context.global().add( 'String', new ( NamedDeclaration( 'String', ClassDeclaration ) )( new Map(), realm.funcProto, new ObjectDeclaration( new Map(), realm.topObject, null ) ) );
context.global().add( 'Boolean', new ( NamedDeclaration( 'Boolean', ClassDeclaration ) )( new Map(), realm.funcProto, new ObjectDeclaration( new Map(), realm.topObject, null ) ) );
context.global().add( 'Symbol', new ( NamedDeclaration( 'Symbol', ClassDeclaration ) )( new Map(), realm.funcProto, new ObjectDeclaration( new Map(), realm.topObject, null ) ) );
context.global().add( 'undefined', new ( NamedDeclaration( 'undefined', ObjectDeclaration ) )( null, null, null ) );
context.global().add( 'null', new ( NamedDeclaration( 'null', ObjectDeclaration ) )( null, null, null ) );
context.global().add( 'Any', new ( NamedDeclaration( 'Any', ClassDeclaration ) )( null, realm.topObject, null ) );

/**
 * CREATE String
 * string = PlainObjectDeclaration( String.members, topObject, null )
 * String = PlainObjectDeclaration( StringConstructor.members, Function.proto, string )
 *
 * CREATE Array
 * array = PlainObjectDeclaration( Array.members, topObject, null )
 * Array = PlainObjectDeclaration( ArrayConstructor.members, Function.proto, array )
 *
 * if ( non-constructor object )
 *      constr = get( Name )
 *      if ( constr )
 *          constr.proto = PlainObjectDeclaration( Name.members, topObject, null )
 *      else
 *          add( Name, PlainObjectDeclaration( Name.members, topObject, null ) )
 * else
 *      remove "Constructor" from Name
 *      proto = get( Name )
 *      if ( proto )
 *          replace( Name, PlainObjectDeclaration( NameConstructor.members, Function.proto, proto ) )
 *      else
 *          add( Name, PlainObjectDeclaration( NameConstructor.members, Function.proto, null ) )
 *
 *
 * String
 *      parent: Function
 *      proto: {
 *          parent: topObject
 *          constructor: String
 *          [String.members]
 *      }
 *      [StringConstructor.members]
 *
 * @param {string} name
 */
export function parser_create_interface( name )
{
    let members = Map();

    if ( name.endsWith( CONSTRUCTOR ) )
    {
        name = name.substring( 0, name.length - CONSTR_LENGTH );

        return context.current().add( name, new ( NamedDeclaration( name, ClassDeclaration ) )( members, realm.funcProto, context.get( name ) ).named( name ) );
    }
    else
    {
        const
            p    = context.current().add( name, new ( NamedDeclaration( name, ObjectDeclaration ) )( members, realm.topObject, null ).named( name ) ),
            cons = context.get( name );

        if ( cons ) cons.proto = p;

        return p;
    }
}

/**
 * @param {string} name
 */
export function parser_create_object( name )
{
    return context.current().add( name, new ( NamedDeclaration( name, ObjectDeclaration ) )( new Map(), realm.topObject, null ).named( name ) );
}

/**
 * @param {string} name
 */
export function parser_create_callable( name )
{
    return context.current().add( name, new ( NamedDeclaration( name, CallableDeclaration ) )( new Map(), realm.topObject, null ).named( name ) );
}

/**
 * @return {ConstructorDeclaration}
 */
export function create_constructor()
{
    const
        cd = new ConstructorDeclaration( null, realm.funcProto, null );

    context.current().add_constructor( cd );

    return cd;
}

/**
 * @param {string} name
 * @param {string} type
 * @return {ObjectDeclaration}
 */
export function parser_create_function( name, type )
{
    let members = Map(),
        Decl;

    switch ( type )
    {
        case 'function':
            Decl = FunctionDeclaration;
            break;

        case 'class':
            Decl = ClassDeclaration;
            break;

        case 'method':
            Decl = MethodDeclaration;
            break;

        case 'arrow':
            Decl = ArrowFunctionDeclaration;
            break;
    }

    return context.current().add( name, new ( NamedDeclaration( name, Decl ) )( members, realm.funcProto, new ObjectDeclaration( new Map(), null, realm.topObject ) ).named( name ) );
}

/**
 * @class
 */
class TypeAlias
{
    /**
     * @param {string} name
     * @param {?(TypeParameter|TypeParameter[])} typeParams
     * @param {BaseType} [underlying]
     */
    constructor( name, typeParams, underlying )
    {
        this.name = name;
        this.typeParameters = typeParams;
        this.underlying = underlying;
    }

    /**
     * @return {string}
     */
    toString()
    {
        return this.underlying ? this.underlying.toString() : '';
    }
}

/**
 * @param {string} name
 * @param {?(TypeParameter|Array<TypeParameter>)} tp
 * @param {string} kind
 * @return {TypeAlias}
 */
export function create_type_alias( name, tp, kind )
{
    let t;

    switch ( kind )
    {
        case 'method':
        case 'arrow':
        case 'class':
        case 'function':
            t = parser_create_function( name, kind );
            if ( tp ) t.add_types( t );
            break;

        case 'object':
            t = parser_create_object( name );
            if ( tp ) t.add_types( tp );
            break;

        case 'typedef':
            break;

        default:
            if ( additionalTypes.has( kind ) )
                t = additionalTypes.get( name );
            else if ( is_primitive( kind ) )
                t = get_type( kind );
            else
                context.get( kind );
            break;
    }

    let r;

    additionalTypes.set( name, r = new TypeAlias( name, tp, t ) );

    return r;
}

/**
 * @param {string} typeName
 * @return {*}
 */
export function get_type( typeName )
{
    switch ( typeName.replace( /\s+/g, '' ).toLowerCase() )
    {
        case 'class{}':
        case 'class':
            return context.get( 'Function' );

        case '()':
        case 'function':
        case 'function()':
        case '(){}':
            return context.get( 'Function' );

        case 'namespace':
        case '{}':
        case 'object':
            return context.get( 'Object' );

        case 'arraytype':
        case '[]':
        case 'array':
            return context.get( 'Array' );

        case 'nullkeyword':
        case 'null':
        case null:
            return context.get( 'null' );

        case 'voidkeyword':
        case 'undefinedkeyword':
        case 'undefined':
        case undefined:
            return context.get( 'undefined' );

        case '""':
        case "''":
        case "``":
        case 'string':
            return context.get( 'String' );

        case 'numberkeyword':
        case 'number':
            return context.get( 'Number' );

        case 'booleankeyword':
        case 'boolean':
            return context.get( 'Boolean' );

        case 'symbol':
            return context.get( 'Symbol' );

        case 'anykeyword':
        case 'any':
        case '*':
            return context.get( 'Any' );
    }
}

context.current().add( 'NaN', context.get( 'Number' ).instance() );

console.log( bases[ 0 ].toString() );
