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

export class Arena {
    private capturedRecognizerId?: string;

    getCapturedRecognizerId(): string | undefined {
        return this.capturedRecognizerId;
    }

    clearCapture(): void {
        this.capturedRecognizerId = undefined;
    }

    resolve(input: RawInput, proposals: readonly ArenaProposal[]): ArenaResolution {
        if (this.capturedRecognizerId) {
            const winner =
                proposals.find((proposal) => proposal.recognizerId === this.capturedRecognizerId) ??
                proposals[0];

            if (!winner) {
                this.capturedRecognizerId = undefined;
                return {
                    releasedCapture: true,
                };
            }

            const releaseCapture =
                winner.decision?.releaseCapture === true ||
                input.kind === 'pointerup' ||
                input.kind === 'pointercancel';

            if (releaseCapture) {
                this.capturedRecognizerId = undefined;
            }

            return {
                winnerId: winner.recognizerId,
                capturedBy: this.capturedRecognizerId,
                releasedCapture: releaseCapture,
            };
        }

        const winner = chooseWinner(proposals);
        if (!winner) {
            return {
                releasedCapture: false,
            };
        }

        if (winner.decision?.capture) {
            this.capturedRecognizerId = winner.recognizerId;
        }

        return {
            winnerId: winner.recognizerId,
            capturedBy: this.capturedRecognizerId,
            releasedCapture: false,
        };
    }
}

export function chooseWinner(
    proposals: readonly ArenaProposal[],
): ArenaProposal | undefined {
    const scored = proposals
        .map((proposal) => ({
            proposal,
            score: scoreProposal(proposal),
        }))
        .filter((candidate) => candidate.score > Number.NEGATIVE_INFINITY)
        .sort((lhs, rhs) => {
            if (lhs.score !== rhs.score) {
                return rhs.score - lhs.score;
            }

            return lhs.proposal.recognizerId.localeCompare(rhs.proposal.recognizerId);
        });

    return scored[0]?.proposal;
}

function scoreProposal(proposal: ArenaProposal): number {
    const decision = proposal.decision;
    if (!decision) {
        return Number.NEGATIVE_INFINITY;
    }

    if (typeof decision.proposeScore === 'number') {
        return decision.proposeScore;
    }

    if (decision.capture) {
        return 1;
    }

    return 0;
}
