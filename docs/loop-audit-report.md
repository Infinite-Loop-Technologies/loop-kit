# Loop Audit Report (Kernel/Contracts/CLI + `/loop`)

Date: 2026-03-03  
Repo baseline: `3b1c421`

## Scope

Audited:

- `packages/loop-kernel`
- `packages/loop-contracts`
- `packages/loop-cli`
- `/loop` (`components/`, `installs/`, `snapshots/`)

No implementation changes were made in this audit.

## Executive Summary

- Patch execution is deterministic, supports dry-run diffs, and has best-effort rollback on commit failure, but has no user-facing undo/revert system (`packages/loop-kernel/src/patch/executor.ts:120`, `packages/loop-kernel/src/patch/executor.ts:190`).
- Eight patch op kinds are defined and implemented, but only `ensureFile`, `ensureDependency`, and `ensureTsconfigExtends` are emitted by built-in plan builders; the rest are mostly extension-ready (`packages/loop-contracts/src/patch-plan.ts:73`, `packages/loop-kernel/src/toolchain/adapters/typescript.ts:138`, `packages/loop-kernel/src/components/plan.ts:95`).
- Lanes `local` and `file` work for component/module resolve; `git` and `http` are explicit stubs (`packages/loop-kernel/src/lanes/builtin/gitLane.stub.ts:4`, `packages/loop-kernel/src/lanes/builtin/httpLane.stub.ts:4`).
- `loop.json` is required for most kernel APIs via `loadWorkspace`, but this workspace currently has no root `loop.json` file. `lane list` and `toolchain` commands partially fall back to defaults (`packages/loop-kernel/src/workspace/loadWorkspace.ts:18`, `packages/loop-kernel/src/kernel.ts:302`, `packages/loop-kernel/src/kernel.ts:391`).
- CLI command surface is implemented, but feature gaps remain (no undo command, no publish command, no module command, lane auth storage not integrated into providers).
- Tests are mostly unit/integration on temp dirs; no full CLI e2e and limited coverage of lane/auth/patch edge cases.

---

## 1) Patch Plan system

### 1.1 Does undo exist?

Short answer: no end-user undo exists.

What exists today:

- Transaction-like commit rollback if file writes fail mid-commit. Executor restores previous file states where possible (`packages/loop-kernel/src/patch/executor.ts:94`, `packages/loop-kernel/src/patch/executor.ts:106`).
- Commit failure emits diagnostic `patch.commit_failed` (`packages/loop-kernel/src/patch/executor.ts:198`).
- Test coverage exists for rollback-on-commit-failure (`packages/loop-kernel/test/patchExecutor.test.ts:94`).

What is missing for true undo:

- No persisted execution journal.
- No inverse-operation generation.
- No CLI/API `undo` endpoint/command.
- No snapshot-based restore path tied to patch executions.

### 1.2 Patch operations that exist today + schemas

Defined in contracts as discriminated union (`packages/loop-contracts/src/patch-plan.ts:73`):

1. `ensureDependency`  
   Schema: `kind`, `opId`, `packageJsonPath`, `dependencyType`, `name`, `version`  
   Reference: `packages/loop-contracts/src/patch-plan.ts:9`
2. `ensureExportsEntry`  
   Schema: `kind`, `opId`, `packageJsonPath`, `exportPath`, `value`  
   Reference: `packages/loop-contracts/src/patch-plan.ts:18`
3. `ensureTsconfigExtends`  
   Schema: `kind`, `opId`, `tsconfigPath`, `extendsPath`  
   Reference: `packages/loop-contracts/src/patch-plan.ts:26`
4. `ensureFile`  
   Schema: `kind`, `opId`, `path`, `content`, `overwrite`  
   Reference: `packages/loop-contracts/src/patch-plan.ts:33`
5. `ensureSentinelBlock`  
   Schema: `kind`, `opId`, `path`, `sentinelId`, `content`, `mode`  
   Reference: `packages/loop-contracts/src/patch-plan.ts:41`
6. `applyJsonMergePatch`  
   Schema: `kind`, `opId`, `path`, `patch`  
   Reference: `packages/loop-contracts/src/patch-plan.ts:50`
7. `applyUnifiedDiff`  
   Schema: `kind`, `opId`, `path`, `diff`  
   Reference: `packages/loop-contracts/src/patch-plan.ts:57`
8. `tsEnsureImportAndWrapReactRoot`  
   Schema: `kind`, `opId`, `path`, `importSource`, `importName`, `wrapperName`  
   Reference: `packages/loop-contracts/src/patch-plan.ts:64`

All eight are mapped to handlers in the executor (`packages/loop-kernel/src/patch/executor.ts:25`).

### 1.3 Which operations support dry-run diffs, and how are diffs computed?

Current behavior:

- Diffs are computed centrally after all ops execute against buffered files; not per-op implementation-specific (`packages/loop-kernel/src/patch/executor.ts:179`).
- `createPatch` from `diff` computes unified patch from `originalContent` vs `currentContent` for each modified buffered file (`packages/loop-kernel/src/patch/executor.ts:182`).
- `dryRun=true` skips commit but still returns `diffByFile` (`packages/loop-kernel/src/patch/executor.ts:190`).

Implication:

- Any operation that mutates buffered content via `runtime.setFileContent(...)` contributes to dry-run diff output.
- `OperationResult.diff` exists in contracts but is not populated by current handlers (`packages/loop-contracts/src/patch-plan.ts:98`).

### 1.4 Idempotency: how enforced or expected?

Enforced mostly at operation-handler level:

- `ensureFile` no-ops when target already matches expected content (`packages/loop-kernel/src/patch/ops/ensureFile.ts:46`).
- `ensureDependency` no-ops when version already matches (`packages/loop-kernel/src/patch/ops/ensureDependency.ts:31`).
- `ensureExportsEntry` compares serialized prior vs next value (`packages/loop-kernel/src/patch/ops/ensureExportsEntry.ts:27`).
- `ensureTsconfigExtends` no-ops if `extends` already matches (`packages/loop-kernel/src/patch/ops/ensureTsconfigExtends.ts:17`).
- `ensureSentinelBlock` no-ops if no net content change (`packages/loop-kernel/src/patch/ops/ensureSentinelBlock.ts:42`).
- `applyJsonMergePatch` no-ops if merged output equals current (`packages/loop-kernel/src/patch/ops/applyJsonMergePatch.ts:15`).
- `tsEnsureImportAndWrapReactRoot` no-ops if import/wrap already present (`packages/loop-kernel/src/patch/ops/tsEnsureImportAndWrapReactRoot.ts:129`).

Known non-strong idempotency areas:

- `applyUnifiedDiff` is patch-context dependent and can fail on repeated application (`packages/loop-kernel/src/patch/ops/applyUnifiedDiff.ts:26`).
- Preconditions/postconditions are modeled in schema but never enforced in executor (`packages/loop-contracts/src/patch-plan.ts:94`; no runtime checks in `packages/loop-kernel/src/patch/executor.ts:120`).
- No opId uniqueness checks or global idempotency registry.

Test evidence:

- Explicit idempotency test exists only for `ensureFile + ensureDependency` (`packages/loop-kernel/test/patchExecutor.test.ts:9`).

### 1.5 Where are Patch Plans recorded?

Persisted:

- Component manifest `patches[]` stores patch plans as declarative install-time payload (`packages/loop-contracts/src/manifests/component.ts:24`).

Not persisted as execution history:

- Runtime plans/executions are returned in memory/CLI output, not written to a patch history file.
- `components.lock.json` records install metadata and managed files, not plans/results (`packages/loop-contracts/src/lockfile.ts:18`, `packages/loop-kernel/src/components/lockfile.ts:9`).

---

## 2) Lanes

### 2.1 Lane providers that exist today

Registered built-ins:

- `local` (`LocalLaneProvider`)
- `file` (`FileLaneProvider`)
- `git` (`GitLaneProviderStub`)
- `http` (`HttpLaneProviderStub`)  
  Reference: `packages/loop-kernel/src/kernel.ts:89`

`git`/`http` are stubs:

- Both return `not_implemented` errors for component/module resolve (`packages/loop-kernel/src/lanes/builtin/gitLane.stub.ts:11`, `packages/loop-kernel/src/lanes/builtin/httpLane.stub.ts:11`).

### 2.2 Resolve/ref behavior, manifest/snapshot retrieval, publish support

Ref parsing entrypoint:

- `parseLoopRef` supports `local:`, `file:`, `git:`, `http(s)`, `loop://`, `npm:` (`packages/loop-contracts/src/refs.ts:140`).

Component resolve routing:

- Kernel maps parsed ref kinds to lane IDs in `resolveComponentRef`: `file->file`, `git->git`, `http->http`, `loop->local`, default local (`packages/loop-kernel/src/components/resolve.ts:21`).
- `loop://namespace/name` is normalized to local `id = namespace/name` (`packages/loop-kernel/src/components/resolve.ts:40`).
- `npm:` refs parse in contracts but are not lane-routed explicitly; they fall through and then fail against local lane ref-kind checks (`packages/loop-contracts/src/refs.ts:33`, `packages/loop-kernel/src/components/resolve.ts:21`, `packages/loop-kernel/src/lanes/builtin/localLane.ts:116`).

Lane-specific behavior:

1. `local`
   - Accepts only `local` refs for components/modules (`packages/loop-kernel/src/lanes/builtin/localLane.ts:116`, `packages/loop-kernel/src/lanes/builtin/localLane.ts:130`).
   - Component manifest path: `loop/components/<id>/loop.component.json` (`packages/loop-kernel/src/lanes/builtin/localLane.ts:123`).
   - Module manifest path: `loop/modules/<id>/loop.module.json` (`packages/loop-kernel/src/lanes/builtin/localLane.ts:137`).
   - Component snapshot ID: `manifest.snapshot` or hash(manifest + file contents) (`packages/loop-kernel/src/lanes/builtin/localLane.ts:60`).
   - Module snapshot ID: hash(manifest JSON only) (`packages/loop-kernel/src/lanes/builtin/localLane.ts:100`).
2. `file`
   - Accepts only `file` refs (`packages/loop-kernel/src/lanes/builtin/fileLane.ts:44`, `packages/loop-kernel/src/lanes/builtin/fileLane.ts:95`).
   - Resolves either explicit `.json` manifest path or directory + default manifest filename (`packages/loop-kernel/src/lanes/builtin/fileLane.ts:17`).
   - Component snapshot ID: `manifest.snapshot` or hash(manifest + file contents) (`packages/loop-kernel/src/lanes/builtin/fileLane.ts:86`).
   - Module snapshot ID: hash(manifest JSON only) (`packages/loop-kernel/src/lanes/builtin/fileLane.ts:138`).
3. `git`
   - Resolve component/module: stub errors (`packages/loop-kernel/src/lanes/builtin/gitLane.stub.ts:8`).
4. `http`
   - Resolve component/module: stub errors (`packages/loop-kernel/src/lanes/builtin/httpLane.stub.ts:8`).

Publish support:

- None in lane capability interface (`resolveComponent`, `resolveModule`, optional auth only) (`packages/loop-kernel/src/providers/capabilities/lane.ts:9`).
- `extract` writes directly to local filesystem (`loop/components` + `loop/snapshots`) without going through a lane publish API (`packages/loop-kernel/src/components/extract.ts:74`, `packages/loop-kernel/src/components/extract.ts:123`).

### 2.3 Auth representation

Auth shape in code:

- Provider capability supports optional `getAuthStatus` and `auth(token?)` (`packages/loop-kernel/src/providers/capabilities/lane.ts:21`).
- `local` and `file` report authenticated=true and no token requirement (`packages/loop-kernel/src/lanes/builtin/localLane.ts:141`, `packages/loop-kernel/src/lanes/builtin/fileLane.ts:142`).
- `git`/`http` report unauthenticated + not implemented (`packages/loop-kernel/src/lanes/builtin/gitLane.stub.ts:26`, `packages/loop-kernel/src/lanes/builtin/httpLane.stub.ts:26`).

Persistent token storage:

- `lane auth` stores token in `loop/auth.json` keyed by lane ID, with `updatedAt` timestamp; `.gitignore` is amended with `loop/auth.json` marker (`packages/loop-kernel/src/kernel.ts:350`).

Gap:

- Stored auth token is not consumed by lane providers today.

---

## 3) Components/modules

### 3.1 Current manifest format usage + storage

Contracts:

- Component manifest schema (`loop.component.json`): `schemaVersion`, `kind=component`, `id/name/version`, optional `snapshot`, `files[]`, `patches[]`, `dependencies[]`, `targets[]`, optional metadata (`packages/loop-contracts/src/manifests/component.ts:15`).
- Module manifest schema (`loop.module.json`): `schemaVersion`, `kind=module`, `entry`, `provides[]`, optional `configSchema`, `permissions[]` (`packages/loop-contracts/src/manifests/module.ts:9`).

Observed `/loop` usage in this repo:

- Component manifests exist at:
  - `loop/components/ui-button/loop.component.json`
  - `loop/components/ui-prose/loop.component.json`
  - `loop/components/dock-starter/loop.component.json`
- All currently have `patches: []` and explicit `dependencies` arrays (`loop/components/ui-button/loop.component.json:18`, `loop/components/ui-prose/loop.component.json:22`, `loop/components/dock-starter/loop.component.json:14`).
- `loop/snapshots/` exists but is currently empty in this workspace (filesystem inspection, 2026-03-03).

Module manifests in repo:

- No `loop/modules/*/loop.module.json` present in `/loop` currently.
- Dynamic module loader expects this location for local refs (`packages/loop-kernel/src/providers/host.ts:72`, `packages/loop-kernel/src/providers/host.ts:87`).

### 3.2 How `loop.json` is loaded and interpreted

Load behavior:

- Workspace loader requires `<workspaceRoot>/loop.json`; missing file is error `workspace.missing` (`packages/loop-kernel/src/workspace/loadWorkspace.ts:17`).
- File is parsed and validated against `LoopWorkspaceConfigSchema` (`packages/loop-kernel/src/workspace/loadWorkspace.ts:36`).

Interpretation in kernel:

- Most component/lane/toolchain operations call `getWorkspaceConfig()` first, which triggers module loading once per kernel instance (`packages/loop-kernel/src/kernel.ts:98`, `packages/loop-kernel/src/kernel.ts:104`).
- Module loading reads `modules[]`, supports only `file` and `local` refs right now (`packages/loop-kernel/src/providers/host.ts:67`, `packages/loop-kernel/src/providers/host.ts:71`).

Notable current-state behavior:

- This workspace has no root `loop.json` file (audit check on 2026-03-03).
- `lane list` and `toolchain status/sync` fall back to in-memory defaults if workspace load fails (`packages/loop-kernel/src/kernel.ts:304`, `packages/loop-kernel/src/kernel.ts:393`).
- `lane add` does not fall back; it requires load success then writes `loop.json` (`packages/loop-kernel/src/kernel.ts:332`, `packages/loop-kernel/src/kernel.ts:346`).

### 3.3 Lockfile: exists and what it records

Yes, lockfile exists:

- Path constant: `loop/installs/components.lock.json` (`packages/loop-kernel/src/components/lockfile.ts:9`).
- Schema:
  - File-level: `schemaVersion`, `installs[]` (`packages/loop-contracts/src/lockfile.ts:18`).
  - Per install: `componentId`, `laneId`, `ref`, `snapshotId`, `targetPath`, `installedAt`, `ignoreGlobs`, `managedFiles[{path,sha256,mtimeMs}]` (`packages/loop-contracts/src/lockfile.ts:3`).
- Current workspace file exists and is empty installs array (`loop/installs/components.lock.json:1`).

---

## 4) CLI

### 4.1 Implemented vs stubbed commands

Implemented command wiring in `program.ts`:

- `init`
- `doctor`
- `fix`
- `graph`
- `new app`
- `new pkg`
- `add`
- `update`
- `diff`
- `extract`
- `lane list`
- `lane add`
- `lane auth`
- `toolchain status`
- `toolchain sync`  
Reference: `packages/loop-cli/src/program.ts:19`

Each command has a concrete handler calling kernel APIs (examples: `packages/loop-cli/src/commands/component.ts:4`, `packages/loop-cli/src/commands/lane.ts:3`, `packages/loop-cli/src/commands/toolchain.ts:5`).

Stub/gap findings:

- CLI command surface itself is not stubbed, but backend capabilities are partially stubbed (`git`/`http` lanes).
- No CLI commands for:
  - patch undo/revert
  - component/module publish
  - module management/inspection
- `lane auth` stores token but does not invoke provider-specific auth hooks (`packages/loop-kernel/src/kernel.ts:350`).

### 4.2 Is `--cwd` implemented correctly across commands?

By code inspection: mostly yes.

- Global `--cwd` is defined once and read in every command action via `program.opts<{cwd?: string}>()` (`packages/loop-cli/src/program.ts:17`, `packages/loop-cli/src/program.ts:25`, `packages/loop-cli/src/program.ts:38`, ...).
- All handlers pass `cwd` into `createKernel({ workspaceRoot: options.cwd })` (`packages/loop-cli/src/commands/init.ts:5`, `packages/loop-cli/src/commands/component.ts:5`, etc.).
- Kernel normalizes to absolute path with fallback to process cwd (`packages/loop-kernel/src/kernel.ts:82`).

Gaps:

- No CLI tests verify `--cwd` behavior end-to-end.
- `resolveCwd` helper exists but is unused (`packages/loop-cli/src/flags.ts:7`).

---

## 5) Testing

### 5.1 What tests exist now

Kernel tests (`packages/loop-kernel/test`):

- Patch executor idempotency (limited scope), dry-run non-write, commit rollback (`patchExecutor.test.ts`).
- Local lane component resolve (`localLane.test.ts`).
- File lane snapshot change detection (`fileLane.test.ts`).
- ProviderHost module error path (`providerHost.test.ts`).
- Add + update component flow with temp workspace (`updateComponent.test.ts`).

Contracts tests (`packages/loop-contracts/test`):

- Ref parsing for local/file (`refs.test.ts`).

CLI tests (`packages/loop-cli/test`):

- Command registration smoke test (`program.test.ts`).

### 5.2 Coverage missing

High-priority missing coverage:

- Patch op handlers not directly tested:
  - `ensureExportsEntry`
  - `ensureTsconfigExtends`
  - `ensureSentinelBlock`
  - `applyJsonMergePatch`
  - `applyUnifiedDiff`
  - `tsEnsureImportAndWrapReactRoot`
- Patch pre/postcondition behavior (currently unimplemented).
- Failure propagation when a patch plan partially fails in add/update flows.
- Lockfile correctness on failed executions.
- `loop.json` missing/present behaviors across all commands.
- `--cwd` correctness across CLI commands.
- Lane auth file writing and `.gitignore` behavior.
- Module resolution paths for `file` and `local` module refs.
- Negative-path tests for `git`/`http` lane stubs through CLI/kernel.

### 5.3 Sandbox/e2e tests that spin real workspaces?

- There are lightweight integration tests that create real temp directories and run kernel logic against actual filesystem state (`packages/loop-kernel/test/patchExecutor.test.ts:10`, `packages/loop-kernel/test/updateComponent.test.ts:12`).
- There are no full CLI process e2e tests (spawn `loop` binary with fixture workspace).
- There are no network-backed e2e tests for `git`/`http` lanes.

---

## Additional notable gaps observed

1. Lane config is not used for component resolution routing.
   - Component lane is chosen by ref kind, not by configured lane entries (`packages/loop-kernel/src/components/resolve.ts:21`).
2. `lane list` looks up provider by lane `id`, not `kind`, so custom IDs that map to built-in kinds can appear unregistered unless IDs match provider IDs (`packages/loop-kernel/src/kernel.ts:308`).
3. `components.defaultTarget` and `components.ignoreGlobs` in `loop.json` are modeled but effectively unused in add/update flows (`packages/loop-contracts/src/workspace.ts:49`; no consumption except defaults in `packages/loop-kernel/src/kernel.ts:67`).
4. `addComponent`/`updateComponent` currently update lockfile in non-dry-run path without checking `execution.applied` success first (`packages/loop-kernel/src/components/add.ts:61`, `packages/loop-kernel/src/components/update.ts:120`).

---

## Top 10 Next Fixes

1. Implement real patch undo/revert framework (execution journal + inverse ops + API + CLI command).  
   Suggested owner: `kernel`
2. Prevent lockfile updates when patch execution failed or partially failed in add/update.  
   Suggested owner: `kernel`
3. Enforce/execute `preconditions` and `postconditions` in patch executor.  
   Suggested owner: `kernel`
4. Add explicit patch op tests for all eight handler kinds plus failure modes.  
   Suggested owner: `kernel`
5. Align lane resolution with configured lanes (`loop.json`) and resolve provider by `kind` + instance `id` model.  
   Suggested owner: `contracts`
6. Implement `git` lane (component/module resolve, snapshot semantics, auth integration).  
   Suggested owner: `kernel`
7. Implement `http` lane (manifest/snapshot fetch, caching strategy, auth integration).  
   Suggested owner: `kernel`
8. Define and implement lane publish capability (contracts + kernel + CLI command).  
   Suggested owner: `contracts`
9. Add CLI e2e tests (including `--cwd`, lane auth, add/update/diff/extract) with fixture workspaces.  
   Suggested owner: `cli`
10. Publish docs/spec pages for lane model, auth model, snapshot lifecycle, and patch/undo lifecycle.  
   Suggested owner: `site`

