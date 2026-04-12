import { describe, expect, it } from "bun:test";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { loadVoltEnv, withScopedProcessEnv } from "./env";

describe("Volt env loading", () => {
  it("merges workspace and project env files with project overrides", async () => {
    const root = await mkdtemp(resolve(tmpdir(), "volt-env-"));
    const workspaceRoot = root;
    const projectRoot = resolve(root, "apps", "forge");

    await mkdir(projectRoot, { recursive: true });
    await writeFile(resolve(workspaceRoot, ".env"), "SHARED=workspace\nPORT=3000\n", "utf8");
    await writeFile(resolve(projectRoot, ".env"), "PORT=4100\nINSTANT_APP_ID=forge-app\n", "utf8");
    await writeFile(resolve(projectRoot, ".env.development.local"), "LOCAL_ONLY=1\n", "utf8");

    const loaded = loadVoltEnv({
      mode: "development",
      rootDir: projectRoot,
      workspaceRoot,
    });

    expect(loaded).toMatchObject({
      INSTANT_APP_ID: "forge-app",
      LOCAL_ONLY: "1",
      PORT: "4100",
      SHARED: "workspace",
    });

    await rm(root, { force: true, recursive: true });
  });

  it("restores process.env after scoped overrides", async () => {
    const original = process.env.VOLT_TEST_SCOPED_ENV;
    process.env.VOLT_TEST_SCOPED_ENV = "outer";

    await withScopedProcessEnv({ VOLT_TEST_SCOPED_ENV: "inner" }, async () => {
      expect(process.env.VOLT_TEST_SCOPED_ENV).toBe("inner");
    });

    expect(process.env.VOLT_TEST_SCOPED_ENV).toBe("outer");

    if (original === undefined) {
      delete process.env.VOLT_TEST_SCOPED_ENV;
    } else {
      process.env.VOLT_TEST_SCOPED_ENV = original;
    }
  });
});
