'use client';

import * as React from 'react';
import type { DispatchIntentOptions, GraphState } from '@loop-kit/graphite';
import type {
    DragCancelEvent,
    DragEndEvent,
    DragMoveEvent,
    DragStartEvent,
} from '@dnd-kit/core';

type DispatchIntentFn<TState extends GraphState> = <TPayload>(
    intent: string,
    payload: TPayload,
    options?: DispatchIntentOptions<TState>,
) => unknown;

export type GraphiteIntentEnvelope<TState extends GraphState = GraphState> = {
    intent: string;
    payload?: unknown;
    options?: DispatchIntentOptions<TState>;
};

function mergeDispatchOptions<TState extends GraphState>(
    defaults?: DispatchIntentOptions<TState>,
    override?: DispatchIntentOptions<TState>,
): DispatchIntentOptions<TState> | undefined {
    if (!defaults && !override) return undefined;
    if (!defaults) return override;
    if (!override) return defaults;
    return {
        ...defaults,
        ...override,
        metadata: {
            ...(defaults.metadata ?? {}),
            ...(override.metadata ?? {}),
        },
    };
}

export interface RafIntentDispatcher<TState extends GraphState = GraphState> {
    dispatchNow(envelope: GraphiteIntentEnvelope<TState>): void;
    queue(envelope: GraphiteIntentEnvelope<TState>): void;
    flush(): void;
    cancel(): void;
    dispose(): void;
}

export function createRafIntentDispatcher<TState extends GraphState = GraphState>(
    dispatchIntent: DispatchIntentFn<TState>,
    defaults?: DispatchIntentOptions<TState>,
): RafIntentDispatcher<TState> {
    let frameId: number | null = null;
    let pending: GraphiteIntentEnvelope<TState> | null = null;

    const run = (envelope: GraphiteIntentEnvelope<TState>) => {
        dispatchIntent(
            envelope.intent,
            envelope.payload,
            mergeDispatchOptions(defaults, envelope.options),
        );
    };

    const flush = () => {
        if (frameId !== null) {
            cancelAnimationFrame(frameId);
            frameId = null;
        }
        if (!pending) return;
        run(pending);
        pending = null;
    };

    return {
        dispatchNow(envelope) {
            flush();
            run(envelope);
        },
        queue(envelope) {
            pending = envelope;
            if (frameId !== null) return;
            frameId = requestAnimationFrame(() => {
                frameId = null;
                if (!pending) return;
                run(pending);
                pending = null;
            });
        },
        flush,
        cancel() {
            if (frameId !== null) {
                cancelAnimationFrame(frameId);
                frameId = null;
            }
            pending = null;
        },
        dispose() {
            if (frameId !== null) {
                cancelAnimationFrame(frameId);
                frameId = null;
            }
            pending = null;
        },
    };
}

function emitEnvelope<TState extends GraphState>(
    envelope: GraphiteIntentEnvelope<TState> | null | undefined,
    emit: (envelope: GraphiteIntentEnvelope<TState>) => void,
) {
    if (!envelope) return;
    emit(envelope);
}

export interface DndKitIntentRecognizerConfig<
    TState extends GraphState = GraphState,
    TSession = unknown,
> {
    createSession: (event: DragStartEvent) => TSession | null;
    onStart?: (
        session: TSession,
        event: DragStartEvent,
    ) => GraphiteIntentEnvelope<TState> | null;
    onMove?: (
        session: TSession,
        event: DragMoveEvent,
    ) => GraphiteIntentEnvelope<TState> | null;
    onEnd?: (
        session: TSession,
        event: DragEndEvent,
    ) => GraphiteIntentEnvelope<TState> | null;
    onCancel?: (
        session: TSession | null,
        event: DragCancelEvent,
    ) => GraphiteIntentEnvelope<TState> | null;
    emit: (envelope: GraphiteIntentEnvelope<TState>) => void;
    emitTransient?: (envelope: GraphiteIntentEnvelope<TState>) => void;
    flushTransient?: () => void;
}

export function useDndKitIntentRecognizer<
    TState extends GraphState = GraphState,
    TSession = unknown,
>(config: DndKitIntentRecognizerConfig<TState, TSession>) {
    const sessionRef = React.useRef<TSession | null>(null);
    const configRef = React.useRef(config);
    configRef.current = config;

    const onDragStart = React.useCallback((event: DragStartEvent) => {
        const session = configRef.current.createSession(event);
        sessionRef.current = session;
        if (!session) return;
        emitEnvelope(
            configRef.current.onStart?.(session, event),
            configRef.current.emit,
        );
    }, []);

    const onDragMove = React.useCallback((event: DragMoveEvent) => {
        const session = sessionRef.current;
        if (!session || !configRef.current.onMove) return;
        const envelope = configRef.current.onMove(session, event);
        if (!envelope) return;
        if (configRef.current.emitTransient) {
            configRef.current.emitTransient(envelope);
            return;
        }
        configRef.current.emit(envelope);
    }, []);

    const onDragEnd = React.useCallback((event: DragEndEvent) => {
        const session = sessionRef.current;
        sessionRef.current = null;
        configRef.current.flushTransient?.();
        if (!session || !configRef.current.onEnd) return;
        emitEnvelope(
            configRef.current.onEnd(session, event),
            configRef.current.emit,
        );
    }, []);

    const onDragCancel = React.useCallback((event: DragCancelEvent) => {
        const session = sessionRef.current;
        sessionRef.current = null;
        configRef.current.flushTransient?.();
        emitEnvelope(
            configRef.current.onCancel?.(session, event),
            configRef.current.emit,
        );
    }, []);

    return {
        sessionRef,
        onDragStart,
        onDragMove,
        onDragEnd,
        onDragCancel,
    };
}

export interface PointerIntentRecognizerConfig<
    TState extends GraphState = GraphState,
    TSession = unknown,
    TPayload = unknown,
> {
    createSession: (
        event: React.PointerEvent<HTMLElement>,
        payload: TPayload,
    ) => TSession | null;
    onMove?: (
        session: TSession,
        event: PointerEvent,
    ) => GraphiteIntentEnvelope<TState> | null;
    onEnd?: (
        session: TSession,
        event: PointerEvent,
    ) => GraphiteIntentEnvelope<TState> | null;
    onCancel?: (
        session: TSession | null,
        event: PointerEvent,
    ) => GraphiteIntentEnvelope<TState> | null;
    emit: (envelope: GraphiteIntentEnvelope<TState>) => void;
    emitTransient?: (envelope: GraphiteIntentEnvelope<TState>) => void;
    flushTransient?: () => void;
}

export function usePointerIntentRecognizer<
    TState extends GraphState = GraphState,
    TSession = unknown,
    TPayload = unknown,
>(config: PointerIntentRecognizerConfig<TState, TSession, TPayload>) {
    const sessionRef = React.useRef<TSession | null>(null);
    const cleanupRef = React.useRef<(() => void) | null>(null);
    const configRef = React.useRef(config);
    configRef.current = config;

    const clearSession = React.useCallback(() => {
        if (cleanupRef.current) {
            cleanupRef.current();
            cleanupRef.current = null;
        }
        sessionRef.current = null;
        configRef.current.flushTransient?.();
    }, []);

    React.useEffect(() => clearSession, [clearSession]);

    const onPointerDown = React.useCallback(
        (event: React.PointerEvent<HTMLElement>, payload: TPayload) => {
            if (event.button !== 0) return;
            clearSession();

            const session = configRef.current.createSession(event, payload);
            if (!session) return;
            sessionRef.current = session;

            const pointerId = event.pointerId;
            const target = event.currentTarget;
            target.setPointerCapture(pointerId);
            event.preventDefault();

            const onMove = (moveEvent: PointerEvent) => {
                if (moveEvent.pointerId !== pointerId) return;
                const current = sessionRef.current;
                if (!current || !configRef.current.onMove) return;
                const envelope = configRef.current.onMove(current, moveEvent);
                if (!envelope) return;
                if (configRef.current.emitTransient) {
                    configRef.current.emitTransient(envelope);
                    return;
                }
                configRef.current.emit(envelope);
            };

            const onUp = (upEvent: PointerEvent) => {
                if (upEvent.pointerId !== pointerId) return;
                const current = sessionRef.current;
                clearSession();
                if (!current || !configRef.current.onEnd) return;
                emitEnvelope(
                    configRef.current.onEnd(current, upEvent),
                    configRef.current.emit,
                );
            };

            const onCancel = (cancelEvent: PointerEvent) => {
                if (cancelEvent.pointerId !== pointerId) return;
                const current = sessionRef.current;
                clearSession();
                emitEnvelope(
                    configRef.current.onCancel?.(current, cancelEvent),
                    configRef.current.emit,
                );
            };

            document.addEventListener('pointermove', onMove);
            document.addEventListener('pointerup', onUp);
            document.addEventListener('pointercancel', onCancel);

            cleanupRef.current = () => {
                document.removeEventListener('pointermove', onMove);
                document.removeEventListener('pointerup', onUp);
                document.removeEventListener('pointercancel', onCancel);
                if (target.hasPointerCapture(pointerId)) {
                    target.releasePointerCapture(pointerId);
                }
            };
        },
        [clearSession],
    );

    return {
        sessionRef,
        clearSession,
        onPointerDown,
    };
}
