export const DATA_DOCK_NODE_ID = 'data-dock-nodeid';
export const DATA_DOCK_TAB_ID = 'data-dock-tabid';
export function dockNodeAttrs(nodeId) {
    return {
        [DATA_DOCK_NODE_ID]: nodeId,
    };
}
export function dockTabAttrs(tabId) {
    return {
        [DATA_DOCK_TAB_ID]: tabId,
    };
}
export function readDockNodeId(dataset) {
    const value = dataset?.dockNodeid;
    return value;
}
export function readDockTabId(dataset) {
    const value = dataset?.dockTabid;
    return value;
}
//# sourceMappingURL=dataAttrs.js.map