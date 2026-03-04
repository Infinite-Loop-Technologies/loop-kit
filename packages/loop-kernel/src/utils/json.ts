export function parseJsonWithComments<T>(text: string): T {
    try {
        return JSON.parse(text) as T;
    } catch {
        const sanitized = stripJsonComments(text);
        return JSON.parse(sanitized) as T;
    }
}

export function stableStringify(value: unknown): string {
    return `${JSON.stringify(value, null, 2)}\n`;
}

function stripJsonComments(input: string): string {
    let output = '';
    let inString = false;
    let isEscaped = false;

    for (let index = 0; index < input.length; index += 1) {
        const current = input[index];
        const next = input[index + 1];

        if (inString) {
            output += current;
            if (isEscaped) {
                isEscaped = false;
                continue;
            }

            if (current === '\\') {
                isEscaped = true;
                continue;
            }

            if (current === '"') {
                inString = false;
            }
            continue;
        }

        if (current === '"') {
            inString = true;
            output += current;
            continue;
        }

        if (current === '/' && next === '/') {
            while (index < input.length && input[index] !== '\n') {
                index += 1;
            }
            output += '\n';
            continue;
        }

        if (current === '/' && next === '*') {
            index += 2;
            while (index < input.length && !(input[index] === '*' && input[index + 1] === '/')) {
                index += 1;
            }
            index += 1;
            continue;
        }

        output += current;
    }

    return output;
}
