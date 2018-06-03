/** ******************************************************************************************************************
 * @file Describe what type-system-basic-test does.
 * @author Julian Jensen <jjdanois@gmail.com>
 * @since 1.0.0
 * @date 27-May-2018
 *********************************************************************************************************************/
/* eslint-env jest */
"use strict";

import {
    Identifier,
    Primitive,
    type_def,
    create_type,
    get_type,
    TypeReference,
    Undef,
    CallableType,
    Signature,
    Type,
    Interface
} from "../../src/tdd/type-system-basics";

import { ScopeManager } from "../../src/tdd/scopes";
import { Union }        from "../../src/tdd/type-base";
import { TypeLiteral }  from "../../src/tdd/type-interface";

const
    _object = expect.any( Object ),
    _array = expect.any( Array ),
    objectConstructor = {
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
    autoConstr = objectConstructor.members[ 0 ],
    autoCalls = objectConstructor.members[ 1 ],
    construct = objectConstructor.members[ 0 ].decls[ 0 ],
    callable = objectConstructor.members[ 1 ].decls,
    prop = objectConstructor.members[ 2 ].decls[ 0 ],
    method = objectConstructor.members[ 3 ].decls[ 0 ],
    by_name = name => objectConstructor.members.find( x => x.name === name ),
    values = by_name( 'values' );

let
    /** @type {Interface} */
    objConstr,
    /** @type {CallableType} */
    constFunc;

describe( "Type system", function() {

    beforeEach( () => {
        ScopeManager.reset();
        objConstr = create_type( 'interface', 'ObjectConstructor' );
    } );

    afterEach( () => ScopeManager.reset() );

    /*****************************************************************************
     * INTERFACE CREATION
     *****************************************************************************/
    describe( "Interface creation", () => {

        it( "should create basic interface", () => {
            expect( objConstr ).toEqual( _object );
            expect( objConstr ).toBeInstanceOf( Interface );
            expect( objConstr ).toBeInstanceOf( Type );
        } );

        it( "should respond to queries properly", () => {

            expect( objConstr.isType() ).toEqual( true );
            expect( objConstr.isType( Interface ) ).toEqual( true );
            expect( objConstr.invariant( objConstr ) ).toEqual( true );
            expect( objConstr.isContainer ).toEqual( true );
            expect( objConstr.hasMembers() ).toEqual( false );
            expect( objConstr.numMembers ).toEqual( 0 );

        } );

    } );

    /*****************************************************************************
     * TYPE CREATION
     *****************************************************************************/
    describe( "Type creation", () => {

        it( 'should create types on the fly', () => {

            const
                t = type_def( {
                    "typeName": "any",
                    "name": "value",
                    "optional": true
                } );

            expect( t ).toBeInstanceOf( Type );
            expect( t ).toBeInstanceOf( Primitive );
            expect( t ).toHaveProperty( 'name', 'any' );
        } );

        it( 'should create a type reference', () => {

            const
                t = type_def( {
                    "type": "reference",
                    "typeName": {
                        "name": "ThisType"
                    },
                    "typeArguments": [
                        {
                            "typeName": "any"
                        }
                    ]
                } );

            expect( t ).toBeInstanceOf( Type );
            expect( t ).toBeInstanceOf( TypeReference );
            expect( t.ref ).toBeInstanceOf( Undef );
            expect( t.ref.name ).toEqual( 'ThisType' );
            expect( t.typeArguments ).toEqual( [ 'any' ] );
        } );

    } );

    /*****************************************************************************
     * CONSTRUCTOR FUNCTION
     *****************************************************************************/
    describe( "Constructor functions", () => {

        it( "should add constructor function", () => {
            constFunc = objConstr.add_member( 'constructor', construct );

            expect( objConstr.numMembers ).toEqual( 0 );
            expect( objConstr.numConstructors ).toEqual( 1 );
            expect( constFunc ).toBeInstanceOf( Signature );
            expect( constFunc.parent ).toBeInstanceOf( Interface );
            expect( objConstr.numSignatures ).toEqual( 1 );
            expect( objConstr.numConstructors ).toEqual( 1 );
            expect( objConstr.numCallables ).toEqual( 0 );
            expect( objConstr.constructors.get( 0 ).parameters ).toEqual( _array );
            expect( objConstr.constructors.get( 0 ).parameters.length ).toEqual( 1 );

            const sig = objConstr.constructors.get( 0 );

            const p = sig.parameters[ 0 ];

            expect( p ).toBeInstanceOf( Identifier );
            expect( p.type.is( get_type( 'any' ) ) ).toEqual( true );
            expect( sig.param_by( 'value' ) ).toEqual( p );
            expect( sig.param_by( 0 ) ).toEqual( p );
            expect( p.optional ).toEqual( true );

        } );

        it( 'should automatically add the constructor', () => {
            objConstr.auto_member( autoConstr );

            expect( objConstr.numMembers ).toEqual( 0 );
            expect( objConstr.numConstructors ).toEqual( 1 );
            expect( constFunc ).toBeInstanceOf( Signature );
            expect( constFunc.parent ).toBeInstanceOf( Interface );
            expect( objConstr.numSignatures ).toEqual( 1 );
            expect( objConstr.numConstructors ).toEqual( 1 );
            expect( objConstr.numCallables ).toEqual( 0 );
            expect( objConstr.constructors.get( 0 ).parameters ).toEqual( _array );
            expect( objConstr.constructors.get( 0 ).parameters.length ).toEqual( 1 );

            const sig = objConstr.constructors.get( 0 );

            const p = sig.parameters[ 0 ];

            expect( p ).toBeInstanceOf( Identifier );
            expect( p.type.is( get_type( 'any' ) ) ).toEqual( true );
            expect( sig.param_by( 'value' ) ).toEqual( p );
            expect( sig.param_by( 0 ) ).toEqual( p );
            expect( p.optional ).toEqual( true );
        } );
    } );

    /*****************************************************************************
     * CALLABLE OBJECT
     *****************************************************************************/
    describe( "Callable objects", () => {

        it( "should add callable overloaded functions", () => {

            objConstr.add_member( 'callable', callable[ 0 ] );
            objConstr.add_member( 'callable', callable[ 1 ] );

            expect( objConstr.numMembers ).toEqual( 0 );

            expect( objConstr.numSignatures ).toEqual( 1 );
            expect( objConstr.signatures[ 0 ] ).toBeInstanceOf( CallableType );
            expect( objConstr.signatures[ 0 ].signatures[ 0 ] ).toBeInstanceOf( Signature );

            const
                call0 = objConstr.callables.get( 0 ),
                call1 = objConstr.callables.get( 1 );

            expect( call0.parent ).toBeInstanceOf( Interface );
            expect( call0.parameters ).toEqual( _array );
            expect( call0.parameters.length ).toEqual( 0 );

            expect( call1.parameters ).toEqual( _array );
            expect( call1.parameters.length ).toEqual( 1 );

            const p = call1.parameters[ 0 ];

            expect( p ).toBeInstanceOf( Identifier );
            expect( p.type.invariant( get_type( 'any' ) ) ).toEqual( true );
            expect( p.name ).toEqual( 'value' );
            expect( p.optional ).toEqual( false );

        } );

        it( 'should automatically add the callables', () => {
            objConstr.auto_member( autoCalls );

            expect( objConstr.numMembers ).toEqual( 0 );

            expect( objConstr.numSignatures ).toEqual( 1 );
            expect( objConstr.signatures[ 0 ] ).toBeInstanceOf( CallableType );
            expect( objConstr.signatures[ 0 ].signatures[ 0 ] ).toBeInstanceOf( Signature );

            const
                call0 = objConstr.callables.get( 0 ),
                call1 = objConstr.callables.get( 1 );

            expect( call0.parent ).toBeInstanceOf( Interface );
            expect( call0.parameters ).toEqual( _array );
            expect( call0.parameters.length ).toEqual( 0 );

            expect( call1.parameters ).toEqual( _array );
            expect( call1.parameters.length ).toEqual( 1 );

            const p = call1.parameters[ 0 ];

            expect( p ).toBeInstanceOf( Identifier );
            expect( p.type.invariant( get_type( 'any' ) ) ).toEqual( true );
            expect( p.name ).toEqual( 'value' );
            expect( p.optional ).toEqual( false );
        } );

    } );

    /*****************************************************************************
     * OBJECT PROPERTY
     *****************************************************************************/
    describe( "Object properties", () => {

        it( "should add object properties", () => {

            objConstr.add_member( 'property', prop, 'prototype' );

            expect( objConstr.numMembers ).toEqual( 1 );
            expect( objConstr.numSignatures ).toEqual( 0 );

            const p = objConstr.get( 'prototype' );

            expect( p ).toBeInstanceOf( Identifier );
            expect( p.parent ).toBeInstanceOf( Interface );
            expect( p.type ).toBeInstanceOf( TypeReference );
            expect( p.type.ref ).toBeInstanceOf( Undef );

        } );

        it( 'should auto-add properties', () => {

            objConstr.auto_member( objectConstructor.members[ 2 ] );

            expect( objConstr.numMembers ).toEqual( 1 );
            expect( objConstr.numSignatures ).toEqual( 0 );

            const p = objConstr.get( 'prototype' );

            expect( p ).toBeInstanceOf( Identifier );
            expect( p.parent ).toBeInstanceOf( Interface );
            expect( p.type ).toBeInstanceOf( TypeReference );
            expect( p.type.ref ).toBeInstanceOf( Undef );

        } );
    } );

    /*****************************************************************************
     * OBJECT METHOD
     *****************************************************************************/
    describe.only( "Object method", () => {

        it( "should add callable overloaded methods", () => {
            let calls;

            objConstr.add_member( 'method', method, 'getPrototypeOf' );

            expect( objConstr.numMembers ).toEqual( 1 );

            calls = objConstr.methods;

            expect( objConstr.numMethods ).toEqual( 1 );
            expect( objConstr.methods[ 0 ] ).toBeInstanceOf( CallableType );
            expect( calls[ 0 ].parent ).toBeInstanceOf( Interface );
            expect( calls[ 0 ].signatures[ 0 ].parameters ).toEqual( _array );
            expect( calls[ 0 ].signatures[ 0 ].parameters.length ).toEqual( 1 );

            const p = calls[ 0 ].signatures[ 0 ].parameters[ 0 ];

            expect( p ).toBeInstanceOf( Identifier );
            expect( p.type.invariant( get_type( 'any' ) ) ).toEqual( true );
            expect( p.name ).toEqual( 'o' );
            expect( p.optional ).toEqual( false );

        } );

        it( 'should add some interesting methods', () => {
            let calls;

            objConstr.add_member( 'method', values.decls[ 1 ], 'values' );

            expect( objConstr.numMembers ).toEqual( 1 );

            calls = objConstr.methods;

            expect( objConstr.numMethods ).toEqual( 1 );
            expect( objConstr.methods[ 0 ] ).toBeInstanceOf( CallableType );
            expect( calls[ 0 ].parent ).toBeInstanceOf( Interface );
            expect( calls[ 0 ].signatures[ 0 ].parameters ).toEqual( _array );
            expect( calls[ 0 ].signatures[ 0 ].parameters.length ).toEqual( 1 );

            const p = calls[ 0 ].signatures[ 0 ].parameters[ 0 ];

            expect( p.type.invariant( TypeLiteral ) ).toEqual( true );

        } );

        it.only( 'should add some even more interesting methods', () => {    // HERE
            let calls;

            objConstr.add_member( 'method', values.decls[ 0 ], 'values' );

            expect( objConstr.numMembers ).toEqual( 1 );

            calls = objConstr.methods;

            expect( objConstr.numMethods ).toEqual( 1 );
            expect( objConstr.methods[ 0 ] ).toBeInstanceOf( CallableType );
            expect( calls[ 0 ].parent ).toBeInstanceOf( Interface );
            expect( calls[ 0 ].signatures[ 0 ].parameters ).toEqual( _array );
            expect( calls[ 0 ].signatures[ 0 ].parameters.length ).toEqual( 1 );

            const p = calls[ 0 ].signatures[ 0 ].parameters[ 0 ];

            console.log( 'p is', p.constructor.name );
            console.log( 'p.type is', p.type.constructor.name );
            expect( p.type.invariant( Union ) ).toEqual( true );

            console.log( 'p.type:', p.type );
            const lit = p.type.at( 0 );
            expect( lit ).toBeInstanceOf( TypeLiteral );

        } );

        it( 'should auto-add methods', () => {
            objConstr.auto_member( objectConstructor.members[ 3 ] );

            expect( objConstr.numMembers ).toEqual( 1 );

            let calls = objConstr.methods;

            expect( objConstr.numMethods ).toEqual( 1 );
            expect( objConstr.methods[ 0 ] ).toBeInstanceOf( CallableType );
            expect( calls[ 0 ].parent ).toBeInstanceOf( Interface );
            expect( calls[ 0 ].signatures[ 0 ].parameters ).toEqual( _array );
            expect( calls[ 0 ].signatures[ 0 ].parameters.length ).toEqual( 1 );

            const p = calls[ 0 ].signatures[ 0 ].parameters[ 0 ];

            expect( p ).toBeInstanceOf( Identifier );
            expect( p.type.invariant( get_type( 'any' ) ) ).toEqual( true );
            expect( p.name ).toEqual( 'o' );
            expect( p.optional ).toEqual( false );

        } );

        // eslint-disable-next-line max-statements
        it( 'should auto-add a complex overloaded method', () => {
            objConstr.auto_member( objectConstructor.members[ 4 ] );

            let calls = objConstr.methods;

            expect( objConstr.numMethods ).toEqual( 1 );
            expect( calls[ 0 ] ).toBeInstanceOf( CallableType );

            let funcs = calls[ 0 ];

            expect( funcs.parent ).toBeInstanceOf( Interface );
            expect( funcs.signatures[ 0 ].parameters ).toEqual( _array );
            expect( funcs.signatures[ 0 ].parameters.length ).toEqual( 2 );

            let p = funcs.signatures[ 0 ].parameters[ 0 ];

            expect( p ).toBeInstanceOf( Identifier );
            expect( p.type.invariant( get_type( 'any' ) ) ).toEqual( true );
            expect( p.name ).toEqual( 'o' );
            expect( p.optional ).toEqual( false );

            /** @type {Union} */
            let t = funcs.signatures[ 0 ].type;

            expect( t ).toBeInstanceOf( Union );
            expect( t.has_type( get_type( 'undefined' ) ) ).toEqual( true );
            expect( t.has_type( TypeReference ) ).toEqual( true );
            expect( t.get_type( TypeReference ).ref ).toBeInstanceOf( Undef );
            expect( t.get_type( TypeReference ).ref.name ).toEqual( 'PropertyDescriptor' );


            expect( funcs.parent ).toBeInstanceOf( Interface );
            expect( funcs.signatures[ 1 ].parameters ).toEqual( _array );
            expect( funcs.signatures[ 1 ].parameters.length ).toEqual( 2 );

            p = funcs.signatures[ 1 ].parameters[ 0 ];

            expect( p ).toBeInstanceOf( Identifier );
            expect( p.type.invariant( get_type( 'any' ) ) ).toEqual( true );
            expect( p.name ).toEqual( 'o' );
            expect( p.optional ).toEqual( false );

            /** @type {Union} */
            t = funcs.signatures[ 0 ].type;

            expect( t ).toBeInstanceOf( Union );
            expect( t.has_type( get_type( 'undefined' ) ) ).toEqual( true );
            expect( t.has_type( TypeReference ) ).toEqual( true );
            expect( t.get_type( TypeReference ).ref ).toBeInstanceOf( Undef );
            expect( t.get_type( TypeReference ).ref.name ).toEqual( 'PropertyDescriptor' );

            p = funcs.signatures[ 1 ].parameters[ 1 ];
            expect( p.type ).toBeInstanceOf( TypeReference );
            expect( funcs.signatures[ 1 ].param_by( 1 ).name ).toEqual( 'propertyKey' );
            expect( p.type.ref ).toBeInstanceOf( Undef );
            expect( p.type.ref.name ).toEqual( 'PropertyKey' );

        } );
    } );
} );
