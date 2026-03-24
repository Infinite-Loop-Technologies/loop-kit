# Codex Runner Foundation

## Outcome

Define and scaffold the first TypeScript Bun automation entrypoint that can launch and supervise Codex-driven engineering work for this repo.

## Links

- Project plan: [../../project-plans/on-hold/004-agentic-dev-workflow.md](../../project-plans/on-hold/004-agentic-dev-workflow.md)
- Support material: [../../ref/repo-workflow/agentic-dev-workflow.md](../../ref/repo-workflow/agentic-dev-workflow.md)
- Support material: [../../ref/repo-workflow/moon-proto.md](../../ref/repo-workflow/moon-proto.md)
- Support material: <https://developers.openai.com/codex/sdk>

## Next Actions

- Decide and document the automation home inside `tools/`.
- Scaffold a TypeScript Bun-driven operator entrypoint such as `promptRun(prompt: string)`.
- Integrate Codex through the SDK first so thread creation, resume, and structured continuation are under program control.
- Define the first reviewable outputs for a run, such as prompt input, repo context summary, verification results, and final operator notes.

## Notes

- Prefer Bun-powered repo automation for orchestration and environment control, not as a replacement for Codex itself.
- Keep Codex CLI available as a fallback or debugging surface, but bias the first implementation toward the SDK.

## Backlinks

<!-- markdown-backlinks:start -->
- [docs/project-plans/on-hold/004-agentic-dev-workflow.md](../../project-plans/on-hold/004-agentic-dev-workflow.md)
<!-- markdown-backlinks:end -->
