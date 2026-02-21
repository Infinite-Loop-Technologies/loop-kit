'use client';

import * as React from 'react';
import type { DispatchIntentOptions } from '@loop-kit/graphite';
import type {
    DockInteractionController,
    DockLayoutMap,
    Point,
    DockSplitHandleLayout,
    DockState,
} from '@loop-kit/dock';
import type { DragEndEvent, DragMoveEvent } from '@dnd-kit/core';

import {
    createRafIntentDispatcher,
    useDndKitIntentRecognizer,
    usePointerIntentRecognizer,
} from '../../../systems/graphite-dnd';
import type { DockBlockState } from './dock-store';
import { toDockInteractionEnvelope } from './dock-store';
import { dragCenterFromEvent } from './dock-helpers';

type DispatchDockIntent = <TPayload>(
    name: string,
    payload: TPayload,
    options?: DispatchIntentOptions<DockBlockState>,
) => unknown;

type UseDockInteractionsOptions = {
    dockState: DockState;
    layoutRef: React.MutableRefObject<DockLayoutMap>;
    interaction: DockInteractionController;
    dispatchIntent: DispatchDockIntent;
    toLocalPoint: (point: Point) => Point;
    onTabHoverChange?: (
        target:
            | {
                  groupId: string;
                  panelId: string;
                  placeAfter: boolean;
                  overRect: {
                      left: number;
                      top: number;
                      width: number;
                      height: number;
                  };
              }
            | null,
    ) => void;
};

type ResizeSession = {
    handleId: string;
};

type DragSession = {
    panelId: string;
    startClientPoint: Point | null;
};

function clientPointFromActivator(
    event: Event | null | undefined,
): Point | null {
    if (!event) return null;
    if (event instanceof PointerEvent || event instanceof MouseEvent) {
        return {
            x: event.clientX,
            y: event.clientY,
        };
    }
    if (event instanceof TouchEvent) {
        const touch = event.touches[0] ?? event.changedTouches[0];
        if (!touch) return null;
        return {
            x: touch.clientX,
            y: touch.clientY,
        };
    }
    return null;
}

function dragPointFromDelta(
    session: DragSession,
    event: DragMoveEvent | DragEndEvent,
): Point | null {
    if (session.startClientPoint) {
        return {
            x: session.startClientPoint.x + event.delta.x,
            y: session.startClientPoint.y + event.delta.y,
        };
    }
    return dragCenterFromEvent(event);
}

export function useDockInteractions({
    dockState,
    layoutRef,
    interaction,
    dispatchIntent,
    toLocalPoint,
    onTabHoverChange,
}: UseDockInteractionsOptions) {
    const [activeDragPanelId, setActiveDragPanelId] = React.useState<
        string | null
    >(null);
    const [activeResizeHandleId, setActiveResizeHandleId] = React.useState<
        string | null
    >(null);

    const rafDispatcher = React.useMemo(
        () =>
            createRafIntentDispatcher<DockBlockState>(dispatchIntent, undefined),
        [dispatchIntent],
    );

    React.useEffect(() => () => rafDispatcher.dispose(), [rafDispatcher]);

    const dragRecognizer = useDndKitIntentRecognizer<DockBlockState, DragSession>({
        createSession: (event) => ({
            panelId: String(event.active.id),
            startClientPoint: clientPointFromActivator(event.activatorEvent),
        }),
        onStart: (session) => {
            onTabHoverChange?.(null);
            setActiveDragPanelId(session.panelId);
            interaction.startPanelDrag(session.panelId);
            return null;
        },
        onMove: (session, event) => {
            const point = dragPointFromDelta(session, event);
            if (!point) return null;

            const overData = event.over?.data.current as
                | {
                      type?: string;
                      panelId?: string;
                      groupId?: string;
                  }
                | undefined;
            const overRect = event.over?.rect;
            if (
                overData?.type === 'panel' &&
                typeof overData.panelId === 'string' &&
                typeof overData.groupId === 'string' &&
                overRect
            ) {
                const centerX = overRect.left + overRect.width / 2;
                onTabHoverChange?.({
                    groupId: overData.groupId,
                    panelId: overData.panelId,
                    placeAfter: point.x >= centerX,
                    overRect: {
                        left: overRect.left,
                        top: overRect.top,
                        width: overRect.width,
                        height: overRect.height,
                    },
                });
            } else {
                onTabHoverChange?.(null);
            }

            interaction.updatePointer(toLocalPoint(point), layoutRef.current);
            return null;
        },
        onEnd: (session, event) => {
            const point = dragPointFromDelta(session, event);
            setActiveDragPanelId(null);
            const intent = point
                ? interaction.endPanelDrag(
                      toLocalPoint(point),
                      layoutRef.current,
                  )
                : null;
            onTabHoverChange?.(null);
            return toDockInteractionEnvelope(intent);
        },
        onCancel: () => {
            onTabHoverChange?.(null);
            setActiveDragPanelId(null);
            interaction.cancelPanelDrag();
            return null;
        },
        emit: (envelope) => rafDispatcher.dispatchNow(envelope),
    });

    const resizeRecognizer = usePointerIntentRecognizer<
        DockBlockState,
        ResizeSession,
        DockSplitHandleLayout
    >({
        createSession: (event, handle) => {
            const splitNode = dockState.nodes[handle.splitId];
            if (!splitNode || splitNode.kind !== 'split') {
                return null;
            }

            const splitRect = layoutRef.current.nodes[handle.splitId]?.rect;
            if (!splitRect) {
                return null;
            }

            interaction.startResize({
                splitId: handle.splitId,
                handleIndex: handle.index,
                direction: handle.direction,
                startPoint: {
                    x: event.clientX,
                    y: event.clientY,
                },
                splitSize:
                    handle.direction === 'row'
                        ? Math.max(1, splitRect.width)
                        : Math.max(1, splitRect.height),
                weights: splitNode.data.weights,
            });
            setActiveResizeHandleId(handle.id);

            return {
                handleId: handle.id,
            };
        },
        onMove: (_session, event) => {
            const intent = interaction.updateResize({
                x: event.clientX,
                y: event.clientY,
            });
            return toDockInteractionEnvelope(intent);
        },
        onEnd: (_session, event) => {
            setActiveResizeHandleId(null);
            const intent = interaction.endResize({
                x: event.clientX,
                y: event.clientY,
            });
            return toDockInteractionEnvelope(intent);
        },
        onCancel: () => {
            setActiveResizeHandleId(null);
            interaction.cancelResize();
            return null;
        },
        emit: (envelope) => rafDispatcher.dispatchNow(envelope),
        emitTransient: (envelope) => rafDispatcher.queue(envelope),
        flushTransient: () => rafDispatcher.flush(),
    });

    const onSplitPointerDown = React.useCallback(
        (
            event: React.PointerEvent<HTMLButtonElement>,
            handle: DockSplitHandleLayout,
        ) => {
            resizeRecognizer.onPointerDown(
                event as React.PointerEvent<HTMLElement>,
                handle,
            );
        },
        [resizeRecognizer],
    );

    return {
        activeDragPanelId,
        activeResizeHandleId,
        onDragStart: dragRecognizer.onDragStart,
        onDragMove: dragRecognizer.onDragMove,
        onDragEnd: dragRecognizer.onDragEnd,
        onDragCancel: dragRecognizer.onDragCancel,
        onSplitPointerDown,
    };
}
