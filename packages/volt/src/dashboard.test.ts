import { describe, expect, it } from "bun:test";

describe("Volt dashboard", () => {
  it("imports the TUI entrypoint without runtime module resolution failures", async () => {
    const module = await import("./dashboard");
    expect(module.runVoltDashboard).toBeDefined();
  });
});
