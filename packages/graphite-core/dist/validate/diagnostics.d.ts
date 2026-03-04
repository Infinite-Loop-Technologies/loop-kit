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
export declare function diagnostic(code: string, message: string, severity?: DiagnosticSeverity, details?: Omit<Diagnostic, 'code' | 'message' | 'severity'>): Diagnostic;
export declare function diagnosticsByFacet(diagnostics: readonly Diagnostic[]): Map<string, Diagnostic[]>;
//# sourceMappingURL=diagnostics.d.ts.map