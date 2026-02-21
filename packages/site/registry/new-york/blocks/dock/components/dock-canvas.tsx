'use client';

import * as React from 'react';
import {
    closestCenter,
    type CollisionDetection,
    DndContext,
    DragOverlay,
    KeyboardSensor,
    PointerSensor,
    pointerWithin,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { snapCenterToCursor } from '@dnd-kit/modifiers';
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
import { useIntent, useQuery } from '@loop-kit/graphite/react';

import { DockGroup, DockOverlay, DockSplitHandle } from './dock-primitives';
import { panelTitle } from './dock-helpers';
import {
    DOCK_INTENTS,
    DOCK_LAYOUT_DISPATCH_OPTIONS,
    DockBlockState,
} from './dock-store';
import { useDockInteractions } from './use-dock-interactions';

type DockCanvasProps = {
    className?: string;
    renderPanelBody?: (panelId: DockNodeId | null, groupId: DockNodeId) => React.ReactNode;
};

const TAB_DROP_MARGIN_PX = 12;
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
        if (fallbackPanelCount <= 0) return 0;
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
        if (fallbackPanelCount <= 0) return 0;
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
                right: rect.right - stageRect.left,
                mid: rect.left - stageRect.left + rect.width / 2,
            };
        })
        .sort((left, right) => left.left - right.left);

    if (pointX <= edges[0].mid) return 0;

    for (let index = 1; index < edges.length; index += 1) {
        if (pointX <= edges[index].mid) {
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
        const expanded = expandedRect(group.rect, marginPx);
        if (!containsPoint(expanded, point.x, point.y)) continue;
        const distance = distanceToRectCenter(group.rect, point.x, point.y);
        if (distance < bestDistance) {
            bestDistance = distance;
            candidate = group;
        }
    }

    if (!candidate) return null;

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
    if (!hoveredTab) return null;
    const group = layout.groups.find((entry) => entry.id === hoveredTab.groupId);
    if (!group) return null;

    const panelIndex = group.panelIds.indexOf(hoveredTab.panelId);
    if (panelIndex < 0) return null;

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

export function DockCanvas({ className, renderPanelBody }: DockCanvasProps) {
    const dispatchIntent = useIntent<DockBlockState>();
    const dockState = useQuery<DockBlockState, DockState>((state) => state.dock);
    const showOverlay = useQuery<DockBlockState, boolean>(
        (state) => state.ui.showOverlay,
    );
    const showOverlayLabels = useQuery<DockBlockState, boolean>(
        (state) => state.ui.showOverlayLabels,
    );

    const stageRef = React.useRef<HTMLDivElement | null>(null);
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
    const splitModeRef = React.useRef(false);
    const [splitMode, setSplitMode] = React.useState(false);

    React.useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key !== 'Shift' || splitModeRef.current) return;
            splitModeRef.current = true;
            setSplitMode(true);
        };
        const onKeyUp = (event: KeyboardEvent) => {
            if (event.key !== 'Shift' || !splitModeRef.current) return;
            splitModeRef.current = false;
            setSplitMode(false);
        };
        const onBlur = () => {
            if (!splitModeRef.current) return;
            splitModeRef.current = false;
            setSplitMode(false);
        };

        window.addEventListener('keydown', onKeyDown);
        window.addEventListener('keyup', onKeyUp);
        window.addEventListener('blur', onBlur);

        return () => {
            window.removeEventListener('keydown', onKeyDown);
            window.removeEventListener('keyup', onKeyUp);
            window.removeEventListener('blur', onBlur);
        };
    }, []);

    const interaction = React.useMemo(
        () =>
            createDockInteractionController({
                minWeight: 0.05,
                hitTestOptions: {
                    edgeRatio: 0.28,
                    minEdgePx: 20,
                    maxEdgePx: 84,
                    hysteresisPx: 10,
                },
                resolveDropTarget: (context) => {
                    if (splitModeRef.current) {
                        return context.rawTarget;
                    }
                    const hoveredTarget = resolveHoveredTabTarget(
                        hoveredTabRef.current,
                        context.layout,
                        stageRef.current,
                    );
                    if (hoveredTarget) return hoveredTarget;
                    const tabTarget = resolveTabbarTarget(
                        context.point,
                        context.layout,
                        stageRef.current,
                        TAB_DROP_MARGIN_PX,
                    );
                    if (tabTarget) return tabTarget;
                    return context.rawTarget?.zone === 'tabbar'
                        ? context.rawTarget
                        : null;
                },
                onDropTargetChange: setDropTarget,
            }),
        [],
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
                tabBarHeight: 32,
                splitterSize: 12,
            }),
        [dockState, bounds],
    );

    const layoutRef = React.useRef(layout);
    React.useEffect(() => {
        layoutRef.current = layout;
    }, [layout]);

    React.useEffect(() => {
        const element = stageRef.current;
        if (!element) return;

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
    }, []);

    const {
        activeDragPanelId,
        activeResizeHandleId,
        onDragStart,
        onDragMove,
        onDragEnd,
        onDragCancel,
        onSplitPointerDown,
    } = useDockInteractions({
        dockState,
        layoutRef,
        interaction,
        dispatchIntent,
        toLocalPoint: (point) => {
            const element = stageRef.current;
            if (!element) return point;
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
        },
        [dispatchIntent],
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

    const collisionDetection = React.useCallback<CollisionDetection>(
        (args) => {
            const pointer = pointerWithin(args);
            if (pointer.length > 0) {
                return pointer;
            }
            return closestCenter(args);
        },
        [],
    );

    const indicator = showOverlay
        ? computeDropIndicator(dropTarget, layout, {
              tabLineInsetPx: 4,
              edgeLineInsetPx: 8,
          })
        : null;

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={collisionDetection}
            modifiers={[snapCenterToCursor]}
            onDragStart={onDragStart}
            onDragMove={onDragMove}
            onDragEnd={onDragEnd}
            onDragCancel={onDragCancel}>
            <div
                ref={stageRef}
                className={className ?? 'relative h-[620px] overflow-hidden rounded-xl border bg-muted/10'}>
                {layout.groups.map((group) => {
                    const activePanelId =
                        typeof group.activePanelId === 'string'
                            ? group.activePanelId
                            : (group.panelIds[0] ?? null);
                    return (
                        <DockGroup
                            key={group.id}
                            group={group}
                            layout={layout}
                            activePanelId={activePanelId}
                            panelTitle={(panelId) =>
                                panelTitle(dockState, panelId)
                            }
                            onActivatePanel={onActivatePanel}
                            onClosePanel={onClosePanel}
                            renderPanelBody={renderPanelBody}
                        />
                    );
                })}

                {layout.splitHandles.map((handle) => (
                    <DockSplitHandle
                        key={handle.id}
                        handle={handle}
                        active={activeResizeHandleId === handle.id}
                        onPointerDown={onSplitPointerDown}
                    />
                ))}

                <DockOverlay
                    indicator={indicator}
                    showLabel={showOverlayLabels || splitMode}
                />
            </div>

            <DragOverlay dropAnimation={null}>
                {activeDragPanelId ? (
                    <div className='rounded-md border border-border bg-card px-3 py-1.5 text-xs shadow-lg'>
                        {panelTitle(dockState, activeDragPanelId)}
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
}
