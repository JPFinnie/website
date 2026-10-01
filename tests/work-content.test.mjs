import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const work = html.match(/<section class="band work"[\s\S]*?<\/section>/)[0];
const cards = [...work.matchAll(/<li class="card" data-kind="([^"]+)"[^>]*>([\s\S]*?)<\/li>/g)];

test('live independent products lead the portfolio, ahead of illustrative approaches', () => {
  assert.deepEqual(cards.map(card => card[1]), ['indie', 'indie', 'indie', 'approach', 'approach', 'approach']);
  assert.match(cards[0][2], /FinanceHermes/);
  assert.match(cards[1][2], /The Six Cut/);
  assert.match(cards[2][2], /Personal OKF/);
});

test('independent summaries remain concise with fuller existing detail available to the viewer', () => {
  for (const card of cards.slice(0, 2)) {
    assert.match(card[2], /<template class="card-details">[^<]+<\/template>/);
    const summary = card[2].match(/<p>([^<]+)<\/p>/)[1];
    assert.ok(summary.split(/\s+/).length <= 25);
  }
  assert.match(readFileSync(new URL('../assets/viewer.mjs', import.meta.url), 'utf8'), /\.content.textContent.trim\(\)/);
});

test('card actions have visible labels and touch-sized targets', () => {
  const viewer = readFileSync(new URL('../assets/viewer.mjs', import.meta.url), 'utf8');
  const css = readFileSync(new URL('../assets/site.css', import.meta.url), 'utf8');
  assert.match(viewer, /'Explore approach' : 'View project'/);
  assert.match(viewer, /button.textContent = action/);
  assert.match(css, /\.card-open\{[^}]*min-height:44px/);
  assert.doesNotMatch(css.match(/\.card-open\{([^}]+)\}/)[1], /position:absolute|rotate:/);
});


test('the unpopulated discovery demo is clearly labeled as a prototype', () => {
  assert.match(cards[1][2], /Independent · prototype/);
  assert.doesNotMatch(cards[1][2], /Independent · live/);
  assert.match(cards[1][2], /directory data is not currently loaded/);
  assert.match(readFileSync(new URL('../assets/viewer.mjs', import.meta.url), 'utf8'), /'prototype' \? 'View prototype'/);
});
