export class ValidatorRegistry {
    validators = new Map();
    register(facetName, validator) {
        this.validators.set(facetName, validator);
    }
    unregister(facetName) {
        this.validators.delete(facetName);
    }
    get(facetName) {
        return this.validators.get(facetName);
    }
    has(facetName) {
        return this.validators.has(facetName);
    }
    listFacetNames() {
        return Array.from(this.validators.keys());
    }
    entries() {
        return Array.from(this.validators.entries());
    }
}
//# sourceMappingURL=validatorRegistry.js.map