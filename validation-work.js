/** ****************************************************************************************************
 *                         {
*                           "name": "requiredAndIllegal",
*                           "config": {
*                               "requiredIf": {
*                                   "agreement.agreementDocumentFinalized": { "value": "yes", "hint": "agreement details finalized" }
*                               },
*                               "relation": "EXISTS"
*                           }
*                       }
 *
 * File: multi-validator (gir-subs)
 * @author jensju on 1/25/18
 * @version 1.0.0
 *******************************************************************************************************/
define( function( require, exports, module ) {
    "use strict";

    const
        engineUtils       = require( 'cs.engine-utils' ),
        moment            = require( 'moment' ),
        isServer          = engineUtils.isServer(),
        isBrowser         = !isServer,
        output            = isBrowser
                            ? function() { console.log.apply( console, [].slice.call( arguments ) ); }
                            : function() {print.apply( null, [].slice.call( arguments ) ); },

        /**
         * Make the server just like home... Well, no, not really.
         * But we can, at least, do this.
         *
         * @type {{log: Function, error: Function, warn: Function}}
         */
        console           = isServer ? {
            log:   output,
            error: output,
            warn:  output
        } : ( ( 1, eval )( 'this' ) ).console,

        DEBUG             = false,
        RUNDEBUG          = true,
        TEST              = false,
        log               = ( ...args ) => DEBUG && console.log( ...args ),
        rlog              = ( ...args ) => RUNDEBUG && console.log( ...args ),
        json              = o => JSON.stringify( o, null, 4 ),


        ANY               = "*",
        NONE              = "!",
        SPECIFIC          = "=",
        ARRAY             = "n",
        has               = ( o, n ) => Object.prototype.hasOwnProperty.call( o, n ),
        // toString      = o => Object.prototype.toString.call( o ),
        isString          = s => typeof s === 'string',
        isObject          = o => typeof o === 'object' && o !== null && !Array.isArray( o ),
        hasValue          = val => {
            if ( val === null || val === undefined || val === false || val === 'no' ) return false;

            if ( Array.isArray( val ) ) return val.length > 0;

            if ( isObject( val ) )
            {
                const
                    keys = Object.keys( val );

                if ( !keys.length ) return false;

                return keys.some( key => hasValue( val[ key ] ) );
                // for ( const key of keys )
                //     if ( hasValue( val[ key ] ) ) return true;
                //
                // return false;
            }

            return !!val;
        },
        // toType        = thing => {
        //     const
        //         sysName = toString( thing );
        //
        //     return sysName.substring( 8, sysName.length - 1 ).toLowerCase();
        // },

        clean_text        = str => str.toLowerCase()
            .replace( /[\n\s]{2,}/g, ' ' )
            .replace( /[^a-z\s]+/, '' )
            .replace( /^\s*|\s*$/g, '' )
            .replace( /\s/g, ' ' ),

        camel_breaker     = str => str.replace( /([a-z])([A-Z])/g, ( $0, $1, $2 ) => $1 + ' ' + $2.toLowerCase() ),

        write_negate      = ( target, type, payload ) => {

            if ( type.startsWith( 'not ' ) )
                target[ type.substr( 4 ) ] = { not: payload };
            else
                target[ type ] = payload;
        },
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
            'equals'
        ],
        inequalities      = [
            'is not',
            'isnt',
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
            'must not be',
            'mustnt be',
            'must not equal',
            'mustnt equal',
            'must not match',
            'mustnt match'
        ],
        low               = [
            'less than',
            'earlier than',
            'before',
            'happen before',
            'sooner',
            'lower than',
            'smaller than',
            'less than',
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
        conditions        = [
            'when', 'if', 'where'
        ],
        notConditions     = [
            'unless', 'if not'
        ],
        secondVerb        = [
            'has been', 'have been', 'does', 'does have', 'have'
        ],
        notSecondVerb     = [
            'has not been', 'hasnt been',
            'does not', 'doesnt',
            'does not have', 'doesnt have',
            'has not', 'hasnt',
            'have not been', 'havent been'
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
            loweq,
            higheq,
            conditions,
            notConditions,
            secondVerb,
            notSecondVerb,
            any,
            none,
            array
        },
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
            else if ( ~low.indexOf( key ) ) return 'lt';
            else if ( ~loweq.indexOf( key ) ) return 'lte';
            else if ( ~high.indexOf( key ) ) return 'gt';
            else if ( ~higheq.indexOf( key ) ) return 'gte';

            return SPECIFIC;
        },
        trie = {},
        isAny             = str => ~any.indexOf( str ),
        isNone            = str => ~none.indexOf( str ),
        is_rhs            = res => !isString( res ) ? null : isAny( res ) ? ANY : isNone( res ) ? NONE : null,
        is_logical        = res => res === 'and' || res === 'or',
        is_cond           = res => res === 'if' || res === 'not if',
        is_check          = res => !!~[ 'eq', 'not eq', 'lt', 'not lt', 'lte', 'not lte', 'gt', 'not gt', 'gte', 'not gte' ].indexOf( res ), // res === 'eq' || res === 'not eq',
        is_date           = res => /(?:a )?(?:(?:valid|correct|proper) )date?/.test( res ),
        object_has_bounds = res => Object.keys( res ).find( k => !!~[ 'gt', 'lt', 'gte', 'lte' ].indexOf( k ) );

    low.push( ...low.map( l => 'to be ' + l ) );
    high.push( ...low.map( l => 'to be ' + l ) );

    loweq.push( ...low.map( s => s + ' or equal to' ) );
    higheq.push( ...high.map( s => s + ' or equal to' ) );

    function for_each_phrase( fn )
    {
        Object.keys( allLists )
            .forEach( name =>
                allLists[ name ].forEach( phr => fn( phr, name, allLists[ name ] ) )
            );
    }

    function remove_contactions( segment )
    {
        const x = segment.split( /\s+/ )
            .map( w => w.endsWith( 'nt' ) ? w.replace( /^(.*)nt$/, '$1 not' ) : w )
            .join( ' ' );

        return x === segment ? null : x;
    }

    function break_to_longest( str )
    {
        let singleWords = [ 'if', 'when', 'unless', 'not', 'clear', 'unset', 'none', 'blank', 'nothing', 'empty', 'missing', 'void', 'undefined' ],
            rxSplitter = new RegExp( String.raw`\b(${singleWords.join( '|' )})\b` ),
            strs = str.split( rxSplitter );
            // strs = str.split( /\b(if|when|unless|not|clear|unset|none|blank|nothing|empty|missing|void|undefined)\b/ );

        return strs.reduce( ( chunks, phrase ) => {
            if ( singleWords.includes( phrase ) )
                chunks.push( phrase );
            else
            {
                let long, rest = phrase;

                while ( rest )
                {
                    [ long, rest ] = get_longest_valid_prefix( rest );
                    if ( long )
                        chunks.push( long );
                    else
                    {
                        chunks.push( 'UNMATCHED:[' + rest + ']' );
                        rest = '';
                    }
                }
            }
        }, [] );
    }

    /**
     * @param {string} phrase
     * @return {string[]}
     */
    function get_longest_valid_prefix( phrase )
    {
        let phraseWords = phrase.split( ' ' ),
            long = [],
            current = trie;

        while ( phraseWords.length && current[ phraseWords[ 0 ] ] )
        {
            current = phraseWords[ 0 ];
            long.push( phraseWords.shift() );
        }

        return [ long.join( ' ' ), phraseWords.join( ' ' ) ];
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

    add_to_trie();

    /**
     * @typedef {object} SelfCheck
     * @property {string|Array<string>} [eq]
     * @property {string|Array<string>} [lt]
     * @property {string|Array<string>} [lte]
     * @property {string|Array<string>} [gt]
     * @property {string|Array<string>} [gte]
     */

    /**
     * @typedef {object} SettingCheck
     * @extends SelfCheck
     * @property {string} targetValue
     * @property {string} hint
     */

    /**
     * @typedef {object} Negated
     * @template T
     * @property {T} not
     */

    /**
     * @typedef {object} Validation
     * @property {SelfCheck|Negated<SelfCheck>} check
     * @property {Array<SettingCheck|Negated<SettingCheck>>|SettingCheck|Negated<SettingCheck>} [if]
     */

    /**
     * @param {object} base
     * @param {string} [indent='']
     * @return {Validation}
     */
    function collapse( base, indent = '' )
    {
        const
            newObj = {};

        if ( indent === '' )
            log( 'pre-collapse:', json( base ) );

        let keys = Object.keys( base );

        if ( !keys.length )
        {
            base.toBe = "any";
            keys      = [ 'toBe' ];
        }

        keys.forEach( key => {
            let
                obj     = base[ key ],
                subKeys = isObject( obj ) && Object.keys( obj );

            while ( !isPath( key ) && subKeys && subKeys.length === 1 && !isPath( subKeys[ 0 ] ) )
            {
                obj     = obj[ subKeys[ 0 ] ];
                key     = camel_breaker( key ) + ' ' + camel_breaker( subKeys[ 0 ] );
                subKeys = isObject( obj ) && Object.keys( obj );
            }

            const type = is_a( key ) || key;

            log( `${indent}Next key => key to type is "${key}" -> "${type}", object? ${isObject( obj )}, obj:`, obj );

            if ( isObject( obj ) )
            {
                log( indent + '  RHS is an object' );
                if ( isPath( key ) )
                {
                    log( indent + `${indent}    RHS -> isPath( ${key} ), hint: "${obj.hint || 'none (' + camel_breaker( key ) + ')'}", recursing...` );
                    newObj.targetValue = key;
                    newObj.check       = collapse( obj, indent + '    ' );
                    newObj.hint        = obj.hint || camel_breaker( key.split( '.' ).pop() );
                }
                else if ( is_logical( key ) )
                {
                    log( `${indent}    RHS is logical operator "${key}", recursing...` );
                    newObj[ key ] = collapse( obj[ key ] );
                }
                else
                {
                    log( `${indent}    key "${key}" was not a path but a "${type}", recursing...` );

                    let conds = reduce_cond( obj );
                    write_negate( newObj, type, conds );
                }
            }
            else if ( Array.isArray( newObj[ type ] ) )
            {
                log( `${indent}  Already had an array for type = "${type}" (from "${key}"), adding raw object = ${obj}:`, obj );
                newObj[ type ].push( obj );
            }
            else if ( has( newObj, type ) )
            {
                log( `${indent}  Already had a value for type = "${type}" (from "${key}"), adding raw object = ${obj}:`, obj );
                newObj[ type ] = [ newObj[ type ], obj ];
            }
            else if ( is_check( type ) )
            {
                log( `${indent}  We think it is a check ("${type}" from "${key}") and store ${obj} => ${is_rhs( obj ) || obj}:`, obj );
                obj = is_rhs( obj ) || obj;
                if ( type.startsWith( 'not ' ) )
                    newObj.check = { not: { [ type.substr( 4 ) ]: obj } };
                else
                    newObj.check = { [ type ]: obj };
            }
            else if ( is_cond( type ) )
            {
                log( `${indent}  This is a condition check for the dependent, condition is "${type}" from "${key}"` );
                const co = {
                    check:       { eq: ANY },
                    targetValue: obj
                };

                write_negate( newObj, type, co );
            }
            else
            {
                log( `${indent}  Vanilla type = "${type}" from "${key}", setting to:`, obj );
                write_negate( newObj, type, obj );
            }
        } );

        /**
         * @param {object} obj
         * @return {Array}
         */
        function reduce_cond( obj )
        {
            let hint,
                merge,
                boundCheck,
                bound;

            return Object.keys( obj )
                .reduce( ( soFar, k ) => {
                    if ( k === 'hint' )
                        hint = k;
                    else if ( is_logical( k ) )
                    {
                        return k === 'and'
                               ? soFar.concat( collapse( obj[ k ], indent + '    ' ) )
                               : soFar.concat( { or: collapse( obj[ k ], indent + '    ' ) } );
                    }
                    else
                    {
                        soFar.push( merge = {
                            check:       collapse( obj[ k ], indent + '    ' ).check,
                            targetValue: k,
                            hint:        hint || camel_breaker( k.split( '.' ).pop() )
                        } );

                        if ( has( merge.check, 'eq' ) && isObject( merge.check.eq ) && ( bound = object_has_bounds( merge.check.eq ) ) )
                        {
                            boundCheck = merge.check.eq[ bound ];
                            delete merge.check.eq;
                            merge.check[ bound ] = boundCheck;
                            log( `Merged 'eq' with sub check ${bound}:`, json( boundCheck ) );
                        }
                        log( `${indent}    targetValue: ${k}, hint: ${camel_breaker( k.split( '.' ).pop() )}` );
                        return soFar;
                    }
                }, [] );

        }

        if ( indent === '' ) log( 'collapsed:', json( newObj ) );

        return newObj;
    }

    if ( TEST )
    {
        const
            example = {
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
                    },
                    {
                        "toEqual": "any",
                        "when":    {
                            "agreement.invoiceAddrState": {
                                "is": "set"
                            }
                        }
                    },
                    {
                        "toEqual": "any",
                        "when":    "agreement.invoiceAddrState"
                    },
                    {
                        "toBe": "empty",
                        "if":   {
                            "aggrement.invoiceAddrCountry": {
                                "isn't": "USA"
                            }
                        }
                    },
                    {
                        "toBe": "empty",
                        "when": {
                            "aggrement.invoiceAddrCountry": {
                                "equals": "aggrement.registeredAddrCountry"
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

        Object.keys( example ).forEach( testKey => {
            for ( const test of example[ testKey ] )
            {
                log( '------------------------------------------------------------------------ TEST START\n',
                    json( test ),
                    '\n\n -------->\n' );
                log( json( collapse( test ) ) );
            }
        } );
    }

    const schemaUtils = require( 'cs.schema-utils' );

    /**
     * @param {object} entity
     * @return {function(string):*}
     */
    function getPath( entity )
    {
        return function( path ) {
            return schemaUtils.getByPath( entity, 'settings.' + path );
        };
    }

    /**
     * @param {string} lhs
     * @param {string} rhs
     * @return {function(function(object):function)}
     */
    function make_validator_factory( lhs, rhs )
    {
        return validatorFactory =>
            config => {
                let nestedValidator = validatorFactory( config );
                return ( name, val, entity ) => getPath( entity )( lhs ) !== rhs ? null : nestedValidator( name, val, entity );
            };
    }

    const
        onlyValidateIfFinal         = make_validator_factory( "agreement.agreementDetailsFinalized", "yes" ),
        onlyValidatePayingAgreement = make_validator_factory( "subscription.subscriptionType", "paying_agreement" );

    // /**
    //  * @param {function} validatorFactory
    //  * @return {function(string,*,object):?string}
    //  */
    // function onlyValidateIfFinal( validatorFactory )
    // {
    //     return function( config ) {
    //         var nestedValidator = validatorFactory( config );
    //         return function( name, val, entity ) {
    //             var agreementDetailsAreFinal = getPath( entity )( "agreement.agreementDetailsFinalized" ) === "yes";
    //             if ( !agreementDetailsAreFinal )
    //             {
    //                 return null;
    //             }
    //             return nestedValidator( name, val, entity );
    //         };
    //     };
    // }
    //
    // /**
    //  * @param {function} validatorFactory
    //  * @return {function(string,*,object):?string}
    //  */
    // function onlyValidatePayingAgreement( validatorFactory )
    // {
    //     return function( config ) {
    //         var nestedValidator = validatorFactory( config );
    //         return function( name, val, entity ) {
    //             var subscriptionTypeIsPayingAgreement =
    //                     getPath( entity )( "subscription.subscriptionType" ) === "paying_agreement";
    //             if ( !subscriptionTypeIsPayingAgreement )
    //             {
    //                 return null;
    //             }
    //             return nestedValidator( name, val, entity );
    //         };
    //     };
    // }


    function to_english( strKey )
    {
        if ( Array.isArray( strKey ) )
        {
            if ( strKey.length === 1 ) return to_english( strKey[ 0 ] );
            else if ( strKey.length === 2 ) return to_english( strKey[ 0 ] ) + ' or ' + to_english( strKey[ 1 ] );
            else
                return strKey.slice( 0, strKey.length - 1 ).map( to_english ).join( ', ' ) + ', or ' + to_english(
                    strKey[ strKey.length - 1 ] );
        }

        let r = strKey.indexOf( ' ' ) !== -1 ? strKey : camel_breaker( isPath( strKey )
                                                                       ? strKey.split( '.' ).pop()
                                                                       : strKey );
        if ( r === 'any' ) r = 'filled in';
        return r;
    }

    function sub_error( base )
    {
        let txt = '';

        Object.keys( base ).map( key => {
            const
                obj   = base[ key ],
                isObj = isObject( obj );

            if ( key === 'hint' ) return;

            if ( isPath( key ) && isObj && isString( obj.hint ) )
                txt += ' ' + to_english( key ) + ' ' + obj.hint;
            else if ( !isObj )
                txt += ' ' + to_english( key ) + ' ' + to_english( obj );
            else
                txt += ' ' + to_english( key ) + ' ' + sub_error( obj );
        } );

        return txt;
    }

    function make_error_message( raw )
    {
        let tailText = " on a finalized paying agreement.",
            txt      = sub_error( raw ).replace( /^\s*|\s*$/g, '' ) + tailText;

        return txt.replace( /\s{2,}/g, ' ' );
    }

    function equal( wanted, val )
    {
        let result;

        switch ( wanted )
        {
            case '*':
                result = hasValue( val );
                break;
            case '!':
                result = !hasValue( val );
                break;
            default:
                if ( Array.isArray( wanted ) )
                {
                    if ( Array.isArray( val ) )
                        result = wanted.some( chk => val.indexOf( chk ) !== -1 );
                    else
                        result = wanted.indexOf( val ) !== -1;
                }
                else if ( isString( val ) )
                {
                    rlog( `specific str: "${wanted}", is_date? ${is_date( wanted )}, rx test: ${/^\d\d\d\d-\d\d-\d\d$/.test( val )}` );
                    if ( is_date( wanted ) )
                        result = /^\d\d\d\d-\d\d-\d\d$/.test( val );
                    else
                        result = val == wanted;
                }
                else if ( val === null || val === undefined )
                    result = false;
                else
                {
                    console.error( 'value in setting:', val );
                    console.error( 'eq:', wanted );
                }
        }

        rlog( `result from check 'eq' of ${wanted} against ${val} is ${result}` );
    }

    function bounds( check, val, compType )
    {
        let result,
            wanted   = check[ compType ],
            dateComp = compType[ 0 ] === 'g' ? 'isAfter' : 'isBefore',
            andEqual = compType.length > 2,
            comp     = ( v1, v2 ) => compType[ 0 ] === 'g' ? v1 > v2 : v1 < v2;

        if ( isString( val ) && /^\d\d\d\d-\d\d-\d\d$/.test( val ) )
        {
            val    = moment( val, 'YYYY-MM-DD' );
            wanted = moment( wanted, 'YYYY-MM-DD' );

            result = val[ dateComp ]( wanted );
            if ( !result && andEqual ) result = val.isSame( wanted, 'day' );
        }
        else
            result = comp( val, wanted ) || ( andEqual && val == wanted );

        rlog( `result from ${wanted} ${compType} ${val} is ${result}` );

        return result;
    }

    function run_check( check, val )
    {
        let compType;

        rlog( 'run_check on val:', json( val ), ', against:', json( check ) );

        if ( check.not )
            return !run_check( check.not, val );

        const grab = val;
        rlog( 'grab:', json( grab ) );

        if ( !has( check, 'eq' ) )
        {
            compType = Object.keys( check ).find( k => !!~[ 'gt', 'lt', 'gte', 'lte' ].indexOf( k ) );
            return bounds( check, grab, compType );
        }
        else
            return equal( check.eq, grab );

        // let result;
        //
        // switch ( check.eq )
        // {
        //     case '*':
        //         result = hasValue( grab );
        //         break;
        //     case '!':
        //         result = !hasValue( grab );
        //         break;
        //     default:
        //         if ( Array.isArray( check.eq ) )
        //         {
        //             if ( Array.isArray( grab ) )
        //                 result = check.eq.some( chk => grab.indexOf( chk ) !== -1 );
        //             else
        //                 result = check.eq.indexOf( grab ) !== -1;
        //         }
        //         else if ( isString( grab ) )
        //             result = grab == check.eq;
        //         else if ( grab === null || grab === undefined )
        //             result = false;
        //         else
        //         {
        //             console.error( 'grab:', grab );
        //             console.error( 'eq:', check.eq );
        //         }
        // }
        //
        // rlog( `result from ${check.eq} against ${grab} is ${result}` );
        //
        // return result;
    }

    // function check_if( ifBlock, name, val, entity )
    // {
    //     rlog( 'ifBlock:', json( ifBlock ) );
    //     if ( !ifBlock ) return true;
    //
    //     if ( Array.isArray( ifBlock ) )
    //     {
    //         const
    //             soFar = ifBlock.some( ifb => check_if( ifb, name, val, entity ) );
    //
    //         if ( soFar )
    //         {
    //             rlog( 'result of soFar is true' );
    //             return soFar;
    //         }
    //
    //         const
    //             last = ifBlock[ ifBlock.length - 1 ];
    //
    //         if ( !last.or )
    //         {
    //             rlog( 'there is no "or" so the if evaluates to false' );
    //             return false;
    //         }
    //
    //         const r = check_if( last.or, name, val, entity );
    //
    //         rlog( 'returning from "or" block is ' + r );
    //
    //         return r;
    //     }
    //
    //     let x;
    //
    //     if ( ifBlock.or )
    //     {
    //         x = check_if( ifBlock.or, name, val, entity );
    //         rlog( 'we have an "or" which returns ' + x );
    //         return x;
    //     }
    //
    //     let tv = ifBlock.targetValue;
    //
    //     rlog( `targetValue is "${tv}", val is "${val}", and entity is "${tv && tv.indexOf( '.' ) !== -1 ? getPath( entity )( tv ) : 'n/a'}"` );
    //
    //     x = run_check( ifBlock.check, tv ? getPath( entity )( tv ) : val, entity );
    //
    //     rlog( 'single check in if block says ' + x );
    //
    //     return x;
    // }

    function entity_wrapper( entity, name, cond, negated )
    {
        const
            get         = getPath( entity ),
            targetValue = tv => val => tv ? get( entity )( tv ) : val,
            fp_check    = check => val => check.not ? !run_check( check.not, val ) : run_check( check, val ),
            fp_if       = ifb => {
                if ( !ifb )
                    return () => true;
                else if ( isObject( ifb ) && !ifb.or )
                {
                    let _val  = targetValue( ifb.targetValue ),
                        check = fp_check( ifb.check );

                    return val => check( _val( val ) );
                }
                else
                {
                    let last = ifb[ ifb.length - 1 ];

                    if ( last.or )
                    {
                        let rhs = fp_if( last.or ),
                            lhs = ifb.slice( 0, ifb.length - 1 ).map( fp_if );

                        return val => lhs( val ) || rhs( val );
                    }

                    let checks = ifb.map( fp_if );

                    return val => checks.some( fn => fn( val ) );
                }
            },
            check_if    = fp_if( cond.if ),
            check_main  = fp_check( cond.check );

        rlog( `Returning compiled wrappers for "${name}", negated? ${negated}, cond:`, json( cond ) );
        return val => {
            rlog( '------------------------------------------------ ' + name + ' ------------------------------------------------' );
            rlog( `Running check on name: ${name}, val: ${val}, if? ${!!cond.if}, check:`, cond.check );
            return check_if( val ) || check_main( val ) ^ negated;
        };
    }

    /**
     * @param {object} entity
     * @param {string} name
     * @param {object|Array<object>} inputObject
     * @param {boolean} negated
     * @param {boolean} hasNegated
     * @return {*}
     */
    function compile_blocks( entity, name, inputObject, negated, hasNegated )
    {
        if ( !inputObject )
        {
            if ( negated || hasNegated ) return () => null;
            inputObject = [ { toBe: 'any' } ];
        }
        else if ( !Array.isArray( inputObject ) ) inputObject = [ inputObject ];

        let startText         = negated ? "This is disallowed " : "This is required ",
            errs              = inputObject.map( raw => startText + make_error_message( raw ) ),

            compiledFunctions = inputObject.map( conds => entity_wrapper( entity, name, collapse( conds ), negated ) );

        return val => compiledFunctions.reduce( ( err, fn, i ) => err || ( fn( val ) ? null : errs[ i ] ), null );
    }

    /**
     * @param {object} entity
     * @param {string} name
     * @param {object} req
     * @param {object} ill
     * @return {function(*, *=): *}
     */
    function compile( entity, name, req, ill )
    {
        const
            rc = compile_blocks( entity, name, req, false, !!ill ),
            ic = compile_blocks( entity, name, ill, true, false );

        return ( name, val ) => rc( val ) || ic( val );
    }

    if ( TEST ) return;

    module.exports = {
        multiValidate: onlyValidateIfFinal( onlyValidatePayingAgreement( config => {
            let compiled,
                prevEntity;

            return ( name, val, entity ) => {

                if ( !compiled || entity !== prevEntity )
                {
                    prevEntity = entity;
                    compiled   = compile( entity, name, config.thisIsRequired, config.thisIsIllegal );
                }

                return compiled( name, val, entity );
            };
            // if ( !compiled )
            //     compiled = compile( entity, name, config.thisIsRequired, config.thisIsIllegal );
            // // {
            // //     compiled = ( ( req, ill ) => {
            // //
            // //         const
            // //             rc = compile_blocks( req, false, !!ill ),
            // //             ic = compile_blocks( ill, true, false );
            // //
            // //         return ( name, val ) => rc( val ) || ic( val );
            // //
            // //     } )( config.thisIsRequired, config.thisIsIllegal );
            // // }

        } ) )
    };
} );



