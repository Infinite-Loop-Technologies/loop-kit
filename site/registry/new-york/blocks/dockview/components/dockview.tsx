'use client';

import * as React from 'react';
import {
    DockviewReact,
    DockviewReadyEvent,
    DockviewApi,
    IDockviewPanelProps,
    IDockviewPanelHeaderProps,
    IWatermarkPanelProps,
    DockviewTheme,
    DockviewGroupPanel,
    IDockviewPanel,
} from 'dockview-react';
import 'dockview-react/dist/styles/dockview.css';
import './dv-theme.css';
import { Slot } from '@radix-ui/react-slot';

type StripProps = {
    groupId: string;
    asChild?: boolean; // wrap into your own surface if you want
    className?: string;
    children?: React.ReactNode; // fully custom; if absent, we render a default strip
};

export const GroupTabStrip: React.FC<StripProps> = ({
    groupId,
    asChild,
    className,
    children,
}) => {
    const g = useGroup(groupId);
    const { dispatch } = usePanels();
    if (!g) return null;

    const Comp: any = asChild ? Slot : 'div';

    return (
        <Comp
            className={
                className ??
                'pointer-events-auto flex items-center gap-1 bg-background/80 backdrop-blur-sm px-2 py-1 border-b'
            }
            // you can position this anywhere within the group overlay box:
            // e.g., style={{ position:'absolute', top:0, left:0, right:0 }} from the parent
        >
            {children ?? (
                <>
                    {/* default: left-aligned tab pills */}
                    <div className='flex min-w-0 items-center gap-1'>
                        {g.panels.map((p) => {
                            const active = p.id === g.activePanelId;
                            return (
                                <button
                                    key={p.id}
                                    onClick={() =>
                                        dispatch({
                                            type: 'focus',
                                            panelId: p.id,
                                        })
                                    }
                                    className={`truncate rounded px-2 py-1 text-xs ${
                                        active
                                            ? 'bg-primary text-primary-foreground'
                                            : 'hover:bg-muted text-muted-foreground'
                                    }`}
                                    title={p.title}>
                                    {p.title}
                                </button>
                            );
                        })}
                    </div>
                    {/* right tools */}
                    <div className='ml-auto flex items-center gap-1'>
                        <button
                            className='rounded px-2 py-1 text-xs hover:bg-muted'
                            onClick={() =>
                                dispatch({
                                    type: 'open',
                                    position: 'right',
                                    component: 'default',
                                    title: 'New',
                                })
                            }>
                            Split →
                        </button>
                        <button
                            className='rounded px-2 py-1 text-xs hover:bg-muted'
                            onClick={() =>
                                dispatch({
                                    type: 'open',
                                    position: 'below',
                                    component: 'default',
                                    title: 'New',
                                })
                            }>
                            Split ↓
                        </button>
                    </div>
                </>
            )}
        </Comp>
    );
};
/* ============================= Types ============================= */

type PanelMap = Record<string, React.FC<IDockviewPanelProps>>;
type OpenPosition = 'active' | 'right' | 'below';

export type PanelsState = {
    locked: boolean;
    openCmd: boolean;
    pins: Set<string>;
    dragging: boolean;
    dragSource?: { panelId?: string; groupId?: string };
    dragTarget?: {
        groupId: string;
        position: 'within' | 'above' | 'below' | 'left' | 'right';
        index?: number;
    };
    dragModifiers?: { shift: boolean; alt: boolean; ctrl: boolean };
};

export type PanelsIntent =
    | {
          type: 'open';
          component?: string;
          title?: string;
          position?: OpenPosition;
          id?: string;
      }
    | { type: 'focus'; panelId: string }
    | { type: 'closeActiveGroup' }
    | { type: 'toggleLock' }
    | { type: 'pin'; id: string; value?: boolean }
    | { type: 'saveLayout' }
    | { type: 'restoreLayout' }
    | { type: 'clearLayout' }
    | { type: 'cmd'; open: boolean }
    | { type: 'setDragging'; value: boolean }
    | { type: 'dragStart'; source: { panelId?: string; groupId?: string } }
    | { type: 'dragUpdate'; target: PanelsState['dragTarget'] }
    | { type: 'dragEnd' }
    | { type: 'setDragModifiers'; mods: PanelsState['dragModifiers'] };

export type PanelsSelector<T> = (s: PanelsState, api: DockviewApi | null) => T;

export type PanelsProps = {
    children?: React.ReactNode;
    className?: string;
    components?: PanelMap;
    defaultTabComponent?: React.FC<IDockviewPanelHeaderProps>;
    watermarkComponent?: React.FC<IWatermarkPanelProps>;
    theme?: DockviewTheme;
    dndDisabled?: boolean;
    onReady?: (e: DockviewReadyEvent) => void;
    seed?: Array<{
        id: string;
        title: string;
        component: string;
        position?: OpenPosition;
    }>;
};
type GroupSnapshot = {
    id: string;
    element: HTMLElement; // group's DOM
    panels: { id: string; title: string }[];
    activePanelId: string | null;
};
/* ============================= Defaults ============================= */

const defaultTheme: DockviewTheme = {
    name: 'shadcn',
    className: 'dockview-theme-shadcn',
    dndOverlayMounting: 'relative',
    dndPanelOverlay: 'group',
    gap: 8,
};

const DefaultTab: React.FC<IDockviewPanelHeaderProps> = ({
    api,
    containerApi,
}) => {
    const [activeId, setActiveId] = React.useState(
        containerApi.activePanel?.id
    );
    React.useEffect(() => {
        const d = containerApi.onDidActivePanelChange(() =>
            setActiveId(containerApi.activePanel?.id)
        );
        return () => d.dispose();
    }, [containerApi]);
    const isActive = activeId === api.id;
    return (
        <div
            data-active={isActive ? '' : undefined}
            className='relative flex min-w-[140px] items-center'>
            <span className='truncate'>{api.title}</span>
            <button
                className='ml-auto inline-flex size-5 items-center justify-center rounded hover:bg-muted'
                onClick={(e) => {
                    e.stopPropagation();
                    api.close();
                }}
                aria-label='Close tab'>
                ×
            </button>
        </div>
    );
};

const DefaultPanel: React.FC<IDockviewPanelProps> = ({ api }) => (
    <div className='h-full w-full bg-background p-3 text-sm text-muted-foreground'>
        <div className='mb-2 font-medium text-foreground'>{api.title}</div>
        <p>Put anything here—cards, lists, whatever.</p>
    </div>
);

const DefaultWatermark: React.FC<IWatermarkPanelProps> = () => (
    <div className='flex h-full w-full items-center justify-center bg-background'>
        <div className='space-y-2 text-center'>
            <div className='text-2xl font-semibold tracking-tight text-foreground'>
                Loop-Kit
            </div>
            <p className='text-sm text-muted-foreground'>
                Drag to split. Right-click tabs. ⌘/Ctrl-K.
            </p>
        </div>
    </div>
);

/* ============================= Context / Hooks ============================= */

type Ctx = {
    apiRef: React.MutableRefObject<DockviewApi | null>;
    state: PanelsState;
    dispatch: (i: PanelsIntent) => void;
    select: <T>(sel: PanelsSelector<T>) => T;
    isPinned: (id: string) => boolean;
    components: PanelMap;
    groups: Map<string, GroupSnapshot>; // NEW
};

const PanelsCtx = React.createContext<Ctx | null>(null);

// Handy actions!
export function usePanelsController() {
    const { apiRef, state, dispatch, select } = usePanels();
    const api = apiRef.current;

    const actions = React.useMemo(
        () => ({
            open: (opts: {
                component?: string;
                title?: string;
                position?: OpenPosition;
                id?: string;
            }) => dispatch({ type: 'open', ...opts }),

            focus: (panelId: string) => dispatch({ type: 'focus', panelId }),

            closeActiveGroup: () => dispatch({ type: 'closeActiveGroup' }),

            toggleLock: () => dispatch({ type: 'toggleLock' }),

            pin: (id: string, value?: boolean) =>
                dispatch({ type: 'pin', id, value }),

            saveLayout: () => dispatch({ type: 'saveLayout' }),

            restoreLayout: () => dispatch({ type: 'restoreLayout' }),

            clearLayout: () => dispatch({ type: 'clearLayout' }),

            toggleCmd: (forced?: boolean) => {
                const openCmd = select((s) => s.openCmd);
                dispatch({
                    type: 'cmd',
                    open: forced ?? !openCmd,
                });
            },
        }),
        [dispatch, select]
    );

    return { api, state, actions };
}

export const usePanels = () => {
    const v = React.useContext(PanelsCtx);
    if (!v) throw new Error('Panels context missing');
    return v;
};

export const usePanelsSelect = <T,>(sel: PanelsSelector<T>) =>
    usePanels().select(sel);

/* ============================= Provider (Dockview owner) ============================= */

export function Panels({
    children,
    className,
    components,
    defaultTabComponent,
    watermarkComponent,
    theme,
    dndDisabled = false,
    onReady,
    seed,
}: PanelsProps) {
    const apiRef = React.useRef<DockviewApi | null>(null);
    const [state, setState] = React.useState<PanelsState>({
        locked: false,
        openCmd: false,
        pins: new Set(),
        dragging: false,
    });

    const panelComponents = React.useMemo<PanelMap>(
        () => ({ default: DefaultPanel, ...(components ?? {}) }),
        [components]
    );

    const isPinned = React.useCallback(
        (id: string) => state.pins.has(id),
        [state.pins]
    );

    const [groups, setGroups] = React.useState<Map<string, GroupSnapshot>>(
        new Map()
    );

    const snapshotGroup = React.useCallback(
        (g: DockviewGroupPanel): GroupSnapshot => {
            return {
                id: g.id,
                element: g.element as HTMLElement,
                panels: g.panels.map((p: IDockviewPanel) => ({
                    id: p.id!,
                    title: p.api.title!,
                })),
                activePanelId: g.activePanel?.id ?? null,
            };
        },
        []
    );

    const resyncAllGroups = React.useCallback(() => {
        const api = apiRef.current;
        if (!api) return;
        const next = new Map<string, GroupSnapshot>();
        api.groups.forEach((g) => next.set(g.id, snapshotGroup(g)));
        setGroups(next);
    }, [snapshotGroup]);

    // attach group-level listeners when ready
    const attachGroupWires = React.useCallback(
        (g: DockviewGroupPanel) => {
            // group header is hidden by us; we manage our own overlay
            const d1 = g.model.onDidAddPanel(() =>
                setGroups((prev) => {
                    const next = new Map(prev);
                    next.set(g.id, snapshotGroup(g));
                    return next;
                })
            );
            const d2 = g.model.onDidRemovePanel(() =>
                setGroups((prev) => {
                    const next = new Map(prev);
                    next.set(g.id, snapshotGroup(g));
                    return next;
                })
            );
            const d3 = g.model.onDidActivePanelChange(() =>
                setGroups((prev) => {
                    const next = new Map(prev);
                    next.set(g.id, snapshotGroup(g));
                    return next;
                })
            );
            return () => {
                d1.dispose();
                d2.dispose();
                d3.dispose();
            };
        },
        [snapshotGroup]
    );

    // Wire up global group lifecycle
    React.useEffect(() => {
        const api = apiRef.current;
        if (!api) return;

        // initial scan
        resyncAllGroups();

        // subscribe adds/removes
        const addD = api.onDidAddGroup((g) => {
            // hide native headers
            g.header.hidden = false;
            setGroups((prev) => {
                const next = new Map(prev);
                next.set(g.id, snapshotGroup(g));
                return next;
            });
            const disposeGroup = attachGroupWires(g);
            (g as any).__overlayDispose = disposeGroup;
        });

        const remD = api.onDidRemoveGroup((g) => {
            setGroups((prev) => {
                const next = new Map(prev);
                next.delete(g.id);
                return next;
            });
            (g as any).__overlayDispose?.();
        });

        return () => {
            addD.dispose?.();
            remD.dispose?.();
            // cleanup existing
            api.groups.forEach((g) => (g as any).__overlayDispose?.());
        };
    }, [attachGroupWires, resyncAllGroups, snapshotGroup]);

    const dispatch = React.useCallback(
        (i: PanelsIntent) => {
            const api = apiRef.current;
            switch (i.type) {
                case 'open': {
                    if (!api) break;
                    const id = i.id ?? `p-${crypto.randomUUID().slice(0, 6)}`;
                    const position =
                        i.position && i.position !== 'active'
                            ? {
                                  direction:
                                      i.position === 'right'
                                          ? 'right'
                                          : 'below',
                              }
                            : undefined;
                    const p = api.addPanel({
                        id,
                        title: i.title ?? i.component ?? 'Panel',
                        component: (i.component ?? 'default') as string,
                        position,
                    });
                    p?.api?.setActive?.();
                    break;
                }
                case 'focus': {
                    const p = api?.panels.find((p) => p.id === i.panelId);
                    p?.api?.setActive?.();
                    break;
                }
                case 'closeActiveGroup': {
                    if (!api?.activeGroup) break;
                    [...api.activeGroup.panels].forEach((p: IDockviewPanel) => {
                        if (!state.pins.has(p.id)) p.api.close();
                    });
                    break;
                }
                case 'toggleLock':
                    setState((s) => ({ ...s, locked: !s.locked }));
                    break;
                case 'pin': {
                    setState((s) => {
                        const pins = new Set(s.pins);
                        const next = i.value ?? !pins.has(i.id);
                        if (next) pins.add(i.id);
                        else pins.delete(i.id);
                        return { ...s, pins };
                    });
                    break;
                }
                case 'saveLayout': {
                    const json = api?.toJSON();
                    if (json)
                        localStorage.setItem(
                            'dockview:layout',
                            JSON.stringify(json)
                        );
                    break;
                }
                case 'restoreLayout': {
                    const raw = localStorage.getItem('dockview:layout');
                    if (api && raw) {
                        try {
                            api.fromJSON(JSON.parse(raw));
                        } catch {}
                    }
                    break;
                }
                case 'clearLayout':
                    localStorage.removeItem('dockview:layout');
                    break;
                case 'cmd':
                    setState((s) => ({ ...s, openCmd: i.open }));
                    break;
                case 'setDragging':
                    setState((s) => ({ ...s, dragging: i.value }));
                    break;
            }
        },
        [state.pins]
    );

    const select = React.useCallback(
        <T,>(sel: PanelsSelector<T>) => sel(state, apiRef.current),
        [state]
    );

    const handleReady = (e: DockviewReadyEvent) => {
        apiRef.current = e.api;

        const dDragPanel = e.api.onWillDragPanel((event) => {
            dispatch({
                type: 'dragStart',
                source: {
                    panelId: event.panel.id,
                    groupId: event.panel.group.id,
                },
            });
            dispatch({
                type: 'setDragModifiers',
                mods: {
                    shift: event.nativeEvent.shiftKey,
                    alt: event.nativeEvent.altKey,
                    ctrl:
                        event.nativeEvent.ctrlKey || event.nativeEvent.metaKey,
                },
            });
        });

        const dOverlay = e.api.onWillShowOverlay((event) => {
            // event.group?.id, event.location, event.index, etc.
            dispatch({
                type: 'dragUpdate',
                target: {
                    groupId: event.group.id,
                    position: event.location, // map to your union
                    index: event.index,
                },
            });
        });

        const dDrop = e.api.onDidDrop((event) => {
            dispatch({ type: 'dragEnd' });
            // Optionally inspect last state.dragModifiers to decide what to do
        });

        const d1 = e.api.onDidAddGroup((g: DockviewGroupPanel) => {
            g.header.hidden = true;
        });
        const d2 = e.api.onWillDragPanel(() =>
            dispatch({ type: 'setDragging', value: true })
        );
        const d3 = e.api.onDidDrop(() =>
            dispatch({ type: 'setDragging', value: false })
        );

        if (e.api.groups.length === 0) e.api.addGroup();

        if (seed?.length && e.api.panels.length === 0) {
            seed.forEach(({ id, title, component, position }) =>
                dispatch({ type: 'open', id, title, component, position })
            );
        } else if (e.api.panels.length === 0) {
            dispatch({
                type: 'open',
                id: 'welcome',
                title: 'Welcome',
                component: 'default',
            });
        }

        onReady?.(e);
        return () => {
            d1.dispose();
            d2.dispose();
            d3.dispose();
        };
    };

    return (
        <PanelsCtx.Provider
            value={{
                apiRef,
                state,
                dispatch,
                select,
                isPinned,
                components: panelComponents,
                groups,
            }}>
            <div
                className={`relative bg-background text-foreground h-[70vh] min-h-[320px] ${
                    state.dragging ? 'ring-1 ring-primary/40' : ''
                } ${className ?? ''}`}
                data-locked={state.locked ? '' : undefined}>
                <DockviewReact
                    className='dockview-theme-shadcn h-full w-full'
                    theme={theme ?? defaultTheme}
                    components={panelComponents}
                    defaultTabComponent={defaultTabComponent ?? DefaultTab}
                    watermarkComponent={watermarkComponent ?? DefaultWatermark}
                    onReady={handleReady}
                    onDidDrop={() =>
                        dispatch({ type: 'setDragging', value: false })
                    }
                    onWillDrop={(e) => {
                        if (state.locked) e.preventDefault();
                    }}
                    disableDnd={dndDisabled || state.locked}
                    noPanelsOverlay='watermark'
                    dndEdges={{
                        size: { value: 200, type: 'pixels' },
                        activationSize: { value: 5, type: 'pixels' },
                    }}
                    scrollbars='custom'
                    hideBorders
                    floatingGroupBounds='boundedWithinViewport'
                    disableAutoResizing
                    disableFloatingGroups={false}
                    disableTabsOverflowList={false}
                />
                {children /* bring any ShadCN UI here */}
            </div>
        </PanelsCtx.Provider>
    );
}

const useRect = (el: HTMLElement | null) => {
    const [rect, setRect] = React.useState<DOMRect | null>(null);
    React.useEffect(() => {
        if (!el) return;
        const ro = new ResizeObserver(() =>
            setRect(el.getBoundingClientRect())
        );
        ro.observe(el);
        setRect(el.getBoundingClientRect());
        const onScroll = () => setRect(el.getBoundingClientRect());
        window.addEventListener('scroll', onScroll, true);
        return () => {
            ro.disconnect();
            window.removeEventListener('scroll', onScroll, true);
        };
    }, [el]);
    return rect;
};

/** Renders one subtree per group, absolutely positioned inside the Panels root */
export const GroupOverlays: React.FC<{
    children: (g: GroupSnapshot) => React.ReactNode;
    zIndex?: number;
}> = ({ children, zIndex = 20 }) => {
    const rootRef = React.useRef<HTMLDivElement | null>(null);
    const { groups } = usePanels();

    // get the root element (Panels outer div) via nearest parent
    React.useEffect(() => {
        // no-op; rootRef assigned by wrapper div below
    }, []);

    return (
        <div
            ref={rootRef}
            className='pointer-events-none absolute inset-0'
            style={{ zIndex }}>
            {Array.from(groups.values()).map((g) => (
                <GroupOverlayBox key={g.id} root={rootRef.current} group={g}>
                    {children(g)}
                </GroupOverlayBox>
            ))}
        </div>
    );
};

const GroupOverlayBox: React.FC<{
    root: HTMLElement | null;
    group: GroupSnapshot;
    children: React.ReactNode;
}> = ({ root, group, children }) => {
    const rootRect = useRect(root);
    const grpRect = useRect(group.element);

    if (!root || !rootRect || !grpRect) return null;

    // translate group rect into root-local coordinates
    const left = grpRect.left - rootRect.left;
    const top = grpRect.top - rootRect.top;
    const width = grpRect.width;
    const height = grpRect.height;

    return (
        <div className='absolute' style={{ left, top, width, height }}>
            {/* Pointer events ON only for children area you want interactive */}
            {children}
        </div>
    );
};
/* ============================= Declarative Actions (asChild-ready) ============================= */

type AsChildProps = { asChild?: boolean; children?: React.ReactNode };

export const OpenPanel: React.FC<
    {
        component?: string;
        title?: string;
        position?: OpenPosition;
        id?: string;
    } & AsChildProps
> = ({ asChild, children, ...opts }) => {
    const { dispatch } = usePanels();
    const Comp: any = asChild ? Slot : 'button';
    return (
        <Comp onClick={() => dispatch({ type: 'open', ...opts })}>
            {children ?? 'Open'}
        </Comp>
    );
};

export const FocusPanel: React.FC<{ panelId: string } & AsChildProps> = ({
    asChild,
    children,
    panelId,
}) => {
    const { dispatch } = usePanels();
    const Comp: any = asChild ? Slot : 'button';
    return (
        <Comp onClick={() => dispatch({ type: 'focus', panelId })}>
            {children ?? 'Focus'}
        </Comp>
    );
};

export const CloseActiveGroup: React.FC<AsChildProps> = ({
    asChild,
    children,
}) => {
    const { dispatch } = usePanels();
    const Comp: any = asChild ? Slot : 'button';
    return (
        <Comp onClick={() => dispatch({ type: 'closeActiveGroup' })}>
            {children ?? 'Close Group'}
        </Comp>
    );
};

export const ToggleLock: React.FC<AsChildProps> = ({ asChild, children }) => {
    const { dispatch, select } = usePanels();
    const locked = select((s) => s.locked);
    const Comp: any = asChild ? Slot : 'button';
    return (
        <Comp onClick={() => dispatch({ type: 'toggleLock' })}>
            {children ?? (locked ? 'Unlock' : 'Lock')}
        </Comp>
    );
};

export const SaveLayout: React.FC<AsChildProps> = ({ asChild, children }) => {
    const { dispatch } = usePanels();
    const Comp: any = asChild ? Slot : 'button';
    return (
        <Comp onClick={() => dispatch({ type: 'saveLayout' })}>
            {children ?? 'Save Layout'}
        </Comp>
    );
};

export const RestoreLayout: React.FC<AsChildProps> = ({
    asChild,
    children,
}) => {
    const { dispatch } = usePanels();
    const Comp: any = asChild ? Slot : 'button';
    return (
        <Comp onClick={() => dispatch({ type: 'restoreLayout' })}>
            {children ?? 'Restore Layout'}
        </Comp>
    );
};

export const CmdPaletteToggle: React.FC<{ open?: boolean } & AsChildProps> = ({
    asChild,
    children,
    open,
}) => {
    const { dispatch, select } = usePanels();
    const cur = select((s) => s.openCmd);
    const Comp: any = asChild ? Slot : 'button';
    return (
        <Comp onClick={() => dispatch({ type: 'cmd', open: open ?? !cur })}>
            {children ?? 'Command'}
        </Comp>
    );
};

export const PinPanel: React.FC<{ id: string } & AsChildProps> = ({
    id,
    asChild,
    children,
}) => {
    const { dispatch, isPinned } = usePanels();
    const pinned = isPinned(id);
    const Comp: any = asChild ? Slot : 'button';
    return (
        <Comp onClick={() => dispatch({ type: 'pin', id, value: !pinned })}>
            {children ?? (pinned ? 'Unpin' : 'Pin')}
        </Comp>
    );
};

/* ============================= Mini helpers (optional) ============================= */

export const useOpenTabs = () => usePanelsSelect((_, api) => api?.panels ?? []);

export const useActiveGroupId = () =>
    usePanelsSelect((_, api) => api?.activeGroup?.id ?? null);

export const useGroups = () => {
    const { groups } = usePanels();
    // stable array for rendering
    return React.useMemo(() => Array.from(groups.values()), [groups]);
};

export const useGroup = (groupId: string | null | undefined) => {
    const { groups } = usePanels();
    return groupId ? groups.get(groupId) ?? null : null;
};
