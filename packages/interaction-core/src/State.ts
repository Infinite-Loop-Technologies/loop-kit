/**
 * Ephemeral interaction runtime state.
 *
 * This state tracks runtime/session information only. Committed domain truth
 * belongs in services built on top of the interaction runtime.
 */

import type { Point } from "./Geometry.js";
import type { InteractionTargetId } from "./Target.js";

export interface DragSessionState {
  readonly targetId: InteractionTargetId;
  readonly origin: Point;
  readonly current: Point;
}

export interface InteractionState {
  readonly hoveredTargetId?: InteractionTargetId | undefined;
  readonly focusedTargetId?: InteractionTargetId | undefined;
  readonly pressedTargetId?: InteractionTargetId | undefined;
  readonly dragSession?: DragSessionState | undefined;
}

export const createInteractionState = (): InteractionState => ({});
