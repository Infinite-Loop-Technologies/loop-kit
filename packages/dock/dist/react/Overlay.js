import { jsx as _jsx } from "react/jsx-runtime";
export function Overlay({ preview, layoutCache }) {
    if (!preview) {
        return null;
    }
    const zone = preview.zoneId ? layoutCache.getZone(preview.zoneId) : undefined;
    const rect = zone?.rect ?? layoutCache.groupRects.get(preview.targetGroupId);
    if (!rect) {
        return null;
    }
    const style = {
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
    return _jsx("div", { style: style, "aria-hidden": "true" });
}
//# sourceMappingURL=Overlay.js.map