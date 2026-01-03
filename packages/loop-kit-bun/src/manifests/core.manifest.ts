import { ProviderTier } from '../runtime/tiers';
import { capId } from '../runtime/ids';
import type { ProviderManifest } from '../runtime/manifest';

export const CAP_LOG = capId('loop', 'core', '0.1.0', 'log');
export const CAP_CLOCK = capId('loop', 'core', '0.1.0', 'clock');
export const CAP_EVENTS = capId('loop', 'core', '0.1.0', 'events');
export const CAP_ECHO_BYTES = capId('loop', 'debug', '0.1.0', 'echo-bytes');

export const manifests: ProviderManifest[] = [
    {
        id: 'js-log',
        tier: ProviderTier.JS,
        implements: [CAP_LOG],
        scope: 'singleton',
        entry: './src/providers/js/log.ts',
    },
    {
        id: 'js-clock',
        tier: ProviderTier.JS,
        implements: [CAP_CLOCK],
        scope: 'singleton',
        entry: './src/providers/js/clock.ts',
    },
    {
        id: 'js-events',
        tier: ProviderTier.JS,
        implements: [CAP_EVENTS],
        scope: 'singleton',
        entry: './src/providers/js/events.ts',
    },
    {
        id: 'native-log',
        tier: ProviderTier.Native,
        implements: [CAP_LOG],
        scope: 'singleton',
        entry: './src/providers/native/log.c',
    },
    {
        id: 'native-echo-bytes',
        tier: ProviderTier.Native,
        implements: [CAP_ECHO_BYTES],
        scope: 'singleton',
        entry: './src/providers/native/echo.c',
    },
];
