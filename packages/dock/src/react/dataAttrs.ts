import type { NodeId } from '@loop-kit/graphite-core';

export const DATA_DOCK_NODE_ID = 'data-dock-nodeid';
export const DATA_DOCK_TAB_ID = 'data-dock-tabid';

export function dockNodeAttrs(nodeId: NodeId): Record<typeof DATA_DOCK_NODE_ID, string> {
    return {
        [DATA_DOCK_NODE_ID]: nodeId,
    };
}

export function dockTabAttrs(tabId: NodeId): Record<typeof DATA_DOCK_TAB_ID, string> {
    return {
        [DATA_DOCK_TAB_ID]: tabId,
    };
}

export function readDockNodeId(
    dataset: Record<string, string | undefined> | undefined,
): NodeId | undefined {
    const value = dataset?.dockNodeid;
    return value as NodeId | undefined;
}

export function readDockTabId(
    dataset: Record<string, string | undefined> | undefined,
): NodeId | undefined {
    const value = dataset?.dockTabid;
    return value as NodeId | undefined;
}
