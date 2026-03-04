import { createKernel } from '@loop-kit/loop-kernel';
import { renderExecution, renderPlan } from '../render/plans.js';

export async function handleAdd(ref: string, options: { cwd?: string; to?: string; dryRun?: boolean }): Promise<void> {
    const kernel = createKernel({ workspaceRoot: options.cwd });
    const result = await kernel.add(ref, {
        targetPath: options.to,
        dryRun: options.dryRun,
    });

    if (!result.ok) {
        throw new Error(result.error.message);
    }

    console.log(renderPlan(result.value.plan));
    console.log(renderExecution(result.value.execution));
    if (result.value.undoId) {
        console.log(`undo=${result.value.undoId}`);
    }
}

export async function handleUpdate(ref: string, options: { cwd?: string; to?: string; dryRun?: boolean; force?: boolean }): Promise<void> {
    const kernel = createKernel({ workspaceRoot: options.cwd });
    const result = await kernel.update(ref, {
        targetPath: options.to,
        dryRun: options.dryRun,
        force: options.force,
    });

    if (!result.ok) {
        throw new Error(result.error.message);
    }

    console.log(renderPlan(result.value.plan));
    console.log(renderExecution(result.value.execution));
    if (result.value.undoId) {
        console.log(`undo=${result.value.undoId}`);
    }
}

export async function handleDiff(ref: string, options: { cwd?: string; to?: string }): Promise<void> {
    const kernel = createKernel({ workspaceRoot: options.cwd });
    const result = await kernel.diff(ref, {
        targetPath: options.to,
    });

    if (!result.ok) {
        throw new Error(result.error.message);
    }

    console.log(renderPlan(result.value.plan));
    const diffs = Object.entries(result.value.execution.diffByFile);
    if (diffs.length === 0) {
        console.log('No changes.');
        return;
    }

    for (const [file, diff] of diffs) {
        console.log(`--- ${file}`);
        console.log(diff);
    }
}
