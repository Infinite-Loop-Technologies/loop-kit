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
export declare function computeLayoutRects(state: DockState, bounds: Rect, options?: ComputeLayoutOptions): DockLayoutMap;
export declare function hitTest(point: Point, layout: DockLayoutMap, options?: HitTestOptions, previousTarget?: DockDropTarget | null): DockDropTarget | null;
export declare function computeDropOverlay(target: DockDropTarget | null): Rect | null;
export declare function rectToStyle(rect: Rect): Partial<CSSStyleDeclaration>;
//# sourceMappingURL=geometry.d.ts.map