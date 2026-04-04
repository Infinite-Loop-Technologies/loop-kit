import type { FastifyInstance } from "fastify";

import type { RuntimeConfig } from "../config.js";

export function registerHealthRoutes(app: FastifyInstance, config: RuntimeConfig) {
  app.get("/api/health", async () => ({
    service: "loop-platform-api",
    status: "ok",
    auth: {
      clerkConfigured: config.clerkConfigured,
    },
    workflows: {
      provider: "workflow-devkit",
      buildSystem: "nitro",
    },
  }));
}
