import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const context = html.match(/<article class="case-study-source" id="context"[\s\S]*?<\/article>/)[0];

test('context vision distinguishes employee knowledge, client history and estimates', () => {
  for (const label of ['Personal build', 'Proposed organisational extension', 'Proposed client context']) assert.ok(context.includes(label));
  assert.match(context, /organisationally owned and managed/);
  assert.match(context, /client lifetime value \(CLV\)/);
  assert.match(context, /consent where required/);
  assert.match(context, /retention and correction processes/);
  assert.doesNotMatch(context, /CIBC|Investor|Braze|Contentstack|all communications are recorded/i);
});

test('mock gallery uses optimized local WebP images with exact dimensions, captions and alt text', () => {
  const images = [...context.matchAll(/<img src="(\/assets\/context-[^"]+)" alt="([^"]+)" width="(\d+)" height="(\d+)" loading="lazy" decoding="async">/g)];
  assert.equal(images.length, 3);
  for (const [, src, alt, width, height] of images) {
    assert.ok(alt.length > 40);
    const path = new URL('..' + src, import.meta.url);
    assert.ok(existsSync(path));
    const webp = readFileSync(path);
    assert.equal(webp.subarray(0, 4).toString(), 'RIFF');
    assert.equal(webp.subarray(8, 12).toString(), 'WEBP');
    assert.equal(webp.subarray(12, 16).toString(), 'VP8 ');
    assert.equal(webp.readUInt16LE(26) & 0x3fff, Number(width));
    assert.equal(webp.readUInt16LE(28) & 0x3fff, Number(height));
    assert.ok(webp.length < 150000);
  }
  assert.equal((context.match(/<figcaption>/g) || []).length, 3);
  assert.match(context, /AI-generated mockup/);
  assert.match(context, /No real client records/);
});

test('context references are linked and do not misrepresent OKF access controls', () => {
  assert.match(context, /https:\/\/gist.github.com\/karpathy\/442a6bf555914893e9891c11519de94f/);
  assert.match(context, /https:\/\/cloud.google.com\/blog\/products\/data-analytics\/okf-v0-2-adds-trust-signals/);
  assert.match(context, /permissions still need to be enforced/);
  assert.match(context, /proposed design/);
});

test('viewer replaces extended content on each project transition', () => {
  const viewer = readFileSync(new URL('../assets/viewer.mjs', import.meta.url), 'utf8');
  assert.match(html, /data-detail-target="#context \.case-study-content"/);
  assert.match(viewer, /extra\.replaceChildren\(\.\.\.\(content \? \[content\] : \[\]\)\)/);
  assert.match(viewer, /extra.hidden = !detail/);
  assert.doesNotMatch(context.match(/<div class="case-study-content">([\s\S]*)/)[1], /\sid="/);
});
