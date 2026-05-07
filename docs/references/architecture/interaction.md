# Interaction Runtime and Domain Policies

See also: `./installables.md`.

## Thesis

`InteractionRuntime` is generic infrastructure. It owns target registration,
explicit target ancestry, target roles, geometry access, pointer state, keyboard
state, focus, hover, drag state, and structured interaction signals.

It must not know Dock panel rules, app-specific commands, product concepts, or
example-specific ordering semantics. Domain behavior belongs in installable
policies that consume generic interaction signals and call services/runtimes.

## Current Example Anchor

`examples/workbench/src/client/labs/DragDropLab.tsx` is the reference shape for
app-level interaction behavior:

- `createAppRuntime()` creates the drag/drop lab service, lab runtime, and shared
  `InteractionRuntime`.
- The service owns committed item order and selection.
- The lab runtime owns transient drag preview, focus ancestry, and event log
  state.
- `installDragDropLabInteractionPolicy(...)` installs into
  `InteractionRuntime`, listens to generic drag/click/focus/key signals, and
  commits reorder/select commands through the service.
- React UI renders state, registers semantic targets with `useInteractionTarget`,
  provides DOM geometry through the bridge hook, and does not coordinate
  cross-service behavior.

## Correct Layering

    AppRuntime
      owns app-level services
      owns child runtimes such as DockRuntime and InteractionRuntime
      owns feature runtimes when the feature lifecycle is app-level

    Feature service
      owns committed domain truth
      exposes commands such as reorderItem(), selectItem(), reset()

    Feature runtime
      owns lifecycle, transient state, signals, tasks, and installed modules

    InteractionRuntime
      owns generic interaction state/signals/targets
      does not know feature semantics

    Installable policy
      listens to generic signals
      validates opaque target data
      calls feature services/runtimes
      cleans up all subscriptions on disposal

    React bridge
      exposes selected runtime/service state and commands to components

    UI components
      render state
      register targets with explicit parentId
      provide local refs/geometry
      call bridge commands for direct user actions

## Target Rules

Targets are runtime registrations, not React tree nodes.

Use explicit `parentId` for hierarchy. Do not infer ancestry from the DOM or
React tree. Use `data` for opaque domain payloads and parse it inside the domain
policy, not inside `@loop-kit/interaction`.

Good target roles for examples:

    List boundary: ["command-boundary"]
    Sortable row: ["draggable", "dropzone", "focusable", "selectable"]
    Drag handle: ["draggable", "pressable", "focusable"]
    Editable input: ["text-input", "focusable"]

The editable input case matters: examples must not imply that global shortcuts
should fire blindly while a text input owns focus.

## Drag/Drop Architecture

Split drag/drop into three layers:

1. Adapter layer: DOM, pointer, keyboard, or host-library adapters translate
   host events into generic interaction signals.
2. Interaction layer: `InteractionRuntime` stores active generic drag/focus/key
   state and emits structured signals.
3. Domain policy layer: feature installables interpret opaque target data,
   validate domain rules, and call services.

This applies to app-level examples and Dock. `@loop-kit/dock` installs Dock
policies into `InteractionRuntime`; the workbench drag/drop lab installs its own
reorder policy into the same generic runtime without adding list-ordering logic
to the interaction package.

## Practical Rule

When adding interaction features:

1. Define feature target data outside React.
2. Register semantic interaction targets from UI or bridge hooks.
3. Convert host events to generic interaction signals through adapters.
4. Install feature policies into the owning runtime or `InteractionRuntime`.
5. Let policies call services.
6. Let bridges expose state and commands.
7. Keep leaf UI dumb.
