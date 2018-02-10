/** ******************************************************************************************************************
 * @file Describe what define-libraries does.
 * @author Julian Jensen <jjdanois@gmail.com>
 * @since 1.0.0
 * @date 04-Feb-2018
 *********************************************************************************************************************/



"use strict";

import { nodeName }                 from "../ts/ts-helpers";
import { GenericTypes, parse_type } from "./generics";
import { declare }         from "./symbol-table";
import { typescriptToSymbol }       from "./index";
import { array }                    from "convenience";
import { globals }                  from "./globals";

let currentOwner;

const
    visitors = {
        SourceFile,
        InterfaceDeclaration
    };

/**
 * @param {Node} node
 * @param {?Node} parent
 * @param {string} field
 * @param {number} index
 * @param {function} recurse
 */
export function visitor( node, parent, field, index, recurse )
{
    const type = nodeName( node );

    console.log( `Visitor: "${type}", has function? ${typeof visitors[ type ] === 'function'}` );

    return visitors[ type ] ? visitors[ type ]( node, parent, field, index, recurse ) : true;
}

function SourceFile( node, parent, field, index, recurse )
{
    // console.log( 'idents:', node.identifiers );
    recurse( node.statements );
}

function InterfaceDeclaration( node, parent, field, i, recurse )
{
    let name     = node.name.escapedText,
        info     = typescriptToSymbol( name ),
        generics = parse_type( node.typeParameters ),
        klass    = info.isA || declare( name, 'interface' );

    klass.typeParameters = new GenericTypes( ...( array( generics ) ? generics : [ generics ] ) );

    currentOwner = info;
    declare( klass, name );

    recurse( node.members );
}

/**
 * members[ 0 ]: "PropertySignature" => InterfaceDeclaration
 *  modifiers[ 0 ]: "ReadonlyKeyword" => PropertySignature
 *  name: "Identifier ("length")" => PropertySignature
 *  type: "NumberKeyword" => PropertySignature
 *  jsDoc[ 0 ]: "JSDocComment" => PropertySignature
 *
 * @param {Node} node
 * @param {?Node} parent
 * @param {string} field
 * @param {number} i
 * @param {function} recurse
 */
function PropertySignature( node, parent, field, i, recurse )
{
    let name = node.name.escapedText,
        decl = declare( name, type );
}