export function hitTestWithProviders(providers, x, y, input) {
    for (const provider of providers) {
        const result = provider.hitTest(x, y, input);
        if (result) {
            return result;
        }
    }
    return undefined;
}
//# sourceMappingURL=hitTest.js.map