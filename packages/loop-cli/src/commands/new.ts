import { createKernel } from '@loop-kit/loop-kernel';
import { renderExecution, renderPlan } from '../render/plans.js';

export async function handleNewApp(name: string, options: { cwd?: string; template?: string; dryRun?: boolean }): Promise<void> {
    const kernel = createKernel({ workspaceRoot: options.cwd });
    const result = await kernel.newApp(name, { template: options.template, dryRun: options.dryRun });
    if (!result.ok) {
        throw new Error(result.error.message);
    }

    console.log(renderPlan(result.value.plan));
    console.log(renderExecution(result.value.execution));
}

export async function handleNewPkg(name: string, options: { cwd?: string; template?: string; dryRun?: boolean }): Promise<void> {
    const kernel = createKernel({ workspaceRoot: options.cwd });
    const result = await kernel.newPkg(name, { template: options.template, dryRun: options.dryRun });
    if (!result.ok) {
        throw new Error(result.error.message);
    }

    console.log(renderPlan(result.value.plan));
    console.log(renderExecution(result.value.execution));
}
