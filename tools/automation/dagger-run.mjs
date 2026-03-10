#!/usr/bin/env node

import process from "node:process";
import { spawnSync } from "node:child_process";

const args = process.argv.slice(2);
while (args[0] === "--") {
  args.shift();
}

const commandArgs =
  args.length > 0 ? ["run", "dagger", "--", ...args] : ["run", "dagger"];

const result = spawnSync("proto", commandArgs, {
  stdio: "inherit",
  shell: process.platform === "win32",
  env: process.env,
});

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}
