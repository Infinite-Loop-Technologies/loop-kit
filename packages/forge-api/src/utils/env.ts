export type ForgeApiEnv = {
  databaseUrl?: string;
  host: string;
  logLevel: 'debug' | 'error' | 'info' | 'silent' | 'warn';
  port: number;
};

export function readForgeApiEnv(input: NodeJS.ProcessEnv = process.env): ForgeApiEnv {
  return {
    databaseUrl: input.DATABASE_URL,
    host: input.FORGE_API_HOST ?? '127.0.0.1',
    logLevel: normalizeLogLevel(input.FORGE_API_LOG_LEVEL),
    port: normalizePort(input.FORGE_API_PORT)
  };
}

function normalizeLogLevel(value: string | undefined): ForgeApiEnv['logLevel'] {
  switch (value) {
    case 'debug':
    case 'error':
    case 'info':
    case 'silent':
    case 'warn':
      return value;
    default:
      return 'info';
  }
}

function normalizePort(value: string | undefined): number {
  if (!value) {
    return 3001;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? 3001 : parsed;
}
