
1. if `type` and `type` is `string` === `'reference'`
   
   return `new TypeReference( typeName )`
2. if `type` and `type` is `string` and `type` is primitive
   
   return new Primitive
3. if `typeName` is `string` and `typeName` is primitive

   return new Primitive
4. if `type` is `"union"` or `"intersection"`

   return `new Union( types.map() )` or Intersection
5. if `type` is an `Object` recurse on `type`


Primitive