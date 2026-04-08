import {
  createBunFullstackServices,
  createBunServerServices,
  type BunFullstackServices,
  type BunServerServices,
} from "./services";

type StartApp<TServices> = (services: TServices) => Promise<void> | void;
type RuntimeImportMeta = ImportMeta & { main?: boolean };

const run = async <TServices>(
  start: StartApp<TServices>,
  createServices: () => TServices,
) => {
  try {
    await start(createServices());
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

export const bunServerApp = <TServices extends BunServerServices>(
  meta: RuntimeImportMeta,
  start: StartApp<TServices>,
) => {
  if (meta.main) {
    void run(start, () => createBunServerServices(process.cwd()) as TServices);
  }
  return start;
};

export const bunFullstackApp = <TServices extends BunFullstackServices>(
  meta: RuntimeImportMeta,
  start: StartApp<TServices>,
) => {
  if (meta.main) {
    void run(start, () => createBunFullstackServices(process.cwd()) as TServices);
  }
  return start;
};
