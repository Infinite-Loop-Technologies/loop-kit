type TimerAggregate = {
    count: number;
    totalMs: number;
    maxMs: number;
};

export class GraphiteMetrics {
    private counters = new Map<string, number>();
    private timers = new Map<string, TimerAggregate>();

    increment(name: string, by = 1): void {
        this.counters.set(name, (this.counters.get(name) ?? 0) + by);
    }

    recordTime(name: string, durationMs: number): void {
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

    onCommitTime(durationMs: number): void {
        this.recordTime('commit.time', durationMs);
    }

    onQueryTime(durationMs: number): void {
        this.recordTime('query.time', durationMs);
    }

    onValidatorTime(durationMs: number): void {
        this.recordTime('validator.time', durationMs);
    }

    onRecognizerTime(durationMs: number): void {
        this.recordTime('recognizer.time', durationMs);
    }

    onOverlayMaterializeTime(durationMs: number): void {
        this.recordTime('overlay.materialize.time', durationMs);
    }

    onEffectTime(durationMs: number): void {
        this.recordTime('effect.time', durationMs);
    }

    getCounter(name: string): number {
        return this.counters.get(name) ?? 0;
    }

    getTimer(name: string): TimerAggregate | undefined {
        const aggregate = this.timers.get(name);
        if (!aggregate) {
            return undefined;
        }

        return { ...aggregate };
    }

    snapshot(): {
        counters: Record<string, number>;
        timers: Record<string, TimerAggregate & { avgMs: number }>;
    } {
        const counters: Record<string, number> = {};
        for (const [name, value] of this.counters) {
            counters[name] = value;
        }

        const timers: Record<string, TimerAggregate & { avgMs: number }> = {};
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
