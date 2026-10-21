import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { createApp } from '../src/app.js';

let server;
let base;
let databaseAvailable = true;
before(async () => {
  const app = createApp({
    origin: 'http://localhost:5173',
    checkDatabase: async () => {
      if (!databaseAvailable) throw new Error('private database connection details');
    },
  });
  server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  base = `http://127.0.0.1:${server.address().port}`;
});
after(() => new Promise((resolve) => server.close(resolve)));

test('health reports readiness and sets safe headers', async () => {
  const response = await fetch(`${base}/api/health`);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { data: { status: 'ready' } });
  assert.equal(response.headers.get('x-powered-by'), null);
  assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
  assert.equal(response.headers.get('cache-control'), 'no-store');
});

test('health reports database failure without leaking its cause', async () => {
  databaseAvailable = false;
  try {
    const response = await fetch(`${base}/api/health`);
    assert.equal(response.status, 503);
    assert.deepEqual(await response.json(), {
      error: { code: 'NOT_READY', message: 'Service temporarily unavailable.' },
    });
  } finally { databaseAvailable = true; }
});

test('unknown API routes return JSON, never the SPA', async () => {
  const response = await fetch(`${base}/api/missing`);
  assert.equal(response.status, 404);
  assert.equal((await response.json()).error.code, 'NOT_FOUND');
});

test('health rejects unrecognized query parameters', async () => {
  const response = await fetch(`${base}/api/health?debug=true`);
  assert.equal(response.status, 400);
});

test('mutation boundary rejects untrusted origins, non-JSON, malformed and oversized bodies', async () => {
  for (const [headers, body, status] of [
    [{ origin: 'https://attacker.invalid', 'content-type': 'application/json' }, '{}', 403],
    [{ 'content-type': 'application/json' }, '{}', 403],
    [{ origin: 'http://localhost:5173', 'content-type': 'text/plain' }, '{}', 415],
    [{ origin: 'http://localhost:5173', 'content-type': 'application/json' }, '{', 400],
    [{ origin: 'http://localhost:5173', 'content-type': 'application/json' }, JSON.stringify({ text: 'x'.repeat(17000) }), 413],
  ]) {
    const response = await fetch(`${base}/api/missing`, { method: 'POST', headers: { 'x-labflow-request': '1', ...headers }, body });
    assert.equal(response.status, status);
    const error = await response.json();
    assert.equal(typeof error.error.code, 'string');
    assert.equal('stack' in error.error, false);
  }
});
