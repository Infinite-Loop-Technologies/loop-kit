import path from 'node:path';
import {
    err,
    LoopWorkspaceConfigSchema,
    ok,
    type Result,
} from '@loop-kit/loop-contracts';
import { nodeFsGateway, type FsGateway } from '../io/fsGateway.js';
import type { LoadedWorkspace } from '../types.js';

export const WORKSPACE_CONFIG_FILE = 'loop.json';

export async function loadWorkspace(
    workspaceRoot: string,
    fs: FsGateway = nodeFsGateway,
): Promise<Result<LoadedWorkspace>> {
    const loopConfigPath = path.join(workspaceRoot, WORKSPACE_CONFIG_FILE);
    if (!(await fs.exists(loopConfigPath))) {
        return err({
            code: 'workspace.missing',
            message: `Missing ${WORKSPACE_CONFIG_FILE} at ${loopConfigPath}`,
        });
    }

    let raw: unknown;
    try {
        raw = await fs.readJson<unknown>(loopConfigPath);
    } catch (error) {
        return err({
            code: 'workspace.invalid_json',
            message: `Failed to parse ${WORKSPACE_CONFIG_FILE}`,
            details: { error: String(error) },
        });
    }

    const parsed = LoopWorkspaceConfigSchema.safeParse(raw);
    if (!parsed.success) {
        return err({
            code: 'workspace.invalid_schema',
            message: `${WORKSPACE_CONFIG_FILE} failed schema validation`,
            details: { issues: parsed.error.issues },
        });
    }

    return ok({
        path: loopConfigPath,
        config: parsed.data,
    });
}
