import type {
    DockDropIndicator,
    DockDropTarget,
    DockGroupLayout,
    DockLayoutMap,
    DockLayoutNodeLayout,
    DockNode,
    DockNodeId,
    DockSplitDirection,
    DockSplitHandleLayout,
    DockState,
    Rect,
} from './types.js';
import { isGroupNode, isSplitNode, normalizeWeights } from './utils.js';

export type DockLayoutOptions = {
    tabBarHeight?: number;
    splitterSize?: number;
};

export type DockDropIndicatorOptions = {
    tabLineInsetPx?: number;
    edgeLineInsetPx?: number;
};

type MutableLayout = {
    nodes: Record<DockNodeId, DockLayoutNodeLayout>;
    groups: DockGroupLayout[];
    splitHandles: DockSplitHandleLayout[];
};

const DEFAULT_LAYOUT_OPTIONS: Required<DockLayoutOptions> = {
    tabBarHeight: 32,
    splitterSize: 12,
};

const DEFAULT_INDICATOR_OPTIONS: Required<DockDropIndicatorOptions> = {
    tabLineInsetPx: 4,
    edgeLineInsetPx: 8,
};

export function computeLayoutRects(
    dockState: DockState,
    bounds: Rect,
    options: DockLayoutOptions = {},
): DockLayoutMap {
    const layoutOptions = {
        ...DEFAULT_LAYOUT_OPTIONS,
        ...options,
    };

    const layout: MutableLayout = {
        nodes: {},
        groups: [],
        splitHandles: [],
    };

    layoutNode(
        dockState,
        dockState.rootId,
        sanitizeRect(bounds),
        layout,
        layoutOptions,
        undefined,
    );

    return {
        bounds: sanitizeRect(bounds),
        nodes: layout.nodes,
        groups: layout.groups,
        splitHandles: layout.splitHandles,
    };
}

function layoutNode(
    dockState: DockState,
    nodeId: DockNodeId,
    rect: Rect,
    layout: MutableLayout,
    options: Required<DockLayoutOptions>,
    parentId: DockNodeId | undefined,
) {
    const node = dockState.nodes[nodeId];
    if (!node) {
        return;
    }

    layout.nodes[nodeId] = {
        id: nodeId,
        kind: node.kind,
        rect: sanitizeRect(rect),
        ...(parentId ? { parentId } : {}),
    };

    if (isGroupNode(node)) {
        layoutGroup(node, rect, layout, options);
        return;
    }

    if (isSplitNode(node)) {
        layoutSplit(dockState, node, rect, layout, options);
    }
}

function layoutGroup(
    node: Extract<DockNode, { kind: 'group' }>,
    rect: Rect,
    layout: MutableLayout,
    options: Required<DockLayoutOptions>,
) {
    const panelIds = [...node.links.children];
    const safeTabBarHeight = Math.max(
        16,
        Math.min(rect.height, options.tabBarHeight),
    );
    const tabBarRect: Rect = {
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: safeTabBarHeight,
    };

    const activePanelId = node.data.activePanelId;
    layout.groups.push({
        id: node.id,
        rect: sanitizeRect(rect),
        tabBarRect: sanitizeRect(tabBarRect),
        panelIds,
        activePanelId:
            typeof activePanelId === 'string' && panelIds.includes(activePanelId)
                ? activePanelId
                : (panelIds[0] ?? null),
    });
}

function layoutSplit(
    dockState: DockState,
    node: Extract<DockNode, { kind: 'split' }>,
    rect: Rect,
    layout: MutableLayout,
    options: Required<DockLayoutOptions>,
) {
    const children = [...node.links.children];
    if (children.length <= 0) {
        return;
    }

    const splitterSize = Math.max(2, options.splitterSize);
    const splitCount = Math.max(0, children.length - 1);
    const totalSplitterSize = splitCount * splitterSize;
    const available =
        node.data.direction === 'row'
            ? Math.max(0, rect.width - totalSplitterSize)
            : Math.max(0, rect.height - totalSplitterSize);
    const weights = normalizeWeights(node.data.weights, children.length);

    let cursorX = rect.x;
    let cursorY = rect.y;
    for (let index = 0; index < children.length; index += 1) {
        const childId = children[index];
        const isLast = index === children.length - 1;
        const size = isLast
            ? node.data.direction === 'row'
                ? rect.x + rect.width - cursorX
                : rect.y + rect.height - cursorY
            : available * weights[index];

        const childRect: Rect =
            node.data.direction === 'row'
                ? {
                      x: cursorX,
                      y: rect.y,
                      width: Math.max(0, size),
                      height: rect.height,
                  }
                : {
                      x: rect.x,
                      y: cursorY,
                      width: rect.width,
                      height: Math.max(0, size),
                  };

        layoutNode(
            dockState,
            childId,
            childRect,
            layout,
            options,
            node.id,
        );

        if (!isLast) {
            const handleRect: Rect =
                node.data.direction === 'row'
                    ? {
                          x: childRect.x + childRect.width,
                          y: rect.y,
                          width: splitterSize,
                          height: rect.height,
                      }
                    : {
                          x: rect.x,
                          y: childRect.y + childRect.height,
                          width: rect.width,
                          height: splitterSize,
                      };

            layout.splitHandles.push({
                id: `${node.id}:handle:${index}`,
                splitId: node.id,
                index,
                direction: node.data.direction,
                rect: sanitizeRect(handleRect),
            });
        }

        if (node.data.direction === 'row') {
            cursorX = childRect.x + childRect.width + splitterSize;
        } else {
            cursorY = childRect.y + childRect.height + splitterSize;
        }
    }
}

function sanitizeRect(rect: Rect): Rect {
    return {
        x: Number.isFinite(rect.x) ? rect.x : 0,
        y: Number.isFinite(rect.y) ? rect.y : 0,
        width: Math.max(0, Number.isFinite(rect.width) ? rect.width : 0),
        height: Math.max(0, Number.isFinite(rect.height) ? rect.height : 0),
    };
}

function edgeRect(
    rect: Rect,
    zone: Exclude<DockDropTarget['zone'], 'tabbar' | 'center'>,
): Rect {
    const edgeX = Math.min(Math.max(20, rect.width * 0.24), 84);
    const edgeY = Math.min(Math.max(20, rect.height * 0.24), 84);

    if (zone === 'left') {
        return {
            x: rect.x,
            y: rect.y,
            width: edgeX,
            height: rect.height,
        };
    }
    if (zone === 'right') {
        return {
            x: rect.x + rect.width - edgeX,
            y: rect.y,
            width: edgeX,
            height: rect.height,
        };
    }
    if (zone === 'top') {
        return {
            x: rect.x,
            y: rect.y,
            width: rect.width,
            height: edgeY,
        };
    }

    return {
        x: rect.x,
        y: rect.y + rect.height - edgeY,
        width: rect.width,
        height: edgeY,
    };
}

function tabbarLineRect(group: DockGroupLayout, index: number, inset: number): Rect {
    const panelCount = Math.max(1, group.panelIds.length);
    const step = group.tabBarRect.width / panelCount;
    const insertionIndex = Math.max(0, Math.min(group.panelIds.length, index));
    const x = group.tabBarRect.x + step * insertionIndex;

    return {
        x: x - 1,
        y: group.tabBarRect.y + inset,
        width: 2,
        height: Math.max(0, group.tabBarRect.height - inset * 2),
    };
}

export function computeDropIndicator(
    dropTarget: DockDropTarget | null,
    layout: DockLayoutMap,
    options: DockDropIndicatorOptions = {},
): DockDropIndicator | null {
    if (!dropTarget) {
        return null;
    }
    const indicatorOptions = {
        ...DEFAULT_INDICATOR_OPTIONS,
        ...options,
    };

    const group = layout.groups.find((entry) => entry.id === dropTarget.groupId);
    if (!group) {
        return null;
    }

    if (dropTarget.zone === 'tabbar') {
        const lineRect = tabbarLineRect(
            group,
            dropTarget.index ?? group.panelIds.length,
            indicatorOptions.tabLineInsetPx,
        );
        return {
            kind: 'line',
            rect: lineRect,
            label: 'tab',
        };
    }

    if (dropTarget.zone === 'center') {
        const inset = indicatorOptions.edgeLineInsetPx;
        return {
            kind: 'zone',
            rect: {
                x: group.rect.x + inset,
                y: group.rect.y + inset,
                width: Math.max(0, group.rect.width - inset * 2),
                height: Math.max(0, group.rect.height - inset * 2),
            },
            label: 'center',
        };
    }

    return {
        kind: 'zone',
        rect: edgeRect(group.rect, dropTarget.zone),
        label: dropTarget.zone,
    };
}

export function splitDirectionFromZone(
    zone: DockDropTarget['zone'],
): DockSplitDirection {
    return zone === 'left' || zone === 'right' ? 'row' : 'col';
}

