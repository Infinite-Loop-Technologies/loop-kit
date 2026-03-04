export type TraceSpan = {
    name: string;
    startMs: number;
    endMs: number;
    durationMs: number;
};

export class TraceCollector {
    private spans: TraceSpan[] = [];

    startSpan(name: string): () => TraceSpan {
        const startMs = performance.now();

        return () => {
            const endMs = performance.now();
            const span: TraceSpan = {
                name,
                startMs,
                endMs,
                durationMs: endMs - startMs,
            };

            this.spans.push(span);
            return span;
        };
    }

    listSpans(): readonly TraceSpan[] {
        return this.spans;
    }

    clear(): void {
        this.spans = [];
    }
}
