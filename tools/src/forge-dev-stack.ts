import path from 'node:path';

export type DevService = {
    id: string;
    label: string;
    cwd: string;
    command: string[];
    note: string;
    optional?: boolean;
    enabled?: boolean;
};

export function createForgeDevServices(root: string): DevService[] {
    const registryDataDir = path.join(root, '.local', 'forge', 'registry');

    return [
        {
            id: 'registry',
            label: 'Persistent OCI registry',
            cwd: root,
            command: [
                'docker',
                'run',
                '--rm',
                '--name',
                'forge-dev-registry',
                '-p',
                '5001:5000',
                '-v',
                `${registryDataDir}:/var/lib/registry`,
                'registry:3',
            ],
            note: 'Persistent local CNCF Distribution registry.',
        },
        {
            id: 'forge-app',
            label: 'Forge app',
            cwd: root,
            command: ['pnpm', '--filter', '@loop-kit/forge', 'dev'],
            note: 'Next.js Forge prototype shell.',
        },
        {
            id: 'vercel-dev',
            label: 'Vercel local dev',
            cwd: path.join(root, 'apps', 'forge'),
            command: ['pnpm', 'exec', 'vercel', 'dev'],
            note: 'Optional local Vercel workflow/dev surface. Install the Vercel CLI first.',
            optional: true,
            enabled: process.env.FORGE_ENABLE_VERCEL_DEV === '1',
        },
    ];
}

export function formatForgeDevPlan(services: DevService[]): string {
    return [
        'Forge local stack plan',
        ...services.flatMap((service) => [
            `- ${service.label}`,
            `  cwd: ${service.cwd}`,
            `  cmd: ${service.command.join(' ')}`,
            `  note: ${service.note}`,
            ...(service.optional ? ['  optional: true'] : []),
            ...(service.enabled === false ? ['  enabled: false'] : []),
        ]),
    ].join('\n');
}

async function run(): Promise<void> {
    const root = path.resolve(import.meta.dir, '..', '..');
    const services = createForgeDevServices(root);
    const mode = process.argv[2] ?? 'plan';

    if (mode === 'plan') {
        console.log(formatForgeDevPlan(services));
        return;
    }

    if (mode !== 'up') {
        throw new Error(`Unknown mode: ${mode}`);
    }

    console.log(formatForgeDevPlan(services));

    const children = services
        .filter((service) => service.enabled !== false)
        .map((service) =>
            Bun.spawn(service.command, {
                cwd: service.cwd,
                env: process.env,
                stdin: 'inherit',
                stdout: 'inherit',
                stderr: 'inherit',
            }),
        );

    const stopAll = () => {
        for (const child of children) {
            child.kill();
        }
    };

    process.on('SIGINT', stopAll);
    process.on('SIGTERM', stopAll);

    await Promise.all(children.map((child) => child.exited));
}

if (import.meta.main) {
    await run();
}
