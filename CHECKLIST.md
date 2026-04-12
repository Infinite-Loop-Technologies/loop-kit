# Checklist

<!--
AI-NOTE:
 - Always use markdown checkboxes: (`- [ ]`)
 - Don't create new checklist items in past tense to log work, only add follow-up work.
-->

## Repository Cleanup, Improvements, and Refactoring

- [x] Refresh the root docs/control-plane surface so `README.md` matches the current Bun/Volt workspace shape, `platform-api`, and repo knowledge-management workflow.
- [ ] Remove remaining Graphite-era residue from tests/generated references (`packages/dock/test/graphite.fixture.ts` and stale generated index references).
- [ ] Reconcile the documented `dev` workflow with GitHub reality. `AGENTS.md` says `dev` is the working integration branch, but the remote currently has no `origin/dev`.
  - [ ] Push the current local `dev` branch to `origin` as a backup unless a concrete remote history/size blocker proves cleanup is required first.
- [ ] Clean up the temp log files that we don't need.
- [ ] Decide whether `apps/platform-api` is a real part of the product topology that should be surfaced in more repo docs/scripts, or whether it should remain an isolated experiment.
- [ ] Decide whether `apps/dock-demo`, `apps/loom-demo`, and `apps/platform-api` should join `volt.workspace.ts` or stay as intentionally separate app-local entrypoints.
- [ ] Add a lightweight repo garbage-collection workflow for temp artifacts, stale branches, stale inbox items, and stale checklist residue.

## Volt

- [ ] Improve `packages/create-volt`
  - [ ] Set up a better method of `create-volt` being able to spawn templates. Perhaps the templates could be higher up in a root `templates` or `examples` folder. These projects could be deployed onto a CDN, perhaps via Vercel Blob. Or, we could compress them and include them in the `create-volt` build. If we keep them lightweight, including them in `create-volt` in a compressed format is my preferred option.
  - [ ] Set up some kind of system that lets us use templates and addons to spawn Volt templates. Perhaps we use EJS, Plop, or something else.
  - [ ] Investigate the concept of integrating `create-volt` with the actual Volt CLI - perhaps they both use could the same code under the hood.
  - [ ] Investigate the concept of being able to spawn templates and install files/code into Volt projects via any URL, perhaps adding a shadcn-like registry system. This could be a similar setup to integrations, meaning you basically can program the CLI in volt.workspace.ts, or volt.config.ts, or elsewhere, and that lets you add new plugins, or extend certain functionality. Investigate this for a lot of cool features. Maybe even some currently built-in Volt CLI features could be moved to plugin functions that are configureable and overridable by the user, just like our runtime/target adapters and so on.
- [ ] Improve the Volt CLI
  - [ ] Fix the Volt TUI's responsive layout - it is glitching and not working correctly.
  - [ ] Set up a simple Volt help command - perhaps this shouldn't open the TUI because that might be jarring. By having this - users who don't wanna use the TUI can quickly learn the flag for non-TUI usage, and quickly see the CLI surface.
  - [ ] Set up the TUI embedded shell to act as a real terminal, not just calling Volt commands.
  - [ ] Spice up Volt TUI with easter eggs and more
    - [ ] Set up  ASCII art and animations. Something with a lightning bolt, perhaps.
- [ ] Build Volt plugin model and programmability of the CLI
  - [ ] Set up a simple, lightweight embedded Snake game, showing off a "plugin" or function that can be set up perhaps in volt.workspace.ts or elsewhere, and hook into the TUI, in a panel, perhaps.
- [ ] Clarify Volt's core product shape in the CLI, docs, and demos: a Bun-native runtime-topology and workflow layer for tasks, managed resources, artifacts, integrations, and future agent workflows.
- [ ] Add a clear agent-workflow story to Volt.
  - [ ] Decide whether agent workflows should be first-class alongside tasks/flows or a specialized flow/task convention.
  - [ ] Keep agent workflows wired from `volt.config.ts` or workspace config instead of inventing a second hidden control plane.
  - [ ] Make agent workflows able to call normal Volt tasks like `dev`, `build`, `lint`, and `test`.
  - [ ] Design how agent workflows can pause for human input, approvals, or follow-up commands without collapsing back into shell scripts.
- [ ] Add a daemon-backed task and workflow session model.
  - [ ] Add `volt task start` so dev-style tasks can keep running after the launch command returns.
  - [ ] Add `volt task ps`, `attach`, and `stop` around daemon-owned task handles.
  - [ ] Add the equivalent session story for flows and future agent workflows.
  - [ ] Make task and workflow sessions render cleanly in the OpenTUI instead of living only in shell output.
- [ ] Prove that ElectroBun works with `apps/volt-demo`.
- [ ] Add a deploy feature to Volt so `volt.config.ts` can model deploys alongside `dev` and `build`.
- [ ] Add richer dev orchestration around readiness, restart policies, owned resource lifecycle, and grouped logs for Bun runtimes.
- [ ] Finish the public model transition from target-first compatibility APIs to the preferred project/task/flow/runtime-input story.
  - [ ] Keep targets as a compatibility surface, not the main mental model.
  - [x] Prototype config-defined `artifacts` as value/module producers resolved before targets.
  - [ ] Decide where `tasks`, `flows`, `artifacts`, `integrations`, `resources`, and future `agents` are meaningfully different versus redundant.
  - [ ] Tighten naming so Volt feels coherent instead of like several partially overlapping abstractions.
- [ ] Add a lightweight dependency graph for build products, not just process order.
  - [x] Prototype artifact dependency ordering and target artifact consumption.
- [ ] Add a plugin-driven workspace daemon model for Volt dev and workspace tooling.
- [x] Upgrade `volt dashboard` into a keyboard-first OpenTUI view for resources, configs, events, and logs.
- [x] Prototype generator-based fibers with named-step memoization and optional local persistence.
- [x] Prototype config-provided serializable services flowing into typed entrypoints.
- [ ] Add code generation as a first-class Volt capability without turning Volt into a generic AST framework.
- [ ] Prove the model with WASM components before generalizing further.
- [ ] Add a better remote template story for GitHub-backed registries instead of only embedded-file manifests.
- [ ] Add an inspect/debug surface in the CLI and TUI so runtime graphs, resolved env, dependency order, and generated inputs are visible.
- [ ] Greatly improve the Volt demos and templates.
- [ ] Add a real docs/content app for Volt, not just the current site shell.
- [ ] Keep the Volt reference docs aligned with the actual preferred public model and trim stale compatibility-heavy explanations.
- [x] Create a repo-local Volt Codex skill and use it as the lightweight Volt docs front door. Keep it updated when Volt changes.
- [ ] Prototype AI tooling around Volt and Codex.
  - [ ] Prove a minimal Codex CLI integration that can run agent workflows against a Volt workspace or project.
  - [ ] Decide later whether the Codex SDK is the default Volt integration path or just another backend.
  - [ ] Capture structured run logs and workflow events instead of treating AI runs as plain terminal text.
- [ ] Set up npm token and publish packages to prove the Volt release flow works.
- [ ] Set up GitHub Actions workflows for publishing Volt packages.
- [ ] Set up deployed Volt examples and choose a hosting story for the longer-running demos.

## Dock

- [ ] `apps/dock-demo` does not show off the features that dock should have. Specifically, drag and drop appears to not be working at all, so there is no way to tell if panel splitting works, or drag overlays, or anything else.
  - [ ] Show off all of dock's features in dock-demo.
    - [ ] The system of panels, and how panels belong to groups, sometimes implicitly, with policy. Show off a main panel view where you can split panels. Then a sidebar panel in a different group on the left, with policy to make it its own group that isn't interopable with the panels from the main group.
    - [ ] Show off the layers system which dock should have. Ensure dock supports this. Specifically, some groups should be allowed to be on separate layers. Use this to show off a modal, and a side peek. The side peek should have the background behind it still interactable.
- [ ] Create a better site for dock that doubles as both a set of demos and documentation for the packages.
  - [ ] Show off themeability via the loom-pack example themed Dock implementation.
- [ ] Gain feature parity with Dockview. <https://dockview.dev/docs/overview/introduction>
- [x] Introduce a reusable interaction runtime split with headless `@loop-kit/interaction`, React bridge `@loop-kit/interaction-react`, headless dock policy/service/commands, and a `loom-pack-dock` drag/drop bridge.

## Forge

- [ ] Build Forge up to be an AI agentic coding driver
  - [ ] Add a new target/entrypoint into Forge. This will be the "AI server". Set up HTTP, websockets, or perhaps some kind of RPC if we wanna go that direction with Volt. Wire up the Codex SDK and make it so you can add a project location in the Forge sidebar using the concept of a "connector" that can sync from filesystem into Forge and create a sort of view.
  - [ ] Set up a durable workflow style system so that if the AI app crashes the AI workflow can continue running.
- [ ] The architecture of Forge is messy and gimmicky, because it's simply a demo. We should improve it:
  - [ ] Implement a simple client-side state store with `@loop-kit/state`.
  - [ ] Implement a service dependency injection pattern inspired by [this](https://www.evolu.dev/docs/dependency-injection) Evolu page.
  - [ ] Implement several services. Do not let services be used from arbitrary React components. They should be created and provided to React Context providers near the app boundary (perhaps in `layout.tsx` for example). Organize providers in a folder, and have a single file for composing them together so that `layout.tsx` doesn't fill up with them.
  - [ ] Implement a simple command pattern. Commands can do side effects, mutations, and more. Arbitrary UI components shouldn't directly use commands, they should go through providers via hooks.
- [ ] Replace the workspace demo with a real workspace.
  - [ ] Set up InstantDB using the information here: [InstantDB Docs](https://www.instantdb.com/llms-full.txt).
  - [ ] Use a service and provider pattern. Again, arbitrary React components should go through hooks from the providers.
  - [ ] Decide and implement the Forge auth direction.
    - [ ] Decide whether Forge should keep InstantDB magic-code auth, move to Clerk-backed auth, or support both with a clear boundary. Current in-flight code uses InstantDB magic code in Forge while `apps/platform-api` is wired around Clerk.
    - [ ] Reorganize routing so logged-out users land on a small landing/auth screen and logged-in users go straight to the workspace.
    - [ ] Ensure users always get a bootstrapped workspace on first sign-in.
    - [ ] Keep backend-only bootstrap/admin logic out of leaf UI code and make the service boundary explicit.
  - [ ] Create a simple InstantDB schema and queries, and wire it up with providers to populate the workspace with real data. Create commands and potentially actions too for various things.
- [ ] Add interactivity to the workspace UI.
  - [ ] Set up a lightweight concept of "actions". Actions can contextually dispatch commands. Use the concept of actions to create a keybindings manager and a real command pallette. This would involve having an actions registry.
  - [ ] Upon loading Forge, the command palette instantly opens up. It should stay closed until toggled via a command, Ctrl+K by default. Use the new keybindings system for this.
  - [ ] Make sure `loom-pack-dock` is being taken advantage of fully, including the drag and drop, and panel splitting. Set up actions and register them to the keybindings system and thew command palette to do things like contextually splitting the panel the user is currently working in. Wire up drag and drop of panels, but make sure that the "node view" panels can't be swapped with panels that aren't compatible such as the sidebar or side peek. Dock is supposed to have a system of layers and groups with policy to prevent this - make sure it's working properly.

## Loom

- [ ] Start building an experimental package for building TUIs with Loom. A good option could be [OpenTUI](https://opentui.com/). The goal of loop-kit is to be able to write a UI how you like, and use it with different themes or renderers. And we can take this a step further by making the same, or similar interaction code work too. But the same theme might not work in both React and TUI. The different renderer support is basically done by themes now! So themes are renderer specific. But the same theme package could export themes for multiple renderers, probably - or something like that. Maybe there's a better solution.

## Extension System

- [ ] Build an extension system and start integrating it into demos.
  - [ ] Create a design document for this. Brainstorm what the package could look like. We need the ability to support different extension runtimes and security tiers. Such as iFrame, WASM, and others. I would like the API for the extension system to be headless and imperative, and perhaps use the service DI pattern. Then higher-level implementations could exist, such as a React provider that makes this easy, by wiring up the ability to create sandboxed iFrames and connecting them to the extension service.

## Building More Demos

- [ ] Build a demo with Volt, ElectroBun, Dock, and others. Goal: It shows off Dock usage but in an infinite canvas.
  - [ ] Keep hardening `apps/volt-canvas-demo` around the new external-surface service/provider architecture until browser panels stay visually and interactively in sync during drag-heavy sessions.
  - [ ] Decide whether the Electrobun webview-tag path is good enough after service/runtime cleanup, or whether the desktop host should switch to a direct `BrowserView` manager.
  - [ ] Add browser-slice restore/session workflows so the demo proves commands, state history, and service-driven restoration together.
  - [ ] Keep trimming app-local styling in the demo where Loom packs or better primitives would clearly help future apps.

## Build more reusable systems and services

- [ ] The system for a surface that embeds a browser into an application. Perhaps this could use some kind of service pattern, so that it can support different contexts. In a web page, the "embedded browser" would be a normal iFrame. But in ElectroBun, it would be a native webview or CEF window with a synchronized position.
  - [ ] Decide whether the app-first external-surface contract from `apps/volt-canvas-demo` should be promoted into a shared package once a browser/iframe second implementation exists.
  - [ ] Add a lightweight workflow layer for external-surface attach/restore/navigation orchestration using cancellable tasks/results instead of leaf-component effects.
  - [ ] Extend `packages/state` further with ergonomic slice-history helpers once a second app proves the new API shape.
