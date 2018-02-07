/** ****************************************************************************************************
 * File: ts-ast-walker (jsdoc-tag-parser)
 * @author julian on 2/2/18
 * @version 1.0.0
 * @copyright Planet3, Inc.
 *******************************************************************************************************/
'use strict';

import ts                       from 'typescript';
import { fixEnums, syntaxKind } from "./ts-helpers";
import { array }                from 'convenience';

const
    has         = ( o, n ) => Reflect.has( o, n ),
    object      = o => typeof o === 'object' && !Array.isArray( o ) && o !== null,
    visitorKeys = {
        AmpersandAmpersandToken:                [],
        AmpersandEqualsToken:                   [],
        AmpersandToken:                         [],
        AnyKeyword:                             [],
        ArrayLiteralExpression:                 [ 'elements', 'multiLine' ],
        ArrayType:                              [ 'elementType' ],
        ArrowFunction:                          [ 'modifiers', 'typeParameters', 'parameters', 'type', 'equalsGreaterThanToken', 'body' ],
        AsExpression:                           [ 'expression', 'type' ],
        AsteriskAsteriskToken:                  [],
        AsteriskToken:                          [],
        AtToken:                                [],
        BarBarToken:                            [],
        BarEqualsToken:                         [],
        BarToken:                               [],
        BinaryExpression:                       [ 'left', 'operatorToken', 'right' ],
        BindingElement:                         [ 'dotDotDotToken', 'name', 'initializer' ],
        Block:                                  [ 'multiLine', 'statements' ],
        BooleanKeyword:                         [],
        BreakStatement:                         [ 'label' ],
        CallExpression:                         [ 'expression', 'arguments', 'typeArguments' ],
        CallSignature:                          [ 'typeParameters', 'parameters', 'type', 'jsDoc' ],
        CaretEqualsToken:                       [],
        CaretToken:                             [],
        CaseBlock:                              [ 'clauses' ],
        CaseClause:                             [ 'expression', 'statements' ],
        ClassDeclaration:                       [ 'decorators', 'modifiers', 'name', 'typeParameters', 'heritageClauses', 'members', 'jsDoc' ],
        ColonToken:                             [],
        ComputedPropertyName:                   [ 'expression' ],
        ConditionalExpression:                  [ 'condition', 'questionToken', 'whenTrue', 'colonToken', 'whenFalse' ],
        ConstKeyword:                           [],
        ConstructSignature:                     [ 'typeParameters', 'parameters', 'type', 'jsDoc' ],
        Constructor:                            [ 'decorators', 'modifiers', 'typeParameters', 'parameters', 'type', 'body' ],
        ConstructorType:                        [ 'typeParameters', 'parameters', 'type' ],
        ContinueStatement:                      [ 'label' ],
        DeclareKeyword:                         [],
        DefaultClause:                          [ 'statements' ],
        DoStatement:                            [ 'statement', 'expression' ],
        DotDotDotToken:                         [],
        ElementAccessExpression:                [ 'expression', 'argumentExpression' ],
        EndOfFileToken:                         [],
        EnumDeclaration:                        [ 'decorators', 'modifiers', 'name', 'members' ],
        EnumMember:                             [ 'name', 'initializer' ],
        EqualsEqualsEqualsToken:                [],
        EqualsGreaterThanToken:                 [],
        EqualsToken:                            [],
        ExclamationEqualsEqualsToken:           [],
        ExportKeyword:                          [],
        ExpressionStatement:                    [ 'expression' ],
        ExpressionWithTypeArguments:            [ 'expression', 'typeArguments' ],
        FalseKeyword:                           [],
        ForOfStatement:                         [ 'awaitModifier', 'initializer', 'expression', 'statement' ],
        ForStatement:                           [ 'initializer', 'condition', 'incrementor', 'statement' ],
        FunctionDeclaration:                    [ 'decorators', 'modifiers', 'asteriskToken', 'name', 'typeParameters', 'parameters', 'type', 'body', 'jsDoc' ],
        FunctionType:                           [ 'typeParameters', 'parameters', 'type' ],
        GreaterThanEqualsToken:                 [],
        GreaterThanGreaterThanGreaterThanToken: [],
        GreaterThanGreaterThanToken:            [],
        GreaterThanToken:                       [],
        HeritageClause:                         [ 'token', 'types' ],
        IfStatement:                            [ 'expression', 'thenStatement', 'elseStatement' ],
        ImportEqualsDeclaration:                [ 'decorators', 'modifiers', 'name', 'moduleReference' ],
        IndexSignature:                         [ 'decorators', 'modifiers', 'parameters', 'type' ],
        IndexedAccessType:                      [ 'objectType', 'indexType' ],
        InterfaceDeclaration:                   [ 'decorators', 'modifiers', 'name', 'typeParameters', 'heritageClauses', 'members', 'jsDoc' ],
        IntersectionType:                       [ 'types' ],
        JSDocComment:                           [ 'tags', 'comment' ],
        JSDocParameterTag:                      [ 'atToken', 'tagName', 'typeExpression', 'name', 'isNameFirst', 'isBracketed', 'comment' ],
        JSDocReturnTag:                         [ 'atToken', 'tagName', 'typeExpression', 'comment' ],
        JSDocTag:                               [ 'atToken', 'tagName', 'comment' ],
        LabeledStatement:                       [ 'label', 'statement' ],
        LessThanEqualsToken:                    [],
        LessThanLessThanEqualsToken:            [],
        LessThanLessThanToken:                  [],
        LessThanToken:                          [],
        LiteralType:                            [ 'literal' ],
        MappedType:                             [ 'readonlyToken', 'typeParameter', 'questionToken', 'type' ],
        MethodDeclaration:                      [ 'decorators', 'modifiers', 'asteriskToken', 'name', 'questionToken', 'typeParameters', 'parameters', 'type', 'body' ],
        MethodSignature:                        [ 'modifiers', 'name', 'questionToken', 'typeParameters', 'parameters', 'type', 'jsDoc' ],
        MinusEqualsToken:                       [],
        MinusToken:                             [],
        ModuleBlock:                            [ 'statements' ],
        ModuleDeclaration:                      [ 'decorators', 'modifiers', 'name', 'body' ],
        NeverKeyword:                           [],
        NewExpression:                          [ 'expression', 'typeArguments', 'arguments' ],
        NonNullExpression:                      [ 'expression' ],
        NullKeyword:                            [],
        NumberKeyword:                          [],
        NumericLiteral:                         [ 'text', 'numericLiteralFlags' ],
        ObjectBindingPattern:                   [ 'elements' ],
        ObjectKeyword:                          [],
        ObjectLiteralExpression:                [ 'multiLine', 'properties' ],
        Parameter:                              [ 'decorators', 'modifiers', 'dotDotDotToken', 'name', 'questionToken', 'type', 'initializer' ],
        ParenthesizedExpression:                [ 'expression' ],
        ParenthesizedType:                      [ 'type' ],
        PercentToken:                           [],
        PlusEqualsToken:                        [],
        PlusToken:                              [],
        PostfixUnaryExpression:                 [ 'operand', 'operator' ],
        PrefixUnaryExpression:                  [ 'operator', 'operand' ],
        PrivateKeyword:                         [],
        PropertyAccessExpression:               [ 'expression', 'name' ],
        PropertyAssignment:                     [ 'modifiers', 'name', 'questionToken', 'initializer' ],
        PropertyDeclaration:                    [ 'decorators', 'modifiers', 'name', 'questionToken', 'type', 'initializer' ],
        PropertySignature:                      [ 'modifiers', 'name', 'questionToken', 'type', 'jsDoc' ],
        QualifiedName:                          [ 'left', 'right' ],
        QuestionToken:                          [],
        ReadonlyKeyword:                        [],
        RegularExpressionLiteral:               [ 'text' ],
        ReturnStatement:                        [ 'expression' ],
        ShorthandPropertyAssignment:            [ 'name', 'questionToken' ],
        SlashToken:                             [],
        SourceFile:                             [
            'text',
            'bindDiagnostics',
            'languageVersion',
            'fileName',
            'languageVariant',
            'isDeclarationFile',
            'scriptKind',
            'hasNoDefaultLib',
            'referencedFiles',
            'typeReferenceDirectives',
            'amdDependencies',
            'moduleName',
            'checkJsDirective',
            'statements',
            'endOfFileToken',
            'externalModuleIndicator',
            'nodeCount',
            'identifierCount',
            'identifiers',
            'parseDiagnostics',
            'path',
            'imports',
            'moduleAugmentations',
            'ambientModuleNames',
            'resolvedModules'
        ],
        StringKeyword:                          [],
        StringLiteral:                          [ 'text' ],
        SwitchStatement:                        [ 'expression', 'caseBlock' ],
        SymbolKeyword:                          [],
        TemplateExpression:                     [ 'head', 'templateSpans' ],
        TemplateHead:                           [ 'text' ],
        TemplateMiddle:                         [ 'text' ],
        TemplateSpan:                           [ 'expression', 'literal' ],
        TemplateTail:                           [ 'text' ],
        ThisType:                               [],
        ThrowStatement:                         [ 'expression' ],
        TrueKeyword:                            [],
        TryStatement:                           [ 'tryBlock', 'catchClause', 'finallyBlock' ],
        TupleType:                              [ 'elementTypes' ],
        TypeAliasDeclaration:                   [ 'decorators', 'modifiers', 'name', 'typeParameters', 'type', 'jsDoc' ],
        TypeAssertionExpression:                [ 'type', 'expression' ],
        TypeLiteral:                            [ 'members' ],
        TypeOfExpression:                       [ 'expression' ],
        TypeOperator:                           [ 'operator', 'type' ],
        TypeParameter:                          [ 'name', 'constraint', 'default' ],
        TypePredicate:                          [ 'parameterName', 'type' ],
        TypeQuery:                              [ 'exprName' ],
        TypeReference:                          [ 'typeName', 'typeArguments' ],
        UndefinedKeyword:                       [],
        UnionType:                              [ 'types' ],
        VariableDeclaration:                    [ 'name', 'type', 'initializer' ],
        VariableDeclarationList:                [ 'declarations' ],
        VariableStatement:                      [ 'decorators', 'modifiers', 'declarationList', 'jsDoc' ],
        VoidKeyword:                            [],
        WhileStatement:                         [ 'expression', 'statement' ]
    };

/**
 * @param {object|SourceFile} ast
 * @param {function} _enter
 * @param {function} [_leave]
 * @param {boolean} [flat=false]
 */
export function traverse( ast, _enter, _leave, flat = false )
{
    const
        _cb   = cb => ( node, parent, field, i, rec ) => cb && object( node ) && has( node, 'kind' ) && cb.call( node, node, parent, field, i, rec ),
        enter = _cb( _enter ),
        leave = _cb( _leave );

    /**
     * @param {Node} node
     * @param {?Node} parent
     * @param {string} field
     * @param {number} [i]
     * @return {boolean|*}
     */
    function generic( node, parent, field, i )
    {
        let stop,
            nodeName = ts.SyntaxKind[ node.kind ];

        nodeName = fixEnums[ nodeName ] || nodeName;

        // if ( nodeName === 'tagName' && !has( node[ key ], 'kind' ) )
        //     node[ key ].kind = syntaxKind.Identifier;
        //
        // if ( !has( node[ key ], 'kind' ) ) return null;
        //
        // if ( !node[ key ].parent || node[ key ].parent !== parent ) node[ key ].parent = parent;

        if ( flat )
            return enter( node, parent, field, i, recurse );

        stop = enter( node, parent, field, i );

        if ( stop === false ) return stop;

        const fields = visitorKeys[ nodeName ];

        if ( stop !== false && fields && fields.length )
        {
            for ( const fieldName of fields )
                if ( ( stop = descend( node[ fieldName ], node, fieldName ) ) === false ) break;
        }

        if ( stop !== false ) stop = leave( node, parent, field, i );

        return stop;
    }

    /**
     * @param {?(object|Array<object>)} arr
     * @param {?Node} parent
     * @param {string} name
     * @param {number} [index]
     * @return {boolean|*}
     */
    function descend( arr, parent, name, index )
    {
        let stop;

        if ( !arr || ( !object( arr ) && !array( arr ) ) ) return;

        if ( object( arr ) )
        {
            if ( name === 'tagName' && !has( arr, 'kind' ) ) arr.kind = syntaxKind.Identifier;
            if ( !has( arr, 'kind' ) ) return;

            if ( !arr.parent || arr.parent !== parent ) arr.parent = parent;

            return generic( arr, parent, name, index );
        }

        if ( array( arr ) )
        {
            for ( const [ i, node ] of arr.entries() )
            {
                // if ( !has( node, 'kind' ) ) continue;
                if ( ( ( stop = descend( node, parent, name, i ) ) === false ) ) break;
            }
        }
        else if ( !( arr instanceof Map ) )
            console.error( `What is it?`, arr );

        return stop;
    }

    /**
     * @param {object} node
     * @return {boolean|*}
     */
    function recurse( node )
    {
        const [ field, index ] = node.parent ? find_field( node.parent, node ) : [];

        let exit = true;

        if ( array( node ) )
        {
            node.some( n => ( exit = generic( n, node.parent, field, index ) ) === false );
            return exit;
        }

        return generic( node, node.parent, field, index );
    }

    /**
     * @param {object} owner
     * @param {object} node
     * @return {[ string, number ]}
     */
    function find_field( owner, node )
    {
        for ( const key of Object.keys( owner ) )
        {
            const value = owner[ key ];

            if ( value === node ) return [ key ];

            if ( array( value ) )
            {
                const index = value.findIndex( n => n === node );
                if ( index >= 0 ) return [ key, index ];
            }
        }

        return [];
    }

    const [ field, index ] = ast.parent ? find_field( ast.parent, ast ) : [];
    return generic( ast, field, index );
}
