export class DockLayoutCache {
    groupRects = new Map();
    tabRects = new Map();
    zones = [];
    addGroupRect(groupId, rect) {
        this.groupRects.set(groupId, rect);
    }
    addTabRect(tabId, rect) {
        this.tabRects.set(tabId, rect);
    }
    addZone(zone) {
        this.zones.push(zone);
    }
    getZone(zoneId) {
        return this.zones.find((zone) => zone.zoneId === zoneId);
    }
    hitTest(x, y) {
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
export function buildDockLayoutCache(layoutIR, containerRect) {
    const cache = new DockLayoutCache();
    if (layoutIR.length === 0) {
        return cache;
    }
    const rootHeight = containerRect.height / layoutIR.length;
    for (let index = 0; index < layoutIR.length; index += 1) {
        const root = layoutIR[index];
        const rect = {
            x: containerRect.x,
            y: containerRect.y + rootHeight * index,
            width: containerRect.width,
            height: rootHeight,
        };
        layoutGroup(root, rect, cache);
    }
    return cache;
}
function layoutGroup(group, rect, cache) {
    cache.addGroupRect(group.groupId, rect);
    const tabBarHeight = Math.min(34, Math.max(24, rect.height * 0.16));
    const tabBarRect = {
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: tabBarHeight,
    };
    const contentRect = {
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
        const childRect = direction === 'horizontal'
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
function addTabZones(groupId, tabIds, tabBarRect, cache) {
    if (tabIds.length === 0) {
        return;
    }
    const tabWidth = tabBarRect.width / tabIds.length;
    for (let index = 0; index < tabIds.length; index += 1) {
        const tabId = tabIds[index];
        const rect = {
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
function addDropZones(groupId, rect, cache) {
    const edgeX = Math.min(64, rect.width * 0.25);
    const edgeY = Math.min(64, rect.height * 0.25);
    const zones = [
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
function normalizeRatios(count, ratios) {
    const trimmed = ratios.slice(0, count).filter((ratio) => typeof ratio === 'number' && ratio > 0);
    if (trimmed.length !== count) {
        const equal = 1 / count;
        return Array.from({ length: count }, () => equal);
    }
    const total = trimmed.reduce((sum, ratio) => sum + ratio, 0);
    return trimmed.map((ratio) => ratio / total);
}
function contains(rect, x, y) {
    return x >= rect.x && y >= rect.y && x <= rect.x + rect.width && y <= rect.y + rect.height;
}
//# sourceMappingURL=layoutCache.js.map