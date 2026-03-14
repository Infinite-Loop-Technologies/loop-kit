import {
    createForgeApiClient,
    getBillingSummary,
    getRun,
    getSessionBootstrap,
    getUsageSummary,
    listRuns,
    type BillingSummary,
    type ForgeApiAuthToken,
    type Organization,
    type Run,
    type RunDetail,
    type RunListResponse,
    type RunStatus,
    type SessionBootstrap,
    type UsageSummary,
} from '@loop-kit/forge-contracts';

export type ForgeShellDataSourceKind = 'api' | 'stub';

export type ForgeShellRunsQuery = {
    organizationId: string;
    status?: RunStatus;
    cursor?: string;
    limit?: number;
};

export type ForgeShellRunDetailQuery = {
    organizationId: string;
    runId: string;
};

export interface ForgeShellDataSource {
    kind: ForgeShellDataSourceKind;
    label: string;
    getSessionBootstrap(): Promise<SessionBootstrap>;
    getBillingSummary(organizationId: string): Promise<BillingSummary | null>;
    getUsageSummary(organizationId: string): Promise<UsageSummary | null>;
    listRuns(query: ForgeShellRunsQuery): Promise<RunListResponse>;
    getRun?(query: ForgeShellRunDetailQuery): Promise<RunDetail | null>;
}

export type ForgeApiDataSourceOptions = {
    authToken?: ForgeApiAuthToken;
    baseUrl: string;
    fetch?: typeof globalThis.fetch;
    headers?: HeadersInit;
    label?: string;
};

type ForgeStubDataSourceOptions = {
    label?: string;
    organizations?: readonly Organization[];
    runDetailsByOrganization?: Record<string, readonly RunDetail[]>;
    selectedOrganizationId?: string | null;
    session?: SessionBootstrap;
};

const DEFAULT_STUB_ORGANIZATION_ID = '11111111-1111-1111-1111-111111111111';
const SECONDARY_STUB_ORGANIZATION_ID = '44444444-4444-4444-4444-444444444444';
const DEFAULT_STUB_RUN_ID = '22222222-2222-2222-2222-222222222222';
const SECONDARY_STUB_RUN_ID = '55555555-5555-5555-5555-555555555555';
const TERTIARY_STUB_RUN_ID = '66666666-6666-6666-6666-666666666666';
const QUATERNARY_STUB_RUN_ID = '77777777-7777-7777-7777-777777777777';
const DEFAULT_STUB_ARTIFACT_ID = '33333333-3333-3333-3333-333333333333';

export function createForgeApiDataSource(
    options: ForgeApiDataSourceOptions,
): ForgeShellDataSource {
    const client = createForgeApiClient({
        authToken: options.authToken,
        baseUrl: options.baseUrl,
        fetch: options.fetch,
        headers: options.headers,
    });

    return {
        kind: 'api',
        label: options.label ?? formatApiLabel(options.baseUrl),
        getSessionBootstrap() {
            return getSessionBootstrap({
                client,
                responseStyle: 'data',
                throwOnError: true,
            }).then((result) => result.data);
        },
        getBillingSummary(organizationId) {
            return getBillingSummary({
                client,
                path: { organizationId },
                responseStyle: 'data',
                throwOnError: true,
            }).then((result) => result.data);
        },
        getUsageSummary(organizationId) {
            return getUsageSummary({
                client,
                path: { organizationId },
                responseStyle: 'data',
                throwOnError: true,
            }).then((result) => result.data);
        },
        listRuns(query) {
            return listRuns({
                client,
                path: { organizationId: query.organizationId },
                query: {
                    cursor: query.cursor,
                    limit: query.limit,
                    status: query.status,
                },
                responseStyle: 'data',
                throwOnError: true,
            }).then((result) => result.data);
        },
        getRun(query) {
            return getRun({
                client,
                path: {
                    organizationId: query.organizationId,
                    runId: query.runId,
                },
                responseStyle: 'data',
                throwOnError: true,
            }).then((result) => result.data);
        },
    };
}

export function createForgeStubDataSource(
    options: ForgeStubDataSourceOptions = {},
): ForgeShellDataSource {
    const defaultOrganizations = options.organizations ?? createDefaultOrganizations();
    const organizations = [...defaultOrganizations];
    const runsByOrganization = new Map<string, readonly RunDetail[]>(
        Object.entries(
            options.runDetailsByOrganization ??
                createDefaultRunsByOrganization(defaultOrganizations),
        ),
    );
    const session =
        options.session ??
        ({
            actor: {
                displayName: 'Joshua Isaac',
                email: 'joshua@loopkit.dev',
                workosUserId: 'user_01',
            },
            organizations,
            selectedOrganizationId:
                options.selectedOrganizationId ?? organizations[0]?.id ?? null,
        } satisfies SessionBootstrap);

    return {
        kind: 'stub',
        label: options.label ?? 'preview stub data',
        async getSessionBootstrap() {
            return cloneSessionBootstrap(session);
        },
        async getBillingSummary(organizationId) {
            const organization = session.organizations.find(
                (candidate) => candidate.id === organizationId,
            );
            return organization ? cloneOrganization(organization).billing : null;
        },
        async getUsageSummary(organizationId) {
            const organization = session.organizations.find(
                (candidate) => candidate.id === organizationId,
            );
            return organization ? cloneOrganization(organization).usage : null;
        },
        async listRuns(query) {
            const sourceRuns = [
                ...(runsByOrganization.get(query.organizationId) ?? []),
            ];
            const filteredRuns = query.status
                ? sourceRuns.filter((run) => run.status === query.status)
                : sourceRuns;
            const offset = Number.parseInt(query.cursor ?? '0', 10);
            const startIndex = Number.isNaN(offset) ? 0 : offset;
            const limit = query.limit ?? 20;

            return {
                items: filteredRuns
                    .slice(startIndex, startIndex + limit)
                    .map(cloneRunSummary),
                nextCursor:
                    startIndex + limit < filteredRuns.length
                        ? String(startIndex + limit)
                        : null,
            };
        },
        async getRun(query) {
            return (
                cloneRunDetail(
                    (runsByOrganization.get(query.organizationId) ?? []).find(
                        (run) => run.id === query.runId,
                    ),
                ) ?? null
            );
        },
    };
}

function formatApiLabel(baseUrl: string): string {
    try {
        const url = new URL(baseUrl);
        return `api ${url.host}`;
    } catch {
        return `api ${baseUrl}`;
    }
}

function createDefaultOrganizations(): readonly Organization[] {
    return [
        {
            id: DEFAULT_STUB_ORGANIZATION_ID,
            workosOrganizationId: 'workos_org_01',
            slug: 'infinite-loop-technologies',
            displayName: 'Infinite Loop Technologies',
            role: 'owner',
            billing: {
                entitlements: [
                    { granted: true, key: 'runs.basic', reason: 'starter-plan' },
                    { granted: true, key: 'workflows.preview', reason: 'vercel-preview' },
                ],
                lastProjectedAt: '2026-03-14T13:40:00.000Z',
                organizationId: DEFAULT_STUB_ORGANIZATION_ID,
                planKey: 'starter',
                provider: 'polar',
                sourceEventId: 'evt_preview_01',
                state: 'trialing',
            },
            usage: {
                enforcementState: 'ok',
                organizationId: DEFAULT_STUB_ORGANIZATION_ID,
                periodEnd: '2026-03-31T23:59:59.999Z',
                periodStart: '2026-03-01T00:00:00.000Z',
                runsLimit: 100,
                runsUsed: 37,
                tokensLimit: 1000000,
                tokensUsed: 418230,
                updatedAt: '2026-03-14T13:40:00.000Z',
            },
            createdAt: '2026-03-10T16:00:00.000Z',
            updatedAt: '2026-03-14T13:40:00.000Z',
        },
        {
            id: SECONDARY_STUB_ORGANIZATION_ID,
            workosOrganizationId: 'workos_org_02',
            slug: 'forge-labs',
            displayName: 'Forge Labs',
            role: 'admin',
            billing: {
                entitlements: [
                    { granted: true, key: 'runs.basic', reason: 'growth-plan' },
                    { granted: true, key: 'sandboxes.enabled', reason: 'growth-plan' },
                ],
                lastProjectedAt: '2026-03-14T12:05:00.000Z',
                organizationId: SECONDARY_STUB_ORGANIZATION_ID,
                planKey: 'growth',
                provider: 'polar',
                sourceEventId: 'evt_growth_01',
                state: 'active',
            },
            usage: {
                enforcementState: 'nearing_limit',
                organizationId: SECONDARY_STUB_ORGANIZATION_ID,
                periodEnd: '2026-03-31T23:59:59.999Z',
                periodStart: '2026-03-01T00:00:00.000Z',
                runsLimit: 250,
                runsUsed: 213,
                tokensLimit: 3500000,
                tokensUsed: 2921180,
                updatedAt: '2026-03-14T12:05:00.000Z',
            },
            createdAt: '2026-03-11T08:30:00.000Z',
            updatedAt: '2026-03-14T12:05:00.000Z',
        },
    ];
}

function createDefaultRunsByOrganization(
    organizations: readonly Organization[],
): Record<string, readonly RunDetail[]> {
    const primaryOrganization =
        organizations.find((organization) => organization.id === DEFAULT_STUB_ORGANIZATION_ID) ??
        organizations[0];
    const secondaryOrganization =
        organizations.find((organization) => organization.id === SECONDARY_STUB_ORGANIZATION_ID) ??
        organizations[1] ??
        primaryOrganization;

    if (!primaryOrganization || !secondaryOrganization) {
        return {};
    }

    return {
        [primaryOrganization.id]: [
            createRunDetail(primaryOrganization.id, {
                artifactCount: 2,
                completedAt: null,
                createdAt: '2026-03-14T13:25:00.000Z',
                id: DEFAULT_STUB_RUN_ID,
                input: {
                    objective: 'Ship Forge workspace shell against preview contracts',
                    workspace: 'loop-kit',
                },
                kind: 'agent.run',
                logs: [
                    createRunLog(0, 'info', 'Preview run queued from the Forge shell.'),
                    createRunLog(1, 'info', 'Workspace shell bootstrap loaded.'),
                ],
                startedAt: '2026-03-14T13:26:12.000Z',
                status: 'running',
                updatedAt: '2026-03-14T13:28:44.000Z',
            }),
            createRunDetail(primaryOrganization.id, {
                artifactCount: 1,
                completedAt: '2026-03-14T09:19:00.000Z',
                createdAt: '2026-03-14T09:01:00.000Z',
                id: SECONDARY_STUB_RUN_ID,
                input: {
                    objective: 'Project billing and usage summaries into the ops shell',
                },
                kind: 'workflow.deploy',
                logs: [
                    createRunLog(0, 'info', 'Projection workers dispatched.'),
                    createRunLog(1, 'info', 'Billing projection finished.'),
                ],
                startedAt: '2026-03-14T09:03:00.000Z',
                status: 'completed',
                updatedAt: '2026-03-14T09:19:00.000Z',
            }),
        ],
        [secondaryOrganization.id]: [
            createRunDetail(secondaryOrganization.id, {
                artifactCount: 0,
                completedAt: null,
                createdAt: '2026-03-14T12:12:00.000Z',
                id: TERTIARY_STUB_RUN_ID,
                input: {
                    objective: 'Inspect sandbox capacity before workflow promotion',
                },
                kind: 'sandbox.inspect',
                logs: [
                    createRunLog(0, 'warn', 'Sandbox pool is nearing capacity.'),
                ],
                startedAt: null,
                status: 'queued',
                updatedAt: '2026-03-14T12:13:00.000Z',
            }),
            createRunDetail(secondaryOrganization.id, {
                artifactCount: 1,
                completedAt: '2026-03-13T22:40:00.000Z',
                createdAt: '2026-03-13T22:18:00.000Z',
                id: QUATERNARY_STUB_RUN_ID,
                input: {
                    objective: 'Audit agent traces after failure burst',
                },
                kind: 'agent.audit',
                logs: [
                    createRunLog(0, 'error', 'Retry budget exhausted on trace replay.'),
                ],
                startedAt: '2026-03-13T22:20:00.000Z',
                status: 'failed',
                updatedAt: '2026-03-13T22:40:00.000Z',
            }),
        ],
    };
}

function createRunDetail(
    organizationId: string,
    overrides: Partial<RunDetail> = {},
): RunDetail {
    const runId = overrides.id ?? DEFAULT_STUB_RUN_ID;

    return {
        artifactCount: overrides.artifactCount ?? 1,
        artifacts: overrides.artifacts ?? [
            {
                contentType: 'text/plain',
                createdAt: overrides.updatedAt ?? '2026-03-14T13:28:44.000Z',
                id: DEFAULT_STUB_ARTIFACT_ID,
                kind: 'log-export',
                metadata: {
                    bytes: 1280,
                },
                name: 'run.log',
                url: `https://forge.invalid/artifacts/${runId}.log`,
            },
        ],
        cancelRequestedAt: overrides.cancelRequestedAt ?? null,
        completedAt: overrides.completedAt ?? null,
        createdAt: overrides.createdAt ?? '2026-03-14T13:25:00.000Z',
        id: runId,
        idempotencyKey: overrides.idempotencyKey ?? `idem_${runId.slice(0, 8)}`,
        input: overrides.input ?? {
            objective: 'Stub objective',
        },
        kind: overrides.kind ?? 'agent.run',
        logCount: overrides.logs?.length ?? overrides.logCount ?? 1,
        logs: overrides.logs ?? [createRunLog(0, 'info', 'Stub run queued.')],
        organizationId,
        requestedByWorkosUserId:
            overrides.requestedByWorkosUserId ?? 'user_01',
        startedAt: overrides.startedAt ?? null,
        status: overrides.status ?? 'queued',
        updatedAt: overrides.updatedAt ?? overrides.createdAt ?? '2026-03-14T13:25:00.000Z',
    };
}

function createRunLog(
    index: number,
    level: RunDetail['logs'][number]['level'],
    message: string,
) {
    return {
        index,
        level,
        message,
        timestamp: `2026-03-14T13:${String(index + 20).padStart(2, '0')}:00.000Z`,
    };
}

function cloneSessionBootstrap(session: SessionBootstrap): SessionBootstrap {
    return {
        actor: { ...session.actor },
        organizations: session.organizations.map((organization) =>
            cloneOrganization(organization),
        ),
        selectedOrganizationId: session.selectedOrganizationId ?? null,
    };
}

function cloneOrganization(organization: Organization): Organization {
    return {
        ...organization,
        billing: {
            ...organization.billing,
            entitlements: organization.billing.entitlements.map((entitlement) => ({
                ...entitlement,
            })),
        },
        usage: { ...organization.usage },
    };
}

function cloneRunSummary(run: RunDetail): Run {
    const { artifacts: _artifacts, input: _input, logs: _logs, ...summary } = run;
    return { ...summary };
}

function cloneRunDetail(run: RunDetail | undefined): RunDetail | undefined {
    if (!run) {
        return undefined;
    }

    return {
        ...run,
        artifacts: run.artifacts.map((artifact) => ({
            ...artifact,
            metadata: artifact.metadata ? { ...artifact.metadata } : undefined,
        })),
        input: { ...run.input },
        logs: run.logs.map((log) => ({ ...log })),
    };
}
