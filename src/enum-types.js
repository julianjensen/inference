/** *********************************************************************************************************************
 * Enums extracted from /mnt/e/code/typescript/src/compiler/types.ts
 ************************************************************************************************************************/
"use strict";

let DEBUG;

const
    wrapped = ( lhsName, rhs ) => ( { enumerable: true, writable: true, configurable: true, value: { toString: () => lhsName, valueOf: () => rhs, [ Symbol.toPrimitive ]: hint => hint === 'string' ? lhsName : rhs } } ),
            inspect = require( 'util' ).inspect,
        $ = ( o, d =2 ) => inspect( o, { depth: typeof d === 'number' ? d : 2, colors: true } ),

    named = name => ( { enumerable: true, writable: true, configurable: true, value: name } ),
    has = ( o, n ) => Reflect.has( o, n ),
    VALUE = Symbol( 'value' ),
    asString = function( base ) { return function( _num = 0 ) {
                let i   = 1,
                    s   = [],
                    num = +_num;

                if ( typeof _num === 'string' ) return _num;

                while ( num )
                {
                    if ( num & 1 )
                        s.push( `${base[ i ]}` );

                    num >>>= 1;
                    i <<= 1;
                }

                return s.join( ' | ' );
            }
        },
    templ    = () => {
        const _ = {
            create( val )
            {
                const o = Object.create( Object.getPrototypeOf( this ) );
                o[ VALUE ] = val || 0;
                return o;
            },
            get value() { return this[ VALUE ]; },
            set value( v ) { this[ VALUE ] = v; },
            asString,
            toString() { return this[ VALUE ] ? this.asString( this[ VALUE ] ) : '<no value>'; },
            valueOf() { return this[ VALUE ] || 0; },
            [ Symbol.toPrimitive ]( hint ) { return hint === 'string' ? this.toString() : this.valueOf(); }
        };

        return _;
    };

/** *********************************************************************************************************************
 * @enum
 * @name Comparison
 ************************************************************************************************************************/
let Comparison = {}; // Object.create( ( () => new ( function Comparison() {} )() )(), {} );
Comparison.LessThan = wrapped( 'LessThan', -1 );
Comparison[ +Comparison.LessThan.value ] = typeof Comparison[ +Comparison.LessThan.value ] !== 'number' ? named( 'LessThan' ) : Comparison[ +Comparison.LessThan.value ];
Comparison.EqualTo = wrapped( 'EqualTo', 0 );
Comparison[ +Comparison.EqualTo.value ] = typeof Comparison[ +Comparison.EqualTo.value ] !== 'number' ? named( 'EqualTo' ) : Comparison[ +Comparison.EqualTo.value ];
Comparison.GreaterThan = wrapped( 'GreaterThan', 1 );
Comparison[ +Comparison.GreaterThan.value ] = typeof Comparison[ +Comparison.GreaterThan.value ] !== 'number' ? named( 'GreaterThan' ) : Comparison[ +Comparison.GreaterThan.value ];

Comparison = Object.create( templ(), Comparison );
Object.getPrototypeOf( Comparison ).asString = asString( Comparison );

/** *********************************************************************************************************************
 * @enum
 * @name SyntaxKind
 ************************************************************************************************************************/
let SyntaxKind = {}; // Object.create( ( () => new ( function SyntaxKind() {} )() )(), {} );
SyntaxKind.Unknown = wrapped( 'Unknown', 1 );
SyntaxKind[ +SyntaxKind.Unknown.value ] = typeof SyntaxKind[ +SyntaxKind.Unknown.value ] !== 'number' ? named( 'Unknown' ) : SyntaxKind[ +SyntaxKind.Unknown.value ];
SyntaxKind.EndOfFileToken = wrapped( 'EndOfFileToken', 2 );
SyntaxKind[ +SyntaxKind.EndOfFileToken.value ] = typeof SyntaxKind[ +SyntaxKind.EndOfFileToken.value ] !== 'number' ? named( 'EndOfFileToken' ) : SyntaxKind[ +SyntaxKind.EndOfFileToken.value ];
SyntaxKind.SingleLineCommentTrivia = wrapped( 'SingleLineCommentTrivia', 3 );
SyntaxKind[ +SyntaxKind.SingleLineCommentTrivia.value ] = typeof SyntaxKind[ +SyntaxKind.SingleLineCommentTrivia.value ] !== 'number' ? named( 'SingleLineCommentTrivia' ) : SyntaxKind[ +SyntaxKind.SingleLineCommentTrivia.value ];
SyntaxKind.MultiLineCommentTrivia = wrapped( 'MultiLineCommentTrivia', 4 );
SyntaxKind[ +SyntaxKind.MultiLineCommentTrivia.value ] = typeof SyntaxKind[ +SyntaxKind.MultiLineCommentTrivia.value ] !== 'number' ? named( 'MultiLineCommentTrivia' ) : SyntaxKind[ +SyntaxKind.MultiLineCommentTrivia.value ];
SyntaxKind.NewLineTrivia = wrapped( 'NewLineTrivia', 5 );
SyntaxKind[ +SyntaxKind.NewLineTrivia.value ] = typeof SyntaxKind[ +SyntaxKind.NewLineTrivia.value ] !== 'number' ? named( 'NewLineTrivia' ) : SyntaxKind[ +SyntaxKind.NewLineTrivia.value ];
SyntaxKind.WhitespaceTrivia = wrapped( 'WhitespaceTrivia', 6 );
SyntaxKind[ +SyntaxKind.WhitespaceTrivia.value ] = typeof SyntaxKind[ +SyntaxKind.WhitespaceTrivia.value ] !== 'number' ? named( 'WhitespaceTrivia' ) : SyntaxKind[ +SyntaxKind.WhitespaceTrivia.value ];
SyntaxKind.ShebangTrivia = wrapped( 'ShebangTrivia', 7 );
SyntaxKind[ +SyntaxKind.ShebangTrivia.value ] = typeof SyntaxKind[ +SyntaxKind.ShebangTrivia.value ] !== 'number' ? named( 'ShebangTrivia' ) : SyntaxKind[ +SyntaxKind.ShebangTrivia.value ];
SyntaxKind.ConflictMarkerTrivia = wrapped( 'ConflictMarkerTrivia', 8 );
SyntaxKind[ +SyntaxKind.ConflictMarkerTrivia.value ] = typeof SyntaxKind[ +SyntaxKind.ConflictMarkerTrivia.value ] !== 'number' ? named( 'ConflictMarkerTrivia' ) : SyntaxKind[ +SyntaxKind.ConflictMarkerTrivia.value ];
SyntaxKind.NumericLiteral = wrapped( 'NumericLiteral', 9 );
SyntaxKind[ +SyntaxKind.NumericLiteral.value ] = typeof SyntaxKind[ +SyntaxKind.NumericLiteral.value ] !== 'number' ? named( 'NumericLiteral' ) : SyntaxKind[ +SyntaxKind.NumericLiteral.value ];
SyntaxKind.StringLiteral = wrapped( 'StringLiteral', 10 );
SyntaxKind[ +SyntaxKind.StringLiteral.value ] = typeof SyntaxKind[ +SyntaxKind.StringLiteral.value ] !== 'number' ? named( 'StringLiteral' ) : SyntaxKind[ +SyntaxKind.StringLiteral.value ];
SyntaxKind.JsxText = wrapped( 'JsxText', 11 );
SyntaxKind[ +SyntaxKind.JsxText.value ] = typeof SyntaxKind[ +SyntaxKind.JsxText.value ] !== 'number' ? named( 'JsxText' ) : SyntaxKind[ +SyntaxKind.JsxText.value ];
SyntaxKind.JsxTextAllWhiteSpaces = wrapped( 'JsxTextAllWhiteSpaces', 12 );
SyntaxKind[ +SyntaxKind.JsxTextAllWhiteSpaces.value ] = typeof SyntaxKind[ +SyntaxKind.JsxTextAllWhiteSpaces.value ] !== 'number' ? named( 'JsxTextAllWhiteSpaces' ) : SyntaxKind[ +SyntaxKind.JsxTextAllWhiteSpaces.value ];
SyntaxKind.RegularExpressionLiteral = wrapped( 'RegularExpressionLiteral', 13 );
SyntaxKind[ +SyntaxKind.RegularExpressionLiteral.value ] = typeof SyntaxKind[ +SyntaxKind.RegularExpressionLiteral.value ] !== 'number' ? named( 'RegularExpressionLiteral' ) : SyntaxKind[ +SyntaxKind.RegularExpressionLiteral.value ];
SyntaxKind.NoSubstitutionTemplateLiteral = wrapped( 'NoSubstitutionTemplateLiteral', 14 );
SyntaxKind[ +SyntaxKind.NoSubstitutionTemplateLiteral.value ] = typeof SyntaxKind[ +SyntaxKind.NoSubstitutionTemplateLiteral.value ] !== 'number' ? named( 'NoSubstitutionTemplateLiteral' ) : SyntaxKind[ +SyntaxKind.NoSubstitutionTemplateLiteral.value ];
SyntaxKind.TemplateHead = wrapped( 'TemplateHead', 15 );
SyntaxKind[ +SyntaxKind.TemplateHead.value ] = typeof SyntaxKind[ +SyntaxKind.TemplateHead.value ] !== 'number' ? named( 'TemplateHead' ) : SyntaxKind[ +SyntaxKind.TemplateHead.value ];
SyntaxKind.TemplateMiddle = wrapped( 'TemplateMiddle', 16 );
SyntaxKind[ +SyntaxKind.TemplateMiddle.value ] = typeof SyntaxKind[ +SyntaxKind.TemplateMiddle.value ] !== 'number' ? named( 'TemplateMiddle' ) : SyntaxKind[ +SyntaxKind.TemplateMiddle.value ];
SyntaxKind.TemplateTail = wrapped( 'TemplateTail', 17 );
SyntaxKind[ +SyntaxKind.TemplateTail.value ] = typeof SyntaxKind[ +SyntaxKind.TemplateTail.value ] !== 'number' ? named( 'TemplateTail' ) : SyntaxKind[ +SyntaxKind.TemplateTail.value ];
SyntaxKind.OpenBraceToken = wrapped( 'OpenBraceToken', 18 );
SyntaxKind[ +SyntaxKind.OpenBraceToken.value ] = typeof SyntaxKind[ +SyntaxKind.OpenBraceToken.value ] !== 'number' ? named( 'OpenBraceToken' ) : SyntaxKind[ +SyntaxKind.OpenBraceToken.value ];
SyntaxKind.CloseBraceToken = wrapped( 'CloseBraceToken', 19 );
SyntaxKind[ +SyntaxKind.CloseBraceToken.value ] = typeof SyntaxKind[ +SyntaxKind.CloseBraceToken.value ] !== 'number' ? named( 'CloseBraceToken' ) : SyntaxKind[ +SyntaxKind.CloseBraceToken.value ];
SyntaxKind.OpenParenToken = wrapped( 'OpenParenToken', 20 );
SyntaxKind[ +SyntaxKind.OpenParenToken.value ] = typeof SyntaxKind[ +SyntaxKind.OpenParenToken.value ] !== 'number' ? named( 'OpenParenToken' ) : SyntaxKind[ +SyntaxKind.OpenParenToken.value ];
SyntaxKind.CloseParenToken = wrapped( 'CloseParenToken', 21 );
SyntaxKind[ +SyntaxKind.CloseParenToken.value ] = typeof SyntaxKind[ +SyntaxKind.CloseParenToken.value ] !== 'number' ? named( 'CloseParenToken' ) : SyntaxKind[ +SyntaxKind.CloseParenToken.value ];
SyntaxKind.OpenBracketToken = wrapped( 'OpenBracketToken', 22 );
SyntaxKind[ +SyntaxKind.OpenBracketToken.value ] = typeof SyntaxKind[ +SyntaxKind.OpenBracketToken.value ] !== 'number' ? named( 'OpenBracketToken' ) : SyntaxKind[ +SyntaxKind.OpenBracketToken.value ];
SyntaxKind.CloseBracketToken = wrapped( 'CloseBracketToken', 23 );
SyntaxKind[ +SyntaxKind.CloseBracketToken.value ] = typeof SyntaxKind[ +SyntaxKind.CloseBracketToken.value ] !== 'number' ? named( 'CloseBracketToken' ) : SyntaxKind[ +SyntaxKind.CloseBracketToken.value ];
SyntaxKind.DotToken = wrapped( 'DotToken', 24 );
SyntaxKind[ +SyntaxKind.DotToken.value ] = typeof SyntaxKind[ +SyntaxKind.DotToken.value ] !== 'number' ? named( 'DotToken' ) : SyntaxKind[ +SyntaxKind.DotToken.value ];
SyntaxKind.DotDotDotToken = wrapped( 'DotDotDotToken', 25 );
SyntaxKind[ +SyntaxKind.DotDotDotToken.value ] = typeof SyntaxKind[ +SyntaxKind.DotDotDotToken.value ] !== 'number' ? named( 'DotDotDotToken' ) : SyntaxKind[ +SyntaxKind.DotDotDotToken.value ];
SyntaxKind.SemicolonToken = wrapped( 'SemicolonToken', 26 );
SyntaxKind[ +SyntaxKind.SemicolonToken.value ] = typeof SyntaxKind[ +SyntaxKind.SemicolonToken.value ] !== 'number' ? named( 'SemicolonToken' ) : SyntaxKind[ +SyntaxKind.SemicolonToken.value ];
SyntaxKind.CommaToken = wrapped( 'CommaToken', 27 );
SyntaxKind[ +SyntaxKind.CommaToken.value ] = typeof SyntaxKind[ +SyntaxKind.CommaToken.value ] !== 'number' ? named( 'CommaToken' ) : SyntaxKind[ +SyntaxKind.CommaToken.value ];
SyntaxKind.LessThanToken = wrapped( 'LessThanToken', 28 );
SyntaxKind[ +SyntaxKind.LessThanToken.value ] = typeof SyntaxKind[ +SyntaxKind.LessThanToken.value ] !== 'number' ? named( 'LessThanToken' ) : SyntaxKind[ +SyntaxKind.LessThanToken.value ];
SyntaxKind.LessThanSlashToken = wrapped( 'LessThanSlashToken', 29 );
SyntaxKind[ +SyntaxKind.LessThanSlashToken.value ] = typeof SyntaxKind[ +SyntaxKind.LessThanSlashToken.value ] !== 'number' ? named( 'LessThanSlashToken' ) : SyntaxKind[ +SyntaxKind.LessThanSlashToken.value ];
SyntaxKind.GreaterThanToken = wrapped( 'GreaterThanToken', 30 );
SyntaxKind[ +SyntaxKind.GreaterThanToken.value ] = typeof SyntaxKind[ +SyntaxKind.GreaterThanToken.value ] !== 'number' ? named( 'GreaterThanToken' ) : SyntaxKind[ +SyntaxKind.GreaterThanToken.value ];
SyntaxKind.LessThanEqualsToken = wrapped( 'LessThanEqualsToken', 31 );
SyntaxKind[ +SyntaxKind.LessThanEqualsToken.value ] = typeof SyntaxKind[ +SyntaxKind.LessThanEqualsToken.value ] !== 'number' ? named( 'LessThanEqualsToken' ) : SyntaxKind[ +SyntaxKind.LessThanEqualsToken.value ];
SyntaxKind.GreaterThanEqualsToken = wrapped( 'GreaterThanEqualsToken', 32 );
SyntaxKind[ +SyntaxKind.GreaterThanEqualsToken.value ] = typeof SyntaxKind[ +SyntaxKind.GreaterThanEqualsToken.value ] !== 'number' ? named( 'GreaterThanEqualsToken' ) : SyntaxKind[ +SyntaxKind.GreaterThanEqualsToken.value ];
SyntaxKind.EqualsEqualsToken = wrapped( 'EqualsEqualsToken', 33 );
SyntaxKind[ +SyntaxKind.EqualsEqualsToken.value ] = typeof SyntaxKind[ +SyntaxKind.EqualsEqualsToken.value ] !== 'number' ? named( 'EqualsEqualsToken' ) : SyntaxKind[ +SyntaxKind.EqualsEqualsToken.value ];
SyntaxKind.ExclamationEqualsToken = wrapped( 'ExclamationEqualsToken', 34 );
SyntaxKind[ +SyntaxKind.ExclamationEqualsToken.value ] = typeof SyntaxKind[ +SyntaxKind.ExclamationEqualsToken.value ] !== 'number' ? named( 'ExclamationEqualsToken' ) : SyntaxKind[ +SyntaxKind.ExclamationEqualsToken.value ];
SyntaxKind.EqualsEqualsEqualsToken = wrapped( 'EqualsEqualsEqualsToken', 35 );
SyntaxKind[ +SyntaxKind.EqualsEqualsEqualsToken.value ] = typeof SyntaxKind[ +SyntaxKind.EqualsEqualsEqualsToken.value ] !== 'number' ? named( 'EqualsEqualsEqualsToken' ) : SyntaxKind[ +SyntaxKind.EqualsEqualsEqualsToken.value ];
SyntaxKind.ExclamationEqualsEqualsToken = wrapped( 'ExclamationEqualsEqualsToken', 36 );
SyntaxKind[ +SyntaxKind.ExclamationEqualsEqualsToken.value ] = typeof SyntaxKind[ +SyntaxKind.ExclamationEqualsEqualsToken.value ] !== 'number' ? named( 'ExclamationEqualsEqualsToken' ) : SyntaxKind[ +SyntaxKind.ExclamationEqualsEqualsToken.value ];
SyntaxKind.EqualsGreaterThanToken = wrapped( 'EqualsGreaterThanToken', 37 );
SyntaxKind[ +SyntaxKind.EqualsGreaterThanToken.value ] = typeof SyntaxKind[ +SyntaxKind.EqualsGreaterThanToken.value ] !== 'number' ? named( 'EqualsGreaterThanToken' ) : SyntaxKind[ +SyntaxKind.EqualsGreaterThanToken.value ];
SyntaxKind.PlusToken = wrapped( 'PlusToken', 38 );
SyntaxKind[ +SyntaxKind.PlusToken.value ] = typeof SyntaxKind[ +SyntaxKind.PlusToken.value ] !== 'number' ? named( 'PlusToken' ) : SyntaxKind[ +SyntaxKind.PlusToken.value ];
SyntaxKind.MinusToken = wrapped( 'MinusToken', 39 );
SyntaxKind[ +SyntaxKind.MinusToken.value ] = typeof SyntaxKind[ +SyntaxKind.MinusToken.value ] !== 'number' ? named( 'MinusToken' ) : SyntaxKind[ +SyntaxKind.MinusToken.value ];
SyntaxKind.AsteriskToken = wrapped( 'AsteriskToken', 40 );
SyntaxKind[ +SyntaxKind.AsteriskToken.value ] = typeof SyntaxKind[ +SyntaxKind.AsteriskToken.value ] !== 'number' ? named( 'AsteriskToken' ) : SyntaxKind[ +SyntaxKind.AsteriskToken.value ];
SyntaxKind.AsteriskAsteriskToken = wrapped( 'AsteriskAsteriskToken', 41 );
SyntaxKind[ +SyntaxKind.AsteriskAsteriskToken.value ] = typeof SyntaxKind[ +SyntaxKind.AsteriskAsteriskToken.value ] !== 'number' ? named( 'AsteriskAsteriskToken' ) : SyntaxKind[ +SyntaxKind.AsteriskAsteriskToken.value ];
SyntaxKind.SlashToken = wrapped( 'SlashToken', 42 );
SyntaxKind[ +SyntaxKind.SlashToken.value ] = typeof SyntaxKind[ +SyntaxKind.SlashToken.value ] !== 'number' ? named( 'SlashToken' ) : SyntaxKind[ +SyntaxKind.SlashToken.value ];
SyntaxKind.PercentToken = wrapped( 'PercentToken', 43 );
SyntaxKind[ +SyntaxKind.PercentToken.value ] = typeof SyntaxKind[ +SyntaxKind.PercentToken.value ] !== 'number' ? named( 'PercentToken' ) : SyntaxKind[ +SyntaxKind.PercentToken.value ];
SyntaxKind.PlusPlusToken = wrapped( 'PlusPlusToken', 44 );
SyntaxKind[ +SyntaxKind.PlusPlusToken.value ] = typeof SyntaxKind[ +SyntaxKind.PlusPlusToken.value ] !== 'number' ? named( 'PlusPlusToken' ) : SyntaxKind[ +SyntaxKind.PlusPlusToken.value ];
SyntaxKind.MinusMinusToken = wrapped( 'MinusMinusToken', 45 );
SyntaxKind[ +SyntaxKind.MinusMinusToken.value ] = typeof SyntaxKind[ +SyntaxKind.MinusMinusToken.value ] !== 'number' ? named( 'MinusMinusToken' ) : SyntaxKind[ +SyntaxKind.MinusMinusToken.value ];
SyntaxKind.LessThanLessThanToken = wrapped( 'LessThanLessThanToken', 46 );
SyntaxKind[ +SyntaxKind.LessThanLessThanToken.value ] = typeof SyntaxKind[ +SyntaxKind.LessThanLessThanToken.value ] !== 'number' ? named( 'LessThanLessThanToken' ) : SyntaxKind[ +SyntaxKind.LessThanLessThanToken.value ];
SyntaxKind.GreaterThanGreaterThanToken = wrapped( 'GreaterThanGreaterThanToken', 47 );
SyntaxKind[ +SyntaxKind.GreaterThanGreaterThanToken.value ] = typeof SyntaxKind[ +SyntaxKind.GreaterThanGreaterThanToken.value ] !== 'number' ? named( 'GreaterThanGreaterThanToken' ) : SyntaxKind[ +SyntaxKind.GreaterThanGreaterThanToken.value ];
SyntaxKind.GreaterThanGreaterThanGreaterThanToken = wrapped( 'GreaterThanGreaterThanGreaterThanToken', 48 );
SyntaxKind[ +SyntaxKind.GreaterThanGreaterThanGreaterThanToken.value ] = typeof SyntaxKind[ +SyntaxKind.GreaterThanGreaterThanGreaterThanToken.value ] !== 'number' ? named( 'GreaterThanGreaterThanGreaterThanToken' ) : SyntaxKind[ +SyntaxKind.GreaterThanGreaterThanGreaterThanToken.value ];
SyntaxKind.AmpersandToken = wrapped( 'AmpersandToken', 49 );
SyntaxKind[ +SyntaxKind.AmpersandToken.value ] = typeof SyntaxKind[ +SyntaxKind.AmpersandToken.value ] !== 'number' ? named( 'AmpersandToken' ) : SyntaxKind[ +SyntaxKind.AmpersandToken.value ];
SyntaxKind.BarToken = wrapped( 'BarToken', 50 );
SyntaxKind[ +SyntaxKind.BarToken.value ] = typeof SyntaxKind[ +SyntaxKind.BarToken.value ] !== 'number' ? named( 'BarToken' ) : SyntaxKind[ +SyntaxKind.BarToken.value ];
SyntaxKind.CaretToken = wrapped( 'CaretToken', 51 );
SyntaxKind[ +SyntaxKind.CaretToken.value ] = typeof SyntaxKind[ +SyntaxKind.CaretToken.value ] !== 'number' ? named( 'CaretToken' ) : SyntaxKind[ +SyntaxKind.CaretToken.value ];
SyntaxKind.ExclamationToken = wrapped( 'ExclamationToken', 52 );
SyntaxKind[ +SyntaxKind.ExclamationToken.value ] = typeof SyntaxKind[ +SyntaxKind.ExclamationToken.value ] !== 'number' ? named( 'ExclamationToken' ) : SyntaxKind[ +SyntaxKind.ExclamationToken.value ];
SyntaxKind.TildeToken = wrapped( 'TildeToken', 53 );
SyntaxKind[ +SyntaxKind.TildeToken.value ] = typeof SyntaxKind[ +SyntaxKind.TildeToken.value ] !== 'number' ? named( 'TildeToken' ) : SyntaxKind[ +SyntaxKind.TildeToken.value ];
SyntaxKind.AmpersandAmpersandToken = wrapped( 'AmpersandAmpersandToken', 54 );
SyntaxKind[ +SyntaxKind.AmpersandAmpersandToken.value ] = typeof SyntaxKind[ +SyntaxKind.AmpersandAmpersandToken.value ] !== 'number' ? named( 'AmpersandAmpersandToken' ) : SyntaxKind[ +SyntaxKind.AmpersandAmpersandToken.value ];
SyntaxKind.BarBarToken = wrapped( 'BarBarToken', 55 );
SyntaxKind[ +SyntaxKind.BarBarToken.value ] = typeof SyntaxKind[ +SyntaxKind.BarBarToken.value ] !== 'number' ? named( 'BarBarToken' ) : SyntaxKind[ +SyntaxKind.BarBarToken.value ];
SyntaxKind.QuestionToken = wrapped( 'QuestionToken', 56 );
SyntaxKind[ +SyntaxKind.QuestionToken.value ] = typeof SyntaxKind[ +SyntaxKind.QuestionToken.value ] !== 'number' ? named( 'QuestionToken' ) : SyntaxKind[ +SyntaxKind.QuestionToken.value ];
SyntaxKind.ColonToken = wrapped( 'ColonToken', 57 );
SyntaxKind[ +SyntaxKind.ColonToken.value ] = typeof SyntaxKind[ +SyntaxKind.ColonToken.value ] !== 'number' ? named( 'ColonToken' ) : SyntaxKind[ +SyntaxKind.ColonToken.value ];
SyntaxKind.AtToken = wrapped( 'AtToken', 58 );
SyntaxKind[ +SyntaxKind.AtToken.value ] = typeof SyntaxKind[ +SyntaxKind.AtToken.value ] !== 'number' ? named( 'AtToken' ) : SyntaxKind[ +SyntaxKind.AtToken.value ];
SyntaxKind.EqualsToken = wrapped( 'EqualsToken', 59 );
SyntaxKind[ +SyntaxKind.EqualsToken.value ] = typeof SyntaxKind[ +SyntaxKind.EqualsToken.value ] !== 'number' ? named( 'EqualsToken' ) : SyntaxKind[ +SyntaxKind.EqualsToken.value ];
SyntaxKind.PlusEqualsToken = wrapped( 'PlusEqualsToken', 60 );
SyntaxKind[ +SyntaxKind.PlusEqualsToken.value ] = typeof SyntaxKind[ +SyntaxKind.PlusEqualsToken.value ] !== 'number' ? named( 'PlusEqualsToken' ) : SyntaxKind[ +SyntaxKind.PlusEqualsToken.value ];
SyntaxKind.MinusEqualsToken = wrapped( 'MinusEqualsToken', 61 );
SyntaxKind[ +SyntaxKind.MinusEqualsToken.value ] = typeof SyntaxKind[ +SyntaxKind.MinusEqualsToken.value ] !== 'number' ? named( 'MinusEqualsToken' ) : SyntaxKind[ +SyntaxKind.MinusEqualsToken.value ];
SyntaxKind.AsteriskEqualsToken = wrapped( 'AsteriskEqualsToken', 62 );
SyntaxKind[ +SyntaxKind.AsteriskEqualsToken.value ] = typeof SyntaxKind[ +SyntaxKind.AsteriskEqualsToken.value ] !== 'number' ? named( 'AsteriskEqualsToken' ) : SyntaxKind[ +SyntaxKind.AsteriskEqualsToken.value ];
SyntaxKind.AsteriskAsteriskEqualsToken = wrapped( 'AsteriskAsteriskEqualsToken', 63 );
SyntaxKind[ +SyntaxKind.AsteriskAsteriskEqualsToken.value ] = typeof SyntaxKind[ +SyntaxKind.AsteriskAsteriskEqualsToken.value ] !== 'number' ? named( 'AsteriskAsteriskEqualsToken' ) : SyntaxKind[ +SyntaxKind.AsteriskAsteriskEqualsToken.value ];
SyntaxKind.SlashEqualsToken = wrapped( 'SlashEqualsToken', 64 );
SyntaxKind[ +SyntaxKind.SlashEqualsToken.value ] = typeof SyntaxKind[ +SyntaxKind.SlashEqualsToken.value ] !== 'number' ? named( 'SlashEqualsToken' ) : SyntaxKind[ +SyntaxKind.SlashEqualsToken.value ];
SyntaxKind.PercentEqualsToken = wrapped( 'PercentEqualsToken', 65 );
SyntaxKind[ +SyntaxKind.PercentEqualsToken.value ] = typeof SyntaxKind[ +SyntaxKind.PercentEqualsToken.value ] !== 'number' ? named( 'PercentEqualsToken' ) : SyntaxKind[ +SyntaxKind.PercentEqualsToken.value ];
SyntaxKind.LessThanLessThanEqualsToken = wrapped( 'LessThanLessThanEqualsToken', 66 );
SyntaxKind[ +SyntaxKind.LessThanLessThanEqualsToken.value ] = typeof SyntaxKind[ +SyntaxKind.LessThanLessThanEqualsToken.value ] !== 'number' ? named( 'LessThanLessThanEqualsToken' ) : SyntaxKind[ +SyntaxKind.LessThanLessThanEqualsToken.value ];
SyntaxKind.GreaterThanGreaterThanEqualsToken = wrapped( 'GreaterThanGreaterThanEqualsToken', 67 );
SyntaxKind[ +SyntaxKind.GreaterThanGreaterThanEqualsToken.value ] = typeof SyntaxKind[ +SyntaxKind.GreaterThanGreaterThanEqualsToken.value ] !== 'number' ? named( 'GreaterThanGreaterThanEqualsToken' ) : SyntaxKind[ +SyntaxKind.GreaterThanGreaterThanEqualsToken.value ];
SyntaxKind.GreaterThanGreaterThanGreaterThanEqualsToken = wrapped( 'GreaterThanGreaterThanGreaterThanEqualsToken', 68 );
SyntaxKind[ +SyntaxKind.GreaterThanGreaterThanGreaterThanEqualsToken.value ] = typeof SyntaxKind[ +SyntaxKind.GreaterThanGreaterThanGreaterThanEqualsToken.value ] !== 'number' ? named( 'GreaterThanGreaterThanGreaterThanEqualsToken' ) : SyntaxKind[ +SyntaxKind.GreaterThanGreaterThanGreaterThanEqualsToken.value ];
SyntaxKind.AmpersandEqualsToken = wrapped( 'AmpersandEqualsToken', 69 );
SyntaxKind[ +SyntaxKind.AmpersandEqualsToken.value ] = typeof SyntaxKind[ +SyntaxKind.AmpersandEqualsToken.value ] !== 'number' ? named( 'AmpersandEqualsToken' ) : SyntaxKind[ +SyntaxKind.AmpersandEqualsToken.value ];
SyntaxKind.BarEqualsToken = wrapped( 'BarEqualsToken', 70 );
SyntaxKind[ +SyntaxKind.BarEqualsToken.value ] = typeof SyntaxKind[ +SyntaxKind.BarEqualsToken.value ] !== 'number' ? named( 'BarEqualsToken' ) : SyntaxKind[ +SyntaxKind.BarEqualsToken.value ];
SyntaxKind.CaretEqualsToken = wrapped( 'CaretEqualsToken', 71 );
SyntaxKind[ +SyntaxKind.CaretEqualsToken.value ] = typeof SyntaxKind[ +SyntaxKind.CaretEqualsToken.value ] !== 'number' ? named( 'CaretEqualsToken' ) : SyntaxKind[ +SyntaxKind.CaretEqualsToken.value ];
SyntaxKind.Identifier = wrapped( 'Identifier', 72 );
SyntaxKind[ +SyntaxKind.Identifier.value ] = typeof SyntaxKind[ +SyntaxKind.Identifier.value ] !== 'number' ? named( 'Identifier' ) : SyntaxKind[ +SyntaxKind.Identifier.value ];
SyntaxKind.BreakKeyword = wrapped( 'BreakKeyword', 73 );
SyntaxKind[ +SyntaxKind.BreakKeyword.value ] = typeof SyntaxKind[ +SyntaxKind.BreakKeyword.value ] !== 'number' ? named( 'BreakKeyword' ) : SyntaxKind[ +SyntaxKind.BreakKeyword.value ];
SyntaxKind.CaseKeyword = wrapped( 'CaseKeyword', 74 );
SyntaxKind[ +SyntaxKind.CaseKeyword.value ] = typeof SyntaxKind[ +SyntaxKind.CaseKeyword.value ] !== 'number' ? named( 'CaseKeyword' ) : SyntaxKind[ +SyntaxKind.CaseKeyword.value ];
SyntaxKind.CatchKeyword = wrapped( 'CatchKeyword', 75 );
SyntaxKind[ +SyntaxKind.CatchKeyword.value ] = typeof SyntaxKind[ +SyntaxKind.CatchKeyword.value ] !== 'number' ? named( 'CatchKeyword' ) : SyntaxKind[ +SyntaxKind.CatchKeyword.value ];
SyntaxKind.ClassKeyword = wrapped( 'ClassKeyword', 76 );
SyntaxKind[ +SyntaxKind.ClassKeyword.value ] = typeof SyntaxKind[ +SyntaxKind.ClassKeyword.value ] !== 'number' ? named( 'ClassKeyword' ) : SyntaxKind[ +SyntaxKind.ClassKeyword.value ];
SyntaxKind.ConstKeyword = wrapped( 'ConstKeyword', 77 );
SyntaxKind[ +SyntaxKind.ConstKeyword.value ] = typeof SyntaxKind[ +SyntaxKind.ConstKeyword.value ] !== 'number' ? named( 'ConstKeyword' ) : SyntaxKind[ +SyntaxKind.ConstKeyword.value ];
SyntaxKind.ContinueKeyword = wrapped( 'ContinueKeyword', 78 );
SyntaxKind[ +SyntaxKind.ContinueKeyword.value ] = typeof SyntaxKind[ +SyntaxKind.ContinueKeyword.value ] !== 'number' ? named( 'ContinueKeyword' ) : SyntaxKind[ +SyntaxKind.ContinueKeyword.value ];
SyntaxKind.DebuggerKeyword = wrapped( 'DebuggerKeyword', 79 );
SyntaxKind[ +SyntaxKind.DebuggerKeyword.value ] = typeof SyntaxKind[ +SyntaxKind.DebuggerKeyword.value ] !== 'number' ? named( 'DebuggerKeyword' ) : SyntaxKind[ +SyntaxKind.DebuggerKeyword.value ];
SyntaxKind.DefaultKeyword = wrapped( 'DefaultKeyword', 80 );
SyntaxKind[ +SyntaxKind.DefaultKeyword.value ] = typeof SyntaxKind[ +SyntaxKind.DefaultKeyword.value ] !== 'number' ? named( 'DefaultKeyword' ) : SyntaxKind[ +SyntaxKind.DefaultKeyword.value ];
SyntaxKind.DeleteKeyword = wrapped( 'DeleteKeyword', 81 );
SyntaxKind[ +SyntaxKind.DeleteKeyword.value ] = typeof SyntaxKind[ +SyntaxKind.DeleteKeyword.value ] !== 'number' ? named( 'DeleteKeyword' ) : SyntaxKind[ +SyntaxKind.DeleteKeyword.value ];
SyntaxKind.DoKeyword = wrapped( 'DoKeyword', 82 );
SyntaxKind[ +SyntaxKind.DoKeyword.value ] = typeof SyntaxKind[ +SyntaxKind.DoKeyword.value ] !== 'number' ? named( 'DoKeyword' ) : SyntaxKind[ +SyntaxKind.DoKeyword.value ];
SyntaxKind.ElseKeyword = wrapped( 'ElseKeyword', 83 );
SyntaxKind[ +SyntaxKind.ElseKeyword.value ] = typeof SyntaxKind[ +SyntaxKind.ElseKeyword.value ] !== 'number' ? named( 'ElseKeyword' ) : SyntaxKind[ +SyntaxKind.ElseKeyword.value ];
SyntaxKind.EnumKeyword = wrapped( 'EnumKeyword', 84 );
SyntaxKind[ +SyntaxKind.EnumKeyword.value ] = typeof SyntaxKind[ +SyntaxKind.EnumKeyword.value ] !== 'number' ? named( 'EnumKeyword' ) : SyntaxKind[ +SyntaxKind.EnumKeyword.value ];
SyntaxKind.ExportKeyword = wrapped( 'ExportKeyword', 85 );
SyntaxKind[ +SyntaxKind.ExportKeyword.value ] = typeof SyntaxKind[ +SyntaxKind.ExportKeyword.value ] !== 'number' ? named( 'ExportKeyword' ) : SyntaxKind[ +SyntaxKind.ExportKeyword.value ];
SyntaxKind.ExtendsKeyword = wrapped( 'ExtendsKeyword', 86 );
SyntaxKind[ +SyntaxKind.ExtendsKeyword.value ] = typeof SyntaxKind[ +SyntaxKind.ExtendsKeyword.value ] !== 'number' ? named( 'ExtendsKeyword' ) : SyntaxKind[ +SyntaxKind.ExtendsKeyword.value ];
SyntaxKind.FalseKeyword = wrapped( 'FalseKeyword', 87 );
SyntaxKind[ +SyntaxKind.FalseKeyword.value ] = typeof SyntaxKind[ +SyntaxKind.FalseKeyword.value ] !== 'number' ? named( 'FalseKeyword' ) : SyntaxKind[ +SyntaxKind.FalseKeyword.value ];
SyntaxKind.FinallyKeyword = wrapped( 'FinallyKeyword', 88 );
SyntaxKind[ +SyntaxKind.FinallyKeyword.value ] = typeof SyntaxKind[ +SyntaxKind.FinallyKeyword.value ] !== 'number' ? named( 'FinallyKeyword' ) : SyntaxKind[ +SyntaxKind.FinallyKeyword.value ];
SyntaxKind.ForKeyword = wrapped( 'ForKeyword', 89 );
SyntaxKind[ +SyntaxKind.ForKeyword.value ] = typeof SyntaxKind[ +SyntaxKind.ForKeyword.value ] !== 'number' ? named( 'ForKeyword' ) : SyntaxKind[ +SyntaxKind.ForKeyword.value ];
SyntaxKind.FunctionKeyword = wrapped( 'FunctionKeyword', 90 );
SyntaxKind[ +SyntaxKind.FunctionKeyword.value ] = typeof SyntaxKind[ +SyntaxKind.FunctionKeyword.value ] !== 'number' ? named( 'FunctionKeyword' ) : SyntaxKind[ +SyntaxKind.FunctionKeyword.value ];
SyntaxKind.IfKeyword = wrapped( 'IfKeyword', 91 );
SyntaxKind[ +SyntaxKind.IfKeyword.value ] = typeof SyntaxKind[ +SyntaxKind.IfKeyword.value ] !== 'number' ? named( 'IfKeyword' ) : SyntaxKind[ +SyntaxKind.IfKeyword.value ];
SyntaxKind.ImportKeyword = wrapped( 'ImportKeyword', 92 );
SyntaxKind[ +SyntaxKind.ImportKeyword.value ] = typeof SyntaxKind[ +SyntaxKind.ImportKeyword.value ] !== 'number' ? named( 'ImportKeyword' ) : SyntaxKind[ +SyntaxKind.ImportKeyword.value ];
SyntaxKind.InKeyword = wrapped( 'InKeyword', 93 );
SyntaxKind[ +SyntaxKind.InKeyword.value ] = typeof SyntaxKind[ +SyntaxKind.InKeyword.value ] !== 'number' ? named( 'InKeyword' ) : SyntaxKind[ +SyntaxKind.InKeyword.value ];
SyntaxKind.InstanceOfKeyword = wrapped( 'InstanceOfKeyword', 94 );
SyntaxKind[ +SyntaxKind.InstanceOfKeyword.value ] = typeof SyntaxKind[ +SyntaxKind.InstanceOfKeyword.value ] !== 'number' ? named( 'InstanceOfKeyword' ) : SyntaxKind[ +SyntaxKind.InstanceOfKeyword.value ];
SyntaxKind.NewKeyword = wrapped( 'NewKeyword', 95 );
SyntaxKind[ +SyntaxKind.NewKeyword.value ] = typeof SyntaxKind[ +SyntaxKind.NewKeyword.value ] !== 'number' ? named( 'NewKeyword' ) : SyntaxKind[ +SyntaxKind.NewKeyword.value ];
SyntaxKind.NullKeyword = wrapped( 'NullKeyword', 96 );
SyntaxKind[ +SyntaxKind.NullKeyword.value ] = typeof SyntaxKind[ +SyntaxKind.NullKeyword.value ] !== 'number' ? named( 'NullKeyword' ) : SyntaxKind[ +SyntaxKind.NullKeyword.value ];
SyntaxKind.ReturnKeyword = wrapped( 'ReturnKeyword', 97 );
SyntaxKind[ +SyntaxKind.ReturnKeyword.value ] = typeof SyntaxKind[ +SyntaxKind.ReturnKeyword.value ] !== 'number' ? named( 'ReturnKeyword' ) : SyntaxKind[ +SyntaxKind.ReturnKeyword.value ];
SyntaxKind.SuperKeyword = wrapped( 'SuperKeyword', 98 );
SyntaxKind[ +SyntaxKind.SuperKeyword.value ] = typeof SyntaxKind[ +SyntaxKind.SuperKeyword.value ] !== 'number' ? named( 'SuperKeyword' ) : SyntaxKind[ +SyntaxKind.SuperKeyword.value ];
SyntaxKind.SwitchKeyword = wrapped( 'SwitchKeyword', 99 );
SyntaxKind[ +SyntaxKind.SwitchKeyword.value ] = typeof SyntaxKind[ +SyntaxKind.SwitchKeyword.value ] !== 'number' ? named( 'SwitchKeyword' ) : SyntaxKind[ +SyntaxKind.SwitchKeyword.value ];
SyntaxKind.ThisKeyword = wrapped( 'ThisKeyword', 100 );
SyntaxKind[ +SyntaxKind.ThisKeyword.value ] = typeof SyntaxKind[ +SyntaxKind.ThisKeyword.value ] !== 'number' ? named( 'ThisKeyword' ) : SyntaxKind[ +SyntaxKind.ThisKeyword.value ];
SyntaxKind.ThrowKeyword = wrapped( 'ThrowKeyword', 101 );
SyntaxKind[ +SyntaxKind.ThrowKeyword.value ] = typeof SyntaxKind[ +SyntaxKind.ThrowKeyword.value ] !== 'number' ? named( 'ThrowKeyword' ) : SyntaxKind[ +SyntaxKind.ThrowKeyword.value ];
SyntaxKind.TrueKeyword = wrapped( 'TrueKeyword', 102 );
SyntaxKind[ +SyntaxKind.TrueKeyword.value ] = typeof SyntaxKind[ +SyntaxKind.TrueKeyword.value ] !== 'number' ? named( 'TrueKeyword' ) : SyntaxKind[ +SyntaxKind.TrueKeyword.value ];
SyntaxKind.TryKeyword = wrapped( 'TryKeyword', 103 );
SyntaxKind[ +SyntaxKind.TryKeyword.value ] = typeof SyntaxKind[ +SyntaxKind.TryKeyword.value ] !== 'number' ? named( 'TryKeyword' ) : SyntaxKind[ +SyntaxKind.TryKeyword.value ];
SyntaxKind.TypeOfKeyword = wrapped( 'TypeOfKeyword', 104 );
SyntaxKind[ +SyntaxKind.TypeOfKeyword.value ] = typeof SyntaxKind[ +SyntaxKind.TypeOfKeyword.value ] !== 'number' ? named( 'TypeOfKeyword' ) : SyntaxKind[ +SyntaxKind.TypeOfKeyword.value ];
SyntaxKind.VarKeyword = wrapped( 'VarKeyword', 105 );
SyntaxKind[ +SyntaxKind.VarKeyword.value ] = typeof SyntaxKind[ +SyntaxKind.VarKeyword.value ] !== 'number' ? named( 'VarKeyword' ) : SyntaxKind[ +SyntaxKind.VarKeyword.value ];
SyntaxKind.VoidKeyword = wrapped( 'VoidKeyword', 106 );
SyntaxKind[ +SyntaxKind.VoidKeyword.value ] = typeof SyntaxKind[ +SyntaxKind.VoidKeyword.value ] !== 'number' ? named( 'VoidKeyword' ) : SyntaxKind[ +SyntaxKind.VoidKeyword.value ];
SyntaxKind.WhileKeyword = wrapped( 'WhileKeyword', 107 );
SyntaxKind[ +SyntaxKind.WhileKeyword.value ] = typeof SyntaxKind[ +SyntaxKind.WhileKeyword.value ] !== 'number' ? named( 'WhileKeyword' ) : SyntaxKind[ +SyntaxKind.WhileKeyword.value ];
SyntaxKind.WithKeyword = wrapped( 'WithKeyword', 108 );
SyntaxKind[ +SyntaxKind.WithKeyword.value ] = typeof SyntaxKind[ +SyntaxKind.WithKeyword.value ] !== 'number' ? named( 'WithKeyword' ) : SyntaxKind[ +SyntaxKind.WithKeyword.value ];
SyntaxKind.ImplementsKeyword = wrapped( 'ImplementsKeyword', 109 );
SyntaxKind[ +SyntaxKind.ImplementsKeyword.value ] = typeof SyntaxKind[ +SyntaxKind.ImplementsKeyword.value ] !== 'number' ? named( 'ImplementsKeyword' ) : SyntaxKind[ +SyntaxKind.ImplementsKeyword.value ];
SyntaxKind.InterfaceKeyword = wrapped( 'InterfaceKeyword', 110 );
SyntaxKind[ +SyntaxKind.InterfaceKeyword.value ] = typeof SyntaxKind[ +SyntaxKind.InterfaceKeyword.value ] !== 'number' ? named( 'InterfaceKeyword' ) : SyntaxKind[ +SyntaxKind.InterfaceKeyword.value ];
SyntaxKind.LetKeyword = wrapped( 'LetKeyword', 111 );
SyntaxKind[ +SyntaxKind.LetKeyword.value ] = typeof SyntaxKind[ +SyntaxKind.LetKeyword.value ] !== 'number' ? named( 'LetKeyword' ) : SyntaxKind[ +SyntaxKind.LetKeyword.value ];
SyntaxKind.PackageKeyword = wrapped( 'PackageKeyword', 112 );
SyntaxKind[ +SyntaxKind.PackageKeyword.value ] = typeof SyntaxKind[ +SyntaxKind.PackageKeyword.value ] !== 'number' ? named( 'PackageKeyword' ) : SyntaxKind[ +SyntaxKind.PackageKeyword.value ];
SyntaxKind.PrivateKeyword = wrapped( 'PrivateKeyword', 113 );
SyntaxKind[ +SyntaxKind.PrivateKeyword.value ] = typeof SyntaxKind[ +SyntaxKind.PrivateKeyword.value ] !== 'number' ? named( 'PrivateKeyword' ) : SyntaxKind[ +SyntaxKind.PrivateKeyword.value ];
SyntaxKind.ProtectedKeyword = wrapped( 'ProtectedKeyword', 114 );
SyntaxKind[ +SyntaxKind.ProtectedKeyword.value ] = typeof SyntaxKind[ +SyntaxKind.ProtectedKeyword.value ] !== 'number' ? named( 'ProtectedKeyword' ) : SyntaxKind[ +SyntaxKind.ProtectedKeyword.value ];
SyntaxKind.PublicKeyword = wrapped( 'PublicKeyword', 115 );
SyntaxKind[ +SyntaxKind.PublicKeyword.value ] = typeof SyntaxKind[ +SyntaxKind.PublicKeyword.value ] !== 'number' ? named( 'PublicKeyword' ) : SyntaxKind[ +SyntaxKind.PublicKeyword.value ];
SyntaxKind.StaticKeyword = wrapped( 'StaticKeyword', 116 );
SyntaxKind[ +SyntaxKind.StaticKeyword.value ] = typeof SyntaxKind[ +SyntaxKind.StaticKeyword.value ] !== 'number' ? named( 'StaticKeyword' ) : SyntaxKind[ +SyntaxKind.StaticKeyword.value ];
SyntaxKind.YieldKeyword = wrapped( 'YieldKeyword', 117 );
SyntaxKind[ +SyntaxKind.YieldKeyword.value ] = typeof SyntaxKind[ +SyntaxKind.YieldKeyword.value ] !== 'number' ? named( 'YieldKeyword' ) : SyntaxKind[ +SyntaxKind.YieldKeyword.value ];
SyntaxKind.AbstractKeyword = wrapped( 'AbstractKeyword', 118 );
SyntaxKind[ +SyntaxKind.AbstractKeyword.value ] = typeof SyntaxKind[ +SyntaxKind.AbstractKeyword.value ] !== 'number' ? named( 'AbstractKeyword' ) : SyntaxKind[ +SyntaxKind.AbstractKeyword.value ];
SyntaxKind.AsKeyword = wrapped( 'AsKeyword', 119 );
SyntaxKind[ +SyntaxKind.AsKeyword.value ] = typeof SyntaxKind[ +SyntaxKind.AsKeyword.value ] !== 'number' ? named( 'AsKeyword' ) : SyntaxKind[ +SyntaxKind.AsKeyword.value ];
SyntaxKind.AnyKeyword = wrapped( 'AnyKeyword', 120 );
SyntaxKind[ +SyntaxKind.AnyKeyword.value ] = typeof SyntaxKind[ +SyntaxKind.AnyKeyword.value ] !== 'number' ? named( 'AnyKeyword' ) : SyntaxKind[ +SyntaxKind.AnyKeyword.value ];
SyntaxKind.AsyncKeyword = wrapped( 'AsyncKeyword', 121 );
SyntaxKind[ +SyntaxKind.AsyncKeyword.value ] = typeof SyntaxKind[ +SyntaxKind.AsyncKeyword.value ] !== 'number' ? named( 'AsyncKeyword' ) : SyntaxKind[ +SyntaxKind.AsyncKeyword.value ];
SyntaxKind.AwaitKeyword = wrapped( 'AwaitKeyword', 122 );
SyntaxKind[ +SyntaxKind.AwaitKeyword.value ] = typeof SyntaxKind[ +SyntaxKind.AwaitKeyword.value ] !== 'number' ? named( 'AwaitKeyword' ) : SyntaxKind[ +SyntaxKind.AwaitKeyword.value ];
SyntaxKind.BooleanKeyword = wrapped( 'BooleanKeyword', 123 );
SyntaxKind[ +SyntaxKind.BooleanKeyword.value ] = typeof SyntaxKind[ +SyntaxKind.BooleanKeyword.value ] !== 'number' ? named( 'BooleanKeyword' ) : SyntaxKind[ +SyntaxKind.BooleanKeyword.value ];
SyntaxKind.ConstructorKeyword = wrapped( 'ConstructorKeyword', 124 );
SyntaxKind[ +SyntaxKind.ConstructorKeyword.value ] = typeof SyntaxKind[ +SyntaxKind.ConstructorKeyword.value ] !== 'number' ? named( 'ConstructorKeyword' ) : SyntaxKind[ +SyntaxKind.ConstructorKeyword.value ];
SyntaxKind.DeclareKeyword = wrapped( 'DeclareKeyword', 125 );
SyntaxKind[ +SyntaxKind.DeclareKeyword.value ] = typeof SyntaxKind[ +SyntaxKind.DeclareKeyword.value ] !== 'number' ? named( 'DeclareKeyword' ) : SyntaxKind[ +SyntaxKind.DeclareKeyword.value ];
SyntaxKind.GetKeyword = wrapped( 'GetKeyword', 126 );
SyntaxKind[ +SyntaxKind.GetKeyword.value ] = typeof SyntaxKind[ +SyntaxKind.GetKeyword.value ] !== 'number' ? named( 'GetKeyword' ) : SyntaxKind[ +SyntaxKind.GetKeyword.value ];
SyntaxKind.IsKeyword = wrapped( 'IsKeyword', 127 );
SyntaxKind[ +SyntaxKind.IsKeyword.value ] = typeof SyntaxKind[ +SyntaxKind.IsKeyword.value ] !== 'number' ? named( 'IsKeyword' ) : SyntaxKind[ +SyntaxKind.IsKeyword.value ];
SyntaxKind.KeyOfKeyword = wrapped( 'KeyOfKeyword', 128 );
SyntaxKind[ +SyntaxKind.KeyOfKeyword.value ] = typeof SyntaxKind[ +SyntaxKind.KeyOfKeyword.value ] !== 'number' ? named( 'KeyOfKeyword' ) : SyntaxKind[ +SyntaxKind.KeyOfKeyword.value ];
SyntaxKind.ModuleKeyword = wrapped( 'ModuleKeyword', 129 );
SyntaxKind[ +SyntaxKind.ModuleKeyword.value ] = typeof SyntaxKind[ +SyntaxKind.ModuleKeyword.value ] !== 'number' ? named( 'ModuleKeyword' ) : SyntaxKind[ +SyntaxKind.ModuleKeyword.value ];
SyntaxKind.NamespaceKeyword = wrapped( 'NamespaceKeyword', 130 );
SyntaxKind[ +SyntaxKind.NamespaceKeyword.value ] = typeof SyntaxKind[ +SyntaxKind.NamespaceKeyword.value ] !== 'number' ? named( 'NamespaceKeyword' ) : SyntaxKind[ +SyntaxKind.NamespaceKeyword.value ];
SyntaxKind.NeverKeyword = wrapped( 'NeverKeyword', 131 );
SyntaxKind[ +SyntaxKind.NeverKeyword.value ] = typeof SyntaxKind[ +SyntaxKind.NeverKeyword.value ] !== 'number' ? named( 'NeverKeyword' ) : SyntaxKind[ +SyntaxKind.NeverKeyword.value ];
SyntaxKind.ReadonlyKeyword = wrapped( 'ReadonlyKeyword', 132 );
SyntaxKind[ +SyntaxKind.ReadonlyKeyword.value ] = typeof SyntaxKind[ +SyntaxKind.ReadonlyKeyword.value ] !== 'number' ? named( 'ReadonlyKeyword' ) : SyntaxKind[ +SyntaxKind.ReadonlyKeyword.value ];
SyntaxKind.RequireKeyword = wrapped( 'RequireKeyword', 133 );
SyntaxKind[ +SyntaxKind.RequireKeyword.value ] = typeof SyntaxKind[ +SyntaxKind.RequireKeyword.value ] !== 'number' ? named( 'RequireKeyword' ) : SyntaxKind[ +SyntaxKind.RequireKeyword.value ];
SyntaxKind.NumberKeyword = wrapped( 'NumberKeyword', 134 );
SyntaxKind[ +SyntaxKind.NumberKeyword.value ] = typeof SyntaxKind[ +SyntaxKind.NumberKeyword.value ] !== 'number' ? named( 'NumberKeyword' ) : SyntaxKind[ +SyntaxKind.NumberKeyword.value ];
SyntaxKind.ObjectKeyword = wrapped( 'ObjectKeyword', 135 );
SyntaxKind[ +SyntaxKind.ObjectKeyword.value ] = typeof SyntaxKind[ +SyntaxKind.ObjectKeyword.value ] !== 'number' ? named( 'ObjectKeyword' ) : SyntaxKind[ +SyntaxKind.ObjectKeyword.value ];
SyntaxKind.SetKeyword = wrapped( 'SetKeyword', 136 );
SyntaxKind[ +SyntaxKind.SetKeyword.value ] = typeof SyntaxKind[ +SyntaxKind.SetKeyword.value ] !== 'number' ? named( 'SetKeyword' ) : SyntaxKind[ +SyntaxKind.SetKeyword.value ];
SyntaxKind.StringKeyword = wrapped( 'StringKeyword', 137 );
SyntaxKind[ +SyntaxKind.StringKeyword.value ] = typeof SyntaxKind[ +SyntaxKind.StringKeyword.value ] !== 'number' ? named( 'StringKeyword' ) : SyntaxKind[ +SyntaxKind.StringKeyword.value ];
SyntaxKind.SymbolKeyword = wrapped( 'SymbolKeyword', 138 );
SyntaxKind[ +SyntaxKind.SymbolKeyword.value ] = typeof SyntaxKind[ +SyntaxKind.SymbolKeyword.value ] !== 'number' ? named( 'SymbolKeyword' ) : SyntaxKind[ +SyntaxKind.SymbolKeyword.value ];
SyntaxKind.TypeKeyword = wrapped( 'TypeKeyword', 139 );
SyntaxKind[ +SyntaxKind.TypeKeyword.value ] = typeof SyntaxKind[ +SyntaxKind.TypeKeyword.value ] !== 'number' ? named( 'TypeKeyword' ) : SyntaxKind[ +SyntaxKind.TypeKeyword.value ];
SyntaxKind.UndefinedKeyword = wrapped( 'UndefinedKeyword', 140 );
SyntaxKind[ +SyntaxKind.UndefinedKeyword.value ] = typeof SyntaxKind[ +SyntaxKind.UndefinedKeyword.value ] !== 'number' ? named( 'UndefinedKeyword' ) : SyntaxKind[ +SyntaxKind.UndefinedKeyword.value ];
SyntaxKind.UniqueKeyword = wrapped( 'UniqueKeyword', 141 );
SyntaxKind[ +SyntaxKind.UniqueKeyword.value ] = typeof SyntaxKind[ +SyntaxKind.UniqueKeyword.value ] !== 'number' ? named( 'UniqueKeyword' ) : SyntaxKind[ +SyntaxKind.UniqueKeyword.value ];
SyntaxKind.FromKeyword = wrapped( 'FromKeyword', 142 );
SyntaxKind[ +SyntaxKind.FromKeyword.value ] = typeof SyntaxKind[ +SyntaxKind.FromKeyword.value ] !== 'number' ? named( 'FromKeyword' ) : SyntaxKind[ +SyntaxKind.FromKeyword.value ];
SyntaxKind.GlobalKeyword = wrapped( 'GlobalKeyword', 143 );
SyntaxKind[ +SyntaxKind.GlobalKeyword.value ] = typeof SyntaxKind[ +SyntaxKind.GlobalKeyword.value ] !== 'number' ? named( 'GlobalKeyword' ) : SyntaxKind[ +SyntaxKind.GlobalKeyword.value ];
SyntaxKind.OfKeyword = wrapped( 'OfKeyword', 144 );
SyntaxKind[ +SyntaxKind.OfKeyword.value ] = typeof SyntaxKind[ +SyntaxKind.OfKeyword.value ] !== 'number' ? named( 'OfKeyword' ) : SyntaxKind[ +SyntaxKind.OfKeyword.value ];
SyntaxKind.QualifiedName = wrapped( 'QualifiedName', 145 );
SyntaxKind[ +SyntaxKind.QualifiedName.value ] = typeof SyntaxKind[ +SyntaxKind.QualifiedName.value ] !== 'number' ? named( 'QualifiedName' ) : SyntaxKind[ +SyntaxKind.QualifiedName.value ];
SyntaxKind.ComputedPropertyName = wrapped( 'ComputedPropertyName', 146 );
SyntaxKind[ +SyntaxKind.ComputedPropertyName.value ] = typeof SyntaxKind[ +SyntaxKind.ComputedPropertyName.value ] !== 'number' ? named( 'ComputedPropertyName' ) : SyntaxKind[ +SyntaxKind.ComputedPropertyName.value ];
SyntaxKind.TypeParameter = wrapped( 'TypeParameter', 147 );
SyntaxKind[ +SyntaxKind.TypeParameter.value ] = typeof SyntaxKind[ +SyntaxKind.TypeParameter.value ] !== 'number' ? named( 'TypeParameter' ) : SyntaxKind[ +SyntaxKind.TypeParameter.value ];
SyntaxKind.Parameter = wrapped( 'Parameter', 148 );
SyntaxKind[ +SyntaxKind.Parameter.value ] = typeof SyntaxKind[ +SyntaxKind.Parameter.value ] !== 'number' ? named( 'Parameter' ) : SyntaxKind[ +SyntaxKind.Parameter.value ];
SyntaxKind.Decorator = wrapped( 'Decorator', 149 );
SyntaxKind[ +SyntaxKind.Decorator.value ] = typeof SyntaxKind[ +SyntaxKind.Decorator.value ] !== 'number' ? named( 'Decorator' ) : SyntaxKind[ +SyntaxKind.Decorator.value ];
SyntaxKind.PropertySignature = wrapped( 'PropertySignature', 150 );
SyntaxKind[ +SyntaxKind.PropertySignature.value ] = typeof SyntaxKind[ +SyntaxKind.PropertySignature.value ] !== 'number' ? named( 'PropertySignature' ) : SyntaxKind[ +SyntaxKind.PropertySignature.value ];
SyntaxKind.PropertyDeclaration = wrapped( 'PropertyDeclaration', 151 );
SyntaxKind[ +SyntaxKind.PropertyDeclaration.value ] = typeof SyntaxKind[ +SyntaxKind.PropertyDeclaration.value ] !== 'number' ? named( 'PropertyDeclaration' ) : SyntaxKind[ +SyntaxKind.PropertyDeclaration.value ];
SyntaxKind.MethodSignature = wrapped( 'MethodSignature', 152 );
SyntaxKind[ +SyntaxKind.MethodSignature.value ] = typeof SyntaxKind[ +SyntaxKind.MethodSignature.value ] !== 'number' ? named( 'MethodSignature' ) : SyntaxKind[ +SyntaxKind.MethodSignature.value ];
SyntaxKind.MethodDeclaration = wrapped( 'MethodDeclaration', 153 );
SyntaxKind[ +SyntaxKind.MethodDeclaration.value ] = typeof SyntaxKind[ +SyntaxKind.MethodDeclaration.value ] !== 'number' ? named( 'MethodDeclaration' ) : SyntaxKind[ +SyntaxKind.MethodDeclaration.value ];
SyntaxKind.Constructor = wrapped( 'Constructor', 154 );
SyntaxKind[ +SyntaxKind.Constructor.value ] = typeof SyntaxKind[ +SyntaxKind.Constructor.value ] !== 'number' ? named( 'Constructor' ) : SyntaxKind[ +SyntaxKind.Constructor.value ];
SyntaxKind.GetAccessor = wrapped( 'GetAccessor', 155 );
SyntaxKind[ +SyntaxKind.GetAccessor.value ] = typeof SyntaxKind[ +SyntaxKind.GetAccessor.value ] !== 'number' ? named( 'GetAccessor' ) : SyntaxKind[ +SyntaxKind.GetAccessor.value ];
SyntaxKind.SetAccessor = wrapped( 'SetAccessor', 156 );
SyntaxKind[ +SyntaxKind.SetAccessor.value ] = typeof SyntaxKind[ +SyntaxKind.SetAccessor.value ] !== 'number' ? named( 'SetAccessor' ) : SyntaxKind[ +SyntaxKind.SetAccessor.value ];
SyntaxKind.CallSignature = wrapped( 'CallSignature', 157 );
SyntaxKind[ +SyntaxKind.CallSignature.value ] = typeof SyntaxKind[ +SyntaxKind.CallSignature.value ] !== 'number' ? named( 'CallSignature' ) : SyntaxKind[ +SyntaxKind.CallSignature.value ];
SyntaxKind.ConstructSignature = wrapped( 'ConstructSignature', 158 );
SyntaxKind[ +SyntaxKind.ConstructSignature.value ] = typeof SyntaxKind[ +SyntaxKind.ConstructSignature.value ] !== 'number' ? named( 'ConstructSignature' ) : SyntaxKind[ +SyntaxKind.ConstructSignature.value ];
SyntaxKind.IndexSignature = wrapped( 'IndexSignature', 159 );
SyntaxKind[ +SyntaxKind.IndexSignature.value ] = typeof SyntaxKind[ +SyntaxKind.IndexSignature.value ] !== 'number' ? named( 'IndexSignature' ) : SyntaxKind[ +SyntaxKind.IndexSignature.value ];
SyntaxKind.TypePredicate = wrapped( 'TypePredicate', 160 );
SyntaxKind[ +SyntaxKind.TypePredicate.value ] = typeof SyntaxKind[ +SyntaxKind.TypePredicate.value ] !== 'number' ? named( 'TypePredicate' ) : SyntaxKind[ +SyntaxKind.TypePredicate.value ];
SyntaxKind.TypeReference = wrapped( 'TypeReference', 161 );
SyntaxKind[ +SyntaxKind.TypeReference.value ] = typeof SyntaxKind[ +SyntaxKind.TypeReference.value ] !== 'number' ? named( 'TypeReference' ) : SyntaxKind[ +SyntaxKind.TypeReference.value ];
SyntaxKind.FunctionType = wrapped( 'FunctionType', 162 );
SyntaxKind[ +SyntaxKind.FunctionType.value ] = typeof SyntaxKind[ +SyntaxKind.FunctionType.value ] !== 'number' ? named( 'FunctionType' ) : SyntaxKind[ +SyntaxKind.FunctionType.value ];
SyntaxKind.ConstructorType = wrapped( 'ConstructorType', 163 );
SyntaxKind[ +SyntaxKind.ConstructorType.value ] = typeof SyntaxKind[ +SyntaxKind.ConstructorType.value ] !== 'number' ? named( 'ConstructorType' ) : SyntaxKind[ +SyntaxKind.ConstructorType.value ];
SyntaxKind.TypeQuery = wrapped( 'TypeQuery', 164 );
SyntaxKind[ +SyntaxKind.TypeQuery.value ] = typeof SyntaxKind[ +SyntaxKind.TypeQuery.value ] !== 'number' ? named( 'TypeQuery' ) : SyntaxKind[ +SyntaxKind.TypeQuery.value ];
SyntaxKind.TypeLiteral = wrapped( 'TypeLiteral', 165 );
SyntaxKind[ +SyntaxKind.TypeLiteral.value ] = typeof SyntaxKind[ +SyntaxKind.TypeLiteral.value ] !== 'number' ? named( 'TypeLiteral' ) : SyntaxKind[ +SyntaxKind.TypeLiteral.value ];
SyntaxKind.ArrayType = wrapped( 'ArrayType', 166 );
SyntaxKind[ +SyntaxKind.ArrayType.value ] = typeof SyntaxKind[ +SyntaxKind.ArrayType.value ] !== 'number' ? named( 'ArrayType' ) : SyntaxKind[ +SyntaxKind.ArrayType.value ];
SyntaxKind.TupleType = wrapped( 'TupleType', 167 );
SyntaxKind[ +SyntaxKind.TupleType.value ] = typeof SyntaxKind[ +SyntaxKind.TupleType.value ] !== 'number' ? named( 'TupleType' ) : SyntaxKind[ +SyntaxKind.TupleType.value ];
SyntaxKind.UnionType = wrapped( 'UnionType', 168 );
SyntaxKind[ +SyntaxKind.UnionType.value ] = typeof SyntaxKind[ +SyntaxKind.UnionType.value ] !== 'number' ? named( 'UnionType' ) : SyntaxKind[ +SyntaxKind.UnionType.value ];
SyntaxKind.IntersectionType = wrapped( 'IntersectionType', 169 );
SyntaxKind[ +SyntaxKind.IntersectionType.value ] = typeof SyntaxKind[ +SyntaxKind.IntersectionType.value ] !== 'number' ? named( 'IntersectionType' ) : SyntaxKind[ +SyntaxKind.IntersectionType.value ];
SyntaxKind.ParenthesizedType = wrapped( 'ParenthesizedType', 170 );
SyntaxKind[ +SyntaxKind.ParenthesizedType.value ] = typeof SyntaxKind[ +SyntaxKind.ParenthesizedType.value ] !== 'number' ? named( 'ParenthesizedType' ) : SyntaxKind[ +SyntaxKind.ParenthesizedType.value ];
SyntaxKind.ThisType = wrapped( 'ThisType', 171 );
SyntaxKind[ +SyntaxKind.ThisType.value ] = typeof SyntaxKind[ +SyntaxKind.ThisType.value ] !== 'number' ? named( 'ThisType' ) : SyntaxKind[ +SyntaxKind.ThisType.value ];
SyntaxKind.TypeOperator = wrapped( 'TypeOperator', 172 );
SyntaxKind[ +SyntaxKind.TypeOperator.value ] = typeof SyntaxKind[ +SyntaxKind.TypeOperator.value ] !== 'number' ? named( 'TypeOperator' ) : SyntaxKind[ +SyntaxKind.TypeOperator.value ];
SyntaxKind.IndexedAccessType = wrapped( 'IndexedAccessType', 173 );
SyntaxKind[ +SyntaxKind.IndexedAccessType.value ] = typeof SyntaxKind[ +SyntaxKind.IndexedAccessType.value ] !== 'number' ? named( 'IndexedAccessType' ) : SyntaxKind[ +SyntaxKind.IndexedAccessType.value ];
SyntaxKind.MappedType = wrapped( 'MappedType', 174 );
SyntaxKind[ +SyntaxKind.MappedType.value ] = typeof SyntaxKind[ +SyntaxKind.MappedType.value ] !== 'number' ? named( 'MappedType' ) : SyntaxKind[ +SyntaxKind.MappedType.value ];
SyntaxKind.LiteralType = wrapped( 'LiteralType', 175 );
SyntaxKind[ +SyntaxKind.LiteralType.value ] = typeof SyntaxKind[ +SyntaxKind.LiteralType.value ] !== 'number' ? named( 'LiteralType' ) : SyntaxKind[ +SyntaxKind.LiteralType.value ];
SyntaxKind.ObjectBindingPattern = wrapped( 'ObjectBindingPattern', 176 );
SyntaxKind[ +SyntaxKind.ObjectBindingPattern.value ] = typeof SyntaxKind[ +SyntaxKind.ObjectBindingPattern.value ] !== 'number' ? named( 'ObjectBindingPattern' ) : SyntaxKind[ +SyntaxKind.ObjectBindingPattern.value ];
SyntaxKind.ArrayBindingPattern = wrapped( 'ArrayBindingPattern', 177 );
SyntaxKind[ +SyntaxKind.ArrayBindingPattern.value ] = typeof SyntaxKind[ +SyntaxKind.ArrayBindingPattern.value ] !== 'number' ? named( 'ArrayBindingPattern' ) : SyntaxKind[ +SyntaxKind.ArrayBindingPattern.value ];
SyntaxKind.BindingElement = wrapped( 'BindingElement', 178 );
SyntaxKind[ +SyntaxKind.BindingElement.value ] = typeof SyntaxKind[ +SyntaxKind.BindingElement.value ] !== 'number' ? named( 'BindingElement' ) : SyntaxKind[ +SyntaxKind.BindingElement.value ];
SyntaxKind.ArrayLiteralExpression = wrapped( 'ArrayLiteralExpression', 179 );
SyntaxKind[ +SyntaxKind.ArrayLiteralExpression.value ] = typeof SyntaxKind[ +SyntaxKind.ArrayLiteralExpression.value ] !== 'number' ? named( 'ArrayLiteralExpression' ) : SyntaxKind[ +SyntaxKind.ArrayLiteralExpression.value ];
SyntaxKind.ObjectLiteralExpression = wrapped( 'ObjectLiteralExpression', 180 );
SyntaxKind[ +SyntaxKind.ObjectLiteralExpression.value ] = typeof SyntaxKind[ +SyntaxKind.ObjectLiteralExpression.value ] !== 'number' ? named( 'ObjectLiteralExpression' ) : SyntaxKind[ +SyntaxKind.ObjectLiteralExpression.value ];
SyntaxKind.PropertyAccessExpression = wrapped( 'PropertyAccessExpression', 181 );
SyntaxKind[ +SyntaxKind.PropertyAccessExpression.value ] = typeof SyntaxKind[ +SyntaxKind.PropertyAccessExpression.value ] !== 'number' ? named( 'PropertyAccessExpression' ) : SyntaxKind[ +SyntaxKind.PropertyAccessExpression.value ];
SyntaxKind.ElementAccessExpression = wrapped( 'ElementAccessExpression', 182 );
SyntaxKind[ +SyntaxKind.ElementAccessExpression.value ] = typeof SyntaxKind[ +SyntaxKind.ElementAccessExpression.value ] !== 'number' ? named( 'ElementAccessExpression' ) : SyntaxKind[ +SyntaxKind.ElementAccessExpression.value ];
SyntaxKind.CallExpression = wrapped( 'CallExpression', 183 );
SyntaxKind[ +SyntaxKind.CallExpression.value ] = typeof SyntaxKind[ +SyntaxKind.CallExpression.value ] !== 'number' ? named( 'CallExpression' ) : SyntaxKind[ +SyntaxKind.CallExpression.value ];
SyntaxKind.NewExpression = wrapped( 'NewExpression', 184 );
SyntaxKind[ +SyntaxKind.NewExpression.value ] = typeof SyntaxKind[ +SyntaxKind.NewExpression.value ] !== 'number' ? named( 'NewExpression' ) : SyntaxKind[ +SyntaxKind.NewExpression.value ];
SyntaxKind.TaggedTemplateExpression = wrapped( 'TaggedTemplateExpression', 185 );
SyntaxKind[ +SyntaxKind.TaggedTemplateExpression.value ] = typeof SyntaxKind[ +SyntaxKind.TaggedTemplateExpression.value ] !== 'number' ? named( 'TaggedTemplateExpression' ) : SyntaxKind[ +SyntaxKind.TaggedTemplateExpression.value ];
SyntaxKind.TypeAssertionExpression = wrapped( 'TypeAssertionExpression', 186 );
SyntaxKind[ +SyntaxKind.TypeAssertionExpression.value ] = typeof SyntaxKind[ +SyntaxKind.TypeAssertionExpression.value ] !== 'number' ? named( 'TypeAssertionExpression' ) : SyntaxKind[ +SyntaxKind.TypeAssertionExpression.value ];
SyntaxKind.ParenthesizedExpression = wrapped( 'ParenthesizedExpression', 187 );
SyntaxKind[ +SyntaxKind.ParenthesizedExpression.value ] = typeof SyntaxKind[ +SyntaxKind.ParenthesizedExpression.value ] !== 'number' ? named( 'ParenthesizedExpression' ) : SyntaxKind[ +SyntaxKind.ParenthesizedExpression.value ];
SyntaxKind.FunctionExpression = wrapped( 'FunctionExpression', 188 );
SyntaxKind[ +SyntaxKind.FunctionExpression.value ] = typeof SyntaxKind[ +SyntaxKind.FunctionExpression.value ] !== 'number' ? named( 'FunctionExpression' ) : SyntaxKind[ +SyntaxKind.FunctionExpression.value ];
SyntaxKind.ArrowFunction = wrapped( 'ArrowFunction', 189 );
SyntaxKind[ +SyntaxKind.ArrowFunction.value ] = typeof SyntaxKind[ +SyntaxKind.ArrowFunction.value ] !== 'number' ? named( 'ArrowFunction' ) : SyntaxKind[ +SyntaxKind.ArrowFunction.value ];
SyntaxKind.DeleteExpression = wrapped( 'DeleteExpression', 190 );
SyntaxKind[ +SyntaxKind.DeleteExpression.value ] = typeof SyntaxKind[ +SyntaxKind.DeleteExpression.value ] !== 'number' ? named( 'DeleteExpression' ) : SyntaxKind[ +SyntaxKind.DeleteExpression.value ];
SyntaxKind.TypeOfExpression = wrapped( 'TypeOfExpression', 191 );
SyntaxKind[ +SyntaxKind.TypeOfExpression.value ] = typeof SyntaxKind[ +SyntaxKind.TypeOfExpression.value ] !== 'number' ? named( 'TypeOfExpression' ) : SyntaxKind[ +SyntaxKind.TypeOfExpression.value ];
SyntaxKind.VoidExpression = wrapped( 'VoidExpression', 192 );
SyntaxKind[ +SyntaxKind.VoidExpression.value ] = typeof SyntaxKind[ +SyntaxKind.VoidExpression.value ] !== 'number' ? named( 'VoidExpression' ) : SyntaxKind[ +SyntaxKind.VoidExpression.value ];
SyntaxKind.AwaitExpression = wrapped( 'AwaitExpression', 193 );
SyntaxKind[ +SyntaxKind.AwaitExpression.value ] = typeof SyntaxKind[ +SyntaxKind.AwaitExpression.value ] !== 'number' ? named( 'AwaitExpression' ) : SyntaxKind[ +SyntaxKind.AwaitExpression.value ];
SyntaxKind.PrefixUnaryExpression = wrapped( 'PrefixUnaryExpression', 194 );
SyntaxKind[ +SyntaxKind.PrefixUnaryExpression.value ] = typeof SyntaxKind[ +SyntaxKind.PrefixUnaryExpression.value ] !== 'number' ? named( 'PrefixUnaryExpression' ) : SyntaxKind[ +SyntaxKind.PrefixUnaryExpression.value ];
SyntaxKind.PostfixUnaryExpression = wrapped( 'PostfixUnaryExpression', 195 );
SyntaxKind[ +SyntaxKind.PostfixUnaryExpression.value ] = typeof SyntaxKind[ +SyntaxKind.PostfixUnaryExpression.value ] !== 'number' ? named( 'PostfixUnaryExpression' ) : SyntaxKind[ +SyntaxKind.PostfixUnaryExpression.value ];
SyntaxKind.BinaryExpression = wrapped( 'BinaryExpression', 196 );
SyntaxKind[ +SyntaxKind.BinaryExpression.value ] = typeof SyntaxKind[ +SyntaxKind.BinaryExpression.value ] !== 'number' ? named( 'BinaryExpression' ) : SyntaxKind[ +SyntaxKind.BinaryExpression.value ];
SyntaxKind.ConditionalExpression = wrapped( 'ConditionalExpression', 197 );
SyntaxKind[ +SyntaxKind.ConditionalExpression.value ] = typeof SyntaxKind[ +SyntaxKind.ConditionalExpression.value ] !== 'number' ? named( 'ConditionalExpression' ) : SyntaxKind[ +SyntaxKind.ConditionalExpression.value ];
SyntaxKind.TemplateExpression = wrapped( 'TemplateExpression', 198 );
SyntaxKind[ +SyntaxKind.TemplateExpression.value ] = typeof SyntaxKind[ +SyntaxKind.TemplateExpression.value ] !== 'number' ? named( 'TemplateExpression' ) : SyntaxKind[ +SyntaxKind.TemplateExpression.value ];
SyntaxKind.YieldExpression = wrapped( 'YieldExpression', 199 );
SyntaxKind[ +SyntaxKind.YieldExpression.value ] = typeof SyntaxKind[ +SyntaxKind.YieldExpression.value ] !== 'number' ? named( 'YieldExpression' ) : SyntaxKind[ +SyntaxKind.YieldExpression.value ];
SyntaxKind.SpreadElement = wrapped( 'SpreadElement', 200 );
SyntaxKind[ +SyntaxKind.SpreadElement.value ] = typeof SyntaxKind[ +SyntaxKind.SpreadElement.value ] !== 'number' ? named( 'SpreadElement' ) : SyntaxKind[ +SyntaxKind.SpreadElement.value ];
SyntaxKind.ClassExpression = wrapped( 'ClassExpression', 201 );
SyntaxKind[ +SyntaxKind.ClassExpression.value ] = typeof SyntaxKind[ +SyntaxKind.ClassExpression.value ] !== 'number' ? named( 'ClassExpression' ) : SyntaxKind[ +SyntaxKind.ClassExpression.value ];
SyntaxKind.OmittedExpression = wrapped( 'OmittedExpression', 202 );
SyntaxKind[ +SyntaxKind.OmittedExpression.value ] = typeof SyntaxKind[ +SyntaxKind.OmittedExpression.value ] !== 'number' ? named( 'OmittedExpression' ) : SyntaxKind[ +SyntaxKind.OmittedExpression.value ];
SyntaxKind.ExpressionWithTypeArguments = wrapped( 'ExpressionWithTypeArguments', 203 );
SyntaxKind[ +SyntaxKind.ExpressionWithTypeArguments.value ] = typeof SyntaxKind[ +SyntaxKind.ExpressionWithTypeArguments.value ] !== 'number' ? named( 'ExpressionWithTypeArguments' ) : SyntaxKind[ +SyntaxKind.ExpressionWithTypeArguments.value ];
SyntaxKind.AsExpression = wrapped( 'AsExpression', 204 );
SyntaxKind[ +SyntaxKind.AsExpression.value ] = typeof SyntaxKind[ +SyntaxKind.AsExpression.value ] !== 'number' ? named( 'AsExpression' ) : SyntaxKind[ +SyntaxKind.AsExpression.value ];
SyntaxKind.NonNullExpression = wrapped( 'NonNullExpression', 205 );
SyntaxKind[ +SyntaxKind.NonNullExpression.value ] = typeof SyntaxKind[ +SyntaxKind.NonNullExpression.value ] !== 'number' ? named( 'NonNullExpression' ) : SyntaxKind[ +SyntaxKind.NonNullExpression.value ];
SyntaxKind.MetaProperty = wrapped( 'MetaProperty', 206 );
SyntaxKind[ +SyntaxKind.MetaProperty.value ] = typeof SyntaxKind[ +SyntaxKind.MetaProperty.value ] !== 'number' ? named( 'MetaProperty' ) : SyntaxKind[ +SyntaxKind.MetaProperty.value ];
SyntaxKind.TemplateSpan = wrapped( 'TemplateSpan', 207 );
SyntaxKind[ +SyntaxKind.TemplateSpan.value ] = typeof SyntaxKind[ +SyntaxKind.TemplateSpan.value ] !== 'number' ? named( 'TemplateSpan' ) : SyntaxKind[ +SyntaxKind.TemplateSpan.value ];
SyntaxKind.SemicolonClassElement = wrapped( 'SemicolonClassElement', 208 );
SyntaxKind[ +SyntaxKind.SemicolonClassElement.value ] = typeof SyntaxKind[ +SyntaxKind.SemicolonClassElement.value ] !== 'number' ? named( 'SemicolonClassElement' ) : SyntaxKind[ +SyntaxKind.SemicolonClassElement.value ];
SyntaxKind.Block = wrapped( 'Block', 209 );
SyntaxKind[ +SyntaxKind.Block.value ] = typeof SyntaxKind[ +SyntaxKind.Block.value ] !== 'number' ? named( 'Block' ) : SyntaxKind[ +SyntaxKind.Block.value ];
SyntaxKind.VariableStatement = wrapped( 'VariableStatement', 210 );
SyntaxKind[ +SyntaxKind.VariableStatement.value ] = typeof SyntaxKind[ +SyntaxKind.VariableStatement.value ] !== 'number' ? named( 'VariableStatement' ) : SyntaxKind[ +SyntaxKind.VariableStatement.value ];
SyntaxKind.EmptyStatement = wrapped( 'EmptyStatement', 211 );
SyntaxKind[ +SyntaxKind.EmptyStatement.value ] = typeof SyntaxKind[ +SyntaxKind.EmptyStatement.value ] !== 'number' ? named( 'EmptyStatement' ) : SyntaxKind[ +SyntaxKind.EmptyStatement.value ];
SyntaxKind.ExpressionStatement = wrapped( 'ExpressionStatement', 212 );
SyntaxKind[ +SyntaxKind.ExpressionStatement.value ] = typeof SyntaxKind[ +SyntaxKind.ExpressionStatement.value ] !== 'number' ? named( 'ExpressionStatement' ) : SyntaxKind[ +SyntaxKind.ExpressionStatement.value ];
SyntaxKind.IfStatement = wrapped( 'IfStatement', 213 );
SyntaxKind[ +SyntaxKind.IfStatement.value ] = typeof SyntaxKind[ +SyntaxKind.IfStatement.value ] !== 'number' ? named( 'IfStatement' ) : SyntaxKind[ +SyntaxKind.IfStatement.value ];
SyntaxKind.DoStatement = wrapped( 'DoStatement', 214 );
SyntaxKind[ +SyntaxKind.DoStatement.value ] = typeof SyntaxKind[ +SyntaxKind.DoStatement.value ] !== 'number' ? named( 'DoStatement' ) : SyntaxKind[ +SyntaxKind.DoStatement.value ];
SyntaxKind.WhileStatement = wrapped( 'WhileStatement', 215 );
SyntaxKind[ +SyntaxKind.WhileStatement.value ] = typeof SyntaxKind[ +SyntaxKind.WhileStatement.value ] !== 'number' ? named( 'WhileStatement' ) : SyntaxKind[ +SyntaxKind.WhileStatement.value ];
SyntaxKind.ForStatement = wrapped( 'ForStatement', 216 );
SyntaxKind[ +SyntaxKind.ForStatement.value ] = typeof SyntaxKind[ +SyntaxKind.ForStatement.value ] !== 'number' ? named( 'ForStatement' ) : SyntaxKind[ +SyntaxKind.ForStatement.value ];
SyntaxKind.ForInStatement = wrapped( 'ForInStatement', 217 );
SyntaxKind[ +SyntaxKind.ForInStatement.value ] = typeof SyntaxKind[ +SyntaxKind.ForInStatement.value ] !== 'number' ? named( 'ForInStatement' ) : SyntaxKind[ +SyntaxKind.ForInStatement.value ];
SyntaxKind.ForOfStatement = wrapped( 'ForOfStatement', 218 );
SyntaxKind[ +SyntaxKind.ForOfStatement.value ] = typeof SyntaxKind[ +SyntaxKind.ForOfStatement.value ] !== 'number' ? named( 'ForOfStatement' ) : SyntaxKind[ +SyntaxKind.ForOfStatement.value ];
SyntaxKind.ContinueStatement = wrapped( 'ContinueStatement', 219 );
SyntaxKind[ +SyntaxKind.ContinueStatement.value ] = typeof SyntaxKind[ +SyntaxKind.ContinueStatement.value ] !== 'number' ? named( 'ContinueStatement' ) : SyntaxKind[ +SyntaxKind.ContinueStatement.value ];
SyntaxKind.BreakStatement = wrapped( 'BreakStatement', 220 );
SyntaxKind[ +SyntaxKind.BreakStatement.value ] = typeof SyntaxKind[ +SyntaxKind.BreakStatement.value ] !== 'number' ? named( 'BreakStatement' ) : SyntaxKind[ +SyntaxKind.BreakStatement.value ];
SyntaxKind.ReturnStatement = wrapped( 'ReturnStatement', 221 );
SyntaxKind[ +SyntaxKind.ReturnStatement.value ] = typeof SyntaxKind[ +SyntaxKind.ReturnStatement.value ] !== 'number' ? named( 'ReturnStatement' ) : SyntaxKind[ +SyntaxKind.ReturnStatement.value ];
SyntaxKind.WithStatement = wrapped( 'WithStatement', 222 );
SyntaxKind[ +SyntaxKind.WithStatement.value ] = typeof SyntaxKind[ +SyntaxKind.WithStatement.value ] !== 'number' ? named( 'WithStatement' ) : SyntaxKind[ +SyntaxKind.WithStatement.value ];
SyntaxKind.SwitchStatement = wrapped( 'SwitchStatement', 223 );
SyntaxKind[ +SyntaxKind.SwitchStatement.value ] = typeof SyntaxKind[ +SyntaxKind.SwitchStatement.value ] !== 'number' ? named( 'SwitchStatement' ) : SyntaxKind[ +SyntaxKind.SwitchStatement.value ];
SyntaxKind.LabeledStatement = wrapped( 'LabeledStatement', 224 );
SyntaxKind[ +SyntaxKind.LabeledStatement.value ] = typeof SyntaxKind[ +SyntaxKind.LabeledStatement.value ] !== 'number' ? named( 'LabeledStatement' ) : SyntaxKind[ +SyntaxKind.LabeledStatement.value ];
SyntaxKind.ThrowStatement = wrapped( 'ThrowStatement', 225 );
SyntaxKind[ +SyntaxKind.ThrowStatement.value ] = typeof SyntaxKind[ +SyntaxKind.ThrowStatement.value ] !== 'number' ? named( 'ThrowStatement' ) : SyntaxKind[ +SyntaxKind.ThrowStatement.value ];
SyntaxKind.TryStatement = wrapped( 'TryStatement', 226 );
SyntaxKind[ +SyntaxKind.TryStatement.value ] = typeof SyntaxKind[ +SyntaxKind.TryStatement.value ] !== 'number' ? named( 'TryStatement' ) : SyntaxKind[ +SyntaxKind.TryStatement.value ];
SyntaxKind.DebuggerStatement = wrapped( 'DebuggerStatement', 227 );
SyntaxKind[ +SyntaxKind.DebuggerStatement.value ] = typeof SyntaxKind[ +SyntaxKind.DebuggerStatement.value ] !== 'number' ? named( 'DebuggerStatement' ) : SyntaxKind[ +SyntaxKind.DebuggerStatement.value ];
SyntaxKind.VariableDeclaration = wrapped( 'VariableDeclaration', 228 );
SyntaxKind[ +SyntaxKind.VariableDeclaration.value ] = typeof SyntaxKind[ +SyntaxKind.VariableDeclaration.value ] !== 'number' ? named( 'VariableDeclaration' ) : SyntaxKind[ +SyntaxKind.VariableDeclaration.value ];
SyntaxKind.VariableDeclarationList = wrapped( 'VariableDeclarationList', 229 );
SyntaxKind[ +SyntaxKind.VariableDeclarationList.value ] = typeof SyntaxKind[ +SyntaxKind.VariableDeclarationList.value ] !== 'number' ? named( 'VariableDeclarationList' ) : SyntaxKind[ +SyntaxKind.VariableDeclarationList.value ];
SyntaxKind.FunctionDeclaration = wrapped( 'FunctionDeclaration', 230 );
SyntaxKind[ +SyntaxKind.FunctionDeclaration.value ] = typeof SyntaxKind[ +SyntaxKind.FunctionDeclaration.value ] !== 'number' ? named( 'FunctionDeclaration' ) : SyntaxKind[ +SyntaxKind.FunctionDeclaration.value ];
SyntaxKind.ClassDeclaration = wrapped( 'ClassDeclaration', 231 );
SyntaxKind[ +SyntaxKind.ClassDeclaration.value ] = typeof SyntaxKind[ +SyntaxKind.ClassDeclaration.value ] !== 'number' ? named( 'ClassDeclaration' ) : SyntaxKind[ +SyntaxKind.ClassDeclaration.value ];
SyntaxKind.InterfaceDeclaration = wrapped( 'InterfaceDeclaration', 232 );
SyntaxKind[ +SyntaxKind.InterfaceDeclaration.value ] = typeof SyntaxKind[ +SyntaxKind.InterfaceDeclaration.value ] !== 'number' ? named( 'InterfaceDeclaration' ) : SyntaxKind[ +SyntaxKind.InterfaceDeclaration.value ];
SyntaxKind.TypeAliasDeclaration = wrapped( 'TypeAliasDeclaration', 233 );
SyntaxKind[ +SyntaxKind.TypeAliasDeclaration.value ] = typeof SyntaxKind[ +SyntaxKind.TypeAliasDeclaration.value ] !== 'number' ? named( 'TypeAliasDeclaration' ) : SyntaxKind[ +SyntaxKind.TypeAliasDeclaration.value ];
SyntaxKind.EnumDeclaration = wrapped( 'EnumDeclaration', 234 );
SyntaxKind[ +SyntaxKind.EnumDeclaration.value ] = typeof SyntaxKind[ +SyntaxKind.EnumDeclaration.value ] !== 'number' ? named( 'EnumDeclaration' ) : SyntaxKind[ +SyntaxKind.EnumDeclaration.value ];
SyntaxKind.ModuleDeclaration = wrapped( 'ModuleDeclaration', 235 );
SyntaxKind[ +SyntaxKind.ModuleDeclaration.value ] = typeof SyntaxKind[ +SyntaxKind.ModuleDeclaration.value ] !== 'number' ? named( 'ModuleDeclaration' ) : SyntaxKind[ +SyntaxKind.ModuleDeclaration.value ];
SyntaxKind.ModuleBlock = wrapped( 'ModuleBlock', 236 );
SyntaxKind[ +SyntaxKind.ModuleBlock.value ] = typeof SyntaxKind[ +SyntaxKind.ModuleBlock.value ] !== 'number' ? named( 'ModuleBlock' ) : SyntaxKind[ +SyntaxKind.ModuleBlock.value ];
SyntaxKind.CaseBlock = wrapped( 'CaseBlock', 237 );
SyntaxKind[ +SyntaxKind.CaseBlock.value ] = typeof SyntaxKind[ +SyntaxKind.CaseBlock.value ] !== 'number' ? named( 'CaseBlock' ) : SyntaxKind[ +SyntaxKind.CaseBlock.value ];
SyntaxKind.NamespaceExportDeclaration = wrapped( 'NamespaceExportDeclaration', 238 );
SyntaxKind[ +SyntaxKind.NamespaceExportDeclaration.value ] = typeof SyntaxKind[ +SyntaxKind.NamespaceExportDeclaration.value ] !== 'number' ? named( 'NamespaceExportDeclaration' ) : SyntaxKind[ +SyntaxKind.NamespaceExportDeclaration.value ];
SyntaxKind.ImportEqualsDeclaration = wrapped( 'ImportEqualsDeclaration', 239 );
SyntaxKind[ +SyntaxKind.ImportEqualsDeclaration.value ] = typeof SyntaxKind[ +SyntaxKind.ImportEqualsDeclaration.value ] !== 'number' ? named( 'ImportEqualsDeclaration' ) : SyntaxKind[ +SyntaxKind.ImportEqualsDeclaration.value ];
SyntaxKind.ImportDeclaration = wrapped( 'ImportDeclaration', 240 );
SyntaxKind[ +SyntaxKind.ImportDeclaration.value ] = typeof SyntaxKind[ +SyntaxKind.ImportDeclaration.value ] !== 'number' ? named( 'ImportDeclaration' ) : SyntaxKind[ +SyntaxKind.ImportDeclaration.value ];
SyntaxKind.ImportClause = wrapped( 'ImportClause', 241 );
SyntaxKind[ +SyntaxKind.ImportClause.value ] = typeof SyntaxKind[ +SyntaxKind.ImportClause.value ] !== 'number' ? named( 'ImportClause' ) : SyntaxKind[ +SyntaxKind.ImportClause.value ];
SyntaxKind.NamespaceImport = wrapped( 'NamespaceImport', 242 );
SyntaxKind[ +SyntaxKind.NamespaceImport.value ] = typeof SyntaxKind[ +SyntaxKind.NamespaceImport.value ] !== 'number' ? named( 'NamespaceImport' ) : SyntaxKind[ +SyntaxKind.NamespaceImport.value ];
SyntaxKind.NamedImports = wrapped( 'NamedImports', 243 );
SyntaxKind[ +SyntaxKind.NamedImports.value ] = typeof SyntaxKind[ +SyntaxKind.NamedImports.value ] !== 'number' ? named( 'NamedImports' ) : SyntaxKind[ +SyntaxKind.NamedImports.value ];
SyntaxKind.ImportSpecifier = wrapped( 'ImportSpecifier', 244 );
SyntaxKind[ +SyntaxKind.ImportSpecifier.value ] = typeof SyntaxKind[ +SyntaxKind.ImportSpecifier.value ] !== 'number' ? named( 'ImportSpecifier' ) : SyntaxKind[ +SyntaxKind.ImportSpecifier.value ];
SyntaxKind.ExportAssignment = wrapped( 'ExportAssignment', 245 );
SyntaxKind[ +SyntaxKind.ExportAssignment.value ] = typeof SyntaxKind[ +SyntaxKind.ExportAssignment.value ] !== 'number' ? named( 'ExportAssignment' ) : SyntaxKind[ +SyntaxKind.ExportAssignment.value ];
SyntaxKind.ExportDeclaration = wrapped( 'ExportDeclaration', 246 );
SyntaxKind[ +SyntaxKind.ExportDeclaration.value ] = typeof SyntaxKind[ +SyntaxKind.ExportDeclaration.value ] !== 'number' ? named( 'ExportDeclaration' ) : SyntaxKind[ +SyntaxKind.ExportDeclaration.value ];
SyntaxKind.NamedExports = wrapped( 'NamedExports', 247 );
SyntaxKind[ +SyntaxKind.NamedExports.value ] = typeof SyntaxKind[ +SyntaxKind.NamedExports.value ] !== 'number' ? named( 'NamedExports' ) : SyntaxKind[ +SyntaxKind.NamedExports.value ];
SyntaxKind.ExportSpecifier = wrapped( 'ExportSpecifier', 248 );
SyntaxKind[ +SyntaxKind.ExportSpecifier.value ] = typeof SyntaxKind[ +SyntaxKind.ExportSpecifier.value ] !== 'number' ? named( 'ExportSpecifier' ) : SyntaxKind[ +SyntaxKind.ExportSpecifier.value ];
SyntaxKind.MissingDeclaration = wrapped( 'MissingDeclaration', 249 );
SyntaxKind[ +SyntaxKind.MissingDeclaration.value ] = typeof SyntaxKind[ +SyntaxKind.MissingDeclaration.value ] !== 'number' ? named( 'MissingDeclaration' ) : SyntaxKind[ +SyntaxKind.MissingDeclaration.value ];
SyntaxKind.ExternalModuleReference = wrapped( 'ExternalModuleReference', 250 );
SyntaxKind[ +SyntaxKind.ExternalModuleReference.value ] = typeof SyntaxKind[ +SyntaxKind.ExternalModuleReference.value ] !== 'number' ? named( 'ExternalModuleReference' ) : SyntaxKind[ +SyntaxKind.ExternalModuleReference.value ];
SyntaxKind.JsxElement = wrapped( 'JsxElement', 251 );
SyntaxKind[ +SyntaxKind.JsxElement.value ] = typeof SyntaxKind[ +SyntaxKind.JsxElement.value ] !== 'number' ? named( 'JsxElement' ) : SyntaxKind[ +SyntaxKind.JsxElement.value ];
SyntaxKind.JsxSelfClosingElement = wrapped( 'JsxSelfClosingElement', 252 );
SyntaxKind[ +SyntaxKind.JsxSelfClosingElement.value ] = typeof SyntaxKind[ +SyntaxKind.JsxSelfClosingElement.value ] !== 'number' ? named( 'JsxSelfClosingElement' ) : SyntaxKind[ +SyntaxKind.JsxSelfClosingElement.value ];
SyntaxKind.JsxOpeningElement = wrapped( 'JsxOpeningElement', 253 );
SyntaxKind[ +SyntaxKind.JsxOpeningElement.value ] = typeof SyntaxKind[ +SyntaxKind.JsxOpeningElement.value ] !== 'number' ? named( 'JsxOpeningElement' ) : SyntaxKind[ +SyntaxKind.JsxOpeningElement.value ];
SyntaxKind.JsxClosingElement = wrapped( 'JsxClosingElement', 254 );
SyntaxKind[ +SyntaxKind.JsxClosingElement.value ] = typeof SyntaxKind[ +SyntaxKind.JsxClosingElement.value ] !== 'number' ? named( 'JsxClosingElement' ) : SyntaxKind[ +SyntaxKind.JsxClosingElement.value ];
SyntaxKind.JsxFragment = wrapped( 'JsxFragment', 255 );
SyntaxKind[ +SyntaxKind.JsxFragment.value ] = typeof SyntaxKind[ +SyntaxKind.JsxFragment.value ] !== 'number' ? named( 'JsxFragment' ) : SyntaxKind[ +SyntaxKind.JsxFragment.value ];
SyntaxKind.JsxOpeningFragment = wrapped( 'JsxOpeningFragment', 256 );
SyntaxKind[ +SyntaxKind.JsxOpeningFragment.value ] = typeof SyntaxKind[ +SyntaxKind.JsxOpeningFragment.value ] !== 'number' ? named( 'JsxOpeningFragment' ) : SyntaxKind[ +SyntaxKind.JsxOpeningFragment.value ];
SyntaxKind.JsxClosingFragment = wrapped( 'JsxClosingFragment', 257 );
SyntaxKind[ +SyntaxKind.JsxClosingFragment.value ] = typeof SyntaxKind[ +SyntaxKind.JsxClosingFragment.value ] !== 'number' ? named( 'JsxClosingFragment' ) : SyntaxKind[ +SyntaxKind.JsxClosingFragment.value ];
SyntaxKind.JsxAttribute = wrapped( 'JsxAttribute', 258 );
SyntaxKind[ +SyntaxKind.JsxAttribute.value ] = typeof SyntaxKind[ +SyntaxKind.JsxAttribute.value ] !== 'number' ? named( 'JsxAttribute' ) : SyntaxKind[ +SyntaxKind.JsxAttribute.value ];
SyntaxKind.JsxAttributes = wrapped( 'JsxAttributes', 259 );
SyntaxKind[ +SyntaxKind.JsxAttributes.value ] = typeof SyntaxKind[ +SyntaxKind.JsxAttributes.value ] !== 'number' ? named( 'JsxAttributes' ) : SyntaxKind[ +SyntaxKind.JsxAttributes.value ];
SyntaxKind.JsxSpreadAttribute = wrapped( 'JsxSpreadAttribute', 260 );
SyntaxKind[ +SyntaxKind.JsxSpreadAttribute.value ] = typeof SyntaxKind[ +SyntaxKind.JsxSpreadAttribute.value ] !== 'number' ? named( 'JsxSpreadAttribute' ) : SyntaxKind[ +SyntaxKind.JsxSpreadAttribute.value ];
SyntaxKind.JsxExpression = wrapped( 'JsxExpression', 261 );
SyntaxKind[ +SyntaxKind.JsxExpression.value ] = typeof SyntaxKind[ +SyntaxKind.JsxExpression.value ] !== 'number' ? named( 'JsxExpression' ) : SyntaxKind[ +SyntaxKind.JsxExpression.value ];
SyntaxKind.CaseClause = wrapped( 'CaseClause', 262 );
SyntaxKind[ +SyntaxKind.CaseClause.value ] = typeof SyntaxKind[ +SyntaxKind.CaseClause.value ] !== 'number' ? named( 'CaseClause' ) : SyntaxKind[ +SyntaxKind.CaseClause.value ];
SyntaxKind.DefaultClause = wrapped( 'DefaultClause', 263 );
SyntaxKind[ +SyntaxKind.DefaultClause.value ] = typeof SyntaxKind[ +SyntaxKind.DefaultClause.value ] !== 'number' ? named( 'DefaultClause' ) : SyntaxKind[ +SyntaxKind.DefaultClause.value ];
SyntaxKind.HeritageClause = wrapped( 'HeritageClause', 264 );
SyntaxKind[ +SyntaxKind.HeritageClause.value ] = typeof SyntaxKind[ +SyntaxKind.HeritageClause.value ] !== 'number' ? named( 'HeritageClause' ) : SyntaxKind[ +SyntaxKind.HeritageClause.value ];
SyntaxKind.CatchClause = wrapped( 'CatchClause', 265 );
SyntaxKind[ +SyntaxKind.CatchClause.value ] = typeof SyntaxKind[ +SyntaxKind.CatchClause.value ] !== 'number' ? named( 'CatchClause' ) : SyntaxKind[ +SyntaxKind.CatchClause.value ];
SyntaxKind.PropertyAssignment = wrapped( 'PropertyAssignment', 266 );
SyntaxKind[ +SyntaxKind.PropertyAssignment.value ] = typeof SyntaxKind[ +SyntaxKind.PropertyAssignment.value ] !== 'number' ? named( 'PropertyAssignment' ) : SyntaxKind[ +SyntaxKind.PropertyAssignment.value ];
SyntaxKind.ShorthandPropertyAssignment = wrapped( 'ShorthandPropertyAssignment', 267 );
SyntaxKind[ +SyntaxKind.ShorthandPropertyAssignment.value ] = typeof SyntaxKind[ +SyntaxKind.ShorthandPropertyAssignment.value ] !== 'number' ? named( 'ShorthandPropertyAssignment' ) : SyntaxKind[ +SyntaxKind.ShorthandPropertyAssignment.value ];
SyntaxKind.SpreadAssignment = wrapped( 'SpreadAssignment', 268 );
SyntaxKind[ +SyntaxKind.SpreadAssignment.value ] = typeof SyntaxKind[ +SyntaxKind.SpreadAssignment.value ] !== 'number' ? named( 'SpreadAssignment' ) : SyntaxKind[ +SyntaxKind.SpreadAssignment.value ];
SyntaxKind.EnumMember = wrapped( 'EnumMember', 269 );
SyntaxKind[ +SyntaxKind.EnumMember.value ] = typeof SyntaxKind[ +SyntaxKind.EnumMember.value ] !== 'number' ? named( 'EnumMember' ) : SyntaxKind[ +SyntaxKind.EnumMember.value ];
SyntaxKind.SourceFile = wrapped( 'SourceFile', 270 );
SyntaxKind[ +SyntaxKind.SourceFile.value ] = typeof SyntaxKind[ +SyntaxKind.SourceFile.value ] !== 'number' ? named( 'SourceFile' ) : SyntaxKind[ +SyntaxKind.SourceFile.value ];
SyntaxKind.Bundle = wrapped( 'Bundle', 271 );
SyntaxKind[ +SyntaxKind.Bundle.value ] = typeof SyntaxKind[ +SyntaxKind.Bundle.value ] !== 'number' ? named( 'Bundle' ) : SyntaxKind[ +SyntaxKind.Bundle.value ];
SyntaxKind.JSDocTypeExpression = wrapped( 'JSDocTypeExpression', 272 );
SyntaxKind[ +SyntaxKind.JSDocTypeExpression.value ] = typeof SyntaxKind[ +SyntaxKind.JSDocTypeExpression.value ] !== 'number' ? named( 'JSDocTypeExpression' ) : SyntaxKind[ +SyntaxKind.JSDocTypeExpression.value ];
SyntaxKind.JSDocAllType = wrapped( 'JSDocAllType', 273 );
SyntaxKind[ +SyntaxKind.JSDocAllType.value ] = typeof SyntaxKind[ +SyntaxKind.JSDocAllType.value ] !== 'number' ? named( 'JSDocAllType' ) : SyntaxKind[ +SyntaxKind.JSDocAllType.value ];
SyntaxKind.JSDocUnknownType = wrapped( 'JSDocUnknownType', 274 );
SyntaxKind[ +SyntaxKind.JSDocUnknownType.value ] = typeof SyntaxKind[ +SyntaxKind.JSDocUnknownType.value ] !== 'number' ? named( 'JSDocUnknownType' ) : SyntaxKind[ +SyntaxKind.JSDocUnknownType.value ];
SyntaxKind.JSDocNullableType = wrapped( 'JSDocNullableType', 275 );
SyntaxKind[ +SyntaxKind.JSDocNullableType.value ] = typeof SyntaxKind[ +SyntaxKind.JSDocNullableType.value ] !== 'number' ? named( 'JSDocNullableType' ) : SyntaxKind[ +SyntaxKind.JSDocNullableType.value ];
SyntaxKind.JSDocNonNullableType = wrapped( 'JSDocNonNullableType', 276 );
SyntaxKind[ +SyntaxKind.JSDocNonNullableType.value ] = typeof SyntaxKind[ +SyntaxKind.JSDocNonNullableType.value ] !== 'number' ? named( 'JSDocNonNullableType' ) : SyntaxKind[ +SyntaxKind.JSDocNonNullableType.value ];
SyntaxKind.JSDocOptionalType = wrapped( 'JSDocOptionalType', 277 );
SyntaxKind[ +SyntaxKind.JSDocOptionalType.value ] = typeof SyntaxKind[ +SyntaxKind.JSDocOptionalType.value ] !== 'number' ? named( 'JSDocOptionalType' ) : SyntaxKind[ +SyntaxKind.JSDocOptionalType.value ];
SyntaxKind.JSDocFunctionType = wrapped( 'JSDocFunctionType', 278 );
SyntaxKind[ +SyntaxKind.JSDocFunctionType.value ] = typeof SyntaxKind[ +SyntaxKind.JSDocFunctionType.value ] !== 'number' ? named( 'JSDocFunctionType' ) : SyntaxKind[ +SyntaxKind.JSDocFunctionType.value ];
SyntaxKind.JSDocVariadicType = wrapped( 'JSDocVariadicType', 279 );
SyntaxKind[ +SyntaxKind.JSDocVariadicType.value ] = typeof SyntaxKind[ +SyntaxKind.JSDocVariadicType.value ] !== 'number' ? named( 'JSDocVariadicType' ) : SyntaxKind[ +SyntaxKind.JSDocVariadicType.value ];
SyntaxKind.JSDocComment = wrapped( 'JSDocComment', 280 );
SyntaxKind[ +SyntaxKind.JSDocComment.value ] = typeof SyntaxKind[ +SyntaxKind.JSDocComment.value ] !== 'number' ? named( 'JSDocComment' ) : SyntaxKind[ +SyntaxKind.JSDocComment.value ];
SyntaxKind.JSDocTypeLiteral = wrapped( 'JSDocTypeLiteral', 281 );
SyntaxKind[ +SyntaxKind.JSDocTypeLiteral.value ] = typeof SyntaxKind[ +SyntaxKind.JSDocTypeLiteral.value ] !== 'number' ? named( 'JSDocTypeLiteral' ) : SyntaxKind[ +SyntaxKind.JSDocTypeLiteral.value ];
SyntaxKind.JSDocTag = wrapped( 'JSDocTag', 282 );
SyntaxKind[ +SyntaxKind.JSDocTag.value ] = typeof SyntaxKind[ +SyntaxKind.JSDocTag.value ] !== 'number' ? named( 'JSDocTag' ) : SyntaxKind[ +SyntaxKind.JSDocTag.value ];
SyntaxKind.JSDocAugmentsTag = wrapped( 'JSDocAugmentsTag', 283 );
SyntaxKind[ +SyntaxKind.JSDocAugmentsTag.value ] = typeof SyntaxKind[ +SyntaxKind.JSDocAugmentsTag.value ] !== 'number' ? named( 'JSDocAugmentsTag' ) : SyntaxKind[ +SyntaxKind.JSDocAugmentsTag.value ];
SyntaxKind.JSDocClassTag = wrapped( 'JSDocClassTag', 284 );
SyntaxKind[ +SyntaxKind.JSDocClassTag.value ] = typeof SyntaxKind[ +SyntaxKind.JSDocClassTag.value ] !== 'number' ? named( 'JSDocClassTag' ) : SyntaxKind[ +SyntaxKind.JSDocClassTag.value ];
SyntaxKind.JSDocParameterTag = wrapped( 'JSDocParameterTag', 285 );
SyntaxKind[ +SyntaxKind.JSDocParameterTag.value ] = typeof SyntaxKind[ +SyntaxKind.JSDocParameterTag.value ] !== 'number' ? named( 'JSDocParameterTag' ) : SyntaxKind[ +SyntaxKind.JSDocParameterTag.value ];
SyntaxKind.JSDocReturnTag = wrapped( 'JSDocReturnTag', 286 );
SyntaxKind[ +SyntaxKind.JSDocReturnTag.value ] = typeof SyntaxKind[ +SyntaxKind.JSDocReturnTag.value ] !== 'number' ? named( 'JSDocReturnTag' ) : SyntaxKind[ +SyntaxKind.JSDocReturnTag.value ];
SyntaxKind.JSDocTypeTag = wrapped( 'JSDocTypeTag', 287 );
SyntaxKind[ +SyntaxKind.JSDocTypeTag.value ] = typeof SyntaxKind[ +SyntaxKind.JSDocTypeTag.value ] !== 'number' ? named( 'JSDocTypeTag' ) : SyntaxKind[ +SyntaxKind.JSDocTypeTag.value ];
SyntaxKind.JSDocTemplateTag = wrapped( 'JSDocTemplateTag', 288 );
SyntaxKind[ +SyntaxKind.JSDocTemplateTag.value ] = typeof SyntaxKind[ +SyntaxKind.JSDocTemplateTag.value ] !== 'number' ? named( 'JSDocTemplateTag' ) : SyntaxKind[ +SyntaxKind.JSDocTemplateTag.value ];
SyntaxKind.JSDocTypedefTag = wrapped( 'JSDocTypedefTag', 289 );
SyntaxKind[ +SyntaxKind.JSDocTypedefTag.value ] = typeof SyntaxKind[ +SyntaxKind.JSDocTypedefTag.value ] !== 'number' ? named( 'JSDocTypedefTag' ) : SyntaxKind[ +SyntaxKind.JSDocTypedefTag.value ];
SyntaxKind.JSDocPropertyTag = wrapped( 'JSDocPropertyTag', 290 );
SyntaxKind[ +SyntaxKind.JSDocPropertyTag.value ] = typeof SyntaxKind[ +SyntaxKind.JSDocPropertyTag.value ] !== 'number' ? named( 'JSDocPropertyTag' ) : SyntaxKind[ +SyntaxKind.JSDocPropertyTag.value ];
SyntaxKind.SyntaxList = wrapped( 'SyntaxList', 291 );
SyntaxKind[ +SyntaxKind.SyntaxList.value ] = typeof SyntaxKind[ +SyntaxKind.SyntaxList.value ] !== 'number' ? named( 'SyntaxList' ) : SyntaxKind[ +SyntaxKind.SyntaxList.value ];
SyntaxKind.NotEmittedStatement = wrapped( 'NotEmittedStatement', 292 );
SyntaxKind[ +SyntaxKind.NotEmittedStatement.value ] = typeof SyntaxKind[ +SyntaxKind.NotEmittedStatement.value ] !== 'number' ? named( 'NotEmittedStatement' ) : SyntaxKind[ +SyntaxKind.NotEmittedStatement.value ];
SyntaxKind.PartiallyEmittedExpression = wrapped( 'PartiallyEmittedExpression', 293 );
SyntaxKind[ +SyntaxKind.PartiallyEmittedExpression.value ] = typeof SyntaxKind[ +SyntaxKind.PartiallyEmittedExpression.value ] !== 'number' ? named( 'PartiallyEmittedExpression' ) : SyntaxKind[ +SyntaxKind.PartiallyEmittedExpression.value ];
SyntaxKind.CommaListExpression = wrapped( 'CommaListExpression', 294 );
SyntaxKind[ +SyntaxKind.CommaListExpression.value ] = typeof SyntaxKind[ +SyntaxKind.CommaListExpression.value ] !== 'number' ? named( 'CommaListExpression' ) : SyntaxKind[ +SyntaxKind.CommaListExpression.value ];
SyntaxKind.MergeDeclarationMarker = wrapped( 'MergeDeclarationMarker', 295 );
SyntaxKind[ +SyntaxKind.MergeDeclarationMarker.value ] = typeof SyntaxKind[ +SyntaxKind.MergeDeclarationMarker.value ] !== 'number' ? named( 'MergeDeclarationMarker' ) : SyntaxKind[ +SyntaxKind.MergeDeclarationMarker.value ];
SyntaxKind.EndOfDeclarationMarker = wrapped( 'EndOfDeclarationMarker', 296 );
SyntaxKind[ +SyntaxKind.EndOfDeclarationMarker.value ] = typeof SyntaxKind[ +SyntaxKind.EndOfDeclarationMarker.value ] !== 'number' ? named( 'EndOfDeclarationMarker' ) : SyntaxKind[ +SyntaxKind.EndOfDeclarationMarker.value ];
SyntaxKind.Count = wrapped( 'Count', 297 );
SyntaxKind[ +SyntaxKind.Count.value ] = typeof SyntaxKind[ +SyntaxKind.Count.value ] !== 'number' ? named( 'Count' ) : SyntaxKind[ +SyntaxKind.Count.value ];
SyntaxKind.FirstAssignment = wrapped( 'FirstAssignment', +SyntaxKind.EqualsToken );
SyntaxKind[ +SyntaxKind.FirstAssignment.value ] = typeof SyntaxKind[ +SyntaxKind.FirstAssignment.value ] !== 'number' ? named( 'FirstAssignment' ) : SyntaxKind[ +SyntaxKind.FirstAssignment.value ];
SyntaxKind.LastAssignment = wrapped( 'LastAssignment', +SyntaxKind.CaretEqualsToken );
SyntaxKind[ +SyntaxKind.LastAssignment.value ] = typeof SyntaxKind[ +SyntaxKind.LastAssignment.value ] !== 'number' ? named( 'LastAssignment' ) : SyntaxKind[ +SyntaxKind.LastAssignment.value ];
SyntaxKind.FirstCompoundAssignment = wrapped( 'FirstCompoundAssignment', +SyntaxKind.PlusEqualsToken );
SyntaxKind[ +SyntaxKind.FirstCompoundAssignment.value ] = typeof SyntaxKind[ +SyntaxKind.FirstCompoundAssignment.value ] !== 'number' ? named( 'FirstCompoundAssignment' ) : SyntaxKind[ +SyntaxKind.FirstCompoundAssignment.value ];
SyntaxKind.LastCompoundAssignment = wrapped( 'LastCompoundAssignment', +SyntaxKind.CaretEqualsToken );
SyntaxKind[ +SyntaxKind.LastCompoundAssignment.value ] = typeof SyntaxKind[ +SyntaxKind.LastCompoundAssignment.value ] !== 'number' ? named( 'LastCompoundAssignment' ) : SyntaxKind[ +SyntaxKind.LastCompoundAssignment.value ];
SyntaxKind.FirstReservedWord = wrapped( 'FirstReservedWord', +SyntaxKind.BreakKeyword );
SyntaxKind[ +SyntaxKind.FirstReservedWord.value ] = typeof SyntaxKind[ +SyntaxKind.FirstReservedWord.value ] !== 'number' ? named( 'FirstReservedWord' ) : SyntaxKind[ +SyntaxKind.FirstReservedWord.value ];
SyntaxKind.LastReservedWord = wrapped( 'LastReservedWord', +SyntaxKind.WithKeyword );
SyntaxKind[ +SyntaxKind.LastReservedWord.value ] = typeof SyntaxKind[ +SyntaxKind.LastReservedWord.value ] !== 'number' ? named( 'LastReservedWord' ) : SyntaxKind[ +SyntaxKind.LastReservedWord.value ];
SyntaxKind.FirstKeyword = wrapped( 'FirstKeyword', +SyntaxKind.BreakKeyword );
SyntaxKind[ +SyntaxKind.FirstKeyword.value ] = typeof SyntaxKind[ +SyntaxKind.FirstKeyword.value ] !== 'number' ? named( 'FirstKeyword' ) : SyntaxKind[ +SyntaxKind.FirstKeyword.value ];
SyntaxKind.LastKeyword = wrapped( 'LastKeyword', +SyntaxKind.OfKeyword );
SyntaxKind[ +SyntaxKind.LastKeyword.value ] = typeof SyntaxKind[ +SyntaxKind.LastKeyword.value ] !== 'number' ? named( 'LastKeyword' ) : SyntaxKind[ +SyntaxKind.LastKeyword.value ];
SyntaxKind.FirstFutureReservedWord = wrapped( 'FirstFutureReservedWord', +SyntaxKind.ImplementsKeyword );
SyntaxKind[ +SyntaxKind.FirstFutureReservedWord.value ] = typeof SyntaxKind[ +SyntaxKind.FirstFutureReservedWord.value ] !== 'number' ? named( 'FirstFutureReservedWord' ) : SyntaxKind[ +SyntaxKind.FirstFutureReservedWord.value ];
SyntaxKind.LastFutureReservedWord = wrapped( 'LastFutureReservedWord', +SyntaxKind.YieldKeyword );
SyntaxKind[ +SyntaxKind.LastFutureReservedWord.value ] = typeof SyntaxKind[ +SyntaxKind.LastFutureReservedWord.value ] !== 'number' ? named( 'LastFutureReservedWord' ) : SyntaxKind[ +SyntaxKind.LastFutureReservedWord.value ];
SyntaxKind.FirstTypeNode = wrapped( 'FirstTypeNode', +SyntaxKind.TypePredicate );
SyntaxKind[ +SyntaxKind.FirstTypeNode.value ] = typeof SyntaxKind[ +SyntaxKind.FirstTypeNode.value ] !== 'number' ? named( 'FirstTypeNode' ) : SyntaxKind[ +SyntaxKind.FirstTypeNode.value ];
SyntaxKind.LastTypeNode = wrapped( 'LastTypeNode', +SyntaxKind.LiteralType );
SyntaxKind[ +SyntaxKind.LastTypeNode.value ] = typeof SyntaxKind[ +SyntaxKind.LastTypeNode.value ] !== 'number' ? named( 'LastTypeNode' ) : SyntaxKind[ +SyntaxKind.LastTypeNode.value ];
SyntaxKind.FirstPunctuation = wrapped( 'FirstPunctuation', +SyntaxKind.OpenBraceToken );
SyntaxKind[ +SyntaxKind.FirstPunctuation.value ] = typeof SyntaxKind[ +SyntaxKind.FirstPunctuation.value ] !== 'number' ? named( 'FirstPunctuation' ) : SyntaxKind[ +SyntaxKind.FirstPunctuation.value ];
SyntaxKind.LastPunctuation = wrapped( 'LastPunctuation', +SyntaxKind.CaretEqualsToken );
SyntaxKind[ +SyntaxKind.LastPunctuation.value ] = typeof SyntaxKind[ +SyntaxKind.LastPunctuation.value ] !== 'number' ? named( 'LastPunctuation' ) : SyntaxKind[ +SyntaxKind.LastPunctuation.value ];
SyntaxKind.FirstToken = wrapped( 'FirstToken', +SyntaxKind.Unknown );
SyntaxKind[ +SyntaxKind.FirstToken.value ] = typeof SyntaxKind[ +SyntaxKind.FirstToken.value ] !== 'number' ? named( 'FirstToken' ) : SyntaxKind[ +SyntaxKind.FirstToken.value ];
SyntaxKind.LastToken = wrapped( 'LastToken', +SyntaxKind.LastKeyword );
SyntaxKind[ +SyntaxKind.LastToken.value ] = typeof SyntaxKind[ +SyntaxKind.LastToken.value ] !== 'number' ? named( 'LastToken' ) : SyntaxKind[ +SyntaxKind.LastToken.value ];
SyntaxKind.FirstTriviaToken = wrapped( 'FirstTriviaToken', +SyntaxKind.SingleLineCommentTrivia );
SyntaxKind[ +SyntaxKind.FirstTriviaToken.value ] = typeof SyntaxKind[ +SyntaxKind.FirstTriviaToken.value ] !== 'number' ? named( 'FirstTriviaToken' ) : SyntaxKind[ +SyntaxKind.FirstTriviaToken.value ];
SyntaxKind.LastTriviaToken = wrapped( 'LastTriviaToken', +SyntaxKind.ConflictMarkerTrivia );
SyntaxKind[ +SyntaxKind.LastTriviaToken.value ] = typeof SyntaxKind[ +SyntaxKind.LastTriviaToken.value ] !== 'number' ? named( 'LastTriviaToken' ) : SyntaxKind[ +SyntaxKind.LastTriviaToken.value ];
SyntaxKind.FirstLiteralToken = wrapped( 'FirstLiteralToken', +SyntaxKind.NumericLiteral );
SyntaxKind[ +SyntaxKind.FirstLiteralToken.value ] = typeof SyntaxKind[ +SyntaxKind.FirstLiteralToken.value ] !== 'number' ? named( 'FirstLiteralToken' ) : SyntaxKind[ +SyntaxKind.FirstLiteralToken.value ];
SyntaxKind.LastLiteralToken = wrapped( 'LastLiteralToken', +SyntaxKind.NoSubstitutionTemplateLiteral );
SyntaxKind[ +SyntaxKind.LastLiteralToken.value ] = typeof SyntaxKind[ +SyntaxKind.LastLiteralToken.value ] !== 'number' ? named( 'LastLiteralToken' ) : SyntaxKind[ +SyntaxKind.LastLiteralToken.value ];
SyntaxKind.FirstTemplateToken = wrapped( 'FirstTemplateToken', +SyntaxKind.NoSubstitutionTemplateLiteral );
SyntaxKind[ +SyntaxKind.FirstTemplateToken.value ] = typeof SyntaxKind[ +SyntaxKind.FirstTemplateToken.value ] !== 'number' ? named( 'FirstTemplateToken' ) : SyntaxKind[ +SyntaxKind.FirstTemplateToken.value ];
SyntaxKind.LastTemplateToken = wrapped( 'LastTemplateToken', +SyntaxKind.TemplateTail );
SyntaxKind[ +SyntaxKind.LastTemplateToken.value ] = typeof SyntaxKind[ +SyntaxKind.LastTemplateToken.value ] !== 'number' ? named( 'LastTemplateToken' ) : SyntaxKind[ +SyntaxKind.LastTemplateToken.value ];
SyntaxKind.FirstBinaryOperator = wrapped( 'FirstBinaryOperator', +SyntaxKind.LessThanToken );
SyntaxKind[ +SyntaxKind.FirstBinaryOperator.value ] = typeof SyntaxKind[ +SyntaxKind.FirstBinaryOperator.value ] !== 'number' ? named( 'FirstBinaryOperator' ) : SyntaxKind[ +SyntaxKind.FirstBinaryOperator.value ];
SyntaxKind.LastBinaryOperator = wrapped( 'LastBinaryOperator', +SyntaxKind.CaretEqualsToken );
SyntaxKind[ +SyntaxKind.LastBinaryOperator.value ] = typeof SyntaxKind[ +SyntaxKind.LastBinaryOperator.value ] !== 'number' ? named( 'LastBinaryOperator' ) : SyntaxKind[ +SyntaxKind.LastBinaryOperator.value ];
SyntaxKind.FirstNode = wrapped( 'FirstNode', +SyntaxKind.QualifiedName );
SyntaxKind[ +SyntaxKind.FirstNode.value ] = typeof SyntaxKind[ +SyntaxKind.FirstNode.value ] !== 'number' ? named( 'FirstNode' ) : SyntaxKind[ +SyntaxKind.FirstNode.value ];
SyntaxKind.FirstJSDocNode = wrapped( 'FirstJSDocNode', +SyntaxKind.JSDocTypeExpression );
SyntaxKind[ +SyntaxKind.FirstJSDocNode.value ] = typeof SyntaxKind[ +SyntaxKind.FirstJSDocNode.value ] !== 'number' ? named( 'FirstJSDocNode' ) : SyntaxKind[ +SyntaxKind.FirstJSDocNode.value ];
SyntaxKind.LastJSDocNode = wrapped( 'LastJSDocNode', +SyntaxKind.JSDocPropertyTag );
SyntaxKind[ +SyntaxKind.LastJSDocNode.value ] = typeof SyntaxKind[ +SyntaxKind.LastJSDocNode.value ] !== 'number' ? named( 'LastJSDocNode' ) : SyntaxKind[ +SyntaxKind.LastJSDocNode.value ];
SyntaxKind.FirstJSDocTagNode = wrapped( 'FirstJSDocTagNode', +SyntaxKind.JSDocTag );
SyntaxKind[ +SyntaxKind.FirstJSDocTagNode.value ] = typeof SyntaxKind[ +SyntaxKind.FirstJSDocTagNode.value ] !== 'number' ? named( 'FirstJSDocTagNode' ) : SyntaxKind[ +SyntaxKind.FirstJSDocTagNode.value ];
SyntaxKind.LastJSDocTagNode = wrapped( 'LastJSDocTagNode', +SyntaxKind.JSDocPropertyTag );
SyntaxKind[ +SyntaxKind.LastJSDocTagNode.value ] = typeof SyntaxKind[ +SyntaxKind.LastJSDocTagNode.value ] !== 'number' ? named( 'LastJSDocTagNode' ) : SyntaxKind[ +SyntaxKind.LastJSDocTagNode.value ];

SyntaxKind = Object.create( templ(), SyntaxKind );
Object.getPrototypeOf( SyntaxKind ).asString = asString( SyntaxKind );

/** *********************************************************************************************************************
 * @enum
 * @name NodeFlags
 ************************************************************************************************************************/
let NodeFlags = {}; // Object.create( ( () => new ( function NodeFlags() {} )() )(), {} );
NodeFlags.None = wrapped( 'None', 0 );
NodeFlags[ +NodeFlags.None.value ] = typeof NodeFlags[ +NodeFlags.None.value ] !== 'number' ? named( 'None' ) : NodeFlags[ +NodeFlags.None.value ];
NodeFlags.Let = wrapped( 'Let', 1 << 0 );
NodeFlags[ +NodeFlags.Let.value ] = typeof NodeFlags[ +NodeFlags.Let.value ] !== 'number' ? named( 'Let' ) : NodeFlags[ +NodeFlags.Let.value ];
NodeFlags.Const = wrapped( 'Const', 1 << 1 );
NodeFlags[ +NodeFlags.Const.value ] = typeof NodeFlags[ +NodeFlags.Const.value ] !== 'number' ? named( 'Const' ) : NodeFlags[ +NodeFlags.Const.value ];
NodeFlags.NestedNamespace = wrapped( 'NestedNamespace', 1 << 2 );
NodeFlags[ +NodeFlags.NestedNamespace.value ] = typeof NodeFlags[ +NodeFlags.NestedNamespace.value ] !== 'number' ? named( 'NestedNamespace' ) : NodeFlags[ +NodeFlags.NestedNamespace.value ];
NodeFlags.Synthesized = wrapped( 'Synthesized', 1 << 3 );
NodeFlags[ +NodeFlags.Synthesized.value ] = typeof NodeFlags[ +NodeFlags.Synthesized.value ] !== 'number' ? named( 'Synthesized' ) : NodeFlags[ +NodeFlags.Synthesized.value ];
NodeFlags.Namespace = wrapped( 'Namespace', 1 << 4 );
NodeFlags[ +NodeFlags.Namespace.value ] = typeof NodeFlags[ +NodeFlags.Namespace.value ] !== 'number' ? named( 'Namespace' ) : NodeFlags[ +NodeFlags.Namespace.value ];
NodeFlags.ExportContext = wrapped( 'ExportContext', 1 << 5 );
NodeFlags[ +NodeFlags.ExportContext.value ] = typeof NodeFlags[ +NodeFlags.ExportContext.value ] !== 'number' ? named( 'ExportContext' ) : NodeFlags[ +NodeFlags.ExportContext.value ];
NodeFlags.ContainsThis = wrapped( 'ContainsThis', 1 << 6 );
NodeFlags[ +NodeFlags.ContainsThis.value ] = typeof NodeFlags[ +NodeFlags.ContainsThis.value ] !== 'number' ? named( 'ContainsThis' ) : NodeFlags[ +NodeFlags.ContainsThis.value ];
NodeFlags.HasImplicitReturn = wrapped( 'HasImplicitReturn', 1 << 7 );
NodeFlags[ +NodeFlags.HasImplicitReturn.value ] = typeof NodeFlags[ +NodeFlags.HasImplicitReturn.value ] !== 'number' ? named( 'HasImplicitReturn' ) : NodeFlags[ +NodeFlags.HasImplicitReturn.value ];
NodeFlags.HasExplicitReturn = wrapped( 'HasExplicitReturn', 1 << 8 );
NodeFlags[ +NodeFlags.HasExplicitReturn.value ] = typeof NodeFlags[ +NodeFlags.HasExplicitReturn.value ] !== 'number' ? named( 'HasExplicitReturn' ) : NodeFlags[ +NodeFlags.HasExplicitReturn.value ];
NodeFlags.GlobalAugmentation = wrapped( 'GlobalAugmentation', 1 << 9 );
NodeFlags[ +NodeFlags.GlobalAugmentation.value ] = typeof NodeFlags[ +NodeFlags.GlobalAugmentation.value ] !== 'number' ? named( 'GlobalAugmentation' ) : NodeFlags[ +NodeFlags.GlobalAugmentation.value ];
NodeFlags.HasAsyncFunctions = wrapped( 'HasAsyncFunctions', 1 << 10 );
NodeFlags[ +NodeFlags.HasAsyncFunctions.value ] = typeof NodeFlags[ +NodeFlags.HasAsyncFunctions.value ] !== 'number' ? named( 'HasAsyncFunctions' ) : NodeFlags[ +NodeFlags.HasAsyncFunctions.value ];
NodeFlags.DisallowInContext = wrapped( 'DisallowInContext', 1 << 11 );
NodeFlags[ +NodeFlags.DisallowInContext.value ] = typeof NodeFlags[ +NodeFlags.DisallowInContext.value ] !== 'number' ? named( 'DisallowInContext' ) : NodeFlags[ +NodeFlags.DisallowInContext.value ];
NodeFlags.YieldContext = wrapped( 'YieldContext', 1 << 12 );
NodeFlags[ +NodeFlags.YieldContext.value ] = typeof NodeFlags[ +NodeFlags.YieldContext.value ] !== 'number' ? named( 'YieldContext' ) : NodeFlags[ +NodeFlags.YieldContext.value ];
NodeFlags.DecoratorContext = wrapped( 'DecoratorContext', 1 << 13 );
NodeFlags[ +NodeFlags.DecoratorContext.value ] = typeof NodeFlags[ +NodeFlags.DecoratorContext.value ] !== 'number' ? named( 'DecoratorContext' ) : NodeFlags[ +NodeFlags.DecoratorContext.value ];
NodeFlags.AwaitContext = wrapped( 'AwaitContext', 1 << 14 );
NodeFlags[ +NodeFlags.AwaitContext.value ] = typeof NodeFlags[ +NodeFlags.AwaitContext.value ] !== 'number' ? named( 'AwaitContext' ) : NodeFlags[ +NodeFlags.AwaitContext.value ];
NodeFlags.ThisNodeHasError = wrapped( 'ThisNodeHasError', 1 << 15 );
NodeFlags[ +NodeFlags.ThisNodeHasError.value ] = typeof NodeFlags[ +NodeFlags.ThisNodeHasError.value ] !== 'number' ? named( 'ThisNodeHasError' ) : NodeFlags[ +NodeFlags.ThisNodeHasError.value ];
NodeFlags.JavaScriptFile = wrapped( 'JavaScriptFile', 1 << 16 );
NodeFlags[ +NodeFlags.JavaScriptFile.value ] = typeof NodeFlags[ +NodeFlags.JavaScriptFile.value ] !== 'number' ? named( 'JavaScriptFile' ) : NodeFlags[ +NodeFlags.JavaScriptFile.value ];
NodeFlags.ThisNodeOrAnySubNodesHasError = wrapped( 'ThisNodeOrAnySubNodesHasError', 1 << 17 );
NodeFlags[ +NodeFlags.ThisNodeOrAnySubNodesHasError.value ] = typeof NodeFlags[ +NodeFlags.ThisNodeOrAnySubNodesHasError.value ] !== 'number' ? named( 'ThisNodeOrAnySubNodesHasError' ) : NodeFlags[ +NodeFlags.ThisNodeOrAnySubNodesHasError.value ];
NodeFlags.HasAggregatedChildData = wrapped( 'HasAggregatedChildData', 1 << 18 );
NodeFlags[ +NodeFlags.HasAggregatedChildData.value ] = typeof NodeFlags[ +NodeFlags.HasAggregatedChildData.value ] !== 'number' ? named( 'HasAggregatedChildData' ) : NodeFlags[ +NodeFlags.HasAggregatedChildData.value ];
NodeFlags.PossiblyContainsDynamicImport = wrapped( 'PossiblyContainsDynamicImport', 1 << 19 );
NodeFlags[ +NodeFlags.PossiblyContainsDynamicImport.value ] = typeof NodeFlags[ +NodeFlags.PossiblyContainsDynamicImport.value ] !== 'number' ? named( 'PossiblyContainsDynamicImport' ) : NodeFlags[ +NodeFlags.PossiblyContainsDynamicImport.value ];
NodeFlags.JSDoc = wrapped( 'JSDoc', 1 << 20 );
NodeFlags[ +NodeFlags.JSDoc.value ] = typeof NodeFlags[ +NodeFlags.JSDoc.value ] !== 'number' ? named( 'JSDoc' ) : NodeFlags[ +NodeFlags.JSDoc.value ];
NodeFlags.BlockScoped = wrapped( 'BlockScoped', NodeFlags.Let | NodeFlags.Const );
NodeFlags[ +NodeFlags.BlockScoped.value ] = typeof NodeFlags[ +NodeFlags.BlockScoped.value ] !== 'number' ? named( 'BlockScoped' ) : NodeFlags[ +NodeFlags.BlockScoped.value ];
NodeFlags.ReachabilityCheckFlags = wrapped( 'ReachabilityCheckFlags', NodeFlags.HasImplicitReturn | NodeFlags.HasExplicitReturn );
NodeFlags[ +NodeFlags.ReachabilityCheckFlags.value ] = typeof NodeFlags[ +NodeFlags.ReachabilityCheckFlags.value ] !== 'number' ? named( 'ReachabilityCheckFlags' ) : NodeFlags[ +NodeFlags.ReachabilityCheckFlags.value ];
NodeFlags.ReachabilityAndEmitFlags = wrapped( 'ReachabilityAndEmitFlags', NodeFlags.ReachabilityCheckFlags | NodeFlags.HasAsyncFunctions );
NodeFlags[ +NodeFlags.ReachabilityAndEmitFlags.value ] = typeof NodeFlags[ +NodeFlags.ReachabilityAndEmitFlags.value ] !== 'number' ? named( 'ReachabilityAndEmitFlags' ) : NodeFlags[ +NodeFlags.ReachabilityAndEmitFlags.value ];
NodeFlags.ContextFlags = wrapped( 'ContextFlags', NodeFlags.DisallowInContext | NodeFlags.YieldContext | NodeFlags.DecoratorContext | NodeFlags.AwaitContext | NodeFlags.JavaScriptFile | NodeFlags.InWithStatement | NodeFlags.Ambient );
NodeFlags[ +NodeFlags.ContextFlags.value ] = typeof NodeFlags[ +NodeFlags.ContextFlags.value ] !== 'number' ? named( 'ContextFlags' ) : NodeFlags[ +NodeFlags.ContextFlags.value ];
NodeFlags.TypeExcludesFlags = wrapped( 'TypeExcludesFlags', NodeFlags.YieldContext | NodeFlags.AwaitContext );
NodeFlags[ +NodeFlags.TypeExcludesFlags.value ] = typeof NodeFlags[ +NodeFlags.TypeExcludesFlags.value ] !== 'number' ? named( 'TypeExcludesFlags' ) : NodeFlags[ +NodeFlags.TypeExcludesFlags.value ];

NodeFlags = Object.create( templ(), NodeFlags );
Object.getPrototypeOf( NodeFlags ).asString = asString( NodeFlags );

/** *********************************************************************************************************************
 * @enum
 * @name ModifierFlags
 ************************************************************************************************************************/
let ModifierFlags = {}; // Object.create( ( () => new ( function ModifierFlags() {} )() )(), {} );
ModifierFlags.None = wrapped( 'None', 0 );
ModifierFlags[ +ModifierFlags.None.value ] = typeof ModifierFlags[ +ModifierFlags.None.value ] !== 'number' ? named( 'None' ) : ModifierFlags[ +ModifierFlags.None.value ];
ModifierFlags.Export = wrapped( 'Export', 1 << 0 );
ModifierFlags[ +ModifierFlags.Export.value ] = typeof ModifierFlags[ +ModifierFlags.Export.value ] !== 'number' ? named( 'Export' ) : ModifierFlags[ +ModifierFlags.Export.value ];
ModifierFlags.Ambient = wrapped( 'Ambient', 1 << 1 );
ModifierFlags[ +ModifierFlags.Ambient.value ] = typeof ModifierFlags[ +ModifierFlags.Ambient.value ] !== 'number' ? named( 'Ambient' ) : ModifierFlags[ +ModifierFlags.Ambient.value ];
ModifierFlags.Public = wrapped( 'Public', 1 << 2 );
ModifierFlags[ +ModifierFlags.Public.value ] = typeof ModifierFlags[ +ModifierFlags.Public.value ] !== 'number' ? named( 'Public' ) : ModifierFlags[ +ModifierFlags.Public.value ];
ModifierFlags.Private = wrapped( 'Private', 1 << 3 );
ModifierFlags[ +ModifierFlags.Private.value ] = typeof ModifierFlags[ +ModifierFlags.Private.value ] !== 'number' ? named( 'Private' ) : ModifierFlags[ +ModifierFlags.Private.value ];
ModifierFlags.Protected = wrapped( 'Protected', 1 << 4 );
ModifierFlags[ +ModifierFlags.Protected.value ] = typeof ModifierFlags[ +ModifierFlags.Protected.value ] !== 'number' ? named( 'Protected' ) : ModifierFlags[ +ModifierFlags.Protected.value ];
ModifierFlags.Static = wrapped( 'Static', 1 << 5 );
ModifierFlags[ +ModifierFlags.Static.value ] = typeof ModifierFlags[ +ModifierFlags.Static.value ] !== 'number' ? named( 'Static' ) : ModifierFlags[ +ModifierFlags.Static.value ];
ModifierFlags.Readonly = wrapped( 'Readonly', 1 << 6 );
ModifierFlags[ +ModifierFlags.Readonly.value ] = typeof ModifierFlags[ +ModifierFlags.Readonly.value ] !== 'number' ? named( 'Readonly' ) : ModifierFlags[ +ModifierFlags.Readonly.value ];
ModifierFlags.Abstract = wrapped( 'Abstract', 1 << 7 );
ModifierFlags[ +ModifierFlags.Abstract.value ] = typeof ModifierFlags[ +ModifierFlags.Abstract.value ] !== 'number' ? named( 'Abstract' ) : ModifierFlags[ +ModifierFlags.Abstract.value ];
ModifierFlags.Async = wrapped( 'Async', 1 << 8 );
ModifierFlags[ +ModifierFlags.Async.value ] = typeof ModifierFlags[ +ModifierFlags.Async.value ] !== 'number' ? named( 'Async' ) : ModifierFlags[ +ModifierFlags.Async.value ];
ModifierFlags.Default = wrapped( 'Default', 1 << 9 );
ModifierFlags[ +ModifierFlags.Default.value ] = typeof ModifierFlags[ +ModifierFlags.Default.value ] !== 'number' ? named( 'Default' ) : ModifierFlags[ +ModifierFlags.Default.value ];
ModifierFlags.Const = wrapped( 'Const', 1 << 11 );
ModifierFlags[ +ModifierFlags.Const.value ] = typeof ModifierFlags[ +ModifierFlags.Const.value ] !== 'number' ? named( 'Const' ) : ModifierFlags[ +ModifierFlags.Const.value ];
ModifierFlags.HasComputedFlags = wrapped( 'HasComputedFlags', 1 << 29 );
ModifierFlags[ +ModifierFlags.HasComputedFlags.value ] = typeof ModifierFlags[ +ModifierFlags.HasComputedFlags.value ] !== 'number' ? named( 'HasComputedFlags' ) : ModifierFlags[ +ModifierFlags.HasComputedFlags.value ];
ModifierFlags.AccessibilityModifier = wrapped( 'AccessibilityModifier', ModifierFlags.Public | ModifierFlags.Private | ModifierFlags.Protected );
ModifierFlags[ +ModifierFlags.AccessibilityModifier.value ] = typeof ModifierFlags[ +ModifierFlags.AccessibilityModifier.value ] !== 'number' ? named( 'AccessibilityModifier' ) : ModifierFlags[ +ModifierFlags.AccessibilityModifier.value ];
ModifierFlags.ParameterPropertyModifier = wrapped( 'ParameterPropertyModifier', ModifierFlags.AccessibilityModifier | ModifierFlags.Readonly );
ModifierFlags[ +ModifierFlags.ParameterPropertyModifier.value ] = typeof ModifierFlags[ +ModifierFlags.ParameterPropertyModifier.value ] !== 'number' ? named( 'ParameterPropertyModifier' ) : ModifierFlags[ +ModifierFlags.ParameterPropertyModifier.value ];
ModifierFlags.NonPublicAccessibilityModifier = wrapped( 'NonPublicAccessibilityModifier', ModifierFlags.Private | ModifierFlags.Protected );
ModifierFlags[ +ModifierFlags.NonPublicAccessibilityModifier.value ] = typeof ModifierFlags[ +ModifierFlags.NonPublicAccessibilityModifier.value ] !== 'number' ? named( 'NonPublicAccessibilityModifier' ) : ModifierFlags[ +ModifierFlags.NonPublicAccessibilityModifier.value ];
ModifierFlags.TypeScriptModifier = wrapped( 'TypeScriptModifier', ModifierFlags.Ambient | ModifierFlags.Public | ModifierFlags.Private | ModifierFlags.Protected | ModifierFlags.Readonly | ModifierFlags.Abstract | ModifierFlags.Const );
ModifierFlags[ +ModifierFlags.TypeScriptModifier.value ] = typeof ModifierFlags[ +ModifierFlags.TypeScriptModifier.value ] !== 'number' ? named( 'TypeScriptModifier' ) : ModifierFlags[ +ModifierFlags.TypeScriptModifier.value ];
ModifierFlags.ExportDefault = wrapped( 'ExportDefault', ModifierFlags.Export | ModifierFlags.Default );
ModifierFlags[ +ModifierFlags.ExportDefault.value ] = typeof ModifierFlags[ +ModifierFlags.ExportDefault.value ] !== 'number' ? named( 'ExportDefault' ) : ModifierFlags[ +ModifierFlags.ExportDefault.value ];

ModifierFlags = Object.create( templ(), ModifierFlags );
Object.getPrototypeOf( ModifierFlags ).asString = asString( ModifierFlags );

/** *********************************************************************************************************************
 * @enum
 * @name JsxFlags
 ************************************************************************************************************************/
let JsxFlags = {}; // Object.create( ( () => new ( function JsxFlags() {} )() )(), {} );
JsxFlags.None = wrapped( 'None', 0 );
JsxFlags[ +JsxFlags.None.value ] = typeof JsxFlags[ +JsxFlags.None.value ] !== 'number' ? named( 'None' ) : JsxFlags[ +JsxFlags.None.value ];
JsxFlags.IntrinsicNamedElement = wrapped( 'IntrinsicNamedElement', 1 << 0 );
JsxFlags[ +JsxFlags.IntrinsicNamedElement.value ] = typeof JsxFlags[ +JsxFlags.IntrinsicNamedElement.value ] !== 'number' ? named( 'IntrinsicNamedElement' ) : JsxFlags[ +JsxFlags.IntrinsicNamedElement.value ];
JsxFlags.IntrinsicIndexedElement = wrapped( 'IntrinsicIndexedElement', 1 << 1 );
JsxFlags[ +JsxFlags.IntrinsicIndexedElement.value ] = typeof JsxFlags[ +JsxFlags.IntrinsicIndexedElement.value ] !== 'number' ? named( 'IntrinsicIndexedElement' ) : JsxFlags[ +JsxFlags.IntrinsicIndexedElement.value ];
JsxFlags.IntrinsicElement = wrapped( 'IntrinsicElement', JsxFlags.IntrinsicNamedElement | JsxFlags.IntrinsicIndexedElement );
JsxFlags[ +JsxFlags.IntrinsicElement.value ] = typeof JsxFlags[ +JsxFlags.IntrinsicElement.value ] !== 'number' ? named( 'IntrinsicElement' ) : JsxFlags[ +JsxFlags.IntrinsicElement.value ];

JsxFlags = Object.create( templ(), JsxFlags );
Object.getPrototypeOf( JsxFlags ).asString = asString( JsxFlags );

/** *********************************************************************************************************************
 * @enum
 * @name RelationComparisonResult
 ************************************************************************************************************************/
let RelationComparisonResult = {}; // Object.create( ( () => new ( function RelationComparisonResult() {} )() )(), {} );
RelationComparisonResult.Succeeded = wrapped( 'Succeeded', 1 );
RelationComparisonResult[ +RelationComparisonResult.Succeeded.value ] = typeof RelationComparisonResult[ +RelationComparisonResult.Succeeded.value ] !== 'number' ? named( 'Succeeded' ) : RelationComparisonResult[ +RelationComparisonResult.Succeeded.value ];
RelationComparisonResult.Failed = wrapped( 'Failed', 2 );
RelationComparisonResult[ +RelationComparisonResult.Failed.value ] = typeof RelationComparisonResult[ +RelationComparisonResult.Failed.value ] !== 'number' ? named( 'Failed' ) : RelationComparisonResult[ +RelationComparisonResult.Failed.value ];
RelationComparisonResult.FailedAndReported = wrapped( 'FailedAndReported', 3 );
RelationComparisonResult[ +RelationComparisonResult.FailedAndReported.value ] = typeof RelationComparisonResult[ +RelationComparisonResult.FailedAndReported.value ] !== 'number' ? named( 'FailedAndReported' ) : RelationComparisonResult[ +RelationComparisonResult.FailedAndReported.value ];

RelationComparisonResult = Object.create( templ(), RelationComparisonResult );
Object.getPrototypeOf( RelationComparisonResult ).asString = asString( RelationComparisonResult );

/** *********************************************************************************************************************
 * @enum
 * @name GeneratedIdentifierKind
 ************************************************************************************************************************/
let GeneratedIdentifierKind = {}; // Object.create( ( () => new ( function GeneratedIdentifierKind() {} )() )(), {} );
GeneratedIdentifierKind.None = wrapped( 'None', 1 );
GeneratedIdentifierKind[ +GeneratedIdentifierKind.None.value ] = typeof GeneratedIdentifierKind[ +GeneratedIdentifierKind.None.value ] !== 'number' ? named( 'None' ) : GeneratedIdentifierKind[ +GeneratedIdentifierKind.None.value ];
GeneratedIdentifierKind.Auto = wrapped( 'Auto', 2 );
GeneratedIdentifierKind[ +GeneratedIdentifierKind.Auto.value ] = typeof GeneratedIdentifierKind[ +GeneratedIdentifierKind.Auto.value ] !== 'number' ? named( 'Auto' ) : GeneratedIdentifierKind[ +GeneratedIdentifierKind.Auto.value ];
GeneratedIdentifierKind.Loop = wrapped( 'Loop', 3 );
GeneratedIdentifierKind[ +GeneratedIdentifierKind.Loop.value ] = typeof GeneratedIdentifierKind[ +GeneratedIdentifierKind.Loop.value ] !== 'number' ? named( 'Loop' ) : GeneratedIdentifierKind[ +GeneratedIdentifierKind.Loop.value ];
GeneratedIdentifierKind.Unique = wrapped( 'Unique', 4 );
GeneratedIdentifierKind[ +GeneratedIdentifierKind.Unique.value ] = typeof GeneratedIdentifierKind[ +GeneratedIdentifierKind.Unique.value ] !== 'number' ? named( 'Unique' ) : GeneratedIdentifierKind[ +GeneratedIdentifierKind.Unique.value ];
GeneratedIdentifierKind.Node = wrapped( 'Node', 5 );
GeneratedIdentifierKind[ +GeneratedIdentifierKind.Node.value ] = typeof GeneratedIdentifierKind[ +GeneratedIdentifierKind.Node.value ] !== 'number' ? named( 'Node' ) : GeneratedIdentifierKind[ +GeneratedIdentifierKind.Node.value ];

GeneratedIdentifierKind = Object.create( templ(), GeneratedIdentifierKind );
Object.getPrototypeOf( GeneratedIdentifierKind ).asString = asString( GeneratedIdentifierKind );

/** *********************************************************************************************************************
 * @enum
 * @name TokenFlags
 ************************************************************************************************************************/
let TokenFlags = {}; // Object.create( ( () => new ( function TokenFlags() {} )() )(), {} );
TokenFlags.None = wrapped( 'None', 0 );
TokenFlags[ +TokenFlags.None.value ] = typeof TokenFlags[ +TokenFlags.None.value ] !== 'number' ? named( 'None' ) : TokenFlags[ +TokenFlags.None.value ];
TokenFlags.PrecedingLineBreak = wrapped( 'PrecedingLineBreak', 1 << 0 );
TokenFlags[ +TokenFlags.PrecedingLineBreak.value ] = typeof TokenFlags[ +TokenFlags.PrecedingLineBreak.value ] !== 'number' ? named( 'PrecedingLineBreak' ) : TokenFlags[ +TokenFlags.PrecedingLineBreak.value ];
TokenFlags.PrecedingJSDocComment = wrapped( 'PrecedingJSDocComment', 1 << 1 );
TokenFlags[ +TokenFlags.PrecedingJSDocComment.value ] = typeof TokenFlags[ +TokenFlags.PrecedingJSDocComment.value ] !== 'number' ? named( 'PrecedingJSDocComment' ) : TokenFlags[ +TokenFlags.PrecedingJSDocComment.value ];
TokenFlags.Unterminated = wrapped( 'Unterminated', 1 << 2 );
TokenFlags[ +TokenFlags.Unterminated.value ] = typeof TokenFlags[ +TokenFlags.Unterminated.value ] !== 'number' ? named( 'Unterminated' ) : TokenFlags[ +TokenFlags.Unterminated.value ];
TokenFlags.ExtendedUnicodeEscape = wrapped( 'ExtendedUnicodeEscape', 1 << 3 );
TokenFlags[ +TokenFlags.ExtendedUnicodeEscape.value ] = typeof TokenFlags[ +TokenFlags.ExtendedUnicodeEscape.value ] !== 'number' ? named( 'ExtendedUnicodeEscape' ) : TokenFlags[ +TokenFlags.ExtendedUnicodeEscape.value ];
TokenFlags.Scientific = wrapped( 'Scientific', 1 << 4 );
TokenFlags[ +TokenFlags.Scientific.value ] = typeof TokenFlags[ +TokenFlags.Scientific.value ] !== 'number' ? named( 'Scientific' ) : TokenFlags[ +TokenFlags.Scientific.value ];
TokenFlags.Octal = wrapped( 'Octal', 1 << 5 );
TokenFlags[ +TokenFlags.Octal.value ] = typeof TokenFlags[ +TokenFlags.Octal.value ] !== 'number' ? named( 'Octal' ) : TokenFlags[ +TokenFlags.Octal.value ];
TokenFlags.HexSpecifier = wrapped( 'HexSpecifier', 1 << 6 );
TokenFlags[ +TokenFlags.HexSpecifier.value ] = typeof TokenFlags[ +TokenFlags.HexSpecifier.value ] !== 'number' ? named( 'HexSpecifier' ) : TokenFlags[ +TokenFlags.HexSpecifier.value ];
TokenFlags.BinarySpecifier = wrapped( 'BinarySpecifier', 1 << 7 );
TokenFlags[ +TokenFlags.BinarySpecifier.value ] = typeof TokenFlags[ +TokenFlags.BinarySpecifier.value ] !== 'number' ? named( 'BinarySpecifier' ) : TokenFlags[ +TokenFlags.BinarySpecifier.value ];
TokenFlags.OctalSpecifier = wrapped( 'OctalSpecifier', 1 << 8 );
TokenFlags[ +TokenFlags.OctalSpecifier.value ] = typeof TokenFlags[ +TokenFlags.OctalSpecifier.value ] !== 'number' ? named( 'OctalSpecifier' ) : TokenFlags[ +TokenFlags.OctalSpecifier.value ];
TokenFlags.ContainsSeparator = wrapped( 'ContainsSeparator', 1 << 9 );
TokenFlags[ +TokenFlags.ContainsSeparator.value ] = typeof TokenFlags[ +TokenFlags.ContainsSeparator.value ] !== 'number' ? named( 'ContainsSeparator' ) : TokenFlags[ +TokenFlags.ContainsSeparator.value ];
TokenFlags.BinaryOrOctalSpecifier = wrapped( 'BinaryOrOctalSpecifier', TokenFlags.BinarySpecifier | TokenFlags.OctalSpecifier );
TokenFlags[ +TokenFlags.BinaryOrOctalSpecifier.value ] = typeof TokenFlags[ +TokenFlags.BinaryOrOctalSpecifier.value ] !== 'number' ? named( 'BinaryOrOctalSpecifier' ) : TokenFlags[ +TokenFlags.BinaryOrOctalSpecifier.value ];
TokenFlags.NumericLiteralFlags = wrapped( 'NumericLiteralFlags', TokenFlags.Scientific | TokenFlags.Octal | TokenFlags.HexSpecifier | TokenFlags.BinarySpecifier | TokenFlags.OctalSpecifier | TokenFlags.ContainsSeparator );
TokenFlags[ +TokenFlags.NumericLiteralFlags.value ] = typeof TokenFlags[ +TokenFlags.NumericLiteralFlags.value ] !== 'number' ? named( 'NumericLiteralFlags' ) : TokenFlags[ +TokenFlags.NumericLiteralFlags.value ];

TokenFlags = Object.create( templ(), TokenFlags );
Object.getPrototypeOf( TokenFlags ).asString = asString( TokenFlags );

/** *********************************************************************************************************************
 * @enum
 * @name FlowFlags
 ************************************************************************************************************************/
let FlowFlags = {}; // Object.create( ( () => new ( function FlowFlags() {} )() )(), {} );
FlowFlags.Unreachable = wrapped( 'Unreachable', 1 << 0 );
FlowFlags[ +FlowFlags.Unreachable.value ] = typeof FlowFlags[ +FlowFlags.Unreachable.value ] !== 'number' ? named( 'Unreachable' ) : FlowFlags[ +FlowFlags.Unreachable.value ];
FlowFlags.Start = wrapped( 'Start', 1 << 1 );
FlowFlags[ +FlowFlags.Start.value ] = typeof FlowFlags[ +FlowFlags.Start.value ] !== 'number' ? named( 'Start' ) : FlowFlags[ +FlowFlags.Start.value ];
FlowFlags.BranchLabel = wrapped( 'BranchLabel', 1 << 2 );
FlowFlags[ +FlowFlags.BranchLabel.value ] = typeof FlowFlags[ +FlowFlags.BranchLabel.value ] !== 'number' ? named( 'BranchLabel' ) : FlowFlags[ +FlowFlags.BranchLabel.value ];
FlowFlags.LoopLabel = wrapped( 'LoopLabel', 1 << 3 );
FlowFlags[ +FlowFlags.LoopLabel.value ] = typeof FlowFlags[ +FlowFlags.LoopLabel.value ] !== 'number' ? named( 'LoopLabel' ) : FlowFlags[ +FlowFlags.LoopLabel.value ];
FlowFlags.Assignment = wrapped( 'Assignment', 1 << 4 );
FlowFlags[ +FlowFlags.Assignment.value ] = typeof FlowFlags[ +FlowFlags.Assignment.value ] !== 'number' ? named( 'Assignment' ) : FlowFlags[ +FlowFlags.Assignment.value ];
FlowFlags.TrueCondition = wrapped( 'TrueCondition', 1 << 5 );
FlowFlags[ +FlowFlags.TrueCondition.value ] = typeof FlowFlags[ +FlowFlags.TrueCondition.value ] !== 'number' ? named( 'TrueCondition' ) : FlowFlags[ +FlowFlags.TrueCondition.value ];
FlowFlags.FalseCondition = wrapped( 'FalseCondition', 1 << 6 );
FlowFlags[ +FlowFlags.FalseCondition.value ] = typeof FlowFlags[ +FlowFlags.FalseCondition.value ] !== 'number' ? named( 'FalseCondition' ) : FlowFlags[ +FlowFlags.FalseCondition.value ];
FlowFlags.SwitchClause = wrapped( 'SwitchClause', 1 << 7 );
FlowFlags[ +FlowFlags.SwitchClause.value ] = typeof FlowFlags[ +FlowFlags.SwitchClause.value ] !== 'number' ? named( 'SwitchClause' ) : FlowFlags[ +FlowFlags.SwitchClause.value ];
FlowFlags.ArrayMutation = wrapped( 'ArrayMutation', 1 << 8 );
FlowFlags[ +FlowFlags.ArrayMutation.value ] = typeof FlowFlags[ +FlowFlags.ArrayMutation.value ] !== 'number' ? named( 'ArrayMutation' ) : FlowFlags[ +FlowFlags.ArrayMutation.value ];
FlowFlags.Referenced = wrapped( 'Referenced', 1 << 9 );
FlowFlags[ +FlowFlags.Referenced.value ] = typeof FlowFlags[ +FlowFlags.Referenced.value ] !== 'number' ? named( 'Referenced' ) : FlowFlags[ +FlowFlags.Referenced.value ];
FlowFlags.Shared = wrapped( 'Shared', 1 << 10 );
FlowFlags[ +FlowFlags.Shared.value ] = typeof FlowFlags[ +FlowFlags.Shared.value ] !== 'number' ? named( 'Shared' ) : FlowFlags[ +FlowFlags.Shared.value ];
FlowFlags.PreFinally = wrapped( 'PreFinally', 1 << 11 );
FlowFlags[ +FlowFlags.PreFinally.value ] = typeof FlowFlags[ +FlowFlags.PreFinally.value ] !== 'number' ? named( 'PreFinally' ) : FlowFlags[ +FlowFlags.PreFinally.value ];
FlowFlags.AfterFinally = wrapped( 'AfterFinally', 1 << 12 );
FlowFlags[ +FlowFlags.AfterFinally.value ] = typeof FlowFlags[ +FlowFlags.AfterFinally.value ] !== 'number' ? named( 'AfterFinally' ) : FlowFlags[ +FlowFlags.AfterFinally.value ];
FlowFlags.Label = wrapped( 'Label', FlowFlags.BranchLabel | FlowFlags.LoopLabel );
FlowFlags[ +FlowFlags.Label.value ] = typeof FlowFlags[ +FlowFlags.Label.value ] !== 'number' ? named( 'Label' ) : FlowFlags[ +FlowFlags.Label.value ];
FlowFlags.Condition = wrapped( 'Condition', FlowFlags.TrueCondition | FlowFlags.FalseCondition );
FlowFlags[ +FlowFlags.Condition.value ] = typeof FlowFlags[ +FlowFlags.Condition.value ] !== 'number' ? named( 'Condition' ) : FlowFlags[ +FlowFlags.Condition.value ];

FlowFlags = Object.create( templ(), FlowFlags );
Object.getPrototypeOf( FlowFlags ).asString = asString( FlowFlags );

/** *********************************************************************************************************************
 * @enum
 * @name StructureIsReused
 ************************************************************************************************************************/
let StructureIsReused = {}; // Object.create( ( () => new ( function StructureIsReused() {} )() )(), {} );
StructureIsReused.Not = wrapped( 'Not', 0 );
StructureIsReused[ +StructureIsReused.Not.value ] = typeof StructureIsReused[ +StructureIsReused.Not.value ] !== 'number' ? named( 'Not' ) : StructureIsReused[ +StructureIsReused.Not.value ];
StructureIsReused.SafeModules = wrapped( 'SafeModules', 1 << 0 );
StructureIsReused[ +StructureIsReused.SafeModules.value ] = typeof StructureIsReused[ +StructureIsReused.SafeModules.value ] !== 'number' ? named( 'SafeModules' ) : StructureIsReused[ +StructureIsReused.SafeModules.value ];
StructureIsReused.Completely = wrapped( 'Completely', 1 << 1 );
StructureIsReused[ +StructureIsReused.Completely.value ] = typeof StructureIsReused[ +StructureIsReused.Completely.value ] !== 'number' ? named( 'Completely' ) : StructureIsReused[ +StructureIsReused.Completely.value ];

StructureIsReused = Object.create( templ(), StructureIsReused );
Object.getPrototypeOf( StructureIsReused ).asString = asString( StructureIsReused );

/** *********************************************************************************************************************
 * @enum
 * @name UnionReduction
 ************************************************************************************************************************/
let UnionReduction = {}; // Object.create( ( () => new ( function UnionReduction() {} )() )(), {} );
UnionReduction.None = wrapped( 'None', 0 );
UnionReduction[ +UnionReduction.None.value ] = typeof UnionReduction[ +UnionReduction.None.value ] !== 'number' ? named( 'None' ) : UnionReduction[ +UnionReduction.None.value ];
UnionReduction.Literal = wrapped( 'Literal', 1 );
UnionReduction[ +UnionReduction.Literal.value ] = typeof UnionReduction[ +UnionReduction.Literal.value ] !== 'number' ? named( 'Literal' ) : UnionReduction[ +UnionReduction.Literal.value ];
UnionReduction.Subtype = wrapped( 'Subtype', 2 );
UnionReduction[ +UnionReduction.Subtype.value ] = typeof UnionReduction[ +UnionReduction.Subtype.value ] !== 'number' ? named( 'Subtype' ) : UnionReduction[ +UnionReduction.Subtype.value ];

UnionReduction = Object.create( templ(), UnionReduction );
Object.getPrototypeOf( UnionReduction ).asString = asString( UnionReduction );

/** *********************************************************************************************************************
 * @enum
 * @name TypeFormatFlags
 ************************************************************************************************************************/
let TypeFormatFlags = {}; // Object.create( ( () => new ( function TypeFormatFlags() {} )() )(), {} );
TypeFormatFlags.None = wrapped( 'None', 0 );
TypeFormatFlags[ +TypeFormatFlags.None.value ] = typeof TypeFormatFlags[ +TypeFormatFlags.None.value ] !== 'number' ? named( 'None' ) : TypeFormatFlags[ +TypeFormatFlags.None.value ];
TypeFormatFlags.WriteArrayAsGenericType = wrapped( 'WriteArrayAsGenericType', 1 << 0 );
TypeFormatFlags[ +TypeFormatFlags.WriteArrayAsGenericType.value ] = typeof TypeFormatFlags[ +TypeFormatFlags.WriteArrayAsGenericType.value ] !== 'number' ? named( 'WriteArrayAsGenericType' ) : TypeFormatFlags[ +TypeFormatFlags.WriteArrayAsGenericType.value ];
TypeFormatFlags.UseTypeOfFunction = wrapped( 'UseTypeOfFunction', 1 << 2 );
TypeFormatFlags[ +TypeFormatFlags.UseTypeOfFunction.value ] = typeof TypeFormatFlags[ +TypeFormatFlags.UseTypeOfFunction.value ] !== 'number' ? named( 'UseTypeOfFunction' ) : TypeFormatFlags[ +TypeFormatFlags.UseTypeOfFunction.value ];
TypeFormatFlags.NoTruncation = wrapped( 'NoTruncation', 1 << 3 );
TypeFormatFlags[ +TypeFormatFlags.NoTruncation.value ] = typeof TypeFormatFlags[ +TypeFormatFlags.NoTruncation.value ] !== 'number' ? named( 'NoTruncation' ) : TypeFormatFlags[ +TypeFormatFlags.NoTruncation.value ];
TypeFormatFlags.WriteArrowStyleSignature = wrapped( 'WriteArrowStyleSignature', 1 << 4 );
TypeFormatFlags[ +TypeFormatFlags.WriteArrowStyleSignature.value ] = typeof TypeFormatFlags[ +TypeFormatFlags.WriteArrowStyleSignature.value ] !== 'number' ? named( 'WriteArrowStyleSignature' ) : TypeFormatFlags[ +TypeFormatFlags.WriteArrowStyleSignature.value ];
TypeFormatFlags.WriteOwnNameForAnyLike = wrapped( 'WriteOwnNameForAnyLike', 1 << 5 );
TypeFormatFlags[ +TypeFormatFlags.WriteOwnNameForAnyLike.value ] = typeof TypeFormatFlags[ +TypeFormatFlags.WriteOwnNameForAnyLike.value ] !== 'number' ? named( 'WriteOwnNameForAnyLike' ) : TypeFormatFlags[ +TypeFormatFlags.WriteOwnNameForAnyLike.value ];
TypeFormatFlags.WriteTypeArgumentsOfSignature = wrapped( 'WriteTypeArgumentsOfSignature', 1 << 6 );
TypeFormatFlags[ +TypeFormatFlags.WriteTypeArgumentsOfSignature.value ] = typeof TypeFormatFlags[ +TypeFormatFlags.WriteTypeArgumentsOfSignature.value ] !== 'number' ? named( 'WriteTypeArgumentsOfSignature' ) : TypeFormatFlags[ +TypeFormatFlags.WriteTypeArgumentsOfSignature.value ];
TypeFormatFlags.InElementType = wrapped( 'InElementType', 1 << 7 );
TypeFormatFlags[ +TypeFormatFlags.InElementType.value ] = typeof TypeFormatFlags[ +TypeFormatFlags.InElementType.value ] !== 'number' ? named( 'InElementType' ) : TypeFormatFlags[ +TypeFormatFlags.InElementType.value ];
TypeFormatFlags.UseFullyQualifiedType = wrapped( 'UseFullyQualifiedType', 1 << 8 );
TypeFormatFlags[ +TypeFormatFlags.UseFullyQualifiedType.value ] = typeof TypeFormatFlags[ +TypeFormatFlags.UseFullyQualifiedType.value ] !== 'number' ? named( 'UseFullyQualifiedType' ) : TypeFormatFlags[ +TypeFormatFlags.UseFullyQualifiedType.value ];
TypeFormatFlags.InFirstTypeArgument = wrapped( 'InFirstTypeArgument', 1 << 9 );
TypeFormatFlags[ +TypeFormatFlags.InFirstTypeArgument.value ] = typeof TypeFormatFlags[ +TypeFormatFlags.InFirstTypeArgument.value ] !== 'number' ? named( 'InFirstTypeArgument' ) : TypeFormatFlags[ +TypeFormatFlags.InFirstTypeArgument.value ];
TypeFormatFlags.InTypeAlias = wrapped( 'InTypeAlias', 1 << 10 );
TypeFormatFlags[ +TypeFormatFlags.InTypeAlias.value ] = typeof TypeFormatFlags[ +TypeFormatFlags.InTypeAlias.value ] !== 'number' ? named( 'InTypeAlias' ) : TypeFormatFlags[ +TypeFormatFlags.InTypeAlias.value ];
TypeFormatFlags.SuppressAnyReturnType = wrapped( 'SuppressAnyReturnType', 1 << 12 );
TypeFormatFlags[ +TypeFormatFlags.SuppressAnyReturnType.value ] = typeof TypeFormatFlags[ +TypeFormatFlags.SuppressAnyReturnType.value ] !== 'number' ? named( 'SuppressAnyReturnType' ) : TypeFormatFlags[ +TypeFormatFlags.SuppressAnyReturnType.value ];
TypeFormatFlags.AddUndefined = wrapped( 'AddUndefined', 1 << 13 );
TypeFormatFlags[ +TypeFormatFlags.AddUndefined.value ] = typeof TypeFormatFlags[ +TypeFormatFlags.AddUndefined.value ] !== 'number' ? named( 'AddUndefined' ) : TypeFormatFlags[ +TypeFormatFlags.AddUndefined.value ];
TypeFormatFlags.WriteClassExpressionAsTypeLiteral = wrapped( 'WriteClassExpressionAsTypeLiteral', 1 << 14 );
TypeFormatFlags[ +TypeFormatFlags.WriteClassExpressionAsTypeLiteral.value ] = typeof TypeFormatFlags[ +TypeFormatFlags.WriteClassExpressionAsTypeLiteral.value ] !== 'number' ? named( 'WriteClassExpressionAsTypeLiteral' ) : TypeFormatFlags[ +TypeFormatFlags.WriteClassExpressionAsTypeLiteral.value ];
TypeFormatFlags.InArrayType = wrapped( 'InArrayType', 1 << 15 );
TypeFormatFlags[ +TypeFormatFlags.InArrayType.value ] = typeof TypeFormatFlags[ +TypeFormatFlags.InArrayType.value ] !== 'number' ? named( 'InArrayType' ) : TypeFormatFlags[ +TypeFormatFlags.InArrayType.value ];
TypeFormatFlags.UseAliasDefinedOutsideCurrentScope = wrapped( 'UseAliasDefinedOutsideCurrentScope', 1 << 16 );
TypeFormatFlags[ +TypeFormatFlags.UseAliasDefinedOutsideCurrentScope.value ] = typeof TypeFormatFlags[ +TypeFormatFlags.UseAliasDefinedOutsideCurrentScope.value ] !== 'number' ? named( 'UseAliasDefinedOutsideCurrentScope' ) : TypeFormatFlags[ +TypeFormatFlags.UseAliasDefinedOutsideCurrentScope.value ];
TypeFormatFlags.AllowUniqueESSymbolType = wrapped( 'AllowUniqueESSymbolType', 1 << 17 );
TypeFormatFlags[ +TypeFormatFlags.AllowUniqueESSymbolType.value ] = typeof TypeFormatFlags[ +TypeFormatFlags.AllowUniqueESSymbolType.value ] !== 'number' ? named( 'AllowUniqueESSymbolType' ) : TypeFormatFlags[ +TypeFormatFlags.AllowUniqueESSymbolType.value ];

TypeFormatFlags = Object.create( templ(), TypeFormatFlags );
Object.getPrototypeOf( TypeFormatFlags ).asString = asString( TypeFormatFlags );

/** *********************************************************************************************************************
 * @enum
 * @name SymbolFormatFlags
 ************************************************************************************************************************/
let SymbolFormatFlags = {}; // Object.create( ( () => new ( function SymbolFormatFlags() {} )() )(), {} );
SymbolFormatFlags.None = wrapped( 'None', 0x00000000 );
SymbolFormatFlags[ +SymbolFormatFlags.None.value ] = typeof SymbolFormatFlags[ +SymbolFormatFlags.None.value ] !== 'number' ? named( 'None' ) : SymbolFormatFlags[ +SymbolFormatFlags.None.value ];

SymbolFormatFlags = Object.create( templ(), SymbolFormatFlags );
Object.getPrototypeOf( SymbolFormatFlags ).asString = asString( SymbolFormatFlags );

/** *********************************************************************************************************************
 * @enum
 * @name SymbolAccessibility
 ************************************************************************************************************************/
let SymbolAccessibility = {}; // Object.create( ( () => new ( function SymbolAccessibility() {} )() )(), {} );
SymbolAccessibility.Accessible = wrapped( 'Accessible', 1 );
SymbolAccessibility[ +SymbolAccessibility.Accessible.value ] = typeof SymbolAccessibility[ +SymbolAccessibility.Accessible.value ] !== 'number' ? named( 'Accessible' ) : SymbolAccessibility[ +SymbolAccessibility.Accessible.value ];
SymbolAccessibility.NotAccessible = wrapped( 'NotAccessible', 2 );
SymbolAccessibility[ +SymbolAccessibility.NotAccessible.value ] = typeof SymbolAccessibility[ +SymbolAccessibility.NotAccessible.value ] !== 'number' ? named( 'NotAccessible' ) : SymbolAccessibility[ +SymbolAccessibility.NotAccessible.value ];
SymbolAccessibility.CannotBeNamed = wrapped( 'CannotBeNamed', 3 );
SymbolAccessibility[ +SymbolAccessibility.CannotBeNamed.value ] = typeof SymbolAccessibility[ +SymbolAccessibility.CannotBeNamed.value ] !== 'number' ? named( 'CannotBeNamed' ) : SymbolAccessibility[ +SymbolAccessibility.CannotBeNamed.value ];

SymbolAccessibility = Object.create( templ(), SymbolAccessibility );
Object.getPrototypeOf( SymbolAccessibility ).asString = asString( SymbolAccessibility );

/** *********************************************************************************************************************
 * @enum
 * @name SyntheticSymbolKind
 ************************************************************************************************************************/
let SyntheticSymbolKind = {}; // Object.create( ( () => new ( function SyntheticSymbolKind() {} )() )(), {} );
SyntheticSymbolKind.UnionOrIntersection = wrapped( 'UnionOrIntersection', 1 );
SyntheticSymbolKind[ +SyntheticSymbolKind.UnionOrIntersection.value ] = typeof SyntheticSymbolKind[ +SyntheticSymbolKind.UnionOrIntersection.value ] !== 'number' ? named( 'UnionOrIntersection' ) : SyntheticSymbolKind[ +SyntheticSymbolKind.UnionOrIntersection.value ];
SyntheticSymbolKind.Spread = wrapped( 'Spread', 2 );
SyntheticSymbolKind[ +SyntheticSymbolKind.Spread.value ] = typeof SyntheticSymbolKind[ +SyntheticSymbolKind.Spread.value ] !== 'number' ? named( 'Spread' ) : SyntheticSymbolKind[ +SyntheticSymbolKind.Spread.value ];

SyntheticSymbolKind = Object.create( templ(), SyntheticSymbolKind );
Object.getPrototypeOf( SyntheticSymbolKind ).asString = asString( SyntheticSymbolKind );

/** *********************************************************************************************************************
 * @enum
 * @name TypePredicateKind
 ************************************************************************************************************************/
let TypePredicateKind = {}; // Object.create( ( () => new ( function TypePredicateKind() {} )() )(), {} );
TypePredicateKind.This = wrapped( 'This', 1 );
TypePredicateKind[ +TypePredicateKind.This.value ] = typeof TypePredicateKind[ +TypePredicateKind.This.value ] !== 'number' ? named( 'This' ) : TypePredicateKind[ +TypePredicateKind.This.value ];
TypePredicateKind.Identifier = wrapped( 'Identifier', 2 );
TypePredicateKind[ +TypePredicateKind.Identifier.value ] = typeof TypePredicateKind[ +TypePredicateKind.Identifier.value ] !== 'number' ? named( 'Identifier' ) : TypePredicateKind[ +TypePredicateKind.Identifier.value ];

TypePredicateKind = Object.create( templ(), TypePredicateKind );
Object.getPrototypeOf( TypePredicateKind ).asString = asString( TypePredicateKind );

/** *********************************************************************************************************************
 * @enum
 * @name SymbolFlags
 ************************************************************************************************************************/
let SymbolFlags = {}; // Object.create( ( () => new ( function SymbolFlags() {} )() )(), {} );
SymbolFlags.None = wrapped( 'None', 0 );
SymbolFlags[ +SymbolFlags.None.value ] = typeof SymbolFlags[ +SymbolFlags.None.value ] !== 'number' ? named( 'None' ) : SymbolFlags[ +SymbolFlags.None.value ];
SymbolFlags.FunctionScopedVariable = wrapped( 'FunctionScopedVariable', 1 << 0 );
SymbolFlags[ +SymbolFlags.FunctionScopedVariable.value ] = typeof SymbolFlags[ +SymbolFlags.FunctionScopedVariable.value ] !== 'number' ? named( 'FunctionScopedVariable' ) : SymbolFlags[ +SymbolFlags.FunctionScopedVariable.value ];
SymbolFlags.BlockScopedVariable = wrapped( 'BlockScopedVariable', 1 << 1 );
SymbolFlags[ +SymbolFlags.BlockScopedVariable.value ] = typeof SymbolFlags[ +SymbolFlags.BlockScopedVariable.value ] !== 'number' ? named( 'BlockScopedVariable' ) : SymbolFlags[ +SymbolFlags.BlockScopedVariable.value ];
SymbolFlags.Property = wrapped( 'Property', 1 << 2 );
SymbolFlags[ +SymbolFlags.Property.value ] = typeof SymbolFlags[ +SymbolFlags.Property.value ] !== 'number' ? named( 'Property' ) : SymbolFlags[ +SymbolFlags.Property.value ];
SymbolFlags.EnumMember = wrapped( 'EnumMember', 1 << 3 );
SymbolFlags[ +SymbolFlags.EnumMember.value ] = typeof SymbolFlags[ +SymbolFlags.EnumMember.value ] !== 'number' ? named( 'EnumMember' ) : SymbolFlags[ +SymbolFlags.EnumMember.value ];
SymbolFlags.Function = wrapped( 'Function', 1 << 4 );
SymbolFlags[ +SymbolFlags.Function.value ] = typeof SymbolFlags[ +SymbolFlags.Function.value ] !== 'number' ? named( 'Function' ) : SymbolFlags[ +SymbolFlags.Function.value ];
SymbolFlags.Class = wrapped( 'Class', 1 << 5 );
SymbolFlags[ +SymbolFlags.Class.value ] = typeof SymbolFlags[ +SymbolFlags.Class.value ] !== 'number' ? named( 'Class' ) : SymbolFlags[ +SymbolFlags.Class.value ];
SymbolFlags.Interface = wrapped( 'Interface', 1 << 6 );
SymbolFlags[ +SymbolFlags.Interface.value ] = typeof SymbolFlags[ +SymbolFlags.Interface.value ] !== 'number' ? named( 'Interface' ) : SymbolFlags[ +SymbolFlags.Interface.value ];
SymbolFlags.ConstEnum = wrapped( 'ConstEnum', 1 << 7 );
SymbolFlags[ +SymbolFlags.ConstEnum.value ] = typeof SymbolFlags[ +SymbolFlags.ConstEnum.value ] !== 'number' ? named( 'ConstEnum' ) : SymbolFlags[ +SymbolFlags.ConstEnum.value ];
SymbolFlags.RegularEnum = wrapped( 'RegularEnum', 1 << 8 );
SymbolFlags[ +SymbolFlags.RegularEnum.value ] = typeof SymbolFlags[ +SymbolFlags.RegularEnum.value ] !== 'number' ? named( 'RegularEnum' ) : SymbolFlags[ +SymbolFlags.RegularEnum.value ];
SymbolFlags.ValueModule = wrapped( 'ValueModule', 1 << 9 );
SymbolFlags[ +SymbolFlags.ValueModule.value ] = typeof SymbolFlags[ +SymbolFlags.ValueModule.value ] !== 'number' ? named( 'ValueModule' ) : SymbolFlags[ +SymbolFlags.ValueModule.value ];
SymbolFlags.NamespaceModule = wrapped( 'NamespaceModule', 1 << 10 );
SymbolFlags[ +SymbolFlags.NamespaceModule.value ] = typeof SymbolFlags[ +SymbolFlags.NamespaceModule.value ] !== 'number' ? named( 'NamespaceModule' ) : SymbolFlags[ +SymbolFlags.NamespaceModule.value ];
SymbolFlags.TypeLiteral = wrapped( 'TypeLiteral', 1 << 11 );
SymbolFlags[ +SymbolFlags.TypeLiteral.value ] = typeof SymbolFlags[ +SymbolFlags.TypeLiteral.value ] !== 'number' ? named( 'TypeLiteral' ) : SymbolFlags[ +SymbolFlags.TypeLiteral.value ];
SymbolFlags.ObjectLiteral = wrapped( 'ObjectLiteral', 1 << 12 );
SymbolFlags[ +SymbolFlags.ObjectLiteral.value ] = typeof SymbolFlags[ +SymbolFlags.ObjectLiteral.value ] !== 'number' ? named( 'ObjectLiteral' ) : SymbolFlags[ +SymbolFlags.ObjectLiteral.value ];
SymbolFlags.Method = wrapped( 'Method', 1 << 13 );
SymbolFlags[ +SymbolFlags.Method.value ] = typeof SymbolFlags[ +SymbolFlags.Method.value ] !== 'number' ? named( 'Method' ) : SymbolFlags[ +SymbolFlags.Method.value ];
SymbolFlags.Constructor = wrapped( 'Constructor', 1 << 14 );
SymbolFlags[ +SymbolFlags.Constructor.value ] = typeof SymbolFlags[ +SymbolFlags.Constructor.value ] !== 'number' ? named( 'Constructor' ) : SymbolFlags[ +SymbolFlags.Constructor.value ];
SymbolFlags.GetAccessor = wrapped( 'GetAccessor', 1 << 15 );
SymbolFlags[ +SymbolFlags.GetAccessor.value ] = typeof SymbolFlags[ +SymbolFlags.GetAccessor.value ] !== 'number' ? named( 'GetAccessor' ) : SymbolFlags[ +SymbolFlags.GetAccessor.value ];
SymbolFlags.SetAccessor = wrapped( 'SetAccessor', 1 << 16 );
SymbolFlags[ +SymbolFlags.SetAccessor.value ] = typeof SymbolFlags[ +SymbolFlags.SetAccessor.value ] !== 'number' ? named( 'SetAccessor' ) : SymbolFlags[ +SymbolFlags.SetAccessor.value ];
SymbolFlags.Signature = wrapped( 'Signature', 1 << 17 );
SymbolFlags[ +SymbolFlags.Signature.value ] = typeof SymbolFlags[ +SymbolFlags.Signature.value ] !== 'number' ? named( 'Signature' ) : SymbolFlags[ +SymbolFlags.Signature.value ];
SymbolFlags.TypeParameter = wrapped( 'TypeParameter', 1 << 18 );
SymbolFlags[ +SymbolFlags.TypeParameter.value ] = typeof SymbolFlags[ +SymbolFlags.TypeParameter.value ] !== 'number' ? named( 'TypeParameter' ) : SymbolFlags[ +SymbolFlags.TypeParameter.value ];
SymbolFlags.TypeAlias = wrapped( 'TypeAlias', 1 << 19 );
SymbolFlags[ +SymbolFlags.TypeAlias.value ] = typeof SymbolFlags[ +SymbolFlags.TypeAlias.value ] !== 'number' ? named( 'TypeAlias' ) : SymbolFlags[ +SymbolFlags.TypeAlias.value ];
SymbolFlags.ExportValue = wrapped( 'ExportValue', 1 << 20 );
SymbolFlags[ +SymbolFlags.ExportValue.value ] = typeof SymbolFlags[ +SymbolFlags.ExportValue.value ] !== 'number' ? named( 'ExportValue' ) : SymbolFlags[ +SymbolFlags.ExportValue.value ];
SymbolFlags.Alias = wrapped( 'Alias', 1 << 21 );
SymbolFlags[ +SymbolFlags.Alias.value ] = typeof SymbolFlags[ +SymbolFlags.Alias.value ] !== 'number' ? named( 'Alias' ) : SymbolFlags[ +SymbolFlags.Alias.value ];
SymbolFlags.Prototype = wrapped( 'Prototype', 1 << 22 );
SymbolFlags[ +SymbolFlags.Prototype.value ] = typeof SymbolFlags[ +SymbolFlags.Prototype.value ] !== 'number' ? named( 'Prototype' ) : SymbolFlags[ +SymbolFlags.Prototype.value ];
SymbolFlags.ExportStar = wrapped( 'ExportStar', 1 << 23 );
SymbolFlags[ +SymbolFlags.ExportStar.value ] = typeof SymbolFlags[ +SymbolFlags.ExportStar.value ] !== 'number' ? named( 'ExportStar' ) : SymbolFlags[ +SymbolFlags.ExportStar.value ];
SymbolFlags.Optional = wrapped( 'Optional', 1 << 24 );
SymbolFlags[ +SymbolFlags.Optional.value ] = typeof SymbolFlags[ +SymbolFlags.Optional.value ] !== 'number' ? named( 'Optional' ) : SymbolFlags[ +SymbolFlags.Optional.value ];
SymbolFlags.Transient = wrapped( 'Transient', 1 << 25 );
SymbolFlags[ +SymbolFlags.Transient.value ] = typeof SymbolFlags[ +SymbolFlags.Transient.value ] !== 'number' ? named( 'Transient' ) : SymbolFlags[ +SymbolFlags.Transient.value ];
SymbolFlags.JSContainer = wrapped( 'JSContainer', 1 << 26 );
SymbolFlags[ +SymbolFlags.JSContainer.value ] = typeof SymbolFlags[ +SymbolFlags.JSContainer.value ] !== 'number' ? named( 'JSContainer' ) : SymbolFlags[ +SymbolFlags.JSContainer.value ];
SymbolFlags.All = wrapped( 'All', SymbolFlags.FunctionScopedVariable | SymbolFlags.BlockScopedVariable | SymbolFlags.Property | SymbolFlags.EnumMember | SymbolFlags.Function | SymbolFlags.Class | SymbolFlags.Interface | SymbolFlags.ConstEnum | SymbolFlags.RegularEnum | SymbolFlags.ValueModule | SymbolFlags.NamespaceModule | SymbolFlags.TypeLiteral
            | SymbolFlags.ObjectLiteral | SymbolFlags.Method | SymbolFlags.Constructor | SymbolFlags.GetAccessor | SymbolFlags.SetAccessor | SymbolFlags.Signature | SymbolFlags.TypeParameter | SymbolFlags.TypeAlias | SymbolFlags.ExportValue | SymbolFlags.Alias | SymbolFlags.Prototype | SymbolFlags.ExportStar | SymbolFlags.Optional | SymbolFlags.Transient );
SymbolFlags[ +SymbolFlags.All.value ] = typeof SymbolFlags[ +SymbolFlags.All.value ] !== 'number' ? named( 'All' ) : SymbolFlags[ +SymbolFlags.All.value ];
SymbolFlags.Enum = wrapped( 'Enum', SymbolFlags.RegularEnum | SymbolFlags.ConstEnum );
SymbolFlags[ +SymbolFlags.Enum.value ] = typeof SymbolFlags[ +SymbolFlags.Enum.value ] !== 'number' ? named( 'Enum' ) : SymbolFlags[ +SymbolFlags.Enum.value ];
SymbolFlags.Variable = wrapped( 'Variable', SymbolFlags.FunctionScopedVariable | SymbolFlags.BlockScopedVariable );
SymbolFlags[ +SymbolFlags.Variable.value ] = typeof SymbolFlags[ +SymbolFlags.Variable.value ] !== 'number' ? named( 'Variable' ) : SymbolFlags[ +SymbolFlags.Variable.value ];
SymbolFlags.Value = wrapped( 'Value', SymbolFlags.Variable | SymbolFlags.Property | SymbolFlags.EnumMember | SymbolFlags.Function | SymbolFlags.Class | SymbolFlags.Enum | SymbolFlags.ValueModule | SymbolFlags.Method | SymbolFlags.GetAccessor | SymbolFlags.SetAccessor );
SymbolFlags[ +SymbolFlags.Value.value ] = typeof SymbolFlags[ +SymbolFlags.Value.value ] !== 'number' ? named( 'Value' ) : SymbolFlags[ +SymbolFlags.Value.value ];
SymbolFlags.Type = wrapped( 'Type', SymbolFlags.Class | SymbolFlags.Interface | SymbolFlags.Enum | SymbolFlags.EnumMember | SymbolFlags.TypeLiteral | SymbolFlags.ObjectLiteral | SymbolFlags.TypeParameter | SymbolFlags.TypeAlias );
SymbolFlags[ +SymbolFlags.Type.value ] = typeof SymbolFlags[ +SymbolFlags.Type.value ] !== 'number' ? named( 'Type' ) : SymbolFlags[ +SymbolFlags.Type.value ];
SymbolFlags.Namespace = wrapped( 'Namespace', SymbolFlags.ValueModule | SymbolFlags.NamespaceModule | SymbolFlags.Enum );
SymbolFlags[ +SymbolFlags.Namespace.value ] = typeof SymbolFlags[ +SymbolFlags.Namespace.value ] !== 'number' ? named( 'Namespace' ) : SymbolFlags[ +SymbolFlags.Namespace.value ];
SymbolFlags.Module = wrapped( 'Module', SymbolFlags.ValueModule | SymbolFlags.NamespaceModule );
SymbolFlags[ +SymbolFlags.Module.value ] = typeof SymbolFlags[ +SymbolFlags.Module.value ] !== 'number' ? named( 'Module' ) : SymbolFlags[ +SymbolFlags.Module.value ];
SymbolFlags.Accessor = wrapped( 'Accessor', SymbolFlags.GetAccessor | SymbolFlags.SetAccessor );
SymbolFlags[ +SymbolFlags.Accessor.value ] = typeof SymbolFlags[ +SymbolFlags.Accessor.value ] !== 'number' ? named( 'Accessor' ) : SymbolFlags[ +SymbolFlags.Accessor.value ];
SymbolFlags.FunctionScopedVariableExcludes = wrapped( 'FunctionScopedVariableExcludes', SymbolFlags.Value & ~SymbolFlags.FunctionScopedVariable );
SymbolFlags[ +SymbolFlags.FunctionScopedVariableExcludes.value ] = typeof SymbolFlags[ +SymbolFlags.FunctionScopedVariableExcludes.value ] !== 'number' ? named( 'FunctionScopedVariableExcludes' ) : SymbolFlags[ +SymbolFlags.FunctionScopedVariableExcludes.value ];
SymbolFlags.BlockScopedVariableExcludes = wrapped( 'BlockScopedVariableExcludes', +SymbolFlags.Value );
SymbolFlags[ +SymbolFlags.BlockScopedVariableExcludes.value ] = typeof SymbolFlags[ +SymbolFlags.BlockScopedVariableExcludes.value ] !== 'number' ? named( 'BlockScopedVariableExcludes' ) : SymbolFlags[ +SymbolFlags.BlockScopedVariableExcludes.value ];
SymbolFlags.ParameterExcludes = wrapped( 'ParameterExcludes', +SymbolFlags.Value );
SymbolFlags[ +SymbolFlags.ParameterExcludes.value ] = typeof SymbolFlags[ +SymbolFlags.ParameterExcludes.value ] !== 'number' ? named( 'ParameterExcludes' ) : SymbolFlags[ +SymbolFlags.ParameterExcludes.value ];
SymbolFlags.PropertyExcludes = wrapped( 'PropertyExcludes', +SymbolFlags.None );
SymbolFlags[ +SymbolFlags.PropertyExcludes.value ] = typeof SymbolFlags[ +SymbolFlags.PropertyExcludes.value ] !== 'number' ? named( 'PropertyExcludes' ) : SymbolFlags[ +SymbolFlags.PropertyExcludes.value ];
SymbolFlags.EnumMemberExcludes = wrapped( 'EnumMemberExcludes', SymbolFlags.Value | SymbolFlags.Type );
SymbolFlags[ +SymbolFlags.EnumMemberExcludes.value ] = typeof SymbolFlags[ +SymbolFlags.EnumMemberExcludes.value ] !== 'number' ? named( 'EnumMemberExcludes' ) : SymbolFlags[ +SymbolFlags.EnumMemberExcludes.value ];
SymbolFlags.FunctionExcludes = wrapped( 'FunctionExcludes', SymbolFlags.Value & ~(SymbolFlags.Function | SymbolFlags.ValueModule) );
SymbolFlags[ +SymbolFlags.FunctionExcludes.value ] = typeof SymbolFlags[ +SymbolFlags.FunctionExcludes.value ] !== 'number' ? named( 'FunctionExcludes' ) : SymbolFlags[ +SymbolFlags.FunctionExcludes.value ];
SymbolFlags.ClassExcludes = wrapped( 'ClassExcludes', (SymbolFlags.Value | SymbolFlags.Type) & ~(SymbolFlags.ValueModule | SymbolFlags.Interface) );
SymbolFlags[ +SymbolFlags.ClassExcludes.value ] = typeof SymbolFlags[ +SymbolFlags.ClassExcludes.value ] !== 'number' ? named( 'ClassExcludes' ) : SymbolFlags[ +SymbolFlags.ClassExcludes.value ];
SymbolFlags.InterfaceExcludes = wrapped( 'InterfaceExcludes', SymbolFlags.Type & ~(SymbolFlags.Interface | SymbolFlags.Class) );
SymbolFlags[ +SymbolFlags.InterfaceExcludes.value ] = typeof SymbolFlags[ +SymbolFlags.InterfaceExcludes.value ] !== 'number' ? named( 'InterfaceExcludes' ) : SymbolFlags[ +SymbolFlags.InterfaceExcludes.value ];
SymbolFlags.RegularEnumExcludes = wrapped( 'RegularEnumExcludes', (SymbolFlags.Value | SymbolFlags.Type) & ~(SymbolFlags.RegularEnum | SymbolFlags.ValueModule) );
SymbolFlags[ +SymbolFlags.RegularEnumExcludes.value ] = typeof SymbolFlags[ +SymbolFlags.RegularEnumExcludes.value ] !== 'number' ? named( 'RegularEnumExcludes' ) : SymbolFlags[ +SymbolFlags.RegularEnumExcludes.value ];
SymbolFlags.ConstEnumExcludes = wrapped( 'ConstEnumExcludes', (SymbolFlags.Value | SymbolFlags.Type) & ~SymbolFlags.ConstEnum );
SymbolFlags[ +SymbolFlags.ConstEnumExcludes.value ] = typeof SymbolFlags[ +SymbolFlags.ConstEnumExcludes.value ] !== 'number' ? named( 'ConstEnumExcludes' ) : SymbolFlags[ +SymbolFlags.ConstEnumExcludes.value ];
SymbolFlags.ValueModuleExcludes = wrapped( 'ValueModuleExcludes', SymbolFlags.Value & ~(SymbolFlags.Function | SymbolFlags.Class | SymbolFlags.RegularEnum | SymbolFlags.ValueModule) );
SymbolFlags[ +SymbolFlags.ValueModuleExcludes.value ] = typeof SymbolFlags[ +SymbolFlags.ValueModuleExcludes.value ] !== 'number' ? named( 'ValueModuleExcludes' ) : SymbolFlags[ +SymbolFlags.ValueModuleExcludes.value ];
SymbolFlags.NamespaceModuleExcludes = wrapped( 'NamespaceModuleExcludes', 0 );
SymbolFlags[ +SymbolFlags.NamespaceModuleExcludes.value ] = typeof SymbolFlags[ +SymbolFlags.NamespaceModuleExcludes.value ] !== 'number' ? named( 'NamespaceModuleExcludes' ) : SymbolFlags[ +SymbolFlags.NamespaceModuleExcludes.value ];
SymbolFlags.MethodExcludes = wrapped( 'MethodExcludes', SymbolFlags.Value & ~SymbolFlags.Method );
SymbolFlags[ +SymbolFlags.MethodExcludes.value ] = typeof SymbolFlags[ +SymbolFlags.MethodExcludes.value ] !== 'number' ? named( 'MethodExcludes' ) : SymbolFlags[ +SymbolFlags.MethodExcludes.value ];
SymbolFlags.GetAccessorExcludes = wrapped( 'GetAccessorExcludes', SymbolFlags.Value & ~SymbolFlags.SetAccessor );
SymbolFlags[ +SymbolFlags.GetAccessorExcludes.value ] = typeof SymbolFlags[ +SymbolFlags.GetAccessorExcludes.value ] !== 'number' ? named( 'GetAccessorExcludes' ) : SymbolFlags[ +SymbolFlags.GetAccessorExcludes.value ];
SymbolFlags.SetAccessorExcludes = wrapped( 'SetAccessorExcludes', SymbolFlags.Value & ~SymbolFlags.GetAccessor );
SymbolFlags[ +SymbolFlags.SetAccessorExcludes.value ] = typeof SymbolFlags[ +SymbolFlags.SetAccessorExcludes.value ] !== 'number' ? named( 'SetAccessorExcludes' ) : SymbolFlags[ +SymbolFlags.SetAccessorExcludes.value ];
SymbolFlags.TypeParameterExcludes = wrapped( 'TypeParameterExcludes', SymbolFlags.Type & ~SymbolFlags.TypeParameter );
SymbolFlags[ +SymbolFlags.TypeParameterExcludes.value ] = typeof SymbolFlags[ +SymbolFlags.TypeParameterExcludes.value ] !== 'number' ? named( 'TypeParameterExcludes' ) : SymbolFlags[ +SymbolFlags.TypeParameterExcludes.value ];
SymbolFlags.TypeAliasExcludes = wrapped( 'TypeAliasExcludes', +SymbolFlags.Type );
SymbolFlags[ +SymbolFlags.TypeAliasExcludes.value ] = typeof SymbolFlags[ +SymbolFlags.TypeAliasExcludes.value ] !== 'number' ? named( 'TypeAliasExcludes' ) : SymbolFlags[ +SymbolFlags.TypeAliasExcludes.value ];
SymbolFlags.AliasExcludes = wrapped( 'AliasExcludes', +SymbolFlags.Alias );
SymbolFlags[ +SymbolFlags.AliasExcludes.value ] = typeof SymbolFlags[ +SymbolFlags.AliasExcludes.value ] !== 'number' ? named( 'AliasExcludes' ) : SymbolFlags[ +SymbolFlags.AliasExcludes.value ];
SymbolFlags.ModuleMember = wrapped( 'ModuleMember', SymbolFlags.Variable | SymbolFlags.Function | SymbolFlags.Class | SymbolFlags.Interface | SymbolFlags.Enum | SymbolFlags.Module | SymbolFlags.TypeAlias | SymbolFlags.Alias );
SymbolFlags[ +SymbolFlags.ModuleMember.value ] = typeof SymbolFlags[ +SymbolFlags.ModuleMember.value ] !== 'number' ? named( 'ModuleMember' ) : SymbolFlags[ +SymbolFlags.ModuleMember.value ];
SymbolFlags.ExportHasLocal = wrapped( 'ExportHasLocal', SymbolFlags.Function | SymbolFlags.Class | SymbolFlags.Enum | SymbolFlags.ValueModule );
SymbolFlags[ +SymbolFlags.ExportHasLocal.value ] = typeof SymbolFlags[ +SymbolFlags.ExportHasLocal.value ] !== 'number' ? named( 'ExportHasLocal' ) : SymbolFlags[ +SymbolFlags.ExportHasLocal.value ];
SymbolFlags.HasExports = wrapped( 'HasExports', SymbolFlags.Class | SymbolFlags.Enum | SymbolFlags.Module );
SymbolFlags[ +SymbolFlags.HasExports.value ] = typeof SymbolFlags[ +SymbolFlags.HasExports.value ] !== 'number' ? named( 'HasExports' ) : SymbolFlags[ +SymbolFlags.HasExports.value ];
SymbolFlags.HasMembers = wrapped( 'HasMembers', SymbolFlags.Class | SymbolFlags.Interface | SymbolFlags.TypeLiteral | SymbolFlags.ObjectLiteral );
SymbolFlags[ +SymbolFlags.HasMembers.value ] = typeof SymbolFlags[ +SymbolFlags.HasMembers.value ] !== 'number' ? named( 'HasMembers' ) : SymbolFlags[ +SymbolFlags.HasMembers.value ];
SymbolFlags.BlockScoped = wrapped( 'BlockScoped', SymbolFlags.BlockScopedVariable | SymbolFlags.Class | SymbolFlags.Enum );
SymbolFlags[ +SymbolFlags.BlockScoped.value ] = typeof SymbolFlags[ +SymbolFlags.BlockScoped.value ] !== 'number' ? named( 'BlockScoped' ) : SymbolFlags[ +SymbolFlags.BlockScoped.value ];
SymbolFlags.PropertyOrAccessor = wrapped( 'PropertyOrAccessor', SymbolFlags.Property | SymbolFlags.Accessor );
SymbolFlags[ +SymbolFlags.PropertyOrAccessor.value ] = typeof SymbolFlags[ +SymbolFlags.PropertyOrAccessor.value ] !== 'number' ? named( 'PropertyOrAccessor' ) : SymbolFlags[ +SymbolFlags.PropertyOrAccessor.value ];
SymbolFlags.ClassMember = wrapped( 'ClassMember', SymbolFlags.Method | SymbolFlags.Accessor | SymbolFlags.Property );
SymbolFlags[ +SymbolFlags.ClassMember.value ] = typeof SymbolFlags[ +SymbolFlags.ClassMember.value ] !== 'number' ? named( 'ClassMember' ) : SymbolFlags[ +SymbolFlags.ClassMember.value ];
SymbolFlags.Classifiable = wrapped( 'Classifiable', SymbolFlags.Class | SymbolFlags.Enum | SymbolFlags.TypeAlias | SymbolFlags.Interface | SymbolFlags.TypeParameter | SymbolFlags.Module | SymbolFlags.Alias );
SymbolFlags[ +SymbolFlags.Classifiable.value ] = typeof SymbolFlags[ +SymbolFlags.Classifiable.value ] !== 'number' ? named( 'Classifiable' ) : SymbolFlags[ +SymbolFlags.Classifiable.value ];
SymbolFlags.LateBindingContainer = wrapped( 'LateBindingContainer', SymbolFlags.Class | SymbolFlags.Interface | SymbolFlags.TypeLiteral | SymbolFlags.ObjectLiteral );
SymbolFlags[ +SymbolFlags.LateBindingContainer.value ] = typeof SymbolFlags[ +SymbolFlags.LateBindingContainer.value ] !== 'number' ? named( 'LateBindingContainer' ) : SymbolFlags[ +SymbolFlags.LateBindingContainer.value ];

let tmp;
SymbolFlags = Object.create( tmp = templ(), SymbolFlags );
Object.getPrototypeOf( SymbolFlags ).asString = asString( SymbolFlags );
tmp.create = val => {
    const c = Object.create( tmp, SymbolFlags );
    c[ VALUE ] = +val;
    return c;
};


/** *********************************************************************************************************************
 * @enum
 * @name EnumKind
 ************************************************************************************************************************/
let EnumKind = {}; // Object.create( ( () => new ( function EnumKind() {} )() )(), {} );
EnumKind.Numeric = wrapped( 'Numeric', 1 );
EnumKind[ +EnumKind.Numeric.value ] = typeof EnumKind[ +EnumKind.Numeric.value ] !== 'number' ? named( 'Numeric' ) : EnumKind[ +EnumKind.Numeric.value ];

EnumKind = Object.create( templ(), EnumKind );
Object.getPrototypeOf( EnumKind ).asString = asString( EnumKind );

/** *********************************************************************************************************************
 * @enum
 * @name CheckFlags
 ************************************************************************************************************************/
let CheckFlags = {}; // Object.create( ( () => new ( function CheckFlags() {} )() )(), {} );
CheckFlags.Instantiated = wrapped( 'Instantiated', 1 << 0 );
CheckFlags[ +CheckFlags.Instantiated.value ] = typeof CheckFlags[ +CheckFlags.Instantiated.value ] !== 'number' ? named( 'Instantiated' ) : CheckFlags[ +CheckFlags.Instantiated.value ];
CheckFlags.SyntheticProperty = wrapped( 'SyntheticProperty', 1 << 1 );
CheckFlags[ +CheckFlags.SyntheticProperty.value ] = typeof CheckFlags[ +CheckFlags.SyntheticProperty.value ] !== 'number' ? named( 'SyntheticProperty' ) : CheckFlags[ +CheckFlags.SyntheticProperty.value ];
CheckFlags.SyntheticMethod = wrapped( 'SyntheticMethod', 1 << 2 );
CheckFlags[ +CheckFlags.SyntheticMethod.value ] = typeof CheckFlags[ +CheckFlags.SyntheticMethod.value ] !== 'number' ? named( 'SyntheticMethod' ) : CheckFlags[ +CheckFlags.SyntheticMethod.value ];
CheckFlags.Readonly = wrapped( 'Readonly', 1 << 3 );
CheckFlags[ +CheckFlags.Readonly.value ] = typeof CheckFlags[ +CheckFlags.Readonly.value ] !== 'number' ? named( 'Readonly' ) : CheckFlags[ +CheckFlags.Readonly.value ];
CheckFlags.Partial = wrapped( 'Partial', 1 << 4 );
CheckFlags[ +CheckFlags.Partial.value ] = typeof CheckFlags[ +CheckFlags.Partial.value ] !== 'number' ? named( 'Partial' ) : CheckFlags[ +CheckFlags.Partial.value ];
CheckFlags.HasNonUniformType = wrapped( 'HasNonUniformType', 1 << 5 );
CheckFlags[ +CheckFlags.HasNonUniformType.value ] = typeof CheckFlags[ +CheckFlags.HasNonUniformType.value ] !== 'number' ? named( 'HasNonUniformType' ) : CheckFlags[ +CheckFlags.HasNonUniformType.value ];
CheckFlags.ContainsPublic = wrapped( 'ContainsPublic', 1 << 6 );
CheckFlags[ +CheckFlags.ContainsPublic.value ] = typeof CheckFlags[ +CheckFlags.ContainsPublic.value ] !== 'number' ? named( 'ContainsPublic' ) : CheckFlags[ +CheckFlags.ContainsPublic.value ];
CheckFlags.ContainsProtected = wrapped( 'ContainsProtected', 1 << 7 );
CheckFlags[ +CheckFlags.ContainsProtected.value ] = typeof CheckFlags[ +CheckFlags.ContainsProtected.value ] !== 'number' ? named( 'ContainsProtected' ) : CheckFlags[ +CheckFlags.ContainsProtected.value ];
CheckFlags.ContainsPrivate = wrapped( 'ContainsPrivate', 1 << 8 );
CheckFlags[ +CheckFlags.ContainsPrivate.value ] = typeof CheckFlags[ +CheckFlags.ContainsPrivate.value ] !== 'number' ? named( 'ContainsPrivate' ) : CheckFlags[ +CheckFlags.ContainsPrivate.value ];
CheckFlags.ContainsStatic = wrapped( 'ContainsStatic', 1 << 9 );
CheckFlags[ +CheckFlags.ContainsStatic.value ] = typeof CheckFlags[ +CheckFlags.ContainsStatic.value ] !== 'number' ? named( 'ContainsStatic' ) : CheckFlags[ +CheckFlags.ContainsStatic.value ];
CheckFlags.Late = wrapped( 'Late', 1 << 10 );
CheckFlags[ +CheckFlags.Late.value ] = typeof CheckFlags[ +CheckFlags.Late.value ] !== 'number' ? named( 'Late' ) : CheckFlags[ +CheckFlags.Late.value ];
CheckFlags.ReverseMapped = wrapped( 'ReverseMapped', 1 << 11 );
CheckFlags[ +CheckFlags.ReverseMapped.value ] = typeof CheckFlags[ +CheckFlags.ReverseMapped.value ] !== 'number' ? named( 'ReverseMapped' ) : CheckFlags[ +CheckFlags.ReverseMapped.value ];
CheckFlags.Synthetic = wrapped( 'Synthetic', CheckFlags.SyntheticProperty | CheckFlags.SyntheticMethod );
CheckFlags[ +CheckFlags.Synthetic.value ] = typeof CheckFlags[ +CheckFlags.Synthetic.value ] !== 'number' ? named( 'Synthetic' ) : CheckFlags[ +CheckFlags.Synthetic.value ];

CheckFlags = Object.create( templ(), CheckFlags );
Object.getPrototypeOf( CheckFlags ).asString = asString( CheckFlags );

/** *********************************************************************************************************************
 * @enum
 * @name InternalSymbolName
 ************************************************************************************************************************/
let InternalSymbolName = {}; // Object.create( ( () => new ( function InternalSymbolName() {} )() )(), {} );
InternalSymbolName.Call = wrapped( 'Call', "__call" );
InternalSymbolName[ +InternalSymbolName.Call.value ] = typeof InternalSymbolName[ +InternalSymbolName.Call.value ] !== 'number' ? named( 'Call' ) : InternalSymbolName[ +InternalSymbolName.Call.value ];
InternalSymbolName.Constructor = wrapped( 'Constructor', "__constructor" );
InternalSymbolName[ +InternalSymbolName.Constructor.value ] = typeof InternalSymbolName[ +InternalSymbolName.Constructor.value ] !== 'number' ? named( 'Constructor' ) : InternalSymbolName[ +InternalSymbolName.Constructor.value ];
InternalSymbolName.New = wrapped( 'New', "__new" );
InternalSymbolName[ +InternalSymbolName.New.value ] = typeof InternalSymbolName[ +InternalSymbolName.New.value ] !== 'number' ? named( 'New' ) : InternalSymbolName[ +InternalSymbolName.New.value ];
InternalSymbolName.Index = wrapped( 'Index', "__index" );
InternalSymbolName[ +InternalSymbolName.Index.value ] = typeof InternalSymbolName[ +InternalSymbolName.Index.value ] !== 'number' ? named( 'Index' ) : InternalSymbolName[ +InternalSymbolName.Index.value ];
InternalSymbolName.ExportStar = wrapped( 'ExportStar', "__export" );
InternalSymbolName[ +InternalSymbolName.ExportStar.value ] = typeof InternalSymbolName[ +InternalSymbolName.ExportStar.value ] !== 'number' ? named( 'ExportStar' ) : InternalSymbolName[ +InternalSymbolName.ExportStar.value ];
InternalSymbolName.Global = wrapped( 'Global', "__global" );
InternalSymbolName[ +InternalSymbolName.Global.value ] = typeof InternalSymbolName[ +InternalSymbolName.Global.value ] !== 'number' ? named( 'Global' ) : InternalSymbolName[ +InternalSymbolName.Global.value ];
InternalSymbolName.Missing = wrapped( 'Missing', "__missing" );
InternalSymbolName[ +InternalSymbolName.Missing.value ] = typeof InternalSymbolName[ +InternalSymbolName.Missing.value ] !== 'number' ? named( 'Missing' ) : InternalSymbolName[ +InternalSymbolName.Missing.value ];
InternalSymbolName.Type = wrapped( 'Type', "__type" );
InternalSymbolName[ +InternalSymbolName.Type.value ] = typeof InternalSymbolName[ +InternalSymbolName.Type.value ] !== 'number' ? named( 'Type' ) : InternalSymbolName[ +InternalSymbolName.Type.value ];
InternalSymbolName.Object = wrapped( 'Object', "__object" );
InternalSymbolName[ +InternalSymbolName.Object.value ] = typeof InternalSymbolName[ +InternalSymbolName.Object.value ] !== 'number' ? named( 'Object' ) : InternalSymbolName[ +InternalSymbolName.Object.value ];
InternalSymbolName.JSXAttributes = wrapped( 'JSXAttributes', "__jsxInternalSymbolName.Attributes" );
InternalSymbolName[ +InternalSymbolName.JSXAttributes.value ] = typeof InternalSymbolName[ +InternalSymbolName.JSXAttributes.value ] !== 'number' ? named( 'JSXAttributes' ) : InternalSymbolName[ +InternalSymbolName.JSXAttributes.value ];
InternalSymbolName.Class = wrapped( 'Class', "__class" );
InternalSymbolName[ +InternalSymbolName.Class.value ] = typeof InternalSymbolName[ +InternalSymbolName.Class.value ] !== 'number' ? named( 'Class' ) : InternalSymbolName[ +InternalSymbolName.Class.value ];
InternalSymbolName.Function = wrapped( 'Function', "__function" );
InternalSymbolName[ +InternalSymbolName.Function.value ] = typeof InternalSymbolName[ +InternalSymbolName.Function.value ] !== 'number' ? named( 'Function' ) : InternalSymbolName[ +InternalSymbolName.Function.value ];
InternalSymbolName.Computed = wrapped( 'Computed', "__computed" );
InternalSymbolName[ +InternalSymbolName.Computed.value ] = typeof InternalSymbolName[ +InternalSymbolName.Computed.value ] !== 'number' ? named( 'Computed' ) : InternalSymbolName[ +InternalSymbolName.Computed.value ];
InternalSymbolName.Resolving = wrapped( 'Resolving', "__resolving__" );
InternalSymbolName[ +InternalSymbolName.Resolving.value ] = typeof InternalSymbolName[ +InternalSymbolName.Resolving.value ] !== 'number' ? named( 'Resolving' ) : InternalSymbolName[ +InternalSymbolName.Resolving.value ];
InternalSymbolName.ExportEquals = wrapped( 'ExportEquals', "export=" );
InternalSymbolName[ +InternalSymbolName.ExportEquals.value ] = typeof InternalSymbolName[ +InternalSymbolName.ExportEquals.value ] !== 'number' ? named( 'ExportEquals' ) : InternalSymbolName[ +InternalSymbolName.ExportEquals.value ];
InternalSymbolName.Default = wrapped( 'Default', "default" );
InternalSymbolName[ +InternalSymbolName.Default.value ] = typeof InternalSymbolName[ +InternalSymbolName.Default.value ] !== 'number' ? named( 'Default' ) : InternalSymbolName[ +InternalSymbolName.Default.value ];

InternalSymbolName = Object.create( templ(), InternalSymbolName );
Object.getPrototypeOf( InternalSymbolName ).asString = asString( InternalSymbolName );

/** *********************************************************************************************************************
 * @enum
 * @name NodeCheckFlags
 ************************************************************************************************************************/
let NodeCheckFlags = {}; // Object.create( ( () => new ( function NodeCheckFlags() {} )() )(), {} );
NodeCheckFlags.TypeChecked = wrapped( 'TypeChecked', 0x00000001 );
NodeCheckFlags[ +NodeCheckFlags.TypeChecked.value ] = typeof NodeCheckFlags[ +NodeCheckFlags.TypeChecked.value ] !== 'number' ? named( 'TypeChecked' ) : NodeCheckFlags[ +NodeCheckFlags.TypeChecked.value ];
NodeCheckFlags.LexicalThis = wrapped( 'LexicalThis', 0x00000002 );
NodeCheckFlags[ +NodeCheckFlags.LexicalThis.value ] = typeof NodeCheckFlags[ +NodeCheckFlags.LexicalThis.value ] !== 'number' ? named( 'LexicalThis' ) : NodeCheckFlags[ +NodeCheckFlags.LexicalThis.value ];
NodeCheckFlags.CaptureThis = wrapped( 'CaptureThis', 0x00000004 );
NodeCheckFlags[ +NodeCheckFlags.CaptureThis.value ] = typeof NodeCheckFlags[ +NodeCheckFlags.CaptureThis.value ] !== 'number' ? named( 'CaptureThis' ) : NodeCheckFlags[ +NodeCheckFlags.CaptureThis.value ];
NodeCheckFlags.CaptureNewTarget = wrapped( 'CaptureNewTarget', 0x00000008 );
NodeCheckFlags[ +NodeCheckFlags.CaptureNewTarget.value ] = typeof NodeCheckFlags[ +NodeCheckFlags.CaptureNewTarget.value ] !== 'number' ? named( 'CaptureNewTarget' ) : NodeCheckFlags[ +NodeCheckFlags.CaptureNewTarget.value ];
NodeCheckFlags.SuperInstance = wrapped( 'SuperInstance', 0x00000100 );
NodeCheckFlags[ +NodeCheckFlags.SuperInstance.value ] = typeof NodeCheckFlags[ +NodeCheckFlags.SuperInstance.value ] !== 'number' ? named( 'SuperInstance' ) : NodeCheckFlags[ +NodeCheckFlags.SuperInstance.value ];
NodeCheckFlags.SuperStatic = wrapped( 'SuperStatic', 0x00000200 );
NodeCheckFlags[ +NodeCheckFlags.SuperStatic.value ] = typeof NodeCheckFlags[ +NodeCheckFlags.SuperStatic.value ] !== 'number' ? named( 'SuperStatic' ) : NodeCheckFlags[ +NodeCheckFlags.SuperStatic.value ];
NodeCheckFlags.ContextChecked = wrapped( 'ContextChecked', 0x00000400 );
NodeCheckFlags[ +NodeCheckFlags.ContextChecked.value ] = typeof NodeCheckFlags[ +NodeCheckFlags.ContextChecked.value ] !== 'number' ? named( 'ContextChecked' ) : NodeCheckFlags[ +NodeCheckFlags.ContextChecked.value ];
NodeCheckFlags.AsyncMethodWithSuper = wrapped( 'AsyncMethodWithSuper', 0x00000800 );
NodeCheckFlags[ +NodeCheckFlags.AsyncMethodWithSuper.value ] = typeof NodeCheckFlags[ +NodeCheckFlags.AsyncMethodWithSuper.value ] !== 'number' ? named( 'AsyncMethodWithSuper' ) : NodeCheckFlags[ +NodeCheckFlags.AsyncMethodWithSuper.value ];
NodeCheckFlags.AsyncMethodWithSuperBinding = wrapped( 'AsyncMethodWithSuperBinding', 0x00001000 );
NodeCheckFlags[ +NodeCheckFlags.AsyncMethodWithSuperBinding.value ] = typeof NodeCheckFlags[ +NodeCheckFlags.AsyncMethodWithSuperBinding.value ] !== 'number' ? named( 'AsyncMethodWithSuperBinding' ) : NodeCheckFlags[ +NodeCheckFlags.AsyncMethodWithSuperBinding.value ];
NodeCheckFlags.CaptureArguments = wrapped( 'CaptureArguments', 0x00002000 );
NodeCheckFlags[ +NodeCheckFlags.CaptureArguments.value ] = typeof NodeCheckFlags[ +NodeCheckFlags.CaptureArguments.value ] !== 'number' ? named( 'CaptureArguments' ) : NodeCheckFlags[ +NodeCheckFlags.CaptureArguments.value ];
NodeCheckFlags.EnumValuesComputed = wrapped( 'EnumValuesComputed', 0x00004000 );
NodeCheckFlags[ +NodeCheckFlags.EnumValuesComputed.value ] = typeof NodeCheckFlags[ +NodeCheckFlags.EnumValuesComputed.value ] !== 'number' ? named( 'EnumValuesComputed' ) : NodeCheckFlags[ +NodeCheckFlags.EnumValuesComputed.value ];
NodeCheckFlags.LexicalModuleMergesWithClass = wrapped( 'LexicalModuleMergesWithClass', 0x00008000 );
NodeCheckFlags[ +NodeCheckFlags.LexicalModuleMergesWithClass.value ] = typeof NodeCheckFlags[ +NodeCheckFlags.LexicalModuleMergesWithClass.value ] !== 'number' ? named( 'LexicalModuleMergesWithClass' ) : NodeCheckFlags[ +NodeCheckFlags.LexicalModuleMergesWithClass.value ];
NodeCheckFlags.LoopWithCapturedBlockScopedBinding = wrapped( 'LoopWithCapturedBlockScopedBinding', 0x00010000 );
NodeCheckFlags[ +NodeCheckFlags.LoopWithCapturedBlockScopedBinding.value ] = typeof NodeCheckFlags[ +NodeCheckFlags.LoopWithCapturedBlockScopedBinding.value ] !== 'number' ? named( 'LoopWithCapturedBlockScopedBinding' ) : NodeCheckFlags[ +NodeCheckFlags.LoopWithCapturedBlockScopedBinding.value ];
NodeCheckFlags.CapturedBlockScopedBinding = wrapped( 'CapturedBlockScopedBinding', 0x00020000 );
NodeCheckFlags[ +NodeCheckFlags.CapturedBlockScopedBinding.value ] = typeof NodeCheckFlags[ +NodeCheckFlags.CapturedBlockScopedBinding.value ] !== 'number' ? named( 'CapturedBlockScopedBinding' ) : NodeCheckFlags[ +NodeCheckFlags.CapturedBlockScopedBinding.value ];
NodeCheckFlags.BlockScopedBindingInLoop = wrapped( 'BlockScopedBindingInLoop', 0x00040000 );
NodeCheckFlags[ +NodeCheckFlags.BlockScopedBindingInLoop.value ] = typeof NodeCheckFlags[ +NodeCheckFlags.BlockScopedBindingInLoop.value ] !== 'number' ? named( 'BlockScopedBindingInLoop' ) : NodeCheckFlags[ +NodeCheckFlags.BlockScopedBindingInLoop.value ];
NodeCheckFlags.ClassWithBodyScopedClassBinding = wrapped( 'ClassWithBodyScopedClassBinding', 0x00080000 );
NodeCheckFlags[ +NodeCheckFlags.ClassWithBodyScopedClassBinding.value ] = typeof NodeCheckFlags[ +NodeCheckFlags.ClassWithBodyScopedClassBinding.value ] !== 'number' ? named( 'ClassWithBodyScopedClassBinding' ) : NodeCheckFlags[ +NodeCheckFlags.ClassWithBodyScopedClassBinding.value ];
NodeCheckFlags.BodyScopedClassBinding = wrapped( 'BodyScopedClassBinding', 0x00100000 );
NodeCheckFlags[ +NodeCheckFlags.BodyScopedClassBinding.value ] = typeof NodeCheckFlags[ +NodeCheckFlags.BodyScopedClassBinding.value ] !== 'number' ? named( 'BodyScopedClassBinding' ) : NodeCheckFlags[ +NodeCheckFlags.BodyScopedClassBinding.value ];
NodeCheckFlags.NeedsLoopOutParameter = wrapped( 'NeedsLoopOutParameter', 0x00200000 );
NodeCheckFlags[ +NodeCheckFlags.NeedsLoopOutParameter.value ] = typeof NodeCheckFlags[ +NodeCheckFlags.NeedsLoopOutParameter.value ] !== 'number' ? named( 'NeedsLoopOutParameter' ) : NodeCheckFlags[ +NodeCheckFlags.NeedsLoopOutParameter.value ];
NodeCheckFlags.AssignmentsMarked = wrapped( 'AssignmentsMarked', 0x00400000 );
NodeCheckFlags[ +NodeCheckFlags.AssignmentsMarked.value ] = typeof NodeCheckFlags[ +NodeCheckFlags.AssignmentsMarked.value ] !== 'number' ? named( 'AssignmentsMarked' ) : NodeCheckFlags[ +NodeCheckFlags.AssignmentsMarked.value ];
NodeCheckFlags.ClassWithConstructorReference = wrapped( 'ClassWithConstructorReference', 0x00800000 );
NodeCheckFlags[ +NodeCheckFlags.ClassWithConstructorReference.value ] = typeof NodeCheckFlags[ +NodeCheckFlags.ClassWithConstructorReference.value ] !== 'number' ? named( 'ClassWithConstructorReference' ) : NodeCheckFlags[ +NodeCheckFlags.ClassWithConstructorReference.value ];
NodeCheckFlags.ConstructorReferenceInClass = wrapped( 'ConstructorReferenceInClass', 0x01000000 );
NodeCheckFlags[ +NodeCheckFlags.ConstructorReferenceInClass.value ] = typeof NodeCheckFlags[ +NodeCheckFlags.ConstructorReferenceInClass.value ] !== 'number' ? named( 'ConstructorReferenceInClass' ) : NodeCheckFlags[ +NodeCheckFlags.ConstructorReferenceInClass.value ];

NodeCheckFlags = Object.create( templ(), NodeCheckFlags );
Object.getPrototypeOf( NodeCheckFlags ).asString = asString( NodeCheckFlags );

/** *********************************************************************************************************************
 * @enum
 * @name TypeFlags
 ************************************************************************************************************************/
let TypeFlags = {}; // Object.create( ( () => new ( function TypeFlags() {} )() )(), {} );
TypeFlags.Any = wrapped( 'Any', 1 << 0 );
TypeFlags[ +TypeFlags.Any.value ] = typeof TypeFlags[ +TypeFlags.Any.value ] !== 'number' ? named( 'Any' ) : TypeFlags[ +TypeFlags.Any.value ];
TypeFlags.String = wrapped( 'String', 1 << 1 );
TypeFlags[ +TypeFlags.String.value ] = typeof TypeFlags[ +TypeFlags.String.value ] !== 'number' ? named( 'String' ) : TypeFlags[ +TypeFlags.String.value ];
TypeFlags.Number = wrapped( 'Number', 1 << 2 );
TypeFlags[ +TypeFlags.Number.value ] = typeof TypeFlags[ +TypeFlags.Number.value ] !== 'number' ? named( 'Number' ) : TypeFlags[ +TypeFlags.Number.value ];
TypeFlags.Boolean = wrapped( 'Boolean', 1 << 3 );
TypeFlags[ +TypeFlags.Boolean.value ] = typeof TypeFlags[ +TypeFlags.Boolean.value ] !== 'number' ? named( 'Boolean' ) : TypeFlags[ +TypeFlags.Boolean.value ];
TypeFlags.Enum = wrapped( 'Enum', 1 << 4 );
TypeFlags[ +TypeFlags.Enum.value ] = typeof TypeFlags[ +TypeFlags.Enum.value ] !== 'number' ? named( 'Enum' ) : TypeFlags[ +TypeFlags.Enum.value ];
TypeFlags.StringLiteral = wrapped( 'StringLiteral', 1 << 5 );
TypeFlags[ +TypeFlags.StringLiteral.value ] = typeof TypeFlags[ +TypeFlags.StringLiteral.value ] !== 'number' ? named( 'StringLiteral' ) : TypeFlags[ +TypeFlags.StringLiteral.value ];
TypeFlags.NumberLiteral = wrapped( 'NumberLiteral', 1 << 6 );
TypeFlags[ +TypeFlags.NumberLiteral.value ] = typeof TypeFlags[ +TypeFlags.NumberLiteral.value ] !== 'number' ? named( 'NumberLiteral' ) : TypeFlags[ +TypeFlags.NumberLiteral.value ];
TypeFlags.BooleanLiteral = wrapped( 'BooleanLiteral', 1 << 7 );
TypeFlags[ +TypeFlags.BooleanLiteral.value ] = typeof TypeFlags[ +TypeFlags.BooleanLiteral.value ] !== 'number' ? named( 'BooleanLiteral' ) : TypeFlags[ +TypeFlags.BooleanLiteral.value ];
TypeFlags.EnumLiteral = wrapped( 'EnumLiteral', 1 << 8 );
TypeFlags[ +TypeFlags.EnumLiteral.value ] = typeof TypeFlags[ +TypeFlags.EnumLiteral.value ] !== 'number' ? named( 'EnumLiteral' ) : TypeFlags[ +TypeFlags.EnumLiteral.value ];
TypeFlags.ESSymbol = wrapped( 'ESSymbol', 1 << 9 );
TypeFlags[ +TypeFlags.ESSymbol.value ] = typeof TypeFlags[ +TypeFlags.ESSymbol.value ] !== 'number' ? named( 'ESSymbol' ) : TypeFlags[ +TypeFlags.ESSymbol.value ];
TypeFlags.UniqueESSymbol = wrapped( 'UniqueESSymbol', 1 << 10 );
TypeFlags[ +TypeFlags.UniqueESSymbol.value ] = typeof TypeFlags[ +TypeFlags.UniqueESSymbol.value ] !== 'number' ? named( 'UniqueESSymbol' ) : TypeFlags[ +TypeFlags.UniqueESSymbol.value ];
TypeFlags.Void = wrapped( 'Void', 1 << 11 );
TypeFlags[ +TypeFlags.Void.value ] = typeof TypeFlags[ +TypeFlags.Void.value ] !== 'number' ? named( 'Void' ) : TypeFlags[ +TypeFlags.Void.value ];
TypeFlags.Undefined = wrapped( 'Undefined', 1 << 12 );
TypeFlags[ +TypeFlags.Undefined.value ] = typeof TypeFlags[ +TypeFlags.Undefined.value ] !== 'number' ? named( 'Undefined' ) : TypeFlags[ +TypeFlags.Undefined.value ];
TypeFlags.Null = wrapped( 'Null', 1 << 13 );
TypeFlags[ +TypeFlags.Null.value ] = typeof TypeFlags[ +TypeFlags.Null.value ] !== 'number' ? named( 'Null' ) : TypeFlags[ +TypeFlags.Null.value ];
TypeFlags.Never = wrapped( 'Never', 1 << 14 );
TypeFlags[ +TypeFlags.Never.value ] = typeof TypeFlags[ +TypeFlags.Never.value ] !== 'number' ? named( 'Never' ) : TypeFlags[ +TypeFlags.Never.value ];
TypeFlags.TypeParameter = wrapped( 'TypeParameter', 1 << 15 );
TypeFlags[ +TypeFlags.TypeParameter.value ] = typeof TypeFlags[ +TypeFlags.TypeParameter.value ] !== 'number' ? named( 'TypeParameter' ) : TypeFlags[ +TypeFlags.TypeParameter.value ];
TypeFlags.Object = wrapped( 'Object', 1 << 16 );
TypeFlags[ +TypeFlags.Object.value ] = typeof TypeFlags[ +TypeFlags.Object.value ] !== 'number' ? named( 'Object' ) : TypeFlags[ +TypeFlags.Object.value ];
TypeFlags.Union = wrapped( 'Union', 1 << 17 );
TypeFlags[ +TypeFlags.Union.value ] = typeof TypeFlags[ +TypeFlags.Union.value ] !== 'number' ? named( 'Union' ) : TypeFlags[ +TypeFlags.Union.value ];
TypeFlags.Intersection = wrapped( 'Intersection', 1 << 18 );
TypeFlags[ +TypeFlags.Intersection.value ] = typeof TypeFlags[ +TypeFlags.Intersection.value ] !== 'number' ? named( 'Intersection' ) : TypeFlags[ +TypeFlags.Intersection.value ];
TypeFlags.Index = wrapped( 'Index', 1 << 19 );
TypeFlags[ +TypeFlags.Index.value ] = typeof TypeFlags[ +TypeFlags.Index.value ] !== 'number' ? named( 'Index' ) : TypeFlags[ +TypeFlags.Index.value ];
TypeFlags.IndexedAccess = wrapped( 'IndexedAccess', 1 << 20 );
TypeFlags[ +TypeFlags.IndexedAccess.value ] = typeof TypeFlags[ +TypeFlags.IndexedAccess.value ] !== 'number' ? named( 'IndexedAccess' ) : TypeFlags[ +TypeFlags.IndexedAccess.value ];
TypeFlags.FreshLiteral = wrapped( 'FreshLiteral', 1 << 21 );
TypeFlags[ +TypeFlags.FreshLiteral.value ] = typeof TypeFlags[ +TypeFlags.FreshLiteral.value ] !== 'number' ? named( 'FreshLiteral' ) : TypeFlags[ +TypeFlags.FreshLiteral.value ];
TypeFlags.ContainsWideningType = wrapped( 'ContainsWideningType', 1 << 22 );
TypeFlags[ +TypeFlags.ContainsWideningType.value ] = typeof TypeFlags[ +TypeFlags.ContainsWideningType.value ] !== 'number' ? named( 'ContainsWideningType' ) : TypeFlags[ +TypeFlags.ContainsWideningType.value ];
TypeFlags.ContainsObjectLiteral = wrapped( 'ContainsObjectLiteral', 1 << 23 );
TypeFlags[ +TypeFlags.ContainsObjectLiteral.value ] = typeof TypeFlags[ +TypeFlags.ContainsObjectLiteral.value ] !== 'number' ? named( 'ContainsObjectLiteral' ) : TypeFlags[ +TypeFlags.ContainsObjectLiteral.value ];
TypeFlags.ContainsAnyFunctionType = wrapped( 'ContainsAnyFunctionType', 1 << 24 );
TypeFlags[ +TypeFlags.ContainsAnyFunctionType.value ] = typeof TypeFlags[ +TypeFlags.ContainsAnyFunctionType.value ] !== 'number' ? named( 'ContainsAnyFunctionType' ) : TypeFlags[ +TypeFlags.ContainsAnyFunctionType.value ];
TypeFlags.NonPrimitive = wrapped( 'NonPrimitive', 1 << 25 );
TypeFlags[ +TypeFlags.NonPrimitive.value ] = typeof TypeFlags[ +TypeFlags.NonPrimitive.value ] !== 'number' ? named( 'NonPrimitive' ) : TypeFlags[ +TypeFlags.NonPrimitive.value ];
TypeFlags.JsxAttributes = wrapped( 'JsxAttributes', 1 << 26 );
TypeFlags[ +TypeFlags.JsxAttributes.value ] = typeof TypeFlags[ +TypeFlags.JsxAttributes.value ] !== 'number' ? named( 'JsxAttributes' ) : TypeFlags[ +TypeFlags.JsxAttributes.value ];
TypeFlags.MarkerType = wrapped( 'MarkerType', 1 << 27 );
TypeFlags[ +TypeFlags.MarkerType.value ] = typeof TypeFlags[ +TypeFlags.MarkerType.value ] !== 'number' ? named( 'MarkerType' ) : TypeFlags[ +TypeFlags.MarkerType.value ];
TypeFlags.Nullable = wrapped( 'Nullable', TypeFlags.Undefined | TypeFlags.Null );
TypeFlags[ +TypeFlags.Nullable.value ] = typeof TypeFlags[ +TypeFlags.Nullable.value ] !== 'number' ? named( 'Nullable' ) : TypeFlags[ +TypeFlags.Nullable.value ];
TypeFlags.Literal = wrapped( 'Literal', TypeFlags.StringLiteral | TypeFlags.NumberLiteral | TypeFlags.BooleanLiteral );
TypeFlags[ +TypeFlags.Literal.value ] = typeof TypeFlags[ +TypeFlags.Literal.value ] !== 'number' ? named( 'Literal' ) : TypeFlags[ +TypeFlags.Literal.value ];
TypeFlags.Unit = wrapped( 'Unit', TypeFlags.Literal | TypeFlags.UniqueESSymbol | TypeFlags.Nullable );
TypeFlags[ +TypeFlags.Unit.value ] = typeof TypeFlags[ +TypeFlags.Unit.value ] !== 'number' ? named( 'Unit' ) : TypeFlags[ +TypeFlags.Unit.value ];
TypeFlags.StringOrNumberLiteral = wrapped( 'StringOrNumberLiteral', TypeFlags.StringLiteral | TypeFlags.NumberLiteral );
TypeFlags[ +TypeFlags.StringOrNumberLiteral.value ] = typeof TypeFlags[ +TypeFlags.StringOrNumberLiteral.value ] !== 'number' ? named( 'StringOrNumberLiteral' ) : TypeFlags[ +TypeFlags.StringOrNumberLiteral.value ];
TypeFlags.StringOrNumberLiteralOrUnique = wrapped( 'StringOrNumberLiteralOrUnique', TypeFlags.StringOrNumberLiteral | TypeFlags.UniqueESSymbol );
TypeFlags[ +TypeFlags.StringOrNumberLiteralOrUnique.value ] = typeof TypeFlags[ +TypeFlags.StringOrNumberLiteralOrUnique.value ] !== 'number' ? named( 'StringOrNumberLiteralOrUnique' ) : TypeFlags[ +TypeFlags.StringOrNumberLiteralOrUnique.value ];
TypeFlags.DefinitelyFalsy = wrapped( 'DefinitelyFalsy', TypeFlags.StringLiteral | TypeFlags.NumberLiteral | TypeFlags.BooleanLiteral | TypeFlags.Void | TypeFlags.Undefined | TypeFlags.Null );
TypeFlags[ +TypeFlags.DefinitelyFalsy.value ] = typeof TypeFlags[ +TypeFlags.DefinitelyFalsy.value ] !== 'number' ? named( 'DefinitelyFalsy' ) : TypeFlags[ +TypeFlags.DefinitelyFalsy.value ];
TypeFlags.PossiblyFalsy = wrapped( 'PossiblyFalsy', TypeFlags.DefinitelyFalsy | TypeFlags.String | TypeFlags.Number | TypeFlags.Boolean );
TypeFlags[ +TypeFlags.PossiblyFalsy.value ] = typeof TypeFlags[ +TypeFlags.PossiblyFalsy.value ] !== 'number' ? named( 'PossiblyFalsy' ) : TypeFlags[ +TypeFlags.PossiblyFalsy.value ];
TypeFlags.Intrinsic = wrapped( 'Intrinsic', TypeFlags.Any | TypeFlags.String | TypeFlags.Number | TypeFlags.Boolean | TypeFlags.BooleanLiteral | TypeFlags.ESSymbol | TypeFlags.Void | TypeFlags.Undefined | TypeFlags.Null | TypeFlags.Never | TypeFlags.NonPrimitive );
TypeFlags[ +TypeFlags.Intrinsic.value ] = typeof TypeFlags[ +TypeFlags.Intrinsic.value ] !== 'number' ? named( 'Intrinsic' ) : TypeFlags[ +TypeFlags.Intrinsic.value ];
TypeFlags.Primitive = wrapped( 'Primitive', TypeFlags.String | TypeFlags.Number | TypeFlags.Boolean | TypeFlags.Enum | TypeFlags.EnumLiteral | TypeFlags.ESSymbol | TypeFlags.Void | TypeFlags.Undefined | TypeFlags.Null | TypeFlags.Literal | TypeFlags.UniqueESSymbol );
TypeFlags[ +TypeFlags.Primitive.value ] = typeof TypeFlags[ +TypeFlags.Primitive.value ] !== 'number' ? named( 'Primitive' ) : TypeFlags[ +TypeFlags.Primitive.value ];
TypeFlags.StringLike = wrapped( 'StringLike', TypeFlags.String | TypeFlags.StringLiteral | TypeFlags.Index );
TypeFlags[ +TypeFlags.StringLike.value ] = typeof TypeFlags[ +TypeFlags.StringLike.value ] !== 'number' ? named( 'StringLike' ) : TypeFlags[ +TypeFlags.StringLike.value ];
TypeFlags.NumberLike = wrapped( 'NumberLike', TypeFlags.Number | TypeFlags.NumberLiteral | TypeFlags.Enum );
TypeFlags[ +TypeFlags.NumberLike.value ] = typeof TypeFlags[ +TypeFlags.NumberLike.value ] !== 'number' ? named( 'NumberLike' ) : TypeFlags[ +TypeFlags.NumberLike.value ];
TypeFlags.BooleanLike = wrapped( 'BooleanLike', TypeFlags.Boolean | TypeFlags.BooleanLiteral );
TypeFlags[ +TypeFlags.BooleanLike.value ] = typeof TypeFlags[ +TypeFlags.BooleanLike.value ] !== 'number' ? named( 'BooleanLike' ) : TypeFlags[ +TypeFlags.BooleanLike.value ];
TypeFlags.EnumLike = wrapped( 'EnumLike', TypeFlags.Enum | TypeFlags.EnumLiteral );
TypeFlags[ +TypeFlags.EnumLike.value ] = typeof TypeFlags[ +TypeFlags.EnumLike.value ] !== 'number' ? named( 'EnumLike' ) : TypeFlags[ +TypeFlags.EnumLike.value ];
TypeFlags.ESSymbolLike = wrapped( 'ESSymbolLike', TypeFlags.ESSymbol | TypeFlags.UniqueESSymbol );
TypeFlags[ +TypeFlags.ESSymbolLike.value ] = typeof TypeFlags[ +TypeFlags.ESSymbolLike.value ] !== 'number' ? named( 'ESSymbolLike' ) : TypeFlags[ +TypeFlags.ESSymbolLike.value ];
TypeFlags.UnionOrIntersection = wrapped( 'UnionOrIntersection', TypeFlags.Union | TypeFlags.Intersection );
TypeFlags[ +TypeFlags.UnionOrIntersection.value ] = typeof TypeFlags[ +TypeFlags.UnionOrIntersection.value ] !== 'number' ? named( 'UnionOrIntersection' ) : TypeFlags[ +TypeFlags.UnionOrIntersection.value ];
TypeFlags.StructuredType = wrapped( 'StructuredType', TypeFlags.Object | TypeFlags.Union | TypeFlags.Intersection );
TypeFlags[ +TypeFlags.StructuredType.value ] = typeof TypeFlags[ +TypeFlags.StructuredType.value ] !== 'number' ? named( 'StructuredType' ) : TypeFlags[ +TypeFlags.StructuredType.value ];
TypeFlags.StructuredOrTypeVariable = wrapped( 'StructuredOrTypeVariable', TypeFlags.StructuredType | TypeFlags.TypeParameter | TypeFlags.Index | TypeFlags.IndexedAccess );
TypeFlags[ +TypeFlags.StructuredOrTypeVariable.value ] = typeof TypeFlags[ +TypeFlags.StructuredOrTypeVariable.value ] !== 'number' ? named( 'StructuredOrTypeVariable' ) : TypeFlags[ +TypeFlags.StructuredOrTypeVariable.value ];
TypeFlags.TypeVariable = wrapped( 'TypeVariable', TypeFlags.TypeParameter | TypeFlags.IndexedAccess );
TypeFlags[ +TypeFlags.TypeVariable.value ] = typeof TypeFlags[ +TypeFlags.TypeVariable.value ] !== 'number' ? named( 'TypeVariable' ) : TypeFlags[ +TypeFlags.TypeVariable.value ];
TypeFlags.Narrowable = wrapped( 'Narrowable', TypeFlags.Any | TypeFlags.StructuredType | TypeFlags.TypeParameter | TypeFlags.Index | TypeFlags.IndexedAccess | TypeFlags.StringLike | TypeFlags.NumberLike | TypeFlags.BooleanLike | TypeFlags.ESSymbol | TypeFlags.UniqueESSymbol | TypeFlags.NonPrimitive );
TypeFlags[ +TypeFlags.Narrowable.value ] = typeof TypeFlags[ +TypeFlags.Narrowable.value ] !== 'number' ? named( 'Narrowable' ) : TypeFlags[ +TypeFlags.Narrowable.value ];
TypeFlags.NotUnionOrUnit = wrapped( 'NotUnionOrUnit', TypeFlags.Any | TypeFlags.ESSymbol | TypeFlags.Object | TypeFlags.NonPrimitive );
TypeFlags[ +TypeFlags.NotUnionOrUnit.value ] = typeof TypeFlags[ +TypeFlags.NotUnionOrUnit.value ] !== 'number' ? named( 'NotUnionOrUnit' ) : TypeFlags[ +TypeFlags.NotUnionOrUnit.value ];
TypeFlags.RequiresWidening = wrapped( 'RequiresWidening', TypeFlags.ContainsWideningType | TypeFlags.ContainsObjectLiteral );
TypeFlags[ +TypeFlags.RequiresWidening.value ] = typeof TypeFlags[ +TypeFlags.RequiresWidening.value ] !== 'number' ? named( 'RequiresWidening' ) : TypeFlags[ +TypeFlags.RequiresWidening.value ];
TypeFlags.PropagatingFlags = wrapped( 'PropagatingFlags', TypeFlags.ContainsWideningType | TypeFlags.ContainsObjectLiteral | TypeFlags.ContainsAnyFunctionType );
TypeFlags[ +TypeFlags.PropagatingFlags.value ] = typeof TypeFlags[ +TypeFlags.PropagatingFlags.value ] !== 'number' ? named( 'PropagatingFlags' ) : TypeFlags[ +TypeFlags.PropagatingFlags.value ];

TypeFlags = Object.create( templ(), TypeFlags );
Object.getPrototypeOf( TypeFlags ).asString = asString( TypeFlags );

/** *********************************************************************************************************************
 * @enum
 * @name ObjectFlags
 ************************************************************************************************************************/
let ObjectFlags = {}; // Object.create( ( () => new ( function ObjectFlags() {} )() )(), {} );
ObjectFlags.Class = wrapped( 'Class', 1 << 0 );
ObjectFlags[ +ObjectFlags.Class.value ] = typeof ObjectFlags[ +ObjectFlags.Class.value ] !== 'number' ? named( 'Class' ) : ObjectFlags[ +ObjectFlags.Class.value ];
ObjectFlags.Interface = wrapped( 'Interface', 1 << 1 );
ObjectFlags[ +ObjectFlags.Interface.value ] = typeof ObjectFlags[ +ObjectFlags.Interface.value ] !== 'number' ? named( 'Interface' ) : ObjectFlags[ +ObjectFlags.Interface.value ];
ObjectFlags.Reference = wrapped( 'Reference', 1 << 2 );
ObjectFlags[ +ObjectFlags.Reference.value ] = typeof ObjectFlags[ +ObjectFlags.Reference.value ] !== 'number' ? named( 'Reference' ) : ObjectFlags[ +ObjectFlags.Reference.value ];
ObjectFlags.Tuple = wrapped( 'Tuple', 1 << 3 );
ObjectFlags[ +ObjectFlags.Tuple.value ] = typeof ObjectFlags[ +ObjectFlags.Tuple.value ] !== 'number' ? named( 'Tuple' ) : ObjectFlags[ +ObjectFlags.Tuple.value ];
ObjectFlags.Anonymous = wrapped( 'Anonymous', 1 << 4 );
ObjectFlags[ +ObjectFlags.Anonymous.value ] = typeof ObjectFlags[ +ObjectFlags.Anonymous.value ] !== 'number' ? named( 'Anonymous' ) : ObjectFlags[ +ObjectFlags.Anonymous.value ];
ObjectFlags.Mapped = wrapped( 'Mapped', 1 << 5 );
ObjectFlags[ +ObjectFlags.Mapped.value ] = typeof ObjectFlags[ +ObjectFlags.Mapped.value ] !== 'number' ? named( 'Mapped' ) : ObjectFlags[ +ObjectFlags.Mapped.value ];
ObjectFlags.Instantiated = wrapped( 'Instantiated', 1 << 6 );
ObjectFlags[ +ObjectFlags.Instantiated.value ] = typeof ObjectFlags[ +ObjectFlags.Instantiated.value ] !== 'number' ? named( 'Instantiated' ) : ObjectFlags[ +ObjectFlags.Instantiated.value ];
ObjectFlags.ObjectLiteral = wrapped( 'ObjectLiteral', 1 << 7 );
ObjectFlags[ +ObjectFlags.ObjectLiteral.value ] = typeof ObjectFlags[ +ObjectFlags.ObjectLiteral.value ] !== 'number' ? named( 'ObjectLiteral' ) : ObjectFlags[ +ObjectFlags.ObjectLiteral.value ];
ObjectFlags.EvolvingArray = wrapped( 'EvolvingArray', 1 << 8 );
ObjectFlags[ +ObjectFlags.EvolvingArray.value ] = typeof ObjectFlags[ +ObjectFlags.EvolvingArray.value ] !== 'number' ? named( 'EvolvingArray' ) : ObjectFlags[ +ObjectFlags.EvolvingArray.value ];
ObjectFlags.ObjectLiteralPatternWithComputedProperties = wrapped( 'ObjectLiteralPatternWithComputedProperties', 1 << 9 );
ObjectFlags[ +ObjectFlags.ObjectLiteralPatternWithComputedProperties.value ] = typeof ObjectFlags[ +ObjectFlags.ObjectLiteralPatternWithComputedProperties.value ] !== 'number' ? named( 'ObjectLiteralPatternWithComputedProperties' ) : ObjectFlags[ +ObjectFlags.ObjectLiteralPatternWithComputedProperties.value ];
ObjectFlags.ContainsSpread = wrapped( 'ContainsSpread', 1 << 10 );
ObjectFlags[ +ObjectFlags.ContainsSpread.value ] = typeof ObjectFlags[ +ObjectFlags.ContainsSpread.value ] !== 'number' ? named( 'ContainsSpread' ) : ObjectFlags[ +ObjectFlags.ContainsSpread.value ];
ObjectFlags.ReverseMapped = wrapped( 'ReverseMapped', 1 << 11 );
ObjectFlags[ +ObjectFlags.ReverseMapped.value ] = typeof ObjectFlags[ +ObjectFlags.ReverseMapped.value ] !== 'number' ? named( 'ReverseMapped' ) : ObjectFlags[ +ObjectFlags.ReverseMapped.value ];
ObjectFlags.ClassOrInterface = wrapped( 'ClassOrInterface', ObjectFlags.Class | ObjectFlags.Interface );
ObjectFlags[ +ObjectFlags.ClassOrInterface.value ] = typeof ObjectFlags[ +ObjectFlags.ClassOrInterface.value ] !== 'number' ? named( 'ClassOrInterface' ) : ObjectFlags[ +ObjectFlags.ClassOrInterface.value ];

ObjectFlags = Object.create( templ(), ObjectFlags );
Object.getPrototypeOf( ObjectFlags ).asString = asString( ObjectFlags );

/** *********************************************************************************************************************
 * @enum
 * @name Variance
 ************************************************************************************************************************/
let Variance = {}; // Object.create( ( () => new ( function Variance() {} )() )(), {} );
Variance.Invariant = wrapped( 'Invariant', 0 );
Variance[ +Variance.Invariant.value ] = typeof Variance[ +Variance.Invariant.value ] !== 'number' ? named( 'Invariant' ) : Variance[ +Variance.Invariant.value ];
Variance.Covariant = wrapped( 'Covariant', 1 );
Variance[ +Variance.Covariant.value ] = typeof Variance[ +Variance.Covariant.value ] !== 'number' ? named( 'Covariant' ) : Variance[ +Variance.Covariant.value ];
Variance.Contravariant = wrapped( 'Contravariant', 2 );
Variance[ +Variance.Contravariant.value ] = typeof Variance[ +Variance.Contravariant.value ] !== 'number' ? named( 'Contravariant' ) : Variance[ +Variance.Contravariant.value ];
Variance.Bivariant = wrapped( 'Bivariant', 3 );
Variance[ +Variance.Bivariant.value ] = typeof Variance[ +Variance.Bivariant.value ] !== 'number' ? named( 'Bivariant' ) : Variance[ +Variance.Bivariant.value ];
Variance.Independent = wrapped( 'Independent', 4 );
Variance[ +Variance.Independent.value ] = typeof Variance[ +Variance.Independent.value ] !== 'number' ? named( 'Independent' ) : Variance[ +Variance.Independent.value ];

Variance = Object.create( templ(), Variance );
Object.getPrototypeOf( Variance ).asString = asString( Variance );

/** *********************************************************************************************************************
 * @enum
 * @name SignatureKind
 ************************************************************************************************************************/
let SignatureKind = {}; // Object.create( ( () => new ( function SignatureKind() {} )() )(), {} );
SignatureKind.Call = wrapped( 'Call', 1 );
SignatureKind[ +SignatureKind.Call.value ] = typeof SignatureKind[ +SignatureKind.Call.value ] !== 'number' ? named( 'Call' ) : SignatureKind[ +SignatureKind.Call.value ];
SignatureKind.Construct = wrapped( 'Construct', 2 );
SignatureKind[ +SignatureKind.Construct.value ] = typeof SignatureKind[ +SignatureKind.Construct.value ] !== 'number' ? named( 'Construct' ) : SignatureKind[ +SignatureKind.Construct.value ];

SignatureKind = Object.create( templ(), SignatureKind );
Object.getPrototypeOf( SignatureKind ).asString = asString( SignatureKind );

/** *********************************************************************************************************************
 * @enum
 * @name IndexKind
 ************************************************************************************************************************/
let IndexKind = {}; // Object.create( ( () => new ( function IndexKind() {} )() )(), {} );
IndexKind.String = wrapped( 'String', 1 );
IndexKind[ +IndexKind.String.value ] = typeof IndexKind[ +IndexKind.String.value ] !== 'number' ? named( 'String' ) : IndexKind[ +IndexKind.String.value ];
IndexKind.Number = wrapped( 'Number', 2 );
IndexKind[ +IndexKind.Number.value ] = typeof IndexKind[ +IndexKind.Number.value ] !== 'number' ? named( 'Number' ) : IndexKind[ +IndexKind.Number.value ];

IndexKind = Object.create( templ(), IndexKind );
Object.getPrototypeOf( IndexKind ).asString = asString( IndexKind );

/** *********************************************************************************************************************
 * @enum
 * @name InferencePriority
 ************************************************************************************************************************/
let InferencePriority = {}; // Object.create( ( () => new ( function InferencePriority() {} )() )(), {} );
InferencePriority.Contravariant = wrapped( 'Contravariant', 1 << 0 );
InferencePriority[ +InferencePriority.Contravariant.value ] = typeof InferencePriority[ +InferencePriority.Contravariant.value ] !== 'number' ? named( 'Contravariant' ) : InferencePriority[ +InferencePriority.Contravariant.value ];
InferencePriority.NakedTypeVariable = wrapped( 'NakedTypeVariable', 1 << 1 );
InferencePriority[ +InferencePriority.NakedTypeVariable.value ] = typeof InferencePriority[ +InferencePriority.NakedTypeVariable.value ] !== 'number' ? named( 'NakedTypeVariable' ) : InferencePriority[ +InferencePriority.NakedTypeVariable.value ];
InferencePriority.MappedType = wrapped( 'MappedType', 1 << 2 );
InferencePriority[ +InferencePriority.MappedType.value ] = typeof InferencePriority[ +InferencePriority.MappedType.value ] !== 'number' ? named( 'MappedType' ) : InferencePriority[ +InferencePriority.MappedType.value ];
InferencePriority.ReturnType = wrapped( 'ReturnType', 1 << 3 );
InferencePriority[ +InferencePriority.ReturnType.value ] = typeof InferencePriority[ +InferencePriority.ReturnType.value ] !== 'number' ? named( 'ReturnType' ) : InferencePriority[ +InferencePriority.ReturnType.value ];
InferencePriority.NeverType = wrapped( 'NeverType', 1 << 4 );
InferencePriority[ +InferencePriority.NeverType.value ] = typeof InferencePriority[ +InferencePriority.NeverType.value ] !== 'number' ? named( 'NeverType' ) : InferencePriority[ +InferencePriority.NeverType.value ];

InferencePriority = Object.create( templ(), InferencePriority );
Object.getPrototypeOf( InferencePriority ).asString = asString( InferencePriority );

/** *********************************************************************************************************************
 * @enum
 * @name InferenceFlags
 ************************************************************************************************************************/
let InferenceFlags = {}; // Object.create( ( () => new ( function InferenceFlags() {} )() )(), {} );
InferenceFlags.InferUnionTypes = wrapped( 'InferUnionTypes', 1 << 0 );
InferenceFlags[ +InferenceFlags.InferUnionTypes.value ] = typeof InferenceFlags[ +InferenceFlags.InferUnionTypes.value ] !== 'number' ? named( 'InferUnionTypes' ) : InferenceFlags[ +InferenceFlags.InferUnionTypes.value ];
InferenceFlags.NoDefault = wrapped( 'NoDefault', 1 << 1 );
InferenceFlags[ +InferenceFlags.NoDefault.value ] = typeof InferenceFlags[ +InferenceFlags.NoDefault.value ] !== 'number' ? named( 'NoDefault' ) : InferenceFlags[ +InferenceFlags.NoDefault.value ];
InferenceFlags.AnyDefault = wrapped( 'AnyDefault', 1 << 2 );
InferenceFlags[ +InferenceFlags.AnyDefault.value ] = typeof InferenceFlags[ +InferenceFlags.AnyDefault.value ] !== 'number' ? named( 'AnyDefault' ) : InferenceFlags[ +InferenceFlags.AnyDefault.value ];

InferenceFlags = Object.create( templ(), InferenceFlags );
Object.getPrototypeOf( InferenceFlags ).asString = asString( InferenceFlags );

/** *********************************************************************************************************************
 * @enum
 * @name Ternary
 ************************************************************************************************************************/
let Ternary = {}; // Object.create( ( () => new ( function Ternary() {} )() )(), {} );
Ternary.False = wrapped( 'False', 0 );
Ternary[ +Ternary.False.value ] = typeof Ternary[ +Ternary.False.value ] !== 'number' ? named( 'False' ) : Ternary[ +Ternary.False.value ];
Ternary.Maybe = wrapped( 'Maybe', 1 );
Ternary[ +Ternary.Maybe.value ] = typeof Ternary[ +Ternary.Maybe.value ] !== 'number' ? named( 'Maybe' ) : Ternary[ +Ternary.Maybe.value ];
Ternary.True = wrapped( 'True', -1 );
Ternary[ +Ternary.True.value ] = typeof Ternary[ +Ternary.True.value ] !== 'number' ? named( 'True' ) : Ternary[ +Ternary.True.value ];

Ternary = Object.create( templ(), Ternary );
Object.getPrototypeOf( Ternary ).asString = asString( Ternary );

/** *********************************************************************************************************************
 * @enum
 * @name SpecialPropertyAssignmentKind
 ************************************************************************************************************************/
let SpecialPropertyAssignmentKind = {}; // Object.create( ( () => new ( function SpecialPropertyAssignmentKind() {} )() )(), {} );
SpecialPropertyAssignmentKind.None = wrapped( 'None', 1 );
SpecialPropertyAssignmentKind[ +SpecialPropertyAssignmentKind.None.value ] = typeof SpecialPropertyAssignmentKind[ +SpecialPropertyAssignmentKind.None.value ] !== 'number' ? named( 'None' ) : SpecialPropertyAssignmentKind[ +SpecialPropertyAssignmentKind.None.value ];
SpecialPropertyAssignmentKind.ExportsProperty = wrapped( 'ExportsProperty', 2 );
SpecialPropertyAssignmentKind[ +SpecialPropertyAssignmentKind.ExportsProperty.value ] = typeof SpecialPropertyAssignmentKind[ +SpecialPropertyAssignmentKind.ExportsProperty.value ] !== 'number' ? named( 'ExportsProperty' ) : SpecialPropertyAssignmentKind[ +SpecialPropertyAssignmentKind.ExportsProperty.value ];
SpecialPropertyAssignmentKind.ModuleExports = wrapped( 'ModuleExports', 3 );
SpecialPropertyAssignmentKind[ +SpecialPropertyAssignmentKind.ModuleExports.value ] = typeof SpecialPropertyAssignmentKind[ +SpecialPropertyAssignmentKind.ModuleExports.value ] !== 'number' ? named( 'ModuleExports' ) : SpecialPropertyAssignmentKind[ +SpecialPropertyAssignmentKind.ModuleExports.value ];
SpecialPropertyAssignmentKind.PrototypeProperty = wrapped( 'PrototypeProperty', 4 );
SpecialPropertyAssignmentKind[ +SpecialPropertyAssignmentKind.PrototypeProperty.value ] = typeof SpecialPropertyAssignmentKind[ +SpecialPropertyAssignmentKind.PrototypeProperty.value ] !== 'number' ? named( 'PrototypeProperty' ) : SpecialPropertyAssignmentKind[ +SpecialPropertyAssignmentKind.PrototypeProperty.value ];
SpecialPropertyAssignmentKind.ThisProperty = wrapped( 'ThisProperty', 5 );
SpecialPropertyAssignmentKind[ +SpecialPropertyAssignmentKind.ThisProperty.value ] = typeof SpecialPropertyAssignmentKind[ +SpecialPropertyAssignmentKind.ThisProperty.value ] !== 'number' ? named( 'ThisProperty' ) : SpecialPropertyAssignmentKind[ +SpecialPropertyAssignmentKind.ThisProperty.value ];
SpecialPropertyAssignmentKind.Property = wrapped( 'Property', 6 );
SpecialPropertyAssignmentKind[ +SpecialPropertyAssignmentKind.Property.value ] = typeof SpecialPropertyAssignmentKind[ +SpecialPropertyAssignmentKind.Property.value ] !== 'number' ? named( 'Property' ) : SpecialPropertyAssignmentKind[ +SpecialPropertyAssignmentKind.Property.value ];

SpecialPropertyAssignmentKind = Object.create( templ(), SpecialPropertyAssignmentKind );
Object.getPrototypeOf( SpecialPropertyAssignmentKind ).asString = asString( SpecialPropertyAssignmentKind );

/** *********************************************************************************************************************
 * @enum
 * @name JsxEmit
 ************************************************************************************************************************/
let JsxEmit = {}; // Object.create( ( () => new ( function JsxEmit() {} )() )(), {} );
JsxEmit.None = wrapped( 'None', 0 );
JsxEmit[ +JsxEmit.None.value ] = typeof JsxEmit[ +JsxEmit.None.value ] !== 'number' ? named( 'None' ) : JsxEmit[ +JsxEmit.None.value ];
JsxEmit.Preserve = wrapped( 'Preserve', 1 );
JsxEmit[ +JsxEmit.Preserve.value ] = typeof JsxEmit[ +JsxEmit.Preserve.value ] !== 'number' ? named( 'Preserve' ) : JsxEmit[ +JsxEmit.Preserve.value ];
JsxEmit.React = wrapped( 'React', 2 );
JsxEmit[ +JsxEmit.React.value ] = typeof JsxEmit[ +JsxEmit.React.value ] !== 'number' ? named( 'React' ) : JsxEmit[ +JsxEmit.React.value ];
JsxEmit.ReactNative = wrapped( 'ReactNative', 3 );
JsxEmit[ +JsxEmit.ReactNative.value ] = typeof JsxEmit[ +JsxEmit.ReactNative.value ] !== 'number' ? named( 'ReactNative' ) : JsxEmit[ +JsxEmit.ReactNative.value ];

JsxEmit = Object.create( templ(), JsxEmit );
Object.getPrototypeOf( JsxEmit ).asString = asString( JsxEmit );

/** *********************************************************************************************************************
 * @enum
 * @name NewLineKind
 ************************************************************************************************************************/
let NewLineKind = {}; // Object.create( ( () => new ( function NewLineKind() {} )() )(), {} );
NewLineKind.CarriageReturnLineFeed = wrapped( 'CarriageReturnLineFeed', 0 );
NewLineKind[ +NewLineKind.CarriageReturnLineFeed.value ] = typeof NewLineKind[ +NewLineKind.CarriageReturnLineFeed.value ] !== 'number' ? named( 'CarriageReturnLineFeed' ) : NewLineKind[ +NewLineKind.CarriageReturnLineFeed.value ];
NewLineKind.LineFeed = wrapped( 'LineFeed', 1 );
NewLineKind[ +NewLineKind.LineFeed.value ] = typeof NewLineKind[ +NewLineKind.LineFeed.value ] !== 'number' ? named( 'LineFeed' ) : NewLineKind[ +NewLineKind.LineFeed.value ];

NewLineKind = Object.create( templ(), NewLineKind );
Object.getPrototypeOf( NewLineKind ).asString = asString( NewLineKind );

/** *********************************************************************************************************************
 * @enum
 * @name ScriptKind
 ************************************************************************************************************************/
let ScriptKind = {}; // Object.create( ( () => new ( function ScriptKind() {} )() )(), {} );
ScriptKind.Unknown = wrapped( 'Unknown', 0 );
ScriptKind[ +ScriptKind.Unknown.value ] = typeof ScriptKind[ +ScriptKind.Unknown.value ] !== 'number' ? named( 'Unknown' ) : ScriptKind[ +ScriptKind.Unknown.value ];
ScriptKind.JS = wrapped( 'JS', 1 );
ScriptKind[ +ScriptKind.JS.value ] = typeof ScriptKind[ +ScriptKind.JS.value ] !== 'number' ? named( 'JS' ) : ScriptKind[ +ScriptKind.JS.value ];
ScriptKind.JSX = wrapped( 'JSX', 2 );
ScriptKind[ +ScriptKind.JSX.value ] = typeof ScriptKind[ +ScriptKind.JSX.value ] !== 'number' ? named( 'JSX' ) : ScriptKind[ +ScriptKind.JSX.value ];
ScriptKind.TS = wrapped( 'TS', 3 );
ScriptKind[ +ScriptKind.TS.value ] = typeof ScriptKind[ +ScriptKind.TS.value ] !== 'number' ? named( 'TS' ) : ScriptKind[ +ScriptKind.TS.value ];
ScriptKind.TSX = wrapped( 'TSX', 4 );
ScriptKind[ +ScriptKind.TSX.value ] = typeof ScriptKind[ +ScriptKind.TSX.value ] !== 'number' ? named( 'TSX' ) : ScriptKind[ +ScriptKind.TSX.value ];
ScriptKind.External = wrapped( 'External', 5 );
ScriptKind[ +ScriptKind.External.value ] = typeof ScriptKind[ +ScriptKind.External.value ] !== 'number' ? named( 'External' ) : ScriptKind[ +ScriptKind.External.value ];
ScriptKind.JSON = wrapped( 'JSON', 6 );
ScriptKind[ +ScriptKind.JSON.value ] = typeof ScriptKind[ +ScriptKind.JSON.value ] !== 'number' ? named( 'JSON' ) : ScriptKind[ +ScriptKind.JSON.value ];

ScriptKind = Object.create( templ(), ScriptKind );
Object.getPrototypeOf( ScriptKind ).asString = asString( ScriptKind );

/** *********************************************************************************************************************
 * @enum
 * @name ScriptTarget
 ************************************************************************************************************************/
let ScriptTarget = {}; // Object.create( ( () => new ( function ScriptTarget() {} )() )(), {} );
ScriptTarget.ES3 = wrapped( 'ES3', 0 );
ScriptTarget[ +ScriptTarget.ES3.value ] = typeof ScriptTarget[ +ScriptTarget.ES3.value ] !== 'number' ? named( 'ES3' ) : ScriptTarget[ +ScriptTarget.ES3.value ];
ScriptTarget.ES5 = wrapped( 'ES5', 1 );
ScriptTarget[ +ScriptTarget.ES5.value ] = typeof ScriptTarget[ +ScriptTarget.ES5.value ] !== 'number' ? named( 'ES5' ) : ScriptTarget[ +ScriptTarget.ES5.value ];
ScriptTarget.ES2015 = wrapped( 'ES2015', 2 );
ScriptTarget[ +ScriptTarget.ES2015.value ] = typeof ScriptTarget[ +ScriptTarget.ES2015.value ] !== 'number' ? named( 'ES2015' ) : ScriptTarget[ +ScriptTarget.ES2015.value ];
ScriptTarget.ES2016 = wrapped( 'ES2016', 3 );
ScriptTarget[ +ScriptTarget.ES2016.value ] = typeof ScriptTarget[ +ScriptTarget.ES2016.value ] !== 'number' ? named( 'ES2016' ) : ScriptTarget[ +ScriptTarget.ES2016.value ];
ScriptTarget.ES2017 = wrapped( 'ES2017', 4 );
ScriptTarget[ +ScriptTarget.ES2017.value ] = typeof ScriptTarget[ +ScriptTarget.ES2017.value ] !== 'number' ? named( 'ES2017' ) : ScriptTarget[ +ScriptTarget.ES2017.value ];
ScriptTarget.ES2018 = wrapped( 'ES2018', 5 );
ScriptTarget[ +ScriptTarget.ES2018.value ] = typeof ScriptTarget[ +ScriptTarget.ES2018.value ] !== 'number' ? named( 'ES2018' ) : ScriptTarget[ +ScriptTarget.ES2018.value ];
ScriptTarget.ESNext = wrapped( 'ESNext', 6 );
ScriptTarget[ +ScriptTarget.ESNext.value ] = typeof ScriptTarget[ +ScriptTarget.ESNext.value ] !== 'number' ? named( 'ESNext' ) : ScriptTarget[ +ScriptTarget.ESNext.value ];
ScriptTarget.Latest = wrapped( 'Latest', +ScriptTarget.ESNext );
ScriptTarget[ +ScriptTarget.Latest.value ] = typeof ScriptTarget[ +ScriptTarget.Latest.value ] !== 'number' ? named( 'Latest' ) : ScriptTarget[ +ScriptTarget.Latest.value ];

ScriptTarget = Object.create( templ(), ScriptTarget );
Object.getPrototypeOf( ScriptTarget ).asString = asString( ScriptTarget );

/** *********************************************************************************************************************
 * @enum
 * @name LanguageVariant
 ************************************************************************************************************************/
let LanguageVariant = {}; // Object.create( ( () => new ( function LanguageVariant() {} )() )(), {} );
LanguageVariant.Standard = wrapped( 'Standard', 1 );
LanguageVariant[ +LanguageVariant.Standard.value ] = typeof LanguageVariant[ +LanguageVariant.Standard.value ] !== 'number' ? named( 'Standard' ) : LanguageVariant[ +LanguageVariant.Standard.value ];
LanguageVariant.JSX = wrapped( 'JSX', 2 );
LanguageVariant[ +LanguageVariant.JSX.value ] = typeof LanguageVariant[ +LanguageVariant.JSX.value ] !== 'number' ? named( 'JSX' ) : LanguageVariant[ +LanguageVariant.JSX.value ];

LanguageVariant = Object.create( templ(), LanguageVariant );
Object.getPrototypeOf( LanguageVariant ).asString = asString( LanguageVariant );

/** *********************************************************************************************************************
 * @enum
 * @name DiagnosticStyle
 ************************************************************************************************************************/
let DiagnosticStyle = {}; // Object.create( ( () => new ( function DiagnosticStyle() {} )() )(), {} );
DiagnosticStyle.Simple = wrapped( 'Simple', 1 );
DiagnosticStyle[ +DiagnosticStyle.Simple.value ] = typeof DiagnosticStyle[ +DiagnosticStyle.Simple.value ] !== 'number' ? named( 'Simple' ) : DiagnosticStyle[ +DiagnosticStyle.Simple.value ];
DiagnosticStyle.Pretty = wrapped( 'Pretty', 2 );
DiagnosticStyle[ +DiagnosticStyle.Pretty.value ] = typeof DiagnosticStyle[ +DiagnosticStyle.Pretty.value ] !== 'number' ? named( 'Pretty' ) : DiagnosticStyle[ +DiagnosticStyle.Pretty.value ];

DiagnosticStyle = Object.create( templ(), DiagnosticStyle );
Object.getPrototypeOf( DiagnosticStyle ).asString = asString( DiagnosticStyle );

/** *********************************************************************************************************************
 * @enum
 * @name WatchDirectoryFlags
 ************************************************************************************************************************/
let WatchDirectoryFlags = {}; // Object.create( ( () => new ( function WatchDirectoryFlags() {} )() )(), {} );
WatchDirectoryFlags.None = wrapped( 'None', 0 );
WatchDirectoryFlags[ +WatchDirectoryFlags.None.value ] = typeof WatchDirectoryFlags[ +WatchDirectoryFlags.None.value ] !== 'number' ? named( 'None' ) : WatchDirectoryFlags[ +WatchDirectoryFlags.None.value ];
WatchDirectoryFlags.Recursive = wrapped( 'Recursive', 1 << 0 );
WatchDirectoryFlags[ +WatchDirectoryFlags.Recursive.value ] = typeof WatchDirectoryFlags[ +WatchDirectoryFlags.Recursive.value ] !== 'number' ? named( 'Recursive' ) : WatchDirectoryFlags[ +WatchDirectoryFlags.Recursive.value ];

WatchDirectoryFlags = Object.create( templ(), WatchDirectoryFlags );
Object.getPrototypeOf( WatchDirectoryFlags ).asString = asString( WatchDirectoryFlags );

/** *********************************************************************************************************************
 * @enum
 * @name CharacterCodes
 ************************************************************************************************************************/
let CharacterCodes = {}; // Object.create( ( () => new ( function CharacterCodes() {} )() )(), {} );
CharacterCodes.nullCharacter = wrapped( 'nullCharacter', 0 );
CharacterCodes[ +CharacterCodes.nullCharacter.value ] = typeof CharacterCodes[ +CharacterCodes.nullCharacter.value ] !== 'number' ? named( 'nullCharacter' ) : CharacterCodes[ +CharacterCodes.nullCharacter.value ];
CharacterCodes.maxAsciiCharacter = wrapped( 'maxAsciiCharacter', 0x7F );
CharacterCodes[ +CharacterCodes.maxAsciiCharacter.value ] = typeof CharacterCodes[ +CharacterCodes.maxAsciiCharacter.value ] !== 'number' ? named( 'maxAsciiCharacter' ) : CharacterCodes[ +CharacterCodes.maxAsciiCharacter.value ];
CharacterCodes.lineFeed = wrapped( 'lineFeed', 0x0A );
CharacterCodes[ +CharacterCodes.lineFeed.value ] = typeof CharacterCodes[ +CharacterCodes.lineFeed.value ] !== 'number' ? named( 'lineFeed' ) : CharacterCodes[ +CharacterCodes.lineFeed.value ];
CharacterCodes.carriageReturn = wrapped( 'carriageReturn', 0x0D );
CharacterCodes[ +CharacterCodes.carriageReturn.value ] = typeof CharacterCodes[ +CharacterCodes.carriageReturn.value ] !== 'number' ? named( 'carriageReturn' ) : CharacterCodes[ +CharacterCodes.carriageReturn.value ];
CharacterCodes.lineSeparator = wrapped( 'lineSeparator', 0x2028 );
CharacterCodes[ +CharacterCodes.lineSeparator.value ] = typeof CharacterCodes[ +CharacterCodes.lineSeparator.value ] !== 'number' ? named( 'lineSeparator' ) : CharacterCodes[ +CharacterCodes.lineSeparator.value ];
CharacterCodes.paragraphSeparator = wrapped( 'paragraphSeparator', 0x2029 );
CharacterCodes[ +CharacterCodes.paragraphSeparator.value ] = typeof CharacterCodes[ +CharacterCodes.paragraphSeparator.value ] !== 'number' ? named( 'paragraphSeparator' ) : CharacterCodes[ +CharacterCodes.paragraphSeparator.value ];
CharacterCodes.nextLine = wrapped( 'nextLine', 0x0085 );
CharacterCodes[ +CharacterCodes.nextLine.value ] = typeof CharacterCodes[ +CharacterCodes.nextLine.value ] !== 'number' ? named( 'nextLine' ) : CharacterCodes[ +CharacterCodes.nextLine.value ];
CharacterCodes.space = wrapped( 'space', 0x0020 );
CharacterCodes[ +CharacterCodes.space.value ] = typeof CharacterCodes[ +CharacterCodes.space.value ] !== 'number' ? named( 'space' ) : CharacterCodes[ +CharacterCodes.space.value ];
CharacterCodes.nonBreakingSpace = wrapped( 'nonBreakingSpace', 0x00A0 );
CharacterCodes[ +CharacterCodes.nonBreakingSpace.value ] = typeof CharacterCodes[ +CharacterCodes.nonBreakingSpace.value ] !== 'number' ? named( 'nonBreakingSpace' ) : CharacterCodes[ +CharacterCodes.nonBreakingSpace.value ];
CharacterCodes.enQuad = wrapped( 'enQuad', 0x2000 );
CharacterCodes[ +CharacterCodes.enQuad.value ] = typeof CharacterCodes[ +CharacterCodes.enQuad.value ] !== 'number' ? named( 'enQuad' ) : CharacterCodes[ +CharacterCodes.enQuad.value ];
CharacterCodes.emQuad = wrapped( 'emQuad', 0x2001 );
CharacterCodes[ +CharacterCodes.emQuad.value ] = typeof CharacterCodes[ +CharacterCodes.emQuad.value ] !== 'number' ? named( 'emQuad' ) : CharacterCodes[ +CharacterCodes.emQuad.value ];
CharacterCodes.enSpace = wrapped( 'enSpace', 0x2002 );
CharacterCodes[ +CharacterCodes.enSpace.value ] = typeof CharacterCodes[ +CharacterCodes.enSpace.value ] !== 'number' ? named( 'enSpace' ) : CharacterCodes[ +CharacterCodes.enSpace.value ];
CharacterCodes.emSpace = wrapped( 'emSpace', 0x2003 );
CharacterCodes[ +CharacterCodes.emSpace.value ] = typeof CharacterCodes[ +CharacterCodes.emSpace.value ] !== 'number' ? named( 'emSpace' ) : CharacterCodes[ +CharacterCodes.emSpace.value ];
CharacterCodes.threePerEmSpace = wrapped( 'threePerEmSpace', 0x2004 );
CharacterCodes[ +CharacterCodes.threePerEmSpace.value ] = typeof CharacterCodes[ +CharacterCodes.threePerEmSpace.value ] !== 'number' ? named( 'threePerEmSpace' ) : CharacterCodes[ +CharacterCodes.threePerEmSpace.value ];
CharacterCodes.fourPerEmSpace = wrapped( 'fourPerEmSpace', 0x2005 );
CharacterCodes[ +CharacterCodes.fourPerEmSpace.value ] = typeof CharacterCodes[ +CharacterCodes.fourPerEmSpace.value ] !== 'number' ? named( 'fourPerEmSpace' ) : CharacterCodes[ +CharacterCodes.fourPerEmSpace.value ];
CharacterCodes.sixPerEmSpace = wrapped( 'sixPerEmSpace', 0x2006 );
CharacterCodes[ +CharacterCodes.sixPerEmSpace.value ] = typeof CharacterCodes[ +CharacterCodes.sixPerEmSpace.value ] !== 'number' ? named( 'sixPerEmSpace' ) : CharacterCodes[ +CharacterCodes.sixPerEmSpace.value ];
CharacterCodes.figureSpace = wrapped( 'figureSpace', 0x2007 );
CharacterCodes[ +CharacterCodes.figureSpace.value ] = typeof CharacterCodes[ +CharacterCodes.figureSpace.value ] !== 'number' ? named( 'figureSpace' ) : CharacterCodes[ +CharacterCodes.figureSpace.value ];
CharacterCodes.punctuationSpace = wrapped( 'punctuationSpace', 0x2008 );
CharacterCodes[ +CharacterCodes.punctuationSpace.value ] = typeof CharacterCodes[ +CharacterCodes.punctuationSpace.value ] !== 'number' ? named( 'punctuationSpace' ) : CharacterCodes[ +CharacterCodes.punctuationSpace.value ];
CharacterCodes.thinSpace = wrapped( 'thinSpace', 0x2009 );
CharacterCodes[ +CharacterCodes.thinSpace.value ] = typeof CharacterCodes[ +CharacterCodes.thinSpace.value ] !== 'number' ? named( 'thinSpace' ) : CharacterCodes[ +CharacterCodes.thinSpace.value ];
CharacterCodes.hairSpace = wrapped( 'hairSpace', 0x200A );
CharacterCodes[ +CharacterCodes.hairSpace.value ] = typeof CharacterCodes[ +CharacterCodes.hairSpace.value ] !== 'number' ? named( 'hairSpace' ) : CharacterCodes[ +CharacterCodes.hairSpace.value ];
CharacterCodes.zeroWidthSpace = wrapped( 'zeroWidthSpace', 0x200B );
CharacterCodes[ +CharacterCodes.zeroWidthSpace.value ] = typeof CharacterCodes[ +CharacterCodes.zeroWidthSpace.value ] !== 'number' ? named( 'zeroWidthSpace' ) : CharacterCodes[ +CharacterCodes.zeroWidthSpace.value ];
CharacterCodes.narrowNoBreakSpace = wrapped( 'narrowNoBreakSpace', 0x202F );
CharacterCodes[ +CharacterCodes.narrowNoBreakSpace.value ] = typeof CharacterCodes[ +CharacterCodes.narrowNoBreakSpace.value ] !== 'number' ? named( 'narrowNoBreakSpace' ) : CharacterCodes[ +CharacterCodes.narrowNoBreakSpace.value ];
CharacterCodes.ideographicSpace = wrapped( 'ideographicSpace', 0x3000 );
CharacterCodes[ +CharacterCodes.ideographicSpace.value ] = typeof CharacterCodes[ +CharacterCodes.ideographicSpace.value ] !== 'number' ? named( 'ideographicSpace' ) : CharacterCodes[ +CharacterCodes.ideographicSpace.value ];
CharacterCodes.mathematicalSpace = wrapped( 'mathematicalSpace', 0x205F );
CharacterCodes[ +CharacterCodes.mathematicalSpace.value ] = typeof CharacterCodes[ +CharacterCodes.mathematicalSpace.value ] !== 'number' ? named( 'mathematicalSpace' ) : CharacterCodes[ +CharacterCodes.mathematicalSpace.value ];
CharacterCodes.ogham = wrapped( 'ogham', 0x1680 );
CharacterCodes[ +CharacterCodes.ogham.value ] = typeof CharacterCodes[ +CharacterCodes.ogham.value ] !== 'number' ? named( 'ogham' ) : CharacterCodes[ +CharacterCodes.ogham.value ];
CharacterCodes._ = wrapped( '_', 0x5F );
CharacterCodes[ +CharacterCodes._.value ] = typeof CharacterCodes[ +CharacterCodes._.value ] !== 'number' ? named( '_' ) : CharacterCodes[ +CharacterCodes._.value ];
CharacterCodes.$ = wrapped( '$', 0x24 );
CharacterCodes[ +CharacterCodes.$.value ] = typeof CharacterCodes[ +CharacterCodes.$.value ] !== 'number' ? named( '$' ) : CharacterCodes[ +CharacterCodes.$.value ];
CharacterCodes._0 = wrapped( '_0', 0x30 );
CharacterCodes[ +CharacterCodes._0.value ] = typeof CharacterCodes[ +CharacterCodes._0.value ] !== 'number' ? named( '_0' ) : CharacterCodes[ +CharacterCodes._0.value ];
CharacterCodes._1 = wrapped( '_1', 0x31 );
CharacterCodes[ +CharacterCodes._1.value ] = typeof CharacterCodes[ +CharacterCodes._1.value ] !== 'number' ? named( '_1' ) : CharacterCodes[ +CharacterCodes._1.value ];
CharacterCodes._2 = wrapped( '_2', 0x32 );
CharacterCodes[ +CharacterCodes._2.value ] = typeof CharacterCodes[ +CharacterCodes._2.value ] !== 'number' ? named( '_2' ) : CharacterCodes[ +CharacterCodes._2.value ];
CharacterCodes._3 = wrapped( '_3', 0x33 );
CharacterCodes[ +CharacterCodes._3.value ] = typeof CharacterCodes[ +CharacterCodes._3.value ] !== 'number' ? named( '_3' ) : CharacterCodes[ +CharacterCodes._3.value ];
CharacterCodes._4 = wrapped( '_4', 0x34 );
CharacterCodes[ +CharacterCodes._4.value ] = typeof CharacterCodes[ +CharacterCodes._4.value ] !== 'number' ? named( '_4' ) : CharacterCodes[ +CharacterCodes._4.value ];
CharacterCodes._5 = wrapped( '_5', 0x35 );
CharacterCodes[ +CharacterCodes._5.value ] = typeof CharacterCodes[ +CharacterCodes._5.value ] !== 'number' ? named( '_5' ) : CharacterCodes[ +CharacterCodes._5.value ];
CharacterCodes._6 = wrapped( '_6', 0x36 );
CharacterCodes[ +CharacterCodes._6.value ] = typeof CharacterCodes[ +CharacterCodes._6.value ] !== 'number' ? named( '_6' ) : CharacterCodes[ +CharacterCodes._6.value ];
CharacterCodes._7 = wrapped( '_7', 0x37 );
CharacterCodes[ +CharacterCodes._7.value ] = typeof CharacterCodes[ +CharacterCodes._7.value ] !== 'number' ? named( '_7' ) : CharacterCodes[ +CharacterCodes._7.value ];
CharacterCodes._8 = wrapped( '_8', 0x38 );
CharacterCodes[ +CharacterCodes._8.value ] = typeof CharacterCodes[ +CharacterCodes._8.value ] !== 'number' ? named( '_8' ) : CharacterCodes[ +CharacterCodes._8.value ];
CharacterCodes._9 = wrapped( '_9', 0x39 );
CharacterCodes[ +CharacterCodes._9.value ] = typeof CharacterCodes[ +CharacterCodes._9.value ] !== 'number' ? named( '_9' ) : CharacterCodes[ +CharacterCodes._9.value ];
CharacterCodes.a = wrapped( 'a', 0x61 );
CharacterCodes[ +CharacterCodes.a.value ] = typeof CharacterCodes[ +CharacterCodes.a.value ] !== 'number' ? named( 'a' ) : CharacterCodes[ +CharacterCodes.a.value ];
CharacterCodes.b = wrapped( 'b', 0x62 );
CharacterCodes[ +CharacterCodes.b.value ] = typeof CharacterCodes[ +CharacterCodes.b.value ] !== 'number' ? named( 'b' ) : CharacterCodes[ +CharacterCodes.b.value ];
CharacterCodes.c = wrapped( 'c', 0x63 );
CharacterCodes[ +CharacterCodes.c.value ] = typeof CharacterCodes[ +CharacterCodes.c.value ] !== 'number' ? named( 'c' ) : CharacterCodes[ +CharacterCodes.c.value ];
CharacterCodes.d = wrapped( 'd', 0x64 );
CharacterCodes[ +CharacterCodes.d.value ] = typeof CharacterCodes[ +CharacterCodes.d.value ] !== 'number' ? named( 'd' ) : CharacterCodes[ +CharacterCodes.d.value ];
CharacterCodes.e = wrapped( 'e', 0x65 );
CharacterCodes[ +CharacterCodes.e.value ] = typeof CharacterCodes[ +CharacterCodes.e.value ] !== 'number' ? named( 'e' ) : CharacterCodes[ +CharacterCodes.e.value ];
CharacterCodes.f = wrapped( 'f', 0x66 );
CharacterCodes[ +CharacterCodes.f.value ] = typeof CharacterCodes[ +CharacterCodes.f.value ] !== 'number' ? named( 'f' ) : CharacterCodes[ +CharacterCodes.f.value ];
CharacterCodes.g = wrapped( 'g', 0x67 );
CharacterCodes[ +CharacterCodes.g.value ] = typeof CharacterCodes[ +CharacterCodes.g.value ] !== 'number' ? named( 'g' ) : CharacterCodes[ +CharacterCodes.g.value ];
CharacterCodes.h = wrapped( 'h', 0x68 );
CharacterCodes[ +CharacterCodes.h.value ] = typeof CharacterCodes[ +CharacterCodes.h.value ] !== 'number' ? named( 'h' ) : CharacterCodes[ +CharacterCodes.h.value ];
CharacterCodes.i = wrapped( 'i', 0x69 );
CharacterCodes[ +CharacterCodes.i.value ] = typeof CharacterCodes[ +CharacterCodes.i.value ] !== 'number' ? named( 'i' ) : CharacterCodes[ +CharacterCodes.i.value ];
CharacterCodes.j = wrapped( 'j', 0x6A );
CharacterCodes[ +CharacterCodes.j.value ] = typeof CharacterCodes[ +CharacterCodes.j.value ] !== 'number' ? named( 'j' ) : CharacterCodes[ +CharacterCodes.j.value ];
CharacterCodes.k = wrapped( 'k', 0x6B );
CharacterCodes[ +CharacterCodes.k.value ] = typeof CharacterCodes[ +CharacterCodes.k.value ] !== 'number' ? named( 'k' ) : CharacterCodes[ +CharacterCodes.k.value ];
CharacterCodes.l = wrapped( 'l', 0x6C );
CharacterCodes[ +CharacterCodes.l.value ] = typeof CharacterCodes[ +CharacterCodes.l.value ] !== 'number' ? named( 'l' ) : CharacterCodes[ +CharacterCodes.l.value ];
CharacterCodes.m = wrapped( 'm', 0x6D );
CharacterCodes[ +CharacterCodes.m.value ] = typeof CharacterCodes[ +CharacterCodes.m.value ] !== 'number' ? named( 'm' ) : CharacterCodes[ +CharacterCodes.m.value ];
CharacterCodes.n = wrapped( 'n', 0x6E );
CharacterCodes[ +CharacterCodes.n.value ] = typeof CharacterCodes[ +CharacterCodes.n.value ] !== 'number' ? named( 'n' ) : CharacterCodes[ +CharacterCodes.n.value ];
CharacterCodes.o = wrapped( 'o', 0x6F );
CharacterCodes[ +CharacterCodes.o.value ] = typeof CharacterCodes[ +CharacterCodes.o.value ] !== 'number' ? named( 'o' ) : CharacterCodes[ +CharacterCodes.o.value ];
CharacterCodes.p = wrapped( 'p', 0x70 );
CharacterCodes[ +CharacterCodes.p.value ] = typeof CharacterCodes[ +CharacterCodes.p.value ] !== 'number' ? named( 'p' ) : CharacterCodes[ +CharacterCodes.p.value ];
CharacterCodes.q = wrapped( 'q', 0x71 );
CharacterCodes[ +CharacterCodes.q.value ] = typeof CharacterCodes[ +CharacterCodes.q.value ] !== 'number' ? named( 'q' ) : CharacterCodes[ +CharacterCodes.q.value ];
CharacterCodes.r = wrapped( 'r', 0x72 );
CharacterCodes[ +CharacterCodes.r.value ] = typeof CharacterCodes[ +CharacterCodes.r.value ] !== 'number' ? named( 'r' ) : CharacterCodes[ +CharacterCodes.r.value ];
CharacterCodes.s = wrapped( 's', 0x73 );
CharacterCodes[ +CharacterCodes.s.value ] = typeof CharacterCodes[ +CharacterCodes.s.value ] !== 'number' ? named( 's' ) : CharacterCodes[ +CharacterCodes.s.value ];
CharacterCodes.t = wrapped( 't', 0x74 );
CharacterCodes[ +CharacterCodes.t.value ] = typeof CharacterCodes[ +CharacterCodes.t.value ] !== 'number' ? named( 't' ) : CharacterCodes[ +CharacterCodes.t.value ];
CharacterCodes.u = wrapped( 'u', 0x75 );
CharacterCodes[ +CharacterCodes.u.value ] = typeof CharacterCodes[ +CharacterCodes.u.value ] !== 'number' ? named( 'u' ) : CharacterCodes[ +CharacterCodes.u.value ];
CharacterCodes.v = wrapped( 'v', 0x76 );
CharacterCodes[ +CharacterCodes.v.value ] = typeof CharacterCodes[ +CharacterCodes.v.value ] !== 'number' ? named( 'v' ) : CharacterCodes[ +CharacterCodes.v.value ];
CharacterCodes.w = wrapped( 'w', 0x77 );
CharacterCodes[ +CharacterCodes.w.value ] = typeof CharacterCodes[ +CharacterCodes.w.value ] !== 'number' ? named( 'w' ) : CharacterCodes[ +CharacterCodes.w.value ];
CharacterCodes.x = wrapped( 'x', 0x78 );
CharacterCodes[ +CharacterCodes.x.value ] = typeof CharacterCodes[ +CharacterCodes.x.value ] !== 'number' ? named( 'x' ) : CharacterCodes[ +CharacterCodes.x.value ];
CharacterCodes.y = wrapped( 'y', 0x79 );
CharacterCodes[ +CharacterCodes.y.value ] = typeof CharacterCodes[ +CharacterCodes.y.value ] !== 'number' ? named( 'y' ) : CharacterCodes[ +CharacterCodes.y.value ];
CharacterCodes.z = wrapped( 'z', 0x7A );
CharacterCodes[ +CharacterCodes.z.value ] = typeof CharacterCodes[ +CharacterCodes.z.value ] !== 'number' ? named( 'z' ) : CharacterCodes[ +CharacterCodes.z.value ];
CharacterCodes.A = wrapped( 'A', 0x41 );
CharacterCodes[ +CharacterCodes.A.value ] = typeof CharacterCodes[ +CharacterCodes.A.value ] !== 'number' ? named( 'A' ) : CharacterCodes[ +CharacterCodes.A.value ];
CharacterCodes.B = wrapped( 'B', 0x42 );
CharacterCodes[ +CharacterCodes.B.value ] = typeof CharacterCodes[ +CharacterCodes.B.value ] !== 'number' ? named( 'B' ) : CharacterCodes[ +CharacterCodes.B.value ];
CharacterCodes.C = wrapped( 'C', 0x43 );
CharacterCodes[ +CharacterCodes.C.value ] = typeof CharacterCodes[ +CharacterCodes.C.value ] !== 'number' ? named( 'C' ) : CharacterCodes[ +CharacterCodes.C.value ];
CharacterCodes.D = wrapped( 'D', 0x44 );
CharacterCodes[ +CharacterCodes.D.value ] = typeof CharacterCodes[ +CharacterCodes.D.value ] !== 'number' ? named( 'D' ) : CharacterCodes[ +CharacterCodes.D.value ];
CharacterCodes.E = wrapped( 'E', 0x45 );
CharacterCodes[ +CharacterCodes.E.value ] = typeof CharacterCodes[ +CharacterCodes.E.value ] !== 'number' ? named( 'E' ) : CharacterCodes[ +CharacterCodes.E.value ];
CharacterCodes.F = wrapped( 'F', 0x46 );
CharacterCodes[ +CharacterCodes.F.value ] = typeof CharacterCodes[ +CharacterCodes.F.value ] !== 'number' ? named( 'F' ) : CharacterCodes[ +CharacterCodes.F.value ];
CharacterCodes.G = wrapped( 'G', 0x47 );
CharacterCodes[ +CharacterCodes.G.value ] = typeof CharacterCodes[ +CharacterCodes.G.value ] !== 'number' ? named( 'G' ) : CharacterCodes[ +CharacterCodes.G.value ];
CharacterCodes.H = wrapped( 'H', 0x48 );
CharacterCodes[ +CharacterCodes.H.value ] = typeof CharacterCodes[ +CharacterCodes.H.value ] !== 'number' ? named( 'H' ) : CharacterCodes[ +CharacterCodes.H.value ];
CharacterCodes.I = wrapped( 'I', 0x49 );
CharacterCodes[ +CharacterCodes.I.value ] = typeof CharacterCodes[ +CharacterCodes.I.value ] !== 'number' ? named( 'I' ) : CharacterCodes[ +CharacterCodes.I.value ];
CharacterCodes.J = wrapped( 'J', 0x4A );
CharacterCodes[ +CharacterCodes.J.value ] = typeof CharacterCodes[ +CharacterCodes.J.value ] !== 'number' ? named( 'J' ) : CharacterCodes[ +CharacterCodes.J.value ];
CharacterCodes.K = wrapped( 'K', 0x4B );
CharacterCodes[ +CharacterCodes.K.value ] = typeof CharacterCodes[ +CharacterCodes.K.value ] !== 'number' ? named( 'K' ) : CharacterCodes[ +CharacterCodes.K.value ];
CharacterCodes.L = wrapped( 'L', 0x4C );
CharacterCodes[ +CharacterCodes.L.value ] = typeof CharacterCodes[ +CharacterCodes.L.value ] !== 'number' ? named( 'L' ) : CharacterCodes[ +CharacterCodes.L.value ];
CharacterCodes.M = wrapped( 'M', 0x4D );
CharacterCodes[ +CharacterCodes.M.value ] = typeof CharacterCodes[ +CharacterCodes.M.value ] !== 'number' ? named( 'M' ) : CharacterCodes[ +CharacterCodes.M.value ];
CharacterCodes.N = wrapped( 'N', 0x4E );
CharacterCodes[ +CharacterCodes.N.value ] = typeof CharacterCodes[ +CharacterCodes.N.value ] !== 'number' ? named( 'N' ) : CharacterCodes[ +CharacterCodes.N.value ];
CharacterCodes.O = wrapped( 'O', 0x4F );
CharacterCodes[ +CharacterCodes.O.value ] = typeof CharacterCodes[ +CharacterCodes.O.value ] !== 'number' ? named( 'O' ) : CharacterCodes[ +CharacterCodes.O.value ];
CharacterCodes.P = wrapped( 'P', 0x50 );
CharacterCodes[ +CharacterCodes.P.value ] = typeof CharacterCodes[ +CharacterCodes.P.value ] !== 'number' ? named( 'P' ) : CharacterCodes[ +CharacterCodes.P.value ];
CharacterCodes.Q = wrapped( 'Q', 0x51 );
CharacterCodes[ +CharacterCodes.Q.value ] = typeof CharacterCodes[ +CharacterCodes.Q.value ] !== 'number' ? named( 'Q' ) : CharacterCodes[ +CharacterCodes.Q.value ];
CharacterCodes.R = wrapped( 'R', 0x52 );
CharacterCodes[ +CharacterCodes.R.value ] = typeof CharacterCodes[ +CharacterCodes.R.value ] !== 'number' ? named( 'R' ) : CharacterCodes[ +CharacterCodes.R.value ];
CharacterCodes.S = wrapped( 'S', 0x53 );
CharacterCodes[ +CharacterCodes.S.value ] = typeof CharacterCodes[ +CharacterCodes.S.value ] !== 'number' ? named( 'S' ) : CharacterCodes[ +CharacterCodes.S.value ];
CharacterCodes.T = wrapped( 'T', 0x54 );
CharacterCodes[ +CharacterCodes.T.value ] = typeof CharacterCodes[ +CharacterCodes.T.value ] !== 'number' ? named( 'T' ) : CharacterCodes[ +CharacterCodes.T.value ];
CharacterCodes.U = wrapped( 'U', 0x55 );
CharacterCodes[ +CharacterCodes.U.value ] = typeof CharacterCodes[ +CharacterCodes.U.value ] !== 'number' ? named( 'U' ) : CharacterCodes[ +CharacterCodes.U.value ];
CharacterCodes.V = wrapped( 'V', 0x56 );
CharacterCodes[ +CharacterCodes.V.value ] = typeof CharacterCodes[ +CharacterCodes.V.value ] !== 'number' ? named( 'V' ) : CharacterCodes[ +CharacterCodes.V.value ];
CharacterCodes.W = wrapped( 'W', 0x57 );
CharacterCodes[ +CharacterCodes.W.value ] = typeof CharacterCodes[ +CharacterCodes.W.value ] !== 'number' ? named( 'W' ) : CharacterCodes[ +CharacterCodes.W.value ];
CharacterCodes.X = wrapped( 'X', 0x58 );
CharacterCodes[ +CharacterCodes.X.value ] = typeof CharacterCodes[ +CharacterCodes.X.value ] !== 'number' ? named( 'X' ) : CharacterCodes[ +CharacterCodes.X.value ];
CharacterCodes.Y = wrapped( 'Y', 0x59 );
CharacterCodes[ +CharacterCodes.Y.value ] = typeof CharacterCodes[ +CharacterCodes.Y.value ] !== 'number' ? named( 'Y' ) : CharacterCodes[ +CharacterCodes.Y.value ];
CharacterCodes.Z = wrapped( 'Z', 0x5a );
CharacterCodes[ +CharacterCodes.Z.value ] = typeof CharacterCodes[ +CharacterCodes.Z.value ] !== 'number' ? named( 'Z' ) : CharacterCodes[ +CharacterCodes.Z.value ];
CharacterCodes.ampersand = wrapped( 'ampersand', 0x26 );
CharacterCodes[ +CharacterCodes.ampersand.value ] = typeof CharacterCodes[ +CharacterCodes.ampersand.value ] !== 'number' ? named( 'ampersand' ) : CharacterCodes[ +CharacterCodes.ampersand.value ];
CharacterCodes.asterisk = wrapped( 'asterisk', 0x2A );
CharacterCodes[ +CharacterCodes.asterisk.value ] = typeof CharacterCodes[ +CharacterCodes.asterisk.value ] !== 'number' ? named( 'asterisk' ) : CharacterCodes[ +CharacterCodes.asterisk.value ];
CharacterCodes.at = wrapped( 'at', 0x40 );
CharacterCodes[ +CharacterCodes.at.value ] = typeof CharacterCodes[ +CharacterCodes.at.value ] !== 'number' ? named( 'at' ) : CharacterCodes[ +CharacterCodes.at.value ];
CharacterCodes.backslash = wrapped( 'backslash', 0x5C );
CharacterCodes[ +CharacterCodes.backslash.value ] = typeof CharacterCodes[ +CharacterCodes.backslash.value ] !== 'number' ? named( 'backslash' ) : CharacterCodes[ +CharacterCodes.backslash.value ];
CharacterCodes.backtick = wrapped( 'backtick', 0x60 );
CharacterCodes[ +CharacterCodes.backtick.value ] = typeof CharacterCodes[ +CharacterCodes.backtick.value ] !== 'number' ? named( 'backtick' ) : CharacterCodes[ +CharacterCodes.backtick.value ];
CharacterCodes.bar = wrapped( 'bar', 0x7C );
CharacterCodes[ +CharacterCodes.bar.value ] = typeof CharacterCodes[ +CharacterCodes.bar.value ] !== 'number' ? named( 'bar' ) : CharacterCodes[ +CharacterCodes.bar.value ];
CharacterCodes.caret = wrapped( 'caret', 0x5E );
CharacterCodes[ +CharacterCodes.caret.value ] = typeof CharacterCodes[ +CharacterCodes.caret.value ] !== 'number' ? named( 'caret' ) : CharacterCodes[ +CharacterCodes.caret.value ];
CharacterCodes.closeBrace = wrapped( 'closeBrace', 0x7D );
CharacterCodes[ +CharacterCodes.closeBrace.value ] = typeof CharacterCodes[ +CharacterCodes.closeBrace.value ] !== 'number' ? named( 'closeBrace' ) : CharacterCodes[ +CharacterCodes.closeBrace.value ];

CharacterCodes = Object.create( templ(), CharacterCodes );
Object.getPrototypeOf( CharacterCodes ).asString = asString( CharacterCodes );

/** *********************************************************************************************************************
 * @enum
 * @name Extension
 ************************************************************************************************************************/
let Extension = {}; // Object.create( ( () => new ( function Extension() {} )() )(), {} );
Extension.Ts = wrapped( 'Ts', ".ts" );
Extension[ +Extension.Ts.value ] = typeof Extension[ +Extension.Ts.value ] !== 'number' ? named( 'Ts' ) : Extension[ +Extension.Ts.value ];
Extension.Tsx = wrapped( 'Tsx', ".tsx" );
Extension[ +Extension.Tsx.value ] = typeof Extension[ +Extension.Tsx.value ] !== 'number' ? named( 'Tsx' ) : Extension[ +Extension.Tsx.value ];
Extension.Dts = wrapped( 'Dts', ".d.ts" );
Extension[ +Extension.Dts.value ] = typeof Extension[ +Extension.Dts.value ] !== 'number' ? named( 'Dts' ) : Extension[ +Extension.Dts.value ];
Extension.Js = wrapped( 'Js', ".js" );
Extension[ +Extension.Js.value ] = typeof Extension[ +Extension.Js.value ] !== 'number' ? named( 'Js' ) : Extension[ +Extension.Js.value ];
Extension.Jsx = wrapped( 'Jsx', ".jsx" );
Extension[ +Extension.Jsx.value ] = typeof Extension[ +Extension.Jsx.value ] !== 'number' ? named( 'Jsx' ) : Extension[ +Extension.Jsx.value ];
Extension.Json = wrapped( 'Json', ".json" );
Extension[ +Extension.Json.value ] = typeof Extension[ +Extension.Json.value ] !== 'number' ? named( 'Json' ) : Extension[ +Extension.Json.value ];

Extension = Object.create( templ(), Extension );
Object.getPrototypeOf( Extension ).asString = asString( Extension );

/** *********************************************************************************************************************
 * @enum
 * @name TransformFlags
 ************************************************************************************************************************/
let TransformFlags = {}; // Object.create( ( () => new ( function TransformFlags() {} )() )(), {} );
TransformFlags.None = wrapped( 'None', 0 );
TransformFlags[ +TransformFlags.None.value ] = typeof TransformFlags[ +TransformFlags.None.value ] !== 'number' ? named( 'None' ) : TransformFlags[ +TransformFlags.None.value ];
TransformFlags.TypeScript = wrapped( 'TypeScript', 1 << 0 );
TransformFlags[ +TransformFlags.TypeScript.value ] = typeof TransformFlags[ +TransformFlags.TypeScript.value ] !== 'number' ? named( 'TypeScript' ) : TransformFlags[ +TransformFlags.TypeScript.value ];
TransformFlags.ContainsTypeScript = wrapped( 'ContainsTypeScript', 1 << 1 );
TransformFlags[ +TransformFlags.ContainsTypeScript.value ] = typeof TransformFlags[ +TransformFlags.ContainsTypeScript.value ] !== 'number' ? named( 'ContainsTypeScript' ) : TransformFlags[ +TransformFlags.ContainsTypeScript.value ];
TransformFlags.ContainsJsx = wrapped( 'ContainsJsx', 1 << 2 );
TransformFlags[ +TransformFlags.ContainsJsx.value ] = typeof TransformFlags[ +TransformFlags.ContainsJsx.value ] !== 'number' ? named( 'ContainsJsx' ) : TransformFlags[ +TransformFlags.ContainsJsx.value ];
TransformFlags.ContainsESNext = wrapped( 'ContainsESNext', 1 << 3 );
TransformFlags[ +TransformFlags.ContainsESNext.value ] = typeof TransformFlags[ +TransformFlags.ContainsESNext.value ] !== 'number' ? named( 'ContainsESNext' ) : TransformFlags[ +TransformFlags.ContainsESNext.value ];
TransformFlags.ContainsES2017 = wrapped( 'ContainsES2017', 1 << 4 );
TransformFlags[ +TransformFlags.ContainsES2017.value ] = typeof TransformFlags[ +TransformFlags.ContainsES2017.value ] !== 'number' ? named( 'ContainsES2017' ) : TransformFlags[ +TransformFlags.ContainsES2017.value ];
TransformFlags.ContainsES2016 = wrapped( 'ContainsES2016', 1 << 5 );
TransformFlags[ +TransformFlags.ContainsES2016.value ] = typeof TransformFlags[ +TransformFlags.ContainsES2016.value ] !== 'number' ? named( 'ContainsES2016' ) : TransformFlags[ +TransformFlags.ContainsES2016.value ];
TransformFlags.ES2015 = wrapped( 'ES2015', 1 << 6 );
TransformFlags[ +TransformFlags.ES2015.value ] = typeof TransformFlags[ +TransformFlags.ES2015.value ] !== 'number' ? named( 'ES2015' ) : TransformFlags[ +TransformFlags.ES2015.value ];
TransformFlags.ContainsES2015 = wrapped( 'ContainsES2015', 1 << 7 );
TransformFlags[ +TransformFlags.ContainsES2015.value ] = typeof TransformFlags[ +TransformFlags.ContainsES2015.value ] !== 'number' ? named( 'ContainsES2015' ) : TransformFlags[ +TransformFlags.ContainsES2015.value ];
TransformFlags.Generator = wrapped( 'Generator', 1 << 8 );
TransformFlags[ +TransformFlags.Generator.value ] = typeof TransformFlags[ +TransformFlags.Generator.value ] !== 'number' ? named( 'Generator' ) : TransformFlags[ +TransformFlags.Generator.value ];
TransformFlags.ContainsGenerator = wrapped( 'ContainsGenerator', 1 << 9 );
TransformFlags[ +TransformFlags.ContainsGenerator.value ] = typeof TransformFlags[ +TransformFlags.ContainsGenerator.value ] !== 'number' ? named( 'ContainsGenerator' ) : TransformFlags[ +TransformFlags.ContainsGenerator.value ];
TransformFlags.DestructuringAssignment = wrapped( 'DestructuringAssignment', 1 << 10 );
TransformFlags[ +TransformFlags.DestructuringAssignment.value ] = typeof TransformFlags[ +TransformFlags.DestructuringAssignment.value ] !== 'number' ? named( 'DestructuringAssignment' ) : TransformFlags[ +TransformFlags.DestructuringAssignment.value ];
TransformFlags.ContainsDestructuringAssignment = wrapped( 'ContainsDestructuringAssignment', 1 << 11 );
TransformFlags[ +TransformFlags.ContainsDestructuringAssignment.value ] = typeof TransformFlags[ +TransformFlags.ContainsDestructuringAssignment.value ] !== 'number' ? named( 'ContainsDestructuringAssignment' ) : TransformFlags[ +TransformFlags.ContainsDestructuringAssignment.value ];
TransformFlags.ContainsDecorators = wrapped( 'ContainsDecorators', 1 << 12 );
TransformFlags[ +TransformFlags.ContainsDecorators.value ] = typeof TransformFlags[ +TransformFlags.ContainsDecorators.value ] !== 'number' ? named( 'ContainsDecorators' ) : TransformFlags[ +TransformFlags.ContainsDecorators.value ];
TransformFlags.ContainsPropertyInitializer = wrapped( 'ContainsPropertyInitializer', 1 << 13 );
TransformFlags[ +TransformFlags.ContainsPropertyInitializer.value ] = typeof TransformFlags[ +TransformFlags.ContainsPropertyInitializer.value ] !== 'number' ? named( 'ContainsPropertyInitializer' ) : TransformFlags[ +TransformFlags.ContainsPropertyInitializer.value ];
TransformFlags.ContainsLexicalThis = wrapped( 'ContainsLexicalThis', 1 << 14 );
TransformFlags[ +TransformFlags.ContainsLexicalThis.value ] = typeof TransformFlags[ +TransformFlags.ContainsLexicalThis.value ] !== 'number' ? named( 'ContainsLexicalThis' ) : TransformFlags[ +TransformFlags.ContainsLexicalThis.value ];
TransformFlags.ContainsCapturedLexicalThis = wrapped( 'ContainsCapturedLexicalThis', 1 << 15 );
TransformFlags[ +TransformFlags.ContainsCapturedLexicalThis.value ] = typeof TransformFlags[ +TransformFlags.ContainsCapturedLexicalThis.value ] !== 'number' ? named( 'ContainsCapturedLexicalThis' ) : TransformFlags[ +TransformFlags.ContainsCapturedLexicalThis.value ];
TransformFlags.ContainsLexicalThisInComputedPropertyName = wrapped( 'ContainsLexicalThisInComputedPropertyName', 1 << 16 );
TransformFlags[ +TransformFlags.ContainsLexicalThisInComputedPropertyName.value ] = typeof TransformFlags[ +TransformFlags.ContainsLexicalThisInComputedPropertyName.value ] !== 'number' ? named( 'ContainsLexicalThisInComputedPropertyName' ) : TransformFlags[ +TransformFlags.ContainsLexicalThisInComputedPropertyName.value ];
TransformFlags.ContainsDefaultValueAssignments = wrapped( 'ContainsDefaultValueAssignments', 1 << 17 );
TransformFlags[ +TransformFlags.ContainsDefaultValueAssignments.value ] = typeof TransformFlags[ +TransformFlags.ContainsDefaultValueAssignments.value ] !== 'number' ? named( 'ContainsDefaultValueAssignments' ) : TransformFlags[ +TransformFlags.ContainsDefaultValueAssignments.value ];
TransformFlags.ContainsParameterPropertyAssignments = wrapped( 'ContainsParameterPropertyAssignments', 1 << 18 );
TransformFlags[ +TransformFlags.ContainsParameterPropertyAssignments.value ] = typeof TransformFlags[ +TransformFlags.ContainsParameterPropertyAssignments.value ] !== 'number' ? named( 'ContainsParameterPropertyAssignments' ) : TransformFlags[ +TransformFlags.ContainsParameterPropertyAssignments.value ];
TransformFlags.ContainsSpread = wrapped( 'ContainsSpread', 1 << 19 );
TransformFlags[ +TransformFlags.ContainsSpread.value ] = typeof TransformFlags[ +TransformFlags.ContainsSpread.value ] !== 'number' ? named( 'ContainsSpread' ) : TransformFlags[ +TransformFlags.ContainsSpread.value ];
TransformFlags.ContainsObjectSpread = wrapped( 'ContainsObjectSpread', 1 << 20 );
TransformFlags[ +TransformFlags.ContainsObjectSpread.value ] = typeof TransformFlags[ +TransformFlags.ContainsObjectSpread.value ] !== 'number' ? named( 'ContainsObjectSpread' ) : TransformFlags[ +TransformFlags.ContainsObjectSpread.value ];
TransformFlags.ContainsRest = wrapped( 'ContainsRest', +TransformFlags.ContainsSpread );
TransformFlags[ +TransformFlags.ContainsRest.value ] = typeof TransformFlags[ +TransformFlags.ContainsRest.value ] !== 'number' ? named( 'ContainsRest' ) : TransformFlags[ +TransformFlags.ContainsRest.value ];
TransformFlags.ContainsObjectRest = wrapped( 'ContainsObjectRest', +TransformFlags.ContainsObjectSpread );
TransformFlags[ +TransformFlags.ContainsObjectRest.value ] = typeof TransformFlags[ +TransformFlags.ContainsObjectRest.value ] !== 'number' ? named( 'ContainsObjectRest' ) : TransformFlags[ +TransformFlags.ContainsObjectRest.value ];
TransformFlags.ContainsComputedPropertyName = wrapped( 'ContainsComputedPropertyName', 1 << 21 );
TransformFlags[ +TransformFlags.ContainsComputedPropertyName.value ] = typeof TransformFlags[ +TransformFlags.ContainsComputedPropertyName.value ] !== 'number' ? named( 'ContainsComputedPropertyName' ) : TransformFlags[ +TransformFlags.ContainsComputedPropertyName.value ];
TransformFlags.ContainsBlockScopedBinding = wrapped( 'ContainsBlockScopedBinding', 1 << 22 );
TransformFlags[ +TransformFlags.ContainsBlockScopedBinding.value ] = typeof TransformFlags[ +TransformFlags.ContainsBlockScopedBinding.value ] !== 'number' ? named( 'ContainsBlockScopedBinding' ) : TransformFlags[ +TransformFlags.ContainsBlockScopedBinding.value ];
TransformFlags.ContainsBindingPattern = wrapped( 'ContainsBindingPattern', 1 << 23 );
TransformFlags[ +TransformFlags.ContainsBindingPattern.value ] = typeof TransformFlags[ +TransformFlags.ContainsBindingPattern.value ] !== 'number' ? named( 'ContainsBindingPattern' ) : TransformFlags[ +TransformFlags.ContainsBindingPattern.value ];
TransformFlags.ContainsYield = wrapped( 'ContainsYield', 1 << 24 );
TransformFlags[ +TransformFlags.ContainsYield.value ] = typeof TransformFlags[ +TransformFlags.ContainsYield.value ] !== 'number' ? named( 'ContainsYield' ) : TransformFlags[ +TransformFlags.ContainsYield.value ];
TransformFlags.ContainsHoistedDeclarationOrCompletion = wrapped( 'ContainsHoistedDeclarationOrCompletion', 1 << 25 );
TransformFlags[ +TransformFlags.ContainsHoistedDeclarationOrCompletion.value ] = typeof TransformFlags[ +TransformFlags.ContainsHoistedDeclarationOrCompletion.value ] !== 'number' ? named( 'ContainsHoistedDeclarationOrCompletion' ) : TransformFlags[ +TransformFlags.ContainsHoistedDeclarationOrCompletion.value ];
TransformFlags.ContainsDynamicImport = wrapped( 'ContainsDynamicImport', 1 << 26 );
TransformFlags[ +TransformFlags.ContainsDynamicImport.value ] = typeof TransformFlags[ +TransformFlags.ContainsDynamicImport.value ] !== 'number' ? named( 'ContainsDynamicImport' ) : TransformFlags[ +TransformFlags.ContainsDynamicImport.value ];
TransformFlags.HasComputedFlags = wrapped( 'HasComputedFlags', 1 << 29 );
TransformFlags[ +TransformFlags.HasComputedFlags.value ] = typeof TransformFlags[ +TransformFlags.HasComputedFlags.value ] !== 'number' ? named( 'HasComputedFlags' ) : TransformFlags[ +TransformFlags.HasComputedFlags.value ];
TransformFlags.AssertTypeScript = wrapped( 'AssertTypeScript', TransformFlags.TypeScript | TransformFlags.ContainsTypeScript );
TransformFlags[ +TransformFlags.AssertTypeScript.value ] = typeof TransformFlags[ +TransformFlags.AssertTypeScript.value ] !== 'number' ? named( 'AssertTypeScript' ) : TransformFlags[ +TransformFlags.AssertTypeScript.value ];
TransformFlags.AssertJsx = wrapped( 'AssertJsx', +TransformFlags.ContainsJsx );
TransformFlags[ +TransformFlags.AssertJsx.value ] = typeof TransformFlags[ +TransformFlags.AssertJsx.value ] !== 'number' ? named( 'AssertJsx' ) : TransformFlags[ +TransformFlags.AssertJsx.value ];
TransformFlags.AssertESNext = wrapped( 'AssertESNext', +TransformFlags.ContainsESNext );
TransformFlags[ +TransformFlags.AssertESNext.value ] = typeof TransformFlags[ +TransformFlags.AssertESNext.value ] !== 'number' ? named( 'AssertESNext' ) : TransformFlags[ +TransformFlags.AssertESNext.value ];
TransformFlags.AssertES2017 = wrapped( 'AssertES2017', +TransformFlags.ContainsES2017 );
TransformFlags[ +TransformFlags.AssertES2017.value ] = typeof TransformFlags[ +TransformFlags.AssertES2017.value ] !== 'number' ? named( 'AssertES2017' ) : TransformFlags[ +TransformFlags.AssertES2017.value ];
TransformFlags.AssertES2016 = wrapped( 'AssertES2016', +TransformFlags.ContainsES2016 );
TransformFlags[ +TransformFlags.AssertES2016.value ] = typeof TransformFlags[ +TransformFlags.AssertES2016.value ] !== 'number' ? named( 'AssertES2016' ) : TransformFlags[ +TransformFlags.AssertES2016.value ];
TransformFlags.AssertES2015 = wrapped( 'AssertES2015', TransformFlags.ES2015 | TransformFlags.ContainsES2015 );
TransformFlags[ +TransformFlags.AssertES2015.value ] = typeof TransformFlags[ +TransformFlags.AssertES2015.value ] !== 'number' ? named( 'AssertES2015' ) : TransformFlags[ +TransformFlags.AssertES2015.value ];
TransformFlags.AssertGenerator = wrapped( 'AssertGenerator', TransformFlags.Generator | TransformFlags.ContainsGenerator );
TransformFlags[ +TransformFlags.AssertGenerator.value ] = typeof TransformFlags[ +TransformFlags.AssertGenerator.value ] !== 'number' ? named( 'AssertGenerator' ) : TransformFlags[ +TransformFlags.AssertGenerator.value ];
TransformFlags.AssertDestructuringAssignment = wrapped( 'AssertDestructuringAssignment', TransformFlags.DestructuringAssignment | TransformFlags.ContainsDestructuringAssignment );
TransformFlags[ +TransformFlags.AssertDestructuringAssignment.value ] = typeof TransformFlags[ +TransformFlags.AssertDestructuringAssignment.value ] !== 'number' ? named( 'AssertDestructuringAssignment' ) : TransformFlags[ +TransformFlags.AssertDestructuringAssignment.value ];
TransformFlags.NodeExcludes = wrapped( 'NodeExcludes', TransformFlags.TypeScript | TransformFlags.ES2015 | TransformFlags.DestructuringAssignment | TransformFlags.Generator | TransformFlags.HasComputedFlags );
TransformFlags[ +TransformFlags.NodeExcludes.value ] = typeof TransformFlags[ +TransformFlags.NodeExcludes.value ] !== 'number' ? named( 'NodeExcludes' ) : TransformFlags[ +TransformFlags.NodeExcludes.value ];
TransformFlags.ArrowFunctionExcludes = wrapped( 'ArrowFunctionExcludes', TransformFlags.NodeExcludes | TransformFlags.ContainsDecorators | TransformFlags.ContainsDefaultValueAssignments | TransformFlags.ContainsLexicalThis | TransformFlags.ContainsParameterPropertyAssignments | TransformFlags.ContainsBlockScopedBinding | TransformFlags.ContainsYield | TransformFlags.ContainsHoistedDeclarationOrCompletion | TransformFlags.ContainsBindingPattern | TransformFlags.ContainsObjectRest );
TransformFlags[ +TransformFlags.ArrowFunctionExcludes.value ] = typeof TransformFlags[ +TransformFlags.ArrowFunctionExcludes.value ] !== 'number' ? named( 'ArrowFunctionExcludes' ) : TransformFlags[ +TransformFlags.ArrowFunctionExcludes.value ];
TransformFlags.FunctionExcludes = wrapped( 'FunctionExcludes', TransformFlags.NodeExcludes | TransformFlags.ContainsDecorators | TransformFlags.ContainsDefaultValueAssignments | TransformFlags.ContainsCapturedLexicalThis | TransformFlags.ContainsLexicalThis | TransformFlags.ContainsParameterPropertyAssignments | TransformFlags.ContainsBlockScopedBinding | TransformFlags.ContainsYield | TransformFlags.ContainsHoistedDeclarationOrCompletion | TransformFlags.ContainsBindingPattern | TransformFlags.ContainsObjectRest );
TransformFlags[ +TransformFlags.FunctionExcludes.value ] = typeof TransformFlags[ +TransformFlags.FunctionExcludes.value ] !== 'number' ? named( 'FunctionExcludes' ) : TransformFlags[ +TransformFlags.FunctionExcludes.value ];
TransformFlags.ConstructorExcludes = wrapped( 'ConstructorExcludes', TransformFlags.NodeExcludes | TransformFlags.ContainsDefaultValueAssignments | TransformFlags.ContainsLexicalThis | TransformFlags.ContainsCapturedLexicalThis | TransformFlags.ContainsBlockScopedBinding | TransformFlags.ContainsYield | TransformFlags.ContainsHoistedDeclarationOrCompletion | TransformFlags.ContainsBindingPattern | TransformFlags.ContainsObjectRest );
TransformFlags[ +TransformFlags.ConstructorExcludes.value ] = typeof TransformFlags[ +TransformFlags.ConstructorExcludes.value ] !== 'number' ? named( 'ConstructorExcludes' ) : TransformFlags[ +TransformFlags.ConstructorExcludes.value ];
TransformFlags.MethodOrAccessorExcludes = wrapped( 'MethodOrAccessorExcludes', TransformFlags.NodeExcludes | TransformFlags.ContainsDefaultValueAssignments | TransformFlags.ContainsLexicalThis | TransformFlags.ContainsCapturedLexicalThis | TransformFlags.ContainsBlockScopedBinding | TransformFlags.ContainsYield | TransformFlags.ContainsHoistedDeclarationOrCompletion | TransformFlags.ContainsBindingPattern | TransformFlags.ContainsObjectRest );
TransformFlags[ +TransformFlags.MethodOrAccessorExcludes.value ] = typeof TransformFlags[ +TransformFlags.MethodOrAccessorExcludes.value ] !== 'number' ? named( 'MethodOrAccessorExcludes' ) : TransformFlags[ +TransformFlags.MethodOrAccessorExcludes.value ];
TransformFlags.ClassExcludes = wrapped( 'ClassExcludes', TransformFlags.NodeExcludes | TransformFlags.ContainsDecorators | TransformFlags.ContainsPropertyInitializer | TransformFlags.ContainsLexicalThis | TransformFlags.ContainsCapturedLexicalThis | TransformFlags.ContainsComputedPropertyName | TransformFlags.ContainsParameterPropertyAssignments | TransformFlags.ContainsLexicalThisInComputedPropertyName );
TransformFlags[ +TransformFlags.ClassExcludes.value ] = typeof TransformFlags[ +TransformFlags.ClassExcludes.value ] !== 'number' ? named( 'ClassExcludes' ) : TransformFlags[ +TransformFlags.ClassExcludes.value ];
TransformFlags.ModuleExcludes = wrapped( 'ModuleExcludes', TransformFlags.NodeExcludes | TransformFlags.ContainsDecorators | TransformFlags.ContainsLexicalThis | TransformFlags.ContainsCapturedLexicalThis | TransformFlags.ContainsBlockScopedBinding | TransformFlags.ContainsHoistedDeclarationOrCompletion );
TransformFlags[ +TransformFlags.ModuleExcludes.value ] = typeof TransformFlags[ +TransformFlags.ModuleExcludes.value ] !== 'number' ? named( 'ModuleExcludes' ) : TransformFlags[ +TransformFlags.ModuleExcludes.value ];
TransformFlags.TypeExcludes = wrapped( 'TypeExcludes', ~TransformFlags.ContainsTypeScript );
TransformFlags[ +TransformFlags.TypeExcludes.value ] = typeof TransformFlags[ +TransformFlags.TypeExcludes.value ] !== 'number' ? named( 'TypeExcludes' ) : TransformFlags[ +TransformFlags.TypeExcludes.value ];
TransformFlags.ObjectLiteralExcludes = wrapped( 'ObjectLiteralExcludes', TransformFlags.NodeExcludes | TransformFlags.ContainsDecorators | TransformFlags.ContainsComputedPropertyName | TransformFlags.ContainsLexicalThisInComputedPropertyName | TransformFlags.ContainsObjectSpread );
TransformFlags[ +TransformFlags.ObjectLiteralExcludes.value ] = typeof TransformFlags[ +TransformFlags.ObjectLiteralExcludes.value ] !== 'number' ? named( 'ObjectLiteralExcludes' ) : TransformFlags[ +TransformFlags.ObjectLiteralExcludes.value ];
TransformFlags.ArrayLiteralOrCallOrNewExcludes = wrapped( 'ArrayLiteralOrCallOrNewExcludes', TransformFlags.NodeExcludes | TransformFlags.ContainsSpread );
TransformFlags[ +TransformFlags.ArrayLiteralOrCallOrNewExcludes.value ] = typeof TransformFlags[ +TransformFlags.ArrayLiteralOrCallOrNewExcludes.value ] !== 'number' ? named( 'ArrayLiteralOrCallOrNewExcludes' ) : TransformFlags[ +TransformFlags.ArrayLiteralOrCallOrNewExcludes.value ];
TransformFlags.VariableDeclarationListExcludes = wrapped( 'VariableDeclarationListExcludes', TransformFlags.NodeExcludes | TransformFlags.ContainsBindingPattern | TransformFlags.ContainsObjectRest );
TransformFlags[ +TransformFlags.VariableDeclarationListExcludes.value ] = typeof TransformFlags[ +TransformFlags.VariableDeclarationListExcludes.value ] !== 'number' ? named( 'VariableDeclarationListExcludes' ) : TransformFlags[ +TransformFlags.VariableDeclarationListExcludes.value ];
TransformFlags.ParameterExcludes = wrapped( 'ParameterExcludes', +TransformFlags.NodeExcludes );
TransformFlags[ +TransformFlags.ParameterExcludes.value ] = typeof TransformFlags[ +TransformFlags.ParameterExcludes.value ] !== 'number' ? named( 'ParameterExcludes' ) : TransformFlags[ +TransformFlags.ParameterExcludes.value ];
TransformFlags.CatchClauseExcludes = wrapped( 'CatchClauseExcludes', TransformFlags.NodeExcludes | TransformFlags.ContainsObjectRest );
TransformFlags[ +TransformFlags.CatchClauseExcludes.value ] = typeof TransformFlags[ +TransformFlags.CatchClauseExcludes.value ] !== 'number' ? named( 'CatchClauseExcludes' ) : TransformFlags[ +TransformFlags.CatchClauseExcludes.value ];
TransformFlags.BindingPatternExcludes = wrapped( 'BindingPatternExcludes', TransformFlags.NodeExcludes | TransformFlags.ContainsRest );
TransformFlags[ +TransformFlags.BindingPatternExcludes.value ] = typeof TransformFlags[ +TransformFlags.BindingPatternExcludes.value ] !== 'number' ? named( 'BindingPatternExcludes' ) : TransformFlags[ +TransformFlags.BindingPatternExcludes.value ];
TransformFlags.TypeScriptClassSyntaxMask = wrapped( 'TypeScriptClassSyntaxMask', TransformFlags.ContainsParameterPropertyAssignments | TransformFlags.ContainsPropertyInitializer | TransformFlags.ContainsDecorators );
TransformFlags[ +TransformFlags.TypeScriptClassSyntaxMask.value ] = typeof TransformFlags[ +TransformFlags.TypeScriptClassSyntaxMask.value ] !== 'number' ? named( 'TypeScriptClassSyntaxMask' ) : TransformFlags[ +TransformFlags.TypeScriptClassSyntaxMask.value ];
TransformFlags.ES2015FunctionSyntaxMask = wrapped( 'ES2015FunctionSyntaxMask', TransformFlags.ContainsCapturedLexicalThis | TransformFlags.ContainsDefaultValueAssignments );
TransformFlags[ +TransformFlags.ES2015FunctionSyntaxMask.value ] = typeof TransformFlags[ +TransformFlags.ES2015FunctionSyntaxMask.value ] !== 'number' ? named( 'ES2015FunctionSyntaxMask' ) : TransformFlags[ +TransformFlags.ES2015FunctionSyntaxMask.value ];

TransformFlags = Object.create( templ(), TransformFlags );
Object.getPrototypeOf( TransformFlags ).asString = asString( TransformFlags );

/** *********************************************************************************************************************
 * @enum
 * @name EmitFlags
 ************************************************************************************************************************/
let EmitFlags = {}; // Object.create( ( () => new ( function EmitFlags() {} )() )(), {} );
EmitFlags.SingleLine = wrapped( 'SingleLine', 1 << 0 );
EmitFlags[ +EmitFlags.SingleLine.value ] = typeof EmitFlags[ +EmitFlags.SingleLine.value ] !== 'number' ? named( 'SingleLine' ) : EmitFlags[ +EmitFlags.SingleLine.value ];
EmitFlags.AdviseOnEmitNode = wrapped( 'AdviseOnEmitNode', 1 << 1 );
EmitFlags[ +EmitFlags.AdviseOnEmitNode.value ] = typeof EmitFlags[ +EmitFlags.AdviseOnEmitNode.value ] !== 'number' ? named( 'AdviseOnEmitNode' ) : EmitFlags[ +EmitFlags.AdviseOnEmitNode.value ];
EmitFlags.NoSubstitution = wrapped( 'NoSubstitution', 1 << 2 );
EmitFlags[ +EmitFlags.NoSubstitution.value ] = typeof EmitFlags[ +EmitFlags.NoSubstitution.value ] !== 'number' ? named( 'NoSubstitution' ) : EmitFlags[ +EmitFlags.NoSubstitution.value ];
EmitFlags.CapturesThis = wrapped( 'CapturesThis', 1 << 3 );
EmitFlags[ +EmitFlags.CapturesThis.value ] = typeof EmitFlags[ +EmitFlags.CapturesThis.value ] !== 'number' ? named( 'CapturesThis' ) : EmitFlags[ +EmitFlags.CapturesThis.value ];
EmitFlags.NoLeadingSourceMap = wrapped( 'NoLeadingSourceMap', 1 << 4 );
EmitFlags[ +EmitFlags.NoLeadingSourceMap.value ] = typeof EmitFlags[ +EmitFlags.NoLeadingSourceMap.value ] !== 'number' ? named( 'NoLeadingSourceMap' ) : EmitFlags[ +EmitFlags.NoLeadingSourceMap.value ];
EmitFlags.NoTrailingSourceMap = wrapped( 'NoTrailingSourceMap', 1 << 5 );
EmitFlags[ +EmitFlags.NoTrailingSourceMap.value ] = typeof EmitFlags[ +EmitFlags.NoTrailingSourceMap.value ] !== 'number' ? named( 'NoTrailingSourceMap' ) : EmitFlags[ +EmitFlags.NoTrailingSourceMap.value ];
EmitFlags.NoSourceMap = wrapped( 'NoSourceMap', EmitFlags.NoLeadingSourceMap | EmitFlags.NoTrailingSourceMap );
EmitFlags[ +EmitFlags.NoSourceMap.value ] = typeof EmitFlags[ +EmitFlags.NoSourceMap.value ] !== 'number' ? named( 'NoSourceMap' ) : EmitFlags[ +EmitFlags.NoSourceMap.value ];
EmitFlags.NoNestedSourceMaps = wrapped( 'NoNestedSourceMaps', 1 << 6 );
EmitFlags[ +EmitFlags.NoNestedSourceMaps.value ] = typeof EmitFlags[ +EmitFlags.NoNestedSourceMaps.value ] !== 'number' ? named( 'NoNestedSourceMaps' ) : EmitFlags[ +EmitFlags.NoNestedSourceMaps.value ];
EmitFlags.NoTokenLeadingSourceMaps = wrapped( 'NoTokenLeadingSourceMaps', 1 << 7 );
EmitFlags[ +EmitFlags.NoTokenLeadingSourceMaps.value ] = typeof EmitFlags[ +EmitFlags.NoTokenLeadingSourceMaps.value ] !== 'number' ? named( 'NoTokenLeadingSourceMaps' ) : EmitFlags[ +EmitFlags.NoTokenLeadingSourceMaps.value ];
EmitFlags.NoTokenTrailingSourceMaps = wrapped( 'NoTokenTrailingSourceMaps', 1 << 8 );
EmitFlags[ +EmitFlags.NoTokenTrailingSourceMaps.value ] = typeof EmitFlags[ +EmitFlags.NoTokenTrailingSourceMaps.value ] !== 'number' ? named( 'NoTokenTrailingSourceMaps' ) : EmitFlags[ +EmitFlags.NoTokenTrailingSourceMaps.value ];
EmitFlags.NoTokenSourceMaps = wrapped( 'NoTokenSourceMaps', EmitFlags.NoTokenLeadingSourceMaps | EmitFlags.NoTokenTrailingSourceMaps );
EmitFlags[ +EmitFlags.NoTokenSourceMaps.value ] = typeof EmitFlags[ +EmitFlags.NoTokenSourceMaps.value ] !== 'number' ? named( 'NoTokenSourceMaps' ) : EmitFlags[ +EmitFlags.NoTokenSourceMaps.value ];
EmitFlags.NoLeadingComments = wrapped( 'NoLeadingComments', 1 << 9 );
EmitFlags[ +EmitFlags.NoLeadingComments.value ] = typeof EmitFlags[ +EmitFlags.NoLeadingComments.value ] !== 'number' ? named( 'NoLeadingComments' ) : EmitFlags[ +EmitFlags.NoLeadingComments.value ];
EmitFlags.NoTrailingComments = wrapped( 'NoTrailingComments', 1 << 10 );
EmitFlags[ +EmitFlags.NoTrailingComments.value ] = typeof EmitFlags[ +EmitFlags.NoTrailingComments.value ] !== 'number' ? named( 'NoTrailingComments' ) : EmitFlags[ +EmitFlags.NoTrailingComments.value ];
EmitFlags.NoComments = wrapped( 'NoComments', EmitFlags.NoLeadingComments | EmitFlags.NoTrailingComments );
EmitFlags[ +EmitFlags.NoComments.value ] = typeof EmitFlags[ +EmitFlags.NoComments.value ] !== 'number' ? named( 'NoComments' ) : EmitFlags[ +EmitFlags.NoComments.value ];
EmitFlags.NoNestedComments = wrapped( 'NoNestedComments', 1 << 11 );
EmitFlags[ +EmitFlags.NoNestedComments.value ] = typeof EmitFlags[ +EmitFlags.NoNestedComments.value ] !== 'number' ? named( 'NoNestedComments' ) : EmitFlags[ +EmitFlags.NoNestedComments.value ];
EmitFlags.HelperName = wrapped( 'HelperName', 1 << 12 );
EmitFlags[ +EmitFlags.HelperName.value ] = typeof EmitFlags[ +EmitFlags.HelperName.value ] !== 'number' ? named( 'HelperName' ) : EmitFlags[ +EmitFlags.HelperName.value ];
EmitFlags.ExportName = wrapped( 'ExportName', 1 << 13 );
EmitFlags[ +EmitFlags.ExportName.value ] = typeof EmitFlags[ +EmitFlags.ExportName.value ] !== 'number' ? named( 'ExportName' ) : EmitFlags[ +EmitFlags.ExportName.value ];
EmitFlags.LocalName = wrapped( 'LocalName', 1 << 14 );
EmitFlags[ +EmitFlags.LocalName.value ] = typeof EmitFlags[ +EmitFlags.LocalName.value ] !== 'number' ? named( 'LocalName' ) : EmitFlags[ +EmitFlags.LocalName.value ];
EmitFlags.InternalName = wrapped( 'InternalName', 1 << 15 );
EmitFlags[ +EmitFlags.InternalName.value ] = typeof EmitFlags[ +EmitFlags.InternalName.value ] !== 'number' ? named( 'InternalName' ) : EmitFlags[ +EmitFlags.InternalName.value ];
EmitFlags.Indented = wrapped( 'Indented', 1 << 16 );
EmitFlags[ +EmitFlags.Indented.value ] = typeof EmitFlags[ +EmitFlags.Indented.value ] !== 'number' ? named( 'Indented' ) : EmitFlags[ +EmitFlags.Indented.value ];
EmitFlags.NoIndentation = wrapped( 'NoIndentation', 1 << 17 );
EmitFlags[ +EmitFlags.NoIndentation.value ] = typeof EmitFlags[ +EmitFlags.NoIndentation.value ] !== 'number' ? named( 'NoIndentation' ) : EmitFlags[ +EmitFlags.NoIndentation.value ];
EmitFlags.AsyncFunctionBody = wrapped( 'AsyncFunctionBody', 1 << 18 );
EmitFlags[ +EmitFlags.AsyncFunctionBody.value ] = typeof EmitFlags[ +EmitFlags.AsyncFunctionBody.value ] !== 'number' ? named( 'AsyncFunctionBody' ) : EmitFlags[ +EmitFlags.AsyncFunctionBody.value ];
EmitFlags.ReuseTempVariableScope = wrapped( 'ReuseTempVariableScope', 1 << 19 );
EmitFlags[ +EmitFlags.ReuseTempVariableScope.value ] = typeof EmitFlags[ +EmitFlags.ReuseTempVariableScope.value ] !== 'number' ? named( 'ReuseTempVariableScope' ) : EmitFlags[ +EmitFlags.ReuseTempVariableScope.value ];
EmitFlags.CustomPrologue = wrapped( 'CustomPrologue', 1 << 20 );
EmitFlags[ +EmitFlags.CustomPrologue.value ] = typeof EmitFlags[ +EmitFlags.CustomPrologue.value ] !== 'number' ? named( 'CustomPrologue' ) : EmitFlags[ +EmitFlags.CustomPrologue.value ];
EmitFlags.NoHoisting = wrapped( 'NoHoisting', 1 << 21 );
EmitFlags[ +EmitFlags.NoHoisting.value ] = typeof EmitFlags[ +EmitFlags.NoHoisting.value ] !== 'number' ? named( 'NoHoisting' ) : EmitFlags[ +EmitFlags.NoHoisting.value ];
EmitFlags.HasEndOfDeclarationMarker = wrapped( 'HasEndOfDeclarationMarker', 1 << 22 );
EmitFlags[ +EmitFlags.HasEndOfDeclarationMarker.value ] = typeof EmitFlags[ +EmitFlags.HasEndOfDeclarationMarker.value ] !== 'number' ? named( 'HasEndOfDeclarationMarker' ) : EmitFlags[ +EmitFlags.HasEndOfDeclarationMarker.value ];
EmitFlags.Iterator = wrapped( 'Iterator', 1 << 23 );
EmitFlags[ +EmitFlags.Iterator.value ] = typeof EmitFlags[ +EmitFlags.Iterator.value ] !== 'number' ? named( 'Iterator' ) : EmitFlags[ +EmitFlags.Iterator.value ];
EmitFlags.NoAsciiEscaping = wrapped( 'NoAsciiEscaping', 1 << 24 );
EmitFlags[ +EmitFlags.NoAsciiEscaping.value ] = typeof EmitFlags[ +EmitFlags.NoAsciiEscaping.value ] !== 'number' ? named( 'NoAsciiEscaping' ) : EmitFlags[ +EmitFlags.NoAsciiEscaping.value ];

EmitFlags = Object.create( templ(), EmitFlags );
Object.getPrototypeOf( EmitFlags ).asString = asString( EmitFlags );

/** *********************************************************************************************************************
 * @enum
 * @name ExternalEmitHelpers
 ************************************************************************************************************************/
let ExternalEmitHelpers = {}; // Object.create( ( () => new ( function ExternalEmitHelpers() {} )() )(), {} );
ExternalEmitHelpers.Extends = wrapped( 'Extends', 1 << 0 );
ExternalEmitHelpers[ +ExternalEmitHelpers.Extends.value ] = typeof ExternalEmitHelpers[ +ExternalEmitHelpers.Extends.value ] !== 'number' ? named( 'Extends' ) : ExternalEmitHelpers[ +ExternalEmitHelpers.Extends.value ];
ExternalEmitHelpers.Assign = wrapped( 'Assign', 1 << 1 );
ExternalEmitHelpers[ +ExternalEmitHelpers.Assign.value ] = typeof ExternalEmitHelpers[ +ExternalEmitHelpers.Assign.value ] !== 'number' ? named( 'Assign' ) : ExternalEmitHelpers[ +ExternalEmitHelpers.Assign.value ];
ExternalEmitHelpers.Rest = wrapped( 'Rest', 1 << 2 );
ExternalEmitHelpers[ +ExternalEmitHelpers.Rest.value ] = typeof ExternalEmitHelpers[ +ExternalEmitHelpers.Rest.value ] !== 'number' ? named( 'Rest' ) : ExternalEmitHelpers[ +ExternalEmitHelpers.Rest.value ];
ExternalEmitHelpers.Decorate = wrapped( 'Decorate', 1 << 3 );
ExternalEmitHelpers[ +ExternalEmitHelpers.Decorate.value ] = typeof ExternalEmitHelpers[ +ExternalEmitHelpers.Decorate.value ] !== 'number' ? named( 'Decorate' ) : ExternalEmitHelpers[ +ExternalEmitHelpers.Decorate.value ];
ExternalEmitHelpers.Metadata = wrapped( 'Metadata', 1 << 4 );
ExternalEmitHelpers[ +ExternalEmitHelpers.Metadata.value ] = typeof ExternalEmitHelpers[ +ExternalEmitHelpers.Metadata.value ] !== 'number' ? named( 'Metadata' ) : ExternalEmitHelpers[ +ExternalEmitHelpers.Metadata.value ];
ExternalEmitHelpers.Param = wrapped( 'Param', 1 << 5 );
ExternalEmitHelpers[ +ExternalEmitHelpers.Param.value ] = typeof ExternalEmitHelpers[ +ExternalEmitHelpers.Param.value ] !== 'number' ? named( 'Param' ) : ExternalEmitHelpers[ +ExternalEmitHelpers.Param.value ];
ExternalEmitHelpers.Awaiter = wrapped( 'Awaiter', 1 << 6 );
ExternalEmitHelpers[ +ExternalEmitHelpers.Awaiter.value ] = typeof ExternalEmitHelpers[ +ExternalEmitHelpers.Awaiter.value ] !== 'number' ? named( 'Awaiter' ) : ExternalEmitHelpers[ +ExternalEmitHelpers.Awaiter.value ];
ExternalEmitHelpers.Generator = wrapped( 'Generator', 1 << 7 );
ExternalEmitHelpers[ +ExternalEmitHelpers.Generator.value ] = typeof ExternalEmitHelpers[ +ExternalEmitHelpers.Generator.value ] !== 'number' ? named( 'Generator' ) : ExternalEmitHelpers[ +ExternalEmitHelpers.Generator.value ];
ExternalEmitHelpers.Values = wrapped( 'Values', 1 << 8 );
ExternalEmitHelpers[ +ExternalEmitHelpers.Values.value ] = typeof ExternalEmitHelpers[ +ExternalEmitHelpers.Values.value ] !== 'number' ? named( 'Values' ) : ExternalEmitHelpers[ +ExternalEmitHelpers.Values.value ];
ExternalEmitHelpers.Read = wrapped( 'Read', 1 << 9 );
ExternalEmitHelpers[ +ExternalEmitHelpers.Read.value ] = typeof ExternalEmitHelpers[ +ExternalEmitHelpers.Read.value ] !== 'number' ? named( 'Read' ) : ExternalEmitHelpers[ +ExternalEmitHelpers.Read.value ];
ExternalEmitHelpers.Spread = wrapped( 'Spread', 1 << 10 );
ExternalEmitHelpers[ +ExternalEmitHelpers.Spread.value ] = typeof ExternalEmitHelpers[ +ExternalEmitHelpers.Spread.value ] !== 'number' ? named( 'Spread' ) : ExternalEmitHelpers[ +ExternalEmitHelpers.Spread.value ];
ExternalEmitHelpers.Await = wrapped( 'Await', 1 << 11 );
ExternalEmitHelpers[ +ExternalEmitHelpers.Await.value ] = typeof ExternalEmitHelpers[ +ExternalEmitHelpers.Await.value ] !== 'number' ? named( 'Await' ) : ExternalEmitHelpers[ +ExternalEmitHelpers.Await.value ];
ExternalEmitHelpers.AsyncGenerator = wrapped( 'AsyncGenerator', 1 << 12 );
ExternalEmitHelpers[ +ExternalEmitHelpers.AsyncGenerator.value ] = typeof ExternalEmitHelpers[ +ExternalEmitHelpers.AsyncGenerator.value ] !== 'number' ? named( 'AsyncGenerator' ) : ExternalEmitHelpers[ +ExternalEmitHelpers.AsyncGenerator.value ];
ExternalEmitHelpers.AsyncDelegator = wrapped( 'AsyncDelegator', 1 << 13 );
ExternalEmitHelpers[ +ExternalEmitHelpers.AsyncDelegator.value ] = typeof ExternalEmitHelpers[ +ExternalEmitHelpers.AsyncDelegator.value ] !== 'number' ? named( 'AsyncDelegator' ) : ExternalEmitHelpers[ +ExternalEmitHelpers.AsyncDelegator.value ];
ExternalEmitHelpers.AsyncValues = wrapped( 'AsyncValues', 1 << 14 );
ExternalEmitHelpers[ +ExternalEmitHelpers.AsyncValues.value ] = typeof ExternalEmitHelpers[ +ExternalEmitHelpers.AsyncValues.value ] !== 'number' ? named( 'AsyncValues' ) : ExternalEmitHelpers[ +ExternalEmitHelpers.AsyncValues.value ];
ExternalEmitHelpers.ExportStar = wrapped( 'ExportStar', 1 << 15 );
ExternalEmitHelpers[ +ExternalEmitHelpers.ExportStar.value ] = typeof ExternalEmitHelpers[ +ExternalEmitHelpers.ExportStar.value ] !== 'number' ? named( 'ExportStar' ) : ExternalEmitHelpers[ +ExternalEmitHelpers.ExportStar.value ];
ExternalEmitHelpers.MakeTemplateObject = wrapped( 'MakeTemplateObject', 1 << 16 );
ExternalEmitHelpers[ +ExternalEmitHelpers.MakeTemplateObject.value ] = typeof ExternalEmitHelpers[ +ExternalEmitHelpers.MakeTemplateObject.value ] !== 'number' ? named( 'MakeTemplateObject' ) : ExternalEmitHelpers[ +ExternalEmitHelpers.MakeTemplateObject.value ];
ExternalEmitHelpers.FirstEmitHelper = wrapped( 'FirstEmitHelper', +ExternalEmitHelpers.Extends );
ExternalEmitHelpers[ +ExternalEmitHelpers.FirstEmitHelper.value ] = typeof ExternalEmitHelpers[ +ExternalEmitHelpers.FirstEmitHelper.value ] !== 'number' ? named( 'FirstEmitHelper' ) : ExternalEmitHelpers[ +ExternalEmitHelpers.FirstEmitHelper.value ];
ExternalEmitHelpers.LastEmitHelper = wrapped( 'LastEmitHelper', +ExternalEmitHelpers.MakeTemplateObject );
ExternalEmitHelpers[ +ExternalEmitHelpers.LastEmitHelper.value ] = typeof ExternalEmitHelpers[ +ExternalEmitHelpers.LastEmitHelper.value ] !== 'number' ? named( 'LastEmitHelper' ) : ExternalEmitHelpers[ +ExternalEmitHelpers.LastEmitHelper.value ];
ExternalEmitHelpers.ForOfIncludes = wrapped( 'ForOfIncludes', +ExternalEmitHelpers.Values );
ExternalEmitHelpers[ +ExternalEmitHelpers.ForOfIncludes.value ] = typeof ExternalEmitHelpers[ +ExternalEmitHelpers.ForOfIncludes.value ] !== 'number' ? named( 'ForOfIncludes' ) : ExternalEmitHelpers[ +ExternalEmitHelpers.ForOfIncludes.value ];
ExternalEmitHelpers.ForAwaitOfIncludes = wrapped( 'ForAwaitOfIncludes', +ExternalEmitHelpers.AsyncValues );
ExternalEmitHelpers[ +ExternalEmitHelpers.ForAwaitOfIncludes.value ] = typeof ExternalEmitHelpers[ +ExternalEmitHelpers.ForAwaitOfIncludes.value ] !== 'number' ? named( 'ForAwaitOfIncludes' ) : ExternalEmitHelpers[ +ExternalEmitHelpers.ForAwaitOfIncludes.value ];
ExternalEmitHelpers.AsyncGeneratorIncludes = wrapped( 'AsyncGeneratorIncludes', ExternalEmitHelpers.Await | ExternalEmitHelpers.AsyncGenerator );
ExternalEmitHelpers[ +ExternalEmitHelpers.AsyncGeneratorIncludes.value ] = typeof ExternalEmitHelpers[ +ExternalEmitHelpers.AsyncGeneratorIncludes.value ] !== 'number' ? named( 'AsyncGeneratorIncludes' ) : ExternalEmitHelpers[ +ExternalEmitHelpers.AsyncGeneratorIncludes.value ];
ExternalEmitHelpers.AsyncDelegatorIncludes = wrapped( 'AsyncDelegatorIncludes', ExternalEmitHelpers.Await | ExternalEmitHelpers.AsyncDelegator | ExternalEmitHelpers.AsyncValues );
ExternalEmitHelpers[ +ExternalEmitHelpers.AsyncDelegatorIncludes.value ] = typeof ExternalEmitHelpers[ +ExternalEmitHelpers.AsyncDelegatorIncludes.value ] !== 'number' ? named( 'AsyncDelegatorIncludes' ) : ExternalEmitHelpers[ +ExternalEmitHelpers.AsyncDelegatorIncludes.value ];
ExternalEmitHelpers.SpreadIncludes = wrapped( 'SpreadIncludes', ExternalEmitHelpers.Read | ExternalEmitHelpers.Spread );
ExternalEmitHelpers[ +ExternalEmitHelpers.SpreadIncludes.value ] = typeof ExternalEmitHelpers[ +ExternalEmitHelpers.SpreadIncludes.value ] !== 'number' ? named( 'SpreadIncludes' ) : ExternalEmitHelpers[ +ExternalEmitHelpers.SpreadIncludes.value ];

ExternalEmitHelpers = Object.create( templ(), ExternalEmitHelpers );
Object.getPrototypeOf( ExternalEmitHelpers ).asString = asString( ExternalEmitHelpers );

/** *********************************************************************************************************************
 * @enum
 * @name EmitHint
 ************************************************************************************************************************/
let EmitHint = {}; // Object.create( ( () => new ( function EmitHint() {} )() )(), {} );
EmitHint.SourceFile = wrapped( 'SourceFile', 1 );
EmitHint[ +EmitHint.SourceFile.value ] = typeof EmitHint[ +EmitHint.SourceFile.value ] !== 'number' ? named( 'SourceFile' ) : EmitHint[ +EmitHint.SourceFile.value ];
EmitHint.Expression = wrapped( 'Expression', 2 );
EmitHint[ +EmitHint.Expression.value ] = typeof EmitHint[ +EmitHint.Expression.value ] !== 'number' ? named( 'Expression' ) : EmitHint[ +EmitHint.Expression.value ];
EmitHint.IdentifierName = wrapped( 'IdentifierName', 3 );
EmitHint[ +EmitHint.IdentifierName.value ] = typeof EmitHint[ +EmitHint.IdentifierName.value ] !== 'number' ? named( 'IdentifierName' ) : EmitHint[ +EmitHint.IdentifierName.value ];
EmitHint.MappedTypeParameter = wrapped( 'MappedTypeParameter', 4 );
EmitHint[ +EmitHint.MappedTypeParameter.value ] = typeof EmitHint[ +EmitHint.MappedTypeParameter.value ] !== 'number' ? named( 'MappedTypeParameter' ) : EmitHint[ +EmitHint.MappedTypeParameter.value ];
EmitHint.Unspecified = wrapped( 'Unspecified', 5 );
EmitHint[ +EmitHint.Unspecified.value ] = typeof EmitHint[ +EmitHint.Unspecified.value ] !== 'number' ? named( 'Unspecified' ) : EmitHint[ +EmitHint.Unspecified.value ];

EmitHint = Object.create( templ(), EmitHint );
Object.getPrototypeOf( EmitHint ).asString = asString( EmitHint );

/** *********************************************************************************************************************
 * Enums extracted from /mnt/e/code/typescript/src/compiler/checker.ts
 ************************************************************************************************************************/

/** *********************************************************************************************************************
 * @enum
 * @name TypeFacts
 ************************************************************************************************************************/
let TypeFacts = {}; // Object.create( ( () => new ( function TypeFacts() {} )() )(), {} );
TypeFacts.None = wrapped( 'None', 0 );
TypeFacts[ +TypeFacts.None.value ] = typeof TypeFacts[ +TypeFacts.None.value ] !== 'number' ? named( 'None' ) : TypeFacts[ +TypeFacts.None.value ];
TypeFacts.TypeofEQString = wrapped( 'TypeofEQString', 1 << 0 );
TypeFacts[ +TypeFacts.TypeofEQString.value ] = typeof TypeFacts[ +TypeFacts.TypeofEQString.value ] !== 'number' ? named( 'TypeofEQString' ) : TypeFacts[ +TypeFacts.TypeofEQString.value ];
TypeFacts.TypeofEQNumber = wrapped( 'TypeofEQNumber', 1 << 1 );
TypeFacts[ +TypeFacts.TypeofEQNumber.value ] = typeof TypeFacts[ +TypeFacts.TypeofEQNumber.value ] !== 'number' ? named( 'TypeofEQNumber' ) : TypeFacts[ +TypeFacts.TypeofEQNumber.value ];
TypeFacts.TypeofEQBoolean = wrapped( 'TypeofEQBoolean', 1 << 2 );
TypeFacts[ +TypeFacts.TypeofEQBoolean.value ] = typeof TypeFacts[ +TypeFacts.TypeofEQBoolean.value ] !== 'number' ? named( 'TypeofEQBoolean' ) : TypeFacts[ +TypeFacts.TypeofEQBoolean.value ];
TypeFacts.TypeofEQSymbol = wrapped( 'TypeofEQSymbol', 1 << 3 );
TypeFacts[ +TypeFacts.TypeofEQSymbol.value ] = typeof TypeFacts[ +TypeFacts.TypeofEQSymbol.value ] !== 'number' ? named( 'TypeofEQSymbol' ) : TypeFacts[ +TypeFacts.TypeofEQSymbol.value ];
TypeFacts.TypeofEQObject = wrapped( 'TypeofEQObject', 1 << 4 );
TypeFacts[ +TypeFacts.TypeofEQObject.value ] = typeof TypeFacts[ +TypeFacts.TypeofEQObject.value ] !== 'number' ? named( 'TypeofEQObject' ) : TypeFacts[ +TypeFacts.TypeofEQObject.value ];
TypeFacts.TypeofEQFunction = wrapped( 'TypeofEQFunction', 1 << 5 );
TypeFacts[ +TypeFacts.TypeofEQFunction.value ] = typeof TypeFacts[ +TypeFacts.TypeofEQFunction.value ] !== 'number' ? named( 'TypeofEQFunction' ) : TypeFacts[ +TypeFacts.TypeofEQFunction.value ];
TypeFacts.TypeofEQHostObject = wrapped( 'TypeofEQHostObject', 1 << 6 );
TypeFacts[ +TypeFacts.TypeofEQHostObject.value ] = typeof TypeFacts[ +TypeFacts.TypeofEQHostObject.value ] !== 'number' ? named( 'TypeofEQHostObject' ) : TypeFacts[ +TypeFacts.TypeofEQHostObject.value ];
TypeFacts.TypeofNEString = wrapped( 'TypeofNEString', 1 << 7 );
TypeFacts[ +TypeFacts.TypeofNEString.value ] = typeof TypeFacts[ +TypeFacts.TypeofNEString.value ] !== 'number' ? named( 'TypeofNEString' ) : TypeFacts[ +TypeFacts.TypeofNEString.value ];
TypeFacts.TypeofNENumber = wrapped( 'TypeofNENumber', 1 << 8 );
TypeFacts[ +TypeFacts.TypeofNENumber.value ] = typeof TypeFacts[ +TypeFacts.TypeofNENumber.value ] !== 'number' ? named( 'TypeofNENumber' ) : TypeFacts[ +TypeFacts.TypeofNENumber.value ];
TypeFacts.TypeofNEBoolean = wrapped( 'TypeofNEBoolean', 1 << 9 );
TypeFacts[ +TypeFacts.TypeofNEBoolean.value ] = typeof TypeFacts[ +TypeFacts.TypeofNEBoolean.value ] !== 'number' ? named( 'TypeofNEBoolean' ) : TypeFacts[ +TypeFacts.TypeofNEBoolean.value ];
TypeFacts.TypeofNESymbol = wrapped( 'TypeofNESymbol', 1 << 10 );
TypeFacts[ +TypeFacts.TypeofNESymbol.value ] = typeof TypeFacts[ +TypeFacts.TypeofNESymbol.value ] !== 'number' ? named( 'TypeofNESymbol' ) : TypeFacts[ +TypeFacts.TypeofNESymbol.value ];
TypeFacts.TypeofNEObject = wrapped( 'TypeofNEObject', 1 << 11 );
TypeFacts[ +TypeFacts.TypeofNEObject.value ] = typeof TypeFacts[ +TypeFacts.TypeofNEObject.value ] !== 'number' ? named( 'TypeofNEObject' ) : TypeFacts[ +TypeFacts.TypeofNEObject.value ];
TypeFacts.TypeofNEFunction = wrapped( 'TypeofNEFunction', 1 << 12 );
TypeFacts[ +TypeFacts.TypeofNEFunction.value ] = typeof TypeFacts[ +TypeFacts.TypeofNEFunction.value ] !== 'number' ? named( 'TypeofNEFunction' ) : TypeFacts[ +TypeFacts.TypeofNEFunction.value ];
TypeFacts.TypeofNEHostObject = wrapped( 'TypeofNEHostObject', 1 << 13 );
TypeFacts[ +TypeFacts.TypeofNEHostObject.value ] = typeof TypeFacts[ +TypeFacts.TypeofNEHostObject.value ] !== 'number' ? named( 'TypeofNEHostObject' ) : TypeFacts[ +TypeFacts.TypeofNEHostObject.value ];
TypeFacts.EQUndefined = wrapped( 'EQUndefined', 1 << 14 );
TypeFacts[ +TypeFacts.EQUndefined.value ] = typeof TypeFacts[ +TypeFacts.EQUndefined.value ] !== 'number' ? named( 'EQUndefined' ) : TypeFacts[ +TypeFacts.EQUndefined.value ];
TypeFacts.EQNull = wrapped( 'EQNull', 1 << 15 );
TypeFacts[ +TypeFacts.EQNull.value ] = typeof TypeFacts[ +TypeFacts.EQNull.value ] !== 'number' ? named( 'EQNull' ) : TypeFacts[ +TypeFacts.EQNull.value ];
TypeFacts.EQUndefinedOrNull = wrapped( 'EQUndefinedOrNull', 1 << 16 );
TypeFacts[ +TypeFacts.EQUndefinedOrNull.value ] = typeof TypeFacts[ +TypeFacts.EQUndefinedOrNull.value ] !== 'number' ? named( 'EQUndefinedOrNull' ) : TypeFacts[ +TypeFacts.EQUndefinedOrNull.value ];
TypeFacts.NEUndefined = wrapped( 'NEUndefined', 1 << 17 );
TypeFacts[ +TypeFacts.NEUndefined.value ] = typeof TypeFacts[ +TypeFacts.NEUndefined.value ] !== 'number' ? named( 'NEUndefined' ) : TypeFacts[ +TypeFacts.NEUndefined.value ];
TypeFacts.NENull = wrapped( 'NENull', 1 << 18 );
TypeFacts[ +TypeFacts.NENull.value ] = typeof TypeFacts[ +TypeFacts.NENull.value ] !== 'number' ? named( 'NENull' ) : TypeFacts[ +TypeFacts.NENull.value ];
TypeFacts.NEUndefinedOrNull = wrapped( 'NEUndefinedOrNull', 1 << 19 );
TypeFacts[ +TypeFacts.NEUndefinedOrNull.value ] = typeof TypeFacts[ +TypeFacts.NEUndefinedOrNull.value ] !== 'number' ? named( 'NEUndefinedOrNull' ) : TypeFacts[ +TypeFacts.NEUndefinedOrNull.value ];
TypeFacts.Truthy = wrapped( 'Truthy', 1 << 20 );
TypeFacts[ +TypeFacts.Truthy.value ] = typeof TypeFacts[ +TypeFacts.Truthy.value ] !== 'number' ? named( 'Truthy' ) : TypeFacts[ +TypeFacts.Truthy.value ];
TypeFacts.Falsy = wrapped( 'Falsy', 1 << 21 );
TypeFacts[ +TypeFacts.Falsy.value ] = typeof TypeFacts[ +TypeFacts.Falsy.value ] !== 'number' ? named( 'Falsy' ) : TypeFacts[ +TypeFacts.Falsy.value ];
TypeFacts.Discriminatable = wrapped( 'Discriminatable', 1 << 22 );
TypeFacts[ +TypeFacts.Discriminatable.value ] = typeof TypeFacts[ +TypeFacts.Discriminatable.value ] !== 'number' ? named( 'Discriminatable' ) : TypeFacts[ +TypeFacts.Discriminatable.value ];
TypeFacts.All = wrapped( 'All', (1 << 23) - 1 );
TypeFacts[ +TypeFacts.All.value ] = typeof TypeFacts[ +TypeFacts.All.value ] !== 'number' ? named( 'All' ) : TypeFacts[ +TypeFacts.All.value ];
TypeFacts.BaseStringStrictFacts = wrapped( 'BaseStringStrictFacts', TypeFacts.TypeofEQString | TypeFacts.TypeofNENumber | TypeFacts.TypeofNEBoolean | TypeFacts.TypeofNESymbol | TypeFacts.TypeofNEObject | TypeFacts.TypeofNEFunction | TypeFacts.TypeofNEHostObject | TypeFacts.NEUndefined | TypeFacts.NENull | TypeFacts.NEUndefinedOrNull );
TypeFacts[ +TypeFacts.BaseStringStrictFacts.value ] = typeof TypeFacts[ +TypeFacts.BaseStringStrictFacts.value ] !== 'number' ? named( 'BaseStringStrictFacts' ) : TypeFacts[ +TypeFacts.BaseStringStrictFacts.value ];
TypeFacts.BaseStringFacts = wrapped( 'BaseStringFacts', TypeFacts.BaseStringStrictFacts | TypeFacts.EQUndefined | TypeFacts.EQNull | TypeFacts.EQUndefinedOrNull | TypeFacts.Falsy );
TypeFacts[ +TypeFacts.BaseStringFacts.value ] = typeof TypeFacts[ +TypeFacts.BaseStringFacts.value ] !== 'number' ? named( 'BaseStringFacts' ) : TypeFacts[ +TypeFacts.BaseStringFacts.value ];
TypeFacts.StringStrictFacts = wrapped( 'StringStrictFacts', TypeFacts.BaseStringStrictFacts | TypeFacts.Truthy | TypeFacts.Falsy );
TypeFacts[ +TypeFacts.StringStrictFacts.value ] = typeof TypeFacts[ +TypeFacts.StringStrictFacts.value ] !== 'number' ? named( 'StringStrictFacts' ) : TypeFacts[ +TypeFacts.StringStrictFacts.value ];
TypeFacts.StringFacts = wrapped( 'StringFacts', TypeFacts.BaseStringFacts | TypeFacts.Truthy );
TypeFacts[ +TypeFacts.StringFacts.value ] = typeof TypeFacts[ +TypeFacts.StringFacts.value ] !== 'number' ? named( 'StringFacts' ) : TypeFacts[ +TypeFacts.StringFacts.value ];
TypeFacts.EmptyStringStrictFacts = wrapped( 'EmptyStringStrictFacts', TypeFacts.BaseStringStrictFacts | TypeFacts.Falsy );
TypeFacts[ +TypeFacts.EmptyStringStrictFacts.value ] = typeof TypeFacts[ +TypeFacts.EmptyStringStrictFacts.value ] !== 'number' ? named( 'EmptyStringStrictFacts' ) : TypeFacts[ +TypeFacts.EmptyStringStrictFacts.value ];
TypeFacts.EmptyStringFacts = wrapped( 'EmptyStringFacts', +TypeFacts.BaseStringFacts );
TypeFacts[ +TypeFacts.EmptyStringFacts.value ] = typeof TypeFacts[ +TypeFacts.EmptyStringFacts.value ] !== 'number' ? named( 'EmptyStringFacts' ) : TypeFacts[ +TypeFacts.EmptyStringFacts.value ];
TypeFacts.NonEmptyStringStrictFacts = wrapped( 'NonEmptyStringStrictFacts', TypeFacts.BaseStringStrictFacts | TypeFacts.Truthy );
TypeFacts[ +TypeFacts.NonEmptyStringStrictFacts.value ] = typeof TypeFacts[ +TypeFacts.NonEmptyStringStrictFacts.value ] !== 'number' ? named( 'NonEmptyStringStrictFacts' ) : TypeFacts[ +TypeFacts.NonEmptyStringStrictFacts.value ];
TypeFacts.NonEmptyStringFacts = wrapped( 'NonEmptyStringFacts', TypeFacts.BaseStringFacts | TypeFacts.Truthy );
TypeFacts[ +TypeFacts.NonEmptyStringFacts.value ] = typeof TypeFacts[ +TypeFacts.NonEmptyStringFacts.value ] !== 'number' ? named( 'NonEmptyStringFacts' ) : TypeFacts[ +TypeFacts.NonEmptyStringFacts.value ];
TypeFacts.BaseNumberStrictFacts = wrapped( 'BaseNumberStrictFacts', TypeFacts.TypeofEQNumber | TypeFacts.TypeofNEString | TypeFacts.TypeofNEBoolean | TypeFacts.TypeofNESymbol | TypeFacts.TypeofNEObject | TypeFacts.TypeofNEFunction | TypeFacts.TypeofNEHostObject | TypeFacts.NEUndefined | TypeFacts.NENull | TypeFacts.NEUndefinedOrNull );
TypeFacts[ +TypeFacts.BaseNumberStrictFacts.value ] = typeof TypeFacts[ +TypeFacts.BaseNumberStrictFacts.value ] !== 'number' ? named( 'BaseNumberStrictFacts' ) : TypeFacts[ +TypeFacts.BaseNumberStrictFacts.value ];
TypeFacts.BaseNumberFacts = wrapped( 'BaseNumberFacts', TypeFacts.BaseNumberStrictFacts | TypeFacts.EQUndefined | TypeFacts.EQNull | TypeFacts.EQUndefinedOrNull | TypeFacts.Falsy );
TypeFacts[ +TypeFacts.BaseNumberFacts.value ] = typeof TypeFacts[ +TypeFacts.BaseNumberFacts.value ] !== 'number' ? named( 'BaseNumberFacts' ) : TypeFacts[ +TypeFacts.BaseNumberFacts.value ];
TypeFacts.NumberStrictFacts = wrapped( 'NumberStrictFacts', TypeFacts.BaseNumberStrictFacts | TypeFacts.Truthy | TypeFacts.Falsy );
TypeFacts[ +TypeFacts.NumberStrictFacts.value ] = typeof TypeFacts[ +TypeFacts.NumberStrictFacts.value ] !== 'number' ? named( 'NumberStrictFacts' ) : TypeFacts[ +TypeFacts.NumberStrictFacts.value ];
TypeFacts.NumberFacts = wrapped( 'NumberFacts', TypeFacts.BaseNumberFacts | TypeFacts.Truthy );
TypeFacts[ +TypeFacts.NumberFacts.value ] = typeof TypeFacts[ +TypeFacts.NumberFacts.value ] !== 'number' ? named( 'NumberFacts' ) : TypeFacts[ +TypeFacts.NumberFacts.value ];
TypeFacts.ZeroStrictFacts = wrapped( 'ZeroStrictFacts', TypeFacts.BaseNumberStrictFacts | TypeFacts.Falsy );
TypeFacts[ +TypeFacts.ZeroStrictFacts.value ] = typeof TypeFacts[ +TypeFacts.ZeroStrictFacts.value ] !== 'number' ? named( 'ZeroStrictFacts' ) : TypeFacts[ +TypeFacts.ZeroStrictFacts.value ];
TypeFacts.ZeroFacts = wrapped( 'ZeroFacts', +TypeFacts.BaseNumberFacts );
TypeFacts[ +TypeFacts.ZeroFacts.value ] = typeof TypeFacts[ +TypeFacts.ZeroFacts.value ] !== 'number' ? named( 'ZeroFacts' ) : TypeFacts[ +TypeFacts.ZeroFacts.value ];
TypeFacts.NonZeroStrictFacts = wrapped( 'NonZeroStrictFacts', TypeFacts.BaseNumberStrictFacts | TypeFacts.Truthy );
TypeFacts[ +TypeFacts.NonZeroStrictFacts.value ] = typeof TypeFacts[ +TypeFacts.NonZeroStrictFacts.value ] !== 'number' ? named( 'NonZeroStrictFacts' ) : TypeFacts[ +TypeFacts.NonZeroStrictFacts.value ];
TypeFacts.NonZeroFacts = wrapped( 'NonZeroFacts', TypeFacts.BaseNumberFacts | TypeFacts.Truthy );
TypeFacts[ +TypeFacts.NonZeroFacts.value ] = typeof TypeFacts[ +TypeFacts.NonZeroFacts.value ] !== 'number' ? named( 'NonZeroFacts' ) : TypeFacts[ +TypeFacts.NonZeroFacts.value ];
TypeFacts.BaseBooleanStrictFacts = wrapped( 'BaseBooleanStrictFacts', TypeFacts.TypeofEQBoolean | TypeFacts.TypeofNEString | TypeFacts.TypeofNENumber | TypeFacts.TypeofNESymbol | TypeFacts.TypeofNEObject | TypeFacts.TypeofNEFunction | TypeFacts.TypeofNEHostObject | TypeFacts.NEUndefined | TypeFacts.NENull | TypeFacts.NEUndefinedOrNull );
TypeFacts[ +TypeFacts.BaseBooleanStrictFacts.value ] = typeof TypeFacts[ +TypeFacts.BaseBooleanStrictFacts.value ] !== 'number' ? named( 'BaseBooleanStrictFacts' ) : TypeFacts[ +TypeFacts.BaseBooleanStrictFacts.value ];
TypeFacts.BaseBooleanFacts = wrapped( 'BaseBooleanFacts', TypeFacts.BaseBooleanStrictFacts | TypeFacts.EQUndefined | TypeFacts.EQNull | TypeFacts.EQUndefinedOrNull | TypeFacts.Falsy );
TypeFacts[ +TypeFacts.BaseBooleanFacts.value ] = typeof TypeFacts[ +TypeFacts.BaseBooleanFacts.value ] !== 'number' ? named( 'BaseBooleanFacts' ) : TypeFacts[ +TypeFacts.BaseBooleanFacts.value ];
TypeFacts.BooleanStrictFacts = wrapped( 'BooleanStrictFacts', TypeFacts.BaseBooleanStrictFacts | TypeFacts.Truthy | TypeFacts.Falsy );
TypeFacts[ +TypeFacts.BooleanStrictFacts.value ] = typeof TypeFacts[ +TypeFacts.BooleanStrictFacts.value ] !== 'number' ? named( 'BooleanStrictFacts' ) : TypeFacts[ +TypeFacts.BooleanStrictFacts.value ];
TypeFacts.BooleanFacts = wrapped( 'BooleanFacts', TypeFacts.BaseBooleanFacts | TypeFacts.Truthy );
TypeFacts[ +TypeFacts.BooleanFacts.value ] = typeof TypeFacts[ +TypeFacts.BooleanFacts.value ] !== 'number' ? named( 'BooleanFacts' ) : TypeFacts[ +TypeFacts.BooleanFacts.value ];
TypeFacts.FalseStrictFacts = wrapped( 'FalseStrictFacts', TypeFacts.BaseBooleanStrictFacts | TypeFacts.Falsy );
TypeFacts[ +TypeFacts.FalseStrictFacts.value ] = typeof TypeFacts[ +TypeFacts.FalseStrictFacts.value ] !== 'number' ? named( 'FalseStrictFacts' ) : TypeFacts[ +TypeFacts.FalseStrictFacts.value ];
TypeFacts.FalseFacts = wrapped( 'FalseFacts', +TypeFacts.BaseBooleanFacts );
TypeFacts[ +TypeFacts.FalseFacts.value ] = typeof TypeFacts[ +TypeFacts.FalseFacts.value ] !== 'number' ? named( 'FalseFacts' ) : TypeFacts[ +TypeFacts.FalseFacts.value ];
TypeFacts.TrueStrictFacts = wrapped( 'TrueStrictFacts', TypeFacts.BaseBooleanStrictFacts | TypeFacts.Truthy );
TypeFacts[ +TypeFacts.TrueStrictFacts.value ] = typeof TypeFacts[ +TypeFacts.TrueStrictFacts.value ] !== 'number' ? named( 'TrueStrictFacts' ) : TypeFacts[ +TypeFacts.TrueStrictFacts.value ];
TypeFacts.TrueFacts = wrapped( 'TrueFacts', TypeFacts.BaseBooleanFacts | TypeFacts.Truthy );
TypeFacts[ +TypeFacts.TrueFacts.value ] = typeof TypeFacts[ +TypeFacts.TrueFacts.value ] !== 'number' ? named( 'TrueFacts' ) : TypeFacts[ +TypeFacts.TrueFacts.value ];
TypeFacts.SymbolStrictFacts = wrapped( 'SymbolStrictFacts', TypeFacts.TypeofEQSymbol | TypeFacts.TypeofNEString | TypeFacts.TypeofNENumber | TypeFacts.TypeofNEBoolean | TypeFacts.TypeofNEObject | TypeFacts.TypeofNEFunction | TypeFacts.TypeofNEHostObject | TypeFacts.NEUndefined | TypeFacts.NENull | TypeFacts.NEUndefinedOrNull | TypeFacts.Truthy );
TypeFacts[ +TypeFacts.SymbolStrictFacts.value ] = typeof TypeFacts[ +TypeFacts.SymbolStrictFacts.value ] !== 'number' ? named( 'SymbolStrictFacts' ) : TypeFacts[ +TypeFacts.SymbolStrictFacts.value ];
TypeFacts.SymbolFacts = wrapped( 'SymbolFacts', TypeFacts.SymbolStrictFacts | TypeFacts.EQUndefined | TypeFacts.EQNull | TypeFacts.EQUndefinedOrNull | TypeFacts.Falsy );
TypeFacts[ +TypeFacts.SymbolFacts.value ] = typeof TypeFacts[ +TypeFacts.SymbolFacts.value ] !== 'number' ? named( 'SymbolFacts' ) : TypeFacts[ +TypeFacts.SymbolFacts.value ];
TypeFacts.ObjectStrictFacts = wrapped( 'ObjectStrictFacts', TypeFacts.TypeofEQObject | TypeFacts.TypeofEQHostObject | TypeFacts.TypeofNEString | TypeFacts.TypeofNENumber | TypeFacts.TypeofNEBoolean | TypeFacts.TypeofNESymbol | TypeFacts.TypeofNEFunction | TypeFacts.NEUndefined | TypeFacts.NENull | TypeFacts.NEUndefinedOrNull | TypeFacts.Truthy | TypeFacts.Discriminatable );
TypeFacts[ +TypeFacts.ObjectStrictFacts.value ] = typeof TypeFacts[ +TypeFacts.ObjectStrictFacts.value ] !== 'number' ? named( 'ObjectStrictFacts' ) : TypeFacts[ +TypeFacts.ObjectStrictFacts.value ];
TypeFacts.ObjectFacts = wrapped( 'ObjectFacts', TypeFacts.ObjectStrictFacts | TypeFacts.EQUndefined | TypeFacts.EQNull | TypeFacts.EQUndefinedOrNull | TypeFacts.Falsy );
TypeFacts[ +TypeFacts.ObjectFacts.value ] = typeof TypeFacts[ +TypeFacts.ObjectFacts.value ] !== 'number' ? named( 'ObjectFacts' ) : TypeFacts[ +TypeFacts.ObjectFacts.value ];
TypeFacts.FunctionStrictFacts = wrapped( 'FunctionStrictFacts', TypeFacts.TypeofEQFunction | TypeFacts.TypeofEQHostObject | TypeFacts.TypeofNEString | TypeFacts.TypeofNENumber | TypeFacts.TypeofNEBoolean | TypeFacts.TypeofNESymbol | TypeFacts.TypeofNEObject | TypeFacts.NEUndefined | TypeFacts.NENull | TypeFacts.NEUndefinedOrNull | TypeFacts.Truthy | TypeFacts.Discriminatable );
TypeFacts[ +TypeFacts.FunctionStrictFacts.value ] = typeof TypeFacts[ +TypeFacts.FunctionStrictFacts.value ] !== 'number' ? named( 'FunctionStrictFacts' ) : TypeFacts[ +TypeFacts.FunctionStrictFacts.value ];
TypeFacts.FunctionFacts = wrapped( 'FunctionFacts', TypeFacts.FunctionStrictFacts | TypeFacts.EQUndefined | TypeFacts.EQNull | TypeFacts.EQUndefinedOrNull | TypeFacts.Falsy );
TypeFacts[ +TypeFacts.FunctionFacts.value ] = typeof TypeFacts[ +TypeFacts.FunctionFacts.value ] !== 'number' ? named( 'FunctionFacts' ) : TypeFacts[ +TypeFacts.FunctionFacts.value ];
TypeFacts.UndefinedFacts = wrapped( 'UndefinedFacts', TypeFacts.TypeofNEString | TypeFacts.TypeofNENumber | TypeFacts.TypeofNEBoolean | TypeFacts.TypeofNESymbol | TypeFacts.TypeofNEObject | TypeFacts.TypeofNEFunction | TypeFacts.TypeofNEHostObject | TypeFacts.EQUndefined | TypeFacts.EQUndefinedOrNull | TypeFacts.NENull | TypeFacts.Falsy );
TypeFacts[ +TypeFacts.UndefinedFacts.value ] = typeof TypeFacts[ +TypeFacts.UndefinedFacts.value ] !== 'number' ? named( 'UndefinedFacts' ) : TypeFacts[ +TypeFacts.UndefinedFacts.value ];
TypeFacts.NullFacts = wrapped( 'NullFacts', TypeFacts.TypeofEQObject | TypeFacts.TypeofNEString | TypeFacts.TypeofNENumber | TypeFacts.TypeofNEBoolean | TypeFacts.TypeofNESymbol | TypeFacts.TypeofNEFunction | TypeFacts.TypeofNEHostObject | TypeFacts.EQNull | TypeFacts.EQUndefinedOrNull | TypeFacts.NEUndefined | TypeFacts.Falsy );
TypeFacts[ +TypeFacts.NullFacts.value ] = typeof TypeFacts[ +TypeFacts.NullFacts.value ] !== 'number' ? named( 'NullFacts' ) : TypeFacts[ +TypeFacts.NullFacts.value ];

TypeFacts = Object.create( templ(), TypeFacts );
Object.getPrototypeOf( TypeFacts ).asString = asString( TypeFacts );

/** *********************************************************************************************************************
 * @enum
 * @name TypeSystemPropertyName
 ************************************************************************************************************************/
let TypeSystemPropertyName = {}; // Object.create( ( () => new ( function TypeSystemPropertyName() {} )() )(), {} );
TypeSystemPropertyName.Type = wrapped( 'Type', 1 );
TypeSystemPropertyName[ +TypeSystemPropertyName.Type.value ] = typeof TypeSystemPropertyName[ +TypeSystemPropertyName.Type.value ] !== 'number' ? named( 'Type' ) : TypeSystemPropertyName[ +TypeSystemPropertyName.Type.value ];
TypeSystemPropertyName.ResolvedBaseConstructorType = wrapped( 'ResolvedBaseConstructorType', 2 );
TypeSystemPropertyName[ +TypeSystemPropertyName.ResolvedBaseConstructorType.value ] = typeof TypeSystemPropertyName[ +TypeSystemPropertyName.ResolvedBaseConstructorType.value ] !== 'number' ? named( 'ResolvedBaseConstructorType' ) : TypeSystemPropertyName[ +TypeSystemPropertyName.ResolvedBaseConstructorType.value ];
TypeSystemPropertyName.DeclaredType = wrapped( 'DeclaredType', 3 );
TypeSystemPropertyName[ +TypeSystemPropertyName.DeclaredType.value ] = typeof TypeSystemPropertyName[ +TypeSystemPropertyName.DeclaredType.value ] !== 'number' ? named( 'DeclaredType' ) : TypeSystemPropertyName[ +TypeSystemPropertyName.DeclaredType.value ];
TypeSystemPropertyName.ResolvedReturnType = wrapped( 'ResolvedReturnType', 4 );
TypeSystemPropertyName[ +TypeSystemPropertyName.ResolvedReturnType.value ] = typeof TypeSystemPropertyName[ +TypeSystemPropertyName.ResolvedReturnType.value ] !== 'number' ? named( 'ResolvedReturnType' ) : TypeSystemPropertyName[ +TypeSystemPropertyName.ResolvedReturnType.value ];
TypeSystemPropertyName.ResolvedBaseConstraint = wrapped( 'ResolvedBaseConstraint', 5 );
TypeSystemPropertyName[ +TypeSystemPropertyName.ResolvedBaseConstraint.value ] = typeof TypeSystemPropertyName[ +TypeSystemPropertyName.ResolvedBaseConstraint.value ] !== 'number' ? named( 'ResolvedBaseConstraint' ) : TypeSystemPropertyName[ +TypeSystemPropertyName.ResolvedBaseConstraint.value ];

TypeSystemPropertyName = Object.create( templ(), TypeSystemPropertyName );
Object.getPrototypeOf( TypeSystemPropertyName ).asString = asString( TypeSystemPropertyName );

/** *********************************************************************************************************************
 * @enum
 * @name CheckMode
 ************************************************************************************************************************/
let CheckMode = {}; // Object.create( ( () => new ( function CheckMode() {} )() )(), {} );
CheckMode.Normal = wrapped( 'Normal', 0 );
CheckMode[ +CheckMode.Normal.value ] = typeof CheckMode[ +CheckMode.Normal.value ] !== 'number' ? named( 'Normal' ) : CheckMode[ +CheckMode.Normal.value ];
CheckMode.SkipContextSensitive = wrapped( 'SkipContextSensitive', 1 );
CheckMode[ +CheckMode.SkipContextSensitive.value ] = typeof CheckMode[ +CheckMode.SkipContextSensitive.value ] !== 'number' ? named( 'SkipContextSensitive' ) : CheckMode[ +CheckMode.SkipContextSensitive.value ];
CheckMode.Inferential = wrapped( 'Inferential', 2 );
CheckMode[ +CheckMode.Inferential.value ] = typeof CheckMode[ +CheckMode.Inferential.value ] !== 'number' ? named( 'Inferential' ) : CheckMode[ +CheckMode.Inferential.value ];
CheckMode.Contextual = wrapped( 'Contextual', 3 );
CheckMode[ +CheckMode.Contextual.value ] = typeof CheckMode[ +CheckMode.Contextual.value ] !== 'number' ? named( 'Contextual' ) : CheckMode[ +CheckMode.Contextual.value ];

CheckMode = Object.create( templ(), CheckMode );
Object.getPrototypeOf( CheckMode ).asString = asString( CheckMode );

/** *********************************************************************************************************************
 * @enum
 * @name CallbackCheck
 ************************************************************************************************************************/
let CallbackCheck = {}; // Object.create( ( () => new ( function CallbackCheck() {} )() )(), {} );
CallbackCheck.None = wrapped( 'None', 1 );
CallbackCheck[ +CallbackCheck.None.value ] = typeof CallbackCheck[ +CallbackCheck.None.value ] !== 'number' ? named( 'None' ) : CallbackCheck[ +CallbackCheck.None.value ];
CallbackCheck.Bivariant = wrapped( 'Bivariant', 2 );
CallbackCheck[ +CallbackCheck.Bivariant.value ] = typeof CallbackCheck[ +CallbackCheck.Bivariant.value ] !== 'number' ? named( 'Bivariant' ) : CallbackCheck[ +CallbackCheck.Bivariant.value ];
CallbackCheck.Strict = wrapped( 'Strict', 3 );
CallbackCheck[ +CallbackCheck.Strict.value ] = typeof CallbackCheck[ +CallbackCheck.Strict.value ] !== 'number' ? named( 'Strict' ) : CallbackCheck[ +CallbackCheck.Strict.value ];

CallbackCheck = Object.create( templ(), CallbackCheck );
Object.getPrototypeOf( CallbackCheck ).asString = asString( CallbackCheck );

/** *********************************************************************************************************************
 * @enum
 * @name MappedTypeModifiers
 ************************************************************************************************************************/
let MappedTypeModifiers = {}; // Object.create( ( () => new ( function MappedTypeModifiers() {} )() )(), {} );
MappedTypeModifiers.Readonly = wrapped( 'Readonly', 1 << 0 );
MappedTypeModifiers[ +MappedTypeModifiers.Readonly.value ] = typeof MappedTypeModifiers[ +MappedTypeModifiers.Readonly.value ] !== 'number' ? named( 'Readonly' ) : MappedTypeModifiers[ +MappedTypeModifiers.Readonly.value ];
MappedTypeModifiers.Optional = wrapped( 'Optional', 1 << 1 );
MappedTypeModifiers[ +MappedTypeModifiers.Optional.value ] = typeof MappedTypeModifiers[ +MappedTypeModifiers.Optional.value ] !== 'number' ? named( 'Optional' ) : MappedTypeModifiers[ +MappedTypeModifiers.Optional.value ];

MappedTypeModifiers = Object.create( templ(), MappedTypeModifiers );
Object.getPrototypeOf( MappedTypeModifiers ).asString = asString( MappedTypeModifiers );

/** *********************************************************************************************************************
 * @enum
 * @name ExpandingFlags
 ************************************************************************************************************************/
let ExpandingFlags = {}; // Object.create( ( () => new ( function ExpandingFlags() {} )() )(), {} );
ExpandingFlags.None = wrapped( 'None', 0 );
ExpandingFlags[ +ExpandingFlags.None.value ] = typeof ExpandingFlags[ +ExpandingFlags.None.value ] !== 'number' ? named( 'None' ) : ExpandingFlags[ +ExpandingFlags.None.value ];
ExpandingFlags.Source = wrapped( 'Source', 1 );
ExpandingFlags[ +ExpandingFlags.Source.value ] = typeof ExpandingFlags[ +ExpandingFlags.Source.value ] !== 'number' ? named( 'Source' ) : ExpandingFlags[ +ExpandingFlags.Source.value ];
ExpandingFlags.Target = wrapped( 'Target', 1 << 1 );
ExpandingFlags[ +ExpandingFlags.Target.value ] = typeof ExpandingFlags[ +ExpandingFlags.Target.value ] !== 'number' ? named( 'Target' ) : ExpandingFlags[ +ExpandingFlags.Target.value ];
ExpandingFlags.Both = wrapped( 'Both', ExpandingFlags.Source | ExpandingFlags.Target );
ExpandingFlags[ +ExpandingFlags.Both.value ] = typeof ExpandingFlags[ +ExpandingFlags.Both.value ] !== 'number' ? named( 'Both' ) : ExpandingFlags[ +ExpandingFlags.Both.value ];

ExpandingFlags = Object.create( templ(), ExpandingFlags );
Object.getPrototypeOf( ExpandingFlags ).asString = asString( ExpandingFlags );

/** *********************************************************************************************************************
 * @enum
 * @name MembersOrExportsResolutionKind
 ************************************************************************************************************************/
let MembersOrExportsResolutionKind = {}; // Object.create( ( () => new ( function MembersOrExportsResolutionKind() {} )() )(), {} );
MembersOrExportsResolutionKind.resolvedExports = wrapped( 'resolvedExports', "resolvedMembersOrExportsResolutionKind.Exports" );
MembersOrExportsResolutionKind[ +MembersOrExportsResolutionKind.resolvedExports.value ] = typeof MembersOrExportsResolutionKind[ +MembersOrExportsResolutionKind.resolvedExports.value ] !== 'number' ? named( 'resolvedExports' ) : MembersOrExportsResolutionKind[ +MembersOrExportsResolutionKind.resolvedExports.value ];
MembersOrExportsResolutionKind.resolvedMembers = wrapped( 'resolvedMembers', "resolvedMembersOrExportsResolutionKind.Members" );
MembersOrExportsResolutionKind[ +MembersOrExportsResolutionKind.resolvedMembers.value ] = typeof MembersOrExportsResolutionKind[ +MembersOrExportsResolutionKind.resolvedMembers.value ] !== 'number' ? named( 'resolvedMembers' ) : MembersOrExportsResolutionKind[ +MembersOrExportsResolutionKind.resolvedMembers.value ];

MembersOrExportsResolutionKind = Object.create( templ(), MembersOrExportsResolutionKind );
Object.getPrototypeOf( MembersOrExportsResolutionKind ).asString = asString( MembersOrExportsResolutionKind );

/** *********************************************************************************************************************
 * @enum
 * @name Declaration
 ************************************************************************************************************************/
let Declaration = {}; // Object.create( ( () => new ( function Declaration() {} )() )(), {} );
Declaration.Getter = wrapped( 'Getter', 1 );
Declaration[ +Declaration.Getter.value ] = typeof Declaration[ +Declaration.Getter.value ] !== 'number' ? named( 'Getter' ) : Declaration[ +Declaration.Getter.value ];
Declaration.Setter = wrapped( 'Setter', 2 );
Declaration[ +Declaration.Setter.value ] = typeof Declaration[ +Declaration.Setter.value ] !== 'number' ? named( 'Setter' ) : Declaration[ +Declaration.Setter.value ];
Declaration.Method = wrapped( 'Method', 4 );
Declaration[ +Declaration.Method.value ] = typeof Declaration[ +Declaration.Method.value ] !== 'number' ? named( 'Method' ) : Declaration[ +Declaration.Method.value ];
Declaration.Property = wrapped( 'Property', Declaration.Getter | Declaration.Setter );
Declaration[ +Declaration.Property.value ] = typeof Declaration[ +Declaration.Property.value ] !== 'number' ? named( 'Property' ) : Declaration[ +Declaration.Property.value ];

Declaration = Object.create( templ(), Declaration );
Object.getPrototypeOf( Declaration ).asString = asString( Declaration );

/** *********************************************************************************************************************
 * @enum
 * @name DeclarationSpaces
 ************************************************************************************************************************/
let DeclarationSpaces = {}; // Object.create( ( () => new ( function DeclarationSpaces() {} )() )(), {} );
DeclarationSpaces.None = wrapped( 'None', 0 );
DeclarationSpaces[ +DeclarationSpaces.None.value ] = typeof DeclarationSpaces[ +DeclarationSpaces.None.value ] !== 'number' ? named( 'None' ) : DeclarationSpaces[ +DeclarationSpaces.None.value ];
DeclarationSpaces.ExportValue = wrapped( 'ExportValue', 1 << 0 );
DeclarationSpaces[ +DeclarationSpaces.ExportValue.value ] = typeof DeclarationSpaces[ +DeclarationSpaces.ExportValue.value ] !== 'number' ? named( 'ExportValue' ) : DeclarationSpaces[ +DeclarationSpaces.ExportValue.value ];
DeclarationSpaces.ExportType = wrapped( 'ExportType', 1 << 1 );
DeclarationSpaces[ +DeclarationSpaces.ExportType.value ] = typeof DeclarationSpaces[ +DeclarationSpaces.ExportType.value ] !== 'number' ? named( 'ExportType' ) : DeclarationSpaces[ +DeclarationSpaces.ExportType.value ];
DeclarationSpaces.ExportNamespace = wrapped( 'ExportNamespace', 1 << 2 );
DeclarationSpaces[ +DeclarationSpaces.ExportNamespace.value ] = typeof DeclarationSpaces[ +DeclarationSpaces.ExportNamespace.value ] !== 'number' ? named( 'ExportNamespace' ) : DeclarationSpaces[ +DeclarationSpaces.ExportNamespace.value ];

DeclarationSpaces = Object.create( templ(), DeclarationSpaces );
Object.getPrototypeOf( DeclarationSpaces ).asString = asString( DeclarationSpaces );

/** *********************************************************************************************************************
 * @enum
 * @name Flags
 ************************************************************************************************************************/
let Flags = {}; // Object.create( ( () => new ( function Flags() {} )() )(), {} );
Flags.Property = wrapped( 'Property', 1 );
Flags[ +Flags.Property.value ] = typeof Flags[ +Flags.Property.value ] !== 'number' ? named( 'Property' ) : Flags[ +Flags.Property.value ];
Flags.GetAccessor = wrapped( 'GetAccessor', 2 );
Flags[ +Flags.GetAccessor.value ] = typeof Flags[ +Flags.GetAccessor.value ] !== 'number' ? named( 'GetAccessor' ) : Flags[ +Flags.GetAccessor.value ];
Flags.SetAccessor = wrapped( 'SetAccessor', 4 );
Flags[ +Flags.SetAccessor.value ] = typeof Flags[ +Flags.SetAccessor.value ] !== 'number' ? named( 'SetAccessor' ) : Flags[ +Flags.SetAccessor.value ];
Flags.GetOrSetAccessor = wrapped( 'GetOrSetAccessor', Flags.GetAccessor | Flags.SetAccessor );
Flags[ +Flags.GetOrSetAccessor.value ] = typeof Flags[ +Flags.GetOrSetAccessor.value ] !== 'number' ? named( 'GetOrSetAccessor' ) : Flags[ +Flags.GetOrSetAccessor.value ];

Flags = Object.create( templ(), Flags );
Object.getPrototypeOf( Flags ).asString = asString( Flags );

/** *********************************************************************************************************************
 * Enums extracted from /mnt/e/code/typescript/src/compiler/binder.ts
 ************************************************************************************************************************/

/** *********************************************************************************************************************
 * @enum
 * @name ModuleInstanceState
 ************************************************************************************************************************/
let ModuleInstanceState = {}; // Object.create( ( () => new ( function ModuleInstanceState() {} )() )(), {} );
ModuleInstanceState.NonInstantiated = wrapped( 'NonInstantiated', 0 );
ModuleInstanceState[ +ModuleInstanceState.NonInstantiated.value ] = typeof ModuleInstanceState[ +ModuleInstanceState.NonInstantiated.value ] !== 'number' ? named( 'NonInstantiated' ) : ModuleInstanceState[ +ModuleInstanceState.NonInstantiated.value ];
ModuleInstanceState.Instantiated = wrapped( 'Instantiated', 1 );
ModuleInstanceState[ +ModuleInstanceState.Instantiated.value ] = typeof ModuleInstanceState[ +ModuleInstanceState.Instantiated.value ] !== 'number' ? named( 'Instantiated' ) : ModuleInstanceState[ +ModuleInstanceState.Instantiated.value ];
ModuleInstanceState.ConstEnumOnly = wrapped( 'ConstEnumOnly', 2 );
ModuleInstanceState[ +ModuleInstanceState.ConstEnumOnly.value ] = typeof ModuleInstanceState[ +ModuleInstanceState.ConstEnumOnly.value ] !== 'number' ? named( 'ConstEnumOnly' ) : ModuleInstanceState[ +ModuleInstanceState.ConstEnumOnly.value ];

ModuleInstanceState = Object.create( templ(), ModuleInstanceState );
Object.getPrototypeOf( ModuleInstanceState ).asString = asString( ModuleInstanceState );

/** *********************************************************************************************************************
 * @enum
 * @name ContainerFlags
 ************************************************************************************************************************/
let ContainerFlags = {}; // Object.create( ( () => new ( function ContainerFlags() {} )() )(), {} );
ContainerFlags.None = wrapped( 'None', 0 );
ContainerFlags[ +ContainerFlags.None.value ] = typeof ContainerFlags[ +ContainerFlags.None.value ] !== 'number' ? named( 'None' ) : ContainerFlags[ +ContainerFlags.None.value ];
ContainerFlags.IsContainer = wrapped( 'IsContainer', 1 << 0 );
ContainerFlags[ +ContainerFlags.IsContainer.value ] = typeof ContainerFlags[ +ContainerFlags.IsContainer.value ] !== 'number' ? named( 'IsContainer' ) : ContainerFlags[ +ContainerFlags.IsContainer.value ];
ContainerFlags.IsBlockScopedContainer = wrapped( 'IsBlockScopedContainer', 1 << 1 );
ContainerFlags[ +ContainerFlags.IsBlockScopedContainer.value ] = typeof ContainerFlags[ +ContainerFlags.IsBlockScopedContainer.value ] !== 'number' ? named( 'IsBlockScopedContainer' ) : ContainerFlags[ +ContainerFlags.IsBlockScopedContainer.value ];
ContainerFlags.IsControlFlowContainer = wrapped( 'IsControlFlowContainer', 1 << 2 );
ContainerFlags[ +ContainerFlags.IsControlFlowContainer.value ] = typeof ContainerFlags[ +ContainerFlags.IsControlFlowContainer.value ] !== 'number' ? named( 'IsControlFlowContainer' ) : ContainerFlags[ +ContainerFlags.IsControlFlowContainer.value ];
ContainerFlags.IsFunctionLike = wrapped( 'IsFunctionLike', 1 << 3 );
ContainerFlags[ +ContainerFlags.IsFunctionLike.value ] = typeof ContainerFlags[ +ContainerFlags.IsFunctionLike.value ] !== 'number' ? named( 'IsFunctionLike' ) : ContainerFlags[ +ContainerFlags.IsFunctionLike.value ];
ContainerFlags.IsFunctionExpression = wrapped( 'IsFunctionExpression', 1 << 4 );
ContainerFlags[ +ContainerFlags.IsFunctionExpression.value ] = typeof ContainerFlags[ +ContainerFlags.IsFunctionExpression.value ] !== 'number' ? named( 'IsFunctionExpression' ) : ContainerFlags[ +ContainerFlags.IsFunctionExpression.value ];
ContainerFlags.HasLocals = wrapped( 'HasLocals', 1 << 5 );
ContainerFlags[ +ContainerFlags.HasLocals.value ] = typeof ContainerFlags[ +ContainerFlags.HasLocals.value ] !== 'number' ? named( 'HasLocals' ) : ContainerFlags[ +ContainerFlags.HasLocals.value ];
ContainerFlags.IsInterface = wrapped( 'IsInterface', 1 << 6 );
ContainerFlags[ +ContainerFlags.IsInterface.value ] = typeof ContainerFlags[ +ContainerFlags.IsInterface.value ] !== 'number' ? named( 'IsInterface' ) : ContainerFlags[ +ContainerFlags.IsInterface.value ];
ContainerFlags.IsObjectLiteralOrClassExpressionMethod = wrapped( 'IsObjectLiteralOrClassExpressionMethod', 1 << 7 );
ContainerFlags[ +ContainerFlags.IsObjectLiteralOrClassExpressionMethod.value ] = typeof ContainerFlags[ +ContainerFlags.IsObjectLiteralOrClassExpressionMethod.value ] !== 'number' ? named( 'IsObjectLiteralOrClassExpressionMethod' ) : ContainerFlags[ +ContainerFlags.IsObjectLiteralOrClassExpressionMethod.value ];

ContainerFlags = Object.create( templ(), ContainerFlags );
Object.getPrototypeOf( ContainerFlags ).asString = asString( ContainerFlags );

/** *********************************************************************************************************************
 * @enum
 * @name ElementKind
 ************************************************************************************************************************/
let ElementKind = {}; // Object.create( ( () => new ( function ElementKind() {} )() )(), {} );
ElementKind.Property = wrapped( 'Property', 1 );
ElementKind[ +ElementKind.Property.value ] = typeof ElementKind[ +ElementKind.Property.value ] !== 'number' ? named( 'Property' ) : ElementKind[ +ElementKind.Property.value ];
ElementKind.Accessor = wrapped( 'Accessor', 2 );
ElementKind[ +ElementKind.Accessor.value ] = typeof ElementKind[ +ElementKind.Accessor.value ] !== 'number' ? named( 'Accessor' ) : ElementKind[ +ElementKind.Accessor.value ];

ElementKind = Object.create( templ(), ElementKind );
Object.getPrototypeOf( ElementKind ).asString = asString( ElementKind );

/** *********************************************************************************************************************
 * Enums extracted from /mnt/e/code/typescript/src/compiler/parser.ts
 ************************************************************************************************************************/

/** *********************************************************************************************************************
 * @enum
 * @name SignatureFlags
 ************************************************************************************************************************/
let SignatureFlags = {}; // Object.create( ( () => new ( function SignatureFlags() {} )() )(), {} );
SignatureFlags.None = wrapped( 'None', 0 );
SignatureFlags[ +SignatureFlags.None.value ] = typeof SignatureFlags[ +SignatureFlags.None.value ] !== 'number' ? named( 'None' ) : SignatureFlags[ +SignatureFlags.None.value ];
SignatureFlags.Yield = wrapped( 'Yield', 1 << 0 );
SignatureFlags[ +SignatureFlags.Yield.value ] = typeof SignatureFlags[ +SignatureFlags.Yield.value ] !== 'number' ? named( 'Yield' ) : SignatureFlags[ +SignatureFlags.Yield.value ];
SignatureFlags.Await = wrapped( 'Await', 1 << 1 );
SignatureFlags[ +SignatureFlags.Await.value ] = typeof SignatureFlags[ +SignatureFlags.Await.value ] !== 'number' ? named( 'Await' ) : SignatureFlags[ +SignatureFlags.Await.value ];
SignatureFlags.Type = wrapped( 'Type', 1 << 2 );
SignatureFlags[ +SignatureFlags.Type.value ] = typeof SignatureFlags[ +SignatureFlags.Type.value ] !== 'number' ? named( 'Type' ) : SignatureFlags[ +SignatureFlags.Type.value ];
SignatureFlags.RequireCompleteParameterList = wrapped( 'RequireCompleteParameterList', 1 << 3 );
SignatureFlags[ +SignatureFlags.RequireCompleteParameterList.value ] = typeof SignatureFlags[ +SignatureFlags.RequireCompleteParameterList.value ] !== 'number' ? named( 'RequireCompleteParameterList' ) : SignatureFlags[ +SignatureFlags.RequireCompleteParameterList.value ];
SignatureFlags.IgnoreMissingOpenBrace = wrapped( 'IgnoreMissingOpenBrace', 1 << 4 );
SignatureFlags[ +SignatureFlags.IgnoreMissingOpenBrace.value ] = typeof SignatureFlags[ +SignatureFlags.IgnoreMissingOpenBrace.value ] !== 'number' ? named( 'IgnoreMissingOpenBrace' ) : SignatureFlags[ +SignatureFlags.IgnoreMissingOpenBrace.value ];
SignatureFlags.JSDoc = wrapped( 'JSDoc', 1 << 5 );
SignatureFlags[ +SignatureFlags.JSDoc.value ] = typeof SignatureFlags[ +SignatureFlags.JSDoc.value ] !== 'number' ? named( 'JSDoc' ) : SignatureFlags[ +SignatureFlags.JSDoc.value ];

SignatureFlags = Object.create( templ(), SignatureFlags );
Object.getPrototypeOf( SignatureFlags ).asString = asString( SignatureFlags );

/** *********************************************************************************************************************
 * @enum
 * @name ParsingContext
 ************************************************************************************************************************/
let ParsingContext = {}; // Object.create( ( () => new ( function ParsingContext() {} )() )(), {} );
ParsingContext.SourceElements = wrapped( 'SourceElements', 1 );
ParsingContext[ +ParsingContext.SourceElements.value ] = typeof ParsingContext[ +ParsingContext.SourceElements.value ] !== 'number' ? named( 'SourceElements' ) : ParsingContext[ +ParsingContext.SourceElements.value ];
ParsingContext.BlockStatements = wrapped( 'BlockStatements', 2 );
ParsingContext[ +ParsingContext.BlockStatements.value ] = typeof ParsingContext[ +ParsingContext.BlockStatements.value ] !== 'number' ? named( 'BlockStatements' ) : ParsingContext[ +ParsingContext.BlockStatements.value ];
ParsingContext.SwitchClauses = wrapped( 'SwitchClauses', 3 );
ParsingContext[ +ParsingContext.SwitchClauses.value ] = typeof ParsingContext[ +ParsingContext.SwitchClauses.value ] !== 'number' ? named( 'SwitchClauses' ) : ParsingContext[ +ParsingContext.SwitchClauses.value ];
ParsingContext.SwitchClauseStatements = wrapped( 'SwitchClauseStatements', 4 );
ParsingContext[ +ParsingContext.SwitchClauseStatements.value ] = typeof ParsingContext[ +ParsingContext.SwitchClauseStatements.value ] !== 'number' ? named( 'SwitchClauseStatements' ) : ParsingContext[ +ParsingContext.SwitchClauseStatements.value ];
ParsingContext.TypeMembers = wrapped( 'TypeMembers', 5 );
ParsingContext[ +ParsingContext.TypeMembers.value ] = typeof ParsingContext[ +ParsingContext.TypeMembers.value ] !== 'number' ? named( 'TypeMembers' ) : ParsingContext[ +ParsingContext.TypeMembers.value ];
ParsingContext.ClassMembers = wrapped( 'ClassMembers', 6 );
ParsingContext[ +ParsingContext.ClassMembers.value ] = typeof ParsingContext[ +ParsingContext.ClassMembers.value ] !== 'number' ? named( 'ClassMembers' ) : ParsingContext[ +ParsingContext.ClassMembers.value ];
ParsingContext.EnumMembers = wrapped( 'EnumMembers', 7 );
ParsingContext[ +ParsingContext.EnumMembers.value ] = typeof ParsingContext[ +ParsingContext.EnumMembers.value ] !== 'number' ? named( 'EnumMembers' ) : ParsingContext[ +ParsingContext.EnumMembers.value ];
ParsingContext.HeritageClauseElement = wrapped( 'HeritageClauseElement', 8 );
ParsingContext[ +ParsingContext.HeritageClauseElement.value ] = typeof ParsingContext[ +ParsingContext.HeritageClauseElement.value ] !== 'number' ? named( 'HeritageClauseElement' ) : ParsingContext[ +ParsingContext.HeritageClauseElement.value ];
ParsingContext.VariableDeclarations = wrapped( 'VariableDeclarations', 9 );
ParsingContext[ +ParsingContext.VariableDeclarations.value ] = typeof ParsingContext[ +ParsingContext.VariableDeclarations.value ] !== 'number' ? named( 'VariableDeclarations' ) : ParsingContext[ +ParsingContext.VariableDeclarations.value ];
ParsingContext.ObjectBindingElements = wrapped( 'ObjectBindingElements', 10 );
ParsingContext[ +ParsingContext.ObjectBindingElements.value ] = typeof ParsingContext[ +ParsingContext.ObjectBindingElements.value ] !== 'number' ? named( 'ObjectBindingElements' ) : ParsingContext[ +ParsingContext.ObjectBindingElements.value ];
ParsingContext.ArrayBindingElements = wrapped( 'ArrayBindingElements', 11 );
ParsingContext[ +ParsingContext.ArrayBindingElements.value ] = typeof ParsingContext[ +ParsingContext.ArrayBindingElements.value ] !== 'number' ? named( 'ArrayBindingElements' ) : ParsingContext[ +ParsingContext.ArrayBindingElements.value ];
ParsingContext.ArgumentExpressions = wrapped( 'ArgumentExpressions', 12 );
ParsingContext[ +ParsingContext.ArgumentExpressions.value ] = typeof ParsingContext[ +ParsingContext.ArgumentExpressions.value ] !== 'number' ? named( 'ArgumentExpressions' ) : ParsingContext[ +ParsingContext.ArgumentExpressions.value ];
ParsingContext.ObjectLiteralMembers = wrapped( 'ObjectLiteralMembers', 13 );
ParsingContext[ +ParsingContext.ObjectLiteralMembers.value ] = typeof ParsingContext[ +ParsingContext.ObjectLiteralMembers.value ] !== 'number' ? named( 'ObjectLiteralMembers' ) : ParsingContext[ +ParsingContext.ObjectLiteralMembers.value ];
ParsingContext.JsxAttributes = wrapped( 'JsxAttributes', 14 );
ParsingContext[ +ParsingContext.JsxAttributes.value ] = typeof ParsingContext[ +ParsingContext.JsxAttributes.value ] !== 'number' ? named( 'JsxAttributes' ) : ParsingContext[ +ParsingContext.JsxAttributes.value ];
ParsingContext.JsxChildren = wrapped( 'JsxChildren', 15 );
ParsingContext[ +ParsingContext.JsxChildren.value ] = typeof ParsingContext[ +ParsingContext.JsxChildren.value ] !== 'number' ? named( 'JsxChildren' ) : ParsingContext[ +ParsingContext.JsxChildren.value ];
ParsingContext.ArrayLiteralMembers = wrapped( 'ArrayLiteralMembers', 16 );
ParsingContext[ +ParsingContext.ArrayLiteralMembers.value ] = typeof ParsingContext[ +ParsingContext.ArrayLiteralMembers.value ] !== 'number' ? named( 'ArrayLiteralMembers' ) : ParsingContext[ +ParsingContext.ArrayLiteralMembers.value ];
ParsingContext.Parameters = wrapped( 'Parameters', 17 );
ParsingContext[ +ParsingContext.Parameters.value ] = typeof ParsingContext[ +ParsingContext.Parameters.value ] !== 'number' ? named( 'Parameters' ) : ParsingContext[ +ParsingContext.Parameters.value ];
ParsingContext.RestProperties = wrapped( 'RestProperties', 18 );
ParsingContext[ +ParsingContext.RestProperties.value ] = typeof ParsingContext[ +ParsingContext.RestProperties.value ] !== 'number' ? named( 'RestProperties' ) : ParsingContext[ +ParsingContext.RestProperties.value ];
ParsingContext.TypeParameters = wrapped( 'TypeParameters', 19 );
ParsingContext[ +ParsingContext.TypeParameters.value ] = typeof ParsingContext[ +ParsingContext.TypeParameters.value ] !== 'number' ? named( 'TypeParameters' ) : ParsingContext[ +ParsingContext.TypeParameters.value ];
ParsingContext.TypeArguments = wrapped( 'TypeArguments', 20 );
ParsingContext[ +ParsingContext.TypeArguments.value ] = typeof ParsingContext[ +ParsingContext.TypeArguments.value ] !== 'number' ? named( 'TypeArguments' ) : ParsingContext[ +ParsingContext.TypeArguments.value ];
ParsingContext.TupleElementTypes = wrapped( 'TupleElementTypes', 21 );
ParsingContext[ +ParsingContext.TupleElementTypes.value ] = typeof ParsingContext[ +ParsingContext.TupleElementTypes.value ] !== 'number' ? named( 'TupleElementTypes' ) : ParsingContext[ +ParsingContext.TupleElementTypes.value ];
ParsingContext.HeritageClauses = wrapped( 'HeritageClauses', 22 );
ParsingContext[ +ParsingContext.HeritageClauses.value ] = typeof ParsingContext[ +ParsingContext.HeritageClauses.value ] !== 'number' ? named( 'HeritageClauses' ) : ParsingContext[ +ParsingContext.HeritageClauses.value ];
ParsingContext.ImportOrExportSpecifiers = wrapped( 'ImportOrExportSpecifiers', 23 );
ParsingContext[ +ParsingContext.ImportOrExportSpecifiers.value ] = typeof ParsingContext[ +ParsingContext.ImportOrExportSpecifiers.value ] !== 'number' ? named( 'ImportOrExportSpecifiers' ) : ParsingContext[ +ParsingContext.ImportOrExportSpecifiers.value ];

ParsingContext = Object.create( templ(), ParsingContext );
Object.getPrototypeOf( ParsingContext ).asString = asString( ParsingContext );

/** *********************************************************************************************************************
 * @enum
 * @name Tristate
 ************************************************************************************************************************/
let Tristate = {}; // Object.create( ( () => new ( function Tristate() {} )() )(), {} );
Tristate.False = wrapped( 'False', 1 );
Tristate[ +Tristate.False.value ] = typeof Tristate[ +Tristate.False.value ] !== 'number' ? named( 'False' ) : Tristate[ +Tristate.False.value ];
Tristate.True = wrapped( 'True', 2 );
Tristate[ +Tristate.True.value ] = typeof Tristate[ +Tristate.True.value ] !== 'number' ? named( 'True' ) : Tristate[ +Tristate.True.value ];
Tristate.Unknown = wrapped( 'Unknown', 3 );
Tristate[ +Tristate.Unknown.value ] = typeof Tristate[ +Tristate.Unknown.value ] !== 'number' ? named( 'Unknown' ) : Tristate[ +Tristate.Unknown.value ];

Tristate = Object.create( templ(), Tristate );
Object.getPrototypeOf( Tristate ).asString = asString( Tristate );

/** *********************************************************************************************************************
 * @enum
 * @name JSDocState
 ************************************************************************************************************************/
let JSDocState = {}; // Object.create( ( () => new ( function JSDocState() {} )() )(), {} );
JSDocState.BeginningOfLine = wrapped( 'BeginningOfLine', 1 );
JSDocState[ +JSDocState.BeginningOfLine.value ] = typeof JSDocState[ +JSDocState.BeginningOfLine.value ] !== 'number' ? named( 'BeginningOfLine' ) : JSDocState[ +JSDocState.BeginningOfLine.value ];
JSDocState.SawAsterisk = wrapped( 'SawAsterisk', 2 );
JSDocState[ +JSDocState.SawAsterisk.value ] = typeof JSDocState[ +JSDocState.SawAsterisk.value ] !== 'number' ? named( 'SawAsterisk' ) : JSDocState[ +JSDocState.SawAsterisk.value ];
JSDocState.SavingComments = wrapped( 'SavingComments', 3 );
JSDocState[ +JSDocState.SavingComments.value ] = typeof JSDocState[ +JSDocState.SavingComments.value ] !== 'number' ? named( 'SavingComments' ) : JSDocState[ +JSDocState.SavingComments.value ];

JSDocState = Object.create( templ(), JSDocState );
Object.getPrototypeOf( JSDocState ).asString = asString( JSDocState );

/** *********************************************************************************************************************
 * @enum
 * @name PropertyLikeParse
 ************************************************************************************************************************/
let PropertyLikeParse = {}; // Object.create( ( () => new ( function PropertyLikeParse() {} )() )(), {} );
PropertyLikeParse.Property = wrapped( 'Property', 1 );
PropertyLikeParse[ +PropertyLikeParse.Property.value ] = typeof PropertyLikeParse[ +PropertyLikeParse.Property.value ] !== 'number' ? named( 'Property' ) : PropertyLikeParse[ +PropertyLikeParse.Property.value ];
PropertyLikeParse.Parameter = wrapped( 'Parameter', 2 );
PropertyLikeParse[ +PropertyLikeParse.Parameter.value ] = typeof PropertyLikeParse[ +PropertyLikeParse.Parameter.value ] !== 'number' ? named( 'Parameter' ) : PropertyLikeParse[ +PropertyLikeParse.Parameter.value ];

PropertyLikeParse = Object.create( templ(), PropertyLikeParse );
Object.getPrototypeOf( PropertyLikeParse ).asString = asString( PropertyLikeParse );

/** *********************************************************************************************************************
 * @enum
 * @name InvalidPosition
 ************************************************************************************************************************/
let InvalidPosition = {}; // Object.create( ( () => new ( function InvalidPosition() {} )() )(), {} );
InvalidPosition.Value = wrapped( 'Value', -1 );
InvalidPosition[ +InvalidPosition.Value.value ] = typeof InvalidPosition[ +InvalidPosition.Value.value ] !== 'number' ? named( 'Value' ) : InvalidPosition[ +InvalidPosition.Value.value ];

InvalidPosition = Object.create( templ(), InvalidPosition );
Object.getPrototypeOf( InvalidPosition ).asString = asString( InvalidPosition );

export {
    Comparison,
    SyntaxKind,
    NodeFlags,
    ModifierFlags,
    JsxFlags,
    RelationComparisonResult,
    GeneratedIdentifierKind,
    TokenFlags,
    FlowFlags,
    StructureIsReused,
    UnionReduction,
    TypeFormatFlags,
    SymbolFormatFlags,
    SymbolAccessibility,
    SyntheticSymbolKind,
    TypePredicateKind,
    SymbolFlags,
    EnumKind,
    CheckFlags,
    InternalSymbolName,
    NodeCheckFlags,
    TypeFlags,
    ObjectFlags,
    Variance,
    SignatureKind,
    IndexKind,
    InferencePriority,
    InferenceFlags,
    Ternary,
    SpecialPropertyAssignmentKind,
    JsxEmit,
    NewLineKind,
    ScriptKind,
    ScriptTarget,
    LanguageVariant,
    DiagnosticStyle,
    WatchDirectoryFlags,
    CharacterCodes,
    Extension,
    TransformFlags,
    EmitFlags,
    ExternalEmitHelpers,
    EmitHint,
    TypeFacts,
    TypeSystemPropertyName,
    CheckMode,
    CallbackCheck,
    MappedTypeModifiers,
    ExpandingFlags,
    MembersOrExportsResolutionKind,
    Declaration,
    DeclarationSpaces,
    Flags,
    ModuleInstanceState,
    ContainerFlags,
    ElementKind,
    SignatureFlags,
    ParsingContext,
    Tristate,
    JSDocState,
    PropertyLikeParse,
    InvalidPosition
};
