import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import process from 'node:process';

const root = path.resolve(fileURLToPath(new URL('../..', import.meta.url)));
const registryDataDir = path.join(root, '.local', 'forge', 'registry');

const services = [
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

function printPlan() {
    console.log('Forge local stack plan');
    for (const service of services) {
        console.log(`- ${service.label}`);
        console.log(`  cwd: ${service.cwd}`);
        console.log(`  cmd: ${service.command.join(' ')}`);
        console.log(`  note: ${service.note}`);
        if (service.optional) {
            console.log('  optional: true');
        }
        if (service.enabled === false) {
            console.log('  enabled: false');
        }
    }
}

function runStack() {
    const children = [];
    for (const service of services) {
        if (service.enabled === false) {
            continue;
        }
        const child = spawn(service.command[0], service.command.slice(1), {
            cwd: service.cwd,
            env: process.env,
            stdio: 'inherit',
            shell: process.platform === 'win32',
        });
        children.push(child);
    }

    const stopAll = () => {
        for (const child of children) {
            if (!child.killed) {
                child.kill();
            }
        }
    };

    process.on('SIGINT', stopAll);
    process.on('SIGTERM', stopAll);
}

const mode = process.argv[2] ?? 'plan';

if (mode === 'plan') {
    printPlan();
} else if (mode === 'up') {
    printPlan();
    runStack();
} else {
    console.error(`Unknown mode: ${mode}`);
    process.exitCode = 1;
}
