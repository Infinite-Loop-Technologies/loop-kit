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

export type ResolveSessionRequest = {
  headers: Record<string, string | string[] | undefined>;
  url: string;
};

export interface WorkOSAuthGateway {
  createOrganization(input: CreateOrganizationRequest & { actor: Actor }): Promise<Pick<Organization, 'role' | 'workosOrganizationId'>>;
  resolveSession(input: ResolveSessionRequest): Promise<AuthContext>;
}

export interface OrganizationService {
  create(input: CreateOrganizationRequest & { actor: Actor }): Promise<Organization>;
  get(organizationId: string): Promise<OrganizationDetail | null>;
  list(actor: Actor): Promise<Organization[]>;
}

export interface BillingProjectionService {
  getSummary(organizationId: string): Promise<BillingSummary | null>;
  projectState(input: { organizationId: string; sourceEventId: string; state: BillingSummary['state'] }): Promise<void>;
}

export interface UsageSummaryService {
  getSummary(organizationId: string): Promise<UsageSummary | null>;
}

export interface QuotaEnforcer {
  assertRunAllowed(input: { actor: Actor; organizationId: string; request: CreateRunRequest }): Promise<void>;
}

export interface RunDispatcher {
  cancelRun(input: { actor: Actor; organizationId: string; runId: string }): Promise<Run | null>;
  createRun(input: { actor: Actor; organizationId: string; request: CreateRunRequest }): Promise<Run>;
  getRun(input: { actor: Actor; organizationId: string; runId: string }): Promise<RunDetail | null>;
  listRuns(input: {
    actor: Actor;
    cursor?: string;
    limit?: number;
    organizationId: string;
    status?: Run['status'];
  }): Promise<RunListResponse>;
}

export type ForgeServices = {
  billing: BillingProjectionService;
  organizations: OrganizationService;
  quota: QuotaEnforcer;
  runs: RunDispatcher;
  usage: UsageSummaryService;
  workos: WorkOSAuthGateway;
};
