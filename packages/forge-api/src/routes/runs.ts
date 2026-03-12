import type { CreateRunRequest, Run, RunDetail, RunListResponse, RunStatus } from '@loop-kit/forge-contracts';
import type { FastifyPluginAsync } from 'fastify';

import {
  createRunBodySchema,
  listRunsQuerySchema,
  organizationParamsSchema,
  runParamsSchema
} from '../utils/schemas.js';
import { requireAuthContext, requireValue } from './helpers.js';

export const runRoutes: FastifyPluginAsync = async (app) => {
  app.get(
    '/v0/organizations/:organizationId/runs',
    {
      schema: {
        params: organizationParamsSchema,
        querystring: listRunsQuerySchema
      }
    },
    async (request) => {
      const authContext = requireAuthContext(request);
      const params = request.params as { organizationId: string };
      const query = request.query as {
        cursor?: string;
        limit?: number;
        status?: RunStatus;
      };

      const response = await app.forgeServices.runs.listRuns({
        actor: authContext.actor,
        cursor: query.cursor,
        limit: query.limit,
        organizationId: params.organizationId,
        status: query.status
      });

      return response satisfies RunListResponse;
    }
  );

  app.post(
    '/v0/organizations/:organizationId/runs',
    {
      schema: {
        body: createRunBodySchema,
        params: organizationParamsSchema
      }
    },
    async (request, reply) => {
      const authContext = requireAuthContext(request);
      const organizationId = (request.params as { organizationId: string }).organizationId;
      const runRequest = request.body as CreateRunRequest;

      await app.forgeServices.quota.assertRunAllowed({
        actor: authContext.actor,
        organizationId,
        request: runRequest
      });

      const run = await app.forgeServices.runs.createRun({
        actor: authContext.actor,
        organizationId,
        request: runRequest
      });

      return reply.code(202).send(run satisfies Run);
    }
  );

  app.get(
    '/v0/organizations/:organizationId/runs/:runId',
    {
      schema: {
        params: runParamsSchema
      }
    },
    async (request) => {
      const authContext = requireAuthContext(request);
      const params = request.params as { organizationId: string; runId: string };
      const run = requireValue(
        await app.forgeServices.runs.getRun({
          actor: authContext.actor,
          organizationId: params.organizationId,
          runId: params.runId
        }),
        'Run',
        params
      );

      return run satisfies RunDetail;
    }
  );

  app.post(
    '/v0/organizations/:organizationId/runs/:runId/cancel',
    {
      schema: {
        params: runParamsSchema
      }
    },
    async (request, reply) => {
      const authContext = requireAuthContext(request);
      const params = request.params as { organizationId: string; runId: string };
      const run = requireValue(
        await app.forgeServices.runs.cancelRun({
          actor: authContext.actor,
          organizationId: params.organizationId,
          runId: params.runId
        }),
        'Run',
        params
      );

      return reply.code(202).send(run satisfies Run);
    }
  );
};
