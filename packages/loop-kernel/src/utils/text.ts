export function normalizeSlashes(input: string): string {
    return input.replace(/\\/g, '/');
}

export function trimTrailingNewline(content: string): string {
    return content.endsWith('\n') ? content : `${content}\n`;
}
