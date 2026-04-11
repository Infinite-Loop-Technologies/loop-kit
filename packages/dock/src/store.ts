import { createStateStore, type CommitOptions, type StateStore } from '@loop-kit/state';

import { createDockService, type DockService, type DockServiceOptions } from './service.js';
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

export type DockStore = DockService;

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
    return createDockService(initialState, options as DockServiceOptions);
}
