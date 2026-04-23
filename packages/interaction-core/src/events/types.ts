/**
 * Input and synthesized interaction event types.
 *
 * The runtime ingests raw pointer/focus input and emits structured signals
 * suitable for policies and effects.
 */

import type { Point } from "./Geometry.js";
import type { InteractionTargetId } from "./Target.js";

export interface PointerInput {
  readonly targetId: InteractionTargetId;
  readonly point: Point;
  readonly timestamp: number;
}

export interface HoverChangedEvent {
  readonly previousTargetId?: InteractionTargetId | undefined;
  readonly targetId?: InteractionTargetId | undefined;
}

export interface FocusChangedEvent {
  readonly previousTargetId?: InteractionTargetId | undefined;
  readonly targetId?: InteractionTargetId | undefined;
}

export interface PressEvent extends PointerInput {}

export interface ClickEvent extends PointerInput {
  readonly clickCount: 1 | 2;
}

export interface DragStartEvent extends PointerInput {
  readonly origin: Point;
}

export interface DragMoveEvent extends PointerInput {
  readonly origin: Point;
}

export interface DragEndEvent extends PointerInput {
  readonly origin: Point;
}
