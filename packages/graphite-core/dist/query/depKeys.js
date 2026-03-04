const SEP = '|';
export function depAllNodes() {
    return `all${SEP}nodes`;
}
export function depNode(id) {
    return `node${SEP}${id}`;
}
export function depNodeType(type) {
    return `type${SEP}${type}`;
}
export function depProp(id, key) {
    return `prop${SEP}${id}${SEP}${key}`;
}
export function depTrait(id, trait) {
    return trait ? `trait${SEP}${id}${SEP}${trait}` : `trait${SEP}${id}`;
}
export function depEdge(id, rel) {
    return `edge${SEP}${id}${SEP}${rel}`;
}
export function depOrderedEdge(id, rel) {
    return `ordered${SEP}${id}${SEP}${rel}`;
}
export function extractTouchedKeysFromPatch(patch) {
    const touched = new Set();
    for (const op of patch.ops) {
        switch (op.kind) {
            case 'setProp':
            case 'delProp': {
                touched.add(depNode(op.nodeId));
                touched.add(depProp(op.nodeId, op.key));
                break;
            }
            case 'addTrait':
            case 'delTrait': {
                touched.add(depNode(op.nodeId));
                touched.add(depTrait(op.nodeId));
                touched.add(depTrait(op.nodeId, op.trait));
                break;
            }
            case 'addEdge':
            case 'delEdge': {
                touched.add(depNode(op.nodeId));
                touched.add(depEdge(op.nodeId, op.rel));
                break;
            }
            case 'insertOrderedEdge':
            case 'moveOrderedEdge':
            case 'removeOrderedEdge': {
                touched.add(depNode(op.nodeId));
                touched.add(depOrderedEdge(op.nodeId, op.rel));
                touched.add(depEdge(op.nodeId, op.rel));
                break;
            }
            case 'createNode': {
                touched.add(depAllNodes());
                touched.add(depNode(op.node.id));
                if (op.node.type) {
                    touched.add(depNodeType(op.node.type));
                }
                if (op.replaced?.type) {
                    touched.add(depNodeType(op.replaced.type));
                }
                break;
            }
            case 'deleteNode': {
                touched.add(depAllNodes());
                touched.add(depNode(op.nodeId));
                if (op.snapshot?.type) {
                    touched.add(depNodeType(op.snapshot.type));
                }
                break;
            }
            default: {
                assertNever(op);
            }
        }
    }
    return touched;
}
function assertNever(value) {
    throw new Error(`Unknown patch operation while extracting touched keys: ${JSON.stringify(value)}`);
}
//# sourceMappingURL=depKeys.js.map