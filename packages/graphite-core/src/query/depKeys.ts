import type { NodeId } from '../types/ids.js';
import type { Patch } from '../store/patch.js';

const SEP = '|';

export function depAllNodes(): string {
    return `all${SEP}nodes`;
}

export function depNode(id: NodeId): string {
    return `node${SEP}${id}`;
}

export function depNodeType(type: string): string {
    return `type${SEP}${type}`;
}

export function depProp(id: NodeId, key: string): string {
    return `prop${SEP}${id}${SEP}${key}`;
}

export function depTrait(id: NodeId, trait?: string): string {
    return trait ? `trait${SEP}${id}${SEP}${trait}` : `trait${SEP}${id}`;
}

export function depEdge(id: NodeId, rel: string): string {
    return `edge${SEP}${id}${SEP}${rel}`;
}

export function depOrderedEdge(id: NodeId, rel: string): string {
    return `ordered${SEP}${id}${SEP}${rel}`;
}

export function extractTouchedKeysFromPatch(patch: Patch): Set<string> {
    const touched = new Set<string>();

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

function assertNever(value: never): never {
    throw new Error(`Unknown patch operation while extracting touched keys: ${JSON.stringify(value)}`);
}
