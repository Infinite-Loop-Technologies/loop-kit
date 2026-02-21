import { computeDropOverlay, type DockDropTarget } from './geometry';
export interface DockDebugOverlay {
    rect: ReturnType<typeof computeDropOverlay>;
    label: string;
}
export declare function describeDropOverlay(target: DockDropTarget | null): DockDebugOverlay | null;
export declare function applyOverlayRect(element: HTMLElement, target: DockDropTarget | null): void;
//# sourceMappingURL=debugOverlay.d.ts.map