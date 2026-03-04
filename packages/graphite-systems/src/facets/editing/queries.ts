import type { IntentSnapshotReader, NodeId } from '@loop-kit/graphite-core';
import { EDITING_TRAIT_DELETABLE, EDITING_TRAIT_LOCKED } from './schema.js';

export function canDeleteNode(snapshot: IntentSnapshotReader, nodeId: NodeId): boolean {
    if (!snapshot.hasNode(nodeId)) {
        return false;
    }

    if (snapshot.hasTrait(nodeId, EDITING_TRAIT_LOCKED)) {
        return false;
    }

    return snapshot.hasTrait(nodeId, EDITING_TRAIT_DELETABLE);
}
