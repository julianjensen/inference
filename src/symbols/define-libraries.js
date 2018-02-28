/** ******************************************************************************************************************
 * @file Describe what define-libraries does.
 * @author Julian Jensen <jjdanois@gmail.com>
 * @since 1.0.0
 * @date 04-Feb-2018
 *********************************************************************************************************************/


"use strict";

import { inspect }  from 'util';
import { nodeName } from "../ts/ts-helpers";
import { array }    from "convenience";
import { output }   from "../utils";
import {
    get_type,
    create_type_alias,
    create_constructor,
    parser,
    context
}                   from "../earlier/declaration";

const NodeFlags   = {
    None:               0,
    Let:                1 << 0,  // Variable declaration
    Const:              1 << 1,  // Variable declaration
    NestedNamespace:    1 << 2,  // Namespace declaration
    Synthesized:        1 << 3,  // Node was synthesized during transformation
    Namespace:          1 << 4,  // Namespace declaration
    ExportContext:      1 << 5,  // Export context (initialized by binding)
    ContainsThis:       1 << 6,  // Interface contains references to "this"
    HasImplicitReturn:  1 << 7,  // If function implicitly returns on one of codepaths (initialized by binding)
    HasExplicitReturn:  1 << 8,  // If function has explicit reachable return on one of codepaths (initialized by binding)
    GlobalAugmentation: 1 << 9,  // Set if module declaration is an augmentation for the global scope
    HasAsyncFunctions:  1 << 10, // If the file has async functions (initialized by binding)
    DisallowInContext:  1 << 11, // If node was parsed in a context where 'in-expressions' are not allowed
    YieldContext:       1 << 12, // If node was parsed in the 'yield' context created when parsing a generator
    DecoratorContext:   1 << 13, // If node was parsed as part of a decorator
    AwaitContext:       1 << 14 // If node was parsed in the 'await' context created when parsing an async function
};
const
      is_keyword  = ( mods, kw ) => !!mods && !!mods.find( n => nodeName( n ) === kw ),
      is_optional = node => !!node && !!node.questionToken,
      interfaces  = new Map(),

      visitors    = {
          SourceFile,
          InterfaceDeclaration,
          ModuleDeclaration,
          ClassDeclaration,
          MethodSignature,
          CallSignature,
          ConstructSignature,
          PropertyDeclaration:  PropertySignature,
          PropertySignature,
          VariableDeclaration,
          VariableStatement,
          IndexSignature,
          Parameter,
          FunctionDeclaration:  parse_function_declaration,
          TypeReference:        parse_type_reference,
          TypeParameter:        parse_type_parameter,
          TypeOperator:         parse_type_operator,
          TypePredicate:        parse_type_predicate,
          TypeAliasDeclaration: parse_type_alias_declaration,
          UnionType:            parse_union_type,
          IntersectionType:     parse_intersection_type,
          TupleType:            parse_tuple_type,
          ParenthesizedType:    parse_parenthesized_type,
          MappedType:           parse_mapped_type,
          IndexedAccessType:    parse_indexed_access_type,
          TypeLiteral:          parse_type_literal,

          Constructor:     ConstructSignature,
          ConstructorType: ConstructSignature,
          ArrayType:       parse_array_type,
          FunctionType:    parse_function_type,
          StringKeyword:   () => get_type( '""' ),
          NumberKeyword:   () => get_type( 'number' ),
          BooleanKeyword:  () => get_type( 'boolean' ),
          VoidKeyword:     () => get_type( 'undefined' ).as_void(),
          AnyKeyword:      () => get_type( 'any' )
      };

/**
 * @param {Node} node
 * @param {?Node} parent
 * @param {string} field
 * @param {number} index
 * @param {function} recurse
 */
function Parameter( node, parent, field, index, recurse )
{

    const p = {
        name:        node.name.escapedText,
        rest:        !!node.dotDotDotToken,
        type:        !!node.type && parse_type( node.type ),
        initializer: node.initializer && ( recurse ? recurse( node.initializer ) : parse_type( node.initializer ) ),
        optional:    is_optional( node ),
        toString() { return `${this.rest ? '...' : ''}${this.name}${this.optional ? '?' : ''}: ${this.type}${this.initializer ? ` = ${this.initializer} : ''` : ''}`; }
    };

    return parser.parameter( p.name, p.type );
}

/**
 * @param {Node} node
 * @param {?Node} parent
 * @param {string} field
 * @param {number} index
 * @param {function} recurse
 */
function VariableStatement( node, parent, field, index, recurse )
{
    const
        decls = node.declarationList,
        vars  = decls.declarations.map( ( n, i ) => VariableDeclaration( n, decls, 'declarationList', i, recurse ) );

    if ( decls.flags & ( NodeFlags.Let | NodeFlags.Const ) )
        vars.forEach( v => v.general_type( decls.flags & NodeFlags.Let ? 'let' : decls.flags & NodeFlags.Const ? 'const' : 'var' ) );

    // console.log( vars.map( v => `${v}` ).join( ';\n' ) );

    return vars;
}

// /**
//  * @class
//  */
// class Variable
// {
//     /**
//      * @param name
//      * @param type
//      * @param init
//      * @param ro
//      */
//     constructor( name, type, init, ro = 'var' )
//     {
//         this.name    = name;
//         this.type    = type;
//         this.init    = init;
//         this.varType = ro;
//     }
//
//     /**
//      * 536870914
//      * 536870914
//      * @return {string}
//      */
//     toString()
//     {
//         const
//             init = this.init ? ` = ${this.init}` : '';
//
//         return `declare ${this.varType} ${this.name}: ${this.type}${init};`;
//     }
// }

/**
 * @param {Node} node
 * @param {?Node} parent
 * @param {string} field
 * @param {number} index
 * @param {function} recurse
 */
function VariableDeclaration( node, parent, field, index, recurse )
{
    const v = context.current().add( node.name.escapedText, parse_type( node.type ) ).decl_node( node ).general_type( 'var' );
    if ( node.initializer )
        v.initializer( recurse( node.initializer ) );

    return v;

    // return new Variable( node.name.escapedText, parse_type( node.type ), node.initializer && recurse( node.initializer ) );
    // return {
    //     name:        node.name.escapedText,
    //     type:        parse_type( node.type ),
    //     initializer: node.initializer && recurse( node.initializer )
    // };
}

/**
 * @param {Node} node
 */
function IndexSignature( node )
{
    return {
        readOnly:   is_keyword( node.modifiers, 'ReadonlyKeyword' ),
        parameters: node.parameters.map( parse_type ),
        type:       parse_type( node.type ),
        declType:   'index',
        toString()
        {
            return `${this.readOnly ? 'readonly ' : ''}[ ${this.parameters.map( p => `${p}` ).join( '; ' )} ]: ${this.type}`;
        }
    };
}

// /**
//  * @param {string} name
//  * @return {{name: *, returns: null, params: Array, types: Array, type: null}}
//  */
// function create_signature( name )
// {
//     return {
//         name,
//         returns: null,
//         params:  [],
//         types:   [],
//         type:    null
//     };
// }

// /**
//  * @param {string} name
//  * @param {string} iname
//  * @return {*}
//  */
// function add_interface_member( name, iname = currentOwner )
// {
//     let intr;
//
//     if ( string( iname ) )
//         intr = interfaces.get( iname );
//     else if ( !iname )
//         intr = currentOwner;
//
//     if ( !intr ) return null;
//
//     const member = create_signature( name );
//
//     const slot = intr.members.get( name );
//
//     if ( !slot )
//         intr.members.set( name, member );
//     else if ( object( slot ) )
//         intr.set( name, [ slot, member ] );
//     else if ( array( slot ) )
//         slot.push( member );
//     else
//         return null;
//
//     return member;
// }


/**
 * @param {Node} node
 * @param {?Node} parent
 * @param {string} field
 * @param {number} index
 * @param {function} recurse
 */
export function visitor( node, parent, field, index, recurse )
{
    const type = nodeName( node );

    return visitors[ type ] ? visitors[ type ]( node, parent, field, index, recurse ) : true;
}

/**
 * @param {Node} node
 * @param {?Node} parent
 * @param {string} field
 * @param {number} index
 * @param {function} recurse
 */
function SourceFile( node, parent, field, index, recurse )
{
    // console.log( 'idents:', node.identifiers );
    const flatten = arr => arr.reduce( ( list, cur ) => list.concat( array( cur ) ? flatten( cur ) : cur ), [] );
    console.log( `${flatten( recurse( node.statements ) ).join( '\n\n' )}` );
}

/**
 * @param {Node} node
 * @param {?Node} parent
 * @param {string} field
 * @param {number} i
 * @param {function} recurse
 */
function InterfaceDeclaration( node, parent, field, i, recurse )
{
    const
        name  = node.name.escapedText,
        types = node.typeParameters && node.typeParameters.map( parse_type );

    parser.interface( name, types );

    if ( node.members ) node.members.map( recurse );

    context.pop();
}

/**
 * @param {Node} node
 * @param {?Node} parent
 * @param {string} field
 * @param {number} i
 * @param {function} recurse
 */
function ClassDeclaration( node, parent, field, i, recurse )
{
    const
        name    = node.name.escapedText,
        types   = node.typeParameters && node.typeParameters.map( parse_type );

    parser.interface( name, types );

    if ( node.members ) node.members.map( recurse );

    context.pop();
}

/**
 * @param {Node} node
 * @param {?Node} parent
 * @param {string} field
 * @param {number} i
 * @param {function} recurse
 */
function ModuleDeclaration( node, parent, field, i, recurse )
{
    parser.object( node.name.escapedText );

    if ( node.body.statements ) node.body.statements.map( recurse );

    context.pop();
}

/**
 * @param {Node} node
 * @param {?Node} parent
 * @param {string} field
 * @param {number} i
 * @param {function} recurse
 */
function MethodSignature( node, parent, field, i, recurse )
{
    const
        // fn = parse_function_type( node ),
        m = parser.method(); // fn.name, fn.type, fn.parameters, fn.typeParameters );

    return function_bit_by_bit( node, m );

    // m.isType = false;
    //
    // return fn.general_type( 'method' ).decl_node( node );
}

/**
 * @param {Node} node
 * @param {?Node} parent
 * @param {string} field
 * @param {number} i
 * @param {function} recurse
 */
function CallSignature( node, parent, field, i, recurse )
{
    const
        fn = parse_function_type( node, false ),
        c = parser.call( fn.type, fn.parameters, fn.typeParameters );

    c.general_type( 'call' ).decl_node( node );

    return c;
}

/**
 * @param {Node} node
 * @param {?Node} parent
 * @param {string} field
 * @param {number} i
 * @param {function} recurse
 */
function ConstructSignature( node, parent, field, i, recurse )
{
    const
        fn = parse_function_type( node, false ),
        c = parser.construct( fn.type, fn.args, fn.typeParameters );

    c.general_type( 'constructor' ).decl_node( node );

    return c;
}

const
    owners = [];

/**
 * @param {Node} node
 * @param {{fn: *, add_type_params: function(*=): ObjectDeclaration, add_type: function(*=): (ObjectDeclaration|*), add_params: function(*=): ObjectDeclaration, add_name: function(*=): (*|ObjectDeclaration|{enum})}} fn
 * @return {ObjectDeclaration}
 */
function function_bit_by_bit( node, fn )
{
    if ( node.name ) fn.add_name( node.name.escapedText );

    if ( node.typeParameters ) fn.add_type_params( node.typeParameters.map( parse_type ) );
    if ( node.type ) fn.add_type( parse_type( node.type ) );
    if ( node.parameters ) fn.add_params( node.parameters.map( parse_type ) );

    fn.type.isType = true;

    params.forEach( p => p.owner( fn ) );


    return fn;

}

/**
 * @todo This becomes a new type, we should add it properly and wire up the proto chain
 *
 * @param {Node} node
 * @param {boolean} [hasName=true]
 */
function parse_function_type( node, hasName = true )
{
    return {
        name:           hasName && node.name ? node.name.escapedText : null,
        typeParameters: node.typeParameters && node.typeParameters.map( parse_type ),
        parameters:     node.parameters ? node.parameters.map( parse_type ) : [],
        type:           node.type && parse_type( node.type )
    };
}

/**
 * members[ 0 ]: "PropertySignature" => InterfaceDeclaration
 *  modifiers[ 0 ]: "ReadonlyKeyword" => PropertySignature
 *  name: "Identifier ("length")" => PropertySignature
 *  type: "NumberKeyword" => PropertySignature
 *  jsDoc[ 0 ]: "JSDocComment" => PropertySignature
 *
 * @param {Node} node
 */
function PropertySignature( node )
{
    // return {
    //     name:     node.name.escapedText,
    //     readOnly: is_keyword( node.modifiers, 'ReadonlyKeyword' ),
    //     type:     parse_type( node.type ),
    //     declType: 'property',
    //     toString()
    //     {
    //         return `${this.readOnly ? 'readonly ' : ''}${this.name}: ${this.type}`;
    //     }
    // };

    const
        prop = parser.property( node.name.escapedText, prop.type );

    prop.readOnly = is_keyword( node.modifiers, 'ReadonlyKeyword' );

    return prop;
}

/**
 * @class
 */
class TypeDefinition
{
    /**
     *
     */
    constructor()
    {
        this.parent = null;
    }
}



/**
 * In typeParameters:
 * "K extends keyof T"
 * TypeParameter
 *      name: Identifier
 *      constraint: TypeOperator
 *          type: TypeReference
 *              typeName: Identifier
 *
 * In MappedType.typeParameter
 * "P in keyof T"
 * TypeParameter
 *      name: Identifier
 *      constraint: TypeOperator
 *          type: TypeReference
 *              typename: Identifier
 *
 * "P in K"
 * TypeParameter
 *      name: Identifier
 *      constraint: TypeReference
 *          typeName: Identifer
 *
 * @class
 */
export class TypeParameter extends TypeDefinition
{
    /**
     * @param {string} name
     * @param {?(TypeReference|BaseType)} [constraint]
     * @param {?(TypeReference|TypeOperator|BaseType|string|number)} [defaultVal]
     * @param {boolean} [inMappedType=false]
     */
    constructor( name, constraint, defaultVal, inMappedType = false )
    {
        super();
        this.name         = name;
        this.constraint   = constraint;
        this.default      = defaultVal;
        this.inMappedType = inMappedType;
        this.owner        = null;
    }

    /**
     * @param {object<string, { type: BaseType, constraint: BaseType | TypeReference }>} types
     * @param {BaseType} [type]
     */
    materialize( types, type = this.default )
    {
        types[ this.name ] = {
            type,
            constraint: this.constraint
        };
    }

    /**
     * @return {string}
     */
    toString()
    {
        let str     = this.name,
            connect = this.inMappedType ? ' in ' : ' extends ';

        if ( this.constraint )
            str += connect + this.constraint;

        if ( this.default )
            str += ' = ' + this.default;

        return str;
    }
}

/**
 * @class
 */
export class TypeReference extends TypeDefinition
{
    /**
     * @param {string} name
     * @param {(TypeReference)[]} args
     */
    constructor( name, ...args )
    {
        super();
        this.name          = name;
        this.typeArguments = args;
        this.refTarget     = null;
    }

    /**
     * @return {string}
     */
    toString()
    {
        let str = this.name;

        if ( this.typeArguments.length )
            str += '<' + this.typeArguments.join( ', ' ) + '>';

        return str;
    }
}

/**
 * @class
 */
export class TypePredicate extends TypeDefinition
{
    /**
     * @param {string} paramName
     * @param {?(TypeReference|BaseType)} type
     */
    constructor( paramName, type )
    {
        super();
        this.name      = paramName;
        this.type      = type;
        this.refTarget = null;
    }

    /**
     * @return {string}
     */
    toString()
    {
        return this.name + ' ' + this.type;
    }
}

/**
 * Prints as `keyof`
 * @class
 */
export class TypeOperator extends TypeDefinition
{
    /**
     * @param {TypeReference} ref
     */
    constructor( ref )
    {
        super();
        this.type      = ref;
        this.refTarget = null;
    }

    /**
     * @param {Array<TypeParameter>} refs
     * @return {Array<string>}
     */
    refName( refs )
    {
        if ( refs )
            this.refTarget = refs[ 0 ];
        else
            return [ this.type.refName ];
    }

    /**
     * @return {string}
     */
    toString()
    {
        return 'keyof ' + this.type;
    }
}

/**
 * @class
 */
export class UnionType extends TypeDefinition
{
    /**
     * @param {(TypeReference|BaseType)[]} types
     */
    constructor( ...types )
    {
        super();
        this.types = types;
    }

    resolve( res )
    {
        this.types.forEach( t => t.resolve( res ) );
    }

    /**
     * @return {string}
     */
    toString()
    {
        return this.types.join( ' | ' );
    }
}

/**
 * @class
 */
export class IntersectionType extends TypeDefinition
{
    /**
     * @param {(TypeReference|BaseType)[]} types
     */
    constructor( ...types )
    {
        super();
        this.types = types;
    }

    resolve( res )
    {
        this.types.forEach( t => t.resolve( res ) );
    }

    /**
     * @return {string}
     */
    toString()
    {
        return this.types.join( ' & ' );
    }
}

/**
 * @class
 */
export class TupleType extends TypeDefinition
{
    /**
     * @param {(TypeReference|BaseType)[]} types
     */
    constructor( ...types )
    {
        super();
        this.types = types;
    }

    /**
     * @param {Array<TypeParameter>} refs
     * @return {Array<string>}
     */
    refName( refs )
    {
        if ( refs )
            refs.forEach( ( rn, i ) => this.types[ i ].refName( rn ) );
        else
            return this.types.map( t => t.refName() );
    }

    /**
     * @return {string}
     */
    toString()
    {
        return '[ ' + this.types.join( ', ' ) + ' ]';
    }
}

/**
 * @class
 */
export class ParenthesizedType extends TypeDefinition
{
    /**
     * @param {(TypeReference|BaseType)} type
     */
    constructor( type )
    {
        super();
        this.type = type;
    }

    /**
     * @return {string}
     */
    toString()
    {
        return '( ' + this.type + ' )';
    }
}

/**
 * @class
 */
export class TypeAliasDeclaration extends TypeDefinition
{
    /**
     * @param {string} name
     * @param {Array<TypeParameter>|TypeParameter} typeParameters
     * @param {TypeReference|BaseType} type
     */
    constructor( name, typeParameters, type )
    {
        super();
        this.name           = name;
        this.typeParameters = typeParameters ? ( Array.isArray( typeParameters ) ? typeParameters : [ typeParameters ] ) : null;
        this.type           = type;

        let underlyingName;

        switch ( type.constructor.name )
        {
            case 'MappedType':
                underlyingName = 'object';
                break;

            case 'FunctionType':
                underlyingName = 'function';
                break;

            case 'ArrayType':
                underlyingName = 'array';
                break;

            default:
                if ( type instanceof TypeDefinition )
                    underlyingName = 'typedef';
                else
                    underlyingName = type.name;
                break;
        }

        this.typeAlias = create_type_alias( name, typeParameters, type.name );

        if ( underlyingName === 'typedef' )
            this.typeAlias.underlying = type;
    }

    /**
     *
     * @return {string}
     */
    toString()
    {
        const
            tp = this.typeParameters ? `<${this.typeParameters.join( ', ' )}>` : '';

        if ( this.type instanceof MappedType )
            return `type ${this.name}${tp} = {\n    ${this.type}\n};\n`;
        else
            return `type ${this.name}${tp} = ${this.type};\n`;
    }
}

/**
 * @class
 */
export class MappedType extends TypeDefinition
{
    /**
     * @param {TypeParameter} typeParam
     * @param {IndexedAccessType} type
     * @param {boolean} [ro=false]
     */
    constructor( typeParam, type, ro = false )
    {
        super();
        this.typeParam              = typeParam;
        this.type                   = type;
        this.readOnly               = ro;
        this.typeParam.inMappedType = true;
        this.typeAlias              = create_type_alias();

    }

    /**
     * @return {string}
     */
    toString()
    {
        return `{ ${this.readOnly ? 'readonly ' : ''}[ ${this.typeParam} ]: ${this.type} }`;
    }
}

/**
 * @class
 */
export class IndexedAccessType extends TypeDefinition
{
    /**
     * @param objectType
     * @param indexType
     */
    constructor( objectType, indexType )
    {
        super();
        this.objectType = objectType;
        this.indexType  = indexType;
    }

    /**
     * @return {string}
     */
    toString()
    {
        return `${this.objectType}[ ${this.indexType} ]`;
    }
}

/**
 * @param {Node} node
 * @return {*}
 */
function parse_type( node )
{
    if ( !node ) return null;

    if ( array( node ) )
        return node.map( n => parse_type( n ) );

    const type = nodeName( node );

    if ( visitors[ type ] ) return visitors[ type ]( node );
    else if ( type.endsWith( 'Type' ) || type.endsWith( 'Keyword' ) ) return type.replace( /^(.*)(?:Type|Keyword)$/, '$1' );

    output.warn( `Parsing type, missing handler for ${type}`, node );

    return null;
}

/**
 * @param {Node} node
 * @return {ArrayType}
 */
function parse_array_type( node )
{
    return new ArrayType( null, parse_type( node.elementType ) );
}

/**
 * @param {Node} node
 * @return {UnionType}
 * @constructor
 */
function parse_union_type( node )
{
    return new UnionType( ...node.types.map( parse_type ) );
}

/**
 * @param {Node} node
 * @return {IntersectionType}
 */
function parse_intersection_type( node )
{
    return new IntersectionType( ...node.types.map( parse_type ) );
}

/**
 * @param {Node} node
 * @return {TupleType}
 */
function parse_tuple_type( node )
{
    return new TupleType( node.elementTypes.map( parse_type ) );
}

/**
 * @param {Node} node
 * @return {ParenthesizedType}
 */
function parse_parenthesized_type( node )
{
    return new ParenthesizedType( parse_type( node.type ) );
}

/**
 * @param {Node} node
 * @return {MappedType}
 */
function parse_mapped_type( node )
{
    const
        typeParam = parse_type( node.typeParameter ),
        type      = parse_type( node.type );

    return new MappedType( typeParam, type, !!node.readonlyToken );
}

/**
 * @param {Node] node
 * @return {IndexedAccessType}
 */
function parse_indexed_access_type( node )
{
    return new IndexedAccessType( parse_type( node.objectType ), parse_type( node.indexType ) );
}

/**
 * @param {Node} node
 * @return {TypeParameter}
 */
function parse_type_parameter( node )
{
    let name     = nodeName( node ),
        n        = node.parent,
        stopName = n && nodeName( n );

    while ( n && name !== 'MappedType' && stopName !== 'TypeAliasDefinition' )
    {
        n        = n.parent;
        name     = stopName;
        stopName = nodeName( n );
    }

    const
        inMappedType = name === 'MappedType',
        id           = node.name.escapedText,
        constraint   = parse_type( node.constraint ),
        defaultVal   = parse_type( node.default );

    return new TypeParameter( id, constraint, defaultVal, inMappedType );
}

/**
 * @param {Node} node
 * @return {TypeReference}
 */
function parse_type_reference( node )
{
    const
        name = node.typeName.escapedText,
        args = node.typeArguments ? node.typeArguments.map( parse_type ) : [];

    return new TypeReference( name, ...args );
}

/**
 * @param {Node} node
 * @return {TypeOperator}
 */
function parse_type_operator( node )
{
    return new TypeOperator( parse_type( node.type ) );
}

/**
 * @param {Node} node
 * @return {TypePredicate}
 */
function parse_type_predicate( node )
{
    const
        name = node.parameterName.escapedText,
        ref  = parse_type( node.type );

    return new TypePredicate( name, ref );
}

/**
 * @param {Node} node
 * @return {TypeAliasDeclaration}
 */
function parse_type_alias_declaration( node )
{
    const
        name = node.name.escapedText,
        tp   = node.typeParameters && node.typeParameters.map( parse_type ),
        type = node.type && parse_type( node.type );

    const r = new TypeAliasDeclaration( name, tp, type );

    // console.log( `${r}` );

    return r;
}

/**
 * @param {Node} node
 * @param {?Node} parent
 * @param {string} field
 * @param {number} i
 * @param {function} recurse
 */
function parse_type_literal( node, parent, field, i, recurse )
{
    const
        name    = '$$type_literal_' + ( ~~( Math.random() * 1e7 ) ).toString( 16 ),
        members = node.members && node.members.map( parse_type ),
        joiner  = members.length > 3 ? ';\n    ' : '; ';

    interfaces.set( name,
        {
            name,
            members,
            declType: 'typeliteral'
        } );

    return {
        name,
        members,
        declType: "typeLiteral",
        toString()
        {
            return `{ ${members.join( joiner )} }`;
        }
    };
    // console.log( `type literal "${name}":\n    ${members.join( '\n    ' )}` );
}

function resolve_type_references( decl )
{
    let t = decl.typeParameters;

    t = array( t ) ? t : t ? [ t ] : [];

    if ( !t.length ) return;

    t.forEach( type => {

    } );
}

