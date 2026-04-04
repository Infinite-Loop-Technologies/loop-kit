import { clerkClient, getAuth } from "@clerk/fastify";
import type { FastifyInstance } from "fastify";

import type { RuntimeConfig } from "../config.js";

export function registerAuthRoutes(app: FastifyInstance, config: RuntimeConfig) {
  app.get("/api/auth/me", async (request, reply) => {
    if (!config.clerkConfigured) {
      return reply.code(503).send({
        error: "Clerk is not configured. Set CLERK_PUBLISHABLE_KEY and CLERK_SECRET_KEY.",
      });
    }

    const { isAuthenticated, userId, sessionId } = getAuth(request);

    if (!isAuthenticated || !userId) {
      return reply.code(401).send({ error: "User not authenticated" });
    }

    const user = await clerkClient.users.getUser(userId);

    return reply.send({
      message: "Authenticated user loaded",
      user: {
        id: user.id,
        emailAddresses: user.emailAddresses.map((emailAddress) => emailAddress.emailAddress),
        firstName: user.firstName,
        lastName: user.lastName,
      },
      sessionId,
    });
  });
}
