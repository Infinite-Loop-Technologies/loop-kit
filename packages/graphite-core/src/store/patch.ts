import type { NodeId } from '../types/ids.js';
import {
    type GraphNodeSnapshot,
    GraphStore,
    toNodeSnapshot,
} from './graphStore.js';

export type SetPropOp = {
    kind: 'setProp';
    nodeId: NodeId;
    key: string;
    value: unknown;
    prev?: unknown;
    hadPrev?: boolean;
};

export type DelPropOp = {
    kind: 'delProp';
    nodeId: NodeId;
    key: string;
    prev?: unknown;
    hadPrev?: boolean;
};

export type AddTraitOp = {
    kind: 'addTrait';
    nodeId: NodeId;
    trait: string;
    hadTrait?: boolean;
};

export type DelTraitOp = {
    kind: 'delTrait';
    nodeId: NodeId;
    trait: string;
    hadTrait?: boolean;
};

export type AddEdgeOp = {
    kind: 'addEdge';
    nodeId: NodeId;
    rel: string;
    to: NodeId;
    hadEdge?: boolean;
};

export type DelEdgeOp = {
    kind: 'delEdge';
    nodeId: NodeId;
    rel: string;
    to: NodeId;
    hadEdge?: boolean;
};

export type InsertOrderedEdgeOp = {
    kind: 'insertOrderedEdge';
    nodeId: NodeId;
    rel: string;
    to: NodeId;
    index?: number;
    appliedIndex?: number;
};

export type MoveOrderedEdgeOp = {
    kind: 'moveOrderedEdge';
    nodeId: NodeId;
    rel: string;
    to: NodeId;
    toIndex: number;
    fromIndex?: number;
};

export type RemoveOrderedEdgeOp = {
    kind: 'removeOrderedEdge';
    nodeId: NodeId;
    rel: string;
    to: NodeId;
    index?: number;
    removedIndex?: number;
};

export type CreateNodeOp = {
    kind: 'createNode';
    node: GraphNodeSnapshot;
    replaced?: GraphNodeSnapshot;
};

export type DeleteNodeOp = {
    kind: 'deleteNode';
    nodeId: NodeId;
    snapshot?: GraphNodeSnapshot;
};

export type PatchOp =
    | SetPropOp
    | DelPropOp
    | AddTraitOp
    | DelTraitOp
    | AddEdgeOp
    | DelEdgeOp
    | InsertOrderedEdgeOp
    | MoveOrderedEdgeOp
    | RemoveOrderedEdgeOp
    | CreateNodeOp
    | DeleteNodeOp;

export type Patch = {
    ops: PatchOp[];
};

export type ApplyPatchResult = {
    appliedPatch: Patch;
    inversePatch: Patch;
};

export function createPatch(ops: PatchOp[] = []): Patch {
    return { ops };
}

export function appendPatch(base: Patch, next: Patch): Patch {
    return {
        ops: [...base.ops, ...next.ops],
    };
}

export function applyPatch(store: GraphStore, patch: Patch): ApplyPatchResult {
    const appliedOps: PatchOp[] = [];

    for (const op of patch.ops) {
        appliedOps.push(applyOp(store, op));
    }

    const appliedPatch = { ops: appliedOps };
    const inversePatch = invertPatch(appliedPatch);
    return { appliedPatch, inversePatch };
}

export function invertPatch(patch: Patch): Patch {
    const inverseOps: PatchOp[] = [];

    for (let index = patch.ops.length - 1; index >= 0; index -= 1) {
        const op = patch.ops[index];
        inverseOps.push(invertOp(op));
    }

    return { ops: inverseOps };
}

function applyOp(store: GraphStore, op: PatchOp): PatchOp {
    switch (op.kind) {
        case 'setProp': {
            const hadPrev = store.hasProp(op.nodeId, op.key);
            const prev = store.getProp(op.nodeId, op.key);
            store.setProp(op.nodeId, op.key, op.value);
            return { ...op, hadPrev, prev };
        }
        case 'delProp': {
            const hadPrev = store.hasProp(op.nodeId, op.key);
            const prev = store.getProp(op.nodeId, op.key);
            store.deleteProp(op.nodeId, op.key);
            return { ...op, hadPrev, prev };
        }
        case 'addTrait': {
            const hadTrait = store.hasTrait(op.nodeId, op.trait);
            store.addTrait(op.nodeId, op.trait);
            return { ...op, hadTrait };
        }
        case 'delTrait': {
            const hadTrait = store.hasTrait(op.nodeId, op.trait);
            store.deleteTrait(op.nodeId, op.trait);
            return { ...op, hadTrait };
        }
        case 'addEdge': {
            const hadEdge = store.getEdges(op.nodeId, op.rel).includes(op.to);
            store.addEdge(op.nodeId, op.rel, op.to);
            return { ...op, hadEdge };
        }
        case 'delEdge': {
            const hadEdge = store.deleteEdge(op.nodeId, op.rel, op.to);
            return { ...op, hadEdge };
        }
        case 'insertOrderedEdge': {
            const appliedIndex = store.insertOrderedEdge(op.nodeId, op.rel, op.to, op.index);
            return { ...op, appliedIndex };
        }
        case 'moveOrderedEdge': {
            const fromIndex = store.moveOrderedEdge(op.nodeId, op.rel, op.to, op.toIndex);
            return { ...op, fromIndex };
        }
        case 'removeOrderedEdge': {
            const removedIndex = store.removeOrderedEdge(op.nodeId, op.rel, op.to);
            return { ...op, removedIndex };
        }
        case 'createNode': {
            const replaced = store.getNodeMutable(op.node.id)
                ? toNodeSnapshot(store.getNodeMutable(op.node.id)!)
                : undefined;
            store.createNode(op.node);
            return { ...op, replaced };
        }
        case 'deleteNode': {
            const snapshot = store.deleteNode(op.nodeId);
            return { ...op, snapshot };
        }
        default: {
            assertNever(op);
        }
    }
}

function invertOp(op: PatchOp): PatchOp {
    switch (op.kind) {
        case 'setProp': {
            if (op.hadPrev) {
                return {
                    kind: 'setProp',
                    nodeId: op.nodeId,
                    key: op.key,
                    value: op.prev,
                };
            }

            return {
                kind: 'delProp',
                nodeId: op.nodeId,
                key: op.key,
            };
        }
        case 'delProp': {
            if (op.hadPrev) {
                return {
                    kind: 'setProp',
                    nodeId: op.nodeId,
                    key: op.key,
                    value: op.prev,
                };
            }

            return {
                kind: 'delProp',
                nodeId: op.nodeId,
                key: op.key,
            };
        }
        case 'addTrait': {
            if (op.hadTrait) {
                return {
                    kind: 'addTrait',
                    nodeId: op.nodeId,
                    trait: op.trait,
                };
            }

            return {
                kind: 'delTrait',
                nodeId: op.nodeId,
                trait: op.trait,
            };
        }
        case 'delTrait': {
            if (op.hadTrait) {
                return {
                    kind: 'addTrait',
                    nodeId: op.nodeId,
                    trait: op.trait,
                };
            }

            return {
                kind: 'delTrait',
                nodeId: op.nodeId,
                trait: op.trait,
            };
        }
        case 'addEdge': {
            if (op.hadEdge) {
                return {
                    kind: 'addEdge',
                    nodeId: op.nodeId,
                    rel: op.rel,
                    to: op.to,
                };
            }

            return {
                kind: 'delEdge',
                nodeId: op.nodeId,
                rel: op.rel,
                to: op.to,
            };
        }
        case 'delEdge': {
            if (op.hadEdge) {
                return {
                    kind: 'addEdge',
                    nodeId: op.nodeId,
                    rel: op.rel,
                    to: op.to,
                };
            }

            return {
                kind: 'delEdge',
                nodeId: op.nodeId,
                rel: op.rel,
                to: op.to,
            };
        }
        case 'insertOrderedEdge': {
            return {
                kind: 'removeOrderedEdge',
                nodeId: op.nodeId,
                rel: op.rel,
                to: op.to,
                index: op.appliedIndex,
            };
        }
        case 'moveOrderedEdge': {
            if (op.fromIndex === undefined) {
                return {
                    kind: 'moveOrderedEdge',
                    nodeId: op.nodeId,
                    rel: op.rel,
                    to: op.to,
                    toIndex: op.toIndex,
                };
            }

            return {
                kind: 'moveOrderedEdge',
                nodeId: op.nodeId,
                rel: op.rel,
                to: op.to,
                toIndex: op.fromIndex,
            };
        }
        case 'removeOrderedEdge': {
            return {
                kind: 'insertOrderedEdge',
                nodeId: op.nodeId,
                rel: op.rel,
                to: op.to,
                index: op.removedIndex ?? op.index,
            };
        }
        case 'createNode': {
            if (op.replaced) {
                return { kind: 'createNode', node: op.replaced };
            }

            return {
                kind: 'deleteNode',
                nodeId: op.node.id,
            };
        }
        case 'deleteNode': {
            if (!op.snapshot) {
                return {
                    kind: 'deleteNode',
                    nodeId: op.nodeId,
                };
            }

            return {
                kind: 'createNode',
                node: op.snapshot,
            };
        }
        default: {
            assertNever(op);
        }
    }
}

function assertNever(value: never): never {
    throw new Error(`Unexpected patch operation: ${JSON.stringify(value)}`);
}
