import path from 'node:path';
import fg from 'fast-glob';
import { execa } from 'execa';
import {
    ok,
    type PatchPlan,
    type ToolchainDetectRequest,
    type ToolchainDetectResponse,
    type ToolchainDiagnoseRequest,
    type ToolchainDiagnoseResponse,
    type ToolchainPlanFixRequest,
    type ToolchainPlanFixResponse,
    type ToolchainRunRequest,
    type ToolchainRunResponse,
    type ToolchainTasksRequest,
    type ToolchainTasksResponse,
    type Result,
} from '@loop-kit/loop-contracts';
import { nodeFsGateway } from '../../io/fsGateway.js';
import { parseJsonWithComments } from '../../utils/json.js';
import type { ToolchainAdapter } from '../../providers/capabilities/toolchain.js';

type TsConfig = {
    extends?: string;
};

function expectedExtendsPath(packageTsconfigPath: string, workspaceRoot: string): string {
    const relative = path.relative(path.dirname(packageTsconfigPath), path.join(workspaceRoot, 'tsconfig.base.json'));
    return relative.startsWith('.') ? relative : `./${relative}`;
}

export class TypeScriptToolchainAdapter implements ToolchainAdapter {
    readonly id = 'typescript';
    readonly kind = 'typescript';

    async detect(
        request: ToolchainDetectRequest,
    ): Promise<Result<ToolchainDetectResponse>> {
        const diagnostics: ToolchainDetectResponse['diagnostics'] = [];
        const workspaceRoot = request.workspaceRoot;

        const baseConfigPath = path.join(workspaceRoot, 'tsconfig.base.json');
        const baseExists = await nodeFsGateway.exists(baseConfigPath);
        if (!baseExists) {
            diagnostics.push({
                id: 'toolchain.ts.base_missing',
                severity: 'warning',
                message: 'Missing tsconfig.base.json at workspace root.',
                evidence: { path: 'tsconfig.base.json' },
            });
        }

        const tsconfigs = await fg(['apps/*/tsconfig.json', 'packages/*/tsconfig.json'], {
            cwd: workspaceRoot,
            onlyFiles: true,
        });

        for (const relativePath of tsconfigs) {
            const absolutePath = path.join(workspaceRoot, relativePath);
            const content = await nodeFsGateway.readText(absolutePath);
            const parsed = parseJsonWithComments<TsConfig>(content);
            const expected = expectedExtendsPath(absolutePath, workspaceRoot).replace(/\\/g, '/');
            const actual = parsed.extends?.replace(/\\/g, '/');
            if (!actual || actual !== expected) {
                diagnostics.push({
                    id: 'toolchain.ts.extends_mismatch',
                    severity: 'warning',
                    message: `${relativePath} should extend ${expected}.`,
                    evidence: {
                        path: relativePath,
                        expected,
                        actual,
                    },
                });
            }
        }

        const status = diagnostics.some((item) => item.severity === 'error')
            ? 'error'
            : diagnostics.length > 0
                ? 'warning'
                : 'ok';

        return ok({
            id: this.id,
            status,
            diagnostics,
            details: {
                tsconfigCount: tsconfigs.length,
            },
        });
    }

    async diagnose(
        request: ToolchainDiagnoseRequest,
    ): Promise<Result<ToolchainDiagnoseResponse>> {
        const detected = await this.detect(request);
        if (!detected.ok) {
            return detected;
        }

        return ok({
            id: this.id,
            diagnostics: detected.value.diagnostics,
            details: detected.value.details,
        });
    }

    async tasks(
        request: ToolchainTasksRequest,
    ): Promise<Result<ToolchainTasksResponse>> {
        const baseTasks: ToolchainTasksResponse['tasks'] = {
            build: {
                command: 'pnpm',
                args: ['-r', '--if-present', 'run', 'build'],
                cwd: '.',
                deps: [],
                env: {},
                inputs: [],
                outputs: [],
            },
            typecheck: {
                command: 'pnpm',
                args: ['-r', '--if-present', 'run', 'typecheck'],
                cwd: '.',
                deps: [],
                env: {},
                inputs: [],
                outputs: [],
            },
            test: {
                command: 'pnpm',
                args: ['-r', '--if-present', 'run', 'test'],
                cwd: '.',
                deps: [],
                env: {},
                inputs: [],
                outputs: [],
            },
        };

        return ok({
            id: this.id,
            tasks: baseTasks,
        });
    }

    async planFix(
        request: ToolchainPlanFixRequest,
    ): Promise<Result<ToolchainPlanFixResponse>> {
        const plans: PatchPlan[] = [];
        const workspaceRoot = request.workspaceRoot;

        const baseConfigPath = path.join(workspaceRoot, 'tsconfig.base.json');
        if (!(await nodeFsGateway.exists(baseConfigPath))) {
            plans.push({
                id: 'toolchain.ts.ensure-base',
                title: 'Ensure tsconfig.base.json',
                provenance: { source: 'loop:toolchain.sync' },
                operations: [
                    {
                        kind: 'ensureFile',
                        opId: 'toolchain.ts.base.file',
                        path: 'tsconfig.base.json',
                        overwrite: false,
                        content: JSON.stringify(
                            {
                                compilerOptions: {
                                    target: 'ES2022',
                                    module: 'NodeNext',
                                    moduleResolution: 'NodeNext',
                                    strict: true,
                                    skipLibCheck: true,
                                },
                            },
                            null,
                            2,
                        ) + '\n',
                    },
                ],
                preconditions: [],
                postconditions: [],
            });
        }

        const tsconfigs = await fg(['apps/*/tsconfig.json', 'packages/*/tsconfig.json'], {
            cwd: workspaceRoot,
            onlyFiles: true,
        });

        const syncOps = [] as PatchPlan['operations'];
        for (const relativePath of tsconfigs) {
            const absolutePath = path.join(workspaceRoot, relativePath);
            const expected = expectedExtendsPath(absolutePath, workspaceRoot).replace(/\\/g, '/');
            syncOps.push({
                kind: 'ensureTsconfigExtends',
                opId: `toolchain.ts.extends.${relativePath}`,
                tsconfigPath: relativePath,
                extendsPath: expected,
            });
        }

        if (syncOps.length > 0) {
            plans.push({
                id: 'toolchain.ts.sync-tsconfig-extends',
                title: 'Sync tsconfig extends for workspace packages',
                provenance: { source: 'loop:toolchain.sync' },
                operations: syncOps,
                preconditions: [],
                postconditions: [],
            });
        }

        return ok({ plans });
    }

    async run(
        request: ToolchainRunRequest,
    ): Promise<Result<ToolchainRunResponse>> {
        const result = await execa('pnpm', ['run', request.task], {
            cwd: request.workspaceRoot,
            reject: false,
        });

        return ok({
            success: result.exitCode === 0,
            code: result.exitCode ?? 1,
            stdout: result.stdout,
            stderr: result.stderr,
        });
    }
}
