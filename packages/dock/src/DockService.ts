/**
 * Headless dock service.
 *
 * The service owns committed dock state and command history. Runtime-driven
 * preview state stays out of this layer.
 */

import { createSignal, createStore, err, ok, type Service, type Signal, type Store } from "@loop-kit/common";
import { applyDockCommand, type DockCommand, type DockCommandError } from "./DockCommands.js";
import type { DockDropPlacement } from "./DockNode.js";
import type { DockState } from "./DockState.js";

export interface DockDomainEvent {
  readonly type: "DockCommandCommitted";
  readonly command: DockCommand;
  readonly state: DockState;
}

export interface DockService extends Service<DockState, DockDomainEvent> {
  readonly state: Store<DockState>;
  readonly events: Signal<DockDomainEvent>;
  readonly execute: (
    command: DockCommand,
  ) => ReturnType<typeof applyDockCommand>;
  readonly selectPanel: (
    panelId: Extract<DockCommand, { readonly type: "SelectPanel" }>["panelId"],
  ) => ReturnType<typeof applyDockCommand>;
  readonly focusPanel: (
    panelId: Extract<DockCommand, { readonly type: "FocusPanel" }>["panelId"],
  ) => ReturnType<typeof applyDockCommand>;
  readonly commitDrop: (
    panelId: Extract<DockCommand, { readonly type: "CommitDrop" }>["panelId"],
    placement: DockDropPlacement,
  ) => ReturnType<typeof applyDockCommand>;
  readonly resizeSplit: (
    splitId: Extract<DockCommand, { readonly type: "ResizeSplit" }>["splitId"],
    ratio: number,
  ) => ReturnType<typeof applyDockCommand>;
  readonly openModal: (
    modalId: Extract<DockCommand, { readonly type: "OpenModal" }>["modalId"],
  ) => ReturnType<typeof applyDockCommand>;
  readonly closeModal: (
    modalId: Extract<DockCommand, { readonly type: "CloseModal" }>["modalId"],
  ) => ReturnType<typeof applyDockCommand>;
  readonly undo: () => ReturnType<typeof ok<DockState>> | ReturnType<typeof err<never>>;
  readonly redo: () => ReturnType<typeof ok<DockState>> | ReturnType<typeof err<never>>;
}

export const createDockService = (initialState: DockState): DockService => {
  const state = createStore(initialState);
  const events = createSignal<DockDomainEvent>();

  const execute: DockService["execute"] = (command) => {
    const current = state.get();
    const result = applyDockCommand(current, command);
    if (!result.ok) return result;

    const nextState: DockState = {
      ...result.value,
      history: {
        past: [...current.history.past, current],
        future: [],
        commands: [...current.history.commands, command],
      },
    };

    state.set(nextState);
    events.emit({
      type: "DockCommandCommitted",
      command,
      state: nextState,
    });
    return ok(nextState);
  };

  return {
    state,
    events,
    execute,
    selectPanel: (panelId) => execute({ type: "SelectPanel", panelId }),
    focusPanel: (panelId) => execute({ type: "FocusPanel", panelId }),
    commitDrop: (panelId, placement) =>
      execute({ type: "CommitDrop", panelId, placement }),
    resizeSplit: (splitId, ratio) => execute({ type: "ResizeSplit", splitId, ratio }),
    openModal: (modalId) => execute({ type: "OpenModal", modalId }),
    closeModal: (modalId) => execute({ type: "CloseModal", modalId }),
    undo: () => {
      const current = state.get();
      const previous = current.history.past.at(-1);
      if (!previous) return ok(current);
      const nextState: DockState = {
        ...previous,
        history: {
          past: current.history.past.slice(0, -1),
          future: [current, ...current.history.future],
          commands: previous.history.commands,
        },
      };
      state.set(nextState);
      return ok(nextState);
    },
    redo: () => {
      const current = state.get();
      const next = current.history.future[0];
      if (!next) return ok(current);
      const nextState: DockState = {
        ...next,
        history: {
          past: [...current.history.past, current],
          future: current.history.future.slice(1),
          commands: next.history.commands,
        },
      };
      state.set(nextState);
      return ok(nextState);
    },
  };
};
