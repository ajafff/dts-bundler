import * as ts from 'typescript';

export interface Reexport {
    foo: number;
}
export interface Reexport {
    bar: IndirectUse;
}

export type NodeArray = ts.NodeArray<ts.Node>;

export interface IndirectUse {
    __foo: MoreIndirectUse;
}

export interface MoreIndirectUse {
    __bar: NodeArray;
}
