import assert from 'node:assert/strict';
import test from 'node:test';

import { createForgeStubDataSource } from '../src/index';

test('createForgeStubDataSource returns session bootstrap and org-scoped summaries', async () => {
    const dataSource = createForgeStubDataSource({
        label: 'test stub',
    });

    const session = await dataSource.getSessionBootstrap();

    assert.equal(dataSource.kind, 'stub');
    assert.equal(dataSource.label, 'test stub');
    assert.equal(session.actor.displayName, 'Joshua Isaac');
    assert.equal(session.organizations.length, 2);

    const organizationId = session.selectedOrganizationId ?? session.organizations[0]!.id;
    const billing = await dataSource.getBillingSummary(organizationId);
    const usage = await dataSource.getUsageSummary(organizationId);
    const runs = await dataSource.listRuns({
        organizationId,
        limit: 10,
    });

    assert.equal(billing?.organizationId, organizationId);
    assert.equal(usage?.organizationId, organizationId);
    assert.ok(runs.items.length >= 1);

    const runDetail = await dataSource.getRun?.({
        organizationId,
        runId: runs.items[0]!.id,
    });

    assert.equal(runDetail?.organizationId, organizationId);
    assert.ok((runDetail?.logs.length ?? 0) >= 1);
});
