# CV Show TTS preview — TEXT ONLY scope note (fix-list item №10)

The per-phrase preview pipeline is a **pure text pre-processing** step:

- `src/static-pages/js/tour-player/cv-show-preview/index.js` reads narration
  turns, splits them into sentences, and pairs each sentence containing a
  pronunciation target with the exact string the TTS engine will receive.
- It never mutates `src/static-pages/data/cvShowPresentationProject.js`,
  never truncates or rewrites narration prose, and never touches audio
  hashes or the SHA-256 descriptors of the published audio release. The
  reference to the timeline in generated JSON is informational only.
- All normalization is delegated to
  `src/static-pages/js/tour-player/ttsNormalize.js` (word-level dictionary).
  The preview additionally *reports* spellings the dictionary does not
  rewrite (case variants like `Megavisor`, spaced variants like
  `Complex Scan`, `Auto Box`) via the `NOT rewritten` flag in the listing and
  the `unappliedTargets` field in JSON — those are decisions for the reviewer,
  not something the script silently fixes.
- Audio is out of scope by default (`audioStatus: "pending-approval"`).
  `scripts/cv-show-tts-preview.js --synthesize` renders one wav per flagged
  sentence through the local TTS service only, after explicit approval;
  no cloud or network upload is involved.

Outputs:

- `TMP/cv-show-tts-preview/preview.json` (gitignored runtime output)
- `docs/cv-show-tts-preview.md` (checked-in browsable listing, regenerate with
  `npm run preview:cv-show-tts`)
