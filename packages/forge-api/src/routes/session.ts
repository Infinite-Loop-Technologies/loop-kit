import type { FastifyPluginAsync } from 'fastify';
import type { SessionBootstrap } from '@loop-kit/forge-contracts';

import { requireAuthContext } from './helpers.js';

export const sessionRoutes: FastifyPluginAsync = async (app) => {
  app.get('/v0/session/bootstrap', async (request) => {
    const authContext = requireAuthContext(request);
    const organizations = await app.forgeServices.organizations.list(authContext.actor);

    return {
      actor: authContext.actor,
      organizations,
      selectedOrganizationId: authContext.selectedOrganizationId
    } satisfies SessionBootstrap;
  });
};
