import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const work = html.match(/<section class="band work"[\s\S]*?<\/section>/)[0];
const cards = [...work.matchAll(/<li class="card" data-kind="([^"]+)"[^>]*>([\s\S]*?)<\/li>/g)];

test('live independent products lead the portfolio, ahead of illustrative approaches', () => {
  assert.deepEqual(cards.map(card => card[1]), ['indie', 'indie', 'indie', 'approach', 'approach']);
  assert.match(cards[0][2], /FinanceHermes/);
  assert.match(cards[1][2], /The Six Cut/);
  assert.match(cards[2][2], /Context systems/);
});

test('independent summaries remain concise with fuller existing detail available to the viewer', () => {
  for (const card of cards.slice(0, 2)) {
    assert.doesNotMatch(card[2], /<h3><a/);
    const summary = card[2].match(/<p>([^<]+)<\/p>/)[1];
    assert.ok(summary.split(/\s+/).length <= 25);
  }
  assert.match(html, /data-detail-target="#finance-hermes \.case-study-content"/);
  assert.match(html, /data-detail-target="#six-cut \.case-study-content"/);
});

test('card actions have visible labels and touch-sized targets', () => {
  const viewer = readFileSync(new URL('../assets/viewer.mjs', import.meta.url), 'utf8');
  const css = readFileSync(new URL('../assets/site.css', import.meta.url), 'utf8');
  assert.match(viewer, /'Explore approach' : 'View project'/);
  assert.match(viewer, /button.textContent = action/);
  assert.match(css, /\.card-open\{[^}]*min-height:44px/);
  assert.doesNotMatch(css.match(/\.card-open\{([^}]+)\}/)[1], /position:absolute|rotate:/);
});


test('the discovery demo is clearly labeled as a prototype', () => {
  assert.match(cards[1][2], /Independent · live prototype/);
  assert.doesNotMatch(cards[1][2], /directory data is not currently loaded/);
  assert.match(readFileSync(new URL('../assets/viewer.mjs', import.meta.url), 'utf8'), /textContent = 'View prototype'/);
});


test('external link indicators use decorative SVG rather than missing font glyphs', () => {
  const viewer = readFileSync(new URL('../assets/viewer.mjs', import.meta.url), 'utf8');
  for (const source of [html, viewer]) {
    assert.doesNotMatch(source, /&#8599;|↗/);
    assert.match(source, /<svg class="external-icon" viewBox="0 0 20 20" aria-hidden="true" focusable="false">/);
  }
});
