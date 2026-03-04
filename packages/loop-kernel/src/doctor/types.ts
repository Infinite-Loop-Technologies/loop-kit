import { type PatchPlan } from '@loop-kit/loop-contracts';

export type DoctorRuleContext = {
    workspaceRoot: string;
};

export type RuleFinding = {
    diagnostic: {
        id: string;
        severity: 'info' | 'warning' | 'error';
        message: string;
        evidence?: Record<string, unknown>;
        suggestedFixIds?: string[];
    };
    fix?: {
        id: string;
        title: string;
        safe: boolean;
        diagnosticIds: string[];
        plan: PatchPlan;
    };
};

export type DoctorRule = {
    id: string;
    run(context: DoctorRuleContext): Promise<RuleFinding[]>;
};
