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
import { type } from 'typeofs';
import { walk_symbols } from "../ts/ts-symbols";

const
    detection = new Set(),
    defs = [],
    counts = {},
    LOG = true,
    log = ( ...args ) => LOG && console.log( ...args ),
    DEBUG = {
        DECLS: {
            VAR: log
        }
    };

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

let scope;

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
                        "decl": "( value?: any ): Object",
                        "type": {
                            "type": "reference",
                            "typeName": "Object"
                        },
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
                        "type": "any",
                        "kind": "CallSignature"
                    },
                    {
                        "decl": "( value: any ): any",
                        "type": "any",
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
                        "type": {
                            "type": "reference",
                            "typeName": "Object"
                        },
                        "kind": "PropertySignature"
                    }
                ]
            },
            {
                "name": "getPrototypeOf",
                "flags": "Method",
                "decls": [
                    {
                        "decl": "getPrototypeOf( o: any ): any",
                        "type": "any",
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
                        "decl": "getOwnPropertyDescriptor( o: any, p: string ): PropertyDescriptor | undefined",
                        "type": {
                            "type": "union",
                            "types": [
                                {
                                    "type": "reference",
                                    "typeName": {
                                        "name": "PropertyDescriptor"
                                    }
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
                        "decl": "getOwnPropertyDescriptor( o: any, propertyKey: PropertyKey ): PropertyDescriptor | undefined",
                        "type": {
                            "type": "union",
                            "types": [
                                {
                                    "type": "reference",
                                    "typeName": {
                                        "name": "PropertyDescriptor"
                                    }
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
                                "type": "reference",
                                "typeName": "PropertyKey",
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
                        "decl": "getOwnPropertyNames( o: any ): string[]",
                        "type": {
                            "typeName": "string",
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
                        "decl": "create( o: object | null ): any",
                        "type": "any",
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
                        "decl": "create( o: object | null, properties: PropertyDescriptorMap & ThisType<any> ): any",
                        "type": "any",
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
                                        "type": "reference",
                                        "typeName": {
                                            "name": "PropertyDescriptorMap"
                                        }
                                    },
                                    {
                                        "type": "reference",
                                        "typeName": {
                                            "name": "ThisType"
                                        },
                                        "typeArguments": [
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
                        "decl": "defineProperty( o: any, p: string, attributes: PropertyDescriptor & ThisType<any> ): any",
                        "type": "any",
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
                                        "type": "reference",
                                        "typeName": {
                                            "name": "PropertyDescriptor"
                                        }
                                    },
                                    {
                                        "type": "reference",
                                        "typeName": {
                                            "name": "ThisType"
                                        },
                                        "typeArguments": [
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
                        "decl": "defineProperty( o: any, propertyKey: PropertyKey, attributes: PropertyDescriptor ): any",
                        "type": "any",
                        "parameters": [
                            {
                                "typeName": "any",
                                "name": "o"
                            },
                            {
                                "type": "reference",
                                "typeName": "PropertyKey",
                                "name": "propertyKey"
                            },
                            {
                                "type": "reference",
                                "typeName": "PropertyDescriptor",
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
                        "decl": "defineProperties( o: any, properties: PropertyDescriptorMap & ThisType<any> ): any",
                        "type": "any",
                        "parameters": [
                            {
                                "typeName": "any",
                                "name": "o"
                            },
                            {
                                "type": "intersection",
                                "types": [
                                    {
                                        "type": "reference",
                                        "typeName": {
                                            "name": "PropertyDescriptorMap"
                                        }
                                    },
                                    {
                                        "type": "reference",
                                        "typeName": {
                                            "name": "ThisType"
                                        },
                                        "typeArguments": [
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
                        "decl": "seal<T>( o: T ): T",
                        "type": {
                            "type": "reference",
                            "typeName": "T"
                        },
                        "typeParameters": [
                            {
                                "typeName": "T",
                                "name": "T"
                            }
                        ],
                        "parameters": [
                            {
                                "type": "reference",
                                "typeName": "T",
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
                        "decl": "freeze<T>( a: T[] ): ReadonlyArray<T>",
                        "type": {
                            "type": "reference",
                            "typeName": "ReadonlyArray",
                            "typeArguments": [
                                {
                                    "type": "reference",
                                    "typeName": {
                                        "name": "T"
                                    }
                                }
                            ]
                        },
                        "typeParameters": [
                            {
                                "typeName": "T",
                                "name": "T"
                            }
                        ],
                        "parameters": [
                            {
                                "typeName": {
                                    "type": "reference",
                                    "typeName": "T"
                                },
                                "isArray": true,
                                "name": "a"
                            }
                        ],
                        "kind": "MethodSignature"
                    },
                    {
                        "decl": "freeze<T extends Function>( f: T ): T",
                        "type": {
                            "type": "reference",
                            "typeName": "T"
                        },
                        "typeParameters": [
                            {
                                "typeName": "Function",
                                "name": "T",
                                "typeOperator": " extends"
                            }
                        ],
                        "parameters": [
                            {
                                "type": "reference",
                                "typeName": "T",
                                "name": "f"
                            }
                        ],
                        "kind": "MethodSignature"
                    },
                    {
                        "decl": "freeze<T>( o: T ): Readonly<T>",
                        "type": {
                            "type": "reference",
                            "typeName": "Readonly",
                            "typeArguments": [
                                {
                                    "type": "reference",
                                    "typeName": {
                                        "name": "T"
                                    }
                                }
                            ]
                        },
                        "typeParameters": [
                            {
                                "typeName": "T",
                                "name": "T"
                            }
                        ],
                        "parameters": [
                            {
                                "type": "reference",
                                "typeName": "T",
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
                        "decl": "preventExtensions<T>( o: T ): T",
                        "type": {
                            "type": "reference",
                            "typeName": "T"
                        },
                        "typeParameters": [
                            {
                                "typeName": "T",
                                "name": "T"
                            }
                        ],
                        "parameters": [
                            {
                                "type": "reference",
                                "typeName": "T",
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
                        "decl": "isSealed( o: any ): boolean",
                        "type": "boolean",
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
                        "decl": "isFrozen( o: any ): boolean",
                        "type": "boolean",
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
                        "decl": "isExtensible( o: any ): boolean",
                        "type": "boolean",
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
                        "decl": "keys( o: {} ): string[]",
                        "type": {
                            "typeName": "string",
                            "isArray": true
                        },
                        "parameters": [
                            {
                                "type": "typeliteral",
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
                        "decl": "assign<T, U>( target: T, source: U ): T & U",
                        "type": {
                            "type": "intersection",
                            "types": [
                                {
                                    "type": "reference",
                                    "typeName": {
                                        "name": "T"
                                    }
                                },
                                {
                                    "type": "reference",
                                    "typeName": {
                                        "name": "U"
                                    }
                                }
                            ]
                        },
                        "typeParameters": [
                            {
                                "typeName": "T",
                                "name": "T"
                            },
                            {
                                "typeName": "U",
                                "name": "U"
                            }
                        ],
                        "parameters": [
                            {
                                "type": "reference",
                                "typeName": "T",
                                "name": "target"
                            },
                            {
                                "type": "reference",
                                "typeName": "U",
                                "name": "source"
                            }
                        ],
                        "kind": "MethodSignature"
                    },
                    {
                        "decl": "assign<T, U, V>( target: T, source1: U, source2: V ): T & U & V",
                        "type": {
                            "type": "intersection",
                            "types": [
                                {
                                    "type": "reference",
                                    "typeName": {
                                        "name": "T"
                                    }
                                },
                                {
                                    "type": "reference",
                                    "typeName": {
                                        "name": "U"
                                    }
                                },
                                {
                                    "type": "reference",
                                    "typeName": {
                                        "name": "V"
                                    }
                                }
                            ]
                        },
                        "typeParameters": [
                            {
                                "typeName": "T",
                                "name": "T"
                            },
                            {
                                "typeName": "U",
                                "name": "U"
                            },
                            {
                                "typeName": "V",
                                "name": "V"
                            }
                        ],
                        "parameters": [
                            {
                                "type": "reference",
                                "typeName": "T",
                                "name": "target"
                            },
                            {
                                "type": "reference",
                                "typeName": "U",
                                "name": "source1"
                            },
                            {
                                "type": "reference",
                                "typeName": "V",
                                "name": "source2"
                            }
                        ],
                        "kind": "MethodSignature"
                    },
                    {
                        "decl": "assign<T, U, V, W>( target: T, source1: U, source2: V, source3: W ): T & U & V & W",
                        "type": {
                            "type": "intersection",
                            "types": [
                                {
                                    "type": "reference",
                                    "typeName": {
                                        "name": "T"
                                    }
                                },
                                {
                                    "type": "reference",
                                    "typeName": {
                                        "name": "U"
                                    }
                                },
                                {
                                    "type": "reference",
                                    "typeName": {
                                        "name": "V"
                                    }
                                },
                                {
                                    "type": "reference",
                                    "typeName": {
                                        "name": "W"
                                    }
                                }
                            ]
                        },
                        "typeParameters": [
                            {
                                "typeName": "T",
                                "name": "T"
                            },
                            {
                                "typeName": "U",
                                "name": "U"
                            },
                            {
                                "typeName": "V",
                                "name": "V"
                            },
                            {
                                "typeName": "W",
                                "name": "W"
                            }
                        ],
                        "parameters": [
                            {
                                "type": "reference",
                                "typeName": "T",
                                "name": "target"
                            },
                            {
                                "type": "reference",
                                "typeName": "U",
                                "name": "source1"
                            },
                            {
                                "type": "reference",
                                "typeName": "V",
                                "name": "source2"
                            },
                            {
                                "type": "reference",
                                "typeName": "W",
                                "name": "source3"
                            }
                        ],
                        "kind": "MethodSignature"
                    },
                    {
                        "decl": "assign( target: object, ...sources: any[] ): any",
                        "type": "any",
                        "parameters": [
                            {
                                "typeName": "object",
                                "name": "target"
                            },
                            {
                                "typeName": "any",
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
                        "decl": "getOwnPropertySymbols( o: any ): symbol[]",
                        "type": {
                            "typeName": "symbol",
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
                        "decl": "is( value1: any, value2: any ): boolean",
                        "type": "boolean",
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
                        "decl": "setPrototypeOf( o: any, proto: object | null ): any",
                        "type": "any",
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
                        "decl": "values<T>( o: { [ s: string ]: T } | { [ n: number ]: T } ): T[]",
                        "type": {
                            "typeName": {
                                "type": "reference",
                                "typeName": "T"
                            },
                            "isArray": true
                        },
                        "typeParameters": [
                            {
                                "typeName": "T",
                                "name": "T"
                            }
                        ],
                        "parameters": [
                            {
                                "type": "union",
                                "types": [
                                    {
                                        "type": "typeliteral",
                                        "members": [
                                            {
                                                "type": "index",
                                                "typeName": {
                                                    "type": "reference",
                                                    "typeName": "T"
                                                },
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
                                        "type": "typeliteral",
                                        "members": [
                                            {
                                                "type": "index",
                                                "typeName": {
                                                    "type": "reference",
                                                    "typeName": "T"
                                                },
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
                        "decl": "values( o: {} ): any[]",
                        "type": {
                            "typeName": "any",
                            "isArray": true
                        },
                        "parameters": [
                            {
                                "type": "typeliteral",
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
                        "decl": "entries<T>( o: { [ s: string ]: T } | { [ n: number ]: T } ): [ string, T ][]",
                        "type": {
                            "typeName": {
                                "type": "tuple",
                                "types": [
                                    {
                                        "typeName": "string"
                                    },
                                    {
                                        "type": "reference",
                                        "typeName": "T"
                                    }
                                ]
                            },
                            "isArray": true
                        },
                        "typeParameters": [
                            {
                                "typeName": "T",
                                "name": "T"
                            }
                        ],
                        "parameters": [
                            {
                                "type": "union",
                                "types": [
                                    {
                                        "type": "typeliteral",
                                        "members": [
                                            {
                                                "type": "index",
                                                "typeName": {
                                                    "type": "reference",
                                                    "typeName": "T"
                                                },
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
                                        "type": "typeliteral",
                                        "members": [
                                            {
                                                "type": "index",
                                                "typeName": {
                                                    "type": "reference",
                                                    "typeName": "T"
                                                },
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
                        "decl": "entries( o: {} ): [ string, any ][]",
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
                                "type": "typeliteral",
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
                        "decl": "getOwnPropertyDescriptors<T>( o: T ): { [ P in keyof T ]: TypedPropertyDescriptor<T[P]> } & { [ x: string ]: PropertyDescriptor }",
                        "type": {
                            "type": "intersection",
                            "types": [
                                {
                                    "type": "mapped",
                                    "definition": {
                                        "type": {
                                            "type": "reference",
                                            "typeName": "TypedPropertyDescriptor",
                                            "typeArguments": [
                                                {
                                                    "typeName": "T",
                                                    "indexType": {
                                                        "typeName": "P"
                                                    }
                                                }
                                            ]
                                        },
                                        "typeParameter": {
                                            "typeName": "T",
                                            "name": "P",
                                            "typeOperator": " in",
                                            "keyOf": true
                                        }
                                    }
                                },
                                {
                                    "type": "typeliteral",
                                    "members": [
                                        {
                                            "type": "index",
                                            "typeName": {
                                                "type": "reference",
                                                "typeName": "PropertyDescriptor"
                                            },
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
                            {
                                "typeName": "T",
                                "name": "T"
                            }
                        ],
                        "parameters": [
                            {
                                "type": "reference",
                                "typeName": "T",
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
        symbols: new Map(),
        has( name ) { return this.symbols.has( name ); },
        set( name, thing ) { return this.symbols.set( name, thing ); },
        get( name ) { return this.symbols.get( name ); }
    };

scope = scopes;

function lookup( name, scp = scope )
{
    if ( scp.symbols.has( name ) )
        return scp.symbols.get( name );

    let s = scp.parent;

    while ( s )
    {
        if ( s.symbols.has( name ) )
            return s.symbols.get( name );

        s = s.parent;
    }

    return null;
}

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
    constructor( typeName, def, decl = '' )
    {
        this.declarations = [];
        this.name = typeName;
        this.members = [];
        this.parameters = [];
        this.returns = void 0;
        this.typeParameters = [];
        this.definition = def;
        this.decl = decl;
    }

    toString()
    {
        return this.decl;
    }
}

function get_type( typeName, deferOkay = false )
{
    const t = lookup( typeName );

    if ( t )
    {
        log( `Found symbol "${typeName}"` );
        return t;
    }

    if ( !deferOkay ) return null;

    return ( ( scope, file ) => () => {
        const t = lookup( typeName, scope );

        if ( t )
        {
            log( `Found symbol "${typeName}" (deferred)` );
            return t;
        }

        file.reporters.warn( `Undefined symbol "${typeName}" (deferred)` );

        return null;
    } )( scope, globals.file );
}

function create_type( typeDef, defer = false )
{
    let t;

    if ( type( typeDef ) === 'object' )
    {
        switch ( typeDef.type )
        {
            case 'reference':
                return get_type( typeDef.typeName, defer );

            case 'interface':
                t = get_type( typeDef.typeName );
                if ( t ) return t;
                return new Type( typeDef.typeName, typeDef );

            default:
                log( `Ignoring "${typeDef.type}"` );
                break;
        }
    }
    else if ( type( typeDef ) === 'string' )
        return get_type( typeDef, defer );
}

const deferredTypes = [];

/** */
export class Symbol
{
    constructor( name, typeDef, readOnly = false )
    {
        this.name = name;
        this.definition = null;
        this.type = typeDef || "any";
        this.typeArguments = [];
        this.values = [];
        this.readOnly = readOnly;

        if ( type( this.type ) === 'function' )
            deferredTypes.push( this );
    }

    /** */
    init()
    {
        if ( type( this.type ) === 'function' )
            this.type = this.type();
    }
}

const allDecls = new Set();

/**
 * @param {object} sym
 */
function add_symbol( sym )
{
    const
        symName = sym.name,
        declKinds = [];

    if ( !sym.name )
        throw new Error( `No 'name' property for symbol` );

    for ( const decl of sym.decls )
    {
        declKinds.push( decl.kind );
        allDecls.add( decl.kind );

        switch ( decl.kind )
        {
            case 'VariableDeclaration':
                add_type( symName, new Symbol( symName, create_type( decl.type, true ) ) );
                break;

            case 'FunctionDeclaration':
            case 'InterfaceDeclaration':
                add_type( symName, new Symbol( symName, create_type( { type: 'interface', typeName: symName, members: sym.members }, true ) ) );
                break;

            case 'TypeAliasDeclaration':
            case 'ModuleDeclaration':
            case 'ClassDeclaration':
        }
    }

    const types = declKinds.join( ', ' );

    if ( detection.has( types ) )
        ++counts[ types ];
    else
    {
        counts[ types ] = 1;
        detection.add( types );
    }

    // if ( types === 'FunctionDeclaration, FunctionDeclaration, FunctionDeclaration' )
    //     defs.push( sym.decls );
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

add_type( 'string', new Type( 'string', null, 'string' ) );
add_type( 'number', new Type( 'number', null, 'number' ) );
add_type( 'boolean', new Type( 'boolean', null, 'boolean' ) );
add_type( 'null', new Type( 'null', null, 'null' ) );
add_type( 'undefined', new Type( 'undefined', null, 'undefined' ) );
add_type( 'symbol', new Type( 'symbol', null, 'symbol' ) );
add_type( 'void', new Type( 'void', null, 'void' ) );
add_type( 'any', new Type( 'any', null, 'any' ) );
add_type( 'never', new Type( 'never', null, 'never' ) );


export function create_symbols( top )
{
    // const all = walk_symbols( top );

    top.locals.forEach( add_symbol );

    deferredTypes.forEach( s => s.init() );

    console.log( detection );
    console.log( 'counts:\n', counts );
    console.log( 'all decls:', allDecls );
    // console.log( 'defs:\n', JSON.stringify( defs, null, 4 ) );
}
