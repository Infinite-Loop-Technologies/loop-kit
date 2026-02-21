import { type DockDropTarget, type DockLayoutMap, type HitTestOptions, type Point } from './geometry';
import type { DockDirection, DockNodeId } from './model';
export type DockInteractionIntent = {
    name: 'dock/move-panel';
    payload: {
        panelId: DockNodeId;
        target: {
            groupId: DockNodeId;
            zone: DockDropTarget['zone'];
            index?: number;
        };
    };
    transient?: false;
} | {
    name: 'dock/resize';
    payload: {
        splitId: DockNodeId;
        weights: number[];
        transient?: boolean;
    };
    transient?: boolean;
};
export interface DockResizeStartOptions {
    splitId: DockNodeId;
    handleIndex: number;
    direction: DockDirection;
    startPoint: Point;
    splitSize: number;
    weights: readonly number[];
    minWeight?: number;
}
export interface DockInteractionControllerOptions {
    hitTestOptions?: HitTestOptions;
    minWeight?: number;
    onDropTargetChange?: (target: DockDropTarget | null) => void;
    resolveDropTarget?: (context: {
        phase: 'move' | 'end';
        point: Point;
        layout: DockLayoutMap;
        rawTarget: DockDropTarget | null;
        previousTarget: DockDropTarget | null;
    }) => DockDropTarget | null;
}
export interface DockInteractionController {
    startPanelDrag(panelId: DockNodeId): void;
    updatePointer(point: Point, layout: DockLayoutMap): DockDropTarget | null;
    endPanelDrag(point: Point, layout: DockLayoutMap): DockInteractionIntent | null;
    cancelPanelDrag(): void;
    startResize(options: DockResizeStartOptions): void;
    updateResize(point: Point): DockInteractionIntent | null;
    endResize(point: Point): DockInteractionIntent | null;
    cancelResize(): void;
    getDropTarget(): DockDropTarget | null;
}
/**
 * Creates an ephemeral interaction state machine for panel drag/drop + split resize.
 * It never mutates Graphite directly; it only emits intents.
 */
export declare function createDockInteractionController(options?: DockInteractionControllerOptions): DockInteractionController;
//# sourceMappingURL=interaction.d.ts.map