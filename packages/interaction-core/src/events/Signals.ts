/**
 * Structured signal bundle for the interaction runtime.
 */

import { createSignal, type Signal } from "@loop-kit/common";
import type {
  ClickEvent,
  DragEndEvent,
  DragMoveEvent,
  DragStartEvent,
  FocusChangedEvent,
  HoverChangedEvent,
  PressEvent,
} from "./Events.js";

export interface InteractionSignals {
  readonly press: Signal<PressEvent>;
  readonly click: Signal<ClickEvent>;
  readonly doubleClick: Signal<ClickEvent>;
  readonly dragStart: Signal<DragStartEvent>;
  readonly dragMove: Signal<DragMoveEvent>;
  readonly dragEnd: Signal<DragEndEvent>;
  readonly hoverChanged: Signal<HoverChangedEvent>;
  readonly focusChanged: Signal<FocusChangedEvent>;
}

export const createInteractionSignals = (): InteractionSignals => ({
  press: createSignal(),
  click: createSignal(),
  doubleClick: createSignal(),
  dragStart: createSignal(),
  dragMove: createSignal(),
  dragEnd: createSignal(),
  hoverChanged: createSignal(),
  focusChanged: createSignal(),
});
