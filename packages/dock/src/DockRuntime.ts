/**
 * Dock runtime.
 *
 * This runtime owns transient dock interaction state such as drag previews and
 * resize sessions. It composes the dock service with the interaction runtime.
 */

import { createRuntime, createStore, type Runtime, type Store } from "@loop-kit/common";
import type {
  DragEndEvent,
  DragMoveEvent,
  DragStartEvent,
  InteractionRuntime,
} from "@loop-kit/interaction-core";
import type { DockService } from "./DockService.js";
import type { DockDropPlacement } from "./DockNode.js";
import type { DockPanelId, DockSplitId } from "./DockIds.js";
import { createDockPolicies } from "./DockPolicies.js";

export interface DockRuntimeState {
  readonly draggedPanelId?: DockPanelId | undefined;
  readonly preview?: DockDropPlacement | undefined;
  readonly activeResize?:
    | {
        readonly splitId: DockSplitId;
        readonly axis: "horizontal" | "vertical";
        readonly startRatio: number;
        readonly origin: DragStartEvent["origin"];
      }
    | undefined;
}

export interface DockRuntimeEnv {
  readonly service: DockService;
  readonly interaction: InteractionRuntime;
  readonly state: Store<DockRuntimeState>;
}

export interface DockRuntime extends Runtime<DockRuntimeEnv> {
  readonly service: DockService;
  readonly interaction: InteractionRuntime;
  readonly state: Store<DockRuntimeState>;
}

export const createDockRuntime = ({
  service,
  interaction,
}: {
  readonly service: DockService;
  readonly interaction: InteractionRuntime;
}): DockRuntime => {
  const state = createStore<DockRuntimeState>({});
  const baseRuntime = createRuntime<DockRuntimeEnv>({
    service,
    interaction,
    state,
  });

  const runtime: DockRuntime = {
    ...baseRuntime,
    service,
    interaction,
    state,
  };

  void runtime.install(createDockPolicies({ runtime }));

  return runtime;
};
