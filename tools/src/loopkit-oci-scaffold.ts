export type LoopkitPackageBlueprint = {
    name: string;
    scope: string;
    description: string;
    files: string[];
};

export function createLoopkitPackageBlueprints(): LoopkitPackageBlueprint[] {
    return [
        {
            name: '@loop-kit/loopkit-oci',
            scope: 'packages/loopkit-oci',
            description: 'OCI reference and registry policy primitives for loop-kit.',
            files: ['package.json', 'tsconfig.json', 'src/index.ts', 'test/oci.test.ts'],
        },
        {
            name: '@loop-kit/loopkit-capabilities',
            scope: 'packages/loopkit-capabilities',
            description: 'Capability grant evaluation primitives for Forge and loop-kit.',
            files: ['package.json', 'tsconfig.json', 'src/index.ts', 'test/capabilities.test.ts'],
        },
    ];
}

if (import.meta.main) {
    console.log(JSON.stringify(createLoopkitPackageBlueprints(), null, 2));
}
