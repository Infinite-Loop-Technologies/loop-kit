export type RuntimeConfig = {
  port: number;
  clerkConfigured: boolean;
};

export function getRuntimeConfig(): RuntimeConfig {
  const port = Number.parseInt(process.env.PORT ?? "3000", 10);
  const clerkConfigured = Boolean(process.env.CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY);

  return {
    port: Number.isFinite(port) ? port : 3000,
    clerkConfigured,
  };
}
