/** ****************************************************************************************************
 * File: delete (jsdoc-tag-parser)
 * @author julian on 1/25/18
 * @version 1.0.0
 * @copyright Planet3, Inc.
 *******************************************************************************************************/
"use strict";

function huh()
{
    const g = Function( 'return this;' )();
    return g;
}

module.exports = () => {
    return new huh();
};


/*
const
    has                   = ( o, n ) => Object.prototype.hasOwnProperty.call( o, n ),
    toString              = o => Object.prototype.toString.call( o ),
    isObject              = o => typeof o === 'object' && o !== null && !Array.isArray( o ),
    isString              = s => typeof s === 'string',
    hasValue              = val => {
        if ( val === null || val === undefined || val === false || val === 'no' ) return false;

        if ( Array.isArray( val ) ) return val.length > 0;

        if ( isObject( val ) )
        {
            const
                keys = Object.keys( val );

            if ( !keys.length ) return false;

            for ( const key of keys )
                if ( hasValue( val[ key ] ) ) return true;

            return false;
        }

        return !!val;
    },
    toType                = thing => {
        const
            sysName = toString( thing );

        return sysName.substring( 8, sysName.length - 1 ).toLowerCase();
    },

    clean_text            = str => str.toLowerCase()
        .replace( /[\n\s]{2,}/g, ' ' )
        .replace( /[^a-z\s]+/, '' )
        .replace( /^\s*|\s*$/g, '' )
        .replace( /\s/g, ' ' ),

    camel_breaker         = str => str.replace( /([a-z])([A-Z])/g, ( $0, $1, $2 ) => $1 + ' ' + $2.toLowerCase() ),

    collapse_single_key   = obj => {
        const keys = Object.keys( obj );

        if ( keys.length !== 1 ) return null;

        const target = obj[ keys[ 0 ] ];

        return { tail: camel_breaker( keys[ 0 ] ), target };
    },

    _any                  = hasValue,
    _none                 = value => !hasValue( value ),

    comparator            = ( modelValue, otherValue ) => {

        if ( toType( modelValue ) === 'array' )
            return modelValue.some( function( mv ) { return comparator( mv, otherValue ); } );

        switch ( modelValue )
        {
            case 'any':
                return _any( otherValue );
            case 'none':
                return _none( otherValue );
            default:
                return modelValue == otherValue;
        }
    },
    negate                = fn => ( ...args ) => !fn( ...args ),
    equalities            = [
        'has', 'be', 'is', 'to be', 'to equal', 'to match', 'to be the same as', 'to not differ from', 'must be', 'must match',
        'must be set to'
    ],
    inequalities          = [
        'is not', 'isnt', 'not to be', 'to not be', 'to be not', 'to differ', 'anything other than', 'something other than',
        'must not', 'must not be', 'mustnt be', 'must not equal', 'mustnt equal', 'must not match', 'mustnt match'
    ],
    conditions            = [
        'when', 'if', 'where'
    ],
    notConditions         = [
        'unless', 'if not'
    ],
    consequent            = [
        'then'
    ],
    alternate             = [
        'else', 'otherwise'
    ],
    secondVerb            = [
        'has been', 'have been', 'does', 'does have', 'have'
    ],
    notSecondVerb         = [
        'has not been', 'hasnt been',
        'does not', 'doesnt',
        'does not have', 'doesnt have',
        'has not', 'hasnt',
        'have not been', 'havent been'
    ],
    postThenSelfCondition = [
        'this is required',
        'this is required to be',
        'this must be',
        'this has to be',
        'this has to equal',
        'this must equal',
        'this must be the same as',
        'needs to be',
        'needs be',
        'needs to have value of',
        'must have value of'
    ],
    and                   = [ 'and' ],
    or                    = [ 'or' ],
    comparisons           = {
        any:   [
            'exists',
            'exist',
            'anything',
            'set',
            'entered',
            'something',
            'any value',
            'not empty',
            'not missing'
        ],
        none:  [
            'blank',
            'nothing',
            'empty',
            'missing',
            'void',
            'undefined',
            'not set',
            'not entered',
            'not any value',
            'not anything'
        ],
        array: [ 'one of', 'exist in', 'exists in' ]
    },
    collected             = {
        equalities,
        inequalities,
        conditions,
        notConditions,
        consequent,
        alternate,
        secondVerb,
        notSecondVerb,
        postThenSelfCondition,
        and,
        or
    },
    simpleMapping         = {
        equalities:            'eq',
        inequalities:          'not eq',
        conditions:            'if',
        notConditions:         'not if',
        consequent:            'then',
        alternate:             'else',
        secondVerb:            'eq',
        notSecondVerb:         'not eq',
        postThenSelfCondition: 'eq',
        and:                   'and',
        or:                    'or',
        any:                   'any',
        none:                  'none'
    },
    forKeys               = ( obj, fn ) => Object.keys( obj ).forEach( k => fn( k, obj[ k ], obj ) ),
    isPath                = p => ( p[ 0 ] === "'" && p.endsWith( "'" ) ) || p === 'this' || ~p.indexOf( '.' ),
    hasOneKey             = o => {
        const keys = Object.keys( o );

        return keys.length === 1 ? keys[ 0 ] : null;
    },
    is_a                  = ( key, allowSecond = false ) => {

        if ( isPath( key ) ) return 'path';

        key = clean_text( camel_breaker( key ) );

        if ( ~comparisons.any.indexOf( key ) ) return 'any';
        else if ( ~comparisons.none.indexOf( key ) ) return 'none';
        else if ( ~comparisons.array.indexOf( key ) ) return 'array';

        else if ( ~equalities.indexOf( key ) ) return 'eq';
        else if ( allowSecond && ~secondVerb.indexOf( key ) ) return 'eq';
        else if ( ~inequalities.indexOf( key ) ) return 'not eq';
        else if ( allowSecond && ~notSecondVerb.indexOf( key ) ) return 'not eq';
        else if ( ~conditions.indexOf( key ) ) return 'if';
        else if ( ~notConditions.indexOf( key ) ) return 'not if';

        return 'specific';
    },
    is_logical            = res => res === 'and' || res === 'or',
    is_cond               = res => res === 'if' || res === 'not if',
    is_check              = res => res === 'eq' || res === 'not eq';

let symbolIndex = 1,
    symbols     = {},
    trie        = {};

Object.keys( collected ).forEach( name => collected[ name ].forEach( str => to_trie( str, name ) ) );

comparisons.any.forEach( str => to_trie( str, 'any' ) );
comparisons.none.forEach( str => to_trie( str, 'none' ) );

function flatten( arr, result = [], deep = true )
{
    const
        length = arr && arr.length;

    if ( !length ) return result;

    let index = -1;

    while ( ++index < length )
    {
        const value = arr[ index ];

        if ( Array.isArray( value ) )
        {
            if ( deep )
                flatten( value, result, true );
            else
                result.push( ...value );
        }
        else
            result[ result.length ] = value;
    }

    return result;
}

function add_symbol( phrase )
{
    const symName = '$$' + symbolIndex++;

    symbols[ symName ] = phrase;

    return symName;
}

function to_trie( str, cat )
{
    const
        words    = str.split( /\s+/ ),
        lastWord = words.pop();

    let wo = trie;

    for ( const word of words )
        wo = wo[ word ] || ( wo[ word ] = {} );

    if ( !has( wo, lastWord ) )
        wo[ lastWord ] = { $: null };

    if ( wo[ lastWord ].$ )
    {
        console.log( `str: "${str}", lastWord: "${lastWord}", cat: "${cat}", wo:`, wo[ lastWord ], ', is trie?', wo === trie, ', trie[ has ]:', trie.has, ', wo.$:', wo[ lastWord ].$ );
        throw new Error( "Oops, bad double phrase: " + str );
    }

    wo[ lastWord ].$ = cat;
}

function match_longest( words )
{
    const
        phrases = words.split( /(\$\$(?:\d+|self)|,)/ ).map( s => s.trim() ).filter( s => !!s );

    let m;

    // console.log( '*******\n', phrases, '\n********' );

    return phrases.map( phrase => {
        if ( !phrase || phrase === ',' ) return phrase;

        if ( phrase.startsWith( '$$' ) ) return '"' + symbols[ phrase ] + '"';

        m = trie_match( phrase.split( /[,\s]+/ ) );

        if ( !m.length )
            return phrase;
        else if ( m.length === 1 )
        {
            const catMap = simpleMapping[ m[ 0 ].cat ];

            if ( catMap )
                return catMap;

            return add_symbol( m[ 0 ].match.join( ' ' ) );
        }
        else
            return m.map( mb => simpleMapping[ mb.cat ] || ( 'nomatch(' + mb.match.join( ' ' ) + ')' ) ).join( ' ' );
    } );
}

function trie_match( phrase )
{
    let count   = 1,
        matches = [],
        mb;

    if ( !phrase.length ) return [];

    while ( phrase.length && count )
    {
        count = 0;
        mb    = phrase.reduce( ( block, word ) => {
            if ( block[ word ] )
            {
                ++count;
                return block[ word ];
            }

            return block;
        }, trie );

        if ( count )
        {
            matches.push( { match: phrase.slice( 0, count ), cat: mb.$ } );
            phrase = phrase.slice( count );
        }
    }

    if ( phrase.length )
        matches.push( { match: phrase.slice(), cat: 'nomatch' } );

    return matches;
}

function clean_prose( txt )
{
    let symName;

    symbols = {
        $$self: 'this'
    };

    if ( Array.isArray( txt ) ) txt = txt.join( ' ' );

    txt = txt
        .replace( /\r?\n/g, ' ' )
        .replace( /\bthis\b/g, '$$$self' )
        .replace( /([a-zA-Z])'([a-zA-Z])/g, '$1$2' )
        // .replace( /,\s?(?:and|or)/g, ', ' )
        .replace( /(['"]?)([a-zA-Z]+\.[a-zA-Z][a-zA-Z.]*)\1/g, ( $0, $1, $2 ) => add_symbol( $2 ) )
        .replace( /\s+(?:and|or)\s(?!when|if|where|unless|if not|this|\$\$(?:self|\d+))/g, ',' );

    let index = 0,
        start,
        sym;

    while ( index < txt.length )
    {
        if ( txt[ index ] === '"' || txt[ index ] === "'" )
        {
            start   = index;
            index   = read_single_value( txt, index );
            symName = add_symbol( txt.substring( start + 1, index - 1 ) );
            txt     = txt.substring( 0, start ) + symName + txt.substr( index );
            index   = start;
        }
        else
            ++index;
    }

    txt = large_splits( txt );

    return txt.split( /\.(\s+|$)/ ).filter( s => !/^\s*$/.test( s ) );
}

function read_single_value( str, index )
{
    let lookingFor;

    if ( str[ index ] === "'" || str[ index ] === '"' )
        lookingFor = str[ index++ ];

    while ( index < str.length )
    {
        if ( ( ( str.charCodeAt( index ) <= 32 || str[ index ] === ',' ) && !lookingFor ) ||
            ( str[ index ] === lookingFor && ( index++ ) ) )
            break;
        index++;
    }

    return index;
}

function collapse( base, indent = '' )
{
    const
        newObj = {};

    let keys = Object.keys( base );

    for ( let key of keys )
    {
        let
            obj     = base[ key ],
            subKeys = isObject( obj ) && Object.keys( obj );

        while ( !isPath( key ) && subKeys && subKeys.length === 1 && !isPath( subKeys[ 0 ] ) )
        {
            key += ' ' + subKeys[ 0 ];
            obj     = obj[ subKeys[ 0 ] ];
            subKeys = isObject( obj ) && Object.keys( obj );
        }

        const type = is_a( key ) || key;

        console.log( `${indent}key: "${key}", type: "${type}", object? ${isObject( obj )}, obj:`, obj );

        if ( isObject( obj ) )
        {
            console.log( indent + 'took isObject' );
            if ( isPath( key ) )
            {
                console.log( indent + 'took isObject -> isPath in the same loop, recursing...' );
                newObj.targetValue = key;
                newObj.check       = collapse( obj, indent + '    ' );
            }
            else if ( is_logical( key ) )
            {
                console.log( `Took logical "${key}", recursing...` );
                newObj[ key ] = collapse( obj[ key ] );
            }
            else
            {
                console.log( `${indent}key "${key}" was not a path but a "${type}", recursing...` );

                const conds = Object.keys( obj )
                    .reduce( ( soFar, k ) => {
                        if ( is_logical( k ) )
                        {
                            return k === 'and'
                                   ? soFar.concat( collapse( obj[ k ], indent + '    ' ) )
                                   : soFar.concat( { or: collapse( obj[ k ], indent + '    ' ) } );
                        }
                        else
                        {
                            soFar.push( { check: collapse( obj[ k ], indent + '    ' ).check, targetValue: k } );
                            return soFar;
                        }
                    }, [] );

                if ( type.startsWith( 'not ' ) )
                    newObj[ type.substr( 4 ) ] = { not: conds };
                else
                    newObj[ type ] = conds;
            }
        }
        // else if ( type === 'path' )
        // {
        //
        // }
        else if ( Array.isArray( newObj[ type ] ) )
        {
            console.log( `${indent}Already had an array for type = "${type}", adding:`, obj );
            newObj[ type ].push( obj );
        }
        else if ( has( newObj, type ) )
        {
            console.log( `${indent}Already had a value for type = "${type}", adding:`, obj );
            newObj[ type ] = [ newObj[ type ], obj ];
        }
        else if ( is_check( type ) )
        {
            console.log( `${indent}We think it is a check ("${type}") and store it:`, obj );
            if ( type.startsWith( 'not ' ) )
                newObj.check = { not: { [ type.substr( 4 ) ]: obj } };
            else
                newObj.check = { [ type ]: obj };
        }
        else if ( is_cond( type ) )
        {
            const co = {
                check:       { eq: 'any' },
                targetValue: obj
            };

            if ( type.startsWith( 'not ' ) )
                newObj[ type.substr( 4 ) ] = { not: co };
            else
                newObj[ type ] = co;
        }
        else
        {
            console.log( `${indent}Vanilla type = "${type}", setting to:`, obj );
            newObj[ type ] = obj;
        }
    }

    return newObj;
}

function large_splits( str )
{
    str = str.replace( /and (?:if\s+)?(this|\$\$(?:self|\d+))/, ( $0, $1 ) => {
        return '. ' + $1;
    } );


    return str;
    // const
    //     parts = str.split( 'then' );
    //
    // if ( parts.length > 1 )
    // {
    //     let i = 0;
    //
    //     while ( i < parts.length )
    //     {
    //         const [ conseq, cond ] =
    //         [ parts[ i ], parts[ i + 1 ] ] = [ parts[ i + 1 ], parts[ i ] ];
    //
    //         i += 2;
    //     }
    //
    //     str = parts.join( ' ' )
    // }
}

const
    exampleValidations = [
        [
            "this must be 'bob smith' when 'some.target.path' is john or jim.",
            "this must not be 'anything' if some.path is 'something else'"
        ],

        [
            "this is required to be set when 'some.path' is set to anything",
            "and 'that.other.path' isn't USA or DK"
        ],

        [
            "if 'agreement.invoiceAddrState' is set then this must be set to USA",
            "and this must be blank when 'agreement.invoiceAddrState' anything other than USA"
        ],

        [
            "this must be 'bob smith' when 'some.target.path' is 'john' or 'jim'",
            "or if some.path is 'something else'. this must not be set if some.where.else has been set."
        ],

        [
            "if something.else has been set then this must be empty"
        ]
    ],
    example            = {
        thisIsRequired: [
            {
                toBe: "USA",    // "any", "none", [ "item23", "item900" ]
                when: {
                    "some.path":       {
                        is: "any"    // "none", "itemSpecific", [ "item1", "item2", "item2" ]
                    },
                    "that.other.path": {
                        "isn't": "none"
                    }
                }
            },
            {
                toBe:   "any",    // "specific", "none", [ "item23", "item900" ]
                unless: {
                    "some.path": {
                        is: {
                            not: [ "item10", "someItem" ] // "any", "none", "itemSpecific"
                        }
                    }
                }
            },
            {
                toBe: "funny",
                when: "some.path"
            },
            {
                toBe: { not: "serious" },
                when: "some.path"
            },
            {
                toBe: "over-engineered",
                when: {
                    "some.path": {
                        "isn't": [ "abc", "def" ]
                    }
                }
            }
        ],
        thisIsIllegal:  [
            {
                toBe: "something", // "any", "none", [ "etc", "you", "get", "it by now" ]
                when: {
                    "some.path":       {
                        is: "none"  // "any", "specificItem", [ "item23", "item900" ]
                    },
                    "some.other.path": {
                        is: {
                            not: [ "a", "or b" ]
                        }
                    },
                    or:                {
                        "some.completely.other": {
                            "has": "any value"
                        }
                    }
                }

            },
            {
                toBe:   "none",   // blah...
                unless: {
                    "some.path": {
                        is: {
                            not: "something specific"   // "any", "none", [ "item23", "item900" ]
                        }
                    }
                }
            }
        ]
    };

for ( const test of example.thisIsRequired )
{
    console.log( '------------------------------------ TEST START\n', test, '\n\nbecomes\n' );
    console.log( JSON.stringify( collapse( test ), null, 4 ) );
}

for ( const test of example.thisIsIllegal )
{
    console.log( '------------------------------------ TEST START\n', test, '\n\nbecomes\n' );
    console.log( JSON.stringify( collapse( test ), null, 4 ) );
}

for ( const lines of exampleValidations )
{
    console.log( '------------------------------------ TEST START\n', lines, '\n\nbecomes\n' );
    let ln = clean_prose( lines );
    console.log( ln );
    let condensed = ln.map( match_longest );

    condensed = condensed
        .map( arr => {
                arr = arr
                    .map( str => str.replace( /(\b\S+\b)(($|\s+)\1)+/gi, '$1' ) )
                    .map( str => str.endsWith( ' if' ) ? str.split( /\s+(if)\s ) : str );

                const newArr = [];

                let i = 0, prev;

                while ( i < arr.length - 2 )
                {
                    if ( arr[ i + 1 ] === ',' )
                        prev = prev ? prev.concat( [ arr[ i ], arr[ i + 2 ] ] ) : [ arr[ i ], arr[ i + 2 ] ];
                    else
                    {
                        if ( prev )
                        {
                            newArr.push( prev );
                            prev = null;
                        }

                    }
                }

                return arr;
            }
        );

    console.log( 'remapped\n', condensed );
}
*/
