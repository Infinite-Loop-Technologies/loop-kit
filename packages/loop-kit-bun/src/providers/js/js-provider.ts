import type { Provider } from '../../runtime/provider';
import { ProviderTier } from '../../runtime/tiers';

export class JsProvider implements Provider {
    readonly tier = ProviderTier.JS;

    constructor(
        public readonly id: string,
        private handler: (req: any) => any
    ) {}

    async init() {}
    async handle(req: any) {
        return { ok: true, value: this.handler(req) };
    }
    async dispose() {}
}
