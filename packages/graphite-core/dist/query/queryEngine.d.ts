import type { GraphiteMetrics } from '../instrument/metrics.js';
import type { NodeId } from '../types/ids.js';
export type QueryReadable = {
    hasNode(nodeId: NodeId): boolean;
    getNode(nodeId: NodeId): {
        type?: string;
    } | undefined;
    getProp(nodeId: NodeId, key: string): unknown;
    hasTrait(nodeId: NodeId, trait: string): boolean;
    getTraits(nodeId: NodeId): readonly string[];
    getEdges(nodeId: NodeId, rel: string): readonly NodeId[];
    getOrderedEdges(nodeId: NodeId, rel: string): readonly NodeId[];
    nodesByType(type: string): readonly NodeId[];
    listNodeIds(): readonly NodeId[];
};
export type QueryFn<T> = (ctx: QueryCtx) => T;
export type QuerySubscription<T> = {
    id: number;
    query: QueryFn<T>;
    value: T;
    deps: Set<string>;
    onChange: (value: T, previous: T) => void;
};
export type QueryEngineOptions = {
    metrics?: GraphiteMetrics;
};
export type QueryEngineStats = {
    invalidationCount: number;
    rerunCount: number;
};
export declare class QueryCtx {
    private readonly reader;
    private readonly captureDep;
    constructor(reader: QueryReadable, captureDep: (dep: string) => void);
    nodeExists(nodeId: NodeId): boolean;
    getNodeType(nodeId: NodeId): string | undefined;
    getProp(nodeId: NodeId, key: string): unknown;
    hasTrait(nodeId: NodeId, trait: string): boolean;
    getTraits(nodeId: NodeId): readonly string[];
    getEdges(nodeId: NodeId, rel: string): readonly NodeId[];
    getOrderedEdges(nodeId: NodeId, rel: string): readonly NodeId[];
    nodesByType(type: string): readonly NodeId[];
    listNodeIds(): readonly NodeId[];
}
export type QueryRunResult<T> = {
    value: T;
    deps: Set<string>;
    durationMs: number;
};
export declare class QueryEngine {
    private readonly getReader;
    private readonly options;
    private subscriptions;
    private nextSubscriptionId;
    private stats;
    constructor(getReader: () => QueryReadable, options?: QueryEngineOptions);
    run<T>(query: QueryFn<T>): QueryRunResult<T>;
    subscribe<T>(query: QueryFn<T>, onChange: (value: T, previous: T) => void): {
        unsubscribe: () => void;
        getCurrent: () => T;
    };
    invalidateTouchedKeys(touchedKeys: Set<string>): number;
    getStats(): QueryEngineStats;
}
export declare function createQueryReadableFromStore(reader: QueryReadable): QueryReadable;
//# sourceMappingURL=queryEngine.d.ts.map