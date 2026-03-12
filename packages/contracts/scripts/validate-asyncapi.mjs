import { readFile } from 'node:fs/promises';
import { Parser } from '@asyncapi/parser';

const specText = await readFile(new URL('../asyncapi/asyncapi.yaml', import.meta.url), 'utf8');
const parser = new Parser();

await parser.parse(specText);

console.log('AsyncAPI document is valid.');
