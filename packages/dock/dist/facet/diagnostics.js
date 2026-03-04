import { diagnostic } from '@loop-kit/graphite-core';
export const DOCK_DIAG_CODES = {
    ROOT_MISSING: 'dock.rootMissing',
    INVALID_ACTIVE_TAB: 'dock.invalidActiveTab',
    GROUP_CYCLE: 'dock.groupCycle',
    INVALID_SPLIT: 'dock.invalidSplit',
};
export function dockWarning(code, message, nodeId) {
    return diagnostic(code, message, 'warning', { facet: 'dock', nodeId });
}
//# sourceMappingURL=diagnostics.js.map