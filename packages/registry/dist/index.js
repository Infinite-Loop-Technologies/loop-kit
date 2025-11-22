import { RegistryError, RegistryMissingEnvironmentVariablesError, RegistryNotFoundError, getRegistriesIndex, getRegistry, getRegistryItems, resolveRegistryItems, searchRegistries } from "shadcn/registries";

//#region src/shadcn-adapter.ts
async function searchRegistryItems(registries, options = {}) {
	const { items, pagination } = await searchRegistries(registries, options);
	return {
		items,
		total: pagination.total,
		offset: pagination.offset,
		limit: pagination.limit,
		hasMore: pagination.hasMore
	};
}

//#endregion
export { RegistryError, RegistryMissingEnvironmentVariablesError, RegistryNotFoundError, getRegistriesIndex, getRegistry, getRegistryItems, resolveRegistryItems, searchRegistryItems };