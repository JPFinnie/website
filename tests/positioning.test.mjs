import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const og = readFileSync(new URL('../tools/og-image.mjs', import.meta.url), 'utf8');

test('hero uses the approved product-direction positioning', () => {
  assert.match(html, /<h1>Making complex products<br>feel simple\.<\/h1>/);
  assert.match(html, /I&rsquo;m a product manager working across fintech, AI and customer experience, connecting customer needs with clear product direction\./);
});

test('about, metadata and social generator no longer use code-first identity', () => {
  for (const source of [html, og]) assert.doesNotMatch(source, /I build the thing|before I pitch it|Product manager who ships working software/i);
  assert.match(html, /Clear direction for complex products\./);
  assert.match(html, /Selected projects and product thinking\./);
  assert.match(og, /Making complex products feel simple\./);
  assert.match(html, /property="og:description" content="Making complex products feel simple\./);
  assert.match(html, /name="twitter:description" content="Making complex products feel simple\./);
});
