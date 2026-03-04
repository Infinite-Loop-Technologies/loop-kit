import { depAllNodes, depEdge, depNode, depNodeType, depOrderedEdge, depProp, depTrait, } from './depKeys.js';
export class QueryCtx {
    reader;
    captureDep;
    constructor(reader, captureDep) {
        this.reader = reader;
        this.captureDep = captureDep;
    }
    nodeExists(nodeId) {
        this.captureDep(depNode(nodeId));
        return this.reader.hasNode(nodeId);
    }
    getNodeType(nodeId) {
        this.captureDep(depNode(nodeId));
        return this.reader.getNode(nodeId)?.type;
    }
    getProp(nodeId, key) {
        this.captureDep(depProp(nodeId, key));
        return this.reader.getProp(nodeId, key);
    }
    hasTrait(nodeId, trait) {
        this.captureDep(depTrait(nodeId));
        this.captureDep(depTrait(nodeId, trait));
        return this.reader.hasTrait(nodeId, trait);
    }
    getTraits(nodeId) {
        this.captureDep(depTrait(nodeId));
        return this.reader.getTraits(nodeId);
    }
    getEdges(nodeId, rel) {
        this.captureDep(depEdge(nodeId, rel));
        return this.reader.getEdges(nodeId, rel);
    }
    getOrderedEdges(nodeId, rel) {
        this.captureDep(depOrderedEdge(nodeId, rel));
        return this.reader.getOrderedEdges(nodeId, rel);
    }
    nodesByType(type) {
        this.captureDep(depNodeType(type));
        return this.reader.nodesByType(type);
    }
    listNodeIds() {
        this.captureDep(depAllNodes());
        return this.reader.listNodeIds();
    }
}
export class QueryEngine {
    getReader;
    options;
    subscriptions = new Map();
    nextSubscriptionId = 1;
    stats = {
        invalidationCount: 0,
        rerunCount: 0,
    };
    constructor(getReader, options = {}) {
        this.getReader = getReader;
        this.options = options;
    }
    run(query) {
        const deps = new Set();
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
    subscribe(query, onChange) {
        const run = this.run(query);
        const id = this.nextSubscriptionId;
        this.nextSubscriptionId += 1;
        const subscription = {
            id,
            query: query,
            value: run.value,
            deps: run.deps,
            onChange: onChange,
        };
        this.subscriptions.set(id, subscription);
        return {
            unsubscribe: () => {
                this.subscriptions.delete(id);
            },
            getCurrent: () => {
                const current = this.subscriptions.get(id);
                if (!current) {
                    return subscription.value;
                }
                return current.value;
            },
        };
    }
    invalidateTouchedKeys(touchedKeys) {
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
    getStats() {
        return {
            invalidationCount: this.stats.invalidationCount,
            rerunCount: this.stats.rerunCount,
        };
    }
}
export function createQueryReadableFromStore(reader) {
    return reader;
}
function intersects(lhs, rhs) {
    const smaller = lhs.size < rhs.size ? lhs : rhs;
    const larger = smaller === lhs ? rhs : lhs;
    for (const key of smaller) {
        if (larger.has(key)) {
            return true;
        }
    }
    return false;
}
//# sourceMappingURL=queryEngine.js.map