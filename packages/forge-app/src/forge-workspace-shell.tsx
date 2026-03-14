import * as React from 'react';
import type {
    BillingSummary,
    Organization,
    Run,
    RunDetail,
    SessionBootstrap,
    UsageSummary,
} from '@loop-kit/forge-contracts';
import { $set } from '@loop-kit/graphite';
import {
    createDockState,
    createGroupNode,
    createPanelNode,
    createSplitNode,
    type DockNodeId,
    type DockState,
} from '@loop-kit/dock';
import { GraphiteProvider, useGraphite, useIntent, useQuery } from '@loop-kit/graphite/react';
import {
    DockCanvas,
    DOCK_INTENTS,
    DOCK_LAYOUT_DISPATCH_OPTIONS,
    DOCK_UI_DISPATCH_OPTIONS,
    GraphiteDataTable,
    Panel,
    UI_INTENTS,
    cn,
    createDockStore,
    type DockBlockState,
    type GraphiteDataTableColumn,
} from '@loop-kit/ui';

import { createForgeStubDataSource, type ForgeShellDataSource } from './data-source';
import type { ForgeRouteId, ForgeShellConfig } from './types';
import {
    createForgeWorkspaceTree,
    deriveForgeInboxItems,
    deriveForgeProjectItems,
    deriveForgeSettingItems,
    deriveForgeTaskItems,
    type ForgeInboxItem,
    type ForgeProjectItem,
    type ForgeSettingItem,
    type ForgeTaskItem,
    type ForgeWorkspaceTreeItem,
} from './workspace-model';

type ForgeWorkspaceShellProps = {
    routeId: ForgeRouteId;
    shell: ForgeShellConfig;
};

type WorkspaceLoadState = 'idle' | 'loading' | 'ready' | 'error';
type WorkspaceSidebarSide = 'left' | 'right';
type WorkspaceOpenMode = 'reuse' | 'tab' | 'split-right';
type WorkspacePanelKind = 'content' | 'inspector' | 'activity';

type WorkspacePanelRecord = {
    panelId: string;
    itemId: string | null;
    kind: WorkspacePanelKind;
    title: string;
};

type WorkspaceSelection =
    | { kind: 'item'; itemId: string }
    | { kind: 'inbox'; inboxId: string }
    | { kind: 'organization'; organizationId: string }
    | { kind: 'project'; projectId: string }
    | { kind: 'run'; runId: string }
    | { kind: 'setting'; settingId: string }
    | { kind: 'task'; taskId: string };

const CONTENT_GROUP_ID = 'group-forge-content';
const INSPECTOR_GROUP_ID = 'group-forge-inspector';
const ACTIVITY_GROUP_ID = 'group-forge-activity';

const INBOX_PANEL_ID = 'panel-forge-inbox';
const INSPECTOR_PANEL_ID = 'panel-forge-inspector';
const ACTIVITY_PANEL_ID = 'panel-forge-activity';
const FORGE_DOCK_INTENTS = {
    addPanelSplitRight: 'forge/dock/add-panel-split-right',
    splitPanelRight: 'forge/dock/split-panel-right',
} as const;

const shortDateFormatter = new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
});

const compactNumberFormatter = new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
});

function createForgeWorkspaceDockFixture(): DockState {
    const inbox = createPanelNode(INBOX_PANEL_ID, 'Inbox');
    const inspector = createPanelNode(INSPECTOR_PANEL_ID, 'Inspector');
    const activity = createPanelNode(ACTIVITY_PANEL_ID, 'Activity');

    const contentGroup = createGroupNode(CONTENT_GROUP_ID, [inbox.id], inbox.id);
    const inspectorGroup = createGroupNode(INSPECTOR_GROUP_ID, [inspector.id], inspector.id);
    const activityGroup = createGroupNode(ACTIVITY_GROUP_ID, [activity.id], activity.id);

    const rightSplit = createSplitNode(
        'split-forge-right',
        'col',
        [inspectorGroup.id, activityGroup.id],
        [0.56, 0.44],
    );
    const rootSplit = createSplitNode(
        'split-forge-root',
        'row',
        [contentGroup.id, rightSplit.id],
        [0.7, 0.3],
    );

    return createDockState({
        floatRootId: 'float-root-forge',
        nodes: {
            [inbox.id]: inbox,
            [inspector.id]: inspector,
            [activity.id]: activity,
            [contentGroup.id]: contentGroup,
            [inspectorGroup.id]: inspectorGroup,
            [activityGroup.id]: activityGroup,
            [rightSplit.id]: rightSplit,
            [rootSplit.id]: rootSplit,
        },
        rootId: rootSplit.id,
    });
}

function formatDate(value: string | null | undefined) {
    if (!value) {
        return 'Pending';
    }

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
        return value;
    }

    return shortDateFormatter.format(parsed);
}

function formatQuota(usage: UsageSummary | null | undefined) {
    if (!usage) {
        return 'No usage summary';
    }

    const limit = usage.runsLimit ?? 0;
    if (limit <= 0) {
        return `${usage.runsUsed} runs`;
    }

    return `${usage.runsUsed}/${limit} runs`;
}

function formatTokenUsage(usage: UsageSummary | null | undefined) {
    if (!usage) {
        return 'No token summary';
    }

    return `${compactNumberFormatter.format(usage.tokensUsed)} / ${compactNumberFormatter.format(usage.tokensLimit ?? 0)} tokens`;
}

function toneClass(
    value:
        | Run['status']
        | ForgeInboxItem['status']
        | ForgeSettingItem['state']
        | ForgeTaskItem['priority']
        | ForgeProjectItem['state']
        | Organization['role'],
) {
    if (
        value === 'completed' ||
        value === 'configured' ||
        value === 'active' ||
        value === 'owner' ||
        value === 'p1'
    ) {
        return 'border-emerald-500/30 bg-emerald-500/12 text-emerald-100';
    }

    if (
        value === 'failed' ||
        value === 'blocked' ||
        value === 'attention' ||
        value === 'watch'
    ) {
        return 'border-amber-500/35 bg-amber-500/12 text-amber-100';
    }

    if (value === 'running' || value === 'queued') {
        return 'border-sky-500/35 bg-sky-500/12 text-sky-100';
    }

    return 'border-border/70 bg-background/70 text-foreground';
}

function SelectionBadge({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <span
            className={cn(
                'inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.18em]',
                className,
            )}>
            {children}
        </span>
    );
}

function WorkspaceMetric({
    detail,
    label,
    value,
}: {
    detail: string;
    label: string;
    value: string;
}) {
    return (
        <div className='rounded-[1.25rem] border border-border/65 bg-background/55 px-4 py-3'>
            <p className='text-[11px] uppercase tracking-[0.22em] text-muted-foreground'>
                {label}
            </p>
            <p className='mt-3 text-2xl font-semibold text-foreground'>{value}</p>
            <p className='mt-1 text-xs leading-6 text-muted-foreground'>{detail}</p>
        </div>
    );
}

function EmptyCollectionState({
    body,
    title,
}: {
    body: string;
    title: string;
}) {
    return (
        <div className='rounded-[1.3rem] border border-dashed border-border/70 bg-background/45 px-5 py-8 text-center'>
            <p className='text-sm font-medium text-foreground'>{title}</p>
            <p className='mx-auto mt-2 max-w-xl text-sm leading-7 text-muted-foreground'>{body}</p>
        </div>
    );
}

function findPanelRefById(
    dockState: DockState,
    panelId: string,
): { groupId: string; panelId: string } | null {
    for (const node of Object.values(dockState.nodes)) {
        if (node.kind !== 'group') {
            continue;
        }

        if (node.links.children.includes(panelId)) {
            return {
                groupId: node.id,
                panelId,
            };
        }
    }

    return null;
}

function findPanelRefByItemId(
    dockState: DockState,
    panelRecords: Record<string, WorkspacePanelRecord>,
    itemId: string,
): { groupId: string; panelId: string } | null {
    const panelEntry = Object.values(panelRecords).find(
        (entry) =>
            entry.kind === 'content' &&
            entry.itemId === itemId &&
            Boolean(dockState.nodes[entry.panelId]),
    );

    return panelEntry ? findPanelRefById(dockState, panelEntry.panelId) : null;
}

function resolveTargetGroupId(dockState: DockState, preferredGroupId: string) {
    const preferred = dockState.nodes[preferredGroupId];
    if (preferred?.kind === 'group') {
        return preferredGroupId;
    }

    const contentGroup = dockState.nodes[CONTENT_GROUP_ID];
    if (contentGroup?.kind === 'group') {
        return CONTENT_GROUP_ID;
    }

    const fallbackGroup = Object.values(dockState.nodes).find((node) => node.kind === 'group');
    return fallbackGroup?.id ?? CONTENT_GROUP_ID;
}

function nextPanelId(baseId: string, dockState: DockState, sequence: number) {
    return dockState.nodes[baseId] ? `${baseId}--${sequence}` : baseId;
}

function resolveOpenMode(event: React.MouseEvent<HTMLButtonElement>) {
    if (event.altKey) {
        return 'split-right' satisfies WorkspaceOpenMode;
    }

    if (event.metaKey || event.ctrlKey) {
        return 'tab' satisfies WorkspaceOpenMode;
    }

    return 'reuse' satisfies WorkspaceOpenMode;
}

function defaultPanelRecords(): Record<string, WorkspacePanelRecord> {
    return {
        [ACTIVITY_PANEL_ID]: {
            itemId: null,
            kind: 'activity',
            panelId: ACTIVITY_PANEL_ID,
            title: 'Activity',
        },
        [INBOX_PANEL_ID]: {
            itemId: 'inbox',
            kind: 'content',
            panelId: INBOX_PANEL_ID,
            title: 'Inbox',
        },
        [INSPECTOR_PANEL_ID]: {
            itemId: null,
            kind: 'inspector',
            panelId: INSPECTOR_PANEL_ID,
            title: 'Inspector',
        },
    };
}

function CollectionFrame({
    children,
    description,
    eyebrow,
    title,
}: {
    children: React.ReactNode;
    description: string;
    eyebrow: string;
    title: string;
}) {
    return (
        <div className='space-y-4'>
            <div className='flex flex-wrap items-start justify-between gap-3'>
                <div className='max-w-3xl'>
                    <p className='text-[11px] uppercase tracking-[0.24em] text-muted-foreground'>
                        {eyebrow}
                    </p>
                    <h3 className='mt-2 text-2xl font-semibold text-foreground'>{title}</h3>
                    <p className='mt-2 text-sm leading-7 text-muted-foreground'>{description}</p>
                </div>
            </div>
            {children}
        </div>
    );
}

function findWorkspaceItemByPanelTitle(
    tree: ReturnType<typeof createForgeWorkspaceTree>,
    panelTitleValue: string,
) {
    return Object.values(tree.itemMap).find((item) => item.panelTitle === panelTitleValue) ?? null;
}

function createUniqueDockNodeId(dockState: DockState, prefix: string) {
    let index = Object.keys(dockState.nodes).length + 1;
    let candidate = `${prefix}-${index}`;

    while (dockState.nodes[candidate]) {
        index += 1;
        candidate = `${prefix}-${index}`;
    }

    return candidate;
}

function findDockParentId(dockState: DockState, nodeId: string) {
    for (const node of Object.values(dockState.nodes)) {
        if (node.links.children.includes(nodeId)) {
            return node.id;
        }
    }

    return null;
}

function normalizeDockWeights(childCount: number) {
    return Array.from({ length: childCount }, () => 1 / Math.max(1, childCount));
}

function normalizeDockGroup(group: Extract<DockState['nodes'][string], { kind: 'group' }>) {
    if (
        group.data.activePanelId &&
        group.links.children.includes(group.data.activePanelId)
    ) {
        return group;
    }

    group.data.activePanelId = group.links.children[0];
    return group;
}

function splitDockPanelRight(
    dockState: DockState,
    payload: { groupId?: string; panelId?: string },
) {
    if (!payload.groupId || !payload.panelId) {
        return null;
    }

    const next = structuredClone(dockState) as DockState;
    const targetGroup = next.nodes[payload.groupId];
    if (!targetGroup || targetGroup.kind !== 'group') {
        return null;
    }

    if (
        !targetGroup.links.children.includes(payload.panelId) ||
        targetGroup.links.children.length <= 1
    ) {
        return null;
    }

    targetGroup.links.children = targetGroup.links.children.filter(
        (childId) => childId !== payload.panelId,
    );
    next.nodes[targetGroup.id] = normalizeDockGroup(targetGroup);

    const newGroupId = createUniqueDockNodeId(next, 'group-forge-split');
    const newGroup = createGroupNode(newGroupId, [payload.panelId], payload.panelId);
    next.nodes[newGroupId] = newGroup;

    const parentId = findDockParentId(next, targetGroup.id);
    const parent = parentId ? next.nodes[parentId] : null;

    if (parent?.kind === 'split' && parent.data.direction === 'row') {
        const targetIndex = parent.links.children.indexOf(targetGroup.id);
        parent.links.children.splice(targetIndex + 1, 0, newGroupId);
        parent.data.weights = normalizeDockWeights(parent.links.children.length);
        next.nodes[parent.id] = parent;
        return next;
    }

    const splitId = createUniqueDockNodeId(next, 'split-forge-row');
    const splitNode = createSplitNode(splitId, 'row', [targetGroup.id, newGroupId], [0.5, 0.5]);
    next.nodes[splitId] = splitNode;

    if (parentId) {
        const resolvedParent = next.nodes[parentId];
        if (!resolvedParent) {
            return null;
        }

        resolvedParent.links.children = resolvedParent.links.children.map((childId) =>
            childId === targetGroup.id ? splitId : childId,
        );
        next.nodes[parentId] = resolvedParent;
        return next;
    }

    if (next.rootId === targetGroup.id) {
        next.rootId = splitId;
        return next;
    }

    return null;
}

function addDockPanelSplitRight(
    dockState: DockState,
    payload: { groupId?: string; panelId?: string; title?: string },
) {
    if (!payload.groupId || !payload.panelId) {
        return null;
    }

    const next = structuredClone(dockState) as DockState;
    const targetGroup = next.nodes[payload.groupId];
    if (!targetGroup || targetGroup.kind !== 'group' || next.nodes[payload.panelId]) {
        return null;
    }

    const panelNode = createPanelNode(payload.panelId, payload.title ?? 'Panel');
    next.nodes[payload.panelId] = panelNode;
    targetGroup.links.children = [...targetGroup.links.children, payload.panelId];
    targetGroup.data.activePanelId = payload.panelId;
    next.nodes[targetGroup.id] = targetGroup;

    return splitDockPanelRight(next, {
        groupId: payload.groupId,
        panelId: payload.panelId,
    });
}

type WorkspaceDockSurfaceProps = {
    billing: BillingSummary | null;
    dataError: string | null;
    dataSource: ForgeShellDataSource;
    dataSourceLabel: string;
    dataState: WorkspaceLoadState;
    inboxItems: readonly ForgeInboxItem[];
    projects: readonly ForgeProjectItem[];
    routeId: ForgeRouteId;
    runs: readonly Run[];
    session: SessionBootstrap | null;
    sessionError: string | null;
    sessionState: WorkspaceLoadState;
    selectedOrganization: Organization | null;
    selectedOrganizationId: string | null;
    settings: readonly ForgeSettingItem[];
    shell: ForgeShellConfig;
    tasks: readonly ForgeTaskItem[];
    tree: ReturnType<typeof createForgeWorkspaceTree>;
    usage: UsageSummary | null;
    onSelectOrganization: (organizationId: string) => void;
};

function WorkspaceDockSurface({
    billing,
    dataError,
    dataSource,
    dataSourceLabel,
    dataState,
    inboxItems,
    projects,
    routeId,
    runs,
    session,
    sessionError,
    sessionState,
    selectedOrganization,
    selectedOrganizationId,
    settings,
    shell,
    tasks,
    tree,
    usage,
    onSelectOrganization,
}: WorkspaceDockSurfaceProps) {
    const store = useGraphite<DockBlockState>();
    const dispatchIntent = useIntent<DockBlockState>();
    const dockState = useQuery<DockBlockState, DockState>((state) => state.dock);

    const [sidebarSide, setSidebarSide] = React.useState<WorkspaceSidebarSide>('left');
    const [expandedSections, setExpandedSections] = React.useState<Record<string, boolean>>({
        admin: true,
        capture: true,
        operations: true,
        planning: true,
        projects: true,
    });
    const [activeContentGroupId, setActiveContentGroupId] = React.useState(CONTENT_GROUP_ID);
    const [focusedContentPanelId, setFocusedContentPanelId] = React.useState(INBOX_PANEL_ID);
    const [panelRecords, setPanelRecords] = React.useState<Record<string, WorkspacePanelRecord>>(
        defaultPanelRecords,
    );
    const [selection, setSelection] = React.useState<WorkspaceSelection>({
        itemId: 'inbox',
        kind: 'item',
    });
    const [selectedRunDetail, setSelectedRunDetail] = React.useState<RunDetail | null>(null);
    const [selectedRunDetailState, setSelectedRunDetailState] =
        React.useState<WorkspaceLoadState>('idle');
    const [selectedRunDetailError, setSelectedRunDetailError] = React.useState<string | null>(null);
    const panelSequence = React.useRef(1);

    const nextActions = React.useMemo(
        () => tasks.filter((task) => task.lane !== 'delegated'),
        [tasks],
    );
    const delegatedTasks = React.useMemo(
        () => tasks.filter((task) => task.lane === 'delegated'),
        [tasks],
    );
    const runningRuns = React.useMemo(
        () => runs.filter((run) => run.status === 'running' || run.status === 'queued'),
        [runs],
    );
    const focusedPanelRecord = panelRecords[focusedContentPanelId] ?? panelRecords[INBOX_PANEL_ID];
    const focusedItem = focusedPanelRecord?.itemId ? tree.itemMap[focusedPanelRecord.itemId] : null;
    const selectedRunId = selection.kind === 'run' ? selection.runId : null;
    React.useEffect(() => {
        const panelIds = new Set(
            Object.values(dockState.nodes)
                .filter((node) => node.kind === 'panel')
                .map((node) => node.id),
        );

        if (!panelIds.has(focusedContentPanelId) && panelIds.has(INBOX_PANEL_ID)) {
            setFocusedContentPanelId(INBOX_PANEL_ID);
            setSelection({ itemId: 'inbox', kind: 'item' });
        }
    }, [dockState.nodes, focusedContentPanelId]);

    React.useEffect(() => {
        if (!selectedRunId || !selectedOrganizationId || !dataSource.getRun) {
            setSelectedRunDetail(null);
            setSelectedRunDetailError(null);
            setSelectedRunDetailState('idle');
            return;
        }

        let cancelled = false;
        setSelectedRunDetailState('loading');
        setSelectedRunDetailError(null);

        void dataSource
            .getRun({
                organizationId: selectedOrganizationId,
                runId: selectedRunId,
            })
            .then((detail) => {
                if (cancelled) {
                    return;
                }

                setSelectedRunDetail(detail);
                setSelectedRunDetailState('ready');
            })
            .catch((error) => {
                if (cancelled) {
                    return;
                }

                setSelectedRunDetail(null);
                setSelectedRunDetailError(
                    error instanceof Error ? error.message : 'Failed to load run detail.',
                );
                setSelectedRunDetailState('error');
            });

        return () => {
            cancelled = true;
        };
    }, [dataSource, selectedOrganizationId, selectedRunId]);

    const focusPanel = React.useCallback(
        (panelRef: { groupId: string; panelId: string }, itemId: string) => {
            dispatchIntent(DOCK_INTENTS.activatePanel, panelRef, { history: false });
            dispatchIntent(
                UI_INTENTS.setActiveGroup,
                { groupId: panelRef.groupId },
                DOCK_UI_DISPATCH_OPTIONS,
            );
            setActiveContentGroupId(panelRef.groupId);
            setFocusedContentPanelId(panelRef.panelId);
            setSelection({ itemId, kind: 'item' });
        },
        [dispatchIntent],
    );

    const openItem = React.useCallback(
        (item: ForgeWorkspaceTreeItem, mode: WorkspaceOpenMode) => {
            const existing = findPanelRefByItemId(dockState, panelRecords, item.id);
            if (mode === 'reuse' && existing) {
                focusPanel(existing, item.id);
                return;
            }

            const targetGroupId = resolveTargetGroupId(dockState, activeContentGroupId);
            const basePanelId = `panel-forge-item-${item.id}`;
            const nextSequence = panelSequence.current + 1;
            const panelId = nextPanelId(basePanelId, dockState, nextSequence);
            panelSequence.current = nextSequence;

            setPanelRecords((current) => ({
                ...current,
                [panelId]: {
                    itemId: item.id,
                    kind: 'content',
                    panelId,
                    title: item.panelTitle,
                },
            }));

            if (mode === 'split-right') {
                dispatchIntent(
                    FORGE_DOCK_INTENTS.addPanelSplitRight,
                    {
                        groupId: targetGroupId,
                        panelId,
                        title: item.panelTitle,
                    },
                    DOCK_LAYOUT_DISPATCH_OPTIONS,
                );
            } else {
                dispatchIntent(
                    DOCK_INTENTS.addPanel,
                    {
                        groupId: targetGroupId,
                        panelId,
                        title: item.panelTitle,
                    },
                    DOCK_LAYOUT_DISPATCH_OPTIONS,
                );
            }

            const nextState = store.getState().dock;
            const nextPanelRef = findPanelRefById(nextState, panelId);
            if (nextPanelRef) {
                focusPanel(nextPanelRef, item.id);
            }
        },
        [activeContentGroupId, dispatchIntent, dockState, focusPanel, panelRecords, store],
    );

    const runColumns = React.useMemo<readonly GraphiteDataTableColumn<Run>[]>(
        () => [
            {
                cell: (row) => (
                    <div className='space-y-1'>
                        <p className='text-sm font-medium text-foreground'>{row.kind}</p>
                        <p className='text-xs text-muted-foreground'>{row.id.slice(0, 8)}</p>
                    </div>
                ),
                header: 'Run',
                key: 'run',
                sortable: true,
                sortValue: (row) => row.kind,
            },
            {
                cell: (row) => (
                    <SelectionBadge className={toneClass(row.status)}>{row.status}</SelectionBadge>
                ),
                header: 'Status',
                key: 'status',
                sortable: true,
                sortValue: (row) => row.status,
            },
            {
                header: 'Logs',
                key: 'logs',
                sortable: true,
                sortValue: (row) => row.logCount,
                value: (row) => String(row.logCount),
            },
            {
                header: 'Updated',
                key: 'updated',
                sortable: true,
                sortValue: (row) => row.updatedAt,
                value: (row) => formatDate(row.updatedAt),
            },
        ],
        [],
    );

    const organizationColumns = React.useMemo<readonly GraphiteDataTableColumn<Organization>[]>(
        () => [
            {
                cell: (row) => (
                    <div className='space-y-1'>
                        <p className='text-sm font-medium text-foreground'>{row.displayName}</p>
                        <p className='text-xs text-muted-foreground'>{row.slug}</p>
                    </div>
                ),
                header: 'Organization',
                key: 'organization',
                sortable: true,
                sortValue: (row) => row.displayName,
            },
            {
                cell: (row) => (
                    <SelectionBadge className={toneClass(row.role)}>{row.role}</SelectionBadge>
                ),
                header: 'Role',
                key: 'role',
                sortable: true,
                sortValue: (row) => row.role,
            },
            {
                header: 'Plan',
                key: 'plan',
                sortable: true,
                sortValue: (row) => row.billing.planKey ?? '',
                value: (row) => row.billing.planKey ?? 'trial',
            },
            {
                header: 'Usage',
                key: 'usage',
                sortable: true,
                sortValue: (row) => row.usage.runsUsed,
                value: (row) => formatQuota(row.usage),
            },
        ],
        [],
    );

    const inboxColumns = React.useMemo<readonly GraphiteDataTableColumn<ForgeInboxItem>[]>(
        () => [
            {
                cell: (row) => (
                    <div className='space-y-1'>
                        <p className='text-sm font-medium text-foreground'>{row.title}</p>
                        <p className='text-xs leading-6 text-muted-foreground'>{row.summary}</p>
                    </div>
                ),
                header: 'Signal',
                key: 'signal',
                sortable: true,
                sortValue: (row) => row.title,
            },
            {
                cell: (row) => (
                    <SelectionBadge className={toneClass(row.status)}>{row.status}</SelectionBadge>
                ),
                header: 'Status',
                key: 'status',
                sortable: true,
                sortValue: (row) => row.status,
            },
            {
                header: 'Source',
                key: 'source',
                sortable: true,
                sortValue: (row) => row.source,
                value: (row) => row.source,
            },
        ],
        [],
    );

    const taskColumns = React.useMemo<readonly GraphiteDataTableColumn<ForgeTaskItem>[]>(
        () => [
            {
                cell: (row) => (
                    <div className='space-y-1'>
                        <p className='text-sm font-medium text-foreground'>{row.title}</p>
                        <p className='text-xs leading-6 text-muted-foreground'>{row.summary}</p>
                    </div>
                ),
                header: 'Task',
                key: 'task',
                sortable: true,
                sortValue: (row) => row.title,
            },
            {
                header: 'Lane',
                key: 'lane',
                sortable: true,
                sortValue: (row) => row.lane,
                value: (row) => row.lane,
            },
            {
                cell: (row) => (
                    <SelectionBadge className={toneClass(row.priority)}>{row.priority}</SelectionBadge>
                ),
                header: 'Priority',
                key: 'priority',
                sortable: true,
                sortValue: (row) => row.priority,
            },
        ],
        [],
    );

    const projectColumns = React.useMemo<readonly GraphiteDataTableColumn<ForgeProjectItem>[]>(
        () => [
            {
                cell: (row) => (
                    <div className='space-y-1'>
                        <p className='text-sm font-medium text-foreground'>{row.title}</p>
                        <p className='text-xs leading-6 text-muted-foreground'>{row.summary}</p>
                    </div>
                ),
                header: 'Project',
                key: 'project',
                sortable: true,
                sortValue: (row) => row.title,
            },
            {
                header: 'Owner',
                key: 'owner',
                sortable: true,
                sortValue: (row) => row.owner,
                value: (row) => row.owner,
            },
            {
                header: 'Next step',
                key: 'nextStep',
                sortable: true,
                sortValue: (row) => row.nextStep,
                value: (row) => row.nextStep,
            },
            {
                cell: (row) => (
                    <SelectionBadge className={toneClass(row.state)}>{row.state}</SelectionBadge>
                ),
                header: 'State',
                key: 'state',
                sortable: true,
                sortValue: (row) => row.state,
            },
        ],
        [],
    );

    const settingsColumns = React.useMemo<readonly GraphiteDataTableColumn<ForgeSettingItem>[]>(
        () => [
            {
                cell: (row) => (
                    <div className='space-y-1'>
                        <p className='text-sm font-medium text-foreground'>{row.title}</p>
                        <p className='text-xs leading-6 text-muted-foreground'>{row.summary}</p>
                    </div>
                ),
                header: 'Setting',
                key: 'setting',
                sortable: true,
                sortValue: (row) => row.title,
            },
            {
                header: 'Scope',
                key: 'scope',
                sortable: true,
                sortValue: (row) => row.scope,
                value: (row) => row.scope,
            },
            {
                cell: (row) => (
                    <SelectionBadge className={toneClass(row.state)}>{row.state}</SelectionBadge>
                ),
                header: 'State',
                key: 'state',
                sortable: true,
                sortValue: (row) => row.state,
            },
        ],
        [],
    );

    const renderContentPanel = React.useCallback(
        (panelId: string) => {
            const record = panelRecords[panelId];
            const item =
                (record?.itemId ? tree.itemMap[record.itemId] : null) ??
                findWorkspaceItemByPanelTitle(tree, dockState.nodes[panelId]?.kind === 'panel'
                    ? dockState.nodes[panelId].data.title
                    : '');
            if (!item) {
                return (
                    <EmptyCollectionState
                        title='Panel is not mapped yet'
                        body='Open an item from the sidebar to attach a GTD collection or project view here.'
                    />
                );
            }

            if (sessionState === 'loading') {
                return (
                    <EmptyCollectionState
                        title='Loading workspace'
                        body='Bootstrapping organizations, runs, and operator context.'
                    />
                );
            }

            if (sessionState === 'error') {
                return (
                    <EmptyCollectionState
                        title='Workspace bootstrap failed'
                        body={sessionError ?? 'The shared Forge shell could not load session context.'}
                    />
                );
            }

            if (dataState === 'loading' && item.kind !== 'organizations') {
                return (
                    <EmptyCollectionState
                        title='Loading organization data'
                        body='Pulling billing, usage, and run state for the active workspace.'
                    />
                );
            }

            if (dataState === 'error' && item.kind !== 'organizations') {
                return (
                    <EmptyCollectionState
                        title='Organization data failed to load'
                        body={dataError ?? 'The organization-specific view could not be hydrated.'}
                    />
                );
            }

            if (item.kind === 'inbox') {
                return (
                    <CollectionFrame
                        eyebrow='capture'
                        title='Inbox'
                        description='New operational signals land here first, then get pushed into agent-facing work or dismissed.'>
                        <div className='grid gap-3 xl:grid-cols-3'>
                            <WorkspaceMetric
                                label='Signals'
                                value={String(inboxItems.length)}
                                detail='Fresh interrupts waiting for triage.'
                            />
                            <WorkspaceMetric
                                label='Active runs'
                                value={String(runningRuns.length)}
                                detail='Live execution currently in motion.'
                            />
                            <WorkspaceMetric
                                label='Quota posture'
                                value={formatQuota(usage)}
                                detail='Available room before the next preview surge.'
                            />
                        </div>
                        <GraphiteDataTable
                            ariaLabel='Inbox'
                            columns={inboxColumns}
                            emptyState={
                                <EmptyCollectionState
                                    title='No inbox signals'
                                    body='The workspace is calm. Use the next actions list to pull work forward.'
                                />
                            }
                            onRowClick={(row) => setSelection({ inboxId: row.id, kind: 'inbox' })}
                            rowKey={(row) => row.id}
                            rows={inboxItems}
                        />
                    </CollectionFrame>
                );
            }

            if (item.kind === 'next-actions' || item.kind === 'delegated') {
                const rows = item.kind === 'next-actions' ? nextActions : delegatedTasks;
                return (
                    <CollectionFrame
                        eyebrow='gtd'
                        title={item.panelTitle}
                        description={item.description}>
                        <GraphiteDataTable
                            ariaLabel={item.panelTitle}
                            columns={taskColumns}
                            emptyState={
                                <EmptyCollectionState
                                    title={`No ${item.panelTitle.toLowerCase()} right now`}
                                    body='This lane is empty. Pull a signal in from the inbox or let the next project checkpoint create one.'
                                />
                            }
                            onRowClick={(row) => setSelection({ kind: 'task', taskId: row.id })}
                            rowKey={(row) => row.id}
                            rows={rows}
                        />
                    </CollectionFrame>
                );
            }

            if (item.kind === 'projects') {
                return (
                    <CollectionFrame
                        eyebrow='planning'
                        title='Projects'
                        description='Projects collect outcome-oriented work and give the sidebar a real tree instead of a flat list.'>
                        <GraphiteDataTable
                            ariaLabel='Projects'
                            columns={projectColumns}
                            emptyState={
                                <EmptyCollectionState
                                    title='No active projects'
                                    body='Add project nodes as Forge gets real product areas and customer workstreams.'
                                />
                            }
                            onRowClick={(row) => setSelection({ kind: 'project', projectId: row.id })}
                            renderRowActions={(row) => (
                                <button
                                    type='button'
                                    className='rounded-full border border-border/70 bg-background/70 px-3 py-1 text-xs text-foreground transition-colors hover:border-primary/45 hover:text-primary'
                                    onClick={() => {
                                        const child = tree.itemMap[row.id];
                                        if (child) {
                                            openItem(child, 'tab');
                                        }
                                    }}>
                                    Open
                                </button>
                            )}
                            rowKey={(row) => row.id}
                            rows={projects}
                        />
                    </CollectionFrame>
                );
            }

            if (item.kind === 'project') {
                const project = projects.find((entry) => entry.id === item.id);
                if (!project) {
                    return (
                        <EmptyCollectionState
                            title='Project is not available'
                            body='This project node no longer maps to active preview data.'
                        />
                    );
                }

                return (
                    <CollectionFrame
                        eyebrow='project detail'
                        title={project.title}
                        description={project.summary}>
                        <div className='grid gap-3 xl:grid-cols-3'>
                            <WorkspaceMetric
                                label='State'
                                value={project.state}
                                detail='Current execution posture.'
                            />
                            <WorkspaceMetric
                                label='Owner'
                                value={project.owner}
                                detail='Who currently owns the thread.'
                            />
                            <WorkspaceMetric
                                label='Next step'
                                value={project.nextStep}
                                detail='Immediate follow-up to keep motion alive.'
                            />
                        </div>
                        <Panel variant='muted' className='p-5'>
                            <p className='text-[11px] uppercase tracking-[0.22em] text-muted-foreground'>
                                Related actions
                            </p>
                            <div className='mt-4 space-y-2'>
                                {nextActions.slice(0, 3).map((task) => (
                                    <div
                                        key={task.id}
                                        className='rounded-[1rem] border border-border/65 bg-background/55 px-4 py-3'>
                                        <div className='flex items-center justify-between gap-3'>
                                            <p className='text-sm font-medium text-foreground'>{task.title}</p>
                                            <SelectionBadge className={toneClass(task.priority)}>
                                                {task.priority}
                                            </SelectionBadge>
                                        </div>
                                        <p className='mt-2 text-sm leading-7 text-muted-foreground'>
                                            {task.summary}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </Panel>
                    </CollectionFrame>
                );
            }

            if (item.kind === 'runs') {
                return (
                    <CollectionFrame
                        eyebrow='operations'
                        title='Runs'
                        description='This is the run queue surface that should eventually become the default AI harness operations feed.'>
                        <div className='grid gap-3 xl:grid-cols-3'>
                            <WorkspaceMetric
                                label='Queued or running'
                                value={String(runningRuns.length)}
                                detail='Current live execution pressure.'
                            />
                            <WorkspaceMetric
                                label='Artifacts'
                                value={compactNumberFormatter.format(
                                    runs.reduce((total, run) => total + run.artifactCount, 0),
                                )}
                                detail='Published artifacts across recent runs.'
                            />
                            <WorkspaceMetric
                                label='Latest update'
                                value={runs[0] ? formatDate(runs[0].updatedAt) : 'No runs'}
                                detail='Most recent run heartbeat.'
                            />
                        </div>
                        <GraphiteDataTable
                            ariaLabel='Runs'
                            columns={runColumns}
                            emptyState={
                                <EmptyCollectionState
                                    title='No runs yet'
                                    body='The active organization has not created any workflow or sandbox activity.'
                                />
                            }
                            onRowClick={(row) => setSelection({ kind: 'run', runId: row.id })}
                            rowKey={(row) => row.id}
                            rows={runs}
                        />
                    </CollectionFrame>
                );
            }

            if (item.kind === 'usage') {
                return (
                    <CollectionFrame
                        eyebrow='operations'
                        title='Usage'
                        description='Usage is the first honest signal about whether the AI harness is healthy or just noisy.'>
                        <div className='grid gap-3 xl:grid-cols-3'>
                            <WorkspaceMetric
                                label='Run quota'
                                value={formatQuota(usage)}
                                detail='Current run utilization.'
                            />
                            <WorkspaceMetric
                                label='Token budget'
                                value={formatTokenUsage(usage)}
                                detail='Current token burn across the active period.'
                            />
                            <WorkspaceMetric
                                label='Period ends'
                                value={formatDate(usage?.periodEnd)}
                                detail='Current usage window.'
                            />
                        </div>
                        <Panel variant='muted' className='p-5'>
                            <p className='text-[11px] uppercase tracking-[0.22em] text-muted-foreground'>
                                Enforcement posture
                            </p>
                            <div className='mt-4 flex flex-wrap items-center gap-3'>
                                <SelectionBadge
                                    className={
                                        usage?.enforcementState === 'nearing_limit'
                                            ? 'border-amber-500/35 bg-amber-500/12 text-amber-100'
                                            : 'border-emerald-500/30 bg-emerald-500/12 text-emerald-100'
                                    }>
                                    {usage?.enforcementState ?? 'unknown'}
                                </SelectionBadge>
                                <p className='max-w-3xl text-sm leading-7 text-muted-foreground'>
                                    Use this surface to keep agent automation productive instead of accidentally spending budget on churn.
                                </p>
                            </div>
                        </Panel>
                    </CollectionFrame>
                );
            }

            if (item.kind === 'billing') {
                return (
                    <CollectionFrame
                        eyebrow='commercial'
                        title='Billing'
                        description='Billing and entitlements are not back-office trivia here. They control what the harness is allowed to do.'>
                        <div className='grid gap-3 xl:grid-cols-3'>
                            <WorkspaceMetric
                                label='Provider'
                                value={billing?.provider ?? 'unknown'}
                                detail='Current billing projection source.'
                            />
                            <WorkspaceMetric
                                label='State'
                                value={billing?.state ?? 'unknown'}
                                detail='Current billing posture.'
                            />
                            <WorkspaceMetric
                                label='Plan'
                                value={billing?.planKey ?? 'trial'}
                                detail='Current entitlement bundle.'
                            />
                        </div>
                        <Panel variant='muted' className='p-5'>
                            <p className='text-[11px] uppercase tracking-[0.22em] text-muted-foreground'>
                                Entitlements
                            </p>
                            <div className='mt-4 grid gap-2 md:grid-cols-2'>
                                {(billing?.entitlements ?? []).map((entry) => (
                                    <div
                                        key={entry.key}
                                        className='rounded-[1rem] border border-border/65 bg-background/55 px-4 py-3'>
                                        <div className='flex items-center justify-between gap-3'>
                                            <p className='text-sm font-medium text-foreground'>{entry.key}</p>
                                            <SelectionBadge
                                                className={
                                                    entry.granted
                                                        ? 'border-emerald-500/30 bg-emerald-500/12 text-emerald-100'
                                                        : 'border-rose-500/35 bg-rose-500/12 text-rose-100'
                                                }>
                                                {entry.granted ? 'granted' : 'blocked'}
                                            </SelectionBadge>
                                        </div>
                                        <p className='mt-2 text-sm text-muted-foreground'>
                                            {entry.reason ?? 'No reason projected.'}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </Panel>
                    </CollectionFrame>
                );
            }

            if (item.kind === 'organizations') {
                return (
                    <CollectionFrame
                        eyebrow='account'
                        title='Organizations'
                        description='Organizations anchor the workspace context and are the first real multi-tenant axis in Forge.'>
                        <GraphiteDataTable
                            ariaLabel='Organizations'
                            columns={organizationColumns}
                            emptyState={
                                <EmptyCollectionState
                                    title='No organizations'
                                    body='The current session does not have any visible organizations.'
                                />
                            }
                            onRowClick={(row) => {
                                onSelectOrganization(row.id);
                                setSelection({ kind: 'organization', organizationId: row.id });
                            }}
                            renderRowActions={(row) => (
                                <button
                                    type='button'
                                    className='rounded-full border border-border/70 bg-background/70 px-3 py-1 text-xs text-foreground transition-colors hover:border-primary/45 hover:text-primary'
                                    onClick={() => {
                                        onSelectOrganization(row.id);
                                        setSelection({ kind: 'organization', organizationId: row.id });
                                    }}>
                                    {row.id === selectedOrganizationId ? 'Active' : 'Select'}
                                </button>
                            )}
                            rowKey={(row) => row.id}
                            rows={session?.organizations ?? []}
                        />
                    </CollectionFrame>
                );
            }

            if (item.kind === 'settings') {
                return (
                    <CollectionFrame
                        eyebrow='shell policy'
                        title='Settings'
                        description='Settings are still early, but this is where account, workspace, and integration defaults can converge.'>
                        <GraphiteDataTable
                            ariaLabel='Settings'
                            columns={settingsColumns}
                            emptyState={
                                <EmptyCollectionState
                                    title='No settings'
                                    body='Settings have not been modeled yet for this workspace.'
                                />
                            }
                            onRowClick={(row) => setSelection({ kind: 'setting', settingId: row.id })}
                            rowKey={(row) => row.id}
                            rows={settings}
                        />
                    </CollectionFrame>
                );
            }

            return (
                <EmptyCollectionState
                    title='Not implemented yet'
                    body='This item exists in the GTD tree, but the surface behind it is not connected yet.'
                />
            );
        },
        [
            billing,
            dataError,
            dataState,
            delegatedTasks,
            inboxColumns,
            inboxItems,
            nextActions,
            onSelectOrganization,
            organizationColumns,
            panelRecords,
            projects,
            projectColumns,
            runColumns,
            runningRuns,
            dockState.nodes,
            session,
            sessionError,
            sessionState,
            selectedOrganizationId,
            settings,
            settingsColumns,
            taskColumns,
            tree.itemMap,
            usage,
            runs,
        ],
    );

    const renderInspectorPanel = React.useCallback(() => {
        if (selection.kind === 'run') {
            const run = runs.find((entry) => entry.id === selection.runId);
            return (
                <div className='space-y-4'>
                    <div>
                        <p className='text-[11px] uppercase tracking-[0.24em] text-muted-foreground'>
                            Inspector
                        </p>
                        <h3 className='mt-2 text-xl font-semibold text-foreground'>
                            {run?.kind ?? 'Run detail'}
                        </h3>
                    </div>

                    <div className='flex flex-wrap gap-2'>
                        <SelectionBadge className={toneClass(run?.status ?? 'queued')}>
                            {run?.status ?? 'unknown'}
                        </SelectionBadge>
                        <SelectionBadge>{run?.id.slice(0, 8) ?? selection.runId.slice(0, 8)}</SelectionBadge>
                    </div>

                    <div className='grid gap-2'>
                        <div className='rounded-[1rem] border border-border/65 bg-background/55 px-4 py-3 text-sm text-muted-foreground'>
                            Created {formatDate(run?.createdAt)}
                        </div>
                        <div className='rounded-[1rem] border border-border/65 bg-background/55 px-4 py-3 text-sm text-muted-foreground'>
                            Updated {formatDate(run?.updatedAt)}
                        </div>
                    </div>

                    {selectedRunDetailState === 'loading' ? (
                        <EmptyCollectionState
                            title='Loading run detail'
                            body='Fetching logs and artifacts for the selected run.'
                        />
                    ) : null}

                    {selectedRunDetailState === 'error' ? (
                        <EmptyCollectionState
                            title='Run detail failed'
                            body={selectedRunDetailError ?? 'The run detail could not be loaded.'}
                        />
                    ) : null}

                    {selectedRunDetail ? (
                        <Panel variant='muted' className='p-4'>
                            <p className='text-[11px] uppercase tracking-[0.22em] text-muted-foreground'>
                                Artifacts
                            </p>
                            <div className='mt-2 space-y-1.5'>
                                {selectedRunDetail.artifacts.slice(0, 4).map((artifact) => (
                                    <div
                                        key={artifact.id}
                                        className='rounded-[1rem] border border-border/65 bg-background/55 px-4 py-3'>
                                        <p className='text-sm font-medium text-foreground'>{artifact.name}</p>
                                        <p className='mt-1 text-xs text-muted-foreground'>
                                            {artifact.kind} • {artifact.contentType}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </Panel>
                    ) : null}
                </div>
            );
        }

        if (selection.kind === 'organization') {
            const organization =
                session?.organizations.find((entry) => entry.id === selection.organizationId) ?? null;
            return (
                <div className='space-y-4'>
                    <div>
                        <p className='text-[11px] uppercase tracking-[0.24em] text-muted-foreground'>
                            Organization
                        </p>
                        <h3 className='mt-2 text-xl font-semibold text-foreground'>
                            {organization?.displayName ?? 'Organization'}
                        </h3>
                    </div>
                    <div className='grid gap-2'>
                        <div className='rounded-[1rem] border border-border/65 bg-background/55 px-4 py-3'>
                            <p className='text-[11px] uppercase tracking-[0.22em] text-muted-foreground'>
                                Role
                            </p>
                            <p className='mt-2 text-sm text-foreground'>{organization?.role ?? 'unknown'}</p>
                        </div>
                        <div className='rounded-[1rem] border border-border/65 bg-background/55 px-4 py-3'>
                            <p className='text-[11px] uppercase tracking-[0.22em] text-muted-foreground'>
                                Billing
                            </p>
                            <p className='mt-2 text-sm text-foreground'>
                                {organization?.billing.planKey ?? 'trial'} • {organization?.billing.state ?? 'unknown'}
                            </p>
                        </div>
                        <div className='rounded-[1rem] border border-border/65 bg-background/55 px-4 py-3'>
                            <p className='text-[11px] uppercase tracking-[0.22em] text-muted-foreground'>
                                Usage
                            </p>
                            <p className='mt-2 text-sm text-foreground'>{formatQuota(organization?.usage)}</p>
                        </div>
                    </div>
                </div>
            );
        }

        if (selection.kind === 'project') {
            const project = projects.find((entry) => entry.id === selection.projectId);
            return (
                <div className='space-y-4'>
                    <div>
                        <p className='text-[11px] uppercase tracking-[0.24em] text-muted-foreground'>
                            Project
                        </p>
                        <h3 className='mt-2 text-xl font-semibold text-foreground'>
                            {project?.title ?? 'Project'}
                        </h3>
                    </div>
                    <p className='text-sm leading-7 text-muted-foreground'>{project?.summary}</p>
                    <Panel variant='muted' className='p-4'>
                        <p className='text-[11px] uppercase tracking-[0.22em] text-muted-foreground'>
                            Next step
                        </p>
                        <p className='mt-2 text-sm text-foreground'>{project?.nextStep ?? 'No step yet.'}</p>
                    </Panel>
                </div>
            );
        }

        if (selection.kind === 'task') {
            const task = tasks.find((entry) => entry.id === selection.taskId);
            return (
                <div className='space-y-4'>
                    <div>
                        <p className='text-[11px] uppercase tracking-[0.24em] text-muted-foreground'>
                            Task
                        </p>
                        <h3 className='mt-2 text-xl font-semibold text-foreground'>
                            {task?.title ?? 'Task'}
                        </h3>
                    </div>
                    <p className='text-sm leading-7 text-muted-foreground'>{task?.summary}</p>
                    <div className='flex flex-wrap gap-2'>
                        <SelectionBadge>{task?.lane ?? 'lane'}</SelectionBadge>
                        {task ? (
                            <SelectionBadge className={toneClass(task.priority)}>
                                {task.priority}
                            </SelectionBadge>
                        ) : null}
                    </div>
                </div>
            );
        }

        if (selection.kind === 'inbox') {
            const inbox = inboxItems.find((entry) => entry.id === selection.inboxId);
            return (
                <div className='space-y-4'>
                    <div>
                        <p className='text-[11px] uppercase tracking-[0.24em] text-muted-foreground'>
                            Inbox signal
                        </p>
                        <h3 className='mt-2 text-xl font-semibold text-foreground'>
                            {inbox?.title ?? 'Signal'}
                        </h3>
                    </div>
                    <p className='text-sm leading-7 text-muted-foreground'>{inbox?.summary}</p>
                    {inbox ? (
                        <SelectionBadge className={toneClass(inbox.status)}>{inbox.status}</SelectionBadge>
                    ) : null}
                </div>
            );
        }

        if (selection.kind === 'setting') {
            const setting = settings.find((entry) => entry.id === selection.settingId);
            return (
                <div className='space-y-4'>
                    <div>
                        <p className='text-[11px] uppercase tracking-[0.24em] text-muted-foreground'>
                            Setting
                        </p>
                        <h3 className='mt-2 text-xl font-semibold text-foreground'>
                            {setting?.title ?? 'Setting'}
                        </h3>
                    </div>
                    <p className='text-sm leading-7 text-muted-foreground'>{setting?.summary}</p>
                    {setting ? (
                        <SelectionBadge className={toneClass(setting.state)}>
                            {setting.state}
                        </SelectionBadge>
                    ) : null}
                </div>
            );
        }

        return (
            <div className='space-y-4'>
                <div>
                    <p className='text-[11px] uppercase tracking-[0.24em] text-muted-foreground'>
                        Inspector
                    </p>
                    <h3 className='mt-2 text-xl font-semibold text-foreground'>
                        {focusedItem?.panelTitle ?? 'Select a panel'}
                    </h3>
                </div>
                <p className='text-sm leading-7 text-muted-foreground'>
                    {focusedItem?.description ??
                        'Select a table row or switch panels to see more context here.'}
                </p>
                {selectedOrganization ? (
                    <Panel variant='muted' className='p-4'>
                        <p className='text-[11px] uppercase tracking-[0.22em] text-muted-foreground'>
                            Active workspace
                        </p>
                        <p className='mt-2 text-sm font-medium text-foreground'>
                            {selectedOrganization.displayName}
                        </p>
                        <p className='mt-1 text-sm text-muted-foreground'>{shell.workspaceName}</p>
                    </Panel>
                ) : null}
            </div>
        );
    }, [
        focusedItem,
        inboxItems,
        projects,
        selectedOrganization,
        selectedRunDetail,
        selectedRunDetailError,
        selectedRunDetailState,
        selection,
        session?.organizations,
        settings,
        shell.workspaceName,
        tasks,
        runs,
    ]);

    const renderActivityPanel = React.useCallback(() => {
        const runLogs = selectedRunDetail?.logs.slice(-6).reverse() ?? [];

        return (
            <div className='space-y-4'>
                <div>
                    <p className='text-[11px] uppercase tracking-[0.24em] text-muted-foreground'>
                        Activity
                    </p>
                    <h3 className='mt-2 text-xl font-semibold text-foreground'>
                        {selectedRunId ? 'Selected run feed' : 'Workspace activity'}
                    </h3>
                </div>

                {runLogs.length > 0 ? (
                    <div className='space-y-2'>
                        {runLogs.map((entry) => (
                            <div
                                key={`${entry.index}-${entry.timestamp}`}
                                className='rounded-[1rem] border border-border/65 bg-background/55 px-4 py-3'>
                                <div className='flex items-center justify-between gap-3'>
                                    <SelectionBadge>{entry.level}</SelectionBadge>
                                    <span className='text-[11px] text-muted-foreground'>
                                        {formatDate(entry.timestamp)}
                                    </span>
                                </div>
                                <p className='mt-2 text-sm leading-7 text-foreground'>{entry.message}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className='space-y-2'>
                        {runs.slice(0, 5).map((run) => (
                            <div
                                key={run.id}
                                className='rounded-[1rem] border border-border/65 bg-background/55 px-4 py-3'>
                                <div className='flex items-center justify-between gap-3'>
                                    <p className='text-sm font-medium text-foreground'>{run.kind}</p>
                                    <SelectionBadge className={toneClass(run.status)}>
                                        {run.status}
                                    </SelectionBadge>
                                </div>
                                <p className='mt-2 text-xs text-muted-foreground'>
                                    Updated {formatDate(run.updatedAt)}
                                </p>
                            </div>
                        ))}
                    </div>
                )}

                <Panel variant='muted' className='p-4'>
                    <p className='text-[11px] uppercase tracking-[0.22em] text-muted-foreground'>
                        Opening model
                    </p>
                    <div className='mt-3 space-y-2 text-sm text-muted-foreground'>
                        <p>Click to focus or reuse a panel.</p>
                        <p>Ctrl/Cmd-click to open a new tab.</p>
                        <p>Alt-click to split the current content group to the right.</p>
                    </div>
                </Panel>
            </div>
        );
    }, [runs, selectedRunDetail, selectedRunId]);

    const renderPanelBody = React.useCallback(
        (panelId: DockNodeId | null) => {
            if (!panelId) {
                return (
                    <EmptyCollectionState
                        title='Empty panel group'
                        body='Open a sidebar item to populate this dock group.'
                    />
                );
            }

            if (panelId === INSPECTOR_PANEL_ID) {
                return renderInspectorPanel();
            }

            if (panelId === ACTIVITY_PANEL_ID) {
                return renderActivityPanel();
            }

            return renderContentPanel(panelId);
        },
        [renderActivityPanel, renderContentPanel, renderInspectorPanel],
    );

    return (
        <div
            className={cn(
                'grid gap-5',
                sidebarSide === 'left'
                    ? 'xl:grid-cols-[18rem_minmax(0,1fr)]'
                    : 'xl:grid-cols-[minmax(0,1fr),18rem]',
            )}>
            {sidebarSide === 'left' ? (
                <Panel className='overflow-hidden p-0 xl:sticky xl:top-4 xl:self-start'>
                    <div className='border-b border-border/60 px-4 py-4'>
                        <div className='flex items-start justify-between gap-3'>
                                <div>
                                    <p className='text-[10px] uppercase tracking-[0.28em] text-muted-foreground'>
                                        Workspace
                                    </p>
                                    <h2 className='mt-2 text-lg font-semibold tracking-[-0.02em] text-foreground'>
                                        {selectedOrganization?.displayName ?? shell.organizationName}
                                    </h2>
                                    <p className='mt-1 text-sm text-muted-foreground'>
                                        {shell.workspaceName} • {shell.environmentLabel}
                                    </p>
                                </div>
                                <SelectionBadge>{dataSourceLabel}</SelectionBadge>
                            </div>

                        <div className='mt-4 inline-flex rounded-full border border-border/65 bg-background/70 p-1'>
                            <button
                                type='button'
                                className='rounded-full bg-primary/14 px-3 py-1 text-xs text-foreground transition-colors'
                                onClick={() => setSidebarSide('left')}>
                                Sidebar Left
                            </button>
                            <button
                                type='button'
                                className='rounded-full px-3 py-1 text-xs text-muted-foreground transition-colors'
                                onClick={() => setSidebarSide('right')}>
                                Sidebar Right
                            </button>
                        </div>
                    </div>

                    <div className='border-b border-border/60 px-3 py-3'>
                            <p className='px-2 text-[10px] uppercase tracking-[0.28em] text-muted-foreground'>
                                Organizations
                            </p>
                            <div className='mt-3 space-y-2'>
                                {(session?.organizations ?? []).map((organization) => (
                                    <button
                                        key={organization.id}
                                        type='button'
                                        data-testid={`forge-org-${organization.slug}`}
                                        className={cn(
                                            'w-full rounded-[1rem] border px-3 py-2.5 text-left transition-colors',
                                            organization.id === selectedOrganizationId
                                                ? 'border-primary/30 bg-primary/12'
                                                : 'border-transparent bg-background/15 hover:border-border/50 hover:bg-background/65',
                                        )}
                                        onClick={() => {
                                            onSelectOrganization(organization.id);
                                            setSelection({
                                                kind: 'organization',
                                                organizationId: organization.id,
                                            });
                                        }}>
                                        <div className='flex items-center justify-between gap-3'>
                                            <span className='text-sm font-medium text-foreground'>
                                                {organization.displayName}
                                            </span>
                                            <SelectionBadge className={toneClass(organization.role)}>
                                                {organization.role}
                                            </SelectionBadge>
                                        </div>
                                        <p className='mt-1 text-xs text-muted-foreground'>
                                            {organization.billing.planKey ?? 'trial'} • {formatQuota(organization.usage)}
                                        </p>
                                    </button>
                            ))}
                        </div>
                    </div>

                    <div>
                            {tree.sections.map((section) => (
                                <div key={section.id} className='border-b border-border/45 pb-2 last:border-b-0'>
                                    <button
                                        type='button'
                                        className='flex w-full items-center justify-between gap-3 px-2 py-3 text-left'
                                        onClick={() =>
                                            setExpandedSections((current) => ({
                                                ...current,
                                                [section.id]: !current[section.id],
                                            }))
                                        }>
                                        <span className='text-[10px] uppercase tracking-[0.28em] text-muted-foreground'>
                                            {section.label}
                                        </span>
                                        <span className='text-[11px] text-muted-foreground'>
                                            {expandedSections[section.id] ? 'Hide' : 'Show'}
                                        </span>
                                    </button>

                                    {expandedSections[section.id] ? (
                                        <div className='space-y-1 px-1 pb-2'>
                                            {section.items.map((item) => (
                                                <div key={item.id}>
                                                    <div className='flex items-start gap-2'>
                                                        {item.children?.length ? (
                                                            <button
                                                                type='button'
                                                                className='mt-1 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-transparent text-xs text-muted-foreground transition-colors hover:border-border/55 hover:bg-background/70 hover:text-foreground'
                                                                onClick={() =>
                                                                    setExpandedSections((current) => ({
                                                                        ...current,
                                                                        [item.id]: !current[item.id],
                                                                    }))
                                                                }>
                                                                {expandedSections[item.id] ? '-' : '+'}
                                                            </button>
                                                        ) : (
                                                            <span className='inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-transparent text-xs text-muted-foreground'>
                                                                •
                                                            </span>
                                                        )}

                                                        <button
                                                            type='button'
                                                            data-testid={`forge-sidebar-item-${item.id}`}
                                                            className='flex min-w-0 flex-1 items-center justify-between gap-3 rounded-[1rem] border border-transparent bg-transparent px-3 py-2.5 text-left transition-colors hover:border-border/50 hover:bg-background/65'
                                                            onClick={(event) => openItem(item, resolveOpenMode(event))}>
                                                            <span className='min-w-0'>
                                                                <span className='block truncate text-sm font-medium text-foreground'>
                                                                    {item.label}
                                                                </span>
                                                                <span className='mt-1 block truncate text-xs text-muted-foreground'>
                                                                    {item.description}
                                                                </span>
                                                            </span>
                                                            {item.badge ? (
                                                                <SelectionBadge>{item.badge}</SelectionBadge>
                                                            ) : null}
                                                        </button>
                                                    </div>

                                                    {item.children?.length && expandedSections[item.id] ? (
                                                        <div className='mt-1 space-y-1 pl-9'>
                                                            {item.children.map((child) => (
                                                                <button
                                                                    key={child.id}
                                                                    type='button'
                                                                    data-testid={`forge-sidebar-item-${child.id}`}
                                                                    className='flex w-full items-center justify-between gap-3 rounded-[0.95rem] border border-transparent bg-transparent px-3 py-2.5 text-left transition-colors hover:border-border/45 hover:bg-background/60'
                                                                    onClick={(event) =>
                                                                        openItem(child, resolveOpenMode(event))
                                                                    }>
                                                                    <span className='min-w-0'>
                                                                        <span className='block truncate text-sm font-medium text-foreground'>
                                                                            {child.label}
                                                                        </span>
                                                                        <span className='mt-1 block truncate text-xs text-muted-foreground'>
                                                                            {child.description}
                                                                        </span>
                                                                    </span>
                                                                    {child.badge ? (
                                                                        <SelectionBadge>{child.badge}</SelectionBadge>
                                                                    ) : null}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    ) : null}
                                                </div>
                                            ))}
                                        </div>
                                    ) : null}
                                </div>
                            ))}
                    </div>
                </Panel>
            ) : null}
            <div className='space-y-4'>
                <Panel className='overflow-hidden p-0'>
                    <div className='border-b border-border/65 px-5 py-4'>
                        <div className='flex flex-wrap items-start justify-between gap-4'>
                            <div className='max-w-4xl'>
                                <p className='text-[11px] uppercase tracking-[0.24em] text-muted-foreground'>
                                    {routeId === 'workspace' ? 'Workspace' : shell.title}
                                </p>
                                <h1 className='mt-2 text-3xl font-semibold tracking-[-0.03em] text-foreground md:text-4xl'>
                                    Harness workspace
                                </h1>
                                <p className='mt-3 text-sm leading-7 text-muted-foreground'>
                                    Tree collections stay in the sidebar, dock surfaces stay in the center, and the inspector stays on the right so the workspace feels like one continuous operating surface instead of a dashboard collage.
                                </p>
                            </div>

                            <div className='flex flex-wrap gap-2'>
                                <SelectionBadge>{shell.platform}</SelectionBadge>
                                <SelectionBadge>{shell.skinId ?? 'forge'}</SelectionBadge>
                                <SelectionBadge>{shell.skinMode ?? 'dark'}</SelectionBadge>
                            </div>
                        </div>

                        <div className='mt-4 flex flex-wrap items-center gap-3 text-xs text-muted-foreground'>
                            <span>Click to focus or reuse.</span>
                            <span>Ctrl/Cmd-click for a new tab.</span>
                            <span>Alt-click to split right.</span>
                        </div>
                    </div>

                    <DockCanvas
                        className='relative h-[820px] overflow-hidden bg-muted/8'
                        onPanelActivate={(panelId, groupId) => {
                            const record = panelRecords[panelId];
                            const fallbackItem =
                                dockState.nodes[panelId]?.kind === 'panel'
                                    ? findWorkspaceItemByPanelTitle(
                                          tree,
                                          dockState.nodes[panelId].data.title,
                                      )
                                    : null;
                            const itemId = record?.itemId ?? fallbackItem?.id;
                            if ((record?.kind === 'content' || fallbackItem) && itemId) {
                                setActiveContentGroupId(groupId);
                                setFocusedContentPanelId(panelId);
                                setSelection({ itemId, kind: 'item' });
                            }
                        }}
                        renderPanelBody={renderPanelBody}
                    />
                </Panel>
            </div>

            {sidebarSide === 'right' ? (
                <Panel className='p-4 xl:sticky xl:top-4 xl:self-start'>
                    <div className='space-y-4'>
                        <div className='rounded-[1.25rem] border border-border/65 bg-background/55 p-4'>
                            <div className='flex items-center justify-between gap-3'>
                                <div>
                                    <p className='text-[11px] uppercase tracking-[0.24em] text-muted-foreground'>
                                        {shell.title}
                                    </p>
                                    <h2 className='mt-2 text-xl font-semibold text-foreground'>
                                        {selectedOrganization?.displayName ?? shell.organizationName}
                                    </h2>
                                </div>
                                <SelectionBadge>{dataSourceLabel}</SelectionBadge>
                            </div>

                            <div className='mt-4 flex items-center gap-2'>
                                <button
                                    type='button'
                                    className='rounded-full border border-primary/45 bg-primary/12 px-3 py-1 text-xs text-foreground transition-colors'
                                    onClick={() => setSidebarSide('left')}>
                                    Move Left
                                </button>
                            </div>
                        </div>

                        <div className='rounded-[1.25rem] border border-border/65 bg-background/55 p-4 text-sm leading-7 text-muted-foreground'>
                            The sidebar is intentionally constrained. It can move left or right like VS Code&apos;s explorer, but it does not compete with the dock for arbitrary layout control.
                        </div>
                    </div>
                </Panel>
            ) : null}
        </div>
    );
}

export function ForgeWorkspaceShell({ routeId, shell }: ForgeWorkspaceShellProps) {
    const dataSource = React.useMemo(
        () =>
            shell.dataSource ??
            createForgeStubDataSource({
                label: `${shell.platform} preview stub`,
            }),
        [shell.dataSource, shell.platform],
    );
    const store = React.useMemo(
        () => {
            const nextStore = createDockStore(createForgeWorkspaceDockFixture(), {
                activeGroupId: CONTENT_GROUP_ID,
                initialMode: shell.skinMode ?? 'dark',
                initialSkinId: shell.skinId,
                showOverlay: true,
                showOverlayLabels: false,
            });

            nextStore.registerIntent(
                FORGE_DOCK_INTENTS.splitPanelRight,
                (
                    payload: { groupId?: string; panelId?: string },
                    context,
                ) => {
                    const nextDock = splitDockPanelRight(context.state.dock, payload);
                    return nextDock ? { dock: $set(nextDock) } : {};
                },
            );
            nextStore.registerIntent(
                FORGE_DOCK_INTENTS.addPanelSplitRight,
                (
                    payload: { groupId?: string; panelId?: string; title?: string },
                    context,
                ) => {
                    const nextDock = addDockPanelSplitRight(context.state.dock, payload);
                    return nextDock ? { dock: $set(nextDock) } : {};
                },
            );

            return nextStore;
        },
        [shell.skinId, shell.skinMode],
    );

    const [session, setSession] = React.useState<SessionBootstrap | null>(null);
    const [sessionState, setSessionState] = React.useState<WorkspaceLoadState>('loading');
    const [sessionError, setSessionError] = React.useState<string | null>(null);
    const [selectedOrganizationId, setSelectedOrganizationId] = React.useState<string | null>(null);
    const [billing, setBilling] = React.useState<BillingSummary | null>(null);
    const [usage, setUsage] = React.useState<UsageSummary | null>(null);
    const [runs, setRuns] = React.useState<readonly Run[]>([]);
    const [dataState, setDataState] = React.useState<WorkspaceLoadState>('idle');
    const [dataError, setDataError] = React.useState<string | null>(null);

    React.useEffect(() => {
        let cancelled = false;
        setSessionState('loading');
        setSessionError(null);

        void dataSource
            .getSessionBootstrap()
            .then((nextSession) => {
                if (cancelled) {
                    return;
                }

                setSession(nextSession);
                setSelectedOrganizationId(
                    nextSession.selectedOrganizationId ?? nextSession.organizations[0]?.id ?? null,
                );
                setSessionState('ready');
            })
            .catch((error) => {
                if (cancelled) {
                    return;
                }

                setSession(null);
                setSessionError(
                    error instanceof Error ? error.message : 'Failed to load session bootstrap.',
                );
                setSessionState('error');
            });

        return () => {
            cancelled = true;
        };
    }, [dataSource]);

    React.useEffect(() => {
        if (!selectedOrganizationId) {
            setBilling(null);
            setUsage(null);
            setRuns([]);
            setDataState('idle');
            setDataError(null);
            return;
        }

        let cancelled = false;
        setDataState('loading');
        setDataError(null);

        void Promise.all([
            dataSource.getBillingSummary(selectedOrganizationId),
            dataSource.getUsageSummary(selectedOrganizationId),
            dataSource.listRuns({
                limit: 24,
                organizationId: selectedOrganizationId,
            }),
        ])
            .then(([nextBilling, nextUsage, nextRuns]) => {
                if (cancelled) {
                    return;
                }

                setBilling(nextBilling);
                setUsage(nextUsage);
                setRuns(nextRuns.items);
                setDataState('ready');
            })
            .catch((error) => {
                if (cancelled) {
                    return;
                }

                setBilling(null);
                setUsage(null);
                setRuns([]);
                setDataError(
                    error instanceof Error ? error.message : 'Failed to load organization data.',
                );
                setDataState('error');
            });

        return () => {
            cancelled = true;
        };
    }, [dataSource, selectedOrganizationId]);

    const selectedOrganization = React.useMemo(
        () =>
            session?.organizations.find((organization) => organization.id === selectedOrganizationId) ??
            null,
        [selectedOrganizationId, session?.organizations],
    );

    const inboxItems = React.useMemo(
        () =>
            deriveForgeInboxItems({
                billing,
                runs,
                selectedOrganization,
                usage,
            }),
        [billing, runs, selectedOrganization, usage],
    );
    const tasks = React.useMemo(
        () =>
            deriveForgeTaskItems({
                billing,
                runs,
                selectedOrganization,
                shell,
                usage,
            }),
        [billing, runs, selectedOrganization, shell, usage],
    );
    const projects = React.useMemo(
        () =>
            deriveForgeProjectItems({
                billing,
                runs,
                selectedOrganization,
                shell,
                usage,
            }),
        [billing, runs, selectedOrganization, shell, usage],
    );
    const settings = React.useMemo(
        () =>
            deriveForgeSettingItems({
                billing,
                selectedOrganization,
                shell,
            }),
        [billing, selectedOrganization, shell],
    );
    const tree = React.useMemo(
        () =>
            createForgeWorkspaceTree({
                billing,
                inboxItems,
                projects,
                runs,
                session,
                settings,
                tasks,
                usage,
            }),
        [billing, inboxItems, projects, runs, session, settings, tasks, usage],
    );

    return (
        <GraphiteProvider store={store}>
            <WorkspaceDockSurface
                billing={billing}
                dataError={dataError}
                dataSourceLabel={dataSource.label}
                dataState={dataState}
                dataSource={dataSource}
                inboxItems={inboxItems}
                onSelectOrganization={setSelectedOrganizationId}
                projects={projects}
                routeId={routeId}
                runs={runs}
                selectedOrganization={selectedOrganization}
                selectedOrganizationId={selectedOrganizationId}
                session={session}
                sessionError={sessionError}
                sessionState={sessionState}
                settings={settings}
                shell={shell}
                tasks={tasks}
                tree={tree}
                usage={usage}
            />
        </GraphiteProvider>
    );
}
