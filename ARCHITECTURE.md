# Interaction Runtime Architecture

## InteractionRuntime

`InteractionRuntime` is a long-lived orchestration boundary built on
`@loop-kit/common` Runtime. It owns interaction session state, signals, target
registration, installed modules, and cleanup. It does not own domain truth.

Domain packages install policies into the runtime when they want to react to
interaction signals and call their own services.

## Signals vs Stores

Signals are occurrences: raw pointer input, clicks, drag starts, key presses,
and focus changes. They are created with `createSignal`.

Stores are current state: active pointer, hover target, focus target, drag
session, and pressed keys. Interaction state is runtime/session state, not a
business data source.

## Targets

Targets are explicit runtime registrations with ids, roles, capabilities,
optional data, optional DOM handles, and optional parent ids.

Target hierarchy comes from `parentId`. The interaction package does not use the
React tree or DOM tree as domain hierarchy.

## Installers

Installers attach long-lived modules to a runtime and return leases for cleanup.
The core runtime starts empty. Composition roots install bridges, synthesis, and
domain policies explicitly.

## Bridges

`installDomBridge(root)` adapts DOM events into raw interaction signals. It does
not synthesize clicks, drags, shortcuts, or domain behavior.

The React bridge adapts the runtime into context, a root DOM element, and hooks.
It does not own domain policy.

## Policies

Policies are installers that react to signals and context, then call services.
Dock and other domain packages should install their own policies into
`InteractionRuntime` rather than adding domain behavior to interaction core.

## React Bridge

`@loop-kit/interaction/react` exports `InteractionRoot`,
`InteractionProvider`, and hooks. `InteractionRoot` installs the DOM bridge and,
when requested, default pointer and keyboard synthesis.
