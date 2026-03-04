type TimerAggregate = {
    count: number;
    totalMs: number;
    maxMs: number;
};
export declare class GraphiteMetrics {
    private counters;
    private timers;
    increment(name: string, by?: number): void;
    recordTime(name: string, durationMs: number): void;
    onCommitTime(durationMs: number): void;
    onQueryTime(durationMs: number): void;
    onValidatorTime(durationMs: number): void;
    onRecognizerTime(durationMs: number): void;
    onOverlayMaterializeTime(durationMs: number): void;
    onEffectTime(durationMs: number): void;
    getCounter(name: string): number;
    getTimer(name: string): TimerAggregate | undefined;
    snapshot(): {
        counters: Record<string, number>;
        timers: Record<string, TimerAggregate & {
            avgMs: number;
        }>;
    };
}
export {};
//# sourceMappingURL=metrics.d.ts.map