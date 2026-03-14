import * as React from 'react';
import type {
    BillingSummary,
    Organization,
    Run,
    RunDetail,
    SessionBootstrap,
    UsageSummary,
} from '@loop-kit/forge-contracts';
import {
    Button,
    GraphiteDataTable,
    Panel,
    Text,
    cn,
    type GraphiteDataTableColumn,
} from '@loop-kit/ui';

import { createForgeStubDataSource } from './data-source';
import type { ForgeRouteId, ForgeShellConfig } from './types';

type ForgeWorkspaceCollectionId =
    | 'organizations'
    | 'inbox'
    | 'tasks'
    | 'runs'
    | 'settings';

type ForgeInboxItem = {
    id: string;
    title: string;
    summary: string;
    source: 'billing' | 'usage' | 'runs';
    status: 'new' | 'watch' | 'blocked';
};

type ForgeTaskItem = {
    id: string;
    title: string;
    summary: string;
    lane: 'today' | 'next' | 'waiting';
    priority: 'p1' | 'p2' | 'p3';
};

type ForgeSettingItem = {
    id: string;
    title: string;
    summary: string;
    scope: 'account' | 'organization' | 'workspace' | 'integration';
    state: 'configured' | 'planned' | 'attention';
};

type ForgeWorkspaceShellProps = {
    routeId: ForgeRouteId;
    shell: ForgeShellConfig;
};

type MetricCardProps = {
    label: string;
    value: string;
    detail: string;
    tone?: 'surface' | 'muted' | 'accent';
};

const collectionMeta: Record<
    ForgeWorkspaceCollectionId,
    { description: string; label: string }
> = {
    organizations: {
        description: 'Compare organizations, plan state, and quota posture.',
        label: 'Organizations',
    },
    inbox: {
        description: 'Operational signals that need a decision or quick response.',
        label: 'Inbox',
    },
    tasks: {
        description: 'Short GTD-style follow-up queue for the active organization.',
        label: 'Tasks',
    },
    runs: {
        description: 'Agent runs, workflow jobs, and sandbox activity for the selected organization.',
        label: 'Runs',
    },
    settings: {
        description: 'Account, workspace, and integration settings that shape the shell.',
        label: 'Settings',
    },
};

const shortDateTimeFormatter = new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
});

const compactNumberFormatter = new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
});

function MetricCard({
    label,
    value,
    detail,
    tone = 'surface',
}: MetricCardProps) {
    return (
        <Panel variant={tone} className='p-4'>
            <p className='text-[11px] uppercase tracking-[0.22em] text-muted-foreground'>
                {label}
            </p>
            <p className='mt-3 text-2xl font-semibold text-foreground'>{value}</p>
            <p className='mt-2 text-sm leading-6 text-muted-foreground'>{detail}</p>
        </Panel>
    );
}

function statusToneClass(
    value: Run['status'] | ForgeInboxItem['status'] | ForgeSettingItem['state'],
) {
    if (
        value === 'running' ||
        value === 'completed' ||
        value === 'configured'
    ) {
        return 'border-emerald-500/35 bg-emerald-500/12 text-emerald-100';
    }

    if (
        value === 'failed' ||
        value === 'blocked' ||
        value === 'attention'
    ) {
        return 'border-rose-500/40 bg-rose-500/12 text-rose-100';
    }

    if (
        value === 'queued' ||
        value === 'watch' ||
        value === 'planned' ||
        value === 'cancel_requested'
    ) {
        return 'border-amber-500/40 bg-amber-500/14 text-amber-100';
    }

    return 'border-border/80 bg-background/75 text-foreground';
}

function formatDate(value: string | null | undefined) {
    if (!value) {
        return 'Pending';
    }

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
        return value;
    }

    return shortDateTimeFormatter.format(parsed);
}

function formatQuota(usage: UsageSummary | null | undefined) {
    if (!usage) {
        return 'No usage summary';
    }

    const runsLimit = usage.runsLimit ?? 0;
    const ratio =
        runsLimit > 0 ? Math.min(usage.runsUsed / runsLimit, 1) : 0;

    return `${usage.runsUsed}/${runsLimit || 'unlimited'} runs (${Math.round(ratio * 100)}%)`;
}

function formatTokenUsage(usage: UsageSummary | null | undefined) {
    if (!usage) {
        return 'No token summary';
    }

    return `${compactNumberFormatter.format(usage.tokensUsed)} / ${compactNumberFormatter.format(usage.tokensLimit ?? 0)} tokens`;
}

function deriveInboxItems({
    billing,
    runs,
    selectedOrganization,
    usage,
}: {
    billing: BillingSummary | null;
    runs: readonly Run[];
    selectedOrganization: Organization | null;
    usage: UsageSummary | null;
}): readonly ForgeInboxItem[] {
    const items: ForgeInboxItem[] = [];

    if (billing?.state === 'trialing') {
        items.push({
            id: `${billing.organizationId}-trialing`,
            title: 'Plan is still trialing',
            summary:
                'Promote the organization to an active plan before staging or release workflows depend on it.',
            source: 'billing',
            status: 'watch',
        });
    }

    if (usage?.enforcementState === 'nearing_limit') {
        items.push({
            id: `${usage.organizationId}-quota`,
            title: 'Run quota is nearing the limit',
            summary: `Usage is trending hot for ${selectedOrganization?.displayName ?? 'the active organization'}. Review workflow churn before the next burst.`,
            source: 'usage',
            status: 'watch',
        });
    }

    const activeRun = runs.find(
        (run) => run.status === 'running' || run.status === 'queued',
    );
    if (activeRun) {
        items.push({
            id: `${activeRun.id}-activity`,
            title: 'Run activity needs attention',
            summary: `A ${activeRun.kind} job is ${activeRun.status}. Open the detail inspector to check logs and artifacts.`,
            source: 'runs',
            status: activeRun.status === 'running' ? 'new' : 'watch',
        });
    }

    if (items.length === 0) {
        items.push({
            id: 'steady-state',
            title: 'No urgent operational interrupts',
            summary:
                'The active organization is in a steady state. Keep the inbox clear and drive work from the task queue.',
            source: 'runs',
            status: 'new',
        });
    }

    return items;
}

function deriveTaskItems({
    billing,
    runs,
    selectedOrganization,
    shell,
    usage,
}: {
    billing: BillingSummary | null;
    runs: readonly Run[];
    selectedOrganization: Organization | null;
    shell: ForgeShellConfig;
    usage: UsageSummary | null;
}): readonly ForgeTaskItem[] {
    const tasks: ForgeTaskItem[] = [
        {
            id: 'task-layout',
            title: 'Tune the workspace shell layout',
            summary: `Turn ${shell.workspaceName} into a stable dock host after the list and inspector shell is proven out.`,
            lane: 'today',
            priority: 'p1',
        },
    ];

    if (billing?.state === 'trialing') {
        tasks.push({
            id: 'task-billing',
            title: 'Finalize billing projection path',
            summary:
                'Push billing projection events into the org summary before release promotion depends on the data.',
            lane: 'next',
            priority: 'p2',
        });
    }

    if (usage && usage.enforcementState !== 'ok') {
        tasks.push({
            id: 'task-usage',
            title: 'Review quota posture',
            summary: `Usage is ${usage?.enforcementState} for ${selectedOrganization?.displayName ?? 'the active organization'}. Audit workflow churn and sandbox burn.`,
            lane: 'today',
            priority: 'p1',
        });
    }

    if (runs.some((run) => run.status === 'failed')) {
        tasks.push({
            id: 'task-failures',
            title: 'Investigate failed run replay',
            summary:
                'The queue contains failed work. Pull the inspector logs into the next debugging pass.',
            lane: 'waiting',
            priority: 'p2',
        });
    }

    return tasks;
}

function deriveSettingItems({
    bootstrap,
    selectedOrganization,
    shell,
}: {
    bootstrap: SessionBootstrap | null;
    selectedOrganization: Organization | null;
    shell: ForgeShellConfig;
}): readonly ForgeSettingItem[] {
    return [
        {
            id: 'setting-account',
            title: 'Account identity',
            summary: bootstrap
                ? `${bootstrap.actor.displayName} (${bootstrap.actor.email})`
                : 'Account details will load from the Forge API session bootstrap.',
            scope: 'account',
            state: bootstrap ? 'configured' : 'planned',
        },
        {
            id: 'setting-org',
            title: 'Organization defaults',
            summary: selectedOrganization
                ? `${selectedOrganization.displayName} is the active org context for this shell.`
                : 'An organization selection is required before org-scoped settings can load.',
            scope: 'organization',
            state: selectedOrganization ? 'configured' : 'attention',
        },
        {
            id: 'setting-workspace',
            title: 'Workspace posture',
            summary: `${shell.workspaceName} is mounted inside the ${shell.platform} shell with ${shell.navigationMode ?? 'history'} routing.`,
            scope: 'workspace',
            state: 'configured',
        },
        {
            id: 'setting-integrations',
            title: 'External integrations',
            summary:
                'Auth, billing, and workflow integrations are still intentionally narrow. This shell only reads session, runs, billing, and usage.',
            scope: 'integration',
            state: 'planned',
        },
    ];
}

function organizationColumns(): readonly GraphiteDataTableColumn<Organization>[] {
    return [
        {
            key: 'organization',
            header: 'Organization',
            sortable: true,
            sortValue: (row) => row.displayName,
            cell: (row) => (
                <div className='space-y-1'>
                    <p className='font-medium text-foreground'>{row.displayName}</p>
                    <p className='text-xs uppercase tracking-[0.18em] text-muted-foreground'>
                        {row.slug}
                    </p>
                </div>
            ),
        },
        {
            key: 'role',
            header: 'Role',
            sortable: true,
            sortValue: (row) => row.role,
            value: (row) => row.role,
        },
        {
            key: 'plan',
            header: 'Plan',
            sortable: true,
            sortValue: (row) => row.billing.planKey ?? '',
            value: (row) => row.billing.planKey ?? 'unassigned',
        },
        {
            key: 'runsUsed',
            header: 'Run quota',
            sortable: true,
            sortValue: (row) => row.usage.runsUsed,
            value: (row) =>
                `${row.usage.runsUsed}/${row.usage.runsLimit ?? 'unlimited'}`,
        },
        {
            key: 'billingState',
            header: 'Billing',
            sortable: true,
            sortValue: (row) => row.billing.state,
            cell: (row) => (
                <span
                    className={cn(
                        'inline-flex rounded-full border px-2 py-1 text-[11px] uppercase tracking-[0.18em]',
                        statusToneClass(
                            row.billing.state === 'active'
                                ? 'configured'
                                : row.billing.state === 'trialing'
                                  ? 'watch'
                                  : 'attention',
                        ),
                    )}>
                    {row.billing.state}
                </span>
            ),
        },
    ];
}

function runColumns(): readonly GraphiteDataTableColumn<Run>[] {
    return [
        {
            key: 'kind',
            header: 'Run',
            sortable: true,
            sortValue: (row) => row.kind,
            cell: (row) => (
                <div className='space-y-1'>
                    <p className='font-medium text-foreground'>{row.kind}</p>
                    <p className='text-xs uppercase tracking-[0.18em] text-muted-foreground'>
                        {row.id.slice(0, 8)}
                    </p>
                </div>
            ),
        },
        {
            key: 'status',
            header: 'Status',
            sortable: true,
            sortValue: (row) => row.status,
            cell: (row) => (
                <span
                    className={cn(
                        'inline-flex rounded-full border px-2 py-1 text-[11px] uppercase tracking-[0.18em]',
                        statusToneClass(row.status),
                    )}>
                    {row.status}
                </span>
            ),
        },
        {
            key: 'logs',
            header: 'Logs',
            sortable: true,
            sortValue: (row) => row.logCount,
            value: (row) => String(row.logCount),
        },
        {
            key: 'artifacts',
            header: 'Artifacts',
            sortable: true,
            sortValue: (row) => row.artifactCount,
            value: (row) => String(row.artifactCount),
        },
        {
            key: 'updatedAt',
            header: 'Updated',
            sortable: true,
            sortValue: (row) => row.updatedAt,
            value: (row) => formatDate(row.updatedAt),
        },
    ];
}

function inboxColumns(): readonly GraphiteDataTableColumn<ForgeInboxItem>[] {
    return [
        {
            key: 'title',
            header: 'Focus',
            sortable: true,
            sortValue: (row) => row.title,
            cell: (row) => (
                <div className='space-y-1'>
                    <p className='font-medium text-foreground'>{row.title}</p>
                    <p className='max-w-[36rem] text-sm text-muted-foreground'>
                        {row.summary}
                    </p>
                </div>
            ),
        },
        {
            key: 'source',
            header: 'Source',
            sortable: true,
            sortValue: (row) => row.source,
            value: (row) => row.source,
        },
        {
            key: 'status',
            header: 'Status',
            sortable: true,
            sortValue: (row) => row.status,
            cell: (row) => (
                <span
                    className={cn(
                        'inline-flex rounded-full border px-2 py-1 text-[11px] uppercase tracking-[0.18em]',
                        statusToneClass(row.status),
                    )}>
                    {row.status}
                </span>
            ),
        },
    ];
}

function taskColumns(): readonly GraphiteDataTableColumn<ForgeTaskItem>[] {
    return [
        {
            key: 'title',
            header: 'Task',
            sortable: true,
            sortValue: (row) => row.title,
            cell: (row) => (
                <div className='space-y-1'>
                    <p className='font-medium text-foreground'>{row.title}</p>
                    <p className='max-w-[36rem] text-sm text-muted-foreground'>
                        {row.summary}
                    </p>
                </div>
            ),
        },
        {
            key: 'lane',
            header: 'Lane',
            sortable: true,
            sortValue: (row) => row.lane,
            value: (row) => row.lane,
        },
        {
            key: 'priority',
            header: 'Priority',
            sortable: true,
            sortValue: (row) => row.priority,
            value: (row) => row.priority.toUpperCase(),
        },
    ];
}

function settingColumns(): readonly GraphiteDataTableColumn<ForgeSettingItem>[] {
    return [
        {
            key: 'title',
            header: 'Setting',
            sortable: true,
            sortValue: (row) => row.title,
            cell: (row) => (
                <div className='space-y-1'>
                    <p className='font-medium text-foreground'>{row.title}</p>
                    <p className='max-w-[36rem] text-sm text-muted-foreground'>
                        {row.summary}
                    </p>
                </div>
            ),
        },
        {
            key: 'scope',
            header: 'Scope',
            sortable: true,
            sortValue: (row) => row.scope,
            value: (row) => row.scope,
        },
        {
            key: 'state',
            header: 'State',
            sortable: true,
            sortValue: (row) => row.state,
            cell: (row) => (
                <span
                    className={cn(
                        'inline-flex rounded-full border px-2 py-1 text-[11px] uppercase tracking-[0.18em]',
                        statusToneClass(row.state),
                    )}>
                    {row.state}
                </span>
            ),
        },
    ];
}

function DetailList({
    items,
}: {
    items: readonly { label: string; value: React.ReactNode }[];
}) {
    return (
        <dl className='space-y-3'>
            {items.map((item) => (
                <div
                    key={item.label}
                    className='rounded-2xl border border-border/70 bg-background/70 px-3 py-3'>
                    <dt className='text-[11px] uppercase tracking-[0.18em] text-muted-foreground'>
                        {item.label}
                    </dt>
                    <dd className='mt-2 text-sm text-foreground'>{item.value}</dd>
                </div>
            ))}
        </dl>
    );
}

function routeDefaultCollection(routeId: ForgeRouteId): ForgeWorkspaceCollectionId {
    if (routeId === 'settings') {
        return 'settings';
    }

    if (routeId === 'billing') {
        return 'organizations';
    }

    return 'runs';
}

export function ForgeWorkspaceShell({
    routeId,
    shell,
}: ForgeWorkspaceShellProps) {
    const stubDataSource = React.useMemo(() => createForgeStubDataSource(), []);
    const dataSource = shell.dataSource ?? stubDataSource;
    const [bootstrap, setBootstrap] = React.useState<SessionBootstrap | null>(null);
    const [bootstrapLoading, setBootstrapLoading] = React.useState(true);
    const [bootstrapError, setBootstrapError] = React.useState<string | null>(null);
    const [selectedOrganizationId, setSelectedOrganizationId] = React.useState<string | null>(null);
    const [billing, setBilling] = React.useState<BillingSummary | null>(null);
    const [usage, setUsage] = React.useState<UsageSummary | null>(null);
    const [runs, setRuns] = React.useState<readonly Run[]>([]);
    const [organizationLoading, setOrganizationLoading] = React.useState(false);
    const [organizationError, setOrganizationError] = React.useState<string | null>(null);
    const [selectedRunDetail, setSelectedRunDetail] = React.useState<RunDetail | null>(null);
    const [runDetailLoading, setRunDetailLoading] = React.useState(false);
    const [activeCollectionId, setActiveCollectionId] =
        React.useState<ForgeWorkspaceCollectionId>(() =>
            routeDefaultCollection(routeId),
        );
    const [selectedRecordId, setSelectedRecordId] = React.useState<string | null>(null);

    React.useEffect(() => {
        React.startTransition(() => {
            setActiveCollectionId(routeDefaultCollection(routeId));
        });
    }, [routeId]);

    React.useEffect(() => {
        let cancelled = false;
        setBootstrapLoading(true);
        setBootstrapError(null);

        void dataSource
            .getSessionBootstrap()
            .then((result) => {
                if (cancelled) {
                    return;
                }

                setBootstrap(result);
                setSelectedOrganizationId((current) => {
                    if (
                        current &&
                        result.organizations.some(
                            (organization) => organization.id === current,
                        )
                    ) {
                        return current;
                    }

                    return (
                        result.selectedOrganizationId ??
                        result.organizations[0]?.id ??
                        null
                    );
                });
            })
            .catch((error: unknown) => {
                if (!cancelled) {
                    setBootstrapError(
                        error instanceof Error
                            ? error.message
                            : 'Failed to load Forge workspace bootstrap.',
                    );
                }
            })
            .finally(() => {
                if (!cancelled) {
                    setBootstrapLoading(false);
                }
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
            setOrganizationError(null);
            setSelectedRunDetail(null);
            return;
        }

        let cancelled = false;
        setOrganizationLoading(true);
        setOrganizationError(null);

        void Promise.all([
            dataSource.getBillingSummary(selectedOrganizationId),
            dataSource.getUsageSummary(selectedOrganizationId),
            dataSource.listRuns({
                organizationId: selectedOrganizationId,
                limit: 50,
            }),
        ])
            .then(([nextBilling, nextUsage, runList]) => {
                if (cancelled) {
                    return;
                }

                setBilling(nextBilling);
                setUsage(nextUsage);
                setRuns(runList.items);
            })
            .catch((error: unknown) => {
                if (!cancelled) {
                    setOrganizationError(
                        error instanceof Error
                            ? error.message
                            : 'Failed to load organization data.',
                    );
                    setBilling(null);
                    setUsage(null);
                    setRuns([]);
                }
            })
            .finally(() => {
                if (!cancelled) {
                    setOrganizationLoading(false);
                }
            });

        return () => {
            cancelled = true;
        };
    }, [dataSource, selectedOrganizationId]);

    const selectedOrganization =
        bootstrap?.organizations.find(
            (organization) => organization.id === selectedOrganizationId,
        ) ?? null;

    const inboxItems = React.useMemo(
        () =>
            deriveInboxItems({
                billing,
                runs,
                selectedOrganization,
                usage,
            }),
        [billing, runs, selectedOrganization, usage],
    );
    const taskItems = React.useMemo(
        () =>
            deriveTaskItems({
                billing,
                runs,
                selectedOrganization,
                shell,
                usage,
            }),
        [billing, runs, selectedOrganization, shell, usage],
    );
    const settingItems = React.useMemo(
        () =>
            deriveSettingItems({
                bootstrap,
                selectedOrganization,
                shell,
            }),
        [bootstrap, selectedOrganization, shell],
    );

    const activeRecordIds = React.useMemo(() => {
        if (activeCollectionId === 'organizations') {
            return (bootstrap?.organizations ?? []).map(
                (organization) => organization.id,
            );
        }

        if (activeCollectionId === 'inbox') {
            return inboxItems.map((item) => item.id);
        }

        if (activeCollectionId === 'tasks') {
            return taskItems.map((item) => item.id);
        }

        if (activeCollectionId === 'settings') {
            return settingItems.map((item) => item.id);
        }

        return runs.map((run) => run.id);
    }, [activeCollectionId, bootstrap?.organizations, inboxItems, runs, settingItems, taskItems]);

    React.useEffect(() => {
        if (activeCollectionId === 'organizations' && selectedOrganizationId) {
            setSelectedRecordId(selectedOrganizationId);
            return;
        }

        setSelectedRecordId((current) =>
            current && activeRecordIds.includes(current)
                ? current
                : activeRecordIds[0] ?? null,
        );
    }, [activeCollectionId, activeRecordIds, selectedOrganizationId]);

    const selectedRun =
        activeCollectionId === 'runs'
            ? runs.find((run) => run.id === selectedRecordId) ?? null
            : null;

    React.useEffect(() => {
        if (
            activeCollectionId !== 'runs' ||
            !selectedRun?.id ||
            !selectedOrganizationId ||
            !dataSource.getRun
        ) {
            setSelectedRunDetail(null);
            setRunDetailLoading(false);
            return;
        }

        let cancelled = false;
        setRunDetailLoading(true);

        void dataSource
            .getRun({
                organizationId: selectedOrganizationId,
                runId: selectedRun.id,
            })
            .then((detail) => {
                if (!cancelled) {
                    setSelectedRunDetail(detail);
                }
            })
            .catch(() => {
                if (!cancelled) {
                    setSelectedRunDetail(null);
                }
            })
            .finally(() => {
                if (!cancelled) {
                    setRunDetailLoading(false);
                }
            });

        return () => {
            cancelled = true;
        };
    }, [activeCollectionId, dataSource, selectedOrganizationId, selectedRun?.id]);

    const selectedInboxItem =
        activeCollectionId === 'inbox'
            ? inboxItems.find((item) => item.id === selectedRecordId) ?? null
            : null;
    const selectedTaskItem =
        activeCollectionId === 'tasks'
            ? taskItems.find((item) => item.id === selectedRecordId) ?? null
            : null;
    const selectedSettingItem =
        activeCollectionId === 'settings'
            ? settingItems.find((item) => item.id === selectedRecordId) ?? null
            : null;

    if (bootstrapLoading) {
        return (
            <Panel
                variant='accent'
                className='p-6'
                data-testid='forge-workspace-shell-loading'>
                <p className='text-[11px] uppercase tracking-[0.24em] text-muted-foreground'>
                    workspace bootstrap
                </p>
                <h3 className='mt-3 text-2xl font-semibold text-foreground'>
                    Hydrating Forge shell
                </h3>
                <p className='mt-3 max-w-2xl text-sm leading-7 text-muted-foreground'>
                    Loading organizations, actor identity, and the selected workspace
                    context from {dataSource.label}.
                </p>
            </Panel>
        );
    }

    if (bootstrapError) {
        return (
            <Panel
                variant='accent'
                className='p-6'
                data-testid='forge-workspace-shell-error'>
                <p className='text-[11px] uppercase tracking-[0.24em] text-muted-foreground'>
                    workspace bootstrap
                </p>
                <h3 className='mt-3 text-2xl font-semibold text-foreground'>
                    Forge shell failed to load
                </h3>
                <p className='mt-3 max-w-2xl text-sm leading-7 text-muted-foreground'>
                    {bootstrapError}
                </p>
            </Panel>
        );
    }

    const activeMeta = collectionMeta[activeCollectionId];

    return (
        <section
            className='grid gap-4 xl:grid-cols-[17rem,minmax(0,1fr),22rem]'
            data-testid='forge-workspace-shell'>
            <div className='space-y-4'>
                <Panel variant='accent' className='p-4'>
                    <p className='text-[11px] uppercase tracking-[0.24em] text-muted-foreground'>
                        operator
                    </p>
                    <h3 className='mt-3 text-xl font-semibold text-foreground'>
                        {bootstrap?.actor.displayName ?? 'Unknown operator'}
                    </h3>
                    <p className='mt-2 text-sm text-muted-foreground'>
                        {bootstrap?.actor.email ?? 'No actor email'}
                    </p>
                    <div className='mt-4 flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.18em] text-muted-foreground'>
                        <span className='rounded-full border border-border/70 bg-background/75 px-3 py-1'>
                            {dataSource.kind}
                        </span>
                        <span className='rounded-full border border-border/70 bg-background/75 px-3 py-1'>
                            {dataSource.label}
                        </span>
                    </div>
                </Panel>

                <Panel className='p-4'>
                    <div className='flex items-center justify-between gap-3'>
                        <p className='text-[11px] uppercase tracking-[0.24em] text-muted-foreground'>
                            organizations
                        </p>
                        <span className='rounded-full border border-border/70 bg-background/70 px-2 py-1 text-[11px] uppercase tracking-[0.18em] text-muted-foreground'>
                            {bootstrap?.organizations.length ?? 0}
                        </span>
                    </div>
                    <div className='mt-4 space-y-2'>
                        {(bootstrap?.organizations ?? []).map((organization) => {
                            const active =
                                organization.id === selectedOrganizationId;

                            return (
                                <button
                                    key={organization.id}
                                    type='button'
                                    data-organization-id={organization.id}
                                    className={cn(
                                        'w-full rounded-2xl border px-3 py-3 text-left transition-colors',
                                        active
                                            ? 'border-primary/55 bg-primary/14 text-foreground'
                                            : 'border-border/70 bg-background/70 text-muted-foreground hover:border-primary/35 hover:text-foreground',
                                    )}
                                    onClick={() => {
                                        React.startTransition(() => {
                                            setSelectedOrganizationId(organization.id);
                                            if (activeCollectionId === 'organizations') {
                                                setSelectedRecordId(organization.id);
                                            }
                                        });
                                    }}>
                                    <p className='font-medium'>
                                        {organization.displayName}
                                    </p>
                                    <p className='mt-1 text-xs uppercase tracking-[0.18em] text-muted-foreground'>
                                        {organization.billing.planKey ?? 'no plan'} / {organization.role}
                                    </p>
                                </button>
                            );
                        })}
                    </div>
                </Panel>

                <Panel variant='muted' className='p-4'>
                    <div className='flex items-center justify-between gap-3'>
                        <p className='text-[11px] uppercase tracking-[0.24em] text-muted-foreground'>
                            collections
                        </p>
                        <span className='rounded-full border border-border/70 bg-background/70 px-2 py-1 text-[11px] uppercase tracking-[0.18em] text-muted-foreground'>
                            GTD
                        </span>
                    </div>
                    <div className='mt-4 space-y-2'>
                        {(
                            [
                                'organizations',
                                'inbox',
                                'tasks',
                                'runs',
                                'settings',
                            ] as const
                        ).map((collectionId) => {
                            const count =
                                collectionId === 'organizations'
                                    ? bootstrap?.organizations.length ?? 0
                                    : collectionId === 'inbox'
                                      ? inboxItems.length
                                      : collectionId === 'tasks'
                                        ? taskItems.length
                                        : collectionId === 'runs'
                                          ? runs.length
                                          : settingItems.length;
                            const active = collectionId === activeCollectionId;

                            return (
                                <button
                                    key={collectionId}
                                    type='button'
                                    data-collection-id={collectionId}
                                    className={cn(
                                        'flex w-full items-center justify-between rounded-2xl border px-3 py-3 text-left transition-colors',
                                        active
                                            ? 'border-primary/55 bg-primary/14 text-foreground'
                                            : 'border-border/70 bg-background/70 text-muted-foreground hover:border-primary/35 hover:text-foreground',
                                    )}
                                    onClick={() => {
                                        React.startTransition(() => {
                                            setActiveCollectionId(collectionId);
                                        });
                                    }}>
                                    <span className='font-medium'>
                                        {collectionMeta[collectionId].label}
                                    </span>
                                    <span className='rounded-full border border-border/70 bg-background/80 px-2 py-1 text-[11px] uppercase tracking-[0.18em] text-muted-foreground'>
                                        {count}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </Panel>
            </div>

            <div className='space-y-4'>
                <div className='grid gap-4 lg:grid-cols-3'>
                    <MetricCard
                        label='run quota'
                        value={formatQuota(usage)}
                        detail={usage?.enforcementState ?? 'No quota posture'}
                        tone='accent'
                    />
                    <MetricCard
                        label='token usage'
                        value={formatTokenUsage(usage)}
                        detail={
                            usage?.updatedAt
                                ? `Updated ${formatDate(usage.updatedAt)}`
                                : 'Waiting for usage projection'
                        }
                    />
                    <MetricCard
                        label='billing state'
                        value={billing?.state ?? 'unknown'}
                        detail={
                            billing?.planKey
                                ? `${billing.planKey} via ${billing.provider}`
                                : 'No plan is attached yet.'
                        }
                    />
                </div>

                <Panel className='p-5' data-testid='forge-workspace-table-panel'>
                    <div className='flex flex-wrap items-start justify-between gap-4 border-b border-border/70 pb-4'>
                        <div>
                            <p className='text-[11px] uppercase tracking-[0.24em] text-muted-foreground'>
                                {activeMeta.label}
                            </p>
                            <h3 className='mt-2 text-2xl font-semibold text-foreground'>
                                {selectedOrganization?.displayName ?? shell.organizationName}
                            </h3>
                            <p className='mt-2 max-w-3xl text-sm leading-7 text-muted-foreground'>
                                {activeMeta.description}
                            </p>
                        </div>
                        <div className='flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.18em] text-muted-foreground'>
                            <span className='rounded-full border border-border/70 bg-background/75 px-3 py-1'>
                                {shell.workspaceName}
                            </span>
                            <span className='rounded-full border border-border/70 bg-background/75 px-3 py-1'>
                                {shell.environmentLabel}
                            </span>
                            {organizationLoading ? (
                                <span className='rounded-full border border-amber-500/40 bg-amber-500/14 px-3 py-1 text-amber-100'>
                                    syncing
                                </span>
                            ) : null}
                        </div>
                    </div>

                    {organizationError ? (
                        <Panel variant='muted' className='mt-4 p-4'>
                            <p className='text-sm text-muted-foreground'>
                                {organizationError}
                            </p>
                        </Panel>
                    ) : null}

                    <div className='mt-4'>
                        {activeCollectionId === 'organizations' ? (
                            <GraphiteDataTable
                                ariaLabel='Organizations'
                                className='min-h-[30rem]'
                                columns={organizationColumns()}
                                rows={bootstrap?.organizations ?? []}
                                rowKey={(row) => row.id}
                                onRowClick={(row) => {
                                    React.startTransition(() => {
                                        setSelectedOrganizationId(row.id);
                                        setSelectedRecordId(row.id);
                                    });
                                }}
                                rowClassName={(row) =>
                                    row.id === selectedOrganizationId
                                        ? 'bg-primary/10'
                                        : undefined
                                }
                                renderRowActions={(row) => (
                                    <Button
                                        tone='ghost'
                                        onClick={() => {
                                            React.startTransition(() => {
                                                setSelectedOrganizationId(row.id);
                                                setSelectedRecordId(row.id);
                                            });
                                        }}>
                                        Focus
                                    </Button>
                                )}
                            />
                        ) : null}

                        {activeCollectionId === 'runs' ? (
                            <GraphiteDataTable
                                ariaLabel='Runs'
                                className='min-h-[30rem]'
                                columns={runColumns()}
                                emptyState={
                                    <div className='space-y-2 text-center'>
                                        <p className='font-medium text-foreground'>
                                            No runs yet for this organization
                                        </p>
                                        <p className='text-sm text-muted-foreground'>
                                            Once the Forge API starts scheduling jobs, they will
                                            land here.
                                        </p>
                                    </div>
                                }
                                rows={runs}
                                rowKey={(row) => row.id}
                                onRowClick={(row) => {
                                    setSelectedRecordId(row.id);
                                }}
                                rowClassName={(row) =>
                                    row.id === selectedRecordId
                                        ? 'bg-primary/10'
                                        : undefined
                                }
                                renderRowActions={(row) => (
                                    <Button
                                        tone='ghost'
                                        onClick={() => {
                                            setSelectedRecordId(row.id);
                                        }}>
                                        Inspect
                                    </Button>
                                )}
                            />
                        ) : null}

                        {activeCollectionId === 'inbox' ? (
                            <GraphiteDataTable
                                ariaLabel='Inbox'
                                className='min-h-[30rem]'
                                columns={inboxColumns()}
                                rows={inboxItems}
                                rowKey={(row) => row.id}
                                onRowClick={(row) => {
                                    setSelectedRecordId(row.id);
                                }}
                                rowClassName={(row) =>
                                    row.id === selectedRecordId
                                        ? 'bg-primary/10'
                                        : undefined
                                }
                                renderRowActions={(row) => (
                                    <Button
                                        tone='ghost'
                                        onClick={() => {
                                            setSelectedRecordId(row.id);
                                        }}>
                                        Review
                                    </Button>
                                )}
                            />
                        ) : null}

                        {activeCollectionId === 'tasks' ? (
                            <GraphiteDataTable
                                ariaLabel='Tasks'
                                className='min-h-[30rem]'
                                columns={taskColumns()}
                                rows={taskItems}
                                rowKey={(row) => row.id}
                                onRowClick={(row) => {
                                    setSelectedRecordId(row.id);
                                }}
                                rowClassName={(row) =>
                                    row.id === selectedRecordId
                                        ? 'bg-primary/10'
                                        : undefined
                                }
                                renderRowActions={(row) => (
                                    <Button
                                        tone='ghost'
                                        onClick={() => {
                                            setSelectedRecordId(row.id);
                                        }}>
                                        Focus
                                    </Button>
                                )}
                            />
                        ) : null}

                        {activeCollectionId === 'settings' ? (
                            <GraphiteDataTable
                                ariaLabel='Settings'
                                className='min-h-[30rem]'
                                columns={settingColumns()}
                                rows={settingItems}
                                rowKey={(row) => row.id}
                                onRowClick={(row) => {
                                    setSelectedRecordId(row.id);
                                }}
                                rowClassName={(row) =>
                                    row.id === selectedRecordId
                                        ? 'bg-primary/10'
                                        : undefined
                                }
                                renderRowActions={(row) => (
                                    <Button
                                        tone='ghost'
                                        onClick={() => {
                                            setSelectedRecordId(row.id);
                                        }}>
                                        Open
                                    </Button>
                                )}
                            />
                        ) : null}
                    </div>
                </Panel>
            </div>

            <div className='space-y-4'>
                <Panel variant='muted' className='p-4'>
                    <p className='text-[11px] uppercase tracking-[0.24em] text-muted-foreground'>
                        inspector
                    </p>
                    <h3 className='mt-3 text-xl font-semibold text-foreground'>
                        {activeMeta.label} detail
                    </h3>
                    <p className='mt-2 text-sm leading-6 text-muted-foreground'>
                        The inspector follows the active collection and keeps organization
                        context visible while you move between runs, tasks, and settings.
                    </p>
                </Panel>

                <Panel className='p-4'>
                    {activeCollectionId === 'organizations' ? (
                        <DetailList
                            items={[
                                {
                                    label: 'Organization',
                                    value:
                                        selectedOrganization?.displayName ??
                                        'No organization selected',
                                },
                                {
                                    label: 'Billing',
                                    value: selectedOrganization
                                        ? `${selectedOrganization.billing.state} / ${selectedOrganization.billing.planKey ?? 'no plan'}`
                                        : 'No billing summary',
                                },
                                {
                                    label: 'Usage',
                                    value: selectedOrganization
                                        ? formatQuota(selectedOrganization.usage)
                                        : 'No usage summary',
                                },
                                {
                                    label: 'Entitlements',
                                    value: selectedOrganization
                                        ? selectedOrganization.billing.entitlements
                                              .map((entry) => entry.key)
                                              .join(', ')
                                        : 'No entitlements',
                                },
                            ]}
                        />
                    ) : null}

                    {activeCollectionId === 'runs' ? (
                        <DetailList
                            items={[
                                {
                                    label: 'Run',
                                    value: selectedRun?.kind ?? 'No run selected',
                                },
                                {
                                    label: 'Status',
                                    value: selectedRun ? (
                                        <span
                                            className={cn(
                                                'inline-flex rounded-full border px-2 py-1 text-[11px] uppercase tracking-[0.18em]',
                                                statusToneClass(selectedRun.status),
                                            )}>
                                            {selectedRun.status}
                                        </span>
                                    ) : (
                                        'No status'
                                    ),
                                },
                                {
                                    label: 'Updated',
                                    value: selectedRun
                                        ? formatDate(selectedRun.updatedAt)
                                        : 'Pending',
                                },
                                {
                                    label: 'Input',
                                    value:
                                        selectedRunDetail?.input &&
                                        Object.keys(selectedRunDetail.input).length > 0
                                            ? JSON.stringify(
                                                  selectedRunDetail.input,
                                                  null,
                                                  2,
                                              )
                                            : runDetailLoading
                                              ? 'Loading run detail...'
                                              : 'No detailed run input available.',
                                },
                                {
                                    label: 'Logs',
                                    value:
                                        selectedRunDetail?.logs.length
                                            ? selectedRunDetail.logs
                                                  .map(
                                                      (entry) =>
                                                          `[${entry.level}] ${entry.message}`,
                                                  )
                                                  .join('\n')
                                            : runDetailLoading
                                              ? 'Loading logs...'
                                              : 'No detailed logs available.',
                                },
                            ]}
                        />
                    ) : null}

                    {activeCollectionId === 'inbox' && selectedInboxItem ? (
                        <DetailList
                            items={[
                                {
                                    label: 'Signal',
                                    value: selectedInboxItem.title,
                                },
                                {
                                    label: 'Source',
                                    value: selectedInboxItem.source,
                                },
                                {
                                    label: 'Status',
                                    value: selectedInboxItem.status,
                                },
                                {
                                    label: 'Summary',
                                    value: selectedInboxItem.summary,
                                },
                            ]}
                        />
                    ) : null}

                    {activeCollectionId === 'tasks' && selectedTaskItem ? (
                        <DetailList
                            items={[
                                {
                                    label: 'Task',
                                    value: selectedTaskItem.title,
                                },
                                {
                                    label: 'Lane',
                                    value: selectedTaskItem.lane,
                                },
                                {
                                    label: 'Priority',
                                    value: selectedTaskItem.priority.toUpperCase(),
                                },
                                {
                                    label: 'Summary',
                                    value: selectedTaskItem.summary,
                                },
                            ]}
                        />
                    ) : null}

                    {activeCollectionId === 'settings' && selectedSettingItem ? (
                        <DetailList
                            items={[
                                {
                                    label: 'Setting',
                                    value: selectedSettingItem.title,
                                },
                                {
                                    label: 'Scope',
                                    value: selectedSettingItem.scope,
                                },
                                {
                                    label: 'State',
                                    value: selectedSettingItem.state,
                                },
                                {
                                    label: 'Summary',
                                    value: selectedSettingItem.summary,
                                },
                            ]}
                        />
                    ) : null}
                </Panel>

                <Panel className='p-4'>
                    <p className='text-[11px] uppercase tracking-[0.24em] text-muted-foreground'>
                        workspace context
                    </p>
                    <div className='mt-4 space-y-3'>
                        <Text tone='muted'>
                            {selectedOrganization?.displayName ?? shell.organizationName}
                        </Text>
                        <Text tone='muted'>
                            {shell.workspaceName} / {shell.environmentLabel}
                        </Text>
                        <div className='rounded-2xl border border-border/70 bg-background/70 px-3 py-3 text-sm text-muted-foreground'>
                            Account and organization models now flow through a real shell state
                            layer. Dock integration can sit on top of this instead of replacing it.
                        </div>
                    </div>
                </Panel>
            </div>
        </section>
    );
}
