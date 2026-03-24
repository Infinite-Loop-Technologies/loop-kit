export type CapabilityGrantStatus = 'pending' | 'approved' | 'denied';
export type CapabilityKind = 'container-run' | 'wasm-run' | 'executable-run' | 'polar-project-create';

export type CapabilityGrant = {
    capability: CapabilityKind;
    status: CapabilityGrantStatus;
    allowedRegistries: string[];
    maxUsdCents?: number;
};

export type CapabilityAttempt = {
    capability: CapabilityKind;
    estimatedUsdCents?: number;
    registry?: string;
};

export type CapabilityDecision = {
    allowed: boolean;
    reasons: string[];
};

export function createCapabilityGrant(input: CapabilityGrant): CapabilityGrant {
    return { ...input };
}

export function evaluateCapabilityAttempt(
    grant: CapabilityGrant,
    attempt: CapabilityAttempt,
): CapabilityDecision {
    const reasons: string[] = [];

    if (grant.capability !== attempt.capability) {
        reasons.push('capability-mismatch');
    }

    if (grant.status !== 'approved') {
        reasons.push(`grant-${grant.status}`);
    }

    if (attempt.registry && !grant.allowedRegistries.includes(attempt.registry)) {
        reasons.push('registry-not-allowed');
    }

    if (
        typeof grant.maxUsdCents === 'number' &&
        typeof attempt.estimatedUsdCents === 'number' &&
        attempt.estimatedUsdCents > grant.maxUsdCents
    ) {
        reasons.push('budget-exceeded');
    }

    return {
        allowed: reasons.length === 0,
        reasons,
    };
}
