import type { Result } from '@loop-kit/loop-contracts';

export interface ProviderTransport {
    invoke<TRequest, TResponse>(
        handler: (request: TRequest) => Promise<Result<TResponse>>,
        request: TRequest,
    ): Promise<Result<TResponse>>;
}

export class InProcessProviderTransport implements ProviderTransport {
    async invoke<TRequest, TResponse>(
        handler: (request: TRequest) => Promise<Result<TResponse>>,
        request: TRequest,
    ): Promise<Result<TResponse>> {
        return handler(request);
    }
}
