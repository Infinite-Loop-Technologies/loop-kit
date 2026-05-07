# KitStash Loop Kit Integration Brief

This brief is based on the current Loop Kit repository packages:

- `@loop-kit/common` 0.1.2
- `@loop-kit/interaction` 0.1.1
- `@loop-kit/dock` 0.1.2
- `@loop-kit/dock-react` 0.1.2

The repository uses Bun workspaces from root `package.json`: `apps/*`, `packages/*`, and `examples/*`. No `pnpm-workspace.yaml` is present in this checkout.

## IRA Summary

Loop Kit follows Installed Runtime Architecture as implemented in the current source:

- Services own committed domain truth. `DockService` owns persisted dock state such as panels, surfaces, layout, selected/focused panels, modal queue, and dock domain events.
- Runtimes own lifecycle and session time. `Runtime<TEnv>` owns an env bag, root `Run`, installed modules, and cleanup. `InteractionRuntime` and `DockRuntime` extend this shape.
- Bridges expose selected service/runtime surfaces to UI or external systems. `@loop-kit/dock-react` bridges dock service/runtime state into React. `@loop-kit/interaction/react` bridges DOM elements and React components to `InteractionRuntime`.
- Signals are occurrences. `createSignal` is used for things that happened: interaction raw input, synthesized clicks/drags/keys, dock domain events, and dock runtime preview events.
- Stores are current state. `createStore` is used for `InteractionState`, `DockState`, and `DockRuntimeState`.
- Tasks and Runs own async, cancelable work. `Task` functions run under a `Run`, receive abort signals and deps, and return typed `Result` values.
- Installable policies/modules extend runtimes. Packages expose `Installer<TEnv>` functions such as `installKeyboardSignalSynthesis`, `installDefaultDockInteraction`, and `installDockPersistenceEffect`.

For KitStash, keep the same boundaries: Jazz-backed registry data belongs in domain services, workflow/session state belongs in runtimes, and React components should bridge state and dispatch semantic commands without owning business logic.

## @loop-kit/common

Use `@loop-kit/common` for small primitives that already exist in the repo. Prefer subpath imports when the app only needs a small surface.

### `Result`

`Result<T, E>` is `Ok<T> | Err<E>`, created with `ok(value)`/`ok()` and `err(error)`. Use it for recoverable domain failures: invalid registry item, missing namespace, publish rejected, install command failed, or auth state that requires a user-facing branch.

```ts
import { type Result, err, ok } from "@loop-kit/common/Result";
import type { Typed } from "@loop-kit/common/Type";

interface KitStashItemNotFound extends Typed<"KitStashItemNotFound"> {
  readonly itemId: string;
}

interface RegistryItem {
  readonly id: string;
  readonly name: string;
}

export const findItem = (
  items: ReadonlyArray<RegistryItem>,
  itemId: string,
): Result<RegistryItem, KitStashItemNotFound> => {
  const item = items.find((candidate) => candidate.id === itemId);
  if (!item) return err({ type: "KitStashItemNotFound", itemId });
  return ok(item);
};
```

Useful helpers exported now include `isOk`, `isErr`, `getOrThrow`, `getOrNull`, `getOk`, `trySync`, `tryAsync`, `allResult`, `mapResult`, `anyResult`, and pull-protocol helpers `NextResult`/`done`.

### `Option`

`Option<T>` exists, but its own docs say to use it when the value itself can be `null` or `undefined`. For ordinary not-found values, use `T | null`.

```ts
import { type Option, fromNullable, isSome, none, some } from "@loop-kit/common/Option";

const cachedPayload: Option<unknown> = some(undefined);
const missing = none;
const maybeTitle = fromNullable(document.title || null);

if (isSome(cachedPayload)) {
  cachedPayload.value;
}
```

KitStash should use `Option` for caches or maps where a stored value may legitimately be `null`/`undefined`. Do not use it everywhere as a replacement for `T | null`.

### `Task` and `Run`

Use `Task<T, E, D>` for async, cancelable workflows: registry import, publish, Sandpack file hydration, CLI install diagnosis, or Jazz sync work that should stop when the workspace closes.

```ts
import { ok, tryAsync } from "@loop-kit/common/Result";
import { type Task, createRun, timeout } from "@loop-kit/common/Task";
import type { Typed } from "@loop-kit/common/Type";

interface FetchRegistryError extends Typed<"FetchRegistryError"> {
  readonly message: string;
}

const fetchRegistryJson =
  (url: string): Task<unknown, FetchRegistryError> =>
  async ({ signal }) =>
    tryAsync(
      async () => {
        const response = await fetch(url, { signal });
        return response.json() as Promise<unknown>;
      },
      (error): FetchRegistryError => ({
        type: "FetchRegistryError",
        message: String(error),
      }),
    );

await using run = createRun();
const result = await run(timeout(fetchRegistryJson("/api/registry"), "10s"));
if (result.ok) {
  result.value;
}
```

Current exports include structured-concurrency helpers such as `createRun`, `AbortError`, `sleep`, `timeout`, `retry`, `all`, `allSettled`, `map`, `mapSettled`, `race`, `any`, `concurrently`, `callback`, and `fetch`.

### `Runtime`, Installers, and Lifecycle

Use `createRuntime` for KitStash composition roots that need installed modules and cleanup. Installers return `installed(value, cleanup)` or `installedVoid(cleanup)`.

```ts
import {
  type Installer,
  createRuntime,
  installedVoid,
} from "@loop-kit/common/Runtime";
import { type Store, createStore } from "@loop-kit/common/Store";

interface KitStashEnv {
  readonly selection: Store<{ readonly itemId?: string }>;
}

const installSelectionLogger: Installer<KitStashEnv> = (runtime) => {
  const unsubscribe = runtime.env.selection.subscribe(() => {
    runtime.env.selection.get();
  });
  return installedVoid(unsubscribe);
};

const runtime = createRuntime<KitStashEnv>({
  selection: createStore({}),
});
await runtime.install(installSelectionLogger);
await runtime.dispose();
```

### `Store`, `Ref`, and `Signal`

Use `Store<T>` for current observable state. Use `ReadonlyStore<T>` in public service interfaces when consumers should observe but not mutate. Use `Ref<T>` for mutable ownership without subscriptions. Use `Signal<T>` for occurrences.

```ts
import { createRef } from "@loop-kit/common/Ref";
import { createSignal } from "@loop-kit/common/Signal";
import { createStore } from "@loop-kit/common/Store";

const selectedItemId = createStore<string | undefined>(undefined);
const importAttemptCount = createRef(0);
const itemPublished = createSignal<{ readonly itemId: string }>();

const unsubscribe = selectedItemId.subscribe(() => {
  selectedItemId.get();
});
selectedItemId.set("item_123");
importAttemptCount.update((count) => count + 1);
itemPublished.emit({ itemId: "item_123" });
unsubscribe();
```

### Resource Helpers

`Resource` helpers exist for disposable resource ownership:

- `createResourceRef`
- `createSharedResource`
- `createSharedResourceByKey`
- `createSharedResourceByKeyWithClaims`
- ref-count exports from `Resource`

KitStash can use them later for expensive shared resources, for example Sandpack clients, preview workers, or per-registry import sessions. Do not start there unless lifecycle/resource reuse is a real problem; simple service methods and runtime installers are enough for the first integration.

### Assertions, Types, and Helpers

Useful current exports include:

- `assert`, `assertNotAborted`, `assertNotDisposed` for programmer errors and impossible abort paths.
- `Typed`, `typed`, `brand`, `createId`, `Id`, `Name`, branded strings/numbers, and schema-like runtime type helpers in `Type`.
- `Lookup` and `Relation` for logical identity and relations.
- collection helpers in `Array`, `Set`, `Object`, `Eq`, `Order`, `String`, `Number`.

Use `Result` for recoverable KitStash domain failures. Throw/assert only for programmer errors and invariant violations.

### What Not To Use

- Do not use `@loop-kit/common/local-first` for KitStash unless intentionally adopting the Evolu local-first stack. KitStash uses Jazz; read Jazz docs before changing Jazz behavior.
- Do not put DOM, React, or app/provider glue in `@loop-kit/common`.
- Do not use `Resource` helpers for ordinary state management.
- Do not use `getOrThrow` in user-recoverable flows.

## @loop-kit/interaction

`@loop-kit/interaction` is a generic headless runtime. It currently exports targets, roles, state, signals, DOM bridge installers, pointer synthesis, keyboard synthesis, and installer composition. It does not currently export a command registry, shortcut registry, command palette model, or selection service.

### Targets, Signals, and State

`InteractionRuntime` owns:

- `env.state`: `Store<InteractionState>`
- `env.signals`: raw and synthesized interaction signals
- `env.targets`: explicit target registry
- `registerTarget`, `getTarget`, `getTargetAncestry`, and DOM target resolution helpers

Targets have explicit `parentId`; hierarchy is not inferred from React trees. Roles are limited to the current vocabulary: `pressable`, `hoverable`, `focusable`, `selectable`, `draggable`, `dropzone`, `resize-handle`, `command-boundary`, `text-input`, and `scroll-region`.

```ts
import {
  type InteractionTargetId,
  createInteractionRuntime,
  installKeyboardSignalSynthesis,
} from "@loop-kit/interaction";

const interaction = createInteractionRuntime();
await interaction.install(installKeyboardSignalSynthesis());

const namespaceTarget = interaction.registerTarget({
  id: "namespace:radix" as InteractionTargetId,
  roles: ["selectable", "pressable"],
  data: { kind: "kitstash.namespace", namespaceId: "radix" },
}).value;

interaction.env.signals.click.emit({
  target: namespaceTarget,
  pointerId: 1,
  position: { x: 0, y: 0 },
  modifiers: { alt: false, ctrl: false, meta: false, shift: false },
});

await interaction.dispose();
```

### Modeling Commands

Because the interaction package has no command model today, KitStash should define its own headless `CommandService` or `CommandRegistry` in the KitStash app. Keep commands semantic and app-owned:

- `kitstash.namespace.select`
- `kitstash.item.select`
- `kitstash.palette.open`
- `kitstash.settings.open`
- `kitstash.item.create`
- `kitstash.item.validate`
- `kitstash.item.publish`
- `kitstash.collection.save`
- `kitstash.item.fork`
- `kitstash.workspace.file.select`
- `kitstash.import.intent`

The command service should call KitStash domain services and dock services. React should call commands through bridge hooks, not perform business logic directly.

```ts
import { type Result, err, ok } from "@loop-kit/common/Result";
import type { Typed } from "@loop-kit/common/Type";

type KitStashCommandId =
  | "kitstash.namespace.select"
  | "kitstash.item.select"
  | "kitstash.palette.open"
  | "kitstash.settings.open";

interface UnknownCommand extends Typed<"UnknownCommand"> {
  readonly commandId: string;
}

interface KitStashCommandRegistry {
  readonly execute: (
    commandId: KitStashCommandId,
    input?: unknown,
  ) => Result<void, UnknownCommand>;
}

export const createKitStashCommands = (): KitStashCommandRegistry => ({
  execute: (commandId) => {
    switch (commandId) {
      case "kitstash.namespace.select":
      case "kitstash.item.select":
      case "kitstash.palette.open":
      case "kitstash.settings.open":
        return ok();
      default:
        return err({ type: "UnknownCommand", commandId });
    }
  },
});
```

### Modeling Signals and Events

Use interaction signals for input occurrences. Use KitStash service signals for domain events such as `ItemCreated`, `ItemPublished`, `ItemForked`, `CollectionSaved`, or `RegistryImportRequested`. Do not store committed item data in `InteractionState`.

### Active Scope and Selection

The current interaction package stores `focusTargetId`, `hoverTargetId`, `drag`, and pressed keys. It does not have an active-scope stack. KitStash should model committed selection in app services:

- `NamespaceBrowserService`: selected namespace id.
- `ItemBrowserService` or `RegistrySelectionService`: selected item id/version.
- `WorkspaceService`: selected workspace file.

For active command scope, use a small KitStash `ScopeService` or include scopes in the shortcut service. It can derive from `InteractionState.focusTargetId` plus explicit target ancestry and target data, but should not mutate interaction core.

### Installing Policies

Install policies into `InteractionRuntime` when behavior reacts to interaction signals and coordinates services. This matches `@loop-kit/dock`:

```ts
import { type Installer, installedVoid } from "@loop-kit/common/Runtime";
import type { InteractionEnv } from "@loop-kit/interaction";

interface KitStashCommands {
  readonly openPalette: () => void;
}

export const installKitStashCommandPalettePolicy =
  (commands: KitStashCommands): Installer<InteractionEnv> =>
  (interaction) => {
    const unsubscribe = interaction.env.signals.keyPressed.subscribe((signal) => {
      if ((signal.modifiers.ctrl || signal.modifiers.meta) && signal.key.toLowerCase() === "k") {
        commands.openPalette();
      }
    });

    return installedVoid(unsubscribe);
  };
```

### Testing Interactions Without UI

Tests should create `InteractionRuntime`, register targets, install policies, emit signals, and assert service state. This is how current dock tests validate click, drag/drop, resize, and modal escape behavior.

```ts
import { expect, test } from "vitest";
import { createInteractionRuntime } from "@loop-kit/interaction";

test("Ctrl+K opens the palette", async () => {
  const interaction = createInteractionRuntime();
  let opened = false;
  await interaction.install(
    installKitStashCommandPalettePolicy({ openPalette: () => { opened = true; } }),
  );

  interaction.env.signals.keyPressed.emit({
    key: "k",
    code: "KeyK",
    repeat: false,
    modifiers: { alt: false, ctrl: true, meta: false, shift: false },
  });

  expect(opened).toBe(true);
  await interaction.dispose();
});
```

### KitStash Interaction Mapping

- Select namespace: register namespace rows as `selectable`/`pressable` targets with data `{ kind: "kitstash.namespace", namespaceId }`; a click policy calls `commands.execute("kitstash.namespace.select", { namespaceId })`.
- Select item: register item rows/cards as `selectable`/`pressable`; click policy calls item selection command.
- Open command palette: shortcut policy listens to `keyPressed` and calls command service.
- Open settings modal: shortcut or command palette calls dock `openModal` for the settings modal surface.
- Create item: command service calls registry item service; UI only invokes command.
- Validate item: command service starts a `Task` under a KitStash runtime; validation result is stored in an app service/store.
- Publish item: command service starts a publish task and returns typed recoverable failures via `Result`.
- Save to collection: command service calls collection service; service owns Jazz persistence.
- Fork item: command service calls fork service and records license attribution.
- Workspace file selection: workspace file tree targets are `selectable`; click policy calls `workspace.file.select`.
- Drag/drop import intent: register paste/drop zones as `dropzone` targets. Interaction currently handles pointer drag, not browser file-drop data. Use DOM `drop`/paste bridge code in KitStash to emit a KitStash import intent or call an import command.

## Keyboard Shortcuts Manager Design

The best current design is a combination:

- A KitStash-owned `ShortcutRegistry` service for bindings, conflict detection, future user configuration, and command lookup.
- A policy installed into `InteractionRuntime` that listens to `keyPressed`, normalizes key chords, checks active scopes, suppresses editor/input handling, and dispatches commands.
- Optional KitStash runtime/module ownership for persistence, user settings, and cleanup.

Do not put this in `@loop-kit/interaction` yet. The interaction package intentionally stops at normalized key signals and says `installKeyboardSignalSynthesis` does not implement shortcut routing.

### Responsibilities

`ShortcutRegistry` should own:

- command id to key binding records
- scope ids such as `global`, `dock.workspace`, `dock.modal.settings`, `command-palette`, `sandpack.workspace`, `text-input`
- platform-aware normalization, probably using `mod` to mean Meta on macOS and Ctrl elsewhere
- conflict detection per scope and inherited scope chain
- future user-configurable overrides

Shortcut policy installed into `InteractionRuntime` should own:

- subscribe to `interaction.env.signals.keyPressed`
- ignore repeats unless the binding opts in
- resolve the target from the signal and inspect target roles/data/ancestry
- suppress command shortcuts for `text-input` targets and native editable elements unless the binding is explicitly allowed in inputs
- ask the registry for a matching command in the active scope chain
- call `CommandService.execute`
- integrate with the command palette by letting the palette list the same registry commands and bindings

Dock modal/panel scopes should be explicit. Register modal surfaces with `useDockModalSurfaceTarget`; for KitStash-specific scopes, register additional interaction targets with `roles: ["command-boundary"]` and app-specific data or keep a separate `ScopeService` updated when dock modals/panels open.

Tests should cover:

- normalized `Ctrl+K`/`Meta+K`
- scope-specific command wins over global command
- conflict detection
- input/editor suppression
- settings modal shortcuts do not leak to workspace scope
- command palette can execute the same command ids

## @loop-kit/dock

`@loop-kit/dock` is a headless dock engine. It exports state/model types, service commands, runtime preview state, policies, persistence effects, target matchers, renderer input contracts, and interaction policies.

### Core Concepts

- `DockPanel`: a logical panel with `id`, `title`, `kind`, optional `surfaceId`, `closable`, and metadata.
- `DockSurface`: a surface with `id`, `kind`, optional title/panel/layer metadata.
- `DockGroupNode`: tab/group stack of panel ids.
- `DockSplitNode`: horizontal/vertical split with ratio and child nodes.
- `DockLayout`: main/side roots, floating windows, modals, overlays, and layers.
- `DockService`: committed state and commands.
- `DockRuntime`: transient drag/resize/modal/debug session state.
- `DockPolicy`: composable permission/constraint hooks.

### Modeling KitStash Panels and Modals

Recommended initial panels:

- namespace browser: `DockPanel.kind = "kitstash.namespace-browser"`
- item browser/detail: `kitstash.item-browser` and `kitstash.item-detail`
- item inspector: `kitstash.item-inspector`
- install/config: `kitstash.install-config`
- Sandpack workspace: `kitstash.sandpack-workspace`

Recommended modals:

- settings/account modal as `createDockModal({ title: "Settings", root, open: false })`
- Sandpack can start as a panel if it is part of the workspace, or as a modal if it is a temporary preview. The current model supports both panels and modals as separate node types, but there is no built-in command to convert a modal into a docked panel. To support that later, KitStash should write an app-level command that closes the modal and registers/inserts an equivalent panel.

```ts
import {
  type DockPanel,
  createDockGroup,
  createDockPanelId,
  createDockService,
  createDockState,
} from "@loop-kit/dock";

const namespacePanel: DockPanel = {
  id: createDockPanelId(),
  title: "Namespaces",
  kind: "kitstash.namespace-browser",
};

const itemPanel: DockPanel = {
  id: createDockPanelId(),
  title: "Items",
  kind: "kitstash.item-browser",
};

const root = createDockGroup({
  panelIds: [namespacePanel.id, itemPanel.id],
  activePanelId: itemPanel.id,
});

const dock = createDockService({
  initialState: createDockState({
    panels: [namespacePanel, itemPanel],
    root,
    selectedPanelId: itemPanel.id,
    focusedPanelId: itemPanel.id,
  }),
});
```

### Opening, Closing, Selecting, and Persisting

Use `DockService` methods:

- `registerPanel`
- `unregisterPanel`
- `focusPanel`
- `selectPanel`
- `openSurface`
- `closeSurface`
- `openModal`
- `closeModal`
- `canApplyPlacement`
- `commitDrop`
- `resizeSplit`

Use `installDockPersistenceEffect(adapter)` on a `DockRuntime` to load/save state. The current package includes `createMemoryDockPersistenceAdapter`; KitStash should provide a Jazz/localStorage adapter that implements `DockPersistenceAdapter`.

```ts
import {
  type DockPersistenceAdapter,
  createDockRuntime,
  installDockPersistenceEffect,
} from "@loop-kit/dock";
import { ok } from "@loop-kit/common/Result";

const adapter: DockPersistenceAdapter = {
  load: () => () => ok(undefined),
  save: (state) => () => {
    JSON.stringify(state);
    return ok();
  },
};

const runtime = createDockRuntime({ dock });
await runtime.install(installDockPersistenceEffect(adapter));
```

### What Not To Overbuild Yet

- Do not build a second dock state model in KitStash.
- Do not add app-specific behavior to `@loop-kit/dock`.
- Do not build modal-to-panel conversion into Loop Kit unless multiple apps need it. App-level close-and-register is enough initially.
- Do not use `DockRender` as the final KitStash UI. It is a modest default/debug renderer.
- Do not persist runtime preview state such as drag previews.

## @loop-kit/dock-react

`@loop-kit/dock-react` is the React bridge for the headless dock. It exports:

- `DockProvider`
- `DockRoot`
- `DockRender`
- `DockDebugView`
- hooks: `useDockContext`, `useDockService`, `useDockRuntime`, `useDockRegistry`, `useDockState`, `useDockRuntimeState`
- registry: `createDockRegistry`
- target hooks: `useDockPanelTarget`, `useDockTabTarget`, `useDockDropzoneTarget`, `useDockResizeHandleTarget`, `useDockModalSurfaceTarget`, `useDockOverlayBackdropTarget`

React should bridge to dock state and render components. It should not own KitStash business logic. Components receive props, call command bridge hooks, and render state from services.

```tsx
import {
  DockProvider,
  DockRoot,
  createDockRegistry,
  type DockPanelComponentProps,
} from "@loop-kit/dock-react";
import { createDockRuntime, createDockService } from "@loop-kit/dock";
import { createInteractionRuntime } from "@loop-kit/interaction";

const NamespaceBrowserPanel = ({ panel }: DockPanelComponentProps) => {
  return <section aria-label={panel.title}>Namespaces</section>;
};

const registry = createDockRegistry({
  panels: {
    "kitstash.namespace-browser": NamespaceBrowserPanel,
  },
});

const dock = createDockService();
const runtime = createDockRuntime({ dock });
const interaction = createInteractionRuntime();

export const AppShell = () => (
  <DockProvider
    dock={dock}
    runtime={runtime}
    interaction={interaction}
    registry={registry}
  >
    <DockRoot className="h-screen w-screen" />
  </DockProvider>
);
```

For production KitStash, create the service/runtime instances in a stable composition root, not inside leaf components. In Next.js, ensure these client-side runtime objects are created inside client components/providers and disposed when the app shell unmounts if KitStash owns their lifetime.

## KitStash Recommended Architecture

Suggested folder plan:

```text
src/
  domain/
    registry/
      RegistryItemService.ts
      RegistryNamespaceService.ts
      RegistryValidationService.ts
    collections/
      CollectionService.ts
    forks/
      ForkService.ts
    accounts/
      AccountService.ts
    workspace/
      WorkspaceService.ts
  runtime/
    createKitStashRuntime.ts
    installKitStashPolicies.ts
    installShortcutPolicy.ts
    installImportIntentPolicy.ts
  commands/
    CommandService.ts
    KitStashCommands.ts
  shortcuts/
    ShortcutRegistry.ts
    ShortcutNormalizer.ts
  dock/
    createKitStashDock.ts
    KitStashDockRegistry.tsx
    KitStashDockPersistence.ts
  bridges/
    jazz/
      JazzRegistryRepository.ts
      JazzAccountBridge.ts
    react/
      KitStashProvider.tsx
      useKitStashCommands.ts
      useKitStashSelection.ts
  components/
    app-shell/
      AppShell.tsx
    namespace-browser/
    item-browser/
    item-detail/
    item-inspector/
    install-config/
    settings/
    sandpack-workspace/
    command-palette/
    import-wizard/
  tests/
    interaction/
    shortcuts/
    dock/
    registry/
docs/
  ai/
```

Boundary rules:

- Domain services own Jazz-backed committed data and expose typed commands/results.
- KitStash runtime owns installed policies, long-running tasks, import/publish/validation task lifecycle, and cleanup.
- Bridges adapt services/runtimes to React, Jazz, DOM, and Sandpack.
- React components render state and call command hooks.
- Tests should exercise services and installed policies without React first, then add React integration tests for wiring.

## Current Gaps for KitStash

These APIs are not present in the inspected packages:

- No `CommandService` or command registry in `@loop-kit/interaction`.
- No shortcut registry, active scope stack, or conflict detection in `@loop-kit/interaction`.
- No built-in command palette model.
- No browser file-drop/paste import bridge in `@loop-kit/interaction`; current drag synthesis is pointer-based.
- No modal-to-panel conversion command in `@loop-kit/dock`.
- No polished production dock renderer in `@loop-kit/dock-react`; `DockRender` is intentionally modest.
- No Jazz-specific persistence adapter in this repo.

KitStash should implement these in its app first. Only promote generic parts back to Loop Kit when they are broadly reusable and not KitStash-specific.

## Prompt for KitStash repo

```text
You are working in the KitStash repository.

Read docs/references/ai/kitstash-loop-kit-integration-brief.md from the loop-kit repository before implementing. Inspect KitStash source before making changes. Do not invent Loop Kit APIs; use the current exports from @loop-kit/common, @loop-kit/interaction, @loop-kit/dock, and @loop-kit/dock-react.

KitStash is a Next.js + Jazz local-first app that hosts shadcn-compatible registry items. Before any Jazz behavior changes, read the current Jazz docs at https://jazz.tools/llms-full.txt and ground changes in those docs.

Goals:
- Fix current UI/UX empty-state issues so namespace browser, item browser/detail, item inspector, install/config panel, account/settings, Sandpack workspace, collections, forks, and versioning states are usable when data is missing, loading, or invalid.
- Diagnose and fix Portless/local registry CLI install issues where feasible. If blocked by external tooling, document exact commands, logs, and required human action.
- Diagnose and fix Better Auth/Jazz get-session 404s. Confirm route expectations against current Jazz and auth docs before changing auth code.
- Integrate Loop Kit dock/dock-react/interaction into a single-page dock workspace.
- Keep clean IRA boundaries: services own committed domain truth, runtimes own lifecycle/tasks/signals/stores/cleanup, bridges expose selected surfaces, and React components contain no business logic.
- Add a KitStash command service/registry for semantic commands.
- Add a keyboard shortcut policy using InteractionRuntime keyPressed signals plus a KitStash ShortcutRegistry. Include normalization, active scopes, conflict detection, editor/input suppression, command palette integration, and tests.
- Add account/profile surfaces and a clear guest warning.
- Add collections/saves.
- Add forks with license attribution.
- Add versioning UI.
- Add Sandpack workspace with file tree and file selection.
- Add an import wizard for paste, drag/drop, and registry URL if feasible. If browser drop/paste support requires app-local DOM bridge code, implement it outside @loop-kit/interaction.
- Add tests for domain services, shortcut policy, interaction policies without UI, and key React wiring.

Implementation guidance:
- Use @loop-kit/common Result for recoverable domain failures, Task/Run for cancelable async work, Store for current state, Signal for occurrences, and Runtime installers for policies.
- Use @loop-kit/interaction for target registration, raw/synthesized input signals, focus/hover/drag/key state, and installed policies. Do not expect it to provide commands or shortcuts.
- Use @loop-kit/dock DockService for committed dock layout/panel/modal state, DockRuntime for transient drag/resize previews, DockPolicy for permissions, and DockPersistenceAdapter for layout persistence.
- Use @loop-kit/dock-react only as a React bridge. Build KitStash panel components through createDockRegistry and command hooks.
- Keep Jazz persistence inside KitStash services/bridges, not React components.
- Do not change Loop Kit public APIs unless truly necessary. If a missing generic API is discovered, document the gap and implement the app-local version first.

Verification:
- Run the relevant KitStash typecheck, lint, and tests.
- For UI changes, run the dev server and verify the main workspace in a browser, including empty states, shortcuts, modals/panels, and Sandpack workspace.
- Report files changed, tests run, gaps found, and any remaining blockers.
```
