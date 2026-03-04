import { type HitTestResult, type NodeId } from '@loop-kit/graphite-core';
import type { DockLayoutNode } from '../facet/queries.js';
export type Rect = {
    x: number;
    y: number;
    width: number;
    height: number;
};
export type DockZone = {
    zoneId: string;
    nodeId: NodeId;
    regionType: string;
    rect: Rect;
    data?: Record<string, unknown>;
};
export declare class DockLayoutCache {
    readonly groupRects: Map<NodeId, Rect>;
    readonly tabRects: Map<NodeId, Rect>;
    readonly zones: DockZone[];
    addGroupRect(groupId: NodeId, rect: Rect): void;
    addTabRect(tabId: NodeId, rect: Rect): void;
    addZone(zone: DockZone): void;
    getZone(zoneId: string): DockZone | undefined;
    hitTest(x: number, y: number): HitTestResult | undefined;
}
export declare function buildDockLayoutCache(layoutIR: readonly DockLayoutNode[], containerRect: Rect): DockLayoutCache;
//# sourceMappingURL=layoutCache.d.ts.map