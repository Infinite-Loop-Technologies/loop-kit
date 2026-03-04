#!/usr/bin/env node

import process from 'node:process';
import { spawnSync } from 'node:child_process';

function run(command, args, inherit = true) {
    return spawnSync(command, args, {
        stdio: inherit ? 'inherit' : ['ignore', 'pipe', 'pipe'],
        shell: process.platform === 'win32',
    });
}

function runStable(args) {
    const stableArgs = ['dlx', '@loop-kit/loop-cli@latest', ...args];
    const result = run('pnpm', stableArgs, false);
    if (result.status === 0) {
        if (result.stdout) {
            process.stdout.write(result.stdout);
        }
        if (result.stderr) {
            process.stderr.write(result.stderr);
        }
        return 0;
    }

    const stderr = String(result.stderr ?? '');
    const isMissing =
        stderr.includes('Not found') ||
        stderr.includes('ERR_PNPM_FETCH_404') ||
        stderr.includes('E404');

    if (!isMissing) {
        if (result.stdout) {
            process.stdout.write(result.stdout);
        }
        if (result.stderr) {
            process.stderr.write(result.stderr);
        }
        return result.status ?? 1;
    }

    return null;
}

function runLocal(args) {
    console.log('Published @loop-kit/loop-cli not found. Falling back to local workspace CLI.');
    const buildResult = run('pnpm', ['--filter', '@loop-kit/loop-cli', 'build']);
    if (buildResult.status !== 0) {
        return buildResult.status ?? 1;
    }

    const localArgs = ['--filter', '@loop-kit/loop-cli', 'exec', 'node', 'dist/cli.js', ...args];
    const localResult = run('pnpm', localArgs);
    return localResult.status ?? 1;
}

function main() {
    const args = process.argv.slice(2);
    while (args[0] === '--') {
        args.shift();
    }

    const stableStatus = runStable(args);
    if (stableStatus === 0) {
        process.exit(0);
    }

    if (stableStatus !== null) {
        process.exit(stableStatus);
    }

    const localStatus = runLocal(args);
    process.exit(localStatus);
}

main();
