import type {
    Provider,
    CapabilityRequest,
    CapabilityResponse,
} from '../../runtime/provider';
import { ProviderTier } from '../../runtime/tiers';
import { capId } from '../../runtime/ids';

export const CAP_EVENTS = capId('loop', 'core', '0.1.0', 'events');

type Topic = string;
type SubId = string;

export class JsEventsProvider implements Provider {
    readonly tier = ProviderTier.JS;
    readonly capabilities = [CAP_EVENTS] as const;

    private nextId = 1;
    private queues = new Map<SubId, unknown[]>();
    private subsByTopic = new Map<Topic, Set<SubId>>();

    constructor(public readonly id: string = 'js-events') {}

    async init() {}

    async handle(req: CapabilityRequest): Promise<CapabilityResponse> {
        if (req.capability !== CAP_EVENTS)
            return { ok: false, error: 'Unsupported capability' };

        const p = req.payload as any;
        const op = String(p?.op ?? '');

        if (op === 'subscribe') {
            const topic = String(p?.topic ?? '');
            const subId = `sub-${this.nextId++}`;
            this.queues.set(subId, []);
            let set = this.subsByTopic.get(topic);
            if (!set) this.subsByTopic.set(topic, (set = new Set()));
            set.add(subId);
            return { ok: true, value: { subId } };
        }

        if (op === 'emit') {
            const topic = String(p?.topic ?? '');
            const payload = p?.payload;
            const set = this.subsByTopic.get(topic);
            if (set) {
                for (const subId of set) {
                    this.queues.get(subId)?.push(payload);
                }
            }
            return { ok: true, value: null };
        }

        if (op === 'drain') {
            const subId = String(p?.subId ?? '');
            const q = this.queues.get(subId);
            if (!q) return { ok: false, error: `Unknown subId: ${subId}` };
            this.queues.set(subId, []);
            return { ok: true, value: { events: q } };
        }

        if (op === 'unsubscribe') {
            const subId = String(p?.subId ?? '');
            this.queues.delete(subId);
            for (const set of this.subsByTopic.values()) set.delete(subId);
            return { ok: true, value: null };
        }

        return { ok: false, error: `Unknown op: ${op}` };
    }

    async dispose() {
        this.queues.clear();
        this.subsByTopic.clear();
    }
}
