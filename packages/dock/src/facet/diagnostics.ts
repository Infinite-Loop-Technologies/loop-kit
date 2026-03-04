import { diagnostic, type Diagnostic, type NodeId } from '@loop-kit/graphite-core';

export const DOCK_DIAG_CODES = {
    ROOT_MISSING: 'dock.rootMissing',
    INVALID_ACTIVE_TAB: 'dock.invalidActiveTab',
    GROUP_CYCLE: 'dock.groupCycle',
    INVALID_SPLIT: 'dock.invalidSplit',
} as const;

export function dockWarning(
    code: string,
    message: string,
    nodeId?: NodeId,
): Diagnostic {
    return diagnostic(code, message, 'warning', { facet: 'dock', nodeId });
}
