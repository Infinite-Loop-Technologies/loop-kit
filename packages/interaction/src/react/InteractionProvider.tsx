/**
 * React context provider for InteractionRuntime.
 *
 * The provider only exposes an already-created runtime to React consumers. It
 * does not create domain behavior or own interaction policy.
 *
 * @module
 */

import { type ReactNode, createContext } from "react"

import type { InteractionRuntime } from "../InteractionRuntime.js"

export const InteractionRuntimeContext = createContext<InteractionRuntime | null>(null)

export interface InteractionProviderProps {
  readonly runtime: InteractionRuntime
  readonly children?: ReactNode | undefined
}

export const InteractionProvider = ({ runtime, children }: InteractionProviderProps): ReactNode => (
  <InteractionRuntimeContext.Provider value={runtime}>
    {children}
  </InteractionRuntimeContext.Provider>
)
