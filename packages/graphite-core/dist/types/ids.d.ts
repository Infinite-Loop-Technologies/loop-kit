export type Branded<T, Brand extends string> = T & {
    readonly __brand: Brand;
};
export type NodeId = Branded<string, 'NodeId'>;
export type ScopeId = Branded<string, 'ScopeId'>;
export declare function asNodeId(value: string): NodeId;
export declare function asScopeId(value: string): ScopeId;
//# sourceMappingURL=ids.d.ts.map