# Dockyard Registry

The `registry` tree contains installable editable source, manifests, and future templates.

## What Is A Package?

A package is a stable reusable engine or boundary. Packages are the right place for:

- foundational primitives
- headless model logic
- thin framework bridges
- stable services with clear reuse value

## What Is A Registry Item?

A registry item is installable source code intended to be copied into an app and edited. Registry items are the right place for:

- app-facing Dock UI
- policy-heavy wiring
- app-specific provider composition
- source that downstream teams should own directly

## When Code Should Go Into Packages

- when the API should remain stable
- when the behavior is broadly reusable
- when portability matters

## When Code Should Go Into Registry Items

- when the code is app-facing and likely to vary
- when downstream apps need to edit behavior directly
- when the code mixes UI, policy, and glue

## Why Most User-Facing Dock UI Belongs Here

Packages should stay stable. Dock UI often carries product-specific policy, chrome, and composition decisions. That code is better shipped as installable editable source than buried inside core packages.

Services may appear in either place:

- package, when they are foundational and stable
- registry item, when they are app-level wiring, policy, or UI glue

Providers should stay thin. Policy-heavy UI behavior should not be buried in core packages.
