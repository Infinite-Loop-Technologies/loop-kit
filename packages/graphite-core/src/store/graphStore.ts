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

export class GraphStore {
    private nodes = new Map<NodeId, GraphNodeRecord>();
    private _version = 0;

    constructor(seed?: GraphNodeSnapshot[]) {
        if (!seed) {
            return;
        }

        for (const snapshot of seed) {
            this.nodes.set(snapshot.id, toNodeRecord(snapshot));
        }
    }

    get version(): number {
        return this._version;
    }

    bumpVersion(): number {
        this._version += 1;
        return this._version;
    }

    setVersion(version: number): void {
        this._version = version;
    }

    clone(): GraphStore {
        const clone = new GraphStore();
        clone._version = this._version;

        for (const [id, node] of this.nodes) {
            clone.nodes.set(id, cloneNode(node));
        }

        return clone;
    }

    replaceFrom(other: GraphStore): void {
        this.nodes = other.clone().nodes;
        this._version = other._version;
    }

    hasNode(id: NodeId): boolean {
        return this.nodes.has(id);
    }

    getNode(id: NodeId): ReadonlyGraphNode | undefined {
        const node = this.nodes.get(id);

        if (!node) {
            return undefined;
        }

        return node;
    }

    getNodeMutable(id: NodeId): GraphNodeRecord | undefined {
        return this.nodes.get(id);
    }

    upsertNode(id: NodeId, type?: string): GraphNodeRecord {
        let node = this.nodes.get(id);

        if (!node) {
            node = {
                id,
                type,
                props: new Map(),
                traits: new Set(),
                edges: new Map(),
                orderedEdges: new Map(),
            };
            this.nodes.set(id, node);
            return node;
        }

        if (type !== undefined) {
            node.type = type;
        }

        return node;
    }

    createNode(snapshot: GraphNodeSnapshot): void {
        this.nodes.set(snapshot.id, toNodeRecord(snapshot));
    }

    deleteNode(id: NodeId): GraphNodeSnapshot | undefined {
        const node = this.nodes.get(id);

        if (!node) {
            return undefined;
        }

        this.nodes.delete(id);

        return toNodeSnapshot(node);
    }

    listNodeIds(): NodeId[] {
        return Array.from(this.nodes.keys());
    }

    nodesByType(type: string): NodeId[] {
        const ids: NodeId[] = [];

        for (const node of this.nodes.values()) {
            if (node.type === type) {
                ids.push(node.id);
            }
        }

        return ids;
    }

    getProp(id: NodeId, key: string): unknown {
        return this.nodes.get(id)?.props.get(key);
    }

    hasProp(id: NodeId, key: string): boolean {
        return this.nodes.get(id)?.props.has(key) ?? false;
    }

    getProps(id: NodeId): ReadonlyMap<string, unknown> | undefined {
        return this.nodes.get(id)?.props;
    }

    setProp(id: NodeId, key: string, value: unknown): void {
        const node = this.upsertNode(id);
        node.props.set(key, value);
    }

    deleteProp(id: NodeId, key: string): boolean {
        const node = this.nodes.get(id);

        if (!node) {
            return false;
        }

        return node.props.delete(key);
    }

    hasTrait(id: NodeId, trait: string): boolean {
        return this.nodes.get(id)?.traits.has(trait) ?? false;
    }

    getTraits(id: NodeId): readonly string[] {
        return Array.from(this.nodes.get(id)?.traits ?? []);
    }

    addTrait(id: NodeId, trait: string): void {
        const node = this.upsertNode(id);
        node.traits.add(trait);
    }

    deleteTrait(id: NodeId, trait: string): boolean {
        const node = this.nodes.get(id);

        if (!node) {
            return false;
        }

        return node.traits.delete(trait);
    }

    getEdges(id: NodeId, rel: string): readonly NodeId[] {
        const set = this.nodes.get(id)?.edges.get(rel);
        if (!set) {
            return [];
        }

        return Array.from(set);
    }

    addEdge(id: NodeId, rel: string, to: NodeId): void {
        const node = this.upsertNode(id);
        let set = node.edges.get(rel);
        if (!set) {
            set = new Set<NodeId>();
            node.edges.set(rel, set);
        }

        set.add(to);
    }

    deleteEdge(id: NodeId, rel: string, to: NodeId): boolean {
        const node = this.nodes.get(id);
        const set = node?.edges.get(rel);
        if (!set) {
            return false;
        }

        const existed = set.delete(to);
        if (set.size === 0) {
            node?.edges.delete(rel);
        }
        return existed;
    }

    getOrderedEdges(id: NodeId, rel: string): readonly NodeId[] {
        const edges = this.nodes.get(id)?.orderedEdges.get(rel);
        return edges ? [...edges] : [];
    }

    insertOrderedEdge(id: NodeId, rel: string, to: NodeId, index?: number): number {
        const node = this.upsertNode(id);
        let edges = node.orderedEdges.get(rel);
        if (!edges) {
            edges = [];
            node.orderedEdges.set(rel, edges);
        }

        const normalizedIndex = normalizeIndex(index, edges.length);
        edges.splice(normalizedIndex, 0, to);
        return normalizedIndex;
    }

    moveOrderedEdge(id: NodeId, rel: string, to: NodeId, toIndex: number): number | undefined {
        const node = this.nodes.get(id);
        const edges = node?.orderedEdges.get(rel);
        if (!edges) {
            return undefined;
        }

        const fromIndex = edges.indexOf(to);
        if (fromIndex === -1) {
            return undefined;
        }

        edges.splice(fromIndex, 1);
        const normalizedIndex = normalizeIndex(toIndex, edges.length);
        edges.splice(normalizedIndex, 0, to);
        return fromIndex;
    }

    removeOrderedEdge(id: NodeId, rel: string, to: NodeId): number | undefined {
        const node = this.nodes.get(id);
        const edges = node?.orderedEdges.get(rel);
        if (!edges) {
            return undefined;
        }

        const index = edges.indexOf(to);
        if (index === -1) {
            return undefined;
        }

        edges.splice(index, 1);
        if (edges.length === 0) {
            node?.orderedEdges.delete(rel);
        }
        return index;
    }

    toSnapshots(): GraphNodeSnapshot[] {
        return Array.from(this.nodes.values()).map(toNodeSnapshot);
    }
}

export function toNodeSnapshot(node: GraphNodeRecord): GraphNodeSnapshot {
    const props: Record<string, unknown> = {};
    for (const [key, value] of node.props) {
        props[key] = value;
    }

    const edges: Record<string, NodeId[]> = {};
    for (const [rel, set] of node.edges) {
        edges[rel] = Array.from(set);
    }

    const orderedEdges: Record<string, NodeId[]> = {};
    for (const [rel, values] of node.orderedEdges) {
        orderedEdges[rel] = [...values];
    }

    return {
        id: node.id,
        type: node.type,
        props,
        traits: Array.from(node.traits),
        edges,
        orderedEdges,
    };
}

export function toNodeRecord(snapshot: GraphNodeSnapshot): GraphNodeRecord {
    return {
        id: snapshot.id,
        type: snapshot.type,
        props: new Map(Object.entries(snapshot.props)),
        traits: new Set(snapshot.traits),
        edges: new Map(
            Object.entries(snapshot.edges).map(([rel, values]) => [rel, new Set<NodeId>(values)]),
        ),
        orderedEdges: new Map(
            Object.entries(snapshot.orderedEdges).map(([rel, values]) => [rel, [...values]]),
        ),
    };
}

function cloneNode(node: GraphNodeRecord): GraphNodeRecord {
    return {
        id: node.id,
        type: node.type,
        props: new Map(node.props),
        traits: new Set(node.traits),
        edges: new Map(
            Array.from(node.edges.entries()).map(([rel, values]) => [rel, new Set(values)]),
        ),
        orderedEdges: new Map(
            Array.from(node.orderedEdges.entries()).map(([rel, values]) => [rel, [...values]]),
        ),
    };
}

function normalizeIndex(index: number | undefined, length: number): number {
    if (index === undefined || Number.isNaN(index)) {
        return length;
    }

    if (index < 0) {
        return 0;
    }

    if (index > length) {
        return length;
    }

    return index;
}
