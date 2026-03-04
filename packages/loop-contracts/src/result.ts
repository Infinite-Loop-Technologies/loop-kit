import { z } from 'zod';

export const DiagnosticSeveritySchema = z.enum(['info', 'warning', 'error']);
export type DiagnosticSeverity = z.infer<typeof DiagnosticSeveritySchema>;

export const DiagnosticSchema = z.object({
    id: z.string(),
    severity: DiagnosticSeveritySchema,
    message: z.string(),
    evidence: z.record(z.string(), z.unknown()).optional(),
    suggestedFixIds: z.array(z.string()).optional(),
});
export type Diagnostic = z.infer<typeof DiagnosticSchema>;

export const KernelErrorSchema = z.object({
    code: z.string(),
    message: z.string(),
    details: z.record(z.string(), z.unknown()).optional(),
});
export type KernelError = z.infer<typeof KernelErrorSchema>;

export type Ok<T> = {
    ok: true;
    value: T;
    diagnostics?: Diagnostic[];
};

export type Err<E> = {
    ok: false;
    error: E;
    diagnostics?: Diagnostic[];
};

export type Result<T, E = KernelError> = Ok<T> | Err<E>;

export function ok<T>(value: T, diagnostics?: Diagnostic[]): Ok<T> {
    return { ok: true, value, diagnostics };
}

export function err<E>(error: E, diagnostics?: Diagnostic[]): Err<E> {
    return { ok: false, error, diagnostics };
}
