import { resolve } from "node:path";

export interface PackageManifest {
  name: string;
  version: string;
  private?: boolean;
  scripts?: Record<string, string>;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  optionalDependencies?: Record<string, string>;
  publishConfig?: {
    access?: string;
  };
  ["x-publish"]?: boolean;
}

export interface WorkspacePackage {
  dir: string;
  dirPath: string;
  manifest: PackageManifest;
  manifestPath: string;
}

const dependencyFields = [
  "dependencies",
  "devDependencies",
  "peerDependencies",
  "optionalDependencies",
] as const;

export async function readJson<T>(filePath: string): Promise<T> {
  return (await Bun.file(filePath).json()) as T;
}

export async function writeJson(filePath: string, value: unknown) {
  await Bun.write(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

export function bumpMinorVersion(version: string) {
  const [major, minor, patch] = version.split(".").map((part) => Number(part));
  if ([major, minor, patch].some((part) => Number.isNaN(part))) {
    throw new Error(`Cannot bump non-semver version "${version}".`);
  }

  return `${major}.${minor + 1}.0`;
}

export function packageShortName(name: string) {
  return name.replace(/^@[^/]+\//u, "");
}

export function isPublishablePackage(workspace: WorkspacePackage) {
  return workspace.manifest["x-publish"] === true;
}

export async function listWorkspacePackages(cwd = process.cwd()): Promise<WorkspacePackage[]> {
  const rootManifest = await readJson<{ workspaces?: string[] }>(resolve(cwd, "package.json"));
  const manifestPaths = new Set<string>();

  for (const pattern of rootManifest.workspaces ?? []) {
    const glob = new Bun.Glob(`${pattern}/package.json`);
    for await (const manifestPath of glob.scan({ cwd })) {
      manifestPaths.add(manifestPath.replaceAll("\\", "/"));
    }
  }

  return await Promise.all(
    [...manifestPaths].sort().map(async (relativeManifestPath) => {
      const manifestPath = resolve(cwd, relativeManifestPath);
      const dir = relativeManifestPath.slice(0, -"/package.json".length);

      return {
        dir,
        dirPath: resolve(cwd, dir),
        manifest: await readJson<PackageManifest>(manifestPath),
        manifestPath,
      };
    }),
  );
}

function collectInternalDeps(
  manifest: PackageManifest,
  packageNames: Set<string>,
) {
  const deps = new Set<string>();

  for (const field of dependencyFields) {
    for (const packageName of Object.keys(manifest[field] ?? {})) {
      if (packageNames.has(packageName)) {
        deps.add(packageName);
      }
    }
  }

  return deps;
}

export function orderPackagesByInternalDeps(packages: WorkspacePackage[]) {
  const byName = new Map(packages.map((workspace) => [workspace.manifest.name, workspace]));
  const packageNames = new Set(byName.keys());
  const incoming = new Map<string, number>();
  const dependents = new Map<string, string[]>();

  for (const workspace of packages) {
    incoming.set(workspace.manifest.name, 0);
    dependents.set(workspace.manifest.name, []);
  }

  for (const workspace of packages) {
    for (const dependencyName of collectInternalDeps(workspace.manifest, packageNames)) {
      incoming.set(
        workspace.manifest.name,
        (incoming.get(workspace.manifest.name) ?? 0) + 1,
      );
      dependents.get(dependencyName)?.push(workspace.manifest.name);
    }
  }

  const queue = packages
    .filter((workspace) => (incoming.get(workspace.manifest.name) ?? 0) === 0)
    .sort((left, right) => left.manifest.name.localeCompare(right.manifest.name));
  const ordered: WorkspacePackage[] = [];

  while (queue.length > 0) {
    const next = queue.shift();
    if (!next) {
      break;
    }

    ordered.push(next);

    for (const dependentName of dependents.get(next.manifest.name) ?? []) {
      const nextCount = (incoming.get(dependentName) ?? 0) - 1;
      incoming.set(dependentName, nextCount);

      if (nextCount === 0) {
        const dependent = byName.get(dependentName);
        if (dependent) {
          queue.push(dependent);
          queue.sort((left, right) => left.manifest.name.localeCompare(right.manifest.name));
        }
      }
    }
  }

  if (ordered.length !== packages.length) {
    throw new Error("Workspace dependency cycle detected.");
  }

  return ordered;
}

export function updateDependencyVersions(
  manifest: PackageManifest,
  versionsByPackageName: Map<string, string>,
) {
  let changed = false;

  for (const field of dependencyFields) {
    const deps = manifest[field];
    if (!deps) {
      continue;
    }

    for (const [packageName, version] of versionsByPackageName) {
      if (deps[packageName] === undefined) {
        continue;
      }

      deps[packageName] = `^${version}`;
      changed = true;
    }
  }

  return changed;
}

export async function runCommand(
  cmd: string[],
  cwd: string,
  extraEnv?: Record<string, string>,
) {
  const child = Bun.spawn({
    cmd,
    cwd,
    env: {
      ...process.env,
      ...extraEnv,
    },
    stdout: "inherit",
    stderr: "inherit",
    stdin: "inherit",
  });

  const exitCode = await child.exited;
  if (exitCode !== 0) {
    throw new Error(`${cmd.join(" ")} failed in ${cwd} with exit code ${exitCode}.`);
  }
}
