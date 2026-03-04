import { Arena } from './arena.js';
import { hitTestWithProviders, } from './hitTest.js';
import { isPointerInput } from './rawInput.js';
export class InteractionRuntime {
    options;
    recognizers = new Map();
    arena = new Arena();
    pointerCapture = new Map();
    sessionState = new Map();
    hitTestProviders = [];
    metrics;
    constructor(options) {
        this.options = options;
        this.metrics = options.metrics;
    }
    registerRecognizer(recognizer) {
        this.recognizers.set(recognizer.id, recognizer);
        return () => {
            this.recognizers.delete(recognizer.id);
            if (this.arena.getCapturedRecognizerId() === recognizer.id) {
                this.arena.clearCapture();
            }
        };
    }
    setHitTestProviders(providers) {
        this.hitTestProviders = [...providers];
    }
    handleInput(input) {
        const started = performance.now();
        const candidates = this.getCandidateRecognizers(input);
        if (candidates.length === 0) {
            return;
        }
        const proposals = [];
        for (const recognizer of candidates) {
            const commands = [];
            const ctx = this.createRecordingContext(commands, input);
            const decision = recognizer.onInput(input, ctx) ?? undefined;
            proposals.push({
                recognizer,
                decision,
                commands,
            });
        }
        const arenaProposals = proposals.map((proposal) => ({
            recognizerId: proposal.recognizer.id,
            decision: proposal.decision,
        }));
        const resolution = this.arena.resolve(input, arenaProposals);
        if (!resolution.winnerId) {
            this.releasePointerCaptureIfNeeded(input, resolution.releasedCapture);
            return;
        }
        const winner = proposals.find((proposal) => proposal.recognizer.id === resolution.winnerId);
        if (!winner) {
            this.releasePointerCaptureIfNeeded(input, true);
            return;
        }
        this.applyCommands(winner.commands);
        this.updateCaptureState(input, resolution.capturedBy, resolution.releasedCapture);
        this.metrics?.increment('recognizer.input');
        this.metrics?.onRecognizerTime(performance.now() - started);
    }
    getSessionState(key) {
        return this.sessionState.get(key);
    }
    getCandidateRecognizers(input) {
        if (isPointerInput(input)) {
            const captured = this.pointerCapture.get(input.pointerId) ?? this.arena.getCapturedRecognizerId();
            if (captured) {
                const recognizer = this.recognizers.get(captured);
                if (recognizer) {
                    return [recognizer];
                }
            }
        }
        else if (this.arena.getCapturedRecognizerId()) {
            const recognizer = this.recognizers.get(this.arena.getCapturedRecognizerId());
            if (recognizer) {
                return [recognizer];
            }
        }
        return Array.from(this.recognizers.values()).sort((lhs, rhs) => lhs.id.localeCompare(rhs.id));
    }
    createRecordingContext(commands, input) {
        const localState = new Map();
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
                    touchedKeys: new Set(),
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
            getSessionState: (key) => {
                if (localState.has(key)) {
                    return localState.get(key);
                }
                return this.sessionState.get(key);
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
    applyCommands(commands) {
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
    hitTest(x, y, input) {
        return hitTestWithProviders(this.hitTestProviders, x, y, input);
    }
    updateCaptureState(input, capturedBy, releasedCapture) {
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
    releasePointerCaptureIfNeeded(input, releasedCapture) {
        if (!isPointerInput(input)) {
            return;
        }
        if (releasedCapture || input.kind === 'pointerup' || input.kind === 'pointercancel') {
            this.pointerCapture.delete(input.pointerId);
        }
    }
}
function assertNever(value) {
    throw new Error(`Unhandled runtime command: ${JSON.stringify(value)}`);
}
//# sourceMappingURL=interactionRuntime.js.map