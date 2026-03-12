import fp from 'fastify-plugin';

export const authContextPlugin = fp(
  async (app) => {
    app.decorateRequest('authContext', null);

    app.addHook('onRequest', async (request) => {
      request.authContext = await app.forgeServices.workos.resolveSession({
        headers: request.headers as Record<string, string | string[] | undefined>,
        url: request.url
      });
    });
  },
  {
    name: 'forge-auth-context',
    dependencies: ['forge-services']
  }
);
