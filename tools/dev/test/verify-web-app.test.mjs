import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import test from 'node:test';

import { verifyWebApp } from '../verify-web-app.mjs';

function withHtmlServer(html) {
    const server = createServer((_request, response) => {
        response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
        response.end(html);
    });

    return new Promise((resolve, reject) => {
        server.listen(0, '127.0.0.1', () => {
            const address = server.address();
            if (!address || typeof address === 'string') {
                reject(new Error('Unable to resolve test server address.'));
                return;
            }

            resolve({
                close: () =>
                    new Promise((closeResolve, closeReject) => {
                        server.close((error) => {
                            if (error) {
                                closeReject(error);
                                return;
                            }
                            closeResolve();
                        });
                    }),
                url: `http://127.0.0.1:${address.port}`,
            });
        });
        server.on('error', reject);
    });
}

test('verifyWebApp accepts the expected app marker', async () => {
    const fixture = await withHtmlServer(
        '<!doctype html><html><head><title>Forge Web</title></head><body data-loop-app="forge-web"></body></html>',
    );

    try {
        const result = await verifyWebApp({
            app: 'forge-web',
            url: fixture.url,
        });

        assert.equal(result.app, 'forge-web');
        assert.equal(result.title, 'Forge Web');
    } finally {
        await fixture.close();
    }
});

test('verifyWebApp fails when the server responds with the wrong app marker', async () => {
    const fixture = await withHtmlServer(
        '<!doctype html><html><head><title>Loop UI Demo</title></head><body data-loop-app="ui-demo"></body></html>',
    );

    try {
        await assert.rejects(
            () =>
                verifyWebApp({
                    app: 'forge-web',
                    url: fixture.url,
                }),
            /Expected .* to identify as forge-web/,
        );
    } finally {
        await fixture.close();
    }
});
