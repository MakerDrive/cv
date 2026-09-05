# CV Show authoring

CV Show has one authored source and one acceptance path. The generic timeline,
layer, cell, dependency, timing, hash, and transaction contracts come from the
`symbiote-workspace` Presentation Authoring library. CV fixes the product shape
to 16 Short entries plus 14 detail entries and adds the required setup,
scroll-to-attention ordering, semantic targets, audio ancestry, and runtime
validation.

## Sources and projections

- Accepted authored Project:
  `src/static-pages/data/cvShowPresentationProject.js`.
- Derived story projection: `src/static-pages/data/tourScripts.js`; never edit
  it as a second source.
- Generated public audio selector:
  `src/static-pages/data/cvShowWebAudioRelease.js`; update it only through the
  approved audio workflow.
- The browser's public static runtime is read-only. Local authoring is enabled
  only by the loopback host and an exact session capability.

## Local agent editing

Start the local authoring host on an unused loopback port:

```bash
npm run authoring:serve -- --port 4183
```

Before starting it, build the public assets (`npm run build`). Open the printed
loopback origin in a browser with native WebMCP enabled. A listening host is not
enough: the browser must register the `presentation_authoring_*` tools. Confirm
that registration by calling `presentation_authoring_inspect`; if it is absent,
the local client reports the missing runtime or native-registration error rather
than permitting an unbound edit.

The command prints its exact origin and session ID. Open the returned origin at
`/cv/`. That host injects the local client, establishes one capability-bound
session, loads the current Project, and registers the library's
`presentation_authoring_*` WebMCP descriptors. Draft mutations use
compare-and-swap against the exact Project revision, authoring hash, and
snapshot identity. A stale base or unknown commit outcome fails without a
second mutation.

The useful CV operations are:

- `presentation_authoring_inspect` to read the current Project, layers, cells,
  media ancestry, and hashes;
- `presentation_authoring_narration_replace` for an atomic narration edit;
- `presentation_authoring_cell_set_content` for supported cue content;
- `presentation_authoring_cell_set_timing` for timing cells;
- `presentation_authoring_cell_set_dependencies` for explicit sequencing;
- `presentation_authoring_inverse` to derive the exact inverse of an accepted
  command.
- `presentation_authoring_cv_show_cue_batch` for one atomic batch of cue-only
  `cell.add`, `cell.remove`, `cell.set-dependencies`, or
  `cv-show.directive.set-refinements` commands; every nested command carries
  the same exact `base` returned by inspect;
- `presentation_authoring_cv_show_entry_set_subtitle` to update display text
  without changing pronunciation-oriented narration.

Use this loop for every edit: inspect and retain its `project` and `base`; make
one command against that base; inspect again and verify revision, hashes,
timeline and media disposition. Preserve the resulting inspected `project` as
the private absolute JSON file passed to the audio workflow as `--project`.
Never use a stale inspect result after a mutation or an unknown commit outcome.

For example, after `presentation_authoring_inspect` returns
`base = { revision, authoringProjectHash }`, set a subtitle with:

```json
{
  "id": "subtitle-positioning",
  "base": { "revision": 12, "authoringProjectHash": "…from inspect…" },
  "payload": { "entryId": "positioning", "subtitle": "Новый подзаголовок" }
}
```

Pass that object to `presentation_authoring_cv_show_entry_set_subtitle`, inspect
again, and save the returned `project` object verbatim to a private absolute
JSON file. That file is the exact `--project /absolute/path/project.json` input
for the approved audio workflow.

For a cue batch, each nested command repeats that same `base`; for example a
removal uses `type: "cell.remove"` with
`payload: { "cellId": "cv-show:cue:positioning.example" }`. Add uses
`payload: { "cell": { "…complete cue cell with kind: "cue"…" }, "index": 4 }`;
the batch tool only accepts `kind: "cue"` cells, never narration or audio-clip
cells. Dependency changes use `payload: { "cellId": "…", "dependsOn": [{
"cellId": "…", "barrier": "settled" }] }`. Directive refinements use
`payload: { "cellId": "…", "refinements": { … } }`; `refinements` is an open
portable JSON map (nested objects, arrays, strings, finite numbers, booleans,
and null). Runtime-consumed fields include `safePath` (activation path),
`mode`, `action`, `actions` (media or chat actions), `frames`, `finalFrame`,
`frameHoldMs` (frame sequences), `quote`, `occurrence` (selection anchors), and
`persistent` (chat actions). Unknown fields are preserved verbatim; do not
guess validation restrictions — use the tool descriptor and
`presentation_authoring_inspect` to confirm a command before sending it.

The shared library also describes structural layer/cell add, remove, and move
commands. CV deliberately rejects changes that break its fixed 30-entry shape,
required roles, source order, or scroll-to-attention chains. The regeneration
request/inspect descriptors are also present, but this local browser session
has no model-service adapter and returns `CV_SHOW_REGENERATION_UNAVAILABLE`.
This is an approval boundary, not permission to synthesize a substitute.

Drafts persist under ignored `tmp/cv-show-authoring/` for the same worktree, so
the host can resume them after a reboot. Before deleting or replacing the
worktree, preserve the inspected target Project as a private absolute JSON
input; the tracked Project remains unchanged until promotion.

## Text, voice, and accepted source

Pass the exact target Project produced by the authoring session to the audio
workflow as `--project`. A narration-text edit normally regenerates that entry
and reuses the other 29. A voice identity or synthesis-policy change regenerates
all 30. ASR-profile changes rerun transcription and alignment; aligner-contract
changes rerun alignment only; attention/anchor/timing-only changes reuse the
accepted media.

Run the plan, synthesis, exact-WAV listening review, Whisper alignment,
aggregate verification, owner approval, stage, and promote commands documented
in the root README. `promote` is the only path that atomically selects both the
target Project and its approved audio release. The standalone
`authoring:materialize` command intentionally rejects unapproved drafts; do not
bypass that gate or copy a draft literal into tracked source.

Master WAVs, recognition, alignment, receipts, voice references, and workflow
state stay outside Git under the configured durable absolute base. The
repository contains only the immutable Ogg/Opus web projection and its minimal
aligned sequences.
