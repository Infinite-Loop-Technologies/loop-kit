/**
 * Runtime boundary for generic interaction orchestration.
 *
 * InteractionRuntime composes `@loop-kit/common` Runtime with interaction
 * stores, signals, and target registration helpers. It owns lifecycle and
 * session-time facts, not domain truth.
 *
 * ```ts
 * const runtime = createInteractionRuntime()
 * const target = runtime.registerTarget({ id, roles: ["pressable"] })
 * await target.dispose()
 * ```
 *
 * @module
 */

import { type Runtime, type RuntimeLease, createRuntime } from "@loop-kit/common/Runtime"
import type { Store } from "@loop-kit/common/Store"

import {
  type InteractionSignals,
  createInteractionSignals,
  disposeInteractionSignals,
} from "./InteractionSignals.js"
import { type InteractionState, createInteractionStateStore } from "./InteractionState.js"
import type {
  InteractionTarget,
  InteractionTargetId,
  InteractionTargetRegistration,
  InteractionTargetRegistry,
} from "./InteractionTarget.js"
import { createTargetRegistry } from "./__internal/TargetRegistry.js"

export interface InteractionEnv {
  readonly state: Store<InteractionState>
  readonly signals: InteractionSignals
  readonly targets: InteractionTargetRegistry
}

export interface InteractionRuntime extends Runtime<InteractionEnv> {
  readonly registerTarget: (
    registration: InteractionTargetRegistration
  ) => RuntimeLease<InteractionTarget>
  readonly unregisterTarget: (targetId: InteractionTargetId) => void
  readonly getTarget: (targetId: InteractionTargetId) => InteractionTarget | undefined
  readonly getTargetAncestry: (targetId: InteractionTargetId) => ReadonlyArray<InteractionTarget>
  readonly resolveTargetFromDomNode: (node: EventTarget | null) => InteractionTarget | undefined
}

export const createInteractionRuntime = (): InteractionRuntime => {
  const state = createInteractionStateStore()
  const signals = createInteractionSignals()
  const targets = createTargetRegistry()
  const runtime = createRuntime<InteractionEnv>({
    state,
    signals,
    targets,
  })

  let disposed = false
  const disposeRuntime = runtime.dispose

  const interactionRuntime: InteractionRuntime = {
    ...runtime,

    registerTarget: (registration) => {
      assertRuntimeRunning(interactionRuntime)

      const target = targets.register(registration)
      let leaseDisposed = false

      const dispose = async (): Promise<void> => {
        if (leaseDisposed) return
        leaseDisposed = true
        targets.unregister(target.id)
      }

      return {
        value: target,
        dispose,
        [Symbol.asyncDispose]: dispose,
      }
    },

    unregisterTarget: targets.unregister,
    getTarget: targets.get,
    getTargetAncestry: targets.getAncestry,
    resolveTargetFromDomNode: targets.resolveFromDomNode,

    dispose: async () => {
      if (disposed) {
        await disposeRuntime()
        return
      }
      disposed = true

      const errors: Array<unknown> = []
      try {
        await disposeRuntime()
      } catch (error) {
        errors.push(error)
      }

      try {
        targets.clear()
        state[Symbol.dispose]()
        disposeInteractionSignals(signals)
      } catch (error) {
        errors.push(error)
      }

      if (errors.length > 0) {
        throw new AggregateError(errors, "InteractionRuntime disposal failed.")
      }
    },

    [Symbol.asyncDispose]: async () => {
      await interactionRuntime.dispose()
    },
  }

  return interactionRuntime
}

const assertRuntimeRunning = (runtime: InteractionRuntime): void => {
  const snapshot = runtime.snapshot()
  if (snapshot.state !== "Running") {
    throw new Error(
      `InteractionRuntime is ${snapshot.state.toLowerCase()} and cannot register targets.`
    )
  }
}
