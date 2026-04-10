import { describe, expect, it } from "bun:test";
import {
  startManagedProcess,
  stopManagedProcess,
  waitForManagedProcess,
} from "./process";

describe("Volt process runtime", () => {
  it("captures stdout and resolves readiness from stdout", async () => {
    const handle = startManagedProcess(
      "stdout-ready",
      [
        "bun",
        "-e",
        "console.log('booting'); setTimeout(() => { console.log('ready-line'); process.exit(0); }, 20);",
      ],
      {
        forwardOutput: false,
        rootDir: process.cwd(),
        readiness: {
          kind: "stdout",
          pattern: "ready-line",
        },
      },
    );

    await expect(handle.ready).resolves.toBeUndefined();
    await expect(waitForManagedProcess(handle)).resolves.toBeUndefined();
    expect(handle.logs().some((entry) => entry.line.includes("ready-line"))).toBe(true);
  });

  it("stops a long-running process through the managed handle", async () => {
    const handle = startManagedProcess(
      "long-running",
      [
        "bun",
        "-e",
        "console.log('ready-line'); setInterval(() => console.log('tick'), 1000);",
      ],
      {
        forwardOutput: false,
        rootDir: process.cwd(),
        readiness: {
          kind: "stdout",
          pattern: "ready-line",
        },
      },
    );

    await expect(handle.ready).resolves.toBeUndefined();
    await stopManagedProcess(handle);
    await handle.wait();
    expect(["failed", "stopped"]).toContain(handle.status());
  });
});
