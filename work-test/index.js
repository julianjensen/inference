/** ****************************************************************************************************
 * File: index (jsdoc-tag-parser)
 * @author julian on 2/1/18
 * @version 1.0.0
 * @copyright Planet3, Inc.
 *******************************************************************************************************/
'use strict';

let has               = ( o, n ) => Object.prototype.hasOwnProperty.call( o, n ),
    // toString      = o => Object.prototype.toString.call( o ),
    isString          = s => typeof s === 'string',
    isObject          = o => typeof o === 'object' && o !== null && !Array.isArray( o ),
    $ = obj => JSON.stringify( obj, null, 4 ),

    ANY               = "*",
    NONE              = "!",
    SPECIFIC          = "=",
    ARRAY             = "n",

    equalities        = [
        'has',
        'be',
        'is',
        'to be',
        'to equal',
        'to match',
        'to be the same as',
        'to not differ from',
        'must be',
        'must match',
        'must be set to',
        'equals',
        'is equal to'
    ],
    inequalities      = [
        'isnt',     // is not
        'not to be',
        'to not be',
        'to be not',
        'to differ from',
        'to not equal',
        'to not match',
        'not to equal',
        'not to match',
        'anything other than',
        'something other than',
        'must not',
        'mustnt be',    // must not be
        'mustnt equal', // must not equal
        'mustnt match',  // must not match
        'isnt equal to'
    ],
    low               = [
        'less than',
        'earlier than',
        'before',
        'happen before',
        'sooner',
        'lower than',
        'smaller than',
        'at most',
        'no more than',
        'no greater than',
        'no later than'
    ],
    high              = [
        'more than',
        'later than',
        'after',
        'happen after',
        'later',
        'greater than',
        'bigger than',
        'higher than',
        'at least',
        'no less than',
        'no earlier than'
    ],
    loweq             = [],
    higheq            = [],
    conditions        = [ 'when', 'if', 'where' ],
    notConditions     = [ 'unless', 'if not' ],
    secondVerb        = [
        'has been', 'have been', 'does', 'does have', 'have'
    ],
    notSecondVerb     = [
        'hasnt been',
        'doesnt',
        'doesnt have',
        'hasnt',
        'havent been'
    ],
    any =  [
        'any',
        'exists',
        'exist',
        'anything',
        'set',
        'entered',
        'something',
        'any value',
        'not empty',
        'not missing',
        'a value',
        'some value'
    ],
    none = [
        'clear',
        'unset',
        'none',
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
    array = [ 'one of', 'exist in', 'exists in' ],
    allLists          = {
        equalities,
        inequalities,
        low,
        high,
        conditions,
        notConditions,
        secondVerb,
        notSecondVerb,
        any,
        none,
        array
    },
    clean_text        = str => str.toLowerCase()
        .replace( /[\n\s]{2,}/g, ' ' )
        .replace( /[^a-z\s]+/, '' )
        .replace( /^\s*|\s*$/g, '' )
        .replace( /\s/g, ' ' ),

    camel_breaker     = str => str.replace( /([a-z])([A-Z])/g, ( $0, $1, $2 ) => $1 + ' ' + $2.toLowerCase() ),
    trie = {},
    isPath            = p => ( p[ 0 ] === "'" && p.endsWith( "'" ) ) || p === 'this' || ~p.indexOf( '.' ),
    is_a              = ( key, allowSecond = false ) => {

        if ( isPath( key ) ) return 'path';

        key = clean_text( camel_breaker( key ) );

        if ( ~any.indexOf( key ) ) return ANY;
        else if ( ~none.indexOf( key ) ) return NONE;
        else if ( ~array.indexOf( key ) ) return ARRAY;

        else if ( ~equalities.indexOf( key ) ) return 'eq';
        else if ( allowSecond && ~secondVerb.indexOf( key ) ) return 'eq';
        else if ( ~inequalities.indexOf( key ) ) return 'not eq';
        else if ( allowSecond && ~notSecondVerb.indexOf( key ) ) return 'not eq';
        else if ( ~conditions.indexOf( key ) ) return 'if';
        else if ( ~notConditions.indexOf( key ) ) return 'not if';
        else if ( ~allLists.low.indexOf( key ) ) return 'lt';
        else if ( ~allLists.loweq.indexOf( key ) ) return 'lte';
        else if ( ~allLists.high.indexOf( key ) ) return 'gt';
        else if ( ~allLists.higheq.indexOf( key ) ) return 'gte';

        return SPECIFIC;
    };

allLists.low = low = low.concat( low.map( l => 'to be ' + l ) ).concat( low.map( l => 'is ' + l ) );
allLists.loweq = low.map( l => l + ' or equal to' );
allLists.high = high = high.concat( high.map( l => 'to be ' + l ) ).concat( high.map( l => 'is ' + l ) );
allLists.higheq = high.map( l => l + ' or equal to' );

/**
 * @param {function} fn
 */
function for_each_phrase( fn )
{
    Object.keys( allLists )
        .forEach( name =>
            allLists[ name ].forEach( phr => fn( phr, name, allLists[ name ] ) )
        );
}

/**
 * @param {string} segment
 * @return {string}
 */
function remove_contactions( segment )
{
    const x = segment.split( /\s+/ )
        .map( w => w.endsWith( 'nt' ) ? w.replace( /^(.*)nt$/, '$1 not' ) : w )
        .join( ' ' );

    return x === segment ? null : x;
}

/**
 * @param {string} str
 * @return {Array<string>}
 */
function break_to_longest( str )
{
    str = remove_contactions( str ) || str;
    str = str.replace( /[^-a-zA-Z0-9 .]/, '' );

    let singleWords = [ 'if', 'when', 'unless', 'clear', 'unset', 'none', 'blank', 'nothing', 'empty', 'missing', 'void', 'undefined', 'then', 'this' ],
        rxSplitter = new RegExp( String.raw`\b(${singleWords.join( '|' )})\b` ),
        strs = str.split( rxSplitter );

    const prepped = strs.reduce( ( chunks, phrase ) => {
        if ( singleWords.includes( phrase ) )
            chunks.push( phrase );
        else
        {
            let long, brokeOn, rest = phrase.split( ' ' );

            while ( rest.length )
            {
                [ long, brokeOn, rest ] = get_longest_valid_prefix( rest );
                if ( long )
                {
                    chunks.push( long );
                    if ( brokeOn ) rest.unshift( brokeOn );
                }
                else if ( brokeOn )
                {
                    if ( /[-+]?\d+(?:\.\d+)?/.test( brokeOn ) || /\d\d\d\d-\d\d-\d\d/.test( brokeOn ) )
                        chunks.push( Number( brokeOn ) );
                    else
                        chunks.push( brokeOn );
                }
            }
        }

        return chunks;
    }, [] );

    return final_form( flip( prepped ) );
}

/**
 * @param {string[]} phraseWords
 * @return {string[]}
 */
function get_longest_valid_prefix( phraseWords )
{
    let long = [],
        tryWord,
        current = trie;

    while ( phraseWords.length && current[ tryWord = phraseWords.shift() ] )
    {
        current = current[ tryWord ];
        long.push( tryWord );
        tryWord = null;
    }

    return [ long.join( ' ' ), tryWord, phraseWords ];
}

/**
 *
 */
function add_to_trie()
{
    for_each_phrase( ( phrase, listName ) => {
        const end = phrase.split( ' ' ).reduce( ( obj, word ) => obj[ word ] || ( obj[ word ] = {} ), trie );
        if ( has( end, '$' ) )
            console.error( `Duplicate phrase found: "${phrase}"` );
        else
            end.$ = listName;
    } );
}

for_each_phrase( ( phrase, name, list ) => {
    const broken = remove_contactions( phrase );

    if ( broken ) list.push( broken );
} );

function flip( brokenDown )
{
    const firstWord = brokenDown[ 0 ];

    if ( firstWord === 'this' || ( !conditions.includes( firstWord ) && !notConditions.includes( firstWord ) ) )
    {
        const
            condIndex = brokenDown.findIndex( w => w === 'if' || w === 'when' || w === 'unless' );

        return condIndex === -1 ? [ brokenDown, [] ] : [ brokenDown.slice( 0, condIndex ), brokenDown.slice( condIndex + 1 ) ];
    }

    const
        thenIndex = brokenDown.findIndex( w => w === 'then' ),
        thisIndex = thenIndex === -1 && brokenDown.findIndex( w => w === 'this' );

    if ( thenIndex === -1 && thisIndex === -1 )
        return [ [ 'this', 'must be set' ], brokenDown ];
    else if ( thenIndex !== -1 )
        return [ brokenDown.slice( thenIndex + 1 ), brokenDown.slice( 0, thenIndex ) ];
    else
        return [ brokenDown.slice( thisIndex ), brokenDown.slice( 0, thisIndex ) ];
}

function final_form( segments )
{
    let top = {}, cond = {}, li;

    li = segments[ 0 ].length - 2;
    segments[ 0 ].reduce( ( obj, phrase, i ) => i === li ? obj[ phrase ] = segments[ 0 ][ i + 1 ] : i < li ? obj[ phrase ] = {} : obj, top );
    li = segments[ 1 ].length - 2;
    segments[ 1 ].reduce( ( obj, phrase, i ) => i === li ? obj[ phrase ] = segments[ 1 ][ i + 1 ] : i < li ? obj[ phrase ] = {} : obj, cond );

    if ( cond.if )
    {
        if ( cond.if.if ) cond.if = cond.if.if;
        else if ( cond.if.when ) cond.if = cond.if.when;
    }
    else if ( cond.unless )
        cond = { not: cond.unless };

    if ( cond.if ) cond = cond.if;

    const
        obj = { check: top.this, if: cond },
        _walk = obj => {

            if ( !obj || isString( obj ) || typeof obj === 'number' ) return obj;

            const r = {};

            Object.keys( obj ).forEach( key => {
                const val = obj[ key ];

                if ( key === 'not' ) return r.not = _walk( val );

                const type = is_a( key );

                if ( type === 'path' )
                    r[ key ] = _walk( val );
                else if ( type.startsWith( 'not ' ) )
                    r.not = { [ type.substr( 4 ) ]: _walk( val ) };
                else
                    r[ type ] = _walk( val );
            } );

            return r;
        };

    const r = { check: _walk( obj.check ), if: _walk( obj.if ) };

    if ( r.if.if ) r.if = r.if.if;

    return r;
}



add_to_trie();

console.log( $( break_to_longest( "this must be set to any value when bling.blong is not equal to boob" ) ) );
console.log( $( break_to_longest( "if glam.blang is greater than 123" ) ) );
console.log( $( break_to_longest( "if glam.blang is greater than 123 then this must be empty" ) ) );
console.log( $( break_to_longest( "unless glam.blang is less than or equal to 123 then this must be empty" ) ) );
console.log( $( break_to_longest( "if bloog.loog isn't blank then this must be set to kabloom" ) ) );
console.log( $( break_to_longest( "when glam.blang is greater than 123, this must be empty" ) ) );
// console.log( JSON.stringify( trie, null, 4 ) );
// this must be any when some.thing is 123 and something.else is hi.there