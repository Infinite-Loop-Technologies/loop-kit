import type { ErrorResponse } from '@loop-kit/forge-contracts';

export class ForgeApiError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ForgeApiError';
  }
}

export class AuthRequiredError extends ForgeApiError {
  constructor(message = 'Authentication is required.') {
    super(401, 'auth.required', message);
  }
}

export class ResourceNotFoundError extends ForgeApiError {
  constructor(resource: string, details?: Record<string, unknown>) {
    super(404, 'resource.not_found', `${resource} was not found.`, details);
  }
}

export class QuotaExceededError extends ForgeApiError {
  constructor(details?: Record<string, unknown>) {
    super(403, 'quota.exceeded', 'Run creation is blocked by the current quota policy.', details);
  }
}

export function toErrorResponse(error: Error | ForgeApiError): ErrorResponse {
  if (error instanceof ForgeApiError) {
    return {
      code: error.code,
      details: error.details,
      message: error.message
    };
  }

  return {
    code: 'internal_error',
    message: 'An unexpected error occurred.'
  };
}
