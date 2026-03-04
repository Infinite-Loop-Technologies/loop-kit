import type { NodeId } from '../types/ids.js';
import type { GraphStore } from '../store/graphStore.js';
export declare class TypeIndex {
    private index;
    rebuild(store: GraphStore): void;
    get(type: string): readonly NodeId[];
}
//# sourceMappingURL=indices.d.ts.map