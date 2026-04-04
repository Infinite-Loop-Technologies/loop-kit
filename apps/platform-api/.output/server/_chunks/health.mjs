//#region src/routes/health.ts
function registerHealthRoutes(app, config) {
	app.get("/api/health", async () => ({
		service: "loop-platform-api",
		status: "ok",
		auth: { clerkConfigured: config.clerkConfigured },
		workflows: {
			provider: "workflow-devkit",
			buildSystem: "nitro"
		}
	}));
}
//#endregion
export { registerHealthRoutes as t };
