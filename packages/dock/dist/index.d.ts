export type { DockAddPanelIntent, DockActivatePanelIntent, DockDirection, DockDropZone, DockGroupNode, DockInvariantIssue, DockMovePanelIntent, DockMoveTarget, DockNode, DockNodeBase, DockNodeId, DockNodeKind, DockPanelNode, DockPolicyConfig, DockReducerAction, DockRemovePanelIntent, DockResizeSplitIntent, DockSplitNode, DockState, DockStateInit, DockFloatRootNode, DockFloatWindowNode, NormalizeDockOptions, Rect, } from './model';
export { DOCK_SCHEMA_VERSION, applyDockPolicy, assertDockInvariants, cloneDockState, createDockState, createDockStateFromPanels, createFloatRootNode, createFloatWindowNode, createGroupNode, createPanelNode, createSplitNode, migrateDockState, normalizeDock, reduceDockIntent, } from './model';
export type { ComputeLayoutOptions, DockDropTarget, DockGroupLayout, DockLayoutMap, DockLayoutNodeRect, DockSplitHandleLayout, HitTestOptions, Point, } from './geometry';
export { computeDropOverlay, computeLayoutRects, hitTest, rectToStyle, } from './geometry';
export type { DockInteractionController, DockInteractionControllerOptions, DockInteractionIntent, DockResizeStartOptions, } from './interaction';
export { createDockInteractionController } from './interaction';
export type { DockDebugOverlay } from './debugOverlay';
export { applyOverlayRect, describeDropOverlay } from './debugOverlay';
export type { DockDebugRenderer, DockDebugRendererOptions, } from './debugRenderer';
export { createDockDebugRenderer } from './debugRenderer';
export type { DockFocusState, DockPanelSummary, DockQueryOptions, } from './queries';
export { createDockFocusQuery, createDockLayoutQuery, createDockPanelQuery, } from './queries';
export type { DockIntentNames, RegisterDockIntentsOptions, } from './intents';
export { createDockIntentNames, registerDockIntents, } from './intents';
//# sourceMappingURL=index.d.ts.map