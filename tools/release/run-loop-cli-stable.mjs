#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

function readPinnedVersion() {
    const currentDir = path.dirname(fileURLToPath(import.meta.url));
    const configPath = path.join(currentDir, 'loop-cli-stable.json');
    const raw = fs.readFileSync(configPath, 'utf8');
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed.version !== 'string' || parsed.version.length === 0) {
        throw new Error(`Invalid stable CLI config at ${configPath}`);
    }

    return parsed.version;
}

function run(command, args, options = {}) {
    return spawnSync(command, args, {
        shell: process.platform === 'win32',
        ...options,
    });
}

function isUnknownCommand(message) {
    return /unknown command/i.test(message) || /did you mean/i.test(message);
}

function main() {
    const currentDir = path.dirname(fileURLToPath(import.meta.url));
    const repoRoot = path.resolve(currentDir, '..', '..');
    const version = readPinnedVersion();
    const args = process.argv.slice(2);
    while (args[0] === '--') {
        args.shift();
    }

    if (args.length === 1 && (args[0] === '--pin' || args[0] === 'pin')) {
        process.stdout.write(`${version}\n`);
        process.exit(0);
    }

    const stableResult = run('pnpm', ['dlx', `@loop-kit/loop-cli@${version}`, ...args], {
        cwd: repoRoot,
        stdio: 'pipe',
        encoding: 'utf8',
    });
    const output = `${stableResult.stdout ?? ''}${stableResult.stderr ?? ''}`;

    if (stableResult.status === 0) {
        if (stableResult.stdout) {
            process.stdout.write(stableResult.stdout);
        }
        if (stableResult.stderr) {
            process.stderr.write(stableResult.stderr);
        }
        process.exit(0);
    }

    const shimCommands = new Set(['run', 'ci']);
    if (args.length > 0 && shimCommands.has(args[0]) && isUnknownCommand(output)) {
        process.stderr.write(
            `warning: stable @loop-kit/loop-cli@${version} does not support "${args[0]}"; using local stable task shim.\n`,
        );
        const shimRunner = path.join(currentDir, 'run-loop-task-shim.mjs');
        const shimResult = run('node', [shimRunner, ...args], {
            cwd: repoRoot,
            stdio: 'inherit',
        });
        process.exit(shimResult.status ?? 1);
    }

    const devFallbackCommands = new Set(['undo', 'adopt', 'component', 'request', 'loopd', 'mcp', 'ai']);
    if (args.length > 0 && devFallbackCommands.has(args[0]) && isUnknownCommand(output)) {
        process.stderr.write(
            `warning: stable @loop-kit/loop-cli@${version} does not support "${args[0]}"; falling back to workspace dev CLI.\n`,
        );
        const devRunner = path.join(currentDir, 'run-loop-cli-dev.mjs');
        const fallback = run('node', [devRunner, ...args], {
            cwd: repoRoot,
            stdio: 'inherit',
        });
        process.exit(fallback.status ?? 1);
    }

    if (stableResult.stdout) {
        process.stdout.write(stableResult.stdout);
    }
    if (stableResult.stderr) {
        process.stderr.write(stableResult.stderr);
    }
    process.exit(stableResult.status ?? 1);
}

main();
