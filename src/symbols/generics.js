/** ******************************************************************************************************************
 * @file Describe what generics does.
 * @author Julian Jensen <jjdanois@gmail.com>
 * @since 1.0.0
 * @date 04-Feb-2018
 *********************************************************************************************************************/
"use strict";

import { nodeName } from "../ts/ts-helpers";

const { isArray: array } = Array;

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
export class TypeParameter
{
    /**
     * @param {string} name
     * @param {?(TypeReference|BaseType)} [constraint]
     * @param {?(TypeReference|TypeOperator|BaseType|string|number)} [defaultVal]
     * @param {boolean} [inMappedType=false]
     */
    constructor( name, constraint, defaultVal, inMappedType = false )
    {
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
        types[ this.name ] = { type, constraint: this.constraint };
    }

    /**
     * @return {string}
     */
    toString()
    {
        let str = this.name;

        if ( this.constraint instanceof TypeOperator )
            str += ( this.inMappedType ? ' in ' : ' extends ' ) + this.constraint;
        else if ( this.constraint instanceof TypeReference )
            str += ' extends ' + this.constraint;

        if ( this.default )
            str += ' = ' + this.default;

        return str;
    }
}

/**
 * @class
 */
export class TypeReference
{
    /**
     * @param {string} name
     * @param {(TypeReference)[]} args
     */
    constructor( name, ...args )
    {
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
export class TypePredicate
{
    /**
     * @param {string} paramName
     * @param {?(TypeReference|BaseType)} type
     */
    constructor( paramName, type )
    {
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
export class TypeOperator
{
    /**
     * @param {TypeReference} ref
     */
    constructor( ref )
    {
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
export class UnionType
{
    /**
     * @param {(TypeReference|BaseType)[]} types
     */
    constructor( ...types )
    {
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
export class IntersectionType
{
    /**
     * @param {(TypeReference|BaseType)[]} types
     */
    constructor( ...types )
    {
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
export class TupleType
{
    /**
     * @param {(TypeReference|BaseType)[]} types
     */
    constructor( ...types )
    {
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
export class ParenthesizedType
{
    /**
     * @param {(TypeReference|BaseType)} type
     */
    constructor( type )
    {
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
export class TypeAliasDeclaration
{
    /**
     * @param {string} name
     * @param {Array<TypeParameter>|TypeParameter} typeParameters
     * @param {TypeReference|BaseType} type
     */
    constructor( name, typeParameters, type )
    {
        this.name           = name;
        this.typeParameters = Array.isArray( typeParameters ) ? typeParameters : [ typeParameters ];
        this.type           = type;
    }
}

/**
 * @class
 */
export class MappedType
{
    /**
     * @param {TypeParameter} typeParam
     * @param {IndexedAccessType} type
     * @param {boolean} [ro=false]
     */
    constructor( typeParam, type, ro = false )
    {
        this.typeParam = typeParam;
        this.type      = type;
        this.readOnly  = ro;
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
export class IndexedAccessType
{
    constructor( objectType, indexType )
    {
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

const typeVisitors = {
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
    IndexedAccessType:    parse_indexed_access_type
};

export function to_generic_types( types )
{
    return new GenericTypes( ...types );
}

export function parse_type( node )
{
    if ( !node ) return null;

    console.log( `node is array? ${Array.isArray( node )}, name: "${array( node ) ? '[ ' + node.map( n => nodeName( n ) ).join( ', ' ) + ' ]' : nodeName( node )}", count: ${array( node ) ? node.length : 'n/a'}` );
    if ( array( node ) )
    {
        console.log( "Entering array..." );
        const r = node.map( n => parse_type( n ) );
        console.log( "Exiting array..." );
        return r;
    }

    const type = nodeName( node );

    console.log( "Normal node: '" + type + "'" );

    if ( typeVisitors[ type ] ) return typeVisitors[ type ]( node );
    else if ( type.endsWith( 'Type' ) || type.endsWith( 'Keyword' ) ) return nodeName.replace( /^(.*)(?:Type|Keyword)$/, '$1' );

    console.warn( `Parsing type, missing handler for ${type}` );
    return null;
}

function parse_union_type( node )
{
    return new UnionType( ...node.types.map( parse_type ) );
}

function parse_intersection_type( node )
{
    return new IntersectionType( ...node.types.map( parse_type ) );
}

function parse_tuple_type( node )
{
    return new TupleType( node.elementTypes.map( parse_type ) );
}

function parse_parenthesized_type( node )
{
    return new ParenthesizedType( parse_type( node.type ) );
}

function parse_mapped_type( node )
{
    const
        typeParam = parse_type( node.typeParameter ),
        type      = parse_type( node.type );

    return new MappedType( typeParam, type, !!node.readonlyToken );
}

function parse_indexed_access_type( node )
{
    return new IndexedAccessType( parse_type( node.objectType ), parse_type( node.indexType ) );
}

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

function parse_type_reference( node )
{
    const
        name = node.typeName.escapedText,
        args = node.typeArguments ? node.typeArguments.map( parse_type ) : [];

    return new TypeReference( name, ...args );
}

function parse_type_operator( node )
{
    return new TypeOperator( parse_type( node.type ) );
}

function parse_type_predicate( node )
{
    const
        name = node.parameterName.escapedText,
        ref  = parse_type( node.type );

    return new TypePredicate( name, ref );
}

function parse_type_alias_declaration( node )
{
    const
        name = node.name.escapedText,
        tp   = node.typeParameters.map( parse_type ),
        type = parse_type( node.type );

    return new TypeAliasDeclaration( name, tp, type );
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

