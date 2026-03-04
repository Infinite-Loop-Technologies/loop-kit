#!/usr/bin/env node
import { runCli } from './program.js';

runCli().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
