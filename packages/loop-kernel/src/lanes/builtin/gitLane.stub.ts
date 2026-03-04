import { err, type LaneResolveComponentRequest, type LaneResolveComponentResponse, type LaneResolveModuleRequest, type LaneResolveModuleResponse, type Result } from '@loop-kit/loop-contracts';
import type { LaneProvider } from '../../providers/capabilities/lane.js';

export class GitLaneProviderStub implements LaneProvider {
    readonly id = 'git';
    readonly kind = 'git';

    async resolveComponent(
        request: LaneResolveComponentRequest,
    ): Promise<Result<LaneResolveComponentResponse>> {
        return err({
            code: 'lane.git.not_implemented',
            message: `Git lane component resolution is not implemented for ref kind ${request.ref.kind}.`,
        });
    }

    async resolveModule(
        request: LaneResolveModuleRequest,
    ): Promise<Result<LaneResolveModuleResponse>> {
        return err({
            code: 'lane.git.not_implemented',
            message: `Git lane module resolution is not implemented for ref kind ${request.ref.kind}.`,
        });
    }

    async getAuthStatus(): Promise<{ authenticated: boolean; message?: string }> {
        return { authenticated: false, message: 'Git lane auth is not implemented in v0.' };
    }
}
