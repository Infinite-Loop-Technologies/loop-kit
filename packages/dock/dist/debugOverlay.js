import { computeDropOverlay, rectToStyle } from './geometry';
export function describeDropOverlay(target) {
    if (!target)
        return null;
    const zoneLabel = (() => {
        switch (target.zone) {
            case 'left':
                return 'Dock Left';
            case 'right':
                return 'Dock Right';
            case 'top':
                return 'Dock Top';
            case 'bottom':
                return 'Dock Bottom';
            case 'tabbar':
                return 'Insert Tab';
            case 'center':
            default:
                return 'Dock Center';
        }
    })();
    return {
        rect: computeDropOverlay(target),
        label: zoneLabel,
    };
}
export function applyOverlayRect(element, target) {
    const overlay = describeDropOverlay(target);
    if (!overlay || !overlay.rect) {
        element.style.display = 'none';
        element.removeAttribute('data-label');
        return;
    }
    element.style.display = 'block';
    const style = rectToStyle(overlay.rect);
    if (style.left)
        element.style.left = style.left;
    if (style.top)
        element.style.top = style.top;
    if (style.width)
        element.style.width = style.width;
    if (style.height)
        element.style.height = style.height;
    element.dataset.label = overlay.label;
}
//# sourceMappingURL=debugOverlay.js.map