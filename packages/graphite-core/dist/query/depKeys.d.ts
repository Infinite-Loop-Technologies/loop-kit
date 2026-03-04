import type { NodeId } from '../types/ids.js';
import type { Patch } from '../store/patch.js';
export declare function depAllNodes(): string;
export declare function depNode(id: NodeId): string;
export declare function depNodeType(type: string): string;
export declare function depProp(id: NodeId, key: string): string;
export declare function depTrait(id: NodeId, trait?: string): string;
export declare function depEdge(id: NodeId, rel: string): string;
export declare function depOrderedEdge(id: NodeId, rel: string): string;
export declare function extractTouchedKeysFromPatch(patch: Patch): Set<string>;
//# sourceMappingURL=depKeys.d.ts.map