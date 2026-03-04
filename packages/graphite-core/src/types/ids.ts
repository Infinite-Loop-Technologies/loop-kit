export type Branded<T, Brand extends string> = T & { readonly __brand: Brand };

export type NodeId = Branded<string, 'NodeId'>;
export type ScopeId = Branded<string, 'ScopeId'>;

export function asNodeId(value: string): NodeId {
    return value as NodeId;
}

export function asScopeId(value: string): ScopeId {
    return value as ScopeId;
}
