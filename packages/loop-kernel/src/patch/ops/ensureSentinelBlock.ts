import type { EnsureSentinelBlockOperation, OperationResult } from '@loop-kit/loop-contracts';
import { trimTrailingNewline } from '../../utils/text.js';
import type { OperationHandler } from './runtime.js';

function blockMarkers(id: string): { begin: string; end: string } {
    return {
        begin: `// loop:begin ${id}`,
        end: `// loop:end ${id}`,
    };
}

export const ensureSentinelBlockHandler: OperationHandler<EnsureSentinelBlockOperation> = async (
    operation,
    runtime,
): Promise<OperationResult> => {
    const markers = blockMarkers(operation.sentinelId);
    const current = (await runtime.readCurrentContent(operation.path)) ?? '';

    const beginIndex = current.indexOf(markers.begin);
    const endIndex = current.indexOf(markers.end);
    const block = `${markers.begin}\n${trimTrailingNewline(operation.content)}${markers.end}\n`;

    let next = current;
    if (beginIndex >= 0 && endIndex > beginIndex) {
        if (operation.mode === 'append') {
            return {
                opId: operation.opId,
                status: 'noop',
                changedFiles: [],
                diagnostics: [],
            };
        }

        const replaceUntil = endIndex + markers.end.length;
        next = `${current.slice(0, beginIndex)}${block}${current.slice(replaceUntil)}`;
    } else {
        const separator = next.endsWith('\n') || next.length === 0 ? '' : '\n';
        next = `${next}${separator}${block}`;
    }

    next = trimTrailingNewline(next);
    if (next === current) {
        return {
            opId: operation.opId,
            status: 'noop',
            changedFiles: [],
            diagnostics: [],
        };
    }

    await runtime.setFileContent(operation.path, next);

    return {
        opId: operation.opId,
        status: 'applied',
        changedFiles: [operation.path],
        diagnostics: [],
    };
};
