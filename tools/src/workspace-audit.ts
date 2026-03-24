import fs from 'node:fs';
import path from 'node:path';

export type WorkspaceAuditResult = {
    project: string;
    hasPackageJson: boolean;
    hasTypecheckScript: boolean;
    hasTestScript: boolean;
};

function toProjectId(...segments: string[]): string {
    return segments.join('/');
}

export function auditWorkspaceProjects(root: string): WorkspaceAuditResult[] {
    const projectDirs = ['apps', 'packages', 'experiments']
        .flatMap((segment) => {
            const dir = path.join(root, segment);
            if (!fs.existsSync(dir)) {
                return [];
            }
            return fs
                .readdirSync(dir, { withFileTypes: true })
                .filter((entry) => entry.isDirectory())
                .map((entry) => toProjectId(segment, entry.name));
        })
        .concat([toProjectId('tools')]);

    return projectDirs.map((project) => {
        const packageJsonPath = path.join(root, project, 'package.json');
        if (!fs.existsSync(packageJsonPath)) {
            return {
                project,
                hasPackageJson: false,
                hasTypecheckScript: false,
                hasTestScript: false,
            };
        }

        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8')) as {
            scripts?: Record<string, string>;
        };

        return {
            project,
            hasPackageJson: true,
            hasTypecheckScript: Boolean(packageJson.scripts?.typecheck),
            hasTestScript: Boolean(packageJson.scripts?.test),
        };
    });
}

if (import.meta.main) {
    const root = path.resolve(import.meta.dir, '..', '..');
    console.table(auditWorkspaceProjects(root));
}
