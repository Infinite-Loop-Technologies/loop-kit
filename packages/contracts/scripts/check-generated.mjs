import { access, copyFile, mkdir, mkdtemp, readdir, readFile, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import os from 'node:os';
import path from 'node:path';

import { createClient } from '@hey-api/openapi-ts';

import config from '../openapi-ts.config.mjs';

const currentOutput = fileURLToPath(new URL('../src/generated/openapi', import.meta.url));
const lockPath = fileURLToPath(new URL('../.openapi-ts.lock', import.meta.url));
const tempRoot = await mkdtemp(path.join(os.tmpdir(), 'forge-contracts-'));
const snapshotOutput = path.join(tempRoot, 'current-output');
const tempOutput = path.join(tempRoot, 'openapi');

try {
  await createClient({
    ...config,
    output: tempOutput
  });

  await copyStableDirectorySnapshot(currentOutput, snapshotOutput, lockPath);

  const differences = [];
  await compareDirectories(snapshotOutput, tempOutput, differences);

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

async function copyStableDirectorySnapshot(sourceDir, targetDir, coordinationLockPath) {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    await waitForUnlock(coordinationLockPath);
    await rm(targetDir, { recursive: true, force: true });
    await copyDirectory(sourceDir, targetDir);

    if (!(await pathExists(coordinationLockPath))) {
      return;
    }

    await sleep(100);
  }

  throw new Error('Timed out waiting for generated OpenAPI artifacts to become stable.');
}

async function copyDirectory(sourceDir, targetDir) {
  await mkdir(targetDir, { recursive: true });

  const entries = await listEntries(sourceDir);
  for (const [name, entry] of entries) {
    const sourcePath = path.join(sourceDir, name);
    const targetPath = path.join(targetDir, name);

    if (entry.type === 'directory') {
      await copyDirectory(sourcePath, targetPath);
      continue;
    }

    await copyFile(sourcePath, targetPath);
  }
}

async function waitForUnlock(coordinationLockPath) {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    if (!(await pathExists(coordinationLockPath))) {
      return;
    }

    await sleep(100);
  }

  throw new Error('Timed out waiting for the OpenAPI generation lock to clear.');
}

async function pathExists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
