'use client';

import * as React from 'react';
import {
    DndContext,
    DragOverlay,
    KeyboardSensor,
    PointerSensor,
    closestCenter,
    pointerWithin,
    type CollisionDetection,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import {
    computeDropIndicator,
    computeLayoutRects,
    createDockInteractionController,
    type DockDropTarget,
    type DockGroupLayout,
    type DockLayoutMap,
    type DockNodeId,
    type DockState,
    type Rect,
} from '@loop-kit/dock';
import { useIntent, useQuery } from '@loop-kit/graphite-react';
import { useMeasuredView } from '@loop-kit/loom-interactions';

import { DockGroup, DockOverlay, DockSplitHandle } from './dock-primitives';
import { panelTitle } from './dock-helpers';
import {
    DOCK_INTENTS,
    DOCK_LAYOUT_DISPATCH_OPTIONS,
    DOCK_UI_DISPATCH_OPTIONS,
    UI_INTENTS,
    type DockBlockState,
} from './store';
import { useDockInteractions } from './use-dock-interactions';

const TAB_DROP_MARGIN_PX = 12;

export type DockCanvasDebugState = {
    activeDragPanelId: string | null;
    activeResizeHandleId: string | null;
    dropTarget: DockDropTarget | null;
    layout: DockLayoutMap;
};

type HoveredTabTarget = {
    groupId: string;
    panelId: string;
    placeAfter: boolean;
    overRect: {
        left: number;
        top: number;
        width: number;
        height: number;
    };
};

export type DockCanvasProps = {
    className?: string;
    onDebugStateChange?: (debug: DockCanvasDebugState) => void;
    onPanelActivate?: (panelId: DockNodeId, groupId: DockNodeId) => void;
    renderPanelBody?: (
        panelId: DockNodeId | null,
        groupId: DockNodeId,
    ) => React.ReactNode;
};

function containsPoint(rect: Rect, x: number, y: number) {
    return (
        x >= rect.x &&
        x <= rect.x + rect.width &&
        y >= rect.y &&
        y <= rect.y + rect.height
    );
}

function expandedRect(rect: Rect, margin: number): Rect {
    return {
        x: rect.x - margin,
        y: rect.y - margin,
        width: rect.width + margin * 2,
        height: rect.height + margin * 2,
    };
}

function distanceToRectCenter(rect: Rect, x: number, y: number) {
    const cx = rect.x + rect.width / 2;
    const cy = rect.y + rect.height / 2;
    const dx = x - cx;
    const dy = y - cy;
    return Math.sqrt(dx * dx + dy * dy);
}

function tabInsertionIndexFromDom(
    stageElement: HTMLDivElement | null,
    stageRect: DOMRect | null,
    groupId: string,
    fallbackRect: Rect,
    fallbackPanelCount: number,
    pointX: number,
) {
    if (!stageElement || !stageRect) {
        if (fallbackPanelCount <= 0) {
            return 0;
        }
        const step = fallbackRect.width / Math.max(1, fallbackPanelCount);
        return Math.max(
            0,
            Math.min(
                fallbackPanelCount,
                Math.round((pointX - fallbackRect.x) / Math.max(1, step)),
            ),
        );
    }

    const tabElements = Array.from(
        stageElement.querySelectorAll<HTMLElement>(
            `[data-dock-tab-group="${groupId}"]`,
        ),
    );
    if (tabElements.length <= 0) {
        if (fallbackPanelCount <= 0) {
            return 0;
        }
        const step = fallbackRect.width / Math.max(1, fallbackPanelCount);
        return Math.max(
            0,
            Math.min(
                fallbackPanelCount,
                Math.round((pointX - fallbackRect.x) / Math.max(1, step)),
            ),
        );
    }

    const edges = tabElements
        .map((element) => {
            const rect = element.getBoundingClientRect();
            return {
                left: rect.left - stageRect.left,
                mid: rect.left - stageRect.left + rect.width / 2,
            };
        })
        .sort((left, right) => left.left - right.left);

    if (pointX <= (edges[0]?.mid ?? 0)) {
        return 0;
    }

    for (let index = 1; index < edges.length; index += 1) {
        if (pointX <= (edges[index]?.mid ?? 0)) {
            return index;
        }
    }

    return edges.length;
}

function resolveTabbarTarget(
    point: { x: number; y: number },
    layout: DockLayoutMap,
    stageElement: HTMLDivElement | null,
    marginPx = TAB_DROP_MARGIN_PX,
): DockDropTarget | null {
    let candidate: DockGroupLayout | null = null;
    let bestDistance = Number.POSITIVE_INFINITY;

    for (const group of layout.groups) {
        const expanded = expandedRect(group.tabBarRect, marginPx);
        if (!containsPoint(expanded, point.x, point.y)) {
            continue;
        }
        const distance = distanceToRectCenter(group.tabBarRect, point.x, point.y);
        if (distance < bestDistance) {
            bestDistance = distance;
            candidate = group;
        }
    }

    if (!candidate) {
        return null;
    }

    const panelCount = candidate.panelIds.length;
    const stageRect = stageElement?.getBoundingClientRect() ?? null;
    const index = tabInsertionIndexFromDom(
        stageElement,
        stageRect,
        candidate.id,
        candidate.tabBarRect,
        panelCount,
        point.x,
    );

    return {
        groupId: candidate.id,
        zone: 'tabbar',
        rect: candidate.tabBarRect,
        index,
        score: 2,
    };
}

function resolveHoveredTabTarget(
    hoveredTab: HoveredTabTarget | null,
    layout: DockLayoutMap,
    stageElement: HTMLDivElement | null,
): DockDropTarget | null {
    if (!hoveredTab) {
        return null;
    }
    const group = layout.groups.find((entry) => entry.id === hoveredTab.groupId);
    if (!group) {
        return null;
    }

    const panelIndex = group.panelIds.indexOf(hoveredTab.panelId);
    if (panelIndex < 0) {
        return null;
    }

    const insertionIndex = hoveredTab.placeAfter ? panelIndex + 1 : panelIndex;
    const stageRect = stageElement?.getBoundingClientRect();
    const xViewport = hoveredTab.placeAfter
        ? hoveredTab.overRect.left + hoveredTab.overRect.width
        : hoveredTab.overRect.left;
    const xLocal = stageRect ? xViewport - stageRect.left : group.tabBarRect.x;

    return {
        groupId: group.id,
        zone: 'tabbar',
        index: Math.max(0, Math.min(group.panelIds.length, insertionIndex)),
        score: 3,
        rect: {
            x: xLocal - 1,
            y: group.tabBarRect.y + 3,
            width: 2,
            height: Math.max(0, group.tabBarRect.height - 6),
        },
    };
}

export function DockCanvas({
    className,
    onDebugStateChange,
    onPanelActivate,
    renderPanelBody,
}: DockCanvasProps) {
    const dispatchIntent = useIntent<DockBlockState>();
    const dockState = useQuery<DockBlockState, DockState>((state) => state.dock);
    const showOverlay = useQuery<DockBlockState, boolean>(
        (state) => state.ui.showOverlay,
    );
    const showOverlayLabels = useQuery<DockBlockState, boolean>(
        (state) => state.ui.showOverlayLabels,
    );

    const stageRef = useMeasuredView<HTMLDivElement>('loom-pack-dock-stage');
    const [bounds, setBounds] = React.useState<Rect>({
        x: 0,
        y: 0,
        width: 1,
        height: 1,
    });
    const [dropTarget, setDropTarget] = React.useState<DockDropTarget | null>(
        null,
    );
    const hoveredTabRef = React.useRef<HoveredTabTarget | null>(null);

    const interaction = React.useMemo(
        () =>
            createDockInteractionController({
                minWeight: 0.05,
                hitTestOptions: {
                    edgeRatio: 0.28,
                    hysteresisPx: 10,
                    maxEdgePx: 84,
                    minEdgePx: 20,
                },
                resolveDropTarget: (context) => {
                    const hoveredTarget = resolveHoveredTabTarget(
                        hoveredTabRef.current,
                        context.layout,
                        stageRef.current,
                    );
                    if (hoveredTarget) {
                        return hoveredTarget;
                    }
                    const tabTarget = resolveTabbarTarget(
                        context.point,
                        context.layout,
                        stageRef.current,
                        TAB_DROP_MARGIN_PX,
                    );
                    if (tabTarget) {
                        return tabTarget;
                    }
                    return context.rawTarget;
                },
                onDropTargetChange: setDropTarget,
            }),
        [stageRef],
    );

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 4,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
    );

    const layout = React.useMemo(
        () =>
            computeLayoutRects(dockState, bounds, {
                splitterSize: 12,
                tabBarHeight: 32,
            }),
        [bounds, dockState],
    );

    const layoutRef = React.useRef(layout);
    React.useEffect(() => {
        layoutRef.current = layout;
    }, [layout]);

    React.useEffect(() => {
        const element = stageRef.current;
        if (!element) {
            return;
        }

        const updateBounds = () => {
            setBounds({
                x: 0,
                y: 0,
                width: Math.max(1, element.clientWidth),
                height: Math.max(1, element.clientHeight),
            });
        };

        updateBounds();
        const observer = new ResizeObserver(updateBounds);
        observer.observe(element);
        return () => observer.disconnect();
    }, [stageRef]);

    const {
        activeDragPanelId,
        activeResizeHandleId,
        onDragCancel,
        onDragEnd,
        onDragMove,
        onDragStart,
        onSplitPointerDown,
    } = useDockInteractions({
        dockState,
        layoutRef,
        interaction,
        dispatchIntent,
        toLocalPoint: (point) => {
            const element = stageRef.current;
            if (!element) {
                return point;
            }
            const rect = element.getBoundingClientRect();
            return {
                x: point.x - rect.left,
                y: point.y - rect.top,
            };
        },
        onTabHoverChange: (target) => {
            hoveredTabRef.current = target;
        },
    });

    const onActivatePanel = React.useCallback(
        (panelId: DockNodeId, groupId: DockNodeId) => {
            dispatchIntent(
                DOCK_INTENTS.activatePanel,
                { panelId, groupId },
                { history: false },
            );
            dispatchIntent(
                UI_INTENTS.setActiveGroup,
                { groupId },
                DOCK_UI_DISPATCH_OPTIONS,
            );
            onPanelActivate?.(panelId, groupId);
        },
        [dispatchIntent, onPanelActivate],
    );

    const onClosePanel = React.useCallback(
        (panelId: DockNodeId) => {
            dispatchIntent(
                DOCK_INTENTS.removePanel,
                { panelId },
                DOCK_LAYOUT_DISPATCH_OPTIONS,
            );
        },
        [dispatchIntent],
    );

    const collisionDetection = React.useCallback<CollisionDetection>((args) => {
        const pointer = pointerWithin(args);
        if (pointer.length > 0) {
            return pointer;
        }
        return closestCenter(args);
    }, []);

    const indicator = showOverlay
        ? computeDropIndicator(dropTarget, layout, {
              edgeLineInsetPx: 8,
              tabLineInsetPx: 4,
          })
        : null;

    React.useEffect(() => {
        onDebugStateChange?.({
            activeDragPanelId,
            activeResizeHandleId,
            dropTarget,
            layout,
        });
    }, [
        activeDragPanelId,
        activeResizeHandleId,
        dropTarget,
        layout,
        onDebugStateChange,
    ]);

    return (
        <DndContext
            collisionDetection={collisionDetection}
            onDragCancel={onDragCancel}
            onDragEnd={onDragEnd}
            onDragMove={onDragMove}
            onDragStart={onDragStart}
            sensors={sensors}>
            <div
                ref={stageRef}
                className={className}
                data-dock-active-drag-panel={activeDragPanelId ?? ''}
                data-dock-active-resize-handle={activeResizeHandleId ?? ''}
                data-dock-drop-group={dropTarget?.groupId ?? ''}
                data-dock-drop-zone={dropTarget?.zone ?? ''}
                data-dock-stage='true'
                data-testid='dock-stage'
                style={{
                    background:
                        'linear-gradient(180deg, color-mix(in oklch, var(--loom-color-surface-sunken) 92%, transparent) 0%, color-mix(in oklch, var(--loom-color-surface-default) 88%, transparent) 100%)',
                    border: '1px solid var(--loom-color-border-default)',
                    borderRadius: '1.5rem',
                    height: '100%',
                    minHeight: '32rem',
                    overflow: 'hidden',
                    position: 'relative',
                }}>
                {layout.groups.map((group) => {
                    const activePanelId =
                        typeof group.activePanelId === 'string'
                            ? group.activePanelId
                            : (group.panelIds[0] ?? null);

                    return (
                        <DockGroup
                            key={group.id}
                            activePanelId={activePanelId}
                            group={group}
                            layout={layout}
                            onActivatePanel={onActivatePanel}
                            onClosePanel={onClosePanel}
                            panelTitle={(panelId) => panelTitle(dockState, panelId)}
                            renderPanelBody={renderPanelBody}
                        />
                    );
                })}

                {layout.splitHandles.map((handle) => (
                    <DockSplitHandle
                        key={handle.id}
                        active={activeResizeHandleId === handle.id}
                        handle={handle}
                        onPointerDown={onSplitPointerDown}
                    />
                ))}

                <DockOverlay
                    indicator={indicator}
                    showLabel={showOverlayLabels}
                />
            </div>

            <DragOverlay dropAnimation={null}>
                {activeDragPanelId ? (
                    <div
                        data-testid='dock-drag-preview'
                        style={{
                            background:
                                'color-mix(in oklch, var(--loom-color-surface-raised) 94%, transparent)',
                            border: '1px solid color-mix(in oklch, var(--loom-color-accent-default) 45%, var(--loom-color-border-default))',
                            borderRadius: 'var(--loom-radius-md)',
                            boxShadow: 'var(--loom-shadow-lg)',
                            color: 'var(--loom-color-text-default)',
                            fontSize: '0.82rem',
                            fontWeight: 600,
                            padding: '0.65rem 0.85rem',
                        }}>
                        {panelTitle(dockState, activeDragPanelId)}
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
}
