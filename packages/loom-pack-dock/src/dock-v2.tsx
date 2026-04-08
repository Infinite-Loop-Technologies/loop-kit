'use client';

import * as React from 'react';

import {
    createDockState,
    createDockStore,
    normalizeDockPolicies,
    type DockAttachPanelOptions,
    type DockCommandResult,
    type DockController,
    type DockDismissLayerOptions,
    type DockEnsurePanelOptions,
    type DockGroup,
    type DockLayer,
    type DockOpenPanelOptions,
    type DockPanel,
    type DockResizeGroupOptions,
    type DockResizeSplitOptions,
    type DockSetGroupModeOptions,
    type DockSplitChild,
    type DockSplitNode,
    type DockSplitPanelOptions,
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
import {
    InteractionProvider,
    createFrameQueue,
    useKeyboardScope,
    usePointerRecognizer,
} from '@loop-kit/loom-interactions';

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
    store: DockStore;
};

const DockContext = React.createContext<DockContextValue | null>(null);

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

    const value = React.useMemo<DockContextValue>(
        () => ({
            onError,
            registry: registry ?? {},
            store: dockStore,
        }),
        [dockStore, onError, registry],
    );

    return (
        <InteractionProvider>
            <DockContext.Provider value={value}>{children}</DockContext.Provider>
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

function activePanelId(group: DockGroup) {
    return group.activePanelId ?? group.panelIds[0];
}

function resolveRenderer(
    registry: DockPanelRegistry,
    panel: DockPanel,
) {
    return registry.ids?.[panel.id] ?? registry.kinds?.[panel.kind] ?? registry.fallback;
}

function runAction(
    result: DockCommandResult,
    onError?: (result: DockCommandResult) => void,
) {
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
    const deltaPx =
        direction === 'row'
            ? point.x - startPoint.x
            : point.y - startPoint.y;
    const deltaRatio = deltaPx / Math.max(1, splitSize);
    const minWeight = Math.min(0.1, total / 2);
    const nextLeft = clampWeight(normalized[0] + deltaRatio, minWeight, total - minWeight);
    return normalizeSplitWeights([nextLeft, total - nextLeft]);
}

function flowLayerStyle(layer: DockLayer, tokens: ReturnType<typeof useLoomTokens>) {
    return {
        display: 'flex',
        flex: 1,
        flexDirection:
            (layer.flow?.direction === 'vertical'
                ? 'column'
                : 'row') as React.CSSProperties['flexDirection'],
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

    if (placement.kind !== 'floating') {
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

function panelTitle(group: DockGroup, panel: DockPanel | undefined) {
    return group.title ?? panel?.title ?? 'Panel';
}

function panelCanClose(
    group: DockGroup,
    panel: DockPanel | undefined,
) {
    const policies = normalizeDockPolicies(group.policies);
    return policies.closeable && panel?.closeable !== false;
}

function DockGroupHeader({
    group,
    panel,
}: {
    group: DockGroup;
    panel: DockPanel | undefined;
}) {
    const controller = useDockStore();
    const { onError } = useDock();
    const policies = normalizeDockPolicies(group.policies);
    const canClose = panelCanClose(group, panel);

    return (
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
            <Inline
                align='center'
                gap='2'
                style={{
                    minWidth: 0,
                }}>
                <Text
                    emphasis='strong'
                    size='sm'
                    style={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                    }}>
                    {panelTitle(group, panel)}
                </Text>
            </Inline>
            <Inline
                align='center'
                gap='1'
                justify='flex-end'
                style={{
                    marginLeft: 'auto',
                }}>
                {policies.splittable ? (
                    <Icon
                        name='panelRight'
                        size='sm'
                        tone='muted'
                    />
                ) : null}
                {canClose ? (
                    <IconButton
                        data-dock-close-group={group.id}
                        kind='ghost'
                        label={`Close ${panelTitle(group, panel)}`}
                        name='close'
                        onClick={() => {
                            runAction(controller.closeGroup(group.id), onError);
                        }}
                        size='sm'
                    />
                ) : null}
            </Inline>
        </Toolbar>
    );
}

function DockTabsRow({ group }: { group: DockGroup }) {
    const controller = useDockStore();
    const { onError } = useDock();
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
                const selected = currentPanelId === panelId;
                return (
                    <Button
                        key={panelId}
                        aria-selected={selected}
                        kind={selected ? 'soft' : 'ghost'}
                        onClick={() => {
                            runAction(controller.focusPanel(panelId, { history: false }), onError);
                        }}
                        size='sm'
                        tone={selected ? 'neutral' : 'muted'}>
                        {panel?.title ?? panelId}
                    </Button>
                );
            })}
        </Inline>
    );
}

type SplitResizePayload = {
    groupId: DockGroup['id'];
    splitId: DockSplitNode['id'];
    weights: DockSplitNode['weights'];
};

type SplitResizeSession = {
    direction: DockSplitNode['direction'];
    groupId: DockGroup['id'];
    splitId: DockSplitNode['id'];
    splitSize: number;
    startPoint: {
        x: number;
        y: number;
    };
    weights: DockSplitNode['weights'];
};

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
    const frameQueue = React.useMemo(
        () =>
            createFrameQueue<SplitResizePayload>((payload) => {
                controller.resizeSplit(payload);
            }),
        [controller],
    );

    React.useEffect(() => () => frameQueue.clear(), [frameQueue]);

    const recognizer = usePointerRecognizer<SplitResizePayload, SplitResizeSession>({
        createSession: (event) => {
            const rect = containerRef.current?.getBoundingClientRect();
            if (!rect) {
                return null;
            }

            setActive(true);
            return {
                direction: node.direction,
                groupId,
                splitId: node.id,
                splitSize: node.direction === 'row' ? Math.max(1, rect.width) : Math.max(1, rect.height),
                startPoint: {
                    x: event.clientX,
                    y: event.clientY,
                },
                weights: node.weights,
            };
        },
        onMove: (session, event) => ({
            groupId: session.groupId,
            splitId: session.splitId,
            weights: computeSplitWeights(
                session.direction,
                session.splitSize,
                session.startPoint,
                session.weights,
                {
                    x: event.clientX,
                    y: event.clientY,
                },
            ),
        }),
        onEnd: (session, event) => {
            setActive(false);
            return {
                groupId: session.groupId,
                splitId: session.splitId,
                weights: computeSplitWeights(
                    session.direction,
                    session.splitSize,
                    session.startPoint,
                    session.weights,
                    {
                        x: event.clientX,
                        y: event.clientY,
                    },
                ),
            };
        },
        onCancel: () => {
            setActive(false);
        },
        dispatch: (payload) => {
            controller.resizeSplit(payload);
        },
        dispatchFrame: (payload) => {
            frameQueue.queue(payload);
        },
        flushFrame: () => {
            frameQueue.flush();
        },
    });

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
                onPointerDown={recognizer.onPointerDown}
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
                        background: active
                            ? 'var(--loom-color-accent-default)'
                            : 'var(--loom-color-border-strong)',
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

function DockSplitNodeView({
    child,
    group,
    layer,
}: {
    child: DockSplitChild;
    group: DockGroup;
    layer: DockLayer;
}) {
    const state = useDockSelector((current) => current);

    if (child.kind === 'panel') {
        const panel = state.panels[child.panelId];
        if (!panel) {
            return null;
        }
        return (
            <Panel
                density='compact'
                emphasis='subtle'
                style={{
                    display: 'flex',
                    flex: 1,
                    flexDirection: 'column',
                    minHeight: 0,
                }}>
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

function DockSplitView({
    group,
    layer,
    node,
}: {
    group: DockGroup;
    layer: DockLayer;
    node: DockSplitNode;
}) {
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
                        <Box
                            style={{
                                display: 'flex',
                                flex: node.weights[index] ?? 1,
                                minHeight: 0,
                                minWidth: 0,
                                overflow: 'hidden',
                            }}>
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

export function DockPanelView({
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
                <Text tone='muted'>
                    No renderer is registered for panel kind "{panel.kind}".
                </Text>
            </Stack>
        );
    }

    return React.createElement(renderer, {
        closePanel: () => runAction(controller.closePanel(panel.id), onError),
        controller,
        group,
        isActive,
        layer,
        openPanel: (input) => runAction(controller.openPanel(input), onError),
        panel,
        state,
    });
}

export function DockGroupView({
    group,
    layer,
}: {
    group: DockGroup;
    layer: DockLayer;
}) {
    const state = useDockSelector((current) => current);
    const currentPanel = state.panels[activePanelId(group) ?? ''];
    const showTitlebar =
        group.chrome?.titlebarMode !== 'none' && group.chrome?.showTitlebar !== false;
    const showTabs = group.chrome?.showTabs !== false && group.panelIds.length > 1;
    const framed = group.chrome?.framed !== false;

    const body = (
        <>
            {showTitlebar ? <DockGroupHeader group={group} panel={currentPanel} /> : null}
            {showTabs ? <DockTabsRow group={group} /> : null}
            <Box
                style={{
                    display: 'flex',
                    flex: 1,
                    minHeight: 0,
                    minWidth: 0,
                    overflow: 'hidden',
                    padding: framed ? '0.75rem' : '0',
                }}>
                {group.mode === 'split' && group.splitRootId && group.splitNodes?.[group.splitRootId] ? (
                    <DockSplitView
                        group={group}
                        layer={layer}
                        node={group.splitNodes[group.splitRootId]}
                    />
                ) : currentPanel ? (
                    <DockPanelView group={group} layer={layer} panel={currentPanel} />
                ) : (
                    <Text tone='muted'>No active panel.</Text>
                )}
            </Box>
        </>
    );

    if (!framed) {
        return (
            <Box
                data-dock-group={group.id}
                data-dock-group-closeable={panelCanClose(group, currentPanel)}
                data-dock-group-mode={group.mode}
                data-dock-group-splittable={normalizeDockPolicies(group.policies).splittable}
                style={{
                    display: 'flex',
                    flex: 1,
                    flexDirection: 'column',
                    minHeight: 0,
                    minWidth: 0,
                    overflow: 'hidden',
                }}>
                {body}
            </Box>
        );
    }

    return (
        <Panel
            data-dock-group={group.id}
            data-dock-group-closeable={panelCanClose(group, currentPanel)}
            data-dock-group-mode={group.mode}
            data-dock-group-splittable={normalizeDockPolicies(group.policies).splittable}
            density='compact'
            emphasis='strong'
            style={{
                display: 'flex',
                flex: 1,
                flexDirection: 'column',
                minHeight: 0,
                minWidth: 0,
                overflow: 'hidden',
            }}>
            {body}
        </Panel>
    );
}

export function DockLayerView({ layer }: { layer: DockLayer }) {
    const { onError } = useDock();
    const controller = useDockStore();
    const state = useDockSelector((current) => current);
    const tokens = useLoomTokens();
    const isFlow = layer.kind === 'flow';
    const keyboardActive =
        layer.kind === 'overlay' &&
        layer.overlay?.interaction === 'modal' &&
        layer.groupIds.length > 0;

    useKeyboardScope(
        `dock-layer-${layer.id}`,
        (event) => {
            if (!keyboardActive || event.key !== 'Escape') {
                return false;
            }
            event.preventDefault();
            runAction(controller.dismissLayer({ layerId: layer.id }), onError);
            return true;
        },
        keyboardActive,
    );

    return (
        <Box
            data-dock-layer={layer.id}
            style={isFlow ? flowLayerStyle(layer, tokens) : overlayLayerStyle(layer)}>
            {!isFlow && layer.overlay?.interaction === 'modal' && layer.groupIds.length > 0 ? (
                <Box
                    data-dock-layer-backdrop={layer.id}
                    onClick={() => {
                        runAction(controller.dismissLayer({ layerId: layer.id }), onError);
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
                        key={group.id}
                        style={
                            isFlow
                                ? flowGroupStyle(group)
                                : overlayGroupStyle(group)
                        }>
                        <DockGroupView group={group} layer={layer} />
                    </Box>
                );
            })}
        </Box>
    );
}

export function DockStage({
    className,
    style,
}: {
    className?: string;
    style?: React.CSSProperties;
}) {
    const state = useDockSelector((current) => current);
    const tokens = useLoomTokens();
    const flowLayers = state.layerOrder
        .map((layerId: string) => state.layers[layerId])
        .filter((layer: DockLayer | undefined): layer is DockLayer => layer != null && layer.kind === 'flow');
    const floatingLayers = state.layerOrder
        .map((layerId: string) => state.layers[layerId])
        .filter((layer: DockLayer | undefined): layer is DockLayer => layer != null && layer.kind !== 'flow');

    return (
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
            <Stack
                style={{
                    flex: 1,
                    minHeight: 0,
                    minWidth: 0,
                }}>
                {flowLayers.map((layer: DockLayer) => (
                    <DockLayerView key={layer.id} layer={layer} />
                ))}
            </Stack>
            {floatingLayers.map((layer: DockLayer) => (
                <DockLayerView key={layer.id} layer={layer} />
            ))}
        </Box>
    );
}
