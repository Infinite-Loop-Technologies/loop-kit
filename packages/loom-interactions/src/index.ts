import * as React from 'react';
import type {
    DragCancelEvent,
    DragEndEvent,
    DragMoveEvent,
    DragStartEvent,
} from '@dnd-kit/core';

type Subscriber = () => void;

type ViewSnapshot = {
    id: string;
    rect: DOMRectReadOnly | null;
    element: HTMLElement | null;
};

type ViewRegistry = ReturnType<typeof createViewRegistry>;
type KeyboardScopeManager = ReturnType<typeof createKeyboardScopeManager>;
type FocusScopeManager = ReturnType<typeof createFocusScopeManager>;
type DragCoordinator = ReturnType<typeof createDragCoordinator>;

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

export function createViewRegistry() {
    const views = new Map<string, ViewSnapshot>();
    const subscriptions = createSubscriptionSet();

    function upsert(id: string, element: HTMLElement | null, rect: DOMRectReadOnly | null) {
        views.set(id, {
            id,
            element,
            rect,
        });
        subscriptions.emit();
    }

    return {
        register(id: string, element: HTMLElement | null) {
            upsert(id, element, element?.getBoundingClientRect() ?? null);

            let observer: ResizeObserver | null = null;
            if (element && typeof ResizeObserver !== 'undefined') {
                observer = new ResizeObserver(() => {
                    upsert(id, element, element.getBoundingClientRect());
                });
                observer.observe(element);
            }

            return () => {
                observer?.disconnect();
                views.delete(id);
                subscriptions.emit();
            };
        },
        get(id: string) {
            return views.get(id) ?? null;
        },
        list() {
            return [...views.values()];
        },
        subscribe: subscriptions.subscribe,
    };
}

export type KeyboardHandler = (event: KeyboardEvent) => boolean | void;

export function createKeyboardScopeManager() {
    const scopes = new Map<string, KeyboardHandler>();
    const stack: string[] = [];
    const subscriptions = createSubscriptionSet();

    return {
        register(scopeId: string, handler: KeyboardHandler) {
            scopes.set(scopeId, handler);
            subscriptions.emit();

            return () => {
                scopes.delete(scopeId);
                const index = stack.lastIndexOf(scopeId);
                if (index >= 0) {
                    stack.splice(index, 1);
                }
                subscriptions.emit();
            };
        },
        activate(scopeId: string) {
            const next = stack.filter((entry) => entry !== scopeId);
            next.push(scopeId);
            stack.splice(0, stack.length, ...next);
            subscriptions.emit();
        },
        deactivate(scopeId: string) {
            const index = stack.lastIndexOf(scopeId);
            if (index >= 0) {
                stack.splice(index, 1);
                subscriptions.emit();
            }
        },
        dispatch(event: KeyboardEvent) {
            for (let index = stack.length - 1; index >= 0; index -= 1) {
                const scopeId = stack[index];
                const handler = scopeId ? scopes.get(scopeId) : undefined;
                if (!handler) {
                    continue;
                }
                const handled = handler(event);
                if (handled) {
                    return true;
                }
            }
            return false;
        },
        snapshot() {
            return {
                activeScopeId: stack[stack.length - 1] ?? null,
                scopeIds: [...stack],
            };
        },
        subscribe: subscriptions.subscribe,
    };
}

export function createFocusScopeManager() {
    const scopes = new Map<string, Set<string>>();
    const activeIds = new Set<string>();
    const subscriptions = createSubscriptionSet();

    return {
        register(scopeId: string, focusableId: string) {
            const set = scopes.get(scopeId) ?? new Set<string>();
            set.add(focusableId);
            scopes.set(scopeId, set);
            subscriptions.emit();

            return () => {
                const next = scopes.get(scopeId);
                if (!next) {
                    return;
                }
                next.delete(focusableId);
                activeIds.delete(focusableId);
                if (next.size <= 0) {
                    scopes.delete(scopeId);
                }
                subscriptions.emit();
            };
        },
        focus(scopeId: string, focusableId: string) {
            if (!scopes.get(scopeId)?.has(focusableId)) {
                return;
            }
            activeIds.clear();
            activeIds.add(focusableId);
            subscriptions.emit();
        },
        snapshot(scopeId?: string) {
            return {
                activeIds: [...activeIds],
                focusableIds: scopeId ? [...(scopes.get(scopeId) ?? [])] : [...scopes.values()].flatMap((value) => [...value]),
            };
        },
        subscribe: subscriptions.subscribe,
    };
}

export function createDragCoordinator() {
    let current:
        | {
              itemId: string;
              point: { x: number; y: number } | null;
          }
        | null = null;
    const subscriptions = createSubscriptionSet();

    return {
        start(itemId: string, point: { x: number; y: number } | null) {
            current = { itemId, point };
            subscriptions.emit();
        },
        move(point: { x: number; y: number }) {
            if (!current) {
                return;
            }
            current = {
                ...current,
                point,
            };
            subscriptions.emit();
        },
        end() {
            current = null;
            subscriptions.emit();
        },
        snapshot() {
            return current;
        },
        subscribe: subscriptions.subscribe,
    };
}

export type InteractionRuntime = {
    viewRegistry: ViewRegistry;
    keyboardScopes: KeyboardScopeManager;
    focusScopes: FocusScopeManager;
    drag: DragCoordinator;
};

/**
 * Interaction runtime owns ephemeral UI coordination state such as measured
 * rects, active keyboard scopes, and transient drag state. It is not a
 * general scheduler and it is not a Graphite fact store.
 */
export function createInteractionRuntime(): InteractionRuntime {
    return {
        viewRegistry: createViewRegistry(),
        keyboardScopes: createKeyboardScopeManager(),
        focusScopes: createFocusScopeManager(),
        drag: createDragCoordinator(),
    };
}

const InteractionContext = React.createContext<InteractionRuntime | null>(null);

export function InteractionProvider({
    children,
    runtime,
}: {
    children: React.ReactNode;
    runtime?: InteractionRuntime;
}) {
    const value = React.useMemo(() => runtime ?? createInteractionRuntime(), [runtime]);

    React.useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            value.keyboardScopes.dispatch(event);
        };
        document.addEventListener('keydown', onKeyDown);
        return () => document.removeEventListener('keydown', onKeyDown);
    }, [value]);

    return React.createElement(
        InteractionContext.Provider,
        { value },
        children,
    );
}

export function useInteractionRuntime(): InteractionRuntime {
    const runtime = React.useContext(InteractionContext);
    if (!runtime) {
        throw new Error('InteractionProvider is required before using Loom interactions.');
    }
    return runtime;
}

export function useViewRegistry() {
    return useInteractionRuntime().viewRegistry;
}

export function useMeasuredView<TElement extends HTMLElement = HTMLElement>(viewId: string) {
    const registry = useViewRegistry();
    const ref = React.useRef<TElement | null>(null);

    React.useEffect(() => {
        return registry.register(viewId, ref.current);
    }, [registry, viewId]);

    return ref;
}

export function useViewSnapshot(viewId: string) {
    const registry = useViewRegistry();
    return React.useSyncExternalStore(
        registry.subscribe,
        () => registry.get(viewId),
        () => registry.get(viewId),
    );
}

export function useKeyboardScope(scopeId: string, handler: KeyboardHandler, active = true) {
    const keyboardScopes = useInteractionRuntime().keyboardScopes;

    React.useEffect(() => keyboardScopes.register(scopeId, handler), [handler, keyboardScopes, scopeId]);

    React.useEffect(() => {
        if (!active) {
            keyboardScopes.deactivate(scopeId);
            return;
        }
        keyboardScopes.activate(scopeId);
        return () => keyboardScopes.deactivate(scopeId);
    }, [active, keyboardScopes, scopeId]);
}

export function useFocusScope(scopeId: string, focusableId: string) {
    const focusScopes = useInteractionRuntime().focusScopes;
    React.useEffect(() => focusScopes.register(scopeId, focusableId), [focusScopes, focusableId, scopeId]);

    return React.useCallback(() => {
        focusScopes.focus(scopeId, focusableId);
    }, [focusScopes, focusableId, scopeId]);
}

export function createFrameQueue<TPayload>(dispatch: (payload: TPayload) => void) {
    let frameId: number | null = null;
    let pending: TPayload | null = null;

    const flush = () => {
        if (frameId !== null) {
            cancelAnimationFrame(frameId);
            frameId = null;
        }
        if (pending !== null) {
            const next = pending;
            pending = null;
            dispatch(next);
        }
    };

    return {
        queue(payload: TPayload) {
            pending = payload;
            if (frameId !== null) {
                return;
            }
            frameId = requestAnimationFrame(() => {
                frameId = null;
                if (pending !== null) {
                    const next = pending;
                    pending = null;
                    dispatch(next);
                }
            });
        },
        flush,
        clear() {
            pending = null;
            if (frameId !== null) {
                cancelAnimationFrame(frameId);
                frameId = null;
            }
        },
    };
}

export type DndRecognizerConfig<TSession = unknown, TPayload = unknown> = {
    createSession: (event: DragStartEvent) => TSession | null;
    onStart?: (session: TSession, event: DragStartEvent) => void;
    onMove?: (session: TSession, event: DragMoveEvent) => TPayload | null;
    onEnd?: (session: TSession, event: DragEndEvent) => TPayload | null;
    onCancel?: (session: TSession | null, event: DragCancelEvent) => void;
    dispatch: (payload: TPayload) => void;
    dispatchFrame?: (payload: TPayload) => void;
    flushFrame?: () => void;
};

export function useDndRecognizer<TSession = unknown, TPayload = unknown>(
    config: DndRecognizerConfig<TSession, TPayload>,
) {
    const configRef = React.useRef(config);
    const sessionRef = React.useRef<TSession | null>(null);
    configRef.current = config;

    const onDragStart = React.useCallback((event: DragStartEvent) => {
        const session = configRef.current.createSession(event);
        sessionRef.current = session;
        if (session) {
            configRef.current.onStart?.(session, event);
        }
    }, []);

    const onDragMove = React.useCallback((event: DragMoveEvent) => {
        const session = sessionRef.current;
        if (!session) {
            return;
        }
        const payload = configRef.current.onMove?.(session, event);
        if (payload == null) {
            return;
        }
        if (configRef.current.dispatchFrame) {
            configRef.current.dispatchFrame(payload);
            return;
        }
        configRef.current.dispatch(payload);
    }, []);

    const onDragEnd = React.useCallback((event: DragEndEvent) => {
        const session = sessionRef.current;
        sessionRef.current = null;
        configRef.current.flushFrame?.();
        if (!session) {
            return;
        }
        const payload = configRef.current.onEnd?.(session, event);
        if (payload != null) {
            configRef.current.dispatch(payload);
        }
    }, []);

    const onDragCancel = React.useCallback((event: DragCancelEvent) => {
        const session = sessionRef.current;
        sessionRef.current = null;
        configRef.current.flushFrame?.();
        configRef.current.onCancel?.(session, event);
    }, []);

    return {
        onDragStart,
        onDragMove,
        onDragEnd,
        onDragCancel,
    };
}

export type PointerRecognizerConfig<
    TPayload,
    TSession = unknown,
    TSource = undefined,
> = {
    createSession: (
        event: React.PointerEvent<HTMLElement>,
        source: TSource,
    ) => TSession | null;
    onMove?: (session: TSession, event: PointerEvent) => TPayload | null;
    onEnd?: (session: TSession, event: PointerEvent) => TPayload | null;
    onCancel?: (session: TSession | null, event: PointerEvent) => void;
    dispatch: (payload: TPayload) => void;
    dispatchFrame?: (payload: TPayload) => void;
    flushFrame?: () => void;
};

export function usePointerRecognizer<
    TPayload,
    TSession = unknown,
    TSource = undefined,
>(
    config: PointerRecognizerConfig<TPayload, TSession, TSource>,
) {
    const configRef = React.useRef(config);
    const sessionRef = React.useRef<TSession | null>(null);
    const cleanupRef = React.useRef<(() => void) | null>(null);
    configRef.current = config;

    const clear = React.useCallback(() => {
        cleanupRef.current?.();
        cleanupRef.current = null;
        sessionRef.current = null;
        configRef.current.flushFrame?.();
    }, []);

    React.useEffect(() => clear, [clear]);

    const onPointerDown = React.useCallback(
        (
            event: React.PointerEvent<HTMLElement>,
            source: TSource = undefined as TSource,
        ) => {
            if (event.button !== 0) {
                return;
            }

            clear();
            const session = configRef.current.createSession(event, source);
            if (!session) {
                return;
            }

            sessionRef.current = session;
            const pointerId = event.pointerId;
            const element = event.currentTarget;
            element.setPointerCapture(pointerId);

            const onMove = (moveEvent: PointerEvent) => {
                if (moveEvent.pointerId !== pointerId) {
                    return;
                }
                const active = sessionRef.current;
                if (!active) {
                    return;
                }
                const payload = configRef.current.onMove?.(active, moveEvent);
                if (payload == null) {
                    return;
                }
                if (configRef.current.dispatchFrame) {
                    configRef.current.dispatchFrame(payload);
                    return;
                }
                configRef.current.dispatch(payload);
            };

            const onEnd = (upEvent: PointerEvent) => {
                if (upEvent.pointerId !== pointerId) {
                    return;
                }
                const active = sessionRef.current;
                clear();
                if (!active) {
                    return;
                }
                const payload = configRef.current.onEnd?.(active, upEvent);
                if (payload != null) {
                    configRef.current.dispatch(payload);
                }
            };

            const onCancel = (cancelEvent: PointerEvent) => {
                if (cancelEvent.pointerId !== pointerId) {
                    return;
                }
                const active = sessionRef.current;
                clear();
                configRef.current.onCancel?.(active, cancelEvent);
            };

            document.addEventListener('pointermove', onMove);
            document.addEventListener('pointerup', onEnd);
            document.addEventListener('pointercancel', onCancel);

            cleanupRef.current = () => {
                document.removeEventListener('pointermove', onMove);
                document.removeEventListener('pointerup', onEnd);
                document.removeEventListener('pointercancel', onCancel);
                if (element.hasPointerCapture(pointerId)) {
                    element.releasePointerCapture(pointerId);
                }
            };
        },
        [clear],
    );

    return {
        onPointerDown,
    };
}
