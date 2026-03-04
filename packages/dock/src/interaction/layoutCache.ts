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

export class DockLayoutCache {
    readonly groupRects = new Map<NodeId, Rect>();
    readonly tabRects = new Map<NodeId, Rect>();
    readonly zones: DockZone[] = [];

    addGroupRect(groupId: NodeId, rect: Rect): void {
        this.groupRects.set(groupId, rect);
    }

    addTabRect(tabId: NodeId, rect: Rect): void {
        this.tabRects.set(tabId, rect);
    }

    addZone(zone: DockZone): void {
        this.zones.push(zone);
    }

    getZone(zoneId: string): DockZone | undefined {
        return this.zones.find((zone) => zone.zoneId === zoneId);
    }

    hitTest(x: number, y: number): HitTestResult | undefined {
        for (let index = this.zones.length - 1; index >= 0; index -= 1) {
            const zone = this.zones[index];
            if (contains(zone.rect, x, y)) {
                return {
                    nodeId: zone.nodeId,
                    zoneId: zone.zoneId,
                    regionType: zone.regionType,
                    data: zone.data,
                };
            }
        }

        return undefined;
    }
}

export function buildDockLayoutCache(
    layoutIR: readonly DockLayoutNode[],
    containerRect: Rect,
): DockLayoutCache {
    const cache = new DockLayoutCache();

    if (layoutIR.length === 0) {
        return cache;
    }

    const rootHeight = containerRect.height / layoutIR.length;
    for (let index = 0; index < layoutIR.length; index += 1) {
        const root = layoutIR[index];
        const rect: Rect = {
            x: containerRect.x,
            y: containerRect.y + rootHeight * index,
            width: containerRect.width,
            height: rootHeight,
        };

        layoutGroup(root, rect, cache);
    }

    return cache;
}

function layoutGroup(group: DockLayoutNode, rect: Rect, cache: DockLayoutCache): void {
    cache.addGroupRect(group.groupId, rect);

    const tabBarHeight = Math.min(34, Math.max(24, rect.height * 0.16));
    const tabBarRect: Rect = {
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: tabBarHeight,
    };

    const contentRect: Rect = {
        x: rect.x,
        y: rect.y + tabBarHeight,
        width: rect.width,
        height: Math.max(0, rect.height - tabBarHeight),
    };

    addDropZones(group.groupId, contentRect, cache);
    addTabZones(group.groupId, group.tabIds, tabBarRect, cache);

    if (group.children.length === 0) {
        return;
    }

    const direction = group.splitDirection ?? 'horizontal';
    const ratios = normalizeRatios(group.children.length, group.splitRatios);
    let offset = 0;

    for (let index = 0; index < group.children.length; index += 1) {
        const child = group.children[index];
        const ratio = ratios[index];

        const childRect: Rect =
            direction === 'horizontal'
                ? {
                      x: contentRect.x + contentRect.width * offset,
                      y: contentRect.y,
                      width: contentRect.width * ratio,
                      height: contentRect.height,
                  }
                : {
                      x: contentRect.x,
                      y: contentRect.y + contentRect.height * offset,
                      width: contentRect.width,
                      height: contentRect.height * ratio,
                  };

        offset += ratio;
        layoutGroup(child, childRect, cache);
    }
}

function addTabZones(
    groupId: NodeId,
    tabIds: readonly NodeId[],
    tabBarRect: Rect,
    cache: DockLayoutCache,
): void {
    if (tabIds.length === 0) {
        return;
    }

    const tabWidth = tabBarRect.width / tabIds.length;
    for (let index = 0; index < tabIds.length; index += 1) {
        const tabId = tabIds[index];
        const rect: Rect = {
            x: tabBarRect.x + tabWidth * index,
            y: tabBarRect.y,
            width: tabWidth,
            height: tabBarRect.height,
        };

        cache.addTabRect(tabId, rect);
        cache.addZone({
            zoneId: `tab:${tabId}`,
            nodeId: tabId,
            regionType: 'tab',
            rect,
            data: {
                tabId,
                groupId,
                index,
            },
        });
    }
}

function addDropZones(groupId: NodeId, rect: Rect, cache: DockLayoutCache): void {
    const edgeX = Math.min(64, rect.width * 0.25);
    const edgeY = Math.min(64, rect.height * 0.25);

    const zones: DockZone[] = [
        {
            zoneId: `drop:${groupId}:center`,
            nodeId: groupId,
            regionType: 'drop-center',
            rect: { ...rect },
            data: { targetGroupId: groupId, region: 'center' },
        },
        {
            zoneId: `drop:${groupId}:left`,
            nodeId: groupId,
            regionType: 'drop-left',
            rect: {
                x: rect.x,
                y: rect.y,
                width: edgeX,
                height: rect.height,
            },
            data: { targetGroupId: groupId, region: 'left' },
        },
        {
            zoneId: `drop:${groupId}:right`,
            nodeId: groupId,
            regionType: 'drop-right',
            rect: {
                x: rect.x + rect.width - edgeX,
                y: rect.y,
                width: edgeX,
                height: rect.height,
            },
            data: { targetGroupId: groupId, region: 'right' },
        },
        {
            zoneId: `drop:${groupId}:top`,
            nodeId: groupId,
            regionType: 'drop-top',
            rect: {
                x: rect.x,
                y: rect.y,
                width: rect.width,
                height: edgeY,
            },
            data: { targetGroupId: groupId, region: 'top' },
        },
        {
            zoneId: `drop:${groupId}:bottom`,
            nodeId: groupId,
            regionType: 'drop-bottom',
            rect: {
                x: rect.x,
                y: rect.y + rect.height - edgeY,
                width: rect.width,
                height: edgeY,
            },
            data: { targetGroupId: groupId, region: 'bottom' },
        },
    ];

    for (const zone of zones) {
        cache.addZone(zone);
    }
}

function normalizeRatios(count: number, ratios: readonly number[]): number[] {
    const trimmed = ratios.slice(0, count).filter((ratio) => typeof ratio === 'number' && ratio > 0);
    if (trimmed.length !== count) {
        const equal = 1 / count;
        return Array.from({ length: count }, () => equal);
    }

    const total = trimmed.reduce((sum, ratio) => sum + ratio, 0);
    return trimmed.map((ratio) => ratio / total);
}

function contains(rect: Rect, x: number, y: number): boolean {
    return x >= rect.x && y >= rect.y && x <= rect.x + rect.width && y <= rect.y + rect.height;
}
