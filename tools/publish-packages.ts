import { existsSync, readdirSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

interface PackageManifest {
  dependencies?: Record<string, string>;
  name: string;
  private?: boolean;
  scripts?: Record<string, string>;
  version: string;
  ["x-publish"]?: boolean;
}

interface WorkspacePackage {
  dir: string;
  manifest: PackageManifest;
  manifestPath: string;
}

const rootDir = process.cwd();
const requestedPackage = Bun.argv[2] ?? "all";

const parseEnvLine = (line: string) => {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) {
    return;
  }

  const separator = trimmed.indexOf("=");
  if (separator === -1) {
    return;
  }

  const key = trimmed.slice(0, separator).trim();
  const value = trimmed.slice(separator + 1).trim();
  if (!key || process.env[key]) {
    return;
  }

  process.env[key] = value.replace(/^['"]|['"]$/gu, "");
};

const loadEnvFile = (envPath: string) => {
  if (!existsSync(envPath)) {
    return;
  }

  const contents = readFileSync(envPath, "utf8");
  for (const line of contents.split(/\r?\n/u)) {
    parseEnvLine(line);
  }
};

const readJson = <T>(filePath: string): T =>
  JSON.parse(readFileSync(filePath, "utf8")) as T;

const writeJson = (filePath: string, value: unknown) => {
  writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
};

const collectWorkspacePackages = (): WorkspacePackage[] => {
  const roots = ["apps", "packages"];
  const packages: WorkspacePackage[] = [];

  for (const root of roots) {
    const absoluteRoot = resolve(rootDir, root);
    if (!existsSync(absoluteRoot)) {
      continue;
    }

    for (const entry of readdirSync(absoluteRoot, { withFileTypes: true })) {
      if (!entry.isDirectory()) {
        continue;
      }

      const dir = join(absoluteRoot, entry.name);
      const manifestPath = join(dir, "package.json");
      if (!existsSync(manifestPath)) {
        continue;
      }

      packages.push({
        dir,
        manifest: readJson<PackageManifest>(manifestPath),
        manifestPath,
      });
    }
  }

  return packages;
};

const bumpMinorVersion = (version: string) => {
  const [major, minor, patch] = version.split(".").map((part) => Number(part));
  if ([major, minor, patch].some((part) => Number.isNaN(part))) {
    throw new Error(`Cannot bump non-semver version "${version}".`);
  }

  return `${major}.${minor + 1}.0`;
};

const publishablePackages = (packages: WorkspacePackage[]) =>
  packages.filter((pkg) => pkg.manifest["x-publish"]);

const updateVoltDependency = (
  manifestPath: string,
  version: string,
) => {
  const manifest = readJson<Record<string, unknown>>(manifestPath);
  const dependencies = (manifest.dependencies ?? {}) as Record<string, string>;

  if (!("volt" in dependencies)) {
    return;
  }

  dependencies.volt = `^${version}`;
  manifest.dependencies = dependencies;
  writeJson(manifestPath, manifest);
};

const runCommand = async (cmd: string[], cwd: string, extraEnv?: Record<string, string>) => {
  const child = Bun.spawn({
    cmd,
    cwd,
    env: {
      ...process.env,
      ...extraEnv,
    },
    stderr: "inherit",
    stdout: "inherit",
  });

  const code = await child.exited;
  if (code !== 0) {
    throw new Error(`${cmd.join(" ")} failed in ${cwd} with exit code ${code}.`);
  }
};

const main = async () => {
  loadEnvFile(resolve(rootDir, ".env"));

  const rootManifestPath = resolve(rootDir, "package.json");
  const rootManifest = readJson<Record<string, unknown>>(rootManifestPath);
  const workspaces = collectWorkspacePackages();
  const releasable = publishablePackages(workspaces);
  const selectedPackages = requestedPackage === "all"
    ? releasable
    : releasable.filter(
        (pkg) =>
          pkg.manifest.name === requestedPackage ||
          pkg.manifest.name.replace(/^@[^/]+\//u, "") === requestedPackage,
      );

  if (!selectedPackages.length) {
    throw new Error(`No publishable packages matched "${requestedPackage}".`);
  }

  const versionAnchor =
    releasable.find((pkg) => pkg.manifest.name === "volt") ??
    selectedPackages[0];
  const releaseVersion = bumpMinorVersion(versionAnchor.manifest.version);

  if (typeof rootManifest.version === "string") {
    rootManifest.version = releaseVersion;
    writeJson(rootManifestPath, rootManifest);
  }

  for (const workspace of workspaces) {
    workspace.manifest.version = releaseVersion;
    if (workspace.manifest.dependencies?.volt) {
      workspace.manifest.dependencies.volt = `^${releaseVersion}`;
    }
    writeJson(workspace.manifestPath, workspace.manifest);
  }

  updateVoltDependency(
    resolve(rootDir, "packages", "create-volt", "templates", "minimal", "package.json"),
    releaseVersion,
  );

  const npmToken = process.env.NPM_TOKEN;
  if (!npmToken) {
    throw new Error(
      `Updated versions to ${releaseVersion}, but NPM_TOKEN is not set so publish cannot continue.`,
    );
  }

  const npmrcPath = resolve(rootDir, ".npmrc.publish");
  writeFileSync(npmrcPath, `//registry.npmjs.org/:_authToken=${npmToken}\n`, "utf8");

  try {
    for (const pkg of selectedPackages) {
      if (pkg.manifest.scripts?.["build:package"]) {
        await runCommand(["bun", "run", "build:package"], pkg.dir);
      }

      await runCommand(
        ["npm", "publish", "--access", "public"],
        pkg.dir,
        {
          npm_config_userconfig: npmrcPath,
        },
      );
    }
  } finally {
    if (existsSync(npmrcPath)) {
      unlinkSync(npmrcPath);
    }
  }
};

await main();
