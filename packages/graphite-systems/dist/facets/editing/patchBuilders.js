export function buildDeleteNodePatch(nodeId) {
    return {
        ops: [
            {
                kind: 'deleteNode',
                nodeId,
            },
        ],
    };
}
//# sourceMappingURL=patchBuilders.js.map