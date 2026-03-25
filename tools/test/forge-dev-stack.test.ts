import { describe, expect, test } from 'bun:test';

import { createForgeDevServices, formatForgeDevPlan } from '../src/forge-dev-stack';

describe('forge dev stack', () => {
    test('creates the expected core services', () => {
        const services = createForgeDevServices('C:/repo');

        expect(services.map((service) => service.id)).toEqual([
            'registry',
            'forge-app',
            'vercel-dev',
        ]);
    });

    test('formats a readable plan', () => {
        const output = formatForgeDevPlan(createForgeDevServices('C:/repo'));

        expect(output).toContain('Forge local stack plan');
        expect(output).toContain('Persistent OCI registry');
    });
});
