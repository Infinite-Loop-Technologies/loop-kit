import type { BunServerServices } from "volt";
import { ClockService, HttpService } from "volt/builtins";
import { defineEntrypointSpec, implementEntrypoint } from "volt/entrypoint";
import type { DemoGameRuntimeServices } from "../dev/demoSession";
import { loadProjectEnv } from "../shared/loadProjectEnv";
import { GameApi } from "../contracts/gameApi";
import { startGameServer } from "../runtime/gameServer";

export const GameServerSpec = defineEntrypointSpec("GameServer", {
  provides: {
    api: GameApi.value,
  },
  requires: {
    clock: ClockService,
    http: HttpService,
  },
});

export const GameServer = implementEntrypoint<
  typeof GameServerSpec,
  BunServerServices & DemoGameRuntimeServices,
  void
>(GameServerSpec, async (services) => {
  await loadProjectEnv(import.meta.dir);
  startGameServer(services);
}, import.meta);

export default GameServer;
