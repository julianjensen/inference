#!/usr/bin/env node
/** ******************************************************************************************************************
 * @file Describe what extract-enums does.
 * @author Julian Jensen <jjdanois@gmail.com>
 * @since 1.0.0
 * @date 10-Mar-2018
 *********************************************************************************************************************/
"use strict";

const
    fs        = require( 'fs' ),
    rxEnums   = /const\s+enum\s+([^\s]+)\s*{\s*([\s\S]*?)\s*,?\s*}/g,
    rxMembers = /^\s*(?:\/\*.*?\*\/)?\s*([^\s=]+)\s*(?:=\s*([^,$}]+))?[,$}]/gm,
    names = [],
    num2str = ( p, lhsName ) => `${p}[ +${p}.${lhsName}.value ] = typeof ${p}[ +${p}.${lhsName}.value ] !== 'number' ? named( '${lhsName}' ) : ${p}[ +${p}.${lhsName}.value ];`;

/**
 * Use as a tag function for a tagged string template literal. It will find the smallest indent and remove that from every line.
 * In other words, you can now tab your multi-line template string to where they look nice but they'll still come nice and correct
 * when printed.
 *
 * @param {Array<string>} strings
 * @param {*[]} stuffAndThings
 * @return {string}
 */
function strip( strings, ...stuffAndThings )
{
    const
        finalStr = strings.reduce( ( soFar, str, i ) => soFar + stuffAndThings[ i ] + str ),
        match  = finalStr.match( /^[^\S\n]*(?=\S)/gm ),
        indent = match && match.reduce( ( minLng, m ) => m.length < minLng ? m.length : minLng, Infinity );

    return !indent || indent === Infinity ? finalStr : finalStr.replace( new RegExp( `^\\s{${indent}}`, 'gm' ), '' );
}

let m,
    args = process.argv.slice( 2 ),
    i = 0,
    exclude = [];

while ( i < args.length )
{
    if ( args[ i ] === '-x' || args[ i ] === '--exclude' )
    {
        if ( i + 1 === args.length )
            throw new Error( `Missing argument for 'exclude' flag` );

        exclude = exclude.concat( args[ i + 1 ].split( ',' ) );
        args.splice( i, 2 );
    }
    else if ( /^--exclude=(.*)$/.test( args[ i ] ) )
    {
        exclude = exclude.concat( args[ i ].replace( /^--exclude=(.*)$/, '$1' ).split( ',' ) );
        args.splice( i, 1 );
    }
    else
        i++;
}

args.forEach( ( src, i ) => dump_them( src, fs.readFileSync( src, 'utf8' ), !i ) );

console.log( `export {\n    ${names.join( ',\n    ' )}\n};` );

// console.log( `
// const sym = SymbolFlags.create( SymbolFlags.Method | SymbolFlags.Class );
//
// console.log( \`symbol method string: \${SymbolFlags.Method}\` );
// console.log( \`symbol method number: \${+SymbolFlags.Method}\` );
// console.log( \`sym string: \${sym}\` );
// console.log( \`--------------------------------------------------------------------------\` );
// console.log( 'DEBUG:' );
// console.log( DEBUG );
// ` );

/**
 * @param {string} fileName
 * @param {string} source
 * @param {boolean} isFirst
 */
function dump_them( fileName, source, isFirst )
{

    if ( isFirst )
    {
        console.log( `/* eslint-disable max-len,max-lines,operator-linebreak */
/** *********************************************************************************************************************
 * Enums extracted from ${fileName}
 ************************************************************************************************************************/
"use strict";
        
import util from "util";

let tmp;

const
    isObject = o => typeof o === 'object' && !Array.isArray( o ) && o !== null,
    wrapped = ( lhs, rhs ) => ( { enumerable: true, writable: true, configurable: true, value: { toString: () => lhs, valueOf: () => rhs, [ Symbol.toPrimitive ]: hint => hint === 'string' ? lhs : rhs } } ),
    named = name => ( { enumerable: true, writable: true, configurable: true, value: name } ),
    VALUE = Symbol( 'value' ),
    asString = function( base ) { 
        return function( _num = 0 ) {
            let i   = 1,
                s   = [],
                num = +_num;
                                
                if ( typeof _num === 'string' ) return _num;
                                
                while ( num )
                {
                    if ( num & 1 )
                        s.push( \`\${base[ i ]}\` );
                                
                    num >>>= 1;
                    i <<= 1;
                }
                                
                return s.join( ' | ' );
            };
        },
    templ = () => ( {
        create( val )
        {
            const o = Object.create( Object.getPrototypeOf( this ) );
            o[ VALUE ] = +( isObject( val ) && Reflect.has( val, VALUE ) ? val[ VALUE ] : ( +val || 0 ) );
            return o;
        },
        get value() { return this[ VALUE ]; },
        set value( v ) { this[ VALUE ] = v; },
        asString,
        toString() { return this[ VALUE ] ? this.asString( this[ VALUE ] ) : '<no value>'; },
        valueOf() { return this[ VALUE ] || 0; },
        [ Symbol.toPrimitive ]( hint ) { return hint === 'string' ? this.toString() : this.valueOf(); },
        [ util.inspect.custom ]( depth, options ) { return this.toString(); }
    } );\n` );
    }
    else
    {
        console.log( `/** *********************************************************************************************************************` );
        console.log( ` * Enums extracted from ${fileName}` );
        console.log( ` ************************************************************************************************************************/\n` );
    }


    while ( ( m = rxEnums.exec( source ) ) !== null )
    {
        const
            [ , name, members ] = m;

        if ( exclude.includes( name ) ) continue;

        names.push( name );

        console.log( `/** *********************************************************************************************************************` );
        console.log( ` * @enum` );
        console.log( ` * @name ${name}` );
        console.log( ` ************************************************************************************************************************/` );
        console.log( `let ${name} = {};` );

        make_enum( name, members.trim().endsWith( '}' ) ? members.trim() : members.trim()  + '}' );

        console.log( `\n${name} = Object.create( tmp = templ(), ${name} );\ntmp.asString = asString( ${name} );\n` );
    }

    /**
     * @param {string} enumClass
     * @param {string} members
     */
    function make_enum( enumClass, members )
    {
        const
            p = `${enumClass}`;

        let enumVal = 1;

        while ( ( m = rxMembers.exec( members ) ) )
        {
            let [ , lhsName, rhs ] = m;

            rhs = rhs === void 0 ? enumVal++ : rhs;

            console.log( add( lhsName, rhs ) );
        }

        /**
         * @param {string} lhsName
         * @param {string} rhs
         * @return {string}
         */
        function add( lhsName, rhs )
        {
            let rhsType = /^[A-Z][A-Za-z0-9_]+$/.test( rhs ) ? 'name' : /^\d/.test( rhs ) ? 'number' : 'combo';

            if ( rhsType === 'number' )
                return `${p}.${lhsName} = wrapped( '${lhsName}', ${rhs} );\n${num2str( p, lhsName )}`;
            else if ( rhsType === 'name' )
                return `${p}.${lhsName} = wrapped( '${lhsName}', +${p}.${rhs} );\n${num2str( p, lhsName )}`;
            else
            {
                const
                    fixed = rhs.replace( /([A-Z][A-Za-z0-9_]+)/g, p + '.' + '$1' ).replace( /\(/g, '( ' ).replace( /\)/g, ' )' );

                return `${p}.${lhsName} = wrapped( '${lhsName}', ${fixed} );\n${num2str( p, lhsName )}`;
            }
        }
    }
}


