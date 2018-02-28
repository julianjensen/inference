/** ****************************************************************************************************
 * File: relations (jsdoc-tag-parser)
 * @author julian on 2/22/18
 * @version 1.0.0
 * @copyright Planet3, Inc.
 *******************************************************************************************************/

'use strict';

import {
    TypeFlags,
    SymbolFlags,
    Ternary,
    Variance,
    IndexKind,
    ObjectFlags,
    ModifierFlags,
    CharacterCodes
}                     from "../types";
import { SyntaxKind } from "../ts/ts-helpers";

const
    strictNullChecks = false,
    enumRelation = new Map(),
    subtypeRelation = new Map(),
    assignableRelation = new Map(),
    definitelyAssignableRelation = new Map(),
    comparableRelation = new Map(),
    identityRelation = new Map();

let maybeKeys; // string[];
let sourceStack; // Type[];
let targetStack; // Type[];
let maybeCount                = 0;
let depth                     = 0;
let expandingFlags            = ExpandingFlags.None;
let overflow                  = false;
let isIntersectionConstituent = false;
let nextSymbolId = 1;


/**
 * @interface SymbolRelations
 * @this Type
 */
const SymbolRelations = {

    /**
     * @param {Symbol} targetSymbol
     * @return {boolean}
     */
    isEnumTypeRelatedTo( targetSymbol )
    {
        if ( this === targetSymbol ) return true;

        const
            id       = this.id + "," + targetSymbol.id,
            relation = enumRelation.get( id );

        if ( relation !== undefined ) return relation;

        if ( this.escapedName !== targetSymbol.escapedName || !( this.flags & SymbolFlags.RegularEnum ) || !( targetSymbol.flags & SymbolFlags.RegularEnum ) )
        {
            enumRelation.set( id, false );
            return false;
        }

        const targetEnumType = targetSymbol.getTypeOfSymbol();

        for ( const property of this.getTypeOfSymbol().getPropertiesOfType() )
        {
            if ( property.flags & SymbolFlags.EnumMember )
            {
                const targetProperty = targetEnumType.getPropertyOfType( property.escapedName );

                if ( !targetProperty || !( targetProperty.flags & SymbolFlags.EnumMember ) )
                {
                    enumRelation.set( id, false );
                    return false;
                }
            }
        }
        enumRelation.set( id, true );
        return true;
    }

}


/**
 * @interface TypeRelations
 * @extends Type
 * @this Type
 */
const TypeRelations = {
    isEmptyResolvedType()
    {
        return this.members.size === 0 &&
            this.callSignatures.length === 0 &&
            this.constructSignatures.length === 0 &&
            !this.stringIndexInfo &&
            !this.numberIndexInfo;
    },

    isEmptyObjectType()
    {
        return this.flags & TypeFlags.Object
               ? isEmptyResolvedType( this.resolveStructuredTypeMembers() )
               : this.flags & TypeFlags.NonPrimitive
                 ? true
                 : this.flags & TypeFlags.Union
                   ? forEach( this.types, isEmptyObjectType )
                   : this.flags & TypeFlags.Intersection
                     ? !forEach( this.types, t => !this.isEmptyObjectType() )
                     : false;
    },

    isSimpleTypeRelatedTo( target, relation )
    {
        const
            s = this.flags,
            t = target.flags;

        if ( t & TypeFlags.Any || s & TypeFlags.Never ) return true;

        if ( t & TypeFlags.Never ) return false;

        if ( s & TypeFlags.StringLike && t & TypeFlags.String ) return true;

        if ( s & TypeFlags.StringLiteral && s & TypeFlags.EnumLiteral && t & TypeFlags.StringLiteral && !( t & TypeFlags.EnumLiteral ) && this.value === target.value )
            return true;

        if ( s & TypeFlags.NumberLike && t & TypeFlags.Number ) return true;

        if ( s & TypeFlags.NumberLiteral && s & TypeFlags.EnumLiteral && t & TypeFlags.NumberLiteral && !( t & TypeFlags.EnumLiteral ) && this.value === target.value )
            return true;

        if ( s & TypeFlags.BooleanLike && t & TypeFlags.Boolean ) return true;

        if ( s & TypeFlags.ESSymbolLike && t & TypeFlags.ESSymbol ) return true;

        if ( s & TypeFlags.Enum && t & TypeFlags.Enum && this.symbol.isEnumTypeRelatedTo( target.symbol ) ) return true;

        if ( s & TypeFlags.EnumLiteral && t & TypeFlags.EnumLiteral )
        {
            if ( s & TypeFlags.Union && t & TypeFlags.Union && this.symbol.isEnumTypeRelatedTo( target.symbol ) ) return true;

            if ( s & TypeFlags.Literal && t & TypeFlags.Literal && this.value === target.value &&
                this.symbol.parent.isEnumTypeRelatedTo( target.symbol.parent ) )
                return true;
        }

        if ( s & TypeFlags.Undefined && ( !strictNullChecks || t & ( TypeFlags.Undefined | TypeFlags.Void ) ) ) return true;

        if ( s & TypeFlags.Null && ( !strictNullChecks || t & TypeFlags.Null ) ) return true;

        if ( s & TypeFlags.Object && t & TypeFlags.NonPrimitive ) return true;

        if ( s & TypeFlags.UniqueESSymbol || t & TypeFlags.UniqueESSymbol ) return false;

        if ( relation === assignableRelation || relation === definitelyAssignableRelation || relation === comparableRelation )
        {
            if ( s & TypeFlags.Any ) return true;

            // Type number or any numeric literal type is assignable to any numeric enum type or any
            // numeric enum literal type. This rule exists for backwards compatibility reasons because
            // bit-flag enum types sometimes look like literal enum types with numeric literal values.
            if ( s & ( TypeFlags.Number | TypeFlags.NumberLiteral ) && !( s & TypeFlags.EnumLiteral ) &&
               ( t & TypeFlags.Enum || t & TypeFlags.NumberLiteral && t & TypeFlags.EnumLiteral ) ) return true;
        }

        return false;
    },

    isTypeRelatedTo( target, relation )
    {
        if ( this.flags & TypeFlags.StringOrNumberLiteral && this.flags & TypeFlags.FreshLiteral )
            return this.regularType.isTypeRelatedTo( target, relation );

        if ( target.flags & TypeFlags.StringOrNumberLiteral && target.flags & TypeFlags.FreshLiteral )
            target = target.regularType;

        if ( this === target ||
            relation === comparableRelation && !( target.flags & TypeFlags.Never ) && target.isSimpleTypeRelatedTo( this, relation ) ||
            relation !== identityRelation && this.isSimpleTypeRelatedTo( target, relation ) )
        {
            return true;
        }

        if ( this.flags & TypeFlags.Object && target.flags & TypeFlags.Object )
        {
            const related = relation.get( this.getRelationKey( target, relation ) );
            if ( related !== undefined )
                return related === RelationComparisonResult.Succeeded;
        }

        if ( this.flags & TypeFlags.StructuredOrInstantiable || target.flags & TypeFlags.StructuredOrInstantiable )
            return this.isRelatedTo( target, relation ) !== Ternary.False;

        return false;
    },

    isUnionOrIntersectionTypeWithoutNullableConstituents()
    {
        if ( !( this.flags & TypeFlags.UnionOrIntersection ) )
            return false;

        // at this point we know that this is union or intersection type possibly with nullable constituents.
        // check if we still will have compound type if we ignore nullable components.
        let seenNonNullable = false;

        for ( const t of this.types )
        {
            if ( t.flags & TypeFlags.Nullable ) continue;
            if ( seenNonNullable ) return true;
            seenNonNullable = true;
        }

        return false;
    },

    /**
     * Compare two types and return
     * * Ternary.True if they are related with no assumptions,
     * * Ternary.Maybe if they are related with assumptions of other relationships, or
     * * Ternary.False if they are not related.
     */
    isRelatedTo( target, relation )
    {
        if ( target.flags & TypeFlags.StringOrNumberLiteral && target.flags & TypeFlags.FreshLiteral )
            target = target.regularType;

        if ( this.flags & TypeFlags.StringOrNumberLiteral && this.flags & TypeFlags.FreshLiteral )
            return this.regularType.isRelatedTo( target );

        if ( this.flags & TypeFlags.Substitution )
        {
            const source = relation === definitelyAssignableRelation ? source.typeParameter : source.substitute;
            return source.isRelatedTo( target );
        }

        if ( target.flags & TypeFlags.Substitution )
            target =target.typeParameter;

        // both types are the same - covers 'they are the same primitive type or both are Any' or the same type parameter cases
        if ( this === target ) return Ternary.True;

        if ( relation === identityRelation )
            return this.isIdenticalTo( target );

        if ( relation === comparableRelation && !( target.flags & TypeFlags.Never ) && target.isSimpleTypeRelatedTo( source, relation ) ||
            this.isSimpleTypeRelatedTo( target, relation ) ) return Ternary.True;

        if ( this.isObjectLiteralType() && this.flags & TypeFlags.FreshLiteral )
        {
            const discriminantType = target.flags & TypeFlags.Union ? this.findMatchingDiscriminantType( target );

            if ( this.hasExcessProperties( target, discriminantType ) )
                return Ternary.False;

            // Above we check for excess properties with respect to the entire target type. When union
            // and intersection types are further deconstructed on the target side, we don't want to
            // make the check again (as it might fail for a partial target type). Therefore we obtain
            // the regular source type and proceed with that.

            if ( isUnionOrIntersectionTypeWithoutNullableConstituents( target ) && !discriminantType )
                return this.getRegularTypeOfObjectLiteral().isRelatedTo( target );
        }

        if ( relation !== comparableRelation &&
            !( this.flags & TypeFlags.UnionOrIntersection ) &&
            !( target.flags & TypeFlags.Union ) &&
            !isIntersectionConstituent &&
            this !== globalObjectType &&
            ( this.getPropertiesOfType().length > 0 || this.typeHasCallOrConstructSignatures() ) &&
            isWeakType( target ) &&
            !this.hasCommonProperties( target ) )
        {
            return Ternary.False;
        }

        let result                          = Ternary.False;

        isIntersectionConstituent           = false;

        const
            saveIsIntersectionConstituent = isIntersectionConstituent;

        // Note that these checks are specifically ordered to produce correct results. In particular,
        // we need to deconstruct unions before intersections (because unions are always at the top),
        // and we need to handle "each" relations before "some" relations for the same kind of type.
        if ( this.flags & TypeFlags.Union )
        {
            result = relation === comparableRelation ?
                     this.someTypeRelatedToType( target ) :
                     this.eachTypeRelatedToType( target );
        }
        else
        {
            if ( target.flags & TypeFlags.Union )
                result = this.typeRelatedToSomeType( target );
            else if ( target.flags & TypeFlags.Intersection )
            {
                isIntersectionConstituent = true;
                result                    = this.typeRelatedToEachType( target );
            }
            else if ( this.flags & TypeFlags.Intersection )
            {
                // Check to see if any constituents of the intersection are immediately related to the target.
                //
                // Don't report errors though. Checking whether a constituent is related to the source is not actually
                // useful and leads to some confusing error messages. Instead it is better to let the below checks
                // take care of this, or to not elaborate at all. For instance,
                //
                //    - For an object type (such as 'C = A & B'), users are usually more interested in structural errors.
                //
                //    - For a union type (such as '(A | B) = (C & D)'), it's better to hold onto the whole intersection
                //          than to report that 'D' is not assignable to 'A' or 'B'.
                //
                //    - For a primitive type or type parameter (such as 'number = A & B') there is no point in
                //          breaking the intersection apart.
                result = this.someTypeRelatedToType( target );
            }

            if ( !result && ( this.flags & TypeFlags.StructuredOrInstantiable || target.flags & TypeFlags.StructuredOrInstantiable ) )
                result = this.recursiveTypeRelatedTo( target );
        }

        isIntersectionConstituent = saveIsIntersectionConstituent;

        return result;
    },

    isIdenticalTo( target )
    {
        let result;

        const flags = this.flags & target.flags;

        if ( flags & TypeFlags.Object )
            return this.recursiveTypeRelatedTo( target );

        if ( flags & ( TypeFlags.Union | TypeFlags.Intersection ) )
        {
            if ( result = this.eachTypeRelatedToSomeType( target ) )
            {
                if ( result &= target.eachTypeRelatedToSomeType( this ) )
                    return result;
            }
        }

        if ( flags & TypeFlags.Index )
            return this.type.isRelatedTo( target.type );

        if ( flags & TypeFlags.IndexedAccess )
        {
            if ( result = this.objectType.isRelatedTo( target.objectType ) )
            {
                if ( result &= this.indexType.isRelatedTo( target.indexType ) )
                    return result;
            }
        }

        if ( flags & TypeFlags.Conditional )
        {
            if ( result = this.checkType.isRelatedTo( target.checkType ) )
            {
                if ( result &= this.extendsType.isRelatedTo( target.extendsType ) )
                {
                    if ( result &= this.trueType.isRelatedTo( target.trueType ) )
                    {
                        if ( result &= this.falseType.isRelatedTo( target.falseType ) )
                        {
                            if ( this.isDistributiveConditionalType() === target.isDistributiveConditionalType() )
                                return result;
                        }
                    }
                }
            }
        }

        if ( flags & TypeFlags.Substitution )
            return this.substitute.isRelatedTo( target.substitute );

        return Ternary.False;
    },

    hasExcessProperties( target, discriminant )
    {
        if ( target.maybeTypeOfKind( TypeFlags.Object ) && !( target.getObjectFlags() & ObjectFlags.ObjectLiteralPatternWithComputedProperties ) )
        {
            const isComparingJsxAttributes = !!( this.getObjectFlags() & ObjectFlags.JsxAttributes );

            if ( ( relation === assignableRelation || relation === definitelyAssignableRelation || relation === comparableRelation ) &&
                ( globalObjectType.isTypeSubsetOf( target ) || ( !isComparingJsxAttributes && target.isEmptyObjectType() ) ) )
                return false;

            if ( discriminant )
            // check excess properties against discriminant type only, not the entire union
                return this.hasExcessProperties( discriminant, /*discriminant*/ undefined );

            for ( const prop of this.getPropertiesOfObjectType() )
            {
                if ( !target.isKnownProperty( prop.escapedName, isComparingJsxAttributes ) )
                    return true;
            }
        }
        return false;
    },

    eachTypeRelatedToSomeType( target )
    {
        let result        = Ternary.True;

        const sourceTypes = this.types;

        for ( const sourceType of this.types )
        {
            const related = sourceType.typeRelatedToSomeType( target );

            if ( !related )
                return Ternary.False;

            result &= related;
        }
        return result;
    },

    typeRelatedToSomeType( target )
    {
        const targetTypes = target.types;

        if ( target.flags & TypeFlags.Union && targetTypes.containsType( this ) )
            return Ternary.True;

        for ( const type of targetTypes )
        {
            const related = this.isRelatedTo( type );

            if ( related )
                return related;
        }

        return Ternary.False;
    },

    isIgnoredJsxProperty( sourceProp, targetMemberType )
    {
        return this.getObjectFlags() & ObjectFlags.JsxAttributes && !( isUnhyphenatedJsxName( sourceProp.escapedName ) || targetMemberType );
    },

    findMatchingDiscriminantType( target )
    {
        let match;

        const sourceProperties = this.getPropertiesOfObjectType();

        if ( sourceProperties )
        {
            const sourcePropertiesFiltered = sourceProperties.findDiscriminantProperties( target );

            if ( sourcePropertiesFiltered )
            {
                for ( const sourceProperty of sourcePropertiesFiltered )
                {
                    const sourceType = sourceProperty.getTypeOfSymbol();

                    for ( const type of target.types )
                    {
                        const targetType = type.getTypeOfPropertyOfType( sourceProperty.escapedName );

                        if ( targetType && sourceType.isRelatedTo( targetType ) )
                        {
                            if ( type === match ) continue; // Finding multiple fields which discriminate to the same type is fine

                            if ( match )
                                return undefined;

                            match = type;
                        }
                    }
                }
            }
        }
        return match;
    },

    typeRelatedToEachType( target )
    {
        let result        = Ternary.True;

        const targetTypes = target.types;

        for ( const targetType of targetTypes )
        {
            const related = this.isRelatedTo( targetType );

            if ( !related )
                return Ternary.False;

            result &= related;
        }
        return result;
    },

    someTypeRelatedToType( target )
    {
        const sourceTypes = this.types;

        if ( this.flags & TypeFlags.Union && sourceTypes.containsType( target ) )
            return Ternary.True;

        const len = sourceTypes.length;

        for ( let i = 0; i < len; i++ )
        {
            const related = sourceTypes[ i ].isRelatedTo( target );
            if ( related )
                return related;
        }

        return Ternary.False;
    },

    eachTypeRelatedToType( target )
    {
        let result        = Ternary.True;

        for ( const sourceType of this.types )
        {
            const related = sourceType.isRelatedTo( target );

            if ( !related )
                return Ternary.False;

            result &= related;
        }

        return result;
    },

    typeArgumentsRelatedTo( target, variances )
    {
        const
            sources = this.typeArguments || emptyArray,
            targets = target.typeArguments || emptyArray;

        if ( sources.length !== targets.length && relation === identityRelation )
            return Ternary.False;

        const length = sources.length <= targets.length ? sources.length : targets.length;

        let result   = Ternary.True;

        for ( let i = 0; i < length; i++ )
        {
            // When variance information isn't available we default to covariance. This happens
            // in the process of computing variance information for recursive types and when
            // comparing 'this' type arguments.
            const variance = i < variances.length ? variances[ i ] : Variance.Covariant;
            // We ignore arguments for independent type parameters (because they're never witnessed).
            if ( variance !== Variance.Independent )
            {
                const
                    s     = sources[ i ],
                    t     = targets[ i ];

                let related = Ternary.True;

                if ( variance === Variance.Covariant )
                    related = s.isRelatedTo( t );
                else if ( variance === Variance.Contravariant )
                    related = t.isRelatedTo( s );
                else if ( variance === Variance.Bivariant )
                {
                    // In the bivariant case we first compare contravariantly without reporting
                    // errors. Then, if that doesn't succeed, we compare covariantly with error
                    // reporting. Thus, error elaboration will be based on the the covariant check,
                    // which is generally easier to reason about.
                    related = t.isRelatedTo( s );
                    if ( !related )
                        related = s.isRelatedTo( t );
                }
                else
                {
                    // In the invariant case we first compare covariantly, and only when that
                    // succeeds do we proceed to compare contravariantly. Thus, error elaboration
                    // will typically be based on the covariant check.
                    related = s.isRelatedTo( t );
                    if ( related )
                        related &= t.isRelatedTo( s );
                }

                if ( !related )
                    return Ternary.False;

                result &= related;
            }
        }
        return result;
    },

    // Determine if possibly recursive types are related. First, check if the result is already available in the global cache.
    // Second, check if we have already started a comparison of the given two types in which case we assume the result to be true.
    // Third, check if both types are part of deeply nested chains of generic type instantiations and if so assume the types are
    // equal and infinitely expanding. Fourth, if we have reached a depth of 100 nested comparisons, assume we have runaway recursion
    // and issue an error. Otherwise, actually compare the structure of the two types.
    recursiveTypeRelatedTo( target )
    {
        if ( overflow )
            return Ternary.False;

        const id      = this.getRelationKey( target, relation );

        const related = relation.get( id );

        if ( related !== undefined )
            return related === RelationComparisonResult.Succeeded ? Ternary.True : Ternary.False;

        if ( !maybeKeys )
        {
            maybeKeys   = [];
            sourceStack = [];
            targetStack = [];
        }
        else
        {
            for ( let i = 0; i < maybeCount; i++ )
            {
                // If source and target are already being compared, consider them related with assumptions
                if ( id === maybeKeys[ i ] )
                    return Ternary.Maybe;
            }
            if ( depth === 100 )
            {
                overflow = true;
                return Ternary.False;
            }
        }

        const maybeStart        = maybeCount;

        maybeKeys[ maybeCount ] = id;
        maybeCount++;
        sourceStack[ depth ] = this;
        targetStack[ depth ] = target;
        depth++;

        const saveExpandingFlags = expandingFlags;

        if ( !( expandingFlags & ExpandingFlags.Source ) && this.isDeeplyNestedType( sourceStack, depth ) ) expandingFlags |= ExpandingFlags.Source;
        if ( !( expandingFlags & ExpandingFlags.Target ) && target.isDeeplyNestedType( targetStack, depth ) ) expandingFlags |= ExpandingFlags.Target;

        const result   = expandingFlags !== ExpandingFlags.Both ? this.structuredTypeRelatedTo( target ) : Ternary.Maybe;

        expandingFlags = saveExpandingFlags;
        depth--;

        if ( result )
        {
            if ( result === Ternary.True || depth === 0 )
            {
                // If result is definitely true, record all maybe keys as having succeeded
                for ( let i = maybeStart; i < maybeCount; i++ )
                    relation.set( maybeKeys[ i ], RelationComparisonResult.Succeeded );

                maybeCount = maybeStart;
            }
        }
        else
        {
            // A false result goes straight into global cache (when something is false under
            // assumptions it will also be false without assumptions)
            relation.set( id, RelationComparisonResult.Failed );
            maybeCount = maybeStart;
        }

        return result;
    },

    structuredTypeRelatedTo( target )
    {
        let result;

        if ( target.flags & TypeFlags.TypeParameter )
        {
            // A source type { [P in keyof T]: X } is related to a target type T if X is related to T[P].
            if ( this.getObjectFlags() & ObjectFlags.Mapped && this.getConstraintTypeFromMappedType() === target.getIndexType() )
            {
                if ( !( this.getMappedTypeModifiers() & MappedTypeModifiers.IncludeOptional ) )
                {
                    const templateType = this.getTemplateTypeFromMappedType();
                    const indexedAccessType = target.getIndexedAccessType( this.getTypeParameterFromMappedType() )

                    if ( result = templateType.isRelatedTo( indexedAccessType ) )
                        return result;
                }
            }
        }
        else if ( target.flags & TypeFlags.Index )
        {
            // A keyof S is related to a keyof T if T is related to S.
            if ( this.flags & TypeFlags.Index )
            {
                if ( result = target.type.isRelatedTo( this.type ) )
                    return result;
            }

            // A type S is assignable to keyof T if S is assignable to keyof C, where C is the
            // constraint of T.
            const constraint = target.type.getConstraintForRelation();

            if ( constraint )
            {
                if ( result = this.isRelatedTo( constraint.getIndexType() ) )
                    return result;
            }
        }
        else if ( target.flags & TypeFlags.IndexedAccess )
        {
            // A type S is related to a type T[K] if S is related to A[K], where K is string-like and
            // A is the apparent type of T.
            const constraint = target.getConstraintForRelation();
            if ( constraint )
            {
                if ( result = this.isRelatedTo( constraint ) )
                    return result;
            }
        }
        else if ( target.isGenericMappedType() )
        {
            // A source type T is related to a target type { [P in X]: T[P] }
            const
                template  = target.getTemplateTypeFromMappedType(),
                modifiers = target.getMappedTypeModifiers();

            if ( !( modifiers & MappedTypeModifiers.ExcludeOptional ) )
            {
                if ( template.flags & TypeFlags.IndexedAccess && template.objectType === this &&
                    template.indexType === target.getTypeParameterFromMappedType() )
                    return Ternary.True;

                // A source type T is related to a target type { [P in keyof T]: X } if T[P] is related to X.
                if ( !this.isGenericMappedType() && target.getConstraintTypeFromMappedType() === this.getIndexType() )
                {
                    const
                        indexedAccessType = this.getIndexedAccessType( target.getTypeParameterFromMappedType() ),
                        templateType      = target.getTemplateTypeFromMappedType();

                    if ( result = indexedAccessType.isRelatedTo( templateType ) )
                        return result;
                }
            }
        }

        if ( this.flags & TypeFlags.TypeParameter )
        {
            let constraint = this.getConstraintForRelation();

            // A type parameter with no constraint is not related to the non-primitive object type.
            if ( constraint || !( target.flags & TypeFlags.NonPrimitive ) )
            {
                if ( !constraint || constraint.flags & TypeFlags.Any )
                    constraint = emptyObjectType;

                if ( result = constraint.isRelatedTo( target ) )
                    return result;
            }
        }
        else if ( this.flags & TypeFlags.IndexedAccess )
        {
            // A type S[K] is related to a type T if A[K] is related to T, where K is string-like and
            // A is the apparent type of S.
            const constraint = this.getConstraintForRelation();

            if ( constraint )
            {
                if ( result = constraint.isRelatedTo( target ) )
                    return result;
            }
            else if ( target.flags & TypeFlags.IndexedAccess )
            {
                if ( result = this.objectType.isRelatedTo( target.objectType ) )
                    result &= this.indexType.isRelatedTo( target.indexType );

                if ( result )
                    return result;
            }
        }
        else if ( this.flags & TypeFlags.Conditional )
        {
            if ( relation !== definitelyAssignableRelation )
            {
                const constraint = this.getConstraintOfDistributiveConditionalType();

                if ( constraint )
                {
                    if ( result = constraint.isRelatedTo( target ) )
                        return result;
                }
            }

            if ( target.flags & TypeFlags.Conditional )
            {
                if ( this.checkType.isTypeIdenticalTo( target.checkType ) && this.extendsType.isTypeIdenticalTo( target.extendsType ) )
                {
                    if ( result = this.trueType.isRelatedTo( target.trueType ) ) result &= this.falseType.isRelatedTo( target.falseType );

                    if ( result )
                        return result;
                }
            }
            else if ( result = this.getDefaultConstraintOfConditionalType().isRelatedTo( target ) )
                return result;
        }
        else
        {
            if ( this.getObjectFlags() & ObjectFlags.Reference && target.getObjectFlags() & ObjectFlags.Reference && this.target === target.target &&
                !( this.getObjectFlags() & ObjectFlags.MarkerType || target.getObjectFlags() & ObjectFlags.MarkerType ) )
            {
                // We have type references to the same generic type, and the type references are not marker
                // type references (which are intended by be compared structurally). Obtain the variance
                // information for the type parameters and relate the type arguments accordingly.
                const variances = this.target.getVariances();

                if ( result = this.typeArgumentsRelatedTo( target, variances ) )
                    return result;

                // The type arguments did not relate appropriately, but it may be because we have no variance
                // information (in which case typeArgumentsRelatedTo defaulted to covariance for all type
                // arguments). It might also be the case that the target type has a 'void' type argument for
                // a covariant type parameter that is only used in return positions within the generic type
                // (in which case any type argument is permitted on the source side). In those cases we proceed
                // with a structural comparison. Otherwise, we know for certain the instantiations aren't
                // related and we can return here.
                if ( variances !== emptyArray && !target.hasCovariantVoidArgument( variances ) )
                {
                    // In some cases generic types that are covariant in regular type checking mode become
                    // invariant in --strictFunctionTypes mode because one or more type parameters are used in
                    // both co- and contravariant positions. In order to make it easier to diagnose *why* such
                    // types are invariant, if any of the type parameters are invariant we reset the reported
                    // errors and instead force a structural comparison (which will include elaborations that
                    // reveal the reason).
                    if ( !some( variances, v => v === Variance.Invariant ) )
                        return Ternary.False;
                }
            }
            // Even if relationship doesn't hold for unions, intersections, or generic type references,
            // it may hold in a structural comparison.
            const sourceIsPrimitive = !!( this.flags & TypeFlags.Primitive );

            if ( relation !== identityRelation )
            {
                let x = this.getApparentType().__type_change( target, sourceIsPrimitive );
                if ( x ) return x;
            }

            // In a check of the form X = A & B, we will have previously checked if A relates to X or B relates
            // to X. Failing both of those we want to check if the aggregation of A and B's members structurally
            // relates to X. Thus, we include intersection types on the source side here.
        }
        return Ternary.False;
    },

    /**
     * For a type parameter, return the base constraint of the type parameter. For the string, number,
     * boolean, and symbol primitive types, return the corresponding object types. Otherwise return the
     * type itself. Note that the apparent type of a union type is the union type itself.
     *
     * @param {Type} type
     */
    getApparentType(type)
    {
    const t = type.flags & TypeFlags.TypeVariable ? type.getBaseConstraintOfType() || emptyObjectType : type;
    return t.flags & TypeFlags.Intersection ? t.getApparentTypeOfIntersectionType() :
    t.flags & TypeFlags.StringLike ? globalStringType :
    t.flags & TypeFlags.NumberLike ? globalNumberType :
    t.flags & TypeFlags.BooleanLike ? globalBooleanType :
    t.flags & TypeFlags.ESSymbolLike ? getGlobalESSymbolType() :
    t.flags & TypeFlags.NonPrimitive ? emptyObjectType :
    t;
},

    __type_change( target, sourceIsPrimitive )
    {
        let result;

        if ( this.flags & ( TypeFlags.Object | TypeFlags.Intersection ) && target.flags & TypeFlags.Object )
        {
            // An empty object type is related to any mapped type that includes a '?' modifier.
            if ( target.isPartialMappedType() && !this.isGenericMappedType() && this.isEmptyObjectType() )
                result = Ternary.True;
            else if ( target.isGenericMappedType() )
                result = this.isGenericMappedType() ? this.mappedTypeRelatedTo( target ) : Ternary.False;
            else
            {
                result = this.propertiesRelatedTo( target );
                if ( result )
                {
                    result &= this.signaturesRelatedTo( target, SignatureKind.Call );
                    if ( result )
                    {
                        result &= this.signaturesRelatedTo( target, SignatureKind.Construct );
                        if ( result )
                        {
                            result &= this.indexTypesRelatedTo( target, IndexKind.String, sourceIsPrimitive );
                            if ( result )
                                result &= this.indexTypesRelatedTo( target, IndexKind.Number, sourceIsPrimitive );
                        }
                    }
                }
            }
            if ( result )
                return result;
        }
    },

    // A type [P in S]: X is related to a type [Q in T]: Y if T is related to S and X' is
    // related to Y, where X' is an instantiation of X in which P is replaced with Q. Notice
    // that S and T are contra-variant whereas X and Y are co-variant.
    mappedTypeRelatedTo( target )
    {
        const modifiersRelated = relation === comparableRelation || (
            relation === identityRelation ? this.getMappedTypeModifiers() === target.getMappedTypeModifiers() :
            this.getCombinedMappedTypeOptionality() <= target.getCombinedMappedTypeOptionality() );

        if ( modifiersRelated )
        {
            let result;

            if ( result = target.getConstraintTypeFromMappedType().isRelatedTo( this.getConstraintTypeFromMappedType() ) )
            {
                const mapper = createTypeMapper( [ this.getTypeParameterFromMappedType() ], [ target.getTypeParameterFromMappedType() ] );

                return result & this.getTemplateTypeFromMappedType().instantiateType( mapper ).isRelatedTo( target.getTemplateTypeFromMappedType() );
            }
        }
        return Ternary.False;
    },

    propertiesRelatedTo( target )
    {
        if ( relation === identityRelation )
            return this.propertiesIdenticalTo( target );

        const
            requireOptionalProperties = relation === subtypeRelation && !this.isObjectLiteralType() && !this.isEmptyArrayLiteralType(),
            unmatchedProperty         = this.getUnmatchedProperty( target, requireOptionalProperties );

        if ( unmatchedProperty )
            return Ternary.False;

        if ( target.isObjectLiteralType() )
        {
            for ( const sourceProp of this.getPropertiesOfType() )
            {
                if ( !target.getPropertyOfObjectType( sourceProp.escapedName ) )
                {
                    const sourceType = sourceProp.getTypeOfSymbol();

                    if ( !( sourceType === undefinedType || sourceType === undefinedWideningType ) )
                        return Ternary.False;
                }
            }
        }

        let result       = Ternary.True;

        const properties = target.getPropertiesOfObjectType();

        for ( const targetProp of properties )
        {
            if ( !( targetProp.flags & SymbolFlags.Prototype ) )
            {
                const sourceProp = this.getPropertyOfType( targetProp.escapedName );
                if ( sourceProp && sourceProp !== targetProp )
                {
                    if ( this.isIgnoredJsxProperty( sourceProp, targetProp.getTypeOfSymbol() ) )
                        continue;

                    const
                        sourcePropFlags = sourceProp.getDeclarationModifierFlagsFromSymbol(),
                        targetPropFlags = targetProp.getDeclarationModifierFlagsFromSymbol();

                    if ( sourcePropFlags & ModifierFlags.Private || targetPropFlags & ModifierFlags.Private )
                    {
                        if ( sourceProp.getCheckFlags() & CheckFlags.ContainsPrivate )
                            return Ternary.False;

                        if ( sourceProp.valueDeclaration !== targetProp.valueDeclaration )
                            return Ternary.False;
                    }
                    else if ( targetPropFlags & ModifierFlags.Protected )
                    {
                        if ( !sourceProp.isValidOverrideOf( targetProp ) )
                            return Ternary.False;
                    }
                    else if ( sourcePropFlags & ModifierFlags.Protected )
                        return Ternary.False;

                    const related = getTypeOfSymbol( sourceProp ).isRelatedTo( targetProp.getTypeOfSymbol() );

                    if ( !related )
                        return Ternary.False;

                    result &= related;

                    // When checking for comparability, be more lenient with optional properties.
                    if ( relation !== comparableRelation && sourceProp.flags & SymbolFlags.Optional && !( targetProp.flags & SymbolFlags.Optional ) )
                    {
                        // TypeScript 1.0 spec (April 2014): 3.8.3
                        // S is a subtype of a type T, and T is a supertype of S if ...
                        // S' and T are object types and, for each member M in T..
                        // M is a property and S' contains a property N where
                        // if M is a required property, N is also a required property
                        // (M - property in T)
                        // (N - property in S)
                        return Ternary.False;
                    }
                }
            }
        }
        return result;
    },

    /**
     * A type is 'weak' if it is an object type with at least one optional property
     * and no required properties, call/construct signatures or index signatures
     */
    isWeakType()
    {
        if ( this.flags & TypeFlags.Object )
        {
            const resolved = this.resolveStructuredTypeMembers();

            return resolved.callSignatures.length === 0 && resolved.constructSignatures.length === 0 &&
                !resolved.stringIndexInfo && !resolved.numberIndexInfo &&
                resolved.properties.length > 0 &&
                every( resolved.properties, p => !!( p.flags & SymbolFlags.Optional ) );
        }

        if ( this.flags & TypeFlags.Intersection )
            return every( this.types, isWeakType );

        return false;
    },

    hasCommonProperties( target )
    {
        const isComparingJsxAttributes = !!( this.getObjectFlags() & ObjectFlags.JsxAttributes );

        for ( const prop of this.getPropertiesOfType() )
        {
            if ( target.isKnownProperty( prop.escapedName, isComparingJsxAttributes ) )
                return true;
        }

        return false;
    },

    propertiesIdenticalTo( target )
    {
        if ( !( this.flags & TypeFlags.Object && target.flags & TypeFlags.Object ) )
            return Ternary.False;

        const
            sourceProperties = this.getPropertiesOfObjectType(),
            targetProperties = target.getPropertiesOfObjectType();

        if ( sourceProperties.length !== targetProperties.length )
            return Ternary.False;

        let result = Ternary.True;

        for ( const sourceProp of sourceProperties )
        {
            const targetProp = target.getPropertyOfObjectType( sourceProp.escapedName );
            if ( !targetProp )
                return Ternary.False;

            const related = sourceProp.compareProperties( targetProp, isRelatedTo );

            if ( !related )
                return Ternary.False;

            result &= related;
        }

        return result;
    },

    signaturesRelatedTo( target, kind )
    {
        if ( relation === identityRelation )
            return this.signaturesIdenticalTo( target, kind );

        if ( target === anyFunctionType || this === anyFunctionType )
            return Ternary.True;

        const
            sourceSignatures = this.getSignaturesOfType( kind ),
            targetSignatures = target.getSignaturesOfType( kind );

        if ( kind === SignatureKind.Construct && sourceSignatures.length && targetSignatures.length )
        {
            if ( this.isAbstractConstructorType() && !target.isAbstractConstructorType() )
            {
                // An abstract constructor type is not assignable to a non-abstract constructor type
                // as it would otherwise be possible to new an abstract class. Note that the assignability
                // check we perform for an extends clause excludes construct signatures from the target,
                // so this check never proceeds.
                return Ternary.False;
            }

            if ( !sourceSignatures[ 0 ].constructorVisibilitiesAreCompatible( targetSignatures[ 0 ] ) )
                return Ternary.False;
        }

        let result          = Ternary.True;

        if ( this.getObjectFlags() & ObjectFlags.Instantiated && target.getObjectFlags() & ObjectFlags.Instantiated && this.symbol === target.symbol )
        {
            // We have instantiations of the same anonymous type (which typically will be the type of a
            // method). Simply do a pairwise comparison of the signatures in the two signature lists instead
            // of the much more expensive N * M comparison matrix we explore below. We erase type parameters
            // as they are known to always be the same.
            for ( let i = 0; i < targetSignatures.length; i++ )
            {
                const related = sourceSignatures[ i ].signatureRelatedTo( targetSignatures[ i ], /*erase*/ true );

                if ( !related )
                    return Ternary.False;

                result &= related;
            }
        }
        else if ( sourceSignatures.length === 1 && targetSignatures.length === 1 )
        {
            // For simple functions (functions with a single signature) we only erase type parameters for
            // the comparable relation. Otherwise, if the source signature is generic, we instantiate it
            // in the context of the target signature before checking the relationship. Ideally we'd do
            // this regardless of the number of signatures, but the potential costs are prohibitive due
            // to the quadratic nature of the logic below.
            const eraseGenerics = relation === comparableRelation || compilerOptions.noStrictGenericChecks;

            result              = sourceSignatures[ 0 ].signatureRelatedTo( targetSignatures[ 0 ], eraseGenerics );
        }
        else
        {
            outer: for ( const t of targetSignatures )
            {
                // Only elaborate errors from the first failure
                for ( const s of sourceSignatures )
                {
                    const related = s.signatureRelatedTo( t, /*erase*/ true );
                    if ( related )
                    {
                        result &= related;
                        continue outer;
                    }
                }

                return Ternary.False;
            }
        }
        return result;
    },

    /**
     * See signatureAssignableTo, compareSignaturesIdentical
     */
    signatureRelatedTo( target, erase )
    {
        ( erase ? this.getErasedSignature() : this ).compareSignaturesRelated( erase ? target.getErasedSignature() : target,
            CallbackCheck.None, /*ignoreReturnTypes*/ false, isRelatedTo );
    },

    signaturesIdenticalTo( target, kind )
    {
        const
            sourceSignatures = this.getSignaturesOfType( kind ),
            targetSignatures = target.getSignaturesOfType( kind );

        if ( sourceSignatures.length !== targetSignatures.length )
            return Ternary.False;

        let result = Ternary.True;

        for ( let i = 0; i < sourceSignatures.length; i++ )
        {
            const related = sourceSignatures[ i ].compareSignaturesIdentical( targetSignatures[ i ], /*partialMatch*/ false, /*ignoreThisTypes*/ false, /*ignoreReturnTypes*/ false, isRelatedTo );

            if ( !related )
                return Ternary.False;

            result &= related;
        }

        return result;
    },

    eachPropertyRelatedTo( target, kind )
    {
        let result = Ternary.True;

        for ( const prop of this.getPropertiesOfObjectType() )
        {
            if ( this.isIgnoredJsxProperty( prop, /*targetMemberType*/ undefined ) )
                continue;

            if ( kind === IndexKind.String || isNumericLiteralName( prop.escapedName ) )
            {
                const related = getTypeOfSymbol( prop ).isRelatedTo( target );
                if ( !related )
                    return Ternary.False;

                result &= related;
            }
        }
        return result;
    },

    static indexInfoRelatedTo( sourceInfo, targetInfo )
    {
        return sourceInfo.type.isRelatedTo( targetInfo.type );
    },

    indexTypesRelatedTo( target, kind, sourceIsPrimitive )
    {
        if ( relation === identityRelation )
            return this.indexTypesIdenticalTo( target, kind );

        const targetInfo = target.getIndexInfoOfType( kind );

        if ( !targetInfo || targetInfo.type.flags & TypeFlags.Any && !sourceIsPrimitive )
        // Index signature of type any permits assignment from everything but primitives
            return Ternary.True;

        const sourceInfo = this.getIndexInfoOfType( kind ) ||
            kind === IndexKind.Number && this.getIndexInfoOfType( IndexKind.String );

        if ( sourceInfo )
            return TypeRelations.indexInfoRelatedTo( sourceInfo, targetInfo );

        if ( this.isGenericMappedType() )
        // A generic mapped type { [P in K]: T } is related to an index signature { [x: string]: U }
        // if T is related to U.
            return kind === IndexKind.String && this.getTemplateTypeFromMappedType().isRelatedTo( targetInfo.type );

        if ( this.isObjectTypeWithInferableIndex() )
        {
            let related = Ternary.True;

            if ( kind === IndexKind.String )
            {
                const sourceNumberInfo = this.getIndexInfoOfType( IndexKind.Number );
                if ( sourceNumberInfo )
                    related = TypeRelations.indexInfoRelatedTo( sourceNumberInfo, targetInfo );
            }
            if ( related )
                related &= this.eachPropertyRelatedTo( targetInfo.type, kind );

            return related;
        }
        return Ternary.False;
    },

    indexTypesIdenticalTo( target, indexKind )
    {
        const
            targetInfo = target.getIndexInfoOfType( indexKind ),
            sourceInfo = this.getIndexInfoOfType( indexKind );

        if ( !sourceInfo && !targetInfo )
            return Ternary.True;

        if ( sourceInfo && targetInfo && sourceInfo.isReadonly === targetInfo.isReadonly )
            return sourceInfo.type.isRelatedTo( targetInfo.type );

        return Ternary.False;
    },

    constructorVisibilitiesAreCompatible( targetSignature )
    {
        if ( !this.declaration || !targetSignature.declaration )
            return true;

        const
            sourceAccessibility = this.declaration.getSelectedModifierFlags( ModifierFlags.NonPublicAccessibilityModifier ),
            targetAccessibility = targetSignature.declaration.getSelectedModifierFlags( ModifierFlags.NonPublicAccessibilityModifier );

        // A public, protected and private signature is assignable to a private signature.
        if ( targetAccessibility === ModifierFlags.Private )
            return true;

        // A public and protected signature is assignable to a protected signature.
        if ( targetAccessibility === ModifierFlags.Protected && sourceAccessibility !== ModifierFlags.Private )
            return true;

        // Only a public signature is assignable to public signature.
        if ( targetAccessibility !== ModifierFlags.Protected && !sourceAccessibility )
            return true;

        return false;
    },

    getConstraintForRelation()
    {
        return relation === definitelyAssignableRelation ? undefined : this.getConstraintOfType();
    },

    // Return an array containing the variance of each type parameter. The variance is effectively
    // a digest of the type comparisons that occur for each type argument when instantiations of the
    // generic type are structurally compared. We infer the variance information by comparing
    // instantiations of the generic type for type arguments with known relations. The function
    // returns the emptyArray singleton if we're not in strictFunctionTypes mode or if the function
    // has been invoked recursively for the given generic type.
    getVariances()
    {
        if ( !strictFunctionTypes )
            return emptyArray;

        const typeParameters = this.typeParameters || emptyArray;

        let variances        = this.variances;

        if ( !variances )
        {
            if ( this === globalArrayType || this === globalReadonlyArrayType )
            // Arrays are known to be covariant, no need to spend time computing this
                variances = [ Variance.Covariant ];
            else
            {
                // The emptyArray singleton is used to signal a recursive invocation.
                this.variances = emptyArray;
                variances      = [];
                for ( const tp of typeParameters )
                {
                    // We first compare instantiations where the type parameter is replaced with
                    // marker types that have a known subtype relationship. From this we can infer
                    // invariance, covariance, contravariance or bivariance.
                    const typeWithSuper = this.getMarkerTypeReference( tp, markerSuperType );
                    const typeWithSub   = this.getMarkerTypeReference( tp, markerSubType );
                    let variance        = ( typeWithSub.isTypeAssignableTo( typeWithSuper ) ? Variance.Covariant : 0 ) |
                        ( typeWithSuper.isTypeAssignableTo( typeWithSub ) ? Variance.Contravariant : 0 );
                    // If the instantiations appear to be related bivariantly it may be because the
                    // type parameter is independent (i.e. it isn't witnessed anywhere in the generic
                    // type). To determine this we compare instantiations where the type parameter is
                    // replaced with marker types that are known to be unrelated.
                    if ( variance === Variance.Bivariant && this.getMarkerTypeReference( tp, markerOtherType ).isTypeAssignableTo( typeWithSuper ) )
                        variance = Variance.Independent;

                    variances.push( variance );
                }
            }
            this.variances = variances;
        }
        return variances;
    },

    /**
     * Checks if 'source' is related to 'target' (e.g.: is a assignable to).
     * @param target The right-hand-side of the relation.
     * @param relation The relation considered. One of 'identityRelation', 'subtypeRelation', 'assignableRelation', or 'comparableRelation'.
     * Used as both to determine which checks are performed and as a cache of previously computed results.
     */
    checkTypeRelatedTo( target, relation )
    {
        return this.isRelatedTo( target ) !== Ternary.False;
    },

    // Return a type reference where the source type parameter is replaced with the target marker
    // type, and flag the result as a marker type reference.
    getMarkerTypeReference( source, target )
    {
        const result = this.createTypeReference( map( this.typeParameters, t => t === source ? target : t ) );
        result.objectFlags |= ObjectFlags.MarkerType;
        return result;
    },

    // Return true if the given type reference has a 'void' type argument for a covariant type parameter.
    // See comment at call in recursiveTypeRelatedTo for when this case matters.
    hasCovariantVoidArgument( variances )
    {
        for ( let i = 0; i < variances.length; i++ )
        {
            if ( variances[ i ] === Variance.Covariant && this.typeArguments[ i ].flags & TypeFlags.Void )
                return true;
        }

        return false;
    },

    isUnconstrainedTypeParameter()
    {
        return this.flags & TypeFlags.TypeParameter && !this.getConstraintFromTypeParameter();
    },

    isTypeReferenceWithGenericArguments()
    {
        return this.getObjectFlags() & ObjectFlags.Reference && some( this.typeArguments, t => t.isUnconstrainedTypeParameter() || t.isTypeReferenceWithGenericArguments() );
    },

    /**
     * getTypeReferenceId(A<T, number, U>) returns "111=0-12=1"
     *   where A.id=111 and number.id=12
     */
    getTypeReferenceId( typeParameters, depth = 0 )
    {
        let result = "" + this.target.id;

        for ( const t of this.typeArguments )
        {
            if ( t.isUnconstrainedTypeParameter() )
            {
                let index = typeParameters.indexOf( t );
                if ( index < 0 )
                {
                    index = typeParameters.length;
                    typeParameters.push( t );
                }
                result += "=" + index;
            }
            else if ( depth < 4 && t.isTypeReferenceWithGenericArguments() )
                result += "<" + t.getTypeReferenceId( typeParameters, depth + 1 ) + ">";
            else
                result += "-" + t.id;
        }

        return result;
    },


    /**
     * To improve caching, the relation key for two generic types uses the target's id plus ids of the type parameters.
     * For other cases, the types ids are used.
     */
    getRelationKey( target, relation )
    {
        if ( relation === identityRelation && this.id > target.id )
            return target.getRelationKey( this, relation );

        if ( this.isTypeReferenceWithGenericArguments() && target.isTypeReferenceWithGenericArguments() )
        {
            const typeParameters = [];

            return this.getTypeReferenceId( typeParameters ) + "," + target.getTypeReferenceId( typeParameters );
        }

        return this.id + "," + target.id;
    },

    // Invoke the callback for each underlying property symbol of the given symbol and return the first
    // value that isn't undefined.
    forEachProperty( callback )
    {
        if ( this.getCheckFlags() & CheckFlags.Synthetic )
        {
            for ( const t of this.containingType.types )
            {
                const
                    p      = t.getPropertyOfType( this.escapedName ),
                    result = p && p.forEachProperty( callback );

                if ( result )
                    return result;
            }

            return undefined;
        }

        return callback( this );
    },

    // Return the declaring class type of a property or undefined if property not declared in class
    getDeclaringClass()
    {
        return this.parent && this.parent.flags & SymbolFlags.Class ? this.getParentOfSymbol().getDeclaredTypeOfSymbol() : undefined;
    },

    // Return true if some underlying source property is declared in a class that derives
    // from the given base class.
    isPropertyInClassDerivedFrom( baseClass )
    {
        return this.forEachProperty( sp => {
            const sourceClass = sp.getDeclaringClass();
            return sourceClass ? sourceClass.hasBaseType( baseClass ) : false;
        } );
    },

    // Return true if source property is a valid override of protected parts of target property.
    isValidOverrideOf( targetProp )
    {
        return !targetProp.forEachProperty( tp => tp.getDeclarationModifierFlagsFromSymbol() & ModifierFlags.Protected ?
                                                   !this.isPropertyInClassDerivedFrom( tp.getDeclaringClass() ) : false );
    },

    // Return true if the given class derives from each of the declaring classes of the protected
    // constituents of the given property.
    isClassDerivedFromDeclaringClasses( prop )
    {
        return prop.forEachProperty( p => p.getDeclarationModifierFlagsFromSymbol() & ModifierFlags.Protected ?
                                           !this.hasBaseType( p.getDeclaringClass() ) : false ) ? undefined : this;
    },

// Return true if the given type is deeply nested. We consider this to be the case when structural type comparisons
// for 5 or more occurrences or instantiations of the type have been recorded on the given stack. It is possible,
// though highly unlikely, for this test to be true in a situation where a chain of instantiations is not infinitely
// expanding. Effectively, we will generate a false positive when two types are structurally equal to at least 5
// levels, but unequal at some level beyond that.
    isDeeplyNestedType( stack, depth )
    {
        // We track all object types that have an associated symbol (representing the origin of the type)
        if ( depth >= 5 && this.flags & TypeFlags.Object )
        {
            const symbol = this.symbol;
            if ( symbol )
            {
                let count = 0;
                for ( let i = 0; i < depth; i++ )
                {
                    const t = stack[ i ];
                    if ( t.flags & TypeFlags.Object && t.symbol === symbol )
                    {
                        count++;
                        if ( count >= 5 ) return true;
                    }
                }
            }
        }
        return false;
    },

    isPropertyIdenticalTo( targetProp )
    {
        return this.compareProperties( targetProp, compareTypesIdentical ) !== Ternary.False;
    ,

    compareProperties( targetProp, compareTypes )
    {
        // Two members are considered identical when
        // - they are public properties with identical names, optionality, and types,
        // - they are private or protected properties originating in the same declaration and having identical types
        if ( this === targetProp )
            return Ternary.True;

        const
            sourcePropAccessibility = this.getDeclarationModifierFlagsFromSymbol() & ModifierFlags.NonPublicAccessibilityModifier,
            targetPropAccessibility = targetProp.getDeclarationModifierFlagsFromSymbol() & ModifierFlags.NonPublicAccessibilityModifier;

        if ( sourcePropAccessibility !== targetPropAccessibility )
            return Ternary.False;

        if ( sourcePropAccessibility )
        {
            if ( this.getTargetSymbol() !== targetProp.getTargetSymbol() )
                return Ternary.False;
        }
        else if ( ( this.flags & SymbolFlags.Optional ) !== ( targetProp.flags & SymbolFlags.Optional ) )
            return Ternary.False;

        if ( this.isReadonlySymbol() !== targetProp.isReadonlySymbol() )
            return Ternary.False;

        return this.getTypeOfSymbol().compareTypes( targetProp.getTypeOfSymbol() );
    },

    isMatchingSignature( target, partialMatch )
    {
        // A source signature matches a target signature if the two signatures have the same number of required,
        // optional, and rest parameters.
        if ( this.parameters.length === target.parameters.length &&
            this.minArgumentCount === target.minArgumentCount &&
            this.hasRestParameter === target.hasRestParameter )
        {
            return true;
        }
        // A source signature partially matches a target signature if the target signature has no fewer required
        // parameters and no more overall parameters than the source signature (where a signature with a rest
        // parameter is always considered to have more overall parameters than one without).
        const sourceRestCount = this.hasRestParameter ? 1 : 0;
        const targetRestCount = target.hasRestParameter ? 1 : 0;

        if ( partialMatch && this.minArgumentCount <= target.minArgumentCount && (
            sourceRestCount > targetRestCount ||
            sourceRestCount === targetRestCount && this.parameters.length >= target.parameters.length ) )
            return true;

        return false;
    },

    /**
     * See signatureRelatedTo, compareSignaturesIdentical
     */
    compareSignaturesIdentical( target, partialMatch, ignoreThisTypes, ignoreReturnTypes, compareTypes )
    {
        // TODO (drosen): De-duplicate code between related functions.
        if ( this === target )
            return Ternary.True;

        if ( !( this.isMatchingSignature( target, partialMatch ) ) )
            return Ternary.False;

        // Check that the two signatures have the same number of type parameters. We might consider
        // also checking that any type parameter constraints match, but that would require instantiating
        // the constraints with a common set of type arguments to get relatable entities in places where
        // type parameters occur in the constraints. The complexity of doing that doesn't seem worthwhile,
        // particularly as we're comparing erased versions of the signatures below.
        if ( length( this.typeParameters ) !== length( target.typeParameters ) )
            return Ternary.False;

        // Spec 1.0 Section 3.8.3 & 3.8.4:
        // M and N (the signatures) are instantiated using type Any as the type argument for all type parameters declared by M and N
        return this.getErasedSignature().part_fucking_two( target, partialMatch, ignoreThisTypes, ignoreReturnTypes, compareTypes );
    },

    part_fucking_two( target, partialMatch, ignoreThisTypes, ignoreReturnTypes, compareTypes )
    {
        target     = target.getErasedSignature();

        let result = Ternary.True;

        if ( !ignoreThisTypes )
        {
            const sourceThisType = this.getThisTypeOfSignature();

            if ( sourceThisType )
            {
                const targetThisType = target.getThisTypeOfSignature();

                if ( targetThisType )
                {
                    const related = sourceThisType.compareTypes( targetThisType );

                    if ( !related )
                        return Ternary.False;

                    result &= related;
                }
            }
        }

        const targetLen = target.parameters.length;

        for ( let i = 0; i < targetLen; i++ )
        {
            const
                s       = this.isRestParameterIndex( i ) ? this.getRestTypeOfSignature() : source.parameters[ i ].getTypeOfParameter(),
                t       = target.isRestParameterIndex( i ) ? target.getRestTypeOfSignature() : target.parameters[ i ].getTypeOfParameter( ),
                related = s.compareTypes( t );

            if ( !related )
                return Ternary.False;

            result &= related;
        }

        if ( !ignoreReturnTypes )
        {
            const
                sourceTypePredicate = this.getTypePredicateOfSignature(),
                targetTypePredicate = target.getTypePredicateOfSignature();

            result &= sourceTypePredicate !== undefined || targetTypePredicate !== undefined
                      ? sourceTypePredicate.compareTypePredicatesIdentical( targetTypePredicate, compareTypes )
                // If they're both type predicates their return types will both be `boolean`, so no need to compare those.
                      : this.getReturnTypeOfSignature().compareTypes( target.getReturnTypeOfSignature() );
        }
        return result;
    },

    compareTypePredicatesIdentical( target, compareTypes )
    {
        return target === undefined || !this.typePredicateKindsMatch( target ) ? Ternary.False : compareTypes.call( this.type, target.type );
    },

    literalTypesWithSameBaseType( types )
    {
        let commonBaseType;

        for ( const t of types )
        {
            const baseType = t.getBaseTypeOfLiteralType();

            if ( !commonBaseType )
                commonBaseType = baseType;

            if ( baseType === t || baseType !== commonBaseType )
                return false;
        }

        return true;
    },

    // When the candidate types are all literal types with the same base type, return a union
    // of those literal types. Otherwise, return the leftmost type for which no type to the
    // right is a supertype.
    getSupertypeOrUnion( types )
    {
        return TypeRelations.literalTypesWithSameBaseType( types ) ?
               TypeRelations.getUnionType( types ) :
               types.reduce( ( s, t ) => s.isTypeSubtypeOf( t ) ? t : s );
    },

    getCommonSupertype( types )
    {
        if ( !strictNullChecks )
            return TypeRelations.getSupertypeOrUnion( types );

        const primaryTypes = types.filter( t => !( t.flags & TypeFlags.Nullable ) );

        return primaryTypes.length ?
               getNullableType( TypeRelations.getSupertypeOrUnion( primaryTypes ), TypeRelations.getFalsyFlagsOfTypes( types ) & TypeFlags.Nullable ) :
               getUnionType( types, UnionReduction.Subtype );
    }
}


// Return the leftmost type for which no type to the right is a subtype.
function getCommonSubtype( types )
{
    return reduceLeft( types, ( s, t ) => isTypeSubtypeOf( t, s ) ? t : s );
}

function isArrayType( type )
{
    return getObjectFlags( type ) & ObjectFlags.Reference && type.target === globalArrayType;
}

function isArrayLikeType( type )
{
    // A type is array-like if it is a reference to the global Array or global ReadonlyArray type,
    // or if it is not the undefined or null type and if it is assignable to ReadonlyArray<any>
    return getObjectFlags( type ) & ObjectFlags.Reference && ( type.target === globalArrayType || type.target === globalReadonlyArrayType ) ||
    !( type.flags & TypeFlags.Nullable ) && isTypeAssignableTo( type, anyReadonlyArrayType );
}

function isEmptyArrayLiteralType( type )
{
    const elementType = isArrayType( type ) ? type.typeArguments[ 0 ] : undefined;

    return elementType === undefinedWideningType || elementType === implicitNeverType;
}

function isTupleLikeType( type )
{
    return !!getPropertyOfType( type, "0" as __String );
}

function isUnitType( type )
{
    return !!( type.flags & TypeFlags.Unit );
}

function isLiteralType( type )
{
    return type.flags & TypeFlags.Boolean ? true :
           type.flags & TypeFlags.Union ? type.flags & TypeFlags.EnumLiteral ? true : !forEach( type.types, t => !isUnitType( t ) ) : isUnitType( type );
}

function getBaseTypeOfLiteralType( type )
{
    return type.flags & TypeFlags.EnumLiteral ? getBaseTypeOfEnumLiteralType( type ) :
    type.flags & TypeFlags.StringLiteral ? stringType :
    type.flags & TypeFlags.NumberLiteral ? numberType :
    type.flags & TypeFlags.BooleanLiteral ? booleanType :
    type.flags & TypeFlags.Union ? getUnionType( sameMap( type.types, getBaseTypeOfLiteralType ) ) :
    type;
}

function getWidenedLiteralType( type )
{
    return type.flags & TypeFlags.EnumLiteral ? getBaseTypeOfEnumLiteralType( type ) :
    type.flags & TypeFlags.StringLiteral && type.flags & TypeFlags.FreshLiteral ? stringType :
    type.flags & TypeFlags.NumberLiteral && type.flags & TypeFlags.FreshLiteral ? numberType :
    type.flags & TypeFlags.BooleanLiteral ? booleanType :
    type.flags & TypeFlags.Union ? getUnionType( sameMap( type.types, getWidenedLiteralType ) ) :
    type;
}

function getWidenedUniqueESSymbolType( type: Type ): Type
{
    return type.flags & TypeFlags.UniqueESSymbol ? esSymbolType :
           type.flags & TypeFlags.Union ? getUnionType( sameMap( type.types, getWidenedUniqueESSymbolType ) ) :
    type;
}

function getWidenedLiteralLikeTypeForContextualType( type, contextualType )
{
    if ( !isLiteralOfContextualType( type, contextualType ) )
        type = getWidenedUniqueESSymbolType( getWidenedLiteralType( type ) );

    return type;
}

/**
 * Check if a Type was written as a tuple type literal.
 * Prefer using isTupleLikeType() unless the use of `elementTypes` is required.
 */
function isTupleType( type )
{
    return !!( getObjectFlags( type ) & ObjectFlags.Reference && type.target.objectFlags & ObjectFlags.Tuple );
}

function getFalsyFlagsOfTypes( types )
{
    let result = 0;

    for ( const t of types )
        result |= getFalsyFlags( t );

    return result;
}

// Returns the String, Number, Boolean, StringLiteral, NumberLiteral, BooleanLiteral, Void, Undefined, or Null
// flags for the string, number, boolean, "", 0, false, void, undefined, or null types respectively. Returns
// no flags for all other types (including non-falsy literal types).
function getFalsyFlags( type )
{
    return type.flags & TypeFlags.Union ? getFalsyFlagsOfTypes( type.types ) :
    type.flags & TypeFlags.StringLiteral ? type.value === "" ? TypeFlags.StringLiteral : 0 :
    type.flags & TypeFlags.NumberLiteral ? type.value === 0 ? TypeFlags.NumberLiteral : 0 :
    type.flags & TypeFlags.BooleanLiteral ? type === falseType ? TypeFlags.BooleanLiteral : 0 :
    type.flags & TypeFlags.PossiblyFalsy;
}

function removeDefinitelyFalsyTypes( type )
{
    return getFalsyFlags( type ) & TypeFlags.DefinitelyFalsy ?
           filterType( type, t => !( getFalsyFlags( t ) & TypeFlags.DefinitelyFalsy ) ) :
           type;
}

function extractDefinitelyFalsyTypes( type )
{
    return mapType( type, getDefinitelyFalsyPartOfType );
}

function getDefinitelyFalsyPartOfType( type )
{
    return type.flags & TypeFlags.String ? emptyStringType :
           type.flags & TypeFlags.Number ? zeroType :
           type.flags & TypeFlags.Boolean || type === falseType ? falseType :
           type.flags & ( TypeFlags.Void | TypeFlags.Undefined | TypeFlags.Null ) ||
               type.flags & TypeFlags.StringLiteral && type.value === "" ||
    type.flags & TypeFlags.NumberLiteral && type.value === 0 ? type :
    neverType;
}

/**
 * Add undefined or null or both to a type if they are missing.
 * @param type - type to add undefined and/or null to if not present
 * @param flags - Either TypeFlags.Undefined or TypeFlags.Null, or both
 */
function getNullableType( type, flags )
{
    const missing = ( flags & ~type.flags ) & ( TypeFlags.Undefined | TypeFlags.Null );
    return missing === 0 ? type :
           missing === TypeFlags.Undefined ? getUnionType( [ type, undefinedType ] ) :
           missing === TypeFlags.Null ? getUnionType( [ type, nullType ] ) :
           getUnionType( [ type, undefinedType, nullType ] );
}

function getOptionalType( type )
{
    return type.flags & TypeFlags.Undefined ? type : getUnionType( [ type, undefinedType ] );
}

function getNonNullableType( type )
{
    return strictNullChecks ? getTypeWithFacts( type, TypeFacts.NEUndefinedOrNull ) : type;
}

