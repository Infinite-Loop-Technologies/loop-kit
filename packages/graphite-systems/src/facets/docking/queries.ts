import type { IntentSnapshotReader, NodeId } from '@loop-kit/graphite-core';
import {
    DOCK_NODE_GROUP,
    DOCK_NODE_ROOT,
    DOCK_NODE_TAB,
    DOCK_REL_CHILD_GROUPS,
    DOCK_REL_TABS,
} from './schema.js';

export function isDockNodeType(type: string | undefined): boolean {
    return type === DOCK_NODE_ROOT || type === DOCK_NODE_GROUP || type === DOCK_NODE_TAB;
}

export function getGroupTabs(snapshot: IntentSnapshotReader, groupId: NodeId): readonly NodeId[] {
    return snapshot.getOrderedEdges(groupId, DOCK_REL_TABS);
}

export function getChildGroups(snapshot: IntentSnapshotReader, groupId: NodeId): readonly NodeId[] {
    return snapshot.getOrderedEdges(groupId, DOCK_REL_CHILD_GROUPS);
}

export function listDockGroups(snapshot: IntentSnapshotReader): readonly NodeId[] {
    return snapshot.nodesByType(DOCK_NODE_GROUP);
}
