import indexHtml from "../index.html";
import { defineEntrypoint, type BunFullstackServices } from "volt";
import { startSiteServer } from "./startSiteServer";

export default defineEntrypoint<BunFullstackServices>(import.meta, async (services) => {
  startSiteServer(services, indexHtml);
});
