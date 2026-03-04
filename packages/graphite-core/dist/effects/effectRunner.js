import { effectOrigin, shouldSkipEffectForOrigin } from './effectTypes.js';
export class EffectRunner {
    commitController;
    options;
    effects = new Map();
    unsubscribeCommit;
    constructor(commitController, options = {}) {
        this.commitController = commitController;
        this.options = options;
    }
    registerEffect(effect) {
        this.effects.set(effect.name, effect);
        return () => {
            this.effects.delete(effect.name);
        };
    }
    start() {
        if (this.unsubscribeCommit) {
            return;
        }
        this.unsubscribeCommit = this.commitController.subscribe((commit) => {
            this.handleCommit(commit);
        });
    }
    stop() {
        this.unsubscribeCommit?.();
        this.unsubscribeCommit = undefined;
    }
    handleCommit(commit) {
        for (const effect of this.effects.values()) {
            if (shouldSkipEffectForOrigin(effect, commit.meta.origin)) {
                continue;
            }
            const started = performance.now();
            effect.onCommit(commit, {
                commit: (patch, meta = {}) => this.commitController.commit(patch, {
                    ...meta,
                    origin: meta.origin ?? effectOrigin(effect.name),
                }),
            });
            this.options.metrics?.increment('effect.run');
            this.options.metrics?.onEffectTime(performance.now() - started);
        }
    }
}
//# sourceMappingURL=effectRunner.js.map