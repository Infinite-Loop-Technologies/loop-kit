/**
 * React hook for subscribing to InteractionState.
 *
 * The hook uses React's external-store API against the common Store. Selectors
 * are read-only views of runtime/session state, not a domain data API.
 *
 * @module
 */

import { useSyncExternalStore } from "react"

import type { InteractionState } from "../InteractionState.js"
import { useInteractionRuntime } from "./useInteractionRuntime.js"

export const useInteractionState = <T = InteractionState>(
  selector: (state: InteractionState) => T = ((state) => state) as (state: InteractionState) => T
): T => {
  const runtime = useInteractionRuntime()

  return useSyncExternalStore(
    runtime.env.state.subscribe,
    () => selector(runtime.env.state.get()),
    () => selector(runtime.env.state.get())
  )
}
