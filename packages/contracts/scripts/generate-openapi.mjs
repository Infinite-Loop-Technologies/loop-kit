import { rm, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

import { createClient } from '@hey-api/openapi-ts';

import config from '../openapi-ts.config.mjs';

const lockPath = fileURLToPath(new URL('../.openapi-ts.lock', import.meta.url));
const outputDir = fileURLToPath(new URL('../src/generated/openapi', import.meta.url));

await writeFile(lockPath, `${process.pid}\n`);

try {
  await rm(outputDir, { recursive: true, force: true });
  await createClient(config);
} finally {
  await rm(lockPath, { force: true });
}
