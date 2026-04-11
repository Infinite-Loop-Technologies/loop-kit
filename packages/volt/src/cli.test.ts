import { describe, expect, it } from "bun:test";
import { resolveVoltCliInvocation } from "./cli";

describe("Volt CLI invocation routing", () => {
  it("opens the UI when no command is provided", () => {
    expect(resolveVoltCliInvocation([])).toEqual({
      command: "ui",
      rest: [],
    });
  });

  it("opens the UI when only flags are provided", () => {
    expect(resolveVoltCliInvocation(["--config", "apps/forge/volt.config.ts"])).toEqual({
      command: "ui",
      rest: ["--config", "apps/forge/volt.config.ts"],
    });
  });

  it("routes bare unknown commands to task run", () => {
    expect(resolveVoltCliInvocation(["dev:forge"])).toEqual({
      command: "task-run",
      rest: ["dev:forge"],
    });
  });

  it("keeps known top-level commands intact", () => {
    expect(resolveVoltCliInvocation(["daemon", "status"])).toEqual({
      command: "daemon",
      rest: ["status"],
    });
  });
});
