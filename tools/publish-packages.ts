import { resolve } from "node:path";
import { parseArgs } from "node:util";

import {
  bumpVersion,
  isInteractiveTerminal,
  isPublishablePackage,
  isSemverVersion,
  listWorkspacePackages,
  orderPackagesByInternalDeps,
  packageDisplayName,
  packageShortName,
  promptForBoolean,
  promptForMultiSelect,
  promptForSelect,
  promptForText,
  readJson,
  runCommand,
  updateDependencyVersions,
  withTemporaryFileRestore,
  writeJson,
  type PackageManifest,
  type VersionBumpKind,
  type WorkspacePackage,
} from "./utils";

const rootDir = process.cwd();
const usage = `Usage:
  bun run ./tools/publish-packages
  bun run ./tools/publish-packages publish [--package <name>] [--tag <tag>] [--dry-run]
  bun run ./tools/publish-packages bump <patch|minor|major> [--dry-run]
  bun run ./tools/publish-packages release <patch|minor|major> [--package <name>] [--tag <tag>] [--dry-run]
  bun run ./tools/publish-packages release --version <semver> [--package <name>] [--tag <tag>]

Options:
  --package <name>          Publish package short name, full name, or "all" (repeatable)
  --version <semver>        Explicit aligned release version for all publishable packages
  --tag <tag>               Bun publish dist-tag (default: latest)
  --access <access>         Override publish access (default: package publishConfig or public)
  --otp <code>              One-time password for npm auth
  --dry-run                 Preview bump/publish flow and restore manifest files afterward
  --tolerate-republish      Pass through to bun publish
  --non-interactive, --ci   Disable prompts
  --yes                     Skip confirmation prompt in interactive mode
  --help                    Show this help`;

type Action = "publish" | "bump" | "release";

interface CliOptions {
  access?: string;
  action?: Action;
  dryRun: boolean;
  interactive: boolean;
  packageRequests: string[];
  otp?: string;
  tag: string;
  tolerateRepublish: boolean;
  version?: string;
  versionArg?: string;
  yes: boolean;
}

interface PublishOptions {
  access?: string;
  dryRun: boolean;
  otp?: string;
  tag: string;
  tolerateRepublish: boolean;
}

interface ReleasePlan {
  action: Action;
  packageRequests: string[];
  publishOptions: PublishOptions;
  releaseVersion?: string;
}

function normalizePackageRequests(values: readonly string[]) {
  return values
    .flatMap((value) => value.split(","))
    .map((value) => value.trim())
    .filter(Boolean);
}

function selectPackages(
  publishablePackages: WorkspacePackage[],
  requests: readonly string[],
) {
  if (requests.includes("all")) {
    return publishablePackages;
  }

  const requested = new Set(requests);

  return publishablePackages.filter((workspace) =>
    requested.has(workspace.manifest.name) ||
    requested.has(packageShortName(workspace.manifest.name))
  );
}

function getAlignedCurrentVersion(publishablePackages: WorkspacePackage[]) {
  const versions = [...new Set(publishablePackages.map((workspace) => workspace.manifest.version))];
  if (versions.length !== 1) {
    throw new Error(
      `Publishable packages do not share one version: ${versions.join(", ")}.`,
    );
  }

  return versions[0]!;
}

function resolveReleaseVersion(
  currentVersion: string,
  kindOrVersion?: string,
  explicitVersion?: string,
) {
  const candidate = explicitVersion ?? kindOrVersion;
  if (!candidate) {
    return currentVersion;
  }

  if (["patch", "minor", "major"].includes(candidate)) {
    return bumpVersion(currentVersion, candidate as VersionBumpKind);
  }

  if (!isSemverVersion(candidate)) {
    throw new Error(`Expected patch, minor, major, or an explicit semver version. Received "${candidate}".`);
  }

  return candidate;
}

async function listTemplateManifestPaths(cwd: string) {
  const templateManifestPaths: string[] = [];
  const glob = new Bun.Glob("packages/*/templates/**/package.json");

  for await (const relativePath of glob.scan({ cwd })) {
    templateManifestPaths.push(resolve(cwd, relativePath));
  }

  return templateManifestPaths.sort();
}

async function writeAlignedReleaseVersion(
  workspaces: WorkspacePackage[],
  templateManifestPaths: string[],
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

  for (const manifestPath of templateManifestPaths) {
    const manifest = await readJson<PackageManifest>(manifestPath);
    if (!updateDependencyVersions(manifest, versionsByPackageName)) {
      continue;
    }

    await writeJson(manifestPath, manifest);
  }
}

function describePackages(workspaces: WorkspacePackage[]) {
  return workspaces.map((workspace) => workspace.manifest.name).join(", ");
}

function createPublishCommand(
  workspace: WorkspacePackage,
  options: PublishOptions,
) {
  const cmd = [
    "bun",
    "publish",
    "--tag",
    options.tag,
    "--access",
    options.access ?? workspace.manifest.publishConfig?.access ?? "public",
  ];

  if (options.dryRun) {
    cmd.push("--dry-run");
  }

  if (options.tolerateRepublish) {
    cmd.push("--tolerate-republish");
  }

  if (options.otp) {
    cmd.push("--otp", options.otp);
  }

  return cmd;
}

async function runPublish(
  workspaces: WorkspacePackage[],
  publishOptions: PublishOptions,
) {
  for (const workspace of workspaces) {
    console.log(`\n==> ${workspace.manifest.name}`);

    if (workspace.manifest.scripts?.["build:package"]) {
      await runCommand(["bun", "run", "build:package"], workspace.dirPath);
    }

    await runCommand(
      createPublishCommand(workspace, publishOptions),
      workspace.dirPath,
    );
  }
}

function printPlan(
  publishablePackages: WorkspacePackage[],
  selectedPackages: WorkspacePackage[],
  plan: ReleasePlan,
  currentVersion: string,
) {
  console.log("");
  console.log(`Action: ${plan.action}`);
  console.log(`Current version: ${currentVersion}`);
  console.log(`Release version: ${plan.releaseVersion ?? currentVersion}`);
  console.log(`Publish targets: ${plan.action === "bump" ? "(none)" : describePackages(selectedPackages)}`);
  console.log(`Aligned package scope: ${describePackages(publishablePackages)}`);
  console.log(`Tag: ${plan.publishOptions.tag}`);
  console.log(`Dry run: ${plan.publishOptions.dryRun ? "yes" : "no"}`);
  console.log(`Tolerate republish: ${plan.publishOptions.tolerateRepublish ? "yes" : "no"}`);
  console.log("");
}

function parseCli(): CliOptions {
  const parsed = parseArgs({
    allowPositionals: true,
    args: Bun.argv.slice(2),
    options: {
      access: { type: "string" },
      ci: { type: "boolean" },
      "dry-run": { type: "boolean" },
      help: { type: "boolean" },
      "non-interactive": { type: "boolean" },
      otp: { type: "string" },
      package: { multiple: true, type: "string" },
      tag: { type: "string" },
      "tolerate-republish": { type: "boolean" },
      version: { type: "string" },
      yes: { type: "boolean" },
    },
    strict: true,
  });

  if (parsed.values.help) {
    console.log(usage);
    process.exit(0);
  }

  const [first, second] = parsed.positionals;
  const action = first && ["publish", "bump", "release"].includes(first)
    ? first as Action
    : undefined;
  const versionArg = action ? second : first;
  const packageRequests = normalizePackageRequests(parsed.values.package ?? []);

  if (packageRequests.includes("all") && packageRequests.length > 1) {
    throw new Error(`Use either "all" or explicit package names.\n${usage}`);
  }

  return {
    access: parsed.values.access,
    action,
    dryRun: parsed.values["dry-run"] ?? false,
    interactive:
      !(parsed.values["non-interactive"] ?? false) &&
      !(parsed.values.ci ?? false) &&
      isInteractiveTerminal(),
    otp: parsed.values.otp,
    packageRequests,
    tag: parsed.values.tag ?? "latest",
    tolerateRepublish: parsed.values["tolerate-republish"] ?? false,
    version: parsed.values.version,
    versionArg,
    yes: parsed.values.yes ?? false,
  };
}

async function createInteractivePlan(
  publishablePackages: WorkspacePackage[],
  currentVersion: string,
  cli: CliOptions,
) {
  console.log("Release wizard");

  const action = await promptForSelect<Action>(
    "Choose a workflow",
    [
      { label: "Release: bump aligned versions, then publish", value: "release" },
      { label: "Publish only: publish current versions", value: "publish" },
      { label: "Bump only: update aligned versions without publishing", value: "bump" },
    ],
  );

  let releaseVersion: string | undefined;
  if (action !== "publish") {
    const versionMode = await promptForSelect<string>(
      "How should the version change?",
      [
        { label: `Patch -> ${bumpVersion(currentVersion, "patch")}`, value: "patch" },
        { label: `Minor -> ${bumpVersion(currentVersion, "minor")}`, value: "minor" },
        { label: `Major -> ${bumpVersion(currentVersion, "major")}`, value: "major" },
        { label: "Custom version", value: "custom" },
      ],
      1,
    );

    releaseVersion = versionMode === "custom"
      ? await promptForText("Enter the aligned release version", cli.version ?? currentVersion)
      : resolveReleaseVersion(currentVersion, versionMode, cli.version);
  } else if (cli.version) {
    releaseVersion = cli.version;
  }

  const packageOptions = [
    { label: "All publishable packages", value: "all" },
    ...publishablePackages.map((workspace) => ({
      label: packageDisplayName(workspace.manifest.name),
      value: workspace.manifest.name,
    })),
  ];

  const packageRequests = action === "bump"
    ? ["all"]
    : await promptForMultiSelect(
        "Select packages to publish",
        packageOptions,
        cli.packageRequests.length > 0 ? cli.packageRequests : ["all"],
      );

  if (action !== "bump" && packageRequests.length === 0) {
    throw new Error("Select at least one package to publish.");
  }

  const dryRun = await promptForBoolean("Run in dry-run mode", cli.dryRun);
  const tag = action === "bump"
    ? cli.tag
    : await promptForText("Publish tag", cli.tag);
  const tolerateRepublish = action === "bump"
    ? cli.tolerateRepublish
    : await promptForBoolean("Tolerate republishing an existing version", cli.tolerateRepublish);
  const access = action === "bump"
    ? cli.access
    : await promptForText("Override access (leave blank to use package defaults)", cli.access);
  const otp = action === "bump"
    ? cli.otp
    : await promptForText("OTP code if needed (leave blank otherwise)", cli.otp);

  return {
    action,
    packageRequests,
    publishOptions: {
      access: access || undefined,
      dryRun,
      otp: otp || undefined,
      tag,
      tolerateRepublish,
    },
    releaseVersion,
  } satisfies ReleasePlan;
}

function createNonInteractivePlan(
  cli: CliOptions,
  currentVersion: string,
) {
  const action = cli.action ?? "release";
  const packageRequests =
    action === "bump" ? ["all"] : cli.packageRequests.length > 0 ? cli.packageRequests : ["all"];
  const releaseVersion =
    action === "publish" && !cli.version
      ? undefined
      : resolveReleaseVersion(currentVersion, cli.versionArg, cli.version);

  return {
    action,
    packageRequests,
    publishOptions: {
      access: cli.access,
      dryRun: cli.dryRun,
      otp: cli.otp,
      tag: cli.tag,
      tolerateRepublish: cli.tolerateRepublish,
    },
    releaseVersion,
  } satisfies ReleasePlan;
}

async function resolvePlan(
  publishablePackages: WorkspacePackage[],
  currentVersion: string,
) {
  const cli = parseCli();
  const plan = cli.interactive
    ? await createInteractivePlan(publishablePackages, currentVersion, cli)
    : createNonInteractivePlan(cli, currentVersion);

  const selectedPackages = plan.action === "bump"
    ? []
    : orderPackagesByInternalDeps(selectPackages(publishablePackages, plan.packageRequests));

  if (plan.action !== "bump" && selectedPackages.length === 0) {
    throw new Error(`No publishable packages matched "${plan.packageRequests.join(", ")}".`);
  }

  printPlan(publishablePackages, selectedPackages, plan, currentVersion);

  if (cli.interactive && !cli.yes) {
    const confirmed = await promptForBoolean("Continue", false);
    if (!confirmed) {
      console.log("Cancelled.");
      process.exit(0);
    }
  }

  return { cli, plan, selectedPackages };
}

async function main() {
  const workspaces = await listWorkspacePackages(rootDir);
  const publishablePackages = workspaces.filter(isPublishablePackage);
  const currentVersion = getAlignedCurrentVersion(publishablePackages);
  const templateManifestPaths = await listTemplateManifestPaths(rootDir);
  const manifestPathsToRestore = [
    ...publishablePackages.map((workspace) => workspace.manifestPath),
    ...templateManifestPaths,
  ];
  const { plan, selectedPackages } = await resolvePlan(publishablePackages, currentVersion);

  const needsVersionWrite =
    plan.releaseVersion !== undefined && plan.releaseVersion !== currentVersion;
  const needsPublish = plan.action === "publish" || plan.action === "release";
  const needsAuth =
    needsPublish && !plan.publishOptions.dryRun;

  if (needsAuth && !(
    process.env.NPM_CONFIG_TOKEN ||
    process.env.NODE_AUTH_TOKEN ||
    process.env.NPM_TOKEN
  )) {
    throw new Error("Refusing to publish because NPM_CONFIG_TOKEN, NODE_AUTH_TOKEN, or NPM_TOKEN is not set.");
  }

  const runWorkflow = async () => {
    if (needsVersionWrite && plan.releaseVersion) {
      await writeAlignedReleaseVersion(
        publishablePackages,
        templateManifestPaths,
        plan.releaseVersion,
      );
    }

    if (needsPublish) {
      await runPublish(selectedPackages, plan.publishOptions);
    }
  };

  if (plan.publishOptions.dryRun || plan.action === "bump" && plan.publishOptions.dryRun) {
    await withTemporaryFileRestore(manifestPathsToRestore, runWorkflow);
    return;
  }

  await runWorkflow();
}

await main();
