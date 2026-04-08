import indexHtml from "../index.html";
import { bunFullstackApp } from "volt";
import { startWebServer } from "./startWebServer";

export default bunFullstackApp(import.meta, async (services) => {
  startWebServer(services, indexHtml);
});
