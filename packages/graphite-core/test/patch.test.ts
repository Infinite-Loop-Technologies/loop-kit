import { test } from 'node:test';
import assert from 'node:assert/strict';
import { applyPatch, GraphStore, type GraphNodeSnapshot, type Patch } from '../src/index.js';
import { asNodeId } from '../src/types/ids.js';

test('applyPatch + invertPatch restore original graph state', () => {
    const seed: GraphNodeSnapshot[] = [
        {
            id: asNodeId('node.root'),
            type: 'root',
            props: { title: 'Root' },
            traits: ['selected'],
            edges: { links: [asNodeId('node.2')] },
            orderedEdges: { tabs: [asNodeId('node.1')] },
        },
        {
            id: asNodeId('node.1'),
            type: 'tab',
            props: { label: 'Tab 1' },
            traits: [],
            edges: {},
            orderedEdges: {},
        },
        {
            id: asNodeId('node.2'),
            type: 'tab',
            props: { label: 'Tab 2' },
            traits: [],
            edges: {},
            orderedEdges: {},
        },
    ];

    const store = new GraphStore(seed);
    const before = normalizeSnapshots(store.toSnapshots());

    const patch: Patch = {
        ops: [
            {
                kind: 'setProp',
                nodeId: asNodeId('node.root'),
                key: 'title',
                value: 'Root Updated',
            },
            {
                kind: 'addTrait',
                nodeId: asNodeId('node.1'),
                trait: 'active',
            },
            {
                kind: 'insertOrderedEdge',
                nodeId: asNodeId('node.root'),
                rel: 'tabs',
                to: asNodeId('node.2'),
                index: 0,
            },
            {
                kind: 'moveOrderedEdge',
                nodeId: asNodeId('node.root'),
                rel: 'tabs',
                to: asNodeId('node.1'),
                toIndex: 1,
            },
            {
                kind: 'removeOrderedEdge',
                nodeId: asNodeId('node.root'),
                rel: 'tabs',
                to: asNodeId('node.1'),
            },
            {
                kind: 'addEdge',
                nodeId: asNodeId('node.root'),
                rel: 'links',
                to: asNodeId('node.1'),
            },
            {
                kind: 'deleteNode',
                nodeId: asNodeId('node.2'),
            },
            {
                kind: 'createNode',
                node: {
                    id: asNodeId('node.3'),
                    type: 'panel',
                    props: { label: 'Panel 3' },
                    traits: [],
                    edges: {},
                    orderedEdges: {},
                },
            },
        ],
    };

    const { inversePatch } = applyPatch(store, patch);
    applyPatch(store, inversePatch);

    assert.deepEqual(normalizeSnapshots(store.toSnapshots()), before);
});

function normalizeSnapshots(input: readonly GraphNodeSnapshot[]): GraphNodeSnapshot[] {
    return [...input]
        .map((snapshot) => ({
            ...snapshot,
            traits: [...snapshot.traits].sort(),
            edges: Object.fromEntries(
                Object.entries(snapshot.edges)
                    .sort(([lhs], [rhs]) => lhs.localeCompare(rhs))
                    .map(([rel, targets]) => [rel, [...targets].sort()]),
            ),
            orderedEdges: Object.fromEntries(
                Object.entries(snapshot.orderedEdges).sort(([lhs], [rhs]) => lhs.localeCompare(rhs)),
            ),
        }))
        .sort((lhs, rhs) => lhs.id.localeCompare(rhs.id));
}
