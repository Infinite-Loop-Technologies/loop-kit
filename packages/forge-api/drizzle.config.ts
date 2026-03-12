import { defineConfig } from 'drizzle-kit';

export const DEFAULT_DATABASE_URL = 'postgresql://postgres:postgres@127.0.0.1:5432/forge';

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL ?? DEFAULT_DATABASE_URL
  },
  strict: true,
  verbose: true
});
