# jsdoc-tag-parser

[![Coveralls Status][coveralls-image]][coveralls-url]
[![Build Status][travis-image]][travis-url]
[![Dependency Status][depstat-image]][depstat-url]
[![npm version][npm-image]][npm-url]
[![License][license-image]][license-url]
[![Known Vulnerabilities][snyk-image]][snyk-url]
[![david-dm][david-dm-image]][david-dm-url]

> A JSDOC substitue that will parse doc tags as well as closure annotations.

## Remove This Section After Reading

Make sure you update this *README* file and remove this section. By using copious amount of *JSDoc* tags you can ensure good code documentation. This module supports the automatic generation of an API document by typing `npm run mddocs` which will create a document `API.md` which you can link to or concatenate to this *README.md* file.

It has also set up a unit test enviroment. Just type `npm test` to execute your unit tests which will be in the `test/` directory. It uses **mocha** and **chai** for testing.

It has `.gitignore`, `.editorconfig`, and `.eslintrc.json` files in the project root.

Here's how to finalize the **git** VCS for this project.

1. Create your repository on https://github.com/julianjensen/jsdoc-tag-parser (Your project directory is already init'd and staged for commit)
2. Type `git push -u origin master`

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

## License

MIT © [Julian Jensen](https://github.com/julianjensen/jsdoc-tag-parser)

[coveralls-url]: https://coveralls.io/github/julianjensen/jsdoc-tag-parser?branch=master
[coveralls-image]: https://coveralls.io/repos/github/julianjensen/jsdoc-tag-parser/badge.svg?branch=master

[travis-url]: https://travis-ci.org/julianjensen/jsdoc-tag-parser
[travis-image]: http://img.shields.io/travis/julianjensen/jsdoc-tag-parser.svg

[depstat-url]: https://gemnasium.com/github.com/julianjensen/jsdoc-tag-parser
[depstat-image]: https://gemnasium.com/badges/github.com/julianjensen/jsdoc-tag-parser.svg

[npm-url]: https://badge.fury.io/js/jsdoc-tag-parser
[npm-image]: https://badge.fury.io/js/jsdoc-tag-parser.svg

[license-url]: https://github.com/julianjensen/jsdoc-tag-parser/blob/master/LICENSE
[license-image]: https://img.shields.io/badge/license-MIT-brightgreen.svg

[snyk-url]: https://snyk.io/test/github/julianjensen/jsdoc-tag-parser
[snyk-image]: https://snyk.io/test/github/julianjensen/jsdoc-tag-parser/badge.svg

[david-dm-url]: https://david-dm.org/julianjensen/jsdoc-tag-parser
[david-dm-image]: https://david-dm.org/julianjensen/jsdoc-tag-parser.svg

