# Glossary

## Workspace
A project root managed by `loop`, with canonical directories (`apps/`, `packages/`, `assets/`, `tools/`, `loop/`) and a `loop.json` config.

## Package
A workspace-local build unit (for example `packages/*` or `apps/*`) with its own `package.json` and build/type boundaries.

## Component
A reusable installable unit (code/assets/templates) resolved by lane references and installed/updated through patch plans.

## Module
A runtime-loadable extension that provides kernel/CLI capabilities (for example lane providers, patch adapters, toolchain adapters).

## Lane
A source/distribution backend that resolves refs to component/module snapshots and manifests (for example local, file, git, http).

## Provider
A contract implementation exposed by a module or built-in runtime (lane provider, patch adapter, toolchain adapter).

## Snapshot
An immutable version/address of component/module payload + metadata.

## ChangeSet
A proposed delta against a snapshot. (Planned interface in v0 contracts.)

## Patch Plan
A deterministic, reviewable list of idempotent operations with provenance and pre/post conditions.

## Manifest
A versioned schema file describing components/modules and their metadata (`loop.component.json`, `loop.module.json`).
