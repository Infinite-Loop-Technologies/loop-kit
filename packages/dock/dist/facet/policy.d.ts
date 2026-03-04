import type { HitTestResult } from '@loop-kit/graphite-core';
type PolicyRule = {
    regionType: string;
    score: number;
};
export declare function scoreDockDropTarget(hit: HitTestResult | undefined, rules?: readonly PolicyRule[]): number;
export {};
//# sourceMappingURL=policy.d.ts.map