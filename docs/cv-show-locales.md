# Show in other languages (browser voice)

Only Russian has recorded and aligned audio. Other languages are narrated by the browser's voice
from texts registered in `src/static-pages/data/cvShowLocales.js`.

- `node scripts/show-locale-template.js` prints every scene and branch (title, subtitle, speech,
  chat text, and the phrase each timed directive is anchored to) in the locale shape, to translate.
- Register the result as `CV_SHOW_LOCALES.<lang>`; `node scripts/show-locale-template.js --check <lang>`
  lists what is missing. A quote must occur in that entry's `speech` (case and punctuation ignored).
- The story structure, targets and choreography stay those of the verified Russian story; only texts
  and quotes are swapped (`showLocale.js`).
- The voice is read sentence by sentence (`ttsNarration.js`). A directive fires at the real start of
  the sentence holding its quote plus the estimated offset inside it (`ttsTiming.js`), shifted by its
  authored lead; the measured pace of the voice rescales the rest of the entry. Pause freezes the
  pending cues. Expected error is under half a second, within the authored leads.
- Seeking inside a scene is not available for browser narration.
