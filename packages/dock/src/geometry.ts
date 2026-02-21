import type {
  DockDirection,
  DockDropZone,
  DockGroupNode,
  DockNode,
  DockNodeId,
  DockSplitNode,
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

const DEFAULT_TAB_HEIGHT = 28;
const DEFAULT_SPLITTER_SIZE = 8;
const DEFAULT_EDGE_PX = 32;
const DEFAULT_HYSTERESIS = 8;

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

function asSplit(node: DockNode | undefined): DockSplitNode | null {
  return node?.kind === 'split' ? (node as DockSplitNode) : null;
}

function asGroup(node: DockNode | undefined): DockGroupNode | null {
  return node?.kind === 'group' ? (node as DockGroupNode) : null;
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

function candidateScore(rect: Rect, point: Point, base = 1): number {
  return base + 1 / (1 + centerDistance(rect, point));
}

export function hitTest(
  point: Point,
  layout: DockLayoutMap,
  options: HitTestOptions = {},
  previousTarget?: DockDropTarget | null
): DockDropTarget | null {
  const edgePx = clamp(options.edgePx ?? DEFAULT_EDGE_PX, 8, 96);
  const hysteresis = clamp(options.hysteresisPx ?? DEFAULT_HYSTERESIS, 0, 32);

  if (previousTarget && containsPoint(expandRect(previousTarget.rect, hysteresis), point)) {
    return previousTarget;
  }

  let best: DockDropTarget | null = null;

  for (const group of layout.groups) {
    const tabRect = group.tabBarRect;
    if (containsPoint(tabRect, point)) {
      const tabWidth = group.panelIds.length > 0 ? tabRect.width / group.panelIds.length : tabRect.width;
      const index = tabWidth > 0
        ? clamp(Math.floor((point.x - tabRect.x) / tabWidth), 0, Math.max(0, group.panelIds.length))
        : group.panelIds.length;
      const target: DockDropTarget = {
        groupId: group.id,
        zone: 'tabbar',
        rect: tabRect,
        score: candidateScore(tabRect, point, 1.2),
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
      { groupId: group.id, zone: 'left', rect: leftRect, score: candidateScore(leftRect, point, 1.1) },
      { groupId: group.id, zone: 'right', rect: rightRect, score: candidateScore(rightRect, point, 1.1) },
      { groupId: group.id, zone: 'top', rect: topRect, score: candidateScore(topRect, point, 1.1) },
      { groupId: group.id, zone: 'bottom', rect: bottomRect, score: candidateScore(bottomRect, point, 1.1) },
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
        score: candidateScore(centerRect, point, 1.0),
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

export function rectToStyle(rect: Rect): Partial<CSSStyleDeclaration> {
  return {
    left: `${rect.x.toFixed(2)}px`,
    top: `${rect.y.toFixed(2)}px`,
    width: `${Math.max(0, rect.width).toFixed(2)}px`,
    height: `${Math.max(0, rect.height).toFixed(2)}px`,
  };
}
