// declare function setTimeout( callback: ( ...args: any[] ) => void, ms: number, ...args: any[] ): NodeJS.Timer;

declare namespace setTimeout
{
    export function __promisify__( ms: number ): Promise<void>;
    export function __promisify__<T>( ms: number, value: T ): Promise<T>;
}
