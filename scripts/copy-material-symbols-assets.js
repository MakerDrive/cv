import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const outDir = fileURLToPath(new URL('../dist/js/', import.meta.url));
const cssSource = fileURLToPath(new URL('../node_modules/symbiote-ui/icons/material-symbols.css', import.meta.url));
const cssDest = fileURLToPath(new URL('../dist/js/material-symbols.css', import.meta.url));
const ttfSource = fileURLToPath(new URL('../node_modules/symbiote-ui/icons/material-symbols-outlined-400.ttf', import.meta.url));
const ttfDest = fileURLToPath(new URL('../dist/js/material-symbols-outlined-400.ttf', import.meta.url));

await fs.mkdir(outDir, { recursive: true });
await fs.copyFile(cssSource, cssDest);
await fs.copyFile(ttfSource, ttfDest);
