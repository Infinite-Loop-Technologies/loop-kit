import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const siteRoot = path.resolve(__dirname, '..');
const uiSrcRoot = path.resolve(siteRoot, '..', 'ui', 'src');
const registryRoot = path.resolve(siteRoot, 'registry', 'new-york', 'ui');

const files = [
    ['button.tsx', 'button.tsx'],
    ['card.tsx', 'card.tsx'],
    ['input.tsx', 'input.tsx'],
    ['label.tsx', 'label.tsx'],
    ['textarea.tsx', 'textarea.tsx'],
    ['prose.tsx', path.join('prose', 'prose.tsx')],
    ['prose.css', path.join('prose', 'prose.css')],
];

function rewriteImports(content) {
    return content.replace(
        /from ['"]\.\/utils['"]/g,
        'from "@/lib/utils"'
    );
}

for (const [sourceFile, targetFile] of files) {
    const sourcePath = path.join(uiSrcRoot, sourceFile);
    const targetPath = path.join(registryRoot, targetFile);

    await fs.mkdir(path.dirname(targetPath), { recursive: true });

    const raw = await fs.readFile(sourcePath, 'utf8');
    const next = sourceFile.endsWith('.tsx') ? rewriteImports(raw) : raw;

    await fs.writeFile(targetPath, `${next.trimEnd()}\n`, 'utf8');
}

console.log('Synced shared UI files into packages/site/registry/new-york/ui');
