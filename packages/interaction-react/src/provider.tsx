'use client';

import * as React from 'react';

import {
    createInteractionRuntime,
    createScopeId,
    type ActionHandler,
    type CommandBus,
    type DragSourceRegistration,
    type DropSurfaceRegistration,
    type InteractionRuntime,
    type InteractionSnapshot,
    type KeyGesture,
    type OverlaySpec,
    type ScopeRegistration,
    type ShortcutBinding,
    type SurfaceRegistration,
} from '@loop-kit/interaction';

type SurfaceConfig = Omit<SurfaceRegistration, 'getRect' | 'id'> & {
    id?: string;
};

type DropSurfaceConfig = Omit<DropSurfaceRegistration, 'getRect' | 'id'> & {
    id?: string;
};

type DragSourceConfig<TPayload> = Omit<DragSourceRegistration<TPayload>, 'id'> & {
    id?: string;
};

const InteractionContext = React.createContext<InteractionRuntime | null>(null);
const ScopeContext = React.createContext<string | undefined>(undefined);

function isEditableElement(target: EventTarget | null) {
    if (!(target instanceof HTMLElement)) {
        return false;
    }
    if (target.isContentEditable) {
        return true;
    }
    if (target instanceof HTMLTextAreaElement) {
        return true;
    }
    if (target instanceof HTMLInputElement) {
        const type = target.type.toLowerCase();
        return type !== 'button' && type !== 'checkbox' && type !== 'radio' && type !== 'submit';
    }
    return false;
}

function gestureFromKeyboardEvent(event: KeyboardEvent): KeyGesture {
    return {
        altKey: event.altKey,
        ctrlKey: event.ctrlKey,
        key: event.key,
        metaKey: event.metaKey,
        shiftKey: event.shiftKey,
    };
}

function useStableId(prefix: string, providedId?: string) {
    const reactId = React.useId();
    return React.useMemo(
        () => providedId ?? `${prefix}-${reactId.replace(/:/g, '')}`,
        [prefix, providedId, reactId],
    );
}

export type InteractionProviderProps<TCommand = unknown, TResult = unknown> = {
    children: React.ReactNode;
    commandBus?: CommandBus<TCommand, TResult>;
    runtime?: InteractionRuntime<TCommand, TResult>;
};

export function InteractionProvider<TCommand = unknown, TResult = unknown>({
    children,
    commandBus,
    runtime,
}: InteractionProviderProps<TCommand, TResult>) {
    const value = React.useMemo(
        () => runtime ?? createInteractionRuntime({ commandBus }),
        [commandBus, runtime],
    );

    React.useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            const result = value.dispatchShortcut(gestureFromKeyboardEvent(event), {
                isTextInputActive: isEditableElement(event.target),
            });
            if (result.ok) {
                event.preventDefault();
            }
        };
        const onPointerMove = (event: PointerEvent) => {
            value.movePointer({
                x: event.clientX,
                y: event.clientY,
            });
        };
        const onPointerUp = (event: PointerEvent) => {
            value.endDrag({
                x: event.clientX,
                y: event.clientY,
            });
        };
        const onPointerCancel = () => {
            value.cancelDrag();
        };

        document.addEventListener('keydown', onKeyDown);
        document.addEventListener('pointermove', onPointerMove);
        document.addEventListener('pointerup', onPointerUp);
        document.addEventListener('pointercancel', onPointerCancel);
        return () => {
            document.removeEventListener('keydown', onKeyDown);
            document.removeEventListener('pointermove', onPointerMove);
            document.removeEventListener('pointerup', onPointerUp);
            document.removeEventListener('pointercancel', onPointerCancel);
        };
    }, [value]);

    return <InteractionContext.Provider value={value}>{children}</InteractionContext.Provider>;
}

export function useInteractionRuntime<TCommand = unknown, TResult = unknown>() {
    const runtime = React.useContext(InteractionContext) as InteractionRuntime<TCommand, TResult> | null;
    if (!runtime) {
        throw new Error('InteractionProvider is required before using interaction hooks.');
    }
    return runtime;
}

export function useInteractionSnapshot<TSelected = InteractionSnapshot>(
    selector: (snapshot: InteractionSnapshot) => TSelected = (snapshot) =>
        snapshot as TSelected,
) {
    const runtime = useInteractionRuntime();
    return React.useSyncExternalStore(
        runtime.subscribe,
        () => selector(runtime.getSnapshot()),
        () => selector(runtime.getSnapshot()),
    );
}

export function useCurrentScopeId() {
    return React.useContext(ScopeContext);
}

export function useRegisterScope(input: Omit<ScopeRegistration, 'id' | 'parentId'> & {
    id?: string;
    parentId?: string;
}) {
    const runtime = useInteractionRuntime();
    const parentScopeId = useCurrentScopeId();
    const scopeId = useStableId(input.kind, input.id);

    React.useEffect(() => {
        return runtime.registerScope({
            ...input,
            id: scopeId,
            parentId: input.parentId ?? parentScopeId,
        });
    }, [input, parentScopeId, runtime, scopeId]);

    return scopeId;
}

export type ScopedRegionProps = React.HTMLAttributes<HTMLDivElement> & {
    capabilities?: ScopeRegistration['capabilities'];
    children: React.ReactNode;
    metadata?: ScopeRegistration['metadata'];
    scopeId?: string;
    scopeKind: string;
};

export function ScopedRegion({
    capabilities,
    children,
    metadata,
    onFocusCapture,
    onMouseEnter,
    scopeId,
    scopeKind,
    ...rest
}: ScopedRegionProps) {
    const runtime = useInteractionRuntime();
    const id = useRegisterScope({
        capabilities,
        id: scopeId,
        kind: scopeKind,
        metadata,
    });

    return (
        <ScopeContext.Provider value={id}>
            <div
                {...rest}
                data-interaction-scope={id}
                onFocusCapture={(event) => {
                    runtime.setFocusedScope(id);
                    runtime.setActiveScope(id);
                    onFocusCapture?.(event);
                }}
                onMouseEnter={(event) => {
                    runtime.setActiveScope(id);
                    onMouseEnter?.(event);
                }}>
                {children}
            </div>
        </ScopeContext.Provider>
    );
}

export function useRegisterActionHandler<TCommand = unknown, TResult = unknown>(
    actionId: string,
    handler: ActionHandler<TCommand, TResult>,
    scopeId?: string,
) {
    const runtime = useInteractionRuntime<TCommand, TResult>();
    const currentScopeId = useCurrentScopeId();
    const resolvedScopeId = scopeId ?? currentScopeId;

    React.useEffect(() => {
        if (!resolvedScopeId) {
            return;
        }
        return runtime.registerActionHandler({
            actionId,
            handler,
            scopeId: resolvedScopeId,
        });
    }, [actionId, handler, resolvedScopeId, runtime]);
}

export function useScopedShortcutMap(bindings: readonly ShortcutBinding[], scopeId?: string) {
    const runtime = useInteractionRuntime();
    const currentScopeId = useCurrentScopeId();
    const resolvedScopeId = scopeId ?? currentScopeId;

    React.useEffect(() => {
        if (!resolvedScopeId) {
            return;
        }
        return runtime.registerShortcutMap(resolvedScopeId, bindings);
    }, [bindings, resolvedScopeId, runtime]);
}

export function useDispatchAction() {
    const runtime = useInteractionRuntime();
    const currentScopeId = useCurrentScopeId();
    return React.useCallback(
        (actionId: string, payload?: unknown, scopeId?: string) =>
            runtime.dispatchAction({
                id: actionId,
                payload,
                scopeId: scopeId ?? currentScopeId,
            }),
        [currentScopeId, runtime],
    );
}

function useElementRegistration<TRegistration>(
    createRegistration: (element: HTMLElement) => TRegistration | null,
    register: (registration: TRegistration) => () => void,
) {
    const unregisterRef = React.useRef<(() => void) | null>(null);

    const ref = React.useCallback(
        (element: HTMLElement | null) => {
            unregisterRef.current?.();
            unregisterRef.current = null;
            if (!element) {
                return;
            }
            const registration = createRegistration(element);
            if (!registration) {
                return;
            }
            unregisterRef.current = register(registration);
        },
        [createRegistration, register],
    );

    React.useEffect(
        () => () => {
            unregisterRef.current?.();
        },
        [],
    );

    return {
        ref,
    };
}

export function useRegisterSurface(config: SurfaceConfig) {
    const runtime = useInteractionRuntime();
    const currentScopeId = useCurrentScopeId();
    const id = useStableId('surface', config.id);

    const registration = useElementRegistration(
        React.useCallback(
            (element: HTMLElement) => ({
                ...config,
                getRect: () => element.getBoundingClientRect(),
                id,
                scopeId: config.scopeId ?? currentScopeId,
            }),
            [config, currentScopeId, id],
        ),
        React.useCallback((registration: SurfaceRegistration) => runtime.registerSurface(registration), [runtime]),
    );

    return {
        id,
        ...registration,
    };
}

export function useRegisterDropSurface(config: DropSurfaceConfig) {
    const runtime = useInteractionRuntime();
    const currentScopeId = useCurrentScopeId();
    const id = useStableId('drop-surface', config.id);

    const registration = useElementRegistration(
        React.useCallback(
            (element: HTMLElement) => ({
                ...config,
                getRect: () => element.getBoundingClientRect(),
                id,
                scopeId: config.scopeId ?? currentScopeId,
            }),
            [config, currentScopeId, id],
        ),
        React.useCallback(
            (registration: DropSurfaceRegistration) => runtime.registerDropSurface(registration),
            [runtime],
        ),
    );

    return {
        id,
        ...registration,
    };
}

export function useRegisterDragSource<TPayload>(config: DragSourceConfig<TPayload>) {
    const runtime = useInteractionRuntime();
    const currentScopeId = useCurrentScopeId();
    const id = useStableId('drag-source', config.id);

    React.useEffect(() => {
        return runtime.registerDragSource({
            ...config,
            id,
            scopeId: config.scopeId ?? currentScopeId,
        } as DragSourceRegistration<unknown>);
    }, [config, currentScopeId, id, runtime]);

    const onPointerDown = React.useCallback(
        (event: React.PointerEvent<HTMLElement>) => {
            if (event.button !== 0) {
                return;
            }
            runtime.setActiveScope(config.scopeId ?? currentScopeId);
            const result = runtime.startDrag(id, {
                x: event.clientX,
                y: event.clientY,
            });
            if (result.ok) {
                event.preventDefault();
            }
        },
        [config.scopeId, currentScopeId, id, runtime],
    );

    return {
        draggable: true,
        onPointerDown,
    };
}

export function useSurfaceRect(surfaceId?: string) {
    const runtime = useInteractionRuntime();
    return React.useSyncExternalStore(
        runtime.subscribe,
        () => (surfaceId ? runtime.getSurfaceRect(surfaceId) : null),
        () => (surfaceId ? runtime.getSurfaceRect(surfaceId) : null),
    );
}

export function useInteractionDragEvents(listener: (snapshot: InteractionSnapshot) => void) {
    const runtime = useInteractionRuntime();

    React.useEffect(() => runtime.subscribe(() => listener(runtime.getSnapshot())), [listener, runtime]);
}

export function InteractionOverlayHost({
    renderOverlay,
}: {
    renderOverlay?: (overlay: OverlaySpec) => React.ReactNode;
}) {
    const overlay = useInteractionSnapshot((snapshot) => snapshot.overlay);
    if (!overlay) {
        return null;
    }

    const body =
        renderOverlay?.(overlay) ?? (
            <div
                style={{
                    alignItems: 'center',
                    backdropFilter: 'blur(10px)',
                    background: 'rgba(18, 24, 30, 0.84)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    boxShadow: '0 18px 42px rgba(0, 0, 0, 0.28)',
                    color: 'white',
                    display: 'inline-flex',
                    gap: '0.5rem',
                    minHeight: '2.5rem',
                    padding: '0.5rem 0.75rem',
                }}>
                {overlay.label ?? 'Dragging'}
            </div>
        );

    return (
        <div
            aria-hidden
            style={{
                inset: 0,
                pointerEvents: 'none',
                position: 'fixed',
                zIndex: 2000,
            }}>
            <div
                style={{
                    left: overlay.position.x,
                    position: 'absolute',
                    top: overlay.position.y,
                    transform: 'translate(12px, 12px)',
                }}>
                {body}
            </div>
        </div>
    );
}

export function createInteractionScopeId(prefix?: string) {
    return createScopeId(prefix);
}
