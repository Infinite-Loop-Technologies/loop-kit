import { type PatchPlan } from '@loop-kit/loop-contracts';
import type { DoctorRule } from '../types.js';
import { nodeFsGateway } from '../../io/fsGateway.js';

export const missingTsconfigBaseRule: DoctorRule = {
    id: 'workspace.missing-tsconfig-base',
    async run(context) {
        const exists = await nodeFsGateway.exists(`${context.workspaceRoot}/tsconfig.base.json`);
        if (exists) {
            return [];
        }

        const plan: PatchPlan = {
            id: 'workspace.ensure-tsconfig-base',
            title: 'Ensure tsconfig.base.json',
            provenance: { source: 'loop:doctor' },
            operations: [
                {
                    kind: 'ensureFile',
                    opId: 'workspace.tsconfig-base',
                    path: 'tsconfig.base.json',
                    overwrite: false,
                    content: JSON.stringify(
                        {
                            compilerOptions: {
                                target: 'ES2022',
                                module: 'NodeNext',
                                moduleResolution: 'NodeNext',
                                strict: true,
                                skipLibCheck: true,
                            },
                        },
                        null,
                        2,
                    ) + '\n',
                },
            ],
            preconditions: [],
            postconditions: [],
        };

        return [
            {
                diagnostic: {
                    id: 'workspace.missing-tsconfig-base',
                    severity: 'warning',
                    message: 'Missing tsconfig.base.json file.',
                    evidence: { path: 'tsconfig.base.json' },
                    suggestedFixIds: ['fix.workspace.tsconfig-base'],
                },
                fix: {
                    id: 'fix.workspace.tsconfig-base',
                    title: 'Create tsconfig.base.json',
                    safe: true,
                    diagnosticIds: ['workspace.missing-tsconfig-base'],
                    plan,
                },
            },
        ];
    },
};
