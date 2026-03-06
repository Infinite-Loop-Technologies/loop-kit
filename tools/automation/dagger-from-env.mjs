#!/usr/bin/env node

import process from "node:process";
import { spawnSync } from "node:child_process";

function parseBoolean(value, fallback) {
  if (value == null || value === "") {
    return fallback;
  }

  const normalized = value.trim().toLowerCase();
  if (["1", "true", "yes", "on"].includes(normalized)) {
    return true;
  }
  if (["0", "false", "no", "off"].includes(normalized)) {
    return false;
  }

  throw new Error(`Invalid boolean value: ${value}`);
}

function runDaggerCall(functionName, args = []) {
  const result = spawnSync(
    "pnpm",
    ["run", "dagger", "--", "call", functionName, ...args],
    {
      stdio: "inherit",
      shell: process.platform === "win32",
      env: process.env,
    },
  );

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function publish(functionName) {
  const tag = process.env.LOOP_PUBLISH_TAG ?? "latest";
  const dryRun = parseBoolean(process.env.LOOP_PUBLISH_DRY_RUN, true);
  const skipChecks = parseBoolean(process.env.LOOP_PUBLISH_SKIP_CHECKS, false);
  const npmToken = process.env.NODE_AUTH_TOKEN ?? process.env.NPM_TOKEN ?? "";

  const args = [
    `--tag=${tag}`,
    `--dry-run=${dryRun}`,
    `--skip-checks=${skipChecks}`,
  ];

  if (npmToken) {
    args.push(`--npm-token=${npmToken}`);
  }

  runDaggerCall(functionName, args);
}

function registry(functionName) {
  const stack = process.env.NITRIC_STACK ?? "gcp-main";
  const envFile = process.env.NITRIC_ENV_FILE ?? ".env.registry";

  const args = [`--env-file=${envFile}`];
  if (functionName === "registry-deploy") {
    args.push(`--stack=${stack}`);
  }

  runDaggerCall(functionName, args);
}

function main() {
  const command = process.argv[2];

  switch (command) {
    case "publish-all":
      publish("publish-packages");
      break;
    case "publish-cli":
      publish("publish-cli-stack");
      break;
    case "registry-spec":
      registry("registry-spec");
      break;
    case "registry-build":
      registry("registry-build");
      break;
    case "registry-deploy":
      registry("registry-deploy");
      break;
    default:
      throw new Error(
        `Unknown command: ${command ?? "<none>"}. Use publish-all, publish-cli, registry-spec, registry-build, or registry-deploy.`,
      );
  }
}

main();
