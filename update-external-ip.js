#!/usr/bin/env node
/** ******************************************************************************************************************
 * @file Update my GoDaddy DNS in case my external IP changes.
 * @author Julian Jensen <jjdanois@gmail.com>
 * @since 1.0.0
 * @date 18-Feb-2018
 *********************************************************************************************************************/
"use strict";

const
    args          = process.argv.slice( 2 ),
    addIps        = args.filter( a => a.startsWith( 'http://' ) ),
    config        = {
        services:  [
            'http://icanhazip.com/',
            'http://ident.me/',
            'http://tnx.nl/ip',
            'http://myip.dnsomatic.com/',
            'http://ipecho.net/plain',
            'http://diagnostic.opendns.com/myip'
        ],
        timeout:   1000,
        userAgent: 'curl/',
        verbose:   args.includes( '-v' ) || args.includes( '--verbose' )
    },
    net           = require( 'net' ),
    url           = require( 'url' ),
    http          = require( 'http' ),
    https         = require( 'https' ),

    /**
     * Minimal logger implementation for verbose mode
     * @param  {Object} config
     * @return {Object} logger instance
     */
    loggerFactory = config => {
        return {
            error( ...args )
            {
                config.verbose && console.error( '[error]: ', ...args );
            },
            info( ...args )
            {
                config.verbose && console.log( '[info]: ', ...args );
            }

        };
    },

    /**
     * Checks if an IP is a valid v4 or v6
     * @param str
     * @return boolean
     */
    isIP          = str => net.isIP( str ) !== 0,

    logger        = loggerFactory( config ),
    error         = str => {
        logger.error( str );
        return new Error( str );
    },
    PassThrough   = require( 'stream' ).PassThrough,
    zlib          = require( 'zlib' );

if ( addIps.length ) config.services.unshift( ...addIps );

let apiKey = process.env.GODADDY_KEY || args.find( a => /[a-z0-9_]{30,}/i.test( a ) ) || null,
    apiSecret = process.env.GODADDY_SECRET || args.find( a => /[a-z0-9_]{20,29}/i.test( a ) ) || null;

if ( !apiKey || !apiSecret )
{
    config.verbose = true;
    logger.error( "Missing API key or secret from ENV or command line" );
    process.exit( 1 );
}

/**
 * @return {Promise<string>}
 */
async function update_ext_ip()
{
    for ( const url of config.services )
    {
        try
        {
            return await request( config, url );
        }
        catch ( err )
        {}
    }
}

/**
 * Creates a reusable request
 *
 * @param  {Object} config
 * @param  {string} url
 * @return {Promise<string>}
 */
function request( config, url )
{
    logger.info( `requesting IP from: ${url}` );

    return send( {
        url:     url,
        timeout: config.timeout,
        headers: { 'User-Agent': config.userAgent }
    } ).then( ( body = '' ) => {

        const ip = body.toString().replace( '\n', '' );

        if ( isIP( ip ) )
        {
            logger.info( `got valid IP from: ${url}` );
            return ip;
        }
        else
            throw error( `Got invalid IP from ${url}` );
    } ).catch( err => {
        throw error( `${err.message} from ${url}` );
    } );
}

/**
 *
 * @param opts
 * @return {Promise<any>}
 */
function get( opts )
{
    return new Promise( ( resolve, reject ) => {
        opts = typeof opts === 'string' ? { url: opts } : Object.assign( {}, opts );
        opts.headers = Object.assign( {}, opts.headers );

        if ( opts.url ) parseOptsUrl( opts );
        if ( opts.maxRedirects == null ) opts.maxRedirects = 10;

        let body;

        if ( opts.form ) body = typeof opts.form === 'string' ? opts.form : stringify( opts.form );
        if ( opts.body ) body = opts.json && !isStream( opts.body ) ? JSON.stringify( opts.body ) : opts.body;

        if ( opts.json ) opts.headers.accept = 'application/json';
        if ( opts.json && body ) opts.headers[ 'content-type' ] = 'application/json';
        if ( opts.form ) opts.headers[ 'content-type' ] = 'application/x-www-form-urlencoded';
        if ( body && !isStream( body ) ) opts.headers[ 'content-length' ] = Buffer.byteLength( body );
        delete opts.body;
        delete opts.form;

        if ( body && !opts.method ) opts.method = 'POST';
        if ( opts.method ) opts.method = opts.method.toUpperCase();

        // Request gzip/deflate
        const customAcceptEncoding = Object.keys( opts.headers ).some( function( h ) {
            return h.toLowerCase() === 'accept-encoding';
        } );
        if ( !customAcceptEncoding ) opts.headers[ 'accept-encoding' ] = 'gzip, deflate';

        // Support http/https urls
        const
            protocol = opts.protocol === 'https:' ? https : http,
            req      = protocol.request( opts, function( res ) {
                // Follow 3xx redirects
                if ( res.statusCode >= 300 && res.statusCode < 400 && 'location' in res.headers )
                {
                    opts.url = res.headers.location;
                    res.resume(); // Discard response

                    if ( opts.maxRedirects > 0 )
                    {
                        opts.maxRedirects -= 1;
                        resolve( simpleGet( opts ) );
                    }
                    else
                        reject( new Error( 'too many redirects' ) );

                    return;
                }

                const
                    tryUnzip = typeof decompressResponse === 'function' && opts.method !== 'HEAD';

                resolve( tryUnzip ? decompressResponse( res ) : res );
            } );

        req.on( 'timeout', function() {
            req.abort();
            reject( new Error( 'Request timed out' ) );
        } );

        req.on( 'error', reject );

        if ( body && isStream( body ) ) body.on( 'error', reject ).pipe( req );
        else req.end( body );
    } );
}

/**
 * @param stream
 * @return {Promise<any>}
 */
function concat( stream )
{
    const
        chunks = [];

    return new Promise( ( resolve, reject ) => {
        stream.on( 'data', chunk => chunks.push( chunk ) );
        stream.once( 'end', () => resolve( Buffer.concat( chunks ) ) );
        stream.once( 'error', reject );
    } );
}

/**
 * @param opts
 * @return {Promise<any>}
 */
function send( opts )
{
    return get.get( opts )
        .then( res => concat( res )
            .then( data => {

                if ( opts.json )
                {
                    try
                    {
                        data = JSON.parse( data.toString() );
                    }
                    catch ( err )
                    {
                        throw err;
                    }
                }

                return data;
            } )
        );
}

[ 'get', 'post', 'put', 'patch', 'head', 'delete' ].forEach( method =>
    get[ method ] = opts => {
        if ( typeof opts === 'string' ) opts = { url: opts };
        opts.method = method.toUpperCase();
        return get( opts );
    } );

/**
 * @param opts
 */
function parseOptsUrl( opts )
{
    const loc = url.parse( opts.url );

    if ( loc.hostname ) opts.hostname = loc.hostname;
    if ( loc.port ) opts.port = loc.port;
    if ( loc.protocol ) opts.protocol = loc.protocol;
    if ( loc.auth ) opts.auth = loc.auth;

    opts.path = loc.path;

    delete opts.url;
}

/**
 * @param obj
 * @return {boolean}
 */
function isStream( obj )
{ return typeof obj.pipe === 'function'; }

/**
 * @param v
 * @return {*}
 */
function stringifyPrimitive( v )
{
    switch ( typeof v )
    {
        case 'string':
            return v;

        case 'boolean':
            return v ? 'true' : 'false';

        case 'number':
            return isFinite( v ) ? v : '';

        default:
            return '';
    }
};

/**
 * @param obj
 * @param sep
 * @param eq
 * @param name
 * @return {string}
 */
function stringify( obj, sep, eq, name )
{
    sep = sep || '&';
    eq = eq || '=';

    if ( obj === null ) obj = undefined;

    if ( typeof obj === 'object' )
    {
        return Object.keys( obj )
            .map( k => {

                const ks = encodeURIComponent( stringifyPrimitive( k ) ) + eq;

                if ( Array.isArray( obj[ k ] ) )
                    return obj[ k ]
                        .map( v => ks + encodeURIComponent( stringifyPrimitive( v ) ) )
                        .join( sep );
                else
                    return ks + encodeURIComponent( stringifyPrimitive( obj[ k ] ) );
            } )
            .filter( Boolean )
            .join( sep );
    }

    if ( !name ) return '';

    return encodeURIComponent( stringifyPrimitive( name ) ) + eq + encodeURIComponent( stringifyPrimitive( obj ) );
}

/**
 * @param response
 * @return {*}
 */
function decompressResponse( response )
{
    // TODO: Use Array#includes when targeting Node.js 6
    if ( ![ 'gzip', 'deflate' ].includes( response.headers[ 'content-encoding' ] ) )
        return response;

    const
        unzip  = zlib.createUnzip(),
        stream = new PassThrough();

    mimicResponse( response, stream );

    unzip.on( 'error', err => {
        // Ignore empty response
        if ( err.code === 'Z_BUF_ERROR' )
        {
            stream.end();
            return;
        }

        stream.emit( 'error', err );
    } );

    response.pipe( unzip ).pipe( stream );

    return stream;
}

// We define these manually to ensure they're always copied
// even if they would move up the prototype chain
// https://nodejs.org/api/http.html#http_class_http_incomingmessage
const knownProps = [
    'destroy',
    'setTimeout',
    'socket',
    'headers',
    'trailers',
    'rawHeaders',
    'statusCode',
    'httpVersion',
    'httpVersionMinor',
    'httpVersionMajor',
    'rawTrailers',
    'statusMessage'
];

/**
 * @param fromStream
 * @param toStream
 */
function mimicResponse( fromStream, toStream )
{
    const toProps = Object.keys( toStream );
    const fromProps = new Set( Object.keys( fromStream ).concat( knownProps ) );

    for ( const prop of fromProps )
    {
        // Don't overwrite existing properties
        if ( toProps.includes( prop ) )
            continue;

        toStream[ prop ] = typeof fromStream[ prop ] === 'function' ? fromStream[ prop ].bind( fromStream ) : fromStream[ prop ];
    }
}

Promise
    .all( [ get_dns_ip(), update_ext_ip() ] )
    .then( ( [ daddy, extIp ] ) => check_dns_update( daddy, extIp ) )
    .then( () => logger.info( "All done..." ) )
    .catch( err => logger.error( err ) );

/**
 * @return {Promise<any>}
 */
function get_dns_ip()
{
    return send( {
        url:     "https://api.godaddy.com/v1/domains/ronincode.com/records/A/",
        json:    true,
        headers: {
            Authorization: `sso-key ${apiKey}:${apiSecret}`
        }
    } );
}

/**
 * @param {Array<object>} daddy
 * @param {string} ip
 * @return {Promise<void>}
 */
function check_dns_update( daddy, ip )
{
    let daddyIp;

    logger.info( `Received external IP:    ${ip}` );

    if ( Array.isArray( daddy ) && daddy.length === 1 )
    {
        daddyIp = daddy[ 0 ].data;

        logger.info( `Received godaddy DNS IP: ${daddy[ 0 ].data}` );
        logger.info( `Checking godaddy DNS A record IP, they ${ip === daddyIp ? '' : 'DO NOT '}match` );

        if ( daddyIp === ip ) return Promise.resolve();

        daddy[ 0 ].data = ip;

        return send( {
            url:     "https://api.godaddy.com/v1/domains/ronincode.com/records/A/",
            json:    true,
            body:    daddy,
            method:  'PUT',
            headers: {
                Authorization: `sso-key ${apiKey}:${apiSecret}`
            }
        } );
    }
    else
        throw new Error( "DNS response unclear." );
}
