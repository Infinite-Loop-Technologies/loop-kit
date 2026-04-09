import { defineContract, defineInterface, t } from "volt/contracts";

export const MatchId = t.string().brand("MatchId");

export const GameApi = defineContract(
  "GameApi",
  defineInterface("GameApi", {
    createMatch: t.fn({
      input: t.object({
        maxPlayers: t.number().int().min(1),
        mode: t.string(),
      }),
      output: t.object({
        matchId: MatchId,
      }),
    }),
  }),
);
