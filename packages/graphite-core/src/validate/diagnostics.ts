import type { NodeId } from '../types/ids.js';

export type DiagnosticSeverity = 'info' | 'warning' | 'error';

export type Diagnostic = {
    code: string;
    message: string;
    severity: DiagnosticSeverity;
    facet?: string;
    nodeId?: NodeId;
    details?: Record<string, unknown>;
};

export function diagnostic(
    code: string,
    message: string,
    severity: DiagnosticSeverity = 'warning',
    details: Omit<Diagnostic, 'code' | 'message' | 'severity'> = {},
): Diagnostic {
    return {
        code,
        message,
        severity,
        ...details,
    };
}

export function diagnosticsByFacet(
    diagnostics: readonly Diagnostic[],
): Map<string, Diagnostic[]> {
    const grouped = new Map<string, Diagnostic[]>();

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
