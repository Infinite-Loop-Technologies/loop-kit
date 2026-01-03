import type {
    Provider,
    CapabilityRequest,
    CapabilityResponse,
} from '../../runtime/provider';
import { ProviderTier } from '../../runtime/tiers';
import { capId } from '../../runtime/ids';

export const CAP_CLOCK = capId('loop', 'core', '0.1.0', 'clock');

export class JsClockProvider implements Provider {
    readonly tier = ProviderTier.JS;
    readonly capabilities = [CAP_CLOCK] as const;

    constructor(public readonly id: string = 'js-clock') {}

    async init() {}

    async handle(req: CapabilityRequest): Promise<CapabilityResponse> {
        if (req.capability !== CAP_CLOCK)
            return { ok: false, error: 'Unsupported capability' };

        const unixMs = Date.now();
        const monotonicMs =
            typeof performance !== 'undefined' ? performance.now() : 0;

        return { ok: true, value: { unixMs, monotonicMs } };
    }

    async dispose() {}
}
