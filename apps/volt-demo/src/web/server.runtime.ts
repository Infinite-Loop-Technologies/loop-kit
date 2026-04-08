import indexHtml from "../index.html";
import { bunFullstackApp } from "volt";
import { loadProjectEnv } from "../shared/loadProjectEnv";
import { startWebServer } from "./startWebServer";

export default bunFullstackApp(import.meta, async (services) => {
  await loadProjectEnv(import.meta.dir);
  startWebServer(services, indexHtml);
});
