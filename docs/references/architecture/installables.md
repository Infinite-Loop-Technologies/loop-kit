# IRA Installables

## Thesis

An installable is a small, explicit runtime module that attaches behavior to a runtime and returns a disposable lease. Installables are how IRA keeps long-lived behavior out of React components, bridge hooks, and services.

Use installables for policies, adapters, loops, signal wiring, subscriptions, cross-runtime coordination, and feature-specific behavior that needs lifecycle.

Do not hide installables inside React components unless the component is only mounting/unmounting an already-created runtime boundary.

## Vocabulary

### Service

A service owns committed domain truth and exposes commands/queries.

Examples:

- `DawProjectService`
- `AssetService`
- `AuthService`
- `DockService`

A service should answer questions like:

- What is the current project snapshot?
- Can this clip move to this track?
- Register these imported assets.
- Select this Dock panel.

A service should not own browser event listeners, React lifecycle, DnD sensors, animation loops, keyboard listeners, or DOM event normalization.

### Runtime

A runtime owns lifecycle, time, installed modules, transient runtime state, signals, and cleanup.

Examples:

- `AppRuntime`
- `ProjectRuntime`
- `InteractionRuntime`
- `AudioRuntime`
- `DockRuntime`

A runtime should answer questions like:

- What long-lived behaviors are currently installed?
- What signals exist?
- What disposable resources must be cleaned up?
- What other runtimes/services are available in this environment?

### Installable

An installable is a function that takes a runtime/env and installs behavior.

Shape:

    export interface Installation {
        readonly dispose: () => void | Promise<void>;
    }

    export type Installable<Env, Value = Installation> = (
        env: Env,
    ) => Value;

Prefer concrete names per runtime:

    export interface ProjectRuntimeEnv {
        readonly project: DawProjectService;
        readonly assets: AssetService;
        readonly interaction: InteractionRuntime;
    }

    export type ProjectInstallable<Value = Installation> = (
        env: ProjectRuntimeEnv,
    ) => Value;

### Policy

A policy is an installable that reacts to signals/state and issues commands.

Policies encode behavior such as:

- Drag asset onto track => create clip.
- Drag clip to different track/start beat => move clip.
- Press Escape during drag => cancel drag.
- Opening a project => ensure a Dock panel exists.
- Selecting a Dock tab => select project.
- Starting playback => compile playback plan and hand it to audio runtime.

Policies are where "when X happens, do Y" belongs.

### Bridge

A bridge adapts a runtime/service to a host framework or external system.

Examples:

- React provider/hook bridge.
- DOM pointer event bridge.
- dnd-kit adapter bridge.
- Tone.js adapter runtime.
- Discord API bridge.
- Native/ElectroBun bridge.

A bridge should be thin. It should translate, subscribe, expose, or mount/unmount. It should not become the owner of domain behavior.

## Ownership rule

Construction should flow downward:

    App entry
      creates AppRuntime
        owns app-level services
        owns InteractionRuntime
        owns DockRuntime
        owns AudioRuntime
        owns current ProjectRuntime when a project is open
      passes runtimes/services into bridges/providers
        bridges expose hooks/components
        UI renders and invokes bridge commands

Avoid this:

    React component
      creates runtime
      installs policies
      mutates services directly
      owns DnD resolution
      owns project behavior

Acceptable exception:

A provider may create a default runtime only for tests, examples, Storybook, or temporary scaffolding. Production app entry should explicitly create and pass the runtime.

## Lifecycle rule

If behavior has setup and cleanup, it belongs in an installable.

Examples:

- register interaction targets
- attach DOM event listeners
- subscribe to stores/signals
- register Dock panels
- create per-project DnD policy
- create object URLs
- schedule audio nodes
- run background sync
- open websocket
- start worker
- create polling/retry loop

Do not scatter setup/cleanup across UI components unless the behavior is truly component-local presentation.

## Recommended installable shape

    export interface Installation {
        readonly dispose: () => void | Promise<void>;
    }

    export const createInstallation = (
        dispose: () => void | Promise<void>,
    ): Installation => ({
        dispose,
    });

    export interface InstallManyOptions {
        readonly installations: ReadonlyArray<Installation>;
    }

    export const installMany = ({
        installations,
    }: InstallManyOptions): Installation => ({
        dispose: async () => {
            for (const installation of [...installations].reverse()) {
                await installation.dispose();
            }
        },
    });

Use `@loop-kit/common` runtime/disposable primitives where available instead of inventing local lifecycle systems.

## Runtime composition pattern

The parent runtime owns child runtimes when the child runtime lifecycle is app-level.

Example:

    export interface AppRuntimeEnv {
        readonly app: AppService;
        readonly assets: AssetService;
        readonly dawProjects: DawProjectService;
        readonly interaction: InteractionRuntime;
        readonly dock: DockService;
        readonly dockRuntime: DockRuntime;
        readonly audio: AudioRuntime;
        readonly projectRuntime: Store<ProjectRuntime | null>;
    }

`AppRuntime` may create/destroy a `ProjectRuntime` when a project opens/closes.

Example:

    export interface ProjectRuntimeEnv {
        readonly projectId: ProjectId;
        readonly dawProjects: DawProjectService;
        readonly assets: AssetService;
        readonly interaction: InteractionRuntime;
        readonly dock: DockService;
        readonly audio: AudioRuntime;
    }

    export interface ProjectRuntime extends Runtime<ProjectRuntimeEnv> {}

    export const createProjectRuntime = (
        env: ProjectRuntimeEnv,
    ): ProjectRuntime =>
        createRuntime(env);

Then install project-specific behavior:

    export const installProjectRuntime = (
        runtime: ProjectRuntime,
    ): Installation =>
        installMany({
            installations: [
                installProjectDockPolicy(runtime),
                installArrangementInteractionPolicy(runtime),
                installProjectPlaybackPolicy(runtime),
            ],
        });

When the project closes, dispose the installation and runtime.

## Cross-runtime installation

Sometimes one runtime installs behavior into another runtime. This is valid when ownership is explicit.

Example:

    ProjectRuntime
      installs arrangement targets/policies into InteractionRuntime
      because the project owns arrangement behavior
      while InteractionRuntime remains generic

This does not mean `InteractionRuntime` knows about Skraps, DAWs, clips, beats, tracks, or assets.

Correct:

    installArrangementInteractionPolicy(projectRuntime)

The policy depends on:

- ProjectRuntime project context
- InteractionRuntime generic signals/targets
- DawProjectService commands

Incorrect:

    InteractionRuntime.createDawClipOnDrop(...)
    InteractionRuntime knows TrackId
    InteractionRuntime knows BeatPosition
    React component resolves drop and directly mutates project

## Service vs runtime vs installable decision table

| Thing | Belongs in |
| --- | --- |
| Validating a clip move | Domain service |
| Committing a clip move | Domain service |
| Current selected project id | App service/store |
| Pointer down/move/up signals | InteractionRuntime |
| DOM event listeners | DOM bridge installable |
| DnD gesture recognition | Interaction installable/policy |
| Asset-on-track means create clip | Project policy installable |
| Clip-on-track means move clip | Project policy installable |
| Opening/closing project Dock panels | App or Project Dock policy |
| React `useSyncExternalStore` hooks | React bridge |
| Creating AppRuntime | App entry or parent runtime |
| Creating ProjectRuntime | AppRuntime or project manager |
| Creating Tone nodes | AudioRuntime |
| Compiling playback plan | Project playback policy or app command, not React hook |

## Naming conventions

Use names that say what lifecycle they own:

- `createAppRuntime`
- `createProjectRuntime`
- `installAppRuntime`
- `installProjectRuntime`
- `installInteractionDomBridge`
- `installArrangementInteractionPolicy`
- `installProjectDockPolicy`
- `installPlaybackPolicy`

Avoid vague names:

- `setup`
- `manager`
- `handler`
- `controller`
- `utils`
- `wireThings`

## Anti-patterns

### Runtime creation inside bridge

Bad:

    export const AppBridgeProvider = ({ children }) => {
        const runtime = useMemo(() => createAppRuntime(), []);
        return <Context.Provider value={runtime}>{children}</Context.Provider>;
    };

Better:

    export const AppBridgeProvider = ({ runtime, children }) => (
        <Context.Provider value={runtime}>{children}</Context.Provider>
    );

Then app entry owns creation:

    const runtime = createAppRuntime();

    root.render(
        <AppBridgeProvider runtime={runtime}>
            <App />
        </AppBridgeProvider>,
    );

Temporary scaffolding may keep a fallback, but production code should pass the runtime explicitly.

### Policy inside React component

Bad:

    const handleDragEnd = (event) => {
        const source = event.operation.source.data;
        const target = event.operation.target.data;
        const startBeat = resolveDropBeat(event);
        moveClip(source.clipId, target.trackId, startBeat);
    };

Better:

    UI emits/registers generic drag source/drop target data.
    InteractionRuntime emits a structured drop signal.
    Project policy consumes the signal.
    Project policy resolves DAW semantics.
    Project service commits the mutation.

### Domain behavior inside bridge hook

Bad:

    export const useProjects = () => {
        const registerProjectPanel = (...) => { ... };
        return {
            openProject: async (projectId) => {
                await app.openProject(projectId);
                registerProjectPanel(projectId);
                dock.selectPanel(panelId);
            },
        };
    };

Better:

    export const useProjects = () => {
        const runtime = useAppRuntime();
        const state = useStoreValue(runtime.env.state);

        return {
            projects: state.projects,
            selectedProjectId: state.selectedProjectId,
            openProject: runtime.env.appCommands.openProject,
        };
    };

The app command or installed policy coordinates app state + Dock.

## Rule of thumb

When in doubt, ask:

1. Is this committed domain state?
   - Service.

2. Is this lifecycle/time/signal/cleanup behavior?
   - Runtime or installable.

3. Is this "when event X happens, perform command Y"?
   - Policy installable.

4. Is this adapting React/DOM/dnd-kit/Tone/Discord/etc. to our runtime?
   - Bridge.

5. Is this just display?
   - UI component.
