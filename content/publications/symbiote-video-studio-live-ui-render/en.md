I connected Symbiote Video Studio to the local browser screencast provider from Symbiote Engine. A render manifest identifies the browser surface, viewport, frame rate, duration, setup actions, and output. The provider opens the live page and captures its rendered state as a frame sequence.

For the narrated UI tour, the Studio script starts the tour through an exported page method and derives the render duration from the accepted cue timeline. Captured frames are indexed and written to a frame-source manifest. The script rejects a manifest that falls back to the older track-demo visual source.

The resulting sequence stays separate from audio assembly and final proof. Frame files can be retained for inspection, normalized into the Studio cache, and then passed to the encoder and audio mux steps. The evidence set contains the manifest, captured sequence, probe output, and final artifact record.
