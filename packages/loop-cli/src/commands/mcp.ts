import path from 'node:path';
import { serveMcpStdIo } from '@loop-kit/loop-mcp';

export async function handleMcpServe(options: {
    cwd?: string;
}): Promise<void> {
    const workspaceRoot = path.resolve(options.cwd ?? process.cwd());
    console.error(`loop-mcp serving on stdio (workspace=${workspaceRoot})`);
    await serveMcpStdIo(workspaceRoot);
}
