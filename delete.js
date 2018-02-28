/** ******************************************************************************************************************
 * @file Describe what delete does.
 * @author Julian Jensen <jjdanois@gmail.com>
 * @since 1.0.0
 * @date 25-Feb-2018
 *********************************************************************************************************************/
"use strict";

const
    VALUE     = Symbol( 'value' ),
    NUMERICAL = Symbol( 'numerical' );

/**
 * @param {object<string,number>} names
 * @param {function} [prior]
 * @return {function}
 * @private
 */
function make_enum_from_object( names, prior )
{
    const __enum = prior || ( ( val = 0 ) => {
        __enum[ VALUE ] = val;
        return __enum;
    } );

    if ( !prior )
    {
        __enum[ VALUE ]     = 0;
        __enum[ NUMERICAL ] = {};

        __enum[ Symbol.toPrimitive ] = function( hint ) {
            if ( hint === 'string' ) return __enum.asString( __enum[ VALUE ] );
            return __enum[ VALUE ];
        };

        __enum.asString = num => {
            let i = 1,
                s = [];

            while ( num )
            {
                if ( num & 1 )
                    s.push( __enum[ NUMERICAL ][ i ] );

                num >>>= 1;
                i <<= 1;
            }

            return s.join( ' | ' );
        };
    }

    Object.entries( names ).forEach( ( [ name, val ] ) => {
        __enum[ name ]             = {
            valueOf() { return val; },
            toString() { return name; }
        };
        __enum[ NUMERICAL ][ val ] = name;
    } );

    return __enum;
}


const wrap = ( home, val, name ) => ( {
    valueOf:  () => val,
    toString: () => name
} );

function make_extra( home, obj )
{
    const _ = {};

    for ( const [ name, desc ] of Object.entries( obj ) )
    {
        const
            val = desc.get(),
            __  = wrap( home, val, name );

        Object.defineProperty( home, name, { get: () => __ } );
        // _[ name ] = { get: () => __ };
    }

    // Object.defineProperties( home, _ );
}


const TypeFlags = make_enum_from_object( {
    Any:                     1 << 0,
    String:                  1 << 1,
    Number:                  1 << 2,
    Boolean:                 1 << 3,
    Enum:                    1 << 4,
    StringLiteral:           1 << 5,
    NumberLiteral:           1 << 6,
    BooleanLiteral:          1 << 7,
    EnumLiteral:             1 << 8,   // Always combined with StringLiteral, NumberLiteral, or Union
    ESSymbol:                1 << 9,   // Type of symbol primitive introduced in ES6
    UniqueESSymbol:          1 << 10,  // unique symbol
    Void:                    1 << 11,
    Undefined:               1 << 12,
    Null:                    1 << 13,
    Never:                   1 << 14,  // Never type
    TypeParameter:           1 << 15,  // Type parameter
    Object:                  1 << 16,  // Object type
    Union:                   1 << 17,  // Union (T | U)
    Intersection:            1 << 18,  // Intersection (T & U)
    Index:                   1 << 19,  // keyof T
    IndexedAccess:           1 << 20,  // T[K]
    Conditional:             1 << 21,  // T extends U ? X : Y
    Substitution:            1 << 22,  // Type parameter substitution
    FreshLiteral:            1 << 23,  // Fresh literal or unique type
    ContainsWideningType:    1 << 24,  // Type is or contains undefined or null widening type
    ContainsObjectLiteral:   1 << 25,  // Type is or contains object literal type
    ContainsAnyFunctionType: 1 << 26,  // Type is or contains the anyFunctionType
    NonPrimitive:            1 << 27,  // intrinsic object type
    GenericMappedType:       1 << 29   // Flag used by maybeTypeOfKind

} );

make_extra( TypeFlags, {
    Nullable:                      { get: () => TypeFlags.Undefined | TypeFlags.Null },
    Literal:                       { get: () => TypeFlags.StringLiteral | TypeFlags.NumberLiteral | TypeFlags.BooleanLiteral },
    Unit:                          { get: () => TypeFlags.Literal | TypeFlags.UniqueESSymbol | TypeFlags.Nullable },
    StringOrNumberLiteral:         { get: () => TypeFlags.StringLiteral | TypeFlags.NumberLiteral },
    StringOrNumberLiteralOrUnique: { get: () => TypeFlags.StringOrNumberLiteral | TypeFlags.UniqueESSymbol },
    DefinitelyFalsy:               { get: () => TypeFlags.StringLiteral | TypeFlags.NumberLiteral | TypeFlags.BooleanLiteral | TypeFlags.Void | TypeFlags.Undefined | TypeFlags.Null },
    PossiblyFalsy:                 { get: () => TypeFlags.DefinitelyFalsy | TypeFlags.String | TypeFlags.Number | TypeFlags.Boolean },
    Intrinsic:                     {
        get: () => TypeFlags.Any | TypeFlags.String | TypeFlags.Number | TypeFlags.Boolean | TypeFlags.BooleanLiteral | TypeFlags.ESSymbol | TypeFlags.Void | TypeFlags.Undefined | TypeFlags.Null | TypeFlags.Never | TypeFlags.NonPrimitive
    },
    Primitive:                     {
        get: () => TypeFlags.String | TypeFlags.Number | TypeFlags.Boolean | TypeFlags.Enum | TypeFlags.EnumLiteral | TypeFlags.ESSymbol | TypeFlags.Void | TypeFlags.Undefined | TypeFlags.Null | TypeFlags.Literal | TypeFlags.UniqueESSymbol
    },
    StringLike:                    { get: () => TypeFlags.String | TypeFlags.StringLiteral | TypeFlags.Index },
    NumberLike:                    { get: () => TypeFlags.Number | TypeFlags.NumberLiteral | TypeFlags.Enum },
    BooleanLike:                   { get: () => TypeFlags.Boolean | TypeFlags.BooleanLiteral },
    EnumLike:                      { get: () => TypeFlags.Enum | TypeFlags.EnumLiteral },
    ESSymbolLike:                  { get: () => TypeFlags.ESSymbol | TypeFlags.UniqueESSymbol },
    UnionOrIntersection:           { get: () => TypeFlags.Union | TypeFlags.Intersection },
    StructuredType:                { get: () => TypeFlags.Object | TypeFlags.Union | TypeFlags.Intersection },
    TypeVariable:                  { get: () => TypeFlags.TypeParameter | TypeFlags.IndexedAccess },
    InstantiableNonPrimitive:      { get: () => TypeFlags.TypeVariable | TypeFlags.Conditional | TypeFlags.Substitution },
    InstantiablePrimitive:         { get: () => TypeFlags.Index },
    Instantiable:                  { get: () => TypeFlags.InstantiableNonPrimitive | TypeFlags.InstantiablePrimitive },
    StructuredOrInstantiable:      { get: () => TypeFlags.StructuredType | TypeFlags.Instantiable },
    Narrowable:                    {
        get: () => TypeFlags.Any | TypeFlags.StructuredOrInstantiable | TypeFlags.StringLike | TypeFlags.NumberLike | TypeFlags.BooleanLike | TypeFlags.ESSymbol | TypeFlags.UniqueESSymbol | TypeFlags.NonPrimitive
    },
    NotUnionOrUnit:                { get: () => TypeFlags.Any | TypeFlags.ESSymbol | TypeFlags.Object | TypeFlags.NonPrimitive },
    RequiresWidening:              { get: () => TypeFlags.ContainsWideningType | TypeFlags.ContainsObjectLiteral },
    PropagatingFlags:              { get: () => TypeFlags.ContainsWideningType | TypeFlags.ContainsObjectLiteral | TypeFlags.ContainsAnyFunctionType }
} );

let test = TypeFlags.Number;

console.log( `Number: ${TypeFlags.Number}, test: ${TypeFlags( test )}, value: ${+test}` );
test = TypeFlags.Null;
console.log( `Null: ${TypeFlags.Null}, test: ${TypeFlags( test )}, value: ${+test}` );
test = TypeFlags.Undefined;
console.log( `Undefined: ${TypeFlags.Undefined}, test: ${TypeFlags( test )}, value: ${+test}` );
test = TypeFlags.Nullable;
console.log( `Nullable: ${TypeFlags.Nullable}, test: ${TypeFlags( test )}, value: ${+test}` );
test = TypeFlags.Null | TypeFlags.Undefined;
console.log( `Nullable: ${TypeFlags.Nullable}, test: ${TypeFlags( test )}, value: ${+test}` );
test |= TypeFlags.Unit;
console.log( `Unit: ${TypeFlags.Unit}, test: ${TypeFlags( test )}, value: ${+test}` );

// console.log( `Null: ${TypeFlags.Null}` );
// console.log( `Undefined: ${TypeFlags.Undefined}` );
// console.log( `Nullable: ${TypeFlags.Nullable}` );
// console.log( `Nullable: ${TypeFlags.asString( TypeFlags.Nullable )}` );
