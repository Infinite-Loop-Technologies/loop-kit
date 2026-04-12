# Forge App Structure

Use this note when reorganizing Forge or adding new Forge features.

Forge is the main product-facing prototype. Product architecture pressure should resolve here first, then reusable pieces should be promoted into shared packages.

## Recommended shape

Preferred folder shape under `apps/forge/src/`:

- `entrypoints/`
  - browser or server entry modules
  - thin boot files only
- `app/`
  - top-level app shell composition
  - provider composition
  - route shell selection
- `runtime/`
  - runtime boot helpers, environment loading, service construction, connector bootstraps
- `actions/`
  - semantic app intents and action registries
- `commands/`
  - authoritative app mutations
  - command handlers or command factories
- `workflows/`
  - async or multi-step orchestration
  - fetch/open flows, auth flows, startup flows
- `features/`
  - domain slices such as workspace, auth, connectors, command-palette
- `queries/`
  - derived reads, selectors, and query helpers
- `ui/`
  - presentational components shared across features

Keep routing shallow. Routing should choose high-level shells and screens, not become the center of the architecture.

## What belongs in Forge vs shared packages

Keep in Forge app code:

- product-specific composition
- app shell providers
- feature containers
- app-specific action registries
- product-specific workflows

Promote to shared packages when the code becomes reusable across apps:

- interaction semantics
- dock behavior
- state primitives
- generic workspace/store utilities with no Forge product assumptions

Rule:

- if the code depends on Forge-specific nouns, routes, or product copy, it probably belongs in Forge
- if the code expresses reusable runtime or UI behavior, it probably belongs in a package

## Middle layer pattern

Prefer three layers instead of giant UI files:

1. headless or domain hook
   - reads queries
   - dispatches actions or commands
   - prepares props and view models
2. dumb-ish presentational component
   - receives props
   - minimal conditional logic
   - no direct service reach-in
3. feature or container composition
   - wires providers, hooks, and presentational pieces together

Small example:

```tsx
function useWorkspaceHeaderModel() {
  const session = useForgeSession();
  const toggleSettings = useToggleSettingsAction();
  return {
    subtitle: session.workspaceName,
    onOpenSettings: toggleSettings,
  };
}

function WorkspaceHeaderView(props: {
  subtitle: string;
  onOpenSettings: () => void;
}) {
  return <Header subtitle={props.subtitle} onSettingsClick={props.onOpenSettings} />;
}

export function WorkspaceHeaderFeature() {
  return <WorkspaceHeaderView {...useWorkspaceHeaderModel()} />;
}
```

## Providers, services, stores, policy

- providers
  - app-boundary bridges
  - compose services and expose feature hooks
- services
  - durable behavior and authoritative operations
- stores
  - local app or workspace state, preferably via `@loop-kit/state` where it fits
- policy
  - decision rules, not random helper functions inside components

Rule:

- leaf components should consume hooks or view models, not raw services

## Actions, commands, workflows

- actions
  - semantic user intents
  - keyboard-friendly and UI-friendly entry points
- commands
  - authoritative mutations
- workflows
  - async orchestration and side-effect sequencing

Example:

- action: `forge.command-palette.toggle`
- command: `workspace.set-active-panel`
- workflow: `open-connector-and-focus-panel`

## File sizing and slicing

- prefer moderately large coherent files over extreme fragmentation
- split by feature or domain boundary, not by micro-type
- only extract another file when it creates a cleaner ownership boundary

Bad pattern:

- one file per tiny hook, type, and constant with no real ownership boundary

Better pattern:

- one coherent feature module until the slice naturally separates into actions, commands, queries, workflow, and UI
