I implemented deterministic browser capture in Symbiote Engine through an explicit `renderClock` contract. The page exposes a render method that accepts the requested timeline time plus frame and worker metadata. It returns the presented time, a projection identity, and a digest of the rendered state before the provider takes the screenshot.

The page render method is the timing boundary; native `performance.now()`, `Date.now()`, and `requestAnimationFrame` remain intact. A seekable page owns arbitrary-time projection through that method, while deterministic mode rejects stateful timeline actions from the provider.

Parallel capture uses isolated browser profiles and contiguous frame ranges. The lead worker exports an opaque canonical state that peers import before rendering. The provider compares content digests and boundary pixels between ranges, then stores setup-state and seam evidence with the artifact. Realtime capture remains a separate single-worker mode.
