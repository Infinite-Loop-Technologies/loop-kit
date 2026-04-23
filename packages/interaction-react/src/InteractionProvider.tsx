/**
 * React provider for the interaction runtime.
 */

"use client";

import {
  createInteractionRuntime,
  type InteractionRuntime,
} from "@loop-kit/interaction-core";
import { useState, type ReactNode } from "react";
import { DomBridge } from "./DomBridge.js";
import { InteractionRuntimeContext } from "./useInteractionRuntime.js";

export function InteractionProvider({
  children,
  runtime: providedRuntime,
}: {
  readonly children: ReactNode;
  readonly runtime?: InteractionRuntime | undefined;
}) {
  const [runtime] = useState<InteractionRuntime>(
    () => providedRuntime ?? createInteractionRuntime(),
  );

  return (
    <InteractionRuntimeContext.Provider value={runtime}>
      <DomBridge />
      {children}
    </InteractionRuntimeContext.Provider>
  );
}
