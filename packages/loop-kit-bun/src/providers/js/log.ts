import type {
    Provider,
    CapabilityRequest,
    CapabilityResponse,
} from '../../runtime/provider';
import { ProviderTier } from '../../runtime/tiers';
import { capId } from '../../runtime/ids';

export const CAP_LOG = capId('loop', 'core', '0.1.0', 'log');

export class JsLogProvider implements Provider {
    readonly tier = ProviderTier.JS;
    readonly capabilities = [CAP_LOG] as const;

    constructor(public readonly id: string = 'js-log') {}

    async init() {}

    async handle(req: CapabilityRequest): Promise<CapabilityResponse> {
        if (req.capability !== CAP_LOG)
            return { ok: false, error: 'Unsupported capability' };

        const p = req.payload as any;
        const level = (p?.level ?? 'info') as string;
        const msg = String(p?.message ?? '');

        const fn =
            level === 'error'
                ? console.error
                : level === 'warn'
                ? console.warn
                : console.log;

        fn(`[loop.log] ${msg}`);
        return { ok: true, value: null };
    }

    async dispose() {}
}
