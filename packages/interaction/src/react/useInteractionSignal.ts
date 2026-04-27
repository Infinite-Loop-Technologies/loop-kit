/**
 * React hook for subscribing to interaction signals.
 *
 * Components can observe selected runtime occurrences without owning policy.
 * The hook subscribes on mount/update and unsubscribes on cleanup.
 *
 * @module
 */

import { useEffect } from "react"

import type { Signal } from "@loop-kit/common/Signal"

import type { InteractionSignals } from "../InteractionSignals.js"
import { useInteractionRuntime } from "./useInteractionRuntime.js"

export const useInteractionSignal = <T>(
  signalSelector: (signals: InteractionSignals) => Signal<T>,
  listener: (value: T) => void
): void => {
  const runtime = useInteractionRuntime()

  useEffect(() => {
    const signal = signalSelector(runtime.env.signals)
    return signal.subscribe(listener)
  }, [runtime, signalSelector, listener])
}
