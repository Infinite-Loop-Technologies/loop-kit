export type TraceSpan = {
    name: string;
    startMs: number;
    endMs: number;
    durationMs: number;
};
export declare class TraceCollector {
    private spans;
    startSpan(name: string): () => TraceSpan;
    listSpans(): readonly TraceSpan[];
    clear(): void;
}
//# sourceMappingURL=trace.d.ts.map