export type DockNodeId = string;

export type DockSplitDirection = 'row' | 'col';

export type DockDropZone =
    | 'tabbar'
    | 'center'
    | 'left'
    | 'right'
    | 'top'
    | 'bottom';

export type Point = {
    x: number;
    y: number;
};

export type Rect = {
    x: number;
    y: number;
    width: number;
    height: number;
};

export type DockPanelNode = {
    id: DockNodeId;
    kind: 'panel';
    data: {
        title: string;
    };
    links: {
        children: DockNodeId[];
    };
};

export type DockGroupNode = {
    id: DockNodeId;
    kind: 'group';
    data: {
        activePanelId?: DockNodeId;
    };
    links: {
        children: DockNodeId[];
    };
};

export type DockSplitNode = {
    id: DockNodeId;
    kind: 'split';
    data: {
        direction: DockSplitDirection;
        weights: number[];
    };
    links: {
        children: DockNodeId[];
    };
};

export type DockNode = DockPanelNode | DockGroupNode | DockSplitNode;

export type DockState = {
    rootId: DockNodeId;
    floatRootId?: DockNodeId;
    nodes: Record<DockNodeId, DockNode>;
};

export type DockPanelSummary = {
    id: DockNodeId;
    title: string;
    groupId: DockNodeId;
};

export type DockDropTarget = {
    groupId: DockNodeId;
    zone: DockDropZone;
    rect: Rect;
    index?: number;
    score: number;
};

export type DockDropIndicator = {
    kind: 'zone' | 'line';
    rect: Rect;
    label: string;
};

export type DockGroupLayout = {
    id: DockNodeId;
    rect: Rect;
    tabBarRect: Rect;
    panelIds: DockNodeId[];
    activePanelId: DockNodeId | null;
};

export type DockSplitHandleLayout = {
    id: string;
    splitId: DockNodeId;
    index: number;
    direction: DockSplitDirection;
    rect: Rect;
};

export type DockLayoutNodeLayout = {
    id: DockNodeId;
    kind: DockNode['kind'];
    rect: Rect;
    parentId?: DockNodeId;
};

export type DockLayoutMap = {
    bounds: Rect;
    nodes: Record<DockNodeId, DockLayoutNodeLayout>;
    groups: DockGroupLayout[];
    splitHandles: DockSplitHandleLayout[];
};

export type DockMovePanelIntentPayload = {
    panelId: DockNodeId;
    sourceGroupId?: DockNodeId;
    targetGroupId: DockNodeId;
    zone?: DockDropZone;
    index?: number;
};

export type DockResizeIntentPayload = {
    splitId: DockNodeId;
    handleIndex: number;
    weights: number[];
};

export type DockInteractionIntent =
    | {
          name: 'dock/move-panel';
          payload: DockMovePanelIntentPayload;
      }
    | {
          name: 'dock/resize';
          payload: DockResizeIntentPayload;
          transient?: boolean;
      };

export type DockResizeSessionStart = {
    splitId: DockNodeId;
    handleIndex: number;
    direction: DockSplitDirection;
    startPoint: Point;
    splitSize: number;
    weights: number[];
};
