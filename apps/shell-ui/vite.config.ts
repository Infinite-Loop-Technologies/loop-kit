import path from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { invokeNamedPipeRpc, namedPipePath } from '../../packages/bridge/src/index';

export default defineConfig({
    plugins: [
        react(),
        {
            name: 'host-shell-proxy',
            configureServer(server) {
                server.middlewares.use('/api/host/ping', async (_req, res) => {
                    const pipePath = process.env.LOOP_HOST_SHELL_PIPE ?? namedPipePath('loop-kit-host-shell');
                    try {
                        const response = await invokeNamedPipeRpc(pipePath, 'host.ping', {
                            origin: 'shell-ui',
                        });
                        res.statusCode = 200;
                        res.setHeader('content-type', 'application/json');
                        res.end(JSON.stringify({
                            ok: !response.error,
                            pipePath,
                            result: response.result,
                            error: response.error,
                        }));
                    } catch (error) {
                        res.statusCode = 500;
                        res.setHeader('content-type', 'application/json');
                        res.end(JSON.stringify({
                            ok: false,
                            pipePath,
                            error: String(error),
                        }));
                    }
                });
            },
        },
    ],
    server: {
        fs: {
            allow: [path.resolve(__dirname, '../..')],
        },
    },
});
