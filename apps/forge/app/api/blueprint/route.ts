import { NextResponse } from 'next/server';

import {
    forgeCapabilityPolicies,
    forgeControlPlanes,
    forgeLocalServices,
} from '../../../src/lib/forge-stack';

export function GET() {
    return NextResponse.json({
        controlPlanes: forgeControlPlanes,
        localServices: forgeLocalServices,
        policies: forgeCapabilityPolicies,
    });
}
