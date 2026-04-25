/**
 * Target registration hook.
 *
 * The hook only registers target facts and DOM accessors. Runtime behavior
 * lives in policies installed on the interaction runtime.
 */

import type { InteractionTarget } from "@loop-kit/interaction-core";
import { useEffect, useRef, type RefObject } from "react";
import { useInteractionRuntime } from "./useInteractionRuntime.js";

export const useRegisterTarget = <TElement extends HTMLElement>(
  target: InteractionTarget,
): RefObject<TElement | null> => {
  const runtime = useInteractionRuntime();
  const elementRef = useRef<TElement | null>(null);

  useEffect(() => {
    const registration = runtime.registerTarget({
      ...target,
      getElement: () => elementRef.current,
      getRect: () => elementRef.current?.getBoundingClientRect() ?? null,
    });

    return () => {
      registration[Symbol.dispose]();
    };
  }, [runtime, target]);

  return elementRef;
};
