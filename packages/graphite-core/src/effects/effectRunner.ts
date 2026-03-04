import type { GraphiteMetrics } from '../instrument/metrics.js';
import type { CommitController, CommitResult } from '../store/commit.js';
import { type CommitEffect, effectOrigin, shouldSkipEffectForOrigin } from './effectTypes.js';

export type EffectRunnerOptions = {
    metrics?: GraphiteMetrics;
};

export class EffectRunner {
    private readonly effects = new Map<string, CommitEffect>();
    private unsubscribeCommit?: () => void;

    constructor(
        private readonly commitController: CommitController,
        private readonly options: EffectRunnerOptions = {},
    ) {}

    registerEffect(effect: CommitEffect): () => void {
        this.effects.set(effect.name, effect);

        return () => {
            this.effects.delete(effect.name);
        };
    }

    start(): void {
        if (this.unsubscribeCommit) {
            return;
        }

        this.unsubscribeCommit = this.commitController.subscribe((commit) => {
            this.handleCommit(commit);
        });
    }

    stop(): void {
        this.unsubscribeCommit?.();
        this.unsubscribeCommit = undefined;
    }

    private handleCommit(commit: CommitResult): void {
        for (const effect of this.effects.values()) {
            if (shouldSkipEffectForOrigin(effect, commit.meta.origin)) {
                continue;
            }

            const started = performance.now();
            effect.onCommit(commit, {
                commit: (patch, meta = {}) =>
                    this.commitController.commit(patch, {
                        ...meta,
                        origin: meta.origin ?? effectOrigin(effect.name),
                    }),
            });

            this.options.metrics?.increment('effect.run');
            this.options.metrics?.onEffectTime(performance.now() - started);
        }
    }
}
