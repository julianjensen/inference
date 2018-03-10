/** ****************************************************************************************************
 * File: ts-ast-walker (jsdoc-tag-parser)
 * @author julian on 2/2/18
 * @version 1.0.0
 * @copyright Planet3, Inc.
 *******************************************************************************************************/
'use strict';

import ts        from 'typescript';
import {
    fixEnums,
    syntaxKind
}                from "./ts-helpers";
import { array } from 'convenience';

const
    { SyntaxKind } = ts,
    has            = ( o, n ) => Reflect.has( o, n ),
    object         = o => typeof o === 'object' && !Array.isArray( o ) && o !== null,
    visitorKeys    = {
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

        return array( node ) ? node.map( ( n, i ) => generic( n, null, null, i ) ) : generic( node, node.parent, field, index );

        // let exit = true;
        //
        // if ( array( node ) )
        // {
        //     node.some( n => ( exit = generic( n, node.parent, field, index ) ) === false );
        //     return exit;
        // }
        //
        // return generic( node, node.parent, field, index );
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

/**
 * Invokes a callback for each child of the given node. The 'cbNode' callback is invoked for all child nodes
 * stored in properties. If a 'cbNodes' callback is specified, it is invoked for embedded arrays; otherwise,
 * embedded arrays are flattened and the 'cbNode' callback is invoked for each element. If a callback returns
 * a truthy value, iteration stops and that value is returned. Otherwise, undefined is returned.
 *
 * @param {ts.Node} node a given node to visit its children
 * @param {function} cbNode a callback to be invoked for all child nodes
 * @param {function} [cbNodes] a callback to be invoked for embedded array
 *
 * @remarks `forEachChild` must visit the children of a node in the order
 * that they appear in the source code. The language service depends on this property to locate nodes by position.
 */
export function forEachChild( node, cbNode, cbNodes )
{
    if ( !node || node.kind <= SyntaxKind.LastToken )
    {
        return;
    }
    switch ( node.kind )
    {
        case SyntaxKind.QualifiedName:
            return visitNode( cbNode, node.left ) ||
                   visitNode( cbNode, node.right );
        case SyntaxKind.TypeParameter:
            return visitNode( cbNode, node.name ) ||
                   visitNode( cbNode, node.constraint ) ||
                   visitNode( cbNode, node.default ) ||
                   visitNode( cbNode, node.expression );
        case SyntaxKind.ShorthandPropertyAssignment:
            return visitNodes( cbNode, cbNodes, node.decorators ) ||
                   visitNodes( cbNode, cbNodes, node.modifiers ) ||
                   visitNode( cbNode, node.name ) ||
                   visitNode( cbNode, node.questionToken ) ||
                   visitNode( cbNode, node.equalsToken ) ||
                   visitNode( cbNode, node.objectAssignmentInitializer );
        case SyntaxKind.SpreadAssignment:
            return visitNode( cbNode, node.expression );
        case SyntaxKind.Parameter:
            return visitNodes( cbNode, cbNodes, node.decorators ) ||
                   visitNodes( cbNode, cbNodes, node.modifiers ) ||
                   visitNode( cbNode, node.dotDotDotToken ) ||
                   visitNode( cbNode, node.name ) ||
                   visitNode( cbNode, node.questionToken ) ||
                   visitNode( cbNode, node.type ) ||
                   visitNode( cbNode, node.initializer );
        case SyntaxKind.PropertyDeclaration:
            return visitNodes( cbNode, cbNodes, node.decorators ) ||
                   visitNodes( cbNode, cbNodes, node.modifiers ) ||
                   visitNode( cbNode, node.name ) ||
                   visitNode( cbNode, node.questionToken ) ||
                   visitNode( cbNode, node.exclamationToken ) ||
                   visitNode( cbNode, node.type ) ||
                   visitNode( cbNode, node.initializer );
        case SyntaxKind.PropertySignature:
            return visitNodes( cbNode, cbNodes, node.decorators ) ||
                   visitNodes( cbNode, cbNodes, node.modifiers ) ||
                   visitNode( cbNode, node.name ) ||
                   visitNode( cbNode, node.questionToken ) ||
                   visitNode( cbNode, node.type ) ||
                   visitNode( cbNode, node.initializer );
        case SyntaxKind.PropertyAssignment:
            return visitNodes( cbNode, cbNodes, node.decorators ) ||
                   visitNodes( cbNode, cbNodes, node.modifiers ) ||
                   visitNode( cbNode, node.name ) ||
                   visitNode( cbNode, node.questionToken ) ||
                   visitNode( cbNode, node.initializer );
        case SyntaxKind.VariableDeclaration:
            return visitNodes( cbNode, cbNodes, node.decorators ) ||
                   visitNodes( cbNode, cbNodes, node.modifiers ) ||
                   visitNode( cbNode, node.name ) ||
                   visitNode( cbNode, node.exclamationToken ) ||
                   visitNode( cbNode, node.type ) ||
                   visitNode( cbNode, node.initializer );
        case SyntaxKind.BindingElement:
            return visitNodes( cbNode, cbNodes, node.decorators ) ||
                   visitNodes( cbNode, cbNodes, node.modifiers ) ||
                   visitNode( cbNode, node.propertyName ) ||
                   visitNode( cbNode, node.dotDotDotToken ) ||
                   visitNode( cbNode, node.name ) ||
                   visitNode( cbNode, node.initializer );
        case SyntaxKind.FunctionType:
        case SyntaxKind.ConstructorType:
        case SyntaxKind.CallSignature:
        case SyntaxKind.ConstructSignature:
        case SyntaxKind.IndexSignature:
            return visitNodes( cbNode, cbNodes, node.decorators ) ||
                   visitNodes( cbNode, cbNodes, node.modifiers ) ||
                   visitNodes( cbNode, cbNodes, node.typeParameters ) ||
                   visitNodes( cbNode, cbNodes, node.parameters ) ||
                   visitNode( cbNode, node.type );
        case SyntaxKind.MethodDeclaration:
        case SyntaxKind.MethodSignature:
        case SyntaxKind.Constructor:
        case SyntaxKind.GetAccessor:
        case SyntaxKind.SetAccessor:
        case SyntaxKind.FunctionExpression:
        case SyntaxKind.FunctionDeclaration:
        case SyntaxKind.ArrowFunction:
            return visitNodes( cbNode, cbNodes, node.decorators ) ||
                   visitNodes( cbNode, cbNodes, node.modifiers ) ||
                   visitNode( cbNode, node.asteriskToken ) ||
                   visitNode( cbNode, node.name ) ||
                   visitNode( cbNode, node.questionToken ) ||
                   visitNodes( cbNode, cbNodes, node.typeParameters ) ||
                   visitNodes( cbNode, cbNodes, node.parameters ) ||
                   visitNode( cbNode, node.type ) ||
                   visitNode( cbNode, node.equalsGreaterThanToken ) ||
                   visitNode( cbNode, node.body );
        case SyntaxKind.TypeReference:
            return visitNode( cbNode, node.typeName ) ||
                   visitNodes( cbNode, cbNodes, node.typeArguments );
        case SyntaxKind.TypePredicate:
            return visitNode( cbNode, node.parameterName ) ||
                   visitNode( cbNode, node.type );
        case SyntaxKind.TypeQuery:
            return visitNode( cbNode, node.exprName );
        case SyntaxKind.TypeLiteral:
            return visitNodes( cbNode, cbNodes, node.members );
        case SyntaxKind.ArrayType:
            return visitNode( cbNode, node.elementType );
        case SyntaxKind.TupleType:
            return visitNodes( cbNode, cbNodes, node.elementTypes );
        case SyntaxKind.UnionType:
        case SyntaxKind.IntersectionType:
            return visitNodes( cbNode, cbNodes, node.types );
        case SyntaxKind.ParenthesizedType:
        case SyntaxKind.TypeOperator:
            return visitNode( cbNode, node.type );
        case SyntaxKind.IndexedAccessType:
            return visitNode( cbNode, node.objectType ) ||
                   visitNode( cbNode, node.indexType );
        case SyntaxKind.MappedType:
            return visitNode( cbNode, node.readonlyToken ) ||
                   visitNode( cbNode, node.typeParameter ) ||
                   visitNode( cbNode, node.questionToken ) ||
                   visitNode( cbNode, node.type );
        case SyntaxKind.LiteralType:
            return visitNode( cbNode, node.literal );
        case SyntaxKind.ObjectBindingPattern:
        case SyntaxKind.ArrayBindingPattern:
            return visitNodes( cbNode, cbNodes, node.elements );
        case SyntaxKind.ArrayLiteralExpression:
            return visitNodes( cbNode, cbNodes, node.elements );
        case SyntaxKind.ObjectLiteralExpression:
            return visitNodes( cbNode, cbNodes, node.properties );
        case SyntaxKind.PropertyAccessExpression:
            return visitNode( cbNode, node.expression ) ||
                   visitNode( cbNode, node.name );
        case SyntaxKind.ElementAccessExpression:
            return visitNode( cbNode, node.expression ) ||
                   visitNode( cbNode, node.argumentExpression );
        case SyntaxKind.CallExpression:
        case SyntaxKind.NewExpression:
            return visitNode( cbNode, node.expression ) ||
                   visitNodes( cbNode, cbNodes, node.typeArguments ) ||
                   visitNodes( cbNode, cbNodes, node.arguments );
        case SyntaxKind.TaggedTemplateExpression:
            return visitNode( cbNode, node.tag ) ||
                   visitNode( cbNode, node.template );
        case SyntaxKind.TypeAssertionExpression:
            return visitNode( cbNode, node.type ) ||
                   visitNode( cbNode, node.expression );
        case SyntaxKind.ParenthesizedExpression:
            return visitNode( cbNode, node.expression );
        case SyntaxKind.DeleteExpression:
            return visitNode( cbNode, node.expression );
        case SyntaxKind.TypeOfExpression:
            return visitNode( cbNode, node.expression );
        case SyntaxKind.VoidExpression:
            return visitNode( cbNode, node.expression );
        case SyntaxKind.PrefixUnaryExpression:
            return visitNode( cbNode, node.operand );
        case SyntaxKind.YieldExpression:
            return visitNode( cbNode, node.asteriskToken ) ||
                   visitNode( cbNode, node.expression );
        case SyntaxKind.AwaitExpression:
            return visitNode( cbNode, node.expression );
        case SyntaxKind.PostfixUnaryExpression:
            return visitNode( cbNode, node.operand );
        case SyntaxKind.BinaryExpression:
            return visitNode( cbNode, node.left ) ||
                   visitNode( cbNode, node.operatorToken ) ||
                   visitNode( cbNode, node.right );
        case SyntaxKind.AsExpression:
            return visitNode( cbNode, node.expression ) ||
                   visitNode( cbNode, node.type );
        case SyntaxKind.NonNullExpression:
            return visitNode( cbNode, node.expression );
        case SyntaxKind.MetaProperty:
            return visitNode( cbNode, node.name );
        case SyntaxKind.ConditionalExpression:
            return visitNode( cbNode, node.condition ) ||
                   visitNode( cbNode, node.questionToken ) ||
                   visitNode( cbNode, node.whenTrue ) ||
                   visitNode( cbNode, node.colonToken ) ||
                   visitNode( cbNode, node.whenFalse );
        case SyntaxKind.SpreadElement:
            return visitNode( cbNode, node.expression );
        case SyntaxKind.Block:
        case SyntaxKind.ModuleBlock:
            return visitNodes( cbNode, cbNodes, node.statements );
        case SyntaxKind.SourceFile:
            return visitNodes( cbNode, cbNodes, node.statements ) ||
                   visitNode( cbNode, node.endOfFileToken );
        case SyntaxKind.VariableStatement:
            return visitNodes( cbNode, cbNodes, node.decorators ) ||
                   visitNodes( cbNode, cbNodes, node.modifiers ) ||
                   visitNode( cbNode, node.declarationList );
        case SyntaxKind.VariableDeclarationList:
            return visitNodes( cbNode, cbNodes, node.declarations );
        case SyntaxKind.ExpressionStatement:
            return visitNode( cbNode, node.expression );
        case SyntaxKind.IfStatement:
            return visitNode( cbNode, node.expression ) ||
                   visitNode( cbNode, node.thenStatement ) ||
                   visitNode( cbNode, node.elseStatement );
        case SyntaxKind.DoStatement:
            return visitNode( cbNode, node.statement ) ||
                   visitNode( cbNode, node.expression );
        case SyntaxKind.WhileStatement:
            return visitNode( cbNode, node.expression ) ||
                   visitNode( cbNode, node.statement );
        case SyntaxKind.ForStatement:
            return visitNode( cbNode, node.initializer ) ||
                   visitNode( cbNode, node.condition ) ||
                   visitNode( cbNode, node.incrementor ) ||
                   visitNode( cbNode, node.statement );
        case SyntaxKind.ForInStatement:
            return visitNode( cbNode, node.initializer ) ||
                   visitNode( cbNode, node.expression ) ||
                   visitNode( cbNode, node.statement );
        case SyntaxKind.ForOfStatement:
            return visitNode( cbNode, node.awaitModifier ) ||
                   visitNode( cbNode, node.initializer ) ||
                   visitNode( cbNode, node.expression ) ||
                   visitNode( cbNode, node.statement );
        case SyntaxKind.ContinueStatement:
        case SyntaxKind.BreakStatement:
            return visitNode( cbNode, node.label );
        case SyntaxKind.ReturnStatement:
            return visitNode( cbNode, node.expression );
        case SyntaxKind.WithStatement:
            return visitNode( cbNode, node.expression ) ||
                   visitNode( cbNode, node.statement );
        case SyntaxKind.SwitchStatement:
            return visitNode( cbNode, node.expression ) ||
                   visitNode( cbNode, node.caseBlock );
        case SyntaxKind.CaseBlock:
            return visitNodes( cbNode, cbNodes, node.clauses );
        case SyntaxKind.CaseClause:
            return visitNode( cbNode, node.expression ) ||
                   visitNodes( cbNode, cbNodes, node.statements );
        case SyntaxKind.DefaultClause:
            return visitNodes( cbNode, cbNodes, node.statements );
        case SyntaxKind.LabeledStatement:
            return visitNode( cbNode, node.label ) ||
                   visitNode( cbNode, node.statement );
        case SyntaxKind.ThrowStatement:
            return visitNode( cbNode, node.expression );
        case SyntaxKind.TryStatement:
            return visitNode( cbNode, node.tryBlock ) ||
                   visitNode( cbNode, node.catchClause ) ||
                   visitNode( cbNode, node.finallyBlock );
        case SyntaxKind.CatchClause:
            return visitNode( cbNode, node.variableDeclaration ) ||
                   visitNode( cbNode, node.block );
        case SyntaxKind.Decorator:
            return visitNode( cbNode, node.expression );
        case SyntaxKind.ClassDeclaration:
        case SyntaxKind.ClassExpression:
            return visitNodes( cbNode, cbNodes, node.decorators ) ||
                   visitNodes( cbNode, cbNodes, node.modifiers ) ||
                   visitNode( cbNode, node.name ) ||
                   visitNodes( cbNode, cbNodes, node.typeParameters ) ||
                   visitNodes( cbNode, cbNodes, node.heritageClauses ) ||
                   visitNodes( cbNode, cbNodes, node.members );
        case SyntaxKind.InterfaceDeclaration:
            return visitNodes( cbNode, cbNodes, node.decorators ) ||
                   visitNodes( cbNode, cbNodes, node.modifiers ) ||
                   visitNode( cbNode, node.name ) ||
                   visitNodes( cbNode, cbNodes, node.typeParameters ) ||
                   visitNodes( cbNode, cbNodes, node.heritageClauses ) ||
                   visitNodes( cbNode, cbNodes, node.members );
        case SyntaxKind.TypeAliasDeclaration:
            return visitNodes( cbNode, cbNodes, node.decorators ) ||
                   visitNodes( cbNode, cbNodes, node.modifiers ) ||
                   visitNode( cbNode, node.name ) ||
                   visitNodes( cbNode, cbNodes, node.typeParameters ) ||
                   visitNode( cbNode, node.type );
        case SyntaxKind.EnumDeclaration:
            return visitNodes( cbNode, cbNodes, node.decorators ) ||
                   visitNodes( cbNode, cbNodes, node.modifiers ) ||
                   visitNode( cbNode, node.name ) ||
                   visitNodes( cbNode, cbNodes, node.members );
        case SyntaxKind.EnumMember:
            return visitNode( cbNode, node.name ) ||
                   visitNode( cbNode, node.initializer );
        case SyntaxKind.ModuleDeclaration:
            return visitNodes( cbNode, cbNodes, node.decorators ) ||
                   visitNodes( cbNode, cbNodes, node.modifiers ) ||
                   visitNode( cbNode, node.name ) ||
                   visitNode( cbNode, node.body );
        case SyntaxKind.ImportEqualsDeclaration:
            return visitNodes( cbNode, cbNodes, node.decorators ) ||
                   visitNodes( cbNode, cbNodes, node.modifiers ) ||
                   visitNode( cbNode, node.name ) ||
                   visitNode( cbNode, node.moduleReference );
        case SyntaxKind.ImportDeclaration:
            return visitNodes( cbNode, cbNodes, node.decorators ) ||
                   visitNodes( cbNode, cbNodes, node.modifiers ) ||
                   visitNode( cbNode, node.importClause ) ||
                   visitNode( cbNode, node.moduleSpecifier );
        case SyntaxKind.ImportClause:
            return visitNode( cbNode, node.name ) ||
                   visitNode( cbNode, node.namedBindings );
        case SyntaxKind.NamespaceExportDeclaration:
            return visitNode( cbNode, node.name );

        case SyntaxKind.NamespaceImport:
            return visitNode( cbNode, node.name );
        case SyntaxKind.NamedImports:
        case SyntaxKind.NamedExports:
            return visitNodes( cbNode, cbNodes, node.elements );
        case SyntaxKind.ExportDeclaration:
            return visitNodes( cbNode, cbNodes, node.decorators ) ||
                   visitNodes( cbNode, cbNodes, node.modifiers ) ||
                   visitNode( cbNode, node.exportClause ) ||
                   visitNode( cbNode, node.moduleSpecifier );
        case SyntaxKind.ImportSpecifier:
        case SyntaxKind.ExportSpecifier:
            return visitNode( cbNode, node.propertyName ) ||
                   visitNode( cbNode, node.name );
        case SyntaxKind.ExportAssignment:
            return visitNodes( cbNode, cbNodes, node.decorators ) ||
                   visitNodes( cbNode, cbNodes, node.modifiers ) ||
                   visitNode( cbNode, node.expression );
        case SyntaxKind.TemplateExpression:
            return visitNode( cbNode, node.head ) || visitNodes( cbNode, cbNodes, node.templateSpans );
        case SyntaxKind.TemplateSpan:
            return visitNode( cbNode, node.expression ) || visitNode( cbNode, node.literal );
        case SyntaxKind.ComputedPropertyName:
            return visitNode( cbNode, node.expression );
        case SyntaxKind.HeritageClause:
            return visitNodes( cbNode, cbNodes, node.types );
        case SyntaxKind.ExpressionWithTypeArguments:
            return visitNode( cbNode, node.expression ) ||
                   visitNodes( cbNode, cbNodes, node.typeArguments );
        case SyntaxKind.ExternalModuleReference:
            return visitNode( cbNode, node.expression );
        case SyntaxKind.MissingDeclaration:
            return visitNodes( cbNode, cbNodes, node.decorators );
        case SyntaxKind.CommaListExpression:
            return visitNodes( cbNode, cbNodes, node.elements );

        case SyntaxKind.JsxElement:
            return visitNode( cbNode, node.openingElement ) ||
                   visitNodes( cbNode, cbNodes, node.children ) ||
                   visitNode( cbNode, node.closingElement );
        case SyntaxKind.JsxFragment:
            return visitNode( cbNode, node.openingFragment ) ||
                   visitNodes( cbNode, cbNodes, node.children ) ||
                   visitNode( cbNode, node.closingFragment );
        case SyntaxKind.JsxSelfClosingElement:
        case SyntaxKind.JsxOpeningElement:
            return visitNode( cbNode, node.tagName ) ||
                   visitNode( cbNode, node.attributes );
        case SyntaxKind.JsxAttributes:
            return visitNodes( cbNode, cbNodes, node.properties );
        case SyntaxKind.JsxAttribute:
            return visitNode( cbNode, node.name ) ||
                   visitNode( cbNode, node.initializer );
        case SyntaxKind.JsxSpreadAttribute:
            return visitNode( cbNode, node.expression );
        case SyntaxKind.JsxExpression:
            return visitNode( cbNode, node.dotDotDotToken ) ||
                   visitNode( cbNode, node.expression );
        case SyntaxKind.JsxClosingElement:
            return visitNode( cbNode, node.tagName );

        case SyntaxKind.JSDocTypeExpression:
            return visitNode( cbNode, node.type );
        case SyntaxKind.JSDocNonNullableType:
            return visitNode( cbNode, node.type );
        case SyntaxKind.JSDocNullableType:
            return visitNode( cbNode, node.type );
        case SyntaxKind.JSDocOptionalType:
            return visitNode( cbNode, node.type );
        case SyntaxKind.JSDocFunctionType:
            return visitNodes( cbNode, cbNodes, node.parameters ) ||
                   visitNode( cbNode, node.type );
        case SyntaxKind.JSDocVariadicType:
            return visitNode( cbNode, node.type );
        case SyntaxKind.JSDocComment:
            return visitNodes( cbNode, cbNodes, node.tags );
        case SyntaxKind.JSDocParameterTag:
        case SyntaxKind.JSDocPropertyTag:
            if ( node.isNameFirst )
            {
                return visitNode( cbNode, node.name ) ||
                       visitNode( cbNode, node.typeExpression );
            }
            else
            {
                return visitNode( cbNode, node.typeExpression ) ||
                       visitNode( cbNode, node.name );
            }
        case SyntaxKind.JSDocReturnTag:
            return visitNode( cbNode, node.typeExpression );
        case SyntaxKind.JSDocTypeTag:
            return visitNode( cbNode, node.typeExpression );
        case SyntaxKind.JSDocAugmentsTag:
            return visitNode( cbNode, node.class );
        case SyntaxKind.JSDocTemplateTag:
            return visitNodes( cbNode, cbNodes, node.typeParameters );
        case SyntaxKind.JSDocTypedefTag:
            if ( node.typeExpression && node.typeExpression.kind === SyntaxKind.JSDocTypeExpression )
            {
                return visitNode( cbNode, node.typeExpression ) ||
                       visitNode( cbNode, node.fullName );
            }
            else
            {
                return visitNode( cbNode, node.fullName ) ||
                       visitNode( cbNode, node.typeExpression );
            }
        case SyntaxKind.JSDocTypeLiteral:
            if ( node.jsDocPropertyTags )
            {
                for ( const tag of node.jsDocPropertyTags )
                    visitNode( cbNode, tag );
            }
            return;
        case SyntaxKind.PartiallyEmittedExpression:
            return visitNode( cbNode, node.expression );
    }
}

function visitNode( cbNode, node )
{
    return node && cbNode( node );
}


function visitNodes( cbNode, cbNodes, nodes )
{
    if ( nodes )
    {
        if ( cbNodes )
            return cbNodes( nodes );

        for ( const node of nodes )
        {
            const result = cbNode( node );
            if ( result )
                return result;
        }
    }
}
