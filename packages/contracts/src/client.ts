import { client as defaultClient } from './generated/openapi/client.gen.js';
import { createClient, createConfig, type Client, type Config } from './generated/openapi/client/index.js';

export const DEFAULT_FORGE_API_BASE_URL = 'https://api.forge.invalid';

export type ForgeApiAuthToken =
  | string
  | undefined
  | (() => string | undefined | Promise<string | undefined>);

export type ForgeApiClientOptions = {
  authToken?: ForgeApiAuthToken;
  baseUrl?: string;
  fetch?: typeof fetch;
  headers?: HeadersInit;
};

export const forgeApiClient = defaultClient;

export function createForgeApiClient(options: ForgeApiClientOptions = {}): Client {
  return createClient(resolveClientConfig(options));
}

export function configureForgeApiClient(options: ForgeApiClientOptions = {}): Config {
  const current = defaultClient.getConfig();
  return defaultClient.setConfig(
    resolveClientConfig({
      ...options,
      baseUrl: options.baseUrl ?? current.baseUrl ?? DEFAULT_FORGE_API_BASE_URL
    })
  );
}

function resolveClientConfig(options: ForgeApiClientOptions): Config {
  return createConfig({
    auth: toAuthValue(options.authToken),
    baseUrl: options.baseUrl ?? DEFAULT_FORGE_API_BASE_URL,
    fetch: options.fetch,
    headers: options.headers
  });
}

function toAuthValue(authToken: ForgeApiAuthToken): Config['auth'] {
  if (!authToken) {
    return undefined;
  }

  return typeof authToken === 'function' ? async () => authToken() : authToken;
}
