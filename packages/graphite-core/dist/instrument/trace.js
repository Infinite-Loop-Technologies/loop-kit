export class TraceCollector {
    spans = [];
    startSpan(name) {
        const startMs = performance.now();
        return () => {
            const endMs = performance.now();
            const span = {
                name,
                startMs,
                endMs,
                durationMs: endMs - startMs,
            };
            this.spans.push(span);
            return span;
        };
    }
    listSpans() {
        return this.spans;
    }
    clear() {
        this.spans = [];
    }
}
//# sourceMappingURL=trace.js.map