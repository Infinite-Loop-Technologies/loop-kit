import { createKernel } from '@loop-kit/loop-kernel';
import { renderExecution } from '../render/plans.js';

export async function handleAdopt(
    installedRef: string,
    options: {
        cwd?: string;
        as: string;
        dryRun?: boolean;
        json?: boolean;
    },
): Promise<void> {
    const kernel = createKernel({ workspaceRoot: options.cwd });
    const result = await kernel.adopt(installedRef, options.as, {
        dryRun: options.dryRun,
    });
    if (!result.ok) {
        throw new Error(result.error.message);
    }

    if (options.json) {
        console.log(JSON.stringify(result.value, null, 2));
        return;
    }

    console.log(`component=${result.value.componentId}`);
    console.log(`source=${result.value.sourceInstallRef}`);
    console.log(`preview=${result.value.previewPath}`);
    if (result.value.undoId) {
        console.log(`undo=${result.value.undoId}`);
    }
    console.log(renderExecution(result.value.execution));
}
