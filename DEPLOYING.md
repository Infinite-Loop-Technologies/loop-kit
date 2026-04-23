# Deploying Dockyard On Vercel

If the repo is not already linked to Vercel from this environment, use these exact steps:

1. Run `bun install`.
2. Run `vercel login` if the CLI is not already authenticated.
3. From the repo root, run `vercel link`.
4. Choose or create a project named `dockyard-registry`.
5. Set the root directory to `apps/registry`.
6. Accept the detected Next.js settings.
7. Run `vercel --prod` to create the first production deployment.

Useful follow-up commands:

- `vercel env pull .env.local`
- `vercel project ls`
- `vercel inspect <deployment-url>`
