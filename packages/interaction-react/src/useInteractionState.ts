/**
 * React selector hook for interaction runtime state.
 */

import { useStoreSelector } from "@loop-kit/common-react";
import type { InteractionState } from "@loop-kit/interaction-core";
import { useInteractionRuntime } from "./useInteractionRuntime.js";

export const useInteractionState = <T>(
  select: (state: InteractionState) => T,
): T => {
  const runtime = useInteractionRuntime();
  return useStoreSelector(runtime.state, select);
};
