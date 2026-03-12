import 'fastify';

import type { Actor } from '@loop-kit/forge-contracts';

import type { ForgeDb } from './db/client.js';
import type { ForgeServices } from './services/interfaces.js';
import type { ForgeApiEnv } from './utils/env.js';

export type AuthContext = {
  actor: Actor;
  selectedOrganizationId: string | null;
};

declare module 'fastify' {
  interface FastifyInstance {
    db: ForgeDb | null;
    forgeEnv: ForgeApiEnv;
    forgeServices: ForgeServices;
  }

  interface FastifyRequest {
    authContext: AuthContext | null;
  }
}
