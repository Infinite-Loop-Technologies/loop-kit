import type { DoctorReport } from '../types.js';
import type { DoctorRule } from './types.js';
import { missingLoopConfigRule } from './rules/missingLoopConfig.js';
import { missingPnpmWorkspaceRule } from './rules/missingPnpmWorkspace.js';
import { missingTsconfigBaseRule } from './rules/missingTsconfigBase.js';

const DEFAULT_RULES: DoctorRule[] = [
    missingLoopConfigRule,
    missingPnpmWorkspaceRule,
    missingTsconfigBaseRule,
];

export async function runDoctor(
    workspaceRoot: string,
    rules: DoctorRule[] = DEFAULT_RULES,
): Promise<DoctorReport> {
    const diagnostics: DoctorReport['diagnostics'] = [];
    const fixPlans: DoctorReport['fixPlans'] = [];

    for (const rule of rules) {
        const findings = await rule.run({ workspaceRoot });
        for (const finding of findings) {
            diagnostics.push(finding.diagnostic);
            if (finding.fix) {
                fixPlans.push(finding.fix);
            }
        }
    }

    return {
        diagnostics,
        fixPlans,
    };
}
