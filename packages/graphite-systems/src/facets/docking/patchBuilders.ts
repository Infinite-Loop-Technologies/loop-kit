import type { NodeId, Patch } from '@loop-kit/graphite-core';
import { DOCK_PROP_ACTIVE_TAB } from './schema.js';

export function buildSetActiveTabPatch(groupId: NodeId, tabId: NodeId): Patch {
    return {
        ops: [
            {
                kind: 'setProp',
                nodeId: groupId,
                key: DOCK_PROP_ACTIVE_TAB,
                value: tabId,
            },
        ],
    };
}
