import { createStateStore, type CommitOptions, type StateStore } from '@loop-kit/state';

import { createDockV2Controller } from './v2/controller.js';
import { createDockV2State } from './v2/model.js';
import type {
    DockAttachPanelInput,
    DockDismissLayerInput,
    DockEnsurePanelInput,
    DockMoveGroupInput,
    DockOpenPanelInput,
    DockResizeGroupInput,
    DockResizeSplitInput,
    DockSetGroupModeInput,
    DockSplitPanelInput,
    DockV2ControllerResult,
    DockV2State,
} from './v2/types.js';

export type DockStateStore = StateStore<DockV2State>;
type DockRuntimeController = ReturnType<typeof createDockV2Controller>;

export type DockStore = DockStateStore & {
    attachPanel: (input: DockAttachPanelInput, options?: CommitOptions) => DockV2ControllerResult;
    closeGroup: (groupId: string, options?: CommitOptions) => DockV2ControllerResult;
    closePanel: (panelId: string, options?: CommitOptions) => DockV2ControllerResult;
    dismissLayer: (input: DockDismissLayerInput, options?: CommitOptions) => DockV2ControllerResult;
    ensurePanel: (input: DockEnsurePanelInput, options?: CommitOptions) => DockV2ControllerResult;
    focusPanel: (panelId: string, options?: CommitOptions) => DockV2ControllerResult;
    moveGroup: (input: DockMoveGroupInput, options?: CommitOptions) => DockV2ControllerResult;
    openPanel: (input: DockOpenPanelInput, options?: CommitOptions) => DockV2ControllerResult;
    replaceDockState: (state: DockV2State, options?: CommitOptions) => DockV2State;
    replaceState: (state: DockV2State, options?: CommitOptions) => DockV2State;
    resizeGroup: (input: DockResizeGroupInput, options?: CommitOptions) => DockV2ControllerResult;
    resizeSplit: (input: DockResizeSplitInput, options?: CommitOptions) => DockV2ControllerResult;
    setGroupMode: (input: DockSetGroupModeInput, options?: CommitOptions) => DockV2ControllerResult;
    splitPanel: (input: DockSplitPanelInput, options?: CommitOptions) => DockV2ControllerResult;
};

export type DockStoreOptions = {
    maxHistory?: number;
};

function runDockCommand(
    store: DockStateStore,
    commitOptions: CommitOptions | undefined,
    execute: (controller: DockRuntimeController) => DockV2ControllerResult,
): DockV2ControllerResult {
    const controller = createDockV2Controller(store.getState());
    const result = execute(controller);

    if (result.ok) {
        store.setState(result.value, commitOptions);
    }

    return result;
}

export function createDockStore(initialState: DockV2State, options: DockStoreOptions = {}): DockStore {
    const store = createStateStore(createDockV2State(initialState), {
        maxHistory: options.maxHistory ?? 200,
    });

    return {
        ...store,
        attachPanel: (input, commitOptions) =>
            runDockCommand(store, commitOptions, (controller) => controller.attachPanel(input)),
        closeGroup: (groupId, commitOptions) =>
            runDockCommand(store, commitOptions, (controller) => controller.closeGroup(groupId)),
        closePanel: (panelId, commitOptions) =>
            runDockCommand(store, commitOptions, (controller) => controller.closePanel(panelId)),
        dismissLayer: (input, commitOptions) =>
            runDockCommand(store, commitOptions, (controller) => controller.dismissLayer(input)),
        ensurePanel: (input, commitOptions) =>
            runDockCommand(store, commitOptions, (controller) => controller.ensurePanel(input)),
        focusPanel: (panelId, commitOptions) =>
            runDockCommand(store, commitOptions, (controller) => controller.focusPanel(panelId)),
        moveGroup: (input, commitOptions) =>
            runDockCommand(store, commitOptions, (controller) => controller.moveGroup(input)),
        openPanel: (input, commitOptions) =>
            runDockCommand(store, commitOptions, (controller) => controller.openPanel(input)),
        replaceDockState: (state, commitOptions) => store.setState(createDockV2State(state), commitOptions),
        replaceState: (state, commitOptions) => store.setState(createDockV2State(state), commitOptions),
        resizeGroup: (input, commitOptions) =>
            runDockCommand(store, commitOptions, (controller) => controller.resizeGroup(input)),
        resizeSplit: (input, commitOptions) =>
            runDockCommand(store, commitOptions, (controller) => controller.resizeSplit(input)),
        setGroupMode: (input, commitOptions) =>
            runDockCommand(store, commitOptions, (controller) => controller.setGroupMode(input)),
        splitPanel: (input, commitOptions) =>
            runDockCommand(store, commitOptions, (controller) => controller.splitPanel(input)),
    };
}
