import type { IntentSnapshotReader } from '../intent/intentStore.js';
import type { Patch } from '../store/patch.js';
import type { CommitMeta, CommitResult } from '../store/commit.js';
import type { ScopeId } from '../types/ids.js';
import type { StateView } from '../validate/validateEngine.js';
import type { HitTestResult } from './hitTest.js';
import type { RawInput } from './rawInput.js';

export type ActionDispatch = {
    actionId: string;
    payload?: unknown;
};

export type RecognizerDecision = {
    proposeScore?: number;
    capture?: boolean;
    releaseCapture?: boolean;
};

export type RecognizerCtx = {
    scopeId: ScopeId;
    getStateView(): StateView;
    getIntentSnapshot(): IntentSnapshotReader;
    pushOverlayPatch(patch: Patch): void;
    clearOverlay(): void;
    commitIntentPatch(patch: Patch, meta?: CommitMeta): CommitResult;
    dispatchAction(actionId: string, payload?: unknown): void;
    hitTest(x: number, y: number, input: RawInput): HitTestResult | undefined;
    getSessionState<T>(key: string): T | undefined;
    setSessionState<T>(key: string, value: T): void;
    clearSessionState(key: string): void;
};

export type Recognizer = {
    id: string;
    onInput: (input: RawInput, ctx: RecognizerCtx) => RecognizerDecision | void;
};
