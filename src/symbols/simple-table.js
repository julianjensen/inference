/** ****************************************************************************
 * Clean start on a symbol table
 *
 * An abstract object can be defined as the following:
 *
 * 1. It may have a value
 * 2. It may have a name
 * 3. It may have a type
 *
 * A type can be defined as follows:
 *
 * 1. It can be irreducible, i.e. a primitive
 * 2. It can be an alias, a name the refers to another type
 * 3. It can be a structured type also called a mapped type
 * 4. It can be an indexed type like an array or tuple
 * 5. It can be an enumerated type
 * 6. It can be a union or intersection of types
 *
 * There exist templates which are incomplete types, therefore not types. They have
 * placeholders. In order for a template to become a type it must be instatiated with
 * actual types in place of the type variables (i.e. the placeholders). If other placeholders
 * are provided, the template is instantiated as a new template.
 *
 * A symbol in a symbol table will always have a name. It may have a value. It always
 * has a type. If the type isn't known then the default type is "any"
 *
 * Only named entities go into the symbol table. Temporary values will be defined
 * on the relevant AST node. Anonymous types will receive an generated hidden symbol
 * while it's in scope.
 *
 * A name in a symbol table may refer to
 *
 * 1. a type
 * 2. a template
 * 3. an instantiated type, i.e. a value (may be undefined)
 * 4. a type alias
 *
 * In C/C++ terms, a named entity can be
 *
 * 1. a declaration
 * 2. a template (or generic) type
 * 3. a definition
 * 4. a type alias (either a `typedef` or `using`)
 *
 * A type alias is a straight-up substitution.
 *
 * @author julian.jensen
 * @since 0.0.1
 *******************************************************************************/
"use strict";

import globals from '../utils/globals';
import { walk_symbols } from "../ts/ts-symbols";

const
    detection = new Set(),
    defs = [],
    counts = {};

/** */
class SymbolTable
{
    /**
     *
     * Types are:
     * * `'scope'` for regular environment declaration records
     * * `'param'` for formal parameters with default values
     * * `'container'` for properties on an object
     *
     * @param {?SymbolTable} parent
     * @param {string} [type='scope']   - 'scope', 'param', 'container'
     */
    constructor( parent, type )
    {
        this.parent = parent;
        this.symbols = new Map();
        this.type = type;
    }

    add( name, typeDef )
    {
        this.symbols.set( name, typeDef );
    }
}

/**
 * @param {object} sym
 */
function add_symbol( sym )
{
    const symName = sym.name;

    if ( !sym.name )
        throw new Error( `No 'name' property for symbol` );

    const types = sym.decls.map( s => s.kind ).join( ', ' );

    if ( detection.has( types ) )
        ++counts[ types ];
    else
    {
        counts[ types ] = 1;
        detection.add( types );
    }

    if ( types === 'FunctionDeclaration, FunctionDeclaration, FunctionDeclaration' )
        defs.push( sym.decls );
}

const
    ObjectConstructor = {
        "name": "ObjectConstructor",
        "decls": [
            {
                "decl": "ObjectConstructor",
                "kind": "InterfaceDeclaration"
            }
        ],
        "members": [
            {
                "name": "New",
                "flags": "Signature",
                "decls": [
                    {
                        "decl": "( value?: any [ FunctionScopedVariable | Transient ] ): Object",
                        "type": "Object",
                        "parameters": [
                            {
                                "typeName": "any",
                                "name": "value",
                                "optional": true
                            }
                        ],
                        "kind": "ConstructSignature"
                    }
                ]
            },
            {
                "name": "Call",
                "flags": "Signature",
                "decls": [
                    {
                        "decl": "(): any",
                        "type": {
                            "typeName": "any"
                        },
                        "kind": "CallSignature"
                    },
                    {
                        "decl": "( value: any [ FunctionScopedVariable | Transient ] ): any",
                        "type": {
                            "typeName": "any"
                        },
                        "parameters": [
                            {
                                "typeName": "any",
                                "name": "value"
                            }
                        ],
                        "kind": "CallSignature"
                    }
                ]
            },
            {
                "name": "prototype",
                "flags": "Property",
                "decls": [
                    {
                        "decl": "prototype: Object",
                        "type": "Object",
                        "kind": "PropertySignature"
                    }
                ]
            },
            {
                "name": "getPrototypeOf",
                "flags": "Method",
                "decls": [
                    {
                        "decl": "getPrototypeOf( o: any [ FunctionScopedVariable | Transient ] ): any",
                        "type": {
                            "typeName": "any"
                        },
                        "parameters": [
                            {
                                "typeName": "any",
                                "name": "o"
                            }
                        ],
                        "kind": "MethodSignature"
                    }
                ]
            },
            {
                "name": "getOwnPropertyDescriptor",
                "flags": "Method",
                "decls": [
                    {
                        "decl": "getOwnPropertyDescriptor( o: any [ FunctionScopedVariable | Transient ], p: string [ FunctionScopedVariable | Transient ] ): PropertyDescriptor | undefined",
                        "type": {
                            "type": "union",
                            "types": [
                                {
                                    "type": "PropertyDescriptor"
                                },
                                {
                                    "typeName": "undefined"
                                }
                            ]
                        },
                        "parameters": [
                            {
                                "typeName": "any",
                                "name": "o"
                            },
                            {
                                "typeName": "string",
                                "name": "p"
                            }
                        ],
                        "kind": "MethodSignature"
                    },
                    {
                        "decl": "getOwnPropertyDescriptor( o: any [ FunctionScopedVariable | Transient ], propertyKey: PropertyKey [ FunctionScopedVariable | Transient ] ): PropertyDescriptor | undefined",
                        "type": {
                            "type": "union",
                            "types": [
                                {
                                    "type": "PropertyDescriptor"
                                },
                                {
                                    "typeName": "undefined"
                                }
                            ]
                        },
                        "parameters": [
                            {
                                "typeName": "any",
                                "name": "o"
                            },
                            {
                                "type": "PropertyKey",
                                "name": "propertyKey"
                            }
                        ],
                        "kind": "MethodSignature"
                    }
                ]
            },
            {
                "name": "getOwnPropertyNames",
                "flags": "Method",
                "decls": [
                    {
                        "decl": "getOwnPropertyNames( o: any [ FunctionScopedVariable | Transient ] ): string[]",
                        "type": {
                            "typeName": {
                                "typeName": "string"
                            },
                            "isArray": true
                        },
                        "parameters": [
                            {
                                "typeName": "any",
                                "name": "o"
                            }
                        ],
                        "kind": "MethodSignature"
                    }
                ]
            },
            {
                "name": "create",
                "flags": "Method",
                "decls": [
                    {
                        "decl": "create( o: object | null [ FunctionScopedVariable | Transient ] ): any",
                        "type": {
                            "typeName": "any"
                        },
                        "parameters": [
                            {
                                "type": "union",
                                "types": [
                                    {
                                        "typeName": "object"
                                    },
                                    {
                                        "typeName": "null"
                                    }
                                ],
                                "name": "o"
                            }
                        ],
                        "kind": "MethodSignature"
                    },
                    {
                        "decl": "create( o: object | null [ FunctionScopedVariable | Transient ], properties: PropertyDescriptorMap & ThisType<any> [ FunctionScopedVariable | Transient ] ): any",
                        "type": {
                            "typeName": "any"
                        },
                        "parameters": [
                            {
                                "type": "union",
                                "types": [
                                    {
                                        "typeName": "object"
                                    },
                                    {
                                        "typeName": "null"
                                    }
                                ],
                                "name": "o"
                            },
                            {
                                "type": "intersection",
                                "types": [
                                    {
                                        "type": "PropertyDescriptorMap"
                                    },
                                    {
                                        "type": "ThisType",
                                        "template": [
                                            {
                                                "typeName": "any"
                                            }
                                        ]
                                    }
                                ],
                                "name": "properties"
                            }
                        ],
                        "kind": "MethodSignature"
                    }
                ]
            },
            {
                "name": "defineProperty",
                "flags": "Method",
                "decls": [
                    {
                        "decl": "defineProperty( o: any [ FunctionScopedVariable | Transient ], p: string [ FunctionScopedVariable | Transient ], attributes: PropertyDescriptor & ThisType<any> [ FunctionScopedVariable | Transient ] ): any",
                        "type": {
                            "typeName": "any"
                        },
                        "parameters": [
                            {
                                "typeName": "any",
                                "name": "o"
                            },
                            {
                                "typeName": "string",
                                "name": "p"
                            },
                            {
                                "type": "intersection",
                                "types": [
                                    {
                                        "type": "PropertyDescriptor"
                                    },
                                    {
                                        "type": "ThisType",
                                        "template": [
                                            {
                                                "typeName": "any"
                                            }
                                        ]
                                    }
                                ],
                                "name": "attributes"
                            }
                        ],
                        "kind": "MethodSignature"
                    },
                    {
                        "decl": "defineProperty( o: any [ FunctionScopedVariable | Transient ], propertyKey: PropertyKey [ FunctionScopedVariable | Transient ], attributes: PropertyDescriptor [ FunctionScopedVariable | Transient ] ): any",
                        "type": {
                            "typeName": "any"
                        },
                        "parameters": [
                            {
                                "typeName": "any",
                                "name": "o"
                            },
                            {
                                "type": "PropertyKey",
                                "name": "propertyKey"
                            },
                            {
                                "type": "PropertyDescriptor",
                                "name": "attributes"
                            }
                        ],
                        "kind": "MethodSignature"
                    }
                ]
            },
            {
                "name": "defineProperties",
                "flags": "Method",
                "decls": [
                    {
                        "decl": "defineProperties( o: any [ FunctionScopedVariable | Transient ], properties: PropertyDescriptorMap & ThisType<any> [ FunctionScopedVariable | Transient ] ): any",
                        "type": {
                            "typeName": "any"
                        },
                        "parameters": [
                            {
                                "typeName": "any",
                                "name": "o"
                            },
                            {
                                "type": "intersection",
                                "types": [
                                    {
                                        "type": "PropertyDescriptorMap"
                                    },
                                    {
                                        "type": "ThisType",
                                        "template": [
                                            {
                                                "typeName": "any"
                                            }
                                        ]
                                    }
                                ],
                                "name": "properties"
                            }
                        ],
                        "kind": "MethodSignature"
                    }
                ]
            },
            {
                "name": "seal",
                "flags": "Method",
                "decls": [
                    {
                        "decl": "seal<T>( o: T [ FunctionScopedVariable | Transient ] ): T",
                        "type": "T",
                        "typeParameters": [
                            "T"
                        ],
                        "parameters": [
                            {
                                "type": "T",
                                "name": "o"
                            }
                        ],
                        "kind": "MethodSignature"
                    }
                ]
            },
            {
                "name": "freeze",
                "flags": "Method",
                "decls": [
                    {
                        "decl": "freeze<T>( a: T[] [ FunctionScopedVariable | Transient ] ): ReadonlyArray<T>",
                        "type": {
                            "type": "ReadonlyArray",
                            "template": [
                                "T"
                            ]
                        },
                        "typeParameters": [
                            "T"
                        ],
                        "parameters": [
                            {
                                "isArray": true,
                                "type": "T",
                                "name": "a"
                            }
                        ],
                        "kind": "MethodSignature"
                    },
                    {
                        "decl": "freeze<T extends Function>( f: T [ FunctionScopedVariable | Transient ] ): T",
                        "type": "T",
                        "typeParameters": [
                            "T extends Function"
                        ],
                        "parameters": [
                            {
                                "type": "T",
                                "name": "f"
                            }
                        ],
                        "kind": "MethodSignature"
                    },
                    {
                        "decl": "freeze<T>( o: T [ FunctionScopedVariable | Transient ] ): Readonly<T>",
                        "type": {
                            "type": "Readonly",
                            "template": [
                                "T"
                            ]
                        },
                        "typeParameters": [
                            "T"
                        ],
                        "parameters": [
                            {
                                "type": "T",
                                "name": "o"
                            }
                        ],
                        "kind": "MethodSignature"
                    }
                ]
            },
            {
                "name": "preventExtensions",
                "flags": "Method",
                "decls": [
                    {
                        "decl": "preventExtensions<T>( o: T [ FunctionScopedVariable | Transient ] ): T",
                        "type": "T",
                        "typeParameters": [
                            "T"
                        ],
                        "parameters": [
                            {
                                "type": "T",
                                "name": "o"
                            }
                        ],
                        "kind": "MethodSignature"
                    }
                ]
            },
            {
                "name": "isSealed",
                "flags": "Method",
                "decls": [
                    {
                        "decl": "isSealed( o: any [ FunctionScopedVariable | Transient ] ): boolean",
                        "type": {
                            "typeName": "boolean"
                        },
                        "parameters": [
                            {
                                "typeName": "any",
                                "name": "o"
                            }
                        ],
                        "kind": "MethodSignature"
                    }
                ]
            },
            {
                "name": "isFrozen",
                "flags": "Method",
                "decls": [
                    {
                        "decl": "isFrozen( o: any [ FunctionScopedVariable | Transient ] ): boolean",
                        "type": {
                            "typeName": "boolean"
                        },
                        "parameters": [
                            {
                                "typeName": "any",
                                "name": "o"
                            }
                        ],
                        "kind": "MethodSignature"
                    }
                ]
            },
            {
                "name": "isExtensible",
                "flags": "Method",
                "decls": [
                    {
                        "decl": "isExtensible( o: any [ FunctionScopedVariable | Transient ] ): boolean",
                        "type": {
                            "typeName": "boolean"
                        },
                        "parameters": [
                            {
                                "typeName": "any",
                                "name": "o"
                            }
                        ],
                        "kind": "MethodSignature"
                    }
                ]
            },
            {
                "name": "keys",
                "flags": "Method",
                "decls": [
                    {
                        "decl": "keys( o: {} [ FunctionScopedVariable | Transient ] ): string[]",
                        "type": {
                            "typeName": {
                                "typeName": "string"
                            },
                            "isArray": true
                        },
                        "parameters": [
                            {
                                "type": "type",
                                "members": [],
                                "name": "o"
                            }
                        ],
                        "kind": "MethodSignature"
                    }
                ]
            },
            {
                "name": "assign",
                "flags": "Method",
                "decls": [
                    {
                        "decl": "assign<T, U>( target: T [ FunctionScopedVariable | Transient ], source: U [ FunctionScopedVariable | Transient ] ): T & U",
                        "type": {
                            "type": "intersection",
                            "types": [
                                {
                                    "type": "T"
                                },
                                {
                                    "type": "U"
                                }
                            ]
                        },
                        "typeParameters": [
                            "T",
                            "U"
                        ],
                        "parameters": [
                            {
                                "type": "T",
                                "name": "target"
                            },
                            {
                                "type": "U",
                                "name": "source"
                            }
                        ],
                        "kind": "MethodSignature"
                    },
                    {
                        "decl": "assign<T, U, V>( target: T [ FunctionScopedVariable | Transient ], source1: U [ FunctionScopedVariable | Transient ], source2: V [ FunctionScopedVariable | Transient ] ): T & U & V",
                        "type": {
                            "type": "intersection",
                            "types": [
                                {
                                    "type": "T"
                                },
                                {
                                    "type": "U"
                                },
                                {
                                    "type": "V"
                                }
                            ]
                        },
                        "typeParameters": [
                            "T",
                            "U",
                            "V"
                        ],
                        "parameters": [
                            {
                                "type": "T",
                                "name": "target"
                            },
                            {
                                "type": "U",
                                "name": "source1"
                            },
                            {
                                "type": "V",
                                "name": "source2"
                            }
                        ],
                        "kind": "MethodSignature"
                    },
                    {
                        "decl": "assign<T, U, V, W>( target: T [ FunctionScopedVariable | Transient ], source1: U [ FunctionScopedVariable | Transient ], source2: V [ FunctionScopedVariable | Transient ], source3: W [ FunctionScopedVariable | Transient ] ): T & U & V & W",
                        "type": {
                            "type": "intersection",
                            "types": [
                                {
                                    "type": "T"
                                },
                                {
                                    "type": "U"
                                },
                                {
                                    "type": "V"
                                },
                                {
                                    "type": "W"
                                }
                            ]
                        },
                        "typeParameters": [
                            "T",
                            "U",
                            "V",
                            "W"
                        ],
                        "parameters": [
                            {
                                "type": "T",
                                "name": "target"
                            },
                            {
                                "type": "U",
                                "name": "source1"
                            },
                            {
                                "type": "V",
                                "name": "source2"
                            },
                            {
                                "type": "W",
                                "name": "source3"
                            }
                        ],
                        "kind": "MethodSignature"
                    },
                    {
                        "decl": "assign( target: object [ FunctionScopedVariable | Transient ], ...sources: any[] [ FunctionScopedVariable | Transient ] ): any",
                        "type": {
                            "typeName": "any"
                        },
                        "parameters": [
                            {
                                "typeName": "object",
                                "name": "target"
                            },
                            {
                                "typeName": {
                                    "typeName": "any"
                                },
                                "isArray": true,
                                "name": "sources",
                                "rest": true
                            }
                        ],
                        "kind": "MethodSignature"
                    }
                ]
            },
            {
                "name": "getOwnPropertySymbols",
                "flags": "Method",
                "decls": [
                    {
                        "decl": "getOwnPropertySymbols( o: any [ FunctionScopedVariable | Transient ] ): symbol[]",
                        "type": {
                            "typeName": {
                                "typeName": "symbol"
                            },
                            "isArray": true
                        },
                        "parameters": [
                            {
                                "typeName": "any",
                                "name": "o"
                            }
                        ],
                        "kind": "MethodSignature"
                    }
                ]
            },
            {
                "name": "is",
                "flags": "Method",
                "decls": [
                    {
                        "decl": "is( value1: any [ FunctionScopedVariable | Transient ], value2: any [ FunctionScopedVariable | Transient ] ): boolean",
                        "type": {
                            "typeName": "boolean"
                        },
                        "parameters": [
                            {
                                "typeName": "any",
                                "name": "value1"
                            },
                            {
                                "typeName": "any",
                                "name": "value2"
                            }
                        ],
                        "kind": "MethodSignature"
                    }
                ]
            },
            {
                "name": "setPrototypeOf",
                "flags": "Method",
                "decls": [
                    {
                        "decl": "setPrototypeOf( o: any [ FunctionScopedVariable | Transient ], proto: object | null [ FunctionScopedVariable | Transient ] ): any",
                        "type": {
                            "typeName": "any"
                        },
                        "parameters": [
                            {
                                "typeName": "any",
                                "name": "o"
                            },
                            {
                                "type": "union",
                                "types": [
                                    {
                                        "typeName": "object"
                                    },
                                    {
                                        "typeName": "null"
                                    }
                                ],
                                "name": "proto"
                            }
                        ],
                        "kind": "MethodSignature"
                    }
                ]
            },
            {
                "name": "values",
                "flags": "Method",
                "decls": [
                    {
                        "decl": "values<T>( o: { [ s: string ]: T } | { [ n: number ]: T } [ FunctionScopedVariable | Transient ] ): T[]",
                        "type": {
                            "isArray": true,
                            "type": "T"
                        },
                        "typeParameters": [
                            "T"
                        ],
                        "parameters": [
                            {
                                "type": "union",
                                "types": [
                                    {
                                        "type": "type",
                                        "members": [
                                            {
                                                "type": "index",
                                                "typeName": "T",
                                                "parameters": [
                                                    {
                                                        "name": "s",
                                                        "type": "string"
                                                    }
                                                ]
                                            }
                                        ]
                                    },
                                    {
                                        "type": "type",
                                        "members": [
                                            {
                                                "type": "index",
                                                "typeName": "T",
                                                "parameters": [
                                                    {
                                                        "name": "n",
                                                        "type": "number"
                                                    }
                                                ]
                                            }
                                        ]
                                    }
                                ],
                                "name": "o"
                            }
                        ],
                        "kind": "MethodSignature"
                    },
                    {
                        "decl": "values( o: {} [ FunctionScopedVariable | Transient ] ): any[]",
                        "type": {
                            "typeName": {
                                "typeName": "any"
                            },
                            "isArray": true
                        },
                        "parameters": [
                            {
                                "type": "type",
                                "members": [],
                                "name": "o"
                            }
                        ],
                        "kind": "MethodSignature"
                    }
                ]
            },
            {
                "name": "entries",
                "flags": "Method",
                "decls": [
                    {
                        "decl": "entries<T>( o: { [ s: string ]: T } | { [ n: number ]: T } [ FunctionScopedVariable | Transient ] ): [ string, T ][]",
                        "type": {
                            "typeName": {
                                "type": "tuple",
                                "types": [
                                    {
                                        "typeName": "string"
                                    },
                                    "T"
                                ]
                            },
                            "isArray": true
                        },
                        "typeParameters": [
                            "T"
                        ],
                        "parameters": [
                            {
                                "type": "union",
                                "types": [
                                    {
                                        "type": "type",
                                        "members": [
                                            {
                                                "type": "index",
                                                "typeName": "T",
                                                "parameters": [
                                                    {
                                                        "name": "s",
                                                        "type": "string"
                                                    }
                                                ]
                                            }
                                        ]
                                    },
                                    {
                                        "type": "type",
                                        "members": [
                                            {
                                                "type": "index",
                                                "typeName": "T",
                                                "parameters": [
                                                    {
                                                        "name": "n",
                                                        "type": "number"
                                                    }
                                                ]
                                            }
                                        ]
                                    }
                                ],
                                "name": "o"
                            }
                        ],
                        "kind": "MethodSignature"
                    },
                    {
                        "decl": "entries( o: {} [ FunctionScopedVariable | Transient ] ): [ string, any ][]",
                        "type": {
                            "typeName": {
                                "type": "tuple",
                                "types": [
                                    {
                                        "typeName": "string"
                                    },
                                    {
                                        "typeName": "any"
                                    }
                                ]
                            },
                            "isArray": true
                        },
                        "parameters": [
                            {
                                "type": "type",
                                "members": [],
                                "name": "o"
                            }
                        ],
                        "kind": "MethodSignature"
                    }
                ]
            },
            {
                "name": "getOwnPropertyDescriptors",
                "flags": "Method",
                "decls": [
                    {
                        "decl": "getOwnPropertyDescriptors<T>( o: T [ FunctionScopedVariable | Transient ] ): { [ P in keyof T ]: TypedPropertyDescriptor<T[P]> } & { [ x: string ]: PropertyDescriptor }",
                        "type": {
                            "type": "intersection",
                            "types": [
                                {
                                    "type": "mapped",
                                    "name": {
                                        "typeName": "TypedPropertyDescriptor",
                                        "template": [
                                            {
                                                "typeName": {
                                                    "typeName": "T"
                                                },
                                                "indexType": {
                                                    "typeName": "P"
                                                }
                                            }
                                        ]
                                    }
                                },
                                {
                                    "type": "type",
                                    "members": [
                                        {
                                            "type": "index",
                                            "typeName": "PropertyDescriptor",
                                            "parameters": [
                                                {
                                                    "name": "x",
                                                    "type": "string"
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        },
                        "typeParameters": [
                            "T"
                        ],
                        "parameters": [
                            {
                                "type": "T",
                                "name": "o"
                            }
                        ],
                        "kind": "MethodSignature"
                    }
                ]
            }
        ]
    },
    seen = new Set(),
    scopes = {
        parent: null,
        children: [],
        symbols: new Map()
    },
    scope = scopes;

function add_type( name, type )
{
    if ( !scope.has( name ) )
        scope.set( name, type );
}

function add_instance( def )
{
    const { name, type } = def;

    if ( scope.has( name ) )
        globals.file.reporters.warn( `Symbol ${name} has already been defined in this scope`, def.node );
}

export class Type
{
    constructor( name, typeName )
    {
        this.declarations = [];
        this.name = name;
        this.members = [];
        this.parameters = [];
        this.returns = void 0;
        this.typeName = typeName;
        this.typeParameters = [];
    }
}

export class Symbol
{
    constructor( name, typeName, readOnly = false )
    {
        this.name = name;
        this.definition = null;
        this.typeName = typeName || "any";
        this.typeArguments = [];
        this.values = [];
        this.readOnly = readOnly;
    }
}

// export function add_symbol( def )
// {
//     const
//         name = def.name;
//
//     let sym;
//
//     for ( const decl of def.decls )
//     {
//         if ( seen.has( name + decl.loc ) ) continue;
//
//         seen.add( name + decl.loc );
//
//         add( name, decl );
//     }
//
//     if ( def.exportSymbol )
//         add_symbol( def.exportSymbol );
//
//     if ( def.members )
//     {
//
//     }
// }

export function create_symbols( top )
{
    // const all = walk_symbols( top );

    top.locals.forEach( add_symbol );

    // console.log( detection );
    // console.log( 'counts:\n', counts );
    // console.log( 'defs:\n', JSON.stringify( defs, null, 4 ) );
}
