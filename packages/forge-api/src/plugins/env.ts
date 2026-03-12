import fp from 'fastify-plugin';

import { readForgeApiEnv, type ForgeApiEnv } from '../utils/env.js';

type EnvPluginOptions = {
  env?: Partial<ForgeApiEnv>;
};

export const envPlugin = fp<EnvPluginOptions>(
  async (app, options) => {
    app.decorate('forgeEnv', {
      ...readForgeApiEnv(),
      ...(options.env ?? {})
    });
  },
  {
    name: 'forge-env'
  }
);
