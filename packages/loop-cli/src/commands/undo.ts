import { createKernel } from '@loop-kit/loop-kernel';
import { renderExecution } from '../render/plans.js';

export async function handleUndo(
    undoId: string,
    options: {
        cwd?: string;
        dryRun?: boolean;
        json?: boolean;
    },
): Promise<void> {
    const kernel = createKernel({ workspaceRoot: options.cwd });
    const result = await kernel.undo(undoId, {
        dryRun: options.dryRun,
    });
    if (!result.ok) {
        throw new Error(result.error.message);
    }

    if (options.json) {
        console.log(JSON.stringify(result.value, null, 2));
        return;
    }

    console.log(`undoId=${result.value.undoId}`);
    console.log(`plan=${result.value.entry.planId}`);
    console.log(renderExecution(result.value.execution));
}
