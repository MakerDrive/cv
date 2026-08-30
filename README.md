# CV

Static CV, portfolio, and blog site built with JSDA-Kit and prepared for GitHub Pages deployment.

## Stack

- JSDA-Kit for static site generation and optional dynamic routes.
- Symbiote.js web components with SSR support.
- npm with `package-lock.json`.
- GitHub Actions deployment to GitHub Pages.

## Development

```bash
npm ci
npm test
npm run build
```

The production build is written to `dist/`.

## Runtime Markdown pages

Pages that provide `MD_URL` use the client-side `<markdown-viewer>` component. The
page shell is generated during the build, while the Markdown source is fetched
and converted in the browser with `jsda-kit/iso/md2html.js` after the page opens.
This keeps the GitHub Pages deployment static and avoids embedding the remote
Markdown document into the generated HTML. The renderer is built as the separate
JSDA entrypoint `dist/js/markdown-viewer/index.js` and loaded through its runtime
URL only when a page contains `<markdown-viewer>`; it is not part of the primary
`dist/js/index.js` bundle.

Portfolio project articles and Pulse publication bodies follow the same static
runtime model. Their localized sources live under
`src/static-pages/copy-content/{projects,publications}/<slug>/<locale>.md`.
JSDA copies that directory to `dist/content/` without bundling it. The portfolio
bundle contains only navigation, localization, relation, and SEO metadata; it
fetches the selected Markdown asset on demand, cancels stale navigation
requests, and passes the loaded source to the Symbiote source viewer. The
viewer keeps rendered/source modes and composes media and feed content slots
after the requested article arrives.

For local static development with a watcher:

```bash
npx jsda ssg
```

For the dynamic JSDA server:

```bash
npx jsda serve
```

The default dynamic server port is `3000`.

## CV Show audio workflow

Scenario editing, the library-owned timeline contract, the local WebMCP tool
surface, and the approval boundary are documented in
[`docs/cv-show-authoring.md`](docs/cv-show-authoring.md). Edit the authored
Project through that flow; do not edit the derived story or public audio
projection directly.

Master WAV files, voice references, Whisper recognition output, alignment, and
durable runner state stay outside Git. Use an explicit absolute authoring base;
do not use the worktree `TMP/` directory as the only copy because a reboot or
worktree cleanup may remove it. The base contains immutable payloads at
`<base>/<voice>/<artifact-tree-hash>/` and resumable workflow state under
`<base>/.workflow/`.

The production workflow composes the existing dirty planner, Qwen/Whisper model
client, durable entry runner, aggregate release gate, private promotion, and
Opus publisher. It does not infer either human decision:

1. every newly synthesized exact WAV must be reviewed before Whisper can run;
2. the exact aggregate release ID must be approved before staging or promotion.

Create a private profile JSON outside Git. Its provenance fields must describe
the desired voice and policies exactly; `readinessProfile` must equal `/readyz`
from the model service for the entire run:

```json
{
  "voice": {
    "selectionId": "barzana-2",
    "voiceRef": "qwen3:speaker:barzana2-review-20260827",
    "model": "qwen3-clone",
    "modelVersion": "Qwen/Qwen3-TTS-12Hz-0.6B-Base",
    "language": "ru",
    "style": "warm natural product guide, continuous speech without long pauses",
    "sampleRate": 24000,
    "referenceSha256": "<normalized-reference-sha256>",
    "referenceTranscriptSha256": "<reference-transcript-sha256>"
  },
  "synthesisPolicy": {
    "format": "wav",
    "normalize": true,
    "normalization": {
      "targetLufs": -19,
      "truePeakLimitDbfs": -1,
      "version": "bs1770-4-truepeak4x-v1"
    },
    "textPolicy": "English terms preserved in Latin script; digits expanded as context-aware Russian words"
  },
  "asr": {
    "model": "large-v3-turbo",
    "locale": "ru",
    "recognitionVersion": "cv-show-whisper-recognition-v1"
  },
  "aligner": {
    "alignedSequenceVersion": "workspace-aligned-sequence-v3",
    "anchoringVersion": "workspace-transcript-word-anchoring-v1",
    "contract": "workspace-observed-alignment"
  },
  "readinessProfile": {
    "ready": true,
    "status": "ready",
    "model": "<exact-readyz-model>",
    "modelVersion": "<exact-readyz-version>",
    "accelerator": "cuda",
    "capabilities": ["synthesize", "transcribe"]
  }
}
```

Plan and run a narration or voice revision with explicit absolute inputs:

```bash
export CV_SHOW_PRIVATE_ARTIFACT_BASE=/absolute/durable/cv-show-audio
export CV_SHOW_MODEL_ENDPOINT=http://127.0.0.1:8000
export CV_SHOW_AUDIO_PROFILE=/absolute/private/cv-show-audio-profile.json
export CV_SHOW_AUDIO_PROJECT=/absolute/private/target-cv-show-project.json

npm run cv-show:audio -- plan \
  --private-root "$CV_SHOW_PRIVATE_ARTIFACT_BASE" \
  --project "$CV_SHOW_AUDIO_PROJECT" \
  --profile "$CV_SHOW_AUDIO_PROFILE"

npm run cv-show:audio -- advance \
  --private-root "$CV_SHOW_PRIVATE_ARTIFACT_BASE" \
  --project "$CV_SHOW_AUDIO_PROJECT" \
  --profile "$CV_SHOW_AUDIO_PROFILE" \
  --endpoint "$CV_SHOW_MODEL_ENDPOINT"
```

`--project` is the absolute path to the target canonical Project projection
produced by the scenario-authoring flow. Keep the selected source module at its
accepted predecessor until `promote`; promotion atomically selects the target
Project and its approved release together. For a voice-only revision, omit
`--project` from every command and the workflow uses the selected Project. If an
advancing command reports a missing model client, pass `--endpoint` or set
`CV_SHOW_MODEL_ENDPOINT`.

`advance` stops regenerated entries at `technical-verified`; it never invokes
Whisper before review. Its `exactWav.path` is the immutable WAV artifact (the
content-addressed file uses a `.bin` suffix); listen to that exact path, then bind
the decision to the adjacent hashes printed by `advance`:

```bash
npm run cv-show:audio -- review \
  --private-root "$CV_SHOW_PRIVATE_ARTIFACT_BASE" \
  --project "$CV_SHOW_AUDIO_PROJECT" \
  --profile "$CV_SHOW_AUDIO_PROFILE" \
  --endpoint "$CV_SHOW_MODEL_ENDPOINT" \
  --entry positioning \
  --wav-hash <exact-wav-sha256> \
  --attempt-hash <exact-synthesis-attempt-sha256> \
  --approve yes

npm run cv-show:audio -- advance \
  --private-root "$CV_SHOW_PRIVATE_ARTIFACT_BASE" \
  --project "$CV_SHOW_AUDIO_PROJECT" \
  --profile "$CV_SHOW_AUDIO_PROFILE" \
  --endpoint "$CV_SHOW_MODEL_ENDPOINT"
```

After all regenerated entries reach `entry-verified`, build the aggregate and
review its printed `releaseId`. Approval must repeat that exact identity:

```bash
npm run cv-show:audio -- verify-release \
  --private-root "$CV_SHOW_PRIVATE_ARTIFACT_BASE" \
  --project "$CV_SHOW_AUDIO_PROJECT" \
  --profile "$CV_SHOW_AUDIO_PROFILE"

npm run cv-show:audio -- approve-release \
  --private-root "$CV_SHOW_PRIVATE_ARTIFACT_BASE" \
  --project "$CV_SHOW_AUDIO_PROJECT" \
  --profile "$CV_SHOW_AUDIO_PROFILE" \
  --release-id <exact-release-id> \
  --approve yes

npm run cv-show:audio -- stage \
  --private-root "$CV_SHOW_PRIVATE_ARTIFACT_BASE" \
  --project "$CV_SHOW_AUDIO_PROJECT" \
  --profile "$CV_SHOW_AUDIO_PROFILE"

npm run cv-show:audio -- promote \
  --private-root "$CV_SHOW_PRIVATE_ARTIFACT_BASE" \
  --project "$CV_SHOW_AUDIO_PROJECT" \
  --profile "$CV_SHOW_AUDIO_PROFILE"

npm run cv-show:audio -- publish \
  --private-root "$CV_SHOW_PRIVATE_ARTIFACT_BASE" \
  --project "$CV_SHOW_AUDIO_PROJECT" \
  --profile "$CV_SHOW_AUDIO_PROFILE"
npm run verify:cv-show-web-audio
```

After a reboot, run `status` with the same private base and profile. Immutable
runner heads and generated cache files are resumed without synthesis or Whisper
repetition. If the selected predecessor tree is missing, the command prints its
exact expected path and stops; restore that content-addressed tree rather than
silently regenerating accepted media.

One narration-text change normally produces one `regenerate` disposition and 29
byte-identical entry-release reuses. A voice-profile change produces 30
regenerations. Timing-only Project changes reuse all 30 private media entries.
Publish Opus only when the master artifact tree, audio/alignment manifests, or
voice identity changes. When those media identities are unchanged, skip
transcoding: `publish` first proves the accepted selector and exact manifest
against the current private master with the production compatibility contract.
An artifact-equivalent historical web projection produces a deterministic
content-addressed reuse receipt under `<base>/.workflow/publication-receipts/`;
the Opus publisher is not called. Changed media identity invokes the publisher.
If the accepted proof was moved, pass both absolute `--public-selector` and
`--public-manifest` paths. A missing or internally divergent selector/manifest
proof fails actionably instead of guessing. This retains historical
selector-to-manifest source linkage, so a timing-only successor does not
transcode 30 unchanged WAV files.

The publisher emits one immutable 61-file release under
`src/static-pages/copy-cv-show-audio/`: 30 Ogg/Opus clips, 30 minimal aligned
sequences, and one unified manifest. It also updates the generated public
selector consumed by the player. A normal production build only copies that
accepted projection verbatim; it never transcodes audio and must not contain
WAV files or the private authoring tree. The production verifier checks the
source/dist inventory, selector binding, hashes, MIME contract, and absence of
private artifacts.

## Social cards

The build derives social cards from the project and publication registries. Each
published Pulse article and project page gets a 1200×630 PNG for `og:image` and
`twitter:image`. The renderer tries catalog media associated with the page or
its project; the project cover is the last source. If those sources are
unavailable, it renders the title on a gradient background with size-aware line
wrapping.

```bash
npm run render-social-cards
npm run publish-social-cards
```

`render-social-cards` writes the generated files under the ignored
`cit/cit-store/social/` directory. Normal builds copy them to
`dist/social-cards/`, so a card that has not been uploaded yet has a deployable
local URL.
`publish-social-cards` uploads content-addressed versions to CIT and rewrites the
generated `cit/social-cards.json` map. Superseded objects remain available for
30 days. A later sync deletes an expired object only when no current card map
entry references it.

## GitHub Pages

The workflow at `.github/workflows/deploy-pages.yml` builds `dist/` and deploys it to GitHub Pages on pushes to `main`.

## Production Build Contract

The production build runs as a self-contained, native bundle located in `dist/`. It enforces the following production invariants:

- **Self-contained execution assets**: Exactly four JavaScript execution assets are allowed in `dist/js/`: `index.js`, `markdown-viewer/index.js`, `tour-player/index.js`, and `ForceWorker.js`. The Markdown viewer and CV Show player are independent JSDA bundles; localized Markdown remains non-executable content under `dist/content/`.
- **No Import Maps or external library CDNs**: The HTML files contain no `<script type="importmap">` or static jsDelivr/unpkg library mappings, and no raw package directories or copies (e.g. no `node_modules` inside `dist`).
- **No static JS imports**: Emitted JavaScript files contain no statically resolvable import statements (e.g., zero parser-visible import records from packages like `@symbiotejs/symbiote`).
- **Main bundle budget**: `dist/js/index.js` must not exceed the pre-runtime-Markdown baseline of 3,208,785 bytes raw or 773,574 bytes with gzip level 9.
- **Local Font Assets**: External Google Fonts references are replaced with local Material Symbols font assets (`dist/js/material-symbols.css` and `dist/js/material-symbols-outlined-400.ttf`).
- **Deliberate limits**: Provider-controlled media (like YouTube video players) or dynamic IMS media spots remain network-backed.

## Build Verification

A fail-closed verifier script validates all production invariants:

```bash
node scripts/verify-production-build.js
```

This verifier recursively inspects HTML pages, checks CSS files, validates all
126 localized runtime Markdown assets, verifies the Markdown renderer/main-bundle
boundary and size budget, and uses `esbuild` to verify that JS files contain zero
parser-visible import records.

Before publishing, create the GitHub repository and confirm that `homepage`, `repository.url`, and `project.cfg.js` sitemap `baseUrl` match the final GitHub Pages URL.

## Project Layout

- `src/static-pages/` - static pages used by the GitHub Pages build.
- `src/dynamic-pages/` - optional dynamic routes for the JSDA server.
- `src/ui-components/` - reusable web components.
- `src/common-styles/` - shared CSS modules and design tokens.
- `project.cfg.js` - JSDA build and routing configuration.
- `cit-config.json` - Cloud Images Toolkit configuration.

## Verification

```bash
npm test
npm run build
npm audit
```
