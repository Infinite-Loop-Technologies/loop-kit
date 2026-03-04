import type { GraphiteMetrics } from '../instrument/metrics.js';
import type { IntentSnapshotReader } from '../intent/intentStore.js';
import type { CommitMeta, CommitResult } from '../store/commit.js';
import type { Patch } from '../store/patch.js';
import type { ScopeId } from '../types/ids.js';
import type { StateView } from '../validate/validateEngine.js';
import { type HitTestProvider } from './hitTest.js';
import { type Recognizer } from './recognizer.js';
import { type RawInput } from './rawInput.js';
export type InteractionRuntimeOptions = {
    scopeId: ScopeId;
    getStateView: () => StateView;
    getIntentSnapshot: () => IntentSnapshotReader;
    pushOverlayPatch: (patch: Patch) => void;
    clearOverlay: () => void;
    commitIntentPatch: (patch: Patch, meta?: CommitMeta) => CommitResult;
    dispatchAction?: (actionId: string, payload?: unknown) => void;
    metrics?: GraphiteMetrics;
};
export declare class InteractionRuntime {
    private readonly options;
    private readonly recognizers;
    private readonly arena;
    private readonly pointerCapture;
    private readonly sessionState;
    private hitTestProviders;
    private readonly metrics?;
    constructor(options: InteractionRuntimeOptions);
    registerRecognizer(recognizer: Recognizer): () => void;
    setHitTestProviders(providers: readonly HitTestProvider[]): void;
    handleInput(input: RawInput): void;
    getSessionState<T>(key: string): T | undefined;
    private getCandidateRecognizers;
    private createRecordingContext;
    private applyCommands;
    private hitTest;
    private updateCaptureState;
    private releasePointerCaptureIfNeeded;
}
//# sourceMappingURL=interactionRuntime.d.ts.map