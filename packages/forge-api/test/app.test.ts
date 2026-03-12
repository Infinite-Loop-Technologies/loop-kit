import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';

import { buildForgeApiApp } from '../src/app.js';
import {
  createStubForgeServices,
  DEFAULT_STUB_ORGANIZATION_ID,
  DEFAULT_STUB_RUN_ID
} from '../src/services/stub-services.js';

test('GET /v0/session/bootstrap returns actor and org context', async (t) => {
  const app = await buildForgeApiApp();
  t.after(() => app.close());

  const response = await app.inject({
    method: 'GET',
    url: '/v0/session/bootstrap'
  });

  assert.equal(response.statusCode, 200);
  assert.equal(response.json().selectedOrganizationId, DEFAULT_STUB_ORGANIZATION_ID);
});

test('GET /v0/organizations returns visible organizations', async (t) => {
  const app = await buildForgeApiApp();
  t.after(() => app.close());

  const response = await app.inject({
    method: 'GET',
    url: '/v0/organizations'
  });

  assert.equal(response.statusCode, 200);
  assert.equal(response.json().items[0]?.id, DEFAULT_STUB_ORGANIZATION_ID);
});

test('POST /v0/organizations validates request bodies', async (t) => {
  const app = await buildForgeApiApp();
  t.after(() => app.close());

  const response = await app.inject({
    method: 'POST',
    payload: {
      displayName: ''
    },
    url: '/v0/organizations'
  });

  assert.equal(response.statusCode, 400);
  assert.equal(response.json().code, 'validation_error');
});

test('GET org billing and usage summaries return projection reads', async (t) => {
  const app = await buildForgeApiApp();
  t.after(() => app.close());

  const [billingResponse, usageResponse] = await Promise.all([
    app.inject({
      method: 'GET',
      url: `/v0/organizations/${DEFAULT_STUB_ORGANIZATION_ID}/billing-summary`
    }),
    app.inject({
      method: 'GET',
      url: `/v0/organizations/${DEFAULT_STUB_ORGANIZATION_ID}/usage-summary`
    })
  ]);

  assert.equal(billingResponse.statusCode, 200);
  assert.equal(usageResponse.statusCode, 200);
  assert.equal(billingResponse.json().provider, 'polar');
  assert.equal(usageResponse.json().organizationId, DEFAULT_STUB_ORGANIZATION_ID);
});

test('run lifecycle routes list, create, fetch, and cancel runs', async (t) => {
  const app = await buildForgeApiApp();
  t.after(() => app.close());

  const listResponse = await app.inject({
    method: 'GET',
    url: `/v0/organizations/${DEFAULT_STUB_ORGANIZATION_ID}/runs`
  });
  assert.equal(listResponse.statusCode, 200);
  assert.equal(listResponse.json().items[0]?.id, DEFAULT_STUB_RUN_ID);

  const createResponse = await app.inject({
    method: 'POST',
    payload: {
      idempotencyKey: 'idem_new',
      input: {
        goal: 'queue another run'
      },
      kind: 'agent.run'
    },
    url: `/v0/organizations/${DEFAULT_STUB_ORGANIZATION_ID}/runs`
  });
  assert.equal(createResponse.statusCode, 202);
  const createdRunId = createResponse.json().id;

  const getResponse = await app.inject({
    method: 'GET',
    url: `/v0/organizations/${DEFAULT_STUB_ORGANIZATION_ID}/runs/${createdRunId}`
  });
  assert.equal(getResponse.statusCode, 200);
  assert.equal(getResponse.json().id, createdRunId);

  const cancelResponse = await app.inject({
    method: 'POST',
    url: `/v0/organizations/${DEFAULT_STUB_ORGANIZATION_ID}/runs/${createdRunId}/cancel`
  });
  assert.equal(cancelResponse.statusCode, 202);
  assert.equal(cancelResponse.json().status, 'cancel_requested');
});

test('POST /runs returns 403 when quota enforcement blocks creation', async (t) => {
  const app = await buildForgeApiApp({
    services: createStubForgeServices({
      usage: {
        enforcementState: 'blocked'
      }
    })
  });
  t.after(() => app.close());

  const response = await app.inject({
    method: 'POST',
    payload: {
      input: {
        goal: 'blocked run'
      },
      kind: 'agent.run'
    },
    url: `/v0/organizations/${DEFAULT_STUB_ORGANIZATION_ID}/runs`
  });

  assert.equal(response.statusCode, 403);
  assert.equal(response.json().code, 'quota.exceeded');
});

test('migration baseline contains the required Forge tables', async () => {
  const drizzleDir = path.join(process.cwd(), 'drizzle');
  const migrationFile = (await readdir(drizzleDir)).find((entry) => entry.endsWith('.sql'));

  assert.ok(migrationFile);

  const migrationPath = path.join(drizzleDir, migrationFile);
  const migrationSql = await readFile(migrationPath, 'utf8');

  assert.match(migrationSql, /create table "forge_organizations"/i);
  assert.match(migrationSql, /create table "organization_billing_state"/i);
  assert.match(migrationSql, /create table "organization_quotas"/i);
  assert.match(migrationSql, /create table "agent_runs"/i);
  assert.match(migrationSql, /create table "agent_run_logs"/i);
  assert.match(migrationSql, /create table "agent_run_artifacts"/i);
});
