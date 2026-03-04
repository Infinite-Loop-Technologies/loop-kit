import {
    GraphStore,
} from '../store/graphStore.js';
import type { NodeId } from '../types/ids.js';
import type { QueryReadable } from '../query/queryEngine.js';

export type IntentSnapshotReader = QueryReadable & {
    readonly intentVersion: number;
    readonly overlayVersion: number;
};

export class IntentStore implements QueryReadable {
    readonly graph: GraphStore;

    constructor(graph?: GraphStore) {
        this.graph = graph ?? new GraphStore();
    }

    get version(): number {
        return this.graph.version;
    }

    hasNode(nodeId: NodeId): boolean {
        return this.graph.hasNode(nodeId);
    }

    getNode(nodeId: NodeId) {
        return this.graph.getNode(nodeId);
    }

    getProp(nodeId: NodeId, key: string): unknown {
        return this.graph.getProp(nodeId, key);
    }

    hasTrait(nodeId: NodeId, trait: string): boolean {
        return this.graph.hasTrait(nodeId, trait);
    }

    getTraits(nodeId: NodeId): readonly string[] {
        return this.graph.getTraits(nodeId);
    }

    getEdges(nodeId: NodeId, rel: string): readonly NodeId[] {
        return this.graph.getEdges(nodeId, rel);
    }

    getOrderedEdges(nodeId: NodeId, rel: string): readonly NodeId[] {
        return this.graph.getOrderedEdges(nodeId, rel);
    }

    nodesByType(type: string): readonly NodeId[] {
        return this.graph.nodesByType(type);
    }

    listNodeIds(): readonly NodeId[] {
        return this.graph.listNodeIds();
    }

    createSnapshotReader(overlayVersion = 0): IntentSnapshotReader {
        return createSnapshotReader(this.graph, this.graph.version, overlayVersion);
    }
}

export function createSnapshotReader(
    readable: QueryReadable,
    intentVersion: number,
    overlayVersion: number,
): IntentSnapshotReader {
    return {
        intentVersion,
        overlayVersion,
        hasNode: (nodeId) => readable.hasNode(nodeId),
        getNode: (nodeId) => readable.getNode(nodeId),
        getProp: (nodeId, key) => readable.getProp(nodeId, key),
        hasTrait: (nodeId, trait) => readable.hasTrait(nodeId, trait),
        getTraits: (nodeId) => readable.getTraits(nodeId),
        getEdges: (nodeId, rel) => readable.getEdges(nodeId, rel),
        getOrderedEdges: (nodeId, rel) => readable.getOrderedEdges(nodeId, rel),
        nodesByType: (type) => readable.nodesByType(type),
        listNodeIds: () => readable.listNodeIds(),
    };
}
