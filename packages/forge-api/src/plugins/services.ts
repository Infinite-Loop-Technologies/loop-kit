import fp from 'fastify-plugin';

import type { ForgeServices } from '../services/interfaces.js';
import { createStubForgeServices } from '../services/stub-services.js';

type ServicesPluginOptions = {
  services?: ForgeServices;
};

export const servicesPlugin = fp<ServicesPluginOptions>(
  async (app, options) => {
    app.decorate('forgeServices', options.services ?? createStubForgeServices());
  },
  {
    name: 'forge-services'
  }
);
