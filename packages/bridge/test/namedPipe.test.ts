import { test } from 'node:test';
import assert from 'node:assert/strict';
import net from 'node:net';
import fs from 'node:fs';
import {
    decodeEnvelope,
    encodeEnvelope,
    invokeNamedPipeRpc,
    namedPipePath,
} from '../src/index.js';

function testPipeName(): string {
    return `loop-kit-bridge-test-${Date.now()}`;
}

test('named pipe rpc call returns result envelope', async () => {
    const pipeName = testPipeName();
    const pipePath = namedPipePath(pipeName);
    if (process.platform !== 'win32' && fs.existsSync(pipePath)) {
        fs.rmSync(pipePath, { force: true });
    }

    const server = net.createServer((socket) => {
        socket.on('data', (chunk) => {
            const line = chunk.toString('utf8').trim();
            const envelope = decodeEnvelope(line);
            if (envelope.type !== 'invoke') {
                return;
            }

            socket.write(encodeEnvelope({
                version: '1',
                type: 'result',
                id: envelope.id,
                result: {
                    ok: true,
                    method: envelope.method,
                },
            }));
            socket.end();
        });
    });

    await new Promise<void>((resolve, reject) => {
        server.once('error', reject);
        server.listen(pipePath, () => resolve());
    });

    try {
        const result = await invokeNamedPipeRpc(pipePath, 'host.ping', { value: 1 });
        assert.equal(result.type, 'result');
        assert.equal(result.error, undefined);
        assert.deepEqual(result.result, {
            ok: true,
            method: 'host.ping',
        });
    } finally {
        server.close();
        if (process.platform !== 'win32' && fs.existsSync(pipePath)) {
            fs.rmSync(pipePath, { force: true });
        }
    }
});
