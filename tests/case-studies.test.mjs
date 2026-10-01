import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { cloneCaseStudy, withoutProjectHash } from '../assets/viewer.mjs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const viewer = readFileSync(new URL('../assets/viewer.mjs', import.meta.url), 'utf8');

test('cloned detail content has no inherited reveal state or duplicate IDs', () => {
  const makeNode = () => ({ removed: [], classes: [], properties: [], removeAttribute(name) { this.removed.push(name); }, classList: { remove(name) { this.owner.classes.push(name); } }, style: { removeProperty(name) { this.owner.properties.push(name); } } });
  const clone = makeNode(), child = makeNode();
  for (const node of [clone, child]) { node.classList.owner = node; node.style.owner = node; }
  clone.querySelectorAll = () => [child];
  const result = cloneCaseStudy({ cloneNode: () => clone });
  assert.equal(result, clone);
  for (const node of [clone, child]) {
    assert.deepEqual(node.removed, ['data-reveal', 'data-split', 'id']);
    assert.deepEqual(node.properties, ['--d']);
  }
  assert.equal(cloneCaseStudy(null), null);
});

test('rich case studies contain real architecture, limitations and screenshots before outbound CTA', () => {
  for (const id of ['finance-hermes', 'six-cut']) {
    const source = html.match(new RegExp(`<article class="case-study-source" id="${id}"[\\s\\S]*?<\\/article>`))[0];
    assert.ok((source.match(/class="case-section/g) || []).length >= 5);
    assert.match(source, /case-steps/);
    assert.match(source, /case-note/);
    assert.match(source, /<figure class="case-figure">/);
    const image = source.match(/<img src="([^"]+)"/)[1];
    assert.ok(existsSync(new URL('..' + image, import.meta.url)));
  }
  assert.ok(viewer.indexOf('class="sheet-extra"') < viewer.indexOf('class="sheet-visit"'));
  assert.match(viewer, /textContent = 'View prototype'/);
});

test('personal and organisational context form one story, with built versus proposed clearly separated', () => {
  assert.equal((html.match(/<h3>Context systems<\/h3>/g) || []).length, 1);
  assert.doesNotMatch(html, /<h3>Personal OKF knowledge base<\/h3>|<h3>Useful context for AI<\/h3>/);
  assert.match(html, /Personal build/);
  assert.match(html, /Proposed organisational extension/);
  assert.match(html, /Proposed client context/);
  assert.match(viewer, /item.dataset.projectId === location.hash.slice\(1\)/);
});

test('page effects exclude fallback content and modal bodies do not rely on observers', () => {
  const effects = readFileSync(new URL('../assets/effects.mjs', import.meta.url), 'utf8');
  const css = readFileSync(new URL('../assets/site.css', import.meta.url), 'utf8');
  assert.match(effects, /el.closest\('\.case-study-library'\)/);
  assert.match(css, /\.has-js \.case-study-library\{display:none\}/);
  assert.match(css, /\.sheet \.case-study-content \[data-reveal\]\{opacity:1/);
  assert.match(viewer, /extra.replaceChildren/);
});


test('closing a deep-linked viewer clears its project hash but preserves page navigation and preferences', () => {
  const ids = ['finance-hermes', 'six-cut', 'context'];
  assert.equal(withoutProjectHash('https://www.james-finnie.com/?motion=quiet#context', ids), 'https://www.james-finnie.com/?motion=quiet');
  assert.equal(withoutProjectHash('https://www.james-finnie.com/#work', ids), 'https://www.james-finnie.com/#work');
  assert.equal(withoutProjectHash('https://www.james-finnie.com/#six-cut', ids), 'https://www.james-finnie.com/');
});
