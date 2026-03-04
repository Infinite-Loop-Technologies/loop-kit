export class TypeIndex {
    index = new Map();
    rebuild(store) {
        this.index.clear();
        for (const nodeId of store.listNodeIds()) {
            const node = store.getNode(nodeId);
            if (!node?.type) {
                continue;
            }
            let set = this.index.get(node.type);
            if (!set) {
                set = new Set();
                this.index.set(node.type, set);
            }
            set.add(nodeId);
        }
    }
    get(type) {
        return Array.from(this.index.get(type) ?? []);
    }
}
//# sourceMappingURL=indices.js.map