import {
  createBunFullstackServices,
  createBunServerServices,
  type BunFullstackServices,
  type BunServerServices,
} from "./services";
import type { VoltEntrypoint } from "../../contracts";

type StartApp<TServices, TResult = void> = (services: TServices) => Promise<TResult> | TResult;
type RuntimeImportMeta = ImportMeta & { main?: boolean };

export const resolveVoltRuntimeRootDir = () =>
  process.env.VOLT_ROOT_DIR?.trim() || process.cwd();

const run = async <TServices, TResult>(
  start: StartApp<TServices, TResult>,
  createServices: () => Promise<TServices> | TServices,
) => {
  try {
    return await start(await createServices());
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

export const runVoltEntrypoint = <TServices, TResult>(
  entrypoint: VoltEntrypoint<TServices, TResult>,
  createServices: () => Promise<TServices> | TServices,
) => run(entrypoint.handler, createServices);

export const loadVoltRuntimeInputs = async <TServices extends object>(
  path: string | undefined,
): Promise<TServices> => {
  if (!path) {
    return {} as TServices;
  }

  return Bun.file(path).json() as Promise<TServices>;
};

export const combineVoltRuntimeInputs = <TServices extends object>(
  _entrypoint: VoltEntrypoint<TServices, unknown>,
  base: object,
  provided: object,
): TServices => ({
  ...base,
  ...provided,
}) as TServices;

export const loadVoltProvidedServices = loadVoltRuntimeInputs;
export const combineVoltServices = combineVoltRuntimeInputs;

export const bunServerApp = <TServices extends BunServerServices>(
  meta: RuntimeImportMeta,
  start: StartApp<TServices>,
) => {
  if (meta.main) {
    void run(start, () => createBunServerServices(resolveVoltRuntimeRootDir()) as TServices);
  }
  return start;
};

export const bunFullstackApp = <TServices extends BunFullstackServices>(
  meta: RuntimeImportMeta,
  start: StartApp<TServices>,
) => {
  if (meta.main) {
    void run(start, () =>
      createBunFullstackServices(resolveVoltRuntimeRootDir()) as TServices);
  }
  return start;
};
