import path from 'node:path';
import { initWorkspacePlan } from '../../workspace/initWorkspacePlan.js';
import type { DoctorRule } from '../types.js';
import { nodeFsGateway } from '../../io/fsGateway.js';

export const missingLoopConfigRule: DoctorRule = {
    id: 'workspace.missing-config',
    async run(context) {
        const configPath = path.join(context.workspaceRoot, 'loop.json');
        if (await nodeFsGateway.exists(configPath)) {
            return [];
        }

        const plan = initWorkspacePlan();
        return [
            {
                diagnostic: {
                    id: 'workspace.missing-config',
                    severity: 'error',
                    message: 'Missing loop.json workspace configuration.',
                    evidence: { path: 'loop.json' },
                    suggestedFixIds: ['fix.workspace.init'],
                },
                fix: {
                    id: 'fix.workspace.init',
                    title: 'Initialize workspace with loop.json and base folders',
                    safe: true,
                    diagnosticIds: ['workspace.missing-config'],
                    plan,
                },
            },
        ];
    },
};
