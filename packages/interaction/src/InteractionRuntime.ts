// This could probably be in @loop-kit/common, or it could be in some collection of runtimes or something.
import { Runtime, Ref } from "@loop-kit/common";
// So... this runtime would be general-purpose, useable by anyone - easy to install policies and things.

interface InteractionEnv {}

export interface InteractionRuntime extends Runtime<InteractionEnv> {
  // This is where we would have things like the current interaction state, and maybe some helper methods for working with it.
  // We could also have some helper methods for working with the interaction context, which would be passed to policies and things.
}

const createInteractionRuntime = () => {
  // It should hold lots of raw input state! And signals. Seriously!

  return {
    // We could have some default environment values here, if we wanted to.
  };
};

// Example code:
const interactionRuntime = createInteractionRuntime();

interface AppRuntime {}
