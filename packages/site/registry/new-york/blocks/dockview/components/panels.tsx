'use client';

import * as React from 'react';
import type { CSSProperties } from 'react';
import { $set } from '@loop-kit/graphite';
import {
    GraphiteIntentBrowser,
    GraphiteProvider,
    useCommit,
    useGraphite,
    useHistory,
    useQuery,
} from '@loop-kit/graphite/react';
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
import { useDrag, useGesture } from '@use-gesture/react';
import {
    Check,
    ChevronsLeftRightEllipsis,
    ChevronLeft,
    ChevronRight,
    GripVertical,
    MoreHorizontal,
    PanelLeft,
    PanelLeftClose,
    PanelLeftOpen,
    PanelTop,
    Plus,
    Redo2,
    Search,
    SplitSquareHorizontal,
    SplitSquareVertical,
    Undo2,
    X,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ButtonGroup, ButtonGroupText } from '@/components/ui/button-group';
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
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { GraphiteIntentCommandMenu } from '../../../systems/graphite-intent-command-menu';
import { GraphiteShortcutManager } from '../../../systems/graphite-shortcut-manager';
import {
    createDefaultDynamicPanelsShortcutBindings,
    createDynamicPanelsIntentRegistry,
    createDynamicPanelsStore,
    DYNAMIC_PANELS_SHORTCUT_CONTEXT_FIELDS,
    useDynamicPanelsShortcutSystem,
    type PanelCommandIntent,
    type DynamicPanelsState,
    type DynamicPanelsWorkspaceId,
} from '../../../systems/graphite-panels';
import type { GraphiteShortcutBinding } from '../../../systems/graphite-shortcut-manager';

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
    panels: WorkspacePanelSearchItem[];
    guide: DropGuide | null;
};

type TabListMode = 'horizontal' | 'compact' | 'vertical';

type DockviewWorkspaceHandle = {
    workspaceId: DynamicPanelsWorkspaceId;
    addTemplatePanel: () => void;
    activatePanel: (panelId: string) => void;
    closeActiveTab: () => void;
    closeActiveGroup: () => void;
    cycleGroupNext: () => void;
    cycleGroupPrevious: () => void;
    splitPanel: (position: Position) => void;
    saveLayout: () => void;
    restoreLayout: () => void;
    undoLayout: () => void;
    redoLayout: () => void;
    cycleActiveGroupMode: () => void;
    canUndo: boolean;
    canRedo: boolean;
    panelCount: number;
    panels: WorkspacePanelSearchItem[];
};

type DockviewUiContextValue = {
    createTabInGroup: (groupId?: string) => void;
    closeGroup: (groupId: string) => void;
    moveGroup: (
        sourceGroupId: string,
        targetGroupId: string,
        clientX: number,
        clientY: number
    ) => void;
    cycleGroupMode: (groupId: string) => void;
    getGroupMode: (groupId: string) => TabListMode;
};

type WorkspacePanelSearchItem = {
    id: string;
    title: string;
    groupId: string;
};

const CORE_STORAGE_KEY = 'loop-kit:dockview:core-layout';
const SIDEBAR_STORAGE_KEY = 'loop-kit:dockview:sidebar-layout';
const SIDEBAR_DROP_ZONE = 'loop-kit:dockview:sidebar-drop-zone';
const WORKBENCH_HISTORY_CHANNEL = 'dynamic-panels/workbench-layout';
const SIDEBAR_HISTORY_CHANNEL = 'dynamic-panels/sidebar-layout';
const WORKSPACE_HISTORY_CHANNEL: Record<DynamicPanelsWorkspaceId, string> = {
    workbench: WORKBENCH_HISTORY_CHANNEL,
    sidebar: SIDEBAR_HISTORY_CHANNEL,
};
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
                'New panel created from the Dynamic Panels system.',
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

type TabInsertionHint = {
    index: number;
    axis: 'x' | 'y';
    edge: number;
    tabsRect: DOMRect;
};

function resolveTabInsertionHint(
    groupElement: HTMLElement,
    clientX: number,
    clientY: number
): TabInsertionHint | null {
    const tabsElement = groupElement.querySelector(
        ':scope > .dv-tabs-and-actions-container .dv-tabs-container'
    ) as HTMLElement | null;

    if (!tabsElement) {
        return null;
    }

    const tabRects = Array.from(
        tabsElement.querySelectorAll(':scope > .dv-tab')
    )
        .map((element) => (element as HTMLElement).getBoundingClientRect())
        .filter((rect) => rect.width > 0 && rect.height > 0);

    const mode = getGroupTabMode(groupElement);
    const isVertical = mode === 'vertical';
    const pointer = isVertical ? clientY : clientX;
    const tabsRect = tabsElement.getBoundingClientRect();
    const defaultEdge = isVertical ? tabsRect.top + 6 : tabsRect.left + 6;

    if (tabRects.length === 0) {
        return {
            index: 0,
            axis: isVertical ? 'y' : 'x',
            edge: defaultEdge,
            tabsRect,
        };
    }

    let bestIndex = tabRects.length;
    let bestEdge = isVertical
        ? tabRects[tabRects.length - 1]!.bottom
        : tabRects[tabRects.length - 1]!.right;
    let bestDistance = Number.POSITIVE_INFINITY;

    for (let index = 0; index < tabRects.length; index += 1) {
        const rect = tabRects[index]!;
        const start = isVertical ? rect.top : rect.left;
        const end = isVertical ? rect.bottom : rect.right;

        const startDistance = Math.abs(pointer - start);
        if (startDistance < bestDistance) {
            bestDistance = startDistance;
            bestIndex = index;
            bestEdge = start;
        }

        const endDistance = Math.abs(pointer - end);
        if (endDistance < bestDistance) {
            bestDistance = endDistance;
            bestIndex = index + 1;
            bestEdge = end;
        }
    }

    return {
        index: bestIndex,
        axis: isVertical ? 'y' : 'x',
        edge: bestEdge,
        tabsRect,
    };
}

function buildGuideFromTabInsertion(
    hint: TabInsertionHint,
    rootRect: DOMRect
): DropGuide {
    if (hint.axis === 'y') {
        return {
            mode: 'line-horizontal',
            label: '',
            rect: {
                left: hint.tabsRect.left - rootRect.left + 4,
                top: hint.edge - rootRect.top - 1,
                width: Math.max(18, hint.tabsRect.width - 8),
                height: 2,
            },
        };
    }

    return {
        mode: 'line-vertical',
        label: '',
        rect: {
            left: hint.edge - rootRect.left - 1,
            top: hint.tabsRect.top - rootRect.top + 4,
            width: 2,
            height: Math.max(16, hint.tabsRect.height - 8),
        },
    };
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

function resolveDropPositionWithoutCenter(
    rootRect: DOMRect,
    clientX: number,
    clientY: number
): Exclude<Position, 'center'> {
    const position = detectDropPosition(rootRect, clientX, clientY);
    if (position !== 'center') {
        return position;
    }

    const horizontalDistance = Math.abs(
        clientX - rootRect.left - rootRect.width / 2
    );
    const verticalDistance = Math.abs(
        clientY - rootRect.top - rootRect.height / 2
    );
    if (horizontalDistance >= verticalDistance) {
        return clientX < rootRect.left + rootRect.width / 2 ? 'left' : 'right';
    }
    return clientY < rootRect.top + rootRect.height / 2 ? 'top' : 'bottom';
}

function findGroupAtPoint(api: DockviewApi, clientX: number, clientY: number) {
    const element = document.elementFromPoint(clientX, clientY) as HTMLElement | null;
    const fromElement = element
        ? api.groups.find((group) => group.element.contains(element))
        : undefined;
    if (fromElement) {
        return fromElement;
    }

    return api.groups.find((group) =>
        isPointInsideRect(group.element.getBoundingClientRect(), clientX, clientY)
    );
}

type PanelDropResolution = {
    groupId: string;
    mode: 'insert' | 'split';
    index?: number;
    position?: Exclude<Position, 'center'>;
    guide: DropGuide;
};

function resolvePanelDropResolution(
    api: DockviewApi,
    rootRect: DOMRect,
    clientX: number,
    clientY: number
): PanelDropResolution | null {
    const targetGroup = findGroupAtPoint(api, clientX, clientY);
    if (!targetGroup) {
        return null;
    }

    const groupElement = targetGroup.element;
    const groupRect = groupElement.getBoundingClientRect();
    const headerElement = groupElement.querySelector(
        ':scope > .dv-tabs-and-actions-container'
    ) as HTMLElement | null;
    const headerRect = headerElement?.getBoundingClientRect();

    const inHeader =
        Boolean(headerRect) &&
        clientY >= (headerRect?.top ?? 0) - 1 &&
        clientY <= (headerRect?.bottom ?? 0) + 2;
    if (inHeader) {
        const insertion = resolveTabInsertionHint(groupElement, clientX, clientY);
        if (!insertion) {
            return null;
        }

        return {
            groupId: targetGroup.id,
            mode: 'insert',
            index: insertion.index,
            guide: buildGuideFromTabInsertion(insertion, rootRect),
        };
    }

    const contentArea = getContentRectForGroup(groupRect, headerRect);
    const contentRect = new DOMRect(
        contentArea.left,
        contentArea.top,
        Math.max(1, contentArea.width),
        Math.max(1, contentArea.height)
    );
    const position = resolveDropPositionWithoutCenter(contentRect, clientX, clientY);
    return {
        groupId: targetGroup.id,
        mode: 'split',
        position,
        guide: buildZoneGuide(rootRect, contentArea, position),
    };
}

function toWorkspacePanelSearchItems(
    api: DockviewApi | null
): WorkspacePanelSearchItem[] {
    if (!api) {
        return [];
    }

    return api.panels
        .map((panel) => ({
            id: panel.id,
            title: panel.title ?? panel.id,
            groupId: panel.group.id,
        }))
        .sort((left, right) => left.title.localeCompare(right.title));
}

function arePanelSearchItemsEqual(
    left: readonly WorkspacePanelSearchItem[],
    right: readonly WorkspacePanelSearchItem[]
) {
    if (left.length !== right.length) {
        return false;
    }

    for (let index = 0; index < left.length; index += 1) {
        const a = left[index];
        const b = right[index];
        if (!a || !b) {
            return false;
        }
        if (a.id !== b.id || a.groupId !== b.groupId || a.title !== b.title) {
            return false;
        }
    }

    return true;
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
    const { attributes, listeners, setNodeRef, isDragging } =
        useDraggable({
            id: `panel:${api.id}`,
            data: {
                kind: 'panel',
                panelId: api.id,
                groupId: api.group.id,
            },
        });

    React.useEffect(() => {
        const disposeTitle = api.onDidTitleChange(() => rerender());
        const disposeGroup = api.onDidGroupChange(() => rerender());
        const disposeActive = api.onDidActiveChange(() => rerender());
        const disposeActiveGroup = containerApi.onDidActiveGroupChange(() => rerender());

        return () => {
            disposeTitle.dispose();
            disposeGroup.dispose();
            disposeActive.dispose();
            disposeActiveGroup.dispose();
        };
    }, [api, containerApi]);

    const isActive = api.isActive;

    const tab = (
        <div
            ref={setNodeRef}
            style={{
                opacity: isDragging ? 0.7 : 1,
            }}
            className={cn(
                'loop-tab',
                `loop-tab-mode-${tabMode}`,
                isActive && 'loop-tab-active',
                !api.isGroupActive && 'loop-tab-group-inactive'
            )}
            data-loop-panel-id={api.id}
            {...attributes}
            {...listeners}>
            <span className='loop-tab-title'>{api.title ?? 'Panel'}</span>
            <button
                className='loop-tab-close'
                onClick={(event) => {
                    event.stopPropagation();
                    event.preventDefault();
                    api.close();
                }}
                onPointerDown={(event) => event.stopPropagation()}
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
    const tabsContainerRef = React.useRef<HTMLElement | null>(null);
    const headerContainerRef = React.useRef<HTMLElement | null>(null);

    React.useEffect(() => {
        const headerElement = group.element.querySelector(
            ':scope > .dv-tabs-and-actions-container'
        ) as HTMLElement | null;
        const tabsElement = group.element.querySelector(
            ':scope > .dv-tabs-and-actions-container .dv-tabs-container'
        ) as HTMLElement | null;
        headerContainerRef.current = headerElement;
        tabsContainerRef.current = tabsElement;

        if (!headerElement || !tabsElement) {
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
        observer.observe(headerElement);
        observer.observe(group.element);

        return () => {
            headerContainerRef.current = null;
            tabsContainerRef.current = null;
            observer.disconnect();
        };
    }, [group, mode, panels.length]);

    React.useEffect(() => {
        const headerElement = headerContainerRef.current;
        const voidElement = group.element.querySelector(
            ':scope > .dv-tabs-and-actions-container .dv-void-container'
        ) as HTMLElement | null;
        if (!headerElement || !voidElement) {
            return;
        }

        const removeDropStyle = () => {
            headerElement.classList.remove('loop-group-drop-target');
        };

        const onVoidDragStart = (event: DragEvent) => {
            if (!event.dataTransfer) return;
            event.stopPropagation();
            event.dataTransfer.effectAllowed = 'move';
            event.dataTransfer.setData('application/x-loop-group-id', group.id);
            event.dataTransfer.setData('text/plain', `group:${group.id}`);
        };

        const onHeaderDragOver = (event: DragEvent) => {
            const sourceGroupId =
                event.dataTransfer?.getData('application/x-loop-group-id') ?? '';
            if (!sourceGroupId || sourceGroupId === group.id) {
                removeDropStyle();
                return;
            }
            event.preventDefault();
            event.stopPropagation();
            if (event.dataTransfer) {
                event.dataTransfer.dropEffect = 'move';
            }
            headerElement.classList.add('loop-group-drop-target');
        };

        const onHeaderDrop = (event: DragEvent) => {
            const sourceGroupId =
                event.dataTransfer?.getData('application/x-loop-group-id') ?? '';
            removeDropStyle();
            if (!sourceGroupId || sourceGroupId === group.id) {
                return;
            }

            event.preventDefault();
            event.stopPropagation();
            const targetGroupId = group.id;
            if (ui) {
                ui.moveGroup(
                    sourceGroupId,
                    targetGroupId,
                    event.clientX,
                    event.clientY
                );
                return;
            }

            const sourceGroup = containerApi.getGroup(sourceGroupId);
            if (!sourceGroup) {
                return;
            }
            const targetRect = group.element.getBoundingClientRect();
            const position = resolveDropPositionWithoutCenter(
                targetRect,
                event.clientX,
                event.clientY
            );
            sourceGroup.api.moveTo({ group, position } as never);
        };

        const onDragLeave = (event: DragEvent) => {
            const nextTarget = event.relatedTarget as Node | null;
            if (nextTarget && headerElement.contains(nextTarget)) {
                return;
            }
            removeDropStyle();
        };

        voidElement.draggable = true;
        voidElement.addEventListener('dragstart', onVoidDragStart);
        headerElement.addEventListener('dragover', onHeaderDragOver);
        headerElement.addEventListener('drop', onHeaderDrop);
        headerElement.addEventListener('dragleave', onDragLeave);

        return () => {
            removeDropStyle();
            voidElement.removeEventListener('dragstart', onVoidDragStart);
            headerElement.removeEventListener('dragover', onHeaderDragOver);
            headerElement.removeEventListener('drop', onHeaderDrop);
            headerElement.removeEventListener('dragleave', onDragLeave);
        };
    }, [containerApi, group, ui]);

    useGesture(
        {
            onWheel: ({ event, delta: [deltaX, deltaY] }) => {
                const tabsElement = tabsContainerRef.current;
                if (!tabsElement || mode === 'vertical') {
                    return;
                }

                if (tabsElement.scrollWidth <= tabsElement.clientWidth + 1) {
                    return;
                }

                const useHorizontalFromVertical =
                    Math.abs(deltaY) >= Math.abs(deltaX);
                const step = useHorizontalFromVertical ? deltaY : deltaX;
                if (Math.abs(step) < 0.1) {
                    return;
                }

                tabsElement.scrollLeft += step;
                if (event.cancelable) {
                    event.preventDefault();
                }
            },
        },
        {
            target: headerContainerRef,
            eventOptions: { passive: false },
        }
    );

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

function toSnapshotKey(snapshot: unknown): string {
    try {
        return JSON.stringify(snapshot);
    } catch {
        return String(Date.now());
    }
}

function useDockviewWorkspace(
    workspaceId: DynamicPanelsWorkspaceId,
    storageKey: string,
    seedTemplates: PanelTemplate[]
) {
    const store = useGraphite<DynamicPanelsState>();
    const commit = useCommit<DynamicPanelsState>();
    const history = useHistory<DynamicPanelsState>({
        channel: WORKSPACE_HISTORY_CHANNEL[workspaceId],
    });

    const syncedLayout = useQuery<DynamicPanelsState, LayoutSnapshot | null>(
        (state) => (state.layouts[workspaceId] as LayoutSnapshot | null) ?? null
    );
    const savedLayout = useQuery<DynamicPanelsState, LayoutSnapshot | null>(
        (state) => (state.savedLayouts[workspaceId] as LayoutSnapshot | null) ?? null
    );

    const apiRef = React.useRef<DockviewApi | null>(null);
    const surfaceRef = React.useRef<HTMLDivElement | null>(null);
    const disposablesRef = React.useRef<Array<{ dispose: () => void }>>([]);
    const historyTimerRef = React.useRef<number | null>(null);
    const applyingGraphiteLayoutRef = React.useRef(false);
    const snapshotKeyRef = React.useRef<string | null>(null);
    const [state, setState] = React.useState<DockviewWorkspaceState>({
        panelCount: 0,
        panels: [],
        guide: null,
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

    const setGuide = React.useCallback((guide: DropGuide | null) => {
        setState((previous) => ({ ...previous, guide }));
    }, []);

    const clearGuide = React.useCallback(() => {
        setGuide(null);
    }, [setGuide]);

    const syncPanelCount = React.useCallback(
        (count: number) => {
            const current = Number(store.getState().panelCounts[workspaceId] ?? 0);
            if (current === count) {
                return;
            }
            commit(
                {
                    panelCounts: {
                        [workspaceId]: $set(count),
                    },
                },
                {
                    source: 'panels/panel-count',
                    history: false,
                    metadata: { workspaceId },
                }
            );
        },
        [commit, store, workspaceId]
    );

    const refreshPanels = React.useCallback(() => {
        const api = apiRef.current;
        const nextPanels = toWorkspacePanelSearchItems(api);
        const panelCount = nextPanels.length;
        setState((previous) => {
            if (
                previous.panelCount === panelCount &&
                arePanelSearchItemsEqual(previous.panels, nextPanels)
            ) {
                return previous;
            }
            return {
                ...previous,
                panelCount,
                panels: nextPanels,
            };
        });
        syncPanelCount(panelCount);
    }, [syncPanelCount]);

    const syncLayoutSnapshot = React.useCallback(
        (
            snapshot: LayoutSnapshot,
            includeHistory: boolean,
            source = 'panels/layout-sync'
        ) => {
            const key = toSnapshotKey(snapshot);
            if (snapshotKeyRef.current === key) {
                return;
            }
            snapshotKeyRef.current = key;

            commit(
                {
                    layouts: {
                        [workspaceId]: $set(snapshot),
                    },
                },
                {
                    source,
                    history: includeHistory
                        ? { channel: WORKSPACE_HISTORY_CHANNEL[workspaceId] }
                        : false,
                    metadata: { workspaceId },
                }
            );
        },
        [commit, workspaceId]
    );

    const scheduleHistoryCapture = React.useCallback(() => {
        clearHistoryTimer();
        historyTimerRef.current = window.setTimeout(() => {
            historyTimerRef.current = null;
            const api = apiRef.current;
            if (!api || applyingGraphiteLayoutRef.current) return;
            syncLayoutSnapshot(api.toJSON(), true);
        }, 60);
    }, [clearHistoryTimer, syncLayoutSnapshot]);

    const applySnapshotToApi = React.useCallback(
        (snapshot: LayoutSnapshot, source = 'panels/layout-apply') => {
            const api = apiRef.current;
            if (!api) return;

            const key = toSnapshotKey(snapshot);
            if (snapshotKeyRef.current === key) {
                return;
            }

            applyingGraphiteLayoutRef.current = true;
            try {
                api.fromJSON(snapshot);
                snapshotKeyRef.current = key;
                refreshPanels();
                clearGuide();
            } finally {
                applyingGraphiteLayoutRef.current = false;
            }

            syncLayoutSnapshot(snapshot, false, source);
        },
        [clearGuide, refreshPanels, syncLayoutSnapshot]
    );

    const readLocalStorageLayout = React.useCallback((): LayoutSnapshot | null => {
        const raw = localStorage.getItem(storageKey);
        if (!raw) return null;

        try {
            return JSON.parse(raw) as LayoutSnapshot;
        } catch {
            return null;
        }
    }, [storageKey]);

    const saveLayout = React.useCallback(() => {
        const api = apiRef.current;
        if (!api) return;
        const snapshot = api.toJSON();
        localStorage.setItem(storageKey, JSON.stringify(snapshot));
        commit(
            {
                savedLayouts: {
                    [workspaceId]: $set(snapshot),
                },
            },
            {
                source: 'panels/layout-save',
                history: false,
                metadata: { workspaceId },
            }
        );
    }, [commit, storageKey, workspaceId]);

    const restoreLayout = React.useCallback(() => {
        const fromGraphite = savedLayout;
        const fromStorage = readLocalStorageLayout();
        const snapshot = fromGraphite ?? fromStorage;
        if (!snapshot) return;

        applySnapshotToApi(snapshot, 'panels/layout-restore');
    }, [applySnapshotToApi, readLocalStorageLayout, savedLayout]);

    const clearLayout = React.useCallback(() => {
        localStorage.removeItem(storageKey);
        commit(
            {
                savedLayouts: {
                    [workspaceId]: $set(null),
                },
            },
            {
                source: 'panels/layout-clear',
                history: false,
                metadata: { workspaceId },
            }
        );
    }, [commit, storageKey, workspaceId]);

    const addTemplatePanel = React.useCallback(
        (template?: PanelTemplate, intent?: AddPanelIntent) => {
            const api = apiRef.current;
            if (!api) return;
            addPanelFromTemplate(api, template, intent);
            refreshPanels();
            scheduleHistoryCapture();
        },
        [refreshPanels, scheduleHistoryCapture]
    );

    const splitPanel = React.useCallback(
        (position: Position) => {
            const api = apiRef.current;
            if (!api) return;
            addPanelFromTemplate(api, undefined, { dropPosition: position });
            refreshPanels();
            scheduleHistoryCapture();
        },
        [refreshPanels, scheduleHistoryCapture]
    );

    const closeGroup = React.useCallback(
        (groupId: string) => {
            const api = apiRef.current;
            if (!api) return;
            closeGroupById(api, groupId);
            refreshPanels();
            scheduleHistoryCapture();
        },
        [refreshPanels, scheduleHistoryCapture]
    );

    const closeActiveTab = React.useCallback(() => {
        const api = apiRef.current;
        const activePanel = api?.activePanel;
        if (!activePanel) return;

        activePanel.api.close();
        refreshPanels();
        scheduleHistoryCapture();
    }, [refreshPanels, scheduleHistoryCapture]);

    const closeActiveGroup = React.useCallback(() => {
        const api = apiRef.current;
        const activeGroup = api?.activeGroup;
        if (!api || !activeGroup) return;

        api.removeGroup(activeGroup);
        refreshPanels();
        scheduleHistoryCapture();
    }, [refreshPanels, scheduleHistoryCapture]);

    const cycleGroupNext = React.useCallback(() => {
        const api = apiRef.current;
        if (!api) return;
        api.moveToNext({ includePanel: false });
        clearGuide();
    }, [clearGuide]);

    const cycleGroupPrevious = React.useCallback(() => {
        const api = apiRef.current;
        if (!api) return;
        api.moveToPrevious({ includePanel: false });
        clearGuide();
    }, [clearGuide]);

    const activatePanel = React.useCallback(
        (panelId: string) => {
            const api = apiRef.current;
            if (!api) return;
            const panel = api.getPanel(panelId);
            if (!panel) return;
            panel.api.setActive();
            clearGuide();
        },
        [clearGuide]
    );

    const movePanelByDrop = React.useCallback(
        (
            panelId: string,
            drop: {
                groupId: string;
                mode: 'insert' | 'split';
                index?: number;
                position?: Exclude<Position, 'center'>;
            }
        ) => {
            const api = apiRef.current;
            if (!api) return;
            const panel = api.getPanel(panelId);
            const targetGroup = api.getGroup(drop.groupId);
            if (!panel || !targetGroup) return;

            if (drop.mode === 'insert') {
                panel.api.moveTo({
                    group: targetGroup as unknown as typeof panel.group,
                    position: 'center',
                    index: drop.index ?? targetGroup.panels.length,
                });
            } else {
                panel.api.moveTo({
                    group: targetGroup as unknown as typeof panel.group,
                    position: drop.position ?? 'right',
                });
            }

            panel.api.setActive();
            clearGuide();
            refreshPanels();
            scheduleHistoryCapture();
        },
        [clearGuide, refreshPanels, scheduleHistoryCapture]
    );

    const moveGroupByDrop = React.useCallback(
        (
            sourceGroupId: string,
            targetGroupId: string,
            clientX: number,
            clientY: number
        ) => {
            const api = apiRef.current;
            if (!api) return;
            const sourceGroup = api.getGroup(sourceGroupId);
            const targetGroup = api.getGroup(targetGroupId);
            if (!sourceGroup || !targetGroup || sourceGroup.id === targetGroup.id) {
                return;
            }

            const targetGroupElement = (
                targetGroup as { element?: HTMLElement }
            ).element;
            if (!targetGroupElement) {
                return;
            }

            const targetRect = targetGroupElement.getBoundingClientRect();
            const position = resolveDropPositionWithoutCenter(
                targetRect,
                clientX,
                clientY
            );
            sourceGroup.api.moveTo({ group: targetGroup as never, position } as never);
            targetGroup.api.setActive();
            clearGuide();
            refreshPanels();
            scheduleHistoryCapture();
        },
        [clearGuide, refreshPanels, scheduleHistoryCapture]
    );

    const undoLayout = React.useCallback(() => {
        history.undo();
    }, [history]);

    const redoLayout = React.useCallback(() => {
        history.redo();
    }, [history]);

    const handleReady = React.useCallback(
        (event: DockviewReadyEvent) => {
            clearDisposables();
            apiRef.current = event.api;

            const hydrateWithSnapshot = (snapshot: LayoutSnapshot | null): boolean => {
                if (!snapshot) return false;
                applyingGraphiteLayoutRef.current = true;
                try {
                    event.api.fromJSON(snapshot);
                    snapshotKeyRef.current = toSnapshotKey(snapshot);
                } finally {
                    applyingGraphiteLayoutRef.current = false;
                }
                return true;
            };

            if (event.api.panels.length === 0) {
                const hydratedFromGraphite = hydrateWithSnapshot(syncedLayout);
                const hydratedFromLocal =
                    !hydratedFromGraphite && hydrateWithSnapshot(readLocalStorageLayout());

                if (!hydratedFromGraphite && !hydratedFromLocal) {
                    const first = addPanelFromTemplate(event.api, seedTemplates[0]);
                    const second = seedTemplates[1];
                    if (second) {
                        addPanelFromTemplate(event.api, second, {
                            referencePanel: first,
                            dropPosition: 'right',
                        });
                    }
                }
            }

            refreshPanels();
            syncLayoutSnapshot(event.api.toJSON(), false, 'panels/layout-init');

            const addDisposable = (disposable: { dispose: () => void }) => {
                disposablesRef.current.push(disposable);
            };

            addDisposable(
                event.api.onDidAddPanel(() => {
                    refreshPanels();
                    scheduleHistoryCapture();
                })
            );
            addDisposable(
                event.api.onDidRemovePanel(() => {
                    refreshPanels();
                    scheduleHistoryCapture();
                })
            );
            addDisposable(event.api.onDidMovePanel(scheduleHistoryCapture));
            addDisposable(event.api.onDidAddGroup(scheduleHistoryCapture));
            addDisposable(event.api.onDidRemoveGroup(scheduleHistoryCapture));
            addDisposable(event.api.onDidLayoutFromJSON(scheduleHistoryCapture));
            addDisposable(event.api.onDidActiveGroupChange(clearGuide));
        },
        [
            clearDisposables,
            clearGuide,
            readLocalStorageLayout,
            refreshPanels,
            scheduleHistoryCapture,
            seedTemplates,
            syncLayoutSnapshot,
            syncedLayout,
        ]
    );

    React.useEffect(() => {
        if (!syncedLayout) {
            return;
        }
        if (!apiRef.current) {
            return;
        }
        applySnapshotToApi(syncedLayout, 'panels/layout-query-sync');
    }, [applySnapshotToApi, syncedLayout]);

    return {
        apiRef,
        surfaceRef,
        setSurfaceNode,
        panelCount: state.panelCount,
        panels: state.panels,
        guide: state.guide,
        canUndo: history.canUndo,
        canRedo: history.canRedo,
        setGuide,
        clearGuide,
        handleReady,
        saveLayout,
        restoreLayout,
        clearLayout,
        undoLayout,
        redoLayout,
        addTemplatePanel,
        activatePanel,
        movePanelByDrop,
        moveGroupByDrop,
        splitPanel,
        closeActiveTab,
        closeActiveGroup,
        cycleGroupNext,
        cycleGroupPrevious,
        closeGroup,
    };
}

function useGroupTabModes(
    apiRef: React.RefObject<DockviewApi | null>,
    workspaceId: DynamicPanelsWorkspaceId
) {
    const commit = useCommit<DynamicPanelsState>();
    const defaultMode = useQuery<DynamicPanelsState, TabListMode>(
        (state) => state.ui.defaultTabMode as TabListMode
    );
    const groupModes = useQuery<DynamicPanelsState, Record<string, TabListMode>>(
        (state) => state.ui.groupTabModes as Record<string, TabListMode>
    );

    const toGroupModeKey = React.useCallback(
        (groupId: string) => `${workspaceId}:${groupId}`,
        [workspaceId]
    );

    const getGroupMode = React.useCallback(
        (groupId: string) => {
            const key = toGroupModeKey(groupId);
            return groupModes[key] ?? defaultMode;
        },
        [defaultMode, groupModes, toGroupModeKey]
    );

    const setDefaultMode = React.useCallback(
        (mode: TabListMode) => {
            const api = apiRef.current;
            if (api) {
                for (const group of api.groups) {
                    const key = toGroupModeKey(group.id);
                    if (!groupModes[key]) {
                        const groupElement = (
                            group as { element?: HTMLElement }
                        ).element;
                        if (groupElement) {
                            groupElement.dataset.loopTabList = mode;
                        }
                    }
                }
            }
            commit(
                {
                    ui: {
                        defaultTabMode: $set(mode),
                    },
                },
                {
                    source: 'panels/ui/default-tab-mode',
                    history: false,
                    metadata: { workspaceId },
                }
            );
        },
        [apiRef, commit, groupModes, toGroupModeKey, workspaceId]
    );

    const cycleGroupMode = React.useCallback(
        (groupId: string) => {
            const key = toGroupModeKey(groupId);
            const currentMode = groupModes[key] ?? defaultMode;
            const nextMode = getNextTabMode(currentMode);
            const group = apiRef.current?.getGroup(groupId);
            if (group) {
                const groupElement = (group as { element?: HTMLElement }).element;
                if (groupElement) {
                    groupElement.dataset.loopTabList = nextMode;
                }
            }
            commit(
                {
                    ui: {
                        groupTabModes: {
                            [key]: $set(nextMode),
                        },
                    },
                },
                {
                    source: 'panels/ui/group-tab-mode',
                    history: false,
                    metadata: { workspaceId, groupId },
                }
            );
        },
        [apiRef, commit, defaultMode, groupModes, toGroupModeKey, workspaceId]
    );

    const cycleActiveGroupMode = React.useCallback(() => {
        const api = apiRef.current;
        const group = api?.activeGroup;
        if (!group) return;
        cycleGroupMode(group.id);
    }, [apiRef, cycleGroupMode]);

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
        cycleActiveGroupMode,
    };
}

function PanelToolbar({
    panelCount,
    panels,
    canUndo,
    canRedo,
    tabMode,
    onTabModeChange,
    onSelectPanel,
    onUndo,
    onRedo,
    onAdd,
    onCloseTab,
    onCloseGroup,
    onCycleGroupNext,
    onCycleGroupPrevious,
    onSplitRight,
    onSplitDown,
    onSave,
    onRestore,
}: {
    panelCount: number;
    panels: readonly WorkspacePanelSearchItem[];
    canUndo: boolean;
    canRedo: boolean;
    tabMode: TabListMode;
    onTabModeChange: (mode: TabListMode) => void;
    onSelectPanel: (panelId: string) => void;
    onUndo: () => void;
    onRedo: () => void;
    onAdd: () => void;
    onCloseTab: () => void;
    onCloseGroup: () => void;
    onCycleGroupNext: () => void;
    onCycleGroupPrevious: () => void;
    onSplitRight: () => void;
    onSplitDown: () => void;
    onSave: () => void;
    onRestore: () => void;
}) {
    const [search, setSearch] = React.useState('');
    const searchListId = React.useId();

    const searchMatches = React.useMemo(() => {
        const needle = search.trim().toLowerCase();
        if (!needle) {
            return panels.slice(0, 10);
        }
        return panels
            .filter((panel) => panel.title.toLowerCase().includes(needle))
            .sort((left, right) => {
                const leftStarts = left.title.toLowerCase().startsWith(needle);
                const rightStarts = right.title.toLowerCase().startsWith(needle);
                if (leftStarts && !rightStarts) return -1;
                if (!leftStarts && rightStarts) return 1;
                return left.title.localeCompare(right.title);
            })
            .slice(0, 12);
    }, [panels, search]);

    const runSearch = React.useCallback(() => {
        if (searchMatches.length === 0) return;
        const needle = search.trim().toLowerCase();
        const exact = panels.find((panel) => panel.title.toLowerCase() === needle);
        const target = exact ?? searchMatches[0];
        if (!target) return;
        onSelectPanel(target.id);
        setSearch(target.title);
    }, [onSelectPanel, panels, search, searchMatches]);

    const iconButtonClass =
        'h-9 w-9 rounded-full p-0 [&_svg]:size-4';

    const IconButton = ({
        label,
        disabled,
        onClick,
        children,
    }: {
        label: string;
        disabled?: boolean;
        onClick: () => void;
        children: React.ReactNode;
    }) => (
        <Tooltip>
            <TooltipTrigger asChild>
                <Button
                    size='sm'
                    variant='outline'
                    className={iconButtonClass}
                    disabled={disabled}
                    onClick={onClick}
                    aria-label={label}>
                    {children}
                </Button>
            </TooltipTrigger>
            <TooltipContent>{label}</TooltipContent>
        </Tooltip>
    );

    return (
        <div className='space-y-2'>
            <div className='flex flex-wrap items-center gap-2'>
                <ButtonGroup>
                    <ButtonGroupText className='h-9 rounded-md px-3 text-xs'>
                        {panelCount} panels
                    </ButtonGroupText>
                    <IconButton label='Undo' disabled={!canUndo} onClick={onUndo}>
                        <Undo2 />
                    </IconButton>
                    <IconButton label='Redo' disabled={!canRedo} onClick={onRedo}>
                        <Redo2 />
                    </IconButton>
                    <IconButton label='Previous Group' onClick={onCycleGroupPrevious}>
                        <ChevronLeft />
                    </IconButton>
                    <IconButton label='Next Group' onClick={onCycleGroupNext}>
                        <ChevronRight />
                    </IconButton>
                </ButtonGroup>

                <ButtonGroup>
                    <Button size='sm' className='h-9 px-3' onClick={onAdd}>
                        <Plus className='mr-1 size-4' />
                        New Tab
                    </Button>
                    <IconButton label='Close Tab' onClick={onCloseTab}>
                        <X />
                    </IconButton>
                    <Button
                        size='sm'
                        variant='outline'
                        className='h-9 px-3'
                        onClick={onCloseGroup}>
                        Close Group
                    </Button>
                </ButtonGroup>

                <ButtonGroup>
                    <Button
                        size='sm'
                        variant='outline'
                        className='h-9 px-3'
                        onClick={onSplitRight}>
                        <SplitSquareVertical className='mr-1 size-4' />
                        Split Right
                    </Button>
                    <Button
                        size='sm'
                        variant='outline'
                        className='h-9 px-3'
                        onClick={onSplitDown}>
                        <SplitSquareHorizontal className='mr-1 size-4' />
                        Split Down
                    </Button>
                    <Button
                        size='sm'
                        variant='outline'
                        className='h-9 px-3'
                        onClick={onSave}>
                        Save
                    </Button>
                    <Button
                        size='sm'
                        variant='outline'
                        className='h-9 px-3'
                        onClick={onRestore}>
                        Restore
                    </Button>
                </ButtonGroup>

                <div className='ml-auto flex min-w-[280px] flex-1 items-center justify-end gap-2'>
                    <div className='relative w-full max-w-[360px]'>
                        <Search className='pointer-events-none absolute left-2 top-1/2 size-4 -translate-y-1/2 text-muted-foreground' />
                        <Input
                            list={searchListId}
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            onKeyDown={(event) => {
                                if (event.key !== 'Enter') return;
                                event.preventDefault();
                                runSearch();
                            }}
                            placeholder='Find tab by name...'
                            className='h-9 pl-8'
                        />
                        <datalist id={searchListId}>
                            {panels.slice(0, 80).map((panel) => (
                                <option key={panel.id} value={panel.title} />
                            ))}
                        </datalist>
                    </div>
                    <Button
                        size='sm'
                        variant='outline'
                        className='h-9 px-3'
                        onClick={runSearch}>
                        Find
                    </Button>
                </div>
            </div>

            <div className='flex items-center justify-end'>
                <div className='inline-flex items-center gap-1 rounded-lg border bg-background/80 p-1'>
                    <Button
                        size='sm'
                        variant={tabMode === 'horizontal' ? 'secondary' : 'ghost'}
                        className='h-8 px-2 text-xs'
                        onClick={() => onTabModeChange('horizontal')}>
                        Horizontal
                    </Button>
                    <Button
                        size='sm'
                        variant={tabMode === 'compact' ? 'secondary' : 'ghost'}
                        className='h-8 px-2 text-xs'
                        onClick={() => onTabModeChange('compact')}>
                        Compact
                    </Button>
                    <Button
                        size='sm'
                        variant={tabMode === 'vertical' ? 'secondary' : 'ghost'}
                        className='h-8 px-2 text-xs'
                        onClick={() => onTabModeChange('vertical')}>
                        Vertical
                    </Button>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                size='sm'
                                variant='ghost'
                                className='h-8 w-8 p-0'
                                onClick={() => {
                                    const mode = getNextTabMode(tabMode);
                                    onTabModeChange(mode);
                                }}
                                aria-label='Cycle tab mode'>
                                <ChevronsLeftRightEllipsis className='size-4' />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Cycle tab mode</TooltipContent>
                    </Tooltip>
                </div>
            </div>
        </div>
    );
}

function getPointerFromDragEvent(event: DragMoveEvent | DragEndEvent) {
    const translatedRect = event.active.rect.current.translated;
    if (!translatedRect) {
        return null;
    }

    return {
        x: translatedRect.left + translatedRect.width / 2,
        y: translatedRect.top + translatedRect.height / 2,
    };
}

function useWorkspacePanelDnd(
    runtime: ReturnType<typeof useDockviewWorkspace>
) {
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 6 },
        })
    );
    const [activePanelId, setActivePanelId] = React.useState<string | null>(null);

    const handlePanelDragStart = React.useCallback((event: DragStartEvent) => {
        const kind = event.active.data.current?.kind as string | undefined;
        if (kind !== 'panel') {
            return;
        }

        const panelId = event.active.data.current?.panelId as string | undefined;
        setActivePanelId(panelId ?? null);
    }, []);

    const handlePanelDragMove = React.useCallback(
        (event: DragMoveEvent) => {
            const kind = event.active.data.current?.kind as string | undefined;
            if (kind !== 'panel') {
                return;
            }

            const pointer = getPointerFromDragEvent(event);
            const api = runtime.apiRef.current;
            const root = runtime.surfaceRef.current;
            if (!pointer || !api || !root) {
                runtime.clearGuide();
                return;
            }

            const rootRect = root.getBoundingClientRect();
            if (!isPointInsideRect(rootRect, pointer.x, pointer.y)) {
                runtime.clearGuide();
                return;
            }

            const resolution = resolvePanelDropResolution(
                api,
                rootRect,
                pointer.x,
                pointer.y
            );
            runtime.setGuide(resolution?.guide ?? null);
        },
        [runtime]
    );

    const handlePanelDragEnd = React.useCallback(
        (event: DragEndEvent) => {
            const kind = event.active.data.current?.kind as string | undefined;
            if (kind !== 'panel') {
                return;
            }

            const panelId = event.active.data.current?.panelId as
                | string
                | undefined;
            const pointer = getPointerFromDragEvent(event);
            const api = runtime.apiRef.current;
            const root = runtime.surfaceRef.current;
            if (panelId && pointer && api && root) {
                const rootRect = root.getBoundingClientRect();
                if (isPointInsideRect(rootRect, pointer.x, pointer.y)) {
                    const resolution = resolvePanelDropResolution(
                        api,
                        rootRect,
                        pointer.x,
                        pointer.y
                    );
                    if (resolution) {
                        runtime.movePanelByDrop(panelId, resolution);
                    }
                }
            }

            setActivePanelId(null);
            runtime.clearGuide();
        },
        [runtime]
    );

    const handlePanelDragCancel = React.useCallback(() => {
        setActivePanelId(null);
        runtime.clearGuide();
    }, [runtime]);

    const activePanelTitle = React.useMemo(() => {
        if (!activePanelId) return null;
        const panel = runtime.panels.find((candidate) => candidate.id === activePanelId);
        return panel?.title ?? null;
    }, [activePanelId, runtime.panels]);

    return {
        sensors,
        activePanelTitle,
        handlePanelDragStart,
        handlePanelDragMove,
        handlePanelDragEnd,
        handlePanelDragCancel,
    };
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
        data: { kind: 'template', template },
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

function CoreDockviewDemo({
    onHandleChange,
}: {
    onHandleChange?: (handle: DockviewWorkspaceHandle | null) => void;
}) {
    const runtime = useDockviewWorkspace(
        'workbench',
        CORE_STORAGE_KEY,
        PANEL_TEMPLATES
    );
    const groupModes = useGroupTabModes(runtime.apiRef, 'workbench');
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
            moveGroup: runtime.moveGroupByDrop,
            cycleGroupMode: groupModes.cycleGroupMode,
            getGroupMode: groupModes.getGroupMode,
        }),
        [
            createTabInGroup,
            groupModes.cycleGroupMode,
            groupModes.getGroupMode,
            runtime.closeGroup,
            runtime.moveGroupByDrop,
        ]
    );
    const panelDnd = useWorkspacePanelDnd(runtime);

    React.useEffect(() => {
        if (!onHandleChange) return;

        onHandleChange({
            workspaceId: 'workbench',
            addTemplatePanel: () => runtime.addTemplatePanel(),
            activatePanel: runtime.activatePanel,
            closeActiveTab: runtime.closeActiveTab,
            closeActiveGroup: runtime.closeActiveGroup,
            cycleGroupNext: runtime.cycleGroupNext,
            cycleGroupPrevious: runtime.cycleGroupPrevious,
            splitPanel: runtime.splitPanel,
            saveLayout: runtime.saveLayout,
            restoreLayout: runtime.restoreLayout,
            undoLayout: runtime.undoLayout,
            redoLayout: runtime.redoLayout,
            cycleActiveGroupMode: groupModes.cycleActiveGroupMode,
            canUndo: runtime.canUndo,
            canRedo: runtime.canRedo,
            panelCount: runtime.panelCount,
            panels: runtime.panels,
        });

        return () => {
            onHandleChange(null);
        };
    }, [
        groupModes.cycleActiveGroupMode,
        onHandleChange,
        runtime.addTemplatePanel,
        runtime.activatePanel,
        runtime.canRedo,
        runtime.canUndo,
        runtime.closeActiveGroup,
        runtime.closeActiveTab,
        runtime.cycleGroupNext,
        runtime.cycleGroupPrevious,
        runtime.panelCount,
        runtime.panels,
        runtime.redoLayout,
        runtime.restoreLayout,
        runtime.saveLayout,
        runtime.splitPanel,
        runtime.undoLayout,
    ]);

    return (
        <DndContext
            sensors={panelDnd.sensors}
            collisionDetection={pointerWithin}
            onDragStart={panelDnd.handlePanelDragStart}
            onDragMove={panelDnd.handlePanelDragMove}
            onDragEnd={panelDnd.handlePanelDragEnd}
            onDragCancel={panelDnd.handlePanelDragCancel}>
            <div className='space-y-3'>
                <PanelToolbar
                    panelCount={runtime.panelCount}
                    panels={runtime.panels}
                    canUndo={runtime.canUndo}
                    canRedo={runtime.canRedo}
                    tabMode={groupModes.defaultMode}
                    onTabModeChange={groupModes.setDefaultMode}
                    onSelectPanel={runtime.activatePanel}
                    onUndo={runtime.undoLayout}
                    onRedo={runtime.redoLayout}
                    onAdd={() => runtime.addTemplatePanel()}
                    onCloseTab={runtime.closeActiveTab}
                    onCloseGroup={runtime.closeActiveGroup}
                    onCycleGroupNext={runtime.cycleGroupNext}
                    onCycleGroupPrevious={runtime.cycleGroupPrevious}
                    onSplitRight={() => runtime.splitPanel('right')}
                    onSplitDown={() => runtime.splitPanel('bottom')}
                    onSave={runtime.saveLayout}
                    onRestore={runtime.restoreLayout}
                />
                <div className='relative h-[68vh] overflow-hidden rounded-xl border bg-card'>
                    <div ref={runtime.setSurfaceNode} className='h-full w-full'>
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
                                disableDnd
                                hideBorders
                                disableTabsOverflowList
                                scrollbars='custom'
                            />
                        </DockviewUiContext.Provider>
                        <DropGuideOverlay guide={runtime.guide} />
                    </div>
                </div>
            </div>

            <DragOverlay>
                {panelDnd.activePanelTitle ? (
                    <div className='loop-drag-overlay'>{panelDnd.activePanelTitle}</div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
}

function SidebarDockviewDemo({
    onHandleChange,
}: {
    onHandleChange?: (handle: DockviewWorkspaceHandle | null) => void;
}) {
    const runtime = useDockviewWorkspace(
        'sidebar',
        SIDEBAR_STORAGE_KEY,
        PANEL_TEMPLATES
    );
    const groupModes = useGroupTabModes(runtime.apiRef, 'sidebar');
    const panelDnd = useWorkspacePanelDnd(runtime);
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
            moveGroup: runtime.moveGroupByDrop,
            cycleGroupMode: groupModes.cycleGroupMode,
            getGroupMode: groupModes.getGroupMode,
        }),
        [
            createTabInGroup,
            groupModes.cycleGroupMode,
            groupModes.getGroupMode,
            runtime.closeGroup,
            runtime.moveGroupByDrop,
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

    const handleDragStart = React.useCallback(
        (event: DragStartEvent) => {
            const kind = event.active.data.current?.kind as string | undefined;
            if (kind === 'panel') {
                setActiveTemplate(null);
                clearDnDGuide();
                panelDnd.handlePanelDragStart(event);
                return;
            }

            const template = event.active.data.current?.template as
                | PanelTemplate
                | undefined;
            setActiveTemplate(template ?? null);
        },
        [clearDnDGuide, panelDnd]
    );

    const handleDragMove = React.useCallback(
        (event: DragMoveEvent) => {
            const kind = event.active.data.current?.kind as string | undefined;
            if (kind === 'panel') {
                panelDnd.handlePanelDragMove(event);
                return;
            }

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
        [panelDnd, runtime.surfaceRef]
    );

    const handleDragEnd = React.useCallback(
        (event: DragEndEvent) => {
            const kind = event.active.data.current?.kind as string | undefined;
            if (kind === 'panel') {
                panelDnd.handlePanelDragEnd(event);
                return;
            }

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
        [clearDnDGuide, panelDnd, runtime]
    );

    const isPointerOverSurface = React.useMemo(() => {
        const pointer = pointerRef.current;
        const root = runtime.surfaceRef.current;
        if (!pointer || !root) return false;
        return isPointInsideRect(root.getBoundingClientRect(), pointer.x, pointer.y);
    }, [runtime.surfaceRef, externalGuide]);

    React.useEffect(() => {
        if (!onHandleChange) return;

        onHandleChange({
            workspaceId: 'sidebar',
            addTemplatePanel: () => runtime.addTemplatePanel(),
            activatePanel: runtime.activatePanel,
            closeActiveTab: runtime.closeActiveTab,
            closeActiveGroup: runtime.closeActiveGroup,
            cycleGroupNext: runtime.cycleGroupNext,
            cycleGroupPrevious: runtime.cycleGroupPrevious,
            splitPanel: runtime.splitPanel,
            saveLayout: runtime.saveLayout,
            restoreLayout: runtime.restoreLayout,
            undoLayout: runtime.undoLayout,
            redoLayout: runtime.redoLayout,
            cycleActiveGroupMode: groupModes.cycleActiveGroupMode,
            canUndo: runtime.canUndo,
            canRedo: runtime.canRedo,
            panelCount: runtime.panelCount,
            panels: runtime.panels,
        });

        return () => {
            onHandleChange(null);
        };
    }, [
        groupModes.cycleActiveGroupMode,
        onHandleChange,
        runtime.addTemplatePanel,
        runtime.activatePanel,
        runtime.canRedo,
        runtime.canUndo,
        runtime.closeActiveGroup,
        runtime.closeActiveTab,
        runtime.cycleGroupNext,
        runtime.cycleGroupPrevious,
        runtime.panelCount,
        runtime.panels,
        runtime.redoLayout,
        runtime.restoreLayout,
        runtime.saveLayout,
        runtime.splitPanel,
        runtime.undoLayout,
    ]);

    return (
        <DndContext
            sensors={panelDnd.sensors}
            collisionDetection={pointerWithin}
            onDragStart={handleDragStart}
            onDragMove={handleDragMove}
            onDragEnd={handleDragEnd}
            onDragCancel={() => {
                setActiveTemplate(null);
                clearDnDGuide();
                panelDnd.handlePanelDragCancel();
            }}>
            <div className='space-y-3'>
                <PanelToolbar
                    panelCount={runtime.panelCount}
                    panels={runtime.panels}
                    canUndo={runtime.canUndo}
                    canRedo={runtime.canRedo}
                    tabMode={groupModes.defaultMode}
                    onTabModeChange={groupModes.setDefaultMode}
                    onSelectPanel={runtime.activatePanel}
                    onUndo={runtime.undoLayout}
                    onRedo={runtime.redoLayout}
                    onAdd={() => runtime.addTemplatePanel()}
                    onCloseTab={runtime.closeActiveTab}
                    onCloseGroup={runtime.closeActiveGroup}
                    onCycleGroupNext={runtime.cycleGroupNext}
                    onCycleGroupPrevious={runtime.cycleGroupPrevious}
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
                                    disableDnd
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
                ) : panelDnd.activePanelTitle ? (
                    <div className='loop-drag-overlay'>{panelDnd.activePanelTitle}</div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
}

function DynamicPanelsScene() {
    const store = useGraphite<DynamicPanelsState>();
    const commit = useCommit<DynamicPanelsState>();
    const ui = useQuery<DynamicPanelsState, DynamicPanelsState['ui']>(
        (state) => state.ui
    );
    const intents = React.useMemo(
        () => createDynamicPanelsIntentRegistry(),
        []
    );
    const [shortcutBindings, setShortcutBindings] = React.useState<
        GraphiteShortcutBinding[]
    >(createDefaultDynamicPanelsShortcutBindings);
    const shortcuts = useDynamicPanelsShortcutSystem(
        intents,
        shortcutBindings,
        ui.shortcutsEnabled
    );
    const workspaceHandlesRef = React.useRef<
        Partial<Record<DynamicPanelsWorkspaceId, DockviewWorkspaceHandle>>
    >({});

    const setWorkspaceHandle = React.useCallback(
        (
            workspaceId: DynamicPanelsWorkspaceId,
            handle: DockviewWorkspaceHandle | null
        ) => {
            if (!handle) {
                delete workspaceHandlesRef.current[workspaceId];
                return;
            }
            workspaceHandlesRef.current[workspaceId] = handle;
        },
        []
    );

    React.useEffect(() => {
        return store.onCommit((record) => {
            const intentName = record.intent?.name as PanelCommandIntent | undefined;
            if (!intentName || !intentName.startsWith('panels/')) {
                return;
            }

            const payload = record.intent?.payload as
                | { workspace?: DynamicPanelsWorkspaceId }
                | undefined;
            const workspaceId =
                payload?.workspace ?? store.getState().ui.activeWorkspace;
            const runtime =
                workspaceHandlesRef.current[workspaceId] ??
                workspaceHandlesRef.current[store.getState().ui.activeWorkspace] ??
                workspaceHandlesRef.current.workbench ??
                workspaceHandlesRef.current.sidebar;
            if (!runtime) {
                return;
            }

            switch (intentName) {
                case 'panels/new-tab': {
                    runtime.addTemplatePanel();
                    break;
                }
                case 'panels/close-tab': {
                    runtime.closeActiveTab();
                    break;
                }
                case 'panels/close-group': {
                    runtime.closeActiveGroup();
                    break;
                }
                case 'panels/split-right': {
                    runtime.splitPanel('right');
                    break;
                }
                case 'panels/split-down': {
                    runtime.splitPanel('bottom');
                    break;
                }
                case 'panels/cycle-group-next': {
                    runtime.cycleGroupNext();
                    break;
                }
                case 'panels/cycle-group-previous': {
                    runtime.cycleGroupPrevious();
                    break;
                }
                case 'panels/save-layout': {
                    runtime.saveLayout();
                    break;
                }
                case 'panels/restore-layout': {
                    runtime.restoreLayout();
                    break;
                }
                case 'panels/undo-layout': {
                    runtime.undoLayout();
                    break;
                }
                case 'panels/redo-layout': {
                    runtime.redoLayout();
                    break;
                }
                case 'panels/cycle-tab-mode': {
                    runtime.cycleActiveGroupMode();
                    break;
                }
                default: {
                    break;
                }
            }
        });
    }, [store]);

    return (
        <div className='space-y-3'>
            <GraphiteIntentCommandMenu intents={intents} enabled />

            <div className='flex flex-wrap items-center gap-3 rounded-xl border bg-card/40 p-3 text-sm'>
                <div className='font-medium'>Dynamic Panels Studio</div>
                <Badge variant='outline'>
                    Active: {ui.activeWorkspace === 'workbench' ? 'Workbench' : 'Sidebar'}
                </Badge>
                <label className='inline-flex items-center gap-2'>
                    <input
                        type='checkbox'
                        checked={ui.shortcutsEnabled}
                        onChange={(event) =>
                            commit(
                                {
                                    ui: {
                                        shortcutsEnabled: $set(
                                            event.target.checked
                                        ),
                                    },
                                },
                                {
                                    source: 'panels/ui/shortcuts',
                                    history: false,
                                }
                            )
                        }
                    />
                    Keyboard Shortcuts
                </label>
                <label className='inline-flex items-center gap-2'>
                    <input
                        type='checkbox'
                        checked={ui.showShortcutManager}
                        onChange={(event) =>
                            commit(
                                {
                                    ui: {
                                        showShortcutManager: $set(
                                            event.target.checked
                                        ),
                                    },
                                },
                                {
                                    source: 'panels/ui/shortcut-manager',
                                    history: false,
                                }
                            )
                        }
                    />
                    Shortcut Manager
                </label>
            </div>

            {ui.showShortcutManager ? (
                <div className='rounded-xl border bg-card/40 p-3'>
                    <GraphiteShortcutManager
                        intents={intents}
                        bindings={shortcutBindings}
                        onBindingsChange={setShortcutBindings}
                        contextFields={DYNAMIC_PANELS_SHORTCUT_CONTEXT_FIELDS}
                    />
                </div>
            ) : null}

            <Tabs
                value={ui.activeWorkspace}
                onValueChange={(value) => {
                    const workspace =
                        value === 'sidebar'
                            ? 'sidebar'
                            : ('workbench' as DynamicPanelsWorkspaceId);
                    commit(
                        {
                            ui: {
                                activeWorkspace: $set(workspace),
                            },
                        },
                        {
                            source: 'panels/ui/active-workspace',
                            history: false,
                        }
                    );
                }}
                className='w-full'>
                <TabsList>
                    <TabsTrigger value='workbench'>Workbench Demo</TabsTrigger>
                    <TabsTrigger value='sidebar'>Sidebar Drop Demo</TabsTrigger>
                </TabsList>
                <TabsContent value='workbench' forceMount>
                    <CoreDockviewDemo
                        onHandleChange={(handle) =>
                            setWorkspaceHandle('workbench', handle)
                        }
                    />
                </TabsContent>
                <TabsContent value='sidebar' forceMount>
                    <SidebarDockviewDemo
                        onHandleChange={(handle) =>
                            setWorkspaceHandle('sidebar', handle)
                        }
                    />
                </TabsContent>
            </Tabs>

            <div className='rounded-xl border bg-card/40 p-3'>
                <GraphiteIntentBrowser
                    shortcuts={shortcuts}
                    bind={false}
                    active={ui.shortcutsEnabled}
                />
            </div>
        </div>
    );
}

export default function DynamicPanelsPage() {
    const store = React.useMemo(() => createDynamicPanelsStore(), []);
    return (
        <GraphiteProvider store={store}>
            <DynamicPanelsScene />
        </GraphiteProvider>
    );
}
