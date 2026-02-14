#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';

const cwd = process.cwd();
const registryPath = path.join(cwd, 'registry.json');
const nextUrl = process.argv[2] || process.env.REGISTRY_HOMEPAGE_URL;
const nextNamespace = process.env.REGISTRY_NAMESPACE;

if (!nextUrl) {
    console.error(
        'Missing URL. Pass it as the first arg or set REGISTRY_HOMEPAGE_URL.'
    );
    console.error(
        'Example: pnpm run registry:url -- https://loop-cn.vercel.app'
    );
    process.exit(1);
}

const raw = await fs.readFile(registryPath, 'utf8');
const data = JSON.parse(raw);

data.homepage = nextUrl;

if (nextNamespace) {
    data.name = nextNamespace;
}

await fs.writeFile(registryPath, `${JSON.stringify(data, null, 4)}\n`, 'utf8');

console.log(`Updated registry homepage -> ${data.homepage}`);
if (nextNamespace) {
    console.log(`Updated registry namespace -> ${data.name}`);
}
