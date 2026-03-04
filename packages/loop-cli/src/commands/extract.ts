import { createKernel } from '@loop-kit/loop-kernel';
import { renderExecution, renderPlan } from '../render/plans.js';

export async function handleExtract(pathArg: string, options: {
    cwd?: string;
    as: string;
    lane?: string;
    relocate?: string | boolean;
    packageToo?: boolean;
    dryRun?: boolean;
}): Promise<void> {
    const kernel = createKernel({ workspaceRoot: options.cwd });
    const result = await kernel.extract(pathArg, options.as, {
        lane: options.lane,
        relocate: options.relocate,
        packageToo: options.packageToo,
        dryRun: options.dryRun,
    });

    if (!result.ok) {
        throw new Error(result.error.message);
    }

    console.log(renderPlan(result.value.plan));
    console.log(renderExecution(result.value.execution));
    console.log(`component=${result.value.componentId} snapshot=${result.value.snapshotId}`);
    if (result.value.undoId) {
        console.log(`undo=${result.value.undoId}`);
    }
}
