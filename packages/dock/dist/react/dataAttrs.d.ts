import type { NodeId } from '@loop-kit/graphite-core';
export declare const DATA_DOCK_NODE_ID = "data-dock-nodeid";
export declare const DATA_DOCK_TAB_ID = "data-dock-tabid";
export declare function dockNodeAttrs(nodeId: NodeId): Record<typeof DATA_DOCK_NODE_ID, string>;
export declare function dockTabAttrs(tabId: NodeId): Record<typeof DATA_DOCK_TAB_ID, string>;
export declare function readDockNodeId(dataset: Record<string, string | undefined> | undefined): NodeId | undefined;
export declare function readDockTabId(dataset: Record<string, string | undefined> | undefined): NodeId | undefined;
//# sourceMappingURL=dataAttrs.d.ts.map