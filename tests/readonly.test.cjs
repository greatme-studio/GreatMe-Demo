const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

test('demo has no submission endpoint, transport, storage, or background queue', () => {
  assert.doesNotMatch(html, /script\.google\.com|fetch\s*\(|XMLHttpRequest|sendBeacon|axios|localStorage|sessionStorage|indexedDB|WebSocket|serviceWorker|\.sync\b|setTimeout|setInterval|FormData|URLSearchParams/i);
  assert.doesNotMatch(html, /\b(?:action|formAction)\s*=|\bmethod\s*[:=]\s*["'](?:post|put|patch|delete)/i);
  assert.match(html, /<form onSubmit=\{handleSubmit\}/);
  assert.match(html, /role="status" aria-live="polite"/);
  assert.equal(html.split('此為展示頁，資料不會送出。').length - 1, 2);
});

test('submit prevents default without reading values and updates only demo UI', () => {
  const handler = html.match(/const handleSubmit = (\(e\) => \{[\s\S]*?\n            \});/)[1];
  const calls = [];
  const context = {
    setSubmitted: value => calls.push(['submitted', value]),
    window: { scrollTo: options => calls.push(['scroll', options.top, options.behavior]) },
    document: { getElementById: id => { assert.equal(id, 'form'); return { offsetTop: 123 }; } },
  };
  const submit = vm.runInNewContext(handler, context);
  for (let i = 0; i < 3; i++) {
    submit({
      preventDefault: () => calls.push(['preventDefault']),
      get currentTarget() { throw new Error('Form values must not be read'); },
    });
  }
  assert.deepEqual(calls, Array.from({ length: 3 }, () => [
    ['preventDefault'], ['submitted', true], ['scroll', 123, 'smooth'],
  ]).flat());
});
