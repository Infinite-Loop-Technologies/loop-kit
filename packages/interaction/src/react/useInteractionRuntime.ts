/**
 * React hook for reading the current InteractionRuntime.
 *
 * This hook is the bridge from React components into the runtime context. It
 * throws when used outside an InteractionProvider or InteractionRoot because
 * that is a programmer error.
 *
 * @module
 */

import { useContext } from "react"

import type { InteractionRuntime } from "../InteractionRuntime.js"
import { InteractionRuntimeContext } from "./InteractionProvider.js"

export const useInteractionRuntime = (): InteractionRuntime => {
  const runtime = useContext(InteractionRuntimeContext)
  if (!runtime) {
    throw new Error(
      "useInteractionRuntime must be used within InteractionProvider or InteractionRoot."
    )
  }
  return runtime
}
