import type { CreateOrganizationRequest, OrganizationDetail, OrganizationListResponse } from '@loop-kit/forge-contracts';
import type { FastifyPluginAsync } from 'fastify';

import { createOrganizationBodySchema, organizationParamsSchema } from '../utils/schemas.js';
import { requireAuthContext, requireValue } from './helpers.js';

export const organizationRoutes: FastifyPluginAsync = async (app) => {
  app.get('/v0/organizations', async (request) => {
    const authContext = requireAuthContext(request);
    const items = await app.forgeServices.organizations.list(authContext.actor);

    return {
      items
    } satisfies OrganizationListResponse;
  });

  app.post(
    '/v0/organizations',
    {
      schema: {
        body: createOrganizationBodySchema
      }
    },
    async (request, reply) => {
      const authContext = requireAuthContext(request);
      const organization = await app.forgeServices.organizations.create({
        ...(request.body as CreateOrganizationRequest),
        actor: authContext.actor
      });

      return reply.code(201).send(organization);
    }
  );

  app.get(
    '/v0/organizations/:organizationId',
    {
      schema: {
        params: organizationParamsSchema
      }
    },
    async (request) => {
      const detail = requireValue(
        await app.forgeServices.organizations.get(
          (request.params as { organizationId: string }).organizationId
        ),
        'Organization',
        request.params as Record<string, unknown>
      );

      return detail satisfies OrganizationDetail;
    }
  );
};
