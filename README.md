# inference


> A JSDOC substitue that will parse doc tags as well as closure annotations.


## Install

```sh
npm i inference
```

## Usage

```js
const 
    inference = require( 'inference' );

inference() // true
```

## Type Overview

|             | name | ref | is type | inst. | index | anon. | scope |
|-------------|:----:|:---:|:-------:|:-----:|:-----:|:-----:|:-----:|
| var         |   Y  |  Y  |    N    |   Y   |   N   |   N   |   N   |
| interface   |   Y  |  N  |    ?    |   N   |   Y   |   N   |   T   |
| class       |   E  |  N  |    Y    |   ?   |   Y   |   Y   |   T   |
| module      |   Y  |  N  |    N    |   1   |   Y   |   N   |   Y   |
| function    |   E  |  N  |    Y    |   Y   |   N   |   Y   |   Y   |
| generic     |   Y  |  N  |    N    |   N   |   Y   |   N   |   N   |
| alias       |   Y  |  ?  |    Y    |   N   |   N   |   N   |   N   |
| union/inter |   E  |  ?  |    ?    |   N   |   N   |   Y   |   N   |
| parameter   |   Y  |  E  |    N    |   Y   |   Y   |   N   |   N   |

### Pure Types

* Primitives
* Interface
* Union

### Substantials

* Identifiers declare with `var`, `let`, or `const`.

  They need a type reference which can be anything except `var` (from table)
  
* Function declarations (not assigned anonymous functions)
* Class statics


## `ModuleDeclaration`

### Import Notes

#### `ImportDeclaration`

* `source` is the source file as `Literal`
* `specifiers` is an array of
  * `ImportSpecifier`
    * `imported` is always an `Identifier`
    * `local` is the local name as `Identifier`
  * `ImportDefaultSpecifier`
  * `ImportNamespaceSpecifier`

#### `ExportDefaultDeclaration`

* `declaration` is `Declaration` or `Expression`
  * `Declaration` is one of
    1. `FunctionDeclaration`
    1. `VariableDeclaration`
    1. `ClassDeclaration`

#### `ExportAllDeclaration`

* `source` is a `Literal`

#### `ExportNamedDeclaration`

* `declaration` is a nullable declaration
* `specifiers` an array of `ExportSpecifier`
* `source` is a nullable `Literal`


### `ModuleSpecifier`
All of the specifiers have one field `local`, always an `Identifier`

#### `ImportSpecifier`

* `imported` is an `Identifier`
* `local` is an `Identifier`

#### `ImportDefaultSpecifier`

* `local` is an `Identfier`

#### `ImportNamespaceSpecifier`

* `local` is an `Identfier`

#### `ExportSpecifier`
* `Identifier` always and only
* `local` is an `Identfier`

## License

MIT © [Julian Jensen](https://github.com/julianjensen/jsdoc-tag-parser)
