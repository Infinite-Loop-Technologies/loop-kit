// LoggerService keeps browser diagnostics behind a tiny interface.
export interface LoggerService {
  info: (message: string, data?: unknown) => void;
  warn: (message: string, data?: unknown) => void;
}

export const createLoggerService = (): LoggerService => ({
  info: (message, data) => console.info(`[browser] ${message}`, data),
  warn: (message, data) => console.warn(`[browser] ${message}`, data),
});
