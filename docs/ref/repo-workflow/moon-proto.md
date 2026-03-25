# Moon And Proto

Use Proto for pinned tools and Moon for workspace task execution.

## Primary References

- <https://moonrepo.dev/llms.txt>

## Common Commands

```bash
proto install --yes
proto run pnpm -- install --frozen-lockfile
cd tools && bun install
proto run moon -- sync
proto run moon -- run :build
proto run moon -- run :typecheck
proto run moon -- run :test
proto run moon -- ci :build :typecheck :test
```

## Useful Discovery Commands

```bash
proto run moon -- projects
proto run moon -- tasks
proto run moon -- tasks loop-cli
proto run moon -- query projects --affected --downstream deep
proto run moon -- query tasks --project loop-cli
proto run moon -- query affected --downstream deep
```

These are especially useful for agentic workflows because they let an agent inspect task and project shape without resorting to fragile ad hoc shell logic.

## Moon MCP

Moon ships an MCP server:

```bash
proto run moon -- mcp
```

This repo also keeps a Codex MCP entry in [/.codex/config.toml](../../../.codex/config.toml). Keep that entry pointed at the real workspace root so agents can query Moon directly.

## Repo Notes

- Tool versions are pinned in [/.prototools](../../../.prototools).
- Root convenience scripts live in [/package.json](../../../package.json).
- Prefer explicit Moon targets and Proto-managed tooling over ad hoc global installs.
- The `tools/` project is a Bun package; Moon discovers its scripts as tasks, and those scripts delegate to Bun directly.
- Prefer Moon query output over handwritten task-discovery scripts when you need structured workspace information.

## Backlinks

<!-- markdown-backlinks:start -->
- [docs/next-actions/active/003-dagger-codex-runner-foundation.md](../../next-actions/active/003-dagger-codex-runner-foundation.md)
- [docs/next-actions/active/005-moon-dagger-operator-surface.md](../../next-actions/active/005-moon-dagger-operator-surface.md)
- [docs/next-actions/completed/000-moon-mcp-workflow-baseline.md](../../next-actions/completed/000-moon-mcp-workflow-baseline.md)
- [docs/project-plans/on-hold/004-agentic-dev-workflow.md](../../project-plans/on-hold/004-agentic-dev-workflow.md)
- [docs/ref/repo-workflow/agentic-dev-workflow.md](agentic-dev-workflow.md)
- [docs/ref/repo-workflow/index.md](index.md)
- [docs/ref/repo-workflow/validation-and-verification.md](validation-and-verification.md)
<!-- markdown-backlinks:end -->
