export type DockNodeId = string;
export type DockDirection = 'row' | 'col';
export type DockNodeKind = 'split' | 'group' | 'panel' | 'float-root' | 'float-window';
export interface Rect {
    x: number;
    y: number;
    width: number;
    height: number;
}
export interface DockNodeLinks {
    children?: DockNodeId[];
    parent?: DockNodeId[];
}
export interface DockNodeBase {
    id: DockNodeId;
    kind: DockNodeKind;
    data?: Record<string, unknown>;
    links?: DockNodeLinks;
}
export interface DockSplitNode extends DockNodeBase {
    kind: 'split';
    data: {
        direction: DockDirection;
        weights: number[];
        minWeights?: number[];
    };
}
export interface DockGroupNode extends DockNodeBase {
    kind: 'group';
    data: {
        activePanelId: DockNodeId | null;
    };
}
export interface DockPanelNode extends DockNodeBase {
    kind: 'panel';
    data: {
        title?: string;
        [key: string]: unknown;
    };
}
export interface DockFloatRootNode extends DockNodeBase {
    kind: 'float-root';
}
export interface DockFloatWindowNode extends DockNodeBase {
    kind: 'float-window';
    data: {
        rect: Rect;
    };
}
export type DockNode = DockSplitNode | DockGroupNode | DockPanelNode | DockFloatRootNode | DockFloatWindowNode;
export interface DockState {
    dockMeta: {
        schemaVersion: number;
    };
    rootId: DockNodeId;
    floatRootId: DockNodeId;
    nodes: Record<DockNodeId, DockNode>;
}
export interface DockStateInit {
    rootId?: DockNodeId;
    floatRootId?: DockNodeId;
    nodes?: Record<DockNodeId, DockNode>;
}
export type DockDropZone = 'center' | 'tabbar' | 'left' | 'right' | 'top' | 'bottom';
export interface DockMoveTarget {
    groupId: DockNodeId;
    zone: DockDropZone;
    index?: number;
}
export interface DockMovePanelIntent {
    panelId: DockNodeId;
    target: DockMoveTarget;
}
export interface DockResizeSplitIntent {
    splitId: DockNodeId;
    weights: number[];
    transient?: boolean;
}
export interface DockActivatePanelIntent {
    groupId: DockNodeId;
    panelId: DockNodeId;
}
export interface DockRemovePanelIntent {
    panelId: DockNodeId;
}
export interface DockAddPanelIntent {
    panelId?: DockNodeId;
    title?: string;
    groupId?: DockNodeId;
    activate?: boolean;
}
export type DockReducerAction = {
    type: 'activate-panel';
    payload: DockActivatePanelIntent;
} | {
    type: 'move-panel';
    payload: DockMovePanelIntent;
} | {
    type: 'resize-split';
    payload: DockResizeSplitIntent;
} | {
    type: 'remove-panel';
    payload: DockRemovePanelIntent;
} | {
    type: 'add-panel';
    payload: DockAddPanelIntent;
};
export interface DockPolicyConfig {
    minWeight?: number;
    rebalanceSplits?: boolean;
}
export interface DockInvariantIssue {
    code: string;
    nodeId?: DockNodeId;
    message: string;
}
export interface NormalizeDockOptions {
    epsilon?: number;
}
export declare const DOCK_SCHEMA_VERSION = 1;
export declare function createPanelNode(id: DockNodeId, title?: string, data?: Record<string, unknown>): DockPanelNode;
export declare function createGroupNode(id: DockNodeId, panelIds: readonly DockNodeId[], activePanelId?: DockNodeId | null): DockGroupNode;
export declare function createSplitNode(id: DockNodeId, direction: DockDirection, childIds: readonly DockNodeId[], weights?: readonly number[]): DockSplitNode;
export declare function createFloatRootNode(id: DockNodeId): DockFloatRootNode;
export declare function createFloatWindowNode(id: DockNodeId, childId: DockNodeId, rect: Rect): DockFloatWindowNode;
export declare function cloneDockState(state: DockState): DockState;
/**
 * Creates a valid dock state. Any partial/invalid input graph is normalized.
 */
export declare function createDockState(init?: DockStateInit): DockState;
/**
 * Convenience helper to boot a valid dock tree from a flat panel list.
 */
export declare function createDockStateFromPanels(panels: readonly {
    id?: DockNodeId;
    title?: string;
}[]): DockState;
/**
 * Hydrates unknown persisted data and migrates it to the current dock schema.
 */
export declare function migrateDockState(input: unknown): DockState;
/**
 * Enforces structural invariants (root validity, parent consistency, split/group shape).
 */
export declare function normalizeDock(state: DockState, options?: NormalizeDockOptions): void;
/**
 * Applies one semantic dock action and returns a normalized next state when changed.
 */
export declare function reduceDockIntent(state: DockState, action: DockReducerAction): DockState | null;
export declare function applyDockPolicy(state: DockState, policy?: DockPolicyConfig): void;
/**
 * Reports invariant violations without mutating state.
 */
export declare function assertDockInvariants(state: DockState, epsilon?: number): DockInvariantIssue[];
//# sourceMappingURL=model.d.ts.map