import type { CommitMeta, CommitResult } from '../store/commit.js';
import type { Patch } from '../store/patch.js';
export type EffectContext = {
    commit: (patch: Patch, meta?: CommitMeta) => CommitResult;
};
export type EffectOriginGuard = {
    ignoreOwnOrigin?: boolean;
    ignoreOrigins?: string[];
};
export type CommitEffect = {
    name: string;
    guard?: EffectOriginGuard;
    onCommit: (commit: CommitResult, context: EffectContext) => void;
};
export declare function shouldSkipEffectForOrigin(effect: CommitEffect, origin: string | undefined): boolean;
export declare function effectOrigin(name: string): string;
//# sourceMappingURL=effectTypes.d.ts.map