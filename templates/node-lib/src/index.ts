export type ExampleOptions = {
    label?: string;
};

export function hello(options: ExampleOptions = {}) {
    return `hello ${options.label ?? 'world'}`;
}
