var x = Math.random() & 1 ? 'xabcd' : 0x12341234;

    if ( !x )
        x += 0xabcdabcd;

    if ( x !== void 0 )
        x += "aaaabbbb";
console.error( x );