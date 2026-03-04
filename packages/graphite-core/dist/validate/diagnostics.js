export function diagnostic(code, message, severity = 'warning', details = {}) {
    return {
        code,
        message,
        severity,
        ...details,
    };
}
export function diagnosticsByFacet(diagnostics) {
    const grouped = new Map();
    for (const item of diagnostics) {
        const facet = item.facet ?? 'global';
        let bucket = grouped.get(facet);
        if (!bucket) {
            bucket = [];
            grouped.set(facet, bucket);
        }
        bucket.push(item);
    }
    return grouped;
}
//# sourceMappingURL=diagnostics.js.map