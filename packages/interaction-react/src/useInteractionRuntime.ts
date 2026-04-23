/**
 * Strict runtime access hook.
 */

import { createRequiredContext } from "@loop-kit/common-react";
import type { InteractionRuntime } from "@loop-kit/interaction-core";

export const [InteractionRuntimeContext, useInteractionRuntime] =
  createRequiredContext<InteractionRuntime>("InteractionRuntime");
