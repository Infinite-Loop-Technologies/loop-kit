import type {
  DockDirection,
  DockDropZone,
  DockNode,
  DockNodeId,
  DockState,
  Rect,
} from './model';

export interface Point {
  x: number;
  y: number;
}

export interface DockLayoutNodeRect {
  id: DockNodeId;
  kind: DockNode['kind'];
  rect: Rect;
  parentId?: DockNodeId;
}

export interface DockGroupLayout extends DockLayoutNodeRect {
  kind: 'group';
  tabBarRect: Rect;
  contentRect: Rect;
  panelIds: DockNodeId[];
  activePanelId: DockNodeId | null;
}

export interface DockSplitHandleLayout {
  id: string;
  splitId: DockNodeId;
  index: number;
  direction: DockDirection;
  rect: Rect;
}

export interface DockLayoutMap {
  bounds: Rect;
  rootId: DockNodeId;
  nodes: Record<DockNodeId, DockLayoutNodeRect>;
  groups: DockGroupLayout[];
  splitHandles: DockSplitHandleLayout[];
}

export interface ComputeLayoutOptions {
  tabBarHeight?: number;
  splitterSize?: number;
}

export interface HitTestOptions {
  edgePx?: number;
  edgeRatio?: number;
  minEdgePx?: number;
  maxEdgePx?: number;
  tabBarHeight?: number;
  hysteresisPx?: number;
}

export interface DockDropTarget {
  groupId: DockNodeId;
  zone: DockDropZone;
  rect: Rect;
  score: number;
  index?: number;
}

export type DockDropIndicatorKind = 'zone' | 'line-vertical' | 'line-horizontal';

export interface DockDropIndicator {
  kind: DockDropIndicatorKind;
  rect: Rect;
  label: string;
}

export interface DropIndicatorOptions {
  tabLineInsetPx?: number;
  edgeLineInsetPx?: number;
}

const DEFAULT_TAB_HEIGHT = 28;
const DEFAULT_SPLITTER_SIZE = 8;
const DEFAULT_EDGE_RATIO = 0.18;
const DEFAULT_MIN_EDGE = 12;
const DEFAULT_MAX_EDGE = 72;
const DEFAULT_HYSTERESIS = 8;
const DEFAULT_TAB_LINE_INSET = 4;
const DEFAULT_EDGE_LINE_INSET = 8;
const DEFAULT_INDICATOR_THICKNESS = 2;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function containsPoint(rect: Rect, point: Point): boolean {
  return (
    point.x >= rect.x &&
    point.x <= rect.x + rect.width &&
    point.y >= rect.y &&
    point.y <= rect.y + rect.height
  );
}

function insetRect(rect: Rect, amount: number): Rect {
  return {
    x: rect.x + amount,
    y: rect.y + amount,
    width: Math.max(0, rect.width - amount * 2),
    height: Math.max(0, rect.height - amount * 2),
  };
}

function expandRect(rect: Rect, amount: number): Rect {
  return {
    x: rect.x - amount,
    y: rect.y - amount,
    width: rect.width + amount * 2,
    height: rect.height + amount * 2,
  };
}

function centerDistance(rect: Rect, point: Point): number {
  const cx = rect.x + rect.width / 2;
  const cy = rect.y + rect.height / 2;
  const dx = point.x - cx;
  const dy = point.y - cy;
  return Math.sqrt(dx * dx + dy * dy);
}

function scoreByDistance(distance: number, base = 1): number {
  return base + 1 / (1 + Math.max(0, distance));
}

function edgeDistance(zone: DockDropZone, groupRect: Rect, point: Point): number {
  switch (zone) {
    case 'left':
      return Math.abs(point.x - groupRect.x);
    case 'right':
      return Math.abs(groupRect.x + groupRect.width - point.x);
    case 'top':
      return Math.abs(point.y - groupRect.y);
    case 'bottom':
      return Math.abs(groupRect.y + groupRect.height - point.y);
    default:
      return Number.POSITIVE_INFINITY;
  }
}

function resolveEdgePx(rect: Rect, options: HitTestOptions): number {
  const minEdgePx = clamp(options.minEdgePx ?? DEFAULT_MIN_EDGE, 6, 120);
  const maxEdgePx = clamp(options.maxEdgePx ?? DEFAULT_MAX_EDGE, minEdgePx, 180);
  const fixed = options.edgePx;
  if (Number.isFinite(fixed)) {
    return clamp(Number(fixed), minEdgePx, maxEdgePx);
  }
  const ratio = clamp(options.edgeRatio ?? DEFAULT_EDGE_RATIO, 0.08, 0.45);
  const basis = Math.min(rect.width, rect.height);
  return clamp(basis * ratio, minEdgePx, maxEdgePx);
}

function tabInsertionIndex(group: DockGroupLayout, point: Point): number {
  const panelCount = group.panelIds.length;
  if (panelCount <= 0) return 0;

  const relativeX = clamp(point.x - group.tabBarRect.x, 0, group.tabBarRect.width);
  const step = group.tabBarRect.width / panelCount;
  if (!Number.isFinite(step) || step <= 0) {
    return panelCount;
  }

  const rawIndex = Math.round(relativeX / step);
  return clamp(rawIndex, 0, panelCount);
}

function nodeChildren(state: DockState, nodeId: DockNodeId): DockNodeId[] {
  const node = state.nodes[nodeId];
  if (!node?.links?.children) return [];
  return node.links.children.filter((id): id is string => typeof id === 'string' && id in state.nodes);
}

function normalizeWeights(weights: readonly number[], count: number): number[] {
  if (count <= 0) return [];
  const next = weights
    .slice(0, count)
    .map((entry) => (Number.isFinite(entry) && entry > 0 ? entry : 0));
  if (next.length !== count) {
    return Array.from({ length: count }, () => 1 / count);
  }
  const total = next.reduce((sum, value) => sum + value, 0);
  if (!Number.isFinite(total) || total <= 1e-9) {
    return Array.from({ length: count }, () => 1 / count);
  }
  return next.map((value) => value / total);
}

function splitRect(rect: Rect, direction: DockDirection, weights: readonly number[]): Rect[] {
  const slices: Rect[] = [];
  let cursor = direction === 'row' ? rect.x : rect.y;
  const size = direction === 'row' ? rect.width : rect.height;

  for (let index = 0; index < weights.length; index += 1) {
    const weight = weights[index] ?? 0;
    const remaining = direction === 'row'
      ? rect.x + rect.width - cursor
      : rect.y + rect.height - cursor;
    const segmentSize =
      index === weights.length - 1
        ? remaining
        : size * weight;

    const nextRect: Rect = direction === 'row'
      ? {
          x: cursor,
          y: rect.y,
          width: Math.max(0, segmentSize),
          height: rect.height,
        }
      : {
          x: rect.x,
          y: cursor,
          width: rect.width,
          height: Math.max(0, segmentSize),
        };

    slices.push(nextRect);
    cursor += segmentSize;
  }

  return slices;
}

/**
 * Projects canonical dock structure into deterministic group/content/splitter rectangles.
 * This function is pure and side-effect free.
 */
export function computeLayoutRects(
  state: DockState,
  bounds: Rect,
  options: ComputeLayoutOptions = {}
): DockLayoutMap {
  const tabBarHeight = Math.max(20, Math.trunc(options.tabBarHeight ?? DEFAULT_TAB_HEIGHT));
  const splitterSize = Math.max(2, Math.trunc(options.splitterSize ?? DEFAULT_SPLITTER_SIZE));

  const layout: DockLayoutMap = {
    bounds,
    rootId: state.rootId,
    nodes: {},
    groups: [],
    splitHandles: [],
  };

  const visit = (nodeId: DockNodeId, rect: Rect, parentId?: DockNodeId): void => {
    const node = state.nodes[nodeId];
    if (!node) return;

    layout.nodes[nodeId] = {
      id: nodeId,
      kind: node.kind,
      rect,
      parentId,
    };

    if (node.kind === 'panel') {
      return;
    }

    if (node.kind === 'group') {
      const panelIds = nodeChildren(state, nodeId).filter((childId) => state.nodes[childId]?.kind === 'panel');
      const tabBarRect: Rect = {
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: Math.min(tabBarHeight, rect.height),
      };
      const contentRect: Rect = {
        x: rect.x,
        y: rect.y + tabBarRect.height,
        width: rect.width,
        height: Math.max(0, rect.height - tabBarRect.height),
      };

      layout.groups.push({
        id: nodeId,
        kind: 'group',
        rect,
        parentId,
        tabBarRect,
        contentRect,
        panelIds,
        activePanelId: typeof node.data.activePanelId === 'string' ? node.data.activePanelId : null,
      });

      for (const panelId of panelIds) {
        layout.nodes[panelId] = {
          id: panelId,
          kind: 'panel',
          rect: contentRect,
          parentId: nodeId,
        };
      }
      return;
    }

    if (node.kind !== 'split') {
      return;
    }

    const children = nodeChildren(state, nodeId).filter((childId) => {
      const child = state.nodes[childId];
      return Boolean(child && child.kind !== 'float-root' && child.kind !== 'float-window');
    });

    if (children.length === 0) {
      return;
    }

    const weights = normalizeWeights(node.data.weights ?? [], children.length);
    const childRects = splitRect(rect, node.data.direction, weights);

    for (const [index, childId] of children.entries()) {
      const childRect = childRects[index];
      if (!childRect) continue;
      visit(childId, childRect, nodeId);

      if (index < children.length - 1) {
        const handleRect: Rect = node.data.direction === 'row'
          ? {
              x: childRect.x + childRect.width - splitterSize / 2,
              y: childRect.y,
              width: splitterSize,
              height: childRect.height,
            }
          : {
              x: childRect.x,
              y: childRect.y + childRect.height - splitterSize / 2,
              width: childRect.width,
              height: splitterSize,
            };

        layout.splitHandles.push({
          id: `${nodeId}:${index.toString(10)}`,
          splitId: nodeId,
          index,
          direction: node.data.direction,
          rect: handleRect,
        });
      }
    }
  };

  visit(state.rootId, bounds, undefined);

  return layout;
}

/**
 * Resolves the best dock drop target for a pointer point over the current layout map.
 * Uses adaptive edge thickness and hysteresis to keep target selection stable.
 */
export function hitTest(
  point: Point,
  layout: DockLayoutMap,
  options: HitTestOptions = {},
  previousTarget?: DockDropTarget | null
): DockDropTarget | null {
  const hysteresis = clamp(options.hysteresisPx ?? DEFAULT_HYSTERESIS, 0, 32);

  if (previousTarget && containsPoint(expandRect(previousTarget.rect, hysteresis), point)) {
    return previousTarget;
  }

  let best: DockDropTarget | null = null;

  for (const group of layout.groups) {
    const edgePx = resolveEdgePx(group.rect, options);

    const tabRect = group.tabBarRect;
    if (containsPoint(tabRect, point)) {
      const index = tabInsertionIndex(group, point);
      const boundaryCount = Math.max(1, group.panelIds.length);
      const step = tabRect.width / boundaryCount;
      const boundaryX = tabRect.x + step * clamp(index, 0, group.panelIds.length);
      const distance = Math.abs(point.x - boundaryX);
      const target: DockDropTarget = {
        groupId: group.id,
        zone: 'tabbar',
        rect: tabRect,
        score: scoreByDistance(distance, 1.45),
        index,
      };
      if (!best || target.score > best.score) best = target;
    }

    const leftRect: Rect = { x: group.rect.x, y: group.rect.y, width: edgePx, height: group.rect.height };
    const rightRect: Rect = {
      x: group.rect.x + group.rect.width - edgePx,
      y: group.rect.y,
      width: edgePx,
      height: group.rect.height,
    };
    const topRect: Rect = { x: group.rect.x, y: group.rect.y, width: group.rect.width, height: edgePx };
    const bottomRect: Rect = {
      x: group.rect.x,
      y: group.rect.y + group.rect.height - edgePx,
      width: group.rect.width,
      height: edgePx,
    };

    const edgeTargets: DockDropTarget[] = [
      {
        groupId: group.id,
        zone: 'left',
        rect: leftRect,
        score: scoreByDistance(edgeDistance('left', group.rect, point), 1.3),
      },
      {
        groupId: group.id,
        zone: 'right',
        rect: rightRect,
        score: scoreByDistance(edgeDistance('right', group.rect, point), 1.3),
      },
      {
        groupId: group.id,
        zone: 'top',
        rect: topRect,
        score: scoreByDistance(edgeDistance('top', group.rect, point), 1.3),
      },
      {
        groupId: group.id,
        zone: 'bottom',
        rect: bottomRect,
        score: scoreByDistance(edgeDistance('bottom', group.rect, point), 1.3),
      },
    ];

    for (const target of edgeTargets) {
      if (!containsPoint(target.rect, point)) continue;
      if (!best || target.score > best.score) best = target;
    }

    const centerRect = insetRect(group.rect, edgePx);
    if (containsPoint(centerRect, point)) {
      const target: DockDropTarget = {
        groupId: group.id,
        zone: 'center',
        rect: centerRect,
        score: scoreByDistance(centerDistance(centerRect, point), 1.0),
      };
      if (!best || target.score > best.score) best = target;
    }
  }

  return best;
}

export function computeDropOverlay(target: DockDropTarget | null): Rect | null {
  if (!target) return null;
  return target.rect;
}

/**
 * Returns a concrete visual guide for the current drop target.
 * Consumers can render either region highlights (`zone`) or thin insertion/split lines.
 */
export function computeDropIndicator(
  target: DockDropTarget | null,
  layout: DockLayoutMap,
  options: DropIndicatorOptions = {}
): DockDropIndicator | null {
  if (!target) return null;
  const group = layout.groups.find((entry) => entry.id === target.groupId);
  const tabLineInsetPx = Math.max(0, options.tabLineInsetPx ?? DEFAULT_TAB_LINE_INSET);
  const edgeLineInsetPx = Math.max(0, options.edgeLineInsetPx ?? DEFAULT_EDGE_LINE_INSET);
  const lineThickness = DEFAULT_INDICATOR_THICKNESS;

  if (target.zone === 'tabbar' && group) {
    if (target.rect.width <= 6) {
      return {
        kind: 'line-vertical',
        label: 'Insert Tab',
        rect: target.rect,
      };
    }
    const boundaryCount = Math.max(1, group.panelIds.length);
    const step = group.tabBarRect.width / boundaryCount;
    const index = clamp(
      typeof target.index === 'number' ? Math.trunc(target.index) : group.panelIds.length,
      0,
      group.panelIds.length
    );
    const x = group.tabBarRect.x + step * index;
    return {
      kind: 'line-vertical',
      label: 'Insert Tab',
      rect: {
        x: x - lineThickness / 2,
        y: group.tabBarRect.y + tabLineInsetPx,
        width: lineThickness,
        height: Math.max(0, group.tabBarRect.height - tabLineInsetPx * 2),
      },
    };
  }

  if ((target.zone === 'left' || target.zone === 'right') && group) {
    const x =
      target.zone === 'left'
        ? group.rect.x + edgeLineInsetPx
        : group.rect.x + group.rect.width - edgeLineInsetPx - lineThickness;
    return {
      kind: 'line-vertical',
      label: target.zone === 'left' ? 'Split Left' : 'Split Right',
      rect: {
        x,
        y: group.rect.y + edgeLineInsetPx,
        width: lineThickness,
        height: Math.max(0, group.rect.height - edgeLineInsetPx * 2),
      },
    };
  }

  if ((target.zone === 'top' || target.zone === 'bottom') && group) {
    const y =
      target.zone === 'top'
        ? group.rect.y + edgeLineInsetPx
        : group.rect.y + group.rect.height - edgeLineInsetPx - lineThickness;
    return {
      kind: 'line-horizontal',
      label: target.zone === 'top' ? 'Split Top' : 'Split Bottom',
      rect: {
        x: group.rect.x + edgeLineInsetPx,
        y,
        width: Math.max(0, group.rect.width - edgeLineInsetPx * 2),
        height: lineThickness,
      },
    };
  }

  return {
    kind: 'zone',
    label: target.zone === 'center' ? 'Dock Center' : 'Drop Target',
    rect: target.rect,
  };
}

export function rectToStyle(rect: Rect): Partial<CSSStyleDeclaration> {
  return {
    left: `${rect.x.toFixed(2)}px`,
    top: `${rect.y.toFixed(2)}px`,
    width: `${Math.max(0, rect.width).toFixed(2)}px`,
    height: `${Math.max(0, rect.height).toFixed(2)}px`,
  };
}
