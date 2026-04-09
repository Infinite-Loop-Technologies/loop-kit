import indexHtml from "../index.html";
import { defineEntrypoint, type BunFullstackServices } from "volt";
import { startWebServer } from "./startWebServer";

export default defineEntrypoint<BunFullstackServices>(import.meta, async (services) => {
  startWebServer(services, indexHtml);
});
