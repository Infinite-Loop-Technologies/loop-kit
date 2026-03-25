# Agentic Development Workflow

## Strategic Outcome

Build a high-quality agentic development workflow for this repository that gives the human strong operational control, keeps the repo orderly through GTD-style knowledge management, and incrementally grows toward the longer-term Forge and Loop platform ambitions.

This vision is intentionally short-to-medium term: it should improve how work gets done in this repo now, without waiting for the future OCI-first Loop runtime to exist first.

## Architectural Bets

- A Bun-first automation surface under `tools/` is the right short-term orchestration substrate for local agent runs, review loops, event-driven triggers, and operator tooling.
- Moon should be the main structured task/query layer, with Moon MCP available to agents by default.
- The inbox/plan/next-action system is not just documentation; it is the operational control surface for autonomous and semi-autonomous work.
- Simple queue-based intake through `docs/agent-inbox/` and `docs/human-inbox/` is a practical way to support async autonomous work.
- Knowledge hygiene, review rituals, and tooling matter as much as raw code generation quality.

## Decommissioning / Replacement Scope

- Replace ad hoc "open Codex and type a prompt" workflow with a more controlled, inspectable operator loop built from Moon, Bun scripts, and MCP-aware tooling.
- Replace `work-slices` terminology with `next-actions` to align the repo more closely with GTD language and execution semantics.
- Improve existing Moon, MCP, glossary, and knowledge docs so agents have a simpler and more accurate operating surface.

## Linked Project Plans

- [../../project-plans/on-hold/004-agentic-dev-workflow.md](../../project-plans/on-hold/004-agentic-dev-workflow.md)
- [000-forge-local-oci-capability-platform.md](./000-forge-local-oci-capability-platform.md): related longer-term platform vision that this workflow should help bootstrap.

## Open Research Themes

- How far the Bun automation layer should own prompting, agent state, inbox generation, verification, PR flows, and operator UI.
- What custom MCP servers should exist first versus later.
- How much metadata automation is worth adding before it becomes noise.
- Whether additional naming changes beyond `next-actions` are useful or just destabilizing.

## Backlinks

<!-- markdown-backlinks:start -->
- [docs/project-plans/on-hold/004-agentic-dev-workflow.md](../../project-plans/on-hold/004-agentic-dev-workflow.md)
<!-- markdown-backlinks:end -->
