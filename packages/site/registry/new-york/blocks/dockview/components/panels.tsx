'use client';

import * as React from 'react';
import type { CSSProperties } from 'react';
import {
    DndContext,
    DragEndEvent,
    DragMoveEvent,
    DragOverlay,
    DragStartEvent,
    PointerSensor,
    pointerWithin,
    useDraggable,
    useDroppable,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import {
    AddPanelPositionOptions,
    DockviewApi,
    DockviewReadyEvent,
    DockviewReact,
    DockviewTheme,
    IDockviewHeaderActionsProps,
    IDockviewPanel,
    IDockviewPanelHeaderProps,
    IDockviewPanelProps,
    Position,
} from 'dockview-react';
import { useDrag } from '@use-gesture/react';
import {
    Check,
    GripVertical,
    MoreHorizontal,
    PanelLeft,
    PanelLeftClose,
    PanelLeftOpen,
    PanelTop,
    Plus,
    Redo2,
    SplitSquareHorizontal,
    SplitSquareVertical,
    Undo2,
    X,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuLabel,
    ContextMenuSeparator,
    ContextMenuTrigger,
} from '@/components/ui/context-menu';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

import 'dockview-react/dist/styles/dockview.css';
import './dv-theme.css';

type PanelTemplate = {
    id: string;
    title: string;
    description: string;
    body: string;
};

type PanelParams = {
    body: string;
    source: string;
    description?: string;
    templateId?: string;
};

type GuideRect = {
    left: number;
    top: number;
    width: number;
    height: number;
};

type DropGuide = {
    rect: GuideRect;
    mode: 'zone' | 'line-vertical' | 'line-horizontal';
    label: string;
};

type AddPanelIntent = {
    dropPosition?: Position;
    referencePanel?: IDockviewPanel;
    forceWithin?: boolean;
};

type LayoutSnapshot = ReturnType<DockviewApi['toJSON']>;

type DockviewWorkspaceState = {
    panelCount: number;
    guide: DropGuide | null;
    nativeOverlayKind: OverlayEventLike['kind'] | null;
    canUndo: boolean;
    canRedo: boolean;
};

type OverlayEventLike = {
    kind: 'tab' | 'header_space' | 'content' | 'edge';
    position: Position;
    nativeEvent: DragEvent;
    group?: { id: string; element: HTMLElement };
};

type TabListMode = 'horizontal' | 'compact' | 'vertical';

type DockviewUiContextValue = {
    createTabInGroup: (groupId?: string) => void;
    closeGroup: (groupId: string) => void;
    cycleGroupMode: (groupId: string) => void;
    getGroupMode: (groupId: string) => TabListMode;
};

const CORE_STORAGE_KEY = 'loop-kit:dockview:core-layout';
const SIDEBAR_STORAGE_KEY = 'loop-kit:dockview:sidebar-layout';
const SIDEBAR_DROP_ZONE = 'loop-kit:dockview:sidebar-drop-zone';
const DEFAULT_TAB_MODE: TabListMode = 'horizontal';
const TAB_MODE_ORDER: TabListMode[] = ['horizontal', 'compact', 'vertical'];
const DOCKVIEW_THEME: DockviewTheme = {
    name: 'loop-kit-shadcn',
    className: 'dockview-theme-shadcn',
    gap: 8,
    dndOverlayMounting: 'absolute',
    dndPanelOverlay: 'group',
};
const SIDEBAR_MIN_WIDTH = 220;
const SIDEBAR_MAX_WIDTH = 420;
const SIDEBAR_COLLAPSED_WIDTH = 0;

const DockviewUiContext = React.createContext<DockviewUiContextValue | null>(null);

const PANEL_TEMPLATES: PanelTemplate[] = [
    {
        id: 'notes',
        title: 'Notes',
        description: 'Quick scratchpad for ideas and TODOs.',
        body: 'Use this panel as a notes scratchpad while you build.',
    },
    {
        id: 'inspector',
        title: 'Inspector',
        description: 'Read-only details panel.',
        body: 'Inspector panel for selected entity metadata and diagnostics.',
    },
    {
        id: 'terminal',
        title: 'Terminal',
        description: 'Command output and logs.',
        body: 'Terminal output can be streamed here from local commands.',
    },
    {
        id: 'preview',
        title: 'Preview',
        description: 'Runtime preview for rendered output.',
        body: 'Preview panel for live component rendering.',
    },
];

function clamp(value: number, min: number, max: number) {
    return Math.min(max, Math.max(min, value));
}

function createPanelId() {
    return `panel-${crypto.randomUUID().slice(0, 8)}`;
}

function isTabListMode(value: string | undefined): value is TabListMode {
    return value === 'horizontal' || value === 'compact' || value === 'vertical';
}

function getGroupTabMode(groupElement: HTMLElement): TabListMode {
    const value = groupElement.dataset.loopTabList;
    return isTabListMode(value) ? value : DEFAULT_TAB_MODE;
}

function getNextTabMode(mode: TabListMode): TabListMode {
    const index = TAB_MODE_ORDER.indexOf(mode);
    return TAB_MODE_ORDER[(index + 1) % TAB_MODE_ORDER.length];
}

function toDirection(position?: Position) {
    switch (position) {
        case 'left':
            return 'left';
        case 'right':
            return 'right';
        case 'top':
            return 'above';
        case 'bottom':
            return 'below';
        default:
            return undefined;
    }
}

function buildPositionOptions(
    api: DockviewApi,
    intent?: AddPanelIntent
): AddPanelPositionOptions | undefined {
    if (!intent?.referencePanel && !intent?.dropPosition && !intent?.forceWithin) {
        return undefined;
    }

    if (intent?.forceWithin) {
        if (intent.referencePanel) {
            return {
                direction: 'within',
                referencePanel: intent.referencePanel,
            };
        }
        return undefined;
    }

    const direction = toDirection(intent?.dropPosition);
    if (!direction) {
        return undefined;
    }

    if (intent?.referencePanel) {
        return {
            direction,
            referencePanel: intent.referencePanel,
        };
    }

    if (api.activePanel) {
        return {
            direction,
            referencePanel: api.activePanel,
        };
    }

    if (api.activeGroup) {
        return {
            direction,
            referenceGroup: api.activeGroup,
        };
    }

    return { direction };
}

function addPanelFromTemplate(
    api: DockviewApi,
    template?: PanelTemplate,
    intent?: AddPanelIntent
) {
    const selectedTemplate = template ?? PANEL_TEMPLATES[0];
    const nextIndex = api.totalPanels + 1;
    const title = template ? template.title : `Panel ${nextIndex}`;
    const position = buildPositionOptions(api, intent);

    const panel = api.addPanel({
        id: createPanelId(),
        component: 'default',
        title,
        params: {
            body:
                selectedTemplate?.body ??
                'New panel created from the Dockview panel system.',
            source: selectedTemplate?.id ?? 'generated',
            description: selectedTemplate?.description,
            templateId: selectedTemplate?.id,
        },
        position,
    });

    panel.api.setActive();
    return panel;
}

function closeGroupById(api: DockviewApi, groupId: string) {
    const group = api.getGroup(groupId);
    if (!group) return;
    api.removeGroup(group);
}

function getContentRectForGroup(groupRect: DOMRect, headerRect?: DOMRect | null) {
    const top = headerRect?.bottom ?? groupRect.top;
    return {
        left: groupRect.left,
        top,
        width: groupRect.width,
        height: Math.max(0, groupRect.bottom - top),
    };
}

function isPointInsideRect(rect: DOMRect, x: number, y: number) {
    return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
}

function buildZoneGuide(
    rootRect: DOMRect,
    area: { left: number; top: number; width: number; height: number },
    position: Position,
    labelPrefix = 'Drop'
): DropGuide {
    const width = area.width;
    const height = area.height;
    const halfWidth = width / 2;
    const halfHeight = height / 2;

    if (position === 'left') {
        return {
            mode: 'zone',
            label: `${labelPrefix} left`,
            rect: {
                left: area.left - rootRect.left,
                top: area.top - rootRect.top,
                width: halfWidth,
                height,
            },
        };
    }

    if (position === 'right') {
        return {
            mode: 'zone',
            label: `${labelPrefix} right`,
            rect: {
                left: area.left - rootRect.left + halfWidth,
                top: area.top - rootRect.top,
                width: halfWidth,
                height,
            },
        };
    }

    if (position === 'top') {
        return {
            mode: 'zone',
            label: `${labelPrefix} top`,
            rect: {
                left: area.left - rootRect.left,
                top: area.top - rootRect.top,
                width,
                height: halfHeight,
            },
        };
    }

    if (position === 'bottom') {
        return {
            mode: 'zone',
            label: `${labelPrefix} bottom`,
            rect: {
                left: area.left - rootRect.left,
                top: area.top - rootRect.top + halfHeight,
                width,
                height: halfHeight,
            },
        };
    }

    return {
        mode: 'zone',
        label: `${labelPrefix} center`,
        rect: {
            left: area.left - rootRect.left,
            top: area.top - rootRect.top,
            width,
            height,
        },
    };
}

function autoScrollTabList(event: OverlayEventLike) {
    if (event.kind !== 'tab' && event.kind !== 'header_space') {
        return;
    }

    const groupElement = event.group?.element;
    if (!groupElement) {
        return;
    }

    const tabsElement = groupElement.querySelector(
        ':scope > .dv-tabs-and-actions-container .dv-tabs-container'
    ) as HTMLElement | null;

    if (!tabsElement) {
        return;
    }

    const mode = getGroupTabMode(groupElement);
    const rect = tabsElement.getBoundingClientRect();
    const threshold = 36;
    const scrollStep = 18;

    if (mode === 'vertical') {
        if (event.nativeEvent.clientY <= rect.top + threshold) {
            tabsElement.scrollTop -= scrollStep;
        } else if (event.nativeEvent.clientY >= rect.bottom - threshold) {
            tabsElement.scrollTop += scrollStep;
        }
        return;
    }

    if (event.nativeEvent.clientX <= rect.left + threshold) {
        tabsElement.scrollLeft -= scrollStep;
    } else if (event.nativeEvent.clientX >= rect.right - threshold) {
        tabsElement.scrollLeft += scrollStep;
    }
}

function buildInternalDropGuide(
    event: OverlayEventLike,
    rootRect: DOMRect
): DropGuide | null {
    if (!event.group) {
        return null;
    }

    const groupElement = event.group.element;
    const groupRect = groupElement.getBoundingClientRect();
    const headerElement = groupElement.querySelector(
        ':scope > .dv-tabs-and-actions-container'
    ) as HTMLElement | null;
    const headerRect = headerElement?.getBoundingClientRect();
    const contentArea = getContentRectForGroup(groupRect, headerRect);
    const nativeTarget = event.nativeEvent.target as HTMLElement | null;
    const tabMode = getGroupTabMode(groupElement);

    if (event.kind === 'tab') {
        const tabElement = nativeTarget?.closest(
            '[data-loop-panel-id], .dv-tab'
        ) as HTMLElement | null;

        if (tabElement) {
            const tabRect = tabElement.getBoundingClientRect();

            if (tabMode === 'vertical') {
                const insertBefore =
                    event.nativeEvent.clientY <= tabRect.top + tabRect.height / 2;
                const lineY = insertBefore ? tabRect.top : tabRect.bottom;

                return {
                    mode: 'line-horizontal',
                    label: '',
                    rect: {
                        left: tabRect.left - rootRect.left + 4,
                        top: lineY - rootRect.top - 1,
                        width: Math.max(18, tabRect.width - 8),
                        height: 2,
                    },
                };
            }

            const insertBefore =
                event.nativeEvent.clientX <= tabRect.left + tabRect.width / 2;
            const lineX = insertBefore ? tabRect.left : tabRect.right;

            return {
                mode: 'line-vertical',
                label: '',
                rect: {
                    left: lineX - rootRect.left - 1,
                    top: tabRect.top - rootRect.top + 4,
                    width: 2,
                    height: Math.max(16, tabRect.height - 8),
                },
            } satisfies DropGuide;
        }
    }

    if (event.kind === 'header_space' && headerRect) {
        if (tabMode === 'vertical') {
            return {
                mode: 'line-horizontal',
                label: '',
                rect: {
                    left: headerRect.left - rootRect.left + 6,
                    top: headerRect.bottom - rootRect.top - 10,
                    width: Math.max(18, headerRect.width - 12),
                    height: 2,
                },
            };
        }

        return {
            mode: 'line-vertical',
            label: '',
            rect: {
                left: headerRect.right - rootRect.left - 10,
                top: headerRect.top - rootRect.top + 6,
                width: 2,
                height: Math.max(16, headerRect.height - 12),
            },
        } as const;
    }

    return buildZoneGuide(rootRect, contentArea, event.position);
}

function detectDropPosition(rootRect: DOMRect, clientX: number, clientY: number) {
    const x = (clientX - rootRect.left) / rootRect.width;
    const y = (clientY - rootRect.top) / rootRect.height;
    const edge = 0.22;

    if (x <= edge) return 'left' as Position;
    if (x >= 1 - edge) return 'right' as Position;
    if (y <= edge) return 'top' as Position;
    if (y >= 1 - edge) return 'bottom' as Position;
    return 'center' as Position;
}

function buildExternalDropGuide(rootRect: DOMRect, position: Position) {
    return buildZoneGuide(
        rootRect,
        {
            left: rootRect.left,
            top: rootRect.top,
            width: rootRect.width,
            height: rootRect.height,
        },
        position,
        'Create panel'
    );
}

function findReferencePanelAtPoint(
    api: DockviewApi,
    clientX: number,
    clientY: number
) {
    const element = document.elementFromPoint(clientX, clientY) as HTMLElement | null;
    if (!element) {
        return api.activePanel;
    }

    const tabElement = element.closest('[data-loop-panel-id]') as
        | HTMLElement
        | null;
    const panelId = tabElement?.dataset.loopPanelId;
    if (panelId) {
        return api.getPanel(panelId) ?? api.activePanel;
    }

    const groupElement = element.closest('.dv-groupview') as HTMLElement | null;
    if (groupElement) {
        const group = api.groups.find((candidate) => candidate.element === groupElement);
        if (group?.activePanel) {
            return group.activePanel;
        }
    }

    return api.activePanel;
}

function DropGuideOverlay({ guide }: { guide: DropGuide | null }) {
    if (!guide) return null;

    return (
        <div className='pointer-events-none absolute inset-0 z-40'>
            <div
                className={cn(
                    'loop-drop-guide',
                    guide.mode === 'zone' && 'loop-drop-guide-zone',
                    guide.mode === 'line-vertical' && 'loop-drop-guide-line-vertical',
                    guide.mode === 'line-horizontal' &&
                        'loop-drop-guide-line-horizontal'
                )}
                style={{
                    left: guide.rect.left,
                    top: guide.rect.top,
                    width: guide.rect.width,
                    height: guide.rect.height,
                }}
            />
            {guide.label ? (
                <div
                    className='loop-drop-guide-label'
                    style={{
                        left: clamp(
                            guide.rect.left + 8,
                            8,
                            guide.rect.left + guide.rect.width
                        ),
                        top: Math.max(8, guide.rect.top + 8),
                    }}>
                    {guide.label}
                </div>
            ) : null}
        </div>
    );
}

function DockPanel({ api, params }: IDockviewPanelProps<PanelParams>) {
    return (
        <div className='loop-panel-content'>
            <div className='loop-panel-header'>
                <p className='loop-panel-title'>{api.title ?? 'Panel'}</p>
                <Badge variant='outline' className='loop-panel-badge'>
                    {params?.source ?? 'generated'}
                </Badge>
            </div>
            {params?.description ? (
                <p className='loop-panel-description'>{params.description}</p>
            ) : null}
            <p className='loop-panel-body'>
                {params?.body ??
                    'Drop items from the sidebar to create contextual panels.'}
            </p>
        </div>
    );
}

function DockTab({ api, containerApi }: IDockviewPanelHeaderProps<PanelParams>) {
    const ui = React.useContext(DockviewUiContext);
    const tabMode = ui?.getGroupMode(api.group.id) ?? DEFAULT_TAB_MODE;
    const [, rerender] = React.useReducer((value: number) => value + 1, 0);

    React.useEffect(() => {
        const disposeTitle = api.onDidTitleChange(() => rerender());
        const disposeGroup = api.onDidGroupChange(() => rerender());
        const disposeActiveGroup = containerApi.onDidActiveGroupChange(() => rerender());

        return () => {
            disposeTitle.dispose();
            disposeGroup.dispose();
            disposeActiveGroup.dispose();
        };
    }, [api, containerApi]);

    const isActive = api.group.activePanel?.id === api.id;

    const tab = (
        <div
            className={cn(
                'loop-tab',
                `loop-tab-mode-${tabMode}`,
                isActive && 'loop-tab-active',
                !api.isGroupActive && 'loop-tab-group-inactive'
            )}
            data-loop-panel-id={api.id}>
            <span className='loop-tab-title'>{api.title ?? 'Panel'}</span>
            <button
                className='loop-tab-close'
                onClick={(event) => {
                    event.stopPropagation();
                    api.close();
                }}
                aria-label='Close tab'>
                <X className='size-3.5' />
            </button>
        </div>
    );

    return (
        <ContextMenu>
            <ContextMenuTrigger asChild>{tab}</ContextMenuTrigger>
            <ContextMenuContent className='min-w-48'>
                <ContextMenuLabel>{api.title ?? 'Panel'}</ContextMenuLabel>
                <ContextMenuItem onSelect={() => api.setActive()}>
                    Activate tab
                </ContextMenuItem>
                <ContextMenuItem
                    onSelect={() => {
                        if (ui) {
                            ui.createTabInGroup(api.group.id);
                            return;
                        }

                        const referencePanel = containerApi.getPanel(api.id);

                        addPanelFromTemplate(containerApi, undefined, {
                            forceWithin: true,
                            referencePanel: referencePanel ?? undefined,
                        });
                    }}>
                    New tab in group
                </ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem onSelect={() => api.close()}>
                    Close tab
                </ContextMenuItem>
                <ContextMenuItem
                    variant='destructive'
                    onSelect={() => {
                        if (ui) {
                            ui.closeGroup(api.group.id);
                            return;
                        }

                        containerApi.removeGroup(api.group);
                    }}>
                    Close group
                </ContextMenuItem>
            </ContextMenuContent>
        </ContextMenu>
    );
}

function DockHeaderActions({
    containerApi,
    activePanel,
    panels,
    group,
}: IDockviewHeaderActionsProps) {
    const ui = React.useContext(DockviewUiContext);
    const mode = ui?.getGroupMode(group.id) ?? DEFAULT_TAB_MODE;
    const [hasOverflow, setHasOverflow] = React.useState(false);

    React.useEffect(() => {
        const tabsElement = group.element.querySelector(
            ':scope > .dv-tabs-and-actions-container .dv-tabs-container'
        ) as HTMLElement | null;

        if (!tabsElement) {
            setHasOverflow(false);
            return;
        }

        const measureOverflow = () => {
            if (mode === 'vertical') {
                setHasOverflow(tabsElement.scrollHeight > tabsElement.clientHeight + 1);
                return;
            }

            setHasOverflow(tabsElement.scrollWidth > tabsElement.clientWidth + 1);
        };

        measureOverflow();

        if (typeof ResizeObserver === 'undefined') {
            return;
        }

        const observer = new ResizeObserver(measureOverflow);
        observer.observe(tabsElement);
        observer.observe(group.element);

        return () => {
            observer.disconnect();
        };
    }, [group, mode, panels.length]);

    const closeGroup = React.useCallback(() => {
        if (ui) {
            ui.closeGroup(group.id);
            return;
        }

        containerApi.removeGroup(group);
    }, [containerApi, group, ui]);

    return (
        <ContextMenu>
            <ContextMenuTrigger asChild>
                <div className='loop-group-actions'>
                    {hasOverflow ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button
                                    className='loop-group-action-button'
                                    onClick={(event) => {
                                        event.stopPropagation();
                                    }}
                                    aria-label='Open tabs list'>
                                    <MoreHorizontal className='size-3.5' />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                align='end'
                                className='min-w-52 max-w-80'>
                                <DropdownMenuLabel>Tabs</DropdownMenuLabel>
                                {panels.map((panel) => {
                                    const title = panel.title ?? panel.id;
                                    return (
                                        <DropdownMenuItem
                                            key={panel.id}
                                            onSelect={() => panel.api.setActive()}>
                                            <span className='max-w-[14rem] truncate'>
                                                {title}
                                            </span>
                                            {activePanel?.id === panel.id ? (
                                                <Check className='ml-auto size-3.5' />
                                            ) : null}
                                        </DropdownMenuItem>
                                    );
                                })}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    variant='destructive'
                                    onSelect={closeGroup}>
                                    Close group
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : null}
                    <button
                        className='loop-group-action-button'
                        onClick={(event) => {
                            event.stopPropagation();

                            if (ui) {
                                ui.createTabInGroup(group.id);
                                return;
                            }

                            const referencePanel = activePanel ?? group.activePanel;
                            addPanelFromTemplate(containerApi, undefined, {
                                forceWithin: true,
                                referencePanel: referencePanel ?? undefined,
                            });
                        }}
                        aria-label='Create tab'>
                        <Plus className='size-3.5' />
                    </button>
                    <button
                        className='loop-group-action-button'
                        onClick={(event) => {
                            event.stopPropagation();
                            ui?.cycleGroupMode(group.id);
                        }}
                        aria-label={`Tab list mode: ${mode}. Click to cycle.`}>
                        {mode === 'vertical' ? (
                            <PanelLeft className='size-3.5' />
                        ) : (
                            <PanelTop className='size-3.5' />
                        )}
                    </button>
                </div>
            </ContextMenuTrigger>
            <ContextMenuContent className='min-w-44'>
                <ContextMenuItem
                    onSelect={() => {
                        if (ui) {
                            ui.createTabInGroup(group.id);
                            return;
                        }

                        const referencePanel = activePanel ?? group.activePanel;
                        addPanelFromTemplate(containerApi, undefined, {
                            forceWithin: true,
                            referencePanel: referencePanel ?? undefined,
                        });
                    }}>
                    New tab
                </ContextMenuItem>
                <ContextMenuItem
                    onSelect={() => {
                        ui?.cycleGroupMode(group.id);
                    }}>
                    Cycle tab mode
                </ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem variant='destructive' onSelect={closeGroup}>
                    Close group
                </ContextMenuItem>
            </ContextMenuContent>
        </ContextMenu>
    );
}

function useDockviewWorkspace(storageKey: string, seedTemplates: PanelTemplate[]) {
    const apiRef = React.useRef<DockviewApi | null>(null);
    const surfaceRef = React.useRef<HTMLDivElement | null>(null);
    const disposablesRef = React.useRef<Array<{ dispose: () => void }>>([]);
    const historyRef = React.useRef<LayoutSnapshot[]>([]);
    const historyKeysRef = React.useRef<string[]>([]);
    const historyIndexRef = React.useRef(-1);
    const historyTimerRef = React.useRef<number | null>(null);
    const applyingHistoryRef = React.useRef(false);
    const [state, setState] = React.useState<DockviewWorkspaceState>({
        panelCount: 0,
        guide: null,
        nativeOverlayKind: null,
        canUndo: false,
        canRedo: false,
    });

    const setSurfaceNode = React.useCallback((node: HTMLDivElement | null) => {
        surfaceRef.current = node;
    }, []);

    const clearHistoryTimer = React.useCallback(() => {
        if (historyTimerRef.current === null) return;
        window.clearTimeout(historyTimerRef.current);
        historyTimerRef.current = null;
    }, []);

    const clearDisposables = React.useCallback(() => {
        for (const disposable of disposablesRef.current) {
            disposable.dispose();
        }
        disposablesRef.current = [];
        clearHistoryTimer();
    }, [clearHistoryTimer]);

    React.useEffect(() => {
        return () => {
            clearDisposables();
        };
    }, [clearDisposables]);

    const refreshPanelCount = React.useCallback(() => {
        const api = apiRef.current;
        setState((previous) => ({
            ...previous,
            panelCount: api?.panels.length ?? 0,
        }));
    }, []);

    const setGuide = React.useCallback((guide: DropGuide | null) => {
        setState((previous) => ({ ...previous, guide }));
    }, []);

    const setNativeOverlayKind = React.useCallback(
        (kind: OverlayEventLike['kind'] | null) => {
            setState((previous) => ({ ...previous, nativeOverlayKind: kind }));
        },
        []
    );

    const clearGuide = React.useCallback(() => {
        setGuide(null);
        setNativeOverlayKind(null);
    }, [setGuide, setNativeOverlayKind]);

    const updateHistoryState = React.useCallback(() => {
        const canUndo = historyIndexRef.current > 0;
        const canRedo =
            historyIndexRef.current >= 0 &&
            historyIndexRef.current < historyRef.current.length - 1;

        setState((previous) => {
            if (previous.canUndo === canUndo && previous.canRedo === canRedo) {
                return previous;
            }

            return {
                ...previous,
                canUndo,
                canRedo,
            };
        });
    }, []);

    const captureHistorySnapshot = React.useCallback(() => {
        const api = apiRef.current;
        if (!api || applyingHistoryRef.current) return;

        const snapshot = api.toJSON();
        const key = JSON.stringify(snapshot);
        const currentKey = historyKeysRef.current[historyIndexRef.current];

        if (currentKey === key) {
            return;
        }

        const nextSnapshots = historyRef.current.slice(0, historyIndexRef.current + 1);
        const nextKeys = historyKeysRef.current.slice(0, historyIndexRef.current + 1);

        nextSnapshots.push(snapshot);
        nextKeys.push(key);

        if (nextSnapshots.length > 120) {
            nextSnapshots.shift();
            nextKeys.shift();
        }

        historyRef.current = nextSnapshots;
        historyKeysRef.current = nextKeys;
        historyIndexRef.current = nextSnapshots.length - 1;
        updateHistoryState();
    }, [updateHistoryState]);

    const scheduleHistoryCapture = React.useCallback(() => {
        clearHistoryTimer();
        historyTimerRef.current = window.setTimeout(() => {
            historyTimerRef.current = null;
            captureHistorySnapshot();
        }, 0);
    }, [captureHistorySnapshot, clearHistoryTimer]);

    const resetHistory = React.useCallback(() => {
        historyRef.current = [];
        historyKeysRef.current = [];
        historyIndexRef.current = -1;
        updateHistoryState();
    }, [updateHistoryState]);

    const applyHistorySnapshot = React.useCallback(
        (snapshot: LayoutSnapshot | undefined) => {
            const api = apiRef.current;
            if (!api || !snapshot) return;

            applyingHistoryRef.current = true;
            try {
                api.fromJSON(snapshot);
                refreshPanelCount();
                clearGuide();
            } finally {
                applyingHistoryRef.current = false;
            }
        },
        [clearGuide, refreshPanelCount]
    );

    const undoLayout = React.useCallback(() => {
        const nextIndex = historyIndexRef.current - 1;
        if (nextIndex < 0) return;

        historyIndexRef.current = nextIndex;
        applyHistorySnapshot(historyRef.current[nextIndex]);
        updateHistoryState();
    }, [applyHistorySnapshot, updateHistoryState]);

    const redoLayout = React.useCallback(() => {
        const nextIndex = historyIndexRef.current + 1;
        if (nextIndex >= historyRef.current.length) return;

        historyIndexRef.current = nextIndex;
        applyHistorySnapshot(historyRef.current[nextIndex]);
        updateHistoryState();
    }, [applyHistorySnapshot, updateHistoryState]);

    const saveLayout = React.useCallback(() => {
        const api = apiRef.current;
        if (!api) return;
        localStorage.setItem(storageKey, JSON.stringify(api.toJSON()));
    }, [storageKey]);

    const restoreLayout = React.useCallback(() => {
        const api = apiRef.current;
        if (!api) return;

        const raw = localStorage.getItem(storageKey);
        if (!raw) return;

        try {
            api.fromJSON(JSON.parse(raw));
            refreshPanelCount();
            scheduleHistoryCapture();
        } catch {
            // Ignore malformed saved layouts.
        }
    }, [refreshPanelCount, scheduleHistoryCapture, storageKey]);

    const clearLayout = React.useCallback(() => {
        localStorage.removeItem(storageKey);
    }, [storageKey]);

    const addTemplatePanel = React.useCallback(
        (template?: PanelTemplate, intent?: AddPanelIntent) => {
            const api = apiRef.current;
            if (!api) return;
            addPanelFromTemplate(api, template, intent);
            refreshPanelCount();
            scheduleHistoryCapture();
        },
        [refreshPanelCount, scheduleHistoryCapture]
    );

    const splitPanel = React.useCallback(
        (position: Position) => {
            const api = apiRef.current;
            if (!api) return;
            addPanelFromTemplate(api, undefined, { dropPosition: position });
            refreshPanelCount();
            scheduleHistoryCapture();
        },
        [refreshPanelCount, scheduleHistoryCapture]
    );

    const closeGroup = React.useCallback(
        (groupId: string) => {
            const api = apiRef.current;
            if (!api) return;

            closeGroupById(api, groupId);
            refreshPanelCount();
            scheduleHistoryCapture();
        },
        [refreshPanelCount, scheduleHistoryCapture]
    );

    const handleReady = React.useCallback(
        (event: DockviewReadyEvent) => {
            clearDisposables();
            apiRef.current = event.api;

            if (event.api.panels.length === 0) {
                const first = addPanelFromTemplate(event.api, seedTemplates[0]);
                const second = seedTemplates[1];
                if (second) {
                    addPanelFromTemplate(event.api, second, {
                        referencePanel: first,
                        dropPosition: 'right',
                    });
                }
            }

            refreshPanelCount();
            resetHistory();
            captureHistorySnapshot();

            const addDisposable = (disposable: { dispose: () => void }) => {
                disposablesRef.current.push(disposable);
            };

            addDisposable(
                event.api.onDidAddPanel(() => {
                    refreshPanelCount();
                    scheduleHistoryCapture();
                })
            );
            addDisposable(
                event.api.onDidRemovePanel(() => {
                    refreshPanelCount();
                    scheduleHistoryCapture();
                })
            );
            addDisposable(event.api.onDidMovePanel(scheduleHistoryCapture));
            addDisposable(event.api.onDidAddGroup(scheduleHistoryCapture));
            addDisposable(event.api.onDidRemoveGroup(scheduleHistoryCapture));
            addDisposable(event.api.onDidLayoutFromJSON(scheduleHistoryCapture));
            addDisposable(
                event.api.onWillShowOverlay((overlayEvent) => {
                    const root = surfaceRef.current;
                    if (!root) return;
                    const typedEvent = overlayEvent as OverlayEventLike;
                    autoScrollTabList(typedEvent);
                    setNativeOverlayKind(typedEvent.kind);
                    const rootRect = root.getBoundingClientRect();
                    setGuide(
                        buildInternalDropGuide(
                            typedEvent,
                            rootRect
                        )
                    );
                })
            );
            addDisposable(
                event.api.onDidDrop(() => {
                    clearGuide();
                    scheduleHistoryCapture();
                })
            );
            addDisposable(event.api.onWillDrop(clearGuide));
            addDisposable(event.api.onDidActiveGroupChange(clearGuide));
        },
        [
            captureHistorySnapshot,
            clearDisposables,
            clearGuide,
            refreshPanelCount,
            resetHistory,
            scheduleHistoryCapture,
            seedTemplates,
            setGuide,
            setNativeOverlayKind,
        ]
    );

    return {
        apiRef,
        surfaceRef,
        setSurfaceNode,
        panelCount: state.panelCount,
        guide: state.guide,
        nativeOverlayKind: state.nativeOverlayKind,
        canUndo: state.canUndo,
        canRedo: state.canRedo,
        clearGuide,
        handleReady,
        saveLayout,
        restoreLayout,
        clearLayout,
        undoLayout,
        redoLayout,
        addTemplatePanel,
        splitPanel,
        closeGroup,
    };
}

function useGroupTabModes(apiRef: React.RefObject<DockviewApi | null>) {
    const [defaultMode, setDefaultMode] = React.useState<TabListMode>('horizontal');
    const [groupModes, setGroupModes] = React.useState<Record<string, TabListMode>>(
        {}
    );

    const getGroupMode = React.useCallback(
        (groupId: string) => groupModes[groupId] ?? defaultMode,
        [defaultMode, groupModes]
    );

    const cycleGroupMode = React.useCallback(
        (groupId: string) => {
            setGroupModes((current) => {
                const currentMode = current[groupId] ?? defaultMode;
                return {
                    ...current,
                    [groupId]: getNextTabMode(currentMode),
                };
            });
        },
        [defaultMode]
    );

    const applyModes = React.useCallback(() => {
        const api = apiRef.current;
        if (!api) return;

        for (const group of api.groups) {
            group.element.dataset.loopTabList = getGroupMode(group.id);
        }
    }, [apiRef, getGroupMode]);

    React.useEffect(() => {
        applyModes();

        const api = apiRef.current;
        if (!api) return;

        const disposeAdd = api.onDidAddGroup(applyModes);
        const disposeRemove = api.onDidRemoveGroup(applyModes);
        const disposeMove = api.onDidMovePanel(applyModes);
        const disposeActive = api.onDidActiveGroupChange(applyModes);

        return () => {
            disposeAdd.dispose();
            disposeRemove.dispose();
            disposeMove.dispose();
            disposeActive.dispose();
        };
    }, [apiRef, applyModes]);

    return {
        defaultMode,
        setDefaultMode,
        getGroupMode,
        cycleGroupMode,
    };
}

function PanelToolbar({
    panelCount,
    canUndo,
    canRedo,
    tabMode,
    onTabModeChange,
    onUndo,
    onRedo,
    onAdd,
    onSplitRight,
    onSplitDown,
    onSave,
    onRestore,
}: {
    panelCount: number;
    canUndo: boolean;
    canRedo: boolean;
    tabMode: TabListMode;
    onTabModeChange: (mode: TabListMode) => void;
    onUndo: () => void;
    onRedo: () => void;
    onAdd: () => void;
    onSplitRight: () => void;
    onSplitDown: () => void;
    onSave: () => void;
    onRestore: () => void;
}) {
    return (
        <div className='flex flex-wrap items-center gap-2'>
            <Badge variant='secondary'>{panelCount} panels</Badge>
            <Button
                size='sm'
                variant='outline'
                onClick={onUndo}
                disabled={!canUndo}>
                <Undo2 className='mr-1 size-4' />
                Undo
            </Button>
            <Button
                size='sm'
                variant='outline'
                onClick={onRedo}
                disabled={!canRedo}>
                <Redo2 className='mr-1 size-4' />
                Redo
            </Button>
            <Button size='sm' onClick={onAdd}>
                <Plus className='mr-1 size-4' />
                New Tab
            </Button>
            <Button size='sm' variant='outline' onClick={onSplitRight}>
                <SplitSquareVertical className='mr-1 size-4' />
                Split Right
            </Button>
            <Button size='sm' variant='outline' onClick={onSplitDown}>
                <SplitSquareHorizontal className='mr-1 size-4' />
                Split Down
            </Button>
            <Button size='sm' variant='outline' onClick={onSave}>
                Save Layout
            </Button>
            <Button size='sm' variant='outline' onClick={onRestore}>
                Restore Layout
            </Button>
            <div className='ml-auto inline-flex items-center gap-1 rounded-md border bg-background p-1'>
                <Button
                    size='sm'
                    variant={tabMode === 'horizontal' ? 'secondary' : 'ghost'}
                    className='h-7 px-2 text-xs'
                    onClick={() => onTabModeChange('horizontal')}>
                    Horizontal
                </Button>
                <Button
                    size='sm'
                    variant={tabMode === 'compact' ? 'secondary' : 'ghost'}
                    className='h-7 px-2 text-xs'
                    onClick={() => onTabModeChange('compact')}>
                    Compact
                </Button>
                <Button
                    size='sm'
                    variant={tabMode === 'vertical' ? 'secondary' : 'ghost'}
                    className='h-7 px-2 text-xs'
                    onClick={() => onTabModeChange('vertical')}>
                    Vertical
                </Button>
            </div>
        </div>
    );
}

function TemplateDragItem({
    template,
    compact = false,
}: {
    template: PanelTemplate;
    compact?: boolean;
}) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: `template:${template.id}`,
        data: { template },
    });

    const style: CSSProperties = {
        transform: transform ? CSS.Translate.toString(transform) : undefined,
        opacity: isDragging ? 0.6 : 1,
        touchAction: 'none',
    };

    return (
        <button
            type='button'
            ref={setNodeRef}
            style={style}
            className={cn(
                'loop-template-item',
                compact && 'loop-template-item-compact',
                isDragging && 'loop-template-item-dragging'
            )}
            {...listeners}
            {...attributes}>
            <span className='loop-template-title'>{template.title}</span>
            {!compact ? (
                <span className='loop-template-description'>
                    {template.description}
                </span>
            ) : null}
        </button>
    );
}

function CoreDockviewDemo() {
    const runtime = useDockviewWorkspace(CORE_STORAGE_KEY, PANEL_TEMPLATES);
    const groupModes = useGroupTabModes(runtime.apiRef);
    const createTabInGroup = React.useCallback(
        (groupId?: string) => {
            const api = runtime.apiRef.current;
            if (!api) return;

            const group = groupId ? api.getGroup(groupId) : api.activeGroup;
            const referencePanel = group?.activePanel ?? api.activePanel;

            runtime.addTemplatePanel(undefined, {
                forceWithin: true,
                referencePanel: referencePanel ?? undefined,
            });
        },
        [runtime.addTemplatePanel, runtime.apiRef]
    );

    const uiContext = React.useMemo<DockviewUiContextValue>(
        () => ({
            createTabInGroup,
            closeGroup: runtime.closeGroup,
            cycleGroupMode: groupModes.cycleGroupMode,
            getGroupMode: groupModes.getGroupMode,
        }),
        [
            createTabInGroup,
            groupModes.cycleGroupMode,
            groupModes.getGroupMode,
            runtime.closeGroup,
        ]
    );

    const hideNativeOverlay =
        runtime.nativeOverlayKind === 'tab' ||
        runtime.nativeOverlayKind === 'header_space';

    return (
        <div className='space-y-3'>
            <PanelToolbar
                panelCount={runtime.panelCount}
                canUndo={runtime.canUndo}
                canRedo={runtime.canRedo}
                tabMode={groupModes.defaultMode}
                onTabModeChange={groupModes.setDefaultMode}
                onUndo={runtime.undoLayout}
                onRedo={runtime.redoLayout}
                onAdd={() => runtime.addTemplatePanel()}
                onSplitRight={() => runtime.splitPanel('right')}
                onSplitDown={() => runtime.splitPanel('bottom')}
                onSave={runtime.saveLayout}
                onRestore={runtime.restoreLayout}
            />
            <div className='relative h-[68vh] overflow-hidden rounded-xl border bg-card'>
                <div
                    ref={runtime.setSurfaceNode}
                    className={cn(
                        'h-full w-full',
                        hideNativeOverlay && 'loop-hide-native-tab-overlay'
                    )}>
                    <DockviewUiContext.Provider value={uiContext}>
                        <DockviewReact
                            className='dockview-theme-shadcn h-full w-full'
                            theme={DOCKVIEW_THEME}
                            components={{ default: DockPanel }}
                            defaultTabComponent={DockTab}
                            rightHeaderActionsComponent={DockHeaderActions}
                            onReady={runtime.handleReady}
                            dndEdges={{
                                size: { value: 32, type: 'percentage' },
                                activationSize: { value: 12, type: 'pixels' },
                            }}
                            hideBorders
                            disableTabsOverflowList
                            scrollbars='custom'
                        />
                    </DockviewUiContext.Provider>
                    <DropGuideOverlay guide={runtime.guide} />
                </div>
            </div>
        </div>
    );
}

function SidebarDockviewDemo() {
    const runtime = useDockviewWorkspace(SIDEBAR_STORAGE_KEY, PANEL_TEMPLATES);
    const groupModes = useGroupTabModes(runtime.apiRef);
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 4 },
        })
    );
    const { setNodeRef: setDropNodeRef } = useDroppable({
        id: SIDEBAR_DROP_ZONE,
    });
    const [activeTemplate, setActiveTemplate] = React.useState<PanelTemplate | null>(
        null
    );
    const [externalGuide, setExternalGuide] = React.useState<DropGuide | null>(null);
    const pointerRef = React.useRef<{ x: number; y: number } | null>(null);
    const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);
    const [sidebarWidth, setSidebarWidth] = React.useState(280);
    const createTabInGroup = React.useCallback(
        (groupId?: string) => {
            const api = runtime.apiRef.current;
            if (!api) return;

            const group = groupId ? api.getGroup(groupId) : api.activeGroup;
            const referencePanel = group?.activePanel ?? api.activePanel;

            runtime.addTemplatePanel(undefined, {
                forceWithin: true,
                referencePanel: referencePanel ?? undefined,
            });
        },
        [runtime.addTemplatePanel, runtime.apiRef]
    );

    const uiContext = React.useMemo<DockviewUiContextValue>(
        () => ({
            createTabInGroup,
            closeGroup: runtime.closeGroup,
            cycleGroupMode: groupModes.cycleGroupMode,
            getGroupMode: groupModes.getGroupMode,
        }),
        [
            createTabInGroup,
            groupModes.cycleGroupMode,
            groupModes.getGroupMode,
            runtime.closeGroup,
        ]
    );

    const bindResize = useDrag(
        ({ offset: [nextWidth] }) => {
            const width = clamp(nextWidth, SIDEBAR_MIN_WIDTH, SIDEBAR_MAX_WIDTH);
            setSidebarWidth(width);
            if (sidebarCollapsed && width > SIDEBAR_MIN_WIDTH + 8) {
                setSidebarCollapsed(false);
            }
        },
        {
            axis: 'x',
            from: () => [sidebarWidth, 0],
            bounds: {
                left: SIDEBAR_MIN_WIDTH,
                right: SIDEBAR_MAX_WIDTH,
            },
            pointer: { touch: true },
        }
    );

    const setSurfaceAndDropNode = React.useCallback(
        (node: HTMLDivElement | null) => {
            runtime.setSurfaceNode(node);
            setDropNodeRef(node);
        },
        [runtime.setSurfaceNode, setDropNodeRef]
    );

    const clearDnDGuide = React.useCallback(() => {
        setExternalGuide(null);
        pointerRef.current = null;
    }, []);

    const handleDragStart = React.useCallback((event: DragStartEvent) => {
        const template = event.active.data.current?.template as
            | PanelTemplate
            | undefined;
        setActiveTemplate(template ?? null);
    }, []);

    const handleDragMove = React.useCallback(
        (event: DragMoveEvent) => {
            const root = runtime.surfaceRef.current;
            if (!root) return;

            const translatedRect = event.active.rect.current.translated;
            if (!translatedRect) return;

            const pointerX = translatedRect.left + translatedRect.width / 2;
            const pointerY = translatedRect.top + translatedRect.height / 2;
            pointerRef.current = { x: pointerX, y: pointerY };

            const rootRect = root.getBoundingClientRect();
            if (!isPointInsideRect(rootRect, pointerX, pointerY)) {
                setExternalGuide(null);
                return;
            }

            const position = detectDropPosition(rootRect, pointerX, pointerY);
            setExternalGuide(buildExternalDropGuide(rootRect, position));
        },
        [runtime.surfaceRef]
    );

    const handleDragEnd = React.useCallback(
        (event: DragEndEvent) => {
            const template = event.active.data.current?.template as
                | PanelTemplate
                | undefined;
            const api = runtime.apiRef.current;
            const root = runtime.surfaceRef.current;
            const pointer = pointerRef.current;

            if (template && api && root && pointer) {
                const rootRect = root.getBoundingClientRect();
                if (isPointInsideRect(rootRect, pointer.x, pointer.y)) {
                    const dropPosition = detectDropPosition(
                        rootRect,
                        pointer.x,
                        pointer.y
                    );
                    const referencePanel = findReferencePanelAtPoint(
                        api,
                        pointer.x,
                        pointer.y
                    );

                    runtime.addTemplatePanel(template, {
                        dropPosition,
                        referencePanel: referencePanel ?? undefined,
                    });
                }
            }

            setActiveTemplate(null);
            clearDnDGuide();
        },
        [clearDnDGuide, runtime]
    );

    const isPointerOverSurface = React.useMemo(() => {
        const pointer = pointerRef.current;
        const root = runtime.surfaceRef.current;
        if (!pointer || !root) return false;
        return isPointInsideRect(root.getBoundingClientRect(), pointer.x, pointer.y);
    }, [runtime.surfaceRef, externalGuide]);

    const hideNativeOverlay =
        runtime.nativeOverlayKind === 'tab' ||
        runtime.nativeOverlayKind === 'header_space';

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={pointerWithin}
            onDragStart={handleDragStart}
            onDragMove={handleDragMove}
            onDragEnd={handleDragEnd}
            onDragCancel={() => {
                setActiveTemplate(null);
                clearDnDGuide();
            }}>
            <div className='space-y-3'>
                <PanelToolbar
                    panelCount={runtime.panelCount}
                    canUndo={runtime.canUndo}
                    canRedo={runtime.canRedo}
                    tabMode={groupModes.defaultMode}
                    onTabModeChange={groupModes.setDefaultMode}
                    onUndo={runtime.undoLayout}
                    onRedo={runtime.redoLayout}
                    onAdd={() => runtime.addTemplatePanel()}
                    onSplitRight={() => runtime.splitPanel('right')}
                    onSplitDown={() => runtime.splitPanel('bottom')}
                    onSave={runtime.saveLayout}
                    onRestore={runtime.restoreLayout}
                />

                <div className='relative flex h-[68vh] overflow-hidden rounded-xl border bg-card'>
                    <aside
                        className={cn(
                            'loop-sidebar',
                            sidebarCollapsed && 'loop-sidebar-collapsed'
                        )}
                        style={{
                            width: sidebarCollapsed
                                ? SIDEBAR_COLLAPSED_WIDTH
                                : sidebarWidth,
                        }}>
                        {!sidebarCollapsed ? (
                            <>
                                <div className='loop-sidebar-header'>
                                    <span className='loop-sidebar-title'>
                                        Panel Palette
                                    </span>
                                    <Button
                                        variant='ghost'
                                        size='icon'
                                        className='size-7'
                                        onClick={() => setSidebarCollapsed(true)}>
                                        <PanelLeftClose className='size-4' />
                                    </Button>
                                </div>

                                <div className='loop-sidebar-body'>
                                    {PANEL_TEMPLATES.map((template) => (
                                        <TemplateDragItem
                                            key={template.id}
                                            template={template}
                                        />
                                    ))}
                                </div>
                            </>
                        ) : null}
                    </aside>

                    {!sidebarCollapsed ? (
                        <div
                            className='loop-sidebar-resizer'
                            aria-label='Resize sidebar'
                            {...bindResize()}>
                            <GripVertical className='size-4 text-muted-foreground' />
                        </div>
                    ) : null}

                    <div className='relative min-w-0 flex-1'>
                        {sidebarCollapsed ? (
                            <Button
                                variant='secondary'
                                size='icon'
                                className='loop-sidebar-reopen'
                                onClick={() => setSidebarCollapsed(false)}>
                                <PanelLeftOpen className='size-4' />
                            </Button>
                        ) : null}
                        <div
                            ref={setSurfaceAndDropNode}
                            className={cn(
                                'h-full w-full',
                                hideNativeOverlay && 'loop-hide-native-tab-overlay',
                                isPointerOverSurface && 'ring-1 ring-primary/40'
                            )}>
                            <DockviewUiContext.Provider value={uiContext}>
                                <DockviewReact
                                    className='dockview-theme-shadcn h-full w-full'
                                    theme={DOCKVIEW_THEME}
                                    components={{ default: DockPanel }}
                                    defaultTabComponent={DockTab}
                                    rightHeaderActionsComponent={DockHeaderActions}
                                    onReady={runtime.handleReady}
                                    dndEdges={{
                                        size: { value: 32, type: 'percentage' },
                                        activationSize: {
                                            value: 12,
                                            type: 'pixels',
                                        },
                                    }}
                                    hideBorders
                                    disableTabsOverflowList
                                    scrollbars='custom'
                                />
                            </DockviewUiContext.Provider>
                            <DropGuideOverlay
                                guide={externalGuide ?? runtime.guide}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <DragOverlay>
                {activeTemplate ? (
                    <div className='loop-drag-overlay'>{activeTemplate.title}</div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
}

export default function DockviewPanelsPage() {
    return (
        <div className='space-y-3'>
            <Tabs defaultValue='workbench' className='w-full'>
                <TabsList>
                    <TabsTrigger value='workbench'>Workbench Demo</TabsTrigger>
                    <TabsTrigger value='sidebar'>
                        Sidebar Drop Demo
                    </TabsTrigger>
                </TabsList>
                <TabsContent value='workbench'>
                    <CoreDockviewDemo />
                </TabsContent>
                <TabsContent value='sidebar'>
                    <SidebarDockviewDemo />
                </TabsContent>
            </Tabs>
        </div>
    );
}
