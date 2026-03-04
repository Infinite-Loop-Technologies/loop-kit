import { GraphStore, } from '../store/graphStore.js';
export class IntentStore {
    graph;
    constructor(graph) {
        this.graph = graph ?? new GraphStore();
    }
    get version() {
        return this.graph.version;
    }
    hasNode(nodeId) {
        return this.graph.hasNode(nodeId);
    }
    getNode(nodeId) {
        return this.graph.getNode(nodeId);
    }
    getProp(nodeId, key) {
        return this.graph.getProp(nodeId, key);
    }
    hasTrait(nodeId, trait) {
        return this.graph.hasTrait(nodeId, trait);
    }
    getTraits(nodeId) {
        return this.graph.getTraits(nodeId);
    }
    getEdges(nodeId, rel) {
        return this.graph.getEdges(nodeId, rel);
    }
    getOrderedEdges(nodeId, rel) {
        return this.graph.getOrderedEdges(nodeId, rel);
    }
    nodesByType(type) {
        return this.graph.nodesByType(type);
    }
    listNodeIds() {
        return this.graph.listNodeIds();
    }
    createSnapshotReader(overlayVersion = 0) {
        return createSnapshotReader(this.graph, this.graph.version, overlayVersion);
    }
}
export function createSnapshotReader(readable, intentVersion, overlayVersion) {
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
//# sourceMappingURL=intentStore.js.map