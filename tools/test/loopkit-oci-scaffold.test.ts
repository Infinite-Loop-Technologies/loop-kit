import { describe, expect, test } from 'bun:test';

import { createLoopkitPackageBlueprints } from '../src/loopkit-oci-scaffold';

describe('loop-kit package scaffold blueprints', () => {
    test('includes the new OCI and capability packages', () => {
        const blueprints = createLoopkitPackageBlueprints();

        expect(blueprints.map((blueprint) => blueprint.name)).toEqual([
            '@loop-kit/loopkit-oci',
            '@loop-kit/loopkit-capabilities',
        ]);
    });
});
