/**
 * Internal session bookkeeping.
 *
 * Sessions are named runtime-owned flows such as drag or resize operations.
 * This helper keeps the runtime state explicit without over-generalizing.
 */

import { createStore, type Store } from "@loop-kit/common";

export interface SessionState {
  readonly activeSessions: Store<ReadonlyArray<string>>;
  readonly begin: (name: string) => void;
  readonly end: (name: string) => void;
}

export const createSessionState = (): SessionState => {
  const activeSessions = createStore<ReadonlyArray<string>>([]);

  return {
    activeSessions,
    begin: (name) => {
      activeSessions.update((sessions) =>
        sessions.includes(name) ? sessions : [...sessions, name],
      );
    },
    end: (name) => {
      activeSessions.update((sessions) => sessions.filter((value) => value !== name));
    },
  };
};
