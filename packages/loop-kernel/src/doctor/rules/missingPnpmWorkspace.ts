import { type PatchPlan } from '@loop-kit/loop-contracts';
import type { DoctorRule } from '../types.js';
import { nodeFsGateway } from '../../io/fsGateway.js';

export const missingPnpmWorkspaceRule: DoctorRule = {
    id: 'workspace.missing-pnpm-workspace',
    async run(context) {
        const exists = await nodeFsGateway.exists(`${context.workspaceRoot}/pnpm-workspace.yaml`);
        if (exists) {
            return [];
        }

        const plan: PatchPlan = {
            id: 'workspace.ensure-pnpm-workspace',
            title: 'Ensure pnpm-workspace.yaml',
            provenance: { source: 'loop:doctor' },
            operations: [
                {
                    kind: 'ensureFile',
                    opId: 'workspace.pnpm-workspace',
                    path: 'pnpm-workspace.yaml',
                    overwrite: false,
                    content: 'packages:\n  - apps/*\n  - packages/*\n',
                },
            ],
            preconditions: [],
            postconditions: [],
        };

        return [
            {
                diagnostic: {
                    id: 'workspace.missing-pnpm-workspace',
                    severity: 'warning',
                    message: 'Missing pnpm-workspace.yaml file.',
                    evidence: { path: 'pnpm-workspace.yaml' },
                    suggestedFixIds: ['fix.workspace.pnpm-workspace'],
                },
                fix: {
                    id: 'fix.workspace.pnpm-workspace',
                    title: 'Create pnpm-workspace.yaml',
                    safe: true,
                    diagnosticIds: ['workspace.missing-pnpm-workspace'],
                    plan,
                },
            },
        ];
    },
};
