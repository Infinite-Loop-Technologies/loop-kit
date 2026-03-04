import type { NodeId } from '../types/ids.js';
import { type GraphNodeSnapshot, GraphStore } from './graphStore.js';
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
export type PatchOp = SetPropOp | DelPropOp | AddTraitOp | DelTraitOp | AddEdgeOp | DelEdgeOp | InsertOrderedEdgeOp | MoveOrderedEdgeOp | RemoveOrderedEdgeOp | CreateNodeOp | DeleteNodeOp;
export type Patch = {
    ops: PatchOp[];
};
export type ApplyPatchResult = {
    appliedPatch: Patch;
    inversePatch: Patch;
};
export declare function createPatch(ops?: PatchOp[]): Patch;
export declare function appendPatch(base: Patch, next: Patch): Patch;
export declare function applyPatch(store: GraphStore, patch: Patch): ApplyPatchResult;
export declare function invertPatch(patch: Patch): Patch;
//# sourceMappingURL=patch.d.ts.map