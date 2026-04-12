import { describe, expect, it } from "bun:test";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import parcelWatcher from "@parcel/watcher";
import { computeAffectedTaskNames } from "./daemon";
import { task, type LoadedVoltProjectLike } from "./task";

describe("Volt daemon affected task layer", () => {
  it("computes affected tasks from explicit globs", () => {
    const rootDir = process.cwd();
    const project: LoadedVoltProjectLike = {
      configPath: resolve(rootDir, "apps", "volt-demo", "volt.config.ts"),
      defaults: {
        build: [],
        dev: ["dev:web"],
      },
      name: "Affected Test",
      rootDir,
      tasks: {
        "dev:api": task({
          inputs: ["src/api/**/*.ts"],
          run: () => undefined,
          watch: ["src/shared/**/*.ts"],
        }),
        "dev:web": task({
          dependsOn: ["dev:api"],
          inputs: ["src/web/**/*.tsx"],
          run: () => undefined,
        }),
      },
      targets: {},
      workspaceRoot: rootDir,
    };

    expect(
      computeAffectedTaskNames(project, ["src/shared/contracts.ts"]),
    ).toEqual(["dev:api", "dev:web"]);
    expect(
      computeAffectedTaskNames(project, ["src/web/App.tsx"]),
    ).toEqual(["dev:web"]);
  });

  it("uses parcel snapshots to detect changed files between runs", async () => {
    const root = await mkdtemp(join(tmpdir(), "volt-daemon-test-"));
    const srcDir = join(root, "src");
    const snapshotPath = join(root, "workspace.snapshot");
    const filePath = join(srcDir, "index.ts");

    await mkdir(srcDir, { recursive: true });
    await writeFile(filePath, "export const value = 1;\n", "utf8");
    await parcelWatcher.writeSnapshot(root, snapshotPath, {
      ignore: ["**/.git/**", "**/.volt/**"],
    });

    await writeFile(filePath, "export const value = 2;\n", "utf8");
    const events = await parcelWatcher.getEventsSince(root, snapshotPath, {
      ignore: ["**/.git/**", "**/.volt/**"],
    });

    expect(events.some((event) => event.path === filePath)).toBe(true);

    await rm(root, { force: true, recursive: true });
  });
});
