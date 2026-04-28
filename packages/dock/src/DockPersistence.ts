/**
 * Dock persistence ports and effects.
 *
 * Persistence is intentionally outside DockService so apps can choose memory,
 * localStorage, a database, multiplayer sync, or no persistence at all.
 *
 * TODO(sync): remote cursor/selection presence, collaborative layout updates,
 * conflict handling, and network persistence should attach as effects here.
 *
 * @module
 */

import { ok } from "@loop-kit/common/Result"
import type { Installer } from "@loop-kit/common/Runtime"
import { installedVoid } from "@loop-kit/common/Runtime"
import type { Task } from "@loop-kit/common/Task"
import type { Typed } from "@loop-kit/common/Type"

import type { DockRuntimeEnv } from "./DockRuntime.js"
import type { DockState } from "./DockState.js"

export interface DockPersistenceError extends Typed<"DockPersistenceError"> {
  readonly reason: string
}

export interface DockPersistenceAdapter {
  readonly load?: (() => Task<DockState | undefined, DockPersistenceError>) | undefined
  readonly save: (state: DockState) => Task<void, DockPersistenceError>
}

export const createMemoryDockPersistenceAdapter = (
  initialState?: DockState
): DockPersistenceAdapter & { readonly getSnapshot: () => DockState | undefined } => {
  let snapshot = initialState
  return {
    getSnapshot: () => snapshot,
    load: () => () => ok(snapshot),
    save: (state) => () => {
      snapshot = state
      return ok()
    },
  }
}

export const installDockPersistenceEffect =
  (adapter: DockPersistenceAdapter): Installer<DockRuntimeEnv> =>
  async (runtime) => {
    if (adapter.load) {
      const loaded = await runtime.run(adapter.load())
      if (loaded.ok && loaded.value) runtime.env.dock.state.set(loaded.value)
    }

    const unsubscribe = runtime.env.dock.state.subscribe(() => {
      void runtime.run(adapter.save(runtime.env.dock.state.get()))
    })

    return installedVoid(unsubscribe)
  }
