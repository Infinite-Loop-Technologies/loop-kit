import { execSync } from 'node:child_process';

execSync('pnpm exec tsc -p tsconfig.json --noEmit', {
  stdio: 'inherit',
});
