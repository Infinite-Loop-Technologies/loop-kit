import type { DispatchIntentOptions } from '@loop-kit/graphite';

import type { DockBlockState } from './store';

export type DockIntentEnvelope = {
    intent: string;
    payload?: unknown;
    options?: DispatchIntentOptions<DockBlockState>;
};
