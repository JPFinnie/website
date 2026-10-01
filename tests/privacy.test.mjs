import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const work = html.match(/<section class="band work"[\s\S]*?<\/section>/)[0];

test('project approaches are illustrative and never attributed to an employer', () => {
  assert.equal((work.match(/data-kind="approach"/g) || []).length, 3);
  assert.equal((work.match(/data-kind="indie"/g) || []).length, 3);
  assert.equal((work.match(/Product approach · illustrative/g) || []).length, 3);
  assert.doesNotMatch(work, /CIBC|Investor|at the bank|corporate|every new client|Braze|Contentstack|historical engineering/i);
  assert.match(work, /approaches below are illustrative/);
});

test('employer mention is limited to ordinary role information', () => {
  const role = html.match(/<h3>CIBC[\s\S]*?<\/li>/)[0];
  assert.doesNotMatch(role, /platform|knowledge|models|journey|prototype|corpus|retriev|embedding/i);
  assert.doesNotMatch(html, /bank&rsquo;s AI|corporate second brain|full client base|estimate mining|Figma integration|Braze|Contentstack|closed-loop retraining/);
  const head = html.slice(0, html.indexOf('</head>'));
  assert.doesNotMatch(head, /CIBC|Investor|worksFor/);
});

test('structured-data CSP hash matches the exact inline script', () => {
  const source = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1];
  assert.equal(JSON.parse(source)['@type'], 'Person');
  const hash = createHash('sha256').update(source).digest('base64');
  const config = JSON.parse(readFileSync(new URL('../vercel.json', import.meta.url), 'utf8'));
  const policy = config.headers.flatMap(rule => rule.headers).find(h => h.key === 'Content-Security-Policy').value;
  assert.ok(policy.includes(`'sha256-${hash}'`));
});

test('filter and viewer announce generic approaches without implying deployed projects', () => {
  const effects = readFileSync(new URL('../assets/effects.mjs', import.meta.url), 'utf8');
  const viewer = readFileSync(new URL('../assets/viewer.mjs', import.meta.url), 'utf8');
  assert.doesNotMatch(effects, /at the bank|kind === 'bank'/);
  assert.match(effects, /illustrative product approaches/);
  assert.match(viewer, /aria-label="Topics"/);
});
