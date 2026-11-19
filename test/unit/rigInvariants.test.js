import assert from 'node:assert/strict';
import test from 'node:test';

import { checkRigTrace } from '../../src/static-pages/js/show-log/rigInvariants.js';

const state = (at, data) => ({ at, source: 'rig', type: 'state', data });
const dom = (at, marquee, hoseReach = 300) => ({ at, source: 'probe', type: 'dom', data: { marquee, hoseReach } });
const frame = { shown: true, left: 100, top: 300, width: 400, height: 120 };
const body = { x: 700, y: 360, active: 0, claw: { x: 450, y: 400 }, clawDist: 250 };

test('a quiet trace has no violations', () => {
  const trace = [state(0, body), dom(50, frame), dom(150, frame)];
  assert.deepEqual(checkRigTrace(trace), []);
});

test('retracting and throwing the same arm again within 400 ms is a flap', () => {
  const trace = [
    { at: 1000, source: 'rig', type: 'retire-arm', data: { arm: 0 } },
    { at: 1095, source: 'rig', type: 'start-event', data: { arm: 0 } },
  ];
  assert.equal(checkRigTrace(trace)[0]?.rule, 'arm-flap');
  const slow = [trace[0], { ...trace[1], at: 1900 }];
  assert.deepEqual(checkRigTrace(slow), []);
  const otherArm = [trace[0], { ...trace[1], data: { arm: 1 } }];
  assert.deepEqual(checkRigTrace(otherArm), [], 'a hand-over to the other arm is not a flap');
});

test('the claw leaving the shown selection frame is reported once per stretch', () => {
  const away = { ...body, claw: { x: 1054, y: 622 }, clawDist: 640 };
  const trace = [state(0, away)];
  for (let at = 100; at <= 700; at += 100) trace.push(dom(at, frame, 640));
  const found = checkRigTrace(trace).filter((item) => item.rule === 'claw-leaves-frame');
  assert.equal(found.length, 1);
  const brief = [state(0, away), dom(100, frame, 640), dom(200, frame, 640), state(250, body), dom(300, frame, 640)];
  assert.equal(checkRigTrace(brief).some((item) => item.rule === 'claw-leaves-frame'), false);
});

test('the body centre staying inside the frame for over 1.2 s is reported, a shorter stay is not', () => {
  const inFrame = state(0, { ...body, x: 300, y: 360 });
  const long = [inFrame];
  for (let at = 100; at <= 1500; at += 100) long.push(dom(at, frame));
  assert.equal(checkRigTrace(long).some((item) => item.rule === 'body-in-frame'), true);
  const short = [inFrame];
  for (let at = 100; at <= 800; at += 100) short.push(dom(at, frame));
  short.push(state(850, body), dom(900, frame));
  assert.equal(checkRigTrace(short).some((item) => item.rule === 'body-in-frame'), false);
});

test('an arm much shorter than the claw distance for 600 ms is reported', () => {
  const far = { ...body, clawDist: 700, claw: { x: 450, y: 400 } };
  const trace = [state(0, far)];
  for (let at = 100; at <= 900; at += 100) trace.push(dom(at, frame, 70));
  assert.equal(checkRigTrace(trace).some((item) => item.rule === 'arm-short'), true);
  const reaching = [state(0, far)];
  for (let at = 100; at <= 900; at += 100) reaching.push(dom(at, frame, 650));
  assert.equal(checkRigTrace(reaching).some((item) => item.rule === 'arm-short'), false);
});

test('a hidden or tiny frame is not checked', () => {
  const trace = [state(0, { ...body, claw: { x: 1000, y: 600 } }), dom(100, { ...frame, shown: false }), dom(200, { ...frame, width: 30 })];
  assert.deepEqual(checkRigTrace(trace), []);
});

test('the speech cloud covering the frame or the ink for 500 ms is reported', () => {
  const talking = state(0, { ...body, cloud: { x: 300, y: 360, w: 160, h: 60 } });
  const over = [talking];
  for (let at = 100; at <= 800; at += 100) over.push(dom(at, frame));
  assert.equal(checkRigTrace(over).some((item) => item.rule === 'cloud-covers-focus'), true);
  const clear = [state(0, { ...body, cloud: { x: 300, y: 120, w: 160, h: 60 } })];
  for (let at = 100; at <= 800; at += 100) clear.push(dom(at, frame));
  assert.equal(checkRigTrace(clear).some((item) => item.rule === 'cloud-covers-focus'), false);
  const ink = [talking];
  for (let at = 100; at <= 800; at += 100) ink.push({ at, source: 'probe', type: 'dom', data: { marquee: null, ink: { left: 250, top: 340, width: 300, height: 60 }, hoseReach: 300 } });
  assert.equal(checkRigTrace(ink).some((item) => item.rule === 'cloud-covers-focus'), true);
});
