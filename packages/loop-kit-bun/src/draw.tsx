import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createCliRenderer, TextAttributes } from '@opentui/core';
import { createRoot } from '@opentui/react';

/**
 * React version: OpenTUI owns rendering; we own input parsing.
 *
 * Controls:
 *  - d: toggle DRAW mode
 *  - Space: toggle ARM (deadman-ish)
 *  - e: toggle tool (INK / ERASE)
 *  - LMB: draw (when enabled)
 *  - RMB: erase (when enabled)
 *  - Wheel: brush radius +/- (1..8)
 *  - c: clear
 *  - q / Esc: quit
 */

type MouseKind = 'down' | 'up' | 'move' | 'wheel';
type MouseButton =
    | 'left'
    | 'middle'
    | 'right'
    | 'none'
    | 'wheelUp'
    | 'wheelDown';
type MouseEvent = {
    kind: MouseKind;
    button: MouseButton;
    x: number; // 1-based column
    y: number; // 1-based row
    shift: boolean;
    alt: boolean;
    ctrl: boolean;
    rawB: number;
};

function clamp(n: number, lo: number, hi: number) {
    return n < lo ? lo : n > hi ? hi : n;
}

function* linePoints(x0: number, y0: number, x1: number, y1: number) {
    let dx = Math.abs(x1 - x0);
    let sx = x0 < x1 ? 1 : -1;
    let dy = -Math.abs(y1 - y0);
    let sy = y0 < y1 ? 1 : -1;
    let err = dx + dy;

    while (true) {
        yield [x0, y0] as const;
        if (x0 === x1 && y0 === y1) break;
        const e2 = 2 * err;
        if (e2 >= dy) {
            err += dy;
            x0 += sx;
        }
        if (e2 <= dx) {
            err += dx;
            y0 += sy;
        }
    }
}

class SgrMouseParser {
    private buf = '';
    push(chunk: string): MouseEvent[] {
        this.buf += chunk;
        const out: MouseEvent[] = [];

        while (true) {
            const start = this.buf.indexOf('\x1b[<');
            if (start < 0) {
                if (this.buf.length > 4096) this.buf = this.buf.slice(-1024);
                break;
            }
            if (start > 0) this.buf = this.buf.slice(start);

            const mIdx = this.buf.search(/[Mm]/);
            if (mIdx < 0) break;

            const seq = this.buf.slice(0, mIdx + 1);
            this.buf = this.buf.slice(mIdx + 1);

            const match = /^\x1b\[<(\d+);(\d+);(\d+)([Mm])$/.exec(seq);
            if (!match) continue;

            const rawB = Number(match[1]);
            const x = Number(match[2]);
            const y = Number(match[3]);
            const suffix = match[4];

            const shift = (rawB & 4) !== 0;
            const alt = (rawB & 8) !== 0;
            const ctrl = (rawB & 16) !== 0;

            const isMotion = (rawB & 32) !== 0;
            const base = rawB & 3;
            const wheel = rawB & 64;

            let kind: MouseKind;
            if (wheel) kind = 'wheel';
            else if (suffix === 'm') kind = 'up';
            else if (isMotion) kind = 'move';
            else kind = 'down';

            let button: MouseButton = 'none';
            if (kind === 'wheel') button = base === 0 ? 'wheelUp' : 'wheelDown';
            else if (base === 0) button = 'left';
            else if (base === 1) button = 'middle';
            else if (base === 2) button = 'right';
            else button = 'none';

            out.push({ kind, button, x, y, shift, alt, ctrl, rawB });
        }

        return out;
    }
}

// --- Terminal toggles (escape codes) ---
function enableMouse() {
    process.stdout.write('\x1b[?1000h\x1b[?1002h\x1b[?1003h\x1b[?1006h');
}
function disableMouse() {
    process.stdout.write('\x1b[?1006l\x1b[?1003l\x1b[?1002l\x1b[?1000l');
}
function enterAltBuffer() {
    process.stdout.write('\x1b[?1049h');
}
function exitAltBuffer() {
    process.stdout.write('\x1b[?1049l');
}
function hideCursor() {
    process.stdout.write('\x1b[?25l');
}
function showCursor() {
    process.stdout.write('\x1b[?25h');
}

// --- Canvas model kept in a typed array for decent perf ---
function makeCanvas(w: number, h: number) {
    // store 0=space, 1=ink
    const data = new Uint8Array(w * h);
    return { w, h, data };
}
function idx(w: number, x: number, y: number) {
    return y * w + x;
}
function clearCanvas(c: ReturnType<typeof makeCanvas>) {
    c.data.fill(0);
}
function stampDisk(
    c: ReturnType<typeof makeCanvas>,
    cx: number,
    cy: number,
    r: number,
    ink: 0 | 1
) {
    const r2 = r * r;
    for (let dy = -r; dy <= r; dy++) {
        for (let dx = -r; dx <= r; dx++) {
            if (dx * dx + dy * dy > r2) continue;
            const x = cx + dx;
            const y = cy + dy;
            if (x < 0 || y < 0 || x >= c.w || y >= c.h) continue;
            c.data[idx(c.w, x, y)] = ink;
        }
    }
}

type Tool = 'ink' | 'erase';

function useTerminalInput(handlers: {
    onKeyChar: (ch: string) => void;
    onMouse: (ev: MouseEvent) => void;
}) {
    useEffect(() => {
        const stdin = process.stdin;
        const parser = new SgrMouseParser();

        stdin.setRawMode?.(true);
        stdin.resume();
        stdin.setEncoding('utf8');

        enterAltBuffer();
        hideCursor();
        enableMouse();

        const onData = (chunk: string) => {
            // 1) Mouse first (consumes escape sequences internally)
            const events = parser.push(chunk);
            for (const ev of events) handlers.onMouse(ev);

            // 2) Keys: ignore escape sequences (arrow keys, mouse seqs, etc),
            //    but still allow a bare ESC keypress to quit.
            if (chunk === '\x1b') {
                handlers.onKeyChar('\x1b');
                return;
            }
            if (chunk.startsWith('\x1b')) {
                // It’s some escape sequence (mouse, arrows, etc) — ignore as "keys"
                return;
            }

            // Normal keys may come in batches, e.g. "cd"
            for (const ch of chunk) handlers.onKeyChar(ch);
        };

        stdin.on('data', onData);

        const cleanup = () => {
            stdin.off('data', onData);
            disableMouse();
            try {
                stdin.setRawMode?.(false);
            } catch {}
            stdin.pause();
            showCursor();
            exitAltBuffer();
        };

        process.on('exit', cleanup);
        process.on('SIGINT', () => process.exit(0));
        process.on('SIGTERM', () => process.exit(0));

        return cleanup;
    }, [handlers]);
}

function CanvasApp() {
    const termW = process.stdout.columns ?? 80;
    const termH = process.stdout.rows ?? 24;

    // status bar at bottom
    const w = Math.max(20, termW);
    const h = Math.max(10, termH - 1);

    // canvas stored in a ref so we can mutate without re-allocating
    const canvasRef = useRef(makeCanvas(w, h));
    if (canvasRef.current.w !== w || canvasRef.current.h !== h) {
        // basic resize behavior: recreate (could preserve later)
        canvasRef.current = makeCanvas(w, h);
    }

    // react state (small + meaningful)
    const [drawMode, setDrawMode] = useState(false); // toggled mode
    const [armed, setArmed] = useState(false); // space toggle
    const [tool, setTool] = useState<Tool>('ink');
    const [radius, setRadius] = useState(1);
    const [cursor, setCursor] = useState<{
        x: number;
        y: number;
        has: boolean;
    }>({
        x: 0,
        y: 0,
        has: false,
    });
    const [tick, setTick] = useState(0); // forces re-render when canvas mutated

    // stroke state (ref: not render-driving)
    const strokeRef = useRef<{
        isDown: boolean;
        captured: boolean; // critical: only draw if started while enabled
        lastX: number;
        lastY: number;
        button: MouseButton;
    }>({ isDown: false, captured: false, lastX: 0, lastY: 0, button: 'none' });

    const enabled = drawMode || armed;

    useTerminalInput({
        onKeyChar: (ch) => {
            if (ch === 'q' || ch === '\x1b') process.exit(0);
            if (ch === 'c') {
                clearCanvas(canvasRef.current);
                setTick((t) => t + 1);
                return;
            }
            if (ch === 'd') {
                setDrawMode((v) => !v);
                // if disabling and not armed, cancel stroke capture
                if (enabled && !armed) {
                    strokeRef.current.isDown = false;
                    strokeRef.current.captured = false;
                }
                return;
            }
            if (ch === 'e') {
                setTool((t) => (t === 'ink' ? 'erase' : 'ink'));
                return;
            }
            if (ch === ' ') {
                setArmed((v) => !v);
                if (enabled && !drawMode) {
                    strokeRef.current.isDown = false;
                    strokeRef.current.captured = false;
                }
                return;
            }
        },

        onMouse: (ev) => {
            const c = canvasRef.current;
            const x = clamp(ev.x - 1, 0, c.w - 1);
            const y = clamp(ev.y - 1, 0, c.h - 1);
            setCursor({ x, y, has: true });

            if (ev.kind === 'wheel') {
                setRadius((r) =>
                    clamp(r + (ev.button === 'wheelUp' ? 1 : -1), 1, 8)
                );
                return;
            }

            const stroke = strokeRef.current;

            const applyAt = (px: number, py: number, ink: 0 | 1) => {
                stampDisk(c, px, py, radius, ink);
            };

            // Decide drawing buttons:
            // - RMB draws ink
            // - MMB erases (or swap if you prefer)
            const isDrawButton = (b: MouseButton) =>
                b === 'right' || b === 'middle';

            const inkForButton = (b: MouseButton): 0 | 1 => {
                if (b === 'middle') return 0; // erase
                return 1; // right = ink
            };

            if (ev.kind === 'down') {
                // Ignore left click entirely (lets VS Code selection do its thing)
                if (!isDrawButton(ev.button)) return;

                stroke.isDown = true;
                stroke.captured = true; // capture only when starting with RMB/MMB
                stroke.lastX = x;
                stroke.lastY = y;
                stroke.button = ev.button;

                applyAt(x, y, inkForButton(ev.button));
                setTick((t) => t + 1);
                return;
            }

            if (ev.kind === 'move') {
                if (!stroke.isDown || !stroke.captured) return;

                const ink = inkForButton(stroke.button);
                for (const [px, py] of linePoints(
                    stroke.lastX,
                    stroke.lastY,
                    x,
                    y
                )) {
                    applyAt(px, py, ink);
                }
                stroke.lastX = x;
                stroke.lastY = y;
                setTick((t) => t + 1);
                return;
            }

            if (ev.kind === 'up') {
                // Only end if we were drawing; otherwise ignore.
                stroke.isDown = false;
                stroke.captured = false;
                stroke.button = 'none';
                return;
            }
        },
    });

    const status = useMemo(() => {
        const mode = drawMode ? 'DRAW' : 'NAV ';
        const arm = armed ? 'ARMED' : '---- ';
        const t = tool.toUpperCase().padEnd(5, ' ');
        const r = String(radius).padStart(2, ' ');
        const hint = enabled
            ? 'RMB draw, MMB erase'
            : 'd: DRAW mode, Space: ARM';
        return `MODE:${mode}  ARM:${arm}  TOOL:${t}  BRUSH:${r}  |  ${hint}  |  e tool, c clear, q quit`;
    }, [drawMode, armed, tool, radius, enabled]);

    const canvasText = useMemo(() => {
        // Build a single string from Uint8Array + overlay cursor.
        const c = canvasRef.current;
        const inkChar = '█';
        const emptyChar = ' ';
        const overlayOn = cursor.has;
        const overlayChar = enabled ? '·' : '░';

        const lines: string[] = [];
        for (let y = 0; y < c.h; y++) {
            let row = '';
            const base = y * c.w;
            for (let x = 0; x < c.w; x++) {
                const isCursor = overlayOn && x === cursor.x && y === cursor.y;
                if (isCursor) row += overlayChar;
                else row += c.data[base + x] ? inkChar : emptyChar;
            }
            lines.push(row);
        }
        return lines.join('\n');
        // tick included to rebuild when canvas mutated
    }, [tick, cursor, enabled]);

    return (
        <box flexDirection='column' flexGrow={1}>
            <text>{canvasText}</text>
            <text attributes={TextAttributes.DIM}>{status}</text>
        </box>
    );
}

async function main() {
    const renderer = await createCliRenderer();
    createRoot(renderer).render(<CanvasApp />);
}

main().catch((err) => {
    disableMouse();
    showCursor();
    exitAltBuffer();
    console.error(err);
    process.exit(1);
});
