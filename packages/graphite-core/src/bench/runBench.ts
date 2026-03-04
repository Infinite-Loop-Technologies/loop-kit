import {
    GraphiteRuntime,
    asNodeId,
    asScopeId,
    type Patch,
} from '../index.js';

function benchCommitThroughput(runtime: GraphiteRuntime, iterations: number): number {
    const start = performance.now();
    for (let index = 0; index < iterations; index += 1) {
        const nodeId = asNodeId(`bench.node.${index % 10}`);
        const patch: Patch = {
            ops: [
                {
                    kind: 'setProp',
                    nodeId,
                    key: 'counter',
                    value: index,
                },
            ],
        };

        runtime.commitIntentPatch(patch, { origin: 'bench:commit', history: false });
    }

    const elapsed = performance.now() - start;
    return (iterations / elapsed) * 1000;
}

function benchQueryRerunCost(runtime: GraphiteRuntime, iterations: number): number {
    const scope = runtime.getScope(asScopeId('bench-scope'));
    const nodeId = asNodeId('bench.query');
    runtime.commitIntentPatch({
        ops: [{ kind: 'setProp', nodeId, key: 'value', value: 0 }],
    });

    scope.queryEngine.subscribe(
        (query) => query.getProp(nodeId, 'value'),
        () => {},
    );

    const start = performance.now();
    for (let index = 0; index < iterations; index += 1) {
        runtime.commitIntentPatch({
            ops: [{ kind: 'setProp', nodeId, key: 'value', value: index }],
        });
    }

    return (performance.now() - start) / iterations;
}

function benchInvalidationSelectivity(runtime: GraphiteRuntime): number {
    const scope = runtime.getScope(asScopeId('bench-selectivity'));
    const subscriptionCount = 50;
    const nodes = Array.from({ length: subscriptionCount }, (_, index) => asNodeId(`sel.${index}`));

    for (const nodeId of nodes) {
        runtime.commitIntentPatch({
            ops: [{ kind: 'setProp', nodeId, key: 'value', value: 0 }],
        });

        scope.queryEngine.subscribe(
            (query) => query.getProp(nodeId, 'value'),
            () => {},
        );
    }

    const before = scope.queryEngine.getStats().rerunCount;
    runtime.commitIntentPatch({
        ops: [{ kind: 'setProp', nodeId: nodes[0], key: 'value', value: 42 }],
    });
    const after = scope.queryEngine.getStats().rerunCount;
    const reruns = after - before;
    return reruns / subscriptionCount;
}

function benchValidatorCacheRatio(runtime: GraphiteRuntime): number {
    const scopeId = asScopeId('bench-validate');
    const nodeId = asNodeId('bench.validator');
    runtime.registerValidator('bench.facet', (snapshot) => ({
        slice: {
            value: snapshot.getProp(nodeId, 'value'),
        },
        diagnostics: [],
    }));

    runtime.commitIntentPatch({
        ops: [{ kind: 'setProp', nodeId, key: 'value', value: 1 }],
    });

    const scope = runtime.getScope(scopeId);
    const view = scope.getStateView();

    for (let index = 0; index < 100; index += 1) {
        view.getSlice('bench.facet');
    }

    runtime.commitIntentPatch({
        ops: [{ kind: 'setProp', nodeId, key: 'value', value: 2 }],
    });
    view.getSlice('bench.facet');

    const hits = runtime.metrics.getCounter('validator.cache.hit');
    const misses = runtime.metrics.getCounter('validator.cache.miss');
    return hits / Math.max(1, hits + misses);
}

function runBench(): void {
    const runtime = new GraphiteRuntime({
        validateMode: 'lazy',
        enableHistory: true,
        enableEventLog: true,
    });

    const commitOpsPerSecond = benchCommitThroughput(runtime, 2_000);
    const queryRerunCostMs = benchQueryRerunCost(runtime, 500);
    const invalidationSelectivity = benchInvalidationSelectivity(runtime);
    const validatorCacheHitRatio = benchValidatorCacheRatio(runtime);

    console.log('Graphite Core Bench');
    console.log('-------------------');
    console.log(`Commit throughput (ops/sec): ${commitOpsPerSecond.toFixed(2)}`);
    console.log(`Query rerun cost (ms/rerun): ${queryRerunCostMs.toFixed(4)}`);
    console.log(`Invalidation selectivity (reruns/subscription): ${invalidationSelectivity.toFixed(4)}`);
    console.log(`Validator cache hit ratio: ${(validatorCacheHitRatio * 100).toFixed(2)}%`);
}

runBench();
