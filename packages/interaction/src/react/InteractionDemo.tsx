/**
 * Tiny local demo for the React interaction bridge.
 *
 * The demo shows the intended vertical slice: create a runtime, provide it with
 * InteractionRoot, register a target, and observe click/dragStart signals. It
 * is example code only and does not install domain behavior.
 *
 * @module
 */

import { type ReactNode, useCallback, useMemo, useState } from "react"

import { createInteractionRuntime } from "../InteractionRuntime.js"
import type { InteractionTargetId } from "../InteractionTarget.js"
import { InteractionRoot } from "./InteractionRoot.js"
import { useInteractionSignal } from "./useInteractionSignal.js"
import { useInteractionTarget } from "./useInteractionTarget.js"

export const InteractionDemo = (): ReactNode => {
  const runtime = useMemo(() => createInteractionRuntime(), [])

  return (
    <InteractionRoot runtime={runtime} installDefaults>
      <InteractionDemoTarget />
    </InteractionRoot>
  )
}

const InteractionDemoTarget = (): ReactNode => {
  const [message, setMessage] = useState("idle")
  const targetRef = useInteractionTarget<HTMLButtonElement>({
    id: "interaction-demo-target" as InteractionTargetId,
    roles: ["pressable", "draggable"],
  })

  useInteractionSignal(
    useCallback((signals) => signals.click, []),
    useCallback((signal) => {
      setMessage(`click:${signal.target?.id ?? "none"}`)
    }, [])
  )

  useInteractionSignal(
    useCallback((signals) => signals.dragStart, []),
    useCallback((signal) => {
      setMessage(`drag:${signal.source.id}`)
    }, [])
  )

  return (
    <button ref={targetRef} type="button">
      {message}
    </button>
  )
}
