import fp from 'fastify-plugin';

import { createForgeDb } from '../db/client.js';

export const dbPlugin = fp(
  async (app) => {
    app.decorate('db', app.forgeEnv.databaseUrl ? createForgeDb(app.forgeEnv.databaseUrl) : null);
  },
  {
    name: 'forge-db',
    dependencies: ['forge-env']
  }
);
