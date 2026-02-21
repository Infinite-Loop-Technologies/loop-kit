import {
    $set,
    type GraphPath,
    type GraphState,
    type GraphiteStore,
    type MutationPatchObject,
} from '@loop-kit/graphite';
import {
    applyDockPolicy,
    migrateDockState,
    reduceDockIntent,
    type DockActivatePanelIntent,
    type DockAddPanelIntent,
    type DockMovePanelIntent,
    type DockPolicyConfig,
    type DockRemovePanelIntent,
    type DockResizeSplitIntent,
    type DockState,
} from './model';

export interface RegisterDockIntentsOptions<
    TState extends GraphState = GraphState,
> {
    path?: GraphPath;
    intentPrefix?: string;
    defaultMetadata?: Record<string, unknown>;
    policy?: DockPolicyConfig;
    selectDock?: (state: Readonly<TState>) => unknown;
}

export interface DockIntentNames {
    activatePanel: string;
    movePanel: string;
    resize: string;
    removePanel: string;
    addPanel: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
}

function isActivatePayload(value: unknown): value is DockActivatePanelIntent {
    return (
        isRecord(value) &&
        typeof value.groupId === 'string' &&
        value.groupId.trim().length > 0 &&
        typeof value.panelId === 'string' &&
        value.panelId.trim().length > 0
    );
}

function isMovePayload(value: unknown): value is DockMovePanelIntent {
    if (!isRecord(value)) return false;
    if (typeof value.panelId !== 'string' || value.panelId.trim().length === 0)
        return false;
    const target = value.target;
    if (!isRecord(target)) return false;
    if (
        typeof target.groupId !== 'string' ||
        target.groupId.trim().length === 0
    )
        return false;
    if (
        target.zone !== 'center' &&
        target.zone !== 'tabbar' &&
        target.zone !== 'left' &&
        target.zone !== 'right' &&
        target.zone !== 'top' &&
        target.zone !== 'bottom'
    ) {
        return false;
    }
    return true;
}

function isResizePayload(value: unknown): value is DockResizeSplitIntent {
    return (
        isRecord(value) &&
        typeof value.splitId === 'string' &&
        value.splitId.trim().length > 0 &&
        Array.isArray(value.weights)
    );
}

function isRemovePayload(value: unknown): value is DockRemovePanelIntent {
    return (
        isRecord(value) &&
        typeof value.panelId === 'string' &&
        value.panelId.trim().length > 0
    );
}

function toAddPayload(value: unknown): DockAddPanelIntent {
    if (!isRecord(value)) return {};
    return {
        panelId: typeof value.panelId === 'string' ? value.panelId : undefined,
        title: typeof value.title === 'string' ? value.title : undefined,
        groupId: typeof value.groupId === 'string' ? value.groupId : undefined,
        activate:
            typeof value.activate === 'boolean' ? value.activate : undefined,
    };
}

function getAtPath(root: unknown, path: GraphPath): unknown {
    let current = root;
    for (const segment of path) {
        if (typeof current !== 'object' || current === null) {
            return undefined;
        }
        current = (current as Record<string, unknown>)[String(segment)];
    }
    return current;
}

function setPatchAtPath(
    path: GraphPath,
    value: unknown,
): MutationPatchObject | ReturnType<typeof $set> {
    if (path.length === 0) {
        return $set(value);
    }

    const root: MutationPatchObject = {};
    let cursor: MutationPatchObject = root;
    for (let index = 0; index < path.length - 1; index += 1) {
        const key = String(path[index]);
        const next: MutationPatchObject = {};
        cursor[key] = next;
        cursor = next;
    }
    cursor[String(path[path.length - 1])] = $set(value);
    return root;
}

/**
 * Returns the canonical intent names used by the dock domain.
 * Keep these stable so command menus/shortcuts can reference them safely.
 */
export function createDockIntentNames(intentPrefix = 'dock'): DockIntentNames {
    return {
        activatePanel: `${intentPrefix}/activate-panel`,
        movePanel: `${intentPrefix}/move-panel`,
        resize: `${intentPrefix}/resize`,
        removePanel: `${intentPrefix}/remove-panel`,
        addPanel: `${intentPrefix}/add-panel`,
    };
}

function resolveDockState<TState extends GraphState>(
    state: Readonly<TState>,
    path: GraphPath,
    selectDock?: (state: Readonly<TState>) => unknown,
): DockState {
    const raw = selectDock ? selectDock(state) : getAtPath(state, path);
    return migrateDockState(raw);
}

function reduceAndPatch(
    dockState: DockState,
    action:
        | { type: 'activate-panel'; payload: DockActivatePanelIntent }
        | { type: 'move-panel'; payload: DockMovePanelIntent }
        | { type: 'resize-split'; payload: DockResizeSplitIntent }
        | { type: 'remove-panel'; payload: DockRemovePanelIntent }
        | { type: 'add-panel'; payload: DockAddPanelIntent },
    path: GraphPath,
    policy?: DockPolicyConfig,
) {
    const reduced = reduceDockIntent(dockState, action);
    if (!reduced) return null;

    if (policy) {
        applyDockPolicy(reduced, policy);
    }

    return setPatchAtPath(path, reduced);
}

/**
 * Registers dock domain intents on a Graphite store. Each intent:
 * read current dock state -> reduce action -> normalize -> write patched dock subtree.
 */
export function registerDockIntents<TState extends GraphState = GraphState>(
    store: GraphiteStore<TState>,
    options: RegisterDockIntentsOptions<TState> = {},
): { dispose: () => void; intents: DockIntentNames } {
    const path = options.path ?? ['dock'];
    const intentNames = createDockIntentNames(options.intentPrefix);

    const unsubs = [
        store.registerIntent(
            intentNames.activatePanel,
            (payload: DockActivatePanelIntent, ctx) => {
                if (!isActivatePayload(payload)) return null;
                const dockState = resolveDockState(
                    ctx.state,
                    path,
                    options.selectDock,
                );
                const patch = reduceAndPatch(
                    dockState,
                    { type: 'activate-panel', payload },
                    path,
                    options.policy,
                );
                if (!patch) return null;
                return {
                    patch,
                    metadata: {
                        domain: 'dock',
                        ...(options.defaultMetadata ?? {}),
                    },
                };
            },
        ),

        store.registerIntent(
            intentNames.movePanel,
            (payload: DockMovePanelIntent, ctx) => {
                if (!isMovePayload(payload)) return null;
                const dockState = resolveDockState(
                    ctx.state,
                    path,
                    options.selectDock,
                );
                const patch = reduceAndPatch(
                    dockState,
                    { type: 'move-panel', payload },
                    path,
                    options.policy,
                );
                if (!patch) return null;
                return {
                    patch,
                    metadata: {
                        domain: 'dock',
                        ...(options.defaultMetadata ?? {}),
                    },
                };
            },
        ),

        store.registerIntent(
            intentNames.resize,
            (payload: DockResizeSplitIntent, ctx) => {
                if (!isResizePayload(payload)) return null;
                const dockState = resolveDockState(
                    ctx.state,
                    path,
                    options.selectDock,
                );
                const patch = reduceAndPatch(
                    dockState,
                    { type: 'resize-split', payload },
                    path,
                    options.policy,
                );
                if (!patch) return null;
                return {
                    patch,
                    metadata: {
                        domain: 'dock',
                        transient: Boolean(payload.transient),
                        ...(options.defaultMetadata ?? {}),
                    },
                };
            },
        ),

        store.registerIntent(
            intentNames.removePanel,
            (payload: DockRemovePanelIntent, ctx) => {
                if (!isRemovePayload(payload)) return null;
                const dockState = resolveDockState(
                    ctx.state,
                    path,
                    options.selectDock,
                );
                const patch = reduceAndPatch(
                    dockState,
                    { type: 'remove-panel', payload },
                    path,
                    options.policy,
                );
                if (!patch) return null;
                return {
                    patch,
                    metadata: {
                        domain: 'dock',
                        ...(options.defaultMetadata ?? {}),
                    },
                };
            },
        ),

        store.registerIntent(
            intentNames.addPanel,
            (payload: DockAddPanelIntent, ctx) => {
                const dockState = resolveDockState(
                    ctx.state,
                    path,
                    options.selectDock,
                );
                const patch = reduceAndPatch(
                    dockState,
                    { type: 'add-panel', payload: toAddPayload(payload) },
                    path,
                    options.policy,
                );
                if (!patch) return null;
                return {
                    patch,
                    metadata: {
                        domain: 'dock',
                        ...(options.defaultMetadata ?? {}),
                    },
                };
            },
        ),
    ];

    return {
        dispose: () => {
            for (const unsub of unsubs) {
                unsub();
            }
        },
        intents: intentNames,
    };
}
