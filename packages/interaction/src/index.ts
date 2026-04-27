/**
 * Public headless export for @loop-kit/interaction.
 *
 * This entrypoint exports the generic interaction runtime, target contracts,
 * state, signals, and installers. React bindings live behind
 * `@loop-kit/interaction/react` and are not imported here.
 *
 * @module
 */

export * from "./InteractionGeometry.js"
export * from "./InteractionInstallers.js"
export * from "./InteractionRoles.js"
export * from "./InteractionRuntime.js"
export * from "./InteractionSignals.js"
export * from "./InteractionState.js"
export * from "./InteractionTarget.js"
export * from "./installDomBridge.js"
export * from "./installKeyboardSignalSynthesis.js"
export * from "./installPointerSignalSynthesis.js"
