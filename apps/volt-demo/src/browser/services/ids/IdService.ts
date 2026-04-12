// IdService makes generated IDs testable and easy to replace later.
export interface IdService {
  next: (prefix: string) => string;
}

export const createIdService = (): IdService => ({
  next: (prefix) => `${prefix}-${crypto.randomUUID().slice(0, 8)}`,
});
