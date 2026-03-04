#!/usr/bin/env node

import process from 'node:process';
import { spawnSync } from 'node:child_process';

function run(command, args) {
    return spawnSync(command, args, {
        stdio: 'inherit',
        shell: process.platform === 'win32',
    });
}

function main() {
    const args = process.argv.slice(2);
    while (args[0] === '--') {
        args.shift();
    }

    const doctorArgs = args.length > 0 ? args : ['--cwd', '.'];

    const stable = run('pnpm', ['run', 'loop:stable', '--', 'doctor', ...doctorArgs]);
    if (stable.status !== 0) {
        process.exit(stable.status ?? 1);
    }

    const dev = run('pnpm', ['run', 'loop:dev', '--', 'doctor', ...doctorArgs]);
    if (dev.status !== 0) {
        console.warn('warning: loop:dev smoke failed (stable CLI smoke passed).');
    }

    process.exit(0);
}

main();
