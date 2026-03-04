import { EDITING_TRAIT_DELETABLE, EDITING_TRAIT_LOCKED } from './schema.js';
export function canDeleteNode(snapshot, nodeId) {
    if (!snapshot.hasNode(nodeId)) {
        return false;
    }
    if (snapshot.hasTrait(nodeId, EDITING_TRAIT_LOCKED)) {
        return false;
    }
    return snapshot.hasTrait(nodeId, EDITING_TRAIT_DELETABLE);
}
//# sourceMappingURL=queries.js.map