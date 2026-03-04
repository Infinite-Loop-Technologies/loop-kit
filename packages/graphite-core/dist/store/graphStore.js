export class GraphStore {
    nodes = new Map();
    _version = 0;
    constructor(seed) {
        if (!seed) {
            return;
        }
        for (const snapshot of seed) {
            this.nodes.set(snapshot.id, toNodeRecord(snapshot));
        }
    }
    get version() {
        return this._version;
    }
    bumpVersion() {
        this._version += 1;
        return this._version;
    }
    setVersion(version) {
        this._version = version;
    }
    clone() {
        const clone = new GraphStore();
        clone._version = this._version;
        for (const [id, node] of this.nodes) {
            clone.nodes.set(id, cloneNode(node));
        }
        return clone;
    }
    replaceFrom(other) {
        this.nodes = other.clone().nodes;
        this._version = other._version;
    }
    hasNode(id) {
        return this.nodes.has(id);
    }
    getNode(id) {
        const node = this.nodes.get(id);
        if (!node) {
            return undefined;
        }
        return node;
    }
    getNodeMutable(id) {
        return this.nodes.get(id);
    }
    upsertNode(id, type) {
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
    createNode(snapshot) {
        this.nodes.set(snapshot.id, toNodeRecord(snapshot));
    }
    deleteNode(id) {
        const node = this.nodes.get(id);
        if (!node) {
            return undefined;
        }
        this.nodes.delete(id);
        return toNodeSnapshot(node);
    }
    listNodeIds() {
        return Array.from(this.nodes.keys());
    }
    nodesByType(type) {
        const ids = [];
        for (const node of this.nodes.values()) {
            if (node.type === type) {
                ids.push(node.id);
            }
        }
        return ids;
    }
    getProp(id, key) {
        return this.nodes.get(id)?.props.get(key);
    }
    hasProp(id, key) {
        return this.nodes.get(id)?.props.has(key) ?? false;
    }
    getProps(id) {
        return this.nodes.get(id)?.props;
    }
    setProp(id, key, value) {
        const node = this.upsertNode(id);
        node.props.set(key, value);
    }
    deleteProp(id, key) {
        const node = this.nodes.get(id);
        if (!node) {
            return false;
        }
        return node.props.delete(key);
    }
    hasTrait(id, trait) {
        return this.nodes.get(id)?.traits.has(trait) ?? false;
    }
    getTraits(id) {
        return Array.from(this.nodes.get(id)?.traits ?? []);
    }
    addTrait(id, trait) {
        const node = this.upsertNode(id);
        node.traits.add(trait);
    }
    deleteTrait(id, trait) {
        const node = this.nodes.get(id);
        if (!node) {
            return false;
        }
        return node.traits.delete(trait);
    }
    getEdges(id, rel) {
        const set = this.nodes.get(id)?.edges.get(rel);
        if (!set) {
            return [];
        }
        return Array.from(set);
    }
    addEdge(id, rel, to) {
        const node = this.upsertNode(id);
        let set = node.edges.get(rel);
        if (!set) {
            set = new Set();
            node.edges.set(rel, set);
        }
        set.add(to);
    }
    deleteEdge(id, rel, to) {
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
    getOrderedEdges(id, rel) {
        const edges = this.nodes.get(id)?.orderedEdges.get(rel);
        return edges ? [...edges] : [];
    }
    insertOrderedEdge(id, rel, to, index) {
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
    moveOrderedEdge(id, rel, to, toIndex) {
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
    removeOrderedEdge(id, rel, to) {
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
    toSnapshots() {
        return Array.from(this.nodes.values()).map(toNodeSnapshot);
    }
}
export function toNodeSnapshot(node) {
    const props = {};
    for (const [key, value] of node.props) {
        props[key] = value;
    }
    const edges = {};
    for (const [rel, set] of node.edges) {
        edges[rel] = Array.from(set);
    }
    const orderedEdges = {};
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
export function toNodeRecord(snapshot) {
    return {
        id: snapshot.id,
        type: snapshot.type,
        props: new Map(Object.entries(snapshot.props)),
        traits: new Set(snapshot.traits),
        edges: new Map(Object.entries(snapshot.edges).map(([rel, values]) => [rel, new Set(values)])),
        orderedEdges: new Map(Object.entries(snapshot.orderedEdges).map(([rel, values]) => [rel, [...values]])),
    };
}
function cloneNode(node) {
    return {
        id: node.id,
        type: node.type,
        props: new Map(node.props),
        traits: new Set(node.traits),
        edges: new Map(Array.from(node.edges.entries()).map(([rel, values]) => [rel, new Set(values)])),
        orderedEdges: new Map(Array.from(node.orderedEdges.entries()).map(([rel, values]) => [rel, [...values]])),
    };
}
function normalizeIndex(index, length) {
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
//# sourceMappingURL=graphStore.js.map