import type { Option, Result } from './result.js';

export type DockV2LayerId = string;
export type DockV2GroupId = string;
export type DockV2PanelId = string;
export type DockV2SplitNodeId = string;

export type DockV2LayerKind = 'flow' | 'overlay' | 'floating';
export type DockV2GroupMode =
    | 'single'
    | 'tabs'
    | 'split'
    | 'swap'
    | 'queue'
    | 'stack';
export type DockV2SplitDirection = 'row' | 'col';

export type DockV2PanelKind = string;

export type DockV2Panel = {
    closeable?: boolean;
    id: DockV2PanelId;
    kind: DockV2PanelKind;
    meta?: Record<string, unknown>;
    persistenceKey?: string;
    props?: Record<string, unknown>;
    title: string;
};

export type DockV2SplitChild =
    | {
          kind: 'panel';
          panelId: DockV2PanelId;
      }
    | {
          kind: 'split';
          splitId: DockV2SplitNodeId;
      };

export type DockV2SplitNode = {
    children: [DockV2SplitChild, DockV2SplitChild];
    direction: DockV2SplitDirection;
    id: DockV2SplitNodeId;
    weights: [number, number];
};

export type DockV2GroupPolicies = {
    attachable: boolean;
    closeable: boolean;
    movable: boolean;
    reorderable: boolean;
    resizable: boolean;
    splittable: boolean;
    stackable: boolean;
};

export type DockV2GroupPlacement =
    | {
          kind: 'inline';
      }
    | {
          kind: 'center';
          left?: string;
          maxWidth?: string;
          top?: string;
          transform?: string;
          width?: string;
      }
    | {
          edge: 'left' | 'right' | 'top' | 'bottom';
          height?: string;
          kind: 'edge';
          width?: string;
      }
    | {
          height?: string;
          kind: 'floating';
          left?: string;
          top?: string;
          width?: string;
      };

export type DockV2GroupLayout = {
    basis?: string;
    grow?: number;
    height?: string;
    max?: string;
    min?: string;
    placement?: DockV2GroupPlacement;
    width?: string;
    zIndex?: number;
};

export type DockV2GroupChrome = {
    /**
     * Renderer-facing shell config for a group. This is presentation-only
     * chrome, not behavioral policy: it controls whether the renderer draws a
     * frame, tabs, and titlebar around the group.
     */
    framed?: boolean;
    showTabs?: boolean;
    showTitlebar?: boolean;
    titlebarMode?: 'compact' | 'none' | 'standard';
};

export type DockV2Group = {
    activePanelId?: DockV2PanelId;
    chrome?: DockV2GroupChrome;
    id: DockV2GroupId;
    layerId: DockV2LayerId;
    layout?: DockV2GroupLayout;
    meta?: Record<string, unknown>;
    mode: DockV2GroupMode;
    panelIds: DockV2PanelId[];
    policies?: Partial<DockV2GroupPolicies>;
    splitNodes?: Record<DockV2SplitNodeId, DockV2SplitNode>;
    splitRootId?: DockV2SplitNodeId;
    title?: string;
};

export type DockV2FlowConfig = {
    direction: 'horizontal' | 'vertical';
    gap?: string;
    reorder: 'free' | 'horizontal-only' | 'vertical-only';
};

export type DockV2OverlayConfig = {
    behavior: 'queue' | 'replace' | 'stack';
    interaction: 'modal' | 'passthrough';
    maxGroups?: number;
};

export type DockV2FloatingConfig = {
    reorder: 'free';
};

export type DockV2Layer = {
    floating?: DockV2FloatingConfig;
    flow?: DockV2FlowConfig;
    groupIds: DockV2GroupId[];
    id: DockV2LayerId;
    kind: DockV2LayerKind;
    meta?: Record<string, unknown>;
    overlay?: DockV2OverlayConfig;
};

export type DockV2State = {
    activeGroupId?: DockV2GroupId;
    activeLayerId?: DockV2LayerId;
    focusedPanelId?: DockV2PanelId;
    groups: Record<DockV2GroupId, DockV2Group>;
    layerOrder: DockV2LayerId[];
    layers: Record<DockV2LayerId, DockV2Layer>;
    panels: Record<DockV2PanelId, DockV2Panel>;
};

export type DockV2ErrorCode =
    | 'group-locked'
    | 'group-not-found'
    | 'invalid-operation'
    | 'layer-not-found'
    | 'panel-exists'
    | 'panel-not-found'
    | 'split-not-found';

export type DockV2Error = {
    code: DockV2ErrorCode;
    message: string;
};

export type DockV2ControllerResult = Result<DockV2State, DockV2Error>;

export type DockOpenPanelInput = {
    activate?: boolean;
    group?: Partial<Pick<DockV2Group, 'chrome' | 'layout' | 'mode' | 'policies' | 'title'>>;
    groupId?: DockV2GroupId;
    layerId?: DockV2LayerId;
    panel: DockV2Panel;
};

export type DockEnsurePanelInput = {
    activate?: boolean;
    group?: Partial<Pick<DockV2Group, 'chrome' | 'layout' | 'mode' | 'policies' | 'title'>>;
    groupId?: DockV2GroupId;
    layerId?: DockV2LayerId;
    panel: DockV2Panel;
};

export type DockMoveGroupInput = {
    groupId: DockV2GroupId;
    index?: number;
    layerId: DockV2LayerId;
};

export type DockResizeGroupInput = {
    groupId: DockV2GroupId;
    layout: Partial<DockV2GroupLayout>;
};

export type DockResizeSplitInput = {
    groupId: DockV2GroupId;
    splitId: DockV2SplitNodeId;
    weights: [number, number];
};

export type DockSetGroupModeInput = {
    groupId: DockV2GroupId;
    mode: DockV2GroupMode;
};

export type DockSplitPanelInput = {
    direction: DockV2SplitDirection;
    groupId: DockV2GroupId;
    newPanel?: DockV2Panel;
    newPanelId?: DockV2PanelId;
    panelId: DockV2PanelId;
    position?: 'after' | 'before';
};

export type DockAttachPanelInput = {
    activate?: boolean;
    groupId: DockV2GroupId;
    index?: number;
    panelId: DockV2PanelId;
};

export type DockDismissLayerInput = {
    layerId: DockV2LayerId;
};

export type DockV2Controller = {
    attachPanel: (input: DockAttachPanelInput) => DockV2ControllerResult;
    closeGroup: (groupId: DockV2GroupId) => DockV2ControllerResult;
    closePanel: (panelId: DockV2PanelId) => DockV2ControllerResult;
    dismissLayer: (input: DockDismissLayerInput) => DockV2ControllerResult;
    ensurePanel: (input: DockEnsurePanelInput) => DockV2ControllerResult;
    focusPanel: (panelId: DockV2PanelId) => DockV2ControllerResult;
    getState: () => DockV2State;
    moveGroup: (input: DockMoveGroupInput) => DockV2ControllerResult;
    openPanel: (input: DockOpenPanelInput) => DockV2ControllerResult;
    replaceState: (state: DockV2State) => DockV2State;
    resizeGroup: (input: DockResizeGroupInput) => DockV2ControllerResult;
    resizeSplit: (input: DockResizeSplitInput) => DockV2ControllerResult;
    setGroupMode: (input: DockSetGroupModeInput) => DockV2ControllerResult;
    splitPanel: (input: DockSplitPanelInput) => DockV2ControllerResult;
};

export type DockV2ControllerOptions = {
    onChange?: (state: DockV2State) => void;
};

export type DockV2IntentEnvelope = {
    history?: boolean;
    name: string;
    payload?: unknown;
};
export type DockV2CommandResult<TState = DockV2State> = Option<TState>;
