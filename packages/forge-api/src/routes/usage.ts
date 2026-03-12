import type { FastifyPluginAsync } from 'fastify';
import type { UsageSummary } from '@loop-kit/forge-contracts';

import { organizationParamsSchema } from '../utils/schemas.js';
import { requireValue } from './helpers.js';

export const usageRoutes: FastifyPluginAsync = async (app) => {
  app.get(
    '/v0/organizations/:organizationId/usage-summary',
    {
      schema: {
        params: organizationParamsSchema
      }
    },
    async (request) => {
      const organizationId = (request.params as { organizationId: string }).organizationId;
      const summary = requireValue(
        await app.forgeServices.usage.getSummary(organizationId),
        'Usage summary',
        { organizationId }
      );

      return summary satisfies UsageSummary;
    }
  );
};
