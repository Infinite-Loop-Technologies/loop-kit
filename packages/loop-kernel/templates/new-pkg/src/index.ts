export type __NAME__Options = {
  label?: string;
};

export function hello__NAME__(options: __NAME__Options = {}): string {
  return `hello ${options.label ?? 'world'}`;
}
