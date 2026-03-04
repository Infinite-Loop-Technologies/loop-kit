import type { NodeId } from '@loop-kit/graphite-core';
import type { ActionRegistry } from '../../actions/actionRegistry.js';
export type EditDeletePayload = {
    nodeId: NodeId;
};
export declare function registerEditingActions(actionRegistry: ActionRegistry): () => void;
//# sourceMappingURL=actions.d.ts.map