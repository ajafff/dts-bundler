import { WrappedAst } from "tsutils";
export { isIdentifier } from 'tsutils';
export * from './other';
export declare function bundle(entry: string): void;
export declare const nested: number, deeplyNested: number;
declare let nested2: number;
export { nested2 };
export declare let foo: Arr;
declare const bar: Generic;
export { bar };
export declare type Arr = (number | string)[];
export declare type Generic = Array<number | string>;
export declare type Callable = {
    (a: Array<{
        (): void;
    }>, ...args: any[]): any;
};
export declare type Signature = (a: (() => void)[], ...args: any[]) => any;
export interface Foo {
    method(): void;
    method(param: boolean): string;
    doStuff(): void;
    [key: number]: (number | string)[];
    [key: string]: any;
}
export interface Foo2 {
    method(param: boolean): string;
    doStuff(): void;
    [key: string]: any;
    method(): void;
    [key: number]: Array<number | string>;
}
export declare namespace Extended {
    function bas(): void;
}
export interface Extended {
    foo: Arr;
}
export declare class Extended {
    baz: void;
}
export interface Extended {
    bar: Generic;
}
export declare var wrapped: {
    wrapped: WrappedAst;
};
