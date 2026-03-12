import type { BillingSummary } from '@loop-kit/forge-contracts';
import type { FastifyPluginAsync } from 'fastify';

import { organizationParamsSchema } from '../utils/schemas.js';
import { requireValue } from './helpers.js';

export const billingRoutes: FastifyPluginAsync = async (app) => {
  app.get(
    '/v0/organizations/:organizationId/billing-summary',
    {
      schema: {
        params: organizationParamsSchema
      }
    },
    async (request) => {
      const organizationId = (request.params as { organizationId: string }).organizationId;
      const summary = requireValue(
        await app.forgeServices.billing.getSummary(organizationId),
        'Billing summary',
        { organizationId }
      );

      return summary satisfies BillingSummary;
    }
  );
};
