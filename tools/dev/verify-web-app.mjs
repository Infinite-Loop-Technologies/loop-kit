#!/usr/bin/env node

import assert from 'node:assert/strict';

function parseArgs(argv) {
    const options = {};

    for (let index = 0; index < argv.length; index += 1) {
        const token = argv[index];
        if (!token.startsWith('--')) {
            continue;
        }

        const key = token.slice(2);
        const value = argv[index + 1];
        if (!value || value.startsWith('--')) {
            throw new Error(`Missing value for --${key}.`);
        }

        options[key] = value;
        index += 1;
    }

    return options;
}

export async function verifyWebApp({ app, url, fetchImpl = fetch }) {
    assert.equal(typeof app, 'string', 'Expected app id.');
    assert.equal(typeof url, 'string', 'Expected target URL.');

    const response = await fetchImpl(url, {
        headers: {
            accept: 'text/html,application/xhtml+xml',
        },
    });

    if (!response.ok) {
        throw new Error(`Expected ${url} to respond with HTML, received ${response.status}.`);
    }

    const html = await response.text();
    const marker = `data-loop-app="${app}"`;
    if (!html.includes(marker)) {
        throw new Error(
            `Expected ${url} to identify as ${app}, but the required marker ${marker} was not present.`,
        );
    }

    return {
        app,
        url,
        marker,
        title: html.match(/<title>([^<]+)<\/title>/i)?.[1]?.trim() ?? null,
    };
}

async function main() {
    const args = parseArgs(process.argv.slice(2));
    const app = args.app;
    const url = args.url;

    if (!app || !url) {
        throw new Error('Usage: node tools/dev/verify-web-app.mjs --app <app-id> --url <url>');
    }

    const result = await verifyWebApp({ app, url });
    const titleSuffix = result.title ? ` (${result.title})` : '';
    process.stdout.write(`Verified ${result.app} at ${result.url}${titleSuffix}.\n`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch((error) => {
        process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
        process.exitCode = 1;
    });
}
