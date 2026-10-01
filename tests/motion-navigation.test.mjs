import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { syncMotionState } from '../assets/scene.mjs';

test('reducing motion from the outro clears the state that hides navigation', () => {
  const classes = new Set(['has-js', 'in-outro', 'past-intro']);
  const root = { classList: {
    toggle(name, on) { if (on) classes.add(name); else classes.delete(name); },
    remove(name) { classes.delete(name); }
  } };
  syncMotionState(root, true);
  assert.equal(classes.has('in-outro'), false);
  assert.equal(classes.has('is-still'), true);
  syncMotionState(root, true);
  assert.equal(classes.has('in-outro'), false);
  syncMotionState(root, false);
  assert.equal(classes.has('is-still'), false);
  assert.equal(classes.has('in-outro'), false);
  assert.equal(classes.has('has-js'), true);
});

test('quiet-mode navigation cannot be hidden by stale outro classes', () => {
  const css = readFileSync(new URL('../assets/site.css', import.meta.url), 'utf8');
  assert.match(css, /html\.in-outro:not\(\.is-still\) \.masthead/);
  assert.match(css, /\.is-still \.masthead,\.past-intro \.masthead\{background:/);
});
