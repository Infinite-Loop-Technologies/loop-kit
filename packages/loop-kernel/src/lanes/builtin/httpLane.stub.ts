import { err, type LaneResolveComponentRequest, type LaneResolveComponentResponse, type LaneResolveModuleRequest, type LaneResolveModuleResponse, type Result } from '@loop-kit/loop-contracts';
import type { LaneProvider } from '../../providers/capabilities/lane.js';

export class HttpLaneProviderStub implements LaneProvider {
    readonly id = 'http';
    readonly kind = 'http';

    async resolveComponent(
        request: LaneResolveComponentRequest,
    ): Promise<Result<LaneResolveComponentResponse>> {
        return err({
            code: 'lane.http.not_implemented',
            message: `HTTP lane component resolution is not implemented for ref kind ${request.ref.kind}.`,
        });
    }

    async resolveModule(
        request: LaneResolveModuleRequest,
    ): Promise<Result<LaneResolveModuleResponse>> {
        return err({
            code: 'lane.http.not_implemented',
            message: `HTTP lane module resolution is not implemented for ref kind ${request.ref.kind}.`,
        });
    }

    async getAuthStatus(): Promise<{ authenticated: boolean; message?: string }> {
        return { authenticated: false, message: 'HTTP lane auth is not implemented in v0.' };
    }
}
