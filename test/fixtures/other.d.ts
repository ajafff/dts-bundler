import * as ts from 'typescript';

export interface Reexport {
    foo: number;
}
export interface Reexport {
    bar: string;
}

export type NodeArray = ts.NodeArray<ts.Node>;
