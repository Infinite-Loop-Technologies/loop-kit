import { fail, none, ok, success, type Option, type Result } from './results.js';

type Subscriber = () => void;

export type InteractionMetadata = Record<string, unknown>;
export type ScopeId = string;
export type ScopeKind = string;
export type ActionId = string;
export type SurfaceId = string;
export type DragSourceId = string;
export type DropSurfaceId = string;
export type OverlayId = string;

export type Point = {
    x: number;
    y: number;
};

export type RectLike = {
    bottom: number;
    height: number;
    left: number;
    right: number;
    top: number;
    width: number;
};

export type ScopeCapabilities = {
    blocksGlobalShortcuts?: boolean;
    disabled?: boolean;
    modal?: boolean;
    textInput?: boolean;
};

export type ScopeRegistration = {
    capabilities?: ScopeCapabilities;
    id: ScopeId;
    kind: ScopeKind;
    metadata?: InteractionMetadata;
    parentId?: ScopeId;
};

export type InteractionAction<TPayload = unknown> = {
    id: ActionId;
    payload?: TPayload;
    scopeId?: ScopeId;
};

export type ActionDispatchResult<TResult = unknown> = Result<
    {
        commandResult?: TResult;
        handlerScopeId: ScopeId;
    },
    InteractionError
>;

export type KeyGesture = {
    altKey?: boolean;
    ctrlKey?: boolean;
    key: string;
    metaKey?: boolean;
    shiftKey?: boolean;
};

export type ShortcutContext = {
    activeScopeId?: ScopeId;
    isModalPathActive: boolean;
    isTextInputActive: boolean;
    scopePath: ScopeRegistration[];
};

export type ShortcutBinding<TPayload = unknown> = {
    actionId: ActionId;
    allowInTextInput?: boolean;
    description?: string;
    enabled?: boolean;
    gesture: KeyGesture | string;
    id?: string;
    payload?: TPayload;
    priority?: number;
    when?: (context: ShortcutContext) => boolean;
};

export type SurfaceRegistration = {
    getRect: () => RectLike | null;
    id: SurfaceId;
    metadata?: InteractionMetadata;
    scopeId?: ScopeId;
    zIndex?: number;
};

export type DropSurfaceRegistration = SurfaceRegistration & {
    accepts?: readonly string[];
};

export type OverlaySpec = {
    data?: InteractionMetadata;
    id: OverlayId;
    label?: string;
    mode: 'custom' | 'ghost';
    position: Point;
    size?: {
        height?: number;
        width?: number;
    };
};

export type DragSourceRegistration<TPayload = unknown> = {
    createOverlay?: (input: {
        payload: TPayload;
        point: Point;
    }) => OverlaySpec | null;
    getPayload: () => TPayload;
    id: DragSourceId;
    metadata?: InteractionMetadata;
    scopeId?: ScopeId;
    type: string;
};

export type DragSession<TPayload = unknown> = {
    dropSurfaceId?: DropSurfaceId;
    overlay?: OverlaySpec;
    payload: TPayload;
    point: Point;
    sourceId: DragSourceId;
    sourceScopeId?: ScopeId;
    type: string;
};

export type DragEvent<TPayload = unknown> = {
    kind: 'cancel' | 'end' | 'move' | 'start';
    session: DragSession<TPayload>;
};

export type InteractionSnapshot<TPayload = unknown> = {
    activeScopeId?: ScopeId;
    dragSession?: DragSession<TPayload>;
    focusedScopeId?: ScopeId;
    overlay?: OverlaySpec;
    scopeIds: ScopeId[];
};

export type InteractionError = {
    code:
        | 'action-unhandled'
        | 'drag-source-not-found'
        | 'scope-not-found'
        | 'shortcut-unhandled';
    message: string;
};

export type CommandBus<TCommand = unknown, TResult = unknown> = {
    dispatch: (command: TCommand) => TResult;
};

export type ActionDispatchContext<TCommand = unknown, TResult = unknown> = {
    commandBus?: CommandBus<TCommand, TResult>;
    runtime: InteractionRuntime<TCommand, TResult>;
    scopeId: ScopeId;
};

export type ActionHandler<TCommand = unknown, TResult = unknown> = (
    action: InteractionAction,
    context: ActionDispatchContext<TCommand, TResult>,
) =>
    | void
    | boolean
    | {
          command?: TCommand;
          handled?: boolean;
          result?: TResult;
      };

type ActionHandlerRegistration<TCommand, TResult> = {
    actionId: ActionId;
    handler: ActionHandler<TCommand, TResult>;
    scopeId: ScopeId;
};

function createSubscriptionSet() {
    const subscribers = new Set<Subscriber>();

    return {
        emit() {
            for (const subscriber of subscribers) {
                subscriber();
            }
        },
        subscribe(subscriber: Subscriber) {
            subscribers.add(subscriber);
            return () => subscribers.delete(subscriber);
        },
    };
}

function createId(prefix: string) {
    return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function normalizeKeyName(key: string) {
    if (key === ' ') {
        return 'Space';
    }
    if (key.length === 1) {
        return key.toUpperCase();
    }
    return key[0]?.toUpperCase() + key.slice(1);
}

function normalizeGesture(gesture: KeyGesture | string) {
    if (typeof gesture !== 'string') {
        return {
            altKey: Boolean(gesture.altKey),
            ctrlKey: Boolean(gesture.ctrlKey),
            key: normalizeKeyName(gesture.key),
            metaKey: Boolean(gesture.metaKey),
            modKey: false,
            shiftKey: Boolean(gesture.shiftKey),
        };
    }

    const tokens = gesture
        .split('+')
        .map((token) => token.trim())
        .filter(Boolean);
    const normalized = {
        altKey: false,
        ctrlKey: false,
        key: '',
        metaKey: false,
        modKey: false,
        shiftKey: false,
    };

    for (const token of tokens) {
        const lower = token.toLowerCase();
        if (lower === 'alt') {
            normalized.altKey = true;
            continue;
        }
        if (lower === 'ctrl' || lower === 'control') {
            normalized.ctrlKey = true;
            continue;
        }
        if (lower === 'meta' || lower === 'cmd' || lower === 'command') {
            normalized.metaKey = true;
            continue;
        }
        if (lower === 'shift') {
            normalized.shiftKey = true;
            continue;
        }
        if (lower === 'mod') {
            normalized.modKey = true;
            continue;
        }
        normalized.key = normalizeKeyName(token);
    }

    return normalized;
}

function matchesGesture(binding: ShortcutBinding, input: KeyGesture) {
    const normalizedBinding = normalizeGesture(binding.gesture);
    const normalizedInput = normalizeGesture(input);
    if (normalizedBinding.key !== normalizedInput.key) {
        return false;
    }
    if (normalizedBinding.altKey !== normalizedInput.altKey) {
        return false;
    }
    if (normalizedBinding.ctrlKey !== normalizedInput.ctrlKey) {
        return false;
    }
    if (normalizedBinding.metaKey !== normalizedInput.metaKey) {
        return false;
    }
    if (normalizedBinding.shiftKey !== normalizedInput.shiftKey) {
        return false;
    }
    if (normalizedBinding.modKey && !(normalizedInput.ctrlKey || normalizedInput.metaKey)) {
        return false;
    }
    return true;
}

function pointInRect(point: Point, rect: RectLike) {
    return point.x >= rect.left && point.x <= rect.right && point.y >= rect.top && point.y <= rect.bottom;
}

function compareSurfaceCandidates(
    left: SurfaceRegistration,
    right: SurfaceRegistration,
    leftRect: RectLike,
    rightRect: RectLike,
) {
    const leftZ = left.zIndex ?? 0;
    const rightZ = right.zIndex ?? 0;
    if (leftZ !== rightZ) {
        return rightZ - leftZ;
    }
    const leftArea = leftRect.width * leftRect.height;
    const rightArea = rightRect.width * rightRect.height;
    return leftArea - rightArea;
}

export function createCommandBus<TCommand, TResult>(
    dispatch: (command: TCommand) => TResult,
): CommandBus<TCommand, TResult> {
    return {
        dispatch,
    };
}

export type InteractionRuntime<TCommand = unknown, TResult = unknown> = {
    cancelDrag: () => Option<DragSession>;
    dispatchAction: (action: InteractionAction) => ActionDispatchResult<TResult>;
    dispatchShortcut: (
        gesture: KeyGesture,
        options?: {
            activeScopeId?: ScopeId;
            isTextInputActive?: boolean;
        },
    ) => ActionDispatchResult<TResult>;
    endDrag: (point: Point) => Option<DragSession>;
    getSurfaceRect: (surfaceId: SurfaceId) => RectLike | null;
    getScopePath: (scopeId?: ScopeId) => ScopeRegistration[];
    getSnapshot: () => InteractionSnapshot;
    movePointer: (point: Point) => Option<DragSession>;
    registerActionHandler: (registration: ActionHandlerRegistration<TCommand, TResult>) => () => void;
    registerDragEventListener: (listener: (event: DragEvent) => void) => () => void;
    registerDragSource: (registration: DragSourceRegistration) => () => void;
    registerDropSurface: (registration: DropSurfaceRegistration) => () => void;
    registerScope: (registration: ScopeRegistration) => () => void;
    registerShortcutMap: (scopeId: ScopeId, bindings: readonly ShortcutBinding[]) => () => void;
    registerSurface: (registration: SurfaceRegistration) => () => void;
    setActiveScope: (scopeId?: ScopeId) => void;
    setFocusedScope: (scopeId?: ScopeId) => void;
    setOverlay: (overlay?: OverlaySpec) => void;
    startDrag: (sourceId: DragSourceId, point: Point) => Result<DragSession, InteractionError>;
    subscribe: (subscriber: Subscriber) => () => void;
};

export function createInteractionRuntime<TCommand = unknown, TResult = unknown>(options: {
    commandBus?: CommandBus<TCommand, TResult>;
} = {}): InteractionRuntime<TCommand, TResult> {
    const scopes = new Map<ScopeId, ScopeRegistration>();
    const actionHandlers = new Map<ActionId, ActionHandlerRegistration<TCommand, TResult>[]>();
    const shortcuts = new Map<ScopeId, ShortcutBinding[]>();
    const surfaces = new Map<SurfaceId, SurfaceRegistration>();
    const dropSurfaces = new Map<DropSurfaceId, DropSurfaceRegistration>();
    const dragSources = new Map<DragSourceId, DragSourceRegistration>();
    const dragEventListeners = new Set<(event: DragEvent) => void>();
    const subscriptions = createSubscriptionSet();

    let activeScopeId: ScopeId | undefined;
    let focusedScopeId: ScopeId | undefined;
    let dragSession: DragSession | undefined;
    let overlay: OverlaySpec | undefined;

    function emitDragEvent(kind: DragEvent['kind']) {
        if (!dragSession) {
            return;
        }
        const event: DragEvent = {
            kind,
            session: dragSession,
        };
        for (const listener of dragEventListeners) {
            listener(event);
        }
    }

    function getScopePath(scopeId?: ScopeId) {
        if (!scopeId) {
            return [];
        }
        const path: ScopeRegistration[] = [];
        let currentId: ScopeId | undefined = scopeId;
        while (currentId) {
            const scope = scopes.get(currentId);
            if (!scope) {
                break;
            }
            path.unshift(scope);
            currentId = scope.parentId;
        }
        return path;
    }

    function getScopeTarget(scopeId?: ScopeId) {
        return scopeId ?? activeScopeId ?? focusedScopeId;
    }

    function getModalPathInfo(scopePath: ScopeRegistration[]) {
        let isModalPathActive = false;
        let blocksGlobalShortcuts = false;
        for (const scope of scopePath) {
            if (scope.capabilities?.modal) {
                isModalPathActive = true;
            }
            if (scope.capabilities?.blocksGlobalShortcuts) {
                blocksGlobalShortcuts = true;
            }
        }
        return {
            blocksGlobalShortcuts,
            isModalPathActive,
        };
    }

    function updateDropSurface(point: Point) {
        if (!dragSession) {
            return;
        }

        const candidates = [...dropSurfaces.values()]
            .map((surface) => {
                const rect = surface.getRect();
                return rect ? { rect, surface } : null;
            })
            .filter((entry): entry is { rect: RectLike; surface: DropSurfaceRegistration } => entry != null)
            .filter((entry) => {
                if (!pointInRect(point, entry.rect)) {
                    return false;
                }
                const accepts = entry.surface.accepts;
                return !accepts || accepts.length === 0 || accepts.includes(dragSession!.type);
            })
            .sort((left, right) =>
                compareSurfaceCandidates(left.surface, right.surface, left.rect, right.rect),
            );

        dragSession = {
            ...dragSession,
            dropSurfaceId: candidates[0]?.surface.id,
            point,
        };
        if (dragSession.overlay) {
            overlay = {
                ...dragSession.overlay,
                position: point,
            };
        }
    }

    function getSnapshot(): InteractionSnapshot {
        return {
            activeScopeId,
            dragSession,
            focusedScopeId,
            overlay,
            scopeIds: [...scopes.keys()],
        };
    }

    return {
        cancelDrag() {
            if (!dragSession) {
                return none();
            }
            const cancelled = dragSession;
            emitDragEvent('cancel');
            dragSession = undefined;
            overlay = undefined;
            subscriptions.emit();
            return success(cancelled);
        },
        dispatchAction(action) {
            const targetScopeId = getScopeTarget(action.scopeId);
            const scopePath = getScopePath(targetScopeId);
            for (let index = scopePath.length - 1; index >= 0; index -= 1) {
                const scope = scopePath[index];
                const handlers = actionHandlers.get(action.id) ?? [];
                for (const entry of handlers) {
                    if (entry.scopeId !== scope.id) {
                        continue;
                    }
                    const outcome = entry.handler(action, {
                        commandBus: options.commandBus,
                        runtime: this,
                        scopeId: scope.id,
                    });
                    if (outcome === true) {
                        return ok({
                            handlerScopeId: scope.id,
                        });
                    }
                    if (!outcome) {
                        continue;
                    }
                    if (typeof outcome === 'object' && 'command' in outcome && outcome.command && options.commandBus) {
                        const result = options.commandBus.dispatch(outcome.command);
                        return ok({
                            commandResult: result,
                            handlerScopeId: scope.id,
                        });
                    }
                    if (typeof outcome === 'object' && (outcome.handled || outcome.result !== undefined)) {
                        return ok({
                            commandResult: outcome.result,
                            handlerScopeId: scope.id,
                        });
                    }
                }
            }

            return fail({
                code: 'action-unhandled',
                message: `No action handler resolved for "${action.id}".`,
            });
        },
        dispatchShortcut(gesture, shortcutOptions = {}) {
            const targetScopeId = getScopeTarget(shortcutOptions.activeScopeId);
            const scopePath = getScopePath(targetScopeId);
            const { blocksGlobalShortcuts, isModalPathActive } = getModalPathInfo(scopePath);
            const shortcutContext: ShortcutContext = {
                activeScopeId: targetScopeId,
                isModalPathActive,
                isTextInputActive: Boolean(shortcutOptions.isTextInputActive),
                scopePath,
            };

            for (let index = scopePath.length - 1; index >= 0; index -= 1) {
                const scope = scopePath[index];
                const scopeShortcuts = [...(shortcuts.get(scope.id) ?? [])].sort(
                    (left, right) => (right.priority ?? 0) - (left.priority ?? 0),
                );
                for (const binding of scopeShortcuts) {
                    if (binding.enabled === false) {
                        continue;
                    }
                    if (shortcutContext.isTextInputActive && !binding.allowInTextInput) {
                        continue;
                    }
                    if (blocksGlobalShortcuts && scope.id !== targetScopeId) {
                        continue;
                    }
                    if (!matchesGesture(binding, gesture)) {
                        continue;
                    }
                    if (binding.when && !binding.when(shortcutContext)) {
                        continue;
                    }
                    const result = this.dispatchAction({
                        id: binding.actionId,
                        payload: binding.payload,
                        scopeId: scope.id,
                    });
                    if (result.ok) {
                        return result;
                    }
                }
            }

            return fail({
                code: 'shortcut-unhandled',
                message: `No shortcut resolved for "${normalizeGesture(gesture).key}".`,
            });
        },
        endDrag(point) {
            if (!dragSession) {
                return none();
            }
            updateDropSurface(point);
            const finished = dragSession;
            emitDragEvent('end');
            dragSession = undefined;
            overlay = undefined;
            subscriptions.emit();
            return success(finished);
        },
        getSurfaceRect(surfaceId) {
            return surfaces.get(surfaceId)?.getRect() ?? null;
        },
        getScopePath,
        getSnapshot,
        movePointer(point) {
            if (!dragSession) {
                return none();
            }
            updateDropSurface(point);
            emitDragEvent('move');
            subscriptions.emit();
            return success(dragSession);
        },
        registerActionHandler(registration) {
            const list = actionHandlers.get(registration.actionId) ?? [];
            actionHandlers.set(registration.actionId, [...list, registration]);
            return () => {
                actionHandlers.set(
                    registration.actionId,
                    (actionHandlers.get(registration.actionId) ?? []).filter(
                        (entry) =>
                            entry.scopeId !== registration.scopeId || entry.handler !== registration.handler,
                    ),
                );
            };
        },
        registerDragEventListener(listener) {
            dragEventListeners.add(listener);
            return () => dragEventListeners.delete(listener);
        },
        registerDragSource(registration) {
            dragSources.set(registration.id, registration);
            return () => {
                dragSources.delete(registration.id);
            };
        },
        registerDropSurface(registration) {
            dropSurfaces.set(registration.id, registration);
            surfaces.set(registration.id, registration);
            return () => {
                dropSurfaces.delete(registration.id);
                surfaces.delete(registration.id);
            };
        },
        registerScope(registration) {
            scopes.set(registration.id, registration);
            subscriptions.emit();
            return () => {
                scopes.delete(registration.id);
                shortcuts.delete(registration.id);
                for (const [actionId, list] of actionHandlers.entries()) {
                    actionHandlers.set(
                        actionId,
                        list.filter((entry) => entry.scopeId !== registration.id),
                    );
                }
                if (activeScopeId === registration.id) {
                    activeScopeId = undefined;
                }
                if (focusedScopeId === registration.id) {
                    focusedScopeId = undefined;
                }
                subscriptions.emit();
            };
        },
        registerShortcutMap(scopeId, bindings) {
            const nextBindings = [...bindings];
            shortcuts.set(scopeId, nextBindings);
            return () => {
                if (shortcuts.get(scopeId) === nextBindings) {
                    shortcuts.delete(scopeId);
                }
            };
        },
        registerSurface(registration) {
            surfaces.set(registration.id, registration);
            return () => {
                surfaces.delete(registration.id);
            };
        },
        setActiveScope(scopeId) {
            activeScopeId = scopeId;
            subscriptions.emit();
        },
        setFocusedScope(scopeId) {
            focusedScopeId = scopeId;
            subscriptions.emit();
        },
        setOverlay(nextOverlay) {
            overlay = nextOverlay;
            subscriptions.emit();
        },
        startDrag(sourceId, point) {
            const source = dragSources.get(sourceId);
            if (!source) {
                return fail({
                    code: 'drag-source-not-found',
                    message: `Drag source "${sourceId}" was not found.`,
                });
            }
            const payload = source.getPayload();
            dragSession = {
                dropSurfaceId: undefined,
                overlay:
                    source.createOverlay?.({
                        payload,
                        point,
                    }) ?? undefined,
                payload,
                point,
                sourceId,
                sourceScopeId: source.scopeId,
                type: source.type,
            };
            overlay = dragSession.overlay;
            emitDragEvent('start');
            subscriptions.emit();
            return ok(dragSession);
        },
        subscribe: subscriptions.subscribe,
    };
}

export function createScopeId(prefix = 'scope') {
    return createId(prefix);
}
