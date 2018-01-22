# jsdoc-tag-parser


> A JSDOC substitue that will parse doc tags as well as closure annotations.


## Install

```sh
npm i jsdoc-tag-parser
```

## Usage

```js
const 
    jsdocTagParser = require( 'jsdoc-tag-parser' );

jsdocTagParser() // true
```

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

