import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GraphiteRuntime, asNodeId, asScopeId } from '../src/index.js';

test('query engine reruns only subscriptions touched by commit keys', () => {
    const runtime = new GraphiteRuntime();
    const scope = runtime.getScope(asScopeId('query-test'));
    const left = asNodeId('node.left');
    const right = asNodeId('node.right');

    runtime.commitIntentPatch({
        ops: [
            { kind: 'setProp', nodeId: left, key: 'count', value: 1 },
            { kind: 'setProp', nodeId: right, key: 'count', value: 1 },
        ],
    });

    let leftChanges = 0;
    let rightChanges = 0;
    scope.queryEngine.subscribe(
        (query) => query.getProp(left, 'count'),
        () => {
            leftChanges += 1;
        },
    );
    scope.queryEngine.subscribe(
        (query) => query.getProp(right, 'count'),
        () => {
            rightChanges += 1;
        },
    );

    runtime.commitIntentPatch({
        ops: [{ kind: 'setProp', nodeId: left, key: 'count', value: 2 }],
    });

    assert.equal(leftChanges, 1);
    assert.equal(rightChanges, 0);
});
