import { createKernel } from '@loop-kit/loop-kernel';

export type AiDoctorPlan = {
    workspaceRoot: string;
    diagnostics: Array<{
        id: string;
        severity: string;
        message: string;
    }>;
    safeFixIds: string[];
    applied: boolean;
    executionCount: number;
};

export async function runAiDoctor(
    workspaceRoot: string,
    options: {
        apply?: boolean;
    } = {},
): Promise<AiDoctorPlan> {
    const kernel = createKernel({ workspaceRoot });
    const report = await kernel.doctor();
    if (!report.ok) {
        throw new Error(report.error.message);
    }

    const safeFixIds = report.value.fixPlans
        .filter((fix) => fix.safe)
        .map((fix) => fix.id);

    if (!options.apply) {
        return {
            workspaceRoot,
            diagnostics: report.value.diagnostics.map((diagnostic) => ({
                id: diagnostic.id,
                severity: diagnostic.severity,
                message: diagnostic.message,
            })),
            safeFixIds,
            applied: false,
            executionCount: 0,
        };
    }

    const applied = await kernel.fix({
        allSafe: true,
        dryRun: false,
    });
    if (!applied.ok) {
        throw new Error(applied.error.message);
    }

    return {
        workspaceRoot,
        diagnostics: report.value.diagnostics.map((diagnostic) => ({
            id: diagnostic.id,
            severity: diagnostic.severity,
            message: diagnostic.message,
        })),
        safeFixIds,
        applied: true,
        executionCount: applied.value.executions.length,
    };
}
