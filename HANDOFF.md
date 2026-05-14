# Loop Kit Handoff

This file is the repo's external memory. Read it at session start, then update it
at session end when something changed that would materially help the next agent.
Keep it sharp: useful triggers, current risks, and repo map corrections belong
here; transcripts and stale speculation do not.

## Start Here

- Read `AGENTS.md` first for hard repo rules, then use this file to orient.
- Check `git status --short` before editing. This repo may contain unrelated
  work from another session; do not revert it unless explicitly asked.
- Scan `prompts/` for active prompts when the user asks for a work slice,
  continuation, research thread, or implementation brief. Prompts should be
  long enough to stand alone, non-overlapping, and explicit about blockers in
  frontmatter.
- Scan `docs/references/` filenames before opening references. Open only the
  files that clearly apply to the current work.

## Current State

- The agent workflow now centers on `HANDOFF.md` plus the lightweight
  `prompts/` garden.
- Durable repo-level docs live under `docs/references/`.
- Root package scripts use Bun. Prefer the root scripts in `package.json` for
  package builds, typechecks, linting, and formatting checks.
- The demo strategy is examples-first: `examples/simple` is the tiny
  interaction smoke test, and `examples/workbench` is the richer dock plus
  interaction showcase.
- Existing package/config changes may be present in the worktree. Treat changes
  outside this workflow slice as user-owned unless you made them.

## Active Work

- Continue from `prompts/` when improving the examples. The old DAW-derived
  sandbox has been removed; do not preserve or restore Skraps auth/billing/blob
  service code unless it directly supports Loop Kit examples.
- Current validation from the examples setup slice: package typechecks passed,
  both examples typecheck/build passed, `examples/` Biome passed, and a
  Playwright smoke test passed for workbench load, modal Escape close/reopen,
  dnd-kit drag path, and keyboard signal logging.
- Example servers avoid Bun's default port: workbench defaults to `3010` and
  simple defaults to `3011`, with `PORT` still available as an override.
- Current workbench convention from the user: the primary browser target is
  `https://workbench.localhost`, expected to be running continuously through
  Portless.
- Workbench consumes workspace packages through package `dist` exports. After
  package source edits, run `bun run build:packages` and restart the workbench
  Portless process if the browser target still serves stale package behavior.
- Workbench CSS now uses explicit Tailwind v4 `@source` directives plus a small
  `.workbench-*` fallback component layer so the demo stays legible during
  Bun/Tailwind HMR.
- Workbench UI has been cleaned up to use shadcn semantic tokens by default.
  Runtime/service construction is explicit at the client entrypoint and bridged
  through providers/hooks instead of provider-owned module globals.
- IRA is now a hard repo policy, not a preference. Services own committed truth;
  runtimes own lifecycle/state/signals/tasks/installations; installables own
  policies/effects/adapters; bridges receive runtimes/services and expose hooks;
  UI stays dumb and does not create runtimes, install policies, or coordinate
  cross-service behavior.
- `examples/workbench` Drag/Drop now demonstrates the IRA interaction shape:
  app runtime creates the drag/drop lab service/runtime, UI registers semantic
  interaction targets, and `installDragDropLabInteractionPolicy` owns reorder,
  select, focus, and key-event policy wiring. The lab is now hosted inside its
  own Dock tab stack with physical, guide-line, constrained-zone, and nested
  Dock demos.
- Dock/workbench polish has started: interaction pointer synthesis suppresses
  native text selection only after draggable targets cross the drag threshold;
  DockService has a policy-gated `closeWindow`; workbench Dock/Drag labs render
  state-driven ghosts/previews, hide dock dropzones until drag, expose floating
  window close controls, and include a richer Dock inspector. Dock center drops
  now support ordered tab placement when hovering another tab, and workbench
  split zones are larger invisible hit targets that only show the active side.
- Workbench Drag/Drop demos use before-target reorder semantics. The physical
  demo reflows the dragged row as a live placeholder, the guide-line demo shows
  an in-flow insertion line before the hovered item, list-end drop targets allow
  appending after the last item, and Dock tabs render a vertical insertion
  marker before the hovered tab.
- `docs/references/architecture/dock-and-interaction.md` is the current
  cross-package Dock/Interaction reference for terminology, policies,
  customization points, capabilities, and gaps.

## Action Triggers

- If a user asks to continue prior work, inspect `HANDOFF.md`, `prompts/`, and
  relevant `docs/references/` files before choosing files to edit.
- If a prompt in `prompts/` is stale, fix it before using it. If it is not worth
  fixing, move it to `prompts/archive/` or delete it.
- If a user asks for demo/example work, start from `examples/simple`,
  `examples/workbench`, and the ready prompts before creating a new app.
- Followup prompts are intentionally few and non-overlapping. Current ready
  followups are `prompts/design-system-package-planning.md`,
  `prompts/interaction-shortcut-routing-followup.md`, and
  `prompts/ira-knowledge-base-hardening.md`.
- Superseded finished prompts should live in `prompts/archive/`; do not keep
  stale prompt shells in active `prompts/`.
- UI work should read `docs/references/ui-principles.md` before editing. The
  guide captures repo-level UI architecture, semantic-token styling, bounded
  debug surfaces, and future design-system direction.
- `prompts/interaction-shortcut-routing-followup.md` is ready again; the
  workbench drag/drop lab now proves the current focus/ancestry/editable-target
  baseline before shortcut routing is added.
- If a session uncovers a repeatable trap, add it to `Mistakes To Avoid` in one
  concrete bullet.
- If a note no longer changes future behavior, remove it during session close.

## Mistakes To Avoid

- Do not use `HANDOFF.md` as a running log. Store only information that should
  change a future agent's behavior.
- Do not copy every prompt into `HANDOFF.md`; let `prompts/` be discoverable by
  filename and frontmatter status.
- Do not keep stale prompts because they feel historical. Archive or delete
  them when they stop being safe action triggers.
- Do not infer interaction target hierarchy from React or DOM trees; use
  explicit `parentId`.
- Do not put Dock, app-specific, clip, panel, or asset behavior inside
  `@loop-kit/interaction` core.
- Do not treat dnd-kit as a replacement for dock policy. Use it for app-level
  sortable/list behavior, and keep legal dock drops in dock service/policy code.
- Do not use comment-only edits or random `console.log` touches as the normal
  way to refresh workbench after package edits. Prefer a real source-mode alias,
  package watch, or documented restart strategy.
- Do not use `DockRender` as the primary workbench Dock UI. The workbench should
  prove bring-your-own Dock UI through service/runtime state plus bridge target
  hooks; package defaults are only modest debug rendering.
- Do not put runtime/service construction inside React bridge providers in
  workbench. Create envs at the entrypoint or parent runtime and pass them down.

## Prompt Garden

- Active prompts live in `prompts/`.
- Archived prompts live in `prompts/archive/`.
- Prompt status is frontmatter: `ready` means safe to run, `unready` means draft
  or stale.
- Prompts should be fairly long, self-contained briefs. Do not keep several
  overlapping prompts; use frontmatter blockers when one prompt depends on
  another.
- Prefer obvious prompt filenames over maintaining a separate prompt index.

## Cleanup Notes

- During session close, remove resolved notes from this file instead of carrying
  them forward.
- Keep repo maps in `AGENTS.md`, not here, unless the map detail is temporary or
  risk-related.
- Empty placeholder docs should not be kept. Durable references belong under
  `docs/references/`.
