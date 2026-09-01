import assert from 'node:assert/strict';
import test from 'node:test';

import {
  playPresentationAudioClip,
} from '../../src/static-pages/js/tour-player/presentationAudioTransport.js';

class FakeMedia extends EventTarget {
  currentTime = 0;
  paused = true;
  playCount = 0;
  pauseCount = 0;

  play() {
    this.playCount += 1;
    this.paused = false;
    this.dispatchEvent(new Event('playing'));
    return Promise.resolve();
  }

  pause() {
    this.pauseCount += 1;
    this.paused = true;
    this.dispatchEvent(new Event('pause'));
  }

  advance(seconds) {
    this.currentTime = seconds;
    this.dispatchEvent(new Event('timeupdate'));
  }
}

class FakeSeekingMedia extends EventTarget {
  #currentTime = 0;
  paused = true;
  seeking = false;
  playCount = 0;
  pauseCount = 0;

  get currentTime() { return this.#currentTime; }

  set currentTime(value) {
    this.#currentTime = Number(value);
    this.seeking = true;
    this.dispatchEvent(new Event('seeking'));
  }

  finishSeek() {
    this.seeking = false;
    this.dispatchEvent(new Event('seeked'));
  }

  play() {
    this.playCount += 1;
    this.paused = false;
    return Promise.resolve();
  }

  pause() {
    this.pauseCount += 1;
    this.paused = true;
  }

  advance(seconds) {
    this.#currentTime = seconds;
    this.dispatchEvent(new Event('timeupdate'));
  }
}

function operation(signal, receipts) {
  return {
    projectCell: {
      id: 'audio-clip:demo:02',
      audio: { assetId: 'audio:demo', sourceInMs: 1_000, sourceOutMs: 2_000 },
    },
    sourceAsset: { contentHash: 'sha256-master' },
    playback: { sourcePositionMs: 1_250 },
    signal,
    reportReceipt(receipt) { receipts.push(receipt); },
  };
}

test('audio transport plays exactly one Project source range and emits its exact receipt', async () => {
  const media = new FakeMedia();
  const controller = new AbortController();
  const receipts = [];
  const playing = playPresentationAudioClip(media, operation(controller.signal, receipts));
  await Promise.resolve();

  assert.equal(media.currentTime, 1.25);
  assert.equal(media.playCount, 1);
  media.advance(1.8);
  assert.equal(receipts.length, 0);
  media.advance(2.001);
  await playing;

  assert.equal(media.paused, true);
  assert.equal(receipts.length, 1);
  assert.equal(receipts[0].status, 'ended');
  assert.deepEqual(receipts[0].providerReceipt, {
    clipId: 'audio-clip:demo:02',
    assetId: 'audio:demo',
    sourceContentHash: 'sha256-master',
    sourceInMs: 1_000,
    sourceOutMs: 2_000,
  });
});

test('audio transport observes a range boundary even when the browser omits the final timeupdate', async () => {
  const media = new FakeMedia();
  const receipts = [];
  const playing = playPresentationAudioClip(
    media,
    operation(new AbortController().signal, receipts),
  );
  await Promise.resolve();

  media.currentTime = 2;
  await Promise.race([
    playing,
    new Promise((_, reject) => setTimeout(
      () => reject(new Error('audio range boundary was not observed')),
      100,
    )),
  ]);

  assert.equal(media.paused, true);
  assert.deepEqual(receipts.map(({ status }) => status), ['ended']);
});

test('audio transport aborts an active range without fabricating an ended receipt', async () => {
  const media = new FakeMedia();
  const controller = new AbortController();
  const receipts = [];
  const playing = playPresentationAudioClip(media, operation(controller.signal, receipts));
  await Promise.resolve();
  controller.abort(new DOMException('paused', 'AbortError'));

  await assert.rejects(playing, (error) => error.name === 'AbortError');
  assert.equal(media.paused, true);
  assert.deepEqual(receipts, []);
});

test('audio transport normalizes a fractional browser position for the integer Project transport', async () => {
  const media = new FakeMedia();
  const controller = new AbortController();
  const receipts = [];
  const input = operation(controller.signal, receipts);
  input.playback.sourcePositionMs = 1_250.459;
  const seeks = [];
  const playing = playPresentationAudioClip(media, input, {
    seekTransport(mediaTimeMs) {
      assert.equal(Number.isInteger(mediaTimeMs), true);
      seeks.push(mediaTimeMs);
      media.currentTime = mediaTimeMs / 1_000;
    },
  });
  await Promise.resolve();

  assert.deepEqual(seeks, [1_250]);
  controller.abort(new DOMException('test complete', 'AbortError'));
  await assert.rejects(playing, (error) => error.name === 'AbortError');
});

test('audio transport waits for the native seek before starting the next Project clip', async () => {
  const media = new FakeSeekingMedia();
  const controller = new AbortController();
  const receipts = [];
  const playing = playPresentationAudioClip(media, operation(controller.signal, receipts));
  await Promise.resolve();

  assert.equal(media.currentTime, 1.25);
  assert.equal(media.seeking, true);
  assert.equal(media.playCount, 0);

  media.finishSeek();
  await Promise.resolve();
  assert.equal(media.playCount, 1);
  media.advance(2.001);
  await playing;
  assert.equal(receipts[0]?.status, 'ended');
});

test('audio transport starts directly when preroll already placed media at the Project source position', async () => {
  const media = new FakeMedia();
  media.currentTime = 1.25;
  const controller = new AbortController();
  const receipts = [];
  const seeks = [];
  const playing = playPresentationAudioClip(media, operation(controller.signal, receipts), {
    seekTransport(mediaTimeMs) {
      seeks.push(mediaTimeMs);
    },
  });
  await Promise.resolve();

  assert.deepEqual(seeks, []);
  assert.equal(media.playCount, 1);
  controller.abort(new DOMException('test complete', 'AbortError'));
  await assert.rejects(playing, (error) => error.name === 'AbortError');
});

test('audio transport reuses an in-flight preroll seek at the Project source position', async () => {
  const media = new FakeSeekingMedia();
  media.currentTime = 1.25;
  const controller = new AbortController();
  const receipts = [];
  const seeks = [];
  const playing = playPresentationAudioClip(media, operation(controller.signal, receipts), {
    seekTransport(mediaTimeMs) {
      seeks.push(mediaTimeMs);
    },
  });
  await Promise.resolve();

  assert.deepEqual(seeks, []);
  assert.equal(media.playCount, 0);
  media.finishSeek();
  await Promise.resolve();
  assert.equal(media.playCount, 1);
  controller.abort(new DOMException('test complete', 'AbortError'));
  await assert.rejects(playing, (error) => error.name === 'AbortError');
});

test('the last Project clip reaches native media end instead of being paused early', async () => {
  const media = new FakeMedia();
  const receipts = [];
  const projectCell = {
    id: 'clip-final',
    audio: { assetId: 'asset-a', sourceInMs: 2_000, sourceOutMs: 3_000 },
  };
  const operation = {
    projectCell,
    sourceAsset: { id: 'asset-a', contentHash: 'sha256:audio', durationMs: 3_000 },
    playback: { sourcePositionMs: 2_000 },
    signal: new AbortController().signal,
    reportReceipt: (receipt) => receipts.push(receipt),
  };

  const playing = playPresentationAudioClip(media, operation);
  media.advance(2.999);
  assert.equal(media.pauseCount, 0);
  assert.equal(receipts.length, 0);

  media.currentTime = 3;
  media.dispatchEvent(new Event('ended'));
  await playing;
  assert.equal(receipts.length, 1);
  assert.equal(receipts[0].status, 'ended');
});
