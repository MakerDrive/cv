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

Review and release acceptance support an explicit opt-in machine mode
(`--mode machine`): the exact WAV is verified through Whisper metrics instead
of human listening, the review records `machine-verified` evidence, and release
acceptance becomes `machine-accepted`. The owner/human path remains the
default. See the root README for the exact gates and thresholds.

Master WAVs, recognition, alignment, receipts, voice references, and workflow
state stay outside Git under the configured durable absolute base. The
repository contains only the immutable Ogg/Opus web projection and its minimal
aligned sequences.

## Runtime budget rules learned from failure traces

Two production loops (2026-09-15) traced a repeated `PRESENTATION_EFFECT_…`
failure → entry retry pattern back to authoring data, not to runtime code:

- Marker admission is strict: the kinematic plan duration is
  `arcLengthPx / 0.471 px·ms⁻¹` for underline/oval markers and it must fit
  `gestureDurationMs`. Wide multi-line text blocks (≈550px) draw for ~1.2–2.7s;
  budgets like 1200/2500ms reject with `budget-exceeded` and the scene restarts
  forever. Size marker gestures by the measured arc and keep `leadMs ≥
  gestureDurationMs + 250ms`, with the paired `:scroll` cell giving at least
  `marker.leadMs + scroll.gestureDurationMs + 200ms` of lead.
- A `media/` cue whose owner project is not the currently open project page
  (for example `photopizza.megavisor-promo` framing
  `media/megavisor/youtube/c3cCmDqO04c` while the PhotoPizza page is open)
  must rely on the runtime selecting the owning project page first; the
  scroll-to-attention pair deadlocks otherwise and the entry loops.

The audio-clip hard deadline is `clip duration + 1000ms` of wall-clock grace;
the double `pause/play` preroll that normalizes deferred presentation consumes
most of that grace, so a slow host main thread can miss the clock once and the
player applies its bounded scene setup retry. Keep entry lead-ins lean.

## Failure semantics: AUTO REWIND after narration start is forbidden

Two invariants govern presentation failures:

- **MONOTONICITY: once the narration of an entry has physically started**
  (the media element emitted `playing`), no runtime failure may re-present
  that entry from position zero. Rewind is only possible via an explicit
  user action (retry / replay / navigation).
- **CONTINUITY: once narration has started, a SOFT presentation effect
  failure can never pause, terminate, or restart narration.** A soft effect
  may only degrade in place or skip its own visual branch, always with a
  machine-readable receipt. A missed soft deadline means "latest useful
  execution time passed", not a fatal error.
- **Before the first `playing`** of an entry, a bounded scene-setup retry is
  allowed: nothing audible was heard, so this is a pause-retry of scene
  preparation, not a replay.

Faults route through `resolveFailureRecovery`
(`src/static-pages/js/tour-player/failurePolicy.js`). Each authored cell gets
a semantic failure class — not a kind/layer guess:

- **soft**: focus frames, markers, annotations, scroll-for-attention, and
  native text selection. Post-narration failures **degrade in place**: the
  adapter completes the operation with a degraded lifecycle receipt
  (`providerReceipt.degraded`, `outcome`, `fallback`, `original`), soft
  `settled` barriers open, dependent visual cells continue, and narration is
  untouched;
- soft failures that terminalize engine-side (deadline race after
  activation) use the explicit **skip-branch** strategy: the failed terminal
  is kept and tolerated, the pump never escalates it, and dependent visual
  cells whose barriers can no longer open expire with the media clock. Each
  such expiry is annotated `outcome: 'dependency-failed'` with
  `cascadeFrom` / `rootCauseCellId`; protected cells (audio, narration) are
  excluded from a soft cascade — the pump reports an inconsistent plan
  instead of silently expiring them;
- **gate**: required navigation and scene/state setup
  (`interaction.type === 'navigate'` and other operations whose failure
  would leave the presentation on the wrong scene). They pause and retry the
  scene setup locally while narration has not started, or pause-and-report
  afterwards;
- **critical**: audio/narration pause-and-report; replay is only possible
  through an explicit user action;
- **unknown**: any cell without a resolvable class stays conservative —
  `pause-report`, never a silent degrade. `test/unit/cvShowContinuityPolicy.test.js`
  fails the build if any authored cell resolves to `unknown`.

Each show ends with `portfolio-show-complete` carrying a receipt summary
(`success / degraded / skipped / cascadeSkipped / failedCritical`,
`byReason`, `byFallback`, `cascadeByRoot`), counted per unique cell with
precedence `failed > degraded > skipped > success`. This is the base for
automated preview validation.

### Startup contract

Distinguish two startup failure domains; they are not interchangeable:

- **Resource / load latency** (clip fetch, slow decode, first entry preroll):
  wall-clock grace applies; a critical deadline hit pauses with a retry
  affordance. Patch D may tune this.
- **Browser autoplay / user-activation gating**: not a timing problem at
  all — extending grace cannot fix a rejected `play()`. The show start must
  be treated as a user-activation-scoped contract and handled by explicit
  readiness logic, not by deadlines.

### Known shims and strategic debt (A–C scope)

- **Synthetic `within-budget` admission.** When a decorative provider
  admission is rejected, the adapter reports a synthetic admitted plan so
  the engine can finish the lifecycle. The synthetic
  `reason.code === 'within-budget'` is **not** semantic truth: machine
  observability must read `providerReceipt.degraded / outcome / original`
  from the receipts, never infer success from the synthetic admission.
- **skip-branch is a host-side strategy, not the ideal end state.** The
  engine's barriers are private; a host cannot open a `settled` barrier for
  a cell whose upgrade path degraded mid-flight. The long-term model belongs
  in the engine: first-class terminal outcomes (`completed / degraded /
  skipped / failed`) and barriers that declare which outcomes satisfy them.
  Until that lands upstream, skip-branch with cascade receipts is the
  sanctioned mechanism.
