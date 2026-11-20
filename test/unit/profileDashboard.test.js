import assert from 'node:assert/strict';
import test from 'node:test';

import { computeWorkingRuler, renderProfileDashboard, rulerReadout } from '../../src/static-pages/js/profileDashboard.js';

test('the ruler shifts the host working hours into the visitor day', () => {
  // 15:00 UTC; the visitor is in Moscow (+180), the host in Buenos Aires (-180).
  const ruler = computeWorkingRuler({ nowMs: Date.UTC(2026, 0, 5, 15, 0), viewerOffsetMinutes: 180 });
  assert.equal(ruler.hostTime, '12:00');
  assert.equal(ruler.viewerHour, 18);
  assert.equal(ruler.overlap, 9);
  // Host 09:00-18:00 is visitor 15:00-24:00.
  assert.deepEqual(ruler.hours.filter((item) => item.working).map((item) => item.hour), [15, 16, 17, 18, 19, 20, 21, 22, 23]);
  assert.equal(ruler.hours.filter((item) => item.now).length, 1);
});

test('a visitor in the host time zone sees the plain 09:00-18:00 window', () => {
  const ruler = computeWorkingRuler({ nowMs: Date.UTC(2026, 0, 5, 12, 0), viewerOffsetMinutes: -180 });
  assert.equal(ruler.hostTime, '09:00');
  assert.deepEqual(ruler.hours.filter((item) => item.working).map((item) => item.hour), [9, 10, 11, 12, 13, 14, 15, 16, 17]);
});

test('the dashboard escapes text and renders one cell per hour', () => {
  const ruler = computeWorkingRuler({ nowMs: 0, viewerOffsetMinutes: 0 });
  const html = renderProfileDashboard({
    metrics: [{ value: '15+', label: 'Years <b>' }], ruler,
    labels: { rulerTitle: 'Hours', overlap: 'h overlap', hostTime: 'time' },
  });
  assert.match(html, /Years &lt;b&gt;/);
  assert.equal((html.match(/profile-ruler-cell/g) || []).length, 24);
});

test('a picked hour maps to the host clock and says whether the host works then', () => {
  // The visitor is in Moscow (+180): their 15:00 is 09:00 in Buenos Aires, their 14:00 is 08:00.
  assert.deepEqual(rulerReadout({ hour: 15, viewerOffsetMinutes: 180 }), { viewer: '15:00', host: '09:00', working: true });
  assert.deepEqual(rulerReadout({ hour: 14, viewerOffsetMinutes: 180 }), { viewer: '14:00', host: '08:00', working: false });
  assert.equal(rulerReadout({ hour: 2, viewerOffsetMinutes: 180 }).host, '20:00');
});
