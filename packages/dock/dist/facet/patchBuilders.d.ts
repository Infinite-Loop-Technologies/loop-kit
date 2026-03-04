import { type IntentSnapshotReader, type NodeId, type Patch } from '@loop-kit/graphite-core';
import type { DockPreviewIntent } from './queries.js';
import { type DockDropRegion } from './schema.js';
export type MoveTabPatchArgs = {
    tabId: NodeId;
    sourceGroupId: NodeId;
    targetGroupId: NodeId;
    targetIndex?: number;
};
export type SplitTabPatchArgs = {
    tabId: NodeId;
    sourceGroupId: NodeId;
    targetGroupId: NodeId;
    region: Exclude<DockDropRegion, 'center'>;
    newGroupId: NodeId;
};
export declare function buildPreviewPatch(rootId: NodeId, preview: DockPreviewIntent): Patch;
export declare function buildClearPreviewPatch(rootId: NodeId): Patch;
export declare function buildMoveTabPatch(snapshot: IntentSnapshotReader, args: MoveTabPatchArgs): Patch;
export declare function buildSplitTabPatch(snapshot: IntentSnapshotReader, args: SplitTabPatchArgs): Patch;
export declare function buildPatchFromPreview(snapshot: IntentSnapshotReader, preview: DockPreviewIntent, options?: {
    newGroupId?: NodeId;
}): Patch;
//# sourceMappingURL=patchBuilders.d.ts.map