import { asNodeId } from '@loop-kit/graphite-core';
import { DOCK_NODE_GROUP, DOCK_PROP_ACTIVE_TAB, DOCK_PROP_PREVIEW, DOCK_PROP_SPLIT_DIRECTION, DOCK_PROP_SPLIT_RATIOS, DOCK_REL_CHILD_GROUPS, DOCK_REL_TABS, } from './schema.js';
export function buildPreviewPatch(rootId, preview) {
    return {
        ops: [
            {
                kind: 'setProp',
                nodeId: rootId,
                key: DOCK_PROP_PREVIEW,
                value: preview,
            },
        ],
    };
}
export function buildClearPreviewPatch(rootId) {
    return {
        ops: [
            {
                kind: 'delProp',
                nodeId: rootId,
                key: DOCK_PROP_PREVIEW,
            },
        ],
    };
}
export function buildMoveTabPatch(snapshot, args) {
    const ops = [];
    if (args.sourceGroupId === args.targetGroupId) {
        if (typeof args.targetIndex === 'number') {
            ops.push({
                kind: 'moveOrderedEdge',
                nodeId: args.sourceGroupId,
                rel: DOCK_REL_TABS,
                to: args.tabId,
                toIndex: args.targetIndex,
            });
        }
    }
    else {
        ops.push({
            kind: 'removeOrderedEdge',
            nodeId: args.sourceGroupId,
            rel: DOCK_REL_TABS,
            to: args.tabId,
        });
        ops.push({
            kind: 'insertOrderedEdge',
            nodeId: args.targetGroupId,
            rel: DOCK_REL_TABS,
            to: args.tabId,
            index: args.targetIndex,
        });
    }
    ops.push({
        kind: 'setProp',
        nodeId: args.targetGroupId,
        key: DOCK_PROP_ACTIVE_TAB,
        value: args.tabId,
    });
    if (args.sourceGroupId !== args.targetGroupId) {
        const sourceTabs = snapshot
            .getOrderedEdges(args.sourceGroupId, DOCK_REL_TABS)
            .filter((tabId) => tabId !== args.tabId);
        const sourceActive = snapshot.getProp(args.sourceGroupId, DOCK_PROP_ACTIVE_TAB);
        if (sourceActive === args.tabId) {
            if (sourceTabs.length > 0) {
                ops.push({
                    kind: 'setProp',
                    nodeId: args.sourceGroupId,
                    key: DOCK_PROP_ACTIVE_TAB,
                    value: sourceTabs[0],
                });
            }
            else {
                ops.push({
                    kind: 'delProp',
                    nodeId: args.sourceGroupId,
                    key: DOCK_PROP_ACTIVE_TAB,
                });
            }
        }
    }
    return { ops };
}
export function buildSplitTabPatch(snapshot, args) {
    const childGroups = snapshot.getOrderedEdges(args.targetGroupId, DOCK_REL_CHILD_GROUPS);
    const paneCount = childGroups.length + 2;
    const ops = [
        {
            kind: 'removeOrderedEdge',
            nodeId: args.sourceGroupId,
            rel: DOCK_REL_TABS,
            to: args.tabId,
        },
        {
            kind: 'createNode',
            node: {
                id: args.newGroupId,
                type: DOCK_NODE_GROUP,
                props: {},
                traits: [],
                edges: {},
                orderedEdges: {},
            },
        },
        {
            kind: 'insertOrderedEdge',
            nodeId: args.newGroupId,
            rel: DOCK_REL_TABS,
            to: args.tabId,
            index: 0,
        },
        {
            kind: 'setProp',
            nodeId: args.newGroupId,
            key: DOCK_PROP_ACTIVE_TAB,
            value: args.tabId,
        },
        {
            kind: 'insertOrderedEdge',
            nodeId: args.targetGroupId,
            rel: DOCK_REL_CHILD_GROUPS,
            to: args.newGroupId,
            index: args.region === 'left' || args.region === 'top' ? 0 : undefined,
        },
        {
            kind: 'setProp',
            nodeId: args.targetGroupId,
            key: DOCK_PROP_SPLIT_DIRECTION,
            value: args.region === 'left' || args.region === 'right' ? 'horizontal' : 'vertical',
        },
        {
            kind: 'setProp',
            nodeId: args.targetGroupId,
            key: DOCK_PROP_SPLIT_RATIOS,
            value: equalRatios(paneCount),
        },
    ];
    const sourceTabs = snapshot
        .getOrderedEdges(args.sourceGroupId, DOCK_REL_TABS)
        .filter((tabId) => tabId !== args.tabId);
    if (snapshot.getProp(args.sourceGroupId, DOCK_PROP_ACTIVE_TAB) === args.tabId) {
        if (sourceTabs.length > 0) {
            ops.push({
                kind: 'setProp',
                nodeId: args.sourceGroupId,
                key: DOCK_PROP_ACTIVE_TAB,
                value: sourceTabs[0],
            });
        }
        else {
            ops.push({
                kind: 'delProp',
                nodeId: args.sourceGroupId,
                key: DOCK_PROP_ACTIVE_TAB,
            });
        }
    }
    return { ops };
}
export function buildPatchFromPreview(snapshot, preview, options = {}) {
    if (preview.region === 'center') {
        return buildMoveTabPatch(snapshot, {
            tabId: preview.tabId,
            sourceGroupId: preview.sourceGroupId,
            targetGroupId: preview.targetGroupId,
            targetIndex: preview.targetIndex,
        });
    }
    const newGroupId = options.newGroupId ?? asNodeId(`dock.group.${Date.now()}`);
    return buildSplitTabPatch(snapshot, {
        tabId: preview.tabId,
        sourceGroupId: preview.sourceGroupId,
        targetGroupId: preview.targetGroupId,
        region: preview.region,
        newGroupId,
    });
}
function equalRatios(length) {
    const ratio = 1 / length;
    return Array.from({ length }, () => ratio);
}
//# sourceMappingURL=patchBuilders.js.map