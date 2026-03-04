import process from 'node:process';
import { createLoopdServer } from './rpc.js';

const workspaceRoot = process.env.LOOPD_WORKSPACE_ROOT ?? process.cwd();
const port = Number(process.env.LOOPD_PORT ?? '4545');

const server = createLoopdServer(workspaceRoot);
server.listen(port, '127.0.0.1', () => {
    // Keep worker quiet when detached.
});
