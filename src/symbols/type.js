/** ******************************************************************************************************************
 * @file Pure type handler.
 * @author Julian Jensen <jjdanois@gmail.com>
 * @since 1.0.0
 * @date 20-Feb-2018
 *********************************************************************************************************************/

"use strict";

import { output }   from "../utils";

const
    is_primitive = str => [ 'null', 'undefined', 'string', 'number', 'boolean', 'symbol', 'any', 'never' ].includes( str );

/**
 * @class
 */
class BaseType
{
    /**
     * @param {string} name
     * @param {?BaseType} [parent=null]
     */
    constructor( name, parent = null )
    {
        this.name = name;
        this.parent = parent;
        this.primitive = null;
    }

    one_to_other( type1, type2 )
    {
        return type2 instanceof Type ? this.one_to_one( type1, type2 ) : type2 instanceof UnionType ? this.one_to_union( type1, type2 ) : this.one_to_intersect( type1, type2 );
    }

    one_to_one( type1, type2 )
    {
        return this.simple_extends( type1, type2 );
    }

    one_to_union( type1, type2 )
    {
        return [ ...type2 ].some( altType => this.one_to_one( type1, altType ) );
    }

    one_to_intersect( type1, type2 )
    {

    }

    member_check( name, otherType, selfType )
    {
        if ( selfType.has( name ) ) return false;
        if ( !otherType ) return true;

        return selfType.extends( otherType );
    }

    simple_extends( type, other )
    {
        if ( this.primitive === 'any' || other.primitive === 'any' ) return true;
        if ( this.primitive === 'never' || other.primitive === 'never' ) return false;
        if ( this.primitive && other.primitive ) return this.primitive === other.primitive;

        for ( const [ name, type ] of other )
        {
            if ( !type.members.has( name ) ) return false;
            if ( !type.members.get( name ).extends( type ) ) return false;
        }
    }

    self_simple( members, other )
    {
        if ( other instanceof Type ) return this.simple_extends( members, other );
        else if ( other instanceof UnionType )
            return [ ...other ].some( altType => this.self_simple( members, altType ) );
        else if ( other instanceof IntersectionType )
        {
            for ( const [ name, selfType ] of members )
            {
                if ( !this.self_type_extends( selfType, other ) ) return;
            }
        }
    }

    self_type_extends( type, other )
    {
        if ( other instanceof Type )
            return type.extends( other );
        else if ( other instanceof UnionType )
            return [ ...other ].some( otherType => this.self_type_extends( type, otherType ) );

    }
}

/**
 * @class
 */
export class Type extends BaseType
{
    /**
     * @param {string} name
     * @param {?BaseType} [parent=null]
     */
    constructor( name, parent = null )
    {
        super( name, parent );
        this.name = name;
        this.members = new Map();
        this.typeParameters = new Map();
        this.parent = parent;
        this.callSignatures = [];
        this.constructSignatures = [];
        this.constraint = null;
        this.default = void 0;
        this.inMappedType = false;
    }

    /**
     * @param {BaseType} constraint
     * @return {Type}
     */
    set_constraint( constraint )
    {
        if ( !constraint ) return this.constraint;
        this.constraint = constraint;
        return this;
    }

    /**
     * @param {boolean} [isMapped]
     * @return {boolean|Type}
     */
    is_mapper_type( isMapped )
    {
        if ( isMapped === void 0 ) return this.inMappedType;
        this.inMappedType = isMapped;
        return this;
    }

    /**
     * @param {?(BaseType|number|string|boolean|symbol|null)} [def]
     * @return {*|Type}
     */
    set_default( def )
    {
        if ( !def ) return this.default;
        this.default = def;
        return this;
    }

    /**
     * @param {BaseType} type
     * @return {Type}
     */
    add_call_signature( type )
    {
        type.parent = this;
        this.callSignatures.push( type );
        return this;
    }

    /**
     * @param {BaseType} type
     * @return {Type}
     */
    add_constructor( type )
    {
        type.parent = this;
        this.constructSignatures.push( type );
        return this;
    }

    /**
     * @param {BaseType} type
     * @return {Type}
     */
    add_method( type )
    {
        type.parent = this;
        this.members.set( type.name, type );
        return this;
    }

    /**
     * @param {BaseType} type
     * @return {Type}
     */
    add_property( type )
    {
        type.parent = type;
        this.members.set( type.name, type );
        return this;
    }

    compare_types( name, type )
    {
        if ( !this.members.has( name ) ) return false;
        if ( !type ) return true;

        return this.members.get( name ).extends( type );
    }

    /**
     * @param {BaseType} baseType
     * @return {boolean}
     */
    extends( baseType )
    {
        if ( this.primitive === 'any' || baseType.primitive === 'any' ) return true;
        if ( this.primitive === 'never' || baseType.primitive === 'never' ) return false;
        if ( this.primitive && baseType.primitive ) return this.primitive === baseType.primitive;

        if ( baseType instanceof Type )
        {
            for ( const [ name, type ] of baseType )
            {
                if ( !this.members.has( name ) ) return false;
                if ( !this.members.get( name ).extends( type ) ) return false;
            }
        }
        else if ( baseType instanceof UnionType )
        {
            for ( const type of baseType )
                if ( this.extends( type ) ) return true;
        }
        else
        {
            for ( const [ name, type ] of this.members )
            {
                for ( const type of baseType )
                {

                }

            }
        }

        return true;
    }

    /**
     * @return {string[]}
     */
    keyof()
    {
        return [ ...this.members.keys() ];
    }

    /**
     * @param {string} keyName
     * @return {boolean}
     */
    in_keyof( keyName )
    {
        return this.members.has( keyName );
    }

    /**
     * @param {BaseType} baseType
     * @return {boolean}
     */
    extends_keyof( baseType )
    {
        if ( baseType instanceof Type )
            return [ ...baseType.keyof() ].every( key => this.members.has( key ) );
        else if ( baseType instanceof UnionType )
        {
            for ( const type of baseType )
                if ( [ ...type.keyof() ].every( key => this.members.has( key ) ) ) return true;

            return false;
        }
        else if ( baseType instanceof IntersectionType )
        {
            const selfKeys = this.keyof();

            return baseType.keyof().every( key => selfKeys.includes( key ) );
        }
        else
            output.fatal( `Unknown type passed to "extends keyof" for type "${this.name}"` );
    }
}

/**
 * @class
 */
export class UnionType extends BaseType
{
    /**
     * @param {string} name
     * @param {?BaseType} [parent=null]
     */
    constructor( name, parent = null )
    {
        super( name, parent );
        this.types = new Set();
    }

    /**
     * @returns {Iterable<Type>}
     */
    *[Symbol.iterator]()
    {
        yield *this.types;
    }
}

/**
 * @class
 */
export class IntersectionType extends BaseType
{
    /**
     * @param {string} name
     * @param {?BaseType} [parent=null]
     */
    constructor( name, parent = null )
    {
        super( name, parent );
        this.types = new Set();
    }

    get members()
    {
        for ( const type of this.types )
    }

    /**
     * @returns {Iterable<Type>}
     */
    *[Symbol.iterator]()
    {
        yield *this.types;
    }

    keyof()
    {
        let keys = [];

        for ( const type of this )
            keys = keys.concat( type.keyof() );

        return [ ...new Set( keys ) ];
    }
}


/**
 * @class
 */
class TypeTable
{
    /**
     *
     */
    constructor()
    {
        this.types = new Map();
    }

    /**
     * @param {string} name
     * @param {Type} type
     */
    add( name, type )
    {
        this.types.set( name, type );
        type.parent = null;
    }

    /**
     * @param {string} name
     * @return {Type | undefined}
     */
    get( name )
    {
        return this.types.get( name );
    }
}
