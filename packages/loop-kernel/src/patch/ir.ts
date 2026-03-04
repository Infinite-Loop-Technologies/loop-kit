import type { PatchOperation, PatchPlan } from '@loop-kit/loop-contracts';

export function cloneOperation<T extends PatchOperation>(operation: T): T {
    return JSON.parse(JSON.stringify(operation)) as T;
}

export function clonePlan(plan: PatchPlan): PatchPlan {
    return {
        ...plan,
        operations: plan.operations.map((operation) => cloneOperation(operation)),
        preconditions: [...plan.preconditions],
        postconditions: [...plan.postconditions],
    };
}

export function withOperationPrefix(plan: PatchPlan, prefix: string): PatchPlan {
    return {
        ...plan,
        id: `${prefix}.${plan.id}`,
        operations: plan.operations.map((operation) => ({
            ...operation,
            opId: `${prefix}.${operation.opId}`,
        })),
    };
}

export function appendPlans(id: string, title: string, plans: PatchPlan[]): PatchPlan {
    return {
        id,
        title,
        provenance: {
            source: plans.map((plan) => plan.provenance.source).join(','),
        },
        operations: plans.flatMap((plan) => plan.operations),
        preconditions: plans.flatMap((plan) => plan.preconditions),
        postconditions: plans.flatMap((plan) => plan.postconditions),
    };
}
