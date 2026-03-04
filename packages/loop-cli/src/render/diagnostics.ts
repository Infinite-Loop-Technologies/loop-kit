import pc from 'picocolors';
import type { Diagnostic } from '@loop-kit/loop-contracts';

export function renderDiagnostics(diagnostics: Diagnostic[]): string {
    if (diagnostics.length === 0) {
        return pc.green('No diagnostics.');
    }

    return diagnostics
        .map((diagnostic) => {
            const sev =
                diagnostic.severity === 'error'
                    ? pc.red(diagnostic.severity)
                    : diagnostic.severity === 'warning'
                        ? pc.yellow(diagnostic.severity)
                        : pc.cyan(diagnostic.severity);
            return `${sev} ${diagnostic.id}: ${diagnostic.message}`;
        })
        .join('\n');
}
