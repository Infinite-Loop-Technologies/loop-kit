export const organizationParamsSchema = {
  additionalProperties: false,
  properties: {
    organizationId: {
      format: 'uuid',
      type: 'string'
    }
  },
  required: ['organizationId'],
  type: 'object'
} as const;

export const runParamsSchema = {
  additionalProperties: false,
  properties: {
    organizationId: {
      format: 'uuid',
      type: 'string'
    },
    runId: {
      format: 'uuid',
      type: 'string'
    }
  },
  required: ['organizationId', 'runId'],
  type: 'object'
} as const;

export const createOrganizationBodySchema = {
  additionalProperties: false,
  properties: {
    displayName: {
      minLength: 1,
      type: 'string'
    },
    slug: {
      pattern: '^[a-z0-9-]+$',
      type: 'string'
    }
  },
  required: ['displayName', 'slug'],
  type: 'object'
} as const;

export const createRunBodySchema = {
  additionalProperties: false,
  properties: {
    idempotencyKey: {
      type: 'string'
    },
    input: {
      additionalProperties: true,
      type: 'object'
    },
    kind: {
      minLength: 1,
      type: 'string'
    }
  },
  required: ['kind', 'input'],
  type: 'object'
} as const;

export const listRunsQuerySchema = {
  additionalProperties: false,
  properties: {
    cursor: {
      type: 'string'
    },
    limit: {
      default: 20,
      maximum: 100,
      minimum: 1,
      type: 'integer'
    },
    status: {
      enum: ['queued', 'running', 'completed', 'failed', 'canceled', 'cancel_requested'],
      type: 'string'
    }
  },
  type: 'object'
} as const;
