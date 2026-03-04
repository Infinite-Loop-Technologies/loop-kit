import type { NodeId } from '../types/ids.js';
export type GraphNodeSnapshot = {
    id: NodeId;
    type?: string;
    props: Record<string, unknown>;
    traits: string[];
    edges: Record<string, NodeId[]>;
    orderedEdges: Record<string, NodeId[]>;
};
export type GraphNodeRecord = {
    id: NodeId;
    type?: string;
    props: Map<string, unknown>;
    traits: Set<string>;
    edges: Map<string, Set<NodeId>>;
    orderedEdges: Map<string, NodeId[]>;
};
export type ReadonlyGraphNode = Readonly<{
    id: NodeId;
    type?: string;
    props: ReadonlyMap<string, unknown>;
    traits: ReadonlySet<string>;
    edges: ReadonlyMap<string, ReadonlySet<NodeId>>;
    orderedEdges: ReadonlyMap<string, readonly NodeId[]>;
}>;
export declare class GraphStore {
    private nodes;
    private _version;
    constructor(seed?: GraphNodeSnapshot[]);
    get version(): number;
    bumpVersion(): number;
    setVersion(version: number): void;
    clone(): GraphStore;
    replaceFrom(other: GraphStore): void;
    hasNode(id: NodeId): boolean;
    getNode(id: NodeId): ReadonlyGraphNode | undefined;
    getNodeMutable(id: NodeId): GraphNodeRecord | undefined;
    upsertNode(id: NodeId, type?: string): GraphNodeRecord;
    createNode(snapshot: GraphNodeSnapshot): void;
    deleteNode(id: NodeId): GraphNodeSnapshot | undefined;
    listNodeIds(): NodeId[];
    nodesByType(type: string): NodeId[];
    getProp(id: NodeId, key: string): unknown;
    hasProp(id: NodeId, key: string): boolean;
    getProps(id: NodeId): ReadonlyMap<string, unknown> | undefined;
    setProp(id: NodeId, key: string, value: unknown): void;
    deleteProp(id: NodeId, key: string): boolean;
    hasTrait(id: NodeId, trait: string): boolean;
    getTraits(id: NodeId): readonly string[];
    addTrait(id: NodeId, trait: string): void;
    deleteTrait(id: NodeId, trait: string): boolean;
    getEdges(id: NodeId, rel: string): readonly NodeId[];
    addEdge(id: NodeId, rel: string, to: NodeId): void;
    deleteEdge(id: NodeId, rel: string, to: NodeId): boolean;
    getOrderedEdges(id: NodeId, rel: string): readonly NodeId[];
    insertOrderedEdge(id: NodeId, rel: string, to: NodeId, index?: number): number;
    moveOrderedEdge(id: NodeId, rel: string, to: NodeId, toIndex: number): number | undefined;
    removeOrderedEdge(id: NodeId, rel: string, to: NodeId): number | undefined;
    toSnapshots(): GraphNodeSnapshot[];
}
export declare function toNodeSnapshot(node: GraphNodeRecord): GraphNodeSnapshot;
export declare function toNodeRecord(snapshot: GraphNodeSnapshot): GraphNodeRecord;
//# sourceMappingURL=graphStore.d.ts.map