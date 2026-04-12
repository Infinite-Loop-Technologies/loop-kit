# AGENTS.md

## Purpose

`loop-kit` is the monorepo for Volt, loop-kit, Forge, and other projects.

## Required Control Plane

For work in this repo, the control plane is repo-local markdown and CKB is the primary repo-understanding layer.

- If CKB is unavailable for non-trivial repo work, stop and report.
- If GitHub MCP or CLI is unavailable, stop only for remote GitHub work that depends on it.
- Do not invent extra planning systems when the existing markdown files are enough.

### Control-Plane Files

- `CHECKLIST.md`
  - the primary task inventory
  - use it for active work, next slices, blockers, and follow-ups worth keeping
- `AGENT_INBOX.md`
  - the agent's temporary capture list
  - use it for future-relevant notes that are not part of the current slice yet
  - process it regularly; do not let it become a second checklist
- `HUMAN_INBOX.md`
  - only for things the human must do, answer, or decide
  - use markdown checkboxes for actionable items
  - include a short `(followup: message me "...")` note on actionable tasks when it would help the next handoff
  - if the agent is blocked on human setup, note the blocker on the relevant checklist item too
- `ARCHITECTURE.md`
  - repo map, high-level architecture, and non-negotiable invariants
  - read it before architecture work, brainstorming, or cross-package changes
- `references/`
  - optional support material for project-specific or general durable reference docs
  - scan filenames first and open only the obviously relevant docs for the current task
  - use obvious filenames instead of links or deep folder trees

### Minimal Semantics

- Keep the system lightweight.
- Prefer editing an existing file over creating a new one.
- Do not create taxonomy for its own sake.
- Do not store trivial scratch notes in `references/`.
- Do not archive by default; delete stale reference docs when they stop being useful.
- If an inbox capture is too large for the inbox, put it in `references/inbox/` with an obvious filename and link to it from the inbox.
- Keep package-local reference material near the package when it is only about that package.
- Use `references/` when a document spans multiple packages, captures repo-level direction, or would be awkward to bury inside one package.

### Suggested Reference Filenames

- `references/project-loom.md`
- `references/project-forge-workspace.md`
- `references/reference-instantdb.md`
- `references/list-potential-future-problems.md`

Do not treat these prefixes as a schema. They are naming hints, not metadata.

## Current Repo Mode

Prototype mode is enabled.

- `dev` is the working integration branch.
- `main` is for deliberate promotion, not routine agent integration.
- Small coherent prototype work may be committed directly on `dev`.
- Use a short-lived feature branch from `dev` when isolation helps.
- Merge validated feature work back into `dev`.
- Do not push to or merge to `main` unless explicitly told to.
- Do not rewrite shared remote history without explicit instruction.
- Do not use worktrees unless there is truly parallel active work.

## Minimal Operating Loop

1. Open with Git reality, not assumptions.
   - run `git status --short --branch`
   - identify the current branch
   - identify whether the tree is dirty
   - identify whether the current branch is ahead or behind its upstream
   - identify whether the current branch is ahead or behind `dev`
   - if the tree is clean and the current branch is unrelated, switch to `dev`
   - if switching branches on a clean tree, fetch first and inspect whether the target branch needs a fast-forward update before working

2. Open with markdown control-plane reality before choosing work.
   - glance `AGENT_INBOX.md`
   - glance `HUMAN_INBOX.md`
   - glance the relevant sections of `CHECKLIST.md`
   - scan `references/` filenames and open only the obviously relevant docs
   - if the task is architectural, cross-package, or concept-heavy, read `ARCHITECTURE.md`
   - if a clearly relevant doc exists in `references/`, read that too

3. Process inbox items before coding when relevant.
   - for each relevant inbox item: do it, delete it, move it to `CHECKLIST.md`, move it to `HUMAN_INBOX.md`, or fold it into a reference doc
   - never move an item out of `AGENT_INBOX.md` and then put the same unresolved note back into `AGENT_INBOX.md`
   - inbox is for capture, not storage

4. For non-trivial code work, use CKB early.
   - call `getStatus()`
   - then use the smallest fitting CKB workflow

5. Choose the smallest coherent slice.
   - a slice is the smallest bounded unit of repo work worth tracking across Git, validation, and blockers
   - a slice is usually one branch-sized implementation unit, but it can also be direct work on `dev` when the change is very small and coherent
   - keep slice tracking lightweight; usually the relevant checklist section is enough

6. Execute, validate, and capture follow-ups as you go.
   - validate at the smallest responsible scope first
   - widen validation only when blast radius grows
   - capture friction, surprises, follow-ups, and future ideas into the markdown control plane instead of relying on memory
   - if a capture is too long for `AGENT_INBOX.md`, store it under `references/inbox/` and link to it from the inbox

7. Close with a mini-review.
   - update the relevant checklist item with branch, validation, blockers, or next-step reality when helpful
   - add a human-facing note to `HUMAN_INBOX.md` when the user or a future session needs something explicit
   - mention in chat when you put something in the human inbox
   - ask the user directly in chat for unblockers instead of hiding them only in markdown

## Git Branch Selection And Salvage

The agent must be comfortable repairing Git state, but not by improvising.

### Start-of-session checks

- always inspect the current branch first
- always inspect whether the tree is dirty
- always inspect ahead/behind relative to the branch upstream when one exists
- always inspect whether the branch is meaningfully behind `dev`
- when remote inspection matters and the tree is clean, prefer `git fetch --all --prune` before deciding

### Default branch choice

- if the current branch is clean and unrelated to the task, switch to `dev`
- if the current branch is already the coherent branch for the task, stay there
- if there is another existing coherent branch for the task, prefer resuming it over creating a duplicate branch

### Wrong-branch recovery

- if related work exists on the wrong branch, preserve it and move it to the right branch instead of ignoring it
- if the tree is dirty but the work is coherent, create or switch to the correct branch and carry the work there safely
- if the tree is dirty and the work slices cannot be classified confidently, stop and report instead of guessing

### Branch maintenance

- delete old local branches after they are merged and clearly no longer needed
- delete old remote branches only when merged and safe
- do not perform destructive cleanup automatically when intent is unclear

## Dirty Main / Mixed Dirty State Salvage

If `main` contains dirty work:

- do not continue normal development on `main`
- do not discard the work
- do not stash by reflex

Use this salvage protocol:

1. classify the dirty state
2. create a local rescue branch from the current state:
   - `rescue/dirty-main-<timestamp>`
3. if needed, create one local preservation commit on the rescue branch
4. use Git + CKB to group the diff into candidate slices
5. if one slice is clearly prerequisite bootstrap or config work:
   - carve it into a clean branch from `dev`
   - validate it
   - merge it into `dev`
6. recreate or rebase later slices on top of updated `dev`
7. keep the rescue branch until all intended slices land
8. if slice classification confidence is low, stop and report the candidate groupings instead of guessing

A local preservation commit on a rescue branch is allowed because it preserves work rather than destroying it.

## Markdown Workflow

Use the markdown control plane instead of external planning software.

### Checklist Rules

- `CHECKLIST.md` is the default home for durable task tracking.
- Keep sections obvious and human-readable.
- Add blockers inline on the relevant task instead of scattering them elsewhere.
- Remove or rewrite stale items during normal work and weekly review.
- If a task is clearly done, mark it done or delete it instead of leaving ambiguous residue.

### Inbox Rules

- `AGENT_INBOX.md` is for captures that should not be lost but are not part of the current slice.
- `HUMAN_INBOX.md` is for explicit asks, decisions, setup steps, or answers needed from the human.
- Use markdown checkboxes in `HUMAN_INBOX.md` for actionable human tasks.
- Add a short `(followup: message me "...")` note when it will make the handoff materially clearer.
- Process inbox items quickly.
- Use GTD-style triage:
  - toss it
  - do it if it is truly tiny
  - move it to `CHECKLIST.md`
  - move it to `HUMAN_INBOX.md`
  - fold it into `ARCHITECTURE.md` or a reference doc if it is durable knowledge
- Do not leave processed items sitting in inboxes.
- If an inbox note becomes long, move the long-form content into `references/inbox/` with an obvious filename and keep only a pointer in the inbox.

### Reference Rules

- Reach for `ARCHITECTURE.md` first for repo-wide concepts and invariants.
- Scan `references/` filenames before opening docs; load only the files that are obviously relevant to the task.
- Create a file in `references/` only when durable support material is actually needed.
- Project support docs are for high-level direction, constraints, and context, not for acting as a second task manager.
- Package-specific docs belong near the package unless the topic spans multiple packages.
- Prefer one obvious file over multiple cross-linked files.
- Prefer filenames that remain understandable in a quick directory scan.
- Avoid links between reference docs when simple filenames and folder scans are enough.

### Maintenance Sweeps

For mind sweeps, problem sweeps, inbox processing, weekly reviews, or autonomous "engage/work" runs:

- scan `AGENT_INBOX.md`, `HUMAN_INBOX.md`, the relevant `CHECKLIST.md` sections, and `references/` filenames first
- open only the obviously relevant reference docs instead of loading all of `references/`
- capture ideas and open loops into `AGENT_INBOX.md` unless they are clearly durable reference material or actionable checklist items
- move human-owned setup, decisions, and unblockers into `HUMAN_INBOX.md`
- if a long-form capture is needed, put it under `references/inbox/` and link to it from the inbox

### Session Open And Close

At session start:

1. glance `AGENT_INBOX.md`
2. glance `HUMAN_INBOX.md`
3. glance the relevant `CHECKLIST.md` sections
4. scan `references/` filenames and open only the obvious relevant docs
5. read `ARCHITECTURE.md` when the task is architectural or unfamiliar
6. identify the next coherent slice before coding

At session end:

1. do a quick mini-review
2. update checklist status, validation, and blockers if needed
3. clear any inbox items processed during the session
4. move unresolved human dependencies into `HUMAN_INBOX.md` and the relevant checklist item
5. tell the user in chat what was updated in the markdown control plane

## Weekly Review

If the user says `do a weekly review`, use the `loop-kit-weekly-review` skill.

The weekly review should be thorough and reconcile:

- `AGENT_INBOX.md`
- `HUMAN_INBOX.md`
- `CHECKLIST.md`
- `ARCHITECTURE.md`
- relevant docs in `references/`
- local Git branch state
- remote branch and PR state when relevant
- stale blockers
- stale tasks
- missing project direction
- reference docs that are obsolete, duplicated, or no longer worth keeping

The weekly review should process inbox items one by one:

1. toss it
2. do it if it is truly tiny
3. move it to `CHECKLIST.md`
4. move it to `HUMAN_INBOX.md`
5. fold it into `ARCHITECTURE.md` or a reference doc

Then review the checklist for stale or completed work, and review reference docs for drift or useless buildup.

Small, obvious cleanup work discovered during the weekly review is allowed when it is low-risk, takes only a few minutes, and can be validated immediately. Do not hide risky cleanup inside the review ritual.

The agent may recommend a weekly review when the inboxes, checklist, or references look neglected.

## Validation

Before finalizing non-trivial work:

- run the smallest relevant validation first
- then run broader validation that matches the blast radius
- stop if failures cannot be clearly attributed or localized
- do not merge to `dev` if unresolved errors, unclear dirty state, or broken required tooling were ignored

## Repo-Specific Tooling

### Proto

Proto stays. Bun is the default runtime.

- Respect `.prototools` when present.
- Prefer Proto-managed binaries over ad hoc global installs when testing repo CLIs or toolchains.
- Use `bun install`, `bun run ...`, and plain `bun <script.ts>` as the default repo workflow.
- Keep automation scripts simple and top-level under `tools/`; do not introduce `tools/src`, nested script packages, or generator-heavy structure unless the task actually needs it.
- Use `tools/publish-packages.ts` for the imported Volt package publishing flow; keep it aligned with the actual publishable Volt workspaces instead of inventing a second release script.
- Prefer Bun-native tests and Bun-run CLIs over Node+tsx wrappers when both are viable. If a CLI is unstable under `--bun` on Windows, keep Bun as the script runner and use the CLI's normal entrypoint instead of forcing the Bun runtime.
- In Bun scripts, prefer Bun APIs first: `Bun.$` for shell work, `Bun.spawn` for subprocesses, `Bun.file`/`Bun.write` for file IO, and top-level `await` by default. Only reach for Node helpers when Bun does not cover the need cleanly.
- Root `tests/` is for repo-level smoke, integration, and orchestration coverage. Package-local tests should stay beside the package when they are package-specific.
- `fixtures/` is optional and should only hold shared fixture data that is reused across packages or repo-level tests.

### MCP usage in this repo

- CKB is the first stop for non-trivial repo understanding.
- Context7 is only for current external docs, not repo-local truth.
- Use `jazz-docs` for Jazz-specific API lookup.

### Volt skill

- For Volt tasks and Volt questions, use the repo-local `volt` skill in `.codex/skills/volt`.
- Treat that skill as the current Volt docs front door for this repo.
- If you change Volt itself in a way that affects authoring, runtime behavior, daemon behavior, or architecture, update the `volt` skill in the same slice.
- Keep the skill concise. Put deeper or unsettled design material in `references/` and `CHECKLIST.md`.

## Reuse Before Reinvention

- Prefer extending an existing reusable package before adding app-local abstractions in `apps/forge`, `apps/dock-demo`, or other demos.
- Reuse shared packages first when the behavior is not product-specific UI copy or one-off demo composition.
- Reusable packages should stay smaller, clearer, and less app-coupled than demos and product shells.
- Do not reintroduce Graphite-style abstraction stacks, naming, or package splits.
- Do not invent alternate interaction systems inside apps when the shared runtime should be extended instead.

### When To Reuse What

- If you are implementing keyboard shortcuts, scoped actions, focus routing, surfaces, drag/drop, or overlays, use `packages/interaction` and `packages/interaction-react`.
- If you are implementing dock state, policy, groups, layers, splitting, attachment, or panel movement, use `packages/dock`.
- If you are implementing React/Loom dock rendering or drag/drop integration, use `packages/loom-pack-dock`.
- If you are implementing local UI state, undoable app state, or workspace-local store logic, prefer `packages/state`.
- If you are implementing runtime topology, managed processes, runtime inputs, daemon-backed resources, tasks, flows, or workspace orchestration, use Volt patterns and the existing Volt docs.

### Package Boundaries

- `packages/interaction` is the headless interaction runtime.
- `packages/interaction-react` is the React bridge for scope registration, DOM ingress, shortcut ingress, drag lifecycle wiring, and overlay hosting.
- `packages/dock` is headless and must stay React-free.
- `packages/loom-pack-dock` is the Loom/React bridge for dock UI and interaction-runtime integration.
- Headless packages must stay React-free unless React is their declared purpose.
- Headless packages must stay theme-agnostic. Theme choice belongs to the app shell or Loom boundary.

### Actions, Commands, And Workflows

- Keep actions, commands, and workflows separate.
- Actions are semantic user intents such as `forge.command-palette.toggle` or `dock.split-panel`.
- Commands are authoritative mutations against stateful services and stores.
- Workflows are async or multi-step orchestration that coordinate commands, runtime handles, IO, and policy.
- Do not collapse all three into one service object or one giant provider.

### Providers, Services, Hooks

- Providers are bridges and composition boundaries, not logic sinks.
- Services should hold durable behavior and state access, but leaf UI should not reach into raw services directly.
- Prefer app-facing hooks and thin feature APIs over exposing raw services to leaf components.
- Keep policy decisions in policy modules, store state in stores, and orchestration in workflows instead of burying them in providers.

### Forge Shape

- Forge is the main product-facing prototype. Product architecture pressure should resolve there first.
- Keep Forge routing shallow. Routing should choose top-level shells, not become the center of app architecture.
- Organize Forge by feature/domain slice and prefer moderately large coherent files over excessive fragmentation.
- Preferred Forge app shape:
  - `apps/forge/src/entrypoints/`
  - `apps/forge/src/app/`
  - `apps/forge/src/runtime/`
  - `apps/forge/src/actions/`
  - `apps/forge/src/commands/`
  - `apps/forge/src/workflows/`
  - `apps/forge/src/features/`
  - `apps/forge/src/queries/`
  - `apps/forge/src/ui/`
- Use a middle layer for UI:
  - headless/domain hook
  - dumb-ish presentational component
  - feature/container composition
- Keep product-specific composition in Forge app code. Promote durable interaction, dock, and state patterns into shared packages.

### Volt Boundaries

- Volt remains responsible for runtime topology, tasks/flows, runtime inputs, daemon/resource ownership, and artifact/integration composition.
- Volt is not a generic replacement for local interaction runtime inside apps.
- When editing current Volt architecture, prefer `defineProjectConfig(...)`, runtime bindings, and `defineRuntimeInputs(...)` over older compatibility-heavy surfaces unless the slice is explicitly about compatibility.

### Local Skill Front Doors

- When working on scopes, actions, shortcuts, drag/drop surfaces, focus routing, or overlays, follow `.codex/skills/interaction-runtime/SKILL.md`.
- When changing Dock, `loom-pack-dock`, or `apps/dock-demo`, follow `.codex/skills/dock-integration/SKILL.md`.
- When shaping Forge feature code, app structure, or hook/container boundaries, follow `.codex/skills/forge-feature-slice/SKILL.md`.
- When editing Volt project config, task/flow topology, runtime bindings, or daemon-facing runtime code, follow `.codex/skills/volt/SKILL.md`.

## Theme And Package Boundaries

- Packs, primitives, provider bridges, and reusable UI packages must not hardcode theme names, concrete theme package imports, or app-level CSS assumptions as part of their public behavior.
- Theme selection belongs to the app shell or outer Loom provider. Reusable packages may consume Loom context, but they must not choose the active theme for the caller.
- Headless packages must stay React-free unless React is the declared purpose of the package. `@loop-kit/dock` is headless; `@loop-kit/loom-pack-dock` is the React bridge.

## Branch / Markdown Control-Plane Cleanup

After a slice is merged to `dev`:

- delete the merged local feature branch if safe
- delete the remote feature branch if merged and no longer needed
- update or remove the corresponding checklist item when appropriate
- clear resolved human inbox items
- remove stale reference notes that only existed for the completed slice

Do not keep dead planning residue around just because it once existed.
