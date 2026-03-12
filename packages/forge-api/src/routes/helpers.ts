import type { FastifyRequest } from 'fastify';

import type { AuthContext } from '../types.js';
import { AuthRequiredError, ResourceNotFoundError } from '../utils/errors.js';

export function requireAuthContext(request: FastifyRequest): AuthContext {
  if (!request.authContext) {
    throw new AuthRequiredError();
  }

  return request.authContext;
}

export function requireValue<T>(value: T | null, resource: string, details?: Record<string, unknown>): T {
  if (value === null) {
    throw new ResourceNotFoundError(resource, details);
  }

  return value;
}
