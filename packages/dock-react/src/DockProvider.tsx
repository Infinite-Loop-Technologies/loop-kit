/**
 * React provider for dock service/runtime/registry.
 *
 * The provider can accept caller-owned headless instances or create defaults.
 * It does not hide domain behavior in leaf components.
 *
 * @module
 */

import { type ReactNode, useMemo } from "react"

import {
  type DockPolicy,
  type DockRuntime,
  type DockService,
  createDebugDockState,
  createDockRuntime,
  createDockService,
} from "@loop-kit/dock"
import { type InteractionRuntime, createInteractionRuntime } from "@loop-kit/interaction"
import { InteractionProvider } from "@loop-kit/interaction/react"

import { DockReactContext } from "./DockHooks.js"
import { type DockRegistry, createDockRegistry } from "./DockRegistry.js"

export interface DockProviderProps {
  readonly dock?: DockService | undefined
  readonly runtime?: DockRuntime | undefined
  readonly interaction?: InteractionRuntime | undefined
  readonly policy?: DockPolicy | undefined
  readonly registry?: DockRegistry | undefined
  readonly debugInitialState?: boolean | undefined
  readonly children?: ReactNode | undefined
}

export const DockProvider = ({
  dock,
  runtime,
  interaction,
  policy,
  registry,
  debugInitialState = false,
  children,
}: DockProviderProps): ReactNode => {
  const ownedDock = useMemo(
    () =>
      dock ??
      createDockService({
        initialState: debugInitialState ? createDebugDockState() : undefined,
        policy,
      }),
    [debugInitialState, dock, policy]
  )
  const ownedRuntime = useMemo(
    () => runtime ?? createDockRuntime({ dock: ownedDock, policy }),
    [ownedDock, policy, runtime]
  )
  const ownedInteraction = useMemo(() => interaction ?? createInteractionRuntime(), [interaction])
  const ownedRegistry = useMemo(() => registry ?? createDockRegistry(), [registry])

  return (
    <InteractionProvider runtime={ownedInteraction}>
      <DockReactContext.Provider
        value={{
          dock: ownedDock,
          runtime: ownedRuntime,
          registry: ownedRegistry,
        }}
      >
        {children}
      </DockReactContext.Provider>
    </InteractionProvider>
  )
}
