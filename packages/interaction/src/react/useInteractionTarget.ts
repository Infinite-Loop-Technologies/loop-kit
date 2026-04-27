/**
 * React hook for registering DOM elements as interaction targets.
 *
 * The hook returns a ref callback. When React provides an element, the hook
 * registers it with the runtime; when React clears the ref or unmounts, the
 * target lease is disposed. It does not attach domain behavior.
 *
 * @module
 */

import { useCallback, useEffect, useRef } from "react"

import type { RuntimeLease } from "@loop-kit/common/Runtime"

import type { InteractionRect } from "../InteractionGeometry.js"
import type { InteractionTarget, InteractionTargetRegistration } from "../InteractionTarget.js"
import { useInteractionRuntime } from "./useInteractionRuntime.js"

export interface UseInteractionTargetOptions
  extends Omit<InteractionTargetRegistration, "element" | "getElement"> {}

export const useInteractionTarget = <TElement extends Element = HTMLElement>(
  options: UseInteractionTargetOptions
): ((element: TElement | null) => void) => {
  const runtime = useInteractionRuntime()
  const leaseRef = useRef<RuntimeLease<InteractionTarget> | null>(null)

  const disposeCurrentLease = useCallback(() => {
    const lease = leaseRef.current
    leaseRef.current = null
    if (lease) void lease.dispose()
  }, [])

  useEffect(() => disposeCurrentLease, [disposeCurrentLease])

  return useCallback(
    (element: TElement | null) => {
      disposeCurrentLease()
      if (!element) return

      leaseRef.current = runtime.registerTarget({
        ...options,
        element,
        getElement: () => element,
        getRect: options.getRect ?? (() => getElementRect(element)),
      })
    },
    [disposeCurrentLease, runtime, options]
  )
}

const getElementRect = (element: Element): InteractionRect | null => {
  if (!("getBoundingClientRect" in element)) return null
  const rect = element.getBoundingClientRect()
  return {
    x: rect.x,
    y: rect.y,
    width: rect.width,
    height: rect.height,
  }
}
