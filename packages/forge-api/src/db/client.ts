import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

import { schema } from './schema.js';

export function createForgeDb(databaseUrl: string) {
  const client = neon(databaseUrl);
  return drizzle({ client, schema });
}

export type ForgeDb = ReturnType<typeof createForgeDb>;
