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

Checks whether {@code this} is a subtype of {@code that}.<p>
Note this function also returns true if this type structurally
matches the protocol define by that type (if that type is an
interface function type)
   *
Subtyping rules:
<ul>
<li>(unknown) &mdash; every type is a subtype of the Unknown type.</li>
<li>(no) &mdash; the No type is a subtype of every type.</li>
<li>(no-object) &mdash; the NoObject type is a subtype of every object
type (i.e. subtypes of the Object type).</li>
<li>(ref) &mdash; a type is a subtype of itself.</li>
<li>(union-l) &mdash; A union type is a subtype of a type U if all the
union type's constituents are a subtype of U. Formally<br>
<code>(T<sub>1</sub>, &hellip;, T<sub>n</sub>) &lt;: U</code> if and only
<code>T<sub>k</sub> &lt;: U</code> for all <code>k &isin; 1..n</code>.</li>
<li>(union-r) &mdash; A type U is a subtype of a union type if it is a
subtype of one of the union type's constituents. Formally<br>
<code>U &lt;: (T<sub>1</sub>, &hellip;, T<sub>n</sub>)</code> if and only
if <code>U &lt;: T<sub>k</sub></code> for some index {@code k}.</li>
<li>(objects) &mdash; an Object <code>O<sub>1</sub></code> is a subtype
of an object <code>O<sub>2</sub></code> if it has more properties
than <code>O<sub>2</sub></code> and all common properties are
pairwise subtypes.</li>
</ul>
   *
@return <code>this &lt;: that</code>

