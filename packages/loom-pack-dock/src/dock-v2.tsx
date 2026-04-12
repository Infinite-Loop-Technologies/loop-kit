'use client';

import * as React from 'react';

import {
    createCommandBus,
    type OverlaySpec,
} from '@loop-kit/interaction';
import {
    InteractionOverlayHost,
    InteractionProvider,
    ScopedRegion,
    useDispatchAction,
    useInteractionRuntime,
    useRegisterActionHandler,
    useRegisterDragSource,
    useRegisterDropSurface,
    useScopedShortcutMap,
} from '@loop-kit/interaction-react';
import {
    createDockState,
    createDockStore,
    defaultDockPolicy,
    dockActionIds,
    getDockGroupForPanel,
    getDockPanel,
    normalizeDockPolicies,
    resolveDockDrop,
    type DockCommand,
    type DockCommandResult,
    type DockDropZone,
    type DockGroup,
    type DockLayer,
    type DockOpenPanelOptions,
    type DockPanel,
    type DockService,
    type DockSplitChild,
    type DockSplitNode,
    type DockState,
    type DockStore,
} from '@loop-kit/dock';
import {
    Box,
    Button,
    Icon,
    IconButton,
    Inline,
    Panel,
    Stack,
    Text,
    Toolbar,
    useLoomTokens,
} from '@loop-kit/loom-react';

export type DockPanelRendererProps = {
    closePanel: () => DockCommandResult;
    controller: DockStore;
    group: DockGroup;
    isActive: boolean;
    layer: DockLayer;
    openPanel: (input: DockOpenPanelOptions) => DockCommandResult;
    panel: DockPanel;
    state: DockState;
};

export type DockPanelRenderer = React.ComponentType<DockPanelRendererProps>;

export type DockPanelRegistry = {
    fallback?: DockPanelRenderer;
    ids?: Partial<Record<string, DockPanelRenderer>>;
    kinds?: Partial<Record<string, DockPanelRenderer>>;
};

type DockContextValue = {
    onError?: (result: DockCommandResult) => void;
    registry: DockPanelRegistry;
    store: DockService;
};

const DockContext = React.createContext<DockContextValue | null>(null);

type DockDropSurfaceData = {
    groupId: string;
    panelId?: string;
    zone: DockDropZone;
};

type DockTabDragPayload = {
    groupId: string;
    panelId: string;
};

const DROP_SURFACE_PREFIX = 'dock-drop';

function createDropSurfaceId({ groupId, panelId, zone }: DockDropSurfaceData) {
    return `${DROP_SURFACE_PREFIX}:${groupId}:${panelId ?? '_'}:${zone}`;
}

function parseDropSurfaceId(id?: string): DockDropSurfaceData | null {
    if (!id || !id.startsWith(`${DROP_SURFACE_PREFIX}:`)) {
        return null;
    }
    const [, groupId, panelId, zone] = id.split(':');
    if (!groupId || !zone) {
        return null;
    }
    return {
        groupId,
        panelId: panelId && panelId !== '_' ? panelId : undefined,
        zone: zone as DockDropZone,
    };
}

function resolveRenderer(registry: DockPanelRegistry, panel: DockPanel) {
    return registry.ids?.[panel.id] ?? registry.kinds?.[panel.kind] ?? registry.fallback;
}

function runCommand(result: DockCommandResult, onError?: (result: DockCommandResult) => void) {
    if (!result.ok) {
        onError?.(result);
    }
    return result;
}

function clampWeight(value: number, min: number, max: number) {
    return Math.min(Math.max(value, min), max);
}

function normalizeSplitWeights(weights: [number, number]) {
    const left = Number.isFinite(weights[0]) ? Math.max(0.01, weights[0]) : 0.5;
    const right = Number.isFinite(weights[1]) ? Math.max(0.01, weights[1]) : 0.5;
    const sum = left + right;
    return [left / sum, right / sum] as [number, number];
}

function activePanelId(group: DockGroup) {
    return group.activePanelId ?? group.panelIds[0];
}

function isFloatingGroup(group: DockGroup) {
    return group.layout?.placement?.kind === 'floating';
}

function parsePixelLength(value: string | undefined, fallback: number) {
    if (!value) {
        return fallback;
    }
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : fallback;
}

function flowLayerStyle(layer: DockLayer, tokens: ReturnType<typeof useLoomTokens>) {
    return {
        display: 'flex',
        flex: 1,
        flexDirection:
            (layer.flow?.direction === 'vertical' ? 'column' : 'row') as React.CSSProperties['flexDirection'],
        gap: layer.flow?.gap ?? tokens.space[3],
        minHeight: 0,
        minWidth: 0,
        position: 'relative' as const,
    };
}

function overlayLayerStyle(layer: DockLayer) {
    return {
        inset: 0,
        pointerEvents:
            layer.groupIds.length === 0 || layer.overlay?.interaction === 'passthrough'
                ? ('none' as const)
                : ('auto' as const),
        position: 'absolute' as const,
        zIndex: 30,
    };
}

function flowGroupStyle(group: DockGroup) {
    return {
        display: 'flex',
        flexBasis: group.layout?.basis ?? group.layout?.width,
        flexDirection: 'column' as const,
        flexGrow: group.layout?.grow ?? 0,
        flexShrink: 1,
        height: group.layout?.height ?? '100%',
        maxWidth: group.layout?.max,
        minHeight: 0,
        minWidth: group.layout?.min,
        width: group.layout?.width,
    };
}

function overlayGroupStyle(group: DockGroup) {
    const placement = group.layout?.placement;
    if (!placement) {
        return {
            inset: 0,
            position: 'absolute' as const,
        };
    }

    if (placement.kind === 'center') {
        return {
            left: placement.left ?? '50%',
            maxWidth: placement.maxWidth ?? '42rem',
            pointerEvents: 'auto' as const,
            position: 'absolute' as const,
            top: placement.top ?? '4rem',
            transform: placement.transform ?? 'translateX(-50%)',
            width: placement.width ?? 'min(42rem, calc(100vw - 2rem))',
        };
    }

    if (placement.kind === 'edge') {
        const style: React.CSSProperties = {
            pointerEvents: 'auto',
            position: 'absolute',
        };
        if (placement.edge === 'left') {
            style.left = 0;
            style.top = 0;
            style.bottom = 0;
            style.width = placement.width ?? '17rem';
        } else if (placement.edge === 'right') {
            style.right = 0;
            style.top = 0;
            style.bottom = 0;
            style.width = placement.width ?? '24rem';
        } else if (placement.edge === 'top') {
            style.left = 0;
            style.right = 0;
            style.top = 0;
            style.height = placement.height ?? '18rem';
        } else {
            style.left = 0;
            style.right = 0;
            style.bottom = 0;
            style.height = placement.height ?? '18rem';
        }
        return style;
    }

    if (placement.kind === 'inline') {
        return {
            inset: 0,
            position: 'absolute' as const,
        };
    }

    return {
        height: placement.height ?? group.layout?.height,
        left: placement.left ?? '1.5rem',
        pointerEvents: 'auto' as const,
        position: 'absolute' as const,
        top: placement.top ?? '1.5rem',
        width: placement.width ?? group.layout?.width ?? '24rem',
    };
}

function computeSplitWeights(
    direction: DockSplitNode['direction'],
    splitSize: number,
    startPoint: { x: number; y: number },
    weights: DockSplitNode['weights'],
    point: { x: number; y: number },
) {
    const left = Number.isFinite(weights[0]) ? Math.max(0.01, weights[0]) : 0.5;
    const right = Number.isFinite(weights[1]) ? Math.max(0.01, weights[1]) : 0.5;
    const total = left + right;
    const normalized =
        total > 0 ? ([left / total, right / total] as const) : ([0.5, 0.5] as const);
    const deltaPx = direction === 'row' ? point.x - startPoint.x : point.y - startPoint.y;
    const deltaRatio = deltaPx / Math.max(1, splitSize);
    const minWeight = Math.min(0.1, total / 2);
    const nextLeft = clampWeight(normalized[0] + deltaRatio, minWeight, total - minWeight);
    return normalizeSplitWeights([nextLeft, total - nextLeft]);
}

function DockRuntimeBridge() {
    const runtime = useInteractionRuntime<DockCommand, DockCommandResult>();
    const dock = useDock();

    React.useEffect(() => {
        return runtime.registerDragEventListener((event: { kind: 'cancel' | 'end' | 'move' | 'start'; session: { dropSurfaceId?: string; payload: unknown; point: { x: number; y: number } } }) => {
            const payload = event.session.payload as DockTabDragPayload;
            const state = dock.store.getState();
            const dragPanel = getDockPanel(state, payload.panelId);
            const dragGroup = getDockGroupForPanel(state, payload.panelId);
            const dropData = parseDropSurfaceId(event.session.dropSurfaceId);

            if (!dragPanel || !dragGroup) {
                runtime.setOverlay(undefined);
                return;
            }

            if (!dropData) {
                if (event.kind === 'end' || event.kind === 'cancel') {
                    runtime.setOverlay(undefined);
                }
                return;
            }

            const dropGroup = state.groups[dropData.groupId];
            const dropPanel = dropData.panelId ? state.panels[dropData.panelId] : undefined;
            if (!dropGroup) {
                runtime.setOverlay(undefined);
                return;
            }

            const resolution = resolveDockDrop(
                state,
                {
                    group: dragGroup,
                    panel: dragPanel,
                },
                {
                    group: dropGroup,
                    panel: dropPanel,
                    zone: dropData.zone,
                },
                dock.store.policy ?? defaultDockPolicy,
            );

            if (!resolution.ok) {
                runtime.setOverlay(undefined);
                return;
            }

            const overlay = resolution.value.overlay
                ? {
                      ...resolution.value.overlay,
                      position: event.session.point,
                  }
                : undefined;

            if (event.kind === 'end') {
                runCommand(dock.store.dispatch(resolution.value.command), dock.onError);
                runtime.setOverlay(undefined);
                return;
            }

            if (event.kind === 'cancel') {
                runtime.setOverlay(undefined);
                return;
            }

            runtime.setOverlay(overlay);
        });
    }, [dock, runtime]);

    return null;
}

export type DockProviderProps = {
    children: React.ReactNode;
    initialState: DockState;
    onError?: (result: DockCommandResult) => void;
    onStateChange?: (state: DockState) => void;
    registry?: DockPanelRegistry;
    store?: DockStore;
};

export function DockProvider({
    children,
    initialState,
    onError,
    onStateChange,
    registry,
    store,
}: DockProviderProps) {
    const dockStore = React.useMemo(
        () => store ?? createDockStore(createDockState(initialState)),
        [initialState, store],
    );

    React.useEffect(() => {
        if (!onStateChange) {
            return;
        }
        return dockStore.subscribe(() => {
            onStateChange(dockStore.getState());
        });
    }, [dockStore, onStateChange]);

    const commandBus = React.useMemo(
        () => createCommandBus<DockCommand, DockCommandResult>((command: DockCommand) => dockStore.dispatch(command)),
        [dockStore],
    );

    const value = React.useMemo<DockContextValue>(
        () => ({
            onError,
            registry: registry ?? {},
            store: dockStore,
        }),
        [dockStore, onError, registry],
    );

    return (
        <InteractionProvider commandBus={commandBus}>
            <DockContext.Provider value={value}>
                <DockRuntimeBridge />
                {children}
            </DockContext.Provider>
        </InteractionProvider>
    );
}

export function useDock() {
    const value = React.useContext(DockContext);
    if (!value) {
        throw new Error('DockProvider is required before using dock renderer components.');
    }
    return value;
}

export function useDockStore() {
    return useDock().store;
}

export function useDockSelector<TSelected>(selector: (state: DockState) => TSelected) {
    const store = useDockStore();
    return React.useSyncExternalStore(
        store.subscribe,
        () => selector(store.getState()),
        () => selector(store.getState()),
    );
}

export function usePanelControls(panelId?: string) {
    const store = useDockStore();
    const { onError } = useDock();
    const action = useDispatchAction();
    return React.useMemo(
        () => ({
            close() {
                if (!panelId) {
                    return;
                }
                runCommand(store.closePanel(panelId), onError);
            },
            focus() {
                if (!panelId) {
                    return;
                }
                action(dockActionIds.focusPanel, { panelId });
            },
            split(direction: 'col' | 'row') {
                if (!panelId) {
                    return;
                }
                action(dockActionIds.splitPanel, {
                    direction,
                    panelId,
                });
            },
        }),
        [action, onError, panelId, store],
    );
}

function DockHeaderDragHandle({
    group,
    panel,
    children,
}: {
    children: React.ReactNode;
    group: DockGroup;
    panel?: DockPanel;
}) {
    const drag = useRegisterDragSource<DockTabDragPayload>({
        createOverlay: ({ payload }: { payload: DockTabDragPayload }) => ({
            id: `dock-drag-${payload.panelId}`,
            label: panel?.title ?? payload.panelId,
            mode: 'ghost',
            position: { x: 0, y: 0 },
        }),
        getPayload: () => ({
            groupId: group.id,
            panelId: panel?.id ?? activePanelId(group) ?? '',
        }),
        type: 'dock-panel',
    });

    return (
        <div {...drag} style={{ display: 'contents' }}>
            {children}
        </div>
    );
}

function DockGroupHeader({
    group,
    layer,
    panel,
}: {
    group: DockGroup;
    layer: DockLayer;
    panel: DockPanel | undefined;
}) {
    const controller = useDockStore();
    const { onError } = useDock();
    const policies = normalizeDockPolicies(group.policies);
    const canClose = policies.closeable && panel?.closeable !== false;
    const startFloatingMove = React.useCallback(
        (event: React.PointerEvent<HTMLButtonElement>) => {
            if (event.button !== 0 || !isFloatingGroup(group)) {
                return;
            }

            event.preventDefault();
            event.stopPropagation();

            const placement = group.layout?.placement;
            if (!placement || placement.kind !== 'floating') {
                return;
            }

            const startPoint = { x: event.clientX, y: event.clientY };
            const startLeft = parsePixelLength(placement.left, 24);
            const startTop = parsePixelLength(placement.top, 24);
            let frame = 0;
            let nextPoint = startPoint;

            const commitMove = () => {
                frame = 0;
                controller.resizeGroup(
                    {
                        groupId: group.id,
                        layout: {
                            placement: {
                                ...placement,
                                left: `${Math.round(startLeft + (nextPoint.x - startPoint.x))}px`,
                                top: `${Math.round(startTop + (nextPoint.y - startPoint.y))}px`,
                            },
                        },
                    },
                    { history: false },
                );
            };

            const onMove = (moveEvent: PointerEvent) => {
                nextPoint = { x: moveEvent.clientX, y: moveEvent.clientY };
                if (frame) {
                    return;
                }
                frame = window.requestAnimationFrame(commitMove);
            };

            const clear = () => {
                if (frame) {
                    window.cancelAnimationFrame(frame);
                    frame = 0;
                }
                document.removeEventListener('pointermove', onMove);
                document.removeEventListener('pointerup', clear);
                document.removeEventListener('pointercancel', clear);
            };

            document.addEventListener('pointermove', onMove);
            document.addEventListener('pointerup', clear);
            document.addEventListener('pointercancel', clear);
        },
        [controller, group],
    );

    return (
        <DockHeaderDragHandle group={group} panel={panel}>
            <Toolbar
                density='compact'
                emphasis='subtle'
                style={{
                    borderBottomLeftRadius: 0,
                    borderBottomRightRadius: 0,
                    borderLeft: 'none',
                    borderRight: 'none',
                    borderTop: 'none',
                }}>
                <Inline align='center' gap='2' style={{ minWidth: 0 }}>
                    <Text
                        emphasis='strong'
                        size='sm'
                        style={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                        }}>
                        {group.title ?? panel?.title ?? 'Panel'}
                    </Text>
                    {group.mode !== 'single' ? (
                        <Text size='sm' tone='muted'>
                            {group.mode}
                        </Text>
                    ) : null}
                </Inline>
                <Inline align='center' gap='1' justify='flex-end' style={{ marginLeft: 'auto' }}>
                    {layer.kind === 'floating' && isFloatingGroup(group) ? (
                        <Button kind='ghost' onPointerDown={startFloatingMove} size='sm' type='button'>
                            Move
                        </Button>
                    ) : null}
                    {policies.splittable ? <Icon name='panelRight' size='sm' tone='muted' /> : null}
                    {canClose ? (
                        <IconButton
                            data-dock-close-group={group.id}
                            kind='ghost'
                            label={`Close ${group.title ?? panel?.title ?? 'panel'}`}
                            name='close'
                            onClick={() => {
                                runCommand(controller.closeGroup(group.id), onError);
                            }}
                            size='sm'
                        />
                    ) : null}
                </Inline>
            </Toolbar>
        </DockHeaderDragHandle>
    );
}

function DockTabButton({ group, panel, selected }: { group: DockGroup; panel: DockPanel; selected: boolean }) {
    const controller = useDockStore();
    const { onError } = useDock();
    const drag = useRegisterDragSource<DockTabDragPayload>({
        createOverlay: () => ({
            id: `dock-drag-${panel.id}`,
            label: panel.title,
            mode: 'ghost',
            position: { x: 0, y: 0 },
        }),
        getPayload: () => ({
            groupId: group.id,
            panelId: panel.id,
        }),
        type: 'dock-panel',
    });

    return (
        <Button
            {...drag}
            aria-selected={selected}
            kind={selected ? 'soft' : 'ghost'}
            onClick={() => {
                runCommand(controller.focusPanel(panel.id, { history: false }), onError);
            }}
            size='sm'
            tone={selected ? 'neutral' : 'muted'}>
            {panel.title}
        </Button>
    );
}

function DockTabsRow({ group }: { group: DockGroup }) {
    const state = useDockSelector((current) => current);
    const currentPanelId = activePanelId(group);

    return (
        <Inline
            align='center'
            gap='1'
            style={{
                borderBottom: '1px solid var(--loom-color-border-default)',
                padding: '0.5rem 0.75rem',
            }}>
            {group.panelIds.map((panelId) => {
                const panel = state.panels[panelId];
                if (!panel) {
                    return null;
                }
                return <DockTabButton key={panelId} group={group} panel={panel} selected={currentPanelId === panelId} />;
            })}
        </Inline>
    );
}

function DockDropSurface({
    group,
    panel,
    zone,
}: {
    group: DockGroup;
    panel?: DockPanel;
    zone: DockDropZone;
}) {
    const { ref } = useRegisterDropSurface({
        accepts: ['dock-panel'],
        id: createDropSurfaceId({
            groupId: group.id,
            panelId: panel?.id,
            zone,
        }),
        metadata: {
            groupId: group.id,
            panelId: panel?.id,
            zone,
        },
        zIndex: zone === 'center' || zone === 'tab' ? 1 : 2,
    });

    const style: React.CSSProperties =
        zone === 'center' || zone === 'tab'
            ? { inset: '18%', position: 'absolute' }
            : zone === 'left'
              ? { bottom: 0, left: 0, position: 'absolute', top: 0, width: '18%' }
              : zone === 'right'
                ? { bottom: 0, position: 'absolute', right: 0, top: 0, width: '18%' }
                : zone === 'top'
                  ? { height: '18%', left: 0, position: 'absolute', right: 0, top: 0 }
                  : { bottom: 0, height: '18%', left: 0, position: 'absolute', right: 0 };

    return <div ref={ref} style={{ ...style, pointerEvents: 'none' }} />;
}

function DockPanelDropSurfaces({ group, panel }: { group: DockGroup; panel: DockPanel }) {
    const policies = normalizeDockPolicies(group.policies);
    return (
        <>
            <DockDropSurface group={group} panel={panel} zone='center' />
            {policies.splittable ? (
                <>
                    <DockDropSurface group={group} panel={panel} zone='left' />
                    <DockDropSurface group={group} panel={panel} zone='right' />
                    <DockDropSurface group={group} panel={panel} zone='top' />
                    <DockDropSurface group={group} panel={panel} zone='bottom' />
                </>
            ) : null}
        </>
    );
}

function DockPanelView({
    group,
    isActive = true,
    layer,
    panel,
}: {
    group: DockGroup;
    isActive?: boolean;
    layer: DockLayer;
    panel: DockPanel;
}) {
    const { onError, registry } = useDock();
    const controller = useDockStore();
    const state = useDockSelector((current) => current);
    const renderer = resolveRenderer(registry, panel);

    if (!renderer) {
        return (
            <Stack gap='3'>
                <Text emphasis='strong'>{panel.title}</Text>
                <Text tone='muted'>No renderer is registered for panel kind "{panel.kind}".</Text>
            </Stack>
        );
    }

    return (
        <ScopedRegion
            capabilities={{ blocksGlobalShortcuts: layer.overlay?.interaction === 'modal' }}
            scopeId={`dock-panel-${panel.id}`}
            scopeKind='dock-panel'
            style={{ display: 'flex', flex: 1, minHeight: 0, minWidth: 0, position: 'relative' }}>
            <DockPanelDropSurfaces group={group} panel={panel} />
            {React.createElement(renderer, {
                closePanel: () => runCommand(controller.closePanel(panel.id), onError),
                controller,
                group,
                isActive,
                layer,
                openPanel: (input) => runCommand(controller.openPanel(input), onError),
                panel,
                state,
            })}
        </ScopedRegion>
    );
}

function DockSplitResizeHandle({
    containerRef,
    groupId,
    node,
}: {
    containerRef: React.RefObject<HTMLDivElement | null>;
    groupId: DockGroup['id'];
    node: DockSplitNode;
}) {
    const controller = useDockStore();
    const [active, setActive] = React.useState(false);

    const onPointerDown = React.useCallback(
        (event: React.PointerEvent<HTMLButtonElement>) => {
            if (event.button !== 0) {
                return;
            }
            const rect = containerRef.current?.getBoundingClientRect();
            if (!rect) {
                return;
            }

            setActive(true);
            const pointerId = event.pointerId;
            const startPoint = { x: event.clientX, y: event.clientY };
            const splitSize = node.direction === 'row' ? Math.max(1, rect.width) : Math.max(1, rect.height);

            const onMove = (moveEvent: PointerEvent) => {
                if (moveEvent.pointerId !== pointerId) {
                    return;
                }
                controller.resizeSplit(
                    {
                        groupId,
                        splitId: node.id,
                        weights: computeSplitWeights(
                            node.direction,
                            splitSize,
                            startPoint,
                            node.weights,
                            {
                                x: moveEvent.clientX,
                                y: moveEvent.clientY,
                            },
                        ),
                    },
                    { history: false },
                );
            };

            const clear = () => {
                setActive(false);
                document.removeEventListener('pointermove', onMove);
                document.removeEventListener('pointerup', onUp);
                document.removeEventListener('pointercancel', onCancel);
            };

            const onUp = () => clear();
            const onCancel = () => clear();

            document.addEventListener('pointermove', onMove);
            document.addEventListener('pointerup', onUp);
            document.addEventListener('pointercancel', onCancel);
        },
        [containerRef, controller, groupId, node.direction, node.id, node.weights],
    );

    const vertical = node.direction === 'row';

    return (
        <Box
            style={{
                alignItems: 'stretch',
                cursor: vertical ? 'col-resize' : 'row-resize',
                display: 'flex',
                flex: '0 0 0.5rem',
                justifyContent: 'center',
                minHeight: vertical ? '100%' : '0.5rem',
                minWidth: vertical ? '0.5rem' : '100%',
                position: 'relative',
            }}>
            <button
                aria-label='Resize split'
                data-dock-split-handle={node.id}
                onPointerDown={onPointerDown}
                style={{
                    alignItems: 'center',
                    background: 'transparent',
                    border: 'none',
                    cursor: vertical ? 'col-resize' : 'row-resize',
                    display: 'flex',
                    flex: 1,
                    justifyContent: 'center',
                    padding: 0,
                    width: '100%',
                }}
                type='button'>
                <Box
                    aria-hidden
                    style={{
                        background: active ? 'var(--loom-color-accent-default)' : 'var(--loom-color-border-strong)',
                        borderRadius: '999px',
                        height: vertical ? '2.5rem' : '2px',
                        transition: 'background 140ms ease',
                        width: vertical ? '2px' : '2.5rem',
                    }}
                />
            </button>
        </Box>
    );
}

function DockSplitNodeView({ child, group, layer }: { child: DockSplitChild; group: DockGroup; layer: DockLayer }) {
    const state = useDockSelector((current) => current);

    if (child.kind === 'panel') {
        const panel = state.panels[child.panelId];
        if (!panel) {
            return null;
        }
        return (
            <Panel density='compact' emphasis='subtle' style={{ display: 'flex', flex: 1, flexDirection: 'column', minHeight: 0 }}>
                <DockPanelView group={group} layer={layer} panel={panel} />
            </Panel>
        );
    }

    const node = group.splitNodes?.[child.splitId];
    if (!node) {
        return null;
    }
    return <DockSplitView group={group} layer={layer} node={node} />;
}

function DockSplitView({ group, layer, node }: { group: DockGroup; layer: DockLayer; node: DockSplitNode }) {
    const containerRef = React.useRef<HTMLDivElement | null>(null);

    return (
        <div
            ref={containerRef}
            style={{
                display: 'flex',
                flex: 1,
                flexDirection: node.direction === 'col' ? 'column' : 'row',
                minHeight: 0,
                minWidth: 0,
            }}>
            {node.children.map((child, index) => {
                const key = child.kind === 'panel' ? child.panelId : child.splitId;
                return (
                    <React.Fragment key={key}>
                        <Box style={{ display: 'flex', flex: node.weights[index] ?? 1, minHeight: 0, minWidth: 0, overflow: 'hidden' }}>
                            <DockSplitNodeView child={child} group={group} layer={layer} />
                        </Box>
                        {index < node.children.length - 1 ? (
                            <DockSplitResizeHandle containerRef={containerRef} groupId={group.id} node={node} />
                        ) : null}
                    </React.Fragment>
                );
            })}
        </div>
    );
}

function DockGroupView({ group, layer }: { group: DockGroup; layer: DockLayer }) {
    const state = useDockSelector((current) => current);
    const currentPanel = state.panels[activePanelId(group) ?? ''];
    const showTitlebar = group.chrome?.titlebarMode !== 'none' && group.chrome?.showTitlebar !== false;
    const showTabs = group.mode === 'tabs' && group.chrome?.showTabs !== false && group.panelIds.length > 1;
    const framed = group.chrome?.framed !== false;
    const { ref: groupDropRef } = useRegisterDropSurface({
        accepts: ['dock-panel'],
        id: createDropSurfaceId({ groupId: group.id, zone: 'tab' }),
        metadata: { groupId: group.id, zone: 'tab' },
    });

    const body = (
        <>
            {showTitlebar ? <DockGroupHeader group={group} layer={layer} panel={currentPanel} /> : null}
            {showTabs ? <DockTabsRow group={group} /> : null}
            <Box style={{ display: 'flex', flex: 1, minHeight: 0, minWidth: 0, overflow: 'hidden', padding: framed ? '0.75rem' : '0' }}>
                {group.mode === 'split' && group.splitRootId && group.splitNodes?.[group.splitRootId] ? (
                    <DockSplitView group={group} layer={layer} node={group.splitNodes[group.splitRootId]} />
                ) : group.mode === 'stack' ? (
                    <Stack gap='3' style={{ flex: 1, minHeight: 0, minWidth: 0, overflow: 'auto' }}>
                        {group.panelIds.map((panelId) => {
                            const stackedPanel = state.panels[panelId];
                            if (!stackedPanel) {
                                return null;
                            }
                            return (
                                <Panel
                                    data-dock-stack-panel={stackedPanel.id}
                                    density='compact'
                                    emphasis={stackedPanel.id === currentPanel?.id ? 'strong' : 'subtle'}
                                    key={stackedPanel.id}
                                    style={{ display: 'flex', flexDirection: 'column', minHeight: '14rem' }}>
                                    <DockPanelView
                                        group={group}
                                        isActive={stackedPanel.id === currentPanel?.id}
                                        layer={layer}
                                        panel={stackedPanel}
                                    />
                                </Panel>
                            );
                        })}
                    </Stack>
                ) : currentPanel ? (
                    <DockPanelView group={group} layer={layer} panel={currentPanel} />
                ) : (
                    <Text tone='muted'>No active panel.</Text>
                )}
            </Box>
        </>
    );

    const content = (
        <ScopedRegion
            capabilities={{ blocksGlobalShortcuts: layer.overlay?.interaction === 'modal' }}
            metadata={{ groupId: group.id, layerId: layer.id }}
            scopeId={`dock-group-${group.id}`}
            scopeKind='dock-group'
            style={{ display: 'flex', flex: 1, flexDirection: 'column', minHeight: 0, minWidth: 0, overflow: 'hidden', position: 'relative' }}>
            <div ref={groupDropRef} style={{ inset: 0, pointerEvents: 'none', position: 'absolute' }} />
            {body}
        </ScopedRegion>
    );

    if (!framed) {
        return (
            <Box
                data-dock-group-closeable={String(normalizeDockPolicies(group.policies).closeable)}
                data-dock-group={group.id}
                data-dock-group-mode={group.mode}
                data-dock-group-splittable={String(normalizeDockPolicies(group.policies).splittable)}
                style={{ display: 'flex', flex: 1, flexDirection: 'column', minHeight: 0, minWidth: 0, overflow: 'hidden' }}>
                {content}
            </Box>
        );
    }

    return (
        <Panel
            data-dock-group-closeable={String(normalizeDockPolicies(group.policies).closeable)}
            data-dock-group={group.id}
            data-dock-group-mode={group.mode}
            data-dock-group-splittable={String(normalizeDockPolicies(group.policies).splittable)}
            density='compact'
            emphasis='strong'
            style={{ display: 'flex', flex: 1, flexDirection: 'column', minHeight: 0, minWidth: 0, overflow: 'hidden' }}>
            {content}
        </Panel>
    );
}

function DockLayerShortcuts({ layer }: { layer: DockLayer }) {
    const enabled = layer.kind === 'overlay' && layer.overlay?.interaction === 'modal' && layer.groupIds.length > 0;
    useScopedShortcutMap(
        enabled
            ? [
                  {
                      actionId: dockActionIds.dismissLayer,
                      gesture: 'Escape',
                  },
              ]
            : [],
    );
    useRegisterActionHandler<DockCommand, DockCommandResult>(dockActionIds.dismissLayer, () => ({
        command: {
            input: {
                layerId: layer.id,
            },
            type: 'dock.dismiss-layer',
        },
        handled: true,
    }));
    return null;
}

function DockLayerView({ layer }: { layer: DockLayer }) {
    const { onError } = useDock();
    const controller = useDockStore();
    const state = useDockSelector((current) => current);
    const tokens = useLoomTokens();
    const isFlow = layer.kind === 'flow';

    return (
        <ScopedRegion
            capabilities={{ blocksGlobalShortcuts: layer.overlay?.interaction === 'modal' }}
            metadata={{ layerId: layer.id, layerKind: layer.kind }}
            scopeId={`dock-layer-${layer.id}`}
            scopeKind='dock-layer'
            style={isFlow ? flowLayerStyle(layer, tokens) : overlayLayerStyle(layer)}>
            <DockLayerShortcuts layer={layer} />
            {!isFlow && layer.overlay?.interaction === 'modal' && layer.groupIds.length > 0 ? (
                <Box
                    data-dock-layer-backdrop={layer.id}
                    onClick={() => {
                        runCommand(controller.dismissLayer({ layerId: layer.id }), onError);
                    }}
                    style={{
                        backdropFilter: 'blur(10px)',
                        background: 'rgba(8, 10, 14, 0.42)',
                        inset: 0,
                        position: 'absolute',
                    }}
                />
            ) : null}
            {layer.groupIds.map((groupId) => {
                const group = state.groups[groupId];
                if (!group) {
                    return null;
                }
                return (
                    <Box
                        data-dock-layer={layer.id}
                        key={group.id}
                        style={isFlow ? flowGroupStyle(group) : overlayGroupStyle(group)}>
                        <DockGroupView group={group} layer={layer} />
                    </Box>
                );
            })}
        </ScopedRegion>
    );
}

export function DockStage({ className, style }: { className?: string; style?: React.CSSProperties }) {
    const state = useDockSelector((current) => current);
    const tokens = useLoomTokens();
    const flowLayers = state.layerOrder
        .map((layerId) => state.layers[layerId])
        .filter((layer): layer is DockLayer => layer != null && layer.kind === 'flow');
    const floatingLayers = state.layerOrder
        .map((layerId) => state.layers[layerId])
        .filter((layer): layer is DockLayer => layer != null && layer.kind !== 'flow');

    return (
        <ScopedRegion className={className} scopeId='dock-stage' scopeKind='dock-stage' style={{ display: 'contents' }}>
            <Box
                className={className}
                style={{
                    background: tokens.color.surface.sunken,
                    color: tokens.color.text.default,
                    display: 'flex',
                    minHeight: '100vh',
                    minWidth: 0,
                    overflow: 'hidden',
                    position: 'relative',
                    ...style,
                }}>
                <Stack style={{ flex: 1, minHeight: 0, minWidth: 0 }}>
                    {flowLayers.map((layer: DockLayer) => (
                        <DockLayerView key={layer.id} layer={layer} />
                    ))}
                </Stack>
                {floatingLayers.map((layer: DockLayer) => (
                    <DockLayerView key={layer.id} layer={layer} />
                ))}
                <InteractionOverlayHost
                    renderOverlay={(overlay: OverlaySpec) => (
                        <div
                            style={{
                                background: 'rgba(8, 12, 18, 0.92)',
                                border: '1px solid rgba(255, 255, 255, 0.12)',
                                borderRadius: '12px',
                                boxShadow: '0 24px 50px rgba(0, 0, 0, 0.36)',
                                color: 'white',
                                fontSize: '0.875rem',
                                minWidth: '12rem',
                                padding: '0.625rem 0.875rem',
                            }}>
                            {overlay.label ?? 'Dragging'}
                        </div>
                    )}
                />
            </Box>
        </ScopedRegion>
    );
}
