import {
  type DockDropTarget,
  type DockLayoutMap,
  type HitTestOptions,
  hitTest,
  type Point,
} from './geometry';
import type { DockDirection, DockNodeId } from './model';

export type DockInteractionIntent =
  | {
      name: 'dock/move-panel';
      payload: {
        panelId: DockNodeId;
        target: {
          groupId: DockNodeId;
          zone: DockDropTarget['zone'];
          index?: number;
        };
      };
      transient?: false;
    }
  | {
      name: 'dock/resize';
      payload: {
        splitId: DockNodeId;
        weights: number[];
        transient?: boolean;
      };
      transient?: boolean;
    };

interface PanelDragSession {
  kind: 'panel';
  panelId: DockNodeId;
  lastTarget: DockDropTarget | null;
}

interface ResizeSession {
  kind: 'resize';
  splitId: DockNodeId;
  handleIndex: number;
  direction: DockDirection;
  startPoint: Point;
  splitSize: number;
  startWeights: number[];
  latestWeights: number[];
  minWeight: number;
}

export interface DockResizeStartOptions {
  splitId: DockNodeId;
  handleIndex: number;
  direction: DockDirection;
  startPoint: Point;
  splitSize: number;
  weights: readonly number[];
  minWeight?: number;
}

export interface DockInteractionControllerOptions {
  hitTestOptions?: HitTestOptions;
  minWeight?: number;
  onDropTargetChange?: (target: DockDropTarget | null) => void;
  resolveDropTarget?: (context: {
    phase: 'move' | 'end';
    point: Point;
    layout: DockLayoutMap;
    rawTarget: DockDropTarget | null;
    previousTarget: DockDropTarget | null;
  }) => DockDropTarget | null;
}

const EPSILON = 1e-6;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function normalizeWeights(weights: readonly number[]): number[] {
  const next = weights.map((entry) => (Number.isFinite(entry) && entry > 0 ? entry : 0));
  const total = next.reduce((sum, value) => sum + value, 0);
  if (total <= EPSILON) {
    return Array.from({ length: next.length }, () => 1 / Math.max(1, next.length));
  }
  return next.map((value) => value / total);
}

function weightsEqual(left: readonly number[], right: readonly number[]): boolean {
  if (left.length !== right.length) return false;
  for (let index = 0; index < left.length; index += 1) {
    if (Math.abs((left[index] ?? 0) - (right[index] ?? 0)) > EPSILON) {
      return false;
    }
  }
  return true;
}

function resizeWeights(
  weights: readonly number[],
  handleIndex: number,
  deltaRatio: number,
  minWeight: number
): number[] | null {
  const left = weights[handleIndex];
  const right = weights[handleIndex + 1];
  if (typeof left !== 'number' || typeof right !== 'number') {
    return null;
  }

  const pairTotal = left + right;
  const minLeft = Math.min(minWeight, pairTotal / 2);
  const minRight = Math.min(minWeight, pairTotal / 2);
  const nextLeft = clamp(left + deltaRatio, minLeft, pairTotal - minRight);
  const nextRight = pairTotal - nextLeft;

  const next = [...weights];
  next[handleIndex] = nextLeft;
  next[handleIndex + 1] = nextRight;
  return normalizeWeights(next);
}

export interface DockInteractionController {
  startPanelDrag(panelId: DockNodeId): void;
  updatePointer(point: Point, layout: DockLayoutMap): DockDropTarget | null;
  endPanelDrag(point: Point, layout: DockLayoutMap): DockInteractionIntent | null;
  cancelPanelDrag(): void;
  startResize(options: DockResizeStartOptions): void;
  updateResize(point: Point): DockInteractionIntent | null;
  endResize(point: Point): DockInteractionIntent | null;
  cancelResize(): void;
  getDropTarget(): DockDropTarget | null;
}

/**
 * Creates an ephemeral interaction state machine for panel drag/drop + split resize.
 * It never mutates Graphite directly; it only emits intents.
 */
export function createDockInteractionController(
  options: DockInteractionControllerOptions = {}
): DockInteractionController {
  let dragSession: PanelDragSession | null = null;
  let resizeSession: ResizeSession | null = null;

  const emitDropTarget = (target: DockDropTarget | null) => {
    options.onDropTargetChange?.(target);
  };

  return {
    startPanelDrag(panelId) {
      dragSession = {
        kind: 'panel',
        panelId,
        lastTarget: null,
      };
      emitDropTarget(null);
    },

    updatePointer(point, layout) {
      if (!dragSession) return null;
      const rawTarget = hitTest(point, layout, options.hitTestOptions, dragSession.lastTarget);
      const nextTarget =
        options.resolveDropTarget?.({
          phase: 'move',
          point,
          layout,
          rawTarget,
          previousTarget: dragSession.lastTarget,
        }) ?? rawTarget;
      if (nextTarget?.groupId !== dragSession.lastTarget?.groupId || nextTarget?.zone !== dragSession.lastTarget?.zone || nextTarget?.index !== dragSession.lastTarget?.index) {
        dragSession.lastTarget = nextTarget;
        emitDropTarget(nextTarget);
      }
      return dragSession.lastTarget;
    },

    endPanelDrag(point, layout) {
      if (!dragSession) return null;
      const rawTarget = hitTest(point, layout, options.hitTestOptions, dragSession.lastTarget);
      const target =
        options.resolveDropTarget?.({
          phase: 'end',
          point,
          layout,
          rawTarget,
          previousTarget: dragSession.lastTarget,
        }) ?? rawTarget;
      const panelId = dragSession.panelId;
      dragSession = null;
      emitDropTarget(null);
      if (!target) return null;
      return {
        name: 'dock/move-panel',
        payload: {
          panelId,
          target: {
            groupId: target.groupId,
            zone: target.zone,
            index: target.index,
          },
        },
      };
    },

    cancelPanelDrag() {
      dragSession = null;
      emitDropTarget(null);
    },

    startResize(start) {
      resizeSession = {
        kind: 'resize',
        splitId: start.splitId,
        handleIndex: start.handleIndex,
        direction: start.direction,
        startPoint: start.startPoint,
        splitSize: Math.max(1, start.splitSize),
        startWeights: normalizeWeights([...start.weights]),
        latestWeights: normalizeWeights([...start.weights]),
        minWeight: Math.max(0, Math.min(0.45, start.minWeight ?? options.minWeight ?? 0.05)),
      };
    },

    updateResize(point) {
      if (!resizeSession) return null;
      const axisDelta =
        resizeSession.direction === 'row'
          ? point.x - resizeSession.startPoint.x
          : point.y - resizeSession.startPoint.y;
      const ratioDelta = axisDelta / resizeSession.splitSize;
      const next = resizeWeights(
        resizeSession.startWeights,
        resizeSession.handleIndex,
        ratioDelta,
        resizeSession.minWeight
      );
      if (!next) return null;
      if (weightsEqual(next, resizeSession.latestWeights)) return null;
      resizeSession.latestWeights = next;
      return {
        name: 'dock/resize',
        transient: true,
        payload: {
          splitId: resizeSession.splitId,
          weights: next,
          transient: true,
        },
      };
    },

    endResize(point) {
      if (!resizeSession) return null;
      const transient = this.updateResize(point);
      const weights =
        transient && transient.name === 'dock/resize'
          ? transient.payload.weights
          : resizeSession.latestWeights;
      const splitId = resizeSession.splitId;
      resizeSession = null;
      return {
        name: 'dock/resize',
        transient: false,
        payload: {
          splitId,
          weights,
          transient: false,
        },
      };
    },

    cancelResize() {
      resizeSession = null;
    },

    getDropTarget() {
      return dragSession?.lastTarget ?? null;
    },
  };
}
