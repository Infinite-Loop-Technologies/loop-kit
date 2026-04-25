/**
 * Headless interaction runtime.
 *
 * The runtime owns:
 *
 * - target registration and semantic ancestry
 * - structured interaction signals
 * - session state such as drag flows
 * - lifecycle and installer execution
 *
 * Domain packages install policies on top of this runtime instead of burying
 * event timing logic inside UI components.
 */

import { createLookupMap, createRuntime, createStore, type Runtime, type Store } from "@loop-kit/common";
import { distanceBetweenPoints } from "./Geometry.js";
import { createInteractionSignals, type InteractionSignals } from "./Signals.js";
import { createInteractionState, type InteractionState } from "./State.js";
import type { InteractionTarget } from "./Target.js";
import { createSessionState } from "./__internal/SessionState.js";
import { createTreeIndex } from "./__internal/TreeIndex.js";
import type { PointerInput, HoverChangedEvent, FocusChangedEvent, DragStartEvent, DragMoveEvent, DragEndEvent, ClickEvent } from "./events/types.js";

const dragThreshold = 6;
const doubleClickWindowMs = 320;
/**
 * Public runtime environment shape.
 *
 * This allows policies to depend on stable runtime-owned services without
 * reaching into implementation details.
 */

export interface InteractionRuntimeEnv {
  readonly state: Store<InteractionState>;
  readonly signals: InteractionSignals;
}

export type InteractionRuntimeContext = Runtime<InteractionRuntimeEnv>;

export interface InteractionRuntime extends Runtime<InteractionRuntimeEnv> {
  readonly state: InteractionRuntimeEnv["state"];
  readonly signals: InteractionSignals;
  readonly registerTarget: (target: InteractionTarget) => Disposable;
  readonly updateTarget: (
    id: InteractionTarget["id"],
    updater: (target: InteractionTarget) => InteractionTarget,
  ) => void;
  readonly getTarget: (id: InteractionTarget["id"]) => InteractionTarget | undefined;
  readonly getChildren: (id: InteractionTarget["id"]) => ReadonlyArray<InteractionTarget["id"]>;
  readonly getAncestors: (id: InteractionTarget["id"]) => ReadonlyArray<InteractionTarget["id"]>;
  readonly ingestPointerDown: (event: PointerInput) => void;
  readonly ingestPointerMove: (event: PointerInput) => void;
  readonly ingestPointerUp: (event: PointerInput) => void;
  readonly ingestHover: (targetId?: InteractionTarget["id"]) => void;
  readonly ingestFocus: (targetId?: InteractionTarget["id"]) => void;
}

interface CreateInteractionRuntimeOptions {
  readonly initialState?: InteractionState | undefined;
}

export const createInteractionRuntime = ({
  initialState = createInteractionState(),
}: CreateInteractionRuntimeOptions = {}): InteractionRuntime => {
  const state = createStore(initialState);
  const signals = createInteractionSignals();
  const targets = createLookupMap<InteractionTarget["id"], InteractionTarget, string>({
    lookup: (id) => id,
  });
  const tree = createTreeIndex();
  const sessionState = createSessionState();
  const baseRuntime = createRuntime<InteractionRuntimeEnv>({ state, signals });

  let lastClick:
    | {
        readonly targetId: InteractionTarget["id"];
        readonly timestamp: number;
      }
    | undefined;

  const emitHoverChanged = (
    previousTargetId?: InteractionTarget["id"],
    targetId?: InteractionTarget["id"],
  ): void => {
    const event: HoverChangedEvent = { previousTargetId, targetId };
    signals.hoverChanged.emit(event);
  };

  const emitFocusChanged = (
    previousTargetId?: InteractionTarget["id"],
    targetId?: InteractionTarget["id"],
  ): void => {
    const event: FocusChangedEvent = { previousTargetId, targetId };
    signals.focusChanged.emit(event);
  };

  const registerTarget = (target: InteractionTarget): Disposable => {
    targets.set(target.id, target);
    tree.setParent(target.id, target.parentId);
    return {
      [Symbol.dispose]: () => {
        targets.delete(target.id);
        tree.removeTarget(target.id);
      },
    };
  };

  const updateTarget = (
    id: InteractionTarget["id"],
    updater: (target: InteractionTarget) => InteractionTarget,
  ): void => {
    const current = targets.get(id);
    if (!current) return;
    const next = updater(current);
    targets.set(id, next);
    tree.setParent(id, next.parentId);
  };

  const getTarget = (
    id: InteractionTarget["id"],
  ): InteractionTarget | undefined => targets.get(id);

  const getChildren = (
    id: InteractionTarget["id"],
  ): ReadonlyArray<InteractionTarget["id"]> => tree.getChildren(id);

  const getAncestors = (
    id: InteractionTarget["id"],
  ): ReadonlyArray<InteractionTarget["id"]> => tree.getAncestors(id);

  const ingestHover = (targetId?: InteractionTarget["id"]): void => {
    const previousTargetId = state.get().hoveredTargetId;
    if (previousTargetId === targetId) return;
    state.update((current) => ({ ...current, hoveredTargetId: targetId }));
    emitHoverChanged(previousTargetId, targetId);
  };

  const ingestFocus = (targetId?: InteractionTarget["id"]): void => {
    const previousTargetId = state.get().focusedTargetId;
    if (previousTargetId === targetId) return;
    state.update((current) => ({ ...current, focusedTargetId: targetId }));
    emitFocusChanged(previousTargetId, targetId);
  };

  const ingestPointerDown = (event: PointerInput): void => {
    ingestHover(event.targetId);
    state.update((current) => ({ ...current, pressedTargetId: event.targetId }));
    signals.press.emit(event);
  };

  const ingestPointerMove = (event: PointerInput): void => {
    ingestHover(event.targetId);
    const current = state.get();
    const pressedTargetId = current.pressedTargetId;
    if (!pressedTargetId) return;

    const dragSession = current.dragSession;
    if (!dragSession) {
      const pressedTarget = targets.get(pressedTargetId);
      if (!pressedTarget || !pressedTarget.roles.includes("draggable")) return;
      const origin = event.point;
      state.update((value) => ({
        ...value,
        dragSession: {
          targetId: pressedTargetId,
          origin,
          current: event.point,
        },
      }));
      sessionState.begin("drag");
      const dragStart: DragStartEvent = { ...event, origin };
      signals.dragStart.emit(dragStart);
      return;
    }

    if (distanceBetweenPoints(dragSession.origin, event.point) < dragThreshold) {
      return;
    }

    state.update((value) => ({
      ...value,
      dragSession: {
        ...dragSession,
        current: event.point,
      },
    }));
    const dragMove: DragMoveEvent = { ...event, origin: dragSession.origin };
    signals.dragMove.emit(dragMove);
  };

  const ingestPointerUp = (event: PointerInput): void => {
    const current = state.get();
    const dragSession = current.dragSession;

    state.update((value) => ({
      ...value,
      pressedTargetId: undefined,
      dragSession: undefined,
    }));

    if (dragSession) {
      sessionState.end("drag");
      const dragEnd: DragEndEvent = { ...event, origin: dragSession.origin };
      signals.dragEnd.emit(dragEnd);
      return;
    }

    if (current.pressedTargetId !== event.targetId) return;

    const clickCount: 1 | 2 =
      lastClick &&
      lastClick.targetId === event.targetId &&
      event.timestamp - lastClick.timestamp <= doubleClickWindowMs
        ? 2
        : 1;

    lastClick = {
      targetId: event.targetId,
      timestamp: event.timestamp,
    };

    const click: ClickEvent = { ...event, clickCount };
    signals.click.emit(click);
    if (clickCount === 2) {
      signals.doubleClick.emit(click);
    }
  };

  return {
    ...baseRuntime,
    state,
    signals,
    registerTarget,
    updateTarget,
    getTarget,
    getChildren,
    getAncestors,
    ingestPointerDown,
    ingestPointerMove,
    ingestPointerUp,
    ingestHover,
    ingestFocus,
  };
};
