import { diagnostic, } from '@loop-kit/graphite-core';
import { DOCK_NODE_GROUP, DOCK_NODE_ROOT, } from './schema.js';
export function validateDockingSystem(snapshot) {
    const rootIds = snapshot.nodesByType(DOCK_NODE_ROOT);
    const diagnostics = [];
    if (rootIds.length === 0) {
        diagnostics.push(diagnostic('dock.rootMissing', 'No dock.root node exists in intent store.', 'warning', { facet: 'docking' }));
    }
    return {
        slice: {
            rootIds,
            groupCount: snapshot.nodesByType(DOCK_NODE_GROUP).length,
        },
        diagnostics,
    };
}
//# sourceMappingURL=validate.js.map