import type { IntentSnapshotReader, NodeId } from '@loop-kit/graphite-core';
export declare function isDockNodeType(type: string | undefined): boolean;
export declare function getGroupTabs(snapshot: IntentSnapshotReader, groupId: NodeId): readonly NodeId[];
export declare function getChildGroups(snapshot: IntentSnapshotReader, groupId: NodeId): readonly NodeId[];
export declare function listDockGroups(snapshot: IntentSnapshotReader): readonly NodeId[];
//# sourceMappingURL=queries.d.ts.map