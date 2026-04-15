# Checklist

<!--
AI-NOTE:
 - Always use markdown checkboxes: (`- [ ]`)
 - Don't create new checklist items in past tense to log work, only add follow-up work.
-->

## Repository Cleanup, Improvements, and Refactoring

- [ ] Remove remaining Graphite-era residue from tests/generated references (`packages/dock/test/graphite.fixture.ts` and stale generated index references).
- [ ] Clean up the temp log files that we don't need.
- [ ] Remove any references to the remnant experiment `apps/platform-api`
- [ ] Add a lightweight repo garbage-collection workflow for temp artifacts, stale branches, stale inbox items, and stale checklist residue.

## Common Package

- [ ] Clone more files from the original `@evolu/common` package ([Github](https://github.com/evoluhq/evolu/tree/main/packages/common)) and use them to clean up tricky things in `packages/volt` and elsewhere.
  - [ ] [Type](https://github.com/evoluhq/evolu/blob/main/packages/common/src/Type.ts) and [Brand](https://github.com/evoluhq/evolu/blob/main/packages/common/src/Brand.ts) are fantastic and would be great to use as a starting point to our own schema or even contract definition/validation systems.
- [ ] Consider merging `packages/state` and `packages/common`, and by doing that, turn `packages/state` into something more sharp and clearly defined, like the other single-file libraries in `packages/common`. Perhaps even merge it with the original `@evolu/common` systems including Store, Ref, Eq, and others, creating a new system that is more robuts and powerful, bringing useful ideas from `packages/state`, most importantly the system of patch ops.
- [ ] Add some handy reusable systems to this repo for the various problems that constantly keep appearing.
  - [ ] Services/dependency injection. This is an elegant way to create reusable systems that are basically imperative libraries. Platform APIs are a good option here (could be inspired by WASI).
    - [ ] A filesystem one for sure!
    - [ ] Perhaps a keyvalue store.
- [ ] Define the boundaries of the `packages/common` package a bit more. I am okay with keeping a lot in there though, if it cuts down on the overall amount of packages in this workspace - as long as we mostly keep these single-file "libraries" that are allowed to depend on each other.
- [ ] Consider building a more robust platform/environment abstraction system as a library in the common package - where we have shapes and virtual implementations for things like filesystem, clock, and more. Maybe even some WASM/WASI stuff. But should this be in packages/common? Maybe the shapes could be there, and some handy mocks/virtual implementations of some stuff - maybe. Or, we could put actual platform implementations in there? That seems like something Volt adapter creators would handle though - or maybe we should have our own "platform" APIs like Effect. Or we just have folders in common for environments. But then it would seem like we should put Volt adapters in common too. So yeah - that's odd.

## Volt

- [ ] Fix the current bugs and missing features causing Volt to not be fully usable
  - [ ] When you run a task with Volt, you should still be able to swap to another task, and come back to your original one. Maybe we need tabs, or some other UI to help here? Not sure.
  - [ ] It's absolutely critical that adapters can log or set metadata for the current hosted stuff on what port, so users can just easily open the browser to see it - get my point?
  - [ ] The buttons aren't good, improve them! Some type of indication that they were pressed would be useful. The layout on them is also not good, the text is never centered. Note that even if the feedback on the button press is a toast, that's still better than nothing.
  - [ ] I wanted Volt to have a pass-through shell kind of system where you can go "cd" for example and it actually reloads, changing the root of your Volt session. So if you accidentally start Volt outside of your workspace folder, you can CD in.
  - [ ] I want Volt to have a terminal multiplexer type feature. That means set up Dock! Including mouse dragging but also keyboard shortcut stuff too.
  - [ ] Keyboard shortcuts shouldn't be along the button, only one: the shortcut to open the help modal display.
  - [ ] Tabs per-panel is smart actually. And panel groups, likehow Dock works, is smart too, because then we can have certain special panels in their own group like sidebar or inspector that are always far-left or far-right, and tabs don't affect them. Just an idea.
  - [ ] Okay more important than anything, is an improved task logging setup. The little terminal that shows the running task logs should be tabbed or something so we can filter different types of logs - including logs from the browser that are sent through the daemon! Seriously - that should be a thing, wire it up in some demos and show it off, maybe use a special logging service given via adapters, or something like that - or perhaps it doesn't need to be that over the top, maybe an error boundary could work? Not sure, just proxy browser console in an elegant way.
  - [ ] Since we're adding panels, and panel groups, we'll need a whole "selected" and scope system - so let's fully integrate the pattern we have elsewhere of the interaction engine, scopes, actions, commands, and packages/state, and that sort of thing. Although this time we have evolu/common to help us.
- [ ] Refactor Volt to have a more codegen-centric system, and even build utilities/frameworks for working with codegen, as it is extremely useful.
  - [ ] Set up template-based code generation using template literals.
    - [ ] Start by creating an ElectroBun target builder that generates the ElectroBun entry file, the ElectroBun config file, and whatever else we need. End goal: you can get a whole ElectroBun app despite only having a volt.config.ts and an App.tsx React component. Pretty sweet! This codegen should be generated super quickly on the fly in a `.volt` directory, or something.
  - [ ] Finish the generated ElectroBun story so the new adapter handles production packaging, richer BrowserView policy, and clearer app-hook semantics instead of only the current dev-first bootstrap.
- [ ] Experiment with elegant and useful APIs in Volt:
  - [ ] Tagged template literals for codegen, and/or `ts-morph` for generating TS-aware output.
  - [ ] Keep hardening Volt's async task/flow orchestration now that the generator pattern is gone: improve persistence semantics, cancellation, and workspace/project cross-calls.
- [ ] Add more ways to elegantly modify and customize Volt with plugins:
  - [ ] Add persistence to the Volt CLI so that we can begin having user settings.  This requires deciding on a model: what do we store per-workspace? Should Volt be able to work without a workspace? What do we do then? What should we store per-project? And obviously - what should we store per-machine? Should we just store everything per-machine? I'm a fan of workspace/project config because you can back it up in Git. Nobody wants to manually fetch their dotfiles in their home directory and back those up manually. However, copying over user settings from one workspace to another could get annoying, but we could have a simple "copy settings from" feature or something like that.
- [ ] Make `packages/create-volt` and `packages/volt` both be able to create templates, perhaps have them both just pull from templates in a top level `templates` or `examples` folder. Keep things simple. Templates will be lightweight due to codegen and reusing things from Volt and Loom packages. Use Bun's archive compression and just have the template files stored in the package itself for now. No massive assets or anything to weigh things down.
  - [ ] Add lightweight features into this template/project creation experience.
    - [ ] Dependency installation via "bun install". Or post-install scripts and that sort of thing via defined manifests, perhaps?
- [ ] Improve the Volt CLI
  - [ ] A simple non-TUI "volt help" command that explains it.
  - [ ] Set up the TUI embedded shell to act as a real terminal, not just calling Volt commands.
  - [ ] Spice up Volt TUI with easter eggs and more
    - [ ] Figure out a solution for playing ASCII art and animations.
    - [ ] Look into setting up themes and making the UI look better, perhaps using Loom somehow.
    - [ ] Look into chenglou's pretext library for improving text layout and perhaps having cool interactive text animations that are highly performant.
- [ ] Improve Volt's programmability not just for the CLI, but for everything in the ideal scope of Volt:
  - [ ] Investigate being able to set up workspace-level tasks, or tools, and that sort of thing - that the Volt CLI can directly call (like tasks now) - but then also, the Volt Daemon, or some kind of Volt MCP wrapper, could expose as MCP tools directly to agents! Not just user-written MCP tools - some built-in Volt MCP stuff is needed too (that exists now to some extent).
  - [ ] Come up with a solution for installing Volt adapters/integrations/etc. directly from the TUI.
    - [ ] Show off a plugin that adds a snake game feature into the Volt TUI as an example of a plugin that adds a new feature to the Volt CLI.
- [ ] Improve the system of adapters by adding many more useful features.
  - [ ] Add the ability for the Volt daemon and/or CLI to get messages sent from adapters that are logged into the terminal, and queryable from agents via the MCP server system.
    - [ ] Set this up with ElectroBun and Bun fullstack/browser adapters so that the browser console output is relayed into the Volt CLI.
    - [ ] Set up an improved TUI for being able to filter logs per-task in various ways.
- [ ] Greatly improve ElectroBun support.
- [ ] Add richer dev orchestration around readiness, restart policies, owned resource lifecycle, and grouped logs for Bun runtimes.
- [ ] Keep the daemon model workspace-scoped, with explicit workspace identity metadata in daemon state so multiple workspace daemons can coexist safely.
- [ ] Expand `packages/common` carefully from the Evolu-inspired primitives we already have (`Task`, `Resource`, `Result`, `Ref`, `Store`, `Type`, `Schedule`) instead of inventing parallel utilities in Volt.
- [ ] Finish the public model transition from target-first compatibility APIs to the preferred project/task/flow/runtime-input story.
  - [ ] Keep targets as a compatibility surface, not the main mental model.
  - [ ] Decide where `tasks`, `flows`, `artifacts`, `integrations`, `resources`, and future `agents` are meaningfully different versus redundant.
  - [ ] Tighten naming so Volt feels coherent instead of like several partially overlapping abstractions.
- [ ] Add a lightweight dependency graph for build products, not just process order.
- [ ] Prove the model with WASM components before generalizing further.
- [ ] Add an inspect/debug surface in the CLI and TUI so runtime graphs, resolved env, dependency order, and generated inputs are visible.
- [ ] Greatly improve the Volt demos and templates.
- [ ] Add a real docs/content app for Volt, not just the current site shell.
- [ ] Keep the Volt reference docs aligned with the actual preferred public model and trim stale compatibility-heavy explanations.
- [ ] Decide how far the new `@loop-kit/common` fork from Evolu should go: keep it as a trimmed shared primitive set, or grow it into a fuller reusable foundation package.
- [x] Create a repo-local Volt Codex skill and use it as the lightweight Volt docs front door. Keep it updated when Volt changes.
- [ ] Prototype AI tooling around Volt and Codex.
  - [ ] Prove a minimal Codex CLI integration that can run agent workflows against a Volt workspace or project.
  - [ ] Decide later whether the Codex SDK is the default Volt integration path or just another backend.
  - [ ] Capture structured run logs and workflow events instead of treating AI runs as plain terminal text.
- [ ] Set up everything needed to release Volt as a real thing:
  - [ ] A real website with docs.
    - [ ] Deployed Volt examples and choose a hosting story for the longer-running demos.
  - [ ] Published packages
    - [ ] For Volt itself, the CLI
    - [ ] For create-volt so "bun create volt" works.
    - [ ] For the skills and MCP server - this is tricky, because do we somehow embed it into the "volt" package that contains the CLI and daemon, or do we do some other architecture? So the first step is figuring that out!
  - [ ] Consider building a new separate repository for Volt, because this is the loop-kit repo. Or rename this repo.

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
    - [ ] Decide whether Forge should keep InstantDB magic-code auth, move to Clerk-backed auth, or support both with a clear boundary. Feedback from human: use InstantDB auth for the prototype, but InstantDB integrates elegantly with Clerk and we'll want that eventually.
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
- [ ] Make sure icons are working nicely.
- [ ] Create a new category in HUMAN_INBOX for assets or design references that need to be created for the various themes.
- [ ] Brainstorm the concept of various Loom utilities to help themes do tricky stuff performantly, and allow Loom to be extremely fast. For example, [pretext](https://github.com/chenglou/pretext) is going viral to some extent due to its ability to optimize UI layouts.
- [ ] Investigate generative UI as a concept with Loom. Reference [json-render](https://json-render.dev/). This is fairly straightforward as a concept: you have a catalog of components, and a way to create it from data, e.g. JSON.
  - [ ] Pretty straightforward in theory. Go ahead and create a demo showing it off, perhaps in `apps/loom-demo` or elsewhere. I think we should have it work with the concept of actions, and maybe scopes, and perhaps even data binding like `json-render` itself does.
- [ ] Add more themeable/changeable semantic primitives.
  - [ ] Values that drive animations yet are semantic, such as "zoom" and things like that.
- [ ] Create more packs and improve existing packs. Reminder: Packs are still themeable, but they're not exactly "primitives" that every application using Loom would want. They're extensions, in a way.
  - [ ] Perhaps a pack for typography: `loom-pack-typography`
  - [ ] A pack for more advanced animations, maybe?
- [ ] Play with the idea of allowing Loom to target more frameworks and renderers than just React - but by using some kind of codegen or compilation setup.
  - [ ] Loom intentionally separates `loom-core` from the themes, like `loom-theme-base-react`. Creating a "base theme" for a framework is basically the same as adding support for it. The only problem is that we would have to rewrite every theme and component pack and keep them updated! I don't think it's worth it to maintain packs for more frameworks. However, perhaps we could investigate webcomponent generation/wrapping, or some other way of bridging to other frameworks. But more important than framework support, is platform support, such as TUIs, or native UIs, or rendering into a canvas, or rendering via WebGPU. What if we just extract the Loom primitives and the values for them that are created by the themes? That'll get us pretty far, actually - we'll have layout  data, and plenty of style data. The only thing we'll be missing is custom component implementations that skip using Loom primitives and instead use lots of custom CSS and textures and animations. But we can help solve this by just adding Loom primitives that help with these types of things. So ideally by the end of all of this, we're dealing with a descriptive UI state in Loom, and sets of tokens and values, and we can just write adapters. We won't be able to cover every use case in a theme, but we can also just provide ways for theme devs to use cross-platform APIs as much as they can, and have easy fallbacks when they can't. This concept of a sort of "UI IR" is fun. It would probably be compiled data from a theme or a pack, then. Perhaps turned into JSON. So we would need a compiler of sorts. And this doesn't simply allow using React to write a TUI. But it would allow for writing a TUI renderer that simply goes off of a UI description with everything necessary provided as data. So it's a nice substrate/framework for building code generators and more in a way that requires the last amount of maintenance and effort. So this should be considered another addition to this repos long list of future code generation experiments!

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
