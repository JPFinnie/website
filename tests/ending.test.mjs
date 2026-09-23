import test from 'node:test';
import assert from 'node:assert/strict';
import { sceneFrame } from '../assets/scene.mjs';
import { insetFor, step } from '../assets/viewer.mjs';

const viewports = [[1440, 900], [390, 844], [2560, 1440]];

test('the ending starts as the whole viewport and finishes back on the desk', () => {
  // The ending plays the opening backwards: its progress p shows sceneFrame(1 - p).
  for (const [w, h] of viewports) {
    const start = sceneFrame(1 - 0, w, h), end = sceneFrame(1 - 1, w, h);
    assert.deepEqual([start.shell.x, start.shell.y, start.shell.width, start.shell.height], [0, 0, w, h]);
    assert.equal(start.surface, 1, 'the ending opens on the dark page that continues Contact');
    assert.equal(start.scenery, 0);
    assert.equal(end.scale, 1, 'the camera pulls all the way back');
    assert.equal(end.face, 1, 'the monitor is lit with the sign-off');
    assert.equal(end.scenery, 1);
    let width = Infinity;
    for (let i = 0; i <= 40; i++) {
      const f = sceneFrame(1 - i / 40, w, h);
      assert.ok(f.shell.width <= width + 1e-9, 'the screen only ever shrinks on the way out');
      width = f.shell.width;
    }
  }
});

test('a card rectangle becomes the clip that shows exactly that card', () => {
  assert.equal(insetFor({ top: 100, left: 50, right: 450, bottom: 400 }, 1000, 800), 'inset(100px 550px 400px 50px round 12px)');
  assert.equal(insetFor({ top: 0, left: 0, right: 1000, bottom: 800 }, 1000, 800, 0), 'inset(0px 0px 0px 0px round 0px)');
  // A card partly off screen is clipped to the viewport rather than inverted.
  assert.equal(insetFor({ top: -200, left: 0, right: 300, bottom: 100 }, 1000, 800), 'inset(0px 700px 700px 0px round 12px)');
});

test('previous and next wrap around the visible projects', () => {
  assert.equal(step(0, -1, 6), 5);
  assert.equal(step(5, 1, 6), 0);
  assert.equal(step(2, 1, 3), 0);
  assert.equal(step(0, 1, 1), 0);
  assert.equal(step(0, 1, 0), -1);
});
