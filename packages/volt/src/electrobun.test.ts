import { describe, expect, it } from "bun:test";
import { sanitizeForPath } from "./utils";

describe("Electrobun path hygiene", () => {
  it("sanitizes target-backed task names for generated directories", () => {
    expect(sanitizeForPath("dev:desktop")).toBe("dev-desktop");
    expect(sanitizeForPath("build:desktop")).toBe("build-desktop");
  });
});
