import { unlink } from "node:fs/promises";
import { resolve } from "node:path";

import {
  bumpMinorVersion,
  isPublishablePackage,
  listWorkspacePackages,
  orderPackagesByInternalDeps,
  packageShortName,
  readJson,
  runCommand,
  updateDependencyVersions,
  writeJson,
  type PackageManifest,
  type WorkspacePackage,
} from "./utils";

const rootDir = process.cwd();
const requestedPackage = Bun.argv[2] ?? "all";

function selectPackages(
  publishablePackages: WorkspacePackage[],
  request: string,
) {
  if (request === "all") {
    return publishablePackages;
  }

  return publishablePackages.filter((workspace) =>
    workspace.manifest.name === request ||
    packageShortName(workspace.manifest.name) === request
  );
}

function getReleaseVersion(publishablePackages: WorkspacePackage[]) {
  const versions = [...new Set(publishablePackages.map((workspace) => workspace.manifest.version))];
  if (versions.length !== 1) {
    throw new Error(
      `Publishable packages do not share one version: ${versions.join(", ")}.`,
    );
  }

  return bumpMinorVersion(versions[0]);
}

async function listTemplateManifestPaths(cwd: string) {
  const templateManifestPaths: string[] = [];
  const glob = new Bun.Glob("packages/*/templates/**/package.json");

  for await (const relativePath of glob.scan({ cwd })) {
    templateManifestPaths.push(resolve(cwd, relativePath));
  }

  return templateManifestPaths.sort();
}

async function updateWorkspaceReleaseVersions(
  workspaces: WorkspacePackage[],
  releaseVersion: string,
) {
  const versionsByPackageName = new Map(
    workspaces.map((workspace) => [workspace.manifest.name, releaseVersion]),
  );

  for (const workspace of workspaces) {
    workspace.manifest.version = releaseVersion;
    updateDependencyVersions(workspace.manifest, versionsByPackageName);
    await writeJson(workspace.manifestPath, workspace.manifest);
  }
}

async function updateTemplateDependencies(
  manifestPaths: string[],
  versionsByPackageName: Map<string, string>,
) {
  for (const manifestPath of manifestPaths) {
    const manifest = await readJson<PackageManifest>(manifestPath);
    if (!updateDependencyVersions(manifest, versionsByPackageName)) {
      continue;
    }

    await writeJson(manifestPath, manifest);
  }
}

async function main() {
  const workspaces = await listWorkspacePackages(rootDir);
  const publishablePackages = workspaces.filter(isPublishablePackage);
  const selectedPackages = orderPackagesByInternalDeps(
    selectPackages(publishablePackages, requestedPackage),
  );

  if (selectedPackages.length === 0) {
    throw new Error(`No publishable packages matched "${requestedPackage}".`);
  }

  const releaseVersion = getReleaseVersion(publishablePackages);
  const versionsByPackageName = new Map(
    publishablePackages.map((workspace) => [workspace.manifest.name, releaseVersion]),
  );

  const npmToken = process.env.NODE_AUTH_TOKEN ?? process.env.NPM_TOKEN;
  if (!npmToken) {
    throw new Error(
      `Refusing to update publishable packages to ${releaseVersion} because NODE_AUTH_TOKEN is not set.`,
    );
  }

  await updateWorkspaceReleaseVersions(publishablePackages, releaseVersion);
  await updateTemplateDependencies(await listTemplateManifestPaths(rootDir), versionsByPackageName);

  const npmrcPath = resolve(rootDir, ".npmrc.publish");
  await Bun.write(npmrcPath, `//registry.npmjs.org/:_authToken=${npmToken}\n`);

  try {
    for (const workspace of selectedPackages) {
      if (workspace.manifest.scripts?.["build:package"]) {
        await runCommand(["bun", "run", "build:package"], workspace.dirPath);
      }

      await runCommand(
        [
          "npm",
          "publish",
          "--access",
          workspace.manifest.publishConfig?.access ?? "public",
        ],
        workspace.dirPath,
        {
          npm_config_userconfig: npmrcPath,
        },
      );
    }
  } finally {
    await unlink(npmrcPath).catch(() => undefined);
  }
}

await main();
