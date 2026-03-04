import {
    GraphiteRuntime,
    asNodeId,
    asScopeId,
    type NodeId,
    type ScopeId,
} from '@loop-kit/graphite-core';
import { registerDockFacet } from '../src/register.js';
import {
    DOCK_NODE_GROUP,
    DOCK_NODE_ROOT,
    DOCK_NODE_TAB,
    DOCK_PROP_ACTIVE_TAB,
    DOCK_REL_CHILD_GROUPS,
    DOCK_REL_TABS,
} from '../src/facet/schema.js';

export type DockFixture = {
    runtime: GraphiteRuntime;
    scopeId: ScopeId;
    ids: {
        root: NodeId;
        groupA: NodeId;
        groupB: NodeId;
        tab1: NodeId;
        tab2: NodeId;
        tab3: NodeId;
    };
};

export function createDockFixture(options: { enableHistory?: boolean } = {}): DockFixture {
    const runtime = new GraphiteRuntime({
        enableHistory: options.enableHistory ?? true,
        validateMode: 'lazy',
    });
    registerDockFacet(runtime);

    const scopeId = asScopeId('dock-test');
    runtime.getScope(scopeId);

    const ids = {
        root: asNodeId('dock.root.main'),
        groupA: asNodeId('dock.group.a'),
        groupB: asNodeId('dock.group.b'),
        tab1: asNodeId('dock.tab.1'),
        tab2: asNodeId('dock.tab.2'),
        tab3: asNodeId('dock.tab.3'),
    };

    runtime.commitIntentPatch({
        ops: [
            createNode(ids.root, DOCK_NODE_ROOT),
            createNode(ids.groupA, DOCK_NODE_GROUP),
            createNode(ids.groupB, DOCK_NODE_GROUP),
            createNode(ids.tab1, DOCK_NODE_TAB),
            createNode(ids.tab2, DOCK_NODE_TAB),
            createNode(ids.tab3, DOCK_NODE_TAB),
            {
                kind: 'insertOrderedEdge',
                nodeId: ids.root,
                rel: DOCK_REL_CHILD_GROUPS,
                to: ids.groupA,
                index: 0,
            },
            {
                kind: 'insertOrderedEdge',
                nodeId: ids.groupA,
                rel: DOCK_REL_CHILD_GROUPS,
                to: ids.groupB,
                index: 0,
            },
            {
                kind: 'insertOrderedEdge',
                nodeId: ids.groupA,
                rel: DOCK_REL_TABS,
                to: ids.tab1,
                index: 0,
            },
            {
                kind: 'insertOrderedEdge',
                nodeId: ids.groupA,
                rel: DOCK_REL_TABS,
                to: ids.tab2,
                index: 1,
            },
            {
                kind: 'insertOrderedEdge',
                nodeId: ids.groupB,
                rel: DOCK_REL_TABS,
                to: ids.tab3,
                index: 0,
            },
            {
                kind: 'setProp',
                nodeId: ids.groupA,
                key: DOCK_PROP_ACTIVE_TAB,
                value: ids.tab1,
            },
            {
                kind: 'setProp',
                nodeId: ids.groupB,
                key: DOCK_PROP_ACTIVE_TAB,
                value: ids.tab3,
            },
        ],
    });

    return {
        runtime,
        scopeId,
        ids,
    };
}

function createNode(nodeId: NodeId, type: string) {
    return {
        kind: 'createNode' as const,
        node: {
            id: nodeId,
            type,
            props: {},
            traits: [],
            edges: {},
            orderedEdges: {},
        },
    };
}
