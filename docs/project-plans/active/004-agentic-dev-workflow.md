# Agentic Dev Workflow Foundation

## Desired Outcome

Establish a practical, controllable agentic development workflow for this repo using Dagger, Moon, Codex, MCP tools, and the GTD-inspired knowledge system so work can be executed asynchronously without degrading repo quality.

The first useful version should support multiple Dagger entrypoints:

- a prompt-driven Codex run for operator-invoked engineering work
- one or more no-prompt recurring runs, such as weekly review or inbox triage
- verification and knowledge-hygiene helpers that can be composed into those runs over time

## Support Material

- Vision: [../../visions/active/001-agentic-development-workflow.md](../../visions/active/001-agentic-development-workflow.md)
- Workflow reference: [../../ref/repo-workflow/agentic-dev-workflow.md](../../ref/repo-workflow/agentic-dev-workflow.md)
- Moon guide: [../../ref/repo-workflow/moon-proto.md](../../ref/repo-workflow/moon-proto.md)
- Validation guide: [../../ref/repo-workflow/validation-and-verification.md](../../ref/repo-workflow/validation-and-verification.md)
- OpenAI Codex SDK: <https://developers.openai.com/codex/sdk>

## Potential Steps

- Put operational Dagger code in a dedicated automation home, likely `tools/dagger` or `tools/agentic`, instead of mixing it with product packages.
- Build a TypeScript Dagger module that treats Codex as the execution agent and Dagger as the orchestration layer around it.
- Start with the Codex SDK for structured thread control and keep Codex CLI as a fallback or operator-facing escape hatch.
- Expose multiple Dagger entrypoints instead of one monolithic loop: prompt-driven runs, weekly review, inbox sweep, verification review, and other recurring flows.
- Use Moon as the human and agent trigger surface for those Dagger entrypoints.
- Keep narrow repo scripts where they are strongest, and let Dagger orchestrate them instead of rewriting every utility into Dagger immediately.

## Linked Next Actions

- [../../next-actions/active/003-dagger-codex-runner-foundation.md](../../next-actions/active/003-dagger-codex-runner-foundation.md)
- [../../next-actions/active/004-recurring-agent-review-entrypoints.md](../../next-actions/active/004-recurring-agent-review-entrypoints.md)
- [../../next-actions/active/005-moon-dagger-operator-surface.md](../../next-actions/active/005-moon-dagger-operator-surface.md)
- [../../next-actions/active/006-agentic-knowledge-automation-boundaries.md](../../next-actions/active/006-agentic-knowledge-automation-boundaries.md)

## Backlinks

<!-- markdown-backlinks:start -->
- [docs/next-actions/active/003-dagger-codex-runner-foundation.md](../../next-actions/active/003-dagger-codex-runner-foundation.md)
- [docs/next-actions/active/004-recurring-agent-review-entrypoints.md](../../next-actions/active/004-recurring-agent-review-entrypoints.md)
- [docs/next-actions/active/005-moon-dagger-operator-surface.md](../../next-actions/active/005-moon-dagger-operator-surface.md)
- [docs/next-actions/active/006-agentic-knowledge-automation-boundaries.md](../../next-actions/active/006-agentic-knowledge-automation-boundaries.md)
- [docs/next-actions/active/019-automation-workflows-and-surface-providers.md](../../next-actions/active/019-automation-workflows-and-surface-providers.md)
- [docs/next-actions/completed/000-moon-mcp-workflow-baseline.md](../../next-actions/completed/000-moon-mcp-workflow-baseline.md)
- [docs/next-actions/completed/001-dagger-agent-control-loop-spike.md](../../next-actions/completed/001-dagger-agent-control-loop-spike.md)
- [docs/next-actions/completed/002-knowledge-workflow-hygiene.md](../../next-actions/completed/002-knowledge-workflow-hygiene.md)
- [docs/visions/active/000-forge-local-oci-capability-platform.md](../../visions/active/000-forge-local-oci-capability-platform.md)
- [docs/visions/active/001-agentic-development-workflow.md](../../visions/active/001-agentic-development-workflow.md)
<!-- markdown-backlinks:end -->
