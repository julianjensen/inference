/////////////////////////////
/// ECMAScript Array API (specially handled by compiler)
/////////////////////////////

interface ReadonlyArray<T> {
    /**
      * Gets the length of the array. This is a number one higher than the highest element defined in an array.
      */
    readonly length: number;
    /**
      * Returns a string representation of an array.
      */
    toString(): string;
    /**
      * Returns a string representation of an array. The elements are converted to string using thier toLocalString methods.
      */
    toLocaleString(): string;
    /**
      * Combines two or more arrays.
      * @param items Additional items to add to the end of array1.
      */
    concat(...items: ReadonlyArray<T>[]): T[];
    /**
      * Combines two or more arrays.
      * @param items Additional items to add to the end of array1.
      */
    concat(...items: (T | ReadonlyArray<T>)[]): T[];
    /**
      * Adds all the elements of an array separated by the specified separator string.
      * @param separator A string used to separate one element of an array from the next in the resulting String. If omitted, the array elements are separated with a comma.
      */
    join(separator?: string): string;

    readonly [n: number]: T;
}

interface ArrayConstructor {
    new(arrayLength?: number): any[];
    new <T>(arrayLength: number): T[];
    readonly prototype: Array<any>;
}

declare const Array: ArrayConstructor;

/**
 * Make all properties in T optional
 */
type Partial<T> = {
    [P in keyof T]?: T[P];
};

/**
 * Make all properties in T readonly
 */
type Readonly<T> = {
    readonly [P in keyof T]: T[P];
};

/**
 * From T pick a set of properties K
 */
type Pick<T, K extends keyof T> = {
    [P in K]: T[P];
};

/**
 * Construct a type with a set of properties K of type T
 */
type Record<K extends string, T> = {
    [P in K]: T;
};

/**
 * Marker for contextual 'this' type
 */
interface ThisType<T> { }

