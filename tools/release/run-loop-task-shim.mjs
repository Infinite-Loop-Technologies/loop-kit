#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { spawnSync } from 'node:child_process';

function parseOptions(argv) {
    const options = {
        cwd: process.cwd(),
        parallel: false,
        pipeline: undefined,
    };
    const positional = [];

    for (let index = 0; index < argv.length; index += 1) {
        const arg = argv[index];
        if (arg === '--cwd') {
            const next = argv[index + 1];
            if (!next) {
                throw new Error('Missing value for --cwd');
            }
            options.cwd = path.resolve(next);
            index += 1;
            continue;
        }
        if (arg === '--parallel') {
            options.parallel = true;
            continue;
        }
        if (arg === '--pipeline') {
            const next = argv[index + 1];
            if (!next) {
                throw new Error('Missing value for --pipeline');
            }
            options.pipeline = next;
            index += 1;
            continue;
        }
        positional.push(arg);
    }

    return { options, positional };
}

function loadWorkspaceConfig(workspaceRoot) {
    const configPath = path.join(workspaceRoot, 'loop.json');
    if (!fs.existsSync(configPath)) {
        throw new Error(`Missing loop.json at ${configPath}`);
    }
    const raw = fs.readFileSync(configPath, 'utf8');
    return JSON.parse(raw);
}

function ensureTask(taskId, tasks) {
    const task = tasks?.[taskId];
    if (!task || typeof task.command !== 'string') {
        throw new Error(`Unknown task "${taskId}"`);
    }
    return task;
}

function runProcess(taskId, task, workspaceRoot) {
    const taskCwd = typeof task.cwd === 'string' ? path.resolve(workspaceRoot, task.cwd) : workspaceRoot;
    const env =
        task.env && typeof task.env === 'object'
            ? { ...process.env, ...Object.fromEntries(Object.entries(task.env).map(([key, value]) => [key, String(value)])) }
            : process.env;

    process.stdout.write(`task:start ${taskId} (${task.command}${Array.isArray(task.args) ? ` ${task.args.join(' ')}` : ''})\n`);
    const result = spawnSync(task.command, Array.isArray(task.args) ? task.args : [], {
        cwd: taskCwd,
        env,
        stdio: 'inherit',
        shell: process.platform === 'win32' && task.command.toLowerCase() === 'pnpm',
    });

    if ((result.status ?? 1) !== 0) {
        throw new Error(`Task "${taskId}" failed with exit code ${result.status ?? 1}`);
    }
    process.stdout.write(`task:finish ${taskId} success=true code=${result.status ?? 0}\n`);
}

function runTask(taskId, tasks, workspaceRoot, stack = new Set(), done = new Set()) {
    if (done.has(taskId)) {
        return;
    }
    if (stack.has(taskId)) {
        throw new Error(`Task dependency cycle detected at "${taskId}"`);
    }

    const task = ensureTask(taskId, tasks);
    stack.add(taskId);
    const deps = Array.isArray(task.deps) ? task.deps : [];
    for (const depId of deps) {
        if (typeof depId !== 'string') {
            continue;
        }
        runTask(depId, tasks, workspaceRoot, stack, done);
    }
    stack.delete(taskId);

    runProcess(taskId, task, workspaceRoot);
    done.add(taskId);
}

function runPipeline(pipelineId, config, workspaceRoot) {
    const pipelines = config?.pipelines;
    const pipeline = pipelines?.[pipelineId];
    if (!pipeline || !Array.isArray(pipeline.tasks)) {
        throw new Error(`Unknown pipeline "${pipelineId}"`);
    }

    process.stdout.write(`pipeline:start ${pipelineId}\n`);
    const done = new Set();
    for (const taskId of pipeline.tasks) {
        if (typeof taskId !== 'string') {
            continue;
        }
        runTask(taskId, config.tasks, workspaceRoot, new Set(), done);
    }
    process.stdout.write(`pipeline:finish ${pipelineId} success=true\n`);
}

function main() {
    const { options, positional } = parseOptions(process.argv.slice(2));
    const command = positional[0];

    if (command !== 'run' && command !== 'ci') {
        throw new Error('Unsupported command for stable task shim. Expected "run" or "ci".');
    }

    const workspaceRoot = options.cwd;
    const config = loadWorkspaceConfig(workspaceRoot);

    if (command === 'run') {
        const taskId = positional[1];
        if (!taskId) {
            throw new Error('Missing task id for "run".');
        }
        runTask(taskId, config.tasks, workspaceRoot);
        return;
    }

    const defaultPipeline = config?.defaults?.ciPipeline;
    const pipelineId = options.pipeline ?? (typeof defaultPipeline === 'string' ? defaultPipeline : 'ci');
    runPipeline(pipelineId, config, workspaceRoot);
}

try {
    main();
} catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exit(1);
}
