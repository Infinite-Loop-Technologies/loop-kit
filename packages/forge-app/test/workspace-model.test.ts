import assert from 'node:assert/strict';
import test from 'node:test';

import { createForgeStubDataSource } from '../src/data-source';
import {
    createForgeWorkspaceTree,
    deriveForgeInboxItems,
    deriveForgeProjectItems,
    deriveForgeSettingItems,
    deriveForgeTaskItems,
} from '../src/workspace-model';
import type { ForgeShellConfig } from '../src/types';

const testShell: ForgeShellConfig = {
    capabilitySummary: [],
    environmentLabel: 'test',
    id: 'forge-test',
    navigationMode: 'memory',
    notes: [],
    organizationName: 'Infinite Loop Technologies',
    platform: 'web',
    title: 'Forge Test',
    workspaceName: 'loop-kit',
};

test('workspace model derives GTD collections and tree structure from stub data', async () => {
    const dataSource = createForgeStubDataSource({
        label: 'workspace-test',
    });

    const session = await dataSource.getSessionBootstrap();
    const organizationId = session.selectedOrganizationId ?? session.organizations[0]!.id;
    const selectedOrganization =
        session.organizations.find((entry) => entry.id === organizationId) ?? null;
    const billing = await dataSource.getBillingSummary(organizationId);
    const usage = await dataSource.getUsageSummary(organizationId);
    const runs = (await dataSource.listRuns({ limit: 20, organizationId })).items;

    const inboxItems = deriveForgeInboxItems({
        billing,
        runs,
        selectedOrganization,
        usage,
    });
    const tasks = deriveForgeTaskItems({
        billing,
        runs,
        selectedOrganization,
        shell: testShell,
        usage,
    });
    const projects = deriveForgeProjectItems({
        billing,
        runs,
        selectedOrganization,
        shell: testShell,
        usage,
    });
    const settings = deriveForgeSettingItems({
        billing,
        selectedOrganization,
        shell: testShell,
    });
    const tree = createForgeWorkspaceTree({
        billing,
        inboxItems,
        projects,
        runs,
        session,
        settings,
        tasks,
        usage,
    });

    assert.ok(inboxItems.length >= 1);
    assert.ok(tasks.some((task) => task.lane === 'delegated'));
    assert.equal(projects.length, 3);
    assert.equal(settings.length, 4);

    assert.deepEqual(
        tree.sections.map((section) => section.id),
        ['capture', 'planning', 'operations', 'admin'],
    );
    assert.equal(tree.itemMap.inbox.label, 'Inbox');
    assert.equal(tree.itemMap.projects.children?.length, projects.length);
    assert.equal(tree.itemMap.organizations.badge, String(session.organizations.length));
});
