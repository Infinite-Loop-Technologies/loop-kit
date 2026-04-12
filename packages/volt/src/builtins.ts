import { defineResource, t } from "./schema";

export const HttpService = defineResource("HttpService", {
  fetch: t.fn({
    input: t.object({
      method: t.string().optional(),
      url: t.string(),
    }),
    output: t.object({
      ok: t.boolean(),
      status: t.number().int(),
      text: t.string(),
    }),
  }),
});

export const ClockService = defineResource("ClockService", {
  nowMs: t.fn({
    input: t.object({}),
    output: t.number().int(),
  }),
  sleep: t.fn({
    input: t.object({
      ms: t.number().int().min(0),
    }),
    output: t.object({}),
  }),
});
