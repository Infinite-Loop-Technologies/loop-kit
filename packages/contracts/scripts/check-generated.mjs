import { mkdtemp, readdir, readFile, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import os from 'node:os';
import path from 'node:path';
import { createClient } from '@hey-api/openapi-ts';
import config from '../openapi-ts.config.mjs';

const currentOutput = fileURLToPath(new URL('../src/generated/openapi', import.meta.url));
const tempRoot = await mkdtemp(path.join(os.tmpdir(), 'forge-contracts-'));
const tempOutput = path.join(tempRoot, 'openapi');

try {
  await createClient({
    ...config,
    output: tempOutput
  });

  const differences = [];
  await compareDirectories(currentOutput, tempOutput, differences);

  if (differences.length > 0) {
    console.error('Generated OpenAPI artifacts are out of date:');
    for (const difference of differences) {
      console.error(`- ${difference}`);
    }
    process.exitCode = 1;
  } else {
    console.log('Generated OpenAPI artifacts are current.');
  }
} finally {
  await rm(tempRoot, { recursive: true, force: true });
}

async function compareDirectories(leftDir, rightDir, differences, relativeDir = '.') {
  const leftEntries = await listEntries(leftDir);
  const rightEntries = await listEntries(rightDir);
  const names = new Set([...leftEntries.keys(), ...rightEntries.keys()]);

  for (const name of [...names].sort()) {
    const leftEntry = leftEntries.get(name);
    const rightEntry = rightEntries.get(name);
    const relativePath = path.join(relativeDir, name);

    if (!leftEntry || !rightEntry) {
      differences.push(relativePath);
      continue;
    }

    if (leftEntry.type !== rightEntry.type) {
      differences.push(relativePath);
      continue;
    }

    if (leftEntry.type === 'directory') {
      await compareDirectories(
        path.join(leftDir, name),
        path.join(rightDir, name),
        differences,
        relativePath
      );
      continue;
    }

    const [leftContents, rightContents] = await Promise.all([
      readFile(path.join(leftDir, name), 'utf8'),
      readFile(path.join(rightDir, name), 'utf8')
    ]);

    if (leftContents !== rightContents) {
      differences.push(relativePath);
    }
  }
}

async function listEntries(dirPath) {
  try {
    const entries = await readdir(dirPath, { withFileTypes: true });
    return new Map(
      entries.map((entry) => [
        entry.name,
        { type: entry.isDirectory() ? 'directory' : 'file' }
      ])
    );
  } catch {
    return new Map();
  }
}
