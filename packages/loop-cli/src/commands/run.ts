import { createKernel } from '@loop-kit/loop-kernel';
import type { TaskEvent } from '@loop-kit/loop-contracts';

function handleTaskEvent(event: TaskEvent): void {
    if (event.type === 'task.stdout') {
        process.stdout.write(event.chunk);
        return;
    }

    if (event.type === 'task.stderr') {
        process.stderr.write(event.chunk);
        return;
    }

    if (event.type === 'task.start') {
        console.log(`task:start ${event.taskId} (${event.command} ${event.args.join(' ')})`);
        return;
    }

    if (event.type === 'task.finish') {
        console.log(`task:finish ${event.taskId} success=${event.success} code=${event.exitCode}`);
        return;
    }

    if (event.type === 'pipeline.start') {
        console.log(`pipeline:start ${event.pipelineId}`);
        return;
    }

    if (event.type === 'pipeline.finish') {
        console.log(`pipeline:finish ${event.pipelineId} success=${event.success}`);
    }
}

export async function handleRun(
    taskId: string,
    options: {
        cwd?: string;
        parallel?: boolean;
        json?: boolean;
    },
): Promise<void> {
    const kernel = createKernel({ workspaceRoot: options.cwd });
    const result = await kernel.runTask(taskId, {
        parallel: options.parallel,
        onEvent: options.json ? undefined : handleTaskEvent,
    });

    if (!result.ok) {
        throw new Error(result.error.message);
    }

    if (options.json) {
        console.log(JSON.stringify(result.value, null, 2));
        return;
    }

    console.log(`completed task=${result.value.summary.taskId} durationMs=${result.value.summary.durationMs}`);
}

export async function handleCi(options: {
    cwd?: string;
    pipeline?: string;
    parallel?: boolean;
    json?: boolean;
}): Promise<void> {
    const kernel = createKernel({ workspaceRoot: options.cwd });
    const result = await kernel.ci({
        pipelineId: options.pipeline,
        parallel: options.parallel,
        onEvent: options.json ? undefined : handleTaskEvent,
    });

    if (!result.ok) {
        throw new Error(result.error.message);
    }

    if (options.json) {
        console.log(JSON.stringify(result.value, null, 2));
        return;
    }

    console.log(`completed pipeline=${result.value.pipelineId} durationMs=${result.value.durationMs}`);
}
