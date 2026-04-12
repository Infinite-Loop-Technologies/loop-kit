import { createStateStore, type CommitOptions, type StateStore } from '@loop-kit/state';

import type { DockCommand } from './commands.js';
import { defaultDockPolicy } from './policy/default-dock-policy.js';
import type { DockPolicy } from './policy/dock-policy.js';
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

export type DockService = DockStateStore & {
    attachPanel: (input: DockAttachPanelInput, options?: CommitOptions) => DockV2ControllerResult;
    closeGroup: (groupId: string, options?: CommitOptions) => DockV2ControllerResult;
    closePanel: (panelId: string, options?: CommitOptions) => DockV2ControllerResult;
    dismissLayer: (input: DockDismissLayerInput, options?: CommitOptions) => DockV2ControllerResult;
    dispatch: (command: DockCommand, options?: CommitOptions) => DockV2ControllerResult;
    ensurePanel: (input: DockEnsurePanelInput, options?: CommitOptions) => DockV2ControllerResult;
    focusPanel: (panelId: string, options?: CommitOptions) => DockV2ControllerResult;
    policy: DockPolicy;
    replaceDockState: (state: DockV2State, options?: CommitOptions) => DockV2State;
    replaceState: (state: DockV2State, options?: CommitOptions) => DockV2State;
    moveGroup: (input: DockMoveGroupInput, options?: CommitOptions) => DockV2ControllerResult;
    openPanel: (input: DockOpenPanelInput, options?: CommitOptions) => DockV2ControllerResult;
    resizeGroup: (input: DockResizeGroupInput, options?: CommitOptions) => DockV2ControllerResult;
    resizeSplit: (input: DockResizeSplitInput, options?: CommitOptions) => DockV2ControllerResult;
    setGroupMode: (input: DockSetGroupModeInput, options?: CommitOptions) => DockV2ControllerResult;
    splitPanel: (input: DockSplitPanelInput, options?: CommitOptions) => DockV2ControllerResult;
};

export type DockServiceOptions = {
    maxHistory?: number;
    policy?: DockPolicy;
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

function dispatchDockCommand(
    store: DockStateStore,
    command: DockCommand,
    options?: CommitOptions,
) {
    return runDockCommand(store, options, (controller) => {
        switch (command.type) {
            case 'dock.attach-panel':
                return controller.attachPanel(command.input);
            case 'dock.close-group':
                return controller.closeGroup(command.groupId);
            case 'dock.close-panel':
                return controller.closePanel(command.panelId);
            case 'dock.dismiss-layer':
                return controller.dismissLayer(command.input);
            case 'dock.ensure-panel':
                return controller.ensurePanel(command.input);
            case 'dock.focus-panel':
                return controller.focusPanel(command.panelId);
            case 'dock.move-group':
                return controller.moveGroup(command.input);
            case 'dock.open-panel':
                return controller.openPanel(command.input);
            case 'dock.replace-state':
                return {
                    ok: true,
                    value: controller.replaceState(command.state),
                };
            case 'dock.resize-group':
                return controller.resizeGroup(command.input);
            case 'dock.resize-split':
                return controller.resizeSplit(command.input);
            case 'dock.set-group-mode':
                return controller.setGroupMode(command.input);
            case 'dock.split-panel':
                return controller.splitPanel(command.input);
            default: {
                const exhaustiveCheck: never = command;
                return exhaustiveCheck;
            }
        }
    });
}

export function createDockService(initialState: DockV2State, options: DockServiceOptions = {}): DockService {
    const store = createStateStore(createDockV2State(initialState), {
        maxHistory: options.maxHistory ?? 200,
    });
    const policy = options.policy ?? defaultDockPolicy;

    return {
        ...store,
        attachPanel: (input, commitOptions) => dispatchDockCommand(store, { input, type: 'dock.attach-panel' }, commitOptions),
        closeGroup: (groupId, commitOptions) => dispatchDockCommand(store, { groupId, type: 'dock.close-group' }, commitOptions),
        closePanel: (panelId, commitOptions) => dispatchDockCommand(store, { panelId, type: 'dock.close-panel' }, commitOptions),
        dismissLayer: (input, commitOptions) => dispatchDockCommand(store, { input, type: 'dock.dismiss-layer' }, commitOptions),
        dispatch: (command, commitOptions) => dispatchDockCommand(store, command, commitOptions),
        ensurePanel: (input, commitOptions) => dispatchDockCommand(store, { input, type: 'dock.ensure-panel' }, commitOptions),
        focusPanel: (panelId, commitOptions) => dispatchDockCommand(store, { panelId, type: 'dock.focus-panel' }, commitOptions),
        moveGroup: (input, commitOptions) => dispatchDockCommand(store, { input, type: 'dock.move-group' }, commitOptions),
        openPanel: (input, commitOptions) => dispatchDockCommand(store, { input, type: 'dock.open-panel' }, commitOptions),
        policy,
        replaceDockState: (state, commitOptions) => store.setState(createDockV2State(state), commitOptions),
        replaceState: (state, commitOptions) => store.setState(createDockV2State(state), commitOptions),
        resizeGroup: (input, commitOptions) => dispatchDockCommand(store, { input, type: 'dock.resize-group' }, commitOptions),
        resizeSplit: (input, commitOptions) => dispatchDockCommand(store, { input, type: 'dock.resize-split' }, commitOptions),
        setGroupMode: (input, commitOptions) => dispatchDockCommand(store, { input, type: 'dock.set-group-mode' }, commitOptions),
        splitPanel: (input, commitOptions) => dispatchDockCommand(store, { input, type: 'dock.split-panel' }, commitOptions),
    };
}
