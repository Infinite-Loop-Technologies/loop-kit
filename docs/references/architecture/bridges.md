
---

# `docs/references/bridges.md`

```md
# Bridges

## Definition

A bridge adapts runtimes/services to UI.

Bridges may:
- create or receive runtimes
- expose providers
- expose hooks
- install DOM adapters
- register interaction targets
- dispose runtimes when unmounted if they own them

Leaf UI components should consume bridge hooks/selectors, not raw services.

## TanStack Query

TanStack Query belongs in bridge hooks for app/backend server state.

Good:

```ts
export const useProjects = () => {
  const app = useAppRuntime();

  return useQuery({
    queryKey: ["projects"],
    queryFn: async () => getOrThrow(await app.env.projects.listProjects()),
  });
};
