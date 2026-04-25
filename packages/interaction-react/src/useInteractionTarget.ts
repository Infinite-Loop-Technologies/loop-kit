/**
 * Thin target hook returning registration and DOM bridge props.
 */

import type { InteractionTarget } from "@loop-kit/interaction-core";
import type { FocusEventHandler, PointerEventHandler, RefObject } from "react";
import { useInteractionRuntime } from "./useInteractionRuntime.js";
import { useRegisterTarget } from "./useRegisterTarget.js";

export const useInteractionTarget = <TElement extends HTMLElement>(
  target: InteractionTarget,
): {
  readonly ref: RefObject<TElement | null>;
  readonly onPointerDown: PointerEventHandler<TElement>;
  readonly onPointerEnter: PointerEventHandler<TElement>;
  readonly onPointerLeave: PointerEventHandler<TElement>;
  readonly onFocus: FocusEventHandler<TElement>;
  readonly onBlur: FocusEventHandler<TElement>;
} => {
  const runtime = useInteractionRuntime();
  const ref = useRegisterTarget<TElement>(target);

  return {
    ref,
    onPointerDown: (event) => {
      runtime.ingestPointerDown({
        targetId: target.id,
        point: { x: event.clientX, y: event.clientY },
        timestamp: event.timeStamp,
      });
    },
    onPointerEnter: () => runtime.ingestHover(target.id),
    onPointerLeave: () => runtime.ingestHover(undefined),
    onFocus: () => runtime.ingestFocus(target.id),
    onBlur: () => runtime.ingestFocus(undefined),
  };
};
