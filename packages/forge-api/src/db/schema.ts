import { pgEnum, pgTable, text, timestamp, uuid, integer, bigint, jsonb, uniqueIndex } from 'drizzle-orm/pg-core';

export const forgeRoleEnum = pgEnum('forge_role', ['owner', 'admin', 'member', 'viewer']);
export const billingStateEnum = pgEnum('billing_state', ['inactive', 'trialing', 'active', 'past_due', 'canceled']);
export const quotaStateEnum = pgEnum('quota_state', ['ok', 'nearing_limit', 'blocked']);
export const runStatusEnum = pgEnum('run_status', ['queued', 'running', 'completed', 'failed', 'canceled', 'cancel_requested']);

export const forgeOrganizations = pgTable('forge_organizations', {
  id: uuid('id').defaultRandom().primaryKey(),
  workosOrganizationId: text('workos_organization_id').notNull().unique(),
  slug: text('slug').notNull().unique(),
  displayName: text('display_name').notNull(),
  role: forgeRoleEnum('role').notNull().default('owner'),
  metadata: jsonb('metadata').$type<Record<string, unknown>>().notNull().default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
});

export const organizationBillingState = pgTable(
  'organization_billing_state',
  {
    organizationId: uuid('organization_id')
      .primaryKey()
      .references(() => forgeOrganizations.id, { onDelete: 'cascade' }),
    polarCustomerId: text('polar_customer_id'),
    state: billingStateEnum('state').notNull().default('inactive'),
    planKey: text('plan_key'),
    entitlements: jsonb('entitlements')
      .$type<Array<{ key: string; granted: boolean; reason?: string }>>()
      .notNull()
      .default([]),
    sourceEventId: text('source_event_id'),
    lastProjectedAt: timestamp('last_projected_at', { withTimezone: true }),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
  },
  (table) => [uniqueIndex('organization_billing_state_polar_customer_id_idx').on(table.polarCustomerId)]
);

export const organizationQuotas = pgTable('organization_quotas', {
  organizationId: uuid('organization_id')
    .primaryKey()
    .references(() => forgeOrganizations.id, { onDelete: 'cascade' }),
  periodStart: timestamp('period_start', { withTimezone: true }).notNull(),
  periodEnd: timestamp('period_end', { withTimezone: true }).notNull(),
  runsUsed: integer('runs_used').notNull().default(0),
  runsLimit: integer('runs_limit'),
  tokensUsed: bigint('tokens_used', { mode: 'number' }).notNull().default(0),
  tokensLimit: bigint('tokens_limit', { mode: 'number' }),
  enforcementState: quotaStateEnum('enforcement_state').notNull().default('ok'),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
});

export const agentRuns = pgTable(
  'agent_runs',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => forgeOrganizations.id, { onDelete: 'cascade' }),
    requestedByWorkosUserId: text('requested_by_workos_user_id').notNull(),
    kind: text('kind').notNull(),
    input: jsonb('input').$type<Record<string, unknown>>().notNull(),
    idempotencyKey: text('idempotency_key'),
    status: runStatusEnum('status').notNull().default('queued'),
    logCount: integer('log_count').notNull().default(0),
    artifactCount: integer('artifact_count').notNull().default(0),
    cancelRequestedAt: timestamp('cancel_requested_at', { withTimezone: true }),
    startedAt: timestamp('started_at', { withTimezone: true }),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
  },
  (table) => [uniqueIndex('agent_runs_org_idempotency_key_idx').on(table.organizationId, table.idempotencyKey)]
);

export const agentRunLogs = pgTable(
  'agent_run_logs',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    runId: uuid('run_id')
      .notNull()
      .references(() => agentRuns.id, { onDelete: 'cascade' }),
    entryIndex: integer('entry_index').notNull(),
    level: text('level').notNull(),
    message: text('message').notNull(),
    occurredAt: timestamp('occurred_at', { withTimezone: true }).defaultNow().notNull()
  },
  (table) => [uniqueIndex('agent_run_logs_run_entry_idx').on(table.runId, table.entryIndex)]
);

export const agentRunArtifacts = pgTable('agent_run_artifacts', {
  id: uuid('id').defaultRandom().primaryKey(),
  runId: uuid('run_id')
    .notNull()
    .references(() => agentRuns.id, { onDelete: 'cascade' }),
  kind: text('kind').notNull(),
  name: text('name').notNull(),
  contentType: text('content_type').notNull(),
  url: text('url'),
  metadata: jsonb('metadata').$type<Record<string, unknown>>().notNull().default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
});

export const schema = {
  agentRunArtifacts,
  agentRunLogs,
  agentRuns,
  forgeOrganizations,
  organizationBillingState,
  organizationQuotas
};
