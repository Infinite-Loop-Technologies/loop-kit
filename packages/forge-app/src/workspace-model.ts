import type {
    BillingSummary,
    Organization,
    Run,
    SessionBootstrap,
    UsageSummary,
} from '@loop-kit/forge-contracts';

import type { ForgeShellConfig } from './types';

export type ForgeInboxItem = {
    id: string;
    title: string;
    summary: string;
    source: 'billing' | 'usage' | 'runs';
    status: 'new' | 'watch' | 'blocked';
};

export type ForgeTaskItem = {
    id: string;
    title: string;
    summary: string;
    lane: 'today' | 'next' | 'delegated';
    priority: 'p1' | 'p2' | 'p3';
};

export type ForgeProjectItem = {
    id: string;
    title: string;
    summary: string;
    state: 'active' | 'watch' | 'planned';
    nextStep: string;
    owner: string;
};

export type ForgeSettingItem = {
    id: string;
    title: string;
    summary: string;
    scope: 'account' | 'organization' | 'workspace' | 'integration';
    state: 'configured' | 'planned' | 'attention';
};

export type ForgeWorkspaceTreeItemKind =
    | 'inbox'
    | 'next-actions'
    | 'delegated'
    | 'projects'
    | 'project'
    | 'runs'
    | 'usage'
    | 'billing'
    | 'organizations'
    | 'settings';

export type ForgeWorkspaceTreeItem = {
    id: string;
    label: string;
    description: string;
    panelTitle: string;
    kind: ForgeWorkspaceTreeItemKind;
    badge?: string;
    children?: readonly ForgeWorkspaceTreeItem[];
};

export type ForgeWorkspaceSection = {
    id: string;
    label: string;
    items: readonly ForgeWorkspaceTreeItem[];
};

export type ForgeWorkspaceTree = {
    itemMap: Record<string, ForgeWorkspaceTreeItem>;
    sections: readonly ForgeWorkspaceSection[];
};

function formatPercent(used: number, limit: number | null | undefined) {
    if (!limit || limit <= 0) {
        return `${used}`;
    }

    return `${Math.round((used / limit) * 100)}%`;
}

function formatPlanBadge(billing: BillingSummary | null | undefined) {
    if (!billing?.planKey) {
        return 'plan';
    }

    return billing.planKey.replace(/[-_]/g, ' ');
}

function flattenItems(
    items: readonly ForgeWorkspaceTreeItem[],
    itemMap: Record<string, ForgeWorkspaceTreeItem>,
) {
    for (const item of items) {
        itemMap[item.id] = item;
        if (item.children?.length) {
            flattenItems(item.children, itemMap);
        }
    }
}

export function deriveForgeInboxItems({
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
            source: 'billing',
            status: 'watch',
            summary:
                'Promote the organization to an active plan before release automation depends on it.',
            title: 'Plan is still trialing',
        });
    }

    if (usage?.enforcementState === 'nearing_limit') {
        items.push({
            id: `${usage.organizationId}-quota`,
            source: 'usage',
            status: 'watch',
            summary: `Usage is trending hot for ${selectedOrganization?.displayName ?? 'the active organization'}. Review churn before the next burst.`,
            title: 'Run quota is nearing the limit',
        });
    }

    const urgentRun = runs.find(
        (run) => run.status === 'failed' || run.status === 'cancel_requested',
    );
    if (urgentRun) {
        items.push({
            id: `${urgentRun.id}-attention`,
            source: 'runs',
            status: 'blocked',
            summary: `A ${urgentRun.kind} run needs operator follow-up before the queue stays healthy.`,
            title: 'A recent run needs intervention',
        });
    }

    const activeRun = runs.find(
        (run) => run.status === 'running' || run.status === 'queued',
    );
    if (activeRun) {
        items.push({
            id: `${activeRun.id}-activity`,
            source: 'runs',
            status: activeRun.status === 'running' ? 'new' : 'watch',
            summary: `A ${activeRun.kind} job is ${activeRun.status}. Open the run panel to inspect its current posture.`,
            title: 'Run activity needs attention',
        });
    }

    if (items.length <= 0) {
        items.push({
            id: 'steady-state',
            source: 'runs',
            status: 'new',
            summary:
                'The active organization is in a steady state. Keep the inbox clear and drive work from Next Actions.',
            title: 'No urgent interrupts',
        });
    }

    return items;
}

export function deriveForgeTaskItems({
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
    const organizationLabel = selectedOrganization?.displayName ?? shell.organizationName;
    const tasks: ForgeTaskItem[] = [
        {
            id: 'task-triage-inbox',
            lane: 'today',
            priority: 'p1',
            summary: `Review new operational signals for ${organizationLabel} and turn one into an agent-handled outcome.`,
            title: 'Triage the inbox into action',
        },
        {
            id: 'task-queue-agent-work',
            lane: 'next',
            priority: 'p2',
            summary: `Turn ${shell.workspaceName} into a dependable handoff surface for agent-run work.`,
            title: 'Queue the next agent handoff',
        },
        {
            id: 'task-delegated-review',
            lane: 'delegated',
            priority: 'p2',
            summary: 'Wait on workflow validation feedback before broadening the next operator automation slice.',
            title: 'Hold for preview validation sign-off',
        },
    ];

    if (usage?.enforcementState === 'nearing_limit') {
        tasks.unshift({
            id: 'task-sandbox-capacity',
            lane: 'today',
            priority: 'p1',
            summary: 'Reduce unnecessary reruns before the next preview cycle consumes the remaining quota.',
            title: 'Trim sandbox churn',
        });
    }

    if (billing?.state === 'trialing') {
        tasks.push({
            id: 'task-plan-promotion',
            lane: 'next',
            priority: 'p2',
            summary: 'Confirm billing and entitlements before automations depend on the current trial posture.',
            title: 'Promote plan posture',
        });
    }

    if (runs.some((run) => run.status === 'failed')) {
        tasks.push({
            id: 'task-failed-runs-followup',
            lane: 'delegated',
            priority: 'p1',
            summary: 'Collect failure context and feed it back into the run templates before retrying.',
            title: 'Wait on failed-run remediation',
        });
    }

    return tasks;
}

export function deriveForgeProjectItems({
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
}): readonly ForgeProjectItem[] {
    const organizationLabel = selectedOrganization?.displayName ?? shell.organizationName;
    const activeRuns = runs.filter((run) => run.status === 'running' || run.status === 'queued')
        .length;

    return [
        {
            id: 'project-harness-cockpit',
            nextStep: 'Refine panel group defaults and shared open behaviors.',
            owner: 'Product shell',
            state: 'active',
            summary: `Turn ${shell.workspaceName} into a credible GTD-inspired cockpit for ${organizationLabel}.`,
            title: 'Harness cockpit',
        },
        {
            id: 'project-agent-runs',
            nextStep:
                activeRuns > 0
                    ? 'Stabilize live run triage before adding more queue complexity.'
                    : 'Start routing new queue items through the run control surfaces.',
            owner: 'Execution',
            state: activeRuns > 0 ? 'watch' : 'active',
            summary: 'Use the dock workspace to launch, inspect, and hand off agent-run work without leaving context.',
            title: 'Agent runs',
        },
        {
            id: 'project-preview-ops',
            nextStep:
                usage?.enforcementState === 'nearing_limit'
                    ? 'Review preview workload intensity and adjust plan posture.'
                    : 'Expand preview diagnostics across deployments and sandboxes.',
            owner: 'Platform',
            state: billing?.state === 'trialing' ? 'watch' : 'planned',
            summary:
                'Connect previews, usage signals, and billing posture into one clear operator story.',
            title: 'Preview operations',
        },
    ];
}

export function deriveForgeSettingItems({
    billing,
    selectedOrganization,
    shell,
}: {
    billing: BillingSummary | null;
    selectedOrganization: Organization | null;
    shell: ForgeShellConfig;
}): readonly ForgeSettingItem[] {
    return [
        {
            id: 'setting-account-identity',
            scope: 'account',
            state: 'configured',
            summary: 'Session bootstrap is already shaping the shared shell.',
            title: 'Identity and session posture',
        },
        {
            id: 'setting-workspace-shell',
            scope: 'workspace',
            state: 'configured',
            summary: `The ${shell.platform} shell is supplying skin and bridge defaults to ${shell.workspaceName}.`,
            title: 'Workspace shell defaults',
        },
        {
            id: 'setting-org-policy',
            scope: 'organization',
            state: billing?.state === 'trialing' ? 'attention' : 'planned',
            summary: `${selectedOrganization?.displayName ?? shell.organizationName} still needs fuller org-scoped policy controls.`,
            title: 'Organization policy',
        },
        {
            id: 'setting-integrations',
            scope: 'integration',
            state: 'planned',
            summary: 'OAuth-backed provider integrations should eventually land here instead of bespoke setup screens.',
            title: 'Integrations and secrets',
        },
    ];
}

export function createForgeWorkspaceTree({
    billing,
    inboxItems,
    projects,
    runs,
    session,
    settings,
    tasks,
    usage,
}: {
    billing: BillingSummary | null;
    inboxItems: readonly ForgeInboxItem[];
    projects: readonly ForgeProjectItem[];
    runs: readonly Run[];
    session: SessionBootstrap | null;
    settings: readonly ForgeSettingItem[];
    tasks: readonly ForgeTaskItem[];
    usage: UsageSummary | null;
}): ForgeWorkspaceTree {
    const nextActions = tasks.filter((task) => task.lane !== 'delegated');
    const delegated = tasks.filter((task) => task.lane === 'delegated');
    const projectChildren = projects.map<ForgeWorkspaceTreeItem>((project) => ({
        badge: project.state,
        description: project.summary,
        id: project.id,
        kind: 'project',
        label: project.title,
        panelTitle: project.title,
    }));

    const sections: readonly ForgeWorkspaceSection[] = [
        {
            id: 'capture',
            label: 'Capture',
            items: [
                {
                    badge: `${inboxItems.length}`,
                    description: 'Triage fresh signals and decide what moves into real work.',
                    id: 'inbox',
                    kind: 'inbox',
                    label: 'Inbox',
                    panelTitle: 'Inbox',
                },
                {
                    badge: `${nextActions.length}`,
                    description: 'The next handoffs and operator steps that should move now.',
                    id: 'next-actions',
                    kind: 'next-actions',
                    label: 'Next Actions',
                    panelTitle: 'Next Actions',
                },
                {
                    badge: `${delegated.length}`,
                    description: 'Items waiting on another agent, system, or reviewer.',
                    id: 'delegated',
                    kind: 'delegated',
                    label: 'Delegated',
                    panelTitle: 'Delegated',
                },
            ],
        },
        {
            id: 'planning',
            label: 'Planning',
            items: [
                {
                    badge: `${projects.length}`,
                    children: projectChildren,
                    description: 'Longer-running initiatives that collect actions and checkpoints.',
                    id: 'projects',
                    kind: 'projects',
                    label: 'Projects',
                    panelTitle: 'Projects',
                },
            ],
        },
        {
            id: 'operations',
            label: 'Operations',
            items: [
                {
                    badge: `${runs.length}`,
                    description: 'Queue posture, run history, and live execution signals.',
                    id: 'runs',
                    kind: 'runs',
                    label: 'Runs',
                    panelTitle: 'Runs',
                },
                {
                    badge: formatPercent(usage?.runsUsed ?? 0, usage?.runsLimit),
                    description: 'Quota, tokens, and operational headroom for the active organization.',
                    id: 'usage',
                    kind: 'usage',
                    label: 'Usage',
                    panelTitle: 'Usage',
                },
                {
                    badge: formatPlanBadge(billing),
                    description: 'Billing state, entitlements, and commercial posture.',
                    id: 'billing',
                    kind: 'billing',
                    label: 'Billing',
                    panelTitle: 'Billing',
                },
            ],
        },
        {
            id: 'admin',
            label: 'Admin',
            items: [
                {
                    badge: `${session?.organizations.length ?? 0}`,
                    description: 'Organization access and account context for the current session.',
                    id: 'organizations',
                    kind: 'organizations',
                    label: 'Organizations',
                    panelTitle: 'Organizations',
                },
                {
                    badge: `${settings.length}`,
                    description: 'Workspace, account, and integration defaults.',
                    id: 'settings',
                    kind: 'settings',
                    label: 'Settings',
                    panelTitle: 'Settings',
                },
            ],
        },
    ];

    const itemMap: Record<string, ForgeWorkspaceTreeItem> = {};
    flattenItems(
        sections.flatMap((section) => section.items),
        itemMap,
    );

    return {
        itemMap,
        sections,
    };
}
