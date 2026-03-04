import type { NodeId, Patch } from '@loop-kit/graphite-core';

export function buildDeleteNodePatch(nodeId: NodeId): Patch {
    return {
        ops: [
            {
                kind: 'deleteNode',
                nodeId,
            },
        ],
    };
}
