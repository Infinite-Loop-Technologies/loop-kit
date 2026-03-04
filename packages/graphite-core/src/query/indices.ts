import type { NodeId } from '../types/ids.js';
import type { GraphStore } from '../store/graphStore.js';

export class TypeIndex {
    private index = new Map<string, Set<NodeId>>();

    rebuild(store: GraphStore): void {
        this.index.clear();

        for (const nodeId of store.listNodeIds()) {
            const node = store.getNode(nodeId);
            if (!node?.type) {
                continue;
            }

            let set = this.index.get(node.type);
            if (!set) {
                set = new Set<NodeId>();
                this.index.set(node.type, set);
            }

            set.add(nodeId);
        }
    }

    get(type: string): readonly NodeId[] {
        return Array.from(this.index.get(type) ?? []);
    }
}
