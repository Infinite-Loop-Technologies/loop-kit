import type { RecognizerDecision } from './recognizer.js';
import type { RawInput } from './rawInput.js';
export type ArenaProposal = {
    recognizerId: string;
    decision?: RecognizerDecision;
};
export type ArenaResolution = {
    winnerId?: string;
    capturedBy?: string;
    releasedCapture: boolean;
};
export declare class Arena {
    private capturedRecognizerId?;
    getCapturedRecognizerId(): string | undefined;
    clearCapture(): void;
    resolve(input: RawInput, proposals: readonly ArenaProposal[]): ArenaResolution;
}
export declare function chooseWinner(proposals: readonly ArenaProposal[]): ArenaProposal | undefined;
//# sourceMappingURL=arena.d.ts.map