#!/usr/bin/env node

import process from 'node:process';
import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';

const PUBLISH_ORDER = [
    {
        moonProject: 'loop-contracts',
        packageName: '@loop-kit/loop-contracts',
        tasks: ['typecheck', 'build', 'test'],
    },
    {
        moonProject: 'loop-kernel',
        packageName: '@loop-kit/loop-kernel',
        tasks: ['typecheck', 'build', 'test'],
    },
    {
        moonProject: 'loopd',
        packageName: '@loop-kit/loopd',
        tasks: ['typecheck', 'build', 'test'],
    },
    {
        moonProject: 'loop-mcp',
        packageName: '@loop-kit/loop-mcp',
        tasks: ['typecheck', 'build', 'test'],
    },
    {
        moonProject: 'loop-ai',
        packageName: '@loop-kit/loop-ai',
        tasks: ['typecheck', 'build', 'test'],
    },
    {
        moonProject: 'loop-cli',
        packageName: '@loop-kit/loop-cli',
        tasks: ['typecheck', 'build', 'test'],
    },
];

function parseArgs(argv) {
    let dryRun = false;
    let skipChecks = false;
    let tag = 'latest';

    for (let i = 0; i < argv.length; i += 1) {
        const arg = argv[i];
        if (arg === '--') {
            continue;
        }
        if (arg === '--dry-run') {
            dryRun = true;
            continue;
        }
        if (arg === '--skip-checks') {
            skipChecks = true;
            continue;
        }
        if (arg === '--tag') {
            const next = argv[i + 1];
            if (!next) {
                throw new Error('--tag requires a value');
            }
            tag = next;
            i += 1;
            continue;
        }
        if (arg === '--help' || arg === '-h') {
            console.log(
                [
                    'Usage: node tools/release/publish-loop-cli-stack.mjs [options]',
                    '',
                    'Options:',
                    '  --dry-run      Pack only, do not publish',
                    '  --skip-checks  Skip Moon verification',
                    '  --tag <tag>    Publish dist-tag (default: latest)',
                ].join('\n'),
            );
            process.exit(0);
        }

        throw new Error(`Unknown argument: ${arg}`);
    }

    return { dryRun, skipChecks, tag };
}

function run(command, args) {
    const result = spawnSync(command, args, {
        stdio: 'inherit',
        shell: process.platform === 'win32',
        env: process.env,
    });

    if (result.status !== 0) {
        process.exit(result.status ?? 1);
    }
}

function runPnpm(args) {
    run('proto', ['run', 'pnpm', '--', ...args]);
}

function runMoonTask(target) {
    run('proto', ['run', 'moon', '--', 'run', target]);
}

function setupNpmAuthUserConfig() {
    const token = process.env.NODE_AUTH_TOKEN ?? process.env.NPM_TOKEN;
    if (!token) {
        return null;
    }

    const userConfigPath = path.join(
        os.tmpdir(),
        `loop-publish-cli-${Date.now()}-${Math.random().toString(16).slice(2)}.npmrc`,
    );

    fs.writeFileSync(userConfigPath, `//registry.npmjs.org/:_authToken=${token}\nalways-auth=true\n`, 'utf8');
    process.env.NPM_CONFIG_USERCONFIG = userConfigPath;
    process.env.npm_config_userconfig = userConfigPath;

    return userConfigPath;
}

function runChecks() {
    for (const item of PUBLISH_ORDER) {
        for (const task of item.tasks) {
            runMoonTask(`${item.moonProject}:${task}`);
        }
    }
}

function publishOne(item, options) {
    const args = ['--filter', item.packageName, 'publish', '--access', 'public', '--no-git-checks'];
    if (options.dryRun) {
        args.push('--dry-run');
    }
    if (options.tag) {
        args.push('--tag', options.tag);
    }

    runPnpm(args);
}

function main() {
    const options = parseArgs(process.argv.slice(2));
    const tempUserConfigPath = setupNpmAuthUserConfig();

    try {
        if (!options.skipChecks) {
            runChecks();
        }

        for (const item of PUBLISH_ORDER) {
            console.log(`\n>>> Publishing ${item.packageName}`);
            publishOne(item, options);
        }
    } finally {
        if (tempUserConfigPath) {
            fs.rmSync(tempUserConfigPath, { force: true });
            delete process.env.NPM_CONFIG_USERCONFIG;
            delete process.env.npm_config_userconfig;
        }
    }
}

main();
