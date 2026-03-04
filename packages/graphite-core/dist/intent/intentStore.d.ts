import { GraphStore } from '../store/graphStore.js';
import type { NodeId } from '../types/ids.js';
import type { QueryReadable } from '../query/queryEngine.js';
export type IntentSnapshotReader = QueryReadable & {
    readonly intentVersion: number;
    readonly overlayVersion: number;
};
export declare class IntentStore implements QueryReadable {
    readonly graph: GraphStore;
    constructor(graph?: GraphStore);
    get version(): number;
    hasNode(nodeId: NodeId): boolean;
    getNode(nodeId: NodeId): Readonly<{
        id: NodeId;
        type?: string;
        props: ReadonlyMap<string, unknown>;
        traits: ReadonlySet<string>;
        edges: ReadonlyMap<string, ReadonlySet<NodeId>>;
        orderedEdges: ReadonlyMap<string, readonly NodeId[]>;
    }> | undefined;
    getProp(nodeId: NodeId, key: string): unknown;
    hasTrait(nodeId: NodeId, trait: string): boolean;
    getTraits(nodeId: NodeId): readonly string[];
    getEdges(nodeId: NodeId, rel: string): readonly NodeId[];
    getOrderedEdges(nodeId: NodeId, rel: string): readonly NodeId[];
    nodesByType(type: string): readonly NodeId[];
    listNodeIds(): readonly NodeId[];
    createSnapshotReader(overlayVersion?: number): IntentSnapshotReader;
}
export declare function createSnapshotReader(readable: QueryReadable, intentVersion: number, overlayVersion: number): IntentSnapshotReader;
//# sourceMappingURL=intentStore.d.ts.map