import test from 'node:test';
import assert from 'node:assert/strict';
import { damp, wheelPixels, wheelTau, travelTime, easeInOutQuart } from '../assets/glide.mjs';
import { progressThrough, currentIndex, readingLine, wrapOffset } from '../assets/effects.mjs';

test('wheel easing is refresh-rate independent and never overshoots', () => {
  const run = hz => { let y = 0; for (let i = 0; i < hz / 2; i++) y = damp(y, 400, 1000 / hz); return y; };
  assert.ok(Math.abs(run(60) - run(120)) < 1e-9);
  let y = 0;
  for (let i = 0; i < 120; i++) { const next = damp(y, 400, 1000 / 60); assert.ok(next >= y && next <= 400); y = next; }
  assert.ok(y > 399.5);
});

test('wheel deltas are normalised across pixel, line and page modes', () => {
  assert.equal(wheelPixels({ deltaMode: 0, deltaY: 100 }, 900), 100);
  assert.equal(wheelPixels({ deltaMode: 1, deltaY: 3 }, 900), 96);
  assert.equal(wheelPixels({ deltaMode: 2, deltaY: 1 }, 900), 810);
  // A notched wheel is eased more than a trackpad, which carries its own inertia.
  assert.ok(wheelTau(100) > wheelTau(4));
});

test('section flights are bounded and eased at both ends', () => {
  assert.equal(travelTime(0), 380);
  assert.ok(travelTime(2000) > travelTime(200));
  assert.equal(travelTime(1e9), 1250);
  assert.equal(travelTime(-3000), travelTime(3000));
  assert.equal(easeInOutQuart(0), 0);
  assert.equal(easeInOutQuart(1), 1);
  assert.equal(easeInOutQuart(.5), .5);
  let previous = 0;
  for (let i = 1; i <= 100; i++) { const v = easeInOutQuart(i / 100); assert.ok(v >= previous); previous = v; }
});

test('the reading line picks the section being read, and the last one at the end', () => {
  const tops = [1000, 2000, 3000];
  assert.equal(currentIndex(tops, 500), -1);
  assert.equal(currentIndex(tops, 1000), 0);
  assert.equal(currentIndex(tops, 2999), 1);
  assert.equal(currentIndex(tops, 9000), 2);
  const [vh, max] = [900, 5000];
  assert.equal(readingLine(1000, vh, max), 1000 + vh * .4);
  // Only the final stretch sweeps to the bottom edge.
  assert.equal(readingLine(max - vh * .2, vh, max), max - vh * .2 + vh * .4);
  assert.equal(readingLine(max, vh, max), max + vh);
  assert.equal(readingLine(0, vh, 0), vh);
});

test('progress and marquee wrapping stay in range', () => {
  assert.equal(progressThrough(100, 200, 0), 0);
  assert.equal(progressThrough(100, 200, 200), .5);
  assert.equal(progressThrough(100, 200, 900), 1);
  assert.equal(progressThrough(100, 0, 900), 0);
  for (const x of [-1234.5, -1, 0, 1, 999, 1000, 54321]) {
    const w = wrapOffset(x, 1000);
    assert.ok(w >= 0 && w < 1000);
  }
  assert.equal(wrapOffset(-250, 1000), 750);
  assert.equal(wrapOffset(5, 0), 0);
});
