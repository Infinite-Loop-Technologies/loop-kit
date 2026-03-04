import path from 'node:path';
import fg from 'fast-glob';
import {
    err,
    ok,
    type ComponentManifest,
    type LaneConfig,
    type LoopWorkspaceConfig,
    type PipelineRunSummary,
    type PatchPlan,
    type TaskEvent,
    type Result,
} from '@loop-kit/loop-contracts';
import { nodeFsGateway, type FsGateway } from './io/fsGateway.js';
import { ProviderHost } from './providers/host.js';
import { LocalLaneProvider } from './lanes/builtin/localLane.js';
import { FileLaneProvider } from './lanes/builtin/fileLane.js';
import { GitLaneProviderStub } from './lanes/builtin/gitLane.stub.js';
import { HttpLaneProviderStub } from './lanes/builtin/httpLane.stub.js';
import { executePatchPlan } from './patch/executor.js';
import { runDoctor } from './doctor/index.js';
import { buildWorkspaceGraph } from './graph/workspaceGraph.js';
import { TypeScriptToolchainAdapter } from './toolchain/adapters/typescript.js';
import { ToolchainRegistry } from './toolchain/registry.js';
import type { LaneProvider } from './providers/capabilities/lane.js';
import type {
    AddComponentResult,
    AdoptResult,
    CiOptions,
    DoctorReport,
    DiffComponentResult,
    ListedComponent,
    KernelOptions,
    LaneStatus,
    LoadedWorkspace,
    PatchExecutionResult,
    RunTaskResult,
    ToolchainStatus,
    UndoResult,
    UpdateComponentResult,
    WorkspaceGraph,
} from './types.js';
import { loadWorkspace } from './workspace/loadWorkspace.js';
import { initWorkspacePlan } from './workspace/initWorkspacePlan.js';
import { newAppPlan } from './workspace/newAppPlan.js';
import { newPkgPlan } from './workspace/newPkgPlan.js';
import { addComponent } from './components/add.js';
import { updateComponent } from './components/update.js';
import { diffComponent } from './components/diff.js';
import { extractComponent } from './components/extract.js';
import { adoptComponent } from './components/adopt.js';
import { listWorkspaceComponents, showWorkspaceComponent } from './components/list.js';
import {
    executeUndoJournal,
    loadUndoJournal,
    persistUndoJournal,
} from './undo/journal.js';
import {
    runPipeline,
    runTask as runConfiguredTask,
} from './tasks/runner.js';

type FixOptions = {
    allSafe?: boolean;
    only?: string[];
    dryRun?: boolean;
};

function defaultWorkspaceConfig(): LoopWorkspaceConfig {
    return {
        schemaVersion: '1',
        workspace: {
            name: 'loop-workspace',
            appsDir: 'apps',
            packagesDir: 'packages',
            assetsDir: 'assets',
            toolsDir: 'tools',
            loopDir: 'loop',
        },
        lanes: {
            local: { kind: 'local', config: {} },
            file: { kind: 'file', config: {} },
        },
        defaults: {
            componentLane: 'local',
            moduleLane: 'local',
            refKindMap: {
                local: 'local',
                loop: 'local',
                file: 'file',
            },
            ciPipeline: 'ci',
        },
        modules: [],
        toolchains: [{ id: 'typescript', kind: 'typescript', config: {} }],
        components: {
            defaultTarget: '.',
            ignoreGlobs: [],
        },
        tasks: {},
        pipelines: {},
        overrides: {
            components: {},
            modules: {},
        },
    };
}

export class LoopKernel {
    readonly workspaceRoot: string;
    readonly fs: FsGateway;
    readonly providerHost: ProviderHost;
    readonly toolchainRegistry: ToolchainRegistry;
    private modulesLoaded = false;

    constructor(options: KernelOptions = {}) {
        this.workspaceRoot = path.resolve(options.workspaceRoot ?? process.cwd());
        this.fs = nodeFsGateway;
        this.providerHost = new ProviderHost();
        this.toolchainRegistry = new ToolchainRegistry();
        this.registerBuiltins();
    }

    private registerBuiltins(): void {
        this.providerHost.registerLaneProvider(new LocalLaneProvider());
        this.providerHost.registerLaneProvider(new FileLaneProvider());
        this.providerHost.registerLaneProvider(new GitLaneProviderStub());
        this.providerHost.registerLaneProvider(new HttpLaneProviderStub());

        this.toolchainRegistry.register(new TypeScriptToolchainAdapter());
    }

    private async getWorkspaceConfig(): Promise<Result<LoadedWorkspace>> {
        const loaded = await loadWorkspace(this.workspaceRoot, this.fs);
        if (!loaded.ok) {
            return loaded;
        }

        if (!this.modulesLoaded) {
            const moduleLoad = await this.providerHost.loadEnabledModules(
                this.workspaceRoot,
                loaded.value.config,
                {
                    authenticateLane: (laneId, provider) => this.authenticateLaneProvider(laneId, provider),
                },
            );
            if (!moduleLoad.ok) {
                return moduleLoad;
            }

            this.modulesLoaded = true;
        }

        return loaded;
    }

    private async readLaneAuthStore(): Promise<{
        schemaVersion: '1';
        lanes: Record<string, { token: string; updatedAt: string }>;
    }> {
        const authPath = path.join(this.workspaceRoot, 'loop', 'auth.json');
        const empty = {
            schemaVersion: '1' as const,
            lanes: {},
        };

        if (!(await this.fs.exists(authPath))) {
            return empty;
        }

        try {
            const raw = await this.fs.readJson<unknown>(authPath);
            if (
                typeof raw !== 'object' ||
                raw === null ||
                !('lanes' in raw) ||
                typeof (raw as { lanes?: unknown }).lanes !== 'object' ||
                (raw as { lanes?: unknown }).lanes === null
            ) {
                return empty;
            }

            return {
                schemaVersion: '1',
                lanes: (raw as { lanes: Record<string, { token: string; updatedAt: string }> }).lanes,
            };
        } catch {
            return empty;
        }
    }

    private async authenticateLaneProvider(
        laneId: string,
        provider: LaneProvider,
    ): Promise<Result<void>> {
        if (!provider.auth) {
            return ok(undefined);
        }

        const authStore = await this.readLaneAuthStore();
        const token = authStore.lanes[laneId]?.token;
        if (!token) {
            return ok(undefined);
        }

        const authResult = await provider.auth(token);
        if (!authResult.ok) {
            return err({
                code: 'lane.auth_failed',
                message: `Lane authentication failed for ${laneId}.`,
                details: authResult.error as Record<string, unknown> | undefined,
            });
        }

        return ok(undefined);
    }

    async init(options: { dir?: string; template?: string } = {}): Promise<Result<PatchExecutionResult>> {
        const root = options.dir ? path.resolve(this.workspaceRoot, options.dir) : this.workspaceRoot;
        let plan = initWorkspacePlan();

        if (options.template && options.template.startsWith('file:')) {
            const templatePathRaw = options.template.slice('file:'.length);
            const templatePath = path.isAbsolute(templatePathRaw)
                ? templatePathRaw
                : path.resolve(this.workspaceRoot, templatePathRaw);

            if (!(await this.fs.exists(templatePath))) {
                return err({
                    code: 'init.template_missing',
                    message: `Template path does not exist: ${templatePath}`,
                });
            }

            const files = await fg('**/*', {
                cwd: templatePath,
                onlyFiles: true,
                dot: true,
            });

            plan = {
                id: 'workspace.init.template',
                title: 'Initialize workspace from template',
                provenance: {
                    source: 'loop:init',
                },
                operations: [],
                preconditions: [],
                postconditions: [],
            };

            for (const file of files) {
                const sourcePath = path.join(templatePath, file);
                const content = await this.fs.readText(sourcePath);
                plan.operations.push({
                    kind: 'ensureFile',
                    opId: `init.template.${file}`,
                    path: file,
                    overwrite: false,
                    content,
                });
            }
        }

        const execution = await executePatchPlan(plan, {
            workspaceRoot: root,
            dryRun: false,
            fs: this.fs,
        });

        return ok(execution);
    }

    async doctor(): Promise<Result<DoctorReport>> {
        const report = await runDoctor(this.workspaceRoot);
        return ok(report);
    }

    async fix(options: FixOptions = {}): Promise<Result<{ report: DoctorReport; executions: PatchExecutionResult[] }>> {
        const report = await runDoctor(this.workspaceRoot);

        let selected = report.fixPlans;
        if (options.only && options.only.length > 0) {
            const allow = new Set(options.only);
            selected = selected.filter((fix) => allow.has(fix.id) || fix.diagnosticIds.some((id) => allow.has(id)));
        } else if (options.allSafe || !options.only) {
            selected = selected.filter((fix) => fix.safe);
        }

        const executions: PatchExecutionResult[] = [];
        for (const fix of selected) {
            const execution = await executePatchPlan(fix.plan, {
                workspaceRoot: this.workspaceRoot,
                dryRun: options.dryRun,
                fs: this.fs,
            });
            executions.push(execution);
        }

        return ok({ report, executions });
    }

    async graph(): Promise<Result<WorkspaceGraph>> {
        const graph = await buildWorkspaceGraph(this.workspaceRoot);
        return ok(graph);
    }

    async newApp(name: string, options: { template?: string; dryRun?: boolean } = {}): Promise<Result<{ plan: PatchPlan; execution: PatchExecutionResult }>> {
        const plan = await newAppPlan(this.workspaceRoot, name, options.template);
        const execution = await executePatchPlan(plan, {
            workspaceRoot: this.workspaceRoot,
            dryRun: options.dryRun,
            fs: this.fs,
        });

        return ok({ plan, execution });
    }

    async newPkg(name: string, options: { template?: string; dryRun?: boolean } = {}): Promise<Result<{ plan: PatchPlan; execution: PatchExecutionResult }>> {
        const plan = await newPkgPlan(this.workspaceRoot, name, options.template);
        const execution = await executePatchPlan(plan, {
            workspaceRoot: this.workspaceRoot,
            dryRun: options.dryRun,
            fs: this.fs,
        });

        return ok({ plan, execution });
    }

    async add(
        refText: string,
        options: { targetPath?: string; dryRun?: boolean } = {},
    ): Promise<Result<AddComponentResult>> {
        const loaded = await this.getWorkspaceConfig();
        if (!loaded.ok) {
            return loaded;
        }

        const added = await addComponent(this.workspaceRoot, this.providerHost, refText, {
            targetPath: options.targetPath,
            dryRun: options.dryRun,
            fs: this.fs,
            workspaceConfig: loaded.value.config,
            authenticateLane: (laneId, provider) => this.authenticateLaneProvider(laneId, provider),
        });
        if (!added.ok) {
            return added;
        }

        if (added.value.execution.applied && added.value.undoSnapshot) {
            const undoPersisted = await persistUndoJournal(this.workspaceRoot, {
                plan: added.value.plan,
                source: 'loop:add',
                touchedFiles: added.value.undoSnapshot.touchedFiles,
                diffByFile: added.value.execution.diffByFile,
                before: added.value.undoSnapshot.before,
                after: added.value.undoSnapshot.after,
            }, this.fs);
            if (undoPersisted.ok) {
                added.value.undoId = undoPersisted.value.undoId;
            }
        }

        return added;
    }

    async update(
        refText: string,
        options: { targetPath?: string; dryRun?: boolean; force?: boolean } = {},
    ): Promise<Result<UpdateComponentResult>> {
        const loaded = await this.getWorkspaceConfig();
        if (!loaded.ok) {
            return loaded;
        }

        const updated = await updateComponent(this.workspaceRoot, this.providerHost, refText, {
            targetPath: options.targetPath,
            dryRun: options.dryRun,
            force: options.force,
            fs: this.fs,
            workspaceConfig: loaded.value.config,
            authenticateLane: (laneId, provider) => this.authenticateLaneProvider(laneId, provider),
        });
        if (!updated.ok) {
            return updated;
        }

        if (updated.value.execution.applied && updated.value.undoSnapshot) {
            const undoPersisted = await persistUndoJournal(this.workspaceRoot, {
                plan: updated.value.plan,
                source: 'loop:update',
                touchedFiles: updated.value.undoSnapshot.touchedFiles,
                diffByFile: updated.value.execution.diffByFile,
                before: updated.value.undoSnapshot.before,
                after: updated.value.undoSnapshot.after,
            }, this.fs);
            if (undoPersisted.ok) {
                updated.value.undoId = undoPersisted.value.undoId;
            }
        }

        return updated;
    }

    async diff(
        refText: string,
        options: { targetPath?: string } = {},
    ): Promise<Result<DiffComponentResult>> {
        const loaded = await this.getWorkspaceConfig();
        if (!loaded.ok) {
            return loaded;
        }

        return diffComponent(this.workspaceRoot, this.providerHost, refText, {
            targetPath: options.targetPath,
            workspaceConfig: loaded.value.config,
            authenticateLane: (laneId, provider) => this.authenticateLaneProvider(laneId, provider),
        });
    }

    async extract(
        inputPath: string,
        componentId: string,
        options: {
            lane?: string;
            relocate?: string | boolean;
            packageToo?: boolean;
            dryRun?: boolean;
        } = {},
    ) {
        const loaded = await this.getWorkspaceConfig();
        if (!loaded.ok) {
            return loaded;
        }

        const extracted = await extractComponent(this.workspaceRoot, inputPath, componentId, {
            lane: options.lane,
            relocate: options.relocate,
            packageToo: options.packageToo,
            dryRun: options.dryRun,
            fs: this.fs,
        });
        if (!extracted.ok) {
            return extracted;
        }

        if (extracted.value.execution.applied && extracted.value.undoSnapshot) {
            const undoPersisted = await persistUndoJournal(this.workspaceRoot, {
                plan: extracted.value.plan,
                source: 'loop:extract',
                touchedFiles: extracted.value.undoSnapshot.touchedFiles,
                diffByFile: extracted.value.execution.diffByFile,
                before: extracted.value.undoSnapshot.before,
                after: extracted.value.undoSnapshot.after,
            }, this.fs);
            if (undoPersisted.ok) {
                extracted.value.undoId = undoPersisted.value.undoId;
            }
        }

        return extracted;
    }

    async adopt(
        installedRef: string,
        asComponentId: string,
        options: {
            dryRun?: boolean;
        } = {},
    ): Promise<Result<AdoptResult>> {
        const adopted = await adoptComponent(this.workspaceRoot, installedRef, asComponentId, {
            dryRun: options.dryRun,
            fs: this.fs,
        });
        if (!adopted.ok) {
            return adopted;
        }

        if (adopted.value.execution.applied && adopted.value.undoSnapshot) {
            const undoPersisted = await persistUndoJournal(this.workspaceRoot, {
                plan: adopted.value.plan,
                source: 'loop:adopt',
                touchedFiles: adopted.value.undoSnapshot.touchedFiles,
                diffByFile: adopted.value.execution.diffByFile,
                before: adopted.value.undoSnapshot.before,
                after: adopted.value.undoSnapshot.after,
            }, this.fs);
            if (undoPersisted.ok) {
                adopted.value.undoId = undoPersisted.value.undoId;
            }
        }

        return adopted;
    }

    async undo(
        undoId: string,
        options: {
            dryRun?: boolean;
        } = {},
    ): Promise<Result<UndoResult>> {
        const loaded = await loadUndoJournal(this.workspaceRoot, undoId, this.fs);
        if (!loaded.ok) {
            return loaded;
        }

        const execution = await executeUndoJournal(this.workspaceRoot, loaded.value, {
            dryRun: options.dryRun,
            fs: this.fs,
        });

        return ok({
            undoId,
            execution,
            entry: loaded.value,
        });
    }

    async listComponents(options: {
        query?: string;
    } = {}): Promise<Result<ListedComponent[]>> {
        return listWorkspaceComponents(this.workspaceRoot, {
            query: options.query,
            fs: this.fs,
        });
    }

    async showComponent(componentId: string): Promise<Result<{ manifestPath: string; manifest: ComponentManifest }>> {
        const shown = await showWorkspaceComponent(this.workspaceRoot, componentId, {
            fs: this.fs,
        });
        if (!shown.ok) {
            return shown;
        }

        return ok({
            manifestPath: shown.value.manifestPath,
            manifest: shown.value.manifest,
        });
    }

    async runTask(
        taskId: string,
        options: {
            parallel?: boolean;
            onEvent?: (event: TaskEvent) => void;
            env?: Record<string, string>;
        } = {},
    ): Promise<Result<RunTaskResult>> {
        const loaded = await this.getWorkspaceConfig();
        if (!loaded.ok) {
            return loaded;
        }

        const run = await runConfiguredTask(this.workspaceRoot, loaded.value.config, taskId, {
            parallel: options.parallel,
            onEvent: options.onEvent,
            env: options.env,
        });
        if (!run.ok) {
            return run;
        }

        return ok({
            rootTaskId: taskId,
            summary: run.value.summary,
            tasks: run.value.tasks,
        });
    }

    async ci(options: CiOptions = {}): Promise<Result<PipelineRunSummary>> {
        const loaded = await this.getWorkspaceConfig();
        if (!loaded.ok) {
            return loaded;
        }

        const pipelineId = options.pipelineId ?? loaded.value.config.defaults.ciPipeline ?? 'ci';
        return runPipeline(this.workspaceRoot, loaded.value.config, pipelineId, {
            parallel: options.parallel,
            onEvent: options.onEvent,
            env: options.env,
        });
    }

    async laneList(): Promise<Result<LaneStatus[]>> {
        const loaded = await this.getWorkspaceConfig();
        const config = loaded.ok ? loaded.value.config : defaultWorkspaceConfig();

        const statuses: LaneStatus[] = [];
        for (const [laneId, lane] of Object.entries(config.lanes)) {
            const provider = this.providerHost.getLaneProviderByKind(lane.kind);
            if (!provider) {
                statuses.push({
                    laneId,
                    lane,
                    authenticated: false,
                    message: 'No provider registered for lane.',
                });
                continue;
            }

            const authResult = await this.authenticateLaneProvider(laneId, provider);
            if (!authResult.ok) {
                statuses.push({
                    laneId,
                    lane,
                    authenticated: false,
                    message: authResult.error.message,
                });
                continue;
            }

            const authStatus = provider.getAuthStatus
                ? await provider.getAuthStatus()
                : { authenticated: false, message: 'Lane does not report auth status.' };

            statuses.push({
                laneId,
                lane,
                authenticated: authStatus.authenticated,
                message: authStatus.message,
            });
        }

        return ok(statuses);
    }

    async laneAdd(lane: LaneConfig): Promise<Result<LoopWorkspaceConfig>> {
        const loaded = await this.getWorkspaceConfig();
        if (!loaded.ok) {
            return loaded;
        }

        const config = loaded.value.config;
        config.lanes[lane.id] = {
            kind: lane.kind,
            config: lane.config,
        };

        await this.fs.writeJson(path.join(this.workspaceRoot, 'loop.json'), config);
        return ok(config);
    }

    async laneAuth(laneId: string, token: string): Promise<Result<{ path: string; warning: string }>> {
        const authPath = path.join(this.workspaceRoot, 'loop', 'auth.json');
        let auth: {
            schemaVersion: '1';
            lanes: Record<string, { token: string; updatedAt: string }>;
        } = {
            schemaVersion: '1',
            lanes: {},
        };

        if (await this.fs.exists(authPath)) {
            const raw = await this.fs.readJson<typeof auth>(authPath);
            auth = raw;
        }

        auth.lanes[laneId] = {
            token,
            updatedAt: new Date().toISOString(),
        };

        await this.fs.writeJson(authPath, auth);

        const gitignorePath = path.join(this.workspaceRoot, '.gitignore');
        const marker = 'loop/auth.json';
        const currentGitignore = (await this.fs.exists(gitignorePath))
            ? await this.fs.readText(gitignorePath)
            : '';

        if (!currentGitignore.split(/\r?\n/).includes(marker)) {
            const next = currentGitignore.length > 0
                ? `${currentGitignore.trimEnd()}\n${marker}\n`
                : `${marker}\n`;
            await this.fs.writeText(gitignorePath, next);
        }

        return ok({
            path: authPath,
            warning: 'Auth is stored in loop/auth.json for v0. Treat this file as sensitive.',
        });
    }

    async toolchainStatus(): Promise<Result<ToolchainStatus[]>> {
        const loaded = await this.getWorkspaceConfig();
        const config = loaded.ok ? loaded.value.config : defaultWorkspaceConfig();

        const statuses: ToolchainStatus[] = [];
        for (const toolchain of config.toolchains) {
            const adapter = this.toolchainRegistry.get(toolchain.id);
            if (!adapter) {
                statuses.push({
                    id: toolchain.id,
                    status: 'error',
                    diagnostics: [
                        {
                            id: 'toolchain.missing_adapter',
                            severity: 'error',
                            message: `No adapter registered for toolchain: ${toolchain.id}`,
                            evidence: { id: toolchain.id },
                        },
                    ],
                    details: {},
                });
                continue;
            }

            const detected = await adapter.detect({
                workspaceRoot: this.workspaceRoot,
            });

            if (!detected.ok) {
                statuses.push({
                    id: toolchain.id,
                    status: 'error',
                    diagnostics: [
                        {
                            id: detected.error.code,
                            severity: 'error',
                            message: detected.error.message,
                            evidence: detected.error.details,
                        },
                    ],
                    details: {},
                });
                continue;
            }

            statuses.push(detected.value);
        }

        return ok(statuses);
    }

    async toolchainSync(options: { dryRun?: boolean } = {}): Promise<Result<{ plans: PatchPlan[]; executions: PatchExecutionResult[] }>> {
        const loaded = await this.getWorkspaceConfig();
        const config = loaded.ok ? loaded.value.config : defaultWorkspaceConfig();
        const plans: PatchPlan[] = [];
        const executions: PatchExecutionResult[] = [];

        for (const toolchain of config.toolchains) {
            const adapter = this.toolchainRegistry.get(toolchain.id);
            if (!adapter) {
                continue;
            }

            const planResult = await adapter.planFix({
                workspaceRoot: this.workspaceRoot,
            });

            if (!planResult.ok) {
                continue;
            }

            for (const plan of planResult.value.plans) {
                plans.push(plan);
                const execution = await executePatchPlan(plan, {
                    workspaceRoot: this.workspaceRoot,
                    dryRun: options.dryRun,
                    fs: this.fs,
                });
                executions.push(execution);
            }
        }

        return ok({ plans, executions });
    }
}

export function createKernel(options: KernelOptions = {}): LoopKernel {
    return new LoopKernel(options);
}
