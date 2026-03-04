import path from 'node:path';
import process from 'node:process';
import { spawn } from 'node:child_process';
import {
    err,
    ok,
    type LoopWorkspaceConfig,
    type PipelineRunSummary,
    type TaskEvent,
    type TaskRunSummary,
    type Result,
} from '@loop-kit/loop-contracts';

type TaskExecutionOptions = {
    parallel?: boolean;
    onEvent?: (event: TaskEvent) => void;
    env?: Record<string, string>;
};

type TaskGraphExecution = {
    summaries: TaskRunSummary[];
    success: boolean;
    failedTaskId?: string;
};

type TaskNodeState = {
    id: string;
    command: string;
    args: string[];
    cwd: string;
    deps: string[];
    env: Record<string, string>;
};

function nowIso(): string {
    return new Date().toISOString();
}

function resolveExecutable(command: string): string {
    if (process.platform !== 'win32') {
        return command;
    }

    const normalized = command.toLowerCase();
    return command;
}

function shouldUseShell(command: string): boolean {
    if (process.platform !== 'win32') {
        return false;
    }

    const normalized = command.toLowerCase();
    return normalized === 'pnpm'
        || normalized === 'npm'
        || normalized === 'npx'
        || normalized === 'yarn'
        || normalized.endsWith('.cmd');
}

function emit(
    options: TaskExecutionOptions,
    event: TaskEvent,
): void {
    if (options.onEvent) {
        options.onEvent(event);
    }
}

function resolveTaskNodes(
    workspaceRoot: string,
    config: LoopWorkspaceConfig,
    rootTaskIds: string[],
): Result<Map<string, TaskNodeState>> {
    const nodes = new Map<string, TaskNodeState>();
    const visiting = new Set<string>();
    const visited = new Set<string>();

    const visit = (taskId: string): Result<void> => {
        if (visited.has(taskId)) {
            return ok(undefined);
        }

        if (visiting.has(taskId)) {
            return err({
                code: 'task.cycle',
                message: `Task dependency cycle detected at ${taskId}.`,
            });
        }

        const task = config.tasks[taskId];
        if (!task) {
            return err({
                code: 'task.not_found',
                message: `Task not found: ${taskId}`,
            });
        }

        visiting.add(taskId);
        for (const dep of task.deps) {
            const dependencyResult = visit(dep);
            if (!dependencyResult.ok) {
                return dependencyResult;
            }
        }
        visiting.delete(taskId);
        visited.add(taskId);

        nodes.set(taskId, {
            id: taskId,
            command: task.command,
            args: task.args ?? [],
            cwd: path.resolve(workspaceRoot, task.cwd ?? '.'),
            deps: task.deps ?? [],
            env: task.env ?? {},
        });
        return ok(undefined);
    };

    for (const taskId of rootTaskIds) {
        const visitedResult = visit(taskId);
        if (!visitedResult.ok) {
            return visitedResult;
        }
    }

    return ok(nodes);
}

function runOneTask(
    node: TaskNodeState,
    options: TaskExecutionOptions,
): Promise<TaskRunSummary> {
    return new Promise((resolve) => {
        const startedAt = nowIso();
        const startMs = Date.now();
        emit(options, {
            type: 'task.start',
            taskId: node.id,
            command: node.command,
            args: node.args,
            cwd: node.cwd,
            startedAt,
        });

        const executable = resolveExecutable(node.command);
        const useShell = shouldUseShell(executable);
        const child = spawn(executable, node.args, {
            shell: useShell,
            windowsHide: true,
            cwd: node.cwd,
            env: {
                ...process.env,
                ...options.env,
                ...node.env,
            },
        });

        child.stdout?.on('data', (chunk) => {
            emit(options, {
                type: 'task.stdout',
                taskId: node.id,
                chunk: String(chunk),
                at: nowIso(),
            });
        });

        child.stderr?.on('data', (chunk) => {
            emit(options, {
                type: 'task.stderr',
                taskId: node.id,
                chunk: String(chunk),
                at: nowIso(),
            });
        });

        child.on('error', (spawnError) => {
            const finishedAt = nowIso();
            const summary: TaskRunSummary = {
                taskId: node.id,
                command: node.command,
                args: node.args,
                cwd: node.cwd,
                startedAt,
                finishedAt,
                durationMs: Date.now() - startMs,
                success: false,
                exitCode: 1,
            };
            emit(options, {
                type: 'task.stderr',
                taskId: node.id,
                chunk: `${spawnError}\n`,
                at: finishedAt,
            });
            emit(options, {
                type: 'task.finish',
                taskId: node.id,
                command: node.command,
                args: node.args,
                cwd: node.cwd,
                startedAt,
                finishedAt,
                durationMs: summary.durationMs,
                success: false,
                exitCode: 1,
            });
            resolve(summary);
        });

        child.on('close', (code) => {
            const finishedAt = nowIso();
            const exitCode = code ?? 1;
            const summary: TaskRunSummary = {
                taskId: node.id,
                command: node.command,
                args: node.args,
                cwd: node.cwd,
                startedAt,
                finishedAt,
                durationMs: Date.now() - startMs,
                success: exitCode === 0,
                exitCode,
            };
            emit(options, {
                type: 'task.finish',
                taskId: node.id,
                command: node.command,
                args: node.args,
                cwd: node.cwd,
                startedAt,
                finishedAt,
                durationMs: summary.durationMs,
                success: summary.success,
                exitCode,
            });
            resolve(summary);
        });
    });
}

function toRacePromise(
    taskId: string,
    promise: Promise<TaskRunSummary>,
): Promise<{ taskId: string; summary: TaskRunSummary }> {
    return promise.then((summary) => ({ taskId, summary }));
}

export async function executeTaskGraph(
    workspaceRoot: string,
    config: LoopWorkspaceConfig,
    rootTaskIds: string[],
    options: TaskExecutionOptions = {},
): Promise<Result<TaskGraphExecution>> {
    const resolved = resolveTaskNodes(workspaceRoot, config, rootTaskIds);
    if (!resolved.ok) {
        return resolved;
    }

    const nodes = resolved.value;
    const pending = new Set(nodes.keys());
    const summaries: TaskRunSummary[] = [];
    const dependents = new Map<string, string[]>();
    const remainingDeps = new Map<string, number>();

    for (const [taskId, node] of nodes.entries()) {
        remainingDeps.set(taskId, node.deps.length);
        for (const dep of node.deps) {
            const list = dependents.get(dep) ?? [];
            list.push(taskId);
            dependents.set(dep, list);
        }
    }

    const ready: string[] = [];
    for (const [taskId, count] of remainingDeps.entries()) {
        if (count === 0) {
            ready.push(taskId);
        }
    }

    const running = new Map<string, Promise<TaskRunSummary>>();
    const parallel = options.parallel ?? false;
    let failedTaskId: string | undefined;

    while (pending.size > 0 || running.size > 0) {
        while (ready.length > 0 && !failedTaskId && (parallel || running.size === 0)) {
            const nextTaskId = ready.shift();
            if (!nextTaskId) {
                break;
            }

            if (!pending.has(nextTaskId)) {
                continue;
            }

            const node = nodes.get(nextTaskId);
            if (!node) {
                return err({
                    code: 'task.not_found',
                    message: `Task not found: ${nextTaskId}`,
                });
            }

            running.set(nextTaskId, runOneTask(node, options));
        }

        if (running.size === 0) {
            break;
        }

        const raced = await Promise.race(
            Array.from(running.entries()).map(([taskId, promise]) => toRacePromise(taskId, promise)),
        );
        running.delete(raced.taskId);
        pending.delete(raced.taskId);
        summaries.push(raced.summary);

        if (!raced.summary.success && !failedTaskId) {
            failedTaskId = raced.taskId;
        }

        const dependentIds = dependents.get(raced.taskId) ?? [];
        if (!failedTaskId) {
            for (const dependentTaskId of dependentIds) {
                const previous = remainingDeps.get(dependentTaskId) ?? 0;
                const next = Math.max(0, previous - 1);
                remainingDeps.set(dependentTaskId, next);
                if (next === 0) {
                    ready.push(dependentTaskId);
                }
            }
        }
    }

    return ok({
        summaries,
        success: !failedTaskId,
        failedTaskId,
    });
}

export async function runTask(
    workspaceRoot: string,
    config: LoopWorkspaceConfig,
    taskId: string,
    options: TaskExecutionOptions = {},
): Promise<Result<{ summary: TaskRunSummary; tasks: TaskRunSummary[] }>> {
    const result = await executeTaskGraph(workspaceRoot, config, [taskId], options);
    if (!result.ok) {
        return result;
    }

    const summary = result.value.summaries.find((entry) => entry.taskId === taskId);
    if (!summary) {
        return err({
            code: 'task.not_executed',
            message: `Task ${taskId} did not execute because a dependency failed.`,
            details: {
                failedTaskId: result.value.failedTaskId,
            },
        });
    }

    if (!result.value.success) {
        return err({
            code: 'task.failed',
            message: `Task failed: ${result.value.failedTaskId ?? taskId}`,
            details: {
                failedTaskId: result.value.failedTaskId ?? taskId,
                tasks: result.value.summaries,
            },
        });
    }

    return ok({
        summary,
        tasks: result.value.summaries,
    });
}

export async function runPipeline(
    workspaceRoot: string,
    config: LoopWorkspaceConfig,
    pipelineId: string,
    options: TaskExecutionOptions = {},
): Promise<Result<PipelineRunSummary>> {
    const pipeline = config.pipelines[pipelineId];
    if (!pipeline) {
        return err({
            code: 'pipeline.not_found',
            message: `Pipeline not found: ${pipelineId}`,
        });
    }

    const startedAt = nowIso();
    const startMs = Date.now();
    emit(options, {
        type: 'pipeline.start',
        pipelineId,
        taskIds: pipeline.tasks,
        startedAt,
    });

    const runResult = await executeTaskGraph(workspaceRoot, config, pipeline.tasks, options);
    if (!runResult.ok) {
        return runResult;
    }

    const finishedAt = nowIso();
    const summary: PipelineRunSummary = {
        pipelineId,
        taskIds: pipeline.tasks,
        startedAt,
        finishedAt,
        durationMs: Date.now() - startMs,
        success: runResult.value.success,
        failedTaskId: runResult.value.failedTaskId,
        tasks: runResult.value.summaries,
    };

    emit(options, {
        type: 'pipeline.finish',
        pipelineId,
        taskIds: pipeline.tasks,
        startedAt,
        finishedAt,
        durationMs: summary.durationMs,
        success: summary.success,
        failedTaskId: summary.failedTaskId,
    });

    if (!summary.success) {
        return err({
            code: 'pipeline.failed',
            message: `Pipeline failed: ${pipelineId}`,
            details: {
                failedTaskId: summary.failedTaskId,
                pipelineId,
                tasks: summary.tasks,
            },
        });
    }

    return ok(summary);
}
