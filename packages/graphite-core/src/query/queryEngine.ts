import type { GraphiteMetrics } from '../instrument/metrics.js';
import type { NodeId } from '../types/ids.js';
import {
    depAllNodes,
    depEdge,
    depNode,
    depNodeType,
    depOrderedEdge,
    depProp,
    depTrait,
} from './depKeys.js';

export type QueryReadable = {
    hasNode(nodeId: NodeId): boolean;
    getNode(nodeId: NodeId): { type?: string } | undefined;
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

type InternalSubscription = QuerySubscription<unknown>;

export type QueryEngineOptions = {
    metrics?: GraphiteMetrics;
};

export type QueryEngineStats = {
    invalidationCount: number;
    rerunCount: number;
};

export class QueryCtx {
    constructor(
        private readonly reader: QueryReadable,
        private readonly captureDep: (dep: string) => void,
    ) {}

    nodeExists(nodeId: NodeId): boolean {
        this.captureDep(depNode(nodeId));
        return this.reader.hasNode(nodeId);
    }

    getNodeType(nodeId: NodeId): string | undefined {
        this.captureDep(depNode(nodeId));
        return this.reader.getNode(nodeId)?.type;
    }

    getProp(nodeId: NodeId, key: string): unknown {
        this.captureDep(depProp(nodeId, key));
        return this.reader.getProp(nodeId, key);
    }

    hasTrait(nodeId: NodeId, trait: string): boolean {
        this.captureDep(depTrait(nodeId));
        this.captureDep(depTrait(nodeId, trait));
        return this.reader.hasTrait(nodeId, trait);
    }

    getTraits(nodeId: NodeId): readonly string[] {
        this.captureDep(depTrait(nodeId));
        return this.reader.getTraits(nodeId);
    }

    getEdges(nodeId: NodeId, rel: string): readonly NodeId[] {
        this.captureDep(depEdge(nodeId, rel));
        return this.reader.getEdges(nodeId, rel);
    }

    getOrderedEdges(nodeId: NodeId, rel: string): readonly NodeId[] {
        this.captureDep(depOrderedEdge(nodeId, rel));
        return this.reader.getOrderedEdges(nodeId, rel);
    }

    nodesByType(type: string): readonly NodeId[] {
        this.captureDep(depNodeType(type));
        return this.reader.nodesByType(type);
    }

    listNodeIds(): readonly NodeId[] {
        this.captureDep(depAllNodes());
        return this.reader.listNodeIds();
    }
}

export type QueryRunResult<T> = {
    value: T;
    deps: Set<string>;
    durationMs: number;
};

export class QueryEngine {
    private subscriptions = new Map<number, InternalSubscription>();
    private nextSubscriptionId = 1;
    private stats: QueryEngineStats = {
        invalidationCount: 0,
        rerunCount: 0,
    };

    constructor(
        private readonly getReader: () => QueryReadable,
        private readonly options: QueryEngineOptions = {},
    ) {}

    run<T>(query: QueryFn<T>): QueryRunResult<T> {
        const deps = new Set<string>();
        const reader = this.getReader();
        const ctx = new QueryCtx(reader, (dep) => {
            deps.add(dep);
        });

        const start = performance.now();
        const value = query(ctx);
        const durationMs = performance.now() - start;
        this.options.metrics?.increment('query.run');
        this.options.metrics?.onQueryTime(durationMs);

        return {
            value,
            deps,
            durationMs,
        };
    }

    subscribe<T>(
        query: QueryFn<T>,
        onChange: (value: T, previous: T) => void,
    ): { unsubscribe: () => void; getCurrent: () => T } {
        const run = this.run(query);
        const id = this.nextSubscriptionId;
        this.nextSubscriptionId += 1;

        const subscription: InternalSubscription = {
            id,
            query: query as QueryFn<unknown>,
            value: run.value,
            deps: run.deps,
            onChange: onChange as (value: unknown, previous: unknown) => void,
        };

        this.subscriptions.set(id, subscription);

        return {
            unsubscribe: () => {
                this.subscriptions.delete(id);
            },
            getCurrent: () => {
                const current = this.subscriptions.get(id);
                if (!current) {
                    return subscription.value as T;
                }
                return current.value as T;
            },
        };
    }

    invalidateTouchedKeys(touchedKeys: Set<string>): number {
        if (touchedKeys.size === 0) {
            return 0;
        }

        let invalidated = 0;
        this.stats.invalidationCount += 1;
        this.options.metrics?.increment('query.invalidation');

        for (const [id, subscription] of this.subscriptions) {
            if (!intersects(subscription.deps, touchedKeys)) {
                continue;
            }

            invalidated += 1;
            const run = this.run(subscription.query);
            this.stats.rerunCount += 1;
            const previous = subscription.value;
            subscription.deps = run.deps;
            subscription.value = run.value;
            this.subscriptions.set(id, subscription);

            if (!Object.is(previous, run.value)) {
                subscription.onChange(run.value, previous);
            }
        }

        return invalidated;
    }

    getStats(): QueryEngineStats {
        return {
            invalidationCount: this.stats.invalidationCount,
            rerunCount: this.stats.rerunCount,
        };
    }
}

export function createQueryReadableFromStore(reader: QueryReadable): QueryReadable {
    return reader;
}

function intersects(lhs: Set<string>, rhs: Set<string>): boolean {
    const smaller = lhs.size < rhs.size ? lhs : rhs;
    const larger = smaller === lhs ? rhs : lhs;

    for (const key of smaller) {
        if (larger.has(key)) {
            return true;
        }
    }

    return false;
}
