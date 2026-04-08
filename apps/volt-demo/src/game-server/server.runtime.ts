import { bunServerApp } from "volt";
import { loadProjectEnv } from "../shared/loadProjectEnv";
import { startGameServer } from "./startGameServer";

export default bunServerApp(import.meta, async (services) => {
  await loadProjectEnv(import.meta.dir);
  startGameServer(services);
});
