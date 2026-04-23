/**
 * Lightweight headless service conventions.
 *
 * A service owns committed domain state and exposes commands. Services may also
 * emit domain events, but they should not own runtime orchestration, UI event
 * timing, or platform lifecycles.
 */

import type { Result } from "./Result.js";
import type { Signal } from "./Signal.js";
import type { Store } from "./Store.js";

export interface Service<TState, TEvent = never> {
  readonly state: Store<TState>;
  readonly events?: Signal<TEvent> | undefined;
}

export type ServiceCommand<TOk = void, TErr = never> = Result<TOk, TErr>;
