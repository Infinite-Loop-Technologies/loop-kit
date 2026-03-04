import { asNodeId } from '@loop-kit/graphite-core';
import { DOCK_DIAG_CODES, dockWarning } from './diagnostics.js';
import { DOCK_NODE_GROUP, DOCK_NODE_ROOT, DOCK_NODE_TAB, DOCK_PROP_ACTIVE_TAB, DOCK_PROP_PREVIEW, DOCK_PROP_SPLIT_DIRECTION, DOCK_PROP_SPLIT_RATIOS, DOCK_REL_CHILD_GROUPS, DOCK_REL_TABS, } from './schema.js';
export function isDockNodeType(type) {
    return type === DOCK_NODE_ROOT || type === DOCK_NODE_GROUP || type === DOCK_NODE_TAB;
}
export function findTabGroup(snapshot, tabId) {
    for (const groupId of snapshot.nodesByType(DOCK_NODE_GROUP)) {
        if (snapshot.getOrderedEdges(groupId, DOCK_REL_TABS).includes(tabId)) {
            return groupId;
        }
    }
    return undefined;
}
export function normalizeDockSnapshot(snapshot) {
    const diagnostics = [];
    const rootIds = [...snapshot.nodesByType(DOCK_NODE_ROOT)];
    const groupIds = [...snapshot.nodesByType(DOCK_NODE_GROUP)];
    const groups = {};
    for (const groupId of groupIds) {
        const tabIds = snapshot
            .getOrderedEdges(groupId, DOCK_REL_TABS)
            .filter((tabId) => snapshot.getNode(tabId)?.type === DOCK_NODE_TAB);
        const childGroupIds = snapshot
            .getOrderedEdges(groupId, DOCK_REL_CHILD_GROUPS)
            .filter((childId) => childId !== groupId && snapshot.getNode(childId)?.type === DOCK_NODE_GROUP);
        const activeTabProp = snapshot.getProp(groupId, DOCK_PROP_ACTIVE_TAB);
        const activeTabId = normalizeActiveTab(groupId, tabIds, activeTabProp, diagnostics);
        const splitDirection = normalizeSplitDirection(groupId, snapshot.getProp(groupId, DOCK_PROP_SPLIT_DIRECTION), diagnostics);
        const splitRatios = normalizeSplitRatios(snapshot.getProp(groupId, DOCK_PROP_SPLIT_RATIOS), childGroupIds.length + 1, groupId, diagnostics);
        groups[groupId] = {
            id: groupId,
            tabIds,
            activeTabId,
            childGroupIds,
            splitDirection,
            splitRatios,
        };
    }
    const rootGroupIds = rootIds.flatMap((rootId) => snapshot
        .getOrderedEdges(rootId, DOCK_REL_CHILD_GROUPS)
        .filter((groupId) => snapshot.getNode(groupId)?.type === DOCK_NODE_GROUP));
    if (rootIds.length === 0) {
        diagnostics.push(dockWarning(DOCK_DIAG_CODES.ROOT_MISSING, 'No dock.root node exists. Layout will render from orphan groups.'));
    }
    const layoutIR = buildLayoutIR(rootGroupIds.length > 0 ? rootGroupIds : groupIds, groups, diagnostics);
    const preview = readPreviewIntent(snapshot, rootIds[0]);
    return {
        slice: {
            rootIds,
            rootGroupIds,
            groups,
            layoutIR,
            preview,
        },
        diagnostics,
    };
}
function normalizeActiveTab(groupId, tabIds, activeTabProp, diagnostics) {
    if (tabIds.length === 0) {
        return undefined;
    }
    if (typeof activeTabProp === 'string') {
        const activeTabId = asNodeId(activeTabProp);
        if (tabIds.includes(activeTabId)) {
            return activeTabId;
        }
    }
    diagnostics.push(dockWarning(DOCK_DIAG_CODES.INVALID_ACTIVE_TAB, 'Group active tab is invalid. Falling back to first tab.', groupId));
    return tabIds[0];
}
function normalizeSplitDirection(groupId, value, diagnostics) {
    if (value === undefined) {
        return undefined;
    }
    if (value === 'horizontal' || value === 'vertical') {
        return value;
    }
    diagnostics.push(dockWarning(DOCK_DIAG_CODES.INVALID_SPLIT, 'Group split direction is invalid. Ignoring split direction.', groupId));
    return undefined;
}
function normalizeSplitRatios(value, expectedLength, groupId, diagnostics) {
    if (expectedLength <= 1) {
        return [1];
    }
    if (!Array.isArray(value)) {
        return equalRatios(expectedLength);
    }
    const ratios = value.filter((item) => typeof item === 'number' && item > 0);
    if (ratios.length !== expectedLength) {
        diagnostics.push(dockWarning(DOCK_DIAG_CODES.INVALID_SPLIT, 'Split ratios are invalid. Falling back to equal ratios.', groupId));
        return equalRatios(expectedLength);
    }
    const total = ratios.reduce((sum, ratio) => sum + ratio, 0);
    if (total <= 0) {
        return equalRatios(expectedLength);
    }
    return ratios.map((ratio) => ratio / total);
}
function equalRatios(length) {
    const ratio = 1 / length;
    return Array.from({ length }, () => ratio);
}
function buildLayoutIR(roots, groups, diagnostics) {
    const forest = [];
    const visited = new Set();
    const visit = (groupId, path) => {
        const group = groups[groupId];
        if (!group) {
            return undefined;
        }
        if (path.has(groupId)) {
            diagnostics.push(dockWarning(DOCK_DIAG_CODES.GROUP_CYCLE, 'Group containment cycle detected. Child traversal stopped at cycle edge.', groupId));
            return undefined;
        }
        const nextPath = new Set(path);
        nextPath.add(groupId);
        visited.add(groupId);
        const children = [];
        for (const childId of group.childGroupIds) {
            const child = visit(childId, nextPath);
            if (child) {
                children.push(child);
            }
        }
        return {
            kind: 'group',
            groupId,
            tabIds: [...group.tabIds],
            activeTabId: group.activeTabId,
            splitDirection: group.splitDirection,
            splitRatios: [...group.splitRatios],
            children,
        };
    };
    for (const rootId of roots) {
        const node = visit(rootId, new Set());
        if (node) {
            forest.push(node);
        }
    }
    for (const groupId of Object.keys(groups).map(asNodeId)) {
        if (visited.has(groupId)) {
            continue;
        }
        const node = visit(groupId, new Set());
        if (node) {
            forest.push(node);
        }
    }
    return forest;
}
function readPreviewIntent(snapshot, rootId) {
    if (!rootId) {
        return undefined;
    }
    const preview = snapshot.getProp(rootId, DOCK_PROP_PREVIEW);
    if (!preview || typeof preview !== 'object') {
        return undefined;
    }
    const candidate = preview;
    if (typeof candidate.tabId !== 'string' ||
        typeof candidate.sourceGroupId !== 'string' ||
        typeof candidate.targetGroupId !== 'string' ||
        typeof candidate.region !== 'string') {
        return undefined;
    }
    const region = candidate.region;
    if (region !== 'center' && region !== 'left' && region !== 'right' && region !== 'top' && region !== 'bottom') {
        return undefined;
    }
    return {
        tabId: asNodeId(candidate.tabId),
        sourceGroupId: asNodeId(candidate.sourceGroupId),
        targetGroupId: asNodeId(candidate.targetGroupId),
        region,
        zoneId: typeof candidate.zoneId === 'string' ? candidate.zoneId : undefined,
        targetIndex: typeof candidate.targetIndex === 'number' ? candidate.targetIndex : undefined,
    };
}
//# sourceMappingURL=queries.js.map