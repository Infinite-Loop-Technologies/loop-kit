import type { GraphPath, GraphState, QueryResolver } from '@loop-kit/graphite';
import {
  computeLayoutRects,
  type ComputeLayoutOptions,
  type DockLayoutMap,
} from './geometry';
import { migrateDockState, type DockPanelNode, type DockState, type Rect } from './model';

export interface DockQueryOptions<TState extends GraphState = GraphState> {
  path?: GraphPath;
  selectDock?: (state: Readonly<TState>) => unknown;
}

export interface DockPanelSummary {
  id: string;
  title: string;
  groupId?: string;
}

export interface DockFocusState {
  activeGroupId: string | null;
  activePanelId: string | null;
}

function readAtPath(root: unknown, path: GraphPath): unknown {
  let current = root;
  for (const segment of path) {
    if (typeof current !== 'object' || current === null) {
      return undefined;
    }
    current = (current as Record<string, unknown>)[String(segment)];
  }
  return current;
}

function resolveDock<TState extends GraphState>(state: Readonly<TState>, options: DockQueryOptions<TState>): DockState {
  const raw = options.selectDock ? options.selectDock(state) : readAtPath(state, options.path ?? ['dock']);
  return migrateDockState(raw);
}

export function createDockLayoutQuery<TState extends GraphState = GraphState>(
  bounds: Rect,
  queryOptions: DockQueryOptions<TState> = {},
  layoutOptions: ComputeLayoutOptions = {}
): QueryResolver<TState, DockLayoutMap> {
  return (state) => {
    const dockState = resolveDock(state, queryOptions);
    return computeLayoutRects(dockState, bounds, layoutOptions);
  };
}

export function createDockPanelQuery<TState extends GraphState = GraphState>(
  options: DockQueryOptions<TState> = {}
): QueryResolver<TState, DockPanelSummary[]> {
  return (state) => {
    const dockState = resolveDock(state, options);
    const panels: DockPanelSummary[] = [];

    for (const node of Object.values(dockState.nodes)) {
      if (node.kind !== 'panel') continue;
      const panel = node as DockPanelNode;
      const groupId = panel.links?.parent?.[0];
      panels.push({
        id: panel.id,
        title: typeof panel.data?.title === 'string' ? panel.data.title : panel.id,
        groupId,
      });
    }

    panels.sort((left, right) => left.title.localeCompare(right.title));
    return panels;
  };
}

export function createDockFocusQuery<TState extends GraphState = GraphState>(
  options: DockQueryOptions<TState> = {}
): QueryResolver<TState, DockFocusState> {
  return (state) => {
    const dockState = resolveDock(state, options);

    const root = dockState.nodes[dockState.rootId];
    if (!root) {
      return {
        activeGroupId: null,
        activePanelId: null,
      };
    }

    const stack = [root.id];
    const visited = new Set<string>();
    while (stack.length > 0) {
      const nextId = stack.shift();
      if (!nextId || visited.has(nextId)) continue;
      visited.add(nextId);

      const node = dockState.nodes[nextId];
      if (!node) continue;
      if (node.kind === 'group') {
        return {
          activeGroupId: node.id,
          activePanelId:
            typeof node.data.activePanelId === 'string' ? node.data.activePanelId : null,
        };
      }

      for (const childId of node.links?.children ?? []) {
        stack.push(childId);
      }
    }

    return {
      activeGroupId: null,
      activePanelId: null,
    };
  };
}
