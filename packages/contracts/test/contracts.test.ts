import assert from 'node:assert/strict';
import test from 'node:test';

import {
  DEFAULT_FORGE_API_BASE_URL,
  configureForgeApiClient,
  createForgeApiClient,
  forgeApiClient,
  forgeAsyncApiSpecUrl,
  forgeOpenApiSpecUrl,
  listOrganizations
} from '../src/index.js';

test('exports contract spec URLs and runtime client helpers', async () => {
  assert.match(forgeOpenApiSpecUrl.pathname, /openapi[\\/]openapi\.yaml$/);
  assert.match(forgeAsyncApiSpecUrl.pathname, /asyncapi[\\/]asyncapi\.yaml$/);

  const client = createForgeApiClient({
    authToken: 'token-123',
    baseUrl: 'https://forge.example.test'
  });

  const config = client.getConfig();
  assert.equal(config.baseUrl, 'https://forge.example.test');
  assert.equal(config.auth, 'token-123');
});

test('configureForgeApiClient updates the shared generated client', async () => {
  const config = configureForgeApiClient({
    authToken: async () => 'token-456',
    headers: {
      'x-forge-client': 'tests'
    }
  });

  assert.equal(config.baseUrl, DEFAULT_FORGE_API_BASE_URL);
  assert.equal(typeof config.auth, 'function');
  const headers = new Headers(forgeApiClient.getConfig().headers as HeadersInit | undefined);
  assert.equal(headers.get('x-forge-client'), 'tests');

  const result = listOrganizations({
    client: forgeApiClient,
    responseStyle: 'data'
  });

  assert.equal(typeof result.then, 'function');
});
