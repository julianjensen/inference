/** ******************************************************************************************************************
 * @file Basic declaration symbols not including primitives.
 * @author Julian Jensen <jjdanois@gmail.com>
 * @since 1.0.0
 * @date 17-Feb-2018
 *********************************************************************************************************************/

"use strict";

import { indent } from "../ts/ts-helpers";
import { output } from "../utils";

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
    NamedDeclaration = ( name, cls, proto ) => new ( { [ name ]: class extends cls {} }[ name ] )( proto ).named( name );

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

const
    CONSTRUCTOR   = 'Constructor',
    CONSTR_LENGTH = CONSTRUCTOR.length,
    /** @type {Array<ObjectDeclaration>} */
    bases         = [];

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
        if ( name && decl )
            return bases.top.add( name, decl ).named( name );
        else
            return bases.top.add( name.name, name );
    },
    global( name, decl )
    {
        if ( !name && !decl ) return bases[ 0 ];

        if ( name && decl )
            return bases[ 0 ].add( name, decl );
        else
            return bases[ 0 ].add( name.name, name );
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
 * @class ObjectDeclaration
 */
class ObjectDeclaration
{
    /**
     * @param {?ObjectDeclaration} [proto=null]
     * @param {boolean} [noProto=false]
     */
    constructor( proto = null, noProto = false )
    {
        // if ( members instanceof ObjectDeclaration )
        //     return this.copy( members );

        /** @type {Map<string, ObjectDeclaration|Type>|ObjectDeclaration} */
        this.members = new Map();
        this.parent = proto;
        this.instancePrototype = noProto ? null : realm.topObject;

        this.type = null;
        this.typeParameters = new Map();
        this.name = this.constructor.name;
        this.readOnly = false;
        this.declNode = null;
        this.default = void 0;
        this.generalType = 'none';
        this.isCallable = false;
        this.elementType = void 0;
        this.optional = false;
        this.isPrimitive = false;
        this.instanceOf = null;
        this.isType = false;    // @todo Figure this out
        this._owner = null;

        log( `Constructing "${this.constructor.name}", boxed? ${is_primitive( this.constructor.name.toLowerCase() )}` );
    }

    /**
     * @param {ObjectDeclaration} [od]
     * @return {ObjectDeclaration}
     */
    owner( od )
    {
        if ( !od ) return this._owner;
        this._owner = od;
        return this;
    }

    /**
     * @param {string} [name]
     * @return {ObjectDeclaration}
     */
    instance( name )
    {
        if ( this.name !== 'Function' && !this.chain().includes( context.get( 'Function' ).instancePrototype ) )
            throw new TypeError( `Cannot create an instance of "${this.name}", it is not callable` );

        if ( !this.instancePrototype )
            throw new TypeError( `Cannot create an instance of "${this.name}", it is not a constructor` );

        const
            Constructor = this.constructor,
            inst = new Constructor( this.instancePrototype, true );

        inst.parent.constructor = Constructor;
        inst.instanceOf = Constructor;

        return inst.named( name || 'anonymous' );
    }

    /**
     * @param {boolean} isOptional
     * @return {ObjectDeclaration}
     */
    set_optional( isOptional )
    {
        this.optional = isOptional;
        return this;
    }

    /**
     * @return {boolean}
     */
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
     * @param {string|ObjectDeclaration|Type} name
     * @param {ObjectDeclaration|Type} [od]
     * @return {ObjectDeclaration}
     */
    add( name, od )
    {
        if ( name && !od )
        {
            od = name;
            name = od.name;
        }

        log( `Adding ${name} (${od && od.constructor.name}) to ${this.name} (${this.constructor.name})` );
        od.named( name );

        // if ( od.is_boxed_primitive() )
        // {
        //     const t = od;
        //     od = new ObjectDeclaration( od.instancePrototype ).named( name );
        //     od.type = t;
        //     od.isPrimitive = true;
        // }

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
        else if ( this.instancePrototype && this.typeParameters.has( name ) ) return true;

        if ( this.parent )
            return this.parent.has( name );
        else if ( this.instancePrototype && this.owner )
            return this.owner.has( name );


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
        else if ( this.instancePrototype && this.typeParameters.has( name ) )
            return this.typeParameters.get( name );

        if ( this.parent )
            return this.parent.get( name );
        else if ( this.instancePrototype && this.owner )
            return this.owner.get( name );

        return void 0;
    }

    /**
     * @return {Array<ObjectDeclaration>}
     */
    chain()
    {
        return this.parent ? [ this.parent, ...( this.parent ? this.parent.chain() : [] ) ] : [];
    }

    /**
     * @param {TypeParameter|TypeReference|Array<TypeParameter|TypeReference>} types
     * @return {ObjectDeclaration}
     */
    add_types( types )
    {
        types = array( types ) ? types : [ types ];

        types.forEach( t => this.typeParameters.set( t.name, t ) );

        return this;
    }

    add_type( type )
    {
        this.type = type;
        return this;
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
            output.push( `${this.readOnly ? 'readonly ' : ''}${this.name || 'anonymous'}${this.optional ? '?' : ''}: ${this.type}` );
        else
            output.push( `name: ${this.name}, constructor: ${this.constructor.name}` );

        output[ output.length - 1 ] = `${indent}${output[ output.length - 1 ]}`;

        if ( this.members && this.members.size )
            output = output.concat( [ ...this.members.values() ].map( m => m.asString( indent + '    ' ) ) );

        return output.join( '\n' );
    }

    asType( indent )
    {
        return indent + this.constructor.name.toLowerCase();
    }

    /**
     * @return {string}
     */
    toString()
    {
        if ( this.isType ) return this.asType( indent );

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
 * @class CallableDeclaration
 * @extends ObjectDeclaration
 */
class CallableDeclaration extends ObjectDeclaration
{
    /**
     * @param {?ObjectDeclaration} [instancePrototype=null]
     * @param {boolean} [noProto=false]
     */
    constructor( instancePrototype = null, noProto = false )
    {
        // members represent overloaded varieties
        super( instancePrototype, noProto );
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

    /**
     * @param {string} [indent]
     * @return {string}
     */
    asString( indent = '' )
    {
        if ( !this.instancePrototype ) return super.asString( indent );

        const
            retSep = this.type ? ( this.isType ? ' => ' : ': ' ) : '',
            name   = this.name || ( this.generalType === 'constructor' ? 'new ' : '' ),
            tp     = this.typeParameters.size ? `<${[ ...this.typeParameters.values() ].join( ', ' )}>` : '',
            p      = this.params && this.params.length ? `( ${this.params.join( ', ' )} )` : '()';

        return `${indent}${name}${tp}${p}${retSep}${this.type || ''}${this.isType || this.generalType === 'method' ? '' : ';'}`;
    }

    /**
     * @return {string}
     */
    toString()
    {
        return this.asString();
    }
}


/**
 * @class ClassDeclaration
 * @extends CallableDeclaration
 */
class ClassDeclaration extends CallableDeclaration
{
    /**
     * @param {?ObjectDeclaration} [instancePrototype=null]
     * @param {boolean} [noProto=false]
     */
    constructor( instancePrototype = null, noProto = false )
    {
        // members represent overloaded varieties
        super( instancePrototype, noProto );
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

    asString( indent = '' )
    {
        if ( this.is_boxed_primitive() && ( !this.name || this.name !== this.constructor.name ) )
            return `${indent}${this.name}${this.optional ? '?' : ''}: ${this.constructor.name.toLowerCase()}`;

        const
            output = [],
            types = this.typeParameters.size  ? '<' + [ ...this.typeParameters.values() ].join( ', ' ) + '>' : '';

        output.push( `class ${this.name}${types}`, '{' );
        output.push( ...( this.members.size ? [ ...this.members.values() ].map( m => m.asString( '    ' ) ) : [] ) );
        output.push( '}' );

        return output.map( o => `${indent}${o}` ).join( '\n' );
    }

    asType()
    {
        return this.constructor.name.toLowerCase();
    }

    toString()
    {
        return this.asString();
    }
}

/**
 * @class
 * @extends CallableDeclaration
 */
export class MethodDeclaration extends CallableDeclaration
{
    /**
     * @param {?ObjectDeclaration} [instancePrototype=null]
     * @param {boolean} [noProto=false]
     */
    constructor( instancePrototype = null, noProto = false )
    {
        // members represent overloaded varieties
        super( instancePrototype, noProto );
        this.generalType = 'method';
    }
}

/**
 * @class
 * @extends CallableDeclaration
 */
export class ArrowFunctionDeclaration extends CallableDeclaration
{
    /**
     * @param {?ObjectDeclaration} [instancePrototype=null]
     * @param {boolean} [noProto=false]
     */
    constructor( instancePrototype = null, noProto = false )
    {
        // members represent overloaded varieties
        super( instancePrototype, noProto );
        this.generalType = 'arrow';
    }
}

/**
 * @class ConstructorDeclaration
 * @extends CallableDeclaration
 */
export class ConstructorDeclaration extends CallableDeclaration
{
    /**
     * @param {?ObjectDeclaration} [instancePrototype=null]
     * @param {boolean} [noProto=false]
     */
    constructor( instancePrototype = null, noProto = false )
    {
        // members represent overloaded varieties
        super( instancePrototype, noProto );
        this.generalType = 'constructor';
    }
}

/**
 * @class
 * @extends CallableDeclaration
 */
export class FunctionDeclaration extends CallableDeclaration
{
    /**
     * @param {?ObjectDeclaration} [instancePrototype=null]
     * @param {boolean} [noProto=false]
     */
    constructor( instancePrototype = null, noProto = false )
    {
        // members represent overloaded varieties
        super( instancePrototype, noProto );
        this.generalType = 'function';
    }

    asString( indent = '' )
    {
        const
            retSep = this.type ? ( this.isType ? ' => ' : ': ' ) : '',
            name   = this.name || ( this.generalType === 'constructor' ? 'new ' : '' ),
            tp     = this.typeParameters.size ? `<${[ ...this.typeParameters.values() ].join( ', ' )}>` : '',
            p      = this.params && this.params.length ? `( ${this.params.join( ', ' )} )` : '()';

        return `${indent}${name}${tp}${p}${retSep}${this.type.asType() || ''}${this.isType || this.generalType === 'method' ? '' : ';'}`;
    }

    toString()
    {
        return this.asString();
    }
}

/** **************************************************************************************************************************
 *
 * DEFINITIONS
 *
 *****************************************************************************************************************************/

/**
 * CREATE TOP BASE FINAL OBJECT AKA Object.prototype
 * topObject = PlainObjectDeclaration( null, true )
 */
realm.topObject = new ObjectDeclaration( null, true );


/**
 * CREATE Function.prototype
 * func = PlainObjectDeclaration( topObject, null )
 */
const
    func = NamedDeclaration( 'Function', ClassDeclaration, realm.topObject );

func.instancePrototype.add( 'totally_func_proto', new ObjectDeclaration( null ) );

bases.push( new ObjectDeclaration( null, true ) );

context.global( func );

const
    obj = NamedDeclaration( 'Object', ClassDeclaration, func.instance() );

context.global( obj );

const
    globalEnvironmentRecord = realm.global = obj.instance().named( 'global' );

bases.pop();

bases.push( globalEnvironmentRecord );
context.global( func );
context.global( obj );

context.global( NamedDeclaration( 'Array', ClassDeclaration, func.instance() ) );

context.global( NamedDeclaration( 'Number', ClassDeclaration, func.instance() ) );
context.global( NamedDeclaration( 'String', ClassDeclaration, func.instance() ) );
context.global( NamedDeclaration( 'Boolean', ClassDeclaration, func.instance() ) );
context.global( NamedDeclaration( 'Symbol', ClassDeclaration, func.instance() ) );
context.global( NamedDeclaration( 'undefined', ObjectDeclaration, null ) );
context.global( NamedDeclaration( 'null', ObjectDeclaration, null ) );
context.global( NamedDeclaration( 'Any', ObjectDeclaration, null ) );

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

/**
 * @param {string} name
 * @param {string} typeName
 * @param {boolean} [optional=false]
 * @return {ObjectDeclaration}
 */
function parameter( name, typeName, optional = false )
{
    const t = typeName instanceof ObjectDeclaration ? typeName : context.get( typeName );

    return t.instance( name ).set_optional( optional );
}

function resolve_type( decl, typeName )
{
    while ( decl )
    {
        if ( decl.typeParameters && decl.typeParameters.has( typeName ) )
            return decl.typeParameters.get( typeName );

        decl = decl.owner;
    }

    output.error( `Unable to find type parameter for reference "${typeName}"` );
}

/**
 * @param {ObjectDeclaration} Decl
 // * @param {?string} name
 // * @param {string} type
 // * @param {Array<object>} params
 // * @param {Array} typeParams
 */

/**
 * @param {ObjectDeclaration} Decl
 * @return {{fn: *, add_type_params: function(*=): ObjectDeclaration, add_type: function(*=): (ObjectDeclaration|*), add_params: function(*=): ObjectDeclaration, add_name: function(*=): (*|ObjectDeclaration|{enum})}}
 */
function function_like( Decl ) // , name, type, params, typeParams )
{
    const
        _fn = new Decl( context.get( 'Function' ).instance(), true ),
        fn = context.current().add( _fn );

    fn.owner( context.current() );

    return {
        fn,
        add_type_params: tp => fn.add_types( tp ),
        add_type: type => fn.add_type( type ).owner( fn ),
        add_params: params => fn.add_params( params ).owner( fn ),
        add_name: name => name && fn.named( name )
    };
    // fn.add_types( typeParams );
    //
    // if ( name ) fn.named( name );
    // fn.type = context.get( type ).instance();
    // fn.type.isType = true;
    // fn.add_params( params );
    //
    // params.forEach( p => p.owner( fn ) );
    //
    //
    // return fn;
}

export const parser = {
    type( name )
    {
        return context.get( name ).instance();
    },
    property( name, typeName )
    {
        const p = context.current().add( name, context.get( typeName ).instance() );

        p.owner( context.current() );

        return p;
    },
    func( name, type, args, typeParams )
    {
        return function_like( FunctionDeclaration ); // , name, type, args, typeParams );
    },
    construct( type, args, typeParams )
    {
        return function_like( ConstructorDeclaration ); // , null, type, args, typeParams );
    },
    call( type, args, typeParams )
    {
        return function_like( FunctionDeclaration ); // , null, type, args, typeParams );
    },
    method( name, type, args, typeParams )
    {
        return function_like( MethodDeclaration ); // , name, type, args, typeParams );
        // const m = function_like( MethodDeclaration ); // , name, type, args, typeParams );
        //
        // m.owner( context.current() );
        //
        // return m;
    },
    interface( name, typeParams )
    {
        const
            isConstructor = name.endsWith( CONSTRUCTOR );

        name = isConstructor ? name.substring( 0, name.length - CONSTR_LENGTH ) : name;

        const
            i = context.global( NamedDeclaration( name, ClassDeclaration, func.instance() ) );

        i.add_types( typeParams );

        if ( isConstructor )
            context.current( i );
        else
            context.current( i.instancePrototype );

        return i;
    },
    parameter( name, typeName, optional, isRest = false )
    {
        let a;

        if ( isRest )
        {
            a = context.get( 'Array' ).instance( name ).set_optional( optional );

            a.type = context.get( typeName ).instance();
        }
        else
            a = parameter( name, typeName, optional );

        return a;
    },
    array( name, typeName, optional )
    {
        const
            a = context.get( 'Array' ).instance( name ),
            t = context.get( typeName ).instance();

        a.set_optional( optional );
        a.type = t;
        a.owner( context.current() );

        return a;
    },
    object( name )
    {
        const o = context.get( 'Object' ).instance( name );

        context.current( o );

        return o;
    }
};

parser.property( 'NaN', 'Number' );
parser.func( 'parseInt', 'Number', [ parameter( 's', 'String' ), parameter( 'radix', 'Number', true ) ] );

context.current().add( 'NaN', context.get( 'Number' ).instance() );

// const
//     pi = new FunctionDeclaration( context.get( 'Function' ).instance(), true ).named( 'parseInt' ),
//     fn = context.current().add( pi ),
//     sp = context.get( 'String' ).instance( 's' ),
//     radix = context.get( 'Number' ).instance( 'radix' );
//
// radix.optional = true;
// fn.add_params( [ sp, radix ] );
// fn.type = context.get( 'Number' ).instance();
// fn.type.isType = true;

console.log( bases[ 0 ].toString() );
