import http from 'node:http';
import { executePatchPlan } from '@loop-kit/loop-kernel';
import { createKernel } from '@loop-kit/loop-kernel';
import { parseLoopRef } from '@loop-kit/loop-contracts';

type RpcRequest = {
    id?: string;
    method: string;
    params?: Record<string, unknown>;
};

type RpcResponse = {
    id?: string;
    result?: unknown;
    error?: {
        code: string;
        message: string;
        details?: unknown;
    };
};

async function readJsonBody(req: http.IncomingMessage): Promise<unknown> {
    const chunks: Buffer[] = [];
    for await (const chunk of req) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }

    if (chunks.length === 0) {
        return {};
    }

    const raw = Buffer.concat(chunks).toString('utf8');
    return JSON.parse(raw);
}

async function handleMethod(
    workspaceRoot: string,
    request: RpcRequest,
): Promise<RpcResponse> {
    const kernel = createKernel({ workspaceRoot });
    const params = request.params ?? {};

    if (request.method === 'graph') {
        const graph = await kernel.graph();
        if (!graph.ok) {
            return { id: request.id, error: graph.error };
        }
        return { id: request.id, result: graph.value };
    }

    if (request.method === 'components.list') {
        const listed = await kernel.listComponents({
            query: typeof params.query === 'string' ? params.query : undefined,
        });
        if (!listed.ok) {
            return { id: request.id, error: listed.error };
        }
        return { id: request.id, result: listed.value };
    }

    if (request.method === 'refs.resolve') {
        const refText = typeof params.ref === 'string' ? params.ref : '';
        const parsed = parseLoopRef(refText);
        if (!parsed.ok) {
            return { id: request.id, error: parsed.error };
        }
        return { id: request.id, result: parsed.value };
    }

    if (request.method === 'components.planAdd') {
        const ref = typeof params.ref === 'string' ? params.ref : '';
        const targetPath = typeof params.targetPath === 'string' ? params.targetPath : undefined;
        const result = await kernel.add(ref, {
            targetPath,
            dryRun: true,
        });
        if (!result.ok) {
            return { id: request.id, error: result.error };
        }
        return {
            id: request.id,
            result: {
                plan: result.value.plan,
                execution: result.value.execution,
            },
        };
    }

    if (request.method === 'components.planUpdate') {
        const ref = typeof params.ref === 'string' ? params.ref : '';
        const targetPath = typeof params.targetPath === 'string' ? params.targetPath : undefined;
        const result = await kernel.update(ref, {
            targetPath,
            dryRun: true,
        });
        if (!result.ok) {
            return { id: request.id, error: result.error };
        }
        return {
            id: request.id,
            result: {
                plan: result.value.plan,
                execution: result.value.execution,
            },
        };
    }

    if (request.method === 'plans.apply') {
        const rawPlan = params.plan;
        if (!rawPlan || typeof rawPlan !== 'object') {
            return {
                id: request.id,
                error: {
                    code: 'plan.invalid',
                    message: 'Missing plan payload',
                },
            };
        }

        const execution = await executePatchPlan(rawPlan as never, {
            workspaceRoot,
            dryRun: params.apply !== true,
        });
        return {
            id: request.id,
            result: execution,
        };
    }

    return {
        id: request.id,
        error: {
            code: 'method.not_found',
            message: `Unknown method: ${request.method}`,
        },
    };
}

export function createLoopdServer(workspaceRoot: string): http.Server {
    return http.createServer(async (req, res) => {
        try {
            if (req.method !== 'POST' || req.url !== '/rpc') {
                res.statusCode = 404;
                res.end();
                return;
            }

            const body = await readJsonBody(req);
            const request = body as RpcRequest;
            if (!request || typeof request.method !== 'string') {
                res.statusCode = 400;
                res.setHeader('content-type', 'application/json');
                res.end(JSON.stringify({
                    error: {
                        code: 'rpc.invalid_request',
                        message: 'Invalid request body',
                    },
                }));
                return;
            }

            const response = await handleMethod(workspaceRoot, request);
            res.statusCode = 200;
            res.setHeader('content-type', 'application/json');
            res.end(JSON.stringify(response));
        } catch (error) {
            res.statusCode = 500;
            res.setHeader('content-type', 'application/json');
            res.end(JSON.stringify({
                error: {
                    code: 'rpc.internal_error',
                    message: String(error),
                },
            }));
        }
    });
}
