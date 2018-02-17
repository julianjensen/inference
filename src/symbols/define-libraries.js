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
    ArrayType,
    FunctionType,
    ClassType,
    ObjectType, get_type, create_type_alias
}                   from "./symbol-table";

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
          PropertyDeclaration: PropertySignature,
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

          Constructor: ConstructSignature,
          ConstructorType: ConstructSignature,
          ArrayType:       parse_array_type,
          FunctionType:    parse_function_type,
          StringKeyword:   () => get_type( '""' ),
          NumberKeyword:   () => get_type( 'number' ),
          BooleanKeyword:  () => get_type( 'boolean' ),
          VoidKeyword:     () => get_type( 'undefined' ).as_void(),
          AnyKeyword: () => get_type( 'any' )
      };

class TypeDefinition {}

/**
 * @param {Node} node
 * @param {?Node} parent
 * @param {string} field
 * @param {number} index
 * @param {function} recurse
 */
function Parameter( node, parent, field, index, recurse )
{
    return {
        name:        node.name.escapedText,
        rest:        !!node.dotDotDotToken,
        type:        !!node.type && parse_type( node.type ),
        initializer: node.initializer && ( recurse ? recurse( node.initializer ) : parse_type( node.initializer ) ),
        optional:    is_optional( node ),
        toString() { return `${this.rest ? '...' : ''}${this.name}${this.optional ? '?' : ''}: ${this.type}${this.initializer ? ` = ${this.initializer} : ''` : ''}`; }
    };
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
        vars.forEach( v => v.varType = decls.flags & NodeFlags.Let ? 'let' : decls.flags & NodeFlags.Const ? 'const' : 'var' );

    // console.log( vars.map( v => `${v}` ).join( ';\n' ) );

    return vars;
}

/**
 * @class
 */
class Variable
{
    /**
     * @param name
     * @param type
     * @param init
     * @param ro
     */
    constructor( name, type, init, ro = 'var' )
    {
        this.name    = name;
        this.type    = type;
        this.init    = init;
        this.varType = ro;
    }

    /**
     * 536870914
     * 536870914
     * @return {string}
     */
    toString()
    {
        const
            init = this.init ? ` = ${this.init}` : '';

        return `declare ${this.varType} ${this.name}: ${this.type}${init};`;
    }
}

/**
 * @param {Node} node
 * @param {?Node} parent
 * @param {string} field
 * @param {number} index
 * @param {function} recurse
 */
function VariableDeclaration( node, parent, field, index, recurse )
{
    return new Variable( node.name.escapedText, parse_type( node.type ), node.initializer && recurse( node.initializer ) );
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
    // const i = {
    //     name: node.name.escapedText,
    //     types: node.typeParameters && node.typeParameters.map( parse_type ),
    //     members: node.members && node.members.map( recurse );
    // };

    const
        name    = node.name.escapedText,
        types   = node.typeParameters && node.typeParameters.map( parse_type ),
        members = node.members && node.members.map( recurse ),
        st = members && members.length ? '\n    ' : '',
        intr = {
            name,
            types,
            members,
            declType: 'interface',
            toString()
            {
                return `interface ${name}${types ? `<${types}>` : ''} {${st}${members.join( ';\n    ' )}${members && members.length ? ';\n' : ''}}`;
            }
        };
    //     name:    node.name.escapedText,
    //     types:   node.typeParameters && node.typeParameters.map( parse_type ),
    //     members: node.members && node.members.map( recurse )
    // } );

    // console.log( `interface ${name}${types ? `types` : ''} {\n    ${members.join( '\n    ' )}\n}` );
    // console.log( `${intr}` );
    return intr;

    // return currentOwner;
    //
    //
    //
    // let name     = node.name.escapedText,
    //     info     = typescriptToSymbol( name ),
    //     generics = parse_type( node.typeParameters ),
    //     klass    = info.isA || declare( name, 'interface' );
    //
    // klass.typeParameters = new GenericTypes( ...( array( generics ) ? generics : [ generics ] ) );
    //
    // currentOwner = info;
    // declare( klass, name );
    //
    // recurse( node.members );
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
        types   = node.typeParameters && node.typeParameters.map( parse_type ),
        members = node.members && node.members.map( recurse );

        return {
            name,
            types,
            members,
            declType: 'class',
            toString()
            {
                return `class ${name}${types ? `types` : ''} {\n    ${members.join( ';\n    ' )};\n}`;
            }
        };
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
    const
        name    = node.name.escapedText,
        members = node.body.statements && node.body.statements.map( recurse ),
        decl = new Decl( name, null );

    return {
        name,
        members,
        declType: 'namespace',
        toString()
        {
            return `namespace ${name} {\n    ${members.join( ';\n    ' )};\n}`;
        }
    };
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
        fn = parse_function_type( node, parent, field, i, recurse );

    fn.isType = false;

    return fn.decl_type( 'method' );

    // return {
    //     name:     node.name.escapedText,
    //     returns:  node.type && parse_type( node.type ),
    //     params:   node.parameters && recurse( node.parameters ),
    //     types:    node.typeParameters && node.typeParameters.map( parse_type ),
    //     declType: 'method'
    // };
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
        fn = parse_function_type( node, parent, field, i, recurse );

    return fn.decl_type( 'call' );
    // return {
    //     declType: 'call',
    //     returns:  node.type && parse_type( node.type ),
    //     params:   node.parameters && recurse( node.parameters ),
    //     types:    node.typeParameters && node.typeParameters.map( parse_type )
    // };
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
        fn = parse_function_type( node, parent, field, i, recurse );

    return fn.decl_type( 'constructor' );

    // return {
    //     declType: 'constructor',
    //     returns:  node.type && parse_type( node.type ),
    //     params:   node.parameters && recurse( node.parameters ),
    //     types:    node.typeParameters && node.typeParameters.map( parse_type )
    // };
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
    return {
        name:     node.name.escapedText,
        readOnly: is_keyword( node.modifiers, 'ReadonlyKeyword' ),
        type:     parse_type( node.type ),
        declType: 'property',
        toString()
        {
            return `${this.readOnly ? 'readonly ' : ''}${this.name}: ${this.type}`;
        }
    };

    // let name = node.name.escapedText,
    //     decl = declare( name, type );
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
        this.name = paramName;
        this.type = type;
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
        this.type = ref;
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
        joiner = members.length > 3 ? ';\n    ' : '; ';

    interfaces.set( name,
        {
            name,
            members,
            declType: 'typeliteral'
        } );

    return {
        name, members, declType: "typeLiteral",
        toString()
        {
            return `{ ${members.join( joiner )} }`;
        }
    };
    // console.log( `type literal "${name}":\n    ${members.join( '\n    ' )}` );
}

/**
 * @todo This becomes a new type, we should add it properly and wire up the proto chain
 *
 * @param node
 */
function parse_function_type( node )
{
    const
        fn = new FunctionType( node.name ? node.name.escapedText : null );

    fn.typeParameters = node.typeParameters && node.typeParameters.map( parse_type );
    fn.parameters     = node.parameters ? node.parameters.map( parse_type ) : [];
    fn.returns        = node.type && parse_type( node.type );

    return fn;
}

/**
 * @todo Technically, this is a declaration as opposed to a type/definition, will need fixing
 *
 * @param node
 */
function parse_function_declaration( node )
{
    const
        fn = new FunctionType( node.name ? node.name.escapedText : null );

    fn.typeParameters = node.typeParameters && node.typeParameters.map( parse_type );
    fn.parameters     = node.parameters ? node.parameters.map( parse_type ) : [];
    fn.returns        = parse_type( node.type );
    fn.isType         = false;

    // console.log( `${is_keyword( node.modifiers, 'DeclareKeyword' ) ? 'declare ' : ''}function ${fn}` );

    return fn;
}

/**
 * @class
 */
class GenericTypeDefinition
{
    /**
     * @param {string} name
     * @param {TypeReference|TypeParameter|TypePredicate} generic
     */
    constructor( name, generic )
    {
        this.name           = name;
        this.generic        = generic;
        this.instantiatedAs = null;
    }

    /**
     * @param {?BaseType} [t]
     */
    instantiated_type( t )
    {
        if ( !t ) return this.instantiatedAs;

        this.instantiatedAs = t;
    }
}

/**
 * @class
 */
export class GenericTypes
{
    /**
     * @param {GenericTypeDefinition[]} types
     */
    constructor( ...types )
    {
        this.types = types;
    }

    /**
     * @return {number}
     */
    count()
    {
        return this.types.length;
    }

    /**
     * @param {BaseType} type
     * @param {number} [index=0]
     * @return {GenericTypes}
     */
    resolve( type, index = 0 )
    {
        this.types[ index ].instantiated_type( type );
        return this;
    }

    /**
     * @param {BaseType[]} types
     * @return {GenericTypes}
     */
    resolve_types( ...types )
    {
        types.forEach( ( t, i ) => this.resolve( t, i ) );
        return this;
    }
}

export function to_generic_types( types )
{
    return new GenericTypes( ...types );
}


/**
 * To define:
 *
 * 1. Define container with optional type parameters
 * 2. Add members with optional type parameters
 *
 * To instantiate:
 *
 * 1. Define an instance
 * 2. Materialize container generic types
 * 3. On first use of a member:
 *    1. Materialize type parameters declared on the member
 *    2. Materialize any remaining type parameters from the container
 *    3. Repeat step two until all types are materialized.
 */

