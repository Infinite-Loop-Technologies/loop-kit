import { createKernel } from '@loop-kit/loop-kernel';
import { renderExecution } from '../render/plans.js';

export async function handleFix(options: {
    cwd?: string;
    allSafe?: boolean;
    only?: string[];
    dryRun?: boolean;
}): Promise<void> {
    const kernel = createKernel({ workspaceRoot: options.cwd });
    const result = await kernel.fix({
        allSafe: options.allSafe,
        only: options.only,
        dryRun: options.dryRun,
    });

    if (!result.ok) {
        throw new Error(result.error.message);
    }

    for (const execution of result.value.executions) {
        console.log(renderExecution(execution));
    }
}
