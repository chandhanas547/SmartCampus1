import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { test } from 'node:test';
import { createApp } from '../src/app.js';
import { createServerlessHandler } from '../src/serverless.js';

async function serve(t, handler) {
  const server = createServer(handler).listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  t.after(() => new Promise((resolve) => server.close(resolve)));
  return `http://127.0.0.1:${server.address().port}`;
}

test('concurrent cold requests share initialization and warm requests reuse it', async (t) => {
  let starts = 0;
  const app = createApp({ origin: 'https://demo.invalid', checkDatabase: async () => {} });
  const base = await serve(t, createServerlessHandler(async () => {
    starts += 1;
    await new Promise((resolve) => setTimeout(resolve, 20));
    return app;
  }));
  const responses = await Promise.all(Array.from({ length: 5 }, () => fetch(`${base}/api/health`)));
  for (const response of responses) assert.equal(response.status, 200);
  assert.equal((await fetch(`${base}/api/unknown`)).status, 404);
  assert.equal(starts, 1);
});

test('startup failure returns a safe uncached error and a later request can recover', async (t) => {
  let starts = 0;
  const base = await serve(t, createServerlessHandler(async () => {
    if (++starts === 1) throw new Error('private database credential');
    return createApp({ origin: 'https://demo.invalid', checkDatabase: async () => {} });
  }));
  const failed = await fetch(`${base}/api/health`);
  assert.equal(failed.status, 503);
  assert.equal(failed.headers.get('cache-control'), 'no-store');
  assert.deepEqual(await failed.json(), { error: { code: 'NOT_READY', message: 'Service temporarily unavailable.' } });
  assert.equal((await fetch(`${base}/api/health`)).status, 200);
});
