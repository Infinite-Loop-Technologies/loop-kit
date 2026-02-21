import type { GraphPath, GraphState, GraphiteStore } from '@loop-kit/graphite';
import { type ComputeLayoutOptions, type HitTestOptions } from './geometry';
export interface DockDebugRendererOptions<TState extends GraphState = GraphState> {
    store: GraphiteStore<TState>;
    mount: HTMLElement;
    dockPath?: GraphPath;
    selectDock?: (state: Readonly<TState>) => unknown;
    intentPrefix?: string;
    historyChannel?: string;
    layoutOptions?: ComputeLayoutOptions;
    hitTestOptions?: HitTestOptions;
    minWeight?: number;
    tabDragActivationDistance?: number;
}
export interface DockDebugRenderer {
    render(): void;
    dispose(): void;
}
/**
 * Mounts a lightweight DOM renderer for dock state and interactions.
 * Useful for debugging layout/targets without coupling to React.
 */
export declare function createDockDebugRenderer<TState extends GraphState = GraphState>(options: DockDebugRendererOptions<TState>): DockDebugRenderer;
//# sourceMappingURL=debugRenderer.d.ts.map