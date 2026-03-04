import path from 'node:path';
import {
    ComponentLockfileSchema,
    type ComponentLockfile,
    type InstalledComponentRecord,
} from '@loop-kit/loop-contracts';
import { nodeFsGateway, type FsGateway } from '../io/fsGateway.js';

export const COMPONENT_LOCKFILE_PATH = path.join('loop', 'installs', 'components.lock.json');

export async function readComponentLockfile(
    workspaceRoot: string,
    fs: FsGateway = nodeFsGateway,
): Promise<ComponentLockfile> {
    const lockfilePath = path.resolve(workspaceRoot, COMPONENT_LOCKFILE_PATH);
    if (!(await fs.exists(lockfilePath))) {
        return {
            schemaVersion: '1',
            installs: [],
        };
    }

    const raw = await fs.readJson<unknown>(lockfilePath);
    const parsed = ComponentLockfileSchema.safeParse(raw);
    if (!parsed.success) {
        return {
            schemaVersion: '1',
            installs: [],
        };
    }

    return parsed.data;
}

export async function writeComponentLockfile(
    workspaceRoot: string,
    lockfile: ComponentLockfile,
    fs: FsGateway = nodeFsGateway,
): Promise<void> {
    const lockfilePath = path.resolve(workspaceRoot, COMPONENT_LOCKFILE_PATH);
    await fs.writeJson(lockfilePath, lockfile);
}

export function upsertInstallRecord(
    lockfile: ComponentLockfile,
    record: InstalledComponentRecord,
): ComponentLockfile {
    const installs = [...lockfile.installs];
    const index = installs.findIndex(
        (candidate) =>
            candidate.componentId === record.componentId &&
            candidate.targetPath === record.targetPath,
    );

    if (index >= 0) {
        installs[index] = record;
    } else {
        installs.push(record);
    }

    return {
        ...lockfile,
        installs,
    };
}

export function findInstallRecord(
    lockfile: ComponentLockfile,
    componentId: string,
    targetPath?: string,
): InstalledComponentRecord | undefined {
    if (targetPath) {
        return lockfile.installs.find(
            (record) =>
                record.componentId === componentId &&
                record.targetPath === targetPath,
        );
    }

    return lockfile.installs.find((record) => record.componentId === componentId);
}
