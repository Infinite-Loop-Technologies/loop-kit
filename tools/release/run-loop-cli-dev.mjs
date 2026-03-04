#!/usr/bin/env node

import path from 'node:path';
import process from 'node:process';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

function run(command, args, options = {}) {
    return spawnSync(command, args, {
        stdio: 'inherit',
        shell: process.platform === 'win32',
        ...options,
    });
}

function main() {
    const currentDir = path.dirname(fileURLToPath(import.meta.url));
    const repoRoot = path.resolve(currentDir, '..', '..');
    const cliEntry = path.join(repoRoot, 'packages', 'loop-cli', 'dist', 'cli.js');

    const args = process.argv.slice(2);
    while (args[0] === '--') {
        args.shift();
    }

    const build = run('pnpm', ['--filter', '@loop-kit/loop-cli', 'build'], { cwd: repoRoot });
    if (build.status !== 0) {
        process.exit(build.status ?? 1);
    }

    const cliRun = run('node', [cliEntry, ...args], { cwd: repoRoot });
    process.exit(cliRun.status ?? 1);
}

main();
