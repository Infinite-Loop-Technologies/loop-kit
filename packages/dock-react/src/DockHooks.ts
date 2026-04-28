/**
 * React hooks for observing dock service and runtime state.
 *
 * Hooks adapt existing headless stores into React. They do not create domain
 * commands in leaf components.
 *
 * @module
 */

import { createContext, useContext, useSyncExternalStore } from "react"

import type { DockRuntime, DockRuntimeState, DockService, DockState } from "@loop-kit/dock"

import type { DockRegistry } from "./DockRegistry.js"

export interface DockReactContextValue {
  readonly dock: DockService
  readonly runtime: DockRuntime
  readonly registry: DockRegistry
}

export const DockReactContext = createContext<DockReactContextValue | null>(null)

export const useDockContext = (): DockReactContextValue => {
  const context = useContext(DockReactContext)
  if (!context) throw new Error("Dock hooks must be used inside DockProvider.")
  return context
}

export const useDockService = (): DockService => useDockContext().dock

export const useDockRuntime = (): DockRuntime => useDockContext().runtime

export const useDockRegistry = (): DockRegistry => useDockContext().registry

export const useDockState = (): DockState => {
  const dock = useDockService()
  return useSyncExternalStore(dock.state.subscribe, dock.state.get, dock.state.get)
}

export const useDockRuntimeState = (): DockRuntimeState => {
  const runtime = useDockRuntime()
  return useSyncExternalStore(
    runtime.env.state.subscribe,
    runtime.env.state.get,
    runtime.env.state.get
  )
}
