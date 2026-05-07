# Dock and Interaction Architecture

This reference explains the current relationship between `@loop-kit/dock`,
`@loop-kit/dock-react`, and `@loop-kit/interaction`.

## Package Roles

`@loop-kit/interaction` is generic input infrastructure. It owns registered
targets, explicit target ancestry, pointer/key/focus/hover/drag session state,
raw DOM bridges, and synthesized interaction signals. It does not know Dock,
panels, app commands, or product-specific behavior.

`@loop-kit/dock` is the headless Dock engine. It owns the model, committed
service commands, transient dock runtime previews, policy contracts, persistence
adapters, semantic target data, and interaction policies that translate generic
interaction signals into Dock commands.

`@loop-kit/dock-react` is the React bridge. It provides providers, hooks,
registry rendering, and target-registration helpers. It should receive
services/runtimes from composition roots. Its default renderer is intentionally
modest and should not become the workbench's primary Dock UI.

## Terminology

- A **panel** is logical content: `DockPanel` has an id, title, kind, optional
  `surfaceId`, closability, and metadata.
- A **surface** is an addressable presentation surface: `DockSurface` describes
  kind, title, panel/layer relationship, and metadata.
- A **group** is a `DockGroupNode`, a stack of panel ids with a `DockStackMode`
  and active panel.
- A **split** is a `DockSplitNode`, a horizontal or vertical split with a ratio
  and two child layout nodes.
- A **layout** is the committed tree of roots, floating windows, modals,
  overlays, and layers.
- A **window** is a `DockWindowNode`: a floating surface with a frame, root
  layout node, active state, and draggable/resizable flags.
- A **modal** is a `DockModalNode`: an overlayed blocking surface with open,
  queue, Escape, and outside-click behavior.
- An **overlay** currently uses the modal node shape for non-main-layer surfaces.
- A **layer** groups surface ids with z-index and visibility for higher-level
  rendering strategies.

## Service, Runtime, Policy

`DockService` owns committed Dock truth: panels, surfaces, layout, focus,
selection, modal queue, floating windows, and domain events. Commands such as
`selectPanel`, `commitDrop`, `resizeSplit`, `focusWindow`, `moveWindow`,
`resizeWindow`, and `closeWindow` mutate committed state after validation.

`DockRuntime` owns session state: drag previews, resize previews, floating
window move previews, floating window resize previews, hovered drop targets, and
runtime events. It does not persist layout truth.

`DockPolicy` answers permission and constraint questions. Current hooks include
focus, close, drag, drop, split, resize, modal click-behind, allowed placements,
stack mode, resize constraints, and constrained window rects.

`createDockService({ policy })` composes the default Dock policy with the
custom policy. `createDockRuntime({ dock, policy })` composes default policy,
the service policy, and an optional runtime policy. `composeDockPolicies`
combines policies as follows:

- Permission hooks reject if any active policy rejects.
- Value hooks such as `getAllowedPlacements`, `getStackMode`,
  `getResizeConstraints`, and `getConstrainedRect` use the last policy that
  returns a value, so app-level overrides can sit after defaults.

Use custom policies for app-specific permissions and constraints: pinned panels,
restricted drop regions, fixed split ranges, modal click-behind blocking, or
window bounds. Do not put these decisions in React components.

## Interaction Flow

React UI registers semantic targets through `dock-react` hooks such as
`useDockTabTarget`, `useDockDropzoneTarget`, `useDockResizeHandleTarget`,
`useDockWindowTitlebarTarget`, and `useDockWindowResizeHandleTarget`.

`InteractionRuntime` emits generic signals like click, drag start/move/end, key
pressed, and focus changed. `@loop-kit/dock` installs policies into that runtime:

- click policy selects tabs, focuses panels, and handles modal backdrop clicks;
- drag policy starts panel and floating-window move previews, updates placement,
  and commits drops/moves;
- resize policy previews and commits split/window resize;
- modal policy handles Escape and outside click.

The interaction package remains generic. It now suppresses accidental native
text selection only after a draggable target crosses the pointer drag threshold,
while editable targets keep ordinary text selection.

## Current Capabilities

Dock currently supports registered panels, tab groups, split layouts, side roots,
floating windows, modals, overlays/layers as model concepts, closeable surfaces,
policy-gated drops/resizes/closes, runtime drag/resize previews, z-order through
window focus, memory persistence adapters, and React bridge target hooks.

The workbench proves bring-your-own rendering with Dock service/runtime state,
Dock target hooks, InteractionRuntime policies, drag overlays/ghosts, floating
window move/resize, modal close behavior, and policy debugging via
`canApplyPlacement`.

## Current Gaps

Dock does not yet provide a high-level command for converting a tabbed panel
into a floating window and back while preserving all history/restoration
semantics. An app can implement this today by removing the panel from one layout
location and creating an equivalent window/root that references the same panel
id, then later inserting the same panel back into a group. That is acceptable
for simple cases, but a first-class command would need to define restoration
targets, focus behavior, policy checks, and whether surface identity changes.

The package also does not provide a production design system renderer, shortcut
registry, command palette, browser file-drop data bridge, multi-window
persistence strategy, or full active-scope stack. Those belong in future
package or app-level slices.

## Customization Guidance

Use `DockPolicy` when behavior is a Dock permission or constraint. Use a Dock
service command when committed Dock truth changes. Use `DockRuntime` when the
state is transient preview/session state. Use an installable policy when generic
interaction signals should call services or runtimes. Use `dock-react` hooks to
register targets and render state, not to own cross-service behavior.
