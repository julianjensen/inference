/** ******************************************************************************************************************
 * @file Describe what investigate does.
 * @author Julian Jensen <jjdanois@gmail.com>
 * @since 1.0.0
 * @date 17-Feb-2018
 *********************************************************************************************************************/
"use strict";

function type_dump( obj, target = '' )
{
    const
        has                                    = ( o, n ) => !!o && Reflect.has( o, n ),
        arity = tn => typeof tn === 'function' ? `function(${tn.length})` : `${typeof tn}`,
        toName                                 = o => ( has( o, 'name' ) ? `"${o.name}" (${arity( o )})` : '"-"' ),
        syms                                   = o => o ? Object.getOwnPropertySymbols( o ) : [],
        sym_to_name = sym => sym.toString().substring( 7, sym.toString().length - 1 ),

        fake_sym = ( sym, o ) => ( { [ sym_to_name( sym ) ]: { value: o[ sym ] } } ),

        name_info                              = x => x
                                                      ? [ toName( x ), has( x, 'constructor' ) ? toName( x.constructor ) : '-', has( obj, 'prototype' ) && has( x.prototype, 'constructor' ) ? toName( x.prototype.constructor ) : '-' ]
                                                      : [ '', '', '' ],
        val                                    = x => has( x, 'value' ) ? arity( x.value ) : ( [ has( x, 'get' ) ? `get -> ${typeof x.get}` : '', has( x, 'set' ) ? `set -> ${typeof x.set}` : '' ].filter( y => !!y ).join( ', ' ) ),
        to_list                                = x => Object.keys( x ).sort().reduce( ( all, key ) => all.concat( { name: `${key}`, def:  val( x[ key ] ) } ), [] ),
        props                                  = x => !!x ? to_list( Object.getOwnPropertyDescriptors( x ) ) : {},
        syms_to_props                          = o => o ? to_list( syms( o ).map( y => fake_sym( y, o ) ).reduce( ( n, v ) => Object.assign( n, v ), {} ) ) : [],


        [ name, cname, pcname ]                = name_info( obj ),

        _objMembers = props( obj ).concat( syms_to_props( obj ) ),
        objMembers = _objMembers.length ? _objMembers.map( o => `${o.name}: ${o.def}` ).join( '\n ' ) : "No static properties.";
    // protoMembers = props( Object.getPrototypeOf( obj ) ).concat( syms_to_props( Object.getPrototypeOf( obj ) ) );

    let outp = `
/** *************************************************************************************
 * Name: ${name}
 * Constructor name: ${cname}
 * Members: ${objMembers.length}
 * Target: ${target || obj.toString()}
 ****************************************************************************************/
 
 Static symbols
 ==============
 ${objMembers}
 
`;

    let xyz = Object.getPrototypeOf( obj ),
        pcount = 0;

    while ( xyz )
    {
        let p = props( xyz ).concat( syms_to_props( xyz ) ),
            [ , cProtoName ] = name_info( xyz );

        outp += ` prototype ${!pcount ? '' : `(${pcount})`}
 ---------${!pcount ? '' : '---' + '-'.repeat( pcount.toString().length )}
 name: ${cProtoName}
 members: ${p.length}

`;

        outp += ' ' + p.map( o => `${o.name}: ${o.def}` ).join( '\n ' ) + '\n\n';

        xyz = Object.getPrototypeOf( xyz );
        ++pcount;
    }

    console.log( outp );
}

function func_name() { this.func_instance = function() {}; }
func_name.prototype.func_proto = function() {};
func_name.func_static = function() {};

var obj = {},
    fn = func_name,
    arr = [],
    afn = () => {},
    cls = class Abc {},
    acls = class {};


type_dump( obj, '{}' );
type_dump( fn, 'function func_name() {}' );
type_dump( new fn(), 'new func_name()' );
type_dump( arr, '[]' );
type_dump( afn, '() => {}' );
type_dump( cls, 'class Abc {}' );
type_dump( acls, 'class {}' );
type_dump( Object, 'Object' );
type_dump( Function, 'Function' );
type_dump( Array, 'Array' );
