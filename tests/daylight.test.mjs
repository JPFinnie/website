import test from 'node:test';
import assert from 'node:assert/strict';
import { DAYPARTS, daypartAt, laterThan, greetingAt, nextChoice, parseChoice } from '../assets/daylight.mjs';

test('every hour of the day has exactly one light', () => {
  const seen = Array.from({ length: 24 }, (_, h) => daypartAt(h));
  assert.ok(seen.every(part => DAYPARTS.includes(part)));
  assert.deepEqual([daypartAt(4), daypartAt(5), daypartAt(7), daypartAt(8)], ['night', 'dawn', 'dawn', 'day']);
  assert.deepEqual([daypartAt(16), daypartAt(17), daypartAt(19), daypartAt(20), daypartAt(0)], ['day', 'dusk', 'dusk', 'night', 'night']);
});

test('each light steps to the next, wrapping from night to dawn', () => {
  assert.equal(laterThan('dawn'), 'day');
  assert.equal(laterThan('day'), 'dusk');
  assert.equal(laterThan('dusk'), 'night');
  assert.equal(laterThan('night'), 'dawn');
});

test('the monitor greets the visitor for their hour', () => {
  assert.equal(greetingAt(9), 'Good morning.');
  assert.equal(greetingAt(13), 'Good afternoon.');
  assert.equal(greetingAt(19), 'Good evening.');
  assert.equal(greetingAt(23), 'Up late?');
  assert.equal(greetingAt(3), 'Up late?');
});

test('the footer switch cycles through every light and back to the visitor’s own', () => {
  const visited = [];
  let choice = 'auto';
  for (let i = 0; i < 5; i++) { choice = nextChoice(choice); visited.push(choice); }
  assert.deepEqual(visited, ['dawn', 'day', 'dusk', 'night', 'auto']);
  assert.equal(parseChoice('night'), 'night');
  assert.equal(parseChoice('noon'), 'auto');
  assert.equal(parseChoice(null), 'auto');
});
