import type { NodeId } from '../types/ids.js';
import type { RawInput } from './rawInput.js';
export type HitTestResult = {
    nodeId?: NodeId;
    zoneId?: string;
    regionType: string;
    score?: number;
    data?: Record<string, unknown>;
};
export type HitTestProvider = {
    id: string;
    hitTest: (x: number, y: number, input: RawInput) => HitTestResult | undefined;
};
export declare function hitTestWithProviders(providers: readonly HitTestProvider[], x: number, y: number, input: RawInput): HitTestResult | undefined;
//# sourceMappingURL=hitTest.d.ts.map