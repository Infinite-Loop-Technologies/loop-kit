import { buildForgeApiApp } from './app.js';
import { readForgeApiEnv } from './utils/env.js';

const env = readForgeApiEnv();
const app = await buildForgeApiApp({
  env,
  logger: {
    level: env.logLevel
  }
});

await app.listen({
  host: env.host,
  port: env.port
});
