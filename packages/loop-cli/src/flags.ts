export type CommonOptions = {
    cwd?: string;
    dryRun?: boolean;
    json?: boolean;
};

export function resolveCwd(cwd?: string): string {
    return cwd ?? process.cwd();
}
