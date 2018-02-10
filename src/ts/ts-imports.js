"use strict";

// import { visit } from 'typescript-walk';
import { object, number, array, has } from 'convenience';
import ts                             from 'typescript';
import {
    indent,
    show_copy_paste,
    syntaxKind,
    nodeName,
    show_fields,
    collect_fields
}                                     from './ts-helpers';
import { traverse }                   from './ts-ast-walker';
import { inspect }                    from 'util';
import { nameOf }                     from 'typeofs';
import { visitor } from "../symbols/define-libraries";

const defaultOptions = {
    experimentalDecorators:     true,
    experimentalAsyncFunctions: true,
    jsx:                        true
};

let getComments;
let seen = new Set();


export const settings = {

    loadParser()
    {
        // workarounds issue described at https://github.com/Microsoft/TypeScript/issues/18062
        for ( const name of Object.keys( ts.SyntaxKind ).filter( x => isNaN( parseInt( x ) ) ) )
        {
            const value = ts.SyntaxKind[ name ];
            if ( !syntaxKind[ value ] )
                syntaxKind[ value ] = name;
        }
    },

    parse( filename, code, options = {} )
    {
        options = { ...defaultOptions, ...options };

        const compilerHost /* ts.CompilerHost */ = {
            fileExists:                () => true,
            getCanonicalFileName:      filename => filename,
            getCurrentDirectory:       () => '',
            getDefaultLibFileName:     () => 'lib.d.ts',
            getNewLine:                () => '\n',
            getSourceFile:             filename => ts.createSourceFile( filename, code, ts.ScriptTarget.Latest, true ),
            readFile:                  () => null,
            useCaseSensitiveFileNames: () => true,
            writeFile:                 () => null
        };

        const program = ts.createProgram( [ filename ], {
            noResolve:                  true,
            target:                     ts.ScriptTarget.Latest,
            experimentalDecorators:     options.experimentalDecorators,
            experimentalAsyncFunctions: options.experimentalAsyncFunctions,
            jsx:                        options.jsx ? 'preserve' : undefined
        }, compilerHost );

        const sourceFile = program.getSourceFile( filename );

        getComments = ( node, isTrailing ) => {
            if ( node.parent )
            {
                const nodePos   = isTrailing ? node.end : node.pos;
                const parentPos = isTrailing ? node.parent.end : node.parent.pos;

                if ( node.parent.kind === ts.SyntaxKind.SourceFile || nodePos !== parentPos )
                {
                    let comments = isTrailing
                                   ? ts.getTrailingCommentRanges( sourceFile.text, nodePos )
                                   : ts.getLeadingCommentRanges( sourceFile.text, nodePos );

                    if ( array( comments ) )
                    {
                        comments.forEach( ( comment ) => {
                            comment.type = syntaxKind[ comment.kind ];
                            comment.text = sourceFile.text.substring( comment.pos, comment.end );
                        } );

                        return comments;
                    }
                }
            }
        };

        function is_node( node )
        {
            return object( node ) && !seen.has( node ) && has( node, 'kind' );
        }

        function __walk( node, cb, key = '', indent = 0, parent )
        {
            if ( !is_node( node ) ) return;

            seen.add( node );

            collect_fields( node, parent );

            if ( cb( node, key, indent ) === false ) return false;

            for ( const key of Object.keys( node ) )
            {
                if ( key === 'parent' || key === 'constructor' || key.startsWith( '_' ) ) continue;

                const value = node[ key ];

                let r;

                if ( is_node( value ) )
                {

                    // const r = cb( value, key, indent, rn => array( rn ) ? rn.some( n => __walk( n, cb, indent + 1 ) ) : __walk( rn, cb, indent + 1 ) );
                    r = __walk( value, cb, key, indent + 1, node );
                    // r = __walk( value, cb, key, indent + 1 );
                }
                else if ( array( value ) && value.length )
                {
                    let brk = false;

                    value.some( val => {
                        if ( !is_node( val ) ) return;

                        // const r = cb( val, key, indent, rn => array( rn ) ? rn.some( n => __walk( n, cb, indent + 1 ) ) : __walk( rn, cb, indent + 1 ) );
                        r = __walk( val, cb, key, indent + 1, node );
                        if ( r === false ) return ( brk = true );
                    } );

                    if ( brk === true ) r = false;
                }

                if ( r === false ) return false;
            }

            return true;
        }

        // __walk( sourceFile, () => {} );

        // traverse( sourceFile, ( node, parent, field, index ) => {
        //     let name = nodeName( node );
        //
        //     if ( name === 'Identifier' && node.escapedText )
        //         name += ` ("${node.escapedText}")`;
        //     // else if ( name === 'JSDocParameterTag' )
        //     // {
        //     //     const tnode = Object.assign( {}, node );
        //     //     delete tnode.parent;
        //     //
        //     //     console.log( nameOf( node ) + ': ' + inspect( tnode, { depth: 1, colors: true } ) );
        //     //     if ( tnode.tagName )
        //     //         console.log( '----- tagName: ' + nameOf( tnode.tagName ) + ': ' + inspect( tnode.tagName, { depth: 1, colors: true } ) );
        //     // }
        //
        //     console.log( `${indent( node )}${field || 'root'}${number( index ) ? `[ ${index} ]` : ''}: "${name}" => ${parent ? nodeName( parent ) : 'root'}` );
        // } );

        // console.log( 'identifiers:', sourceFile.identifiers );
        // console.log( 'named:', [ ...sourceFile.getNamedDeclarations().keys() ] );
        // console.log( 'compute named:', [ ...sourceFile.computeNamedDeclarations().keys() ] );
        // console.log( 'ReadonlyArray:', sourceFile.getNamedDeclarations().get( 'ReadonlyArray' ) );
        return sourceFile;
    },

    define_symbols( ast )
    {
        traverse( ast, visitor, null, true );
    },

    dump_info()
    {
        // show_fields();
    },

    _ignoredProperties: new Set( [
        'constructor',
        'parent'
    ] ),

    *forEachProperty( node )
    {
        for ( let prop in node )
        {
            if ( this._ignoredProperties.has( prop ) || prop.charAt( 0 ) === '_' ) continue;

            yield {
                value: node[ prop ],
                key:   prop
            };
        }

        if ( node.parent )
        {
            yield {
                value:    getComments( node ),
                key:      'leadingComments',
                computed: true
            };
            yield {
                value:    getComments( node, true ),
                key:      'trailingCommments',
                computed: true
            };
        }
    },

    nodeToRange( node )
    {
        if ( typeof node.getStart === 'function' && typeof node.getEnd === 'function' )
            return [ node.getStart(), node.getEnd() ];
        else if ( typeof node.pos !== 'undefined' && typeof node.end !== 'undefined' )
            return [ node.pos, node.end ];
    }

    // walk( ast )
    // {
    //     class Visitor
    //     {
    //         constructor()
    //         {
    //             this.hasTypeParameters = new Set( [ syntaxKind.SignatureDeclaration, syntaxKind.ClassLikeDeclaration, syntaxKind.InterfaceDeclaration, syntaxKind.TypeAliasDeclaration, syntaxKind.JSDocTemplateTag ] );
    //         }
    //
    //         has( node )
    //         {
    //             if ( typeof node === 'string' )
    //                 return typeof this[ node ] === 'function';
    //
    //             return typeof this[ to_func( node ) ] === 'function';
    //         }
    //
    //         jump( node )
    //         {
    //             let fn = typeof node === 'string' ? node : to_func( node );
    //
    //             if ( typeof this[ fn ] !== 'function' ) return '';
    //
    //             // console.log( `No handler for "${fn}"` );
    //
    //             return this[ fn ]( node );
    //         }
    //
    //         get_params( params )
    //         {
    //             if ( !params || !params.length ) return '()';
    //
    //             return '( ' + params.map( p => this.parameter( p ) ).join( ', ' ) + ' )';
    //         }
    //
    //         get_type_params( typeParams )
    //         {
    //             if ( !typeParams || !typeParams.length ) return '';
    //
    //             return '<' + typeParams.map( tp => this.type_parameter( tp ) ).join( ', ' ) + '>';
    //         }
    //
    //         get_modifiers( modifiers )
    //         {
    //             if ( !modifiers || !modifiers.length ) return '';
    //
    //             const m = modifiers.map( n => from_keyword( n.kind ) ).join( ' ' );
    //
    //             return m ? m + ' ' : '';
    //         }
    //
    //         FunctionType( node )
    //         {
    //             return this.CallSignature( node );
    //         }
    //
    //         ConstructSignature( node )
    //         {
    //             return this.CallSignature( node, 'new ' );
    //         }
    //
    //         CallSignature( node, prefix = '' )
    //         {
    //             let name = this.get_type_params( node.typeParameters );
    //
    //             if ( node.kind !== syntaxKind.PropertySignature ) name += this.get_params( node.parameters );
    //
    //             if ( node.type )
    //             {
    //                 const sep = node.kind === syntaxKind.FunctionType ? ' => ' : ': ';
    //
    //                 name += sep + this.TypeNode( node.type );
    //             }
    //
    //             return this.get_modifiers( node.modifiers ) + prefix + name;
    //         }
    //
    //         MethodSignature( node )
    //         {
    //             return this.CallSignature( node, this.property_name( node.name ) + node.questionToken ? '?' : '' );
    //         }
    //
    //         PropertySignature( node )
    //         {
    //             return this.CallSignature( node, this.property_name( node.name ) + node.questionToken ? '?' : '' );
    //         }
    //
    //         EntityName( node )
    //         {
    //             if ( node.left )
    //                 return this.EntityName( node.left ) + '.' + node.right.text;
    //
    //             return node.text;
    //         }
    //
    //         property_name( node )
    //         {
    //             switch ( node.kind )
    //             {
    //                 case syntaxKind.Identifier:
    //                     return node.text;
    //
    //                 case syntaxKind.StringLiteral:
    //                     return "'" + node.text + "'";
    //
    //                 case syntaxKind.NumericLiteral:
    //                     return node.text;
    //
    //                 case syntaxKind.ComputedPropertyName:
    //                     return this.ComputedPropertyName( node );
    //             }
    //
    //             return 'prop name??';
    //         }
    //
    //         DeclarationName( node )
    //         {
    //             if ( node.kind === syntaxKind.BindingPattern )
    //                 return 'binding pattern';
    //
    //             return this.property_name( node );
    //         }
    //
    //         ComputedPropertyName( node )
    //         {
    //             return 'expression';
    //         }
    //
    //         BindingName( node )
    //         {
    //             return node.kind === syntaxKind.Identifier ? node.text : 'binding-name';
    //         }
    //
    //         TypeNode( node )
    //         {
    //             const
    //                 nodeName = syntaxKind[ node.kind ];
    //
    //             if ( nodeName === syntaxKind.ArrayType )
    //                 return this.jump( node ) + '[]';
    //
    //             let kw = from_keyword( nodeName ) || from_type( nodeName ) || this.jump( node );
    //
    //             console.error( `No type_node name from ${nodeName}` );
    //
    //             return kw;
    //         }
    //
    //         TypeReference( node )
    //         {
    //             let typeArgs = '';
    //
    //             if ( node.typeArguments ) typeArgs = '<' + node.typeArguments.map( ta => this.TypeNode( ta ) ).join( ', ' ) + '>';
    //
    //             return this.EntityName( node.typeName ) + typeArgs;
    //         }
    //
    //         TypePredicate( node )
    //         {
    //             return node.parameterName.kind === syntaxKind.Identifier ? node.parameterName.text : 'ThisType' + ' is ' + this.type_node( node.type );
    //         }
    //
    //         TypeElement( node )
    //         {
    //             return node.name + node.questionToken ? '?' : '';
    //         }
    //
    //         TypeQuery( node )
    //         {
    //             return this.EntityName( node.exprName );
    //         }
    //
    //         TupleType( tuple )
    //         {
    //             return '[' + tuple.elementTypes.map( t => this.type_node( t ) ).join( ', ' ) + ']';
    //         }
    //
    //         type_parameter( node )
    //         {
    //             let name = node.name.text;
    //
    //             if ( node.constraint )
    //                 name += ' extends ' + this.type_node( node.constraint );
    //
    //             if ( node.default )
    //                 name += ' = ' + this.type_node( node.default );
    //
    //             return name;
    //         }
    //
    //         union_type( node )
    //         {
    //             return node.types.map( tr => this.jump( tr ) ).join( ' | ' );
    //         }
    //
    //         intersection_type( node )
    //         {
    //             console.log( SyntaxKind[ node.kind ] + ' -> ', Object.keys( node ) + ', type kind:', SyntaxKind[ node.type.kind ] );
    //             return node.types ? node.types.map( tr => this.jump( tr ) ).join( ' & ' ) : this.jump( node.type );
    //         }
    //
    //         parameter( node )
    //         {
    //             let name = this.get_modifiers( node.modifiers ) + node.dotDotDotToken ? '...' : '';
    //
    //             name += this.binding_name( node.name ) + ( node.questionToken ? '?' : '' ) + ( this.type ? ': ' + this.type_node( this.type ) : '' ) + ( node.initializer ? ' = initialize' : '' );
    //
    //             return name;
    //         }
    //
    //         generic_node( node )
    //         {
    //             let name = '';
    //
    //             if ( node.name && node.name.kind === syntaxKind.Identifier )
    //                 name = node.name.text;
    //
    //             if ( node.typeParameters )
    //                 name += '<' + node.typeParameters.map( tp => this.type_parameter( tp ) ).join( ', ' ) + '>';
    //
    //             if ( node.parameters )
    //                 name += '( ' + node.parameters.map( p => this.parameter( p ) ).join( ', ' );
    //             else
    //                 name += '()';
    //
    //             if ( node.type ) name += ': ' + this.node_type( node.type );
    //             return name;
    //         }
    //
    //         interface_declaration( node )
    //         {
    //             let ifc = this.get_modifiers( node.modifiers ) + node.name.text + this.get_type_params( node.typeParameters ) + ' {\n';
    //
    //             ifc += node.members.map( n => '    ' + this.jump( n ) + ';\n' ).join( ';\n    ' );
    //
    //             ifc += '\n}\n';
    //
    //             return ifc;
    //         }
    //
    //         missing( node )
    //         {
    //             console.log( `error kind: ${node.kind} (${SyntaxKind[ node.kind ]})` );
    //             return '';
    //         }
    //
    //         show_kind( node )
    //         {
    //             let subs = [];
    //
    //             for ( const { value, key, computed } of settings.forEachProperty( node ) )
    //             {
    //                 if ( object( value ) && has( value, 'kind' ) )
    //                     subs.push( {
    //                         key,
    //                         value
    //                     } );
    //                 else if ( array( value ) && value.length && object( value[ 0 ] ) && has( value[ 0 ], 'kind' ) )
    //                     subs.push( {
    //                         key,
    //                         value
    //                     } );
    //
    //                 show_kind( node, ...Object.keys( node ).filter( k => k !== 'parent' ) );
    //             }
    //
    //             subs.forEach( ( { key, value } ) => {
    //                 if ( object( value ) )
    //                 {
    //                     console.log( `${indent( value )}${key} =>` );
    //                     this.show_kind( node );
    //                 }
    //                 else
    //                 {
    //                     console.log( `${indent( value )}${key}[] =>` );
    //                     value.forEach( n => this.show_kind( n ) );
    //                 }
    //             } );
    //         }
    //
    //         Default( node )
    //         {
    //             // if ( seen.has( node ) ) return;
    //             //
    //             // seen.add( node );
    //
    //             if ( node.kind === SyntaxKind.SourceFile )
    //             {
    //                 node.statements.forEach( n => this.show_kind( n ) );
    //                 return false;
    //             }
    //
    //             let name = '';
    //
    //             if ( this.has( node ) )
    //             {
    //                 name = this.jump( node );
    //
    //                 console.log( `${indent( node )}${name}` );
    //
    //                 return false;
    //             }
    //             else
    //             {
    //                 const mn = to_func( syntaxKind[ node.kind ] );
    //
    //                 if ( mn.endsWith( 'Type' ) ) return this.type_node( node );
    //
    //                 console.log( `${node.kind}:${syntaxKind[ node.kind ]} -> ${mn}` );
    //
    //                 if ( !mn )
    //                     return this.missing( node );
    //
    //                 console.log( `Missing node kind: "${to_func( syntaxKind[ node.kind ] )}"` );
    //             }
    //         }
    //     }
    //
    //     const v = new Visitor();
    //
    //     v.Default( ast );
    //     // for ( const { key, value, computed } of settings.forEachProperty( ast ) )
    //     // {
    //     //
    //     // }
    //
    //     // visit( ast, new class { Default( node ) { return v.Default( node );  } } );
    // }
};
