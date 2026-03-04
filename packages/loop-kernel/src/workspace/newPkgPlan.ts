import { type PatchPlan } from '@loop-kit/loop-contracts';
import { buildTemplatePlan } from './templatePlan.js';

export async function newPkgPlan(
    workspaceRoot: string,
    name: string,
    templateRef?: string,
): Promise<PatchPlan> {
    return buildTemplatePlan(workspaceRoot, {
        templateName: 'new-pkg',
        templateRef,
        destinationRoot: `packages/${name}`,
        replacements: {
            NAME: name.replace(/[^a-zA-Z0-9]/g, '_'),
            TITLE: name,
        },
        planId: `workspace.new-pkg.${name}`,
        title: `Create package ${name}`,
    });
}
