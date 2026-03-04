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

export function shouldSkipEffectForOrigin(
    effect: CommitEffect,
    origin: string | undefined,
): boolean {
    if (!origin) {
        return false;
    }

    if (effect.guard?.ignoreOwnOrigin && origin === effectOrigin(effect.name)) {
        return true;
    }

    if (effect.guard?.ignoreOrigins?.includes(origin)) {
        return true;
    }

    return false;
}

export function effectOrigin(name: string): string {
    return `effect:${name}`;
}
