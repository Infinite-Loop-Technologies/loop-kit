import { afterEach, describe, expect, it } from "bun:test";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import {
  resolveVoltWorkspaceContext,
  resolveWorkspaceProject,
} from "./workspace-runtime";

const tempDirs: string[] = [];

const writeProjectConfig = async (root: string, projectDir: string, name: string) => {
  const fullDir = resolve(root, projectDir);
  await mkdir(fullDir, { recursive: true });
  await writeFile(
    resolve(fullDir, "volt.config.ts"),
    `export default { name: ${JSON.stringify(name)}, tasks: {}, targets: {} };\n`,
    "utf8",
  );
};

afterEach(async () => {
  await Promise.all(
    tempDirs.splice(0).map((dir) => rm(dir, { force: true, recursive: true })),
  );
});

describe("Volt workspace runtime", () => {
  it("discovers workspace projects and the current project from cwd", async () => {
    const root = await mkdtemp(resolve(tmpdir(), "volt-workspace-runtime-"));
    tempDirs.push(root);

    await writeProjectConfig(root, "apps/app-one", "App One");
    await writeProjectConfig(root, "apps/app-two", "App Two");

    const context = await resolveVoltWorkspaceContext({
      command: "dev",
      cwd: resolve(root, "apps/app-two"),
      mode: "development",
    });

    expect(context.workspaceRoot).toBe(root);
    expect(context.projects.map((project) => project.alias)).toEqual([
      "app-one",
      "app-two",
    ]);
    expect(context.currentProject?.alias).toBe("app-two");
  });

  it("resolves workspace aliases, basenames, and project-name slugs", async () => {
    const root = await mkdtemp(resolve(tmpdir(), "volt-workspace-aliases-"));
    tempDirs.push(root);

    await writeProjectConfig(root, "apps/volt-canvas-demo", "Volt Canvas Demo");
    await writeFile(
      resolve(root, "volt.workspace.ts"),
      [
        "export default {",
        '  kind: "volt-workspace-config",',
        "  value: {",
        '    name: "Workspace",',
        "    projects: {",
        '      canvas: { configPath: "apps/volt-canvas-demo/volt.config.ts" }',
        "    }",
        "  }",
        "};",
        "",
      ].join("\n"),
      "utf8",
    );

    const context = await resolveVoltWorkspaceContext({
      command: "dev",
      cwd: root,
      mode: "development",
    });

    expect(resolveWorkspaceProject(context.projects, "canvas")?.alias).toBe("canvas");
    expect(resolveWorkspaceProject(context.projects, "volt-canvas-demo")?.alias).toBe("canvas");
    expect(resolveWorkspaceProject(context.projects, "apps/volt-canvas-demo/volt.config.ts")?.alias).toBe(
      "canvas",
    );
    expect(resolveWorkspaceProject(context.projects, "volt-canvas-demo")?.project.name).toBe(
      "Volt Canvas Demo",
    );
  });
});
