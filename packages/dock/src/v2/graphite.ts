import { $delete, $set, type GraphPath, type GraphState, type IntentCompilerContext } from '@loop-kit/graphite';
import type { GraphiteStore } from '@loop-kit/graphite';

import { createDockV2Controller } from './controller.js';
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
    DockV2IntentNames,
    DockV2State,
    RegisterDockV2IntentsOptions,
} from './types.js';

type DockV2IntentResult = ReturnType<ReturnType<typeof createDockV2Controller>['openPanel']>;

function patchSetAtPath(path: GraphPath, value: DockV2State): Record<string, unknown> {
    let patch: unknown = $set(value);
    for (let index = path.length - 1; index >= 0; index -= 1) {
        patch = {
            [String(path[index])]: patch,
        };
    }
    return patch as Record<string, unknown>;
}

function getValueAtPath(root: unknown, path: GraphPath): unknown {
    let current = root;
    for (const segment of path) {
        if (!current || typeof current !== 'object') {
            return undefined;
        }
        current = (current as Record<string, unknown>)[String(segment)];
    }
    return current;
}

function getDockV2StateAtPath<TState extends GraphState>(
    state: Readonly<TState>,
    path: GraphPath,
): DockV2State | null {
    const value = getValueAtPath(state, path);
    if (!value || typeof value !== 'object') {
        return null;
    }
    const candidate = value as DockV2State;
    if (
        !candidate.groups ||
        !candidate.layers ||
        !candidate.panels ||
        !Array.isArray(candidate.layerOrder)
    ) {
        return null;
    }
    return candidate;
}

export function createDockV2IntentNames(prefix = 'dock-v2'): DockV2IntentNames {
    return {
        attachPanel: `${prefix}/attach-panel`,
        closeGroup: `${prefix}/close-group`,
        closePanel: `${prefix}/close-panel`,
        dismissLayer: `${prefix}/dismiss-layer`,
        ensurePanel: `${prefix}/ensure-panel`,
        focusPanel: `${prefix}/focus-panel`,
        moveGroup: `${prefix}/move-group`,
        openPanel: `${prefix}/open-panel`,
        resizeGroup: `${prefix}/resize-group`,
        resizeSplit: `${prefix}/resize-split`,
        setGroupMode: `${prefix}/set-group-mode`,
        splitPanel: `${prefix}/split-panel`,
    };
}

export function registerDockV2Intents<TState extends GraphState>(
    store: GraphiteStore<TState>,
    options: RegisterDockV2IntentsOptions = {},
): DockV2IntentNames {
    const path = options.path ?? ['dockV2'];
    const intents = createDockV2IntentNames(options.intentPrefix ?? 'dock-v2');

    const register = <TPayload>(
        intentName: string,
        action: (
            controller: ReturnType<typeof createDockV2Controller>,
            payload: TPayload,
        ) => DockV2IntentResult,
    ) => {
        store.registerIntent(
            intentName,
            (payload: TPayload, context: IntentCompilerContext<TState>) => {
                const dockState = getDockV2StateAtPath(context.state, path);
                if (!dockState) {
                    return null;
                }
                const controller = createDockV2Controller(dockState);
                const result = action(controller, payload);
                if (!result.ok) {
                    return null;
                }
                return patchSetAtPath(path, result.value);
            },
        );
    };

    register<DockOpenPanelInput>(intents.openPanel, (controller, payload) =>
        controller.openPanel(payload),
    );
    register<DockEnsurePanelInput>(intents.ensurePanel, (controller, payload) =>
        controller.ensurePanel(payload),
    );
    register<string>(intents.closePanel, (controller, payload) =>
        controller.closePanel(payload),
    );
    register<string>(intents.closeGroup, (controller, payload) =>
        controller.closeGroup(payload),
    );
    register<string>(intents.focusPanel, (controller, payload) =>
        controller.focusPanel(payload),
    );
    register<DockMoveGroupInput>(intents.moveGroup, (controller, payload) =>
        controller.moveGroup(payload),
    );
    register<DockResizeGroupInput>(intents.resizeGroup, (controller, payload) =>
        controller.resizeGroup(payload),
    );
    register<DockResizeSplitInput>(intents.resizeSplit, (controller, payload) =>
        controller.resizeSplit(payload),
    );
    register<DockSetGroupModeInput>(intents.setGroupMode, (controller, payload) =>
        controller.setGroupMode(payload),
    );
    register<DockSplitPanelInput>(intents.splitPanel, (controller, payload) =>
        controller.splitPanel(payload),
    );
    register<DockAttachPanelInput>(intents.attachPanel, (controller, payload) =>
        controller.attachPanel(payload),
    );
    register<DockDismissLayerInput>(intents.dismissLayer, (controller, payload) =>
        controller.dismissLayer(payload),
    );

    return intents;
}

export function removeDockV2StateAtPath<TState extends GraphState>(
    path: GraphPath,
): Record<string, unknown> {
    let patch: unknown = $delete();
    for (let index = path.length - 1; index >= 0; index -= 1) {
        patch = {
            [String(path[index])]: patch,
        };
    }
    return patch as Record<string, unknown>;
}
