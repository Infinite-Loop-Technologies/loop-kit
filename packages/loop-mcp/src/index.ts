import process from 'node:process';
import { executePatchPlan } from '@loop-kit/loop-kernel';
import { createKernel } from '@loop-kit/loop-kernel';

type McpRequest = {
    id?: string;
    type: string;
    tool?: string;
    arguments?: Record<string, unknown>;
};

type McpResponse = {
    id?: string;
    type: string;
    result?: unknown;
    error?: {
        code: string;
        message: string;
    };
};

const TOOL_LIST = [
    'loop.search_components',
    'loop.plan_add_component',
    'loop.apply_plan',
    'loop.run_doctor',
] as const;

export async function handleMcpRequest(
    workspaceRoot: string,
    request: McpRequest,
): Promise<McpResponse> {
    const kernel = createKernel({ workspaceRoot });

    if (request.type === 'initialize') {
        return {
            id: request.id,
            type: 'initialize.result',
            result: {
                protocolVersion: '1',
                tools: TOOL_LIST,
            },
        };
    }

    if (request.type !== 'tool.call' || !request.tool) {
        return {
            id: request.id,
            type: 'error',
            error: {
                code: 'mcp.invalid_request',
                message: 'Invalid MCP request',
            },
        };
    }

    const args = request.arguments ?? {};

    if (request.tool === 'loop.search_components') {
        const result = await kernel.listComponents({
            query: typeof args.query === 'string' ? args.query : undefined,
        });
        return result.ok
            ? { id: request.id, type: 'tool.result', result: result.value }
            : { id: request.id, type: 'error', error: { code: result.error.code, message: result.error.message } };
    }

    if (request.tool === 'loop.plan_add_component') {
        const ref = typeof args.ref === 'string' ? args.ref : '';
        const targetPath = typeof args.targetPath === 'string' ? args.targetPath : undefined;
        const result = await kernel.add(ref, {
            targetPath,
            dryRun: true,
        });
        return result.ok
            ? {
                id: request.id,
                type: 'tool.result',
                result: {
                    plan: result.value.plan,
                    execution: result.value.execution,
                },
            }
            : { id: request.id, type: 'error', error: { code: result.error.code, message: result.error.message } };
    }

    if (request.tool === 'loop.apply_plan') {
        const apply = args.apply === true;
        const plan = args.plan;
        if (!plan || typeof plan !== 'object') {
            return {
                id: request.id,
                type: 'error',
                error: {
                    code: 'plan.invalid',
                    message: 'Missing plan payload',
                },
            };
        }

        const execution = await executePatchPlan(plan as never, {
            workspaceRoot,
            dryRun: !apply,
        });
        return {
            id: request.id,
            type: 'tool.result',
            result: {
                applied: apply,
                execution,
            },
        };
    }

    if (request.tool === 'loop.run_doctor') {
        const report = await kernel.doctor();
        return report.ok
            ? { id: request.id, type: 'tool.result', result: report.value }
            : { id: request.id, type: 'error', error: { code: report.error.code, message: report.error.message } };
    }

    return {
        id: request.id,
        type: 'error',
        error: {
            code: 'tool.not_found',
            message: `Unknown tool: ${request.tool}`,
        },
    };
}

export async function serveMcpStdIo(workspaceRoot: string): Promise<void> {
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', async (chunk: string) => {
        for (const line of chunk.split(/\r?\n/)) {
            const trimmed = line.trim();
            if (!trimmed) {
                continue;
            }

            let payload: McpRequest;
            try {
                payload = JSON.parse(trimmed) as McpRequest;
            } catch {
                process.stdout.write(`${JSON.stringify({
                    type: 'error',
                    error: {
                        code: 'json.parse_failed',
                        message: 'Invalid JSON input',
                    },
                })}\n`);
                continue;
            }

            const response = await handleMcpRequest(workspaceRoot, payload);
            process.stdout.write(`${JSON.stringify(response)}\n`);
        }
    });
}
