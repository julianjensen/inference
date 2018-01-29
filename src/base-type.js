/* eslint-disable eqeqeq */
/** ******************************************************************************************************************
 * @file BaseType tracker, inference, conglom-thing.
 * @author Julian Jensen <jjdanois@gmail.com>
 * @since 1.0.0
 * @date 23-Jan-2018
 *********************************************************************************************************************/
"use strict";

import { name, type, nameOf } from 'typeofs';

const
    sneaky       = javascriptCodeAsString => ( ( () => {} ).constructor( javascriptCodeAsString ) )(),

    // The six primitives and three types the need special treatment that covers all other types
    starterTypes = [ '', 0, true, null, void 0, Symbol(), {}, [], function() {} ],

    /** @type {Map<string, BaseType<T>>} */
    typeTable    = new Map(),
    memoize = {};

/**
 * @typedef {object} PotentialType
 * @property {TypeFlags} flags
 */

/**
 * @class<T> BaseType
 * @template T
 */
export class BaseType
{
    /**
     * @param {T|string} _type
     * @template T
     */
    constructor( _type )
    {
        if ( typeof _type === 'string' && typeTable.size ) _type = typeTable.get( _type ).baseType;

        this.baseType = type;
        this.typeName = nameOf( _type );
        this.type = type( _type );
        this.name = name( _type );
    }

    /**
     * @return {boolean}
     */
    is_error()
    {
        return this.baseType === Error;
    }

    /**
     * @param {string} operator
     * @param {BaseType<U>} [rhsType]
     * @return {BaseType<V>|BaseType<Error>}
     */
    coerce_from_type_operation( operator, rhsType )
    {
        try
        {
            const expr = rhsType ? `${this.baseType} ${operator} ${rhsType.baseType}` : `${operator}${this.baseType}`;
            return memoize[ expr ] || ( memoize[ expr ] = new BaseType( sneaky( `return ${expr}` ) ) );
        }
        catch ( err )
        {
            return new BaseType( Error );
        }
    }

    /**
     * @param {BaseType<U>|*} [lhs]
     * @param {string} operator
     * @param {BaseType<U>|*} [rhs]
     * @return {[*,BaseType|BaseType<Error>,BaseType]|BaseType}
     */
    static coerce_from_value_operation( lhs, operator, rhs )
    {
        if ( arguments.length === 2 )
        {
            if ( lhs instanceof BaseType )
                return lhs.coerce_from_type_operation( operator );

            return brute_force( { lhs, op: operator } );
        }

        if ( lhs instanceof BaseType || rhs instanceof  BaseType )
        {
            lhs = lhs instanceof BaseType ? lhs : new BaseType( lhs );
            rhs = rhs instanceof BaseType ? rhs : new BaseType( rhs );
            return lhs.coerce_from_type_operation( operator, rhs );
        }

        return brute_force( { lhs, op: operator, rhs } );
    }

    /**
     * @param {*} value
     * @return {BaseType<T>}
     */
    static type_from_value( value )
    {
        return typeTable.get( type( value ) );
    }

    /**
     * "==" | "!=" | "===" | "!==" | "<" | "<=" | ">" | ">=" | "<<" | ">>" | ">>>" | "+" |
     * "-" | "*" | "/" | "%" | "**" | "|" | "^" | "&" | "in" | "instanceof"
     *
     * @param {BaseType} lhs
     * @param {string} op
     * @param {BaseType} rhs
     * @return {BaseType}
     */
    static binary_expression( lhs, op, rhs )
    {
        return lhs.coerce_from_type_operation( op, rhs );
    }

    /**
     * "-" | "+" | "!" | "~" | "typeof" | "void" | "delete"
     *
     * @param {string} op
     * @param {BaseType} type
     * @return {BaseType}
     */
    static unary_expression( op, type )
    {
        return type.unary_expression( op );
    }

    /**
     * "-" | "+" | "!" | "~" | "typeof" | "void" | "delete"
     *
     * @param {string} op
     * @return {BaseType}
     */
    unary_expression( op )
    {
        const src = op + this.baseType;

        switch ( op )
        {
            case '+':
            case '-':
            case '!':
            case '~':
                return memoize[ src ] || ( memoize[ src ] = new BaseType( sneaky( `return ${src}` ) ) );

            case 'typeof':
                return typeTable.get( 'string' );
            case 'void':
                return typeTable.get( 'undefined' );
            case 'delete':
                return typeTable.get( 'boolean' );
        }
    }

    get isFunction()
    {
        return this.type === 'function';
    }

    get isObject()
    {
        return this.type === 'object';
    }

    get isArray()
    {
        return this.type === 'array';
    }

    get isNull()
    {
        return this.type === 'null';
    }

    get isVoid()
    {
        return this.type === 'undefined';
    }

    get isUndefined()
    {
        return this.type === 'undefined';
    }

    get isNumber()
    {
        return this.type === 'number';
    }

    get isString()
    {
        return this.type === 'string';
    }

    get isBoolean()
    {
        return this.type === 'boolean';
    }

    get isBool()
    {
        return this.type === 'boolean';
    }

    /**
     * @param {string|BaseType} type
     * @return {boolean}
     */
    is( type )
    {
        return typeof type === 'string' ? this.type === type : this.type === type.type;
    }
}

starterTypes.map( t => new BaseType( t ) ).forEach( t => typeTable.set( t.type, t ) );

/**
 * @typedef {object} Operation
 * @property {*} lhs       - Target of the operation
 * @property {string} op   - The operator to use
 * @property {*} [rhs]     - Additional target for binary operations
 */
/**
 * Even though we can tyell the exact type of a particular operation, we still execute it to get a
 * value in the hope that we can use this in other contexts to detect constants for propagation.
 *
 * Unary operators: = "-" | "+" | "!" | "~" | "typeof" | "void" | "delete"
 * Binary operators: "==" | "!=" | "===" | "!==" | "<" | "<=" | ">" | ">=" | "<<" | ">>" | ">>>" | "+" | "-" | "*" | "/" | "%" | "**" | "|" | "^" | "&" | "in" | "instanceof"
 * Logical operators: "||" | "&&"
 * Assignment operators: "=" | "+=" | "-=" | "*=" | "/=" | "%=" | "**=" | "<<=" | ">>=" | ">>>=" | "|=" | "^=" | "&="
 * Update operators: "++" | "--"
 *
 * @param {Operation} oper
 * @return {[ *, BaseType, BaseType ]}  - Value from operation, BaseType of value from operation, estimated type from operation
 */
function brute_force( oper )
{
    const
        { lhs, op, rhs } = oper,
        hasRhs           = Reflect.has( oper, 'rhs' ),
        safeType         = hasRhs
                           ? BaseType.binary_expression( BaseType.type_from_value( lhs ), op, BaseType.type_from_value( rhs ) )
                           : BaseType.unary_expression( op, BaseType.type_from_value( lhs ) );

    let r;

    try
    {
        switch ( op )
        {
            case '-=':
            case '-':
                r = hasRhs ? ( lhs - rhs ) : -lhs;
                break;
            case '+=':
            case '+':
                r = hasRhs ? ( lhs + rhs ) : +lhs;
                break;
            case '!':
                r = !lhs;
                break;
            case '~':
                r = ~lhs;
                break;
            case 'typeof':
                r = typeof lhs;
                break;
            case 'void':
                r = void lhs;
                break;  // Always void, of course
            case 'delete':
                r = true;
                break;    // Could be false but we have no way of finding out

            case '==':
                r = ( lhs == rhs );
                break;
            case '!=':
                r = ( lhs != rhs );
                break;
            case '===':
                r = ( lhs === rhs );
                break;
            case '!==':
                r = ( lhs !== rhs );
                break;
            case '<':
                r = ( lhs < rhs );
                break;
            case '<=':
                r = ( lhs <= rhs );
                break;
            case '>':
                r = ( lhs > rhs );
                break;
            case '>=':
                r = ( lhs >= rhs );
                break;
            case '<<=':
            case '<<':
                r = ( lhs << rhs );
                break;
            case '>>=':
            case '>>':
                r = ( lhs >> rhs );
                break;
            case '>>>=':
            case '>>>':
                r = ( lhs >>> rhs );
                break;
            case '*=':
            case '*':
                r = ( lhs * rhs );
                break;
            case '/=':
            case '/':
                r = ( +rhs != 0 ) ? ( lhs / rhs ) : 0;
                break;
            case '%=':
            case '%':
                r = ( +rhs != 0 ) ? ( lhs % rhs ) : 0;
                break;
            case '**=':
            case '**':
                r = ( lhs ** rhs );
                break;
            case '|=':
            case '|':
                r = ( lhs / rhs );
                break;
            case '^=':
            case '^':
                r = ( lhs ^ rhs );
                break;
            case '&=':
            case '&':
                r = ( lhs & rhs );
                break;
            case 'in':
                r = true;
                break;    // Could be false but we have no way of knowing this
            case 'instanceof':
                r = true;
                break;    // Settle for type

            case '||':
                r = ( lhs || rhs );
                break;
            case '&&':
                r = ( lhs && rhs );
                break;

            case '=':
                r = rhs;
                break;
        }
    }
    catch ( err )
    {
        r = new BaseType( Error );
    }

    return [ r, BaseType.type_from_value( r ), safeType ];
}

