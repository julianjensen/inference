/** ******************************************************************************************************************
 * @file Describe what alt-destructure does.
 *
 * ### Identifier
 *
 *      name <= rhs
 *
 * ### ObjectPattern
 *
 * 1. from `void`
 *
 *      { ... } <= void => Error
 *
 * 2. from `null`
 *
 *      { ... } <= null => Error
 *
 * 3. from `object`
 *
 *      { key: pattern, ... } <= rhs
 *          => pattern = rhs.key
 *          => { ... } => rhs
 *
 * 4. from `object` with default
 *
 *      { key: pattern = def, ... } => rhs
 *          => pattern = rhs.key || def
 *          => { ... } => rhs
 *
 * 5. no LHS keys left
 *
 *      {} <= rhs => done
 *
 * ### ArrayPattern
 *
 * 1. from anything the doesn't have `@@iterator`
 *
 *      [ ... ] <= !Iterable => Error
 *
 * 2. pattern at index `0` and more elements after it
 *
 *      [ pattern, ... ] <= *iterator
 *          => pattern = iterator.next();
 *          => ... = iterator
 *
 * 3. pattern at index `0` with default and more elements after it
 *
 *      [ pattern = def, ... ] <= *iterator
 *          => pattern = iterator.next() || def
 *          => ... = iterator
 *
 * 4. elison at index `0` with elements after it
 *
 *      [ , ... ] <= *iterator
 *          => iterator.next()
 *          => ... = iterator
 *
 * 5. rest element as last element
 *
 *      [ ...pattern ] <= *iterator
 *          => pattern = iterator
 *
 * 6. no more LHS elements
 *
 *      [] <= iterator => done
 *
 * @author Julian Jensen <jjdanois@gmail.com>
 * @since 1.0.0
 * @date 20-Jan-2018
 *********************************************************************************************************************/


"use strict";

import { Syntax } from 'espree';
import { globals, node_is, fatal } from "./utils";

/**
 * @interface BaseNodeWithoutComments
 * @property {TransformFlags} [transformFlags]
 */



/**
 *
 */
class RHS
{
    /**
     * @param {ArrayExpression|ObjectExpression|Identifier|MemberExpression|Literal} rhs
     */
    constructor( rhs )
    {
        let tmp;

        this.rhsType = rhs.type;

        switch ( rhs.type )
        {
            case Syntax.Identifier:
                tmp = globals.current.get( rhs, true );
                break;

            case Syntax.ObjectExpression:
                tmp = rhs.properties;
                break;

            case Syntax.ArrayExpression:
                tmp = rhs.elements;
                break;

            // Tricky but solvable, mostly...
            case Syntax.ThisExpression:
                break;

            // Tricky because
            // easy case: const { a, b: c, d = 1 } = va1 = va2
            // but: const { a, b: c, d = 1 } = { x, y: [ p, o, r = 10 ], zzz } = va2
            case Syntax.AssignmentExpression:
                break;

            case Syntax.ArrowFunctionExpression:
            case Syntax.FunctionExpression:
            case Syntax.UnaryExpression:
            case Syntax.UpdateExpression:
            case Syntax.BinaryExpression:
            case Syntax.LogicalExpression:
            case Syntax.Literal:
            case Syntax.TemplateLiteral:
            case Syntax.TaggedTemplateExpression:
                fatal( `Illegal destructure target ${rhs.type}`, rhs );
/*
ThisExpression | FunctionExpression | YieldExpression | MemberExpression | ConditionalExpression |
    CallExpression | NewExpression | SequenceExpression | ClassExpression | MetaProperty | AwaitExpression
 */

        }
        this.rhs = rhs;
    }

    assign( lhs )
    {

    }

    assign_rest( lhs )
    {

    }

    throw_if_known_void()
    {

    }

    throw_if_known_null()
    {

    }

    throw_unless_iterator()
    {

    }

    get_prop( key )
    {

    }

    get_value( defaultValue )
    {

    }

    next()
    {

    }
}

/**
 * @param {AssignmentProperty|Pattern|AssignmentPattern|ObjectPattern|ArrayPattern|Identifier|RestElement} node
 * @param {RHS} rhs
 * @return {*}
 */
function step_pattern( node, rhs )
{
    switch ( node.type )
    {
        /**
         * The recursion stops with an assignment which happens when
         *
         *      LHS is a Syntax.Identifier
         *      RHS is anything at all
         */
        case Syntax.Identifier:
            return rhs.assign( node );

        /**
         * Syntax.ObjectPattern
         */
        case Syntax.ObjectPattern:

            /**
             * 1. from `void`
             *
             *      { ... } <= void => Error
             *
             * 2. from `null`
             *
             *      { ... } <= null => Error
             */
            rhs.throw_if_known_void();
            rhs.throw_if_known_null();

            /**
             * Syntax.Property( key, value )
             *
             * 1. Prop only: `{ x } = a`
             *
             *      RHS <= RHS[ key ]
             *      LHS <= value
             *
             * 2. Prop with rename: `{ x: y } = a`
             *
             *      RHS <= RHS[ key ]
             *      LHS <= value
             */
            node.properties.forEach( prop => {
                step_pattern( prop.value, rhs.get_prop( prop.key ) );
            } );

            /**
             * 5. no LHS keys left
             *
             *      {} <= rhs => done
             */
            break;

         /**
          * This is technically named Syntax.AssignmentProperty but the type
          * remains as Syntax.Property.
          */
        case Syntax.Property:
            step_pattern( node.value, rhs.get_prop( node.key ) );
            break;
        /**
         * Syntax.ArrayPattern
         */
        case Syntax.ArrayPattern:
            /**
             * 1. from anything the doesn't have `@@iterator`
             *
             *      [ ... ] <= !Iterable => Error
             */
            rhs.throw_unless_iterator();

            /**
             * 2. pattern at index `0` and more elements after it
             *
             *      [ pattern, ... ] <= *iterator
             *          => pattern = iterator.next();
             *          => ... = iterator
             *
             * 3. pattern at index `0` with default and more elements after it
             *
             *      [ pattern = def, ... ] <= *iterator
             *          => pattern = iterator.next() || def
             *          => ... = iterator
             *
             * 4. elison at index `0` with elements after it
             *
             *      [ , ... ] <= *iterator
             *          => iterator.next()
             *          => ... = iterator
             */

            node.elements.forEach( el => {
                step_pattern( el, rhs.next() );
            } );

            break;

        /**
         * 5. rest element as last element
         *
         *      [ ...pattern ] <= *iterator
         *          => pattern = iterator
         */
        case Syntax.RestElement:
        case Syntax.ExperimentalRestProperty:
            return rhs.assign_rest( node.argument );

        /**
         * 3. Prop with rename and defaults: `{ x: y = z } = a`
         *
         *      RHS <= RHS[ key ] || AssignmentPattern.right
         *      LHS <= AssignmentPattern.left
         */
        case Syntax.AssignmentPattern:
            step_pattern( node.left, rhs.get_value( node.right ) );
            break;
    }
}

/**
 * @param {Pattern} lhs
 * @param {Expression} rhs
 * @return {*}
 */
export default function get_all_identifiers_from_destructuring( lhs, rhs )
{
    return step_pattern( lhs, new RHS( rhs ) );
}
