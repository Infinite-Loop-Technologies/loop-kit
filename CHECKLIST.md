# Checklist

## Repository Cleanup, Improvements, and Refactoring

- [ ] Delete `packages/graphite` and `packages/react`, but only after making sure nothing is still depending on them.
- [x] Delete `loopkit-capabilities` and `loopkit-oci`. These are useless experiments.

## Volt

- [x] This repo is at the path `C:\Users\ijhar\Desktop\loop-kit`. Volt is at the path `C:\Users\ijhar\Desktop\volt`. Integrate Volt into this repository. Do not bring over AGENTS.md, or ARCHITECTURE.md. Do merge the CHECKLIST.md underneath the Volt category in our checklist, though. When merging it, do some renaming. There are Volt demo apps - make it clear that that's what they are. Same with the Volt site. Potentially integrate /docs/prototypes/loop-daemon-prototype.md into our knowledge management workflow here - but don't just blindly copy. Do take the /scripts folder though, because it has a handy npm package publishing script that we should absolutely have in this repo - and document that we have that someplace where we document our tooling workflows (AGENTS or ARCHITECTURE or other).
- [x] Convert `apps/loom-demo` and `apps/forge` into Volt apps instead of Vite/Next.js apps.
- [x] Convert `apps/dock-demo` into a Volt app instead of a Vite app.
- [ ] Develop the Volt site a little more. Add a description of what it is, perhaps sentences like: "Make external capabilities feel local, typed, and composable across environments." or "a Bun-native host/metaframework for contract-bound artifacts and services."
- [ ] Integrate Resonate into the repo as durable execution infrastructure for daemon-backed workflows, AI jobs, and Forge automation.
- [ ] Prove that ElectroBun works with `apps/volt-demo`.
- [ ] Add a deploy feature to Volt so `volt.config.ts` can model deploys alongside `dev` and `build`.
- [ ] Add richer dev orchestration around readiness, restart policies, and grouped logs for `bun.command()` targets.
- [x] Add a task-oriented Volt project/workspace model with named tasks, generator flows, and workspace composition.
- [x] Add `volt task list` / `volt task run` and route `volt dev` / `volt build` through task defaults when available.
- [x] Prototype TS-first contracts, entrypoint specs, Bun task helpers, and lightweight contract metadata codegen outside config files.
- [ ] Design Volt's next artifact-aware layer before adding more adapters.
  - [ ] Keep `targets` as runnable and buildable units.
  - [x] Prototype config-defined `artifacts` as value/module producers resolved before targets.
  - [ ] Add a separate concept for produced artifacts or generated modules where `targets`, `artifacts`, and `integrations` stop feeling redundant.
  - [ ] Decide whether the user-facing concept should be called `artifacts`, `integrations`, `resources`, or `loop`.
- [ ] Add a lightweight dependency graph for build products, not just process order.
  - [x] Prototype artifact dependency ordering and target artifact consumption.
- [ ] Add a plugin-driven workspace daemon model for Volt dev.
- [ ] Teach the Volt daemon to persist richer task/workflow state on top of its workspace process model.
- [x] Prototype generator-based fibers with named-step memoization and optional local persistence.
- [x] Prototype config-provided serializable services flowing into typed entrypoints.
- [ ] Add code generation as a first-class Volt capability.
- [ ] Prove the model with WASM components before generalizing further.
- [ ] Add a better remote template story for GitHub-backed registries instead of only embedded-file manifests.
- [ ] Add stronger app templates: multiplayer/fullstack starter, docs starter, and library starter.
- [ ] Add an inspect/debug surface in the CLI so target graphs, resolved env, and dependency order are visible.
- [ ] Greatly improve the Volt demos and templates.
- [ ] Add a real docs/content app for Volt, not just the current site shell.
- [ ] Begin writing Volt documentation about the service dependency pattern, runtimes/platforms, and TypeScript-first dev/build/deploy flows.
- [x] Create a repo-local Volt Codex skill and use it as the lightweight Volt docs front door. Keep it updated when Volt changes.
- [ ] Set up AI tooling via the Volt CLI and installable Volt-specific skills or docs surfaces.
- [ ] Set up npm token and publish packages to prove the Volt release flow works.
- [ ] Set up an actual GitHub repository for Volt.
- [ ] Set up GitHub Actions workflows for publishing Volt packages.
- [ ] Set up deployed Volt examples and choose a hosting story for the longer-running demos.

## Dock

- [ ] `apps/dock-demo` does not show off the features that dock should have. Specifically, drag and drop appears to not be working at all, so there is no way to tell if panel splitting works, or drag overlays, or anything else.
  - [ ] Show off all of dock's features in dock-demo.
    - [ ] The system of panels, and how panels belong to groups, sometimes implicitly, with policy. Show off a main panel view where you can split panels. Then a sidebar panel in a different group on the left, with policy to make it its own group that isn't interopable with the panels from the main group.
    - [ ] Show off the layers system which dock should have. Ensure dock supports this. Specifically, some groups should be allowed to be on separate layers. Use this to show off a modal, and a side peek. The side peek should have the background behind it still interactable.

## Forge

- [ ] The architecture of Forge is messy and gimmicky, because it's simply a demo. We should improve it:
  - [ ] Implement a simple client-side state store with `@loop-kit/state`.
  - [ ] Implement a service dependency injection pattern inspired by [this](https://www.evolu.dev/docs/dependency-injection) Evolu page.
  - [ ] Implement several services. Do not let services be used from arbitrary React components. They should be created and provided to React Context providers near the app boundary (perhaps in `layout.tsx` for example). Organize providers in a folder, and have a single file for composing them together so that `layout.tsx` doesn't fill up with them.
  - [ ] Implement a simple command pattern. Commands can do side effects, mutations, and more. Arbitrary UI components shouldn't directly use commands, they should go through providers via hooks.
- [ ] Replace the workspace demo with a real workspace.
  - [ ] Set up InstantDB using the information [here](https://www.instantdb.com/llms-full.txt).
  - [ ] Use a service and provider pattern. Again, arbitrary React components should go through hooks from the providers.
  - [ ] Set up an authentication workflow using InstantDB's Clerk support. Set up example API keys and I will fill them in. Reorganize the routing layout so that when not logged in, you land on a landing page (very basic). The landing page can have a login/signup button. Have a simple Clerk-powered authentication flow. If the user is logged in, they should be immediately redirected to the workspace route. Users should always have at least one workspace so if they have none, one should be created for them on the backend. Set up the InstantDB admin SDK for Next.js on the backend only for managing users and things.
  - [ ] Create a simple InstantDB schema and queries, and wire it up with providers to populate the workspace with real data. Create commands and potentially actions too for various things.
- [ ] Add interactivity to the workspace UI.
  - [ ] Set up a lightweight concept of "actions". Actions can contextually dispatch commands. Use the concept of actions to create a keybindings manager and a real command pallette. This would involve having an actions registry.
  - [ ] Upon loading Forge, the command palette instantly opens up. It should stay closed until toggled via a command, Ctrl+K by default. Use the new keybindings system for this.
  - [ ] Make sure `loom-pack-dock` is being taken advantage of fully, including the drag and drop, and panel splitting. Set up actions and register them to the keybindings system and thew command palette to do things like contextually splitting the panel the user is currently working in. Wire up drag and drop of panels, but make sure that the "node view" panels can't be swapped with panels that aren't compatible such as the sidebar or side peek. Dock is supposed to have a system of layers and groups with policy to prevent this - make sure it's working properly.
