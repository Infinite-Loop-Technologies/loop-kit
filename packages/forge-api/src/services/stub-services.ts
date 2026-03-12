import { randomUUID } from 'node:crypto';

import type {
  Actor,
  BillingSummary,
  CreateOrganizationRequest,
  CreateRunRequest,
  Organization,
  OrganizationDetail,
  Run,
  RunDetail,
  RunListResponse,
  UsageSummary
} from '@loop-kit/forge-contracts';

import type { AuthContext } from '../types.js';
import { QuotaExceededError, ResourceNotFoundError } from '../utils/errors.js';
import type { ForgeServices, ResolveSessionRequest } from './interfaces.js';

export const DEFAULT_STUB_ORGANIZATION_ID = '11111111-1111-1111-1111-111111111111';
export const DEFAULT_STUB_RUN_ID = '22222222-2222-2222-2222-222222222222';
export const DEFAULT_STUB_ARTIFACT_ID = '33333333-3333-3333-3333-333333333333';

type StubForgeServicesOptions = {
  actor?: Partial<Actor>;
  billing?: Partial<BillingSummary>;
  organization?: Partial<OrganizationDetail>;
  runs?: RunDetail[];
  selectedOrganizationId?: string | null;
  usage?: Partial<UsageSummary>;
};

type StubState = {
  actor: Actor;
  organizations: Map<string, OrganizationDetail>;
  runsByOrganization: Map<string, RunDetail[]>;
  selectedOrganizationId: string | null;
  workosCounter: number;
};

export function createStubForgeServices(options: StubForgeServicesOptions = {}): ForgeServices {
  const organization = createDefaultOrganization(options);
  const state: StubState = {
    actor: {
      displayName: options.actor?.displayName ?? 'Forge Stub User',
      email: options.actor?.email ?? 'forge@example.test',
      workosUserId: options.actor?.workosUserId ?? 'user_01'
    },
    organizations: new Map([[organization.id, organization]]),
    runsByOrganization: new Map([
      [
        organization.id,
        options.runs ?? [createDefaultRun(organization.id, { requestedByWorkosUserId: options.actor?.workosUserId ?? 'user_01' })]
      ]
    ]),
    selectedOrganizationId: options.selectedOrganizationId ?? organization.id,
    workosCounter: 1
  };

  const services: ForgeServices = {
    billing: {
      async getSummary(organizationId) {
        return state.organizations.get(organizationId)?.billing ?? null;
      },
      async projectState(input) {
        const organizationDetail = state.organizations.get(input.organizationId);
        if (!organizationDetail) {
          throw new ResourceNotFoundError('Organization', { organizationId: input.organizationId });
        }

        organizationDetail.billing = {
          ...organizationDetail.billing,
          lastProjectedAt: new Date().toISOString(),
          sourceEventId: input.sourceEventId,
          state: input.state
        };
      }
    },
    organizations: {
      async create(input) {
        const workosResult = await services.workos.createOrganization(input);
        const organizationId = randomUUID();
        const usage = createUsageSummary(organizationId);
        const billing = createBillingSummary(organizationId);
        const organizationDetail: OrganizationDetail = {
          billing,
          createdAt: new Date().toISOString(),
          displayName: input.displayName,
          id: organizationId,
          metadata: {
            projectionSource: 'stub'
          },
          role: workosResult.role,
          slug: input.slug,
          updatedAt: new Date().toISOString(),
          usage,
          workosOrganizationId: workosResult.workosOrganizationId
        };

        state.organizations.set(organizationId, organizationDetail);
        state.runsByOrganization.set(organizationId, []);
        state.selectedOrganizationId ??= organizationId;

        return stripOrganizationDetail(organizationDetail);
      },
      async get(organizationId) {
        return state.organizations.get(organizationId) ?? null;
      },
      async list() {
        return [...state.organizations.values()].map(stripOrganizationDetail);
      }
    },
    quota: {
      async assertRunAllowed(input) {
        const usage = state.organizations.get(input.organizationId)?.usage;
        if (!usage) {
          throw new ResourceNotFoundError('Organization', { organizationId: input.organizationId });
        }

        if (usage.enforcementState === 'blocked') {
          throw new QuotaExceededError({
            organizationId: input.organizationId,
            runsUsed: usage.runsUsed,
            runsLimit: usage.runsLimit
          });
        }
      }
    },
    runs: {
      async cancelRun(input) {
        const runs = state.runsByOrganization.get(input.organizationId);
        const run = runs?.find((candidate) => candidate.id === input.runId);
        if (!run) {
          return null;
        }

        const now = new Date().toISOString();
        run.cancelRequestedAt = now;
        run.status = 'cancel_requested';
        run.updatedAt = now;

        return stripRunDetail(run);
      },
      async createRun(input) {
        const organizationDetail = state.organizations.get(input.organizationId);
        if (!organizationDetail) {
          throw new ResourceNotFoundError('Organization', { organizationId: input.organizationId });
        }

        const now = new Date().toISOString();
        const run: RunDetail = {
          artifactCount: 0,
          artifacts: [],
          cancelRequestedAt: null,
          completedAt: null,
          createdAt: now,
          id: randomUUID(),
          idempotencyKey: input.request.idempotencyKey ?? null,
          input: input.request.input,
          kind: input.request.kind,
          logCount: 0,
          logs: [],
          organizationId: input.organizationId,
          requestedByWorkosUserId: input.actor.workosUserId,
          startedAt: null,
          status: 'queued',
          updatedAt: now
        };

        const runs = state.runsByOrganization.get(input.organizationId) ?? [];
        runs.unshift(run);
        state.runsByOrganization.set(input.organizationId, runs);

        organizationDetail.usage = {
          ...organizationDetail.usage,
          runsUsed: organizationDetail.usage.runsUsed + 1,
          updatedAt: now
        };
        organizationDetail.updatedAt = now;

        return stripRunDetail(run);
      },
      async getRun(input) {
        return (
          state.runsByOrganization
            .get(input.organizationId)
            ?.find((candidate) => candidate.id === input.runId) ?? null
        );
      },
      async listRuns(input) {
        const runs = state.runsByOrganization.get(input.organizationId) ?? [];
        const filtered = input.status ? runs.filter((run) => run.status === input.status) : runs;
        const offset = Number.parseInt(input.cursor ?? '0', 10);
        const startIndex = Number.isNaN(offset) ? 0 : offset;
        const limit = input.limit ?? 20;
        const items = filtered.slice(startIndex, startIndex + limit).map(stripRunDetail);
        const nextCursor = startIndex + limit < filtered.length ? String(startIndex + limit) : null;

        return {
          items,
          nextCursor
        } satisfies RunListResponse;
      }
    },
    usage: {
      async getSummary(organizationId) {
        return state.organizations.get(organizationId)?.usage ?? null;
      }
    },
    workos: {
      async createOrganization(input) {
        state.workosCounter += 1;
        return {
          role: 'owner',
          workosOrganizationId: `workos_org_${input.slug}_${state.workosCounter}`
        };
      },
      async resolveSession(_input: ResolveSessionRequest): Promise<AuthContext> {
        return {
          actor: state.actor,
          selectedOrganizationId: state.selectedOrganizationId
        };
      }
    }
  };

  return services;
}

function createDefaultOrganization(options: StubForgeServicesOptions): OrganizationDetail {
  const organizationId = options.organization?.id ?? DEFAULT_STUB_ORGANIZATION_ID;
  return {
    billing: createBillingSummary(organizationId, options.billing),
    createdAt: options.organization?.createdAt ?? '2026-03-12T00:00:00.000Z',
    displayName: options.organization?.displayName ?? 'Infinite Loop Technologies',
    id: organizationId,
    metadata: options.organization?.metadata ?? {
      projectionSource: 'stub'
    },
    role: options.organization?.role ?? 'owner',
    slug: options.organization?.slug ?? 'infinite-loop-technologies',
    updatedAt: options.organization?.updatedAt ?? '2026-03-12T00:00:00.000Z',
    usage: createUsageSummary(organizationId, options.usage),
    workosOrganizationId: options.organization?.workosOrganizationId ?? 'workos_org_01'
  };
}

function createBillingSummary(
  organizationId: string,
  overrides: Partial<BillingSummary> = {}
): BillingSummary {
  return {
    entitlements:
      overrides.entitlements ?? [{ granted: true, key: 'runs.basic', reason: 'starter-plan' }],
    lastProjectedAt: overrides.lastProjectedAt ?? '2026-03-12T00:00:00.000Z',
    organizationId,
    planKey: overrides.planKey ?? 'starter',
    provider: 'polar',
    sourceEventId: overrides.sourceEventId ?? 'evt_01',
    state: overrides.state ?? 'trialing'
  };
}

function createUsageSummary(
  organizationId: string,
  overrides: Partial<UsageSummary> = {}
): UsageSummary {
  return {
    enforcementState: overrides.enforcementState ?? 'ok',
    organizationId,
    periodEnd: overrides.periodEnd ?? '2026-03-31T23:59:59.999Z',
    periodStart: overrides.periodStart ?? '2026-03-01T00:00:00.000Z',
    runsLimit: overrides.runsLimit ?? 100,
    runsUsed: overrides.runsUsed ?? 7,
    tokensLimit: overrides.tokensLimit ?? 1000000,
    tokensUsed: overrides.tokensUsed ?? 42000,
    updatedAt: overrides.updatedAt ?? '2026-03-12T00:00:00.000Z'
  };
}

function createDefaultRun(
  organizationId: string,
  overrides: Partial<RunDetail> = {}
): RunDetail {
  return {
    artifactCount: overrides.artifactCount ?? 1,
    artifacts:
      overrides.artifacts ?? [
        {
          contentType: 'text/plain',
          createdAt: '2026-03-12T00:06:00.000Z',
          id: DEFAULT_STUB_ARTIFACT_ID,
          kind: 'log-export',
          metadata: {
            bytes: 128
          },
          name: 'run.log',
          url: 'https://forge.invalid/artifacts/run.log'
        }
      ],
    cancelRequestedAt: overrides.cancelRequestedAt ?? null,
    completedAt: overrides.completedAt ?? null,
    createdAt: overrides.createdAt ?? '2026-03-12T00:05:00.000Z',
    id: overrides.id ?? DEFAULT_STUB_RUN_ID,
    idempotencyKey: overrides.idempotencyKey ?? 'idem_01',
    input: overrides.input ?? {
      goal: 'bootstrap backend foundation'
    },
    kind: overrides.kind ?? 'agent.run',
    logCount: overrides.logCount ?? 1,
    logs:
      overrides.logs ?? [
        {
          index: 0,
          level: 'info',
          message: 'Run queued by stub dispatcher.',
          timestamp: '2026-03-12T00:05:00.000Z'
        }
      ],
    organizationId,
    requestedByWorkosUserId: overrides.requestedByWorkosUserId ?? 'user_01',
    startedAt: overrides.startedAt ?? null,
    status: overrides.status ?? 'queued',
    updatedAt: overrides.updatedAt ?? '2026-03-12T00:05:00.000Z'
  };
}

function stripOrganizationDetail(organization: OrganizationDetail): Organization {
  const { metadata: _metadata, ...rest } = organization;
  return rest;
}

function stripRunDetail(run: RunDetail): Run {
  const { artifacts: _artifacts, input: _input, logs: _logs, ...rest } = run;
  return rest;
}
