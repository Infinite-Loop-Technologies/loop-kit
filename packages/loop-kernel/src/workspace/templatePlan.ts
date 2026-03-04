import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import fg from 'fast-glob';
import type { PatchPlan } from '@loop-kit/loop-contracts';
import { nodeFsGateway, type FsGateway } from '../io/fsGateway.js';

function resolveInternalTemplateDir(templateName: string): string {
    const currentFile = fileURLToPath(import.meta.url);
    const currentDir = path.dirname(currentFile);
    const candidates = [
        path.resolve(currentDir, '..', '..', 'templates', templateName),
        path.resolve(currentDir, '..', '..', '..', 'templates', templateName),
    ];

    for (const candidate of candidates) {
        if (fs.existsSync(candidate)) {
            return candidate;
        }
    }

    return candidates[0];
}

function resolveTemplateDir(workspaceRoot: string, templateName: string, templateRef?: string): string {
    if (!templateRef) {
        return resolveInternalTemplateDir(templateName);
    }

    if (templateRef.startsWith('file:')) {
        const raw = templateRef.slice('file:'.length);
        return path.isAbsolute(raw) ? raw : path.resolve(workspaceRoot, raw);
    }

    return resolveInternalTemplateDir(templateRef);
}

export async function buildTemplatePlan(
    workspaceRoot: string,
    options: {
        templateName: 'new-app' | 'new-pkg';
        templateRef?: string;
        destinationRoot: string;
        replacements: Record<string, string>;
        planId: string;
        title: string;
        fs?: FsGateway;
    },
): Promise<PatchPlan> {
    const fs = options.fs ?? nodeFsGateway;
    const templateDir = resolveTemplateDir(workspaceRoot, options.templateName, options.templateRef);
    const files = await fg('**/*', {
        cwd: templateDir,
        onlyFiles: true,
        dot: true,
    });

    const operations: PatchPlan['operations'] = [];
    for (const file of files) {
        const sourcePath = path.join(templateDir, file);
        let content = await fs.readText(sourcePath);
        for (const [key, value] of Object.entries(options.replacements)) {
            content = content.replaceAll(`__${key}__`, value);
        }

        operations.push({
            kind: 'ensureFile',
            opId: `${options.planId}.${file}`,
            path: path.join(options.destinationRoot, file),
            overwrite: false,
            content,
        });
    }

    return {
        id: options.planId,
        title: options.title,
        provenance: {
            source: 'loop:new',
        },
        operations,
        preconditions: [],
        postconditions: [],
    };
}
