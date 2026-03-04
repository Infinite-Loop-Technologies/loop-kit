import { diagnostic, } from '@loop-kit/graphite-core';
import { canDeleteNode } from './queries.js';
import { EDITING_TRAIT_DELETABLE, EDITING_TRAIT_LOCKED } from './schema.js';
export function validateEditing(snapshot) {
    const diagnostics = [];
    const deletableNodeIds = [];
    for (const nodeId of snapshot.listNodeIds()) {
        if (canDeleteNode(snapshot, nodeId)) {
            deletableNodeIds.push(nodeId);
            continue;
        }
        if (snapshot.hasTrait(nodeId, EDITING_TRAIT_DELETABLE) &&
            snapshot.hasTrait(nodeId, EDITING_TRAIT_LOCKED)) {
            diagnostics.push(diagnostic('edit.lockedDeletableConflict', 'Node is both deletable and locked; delete action is disabled.', 'warning', { facet: 'editing', nodeId }));
        }
    }
    return {
        slice: {
            deletableNodeIds: deletableNodeIds.sort(),
        },
        diagnostics,
    };
}
//# sourceMappingURL=validate.js.map