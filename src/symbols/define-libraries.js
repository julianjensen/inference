/** ******************************************************************************************************************
 * @file Describe what define-libraries does.
 * @author Julian Jensen <jjdanois@gmail.com>
 * @since 1.0.0
 * @date 04-Feb-2018
 *********************************************************************************************************************/

"use strict";

import { nodeName }   from "../ts/ts-helpers";
import { parse_type } from "./generics";
import { declare }    from "./symbol-table";

let currentOwner;

const
    visitors = {
        SourceFile: ( node, parent, field, i, recurse ) => recurse( node.statements ),

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

    return visitors[ type ] ? visitors[ type ]( node, parent, field, index, recurse ) : true;
}

function InterfaceDeclaration( node, parent, field, i, recurse )
{
    const
        name = node.name.escapedText,
        generics = parse_type( node.typeParameters ),
        klass = declare( 'class', name );


    klass.typeParameters.push( ...( Array.isArray( generics ) ? generics : [ generics ] ) );
    currentOwner = klass;

    recurse( node.members );
}

function PropertySignature( node, parent, field, i, recurse )
{

}