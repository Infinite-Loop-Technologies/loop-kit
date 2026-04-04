import type { FastifyInstance } from "fastify";
import { getRun, start } from "workflow/api";

import { demoSignupWorkflow } from "../../workflows/demo-signup.js";

type DemoSignupBody = {
  email?: string;
};

export function registerWorkflowRoutes(app: FastifyInstance) {
  app.post("/api/workflows/demo-signup", async (request, reply) => {
    const { email } = (request.body ?? {}) as DemoSignupBody;
    const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";

    if (!normalizedEmail) {
      return reply.code(400).send({ error: "An email address is required." });
    }

    const run = await start(demoSignupWorkflow, [normalizedEmail]);

    return reply.code(202).send({
      message: "Demo signup workflow started",
      runId: run.runId,
      statusPath: `/api/workflows/runs/${run.runId}`,
    });
  });

  app.get("/api/workflows/runs/:runId", async (request, reply) => {
    const { runId } = request.params as { runId: string };
    const run = getRun(runId);

    return reply.send({
      runId,
      status: await run.status,
    });
  });
}
