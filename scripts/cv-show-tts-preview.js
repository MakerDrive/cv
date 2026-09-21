// Per-phrase TTS preview for CV Show narration (fix-list item №10).
//
// Default mode is TEXT ONLY: for every narration sentence carrying a
// pronunciation target (PhotoPizza, MEGAVISOR, Symbiote UI, AUTOBOX, F360,
// Wi-Fi, ...) it emits the original sentence plus the normalized string the
// TTS engine will receive, as JSON and as a browsable per-scene listing.
//
// Optional `--synthesize` mode renders one wav per flagged sentence through
// the local TTS service (no cloud); run it only once audio regeneration has
// been approved.
//
// Usage:
//   node scripts/cv-show-tts-preview.js [--scene <turnId>] \
//       [--out <jsonPath>] [--docs <markdownPath>]
//   node scripts/cv-show-tts-preview.js --synthesize [--listen <url>] [--out-dir <dir>]

import { createHash } from 'node:crypto';
import http from 'node:http';
import https from 'node:https';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { CV_SHOW_PRESENTATION_TIMELINE } from '../src/static-pages/data/cvShowPresentationProject.js';
import {
  buildCvShowTtsPreview,
  renderCvShowTtsPreviewListing,
} from '../src/static-pages/js/tour-player/cv-show-preview/index.js';

const REPOSITORY_ROOT = fileURLToPath(new URL('../', import.meta.url));
const DEFAULT_OUT = path.join(REPOSITORY_ROOT, 'TMP', 'cv-show-tts-preview', 'preview.json');
const DEFAULT_TTS_BASE_URL = process.env.TTS_BASE_URL || 'http://127.0.0.1:5127';
const DEFAULT_VOICE = process.env.TTS_VOICE || 'qwen3:speaker:alnilam';
const DEFAULT_MODEL = process.env.TTS_MODEL || 'qwen3-clone';
const DEFAULT_LANG = process.env.TTS_LANG || 'ru';
const TTS_TOKEN = process.env.CV_SHOW_MODEL_SERVICE_TOKEN
  || process.env.SYMBIOTE_MODEL_SERVICE_TOKEN
  || '';

function parseArgs(argv) {
  const options = {
    scenes: [],
    out: DEFAULT_OUT,
    docs: '',
    synthesize: false,
    outDir: path.join(REPOSITORY_ROOT, 'TMP', 'cv-show-tts-preview', 'audio'),
    listen: DEFAULT_TTS_BASE_URL,
  };
  for (let index = 2; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--scene') options.scenes.push(argv[++index]);
    else if (arg === '--out') options.out = path.resolve(REPOSITORY_ROOT, argv[++index]);
    else if (arg === '--docs') options.docs = path.resolve(REPOSITORY_ROOT, argv[++index]);
    else if (arg === '--synthesize') options.synthesize = true;
    else if (arg === '--out-dir') options.outDir = path.resolve(REPOSITORY_ROOT, argv[++index]);
    else if (arg === '--listen') options.listen = argv[++index];
    else if (arg === '--help' || arg === '-h') options.help = true;
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return options;
}

function filterTimeline(timeline, scenes) {
  if (scenes.length === 0) return timeline;
  const wanted = new Set(scenes);
  return { ...timeline, turns: timeline.turns.filter((turn) => wanted.has(turn.id)) };
}

function toJson(preview, audio) {
  return {
    schema: preview.schema,
    timelineHash: CV_SHOW_PRESENTATION_TIMELINE.hash,
    targets: preview.targets,
    audioStatus: audio ? 'generated' : 'pending-approval',
    audio: audio ?? null,
    documents: preview.documents,
  };
}

function postJson(url, headers, payload) {
  const target = new URL(url);
  const transport = target.protocol === 'https:' ? https : http;
  const data = Buffer.from(JSON.stringify(payload), 'utf8');
  return new Promise((resolve, reject) => {
    const request = transport.request({
      method: 'POST',
      hostname: target.hostname,
      port: target.port,
      path: `${target.pathname}${target.search}`,
      headers: { ...headers, 'content-length': data.length },
      timeout: 20 * 60 * 1000,
    }, (response) => {
      const chunks = [];
      response.on('data', (chunk) => chunks.push(chunk));
      response.on('end', () => resolve({ status: response.statusCode, body: Buffer.concat(chunks) }));
    });
    request.on('timeout', () => { request.destroy(new Error('TTS synthesize timed out (20 min)')); });
    request.on('error', reject);
    request.end(data);
  });
}

async function synthesizePreviewDocuments(preview, { base, outDir, voice, language, model }) {
  const audio = [];
  await fs.mkdir(outDir, { recursive: true });
  for (const doc of preview.documents) {
    const item = {
      id: `${doc.sceneId}-${doc.sentenceIndex}`,
      text: doc.ttsText,
      language,
      voiceRef: voice,
      style: 'narration',
    };
    const hash = createHash('sha256').update(doc.ttsText).update(voice).digest('hex').slice(0, 12);
    const fileName = `${doc.sceneId}-${doc.sentenceIndex}-${hash}.wav`;
    const filePath = path.join(outDir, fileName);
    const existing = await fs.stat(filePath).catch(() => null);
    if (existing && existing.size > 1000) {
      audio.push({ sceneId: doc.sceneId, sentenceIndex: doc.sentenceIndex, file: fileName, bytes: existing.size, voice, language, resumed: true });
      continue;
    }
    const headers = { 'content-type': 'application/json' };
    if (TTS_TOKEN) headers.authorization = `Bearer ${TTS_TOKEN}`;
    let buffer = null;
    for (let attempt = 1; attempt <= 3; attempt += 1) {
      const { status, body } = await postJson(`${base}/synthesize`, headers, { model, items: [item] });
      if (status >= 200 && status < 300) { buffer = body; break; }
      if (attempt === 3) {
        audio.push({ sceneId: doc.sceneId, sentenceIndex: doc.sentenceIndex, file: null, voice, language, error: `${status}: ${body.subarray(0, 200).toString('utf8')}` });
        console.error(`SKIP ${item.id}: ${status} ${body.subarray(0, 120).toString('utf8')}`);
        continue;
      }
      await new Promise((r) => setTimeout(r, 30000 * attempt));
    }
    if (buffer === null) continue;
    if (buffer.length < 1000 || buffer.toString('ascii', 0, 4) !== 'RIFF') {
      throw new Error(`TTS synthesize returned non-wav payload for ${item.id} (${buffer.length} bytes)`);
    }
    await fs.writeFile(filePath, buffer);
    audio.push({
      sceneId: doc.sceneId,
      sentenceIndex: doc.sentenceIndex,
      file: fileName,
      bytes: buffer.length,
      voice,
      language,
    });
  }
  return audio;
}

const MARKDOWN_HEADER = `# CV Show per-phrase TTS preview (fix-list item №10)

Generated by \`scripts/cv-show-tts-preview.js\`; regenerate with:

\`\`\`sh
npm run preview:cv-show-tts
\`\`\`

Each entry shows the sentence as authored (\`source text\`) and the exact string
sent to the TTS engine (\`tts_text\`). \`NOT rewritten\` flags a target word whose
spelling differs from the pronunciation dictionary, so the engine receives it
verbatim — fix the dictionary or the authoring text before regenerating audio.
Audio previews are pending user approval; this document is text-only.
`;

function renderMarkdown(preview, listing) {
  return [
    MARKDOWN_HEADER,
    `Timeline: \`${CV_SHOW_PRESENTATION_TIMELINE.hash}\``,
    `Targets: ${preview.targets.join(', ')}`,
    '',
    '```',
    listing,
    '```',
    '',
  ].join('\n');
}

async function main() {
  const options = parseArgs(process.argv);
  if (options.help) {
    console.log('Usage: node scripts/cv-show-tts-preview.js [--scene <id>] [--out <json>] [--docs <md>] [--synthesize] [--listen <url>] [--out-dir <dir>]');
    return;
  }
  const timeline = filterTimeline(CV_SHOW_PRESENTATION_TIMELINE, options.scenes);
  const preview = buildCvShowTtsPreview(timeline);
  const listing = renderCvShowTtsPreviewListing(preview);

  let audio = null;
  if (options.synthesize) {
    audio = await synthesizePreviewDocuments(preview, {
      base: options.listen,
      outDir: options.outDir,
      voice: DEFAULT_VOICE,
      language: DEFAULT_LANG,
      model: DEFAULT_MODEL,
    });
  }

  await fs.mkdir(path.dirname(options.out), { recursive: true });
  await fs.writeFile(options.out, `${JSON.stringify(toJson(preview, audio), null, 2)}\n`, 'utf8');
  if (options.docs) {
    await fs.mkdir(path.dirname(options.docs), { recursive: true });
    await fs.writeFile(options.docs, renderMarkdown(preview, listing), 'utf8');
  }

  console.log(listing);
  console.log(`\npreview documents: ${preview.documents.length}`);
  console.log(`json written: ${path.relative(REPOSITORY_ROOT, options.out)}`);
  if (options.docs) console.log(`docs written: ${path.relative(REPOSITORY_ROOT, options.docs)}`);
  if (audio) console.log(`audio previews: ${audio.length} file(s) in ${path.relative(REPOSITORY_ROOT, options.outDir)}`);
}

await main();
