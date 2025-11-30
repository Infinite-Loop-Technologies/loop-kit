// Deps: @discordjs/opus and ffmpeg-static.

import {
    VoiceConnection,
    EndBehaviorType,
    createAudioPlayer,
    createAudioResource,
    StreamType,
} from '@discordjs/voice';
import { Room, LocalAudioTrack } from 'livekit-client';
import { NodeAudioSink, NodeAudioSource } from '@livekit/rtc-node';
import prism from 'prism-media';
import { Readable } from 'node:stream';

type BridgeOpts = {
    room: Room; // reuse ctx.room from your Agent
    connection: VoiceConnection; // existing Discord voice connection
    agentIdentity?: string; // participant identity to listen to (default: 'agent')
};

export function wireDiscordBridge({
    room,
    connection,
    agentIdentity = 'agent',
}: BridgeOpts) {
    // ---------- Discord -> LiveKit (per user) ----------
    const receiver = connection.receiver;
    const sources = new Map<string, NodeAudioSource>();
    const tracks = new Map<string, LocalAudioTrack>();

    async function ensureTrack(userId: string) {
        if (tracks.has(userId)) return;
        const src = new NodeAudioSource({ sampleRate: 48000, numChannels: 1 });
        const track = LocalAudioTrack.createAudioTrack(`discord-${userId}`, {
            source: src,
        });
        await room.localParticipant.publishTrack(track, { dtx: true });
        sources.set(userId, src);
        tracks.set(userId, track);
    }

    receiver.speaking.on('start', async (userId) => {
        const opus = receiver.subscribe(userId, {
            end: { behavior: EndBehaviorType.AfterSilence, duration: 400 },
        });
        // Opus decode → PCM s16le 48k stereo → downmix to mono
        const pcm = opus
            .pipe(
                new prism.opus.Decoder({
                    channels: 2,
                    rate: 48000,
                    frameSize: 960,
                })
            ) // ~20ms
            .pipe(new prism.StereoDownmix());

        let carry = Buffer.alloc(0);
        const frameBytes = 480 /*samples*/ * 2; /*bytes*/ // 10ms mono

        pcm.on('data', async (buf: Buffer) => {
            await ensureTrack(userId);
            carry = Buffer.concat([carry, buf]);
            while (carry.length >= frameBytes) {
                const chunk = carry.subarray(0, frameBytes);
                carry = carry.subarray(frameBytes);
                const src = sources.get(userId);
                if (src)
                    src.onData(
                        new Int16Array(
                            chunk.buffer,
                            chunk.byteOffset,
                            chunk.byteLength / 2
                        ),
                        48000,
                        1
                    );
            }
        });

        pcm.once('end', () => {
            // optional: unpublish after long silence to reduce track churn
        });
    });

    // ---------- LiveKit (agent TTS) -> Discord ----------
    const player = createAudioPlayer();
    connection.subscribe(player); // pipeline into channel

    room.on('trackSubscribed', (track, pub, participant) => {
        if (track.kind !== 'audio') return;
        if (participant.identity !== agentIdentity) return;

        const sink = new NodeAudioSink(track);
        const raw = new Readable({ read() {} });

        sink.on('data', (f) => {
            // Float32 → Int16 (Discord raw PCM)
            const f32 = f.samples;
            const i16 = new Int16Array(f32.length);
            for (let i = 0; i < f32.length; i++) {
                const s = Math.max(-1, Math.min(1, f32[i]));
                i16[i] = (s * 0x7fff) | 0;
            }
            raw.push(Buffer.from(i16.buffer));
        });
        sink.on('end', () => raw.push(null));

        const resource = createAudioResource(raw, {
            inputType: StreamType.Raw,
            inlineVolume: true,
        });
        resource.volume?.setVolume(0.9);
        player.play(resource);
    });

    return {
        close: () => {
            for (const t of tracks.values())
                try {
                    t.stop();
                } catch {}
            sources.clear();
            tracks.clear();
            try {
                player.stop(true);
            } catch {}
        },
    };
}
