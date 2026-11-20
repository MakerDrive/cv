import assert from 'node:assert/strict';
import test from 'node:test';

import { computeWorkingRuler, renderProfileDashboard, rulerReadout } from '../../src/static-pages/js/profileDashboard.js';

test('the ruler shifts the host working hours into the visitor day', () => {
  // 15:00 UTC; the visitor is in Moscow (+180), the host in Buenos Aires (-180).
  const ruler = computeWorkingRuler({ nowMs: Date.UTC(2026, 0, 5, 15, 0), viewerOffsetMinutes: 180 });
  assert.equal(ruler.hostTime, '12:00');
  assert.equal(ruler.viewerHour, 18);
  assert.equal(ruler.overlap, 10);
  // Host 08:00-18:00 is visitor 14:00-24:00; the host can also shift from 06:00 (visitor 12:00-14:00)
  // and past 18:00 up to midnight (visitor 00:00-06:00).
  assert.deepEqual(ruler.hours.filter((item) => item.working).map((item) => item.hour), [14, 15, 16, 17, 18, 19, 20, 21, 22, 23]);
  assert.deepEqual(ruler.hours.filter((item) => item.flex).map((item) => item.hour), [0, 1, 2, 3, 4, 5, 12, 13]);
  assert.equal(ruler.hours.filter((item) => item.now).length, 1);
});

test('a visitor in the host time zone sees the plain 08:00-18:00 window', () => {
  const ruler = computeWorkingRuler({ nowMs: Date.UTC(2026, 0, 5, 12, 0), viewerOffsetMinutes: -180 });
  assert.equal(ruler.hostTime, '09:00');
  assert.deepEqual(ruler.hours.filter((item) => item.working).map((item) => item.hour), [8, 9, 10, 11, 12, 13, 14, 15, 16, 17]);
  assert.deepEqual(ruler.hours.filter((item) => item.flex).map((item) => item.hour), [6, 7, 18, 19, 20, 21, 22, 23]);
});

test('the ruler renders one cell per hour and no markup from labels', () => {
  const ruler = computeWorkingRuler({ nowMs: 0, viewerOffsetMinutes: 0 });
  const html = renderProfileDashboard({
    ruler,
    labels: { rulerTitle: 'Hours', overlap: 'h overlap', hostTime: 'time' },
  });
  assert.doesNotMatch(html, /<script/);
  assert.equal((html.match(/profile-ruler-cell/g) || []).length, 24);
});

test('a picked hour maps to the host clock and says whether the host works then', () => {
  // The visitor is in Moscow (+180): their 15:00 is 09:00 in Buenos Aires, 13:00 is 07:00 (can shift), 11:00 is 05:00.
  assert.deepEqual(rulerReadout({ hour: 15, viewerOffsetMinutes: 180 }), { viewer: '15:00', host: '09:00', working: true, flex: false });
  assert.deepEqual(rulerReadout({ hour: 13, viewerOffsetMinutes: 180 }), { viewer: '13:00', host: '07:00', working: false, flex: true });
  assert.deepEqual(rulerReadout({ hour: 11, viewerOffsetMinutes: 180 }), { viewer: '11:00', host: '05:00', working: false, flex: false });
  assert.equal(rulerReadout({ hour: 2, viewerOffsetMinutes: 180 }).host, '20:00');
});
