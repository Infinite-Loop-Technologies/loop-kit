import { describe, expect, test } from 'bun:test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { auditWorkspaceProjects } from '../src/workspace-audit';

describe('workspace audit', () => {
    test('reports missing scripts cleanly', () => {
        const root = fs.mkdtempSync(path.join(os.tmpdir(), 'loop-kit-tools-'));
        fs.mkdirSync(path.join(root, 'apps', 'demo'), { recursive: true });
        fs.writeFileSync(
            path.join(root, 'apps', 'demo', 'package.json'),
            JSON.stringify({ scripts: { test: 'echo ok' } }),
        );
        fs.mkdirSync(path.join(root, 'tools'), { recursive: true });
        fs.writeFileSync(path.join(root, 'tools', 'package.json'), JSON.stringify({ scripts: {} }));

        const result = auditWorkspaceProjects(root);
        const demo = result.find((entry) => entry.project === 'apps/demo');

        expect(demo?.hasTypecheckScript).toBe(false);
        expect(demo?.hasTestScript).toBe(true);
    });
});
