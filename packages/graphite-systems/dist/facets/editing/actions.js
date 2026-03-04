import { buildDeleteNodePatch } from './patchBuilders.js';
import { canDeleteNode } from './queries.js';
import { EDITING_ACTION_DELETE } from './schema.js';
export function registerEditingActions(actionRegistry) {
    return actionRegistry.registerAction(EDITING_ACTION_DELETE, {
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
//# sourceMappingURL=actions.js.map