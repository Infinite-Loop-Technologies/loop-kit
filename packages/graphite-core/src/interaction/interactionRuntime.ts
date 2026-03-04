import type { GraphiteMetrics } from '../instrument/metrics.js';
import type { IntentSnapshotReader } from '../intent/intentStore.js';
import type { CommitMeta, CommitResult } from '../store/commit.js';
import type { Patch } from '../store/patch.js';
import type { ScopeId } from '../types/ids.js';
import type { StateView } from '../validate/validateEngine.js';
import { Arena, type ArenaProposal } from './arena.js';
import {
    hitTestWithProviders,
    type HitTestProvider,
    type HitTestResult,
} from './hitTest.js';
import {
    type Recognizer,
    type RecognizerCtx,
    type RecognizerDecision,
} from './recognizer.js';
import { isPointerInput, type RawInput } from './rawInput.js';

type RuntimeCommand =
    | { kind: 'pushOverlayPatch'; patch: Patch }
    | { kind: 'clearOverlay' }
    | { kind: 'commitIntentPatch'; patch: Patch; meta?: CommitMeta }
    | { kind: 'dispatchAction'; actionId: string; payload?: unknown }
    | { kind: 'setSessionState'; key: string; value: unknown }
    | { kind: 'clearSessionState'; key: string };

type Proposal = {
    recognizer: Recognizer;
    decision?: RecognizerDecision;
    commands: RuntimeCommand[];
};

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

export class InteractionRuntime {
    private readonly recognizers = new Map<string, Recognizer>();
    private readonly arena = new Arena();
    private readonly pointerCapture = new Map<number, string>();
    private readonly sessionState = new Map<string, unknown>();
    private hitTestProviders: HitTestProvider[] = [];
    private readonly metrics?: GraphiteMetrics;

    constructor(private readonly options: InteractionRuntimeOptions) {
        this.metrics = options.metrics;
    }

    registerRecognizer(recognizer: Recognizer): () => void {
        this.recognizers.set(recognizer.id, recognizer);

        return () => {
            this.recognizers.delete(recognizer.id);
            if (this.arena.getCapturedRecognizerId() === recognizer.id) {
                this.arena.clearCapture();
            }
        };
    }

    setHitTestProviders(providers: readonly HitTestProvider[]): void {
        this.hitTestProviders = [...providers];
    }

    handleInput(input: RawInput): void {
        const started = performance.now();
        const candidates = this.getCandidateRecognizers(input);

        if (candidates.length === 0) {
            return;
        }

        const proposals: Proposal[] = [];
        for (const recognizer of candidates) {
            const commands: RuntimeCommand[] = [];
            const ctx = this.createRecordingContext(commands, input);
            const decision = recognizer.onInput(input, ctx) ?? undefined;
            proposals.push({
                recognizer,
                decision,
                commands,
            });
        }

        const arenaProposals: ArenaProposal[] = proposals.map((proposal) => ({
            recognizerId: proposal.recognizer.id,
            decision: proposal.decision,
        }));

        const resolution = this.arena.resolve(input, arenaProposals);
        if (!resolution.winnerId) {
            this.releasePointerCaptureIfNeeded(input, resolution.releasedCapture);
            return;
        }

        const winner = proposals.find(
            (proposal) => proposal.recognizer.id === resolution.winnerId,
        );

        if (!winner) {
            this.releasePointerCaptureIfNeeded(input, true);
            return;
        }

        this.applyCommands(winner.commands);
        this.updateCaptureState(input, resolution.capturedBy, resolution.releasedCapture);
        this.metrics?.increment('recognizer.input');
        this.metrics?.onRecognizerTime(performance.now() - started);
    }

    getSessionState<T>(key: string): T | undefined {
        return this.sessionState.get(key) as T | undefined;
    }

    private getCandidateRecognizers(input: RawInput): Recognizer[] {
        if (isPointerInput(input)) {
            const captured = this.pointerCapture.get(input.pointerId) ?? this.arena.getCapturedRecognizerId();
            if (captured) {
                const recognizer = this.recognizers.get(captured);
                if (recognizer) {
                    return [recognizer];
                }
            }
        } else if (this.arena.getCapturedRecognizerId()) {
            const recognizer = this.recognizers.get(this.arena.getCapturedRecognizerId()!);
            if (recognizer) {
                return [recognizer];
            }
        }

        return Array.from(this.recognizers.values()).sort((lhs, rhs) =>
            lhs.id.localeCompare(rhs.id),
        );
    }

    private createRecordingContext(commands: RuntimeCommand[], input: RawInput): RecognizerCtx {
        const localState = new Map<string, unknown>();

        return {
            scopeId: this.options.scopeId,
            getStateView: () => this.options.getStateView(),
            getIntentSnapshot: () => this.options.getIntentSnapshot(),
            pushOverlayPatch: (patch) => {
                commands.push({ kind: 'pushOverlayPatch', patch });
            },
            clearOverlay: () => {
                commands.push({ kind: 'clearOverlay' });
            },
            commitIntentPatch: (patch, meta) => {
                commands.push({ kind: 'commitIntentPatch', patch, meta });
                return {
                    version: this.options.getIntentSnapshot().intentVersion,
                    touchedKeys: new Set<string>(),
                    patch: { ops: [] },
                    inversePatch: { ops: [] },
                    meta: meta ?? {},
                    timestamp: Date.now(),
                };
            },
            dispatchAction: (actionId, payload) => {
                commands.push({ kind: 'dispatchAction', actionId, payload });
            },
            hitTest: (x, y) => this.hitTest(x, y, input),
            getSessionState: <T>(key: string): T | undefined => {
                if (localState.has(key)) {
                    return localState.get(key) as T | undefined;
                }
                return this.sessionState.get(key) as T | undefined;
            },
            setSessionState: (key, value) => {
                localState.set(key, value);
                commands.push({ kind: 'setSessionState', key, value });
            },
            clearSessionState: (key) => {
                localState.delete(key);
                commands.push({ kind: 'clearSessionState', key });
            },
        };
    }

    private applyCommands(commands: readonly RuntimeCommand[]): void {
        for (const command of commands) {
            switch (command.kind) {
                case 'pushOverlayPatch': {
                    this.options.pushOverlayPatch(command.patch);
                    break;
                }
                case 'clearOverlay': {
                    this.options.clearOverlay();
                    break;
                }
                case 'commitIntentPatch': {
                    this.options.commitIntentPatch(command.patch, command.meta);
                    break;
                }
                case 'dispatchAction': {
                    this.options.dispatchAction?.(command.actionId, command.payload);
                    break;
                }
                case 'setSessionState': {
                    this.sessionState.set(command.key, command.value);
                    break;
                }
                case 'clearSessionState': {
                    this.sessionState.delete(command.key);
                    break;
                }
                default: {
                    assertNever(command);
                }
            }
        }
    }

    private hitTest(x: number, y: number, input: RawInput): HitTestResult | undefined {
        return hitTestWithProviders(this.hitTestProviders, x, y, input);
    }

    private updateCaptureState(
        input: RawInput,
        capturedBy: string | undefined,
        releasedCapture: boolean,
    ): void {
        if (!isPointerInput(input)) {
            return;
        }

        if (capturedBy) {
            this.pointerCapture.set(input.pointerId, capturedBy);
        }

        if (releasedCapture || input.kind === 'pointerup' || input.kind === 'pointercancel') {
            this.pointerCapture.delete(input.pointerId);
        }
    }

    private releasePointerCaptureIfNeeded(input: RawInput, releasedCapture: boolean): void {
        if (!isPointerInput(input)) {
            return;
        }

        if (releasedCapture || input.kind === 'pointerup' || input.kind === 'pointercancel') {
            this.pointerCapture.delete(input.pointerId);
        }
    }
}

function assertNever(value: never): never {
    throw new Error(`Unhandled runtime command: ${JSON.stringify(value)}`);
}
