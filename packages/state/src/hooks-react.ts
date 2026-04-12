import * as React from 'react';
import type { Cursor, Initial, Pair, UseState } from './types.js';
import { injectUseCursor, injectUseUpdateState } from './hooks.js';

export * from './types.js';

export const useCursor = <T>(pair: Pair<T>, defaults?: T): Cursor<T> =>
    injectUseCursor(React.useMemo, React.useRef)(pair, defaults);

export const useUpdateState = <T>(initialState: Initial<T>, useStateHook?: UseState): Pair<T> =>
    injectUseUpdateState(React.useCallback, React.useMemo, React.useState)(initialState, useStateHook);
