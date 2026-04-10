import { describe, expect, it } from "bun:test";
import { defineEntrypoint, isVoltEntrypoint } from "../../contracts";
import { resolveVoltRuntimeRootDir, runVoltEntrypoint } from "./app";
import { createBunServerServices } from "./services";

describe("Volt Bun entrypoints", () => {
  it("captures a concrete source path from import metadata", () => {
    const entrypoint = defineEntrypoint(import.meta, async () => undefined);

    expect(isVoltEntrypoint(entrypoint)).toBe(true);
    expect(entrypoint.source.endsWith("app.test.ts")).toBe(true);
  });

  it("runs entrypoint handlers through the shared runner", async () => {
    const entrypoint = defineEntrypoint(import.meta, async ({ value }: { value: number }) => value + 1);

    await expect(runVoltEntrypoint(entrypoint, () => ({ value: 2 }))).resolves.toBe(3);
  });

  it("fails fast for missing required environment variables", () => {
    const services = createBunServerServices(import.meta.dir);
    const original = process.env.VOLT_TEST_REQUIRED;

    delete process.env.VOLT_TEST_REQUIRED;

    expect(() => services.env.require("VOLT_TEST_REQUIRED")).toThrow(
      "Missing required environment variable: VOLT_TEST_REQUIRED",
    );

    if (original === undefined) {
      delete process.env.VOLT_TEST_REQUIRED;
      return;
    }

    process.env.VOLT_TEST_REQUIRED = original;
  });

  it("prefers VOLT_ROOT_DIR when resolving Bun runtime services", () => {
    const original = process.env.VOLT_ROOT_DIR;
    process.env.VOLT_ROOT_DIR = "/tmp/volt-app-root";

    expect(resolveVoltRuntimeRootDir()).toBe("/tmp/volt-app-root");

    if (original === undefined) {
      delete process.env.VOLT_ROOT_DIR;
      return;
    }

    process.env.VOLT_ROOT_DIR = original;
  });
});
