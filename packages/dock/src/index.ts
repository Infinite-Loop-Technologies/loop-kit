export {
    failure,
    none,
    some,
    success,
    type Option,
    type Result,
} from './v2/result.js';

export { createDockV2Controller as createDockController } from './v2/controller.js';
export { createDockV2Controller } from './v2/controller.js';

export {
    createDockV2Group as createDockGroup,
    createDockV2Layer as createDockLayer,
    createDockV2Panel as createDockPanel,
    createDockV2State as createDockState,
    createDockV2Group,
    createDockV2Layer,
    createDockV2Panel,
    createDockV2State,
    fromLegacyDockState,
    normalizeDockV2Policies as normalizeDockPolicies,
    normalizeWeights as normalizeDockWeights,
    normalizeDockV2Policies,
} from './v2/model.js';

export { createDockStore, type DockStateStore, type DockStore, type DockStoreOptions } from './store.js';

export type {
    DockAttachPanelInput as DockAttachPanelOptions,
    DockDismissLayerInput as DockDismissLayerOptions,
    DockEnsurePanelInput as DockEnsurePanelOptions,
    DockMoveGroupInput as DockMoveGroupOptions,
    DockOpenPanelInput as DockOpenPanelOptions,
    DockResizeGroupInput as DockResizeGroupOptions,
    DockResizeSplitInput as DockResizeSplitOptions,
    DockSetGroupModeInput as DockSetGroupModeOptions,
    DockSplitPanelInput as DockSplitPanelOptions,
    DockV2CommandResult as DockCommandResult,
    DockV2Controller as DockController,
    DockV2ControllerOptions as DockControllerOptions,
    DockV2ControllerResult,
    DockV2Error as DockError,
    DockV2ErrorCode as DockErrorCode,
    DockV2FlowConfig as DockFlowConfig,
    DockV2FloatingConfig as DockFloatingConfig,
    DockV2Group as DockGroup,
    DockV2GroupChrome as DockGroupChrome,
    DockV2GroupId as DockGroupId,
    DockV2GroupLayout as DockGroupLayout,
    DockV2GroupMode as DockGroupMode,
    DockV2GroupPlacement as DockGroupPlacement,
    DockV2GroupPolicies as DockGroupPolicies,
    DockV2IntentEnvelope as DockIntentEnvelope,
    DockV2Layer as DockLayer,
    DockV2LayerId as DockLayerId,
    DockV2LayerKind as DockLayerKind,
    DockV2OverlayConfig as DockOverlayConfig,
    DockV2Panel as DockPanel,
    DockV2PanelId as DockPanelId,
    DockV2PanelKind as DockPanelKind,
    DockV2SplitChild as DockSplitChild,
    DockV2SplitDirection as DockSplitDirection,
    DockV2SplitNode as DockSplitNode,
    DockV2SplitNodeId as DockSplitNodeId,
    DockV2State as DockState,
    DockV2Controller,
    DockV2Group,
    DockV2GroupId,
    DockV2Layer,
    DockV2LayerId,
    DockV2Panel,
    DockV2PanelId,
    DockV2SplitNode,
    DockV2SplitNodeId,
    DockV2State,
} from './v2/types.js';

export function serializeDockState(state: import('./v2/types.js').DockV2State) {
    return JSON.stringify(state);
}

export function deserializeDockState(serialized: string): import('./v2/types.js').DockV2State {
    return JSON.parse(serialized) as import('./v2/types.js').DockV2State;
}
