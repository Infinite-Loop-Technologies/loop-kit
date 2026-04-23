/**
 * Policy contracts for the interaction runtime.
 */

import type { Installer } from "@loop-kit/common";
import type { InteractionRuntime } from "./Runtime.js";

export type InteractionPolicy<T = void> = Installer<InteractionRuntime["env"], T>;
