import { type PatchPlan } from '@loop-kit/loop-contracts';
import { buildTemplatePlan } from './templatePlan.js';

export async function newAppPlan(
    workspaceRoot: string,
    name: string,
    templateRef?: string,
): Promise<PatchPlan> {
    return buildTemplatePlan(workspaceRoot, {
        templateName: 'new-app',
        templateRef,
        destinationRoot: `apps/${name}`,
        replacements: {
            NAME: name,
            TITLE: name,
        },
        planId: `workspace.new-app.${name}`,
        title: `Create app ${name}`,
    });
}
