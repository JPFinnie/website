import test from 'node:test';
import assert from 'node:assert/strict';
import { cursorLabel } from '../assets/cursor.mjs';

// A minimal stand-in for an element: closest() walks a list of selector matches.
const el = (matches, extra = {}) => ({ closest: s => s.split(',').some(p => matches.includes(p.trim())) ? node : null, matches: s => s.split(',').some(p => matches.includes(p.trim())), dataset: {}, ...extra });
let node;
const make = (matches, extra) => (node = el(matches, extra));

test('the glow names what a click will do', () => {
  assert.equal(cursorLabel(make(['a[href]', 'a[href^="mailto:"]'])), 'Email');
  assert.equal(cursorLabel(make(['a[href]', 'a[target="_blank"]'])), 'Visit');
  assert.equal(cursorLabel(make(['.card.is-openable'])), 'Open');
  assert.equal(cursorLabel(make(['a[href]'])), '', 'an ordinary link swells without a word');
  assert.equal(cursorLabel(make([])), null, 'plain page is idle');
  assert.equal(cursorLabel(null), null);
});
