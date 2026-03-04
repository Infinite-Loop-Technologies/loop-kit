import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GraphiteRuntime, asNodeId, asScopeId } from '../src/index.js';

test('lazy validation caches slices per intent/overlay version', () => {
    const runtime = new GraphiteRuntime({ validateMode: 'lazy' });
    const scope = runtime.getScope(asScopeId('lazy'));
    const nodeId = asNodeId('validator.node');

    let validatorRuns = 0;
    runtime.registerValidator('facet.counter', (snapshot) => {
        validatorRuns += 1;
        return {
            slice: {
                value: snapshot.getProp(nodeId, 'value'),
            },
            diagnostics: [],
        };
    });

    runtime.commitIntentPatch({
        ops: [{ kind: 'setProp', nodeId, key: 'value', value: 1 }],
    });

    const view = scope.getStateView();
    const first = view.getSlice<{ value: number }>('facet.counter');
    const second = view.getSlice<{ value: number }>('facet.counter');

    assert.deepEqual(first, { value: 1 });
    assert.deepEqual(second, { value: 1 });
    assert.equal(validatorRuns, 1);

    runtime.commitIntentPatch({
        ops: [{ kind: 'setProp', nodeId, key: 'value', value: 2 }],
    });
    view.getSlice('facet.counter');
    assert.equal(validatorRuns, 2);
});

test('eager validation refreshes scope on commit without requiring reads', () => {
    const runtime = new GraphiteRuntime({ validateMode: 'eager' });
    const scope = runtime.getScope(asScopeId('eager'));
    const nodeId = asNodeId('validator.eager');

    let validatorRuns = 0;
    runtime.registerValidator('facet.eager', (snapshot) => {
        validatorRuns += 1;
        return {
            slice: {
                value: snapshot.getProp(nodeId, 'value'),
            },
            diagnostics: [],
        };
    });

    runtime.commitIntentPatch({
        ops: [{ kind: 'setProp', nodeId, key: 'value', value: 7 }],
    });

    assert.equal(validatorRuns >= 1, true);
    const before = validatorRuns;
    scope.getStateView().getSlice('facet.eager');
    assert.equal(validatorRuns, before);
});
