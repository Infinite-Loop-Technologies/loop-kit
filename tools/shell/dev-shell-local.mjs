#!/usr/bin/env node

import process from 'node:process';
import { spawn } from 'node:child_process';

const pipePath = process.env.LOOP_HOST_SHELL_PIPE ?? '\\\\.\\pipe\\loop-kit-host-shell';
const children = [];

function spawnProcess(command, args, env = {}) {
    const child = spawn(command, args, {
        stdio: 'inherit',
        shell: process.platform === 'win32',
        env: {
            ...process.env,
            ...env,
        },
    });
    children.push(child);
    return child;
}

function shutdown(code = 0) {
    for (const child of children) {
        if (!child.killed) {
            child.kill();
        }
    }
    process.exit(code);
}

const host = spawnProcess('cargo', ['run', '-p', 'host-shell'], {
    LOOP_HOST_SHELL_PIPE: pipePath,
});

const ui = spawnProcess('pnpm', ['--filter', '@loop-kit/shell-ui', 'dev'], {
    LOOP_HOST_SHELL_PIPE: pipePath,
});

host.on('exit', (code) => {
    if (code && code !== 0) {
        shutdown(code);
        return;
    }

    shutdown(0);
});

ui.on('exit', (code) => {
    if (code && code !== 0) {
        shutdown(code);
        return;
    }

    shutdown(0);
});

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));
