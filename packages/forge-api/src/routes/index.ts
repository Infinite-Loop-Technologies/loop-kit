import type { FastifyPluginAsync } from 'fastify';

import { billingRoutes } from './billing.js';
import { organizationRoutes } from './organizations.js';
import { runRoutes } from './runs.js';
import { sessionRoutes } from './session.js';
import { usageRoutes } from './usage.js';

export const registerForgeRoutes: FastifyPluginAsync = async (app) => {
  await app.register(sessionRoutes);
  await app.register(organizationRoutes);
  await app.register(billingRoutes);
  await app.register(usageRoutes);
  await app.register(runRoutes);
};
