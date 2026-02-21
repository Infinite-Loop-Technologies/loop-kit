import type { GraphPath, GraphState, QueryResolver } from '@loop-kit/graphite';
import { type ComputeLayoutOptions, type DockLayoutMap } from './geometry';
import { type Rect } from './model';
export interface DockQueryOptions<TState extends GraphState = GraphState> {
    path?: GraphPath;
    selectDock?: (state: Readonly<TState>) => unknown;
}
export interface DockPanelSummary {
    id: string;
    title: string;
    groupId?: string;
}
export interface DockFocusState {
    activeGroupId: string | null;
    activePanelId: string | null;
}
export declare function createDockLayoutQuery<TState extends GraphState = GraphState>(bounds: Rect, queryOptions?: DockQueryOptions<TState>, layoutOptions?: ComputeLayoutOptions): QueryResolver<TState, DockLayoutMap>;
export declare function createDockPanelQuery<TState extends GraphState = GraphState>(options?: DockQueryOptions<TState>): QueryResolver<TState, DockPanelSummary[]>;
export declare function createDockFocusQuery<TState extends GraphState = GraphState>(options?: DockQueryOptions<TState>): QueryResolver<TState, DockFocusState>;
//# sourceMappingURL=queries.d.ts.map