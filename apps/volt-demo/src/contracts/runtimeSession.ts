import { defineContract, defineInterface, t } from "volt/contracts";

export const BrowserRuntime = defineContract(
  "BrowserRuntime",
  defineInterface("BrowserRuntime", {
    resolveConfig: t.fn({
      input: t.object({}),
      output: t.object({
        gameHttpUrl: t.string(),
        gamePublicHttpUrl: t.string().optional(),
        gamePublicWsUrl: t.string().optional(),
        gameWsUrl: t.string(),
        mode: t.string(),
        shareEnabled: t.boolean(),
        webPublicUrl: t.string().optional(),
        webUrl: t.string(),
      }),
    }),
  }),
);
