import { F as FatalError, i as start, r as getRun } from "../_libs/@workflow/core+[...].mjs";
//#region workflows/demo-signup.ts
async function demoSignupWorkflow(email) {
	throw new Error("You attempted to execute workflow demoSignupWorkflow function directly. To start a workflow, use start(demoSignupWorkflow) from workflow/api");
}
demoSignupWorkflow.workflowId = "workflow//./workflows/demo-signup//demoSignupWorkflow";
async function createDemoUser(email) {
	const normalizedEmail = email.trim().toLowerCase();
	if (!normalizedEmail.includes("@")) throw new FatalError("Invalid email address");
	console.log(`[workflow] creating demo user for ${normalizedEmail}`);
	return {
		id: crypto.randomUUID(),
		email: normalizedEmail,
		createdAt: (/* @__PURE__ */ new Date()).toISOString()
	};
}
createDemoUser.stepId = "step//./workflows/demo-signup//createDemoUser";
async function queueWelcomeEmail(user) {
	console.log(`[workflow] queueing welcome email for ${user.email}`);
}
queueWelcomeEmail.stepId = "step//./workflows/demo-signup//queueWelcomeEmail";
async function queueOnboardingFollowup(user) {
	console.log(`[workflow] queueing onboarding follow-up for ${user.email}`);
}
queueOnboardingFollowup.stepId = "step//./workflows/demo-signup//queueOnboardingFollowup";
//#endregion
//#region src/routes/workflows.ts
function registerWorkflowRoutes(app) {
	app.post("/api/workflows/demo-signup", async (request, reply) => {
		const { email } = request.body ?? {};
		const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
		if (!normalizedEmail) return reply.code(400).send({ error: "An email address is required." });
		const run = await start(demoSignupWorkflow, [normalizedEmail]);
		return reply.code(202).send({
			message: "Demo signup workflow started",
			runId: run.runId,
			statusPath: `/api/workflows/runs/${run.runId}`
		});
	});
	app.get("/api/workflows/runs/:runId", async (request, reply) => {
		const { runId } = request.params;
		const run = getRun(runId);
		return reply.send({
			runId,
			status: await run.status
		});
	});
}
//#endregion
export { registerWorkflowRoutes as t };
