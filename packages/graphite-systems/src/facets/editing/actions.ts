import type { NodeId } from '@loop-kit/graphite-core';
import type { ActionRegistry } from '../../actions/actionRegistry.js';
import { buildDeleteNodePatch } from './patchBuilders.js';
import { canDeleteNode } from './queries.js';
import { EDITING_ACTION_DELETE } from './schema.js';

export type EditDeletePayload = {
    nodeId: NodeId;
};

export function registerEditingActions(actionRegistry: ActionRegistry): () => void {
    return actionRegistry.registerAction<EditDeletePayload>(EDITING_ACTION_DELETE, {
        label: 'Delete',
        when: (context, payload) => canDeleteNode(context.snapshot, payload.nodeId),
        run: (context, payload) => {
            const patch = buildDeleteNodePatch(payload.nodeId);
            context.scope.commitIntentPatch(patch, {
                origin: EDITING_ACTION_DELETE,
                history: true,
            });
        },
    });
}
