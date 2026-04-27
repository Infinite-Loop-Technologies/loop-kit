/**
 * Small installer composition helpers for common interaction wiring.
 *
 * The core runtime installs nothing automatically. Composition roots can use
 * these helpers when they want the default DOM + pointer + keyboard vertical
 * slice.
 *
 * @module
 */

import type { Installer } from "@loop-kit/common/Runtime"

import type { InteractionEnv } from "./InteractionRuntime.js"
import { installDomBridge } from "./installDomBridge.js"
import { installKeyboardSignalSynthesis } from "./installKeyboardSignalSynthesis.js"
import {
  type PointerSignalSynthesisOptions,
  installPointerSignalSynthesis,
} from "./installPointerSignalSynthesis.js"

export interface InteractionDefaultInstallersOptions {
  readonly pointer?: PointerSignalSynthesisOptions | undefined
}

export const createInteractionDefaultInstallers = (
  root: EventTarget,
  options: InteractionDefaultInstallersOptions = {}
): ReadonlyArray<Installer<InteractionEnv>> => [
  installDomBridge(root),
  installPointerSignalSynthesis(options.pointer),
  installKeyboardSignalSynthesis(),
]
