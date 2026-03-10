'use client';

import * as React from 'react';

function rgbChannelToHex(value: number): string {
    return value.toString(16).padStart(2, '0');
}

function rgbStringToHex(value: string): string | null {
    const match = value.match(
        /rgba?\(\s*([+-]?\d+(\.\d+)?)\s*[, ]\s*([+-]?\d+(\.\d+)?)\s*[, ]\s*([+-]?\d+(\.\d+)?)/i,
    );
    if (!match) {
        return null;
    }
    const r = Math.max(0, Math.min(255, Math.round(Number(match[1]))));
    const g = Math.max(0, Math.min(255, Math.round(Number(match[3]))));
    const b = Math.max(0, Math.min(255, Math.round(Number(match[5]))));
    return `#${rgbChannelToHex(r)}${rgbChannelToHex(g)}${rgbChannelToHex(b)}`;
}

function normalizeHex(value: string): string | null {
    const normalized = value.trim().toLowerCase();
    if (/^#[0-9a-f]{6}$/i.test(normalized)) {
        return normalized;
    }
    if (/^#[0-9a-f]{3}$/i.test(normalized)) {
        const r = normalized[1];
        const g = normalized[2];
        const b = normalized[3];
        return `#${r}${r}${g}${g}${b}${b}`;
    }
    return null;
}

function srgbChannelToHex(channel: number): string {
    return rgbChannelToHex(Math.round(Math.max(0, Math.min(1, channel)) * 255));
}

function linearToSrgb(channel: number): number {
    if (channel <= 0) return 0;
    if (channel >= 1) return 1;
    if (channel <= 0.0031308) return 12.92 * channel;
    return 1.055 * Math.pow(channel, 1 / 2.4) - 0.055;
}

function parseHue(value: string): number | null {
    const trimmed = value.trim().toLowerCase();
    if (!trimmed) return null;
    if (trimmed.endsWith('deg')) {
        const numeric = Number(trimmed.slice(0, -3));
        return Number.isFinite(numeric) ? numeric : null;
    }
    if (trimmed.endsWith('turn')) {
        const numeric = Number(trimmed.slice(0, -4));
        return Number.isFinite(numeric) ? numeric * 360 : null;
    }
    if (trimmed.endsWith('rad')) {
        const numeric = Number(trimmed.slice(0, -3));
        return Number.isFinite(numeric) ? (numeric * 180) / Math.PI : null;
    }
    const numeric = Number(trimmed);
    return Number.isFinite(numeric) ? numeric : null;
}

function parsePercentOrUnit(value: string): number | null {
    const trimmed = value.trim().toLowerCase();
    if (!trimmed) return null;
    if (trimmed.endsWith('%')) {
        const numeric = Number(trimmed.slice(0, -1));
        if (!Number.isFinite(numeric)) return null;
        return numeric / 100;
    }
    const numeric = Number(trimmed);
    return Number.isFinite(numeric) ? numeric : null;
}

function parseFunctionalColor(
    value: string,
    fnName: 'oklch' | 'oklab',
): string[] | null {
    const trimmed = value.trim();
    const prefix = `${fnName}(`;
    if (!trimmed.toLowerCase().startsWith(prefix) || !trimmed.endsWith(')')) {
        return null;
    }
    const content = trimmed.slice(prefix.length, -1).trim();
    if (!content) return null;
    const noAlpha = content.split('/')[0]?.trim() ?? '';
    if (!noAlpha) return null;
    const parts = noAlpha.split(/\s+/).filter(Boolean);
    if (fnName === 'oklch' && parts.length !== 3) return null;
    if (fnName === 'oklab' && parts.length !== 3) return null;
    return parts;
}

function oklabToHex(l: number, a: number, b: number): string {
    const lPrime = l + 0.3963377774 * a + 0.2158037573 * b;
    const mPrime = l - 0.1055613458 * a - 0.0638541728 * b;
    const sPrime = l - 0.0894841775 * a - 1.291485548 * b;

    const l3 = lPrime * lPrime * lPrime;
    const m3 = mPrime * mPrime * mPrime;
    const s3 = sPrime * sPrime * sPrime;

    const linearR = 4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3;
    const linearG = -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3;
    const linearB = -0.0041960863 * l3 - 0.7034186147 * m3 + 1.707614701 * s3;

    const r = linearToSrgb(linearR);
    const g = linearToSrgb(linearG);
    const blue = linearToSrgb(linearB);
    return `#${srgbChannelToHex(r)}${srgbChannelToHex(g)}${srgbChannelToHex(blue)}`;
}

function oklchStringToHex(value: string): string | null {
    const parts = parseFunctionalColor(value, 'oklch');
    if (!parts) return null;
    const l = parsePercentOrUnit(parts[0]!);
    const c = parsePercentOrUnit(parts[1]!);
    const hDeg = parseHue(parts[2]!);
    if (l === null || c === null || hDeg === null) return null;

    const radians = (hDeg * Math.PI) / 180;
    const a = c * Math.cos(radians);
    const b = c * Math.sin(radians);
    return oklabToHex(l, a, b);
}

function oklabStringToHex(value: string): string | null {
    const parts = parseFunctionalColor(value, 'oklab');
    if (!parts) return null;
    const l = parsePercentOrUnit(parts[0]!);
    const a = parsePercentOrUnit(parts[1]!);
    const b = parsePercentOrUnit(parts[2]!);
    if (l === null || a === null || b === null) return null;
    return oklabToHex(l, a, b);
}

export function cssColorToHex(value: string): string | null {
    const directHex = normalizeHex(value);
    if (directHex) {
        return directHex;
    }
    const oklchHex = oklchStringToHex(value);
    if (oklchHex) {
        return oklchHex;
    }
    const oklabHex = oklabStringToHex(value);
    if (oklabHex) {
        return oklabHex;
    }
    if (typeof document === 'undefined') {
        return null;
    }

    const probe = document.createElement('span');
    probe.style.color = '';
    probe.style.color = value;
    if (!probe.style.color) {
        return null;
    }

    probe.style.position = 'absolute';
    probe.style.left = '-9999px';
    probe.style.top = '-9999px';
    document.body.appendChild(probe);
    const computed = getComputedStyle(probe).color;
    probe.remove();

    return rgbStringToHex(computed) ?? oklchStringToHex(computed) ?? oklabStringToHex(computed);
}

export type ColorPickerProps = {
    value: string;
    onChange: (next: string) => void;
    className?: string;
    disabled?: boolean;
    title?: string;
};

export function ColorPicker({
    value,
    onChange,
    className,
    disabled = false,
    title = 'Pick color',
}: ColorPickerProps) {
    const hexValue = React.useMemo(() => cssColorToHex(value), [value]);
    const [pickerValue, setPickerValue] = React.useState(hexValue ?? '#000000');

    React.useEffect(() => {
        if (hexValue) {
            setPickerValue(hexValue);
        }
    }, [hexValue]);

    return (
        <div className={className ?? 'inline-flex items-center gap-1'}>
            <span
                aria-hidden
                className='h-5 w-5 rounded border border-border/70'
                style={{
                    background: hexValue ?? 'transparent',
                }}
            />
            <input
                type='color'
                value={pickerValue}
                disabled={disabled}
                title={title}
                className='h-6 w-8 cursor-pointer rounded border border-border/70 bg-transparent p-0 disabled:cursor-not-allowed disabled:opacity-50'
                onChange={(event) => {
                    const next = event.currentTarget.value.toLowerCase();
                    setPickerValue(next);
                    onChange(next);
                }}
            />
        </div>
    );
}
