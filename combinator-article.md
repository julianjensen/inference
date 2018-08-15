# Combinators

Translation from lambda calculus to non-stupid notation (yeah, I went there)
```
λx.xx ~> f => f( f )
λf.(λx.f(xx)) ~> f1 => f2 => f1( f2( f2 ) )
λf.(λx.f(xx))(λx.f(xx)) ~> f => x => f( x( x ) )( x => f( x( x ) ) )

Y = func => func( Y( func ) )    // g(Yg)
```

Strictly non-standard fixed-point combinator:
```
N = BM(B(BM)B)
B = λx,y,z.x(yz)
M = λx.xx
```
## Y-combinator
```
var Y = f => (x => x(x))(y => f(x => y(y)(x)));
var fac = Y(f => n => n > 1 ? n * f(n-1) : 1);

const
    testVal = 12,
```
## U-combinator
```
    U = f => f( f ),
    _ufact = fn => n => n === 0 ? 1 : n * fn( fn )( n - 1 ),
    ufact = U( _ufact ),
 ```
Y-combinator, `λf.(λx.f(xx))(λx.f(xx))` or `g( Y g )`
technically it should be `Y = f => f( Y( f ) )` but that obviously crashes (max. stack)
The obvious η-expansion of this would be `Y = f => n => f( Y( f ) )( n )`, which is just the Z-combinator
as defined below.

In this case, we defer the inner call, which adds the annoying need for the factory call fn() inside the function.
```
    Y = f => f( () => Y( f ) ),
    _yfact = fn => n => n === 0 ? 1 : n * fn()( n - 1 ),
    yfact = Y( _yfact ),
```
## Z-combinator
```
λf.(λx.f(λv.xxv))(λx.f(λv.xxv))
```
Yc-ombinator with η-expansion
1. `Y => λf.(λx.f(xx))(λx.f(xx))         g(Yg)`
2. `Y => λf.(λx.f(xx))(λx.f(xx))v        g(Yg)v`
3. `Z => λf.(λx.f(λv.xxv))(λx.f(λv.xxv)) g(Zg)v`

```
    Z = f => n => f( Z( f ) )( n ),
    _fact = fn => n => n === 0 ? 1 : n * fn( n - 1 ),
    zfact = Z( _fact ),
```
Z-combinator, one line
```
    onefact = ( f => n => f( Z( f ) )( n ) )( fn => n => n === 0 ? 1 : n * fn( n - 1 ) ),
```
J-combinator (Julian combinator... probably not)
Turns out, it's just a garden-variety Z-combinator once it's refactored a bit
```
    autoCurry =
        ( f, ...i ) =>
            ( s => s( s )( i ) )( s => p => ( ...c ) => c.length + p.length >= f.length ? f( ...p.concat( c ) ) : s( s )( p.concat( c ) ) ),

    zAutoCurry = ( f, ...i ) => Z( s => p => ( ...c ) => c.length + p.length >= f.length ? f( ...p.concat( c ) ) : s( p.concat( c ) ) )( i ),

    curryTest = ( a, b, c, d, e ) => a + b + c + d + e,

    altY = f => ( x => x( x ) )( y => f( x => y( y )( x ) ) ),
    altFac = altY( f => n => n > 1 ? n * f( n - 1 ) : 1 ),
 ```
The following comments are not by me but came with the code which is also not by me. For now.
Except for the η-abstraction necessary for applicative order languages, this is the formal Y combinator.
```
    Y1 = f => (
        (
            g => ( f( ( ...x ) => g( g )( ...x ) ) )
        )
        (
            g => ( f( ( ...x ) => g( g )( ...x ) ) )
        )
    ),
```
Using β-abstraction to eliminate code repetition.
```
    Y2 = f => (
        ( f => f( f ) )   ( g => ( f( ( ...x ) => g( g )( ...x ) ) ) )
    ),
```
Using β-abstraction to separate out the self application combinator δ.
```
    Y3 = (
        ( δ => f => δ( g => ( f( ( ...x ) => g( g )( ...x ) ) ) ) )
        ( ( f => f( f ) ) )
    ),
```
β/η-equivalent fix point combinator. Easier to convert to memoise than the Y combinator.
```
    fix = (
        ( ( f ) => ( g ) => ( h ) => ( f( h )( g( h ) ) ) )         // The Substitute combinator out of SKI calculus
        ( ( f ) => ( g ) => ( ...x ) => ( f( g( g ) ) )( ...x ) )   // S((S(KS)K)S(S(KS)K))(KI)
        ( ( f ) => ( g ) => ( ...x ) => ( f( g( g ) ) )( ...x ) )
    ),
```
β/η-converted form of fix above into a more compact form
```
    fix2 = f => ( f => f( f ) )( g => ( ...x ) => f( g( g ) )( ...x ) ),
```
Open version of the tail call variant of the factorial function
```
    opentailfact = fact => ( n, m = 1 ) => n < 2 ? m : fact( n - 1, n * m ),
```
Tail call version of factorial function
```
    tailfact = Y1( opentailfact ),
    tailfact2 = Y2( opentailfact ),
    tailfact3 = Y3( opentailfact ),
    fixfact1 = fix( opentailfact ),
    fixfact2 = fix2( opentailfact ),
```
and back to me again for some experiments. Clearly, we have the same function twice (duh!)
which we can fix (as was done above), but first remove some silly parentheses.
```
    _Y1 = f => ( g => ( f( ( ...x ) => g( g )( ...x ) ) ) )
                    ( g => ( f( ( ...x ) => g( g )( ...x ) ) ) ),
```
This was called β-abstraction above but I believe it's actually η-expansion on the left side
because `λx.λf.(fx) ~> x(fx) ~> f` and conversely `f ~> x(fx)`
In JavaScript `x => func( x )` is equivalent to `func`, of course
So, η-expansion is `func` ~> `x => func( x )` and η-reduction is `x => func( x )` ~> `func` and
together they are known as η-conversion.
```
    _Y2 = f => ( f => f( f ) )( g => ( f( ( ...x ) => g( g )( ...x ) ) ) ),
```
How do we get from Y2 to Y3?
```
Y2 = f => ( f => f( f ) )( g => ( f( ( ...x ) => g( g )( ...x ) ) ) )
```
We're calling a function that looks like this `f => f( f )`
with our `g => ...` function as the argument. So, let's define δ as `f => f( f )`
so we can call δ instead of `f => f( f )`. How do we assign it? The usual way: we pass it
as an argument: `( δ => δ( gfunc ) )( f => f( f ) )` which is a pattern that's getting
pretty common by now. It is also an IIFE so we end up with a Y3 that already has that
δ rolled in. However, we need Y3 to take a function as an argument, so we'll need to addEventListener
that, so then we get from:
```
( δ => δ( gfunc ) )( f => f( f ) )
```
to
```
( δ => f => δ( gfunc ) )( f => f( f ) )
```
which is what we see in Y3. Bear in mind that function formal paramters are scoped to the function,
which is obvious to all but somehow easy to forget in this context. The `f` in `f => f( f )` is _not_
the `f` we pass into Y3.
```
    Y3 = ( δ => f => δ( g => ( f( ( ...x ) => g( g )( ...x ) ) ) ) )( f => f( f ) )
                ^              ^                                      ^    ^  ^
    Same `f` ───┴──────────────┘         `f` more differently than ───┴────┴──┘

    _Y3 =
        ( δ => f => δ( g => ( f( ( ...x ) => g( g )( ...x ) ) ) ) )
        ( f => f( f ) ),
```
## SKI Calculus Diversion

Recall that SKI calculus substitution is `λxyz.xz(yz)` ~> `λfgh.fh(gh)` ~> `f( h )( g( h ) )`
and all three rules (S, K, and I) are:
```
Sxyz.xz(yz)
Ix.x
Kx.Fy.x

SIIα = Iα(Iα)
SII(SII) = I(SII)(I(SII)) = I(SII)(SII) = SII(SII)
(S(Kα)(SII))β = Kαβ(SIIβ) = α(SIIβ) = α(ββ)

β = S(Kα)(SII)
```
then:
```
SIIβ = ββ = α(ββ) = α(α(ββ)) = ...

s(ks)(s(kk)) = s(kk)(s(s(ks)(s(kk)i))(ki)) // i = skk = λx.x = sks
```
and
```s(ki) = λxy.xy

∀x -> SKKx = x so SKK = I

λx.x = SKKx
λx.y = Ky
λx.MN = S(λx.M)(λx.N)

BCKW
Bxyz = x(yz) = S(KS)K                // Compose
Cxyz = xzy   = S(S(K(S(KS)K))S)(KK)  // Swap args
Kxy = x      = K                     // Discard y
Wxy = xyy    = SS(SK)                // Duplicate y
reverse to SKI
I = WK
K = K
S = B(B(BW)C)(BB) = B(BW)(BBC)


So S( (S(KS)K) S(S(KS)K) )( KI )
S(KS)K = f => g => arg => f( g ( arg ) )
```
Working backwards:
```
λf.(λx.f(xx))(λx.f(xx))
```
Onwards:
```
    purdy_fix =
        ( f => g => h => f( h )( g( h ) ) )                 // α from α(ββ)
        ( f => g => ( ...x ) => ( f( g( g ) ) )( ...x ) )   // (β from α(ββ)
        ( f => g => ( ...x ) => ( f( g( g ) ) )( ...x ) )   // β) α(ββ)
    ,

    noparens = _Y1( opentailfact );

console.log( `U-combinator factorial( ${testVal} ) -> ${ufact( testVal )}` );
console.log( `Y-combinator factorial( ${testVal} ) -> ${yfact( testVal )}` );
console.log( `Z-combinator factorial( ${testVal} ) -> ${zfact( testVal )}` );
console.log( `One-line Z-combinator( ${testVal} ), for funsies -> ${onefact( testVal )}` );
console.log( `altY with altFac( ${testVal} ) -> ${altFac( testVal )}` );
console.log( `Y1 tailfact( ${testVal} ) -> ${tailfact( testVal )}` );
console.log( `Y2 tailfact2( ${testVal} ) -> ${tailfact2( testVal )}` );
console.log( `Y3 tailfact3( ${testVal} ) -> ${tailfact3( testVal )}` );
console.log( `fixfact1( ${testVal} ) -> ${fixfact1( testVal )}` );
console.log( `fixfact2( ${testVal} ) -> ${fixfact2( testVal )}` );
console.log( `noparens( ${testVal} ) -> ${noparens( testVal )}` );

const
    curry = autoCurry( curryTest ),
    three = curry( 1, 2, 3 ),
    four = three( 4 ),

    zcurry = zAutoCurry( curryTest ),
    zthree = zcurry( 1, 2, 3 ),
    zfour = zthree( 4 );

console.log( 'three( 5, 6 ) = 17:', three( 5, 6 ) );
console.log( 'four( 6 ) = 16:', four( 6 ) );
console.log( 'z-combinator three( 5, 6 ) = 17:', zthree( 5, 6 ) );
console.log( 'z-combinator four( 6 ) = 16:', zfour( 6 ) );


"use strict";

const
    cons = ( head, tail ) => ( { head, tail } ),
    Y = f => x => f( Y( f ) )( x ),
    fact = Y( f => n => !n ? 1 : n * f( n - 1 ) ),

    Z = f => n => f( Z( f ) )( n ),

    zMax = f => ( mx, n = 0 ) => f( zMax( f ) )( mx, n ),
    maxCounter = cb => zMax( f => ( mx, n ) => n >= mx ? mx : ( cb( n ), f( mx, n + 1 ) ) ),

    _Z = f => n => f( _Z( f ) )( typeof n === 'number' ? { mx: n, n: 0 } : n ),
    counter = cb => _Z( f => c => c.n >= c.mx ? c : ( cb( c.n ), c.n = -~c.n, f( c ) ) ),

    countdown = cb => Z( fn => n => !n ? 0 : ( cb( n ), fn( n - 1 ) ) );

counter( cnt => console.log( 'cnt:', cnt ) )( 5 );
maxCounter( cnt => console.log( 'max cnt:', cnt ) )( 5 );
countdown( cnt => console.log( 'count down:', cnt ) )( 5 );


let list;

for ( let i = 1e5; i > 0; --i )
    list = cons( i, list );

const
   take = n => ( { head, tail } ) => head === void 0 || n === 0 ?
                                        {} :
                                        { head, get tail() { return take( n - 1 )( tail ); } };

take( 1e5 )( list );

const
    outer = ( name, methName, t ) => Dcons => Dcons( thunk => ( ( t = new (
            ( n => ( {
                [ n ]: class {
                    [ methName = typeof thunk === 'function' ? `run${name}` : `get${name}` ]() {}
                }
            } )[ n ] )( name )
        )() ).__proto__[ methName ] = thunk, t ) ),

    defer = outer( 'Defer' )( _defer => thunk => _defer( thunk ) );

defer.map = f => tx => defer( () => f( tx.runDefer() ) );
// application: e1 e2, same as f(x)
defer.ap = af => ax => defer( () => af.runDefer()( ax.runDefer() ) );

const
    add = m => n => m + n,
    sqr = n => defer( () => n * n ),
    z = defer.ap( defer.map( add )( sqr( 5 ) ) )( sqr( 5 ) );

console.log( 'z:', z.runDefer() );

const
    repeat = x => defer( () => [ x, repeat( x ) ] ),
    mapped = defer.map( ( [ head, tail ] ) => [ sqr( head ), tail ] )( repeat( 5 ) ).runDefer();
