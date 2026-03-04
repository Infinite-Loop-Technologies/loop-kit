import {
    ok,
    type LoopWorkspaceConfig,
    type Result,
} from '@loop-kit/loop-contracts';
import type { ProviderHost } from '../providers/host.js';
import type { LaneProvider } from '../providers/capabilities/lane.js';
import type { DiffComponentResult } from '../types.js';
import { addComponent } from './add.js';

export async function diffComponent(
    workspaceRoot: string,
    host: ProviderHost,
    refText: string,
    options: {
        targetPath?: string;
        workspaceConfig?: LoopWorkspaceConfig;
        authenticateLane?: (
            laneId: string,
            provider: LaneProvider,
        ) => Promise<Result<void>>;
    } = {},
): Promise<Result<DiffComponentResult>> {
    const result = await addComponent(workspaceRoot, host, refText, {
        targetPath: options.targetPath,
        dryRun: true,
        workspaceConfig: options.workspaceConfig,
        authenticateLane: options.authenticateLane,
    });

    if (!result.ok) {
        return result;
    }

    return ok(result.value);
}
