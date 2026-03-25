# Forge Prototype

## Desired Outcome

Stand up a small but serious Forge prototype that proves the product shape:

- a Bun-first Next.js app with PWA mode enabled
- a Jazz-backed collaborative state layer
- a clear grants and capability approval model for agents and workflows
- a local artifact/runtime lab centered on OCI and policy-aware execution
- a first-class shared UI system that can drive Dock and future Forge surfaces

## Target Stack

- Runtime shell: Bun + Next.js App Router, with PWA support enabled for the web shell.
- Desktop direction: keep ElectroBun in the plan as the later native wrapper, but do not block the first prototype on it.
- Workspace/tooling: pnpm workspace, Proto, and Moon stay as the repo-level workflow surface.
- UI: use `packages/ui` as the canonical design system and Dock host, not a one-off Forge-only component pile.
- Auth: Clerk.
- Billing: Polar.
- Workflow orchestration: Vercel Workflow for agentic runs, step execution, approvals, and controlled long-running work.
- Generic backend surface: Next.js + Vercel server capabilities where possible.
- Collaboration/state fabric: Jazz, including JazzRPC and the rest of the shared-data surface where it fits.
- Artifact/runtime storage: CNCF Distribution OCI registry, starting with a persistent local registry for development.

## Jazz Direction

- Commit to Jazz for the first prototype.
- Keep this research anchor in the plan for future AI follow-up work: <https://jazz.tools/llms-full.txt>
- Prefer the Jazz MCP docs server when available and use the LLM reference only as a fallback research aid.
- Design the first prototype so it can run against a local or development Jazz sync setup without assuming production infrastructure is finished.

## Grants And Capabilities

Forge needs an opinionated grants layer before it needs a broad permissions matrix.

- Every high-risk capability should require explicit approval from the user.
- Workflow runs must enforce grant policy, billing policy, and allowed execution targets before work starts.
- Capability grants should be modeled as first-class records, not hidden inside workflow code.
- Secrets and API keys may need to be brokered by Forge on behalf of capabilities, including future integrations like Polar project provisioning.
- Start simple: approval-gated capabilities, explicit user waits, narrow default allow-lists, and auditable workflow steps.

## Local Dev Environment

- Script a local Forge stack that can bring up the persistent OCI registry, the Forge app, and local workflow/dev helpers from one entrypoint.
- Keep local orchestration in the repo-owned Bun `tools` package so it stays inspectable, scriptable through Moon, and easy to evolve without introducing a second automation framework.
- Make the local registry durable across restarts.
- Keep room for a self-hosted Jazz sync service later, but allow the prototype to point at a development Jazz environment initially.

## Platform Notes

- Container execution matters because agent workflows need a safe place to test code they are working on.
- Forge must not allow arbitrary container execution; registry allow-lists, grants, and billing controls are part of the product surface.
- OCI matters beyond containers because loop-kit is moving toward policy- and plugin-driven artifacts, including WASM components.
- The backend should remain mostly “boring” where possible: Next.js, Vercel, Clerk, Polar, Jazz, and a local OCI lab beat a custom backend maze.

## Backlinks

<!-- markdown-backlinks:start -->
- [docs/visions/active/000-forge-local-oci-capability-platform.md](../../visions/active/000-forge-local-oci-capability-platform.md)
<!-- markdown-backlinks:end -->
