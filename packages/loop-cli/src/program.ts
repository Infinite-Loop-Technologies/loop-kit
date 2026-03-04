import { Command } from 'commander';
import { handleInit } from './commands/init.js';
import { handleDoctor } from './commands/doctor.js';
import { handleFix } from './commands/fix.js';
import { handleGraph } from './commands/graph.js';
import { handleNewApp, handleNewPkg } from './commands/new.js';
import { handleAdd, handleDiff, handleUpdate } from './commands/component.js';
import { handleExtract } from './commands/extract.js';
import { handleAdopt } from './commands/adopt.js';
import { handleRun, handleCi } from './commands/run.js';
import { handleUndo } from './commands/undo.js';
import { handleComponentList, handleComponentShow } from './commands/componentCatalog.js';
import { handleRequest } from './commands/request.js';
import { handleLoopdStart, handleLoopdStatus, handleLoopdStop } from './commands/loopd.js';
import { handleMcpServe } from './commands/mcp.js';
import { handleAiDoctor } from './commands/ai.js';
import { handleLaneAdd, handleLaneAuth, handleLaneList } from './commands/lane.js';
import { handleToolchainStatus, handleToolchainSync } from './commands/toolchain.js';

export function createProgram(): Command {
    const program = new Command();
    program
        .name('loop')
        .description('Loop CLI')
        .option('--cwd <path>', 'Workspace root override');

    program
        .command('init')
        .description('Initialize a loop workspace')
        .option('--dir <path>', 'Target directory')
        .option('--template <ref>', 'Template source (for example file:./my-template)')
        .action(async (actionOptions: { dir?: string; template?: string }) => {
            const rootOptions = program.opts<{ cwd?: string }>();
            await handleInit({
                cwd: rootOptions.cwd,
                dir: actionOptions.dir,
                template: actionOptions.template,
            });
        });

    program
        .command('doctor')
        .description('Run workspace diagnostics')
        .option('--json', 'Print JSON')
        .action(async (options: { json?: boolean }) => {
            const root = program.opts<{ cwd?: string }>();
            await handleDoctor({ cwd: root.cwd, json: options.json });
        });

    program
        .command('fix')
        .description('Apply doctor fixes')
        .option('--all-safe', 'Apply all safe fixes')
        .option('--only <id...>', 'Only apply specific fix or diagnostic IDs')
        .option('--dry-run', 'Do not write files')
        .action(async (options: { allSafe?: boolean; only?: string[]; dryRun?: boolean }) => {
            const root = program.opts<{ cwd?: string }>();
            await handleFix({
                cwd: root.cwd,
                allSafe: options.allSafe,
                only: options.only,
                dryRun: options.dryRun,
            });
        });

    program
        .command('graph')
        .description('Print workspace graph')
        .option('--json', 'Print JSON')
        .option('--summary', 'Print compact summary')
        .action(async (options: { json?: boolean; summary?: boolean }) => {
            const root = program.opts<{ cwd?: string }>();
            await handleGraph({ cwd: root.cwd, json: options.json, summary: options.summary });
        });

    program
        .command('run <taskId>')
        .description('Run a configured workspace task')
        .option('--parallel', 'Run independent tasks in parallel')
        .option('--json', 'Print JSON summary')
        .action(async (taskId: string, options: { parallel?: boolean; json?: boolean }) => {
            const root = program.opts<{ cwd?: string }>();
            await handleRun(taskId, {
                cwd: root.cwd,
                parallel: options.parallel,
                json: options.json,
            });
        });

    program
        .command('ci')
        .description('Run configured CI pipeline')
        .option('--pipeline <id>', 'Pipeline ID')
        .option('--parallel', 'Run independent tasks in parallel')
        .option('--json', 'Print JSON summary')
        .action(async (options: { pipeline?: string; parallel?: boolean; json?: boolean }) => {
            const root = program.opts<{ cwd?: string }>();
            await handleCi({
                cwd: root.cwd,
                pipeline: options.pipeline,
                parallel: options.parallel,
                json: options.json,
            });
        });

    const newCommand = program.command('new').description('Create app/pkg scaffolds');
    newCommand
        .command('app <name>')
        .option('--template <ref>', 'Template name or file: path')
        .option('--dry-run', 'Do not write files')
        .action(async (name: string, options: { template?: string; dryRun?: boolean }) => {
            const root = program.opts<{ cwd?: string }>();
            await handleNewApp(name, {
                cwd: root.cwd,
                template: options.template,
                dryRun: options.dryRun,
            });
        });

    newCommand
        .command('pkg <name>')
        .option('--template <ref>', 'Template name or file: path')
        .option('--dry-run', 'Do not write files')
        .action(async (name: string, options: { template?: string; dryRun?: boolean }) => {
            const root = program.opts<{ cwd?: string }>();
            await handleNewPkg(name, {
                cwd: root.cwd,
                template: options.template,
                dryRun: options.dryRun,
            });
        });

    program
        .command('add <componentRef>')
        .description('Install a component')
        .option('--to <path>', 'Install target path')
        .option('--dry-run', 'Do not write files')
        .action(async (componentRef: string, options: { to?: string; dryRun?: boolean }) => {
            const root = program.opts<{ cwd?: string }>();
            await handleAdd(componentRef, {
                cwd: root.cwd,
                to: options.to,
                dryRun: options.dryRun,
            });
        });

    program
        .command('update <componentRef>')
        .description('Update an installed component')
        .option('--to <path>', 'Install target path')
        .option('--force', 'Overwrite local modifications')
        .option('--dry-run', 'Do not write files')
        .action(async (componentRef: string, options: { to?: string; dryRun?: boolean; force?: boolean }) => {
            const root = program.opts<{ cwd?: string }>();
            await handleUpdate(componentRef, {
                cwd: root.cwd,
                to: options.to,
                dryRun: options.dryRun,
                force: options.force,
            });
        });

    program
        .command('diff <componentRef>')
        .description('Show component installation diff')
        .option('--to <path>', 'Install target path')
        .action(async (componentRef: string, options: { to?: string }) => {
            const root = program.opts<{ cwd?: string }>();
            await handleDiff(componentRef, {
                cwd: root.cwd,
                to: options.to,
            });
        });

    program
        .command('extract <path>')
        .description('Extract path into a reusable component')
        .requiredOption('--as <componentId>', 'Component ID')
        .option('--lane <lane>', 'Target lane ID')
        .option('--relocate [dest]', 'Relocate extracted files (optional destination)')
        .option('--package-too', 'Also scaffold a package wrapper')
        .option('--dry-run', 'Do not write files')
        .action(async (inputPath: string, options: { as: string; lane?: string; relocate?: string | boolean; packageToo?: boolean; dryRun?: boolean }) => {
            const root = program.opts<{ cwd?: string }>();
            await handleExtract(inputPath, {
                cwd: root.cwd,
                as: options.as,
                lane: options.lane,
                relocate: options.relocate,
                packageToo: options.packageToo,
                dryRun: options.dryRun,
            });
        });

    program
        .command('adopt <installedRef>')
        .description('Adopt an installed component into loop/components')
        .requiredOption('--as <componentId>', 'New local component ID')
        .option('--dry-run', 'Do not write files')
        .option('--json', 'Print JSON')
        .action(async (installedRef: string, options: { as: string; dryRun?: boolean; json?: boolean }) => {
            const root = program.opts<{ cwd?: string }>();
            await handleAdopt(installedRef, {
                cwd: root.cwd,
                as: options.as,
                dryRun: options.dryRun,
                json: options.json,
            });
        });

    program
        .command('undo <undoId>')
        .description('Apply a persisted undo journal')
        .option('--dry-run', 'Preview undo changes')
        .option('--json', 'Print JSON')
        .action(async (undoId: string, options: { dryRun?: boolean; json?: boolean }) => {
            const root = program.opts<{ cwd?: string }>();
            await handleUndo(undoId, {
                cwd: root.cwd,
                dryRun: options.dryRun,
                json: options.json,
            });
        });

    const component = program.command('component').description('Component catalog');
    component
        .command('list')
        .option('--query <q>', 'Search query')
        .option('--json', 'Print JSON')
        .action(async (options: { query?: string; json?: boolean }) => {
            const root = program.opts<{ cwd?: string }>();
            await handleComponentList({
                cwd: root.cwd,
                query: options.query,
                json: options.json,
            });
        });

    component
        .command('show <id>')
        .option('--json', 'Print JSON')
        .action(async (id: string, options: { json?: boolean }) => {
            const root = program.opts<{ cwd?: string }>();
            await handleComponentShow(id, {
                cwd: root.cwd,
                json: options.json,
            });
        });

    program
        .command('request')
        .description('Generate a local change request stub')
        .option('--type <kind>', 'Request kind')
        .option('--from <ref>', 'Request source ref')
        .option('--output <path>', 'Output path')
        .action(async (options: { type?: string; from?: string; output?: string }) => {
            const root = program.opts<{ cwd?: string }>();
            await handleRequest({
                cwd: root.cwd,
                type: options.type,
                from: options.from,
                output: options.output,
            });
        });

    const loopd = program.command('loopd').description('Loop daemon');
    loopd
        .command('start')
        .option('--port <port>', 'Port override', (value) => Number(value))
        .option('--json', 'Print JSON')
        .action(async (options: { port?: number; json?: boolean }) => {
            const root = program.opts<{ cwd?: string }>();
            await handleLoopdStart({
                cwd: root.cwd,
                port: options.port,
                json: options.json,
            });
        });

    loopd
        .command('stop')
        .option('--json', 'Print JSON')
        .action(async (options: { json?: boolean }) => {
            const root = program.opts<{ cwd?: string }>();
            await handleLoopdStop({
                cwd: root.cwd,
                json: options.json,
            });
        });

    loopd
        .command('status')
        .option('--json', 'Print JSON')
        .action(async (options: { json?: boolean }) => {
            const root = program.opts<{ cwd?: string }>();
            await handleLoopdStatus({
                cwd: root.cwd,
                json: options.json,
            });
        });

    const mcp = program.command('mcp').description('MCP server');
    mcp
        .command('serve')
        .action(async () => {
            const root = program.opts<{ cwd?: string }>();
            await handleMcpServe({
                cwd: root.cwd,
            });
        });

    const ai = program.command('ai').description('AI assistant tools');
    ai
        .command('doctor')
        .option('--apply', 'Apply safe fixes')
        .option('--json', 'Print JSON')
        .action(async (options: { apply?: boolean; json?: boolean }) => {
            const root = program.opts<{ cwd?: string }>();
            await handleAiDoctor({
                cwd: root.cwd,
                apply: options.apply,
                json: options.json,
            });
        });

    const lane = program.command('lane').description('Lane management');
    lane
        .command('list')
        .option('--json', 'Print JSON')
        .action(async (options: { json?: boolean }) => {
            const root = program.opts<{ cwd?: string }>();
            await handleLaneList({ cwd: root.cwd, json: options.json });
        });

    lane
        .command('add')
        .requiredOption('--id <id>', 'Lane ID')
        .requiredOption('--kind <kind>', 'Lane kind')
        .option('--config <json>', 'Lane config JSON')
        .option('--options <json>', 'Lane options JSON')
        .action(async (options: { id: string; kind: string; config?: string; options?: string }) => {
            const root = program.opts<{ cwd?: string }>();
            await handleLaneAdd({
                cwd: root.cwd,
                id: options.id,
                kind: options.kind,
                configJson: options.config,
                optionsJson: options.options,
            });
        });

    lane
        .command('auth')
        .requiredOption('--id <id>', 'Lane ID')
        .requiredOption('--token <token>', 'Auth token')
        .action(async (options: { id: string; token: string }) => {
            const root = program.opts<{ cwd?: string }>();
            await handleLaneAuth({ cwd: root.cwd, id: options.id, token: options.token });
        });

    const toolchain = program.command('toolchain').description('Toolchain adapters');
    toolchain
        .command('status')
        .option('--json', 'Print JSON')
        .action(async (options: { json?: boolean }) => {
            const root = program.opts<{ cwd?: string }>();
            await handleToolchainStatus({ cwd: root.cwd, json: options.json });
        });

    toolchain
        .command('sync')
        .option('--dry-run', 'Do not write files')
        .action(async (options: { dryRun?: boolean }) => {
            const root = program.opts<{ cwd?: string }>();
            await handleToolchainSync({ cwd: root.cwd, dryRun: options.dryRun });
        });

    return program;
}

export async function runCli(argv: string[] = process.argv): Promise<void> {
    const program = createProgram();
    await program.parseAsync(argv);
}
