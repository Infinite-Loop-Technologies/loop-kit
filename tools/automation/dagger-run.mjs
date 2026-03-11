#!/usr/bin/env node

import process from "node:process";
import { spawnSync } from "node:child_process";

const args = process.argv.slice(2);
while (args[0] === "--") {
  args.shift();
}

const result = spawnSync("dagger", args, {
  stdio: "inherit",
  env: process.env,
});

if (result.error?.code === "ENOENT") {
  console.error(
    "The Dagger CLI was not found on PATH. Install Dagger separately if you still need the legacy release flows.",
  );
  process.exit(1);
}

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}
