'use client';

import * as React from 'react';
import {
    DndContext,
    DragOverlay,
    KeyboardSensor,
    PointerSensor,
    closestCenter,
    useSensor,
    useSensors,
    type DragEndEvent,
    type DragMoveEvent,
    type DragStartEvent,
} from '@dnd-kit/core';
import { restrictToParentElement, snapCenterToCursor } from '@dnd-kit/modifiers';
import {
    SortableContext,
    horizontalListSortingStrategy,
    sortableKeyboardCoordinates,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
    $set,
    createGraphStore,
    type GraphState,
    type GraphiteRuntime,
} from '@loop-kit/graphite';
import {
    GraphiteInspector,
    GraphiteProvider,
    useCommit,
    useGraphite,
    useIntent,
    useQuery,
} from '@loop-kit/graphite/react';
import {
    computeLayoutRects,
    createDockInteractionController,
    createDockIntentNames,
    createDockState,
    createDockPanelQuery,
    createGroupNode,
    createPanelNode,
    createSplitNode,
    describeDropOverlay,
    registerDockIntents,
    type DockDropTarget,
    type DockGroupNode,
    type DockInteractionIntent,
    type DockLayoutMap,
    type DockPanelSummary,
    type DockSplitNode,
    type DockState,
    type Rect,
} from '@loop-kit/dock';
import {
    GripVertical,
    PanelBottom,
    PanelLeft,
    Plus,
    Redo2,
    Undo2,
    Wrench,
    X,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { GraphiteIntentCommandMenu } from '../../../systems/graphite-intent-command-menu';
import type { GraphiteIntentRegistryEntry } from '../../../systems/graphite-intent-registry';
import {
    createShortcutBinding,
    GraphiteShortcutManager,
    useGraphiteShortcutBindings,
    type GraphiteShortcutBinding,
} from '../../../systems/graphite-shortcut-manager';
import type { QueryBuilderField } from '../../../systems/graphite-query-builder';

type DockBlockState = GraphState & {
    dock: DockState;
    ui: {
        shortcutsEnabled: boolean;
        showShortcutManager: boolean;
        showOverlay: boolean;
    };
};

const DOCK_INTENTS = createDockIntentNames('dock');
const UI_INTENTS = {
    setShortcutsEnabled: 'dock/ui/set-shortcuts-enabled',
    setShortcutManagerVisible: 'dock/ui/set-shortcut-manager-visible',
    setOverlayVisible: 'dock/ui/set-overlay-visible',
    undoLayout: 'dock/ui/undo-layout',
    redoLayout: 'dock/ui/redo-layout',
} as const;

const SHORTCUT_CONTEXT_FIELDS: QueryBuilderField[] = [
    { key: 'panelCount', label: 'Panel Count', type: 'number' },
    { key: 'canUndo', label: 'Can Undo', type: 'boolean' },
    { key: 'canRedo', label: 'Can Redo', type: 'boolean' },
    { key: 'overlayVisible', label: 'Overlay Visible', type: 'boolean' },
    { key: 'shortcutsEnabled', label: 'Shortcuts Enabled', type: 'boolean' },
];

function createDockFixture(): DockState {
    const explorer = createPanelNode('panel-explorer', 'Explorer');
    const editor = createPanelNode('panel-editor', 'Editor');
    const preview = createPanelNode('panel-preview', 'Preview');
    const consolePanel = createPanelNode('panel-console', 'Console');

    const leftGroup = createGroupNode('group-left', [explorer.id], explorer.id);
    const centerGroup = createGroupNode(
        'group-center',
        [editor.id, preview.id],
        editor.id
    );
    const bottomGroup = createGroupNode('group-bottom', [consolePanel.id], consolePanel.id);

    const centerSplit = createSplitNode(
        'split-center',
        'col',
        [centerGroup.id, bottomGroup.id],
        [0.72, 0.28]
    );
    const rootSplit = createSplitNode(
        'split-root',
        'row',
        [leftGroup.id, centerSplit.id],
        [0.26, 0.74]
    );

    return createDockState({
        rootId: rootSplit.id,
        floatRootId: 'float-root-main',
        nodes: {
            [explorer.id]: explorer,
            [editor.id]: editor,
            [preview.id]: preview,
            [consolePanel.id]: consolePanel,
            [leftGroup.id]: leftGroup,
            [centerGroup.id]: centerGroup,
            [bottomGroup.id]: bottomGroup,
            [centerSplit.id]: centerSplit,
            [rootSplit.id]: rootSplit,
        },
    });
}

function createDockStore(): GraphiteRuntime<DockBlockState> {
    const store = createGraphStore<DockBlockState>({
        initialState: {
            dock: createDockFixture(),
            ui: {
                shortcutsEnabled: true,
                showShortcutManager: false,
                showOverlay: true,
            },
        },
        eventMode: 'when-observed',
        maxCommits: 2000,
    });

    registerDockIntents(store, {
        path: ['dock'],
        intentPrefix: 'dock',
    });

    store.registerIntent(
        UI_INTENTS.setShortcutsEnabled,
        (payload: { enabled?: boolean }) => ({
            ui: {
                shortcutsEnabled: $set(Boolean(payload.enabled)),
            },
        })
    );

    store.registerIntent(
        UI_INTENTS.setShortcutManagerVisible,
        (payload: { visible?: boolean }) => ({
            ui: {
                showShortcutManager: $set(Boolean(payload.visible)),
            },
        })
    );

    store.registerIntent(
        UI_INTENTS.setOverlayVisible,
        (payload: { visible?: boolean }) => ({
            ui: {
                showOverlay: $set(Boolean(payload.visible)),
            },
        })
    );

    store.registerIntent(UI_INTENTS.undoLayout, () => ({}));
    store.registerIntent(UI_INTENTS.redoLayout, () => ({}));

    return store;
}

function getRootGroup(dock: DockState): DockGroupNode | null {
    const visited = new Set<string>();
    const queue = [dock.rootId];

    while (queue.length > 0) {
        const id = queue.shift();
        if (!id || visited.has(id)) continue;
        visited.add(id);

        const node = dock.nodes[id];
        if (!node) continue;
        if (node.kind === 'group') return node;

        for (const childId of node.links?.children ?? []) {
            queue.push(childId);
        }
    }

    return null;
}

function getActivePanelRef(dock: DockState): { groupId: string; panelId: string } | null {
    const group = getRootGroup(dock);
    if (!group) return null;

    const panelId =
        typeof group.data.activePanelId === 'string'
            ? group.data.activePanelId
            : group.links?.children?.[0];
    if (!panelId) return null;

    return {
        groupId: group.id,
        panelId,
    };
}

function createIntentRegistry(): GraphiteIntentRegistryEntry<DockBlockState>[] {
    return [
        {
            id: 'dock.add-panel',
            intent: DOCK_INTENTS.addPanel,
            title: 'Add Panel',
            description: 'Create a new panel in the active layout.',
            category: 'Dock',
            keywords: ['panel', 'create', 'tab'],
            dispatchOptions: {
                history: 'dock',
                metadata: { domain: 'dock' },
            },
            payload: (state: Readonly<DockBlockState>) => ({
                title: `Panel ${Object.keys(state.dock.nodes).filter((id) => state.dock.nodes[id]?.kind === 'panel').length + 1}`,
            }),
        },
        {
            id: 'dock.remove-active-panel',
            intent: DOCK_INTENTS.removePanel,
            title: 'Remove Active Panel',
            description: 'Close the currently active panel.',
            category: 'Dock',
            dispatchOptions: {
                history: 'dock',
                metadata: { domain: 'dock' },
            },
            payload: (state: Readonly<DockBlockState>) => {
                const active = getActivePanelRef(state.dock);
                return active ? { panelId: active.panelId } : undefined;
            },
        },
        {
            id: 'dock.undo-layout',
            intent: UI_INTENTS.undoLayout,
            title: 'Undo Layout',
            description: 'Undo the last dock layout mutation.',
            category: 'History',
            dispatchOptions: {
                history: false,
                event: false,
            },
        },
        {
            id: 'dock.redo-layout',
            intent: UI_INTENTS.redoLayout,
            title: 'Redo Layout',
            description: 'Redo the last undone dock layout mutation.',
            category: 'History',
            dispatchOptions: {
                history: false,
                event: false,
            },
        },
        {
            id: 'dock.toggle-overlay',
            intent: UI_INTENTS.setOverlayVisible,
            title: 'Toggle Drop Overlay',
            description: 'Show or hide dock drop target debug overlay.',
            category: 'Debug',
            dispatchOptions: {
                history: false,
                event: false,
            },
            payload: (state: Readonly<DockBlockState>) => ({ visible: !state.ui.showOverlay }),
        },
        {
            id: 'dock.toggle-shortcut-manager',
            intent: UI_INTENTS.setShortcutManagerVisible,
            title: 'Toggle Shortcut Manager',
            description: 'Open or hide the shortcut manager panel.',
            category: 'Debug',
            dispatchOptions: {
                history: false,
                event: false,
            },
            payload: (state: Readonly<DockBlockState>) => ({ visible: !state.ui.showShortcutManager }),
        },
        {
            id: 'dock.toggle-shortcuts',
            intent: UI_INTENTS.setShortcutsEnabled,
            title: 'Toggle Shortcuts',
            description: 'Enable or disable runtime keyboard shortcuts.',
            category: 'Debug',
            dispatchOptions: {
                history: false,
                event: false,
            },
            payload: (state: Readonly<DockBlockState>) => ({ enabled: !state.ui.shortcutsEnabled }),
        },
    ];
}

function createDefaultShortcutBindings(): GraphiteShortcutBinding[] {
    return [
        createShortcutBinding('dock.add-panel', 'alt+shift+n'),
        createShortcutBinding('dock.remove-active-panel', 'alt+shift+w'),
        createShortcutBinding('dock.undo-layout', 'mod+z'),
        createShortcutBinding('dock.redo-layout', 'mod+shift+z'),
        createShortcutBinding('dock.toggle-overlay', 'alt+shift+o'),
        createShortcutBinding('dock.toggle-shortcut-manager', 'alt+shift+k'),
    ].map((binding) => ({
        ...binding,
        enabled: true,
        preventDefault: true,
    }));
}

function panelTitle(dock: DockState, panelId: string): string {
    const node = dock.nodes[panelId];
    if (!node || node.kind !== 'panel') return panelId;
    return typeof node.data.title === 'string' ? node.data.title : panelId;
}

function dragCenterFromEvent(event: DragMoveEvent | DragEndEvent): { x: number; y: number } | null {
    const translated = event.active.rect.current.translated;
    if (!translated) return null;

    return {
        x: translated.left + translated.width / 2,
        y: translated.top + translated.height / 2,
    };
}

type DockOverlayGuide = {
    rect: Rect;
    label: string;
    kind: 'rect' | 'line';
};

function clampIndex(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
}

function resolveOverlayGuide(
    dropTarget: DockDropTarget | null,
    layout: DockLayoutMap
): DockOverlayGuide | null {
    const overlay = describeDropOverlay(dropTarget);
    if (!overlay?.rect || !dropTarget) {
        return null;
    }

    if (dropTarget.zone !== 'tabbar') {
        return {
            rect: overlay.rect,
            label: overlay.label,
            kind: 'rect',
        };
    }

    const group = layout.groups.find((entry) => entry.id === dropTarget.groupId);
    if (!group) {
        return {
            rect: overlay.rect,
            label: overlay.label,
            kind: 'rect',
        };
    }

    const panelCount = Math.max(1, group.panelIds.length);
    const rawIndex =
        typeof dropTarget.index === 'number'
            ? Math.trunc(dropTarget.index)
            : group.panelIds.length;
    const index = clampIndex(rawIndex, 0, group.panelIds.length);
    const step = group.tabBarRect.width / panelCount;
    const x = group.tabBarRect.x + step * index;

    return {
        label: overlay.label,
        kind: 'line',
        rect: {
            x: x - 1,
            y: group.tabBarRect.y + 3,
            width: 2,
            height: Math.max(0, group.tabBarRect.height - 6),
        },
    };
}

type DockTabProps = {
    panelId: string;
    groupId: string;
    active: boolean;
    title: string;
    onActivate: (panelId: string, groupId: string) => void;
};

function DockTab({ panelId, groupId, active, title, onActivate }: DockTabProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: panelId,
        data: {
            type: 'panel',
            panelId,
            groupId,
        },
    });

    const style: React.CSSProperties = {
        transform: isDragging && transform ? CSS.Transform.toString(transform) : undefined,
        transition: isDragging ? transition ?? undefined : 'none',
        opacity: isDragging ? 0.35 : 1,
    };

    return (
        <button
            ref={setNodeRef}
            type='button'
            style={style}
            className={cn(
                'group inline-flex h-8 min-w-0 items-center gap-1 rounded-md border px-2 text-xs',
                active
                    ? 'border-border bg-background text-foreground shadow-sm'
                    : 'border-transparent bg-transparent text-muted-foreground hover:border-border/60 hover:bg-accent/50',
                isDragging && 'border-dashed'
            )}
            onClick={() => onActivate(panelId, groupId)}
            {...attributes}
            {...listeners}>
            <GripVertical className='h-3 w-3 text-muted-foreground/80' />
            <span className='truncate'>{title}</span>
        </button>
    );
}

function DockCanvas() {
    const dispatchIntent = useIntent<DockBlockState>();
    const dockState = useQuery<DockBlockState, DockState>((state) => state.dock);
    const showOverlay = useQuery<DockBlockState, boolean>((state) => state.ui.showOverlay);

    const stageRef = React.useRef<HTMLDivElement | null>(null);
    const [bounds, setBounds] = React.useState<Rect>({ x: 0, y: 0, width: 1, height: 1 });
    const [dropTarget, setDropTarget] = React.useState<DockDropTarget | null>(null);
    const [activeDragPanelId, setActiveDragPanelId] = React.useState<string | null>(null);

    const interaction = React.useMemo(
        () =>
            createDockInteractionController({
                hitTestOptions: {
                    edgePx: 26,
                    hysteresisPx: 10,
                },
                minWeight: 0.05,
                onDropTargetChange: (target: DockDropTarget | null) => setDropTarget(target),
            }),
        []
    );

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 6,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const layout = React.useMemo(
        () =>
            computeLayoutRects(dockState, bounds, {
                tabBarHeight: 32,
                splitterSize: 10,
            }),
        [dockState, bounds]
    );

    const layoutRef = React.useRef(layout);
    React.useEffect(() => {
        layoutRef.current = layout;
    }, [layout]);

    React.useEffect(() => {
        const target = stageRef.current;
        if (!target) return;

        const updateBounds = () => {
            setBounds({
                x: 0,
                y: 0,
                width: Math.max(1, target.clientWidth),
                height: Math.max(1, target.clientHeight),
            });
        };

        updateBounds();
        const observer = new ResizeObserver(() => updateBounds());
        observer.observe(target);
        return () => observer.disconnect();
    }, []);

    const dispatchDockIntent = React.useCallback(
        (intent: DockInteractionIntent | null) => {
            if (!intent) return;
            const intentName =
                intent.name === 'dock/move-panel'
                    ? DOCK_INTENTS.movePanel
                    : DOCK_INTENTS.resize;

            dispatchIntent(intentName, intent.payload, {
                history: intent.transient ? false : 'dock',
                event: intent.transient ? false : undefined,
                metadata: {
                    domain: 'dock',
                    transient: Boolean(intent.transient),
                },
            });
        },
        [dispatchIntent]
    );

    const pendingResizeIntentRef = React.useRef<DockInteractionIntent | null>(null);
    const resizeFrameRef = React.useRef<number | null>(null);

    const flushTransientResize = React.useCallback(() => {
        if (resizeFrameRef.current !== null) {
            cancelAnimationFrame(resizeFrameRef.current);
            resizeFrameRef.current = null;
        }

        if (pendingResizeIntentRef.current) {
            dispatchDockIntent(pendingResizeIntentRef.current);
            pendingResizeIntentRef.current = null;
        }
    }, [dispatchDockIntent]);

    const queueTransientResize = React.useCallback(
        (intent: DockInteractionIntent | null) => {
            if (!intent) return;
            pendingResizeIntentRef.current = intent;
            if (resizeFrameRef.current !== null) return;
            resizeFrameRef.current = requestAnimationFrame(() => {
                resizeFrameRef.current = null;
                if (!pendingResizeIntentRef.current) return;
                dispatchDockIntent(pendingResizeIntentRef.current);
                pendingResizeIntentRef.current = null;
            });
        },
        [dispatchDockIntent]
    );

    React.useEffect(() => {
        return () => {
            if (resizeFrameRef.current !== null) {
                cancelAnimationFrame(resizeFrameRef.current);
                resizeFrameRef.current = null;
            }
        };
    }, []);

    const onActivatePanel = React.useCallback(
        (panelId: string, groupId: string) => {
            dispatchIntent(DOCK_INTENTS.activatePanel, { panelId, groupId }, { history: false });
        },
        [dispatchIntent]
    );
    const onDragStart = React.useCallback(
        (event: DragStartEvent) => {
            const panelId = String(event.active.id);
            setActiveDragPanelId(panelId);
            interaction.startPanelDrag(panelId);
        },
        [interaction]
    );

    const onDragMove = React.useCallback(
        (event: DragMoveEvent) => {
            const center = dragCenterFromEvent(event);
            if (!center) return;
            interaction.updatePointer(center, layoutRef.current);
        },
        [interaction]
    );

    const onDragCancel = React.useCallback(() => {
        interaction.cancelPanelDrag();
        setDropTarget(null);
        setActiveDragPanelId(null);
    }, [interaction]);

    const resolveSortableTabIntent = React.useCallback(
        (
            event: DragEndEvent,
            center: { x: number; y: number } | null
        ): DockInteractionIntent | null => {
            const payload = event.over?.data.current as
                | {
                      type?: string;
                      panelId?: string;
                      groupId?: string;
                  }
                | undefined;

            if (payload?.type !== 'panel' || typeof payload.groupId !== 'string') {
                return null;
            }

            const group = layoutRef.current.groups.find(
                (entry) => entry.id === payload.groupId
            );
            if (!group) return null;

            const sourcePanelId = String(event.active.id);
            const targetPanelId =
                typeof payload.panelId === 'string'
                    ? payload.panelId
                    : String(event.over?.id ?? '');
            const targetPanelIndex = group.panelIds.indexOf(targetPanelId);
            const baseIndex =
                targetPanelIndex >= 0 ? targetPanelIndex : group.panelIds.length;

            const overRect = event.over?.rect;
            const placeAfter =
                overRect && center
                    ? center.x > overRect.left + overRect.width / 2
                    : false;
            const insertionIndex = clampIndex(
                placeAfter ? baseIndex + 1 : baseIndex,
                0,
                group.panelIds.length
            );

            return {
                name: 'dock/move-panel',
                payload: {
                    panelId: sourcePanelId,
                    target: {
                        groupId: payload.groupId,
                        zone: 'tabbar',
                        index: insertionIndex,
                    },
                },
            };
        },
        []
    );

    const onDragEnd = React.useCallback(
        (event: DragEndEvent) => {
            const center = dragCenterFromEvent(event);
            const interactionIntent = center
                ? interaction.endPanelDrag(center, layoutRef.current)
                : null;
            const sortableIntent = resolveSortableTabIntent(event, center);
            const intent =
                interactionIntent &&
                interactionIntent.name === 'dock/move-panel' &&
                interactionIntent.payload.target.zone !== 'tabbar'
                    ? interactionIntent
                    : sortableIntent ?? interactionIntent;
            setDropTarget(null);
            setActiveDragPanelId(null);
            dispatchDockIntent(intent);
        },
        [dispatchDockIntent, interaction, resolveSortableTabIntent]
    );

    const overlay = showOverlay ? resolveOverlayGuide(dropTarget, layout) : null;

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            modifiers={[restrictToParentElement, snapCenterToCursor]}
            onDragStart={onDragStart}
            onDragMove={onDragMove}
            onDragCancel={onDragCancel}
            onDragEnd={onDragEnd}>
            <div
                ref={stageRef}
                className='relative h-[620px] overflow-hidden rounded-xl border bg-muted/20'>
                {layout.groups.map((group) => {
                    const groupStyle: React.CSSProperties = {
                        left: group.rect.x,
                        top: group.rect.y,
                        width: group.rect.width,
                        height: group.rect.height,
                    };

                    const activePanelId =
                        typeof group.activePanelId === 'string'
                            ? group.activePanelId
                            : group.panelIds[0] ?? null;

                    return (
                        <section
                            key={group.id}
                            className='absolute overflow-hidden rounded-md border bg-card shadow-sm'
                            style={groupStyle}>
                            <header className='flex h-8 items-center gap-1 border-b bg-muted/60 px-1'>
                                <SortableContext
                                    items={group.panelIds}
                                    strategy={horizontalListSortingStrategy}>
                                    {group.panelIds.map((panelId) => (
                                        <DockTab
                                            key={panelId}
                                            panelId={panelId}
                                            groupId={group.id}
                                            active={panelId === activePanelId}
                                            title={panelTitle(dockState, panelId)}
                                            onActivate={onActivatePanel}
                                        />
                                    ))}
                                </SortableContext>
                            </header>

                            <div className='h-[calc(100%-2rem)] p-3 text-xs text-muted-foreground'>
                                {activePanelId ? (
                                    <div className='space-y-2'>
                                        <p className='text-foreground'>
                                            {panelTitle(dockState, activePanelId)}
                                        </p>
                                        <p className='text-[11px]'>
                                            {activePanelId}
                                        </p>
                                    </div>
                                ) : (
                                    <p>Empty group</p>
                                )}
                            </div>
                        </section>
                    );
                })}

                {layout.splitHandles.map((handle) => {
                    const handleStyle: React.CSSProperties = {
                        left: handle.rect.x,
                        top: handle.rect.y,
                        width: handle.rect.width,
                        height: handle.rect.height,
                    };

                    return (
                        <button
                            key={handle.id}
                            type='button'
                            className={cn(
                                'absolute z-20 rounded-sm border border-cyan-400/30 bg-cyan-400/10',
                                handle.direction === 'row' ? 'cursor-col-resize' : 'cursor-row-resize'
                            )}
                            style={handleStyle}
                            onPointerDown={(event) => {
                                if (event.button !== 0) return;
                                const splitNode = dockState.nodes[handle.splitId];
                                if (!splitNode || splitNode.kind !== 'split') return;

                                const splitRect = layout.nodes[handle.splitId]?.rect;
                                if (!splitRect) return;

                                interaction.startResize({
                                    splitId: handle.splitId,
                                    handleIndex: handle.index,
                                    direction: handle.direction,
                                    startPoint: { x: event.clientX, y: event.clientY },
                                    splitSize:
                                        handle.direction === 'row'
                                            ? Math.max(1, splitRect.width)
                                            : Math.max(1, splitRect.height),
                                    weights: (splitNode as DockSplitNode).data.weights,
                                });

                                const onMove = (moveEvent: PointerEvent) => {
                                    const transientIntent = interaction.updateResize({
                                        x: moveEvent.clientX,
                                        y: moveEvent.clientY,
                                    });
                                    queueTransientResize(transientIntent);
                                };

                                const onUp = (upEvent: PointerEvent) => {
                                    document.removeEventListener('pointermove', onMove);
                                    document.removeEventListener('pointerup', onUp);
                                    flushTransientResize();
                                    const finalIntent = interaction.endResize({
                                        x: upEvent.clientX,
                                        y: upEvent.clientY,
                                    });
                                    dispatchDockIntent(finalIntent);
                                };

                                document.addEventListener('pointermove', onMove);
                                document.addEventListener('pointerup', onUp);
                            }}>
                            <span className='sr-only'>Resize split</span>
                        </button>
                    );
                })}

                {overlay?.rect ? (
                    <div
                        className={cn(
                            'pointer-events-none absolute z-30',
                            overlay.kind === 'line'
                                ? 'rounded-sm bg-cyan-400 shadow-[0_0_0_1px_hsl(var(--background)),0_0_0_2px_rgb(34_211_238_/_0.9)]'
                                : 'rounded-md border-2 border-cyan-300 bg-cyan-400/15'
                        )}
                        style={{
                            left: overlay.rect.x,
                            top: overlay.rect.y,
                            width: overlay.rect.width,
                            height: overlay.rect.height,
                        }}>
                        <span className='absolute -top-6 left-0 rounded bg-cyan-500/80 px-2 py-0.5 text-[10px] font-semibold uppercase text-slate-950'>
                            {overlay.label}
                        </span>
                    </div>
                ) : null}
            </div>

            <DragOverlay dropAnimation={null}>
                {activeDragPanelId ? (
                    <div className='rounded-md border border-border bg-card px-3 py-1 text-xs shadow-lg'>
                        {panelTitle(dockState, activeDragPanelId)}
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
}
function DockScene() {
    const store = useGraphite<DockBlockState>();
    const commit = useCommit<DockBlockState>();
    const dispatchIntent = useIntent<DockBlockState>();

    const ui = useQuery<DockBlockState, DockBlockState['ui']>((state) => state.ui);
    const dockState = useQuery<DockBlockState, DockState>((state) => state.dock);
    const panelQuery = React.useMemo(
        () => createDockPanelQuery<DockBlockState>({ path: ['dock'] }),
        []
    );
    const panels = useQuery<DockBlockState, DockPanelSummary[]>(panelQuery);

    const [shortcutBindings, setShortcutBindings] = React.useState<
        GraphiteShortcutBinding[]
    >(createDefaultShortcutBindings);

    const [history, setHistory] = React.useState(() => ({
        canUndo: store.canUndo('dock'),
        canRedo: store.canRedo('dock'),
    }));

    const intentRegistry = React.useMemo(() => createIntentRegistry(), []);

    useGraphiteShortcutBindings<DockBlockState>({
        intents: intentRegistry,
        bindings: shortcutBindings,
        enabled: ui.shortcutsEnabled,
        allowInEditable: true,
        contextSelector: (state) => ({
            panelCount: panels.length,
            canUndo: store.canUndo('dock'),
            canRedo: store.canRedo('dock'),
            overlayVisible: state.ui.showOverlay,
            shortcutsEnabled: state.ui.shortcutsEnabled,
        }),
    });

    React.useEffect(() => {
        return store.onCommit((record) => {
            setHistory({
                canUndo: store.canUndo('dock'),
                canRedo: store.canRedo('dock'),
            });

            if (record.intent?.name === UI_INTENTS.undoLayout) {
                store.undo(undefined, 'dock');
                return;
            }

            if (record.intent?.name === UI_INTENTS.redoLayout) {
                store.redo(undefined, 'dock');
            }
        });
    }, [store]);

    const activePanel = React.useMemo(
        () => getActivePanelRef(dockState),
        [dockState]
    );

    return (
        <div className='space-y-3'>
            <GraphiteIntentCommandMenu intents={intentRegistry} enabled />

            <Card>
                <CardHeader className='pb-3'>
                    <CardTitle className='flex items-center justify-between text-base'>
                        <span className='flex items-center gap-2'>
                            <Wrench className='h-4 w-4 text-primary' />
                            Dock Workbench
                        </span>
                        <div className='flex items-center gap-2 text-xs font-normal text-muted-foreground'>
                            <Badge variant='outline'>dnd-kit</Badge>
                            <Badge variant='outline'>graphite intents</Badge>
                            <Badge variant='outline'>dock overlay</Badge>
                        </div>
                    </CardTitle>
                </CardHeader>
                <CardContent className='space-y-3'>
                    <div className='flex flex-wrap items-center gap-2'>
                        <Button
                            size='sm'
                            onClick={() =>
                                dispatchIntent(
                                    DOCK_INTENTS.addPanel,
                                    { title: `Panel ${panels.length + 1}` },
                                    { history: 'dock' }
                                )
                            }>
                            <Plus className='mr-1 h-4 w-4' />
                            Add Panel
                        </Button>

                        <Button
                            size='sm'
                            variant='outline'
                            disabled={!activePanel}
                            onClick={() => {
                                if (!activePanel) return;
                                dispatchIntent(
                                    DOCK_INTENTS.removePanel,
                                    { panelId: activePanel.panelId },
                                    { history: 'dock' }
                                );
                            }}>
                            <X className='mr-1 h-4 w-4' />
                            Remove Active
                        </Button>

                        <Button
                            size='sm'
                            variant='outline'
                            disabled={!history.canUndo}
                            onClick={() => store.undo(undefined, 'dock')}>
                            <Undo2 className='mr-1 h-4 w-4' />
                            Undo
                        </Button>

                        <Button
                            size='sm'
                            variant='outline'
                            disabled={!history.canRedo}
                            onClick={() => store.redo(undefined, 'dock')}>
                            <Redo2 className='mr-1 h-4 w-4' />
                            Redo
                        </Button>

                        <div className='ml-auto flex items-center gap-3 text-xs text-muted-foreground'>
                            <label className='inline-flex items-center gap-2'>
                                <Switch
                                    checked={ui.shortcutsEnabled}
                                    onCheckedChange={(checked) =>
                                        commit(
                                            {
                                                ui: {
                                                    shortcutsEnabled: $set(checked),
                                                },
                                            },
                                            { history: false }
                                        )
                                    }
                                />
                                shortcuts
                            </label>
                            <label className='inline-flex items-center gap-2'>
                                <Switch
                                    checked={ui.showOverlay}
                                    onCheckedChange={(checked) =>
                                        commit(
                                            {
                                                ui: {
                                                    showOverlay: $set(checked),
                                                },
                                            },
                                            { history: false }
                                        )
                                    }
                                />
                                overlay
                            </label>
                            <label className='inline-flex items-center gap-2'>
                                <Switch
                                    checked={ui.showShortcutManager}
                                    onCheckedChange={(checked) =>
                                        commit(
                                            {
                                                ui: {
                                                    showShortcutManager: $set(checked),
                                                },
                                            },
                                            { history: false }
                                        )
                                    }
                                />
                                shortcut manager
                            </label>
                        </div>
                    </div>

                    <div className='grid gap-3 lg:grid-cols-[minmax(0,1fr)_300px]'>
                        <DockCanvas />

                        <div className='space-y-3'>
                            <Card className='bg-muted/20'>
                                <CardHeader className='pb-2'>
                                    <CardTitle className='text-xs uppercase tracking-wide text-muted-foreground'>
                                        Active State
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className='space-y-1 text-xs'>
                                    <div className='flex items-center gap-1'>
                                        <PanelLeft className='h-3.5 w-3.5 text-muted-foreground' />
                                        panels: {panels.length}
                                    </div>
                                    <div className='flex items-center gap-1'>
                                        <PanelBottom className='h-3.5 w-3.5 text-muted-foreground' />
                                        canUndo: {history.canUndo ? 'yes' : 'no'}
                                    </div>
                                    <div>
                                        active: {activePanel?.panelId ?? 'none'}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className='bg-muted/20'>
                                <CardHeader className='pb-2'>
                                    <CardTitle className='text-xs uppercase tracking-wide text-muted-foreground'>
                                        Panels
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ul className='space-y-1 text-xs'>
                                        {panels.map((panel) => (
                                            <li
                                                key={panel.id}
                                                className='rounded border bg-background/70 px-2 py-1'>
                                                <div className='truncate font-medium'>
                                                    {panel.title}
                                                </div>
                                                <div className='truncate text-muted-foreground'>
                                                    {panel.groupId}
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {ui.showShortcutManager ? (
                        <Card className='bg-muted/20'>
                            <CardContent className='pt-4'>
                                <GraphiteShortcutManager
                                    intents={intentRegistry}
                                    bindings={shortcutBindings}
                                    onBindingsChange={setShortcutBindings}
                                    contextFields={SHORTCUT_CONTEXT_FIELDS}
                                />
                            </CardContent>
                        </Card>
                    ) : null}

                    <Card className='bg-muted/20'>
                        <CardContent className='pt-4'>
                            <GraphiteInspector maxRows={12} />
                        </CardContent>
                    </Card>
                </CardContent>
            </Card>
        </div>
    );
}

export default function DockBlockPage() {
    const store = React.useMemo(() => createDockStore(), []);
    return (
        <GraphiteProvider store={store}>
            <DockScene />
        </GraphiteProvider>
    );
}
