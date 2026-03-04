import type { CSSProperties } from 'react';
import type { DockPreviewIntent } from '../facet/queries.js';
import type { DockLayoutCache } from '../interaction/layoutCache.js';

export type DockOverlayProps = {
    preview: DockPreviewIntent | undefined;
    layoutCache: DockLayoutCache;
};

export function Overlay({ preview, layoutCache }: DockOverlayProps) {
    if (!preview) {
        return null;
    }

    const zone = preview.zoneId ? layoutCache.getZone(preview.zoneId) : undefined;
    const rect = zone?.rect ?? layoutCache.groupRects.get(preview.targetGroupId);
    if (!rect) {
        return null;
    }

    const style: CSSProperties = {
        position: 'absolute',
        pointerEvents: 'none',
        left: rect.x,
        top: rect.y,
        width: rect.width,
        height: rect.height,
        border: '2px dashed #0ea5e9',
        background: 'rgba(14, 165, 233, 0.08)',
        borderRadius: 8,
    };

    return <div style={style} aria-hidden="true" />;
}
