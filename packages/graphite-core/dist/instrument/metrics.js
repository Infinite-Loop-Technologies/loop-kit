export class GraphiteMetrics {
    counters = new Map();
    timers = new Map();
    increment(name, by = 1) {
        this.counters.set(name, (this.counters.get(name) ?? 0) + by);
    }
    recordTime(name, durationMs) {
        const aggregate = this.timers.get(name) ?? {
            count: 0,
            totalMs: 0,
            maxMs: 0,
        };
        aggregate.count += 1;
        aggregate.totalMs += durationMs;
        aggregate.maxMs = Math.max(aggregate.maxMs, durationMs);
        this.timers.set(name, aggregate);
    }
    onCommitTime(durationMs) {
        this.recordTime('commit.time', durationMs);
    }
    onQueryTime(durationMs) {
        this.recordTime('query.time', durationMs);
    }
    onValidatorTime(durationMs) {
        this.recordTime('validator.time', durationMs);
    }
    onRecognizerTime(durationMs) {
        this.recordTime('recognizer.time', durationMs);
    }
    onOverlayMaterializeTime(durationMs) {
        this.recordTime('overlay.materialize.time', durationMs);
    }
    onEffectTime(durationMs) {
        this.recordTime('effect.time', durationMs);
    }
    getCounter(name) {
        return this.counters.get(name) ?? 0;
    }
    getTimer(name) {
        const aggregate = this.timers.get(name);
        if (!aggregate) {
            return undefined;
        }
        return { ...aggregate };
    }
    snapshot() {
        const counters = {};
        for (const [name, value] of this.counters) {
            counters[name] = value;
        }
        const timers = {};
        for (const [name, value] of this.timers) {
            timers[name] = {
                ...value,
                avgMs: value.count === 0 ? 0 : value.totalMs / value.count,
            };
        }
        return {
            counters,
            timers,
        };
    }
}
//# sourceMappingURL=metrics.js.map