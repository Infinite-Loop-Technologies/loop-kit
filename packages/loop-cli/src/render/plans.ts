import pc from 'picocolors';
import type { PatchPlan } from '@loop-kit/loop-contracts';
import type { PatchExecutionResult } from '@loop-kit/loop-kernel';

export function renderPlan(plan: PatchPlan): string {
    return `${pc.bold(plan.title)} (${plan.id})\noperations: ${plan.operations.length}`;
}

export function renderExecution(execution: PatchExecutionResult): string {
    const status = execution.applied ? pc.green('applied') : pc.yellow('dry-run/no-op');
    return `${status} changedFiles=${execution.changedFiles.length}`;
}
