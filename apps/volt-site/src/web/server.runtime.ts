import indexHtml from "../index.html";
import { bunFullstackApp } from "volt";
import { startSiteServer } from "./startSiteServer";

export default bunFullstackApp(import.meta, async (services) => {
  startSiteServer(services, indexHtml);
});
