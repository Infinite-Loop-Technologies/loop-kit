/**
 * # Bun host:
 * It needs to start by having the ability to hold a loop-kit node graph model, which includes snapshots, artifacts, and more.
 * It does this by running Derivations and Materializations. Derivations and Materializations are handled by the runtime, sort of - for now.
 * The core of that model is a CAS (Content Addressable Storage)
 * I'll write a simple one.
 */

// CAS
// hash(blob) = sha256(blob);
// store blobs at .loop/cas/sha256/ab/cd/<fullhash>
// NOTE: Get paid to implement this via DA. CAS with tests.
// And then, the ability to resolve & run components from that CAS! Or nodes actually - and a node can maybe be a Component, or an Action can.. ?

/**
 * Create a dependency graph system that can run nodes in the correct order.
 *
 */
