import "dotenv/config";

import { buildApp } from "./app.js";

const app = await buildApp();
await app.ready();

export default (req: any, res: any) => {
  app.server.emit("request", req, res);
};
