I implemented narrated tours in Symbiote UI as a dialogue timeline with independent speech channels. Each persona receives a `speechSynthesis` channel hosted in a hidden iframe, so two voices can overlap. Persona profiles carry locale, voice, rate, pitch, and volume settings.

The timeline stores ordered turns with persona, text, cue, gap, and optional overlap. Cues fire when speech starts and can drive highlights or presenter actions in the host interface. A gesture-unlock hook activates speech in browsers that require user interaction.

The player adds media-style control over the same timeline: play, pause, resume, previous, next, seek, preview, and stop. It keeps a turn index, prevents callbacks from canceled speech from advancing the tour, and exposes a completion promise. Browser speech synthesis provides the audio runtime.
