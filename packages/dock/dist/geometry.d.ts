import type { DockDirection, DockDropZone, DockNode, DockNodeId, DockState, Rect } from './model';
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
/**
 * Projects canonical dock structure into deterministic group/content/splitter rectangles.
 * This function is pure and side-effect free.
 */
export declare function computeLayoutRects(state: DockState, bounds: Rect, options?: ComputeLayoutOptions): DockLayoutMap;
/**
 * Resolves the best dock drop target for a pointer point over the current layout map.
 * Uses adaptive edge thickness and hysteresis to keep target selection stable.
 */
export declare function hitTest(point: Point, layout: DockLayoutMap, options?: HitTestOptions, previousTarget?: DockDropTarget | null): DockDropTarget | null;
export declare function computeDropOverlay(target: DockDropTarget | null): Rect | null;
/**
 * Returns a concrete visual guide for the current drop target.
 * Consumers can render either region highlights (`zone`) or thin insertion/split lines.
 */
export declare function computeDropIndicator(target: DockDropTarget | null, layout: DockLayoutMap, options?: DropIndicatorOptions): DockDropIndicator | null;
export declare function rectToStyle(rect: Rect): Partial<CSSStyleDeclaration>;
//# sourceMappingURL=geometry.d.ts.map