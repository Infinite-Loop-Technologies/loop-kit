import type { GraphiteMetrics } from '../instrument/metrics.js';
import type { CommitController } from '../store/commit.js';
import { type CommitEffect } from './effectTypes.js';
export type EffectRunnerOptions = {
    metrics?: GraphiteMetrics;
};
export declare class EffectRunner {
    private readonly commitController;
    private readonly options;
    private readonly effects;
    private unsubscribeCommit?;
    constructor(commitController: CommitController, options?: EffectRunnerOptions);
    registerEffect(effect: CommitEffect): () => void;
    start(): void;
    stop(): void;
    private handleCommit;
}
//# sourceMappingURL=effectRunner.d.ts.map