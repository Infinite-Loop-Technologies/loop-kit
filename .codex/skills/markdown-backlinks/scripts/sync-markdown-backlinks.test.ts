import test from "node:test";
import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, resolve } from "node:path";

import { syncMarkdownBacklinks } from "./sync-markdown-backlinks.ts";

async function createFixture(): Promise<string> {
  return mkdtemp(resolve(tmpdir(), "markdown-backlinks-"));
}

async function writeFixtureFile(rootDir: string, relativePath: string, content: string): Promise<void> {
  const absolutePath = resolve(rootDir, relativePath);
  await mkdir(dirname(absolutePath), { recursive: true });
  await writeFile(absolutePath, content, "utf8");
}

test("syncs backlinks without turning generated backlinks into authored links", async () => {
  const rootDir = await createFixture();

  try {
    await writeFixtureFile(rootDir, "alpha.md", "# Alpha\n\nSee [Beta](beta.md).\n");
    await writeFixtureFile(rootDir, "beta.md", "# Beta\n");

    const result = await syncMarkdownBacklinks({
      rootDir,
      include: ["**/*.md"],
      exclude: [],
      write: true,
    });

    assert.deepEqual(result.brokenLinks, []);
    assert.deepEqual(result.filesChanged, ["alpha.md", "beta.md"]);

    const alpha = await readFile(resolve(rootDir, "alpha.md"), "utf8");
    const beta = await readFile(resolve(rootDir, "beta.md"), "utf8");

    assert.match(beta, /## Backlinks[\s\S]*- \[alpha\.md\]\(alpha\.md\)/u);
    assert.match(alpha, /## Backlinks[\s\S]*- None\./u);
  } finally {
    await rm(rootDir, { recursive: true, force: true });
  }
});

test("prunes stale legacy backlinks and respects excludes", async () => {
  const rootDir = await createFixture();

  try {
    await writeFixtureFile(rootDir, "docs/source.md", "# Source\n");
    await writeFixtureFile(rootDir, "docs/target.md", "# Target\n\n## Backlinks\n\n- [stale.md](stale.md)\n");
    await writeFixtureFile(rootDir, "ignore/hidden.md", "# Hidden\n\nSee [Target](../docs/target.md).\n");

    const result = await syncMarkdownBacklinks({
      rootDir,
      include: ["**/*.md"],
      exclude: ["ignore/**"],
      write: true,
    });

    assert.deepEqual(result.brokenLinks, []);
    const target = await readFile(resolve(rootDir, "docs", "target.md"), "utf8");

    assert.doesNotMatch(target, /stale\.md/u);
    assert.match(target, /## Backlinks[\s\S]*- None\./u);
  } finally {
    await rm(rootDir, { recursive: true, force: true });
  }
});
