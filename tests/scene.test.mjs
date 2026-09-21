import test from 'node:test';
import assert from 'node:assert/strict';
import { sceneFrame, aperture, followScroll, smooth, clamp } from '../assets/scene.mjs';

const viewports = [[1440, 900], [1920, 1080], [1024, 768], [390, 844], [320, 568], [844, 390], [2560, 1440]];
const walk = (w, h, still = false) => Array.from({ length: 41 }, (_, i) => sceneFrame(i / 40, w, h, still));

test('scroll damping is refresh-rate independent and converges without overshoot', () => {
  const advance = hz => { let p = 0; for (let i = 0; i < hz; i++) p = followScroll(p, 1, 1000 / hz); return p; };
  assert.ok(Math.abs(advance(60) - advance(120)) < 1e-10);
  assert.ok(advance(60) > .9999);
  let p = 1;
  for (let i = 0; i < 60; i++) { const next = followScroll(p, 0, 1000 / 60); assert.ok(next >= 0 && next <= p); p = next; }
});

test('the artwork always covers the stage, at every aspect ratio', () => {
  for (const [w, h] of viewports) {
    for (const f of walk(w, h)) {
      assert.ok(f.imageWidth * f.scale >= w - 1e-9, `width covers at ${w}x${h}`);
      assert.ok(f.imageHeight * f.scale >= h - 1e-9, `height covers at ${w}x${h}`);
      assert.ok(f.imageX <= 1e-9 && f.imageY <= 1e-9, `no gap at the top-left at ${w}x${h}`);
      assert.ok(f.imageX + f.imageWidth * f.scale >= w - 1e-9);
      assert.ok(f.imageY + f.imageHeight * f.scale >= h - 1e-9);
    }
  }
});

test('the lens stays locked to the measured monitor aperture throughout', () => {
  for (const [w, h] of viewports) {
    for (const f of walk(w, h)) {
      assert.ok(Math.abs(f.lens.x - (f.imageX + f.imageWidth * aperture.x * f.scale)) < 1e-9);
      assert.ok(Math.abs(f.lens.y - (f.imageY + f.imageHeight * aperture.y * f.scale)) < 1e-9);
      assert.ok(Math.abs(f.lens.width - f.imageWidth * aperture.width * f.scale) < 1e-9);
      assert.ok(Math.abs(f.lens.height / f.lens.width - aperture.height / (aperture.width * aperture.aspect)) < 1e-9);
    }
  }
});

test('act one: the screen sits exactly on the monitor until the approach is done', () => {
  for (const [w, h] of viewports) {
    for (const p of [0, .15, .3, .45, .58]) {
      const f = sceneFrame(p, w, h);
      assert.equal(f.open, 0, `the screen has not started opening at ${p}`);
      assert.deepEqual(
        [f.shell.x, f.shell.y, f.shell.width, f.shell.height],
        [f.lens.x, f.lens.y, f.lens.width, f.lens.height],
        `the screen is still the monitor at ${p} on ${w}x${h}`);
    }
    // The approach is finished before the opening begins, so it never tears away.
    assert.equal(sceneFrame(.58, w, h).scale, sceneFrame(1, w, h).scale);
  }
});

test('act two: the screen opens out to exactly the viewport', () => {
  for (const [w, h] of viewports) {
    const end = sceneFrame(1, w, h);
    assert.ok(end.opened);
    assert.deepEqual([end.shell.x, end.shell.y, end.shell.width, end.shell.height], [0, 0, w, h]);
    assert.equal(end.shell.radius, 0);
    let width = 0;
    for (const f of walk(w, h)) {
      assert.ok(f.shell.width >= width - 1e-9, 'the screen never shrinks');
      assert.ok(f.shell.width <= w + 1e-9 && f.shell.height <= h + 1e-9, 'it never overshoots the viewport');
      width = f.shell.width;
    }
    assert.ok(!sceneFrame(.99, w, h).opened);
  }
});

test('the camera only ever moves toward the monitor', () => {
  for (const [w, h] of viewports) {
    let previous = 0;
    for (const f of walk(w, h)) { assert.ok(f.scale >= previous - 1e-9); previous = f.scale; }
    assert.ok(sceneFrame(1, w, h).scale <= 6 + 1e-9);
  }
});

test('the instruction is lit from the first frame and hands off to the page', () => {
  for (const [w, h] of viewports) {
    let face = 1, surface = 0;
    for (const f of walk(w, h)) {
      for (const v of [f.face, f.surface, f.scenery, f.open]) assert.ok(v >= 0 && v <= 1);
      assert.ok(f.face <= face + 1e-9, 'the instruction only fades out');
      assert.ok(f.surface >= surface - 1e-9, 'the page only fades in');
      // The wallpaper must be gone before the page behind it is readable.
      if (f.surface > .5) assert.ok(f.face < .5, 'the page is not read through the wallpaper');
      face = f.face; surface = f.surface;
    }
    // The desk opens with its instruction on, and nothing else on top of it.
    assert.equal(sceneFrame(0, w, h).face, 1);
    assert.equal(sceneFrame(0, w, h).surface, 0);
    assert.equal(sceneFrame(0, w, h).scenery, 1);
    assert.equal(sceneFrame(1, w, h).face, 0);
    assert.equal(sceneFrame(1, w, h).surface, 1);
    assert.equal(sceneFrame(1, w, h).scenery, 0);
  }
});

test('reduced motion holds the scene still, with the page simply shown', () => {
  for (const [w, h] of viewports) {
    for (const f of walk(w, h, true)) {
      assert.equal(f.scale, 1);
      assert.equal(f.open, 0);
      assert.equal(f.face, 1);
      assert.equal(f.surface, 1);
      assert.equal(f.scenery, 1);
      assert.equal(f.imageX, (w - f.imageWidth) / 2);
      assert.equal(f.imageY, (h - f.imageHeight) / 2);
      assert.deepEqual([f.shell.x, f.shell.width], [f.lens.x, f.lens.width]);
    }
  }
});

test('progress outside 0..1 is clamped rather than extrapolated', () => {
  const [w, h] = [1440, 900];
  assert.deepEqual(sceneFrame(-3, w, h), sceneFrame(0, w, h));
  assert.deepEqual(sceneFrame(9, w, h), sceneFrame(1, w, h));
  assert.equal(clamp(5), 1);
  assert.equal(smooth(.2, .8, .2), 0);
  assert.equal(smooth(.2, .8, .8), 1);
});
