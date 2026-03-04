import { DOCK_PROP_ACTIVE_TAB } from './schema.js';
export function buildSetActiveTabPatch(groupId, tabId) {
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
//# sourceMappingURL=patchBuilders.js.map