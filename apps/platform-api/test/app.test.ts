import { afterEach, beforeEach, describe, expect, test } from "bun:test";

import { buildApp } from "../src/app.js";

let originalPublishableKey: string | undefined;
let originalSecretKey: string | undefined;

beforeEach(() => {
  originalPublishableKey = process.env.CLERK_PUBLISHABLE_KEY;
  originalSecretKey = process.env.CLERK_SECRET_KEY;
  delete process.env.CLERK_PUBLISHABLE_KEY;
  delete process.env.CLERK_SECRET_KEY;
});

afterEach(() => {
  process.env.CLERK_PUBLISHABLE_KEY = originalPublishableKey;
  process.env.CLERK_SECRET_KEY = originalSecretKey;
});

describe("platform api", () => {
  test("reports service health", async () => {
    const app = await buildApp();

    try {
      const response = await app.inject({
        method: "GET",
        url: "/api/health",
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toMatchObject({
        service: "loop-platform-api",
        status: "ok",
      });
    } finally {
      await app.close();
    }
  });

  test("returns 503 for auth route when Clerk is not configured", async () => {
    const app = await buildApp();

    try {
      const response = await app.inject({
        method: "GET",
        url: "/api/auth/me",
      });

      expect(response.statusCode).toBe(503);
      expect(response.json()).toMatchObject({
        error: "Clerk is not configured. Set CLERK_PUBLISHABLE_KEY and CLERK_SECRET_KEY.",
      });
    } finally {
      await app.close();
    }
  });
});
