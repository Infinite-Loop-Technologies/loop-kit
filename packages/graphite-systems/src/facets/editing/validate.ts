import {
    diagnostic,
    type Diagnostic,
    type IntentSnapshotReader,
    type ValidatorResult,
} from '@loop-kit/graphite-core';
import { canDeleteNode } from './queries.js';
import { EDITING_TRAIT_DELETABLE, EDITING_TRAIT_LOCKED } from './schema.js';

export type EditingStateSlice = {
    deletableNodeIds: string[];
};

export function validateEditing(snapshot: IntentSnapshotReader): ValidatorResult<EditingStateSlice> {
    const diagnostics: Diagnostic[] = [];
    const deletableNodeIds: string[] = [];

    for (const nodeId of snapshot.listNodeIds()) {
        if (canDeleteNode(snapshot, nodeId)) {
            deletableNodeIds.push(nodeId);
            continue;
        }

        if (
            snapshot.hasTrait(nodeId, EDITING_TRAIT_DELETABLE) &&
            snapshot.hasTrait(nodeId, EDITING_TRAIT_LOCKED)
        ) {
            diagnostics.push(
                diagnostic(
                    'edit.lockedDeletableConflict',
                    'Node is both deletable and locked; delete action is disabled.',
                    'warning',
                    { facet: 'editing', nodeId },
                ),
            );
        }
    }

    return {
        slice: {
            deletableNodeIds: deletableNodeIds.sort(),
        },
        diagnostics,
    };
}
