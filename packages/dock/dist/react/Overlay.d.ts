import type { DockPreviewIntent } from '../facet/queries.js';
import type { DockLayoutCache } from '../interaction/layoutCache.js';
export type DockOverlayProps = {
    preview: DockPreviewIntent | undefined;
    layoutCache: DockLayoutCache;
};
export declare function Overlay({ preview, layoutCache }: DockOverlayProps): import("react/jsx-runtime").JSX.Element | null;
//# sourceMappingURL=Overlay.d.ts.map