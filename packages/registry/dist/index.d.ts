import { Config, RegistryError, RegistryMissingEnvironmentVariablesError, RegistryNotFoundError, getRegistriesIndex, getRegistry, getRegistryItems, resolveRegistryItems } from "shadcn/registries";

//#region src/shadcn-adapter.d.ts
type RegistryItem = {
  name: string;
  registry: string;
  addCommandArgument: string;
  type?: string;
  description?: string;
};
type SimpleRegistrySearchOptions = {
  query?: string;
  limit?: number;
  offset?: number;
  config?: Partial<Config>;
  useCache?: boolean;
};
declare function searchRegistryItems(registries: string[], options?: SimpleRegistrySearchOptions): Promise<{
  items: RegistryItem[];
  total: number;
  offset: number;
  limit: number;
  hasMore: boolean;
}>;
//#endregion
export { RegistryError, RegistryItem, RegistryMissingEnvironmentVariablesError, RegistryNotFoundError, SimpleRegistrySearchOptions, getRegistriesIndex, getRegistry, getRegistryItems, resolveRegistryItems, searchRegistryItems };