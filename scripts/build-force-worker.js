import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { jsBuild } from 'jsda-kit/server/build-asset.js';

const entryFile = fileURLToPath(new URL('../node_modules/symbiote-ui/canvas/ForceWorker.js', import.meta.url));
const outDir = fileURLToPath(new URL('../dist/js/', import.meta.url));
const outFile = fileURLToPath(new URL('../dist/js/ForceWorker.js', import.meta.url));

await fs.mkdir(outDir, { recursive: true });
const bundledCode = await jsBuild(entryFile);
await fs.writeFile(outFile, bundledCode, 'utf8');
