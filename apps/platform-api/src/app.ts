import { clerkPlugin } from "@clerk/fastify";
import Fastify from "fastify";

import { getRuntimeConfig } from "./config.js";
import { registerAuthRoutes } from "./routes/auth.js";
import { registerHealthRoutes } from "./routes/health.js";
import { registerWorkflowRoutes } from "./routes/workflows.js";

export async function buildApp() {
  const config = getRuntimeConfig();
  const app = Fastify({ logger: true });

  if (config.clerkConfigured) {
    await app.register(clerkPlugin);
  } else {
    app.log.warn("Clerk environment variables are not set. Auth routes will stay disabled.");
  }

  registerHealthRoutes(app, config);
  registerAuthRoutes(app, config);
  registerWorkflowRoutes(app);

  return app;
}
