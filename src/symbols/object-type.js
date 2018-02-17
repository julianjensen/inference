/** ****************************************************************************************************
 * File: object-type (jsdoc-tag-parser)
 * @author julian on 2/16/18
 * @version 1.0.0
 * @copyright Planet3, Inc.
 *
 * 9 Ordinary and Exotic Objects Behaviours
 *
 * 9.1 Ordinary Object Internal Methods and Internal Slots
 *
 * All ordinary objects have an internal slot called [[Prototype]]. The value of this internal slot
 * is either null or an object and is used for implementing inheritance. Data properties of the
 * [[Prototype]] object are inherited (and visible as properties of the child object) for the purposes
 * of get access, but not for set access. Accessor properties are inherited for both get access and set access.
 *
 * Every ordinary object has a Boolean-valued [[Extensible]] internal slot that controls whether or not
 * properties may be added to the object. If the value of the [[Extensible]] internal slot is false then
 * additional properties may not be added to the object. In addition, if [[Extensible]] is false the value
 * of the [[Prototype]] internal slot of the object may not be modified. Once the value of an object's
 * [[Extensible]] internal slot has been set to false it may not be subsequently changed to true.
 *
 * In the following algorithm descriptions, assume O is an ordinary object, P is a property key value, V is
 * any ECMAScript language value, and Desc is a Property Descriptor record.
 *
 * Each ordinary object internal method delegates to a similarly-named abstract operation. If such an
 * abstract operation depends on another internal method, then the internal method is invoked on O rather
 * than calling the similarly-named abstract operation directly. These semantics ensure that exotic objects
 * have their overridden internal methods invoked when ordinary object internal methods are applied to them.
 *
 *******************************************************************************************************/
'use strict';

/**
 * 9.1.1.1 OrdinaryGetPrototypeOf ( O )
 *
 * When the abstract operation OrdinaryGetPrototypeOf is called with Object O, the following steps are taken:
 */
function ordinaryGetPrototypeOf( o )
{
    return o.__prototype;
}

/**
 *
 * 9.1.2.1 OrdinarySetPrototypeOf ( O, V )
 *
 * When the abstract operation OrdinarySetPrototypeOf is called with Object O and value V, the following steps are taken:
 *
 * 1. Assert: Either Type(V) is Object or Type(V) is Null.
 * 2. Let extensible be O.[[Extensible]].
 * 3. Let current be O.[[Prototype]].
 * 4. If SameValue(V, current) is true, return true.
 * 5. If extensible is false, return false.
 * 6. Let p be V.
 * 7. Let done be false.
 * 8. Repeat, while done is false,
 *    1. If p is null, set done to true.
 *    2. Else if SameValue(p, O) is true, return false.
 *    3. Else,
 *       1. If p.[[GetPrototypeOf]] is not the ordinary object internal method defined in 9.1.1, set done to true.
 *       2. Else, set p to p.[[Prototype]].
 * 9. Set O.[[Prototype]] to V.
 * 10. Return true.
 *
 * > NOTE
 * > The loop in step 8 guarantees that there will be no circularities in any prototype chain that only includes objects
 * > that use the ordinary object definitions for [[GetPrototypeOf]] and [[SetPrototypeOf]].
 */
function ordinarySetPrototypeOf( o, v )
{

}

/**
 * @class
 */
class OrdinaryObject
{
    /**
     *
     */
    constructor()
    {

    }

    /**
     * 9.1.1 [[GetPrototypeOf]] ( )
     *
     * When the [[GetPrototypeOf]] internal method of O is called, the following steps are taken:
     */
    getPrototypeOf()
    {
        return ordinaryGetPrototypeOf( this );
    }

    /**
     * 9.1.2 [[SetPrototypeOf]] ( V )
     *
     * When the [[SetPrototypeOf]] internal method of O is called with argument V, the following steps are taken:
     */
    setPrototypeOf( v )
    {
        return ordinarySetPrototypeOf( this, v );
    }

    /*

    9.1.3[[IsExtensible]] ( )
    When the [[IsExtensible]] internal method of O is called, the following steps are taken:

    Return ! OrdinaryIsExtensible(O).
    9.1.3.1OrdinaryIsExtensible ( O )
    When the abstract operation OrdinaryIsExtensible is called with Object O, the following steps are taken:

    Return O.[[Extensible]].
    9.1.4[[PreventExtensions]] ( )
    When the [[PreventExtensions]] internal method of O is called, the following steps are taken:

    Return ! OrdinaryPreventExtensions(O).
    9.1.4.1OrdinaryPreventExtensions ( O )
    When the abstract operation OrdinaryPreventExtensions is called with Object O, the following steps are taken:

    Set O.[[Extensible]] to false.
    Return true.
    9.1.5[[GetOwnProperty]] ( P )
    When the [[GetOwnProperty]] internal method of O is called with property key P, the following steps are taken:

    Return ! OrdinaryGetOwnProperty(O, P).
    9.1.5.1OrdinaryGetOwnProperty ( O, P )
    When the abstract operation OrdinaryGetOwnProperty is called with Object O and with property key P, the following steps are taken:

    Assert: IsPropertyKey(P) is true.
    If O does not have an own property with key P, return undefined.
    Let D be a newly created Property Descriptor with no fields.
    Let X be O's own property whose key is P.
    If X is a data property, then
                             Set D.[[Value]] to the value of X's [[Value]] attribute.
                                   Set D.[[Writable]] to the value of X's [[Writable]] attribute.
                                         Else X is an accessor property,
    Set D.[[Get]] to the value of X's [[Get]] attribute.
          Set D.[[Set]] to the value of X's [[Set]] attribute.
                Set D.[[Enumerable]] to the value of X's [[Enumerable]] attribute.
                      Set D.[[Configurable]] to the value of X's [[Configurable]] attribute.
                            Return D.
    9.1.6[[DefineOwnProperty]] ( P, Desc )
    When the [[DefineOwnProperty]] internal method of O is called with property key P and Property Descriptor Desc, the following steps are taken:

    Return ? OrdinaryDefineOwnProperty(O, P, Desc).
    9.1.6.1OrdinaryDefineOwnProperty ( O, P, Desc )
    When the abstract operation OrdinaryDefineOwnProperty is called with Object O, property key P, and Property Descriptor Desc, the following steps are taken:

    Let current be ? O.[[GetOwnProperty]](P).
    Let extensible be O.[[Extensible]].
    Return ValidateAndApplyPropertyDescriptor(O, P, extensible, Desc, current).
    9.1.6.2IsCompatiblePropertyDescriptor ( Extensible, Desc, Current )
    When the abstract operation IsCompatiblePropertyDescriptor is called with Boolean value Extensible, and Property Descriptors Desc,
    and Current, the following steps are taken:

    Return ValidateAndApplyPropertyDescriptor(undefined, undefined, Extensible, Desc, Current).
    9.1.6.3ValidateAndApplyPropertyDescriptor ( O, P, extensible, Desc, current )
    When the abstract operation ValidateAndApplyPropertyDescriptor is called with Object O, property key P, Boolean value extensible, and
    Property Descriptors Desc, and current, the following steps are taken:

    NOTE
    If undefined is passed as the O argument only validation is performed and no object updates are performed.

    Assert: If O is not undefined, then IsPropertyKey(P) is true.
    If current is undefined, then
                             If extensible is false, return false.
    Assert: extensible is true.
    If IsGenericDescriptor(Desc) is true or IsDataDescriptor(Desc) is true, then
                                                                            If O is not undefined, create an own data property named P of
                                                                            object O whose [[Value]], [[Writable]], [[Enumerable]] and [[Configurable]] attribute
                                                                            values are described by Desc. If the value of an attribute field of Desc is absent, the
                                                                            attribute of the newly created property is set to its default value.
    Else Desc must be an accessor Property Descriptor,
    If O is not undefined, create an own accessor property named P of object O whose [[Get]], [[Set]], [[Enumerable]] and [[Configurable]] attribute values
    are described by Desc. If the value of an attribute field of Desc is absent, the attribute of the newly created property is set to its default value.
    Return true.
    If every field in Desc is absent, return true.
    If current.[[Configurable]] is false, then
                                          If Desc.[[Configurable]] is present and its value is true, return false.
    If Desc.[[Enumerable]] is present and the [[Enumerable]] fields of current and Desc are the Boolean negation of each other, return false.
    If IsGenericDescriptor(Desc) is true, no further validation is required.
    Else if IsDataDescriptor(current) and IsDataDescriptor(Desc) have different results, then
                                                                                         If current.[[Configurable]] is false, return false.
    If IsDataDescriptor(current) is true, then
                                          If O is not undefined, convert the property named P of object O from a data property to an accessor property.
                                          Preserve the existing values of the converted property's [[Configurable]] and [[Enumerable]] attributes and set
                                          the rest of the property's attributes to their default values.
    Else,
    If O is not undefined, convert the property named P of object O from an accessor property to a data property. Preserve the existing values of the
    converted property's [[Configurable]] and [[Enumerable]] attributes and set the rest of the property's attributes to their default values.
    Else if IsDataDescriptor(current) and IsDataDescriptor(Desc) are both true, then
                                                                                If current.[[Configurable]] is false and current.[[Writable]] is false, then
    If Desc.[[Writable]] is present and Desc.[[Writable]] is true, return false.
    If Desc.[[Value]] is present and SameValue(Desc.[[Value]], current.[[Value]]) is false, return false.
    Return true.
    Else IsAccessorDescriptor(current) and IsAccessorDescriptor(Desc) are both true,
    If current.[[Configurable]] is false, then
                                          If Desc.[[Set]] is present and SameValue(Desc.[[Set]], current.[[Set]]) is false, return false.
    If Desc.[[Get]] is present and SameValue(Desc.[[Get]], current.[[Get]]) is false, return false.
    Return true.
    If O is not undefined, then
                           For each field of Desc that is present, set the corresponding attribute of the property named P of object O to the value of the field.
    Return true.
    9.1.7[[HasProperty]]( P )
    When the [[HasProperty]] internal method of O is called with property key P, the following steps are taken:

    Return ? OrdinaryHasProperty(O, P).
    9.1.7.1OrdinaryHasProperty ( O, P )
    When the abstract operation OrdinaryHasProperty is called with Object O and with property key P, the following steps are taken:

    Assert: IsPropertyKey(P) is true.
    Let hasOwn be ? O.[[GetOwnProperty]](P).
    If hasOwn is not undefined, return true.
    Let parent be ? O.[[GetPrototypeOf]]().
    If parent is not null, then
                           Return ? parent.[[HasProperty]](P).
    Return false.
    9.1.8[[Get]] ( P, Receiver )
    When the [[Get]] internal method of O is called with property key P and ECMAScript language value Receiver, the following steps are taken:

    Return ? OrdinaryGet(O, P, Receiver).
    9.1.8.1OrdinaryGet ( O, P, Receiver )
    When the abstract operation OrdinaryGet is called with Object O, property key P, and ECMAScript language value Receiver, the following steps are taken:

    Assert: IsPropertyKey(P) is true.
    Let desc be ? O.[[GetOwnProperty]](P).
    If desc is undefined, then
                          Let parent be ? O.[[GetPrototypeOf]]().
    If parent is null, return undefined.
    Return ? parent.[[Get]](P, Receiver).
    If IsDataDescriptor(desc) is true, return desc.[[Value]].
    Assert: IsAccessorDescriptor(desc) is true.
    Let getter be desc.[[Get]].
    If getter is undefined, return undefined.
    Return ? Call(getter, Receiver).
    9.1.9[[Set]] ( P, V, Receiver )
    When the [[Set]] internal method of O is called with property key P, value V, and ECMAScript language value Receiver, the following steps are taken:

    Return ? OrdinarySet(O, P, V, Receiver).
    9.1.9.1OrdinarySet ( O, P, V, Receiver )
    When the abstract operation OrdinarySet is called with Object O, property key P, value V, and ECMAScript language value Receiver, the following steps are taken:

    Assert: IsPropertyKey(P) is true.
    Let ownDesc be ? O.[[GetOwnProperty]](P).
    If ownDesc is undefined, then
                             Let parent be ? O.[[GetPrototypeOf]]().
    If parent is not null, then
                           Return ? parent.[[Set]](P, V, Receiver).
    Else,
    Set ownDesc to the PropertyDescriptor{[[Value]]: undefined, [[Writable]]: true, [[Enumerable]]: true, [[Configurable]]: true}.
If IsDataDescriptor(ownDesc) is true, then
If ownDesc.[[Writable]] is false, return false.
    If Type(Receiver) is not Object, return false.
    Let existingDescriptor be ? Receiver.[[GetOwnProperty]](P).
    If existingDescriptor is not undefined, then
If IsAccessorDescriptor(existingDescriptor) is true, return false.
    If existingDescriptor.[[Writable]] is false, return false.
    Let valueDesc be the PropertyDescriptor{[[Value]]: V}.
Return ? Receiver.[[DefineOwnProperty]](P, valueDesc).
    Else Receiver does not currently have a property P,
    Return ? CreateDataProperty(Receiver, P, V).
        Assert: IsAccessorDescriptor(ownDesc) is true.
    Let setter be ownDesc.[[Set]].
    If setter is undefined, return false.
                                       Perform ? Call(setter, Receiver, « V »).
Return true.
9.1.10[[Delete]] ( P )
When the [[Delete]] internal method of O is called with property key P, the following steps are taken:

    Return ? OrdinaryDelete(O, P).
    9.1.10.1OrdinaryDelete ( O, P )
When the abstract operation OrdinaryDelete is called with Object O and property key P, the following steps are taken:

    Assert: IsPropertyKey(P) is true.
    Let desc be ? O.[[GetOwnProperty]](P).
    If desc is undefined, return true.
    If desc.[[Configurable]] is true, then
Remove the own property with name P from O.
    Return true.
    Return false.
9.1.11[[OwnPropertyKeys]] ( )
When the [[OwnPropertyKeys]] internal method of O is called, the following steps are taken:

    Return ! OrdinaryOwnPropertyKeys(O).
9.1.11.1OrdinaryOwnPropertyKeys ( O )
When the abstract operation OrdinaryOwnPropertyKeys is called with Object O, the following steps are taken:

    Let keys be a new empty List.
    For each own property key P of O that is an integer index, in ascending numeric index order, do
Add P as the last element of keys.
    For each own property key P of O that is a String but is not an integer index, in ascending chronological order of property creation, do
Add P as the last element of keys.
    For each own property key P of O that is a Symbol, in ascending chronological order of property creation, do
Add P as the last element of keys.
    Return keys.
9.1.12ObjectCreate ( proto [ , internalSlotsList ] )
The abstract operation ObjectCreate with argument proto (an object or null) is used to specify the runtime creation of new ordinary objects.
The optional argument internalSlotsList is a List of the names of additional internal slots that must be defined as part of the object. If the
list is not provided, a new empty List is used. This abstract operation performs the following steps:

    If internalSlotsList was not provided, set internalSlotsList to a new empty List.
    Let obj be a newly created object with an internal slot for each name in internalSlotsList.
    Set obj's essential internal methods to the default ordinary object definitions specified in 9.1.
Set obj.[[Prototype]] to proto.
    Set obj.[[Extensible]] to true.
    Return obj.
9.1.13OrdinaryCreateFromConstructor ( constructor, intrinsicDefaultProto [ , internalSlotsList ] )
The abstract operation OrdinaryCreateFromConstructor creates an ordinary object whose [[Prototype]] value is retrieved from a constructor's prototype
property, if it exists. Otherwise the intrinsic named by intrinsicDefaultProto is used for [[Prototype]]. The optional internalSlotsList is a List of
 the names of additional internal slots that must be defined as part of the object. If the list is not provided, a new empty List is used. This abstract
 operation performs the following steps:

Assert: intrinsicDefaultProto is a String value that is this specification's name of an intrinsic object. The corresponding object must be an intrinsic
that is intended to be used as the [[Prototype]] value of an object.
Let proto be ? GetPrototypeFromConstructor(constructor, intrinsicDefaultProto).
    Return ObjectCreate(proto, internalSlotsList).
9.1.14GetPrototypeFromConstructor ( constructor, intrinsicDefaultProto )
The abstract operation GetPrototypeFromConstructor determines the [[Prototype]] value that should be used to create an object corresponding to a
specific constructor. The value is retrieved from the constructor's prototype property, if it exists. Otherwise the intrinsic named by intrinsicDefaultProto is used for [[Prototype]]. This abstract operation performs the following steps:

Assert: intrinsicDefaultProto is a String value that is this specification's name of an intrinsic object. The corresponding object must be an intrinsic that is intended to be used as the [[Prototype]] value of an object.
Assert: IsCallable(constructor) is true.
    Let proto be ? Get(constructor, "prototype").
    If Type(proto) is not Object, then
Let realm be ? GetFunctionRealm(constructor).
    Set proto to realm's intrinsic object named intrinsicDefaultProto.
Return proto.
    NOTE
If constructor does not supply a [[Prototype]] value, the default value that is used is obtained from the realm of the constructor function rather than from the running execution context.

*/
}

