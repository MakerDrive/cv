I developed Symbiote Video Studio as the media branch of the Symbiote toolset. A video project is stored as a graph that can be serialized to workflow JSON and loaded by Symbiote Engine. The timeline model keeps typed layers and time ranges, so clips, audio, captions, effects, and generated material remain addressable parts of one edit.

Node plugins package their socket types, driver metadata, and execution code together. Pack manifests record ownership by namespace and reject a second pack that tries to claim an existing node type. This makes editing operations discoverable through the same graph contract used for execution.

The render path records frame-sequence manifests and cache identity instead of treating intermediate frames as disposable files. Browser capture and encoded-segment checks come from Symbiote Engine; the studio adds the media workflow, timeline, and review surface around those contracts.
