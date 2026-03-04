import path from 'node:path';
import { loopdStart, loopdStatus, loopdStop } from '@loop-kit/loopd';

function workspaceRoot(cwd?: string): string {
    return path.resolve(cwd ?? process.cwd());
}

export async function handleLoopdStart(options: { cwd?: string; port?: number; json?: boolean }): Promise<void> {
    const result = await loopdStart(workspaceRoot(options.cwd), {
        port: options.port,
    });
    if (options.json) {
        console.log(JSON.stringify(result, null, 2));
        return;
    }

    console.log(`loopd running pid=${result.state.pid} port=${result.state.port}`);
}

export async function handleLoopdStop(options: { cwd?: string; json?: boolean }): Promise<void> {
    const result = await loopdStop(workspaceRoot(options.cwd));
    if (options.json) {
        console.log(JSON.stringify(result, null, 2));
        return;
    }

    if (!result.stopped) {
        console.log('loopd was not running');
        return;
    }

    console.log(`loopd stopped pid=${result.state?.pid ?? 'unknown'}`);
}

export async function handleLoopdStatus(options: { cwd?: string; json?: boolean }): Promise<void> {
    const result = await loopdStatus(workspaceRoot(options.cwd));
    if (options.json) {
        console.log(JSON.stringify(result, null, 2));
        return;
    }

    if (!result.running) {
        console.log('loopd status: stopped');
        return;
    }

    console.log(`loopd status: running pid=${result.state?.pid} port=${result.state?.port}`);
}
