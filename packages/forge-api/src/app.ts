import Fastify, { type FastifyInstance, type FastifyServerOptions } from 'fastify';

import './types.js';

import type { ForgeServices } from './services/interfaces.js';
import { authContextPlugin } from './plugins/auth-context.js';
import { dbPlugin } from './plugins/db.js';
import { envPlugin } from './plugins/env.js';
import { servicesPlugin } from './plugins/services.js';
import { registerForgeRoutes } from './routes/index.js';
import { ForgeApiError, toErrorResponse } from './utils/errors.js';
import type { ForgeApiEnv } from './utils/env.js';

export type BuildForgeApiAppOptions = FastifyServerOptions & {
  env?: Partial<ForgeApiEnv>;
  services?: ForgeServices;
};

export async function buildForgeApiApp(
  options: BuildForgeApiAppOptions = {}
): Promise<FastifyInstance> {
  const { env, services, ...fastifyOptions } = options;
  const app = Fastify({
    logger: false,
    ...fastifyOptions
  });

  app.setErrorHandler((error, request, reply) => {
    if (
      error &&
      typeof error === 'object' &&
      'validation' in error &&
      (error as { validation?: unknown }).validation
    ) {
      return reply.status(400).send({
        code: 'validation_error',
        details: {
          issues: (error as { validation?: unknown }).validation
        },
        message: 'Request validation failed.'
      });
    }

    if (error instanceof ForgeApiError) {
      return reply.status(error.statusCode).send(toErrorResponse(error));
    }

    request.log.error(error);
    return reply.status(500).send(toErrorResponse(error as Error));
  });

  app.setNotFoundHandler((_request, reply) => {
    return reply.status(404).send({
      code: 'route.not_found',
      message: 'Route not found.'
    });
  });

  await app.register(envPlugin, { env });
  await app.register(dbPlugin);
  await app.register(servicesPlugin, { services });
  await app.register(authContextPlugin);
  await app.register(registerForgeRoutes);
  await app.ready();

  return app;
}
