import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
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

export interface PromptOption<TValue extends string = string> {
  label: string;
  value: TValue;
}

export type VersionBumpKind = "patch" | "minor" | "major";

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

function parseReleaseVersion(version: string) {
  const [major, minor, patch] = version.split(".").map((part) => Number(part));
  if ([major, minor, patch].some((part) => Number.isNaN(part))) {
    throw new Error(`Cannot bump non-semver version "${version}".`);
  }

  return { major, minor, patch };
}

export function isSemverVersion(version: string) {
  return /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/u.test(version);
}

export function bumpVersion(version: string, kind: VersionBumpKind) {
  const { major, minor, patch } = parseReleaseVersion(version);

  switch (kind) {
    case "patch":
      return `${major}.${minor}.${patch + 1}`;
    case "minor":
      return `${major}.${minor + 1}.0`;
    case "major":
      return `${major + 1}.0.0`;
  }
}

export function bumpMinorVersion(version: string) {
  return bumpVersion(version, "minor");
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

      deps[packageName] = replaceVersionReference(deps[packageName], version);
      changed = true;
    }
  }

  return changed;
}

export function replaceVersionReference(
  currentValue: string,
  nextVersion: string,
) {
  if (currentValue.startsWith("workspace:")) {
    const spec = currentValue.slice("workspace:".length);
    if (spec === "*" || spec === "") {
      return "workspace:*";
    }
    if (spec === "^" || spec.startsWith("^")) {
      return "workspace:^";
    }
    if (spec === "~" || spec.startsWith("~")) {
      return "workspace:~";
    }
    return `workspace:${nextVersion}`;
  }

  if (currentValue.startsWith("^")) {
    return `^${nextVersion}`;
  }

  if (currentValue.startsWith("~")) {
    return `~${nextVersion}`;
  }

  return nextVersion;
}

export async function runCommand(
  cmd: string[],
  cwd: string,
  extraEnv?: Record<string, string>,
) {
  const resolvedCmd =
    process.platform === "win32" && cmd[0]?.toLowerCase() === "npm"
      ? ["npm.cmd", ...cmd.slice(1)]
      : cmd;

  const child = Bun.spawn({
    cmd: resolvedCmd,
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
    throw new Error(`${resolvedCmd.join(" ")} failed in ${cwd} with exit code ${exitCode}.`);
  }
}

export function isInteractiveTerminal() {
  return process.stdin.isTTY === true && process.stdout.isTTY === true;
}

export async function promptForText(
  question: string,
  defaultValue?: string,
) {
  const rl = createInterface({ input, output });

  try {
    const suffix = defaultValue ? ` [${defaultValue}]` : "";
    const response = (await rl.question(`${question}${suffix}: `)).trim();
    return response || defaultValue || "";
  } finally {
    rl.close();
  }
}

export async function promptForBoolean(
  question: string,
  defaultValue: boolean,
) {
  const defaultLabel = defaultValue ? "Y/n" : "y/N";
  const response = (await promptForText(`${question} (${defaultLabel})`)).toLowerCase();

  if (!response) {
    return defaultValue;
  }

  if (["y", "yes"].includes(response)) {
    return true;
  }

  if (["n", "no"].includes(response)) {
    return false;
  }

  throw new Error(`Expected yes or no for "${question}".`);
}

export async function promptForSelect<TValue extends string>(
  question: string,
  options: PromptOption<TValue>[],
  defaultIndex = 0,
) {
  if (options.length === 0) {
    throw new Error(`No options available for "${question}".`);
  }

  console.log(`\n${question}`);
  for (const [index, option] of options.entries()) {
    const marker = index === defaultIndex ? "*" : " ";
    console.log(` ${marker} ${index + 1}. ${option.label}`);
  }

  const response = await promptForText("Select option", String(defaultIndex + 1));
  const selectedIndex = Number(response) - 1;
  if (!Number.isInteger(selectedIndex) || selectedIndex < 0 || selectedIndex >= options.length) {
    throw new Error(`Expected a number between 1 and ${options.length}.`);
  }

  return options[selectedIndex]!.value;
}

export async function promptForMultiSelect<TValue extends string>(
  question: string,
  options: PromptOption<TValue>[],
  defaultValues: readonly TValue[] = [],
) {
  if (options.length === 0) {
    return [] as TValue[];
  }

  const defaultIndexes = options
    .map((option, index) => (defaultValues.includes(option.value) ? String(index + 1) : null))
    .filter(Boolean);

  console.log(`\n${question}`);
  for (const [index, option] of options.entries()) {
    const marker = defaultValues.includes(option.value) ? "*" : " ";
    console.log(` ${marker} ${index + 1}. ${option.label}`);
  }

  const response = await promptForText(
    "Select one or more options (comma-separated)",
    defaultIndexes.join(","),
  );

  const values = response
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => Number(part) - 1);

  if (values.length === 0) {
    return [] as TValue[];
  }

  const selected = new Set<TValue>();
  for (const index of values) {
    if (!Number.isInteger(index) || index < 0 || index >= options.length) {
      throw new Error(`Expected selection numbers between 1 and ${options.length}.`);
    }
    selected.add(options[index]!.value);
  }

  return [...selected];
}

export function packageDisplayName(name: string) {
  const shortName = packageShortName(name);
  return shortName === name ? name : `${shortName} (${name})`;
}

export async function withTemporaryFileRestore<TValue>(
  filePaths: string[],
  operation: () => Promise<TValue>,
) {
  const originals = await Promise.all(
    filePaths.map(async (filePath) => [filePath, await Bun.file(filePath).text()] as const),
  );

  try {
    return await operation();
  } finally {
    await Promise.all(
      originals.map(([filePath, contents]) => Bun.write(filePath, contents)),
    );
  }
}
