/**
 * Window-level DOM bridge for sessional pointer flows.
 *
 * Targets handle local down/hover/focus events. This bridge owns long-lived
 * global listeners needed once a drag or press is in progress.
 */

"use client";

import { useEffect } from "react";
import { useInteractionRuntime } from "./useInteractionRuntime.js";

export function DomBridge() {
  const runtime = useInteractionRuntime();

  useEffect(() => {
    const onPointerMove = (event: PointerEvent) => {
      const element = document.elementFromPoint(event.clientX, event.clientY);
      const targetId = element?.getAttribute("data-interaction-target-id") ?? undefined;
      if (!targetId) return;
      runtime.ingestPointerMove({
        targetId: targetId as never,
        point: { x: event.clientX, y: event.clientY },
        timestamp: event.timeStamp,
      });
    };

    const onPointerUp = (event: PointerEvent) => {
      const element = document.elementFromPoint(event.clientX, event.clientY);
      const targetId =
        element?.getAttribute("data-interaction-target-id") ??
        runtime.state.get().pressedTargetId;
      if (!targetId) return;
      runtime.ingestPointerUp({
        targetId: targetId as never,
        point: { x: event.clientX, y: event.clientY },
        timestamp: event.timeStamp,
      });
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, [runtime]);

  return null;
}
