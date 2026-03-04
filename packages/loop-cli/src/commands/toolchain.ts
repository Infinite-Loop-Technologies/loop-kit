import { createKernel } from '@loop-kit/loop-kernel';
import { renderDiagnostics } from '../render/diagnostics.js';
import { renderExecution, renderPlan } from '../render/plans.js';

export async function handleToolchainStatus(options: { cwd?: string; json?: boolean }): Promise<void> {
    const kernel = createKernel({ workspaceRoot: options.cwd });
    const result = await kernel.toolchainStatus();
    if (!result.ok) {
        throw new Error(result.error.message);
    }

    if (options.json) {
        console.log(JSON.stringify(result.value, null, 2));
        return;
    }

    for (const status of result.value) {
        console.log(`${status.id}: ${status.status}`);
        console.log(renderDiagnostics(status.diagnostics));
    }
}

export async function handleToolchainSync(options: { cwd?: string; dryRun?: boolean }): Promise<void> {
    const kernel = createKernel({ workspaceRoot: options.cwd });
    const result = await kernel.toolchainSync({ dryRun: options.dryRun });
    if (!result.ok) {
        throw new Error(result.error.message);
    }

    for (const plan of result.value.plans) {
        console.log(renderPlan(plan));
    }

    for (const execution of result.value.executions) {
        console.log(renderExecution(execution));
    }
}
