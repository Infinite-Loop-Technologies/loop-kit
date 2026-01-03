export enum ProviderTier {
    /**
     * In-process JS.
     * - Fast to write
     * - Zero isolation
     * - Not portable
     */
    JS = 'js',

    /**
     * Native in-process code (DLL/.so/.dylib via FFI).
     * - OS access
     * - Can crash host
     * - Platform-specific
     */
    Native = 'native',

    /**
     * WASM Component Model (WIT-defined).
     * - Portable + sandboxed
     * - Ideal default for users
     */
    Wasm = 'wasm',

    /**
     * Out-of-process provider (IPC / wRPC).
     * - Crash-isolated
     * - Can be remote
     * - Good for non-WASM workloads too
     */
    Process = 'process',
}
