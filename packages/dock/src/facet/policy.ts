import type { HitTestResult } from '@loop-kit/graphite-core';

type PolicyRule = {
    regionType: string;
    score: number;
};

const DEFAULT_RULES: PolicyRule[] = [
    { regionType: 'drop-center', score: 100 },
    { regionType: 'drop-left', score: 80 },
    { regionType: 'drop-right', score: 80 },
    { regionType: 'drop-top', score: 80 },
    { regionType: 'drop-bottom', score: 80 },
    { regionType: 'tab', score: 70 },
];

export function scoreDockDropTarget(
    hit: HitTestResult | undefined,
    rules: readonly PolicyRule[] = DEFAULT_RULES,
): number {
    if (!hit) {
        return Number.NEGATIVE_INFINITY;
    }

    const matched = rules.find((rule) => rule.regionType === hit.regionType);
    return matched ? matched.score : Number.NEGATIVE_INFINITY;
}
