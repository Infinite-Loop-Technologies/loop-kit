import { execSync } from 'node:child_process';
import { readdirSync, rmSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));

function removeBuildArtifacts(dirPath: string): void {
  const entries = readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const entryPath = join(dirPath, entry.name);
    if (entry.isDirectory()) {
      removeBuildArtifacts(entryPath);
      continue;
    }

    const isGenerated =
      entry.name.endsWith('.js') ||
      entry.name.endsWith('.js.map') ||
      entry.name.endsWith('.d.ts') ||
      entry.name.endsWith('.d.ts.map');

    if (isGenerated) {
      rmSync(entryPath, { force: true });
    }
  }
}

rmSync(join(root, 'dist'), { recursive: true, force: true });

const srcPath = join(root, 'src');
if (statSync(srcPath).isDirectory()) {
  removeBuildArtifacts(srcPath);
}

execSync('pnpm exec tsc -p tsconfig.build.json', {
  stdio: 'inherit',
});
