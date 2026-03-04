#!/usr/bin/env node

import process from 'node:process';
import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';

const PUBLISH_ORDER = [
    {
        moonProject: 'graphite-core',
        packageName: '@loop-kit/graphite-core',
        tasks: ['typecheck', 'build', 'test'],
    },
    {
        moonProject: 'graphite-react',
        packageName: '@loop-kit/graphite-react',
        tasks: ['typecheck', 'build'],
    },
    {
        moonProject: 'graphite-systems',
        packageName: '@loop-kit/graphite-systems',
        tasks: ['typecheck', 'build'],
    },
    {
        moonProject: 'dock',
        packageName: '@loop-kit/dock',
        tasks: ['typecheck', 'build', 'test'],
    },
    {
        moonProject: 'graphite',
        packageName: '@loop-kit/graphite',
        tasks: ['typecheck', 'build'],
    },
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
        moonProject: 'loop-cli',
        packageName: '@loop-kit/loop-cli',
        tasks: ['typecheck', 'build', 'test'],
    },
];

function parseArgs(argv) {
    let dryRun = false;
    let skipChecks = false;
    let tag;

    for (let i = 0; i < argv.length; i += 1) {
        const arg = argv[i];
        if (arg === '--') {
            continue;
        } else if (arg === '--dry-run') {
            dryRun = true;
        } else if (arg === '--skip-checks') {
            skipChecks = true;
        } else if (arg === '--tag') {
            const next = argv[i + 1];
            if (!next) {
                throw new Error('--tag requires a value');
            }
            tag = next;
            i += 1;
        } else if (arg === '--help' || arg === '-h') {
            console.log([
                'Usage: node tools/release/publish-all.mjs [options]',
                '',
                'Options:',
                '  --dry-run      Pack only, do not publish',
                '  --skip-checks  Skip loop ci gate',
                '  --tag <tag>    Publish dist-tag (for example next)',
            ].join('\n'));
            process.exit(0);
        } else {
            throw new Error(`Unknown argument: ${arg}`);
        }
    }

    return {
        dryRun,
        skipChecks,
        tag,
    };
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

function setupNpmAuthUserConfig() {
    const token = process.env.NODE_AUTH_TOKEN ?? process.env.NPM_TOKEN;
    if (!token) {
        return null;
    }

    const userConfigPath = path.join(
        os.tmpdir(),
        `loop-publish-npmrc-${Date.now()}-${Math.random().toString(16).slice(2)}.npmrc`,
    );

    fs.writeFileSync(
        userConfigPath,
        `//registry.npmjs.org/:_authToken=${token}\nalways-auth=true\n`,
        'utf8',
    );

    process.env.NPM_CONFIG_USERCONFIG = userConfigPath;
    process.env.npm_config_userconfig = userConfigPath;

    return userConfigPath;
}

function runChecks() {
    run('pnpm', ['run', 'loop', '--', 'ci', '--cwd', '.']);
}

function publishOne(item, options) {
    const args = [
        '--filter',
        item.packageName,
        'publish',
        '--access',
        'public',
        '--no-git-checks',
    ];

    if (options.dryRun) {
        args.push('--dry-run');
    }

    if (options.tag) {
        args.push('--tag', options.tag);
    }

    run('pnpm', args);
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
