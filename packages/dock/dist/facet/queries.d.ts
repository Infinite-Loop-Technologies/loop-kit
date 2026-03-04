import type { Diagnostic, IntentSnapshotReader, NodeId } from '@loop-kit/graphite-core';
import { type DockDropRegion, type DockSplitDirection } from './schema.js';
export type DockPreviewIntent = {
    tabId: NodeId;
    sourceGroupId: NodeId;
    targetGroupId: NodeId;
    region: DockDropRegion;
    zoneId?: string;
    targetIndex?: number;
};
export type DockNormalizedGroup = {
    id: NodeId;
    tabIds: NodeId[];
    activeTabId?: NodeId;
    childGroupIds: NodeId[];
    splitDirection?: DockSplitDirection;
    splitRatios: number[];
};
export type DockLayoutNode = {
    kind: 'group';
    groupId: NodeId;
    tabIds: NodeId[];
    activeTabId?: NodeId;
    splitDirection?: DockSplitDirection;
    splitRatios: number[];
    children: DockLayoutNode[];
};
export type DockStateSlice = {
    rootIds: NodeId[];
    rootGroupIds: NodeId[];
    groups: Record<string, DockNormalizedGroup>;
    layoutIR: DockLayoutNode[];
    preview?: DockPreviewIntent;
};
export type DockNormalizationResult = {
    slice: DockStateSlice;
    diagnostics: Diagnostic[];
};
export declare function isDockNodeType(type: string | undefined): boolean;
export declare function findTabGroup(snapshot: IntentSnapshotReader, tabId: NodeId): NodeId | undefined;
export declare function normalizeDockSnapshot(snapshot: IntentSnapshotReader): DockNormalizationResult;
//# sourceMappingURL=queries.d.ts.map