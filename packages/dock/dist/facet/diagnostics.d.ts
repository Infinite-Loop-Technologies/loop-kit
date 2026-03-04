import { type Diagnostic, type NodeId } from '@loop-kit/graphite-core';
export declare const DOCK_DIAG_CODES: {
    readonly ROOT_MISSING: "dock.rootMissing";
    readonly INVALID_ACTIVE_TAB: "dock.invalidActiveTab";
    readonly GROUP_CYCLE: "dock.groupCycle";
    readonly INVALID_SPLIT: "dock.invalidSplit";
};
export declare function dockWarning(code: string, message: string, nodeId?: NodeId): Diagnostic;
//# sourceMappingURL=diagnostics.d.ts.map